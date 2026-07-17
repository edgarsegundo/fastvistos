# Multi-tenancy: padrão Client (shared schema, tenant column)

## Contexto

O `vitrine` vai atender vários clientes com os mesmos modelos de dados, cada um com seu próprio conteúdo. Esse é o mesmo problema que o projeto `microservicesadm` já resolve com um model `Business` + FK obrigatória em quase todos os models de domínio.

Avaliamos três caminhos:

1. **Manter o mesmo padrão (shared schema, FK obrigatória)** — o que já existe e funciona no `microservicesadm`.
2. **`django-tenants`** (schema-per-tenant) — descartado: exige PostgreSQL, e o projeto usa MySQL/SQLite.
3. **`django-multitenant`** (lib de terceiros) — descartado: documentação e testes só cobrem PostgreSQL/Citus; MySQL não é mencionado em lugar nenhum. Adotar significaria ser o primeiro a testar essa combinação, numa lib de nicho e pouco mantida.

Decisão: manter o padrão, mas fechar o gap identificado no `microservicesadm`.

## Por que `Client` e não `Business`

No `microservicesadm` o tenant se chama `Business` — cada tenant é literalmente um negócio (com ordens, financeiro, etc.). No `vitrine` o domínio é diferente: cada tenant é um cliente com um site/conteúdo próprio, não necessariamente modelado como "um negócio" no mesmo sentido. Optamos por `Client`, que é a palavra usada pra descrever o problema desde o início, em vez de importar o vocabulário do `microservicesadm` só por familiaridade entre projetos.

## O gap que existia no `microservicesadm`

No `microservicesadm`, o `save()` de `BusinessModel` preenche `business_id` automaticamente na escrita, mas **nenhuma leitura era filtrada automaticamente** — todo view/query precisava lembrar de `.filter(business_id=...)` manualmente. O admin também dependia de cada `ModelAdmin` herdar um mixin de filtro individualmente. Não existe risco zero, mas esse é o tipo de bug (esquecer um filtro) que só aparece em produção, com dado de um cliente vazando pra outro.

## O que foi implementado aqui (`tenancy/`)

- **`tenancy/threadlocal.py`** — guarda o client corrente numa variável thread-local, setada por request.
- **`tenancy/managers.py`** (`ClientManager`) — filtra `objects` automaticamente pelo client corrente. Isso é o que faltava no `microservicesadm`: leitura passa a ser segura por padrão, não só escrita.
- **`tenancy/models.py`** (`ClientModel`) — base abstrata: `objects` filtrado, `all_objects` como escape hatch explícito (pra management commands, superuser, relatórios cross-tenant), `save()` preenche `client` automaticamente e **levanta erro se não houver contexto** (em vez de salvar sem tenant silenciosamente).
- **`tenancy/middleware.py`** (`CurrentClientMiddleware`) — resolve o client corrente e limpa o thread-local no `finally`, sempre — evita que a thread seja reaproveitada pelo worker e "vaze" o tenant de um request pro próximo.

## Dois papéis diferentes de usuário (não é só "um usuário = um client")

A necessidade real tem duas pontas que não podem ser resolvidas com o mesmo campo:

1. **Cliente e seus empregados** — o cliente cria a própria conta e convida empregados. Todos ficam **fixos** no mesmo `Client`, sem opção de trocar. Modelado com `ClientProfile` (`OneToOneField(User)` → `Client`, mais um campo `role` — `owner`/`employee` — pra distinguir quem pode convidar/remover empregados e mexer em configurações sensíveis do quem só usa o sistema no dia a dia).
2. **Equipe interna (staff)** — gerencia vários clients, e o acesso é restrito por pessoa (nem todo staff vê todo mundo). Modelado com `Client.staff_members` (M2M pra `User`) + um "client ativo" guardado na sessão (`tenancy/views.py:set_active_client`), trocável via `/tenancy/set-active-client/<id>/`. Superuser ignora o M2M e acessa qualquer client.

`CurrentClientMiddleware._resolve_client()` decide qual caminho seguir: se o usuário tem `ClientProfile`, usa ele (fixo); senão, se é staff, lê o client ativo da sessão (validando acesso via M2M, exceto pra superuser).

