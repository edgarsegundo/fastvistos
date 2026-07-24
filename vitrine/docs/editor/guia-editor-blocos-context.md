# Contexto rápido: Editor de blocos (spec-de-produto-v1)

Arquivo enxuto pra carregar no início de uma sessão nova sobre o editor de
blocos / WYSIWYG. Não repete explicação, só aponta onde as coisas estão e
que decisões já foram fechadas (não reabrir sem motivo novo).

Docs completos: [spec-de-produto-v1.md](spec-de-produto-v1.md) (produto) e
[../guia-projetos-paginas-build-deploy-context.md](../guia-projetos-paginas-build-deploy-context.md)
(Project/Page/Build/Deploy — a base sobre a qual o editor foi montado).

## O que é

Evolução do SaaS (`vitrine/` Django + Astro `_saas`) de "página = 1 blob de
conteúdo" para "página = **lista ordenada de blocos**" no estilo Carrd/Mobirise:
catálogo curado de blocos, preenchidos por IA/Importador, editados num editor
inline. Roadmap em 7 fases (0–6); **uma fase por sessão, sempre em plan mode.**

## O modelo mental (essencial)

- Uma `Page` guarda um **documento de blocos no formato Puck**:
  `{ root, content: [ { type, props }, ... ] }`, no campo `Page.blocks` (JSONField).
- A maioria dos blocos é **estruturada** (campos tipados: Hero tem title,
  subtitle, imageUrl…). É isso que deixa IA preencher e editor editar por
  clique, sem o usuário ver HTML.
- Os **3 formatos legados** (markdown / html_safe / html_custom) **não
  morreram** — viraram 3 **blocos livres** (escape hatch):
  `RichText` (markdown via `marked`), `HtmlSafe` (HTML+CSS, sanitizado por
  bleach), `CodeEmbed` (HTML+JS em iframe sandbox, = seção 7 da spec).
- **Um componente, dois hosts:** cada bloco é UM componente React. Em produção
  o Astro renderiza estático (`client:none`, zero JS). No editor (fase 2) o
  Puck renderiza o mesmo componente hidratado. O `BLOCK_SCHEMAS` (registry)
  é a fonte única de campos, reusada por Puck (fase 2) e IA (fase 4).

## Estado atual

**Fase 0 (data model + render) — FEITA** (migration `core/0013`).
**Fase 1 (blocos estruturados + tema/chrome de nível de Site) — FEITA**
(migration `core/0014`). Editor visual (fase 2) ainda não — tema/chrome/blocos
se editam por JSON no admin (stopgap).

## Paths tocados com mais frequência

**Astro — catálogo de blocos** (`multi-sites/sites/_saas/blocks/`)
- `types.ts` — tipos/props de cada bloco + `BlockDocument` (formato Puck)
- `registry.ts` — `BLOCK_COMPONENTS` (type→componente) e `BLOCK_SCHEMAS`
  (campos editáveis; semente do config do Puck e do contrato de IA)
- Estruturados: `Hero`, `Features`, `Sobre`, `Depoimentos`, `Preco`, `Faq`,
  `Cta`, `Contato` (display-only). Livres (3 legados): `RichText`, `HtmlSafe`,
  `CodeEmbed`. Todos Tailwind + tokens do tema, render estático (zero JS).
- `BlockRenderer.astro` — mapeia o documento → componentes, render estático
- `pages/[project]/[...slug].astro` — passa `theme`/`chrome` do project pro
  Layout e chama `<BlockRenderer document={page.blocks} />` (sem breadcrumb/h1/
  footer próprios — a página É os blocos; chrome vem do Layout)

**Astro — tema e chrome de nível de Site**
- `styles/saas.css` — `@import "tailwindcss"` + **ponte `@theme inline`**
  (tokens → vars de runtime `--brand-*`) + defaults no `:root` + estilo do
  `.block-richtext`. É o único CSS do _saas.
- `theme/theme.ts` — `buildBrandVars()` (emite `:root{--brand-*}` do
  project.theme), `fontLinks()`, `THEME_SCHEMA`. `theme/fonts.ts` — catálogo
  curado de fontes → Google Fonts.
- `chrome/Header.tsx`, `chrome/Footer.tsx`, `chrome/chrome.ts`
  (tipos + `DEFAULT_CHROME` + `CHROME_SCHEMA`)
- `layouts/Layout.astro` — importa `saas.css`, injeta `:root{--brand-*}` +
  `<link>` de fontes, renderiza Header/Footer em volta do `<slot>`

**Django**
- `vitrine/core/models.py` — `Page.blocks` (JSONField, conteúdo);
  `Project.theme` + `Project.chrome` (JSONField, config de nível de Site);
  `Page.serialize_blocks_for_api()` (**fronteira de segurança**: sanitiza
  `HtmlSafe` com bleach); `content`/`content_format` **vestigiais**
