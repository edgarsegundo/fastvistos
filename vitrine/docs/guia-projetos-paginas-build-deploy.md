# Guia + Arquitetura: Projetos, Páginas, Build e Deploy

Este documento junta o que antes estava em dois arquivos separados
(`guia-usar-projetos-paginas.md` e `build-por-projeto.md`) porque, na
prática, quem mexe no fluxo de Projeto→Página→Build→Deploy precisa das
duas coisas ao mesmo tempo: como usar E por que funciona assim. Documentos
separados viraram fonte de divergência (o guia antigo tinha URLs e paths
que não existem mais desde a mudança pra build-por-projeto).

Índice:
- [Parte 1 — Guia de uso](#parte-1--guia-de-uso)
- [Parte 2 — Arquitetura: build por-projeto](#parte-2--arquitetura-build-por-projeto)
- [Parte 3 — Troubleshooting](#parte-3--troubleshooting)

---

## Parte 1 — Guia de uso

### Cadastro e login

Usuários se cadastram sozinhos em `/entrar/` (`core.views.AuthView`), com
duas opções:
- **Email/senha**: formulário próprio (`core/forms.py: SignupForm`/`LoginForm`).
- **Google (SSO)**: botão que leva pro fluxo do `django-allauth`
  (`/accounts/google/login/`).

Qualquer um dos dois caminhos, no primeiro acesso, dispara
`core.provisioning.provision_tenant_for_user(user)`
(`core/adapters.py`/`core/views.py: AuthView.post`), que cria
automaticamente:
- Um `Client` (tenant) com slug único derivado do nome/email.
- Um `ClientProfile` com `role='owner'`.
- `user.is_staff = True` (necessário pra acessar o Admin).
- O user entra no grupo **"Donos de Tenant"**, que tem permissão completa
  sobre `Project`, `Page`, `Domain`, e permissão de **visualização** (não
  edição) sobre `Build`/`Deployment` — esses dois são sempre gerados pelo
  sistema, nunca editados manualmente.

Depois do login (por qualquer via), o destino é sempre `/admin/` — o
painel do cliente **é** o Django Admin (reformulado via Unfold), não uma
tela separada.

### Criar um Projeto

1. Admin → **Projetos** → Add.
2. Preencher `name`, `slug` (auto-gerado do nome, editável), `description`,
   marcar `is_published`.
3. Salvar.

O `slug` vira parte da URL pública (`/app/{slug}/`) **e** do nome da pasta
no servidor. **Pode ser editado depois de já publicado** — veja
["Editar o slug depois de publicado"](#editar-o-slug-depois-de-publicado)
abaixo; não precisa evitar renomear por medo de quebrar o site.

### Criar Páginas

Admin → **Páginas** → Add. Campos principais:

| Campo | Efeito |
|---|---|
| `project` | a qual projeto a página pertence |
| `title` | título mostrado na página |
| `slug` | parte da URL (`/app/{project}/{slug}/`); deixe vazio ou marque `is_home` pra ser a página inicial |
| `is_home` | marca esta página como a raiz do projeto (`/app/{project}/`, sem segmento extra). **No máximo 1 página por projeto pode ter `is_home=True`** — é uma constraint de banco (`unique_home_page_per_project`); tentar marcar uma segunda dá erro de validação |
| `order` | ordem de exibição/navegação |
| formato de conteúdo | `marked` (Markdown), `inline` (HTML sanitizado via bleach) ou `iframe` (HTML customizado, sandboxed) — ver `Page.render_content_for_api()` |

Cada save de `Page`/`Project` dispara um signal que marca
`Project.needs_rebuild = True` — é só um indicador visual no admin
(coluna `needs_rebuild`), não dispara build sozinho.

### Preview antes de publicar

Link **👁 Ver Preview** na tela de edição da Página (fieldset "Links"),
aponta pra `/preview/<page_id>/` (`core.views.preview_page`). Mostra o
conteúdo renderizado (inclusive rascunhos não publicados) sem precisar
buildar nem publicar nada — lê direto do banco. Requer estar logado como
staff/superuser.

### Link ao vivo + copiar link

Na listagem de Páginas (`/admin/core/page/`), cada linha tem dois ícones
(`PageAdmin.live_link_actions`, `core/admin.py`):
- **🔗** abre a URL pública da página numa aba nova (`target="_blank"`).
- **📋** copia a URL pra área de transferência (`navigator.clipboard.writeText`).

A URL é montada a partir de `settings.PLATFORM_PUBLIC_BASE_URL` +
`/app/{project.slug}/` (+ `{page.slug}/`, se não for a home). **Só
funciona de verdade depois que o projeto passou por "Build & Publicar"**
pelo menos uma vez — antes disso o link existe mas dá 404.

### Build & Publicar

Botão/action **"🚀 Build & Publicar"** na listagem de Projetos
(`ProjectAdmin.action_build_and_deploy`) — roda, por projeto selecionado:
1. `core.deploy.build_project()` — gera o HTML estático via Astro.
2. `core.deploy.deploy_build()` — copia pro VPS via SSH e atualiza o
   symlink `current`.

Cada `Build`/`Deployment` fica registrado (visível inline na tela do
Projeto) com status, log e timestamps — dá visibilidade real de falha,
em vez de silenciosamente não fazer nada.

Ver [Parte 2](#parte-2--arquitetura-build-por-projeto) pra entender por
que o build é sempre escopado a 1 projeto por vez.

### Editar o slug depois de publicado

Editar `Project.slug` de um projeto **já publicado** (tem pelo menos 1
`Deployment` com `status='success'`) dispara automaticamente, sem ação
extra do usuário (`ProjectAdmin.save_model()`, `core/admin.py`):

1. Renomeia a pasta no VPS de `slug-antigo` pra `slug-novo` (via SSH,
   `core.deploy.rename_project_release()` → verbo `rename-project` no
   script restrito do VPS).
2. Dispara um rebuild + redeploy completo do projeto (necessário porque o
   HTML já gerado tem o slug antigo **embutido no próprio conteúdo** —
   links de navegação, breadcrumbs — não basta trocar o nome da pasta).

Ambos os passos rodam depois que a transação do Admin realmente commita
(`transaction.on_commit(...)`) — rodar durante a transação faria a etapa
de rebuild consultar a API do Django numa conexão que ainda não vê o
slug novo, e falhar com "Project not found" (bug real, já corrigido).

Se a renomeação/rebuild automático falhar (ex: `deploybot` não
configurado ainda), aparece um aviso no admin pedindo pra rodar
"Build & Publicar" manualmente.

Se o projeto **nunca foi publicado**, editar o slug não faz nada além de
salvar — não existe pasta no VPS ainda pra renomear.

### Domínio customizado (`Domain`)

Model + admin (`core/admin_domain.py`) já existem, com actions
**"Verificar DNS"** e **"Provisionar (Nginx + SSL)"**. A automação real
(`core/deploy.py: verify_domain_dns()`, `provision_domain_nginx_ssl()`)
já está implementada e testada, mas o script restrito do VPS
(`ops/vitrine-deploy.sh`) ainda tem os verbos `write-nginx-conf`/
`certbot-issue`/`dns-check` como **stub** (fase futura, deliberadamente
fora do escopo do MVP — ver `docs/provisionamento-producao.md`, seção
final).

---

## Parte 2 — Arquitetura: build por-projeto

### O problema que isso resolve

O sistema tem N clientes, cada um com N projetos. No desenho original, o
build do Astro gerava **todos os projetos de todos os clientes numa
passada só**: editar 1 página de 1 cliente disparava rebuild de todo
mundo. Isso não escala e criava um problema de modelagem: um registro
`Build` não conseguia "pertencer" a um client específico, porque
representava uma operação sobre todos os clients ao mesmo tempo (ver
["Por que o design anterior quebrava"](#por-que-o-design-anterior-build-site-wide--build-tenant-scoped-quebrava)
abaixo).

A solução: o build é **sempre escopado a exatamente 1 `Project`**.

### 1. Astro: filtro via env var `PROJECT_SLUG_FILTER`

`multi-sites/sites/_saas/pages/[project]/[...slug].astro` busca a lista
de projetos publicados na API do Django (`getStaticPaths()`), mas checa
uma env var antes de gerar os paths:

```js
const projectFilter = import.meta.env.PROJECT_SLUG_FILTER;
let projects = await projectsRes.json();
if (projectFilter) {
    projects = projects.filter((p) => p.slug === projectFilter);
}
```

Sem a env var, builda todos os projetos publicados (comportamento
antigo). Com ela, só as páginas daquele 1 projeto são geradas. Mesmo
padrão já usado nos sites legados deste repo (`VISA_SLUGS` no
`build:centraldevistos:incremental`).

A página home de um projeto é decidida por `page.is_home` (vindo direto
da API, não inferido do slug):

```js
const isHome = page.is_home || !page.slug || page.slug === 'index';
allPaths.push({
    params: { project: project.slug, slug: isHome ? undefined : page.slug },
    props: { page, project }
});
```

`slug: undefined` (não uma string) é o que faz o Astro gerar a URL raiz
do projeto em vez de `/index/`.

### 2. Management command: 1 chamada de `astro build` por projeto

`core/management/commands/build_static_sites.py`:

- `--project <slug>`: builda **só** esse projeto — seta
  `PROJECT_SLUG_FILTER=<slug>` no ambiente do subprocess. Levanta
  `CommandError` se falhar (importante pra quem chama via
  `call_command()`, como `core/deploy.py`, detectar falha de forma
  confiável).
- Verifica que a pasta de saída (`dist/_saas/{slug}/`) existe e não está
  vazia antes de considerar sucesso — o Astro retorna `exit 0` mesmo
  gerando 0 páginas (ex: erro de fetch dentro de `getStaticPaths()` que
  caiu no catch); sem essa checagem, o deploy seguinte falhava tentando
  copiar uma pasta que nunca existiu, com erro confuso.
- Sempre inclui `stderr` no log salvo, mesmo em "sucesso" — `console.error()`
  do JS escreve em stderr, não stdout, e era descartado silenciosamente
  antes dessa correção.

### 3. `core/deploy.py`: `build_project()` exige um `Project`

```python
def build_project(project, force=False, triggered_by=None):
    build = Build.objects.create(
        client=project.client,   # sempre derivado do dono do projeto
        project=project, ...
    )
    call_command('build_static_sites', '--project', project.slug, ...)
```

Não existe mais fallback de `client = Client.objects.first()` — ver
seção de histórico abaixo.

### 4. Deploy por-projeto e releases

`deploy_build(build)` copia só `dist/_saas/{project.slug}/` pro VPS,
numa árvore de releases própria por projeto, sempre aninhada sob 1
diretório pai compartilhado (`_saas`):

```
/var/www/_saas/{project.slug}/releases/{timestamp}/
/var/www/_saas/{project.slug}/current -> releases/{timestamp}/
```

Nginx aponta a raiz pra `current`, não pra uma release direto — trocar
de versão é uma operação atômica de symlink. Rollback = repor `current`
pra uma release anterior + reload Nginx, sem rebuildar.

**Por que aninhado sob `_saas` e não 1 bind-mount por projeto**: no
Nginx real do VPS (container Docker), cada `/var/www/*` novo exigiria
adicionar uma linha no `docker-compose.yml` do Nginx **e recriar o
container** — aceitável pra sites cadastrados manualmente, mas não
escala pra um SaaS onde qualquer usuário cria um projeto a qualquer
momento. Com `/var/www/_saas` como **1 único bind mount**, todo projeto
novo já aparece automaticamente dentro dele. Detalhes em
`docs/provisionamento-producao.md`.

### 5. Modelo `Build`: FK real pra `Project`

```python
class Build(ClientModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='builds')
    client = ...  # herdado de ClientModel, derivado de project.client
```

### ⚠️ Efeito colateral: o Astro limpa `dist/_saas` inteiro a cada build

Como todos os projetos compartilham o mesmo `outDir`, o Astro **apaga a
pasta inteira antes de cada build** — inclusive buildando só 1 projeto
via `PROJECT_SLUG_FILTER`:

```
1. build_project(agencia-marketing)  →  dist/_saas/ contém: agencia-marketing/
2. build_project(loja-da-maria)      →  dist/_saas/ contém: loja-da-maria/
                                          (agencia-marketing/ SUMIU do dist local —
                                           mas já foi copiado pro VPS antes, então
                                           o site publicado dele continua no ar)
```

Por isso `build_project()` e `deploy_build()` **sempre rodam em
sequência, sem intervalo, pro mesmo projeto**, antes de buildar outro —
é o padrão que `ProjectAdmin.action_build_and_deploy` já usa (loop
sequencial: builda A, faz deploy de A, só depois builda B).

**Consequência pra qualquer trabalho futuro** (ex: builds assíncronos
via fila): dois builds de projetos diferentes **nunca podem rodar em
paralelo** nesse desenho — um `astro build` concorrente apaga o
`dist/_saas` no meio da geração do outro.

### ✅ Lock de concorrência

`build_project()` (`core/deploy.py`) só permite **1 `Build` com status
`pending`/`running` por vez, em toda a plataforma** (lock global, não
por-projeto, porque a colisão é no `dist/_saas` compartilhado):

```python
with transaction.atomic():
    active = Build.objects.select_for_update().filter(
        status__in=[Build.STATUS_PENDING, Build.STATUS_RUNNING]
    )
    if active.first() is not None:
        raise BuildLockError(...)
    build = Build.objects.create(status=Build.STATUS_RUNNING, ...)
```

- Checagem + criação na mesma transação (`select_for_update`), minimiza
  a janela de corrida.
- `_mark_stale_builds_as_failed()` roda antes de cada tentativa e marca
  como `failed` builds `pending`/`running` com mais de
  `BUILD_STALE_TIMEOUT_MINUTES = 15` — evita lock preso pra sempre se um
  worker crashar no meio.
- Quem chama `build_project()` precisa tratar `BuildLockError`
  explicitamente (mostrar "outro build rodando, tente de novo", não
  deixar virar 500).

**SQLite em dev**: `select_for_update()` não faz lock de linha de
verdade (SQLite serializa escritas no nível do arquivo inteiro), mas não
trava/erra. Em Postgres (produção), vira lock de linha real.

### ⚠️ Cuidado: rebuild automático dentro de uma transação do Admin

Achado durante a implementação do rename de slug: se `build_project()` +
`deploy_build()` rodarem **dentro** da mesma transação de um
`save_model()` do Admin, o subprocess `npm run build` faz `fetch()` de
volta pra API do Django numa **conexão nova**, que ainda não vê o
`UPDATE` porque a transação externa não commitou — resultado: "Project
not found", build falha com 0 páginas, mesmo o dado já estando salvo
(só não visível pra outras conexões ainda). Qualquer código futuro que
dispare build a partir de `save_model()`/`save()` de outro model precisa
usar `transaction.on_commit(lambda: ...)`, não chamar direto.

### Por que o design anterior (build site-wide + `Build` tenant-scoped) quebrava

Antes desta mudança, `Build` herdava `ClientModel` (exige pertencer a
exatamente 1 client), mas o build gerava as páginas de **todos** os
clientes de uma vez. Isso forçava o código a "inventar" um dono:

```python
# código antigo, removido
if not client:
    client = Client.objects.first()  # arbitrário, sem relação com o build real
```

Dois bugs concretos, reproduzidos e confirmados:

1. **Crash do botão "Build & Publicar"**: se o staff logado tivesse um
   client diferente do "primeiro do banco", `ClientModel.save()`
   recusava salvar o `Build` (`ValueError`, proteção contra escrita
   cross-tenant).
2. **`needs_rebuild` mentindo pros outros tenants**: a query de "quais
   projetos precisam rebuild" era tenant-scoped, então só o
   `needs_rebuild` do client que disparou o build era limpo — mesmo o
   conteúdo dos OUTROS clients já tendo sido publicado de verdade.

Com o build escopado a 1 projeto, o `client` do `Build` é sempre
exatamente o dono do `project`, nunca uma adivinhação.

### Trade-off aceito

Builds individuais são rápidos (1 projeto por vez), mas o número de
invocações de `astro build` cresce com o número de projetos "sujos" — 50
projetos precisando rebuild ao mesmo tempo significa 50 processos
sequenciais, não 1 só. Aceitável pro MVP (builds de 1 projeto são
rápidos, segundos); se virar gargalo, a otimização natural é paralelizar
builds de projetos DIFERENTES entre workers isolados, cada um com seu
próprio `outDir` temporário — fora do escopo atual.

---

## Parte 3 — Troubleshooting

### "Project not found" ao acessar a API durante o build

- `Project.is_published` está marcado?
- O slug bate exatamente (sem espaços/maiúsculas)?
- Se isso aconteceu logo depois de editar o slug num fluxo custom: veja
  a seção ["Cuidado: rebuild automático dentro de uma transação"](#️-cuidado-rebuild-automático-dentro-de-uma-transação-do-admin)
  acima — é o sintoma exato desse bug de transação.

### Build falha com "npm not found"

Node.js não está acessível no ambiente onde o Django roda. Confirmar:
```bash
npm --version
which npm
```
Em produção, isso é resolvido pelo `Dockerfile` (instala Node.js 22) —
ver `docs/provisionamento-producao.md`.

### Build "termina com sucesso" mas não gerou nenhuma página

Sintoma clássico de erro de rede/API dentro de `getStaticPaths()` que
caiu num `catch` e retornou `[]` silenciosamente. Desde a correção em
`build_static_sites.py`, isso já é detectado e reportado como falha
(verificação de pasta de saída vazia) — o log completo do `npm run
build` (campo `log_output` do `Build`, visível no admin) mostra o
`console.error()` real por trás.

### "outro build está em andamento" (`BuildLockError`)

Esperado se dois builds tentarem rodar ao mesmo tempo — é o lock de
concorrência funcionando (ver Parte 2). Espere terminar e tente de novo.
Se ficar preso por mais de 15 minutos, `_mark_stale_builds_as_failed()`
libera automaticamente na próxima tentativa.

### Link 🔗/📋 dá 404

O projeto ainda não passou por "Build & Publicar" nem uma vez — o link é
montado a partir do slug, mas a pasta só existe no VPS depois do
primeiro deploy bem-sucedido.

### Editei o slug e o link antigo continua no ar / o novo dá 404 temporariamente

Comportamento esperado durante a janela entre o rename da pasta e o
rebuild automático terminar (segundos). Se persistir, veja a mensagem
que apareceu no admin logo após salvar — se veio um aviso amarelo
(⚠️), o rename ou o rebuild automático falhou e é preciso rodar "Build &
Publicar" manualmente.