`ClientScopedAdmin` (mixin de admin) usa a mesma resolução (`get_current_client()`) em vez de duplicar a lógica — evita os dois caminhos divergirem com o tempo.

## Por que thread-local e não contextvars

`contextvars` é a opção mais correta a longo prazo (funciona também com views async/Celery), mas foi decidido **não migrar agora**: a troca de thread-local pra contextvar é uma mudança localizada e barata de fazer depois — o resto do código não muda, só a implementação interna de `get_current_client()`/`set_current_client()`. Não há ganho em resolver isso antes de o projeto realmente ter views assíncronas ou tasks em background (o gatilho pra migrar é visível: o dia em que aparecer o primeiro `async def` ou Celery).

## Como usar em um app novo

```python
from tenancy.models import ClientModel

class Vaga(ClientModel):
    titulo = models.CharField(max_length=255)
```

- Dentro de uma request normal, `Vaga.objects.all()` já vem filtrado pelo client do usuário logado.
- Pra ver todos os tenants (ex: management command, script de manutenção), use `Vaga.all_objects.all()`.
- Se precisar salvar fora de uma request (management command, shell), sete o client explicitamente: `Vaga.objects.create(titulo="X", client=algum_client)`.

## O que ficou pendente / não decidido ainda

- Se o `vitrine` vai compartilhar banco com o `microservicesadm` ou manter totalmente separado (hoje: separado, ver decisão de banco isolado).
- Provisionamento automatizado de um cliente novo (no `microservicesadm` isso hoje é um script SQL manual — `base-duplication.md`). Não replicado aqui ainda porque não há models de domínio reais no `vitrine` pra provisionar.
- Nenhum teste automatizado (`tests.py`) foi deixado no `tenancy/` — a validação até agora foi só via smoke test manual (rodado e descartado). Vale escrever testes de verdade aqui antes de crescer mais, dado que é lógica sensível a segurança.

## Bugs encontrados numa auditoria pós-implementação (e corrigidos)

1. **App quebrado em runtime** — `settings.py` ainda referenciava `tenancy.middleware.CurrentBusinessMiddleware` (nome antigo, de antes do rename `Business`→`Client`). Passava despercebido porque `manage.py check` e os smoke tests via `manage.py shell` não carregam o WSGI/middleware — só apareceu ao subir o servidor de verdade (`ImproperlyConfigured`). Corrigido.
2. **CSRF: troca de estado via GET** — `set_active_client` aceitava GET (sem exigir POST), então o CSRF middleware do Django não validava nada (só valida métodos "unsafe"). Um `<img src=".../set-active-client/3/">` embutido em outra página forçaria a troca do client ativo de um staff logado, sem consentimento. Corrigido com `@require_POST`.
3. **Open redirect** — a view usava `request.META.get("HTTP_REFERER")` (header controlado pelo cliente) como destino do redirect após trocar de client. Corrigido: agora usa um parâmetro `next` explícito, validado com `url_has_allowed_host_and_scheme` (só aceita host local), com fallback pro admin.
4. **Admin sem escopo pro `Client`/`ClientProfile`** — `ClientAdmin` e `ClientProfileAdmin` mostravam todos os clients/perfis pra qualquer staff, ignorando a restrição do M2M `staff_members` — um staff restrito a um client via `set_active_client` ainda enxergava (e editava) a lista completa de clients e perfis de outros tenants nessas duas telas. Corrigido: `get_queryset()` agora filtra por `staff_members=request.user` pra staff não-superuser.
5. **Escrita cross-tenant não bloqueada em updates** — `ClientModel.save()` só preenchia `client` quando o campo estava vazio (criação), mas não verificava se um objeto **já existente** (ex: obtido via `all_objects` ou por PK sem passar pelo manager filtrado) pertencia a um client diferente do contexto corrente. Agora `save()` bloqueia (`ValueError`) qualquer tentativa de salvar um objeto cujo `client` não bate com o client corrente.

Todos os itens acima foram verificados com testes reais (servidor rodando, `django.test.Client`, não só leitura de código) antes de considerar corrigidos.

