# Build por-projeto

## O problema que isso resolve

O sistema tem N clientes, cada um com N projetos. Antes desta mudança, o
build do Astro sempre gerava **todos os projetos de todos os clientes numa
passada só**: editar 1 página de 1 cliente disparava um rebuild completo de
todo mundo. Isso não escala (build fica cada vez mais lento conforme cresce
o número de clientes) e criava um problema de modelagem de dados: um registro
`Build` não conseguia "pertencer" a um client específico, porque ele
representava uma operação sobre todos os clients ao mesmo tempo.

Essa mudança faz o build ser **sempre escopado a exatamente 1 `Project`**.

## Como funciona

### 1. Astro: filtro via env var `PROJECT_SLUG_FILTER`

O arquivo `multi-sites/sites/_saas/pages/[project]/[...slug].astro` ainda
busca a lista de projetos publicados na API do Django (`getStaticPaths()`),
mas agora checa uma env var antes de gerar os paths:

```js
const projectFilter = import.meta.env.PROJECT_SLUG_FILTER;

let projects = await projectsRes.json();

if (projectFilter) {
    projects = projects.filter((p) => p.slug === projectFilter);
}
```

Sem essa env var setada, o comportamento é o mesmo de antes (builda todos os
projetos publicados). Com ela setada, só as páginas daquele 1 projeto são
geradas.

Esse padrão já existia neste mesmo repositório pros sites legados — o
script `build:centraldevistos:incremental` usa a env var `VISA_SLUGS` do
mesmo jeito, filtrando o que é gerado em vez de reconstruir tudo.

### 2. Management command: 1 chamada de `astro build` por projeto

`core/management/commands/build_static_sites.py`:

- `--project <slug>`: builda **só** esse projeto. Seta
  `PROJECT_SLUG_FILTER=<slug>` no ambiente do subprocess antes de chamar
  `npm run build:_saas`. Se falhar, levanta `CommandError` — isso é
  importante pra quem chama via `call_command()` (como `core/deploy.py`)
  conseguir detectar falha de forma confiável, sem precisar inferir do texto
  do log.
- Sem `--project` (uso via CLI/cron, não usado pelo fluxo do admin): itera
  sobre os projetos com `needs_rebuild=True` (ou todos, com `--force`),
  chamando uma build separada **pra cada um**, sequencialmente. Cada projeto
  tem seu próprio sucesso/falha e seu `needs_rebuild` só é limpo se aquele
  build específico funcionou.

### 3. `core/deploy.py`: `build_project()` exige um `Project`

```python
def build_project(project, force=False, triggered_by=None):
    ...
    build = Build.objects.create(
        client=project.client,   # client vem do dono do projeto, nunca é "adivinhado"
        project=project,
        ...
    )
    call_command('build_static_sites', '--project', project.slug, ...)
```

Não existe mais fallback de `client = Client.objects.first()` — isso era o
sintoma do problema antigo (build tentando pertencer a um client arbitrário
porque não tinha dono real). Agora o client vem sempre de `project.client`.

### 4. Deploy por-projeto

`deploy_build(build)` copia só a subpasta daquele projeto
(`dist/_saas/{project.slug}/`) pro VPS, numa árvore de releases própria,
**sempre aninhada sob 1 diretório pai compartilhado** (`_saas`, o mesmo
valor de `PLATFORM_SITE_ID`):

```
/var/www/_saas/{project.slug}/releases/{timestamp}/
/var/www/_saas/{project.slug}/current -> releases/{timestamp}/
```

Cada projeto tem seu próprio histórico de releases e rollback independente
dos demais — não existe mais 1 release compartilhada pra todos os projetos.

**Por que aninhado sob `_saas` e não solto em `/var/www/{project.slug}`
direto**: no Nginx real do VPS (container Docker), cada site em `/var/www/`
precisa de uma linha própria de bind mount no `docker-compose.yml` do Nginx
+ recriar o container pra pegar o volume novo (confirmado no script
`create-vol.sh` do repo `reverse-proxy-config`, usado pros sites legados).
Isso é aceitável pra ~10 sites cadastrados manualmente, mas não escala pra
um SaaS onde usuários criam projetos com frequência — cada projeto novo
exigiria mexer no `docker-compose.yml` do Nginx e recriar o container
(derrubando brevemente TODOS os sites). Montando `/var/www/_saas` como
**1 único bind mount, criado uma vez**, qualquer projeto novo criado depois
já aparece automaticamente dentro dele, sem tocar em infraestrutura de novo.
Detalhes em `docs/provisionamento-producao.md`.

### 5. Modelo `Build`: agora tem FK real pra `Project`

```python
class Build(ClientModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='builds')
    client = ...  # herdado de ClientModel, auto-preenchido a partir de project.client
```

Como cada `Build` representa de fato uma operação de 1 client (o dono do
`project`), faz sentido ele herdar `ClientModel` normalmente — sem os
problemas descritos na seção "Por que o design anterior quebrava" abaixo.

## ⚠️ Efeito colateral importante: o Astro limpa o `dist/_saas` inteiro a cada build

Como todos os projetos compartilham o mesmo `outDir` (`dist/_saas/`), o
Astro **apaga a pasta inteira antes de cada build** — inclusive quando você
builda só 1 projeto via `PROJECT_SLUG_FILTER`. Reproduzido manualmente:

```
1. build_project(agencia-marketing)  →  dist/_saas/ contém: agencia-marketing/
2. build_project(loja-da-maria)      →  dist/_saas/ contém: loja-da-maria/
                                          (agencia-marketing/ SUMIU)
```

