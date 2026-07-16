# Etapa 1 — Revisão de Arquitetura: Dashboard Multi-Site com Templates e Editor Visual (WYSIWYG + IA)

> Documento final da Etapa 1. As 2 decisões de escopo que eram do usuário já foram tomadas
> (slug do `Site` composto por business; draft/publish via ponteiro `draft_version`) e estão
> incorporadas na spec da Etapa 2. A verificação sobre as tabelas `web_page*` foi confirmada.

## Contexto

O usuário testou a funcionalidade de multi-templates implementada na sessão anterior
(`create-site.js` + `templates/site-template-minimal` + `templates/site-template-blog-heavy`) e
agora quer expandir a visão: um **dashboard** onde um usuário poderá:
- Ter múltiplos negócios (`business_id`) e múltiplos sites (`site_id`) por negócio.
- Apontar cada site para um domínio próprio ou subdomínio da plataforma.
- Criar sites a partir de um catálogo de templates crescente.
- Criar múltiplas páginas por site (Home, Sobre a Empresa, etc.), linkadas entre si.
- No futuro (fora do escopo desta etapa): editar visualmente via WYSIWYG e gerar/editar
  conteúdo via IA (texto, seções, templates).

**Esta é a Etapa 1 de um roadmap de 5 etapas.** O objetivo aqui é exclusivamente diagnóstico +
preparação de base (dados/arquitetura) — nenhuma feature visual, editor ou IA é construída agora.

Mapa do roadmap (as etapas seguintes são referenciadas ao longo do doc):
- **Etapa 1** — este documento: diagnóstico + spec de schema (sem código/migration).
- **Etapa 2** — migrations do app `sites` + CRUD/API de Site/Page + corte dos dois caminhos de
  escrita + `BusinessMembership` como fonte de permissão.
- **Etapa 3** — domínio/subdomínio: wildcard DNS/cert para subdomínio da plataforma primeiro,
  verificação de domínio customizado depois; ligar `Domain` à geração de `.conf`.
- **Etapa 4** — editor WYSIWYG das páginas institucionais (evoluir/reaproveitar o Toast UI já vivo).
- **Etapa 5** — geração/edição de conteúdo via IA sobre o schema de blocos JSON.

Importante: o projeto `fastvistos` (Astro) se comunica com um projeto Django separado em
`/Users/edgar/Repos/microservicesadm/microservicesadm/`, que hoje já concentra os endpoints de
API, o banco de dados (MySQL, compartilhado com o Astro via Prisma) e o único editor
visual/dashboard existente até agora.

## O que a investigação encontrou

### Lado Django (`microservicesadm`)

- **`Business`** (app `business`) é o model raiz — PK UUID hex, `custom_config` (JSON),
  `canonical_domain` (string livre). **Não existe model `Site`** conectado a ele.
- **`Profile`** é `OneToOne` com `User` e tem **uma única FK para `Business`** (nullable,
  `SET_NULL`). Ou seja: hoje o sistema assume **1 usuário → 1 negócio**, resolvido via
  thread-local (`business/middlewares.py`) em `BusinessModel.save()` (classe abstrata usada por
  `BlogConfig`, `BlogArticle`, `ApplicationDS160`, etc.). **Não há M2M usuário↔negócio, nem
  conceito de colaborador/role.**
- Existe um model chamado `Site` — mas em `presell/models.py`, um app completamente
  desconectado (landing pages), com FK direta a `User` (não a `Business`). Não é reaproveitável
  diretamente, mas é um precedente de nomenclatura a evitar colidir.