## Segunda rodada de auditoria (mais profunda)

6. **Campo `client` editável no form de qualquer `ClientScopedAdmin`** — nenhuma subclasse escondia o campo `client` do form de admin. Um staff com acesso ao admin (mesmo restrito a um client) veria um dropdown pra reatribuir o registro a outro tenant; o `save()` bloquearia (item 5), mas resultaria num erro 500 cru em vez de uma validação limpa. Corrigido: `ClientScopedAdmin.get_exclude()` esconde `client` do form pra não-superuser (a criação passa a depender só do auto-preenchimento do `ClientModel.save()` a partir do client corrente). Superuser continua vendo o campo, pra reatribuição deliberada quando necessário.
7. **Vazamento pequeno no `list_filter` do `ClientProfileAdmin`** — o dropdown de filtro por `client` lista as opções via `Client._default_manager.all()` internamente, ignorando o `get_queryset()` customizado — um staff restrito veria os *nomes* de clients fora do seu escopo no dropdown (sem acessar os dados, só o nome). Corrigido: `get_list_filter()` remove `client` do filtro pra não-superuser.

Testado com um `ModelAdmin` real (`ClientScopedAdmin` aplicado a um model de teste), dois usuários (superuser e staff restrito a um client via `staff_members`), cobrindo: campo `client` escondido/visível conforme o papel, criação via admin sem enviar `client` (auto-preenchido corretamente), changelist isolada por tenant, acesso direto a um objeto de outro tenant via URL (redireciona sem vazar dado — comportamento padrão do Django quando `get_queryset()` filtra o objeto fora do escopo), e `list_filter` restrito. Todos os cenários passaram; nenhum bug novo restante encontrado nessa rodada.

## Terceira rodada — limitações reais encontradas (não são bugs de código, são decisões/documentação pendentes)

8. **`bulk_create()` e `.update()` bypassam completamente o `save()`** — é comportamento inerente do Django ORM (operações em massa não instanciam/chamam `save()` por model). Verificado com teste real:
   - `Note.objects.bulk_create([Note(text="x")])` sem `client` explícito não é bloqueado pela mensagem amigável do `save()` — dá um `IntegrityError` cru do banco (NOT NULL), o que é seguro (não deixa passar sem tenant) mas com uma mensagem de erro pior.
   - `Note.objects.bulk_create([Note(text="x", client=client_b)])` insere pro `client_b` mesmo com `client_a` como contexto corrente — o guard de cross-tenant do `save()` não se aplica aqui.
   - `Note.all_objects.filter(pk=x).update(client=outro_client)` troca o tenant de um registro direto no banco, sem passar por `save()` nem pelo guard — mas isso é o comportamento **esperado** do `all_objects` (é o escape hatch deliberadamente sem proteção; só deve ser usado por código de confiança).
   - Em contraste, `Note.objects.filter(pk=x).update(...)` (manager **filtrado**) continua seguro mesmo assim: o `.filter()` do `update()` compõe em cima do queryset já restrito pelo `ClientManager`, então só consegue afetar linhas do client corrente — confirmado com teste (0 linhas afetadas ao tentar mexer num registro de outro tenant).
   - **Decisão**: não implementar interceptação de `bulk_create`/`update` agora (adicionaria bastante complexidade pra um padrão de uso — bulk — que não existe ainda em nenhum lugar do código). Documentado como limitação conhecida: quem for usar `bulk_create`/`all_objects.update()` no futuro precisa saber que essas operações não têm a mesma proteção do `save()`.

9. **`Client` e `ClientModel` usam `on_delete=models.CASCADE` sem soft-delete** — apagar um `Client` no admin apaga em cascata **todos** os registros de domínio associados (e todos os `ClientProfile`), instantaneamente, sem possibilidade de recuperação. O `microservicesadm` usa `SoftDeletableModel` (soft-delete via `is_removed`) pro `Business`; aqui optamos por hard delete simples até agora. Isso é uma decisão de produto genuína, não um bug de código — mas é um risco operacional real (exclusão acidental de um client apaga tudo, sem volta) que vale uma decisão explícita antes de ir pra produção com dados reais.
