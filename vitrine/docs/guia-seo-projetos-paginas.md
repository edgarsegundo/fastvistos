# Guia + Arquitetura: SEO dinâmico em camadas (Projetos/Páginas do SaaS)

Documenta o sistema de SEO/dados estruturados dos sites gerados pelo SaaS
(`_saas` no Astro + `Project`/`Page` no Django). Complementa
[guia-projetos-paginas-build-deploy-context.md](guia-projetos-paginas-build-deploy-context.md)
— leia aquele primeiro se ainda não tiver contexto geral de
Projeto→Página→Build→Deploy; este arquivo assume esse contexto e foca só
na parte de SEO.

Índice:
- [Contexto e motivação](#contexto-e-motivação)
- [Arquitetura: 3 camadas de herança](#arquitetura-3-camadas-de-herança)
- [Como os dados chegam ao Astro](#como-os-dados-chegam-ao-astro)
- [Arquivos envolvidos](#arquivos-envolvidos)
- [Decisões tomadas (não reabrir sem motivo novo)](#decisões-tomadas-não-reabrir-sem-motivo-novo)
- [Como estender](#como-estender)
- [Limitações conhecidas / backlog](#limitações-conhecidas--backlog)
- [Troubleshooting](#troubleshooting)

---

## Contexto e motivação

Os sites legados (`multi-sites/sites/{site-id}/`, ex. `emprego/`) têm um
pipeline de SEO maduro mas **estático**: um `site-config.ts` por site,
editado por um dev, com canonical/favicon/imagem OG/autor fixos e um
conjunto de componentes JSON-LD (`JsonLdHomePageBase`,
`JsonLdOrganizationBlock`, etc. em
`multi-sites/sites/emprego/components/`) alimentados por esse config.

O `_saas` (onde usuários do SaaS criam `Project`/`Page` via Django Admin)
não tinha equivalente — só propagava `title`/`description` crus pro
`<head>`, sem canonical, favicon, `og:image` ou JSON-LD. Um dev editando
`site-config.ts` não faz sentido aqui: são centenas de projetos de
usuários diferentes, cada um precisa configurar o próprio SEO **sem
precisar de um dev no meio**.

A solução implementada troca o `site-config.ts` estático por um
**sistema de SEO em camadas administrável pelo usuário no Django Admin**,
inspirado no plugin Yoast SEO do WordPress: o usuário edita metadados
numa área dedicada (inline no admin de Project/Page), com defaults
herdados automaticamente e um checklist de qualidade (texto colorido tipo
semáforo). A base foi desenhada para, no futuro, uma IA poder
preencher/sugerir esses campos automaticamente — isso **não está
implementado**, mas a arquitetura (resolução centralizada em
`resolve_seo()`) foi escolhida pra não bloquear esse caminho depois.

## Arquitetura: 3 camadas de herança

```
PlatformSeoDefaults (singleton)   →  substitui site-config.ts
        ↓ herda, pode sobrescrever
ProjectSeoSettings (1:1 com Project)
        ↓ herda, pode sobrescrever
PageSeoSettings (1:1 com Page)
```

Cada camada só armazena o que **difere** do pai — não há duplicação de
dado. A resolução acontece **inteiramente no Django** (não no Astro):
`core/seo.py::resolve_seo(page)` recebe uma `Page` e retorna um dict já
resolvido (título, descrição, canonical, `site_url`, imagem, favicon,
autor, organização, tema, etc). A API (`core/views.py::api_project_pages`)
serializa esse dict sob a chave `"seo"` de cada página. O Astro
(`multi-sites/sites/_saas/`) **só renderiza** o que recebe — não tem
nenhuma lógica de fallback própria, evita duplicar a regra de precedência
em duas linguagens.

### 1. `PlatformSeoDefaults` — singleton, nível plataforma

Modelo: `core/models.py`. Um único registro (padrão singleton: `save()`
força `pk=1`; `load()` faz `get_or_create(pk=1)`). Substitui
`multi-sites/sites/_saas/site-config.ts`, que foi **deletado** — não
existe mais arquivo de config estático pro `_saas`.

Campos: `site_name`, `default_favicon_url`, `default_og_image_url`,
`default_author_name`, `theme_color`, `google_site_verification`,
`gtm_id`, `locale` (default `pt-BR`), `organization_name`,
`organization_logo_url`.

Editado em Django Admin → **Configuração de SEO da Plataforma**. Só 1
item de menu, sem changelist — `PlatformSeoDefaultsAdmin.changelist_view`
redireciona direto pro objeto único (`core/admin.py`).

### 2. `ProjectSeoSettings` — 1:1 com `Project`

Modelo: `core/models.py`, `OneToOneField(Project, related_name='seo_settings')`.
Criado automaticamente (vazio) via signal `post_save` em `Project`
(`core/signals.py::create_project_seo_settings`) — resolução cai pro
`PlatformSeoDefaults` até o usuário preencher algo.

Campos: `og_image_url`, `favicon_url`, `author_name`,
`canonical_domain_override` (domínio customizado — ver
[Limitações](#limitações-conhecidas--backlog)), `organization_name_override`,
`default_title_suffix` (ex: `" | Minha Empresa"`, template de título
estilo Yoast, aplicado quando a página não define o próprio `seo_title`).

Editado inline dentro do admin de `Project` (`ProjectSeoSettingsInline`).

### 3. `PageSeoSettings` — 1:1 com `Page`, + `page_type` em `Page`

Modelo: `core/models.py`, `OneToOneField(Page, related_name='seo_settings')`.
Criado automaticamente via signal `post_save` em `Page`
(`core/signals.py::create_page_seo_settings`).

Campos: `seo_title`, `seo_description` (migrados de `Page` — ver
"Migração de dados" abaixo), `og_image_override`, `canonical_override`,
`noindex` (bool), `type_specific_data` (`JSONField`, guarda campos que só
fazem sentido pra certos tipos de página — endereço/telefone pra
`contact`, data de publicação/autor pra `blog_post` — sem precisar de
coluna dedicada pra cada combinação).

`Page.page_type` (`core/models.py`) é um `CharField` com choices: `home,
generic, contact, about, blog_post, landing`. Controla:
- Quais campos de `type_specific_data` fazem sentido mostrar (hoje só
  documentado, sem toggle JS no admin — ver Limitações).
- Qual bloco JSON-LD extra entra na página, no Astro (`contact` →
  `LocalBusiness`, `blog_post` → `BlogPosting`).

**Importante**: `page_type='home'` **não** controla se a página é a home
do projeto — isso continua sendo o campo `Page.is_home` (pré-existente,
com a constraint `unique_home_page_per_project`). São dois campos com
propósitos diferentes (`is_home` decide roteamento, `page_type` decide
quais campos/JSON-LD de SEO aparecem), mas **sincronizados
automaticamente** em `Page.save()`: marcar `is_home=True` força
`page_type='home'` (sobrescreve qualquer outro valor); desmarcar
`is_home` numa página que estava com `page_type='home'` reseta pra
`'generic'`. Isso evita o estado inconsistente `is_home=True` +
`page_type='contact'` sem exigir o usuário entender a interação entre os
dois campos, e sem precisar de JS condicional no admin.

Editado inline dentro do admin de `Page` (`PageSeoSettingsInline`), com
um checklist de SEO (`_seo_checklist_html()` em `core/admin.py`) mostrado
como campo readonly no topo do inline.

### Migração de dados (`Page.seo_title`/`seo_description` → `PageSeoSettings`)

Antes desta mudança, `seo_title`/`seo_description` eram colunas direto em
`Page`. A migration `core/migrations/0010_seo_layers.py` faz isso em uma
única migration, na ordem certa:
1. Cria os 3 models novos (`PlatformSeoDefaults`, `PageSeoSettings`,
   `ProjectSeoSettings`) e o campo `Page.page_type`.
2. `RunPython` (`copy_seo_data_and_backfill`) — cria `ProjectSeoSettings`
   pra todo `Project` existente e `PageSeoSettings` pra toda `Page`
   existente, **copiando** os valores antigos de `seo_title`/
   `seo_description` pro novo model (usa `bulk_create(...,
   ignore_conflicts=True)` — seguro aqui porque roda antes de qualquer
   signal ter criado essas linhas, mas não faz upsert: se algo já tiver
   criado a linha antes, o backfill daquele registro é silenciosamente
   pulado, não sobrescrito — ver nota em código).
3. Só depois disso remove as colunas antigas de `Page`.

Se for necessário rodar uma migração de dados parecida no futuro
(ex: normalizar outro campo), esse é o padrão a seguir: criar destino →
copiar dado → só então remover origem, tudo na mesma migration.

## Como os dados chegam ao Astro

Não é build-time file dump nem template Django — é **fetch HTTP em
build-time**:

1. `core/management/commands/build_static_sites.py` seta
   `PROJECT_SLUG_FILTER=<slug>` e roda `npm run build:_saas`
   (`SITE_ID=_saas astro build`).
2. `multi-sites/sites/_saas/pages/[project]/[...slug].astro` →
   `getStaticPaths()` faz `fetch(${DJANGO_API_URL}/api/projects/)` e,
   pra cada projeto, `fetch(.../api/projects/{slug}/pages/)`.
3. `core/views.py::api_project_pages` monta, pra cada página, um dict com
   `{slug, is_home, title, content, ..., seo: resolve_seo(page), modified}`.
   **Qualquer campo novo de SEO só chega no Astro se for adicionado
   explicitamente no retorno dessa view** — não existe serialização
   automática.
4. O Astro recebe `props: { page, project }` por path gerado; `page.seo`
   é o payload já resolvido, usado direto em `<Layout ...>` e nos
   componentes JSON-LD, sem nenhum `||`/fallback do lado do Astro.

Autenticação da API (`_check_build_api_access`): localhost ou header
`X-Build-Secret` — inalterado por este trabalho.

## Arquivos envolvidos

**Django — modelos, resolução, API**
- `vitrine/core/models.py` — `PlatformSeoDefaults`, `ProjectSeoSettings`,
  `PageSeoSettings`, `Page.page_type`
- `vitrine/core/seo.py` — `resolve_seo(page)`, único lugar com a regra de
  precedência Page > Project > Platform
- `vitrine/core/signals.py` — `create_project_seo_settings`,
  `create_page_seo_settings` (auto-criam as camadas vazias)
- `vitrine/core/views.py` — `api_project_pages` (serializa `seo`),
  `preview_page` (usa `resolve_seo()` pro preview), `sitemap_xml`
  (`/sitemap.xml`, gera sitemap direto do banco — ver decisão abaixo)
- `vitrine/vitrine_core/urls.py` — rota `sitemap.xml`
- `vitrine/core/migrations/0010_seo_layers.py` — schema + backfill de
  dados
- `vitrine/core/tests/test_seo.py` — testes de `resolve_seo()` (10 casos:
  cada camada de fallback, canonical com/sem `is_home`, `site_url`
  independente de `canonical_override`, `canonical_domain_override`)
- `vitrine/core/tests/test_page_type_sync.py` — sincronização `is_home`
  ⇄ `page_type` (4 casos)
- `vitrine/core/tests/test_sitemap.py` — `sitemap_xml` cross-tenant,
  noindex, soft-delete (4 casos)

**Django — admin**
- `vitrine/core/admin.py` — `ProjectSeoSettingsInline`,
  `PageSeoSettingsInline`, `_seo_checklist_html()`,
  `PlatformSeoDefaultsAdmin` (singleton)

**Astro**
- `multi-sites/sites/_saas/layouts/Layout.astro` — recebe o payload
  resolvido e emite `<title>`, `<meta description>`, canonical, favicon,
  `og:*`, `theme-color`, `robots` (noindex), slot `jsonld`
- `multi-sites/sites/_saas/pages/[project]/[...slug].astro` — consome
  `page.seo`, monta breadcrumb e decide quais blocos JSON-LD renderizar
  conforme `seo.page_type`
- `multi-sites/sites/_saas/components/JsonLdWebSiteBlock.astro`,
  `JsonLdOrganizationBlock.astro`, `JsonLdWebPageBlock.astro`,
  `JsonLdBreadcrumbBlock.astro`, `JsonLdLocalBusinessBlock.astro`
  (`page_type=contact`), `JsonLdBlogPostBlock.astro`
  (`page_type=blog_post`) — **duplicados** do padrão usado no legado
  (`multi-sites/sites/emprego/components/JsonLd*.astro`), não
  compartilhados — ver decisão abaixo

**Removido**
- `multi-sites/sites/_saas/site-config.ts` — órfão antes desta mudança
  (nunca importado), agora deletado; `PlatformSeoDefaults` assume o papel.

**Astro config (build, não site individual)**
- `astro.config.mjs` — `siteConfig` sintético + `sitemap()` desativado
  quando `SITE_ID=_saas` (ver decisão sobre sitemap abaixo)

## Decisões tomadas (não reabrir sem motivo novo)

- **Resolução acontece no Django, não no Astro.** `resolve_seo()` é o
  único lugar com `or`/fallback entre camadas — testável isoladamente,
  sem duplicar a regra em TypeScript. O Astro só recebe e renderiza.
- **Componentes JSON-LD duplicados em `_saas/components/`, não
  compartilhados com o legado.** O monorepo Astro não tem workspace/lib
  compartilhada configurada entre `multi-sites/sites/{site-id}/`; extrair
  pra um diretório comum exigiria um spike de infra (paths/aliases) fora
  de escopo. Trade-off aceito: duplicação de ~6 arquivos pequenos vs.
  complexidade de build cross-package.
- **`page_type` e `is_home` continuam sendo campos com responsabilidades
  diferentes** (roteamento vs. SEO), não um substitui o outro — juntá-los
  de vez exigiria migrar a lógica de roteamento (`is_home`, a constraint
  `unique_home_page_per_project`, `_live_url` no admin, `isHome` no
  Astro), que é código maduro e testado; não valeu o risco pra este
  trabalho. Mas ficaram **sincronizados via `Page.save()`** (ver seção
  acima) depois de uma revisão apontar que o estado
  `is_home=True`+`page_type='contact'` era alcançável sem aviso — testes
  em `core/tests/test_page_type_sync.py`.
- **Campos de imagem são `URLField`, não upload real.** Não existe
  `MEDIA_URL`/storage configurado no projeto (`vitrine_core/settings.py`).
  Usuário cola uma URL (ex: de outro serviço, CDN, ou imagem já
  hospedada). Upload real é backlog — depende de decisão de storage
  (S3? local? Cloudinary?) fora do escopo de SEO.
- **Checklist de SEO é só texto colorido, não bloqueia salvamento.**
  Nenhuma validação de SEO impede salvar um Project/Page incompleto —
  são avisos (`_seo_checklist_html()`), nunca `ValidationError`. Consistente
  com a filosofia do Yoast (orienta, não bloqueia o fluxo de publicação).
- **Sitemap do `_saas` é servido dinamicamente pelo Django
  (`/sitemap.xml`, `core/views.py::sitemap_xml`), não gerado pelo Astro.**
  O plugin `@astrojs/sitemap` monta URLs a partir do path físico de build
  + da config estática `site:` (`astro.config.mjs`) — funciona bem pros
  sites legados (1 domínio fixo por site-id), mas pro `_saas` (sem
  `site-config.ts` próprio) o `site:` caía num fallback pro domínio de
  outro site legado (`SITES.fastvistos`), gerando `sitemap.xml` com
  domínio **e** path errados (confirmado reproduzindo: URLs saíam como
  `https://fastvistos.com.br/{slug}/` em vez de
  `https://saas.fastvistos.com.br/app/{slug}/`). Corrigido em duas
  frentes: `astro.config.mjs` agora monta um `siteConfig` sintético pro
  `_saas` a partir de `PLATFORM_PUBLIC_BASE_URL` e **desativa** o plugin
  `sitemap()` só pra esse `site-id` (`IS_SAAS` guard nos `integrations`);
  o sitemap real é gerado direto do banco via `resolve_seo()` (mesma
  fonte de verdade das outras tags de SEO, exclui páginas com
  `seo.noindex=True`). Falta só cadastrar a rota `/sitemap.xml` no nginx
  do VPS (`proxy_pass http://vitrine:8000/sitemap.xml`, mesmo padrão de
  `/admin/`/`/preview/`/`/entrar/` em
  [provisionamento-vps-nginx-ssl-deploy.md](provisionamento-vps-nginx-ssl-deploy.md))
  — endpoint já funciona local (testado), só falta o passo de infra.
  **Importante sobre os managers usados em `sitemap_xml`**: o endpoint usa
  `Project.all_objects`/`Page.all_objects` (não `objects`), de propósito.
  `objects` (`ClientManager`) filtra implicitamente pelo client corrente
  no threadlocal (`tenancy.threadlocal.get_current_client()`), setado
  pelo `CurrentClientMiddleware` pra qualquer usuário autenticado — um
  dono de tenant logado testando a URL faria o sitemap enxergar só o
  próprio tenant, silenciando todos os outros (bug real, encontrado em
  revisão e coberto por
  `core/tests/test_sitemap.py::test_sitemap_lists_all_tenants_even_with_authenticated_tenant_in_threadlocal`).
  Como `all_objects` não filtra `is_removed`, o endpoint filtra isso na
  mão (`is_removed=False`) pra não vazar projeto soft-deletado. E
  `resolve_seo()` aceita um `platform` opcional pra evitar 1 query de
  `PlatformSeoDefaults.load()` por página no loop do sitemap.
- **`canonical_domain_override` existe no model desde o início mas só foi
  efetivamente usado no `resolve_seo()` depois de uma revisão** — o
  campo já existia (documentado como "reservado pra domínio customizado")
  mas a lógica de `resolve_seo()` inicialmente ignorava esse campo ao
  montar `site_url`; corrigido pra derivar `site_url` sempre a partir do
  projeto (considerando o override, se houver), nunca via regex sobre o
  `canonical` final da página — ver `core/seo.py`, comentário em
  `[...slug].astro`.

## Como estender

**Adicionar um novo campo de SEO em qualquer camada:**
1. Adicionar o campo no model (`PlatformSeoDefaults`, `ProjectSeoSettings`
   ou `PageSeoSettings`), `makemigrations` + `migrate`.
2. Incluir a regra de fallback em `resolve_seo()` (`core/seo.py`) —
   sempre no formato `page_valor or project_valor or platform_valor`.
3. Adicionar a chave no dict de retorno de `resolve_seo()`.
4. Se editável no admin: adicionar aos `fields` do inline correspondente
   em `core/admin.py`.
5. Se deve chegar no Astro: já chega automaticamente, porque
   `api_project_pages` serializa o dict inteiro de `resolve_seo()` sob
   `seo` — não precisa mexer na view. Só usar `seo.<novo_campo>` no
   `Layout.astro`/rota.

**Adicionar um novo `page_type` com campos próprios:**
1. Adicionar a choice em `Page.PAGE_TYPE_CHOICES`.
2. Documentar (comentário) quais chaves de `type_specific_data` esse tipo
   usa — não há schema formal validando o JSON hoje.
3. Se precisa de um bloco JSON-LD novo: criar o componente `.astro` em
   `_saas/components/`, seguindo o padrão dos existentes (props
   explícitas, sem importar `siteConfig` — não existe mais), e adicionar
   o branch condicional em `[...slug].astro` (`{seo.page_type === '...'
   && <NovoBloco .../>}`).

**Adicionar assistência por IA (backlog, arquitetura já preparada):**
`resolve_seo()` é o ponto de entrada único — um "provider" de sugestão
por IA pode ser plugado como uma camada adicional (ex: chamado quando o
usuário clica "sugerir com IA" no admin, populando os campos antes de
salvar) sem precisar tocar no Astro nem na API, já que ambos só consomem
o resultado final.

## Limitações conhecidas / backlog

- **Sem toggle JS condicional no admin por `page_type`** — o plano
  original previa mostrar/esconder campos de `type_specific_data`
  conforme o tipo selecionado (JS puro). Não implementado; hoje o campo
  `type_specific_data` é um `JSONField` cru no admin, o usuário precisa
  saber quais chaves usar pra cada tipo (documentado só em comentário no
  código, não na UI).
- **Sem score visual (semáforo verde/amarelo/vermelho)** — o checklist é
  texto colorido simples (`_seo_checklist_html`), não um componente
  visual tipo bolinha/gráfico.
- **Sem LocalBusiness/BlogPosting completos** — os blocos existem mas só
  leem `type_specific_data` livre (sem validação de schema); campos como
  `address`/`phone`/`opening_hours` (contact) e `published_at`/
  `author_override` (blog_post) são só convenção, não enforced.
- **Domínio customizado (`canonical_domain_override`) não integrado com
  o model `Domain`** — existe um model `Domain` separado (verificação
  DNS/SSL, ver
  [guia-projetos-paginas-build-deploy-context.md](guia-projetos-paginas-build-deploy-context.md))
  que já é "stub, fase futura". `canonical_domain_override` em
  `ProjectSeoSettings` é preenchido manualmente por enquanto — quando
  `Domain` sair do estágio stub, avaliar se `resolve_seo()` deveria puxar
  o domínio verificado de lá automaticamente em vez de depender do
  usuário duplicar a informação nos dois lugares.
- **Upload de imagem real** — ver decisão acima, campos são `URLField`.

## Troubleshooting

**"Página nova não mostra nenhum SEO customizado, só o título cru"** —
confira se `PageSeoSettings`/`ProjectSeoSettings` foram criados (deveriam
ser automáticos via signal no `post_save`). Se a `Page`/`Project` foi
criada por um caminho que **pula signals** (`bulk_create`, fixture via
`loaddata` sem `raw=False`, script que usa `all_objects` de forma
incomum), a linha relacionada pode não existir —
`resolve_seo()` trata isso com `getattr(obj, 'seo_settings', None)`
(não quebra), mas cai direto no fallback de plataforma/hardcoded. Rodar
`ProjectSeoSettings.objects.get_or_create(project=p)` /
`PageSeoSettings.objects.get_or_create(page=pg)` manualmente resolve.

**"JSON-LD com URL errada depois de configurar domínio customizado"** —
confirmar que `site_url` está vindo de `resolve_seo()` (`core/seo.py`),
não sendo recalculado no Astro via regex sobre `canonical`. Ver decisão
acima — esse era exatamente o bug corrigido nesta implementação.

**"Alterei um campo em `PlatformSeoDefaults` e não vejo efeito"** —
lembrar que o build do Astro só reflete mudanças depois de rodar
"Build & Publicar" de novo (build é sempre por-projeto, ver guia
principal) — mudar a plataforma não dispara rebuild automático de todos
os projetos. Se for uma mudança ampla (ex: trocar `organization_name` da
plataforma inteira), pode ser necessário rebuildar todos os projetos
manualmente (`api_trigger_rebuild` cobre só quem já tem
`needs_rebuild=True`).