**Isso significa que `build_project()` e `deploy_build()` precisam sempre
rodar em sequência, sem intervalo, pro MESMO projeto**, antes de builda-se
outro projeto — é exatamente esse padrão que `ProjectAdmin.action_build_and_deploy`
já usa (loop sequencial: builda projeto A, faz deploy de A imediatamente,
só depois passa pro projeto B):

```python
for project in queryset:
    build = build_project(project, ...)
    deployment = deploy_build(build)   # copia pro VPS ANTES do próximo projeto buildar
```

**Consequência pra qualquer trabalho futuro (ex: mover builds pra uma fila
assíncrona tipo Celery)**: dois builds de projetos diferentes **nunca podem
rodar em paralelo** nesse desenho, porque um processo `astro build` rodando
concorrentemente com outro vai apagar o `dist/_saas` no meio da geração do
outro, corrompendo ou perdendo o resultado.

### ✅ Lock de concorrência implementado

Por isso `build_project()` (em `core/deploy.py`) agora tem um lock: só pode
existir **1 `Build` com status `pending`/`running` por vez, em toda a
plataforma** (não é por-projeto — é global, porque a colisão acontece no
`dist/_saas` compartilhado, não importa de qual projeto).

```python
def build_project(project, force=False, triggered_by=None):
    ...
    _mark_stale_builds_as_failed()  # limpa locks travados por crash de worker

    with transaction.atomic():
        active = Build.objects.select_for_update().filter(
            status__in=[Build.STATUS_PENDING, Build.STATUS_RUNNING]
        )
        blocking = active.first()
        if blocking is not None:
            raise BuildLockError(...)

        build = Build.objects.create(status=Build.STATUS_RUNNING, ...)
```

- A checagem ("existe build rodando?") e a criação do `Build` acontecem na
  **mesma transação** (`select_for_update`), minimizando a janela de corrida
  entre "verificar" e "criar".
- O próprio `Build` com `status=running` funciona como o marcador do lock —
  ele só libera quando o build termina (`status` vira `success`/`failed`).
- **Builds travados (`BUILD_STALE_TIMEOUT_MINUTES = 15`)**: se um worker
  crashar no meio de um build, o `Build` ficaria preso em `running` pra
  sempre, bloqueando todo mundo. `_mark_stale_builds_as_failed()` roda antes
  de cada tentativa de build e marca como `failed` qualquer build
  `pending`/`running` com mais de 15 minutos, liberando o lock
  automaticamente.
- Quem chama `build_project()` (admin action, `api_trigger_rebuild`) precisa
  tratar `BuildLockError` explicitamente — a resposta correta é mostrar
  "outro build está rodando, tente de novo em instantes", não deixar
  estourar como erro 500.

**Nota sobre o banco em dev (SQLite)**: `select_for_update()` no SQLite não
faz lock de linha de verdade (SQLite não tem esse conceito — ele serializa
escritas no nível do arquivo inteiro), mas não trava/erra também. Em Postgres
(recomendado pra produção), o `select_for_update()` vira um lock de linha
real, fechando de vez a janela de corrida entre múltiplos processos Django
concorrentes.

## Por que o design anterior (build site-wide + `Build` tenant-scoped) quebrava

Antes desta mudança, um único `npm run build` gerava as páginas de **todos**
os clientes de uma vez, mas `Build` herdava `ClientModel`, que **exige** que
todo registro pertença a exatamente 1 client (`tenancy/models.py`, método
`ClientModel.save()`). Isso forçava o código a "inventar" um dono:

```python
# código antigo, removido nesta mudança
if not client:
    client = Client.objects.first()  # client arbitrário, sem relação com o build real
```

Isso causava dois bugs concretos, reproduzidos e confirmados durante a
revisão:

1. **Crash do botão "Build & Publicar"**: se um staff tivesse um client
   diferente do "primeiro do banco" selecionado na sessão do admin (uso
   normal do `ClientScopedAdmin`), `ClientModel.save()` recusava salvar o
   `Build` com `ValueError` (proteção contra escrita cross-tenant), porque o
   client "adivinhado" não batia com o client corrente da sessão.
2. **`needs_rebuild` mentindo pros outros tenants**: como o build era
   site-wide mas a query de "quais projetos precisam rebuild" usava o
   manager tenant-scoped (`Project.objects`, filtrado pelo client corrente),
   só o `needs_rebuild` do client que disparou o build era limpo — mesmo o
   conteúdo dos OUTROS clients já tendo sido publicado de verdade. O badge
   no admin deles continuava dizendo "precisa rebuild" indefinidamente.

Com o build agora escopado a 1 projeto (1 client), esses dois problemas
desaparecem na raiz: o `client` do `Build` é sempre exatamente o dono do
`project`, nunca uma adivinhação, e o `needs_rebuild` só é tocado do projeto
que de fato foi buildado.

## Trade-off aceito

Builds individuais são mais rápidos (só 1 projeto por vez, não a plataforma
inteira), mas o número de invocações de `astro build` cresce com o número de
projetos "sujos" — se 50 projetos precisarem rebuild ao mesmo tempo (ex: uma
mudança de layout compartilhado), isso significa 50 processos `astro build`
sequenciais, não 1 só. Pra esse MVP isso é aceitável (builds de 1 projeto são
rápidos, segundos); se isso virar gargalo no futuro, a otimização natural é
paralelizar builds de projetos DIFERENTES entre workers isolados (cada um
com seu próprio `outDir` temporário, evitando o problema de limpeza
descrito acima) — está fora do escopo deste MVP.