- `vitrine/core/views.py` — `api_project_pages` emite `blocks`;
  `api_project_pages`/`api_projects_list` — este último emite `theme`+`chrome`
- `vitrine/core/admin.py` — `PageAdmin` edita `blocks`, `ProjectAdmin` edita
  `theme`/`chrome`, ambos por JSON cru (STOPGAP; editor visual é a fase 2)

**Config**
- `astro.config.mjs` — integração `react()` (global; inerte pros sites legados)

## Decisões fechadas (não reabrir sem motivo novo)

- **Stack do editor: React + Puck** (seção 14 da spec resolvida). Blocos
  autorados como React desde a fase 0 → servem editor + produção (island
  estática). Vanilla/Vue descartados (ver plano da sessão de fase 0).
- **Fidelidade: inline clique-no-canvas** (fiel à spec, não painel lateral).
- **Modelo de dados: documento Puck único por página** em `Page.blocks`, NÃO
  tabela `BlockInstance` por bloco. `BlockDefinition`/`BlockVariant` da seção
  11 vivem em **código** (registry), não no banco — catálogo finito e curado.
- **Sanitização de HtmlSafe é server-side** (Django, na serialização), nunca
  no componente Astro. O componente só injeta HTML já limpo.
- **Sem migração de dados legados** — nada estava em produção.
- **Ordem diverge da seção 13 da spec de propósito:** editor entra na fase 2
  (não no fim), porque "editor manual sempre disponível" é promessa central.
- **Estilo: Tailwind utilities sobre CSS vars** (fase 1). CSS var é a camada de
  tema por-tenant nos dois caminhos; Tailwind foi escolhido pela escala forçada
  (sustenta o "catálogo curado") e ergonomia com React. Blocos usam utilities,
  nunca `style` inline.
- **Tema multi-tenant: ponte `@theme inline` → `--brand-*`.** O `_saas` builda
  todos os projetos num pass só (dist compartilhado) → não dá pra assar
  `@theme` por projeto (como o legado faz). Token = var de runtime; o VALOR vem
  do `:root{--brand-*}` que o Layout injeta do `project.theme`. Um CSS
  compilado compartilhado + `:root` por-tenant (provado: trocar cor não muda o
  CSS, só o `:root` inline).
- **Storage de tema/chrome: JSON no Project** (não modelo tipado, não em
  SeoSettings). Chrome é árvore de tamanho variável (nav = lista) → JSON de
  qualquer jeito; manter tema também JSON = um paradigma só.
- **Contato é display-only** (tel/WhatsApp/endereço/mapa). Formulário que
  envia e Blog (Listing/Post) ficaram **fora da fase 1** — viram fases próprias
  (puxam backend de submit e modelo Post, respectivamente).

## Riscos/dívidas conhecidos

- **CodeEmbed sandbox** herda `allow-scripts`+`allow-same-origin` do mecanismo
  atual — inseguro, marcado com TODO no componente. **Endurecer na fase 6**
  (nota de risco da seção 7). Não liberar Code Embed pro usuário antes disso.
- `CodeEmbed` emite `srcDoc` (camelCase) no HTML por conta do React 19 SSR;
  o parser HTML5 minúscula pra `srcdoc` — funciona, é só cosmético.
- `dist/_astro/client.*.js` (runtime React) é gerado mas não referenciado por
  nenhuma página (0 hidratação). Passa a ser usado na fase 2.
- **Sem menu mobile interativo** no Header (fase 1 é 100% estática; hambúrguer
  viria hidratado). Links quebram pra baixo em telas pequenas por ora.
- **FAQ block ↔ FAQ JSON-LD** (`type_specific_data` do SEO) ainda são fontes
  separadas — risco de dupla entrada. Unificar depois.
- **Blog e formulário de Contato real** não existem — fases próprias (modelo
  Post; backend de submit/anti-spam).

## Roadmap (fases)

0. Fundação: data model + render (FEITA) · 1. Blocos estruturados +
tema/Header/Footer de Site (FEITA) · 2. Editor inline Puck (1/5/14) · 3.
Templates (3) · 4. IA questionário (6) · 5. Importador Inteligente (4) · 6.
SEO/redirects (4.4) + endurecimento do sandbox (7) + validação pré-publicação (8).
Fases futuras avulsas: Blog (modelo Post) e formulário de Contato real.

## Convenção de commit/branch

Nunca rodar `git commit`/`push`/PR sozinho — o usuário faz. Track novo:
branches `editor-fase-N-slug` (não `seo-fase-N`), mesmo padrão de
[../padrao-branches-por-fase.md](../padrao-branches-por-fase.md).