- **`create-user-for-business`** (`blogging2/api_views.py`) espera que o `Business` **já
  exista** — quem cria o `Business` de fato é o **`create-site.js` do lado Astro**, chamando
  `blog-service.js` que faz `prisma.business.create` **diretamente no MySQL, sem passar pelo
  Django**. Ou seja, hoje existem **dois caminhos de escrita diferentes** para a mesma tabela
  `business` (um via Node/Prisma, outro seria via Django/admin) — isso é um risco ativo, não
  hipotético (ver Gap #3 abaixo).
- Autenticação serviço-a-serviço: header simples **`X-API-Key`** (`ApiKeyMiddleware`, ativo só
  em produção). O doc `integracao-django-astro-jwt.md` é uma proposta **não implementada** para
  um caso de uso diferente (preview autenticado) — não confundir com o mecanismo real em uso.
- Conteúdo de artigo de blog = **Markdown puro** (`blog_article.content_md`), com histórico via
  `BlogArticleContentRevision`. Não há estrutura de blocos JSON no corpo do artigo.
- **Já existe um editor WYSIWYG funcionando**: Toast UI Editor (`blogging2/views_editor.py` +
  rotas em `blogging2/urls.py`), autenticado por sessão+CSRF, com upload/crop de imagem e
  histórico de revisões com restore. É Markdown-based (edita `content_md` de artigos), não
  block/JSON-based, e não cobre páginas institucionais (Home/Sobre) — mas é uma base real e viva
  a considerar na Etapa 4, não algo a construir do zero.
- `ds160`/`ds160_organization` **herdam da mesma `BusinessModel` abstrata** — qualquer mudança
  estrutural em `Business` (ex.: introduzir `Site`, mudar `Profile.business` para M2M) afeta
  esses apps também.
- Achado-chave para a decisão de conteúdo estruturado: **já existem tabelas `web_page` →
  `web_page_section` → `web_page_section_version` (+ `web_page_faq`)** no banco (app
  `blogging2`, migrations `0009_...` e `0015_webpagefaq`), com `business_id` direto (via
  `BusinessModel`) e um mecanismo de versionamento desenhado (`WebPageSection.active_version` →
  `WebPageSectionVersion.file_path`). **Confirmado por investigação dedicada**: essas tabelas
  são hoje um **esqueleto não conectado a nenhum fluxo real** — nenhuma `view`/`api_view`/`url`
  as usa, `active_version` nunca é populado por código, `file_path` nunca é escrito nem lido em
  lugar nenhum. O único acesso existente é via Django admin genérico (CRUD manual). Isso é uma
  boa notícia: **evoluir essas tabelas é de baixo risco** (não existe comportamento em produção
  para quebrar), diferente de mexer em `blog_article` (que tem editor e fluxo reais).

### Lado Astro (`fastvistos`) — banco/Prisma

- Schema Prisma (74 models) é um espelho **do mesmo banco MySQL que o Django usa** (introspectado
  via `prisma db pull`) — ou seja, os dois projetos compartilham o banco diretamente, sem API
  como camada de leitura.
- **Não existe nenhuma coluna `site_id`** em tabela alguma — confirmado inclusive pelo próprio
  README do projeto, que já lista "Add site_id columns" como *future enhancement* não feito.
  Toda segmentação é só por `business_id`.
- A relação `site_id ↔ business_id` existe **apenas em arquivo git-versionado**
  (`multi-sites/sites/<site_id>/site-config.ts`, campo `site.business_id`) — não há tabela no
  banco que registre isso.
- `BlogService.getArticles(siteId?)` aceita um parâmetro `siteId` que **nunca é usado** na query
  — um fóssil literal do conceito de "site" que começou a ser introduzido e nunca foi concluído.
- `generate-site-registry.js` é referenciado em `package.json` mas **o arquivo não existe** —
  script morto, confirma que nunca existiu de fato um "registro central de sites".
- `blog_config.slug` é `@unique` **global** (não por `business_id`) — risco latente de colisão
  entre negócios diferentes que escolherem o mesmo slug.

### Deploy e domínio

- Astro roda em **`output: 'static'`**, sem adapter de servidor — cada `SITE_ID` vira uma pasta
  `dist/<site>` separada, resolvida inteiramente em **build-time**. Não há (nem pode haver, na
  forma atual) roteamento dinâmico por `Host` header em request-time.
- Domínio → site é **um arquivo `.conf` de Nginx por domínio**, gerado interativamente
  (`create-astro-site-conf.sh`, no repo separado `reverse-proxy-config`), com certificado via
  certbot manual, commit manual do `.conf`, reload manual do Nginx. **Não existe verificação de
  propriedade de domínio (TXT/CNAME) nem status (pendente/verificado)** — hoje é só um lembrete
  impresso no terminal para o humano configurar DNS.
- Mídia: sem CDN/S3. Fica em volume Docker do `microservicesadm`, sincronizado via `rsync` para
  a pasta pública de cada site na VPS.

## Gaps priorizados por risco de retrabalho

1. **[ALTO] `Profile.business` é FK única (1 negócio por usuário) — e `BusinessModel.save()`
   deriva o tenant a partir dela.** Bloqueia "usuário com múltiplos negócios" em dois níveis:
   (a) autenticação/permissão — precisa virar tabela de associação (`BusinessMembership`: user,
   business, role); (b) **atribuição de tenant** — em `business/models.py:130-134`,
   `save()` faz `self.business_id = Profile.objects.get(user=user).business.id`. Isso pressupõe
   **um** negócio por usuário: assim que houver múltiplos, cada `BlogArticle`/`WebPage`/
   `ApplicationDS160` novo herda o business errado (o "primeiro" do Profile). O problema não é a
   coluna (que fica por compat), é a **lógica de derivação implícita**: a Etapa 2 tem de
   substituí-la por um contexto de business **explícito por request** (thread-local setado pela
   sessão/dashboard, não pelo Profile). Sem isso, todo código de escrita futuro nasce
   apontando para o tenant errado.
2. **[ALTO] Não existe `Site` no Django.** `site_id` só existe em arquivo git no lado Astro. Sem
   isso, não há como o dashboard listar/criar/gerenciar sites de um negócio, nem amarrar domínio a
   site no banco.
3. **[ALTO — risco ativo, não hipotético] `create-site.js` grava direto na tabela `business` via
   Prisma, contornando o Django.** Isso já cria hoje um caminho de escrita paralelo ao Django.
   Assim que o Django ganhar sua própria lógica de criação de Site/Business (Etapa 2), os dois
   caminhos vão divergir/conflitar se não for unificado.
4. **[MÉDIO-ALTO] Conteúdo de página institucional (Home/Sobre) não deveria copiar o modelo do
   blog (Markdown).** O candidato natural para o schema de blocos JSON é a tabela `web_page*`
   já existente (não o `blog_article.content_md`, que atende bem ao blog e já tem editor
   funcionando). Recomendo **não mexer no fluxo de blog** — focar o investimento de "JSON
   estruturado" exclusivamente nas páginas institucionais.
5. **[MÉDIO] Ausência de model `Domain`/fluxo de verificação.** Maior gap estrutural para
   "usuário aponta domínio sozinho" — hoje é 100% manual (arquivo Nginx por domínio + DNS por
   fora). Recomendo, antes de atacar domínio customizado livre, viabilizar primeiro subdomínio
   da plataforma (`<site>.suaplataforma.com`) via wildcard DNS/cert — complexidade bem menor.
6. **[BAIXO-MÉDIO] Sem catálogo de componentes (`ComponentDefinition`)**. Necessário antes do
   editor WYSIWYG/IA saberem o que podem gerar/editar, mas é aditivo — não bloqueia nada hoje.
7. **[BAIXO]** `blog_config.slug` único globalmente (não por business) — colisão latente.
   (Nota: `blog_article` **já** é per-business — `@@unique([slug, business_id])`; só
   `blog_config.slug` é global. Decisão relacionada tomada para `Site`: ver Etapa 2, `slug`
   composto por business, coerente com `blog_article`.)
8. **[BAIXO]** `getArticles(siteId)` morto e `generate-site-registry.js` inexistente — cosmético,
   mas sintomas do mesmo gap #2.

## Recomendação: JSON estruturado vs HTML/Markdown

- **Blog** (`blog_article.content_md`): manter como está. Já funciona, já tem editor Markdown
  (Toast UI) funcionando, migrar agora seria retrabalho sem necessidade real (o usuário não
  pediu WYSIWYG de blog, pediu de páginas institucionais).
- **Páginas institucionais (Home, Sobre a Empresa, etc.)**: recomendo modelar como árvore
  `Page → PageSection → (content_json | html_override)`, **evoluindo** as tabelas `web_page` /
  `web_page_section` / `web_page_section_version` já existentes (confirmado esqueleto seguro para
  evoluir — ver achado acima) em vez de criar tabelas paralelas do zero. Isso aproveita de graça
  o mecanismo de versionamento já desenhado (as `WebPageSectionVersion` = o histórico) como base
  para "draft vs published + histórico" (item pedido pelo usuário) — só precisa ser efetivamente
  ligado a um fluxo real, o que não existia até agora.
- **Importante — `active_version` sozinho NÃO entrega draft/publish.** `active_version` é uma
  única FK ("qual versão está no ar"). Para ter rascunho editável coexistindo com a versão
  publicada, `WebPageSection` ganha um segundo ponteiro **`draft_version`** (FK, nullable):
  o editor sempre escreve em `draft_version`; publicar é `active_version = draft_version` (e
  abrir novo draft cria a próxima `WebPageSectionVersion`). O histórico continua sendo o conjunto
  de versões. Decisão tomada com o usuário: ponteiro dedicado, não `status` na version.
- **Campo de override**: incluir desde já um campo `html_override` (nullable) em
  `PageSection`/versão — se presente, renderiza HTML direto; se ausente, renderiza a partir de
  `content_json` + `ComponentDefinition.type`. Isso implementa exatamente o modelo híbrido que o
  próprio usuário propôs (editor visual manipula JSON; edição direta de HTML quebra o vínculo).

## Divisão de responsabilidades

**Django (`microservicesadm`) — dono da escrita e do dashboard:**
- Todas as tabelas novas/evoluídas: `BusinessMembership`, `Site`, `Domain`, `ComponentDefinition`,
  evolução de `web_page`/`web_page_section`/`web_page_section_version` (+ `site_id` FK,
  `content_json`, `html_override`).
- Endpoints de API para CRUD de Site/Page/Domain (não existem ainda — ficam para Etapa 2).
- O futuro editor WYSIWYG e os endpoints de geração via IA.
- Fluxo de verificação de domínio (quando existir).

**Astro (`fastvistos`) — dono da renderização estática:**
- Continua lendo do MySQL via Prisma (padrão já usado pelo `BlogService`) — mantenho essa leitura
  direta por enquanto (funciona, é rápida em build-time); não introduzir chamadas de API por
  artigo/seção só para ler.
- `templates/` (arquivos Astro) continuam sendo os templates "de código" para sites criados hoje
  — isso não muda nesta etapa. Só quando existir edição via WYSIWYG é que uma página específica
  passa a ser renderizada por um **renderer genérico** (`content_json` → componente por `type`),
  coexistindo com sites 100% "template de código".
- `create-site.js` precisa parar de escrever direto em `business` via Prisma — na Etapa 2, deve
  chamar uma API Django (Site/Business) em vez disso. Não mudo isso agora (fora do escopo desta
  etapa), só deixo formalmente registrado como próximo passo obrigatório.

**Contratos a fechar já (sem implementar):**
- Autenticação: manter `X-API-Key` para chamadas serviço-a-serviço (já funciona, não introduzir
  JWT sem necessidade real).
- Fonte da verdade de `business_id`/`site_id`: passa a ser o banco (via novo model `Site` no
  Django), não mais o arquivo `site-config.ts` — `site-config.ts` vira um artefato derivado/cache
  (migração real disso fica para Etapa 2/3, não agora).

## Escopo confirmado da Etapa 1

Decidido com o usuário: **a Etapa 1 entrega só este documento** (diagnóstico + hierarquia
proposta + gaps priorizados + recomendação de conteúdo + divisão de responsabilidades). Nenhuma
migration roda no banco compartilhado (ds160/blogging2/presell) ainda — zero risco de regressão
nesta etapa. As migrations descritas abaixo ficam registradas como **especificação pronta para a
primeira tarefa da Etapa 2**, não são executadas agora.

## Especificação para a Etapa 2 (não executar agora — só planejamento)

Local definido: **novo app Django `sites`** (dentro de `/Users/edgar/Repos/microservicesadm/microservicesadm/`),
isolado do app `business` existente, para não misturar responsabilidades. `sites` terá FK para
`business.Business` (app existente) mas não o contrário — `business` não precisa saber de `sites`.

Migrations previstas no app `sites` (Etapa 2, models novos + campos novos, sem API/UI ainda):

- `BusinessMembership(user FK, business FK, role: owner/editor/viewer, timestamps)` — substitui
  o uso implícito de `Profile.business` para autorização multi-negócio. `Profile.business`
  permanece por compatibilidade (não remover — `BusinessModel.save()` depende dele via
  thread-local); a migração de fato para `BusinessMembership` como fonte de verdade de permissão
  é trabalho da própria Etapa 2, não desta especificação de schema.
- `Site(id UUID, slug, business FK, template_key, status: draft/active/suspended, timestamps)`
  com **`@@unique([slug, business_id])`** (decisão tomada: slug composto por business, coerente
  com `blog_article`). Consequência para o Astro: a pasta de build deixa de ser `dist/<slug>` e
  passa a `dist/<business>/<slug>` (ou equivalente com prefixo de business no `SITE_ID`) — o
  `create-site.js`/build precisa desse namespacing na Etapa 2/3. **Cuidar de colisão de nome com
  `presell.Site` (model já existente):** o novo app se chama `sites` e seu model `Site` fica em
  `sites.Site` — namespacing por app resolve import, mas o Django admin listará dois "Site";
  usar `verbose_name` distinto.
- `Domain(id UUID, site FK, hostname unique, is_primary bool, verification_status:
  pending/verified/failed, verification_token, ssl_status, timestamps)`. **Este model é apenas
  registro/estado até a Etapa 3+** — nada aqui gera o `.conf` Nginx nem dispara verificação
  (esse fluxo segue manual, no repo `reverse-proxy-config`). Criar o model NÃO faz "apontar
  domínio" funcionar; é só o schema pronto para o fluxo futuro.
- `ComponentDefinition(key unique — ex. "hero"/"header"/"carousel"/"footer", label, props_schema
  JSONField, is_active)` — **catálogo global da plataforma** (não por business; todos os negócios
  compartilham os mesmos componentes na v1), populado a partir dos componentes que **já existem**
  hoje nos templates Astro (`HeaderSection`, `HeroSection`, `MostReadSection`, `CarouselSection`,
  `FooterSection`), sem inventar nada novo. Definir já a estratégia de validação de `props_schema`
  (JSON Schema é o candidato) — o editor/IA vão depender disso para saber o que podem gerar.
- Em `blogging2.WebPageSection`: adicionar **`draft_version`** (FK para `WebPageSectionVersion`,
  nullable) ao lado do `active_version` existente — ver "Recomendação" acima (draft/publish).
- Em `blogging2.WebPage`: adicionar `site` FK (nullable no início, para não quebrar linhas
  existentes criadas via admin) e campos de SEO por página (`seo_title`, `seo_description`,
  `og_image`, `canonical_url`, `slug` se ainda não existir equivalente). **`WebPage` já é
  `BusinessModel` (tem `business_id`); com `site` FK ela passa a ter os dois.** Para evitar
  vazamento cross-tenant, adicionar validação (`clean()` + `CheckConstraint` quando viável) que
  garanta `webpage.site.business_id == webpage.business_id`. Fonte da verdade = `site.business`;
  `business_id` fica como denormalização coerente (BusinessModel exige a coluna).
- Em `blogging2.WebPageSectionVersion`: adicionar `content_json` (JSONField, nullable) e
  `html_override` (TextField, nullable) — `file_path` permanece no schema (não usado, não
  remover) até decisão de descontinuar formalmente.

**Sem UI, sem API, sem WYSIWYG, sem IA nesta especificação** — o objetivo é o schema estar pronto
para a Etapa 2 construir CRUD em cima sem precisar migrar dado nem redesenhar tabela depois.

**Ordem de corte dos dois caminhos de escrita (Gap #3) — definir já, executar na Etapa 2:**
Para nunca existir estado onde `business` existe sem `Site` correspondente, o corte deve ser
**Django-first num único PR**: no mesmo PR em que o endpoint Django de criação passa a existir,
`create-site.js` para de chamar `prisma.business.create` e passa a chamar a API (que cria
`Business` + `Site` atomicamente). Nada de janela intermediária com os dois caminhos ativos.

**Ponte DB → `site-config.ts` (fonte da verdade vira o banco):** o mecanismo de regeneração é
exatamente o `generate-site-registry.js` **hoje morto/inexistente** (referenciado em
`package.json`). Reviver esse script — gerar `site-config.ts` a partir do model `Site` no banco —
é o dono da "derivação" mencionada em Contratos. Registrado aqui para que "cache derivado" não
fique sem responsável; implementação fica para a Etapa 2/3.

**Fora do escopo (registrado, não corrigido nem na Etapa 1 nem nesta especificação):**
- `create-site.js` continua gravando `business` direto via Prisma **até o PR de corte acima**.
- `site-config.ts` continua sendo a fonte de configuração estática do Astro (não migra para
  leitura do banco ainda).

## Notas sobre este documento

- Cópia canônica: `fastvistos/docs/v2/README-arquitetura-multi-tenant-etapa1.md` (versionada).
- A Etapa 2 executa no repo `microservicesadm` — considerar copiar/linkar este doc para
  `microservicesadm/docs/` quando a Etapa 2 começar, para ficar perto de onde as migrations rodam.
- Nenhuma migration ou código foi executado nesta etapa; a spec acima é ponto de partida da Etapa 2.
