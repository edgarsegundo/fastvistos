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
(migration `core/0014`).
**Fase 2 (editor visual Puck) — FEITA.** Editor de blocos + painéis de tema e
chrome, montado como ilha React numa view do admin. JSON cru continua como
fallback avançado no admin.
**Fase 3 (templates) — FEITA** (migration `core/0015`). Modelo `Template`
(oficial global + privado por client), "salvar como template" (anonimiza PII),
"criar projeto a partir de template", seed `seed_official_templates` (Advocacia).

## Como rodar localmente

1. **Django** (a partir de `vitrine/`): `.venv/bin/python manage.py runserver 127.0.0.1:8000`.
2. **Bundle do editor** (a partir da raiz do repo, sempre que mexer em bloco/
   schema/editor — build:editor é manual, ver decisões): `npm run build:editor`
   → gera `vitrine/core/static/puck-editor/editor.{js,css}`.
3. **Abrir o editor:** logado como superuser/staff em `/admin/`, ir em
   Páginas → escolher uma página → botão **"🎨 Editar visualmente"**
   (ou direto `/admin/core/page/<page_id>/editor/`).
4. **Dado de teste conhecido:** `Project` id 9 (slug `projeto-1`), `Page` id 8
   (slug `home`) — já tem `theme`/`chrome` preenchidos e ao menos 1 bloco.
   URL direta: `/admin/core/page/8/editor/`.
5. **Build de produção pra comparar** (a partir da raiz, com Django rodando):
   `PROJECT_SLUG_FILTER=projeto-1 SITE_ID=_saas DJANGO_API_URL=http://127.0.0.1:8000 npx astro build`
   → `dist/_saas/projeto-1/index.html`. Serve pra confirmar que o que o editor
   salva bate com o que a produção renderiza (canvas do editor ≈ produção).

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

**Editor visual (Puck)** — `multi-sites/sites/_saas/editor/`
- `puck.config.tsx` — adapter que deriva os `fields` do Puck do `BLOCK_SCHEMAS`
  (fonte única); `render` reusa `BLOCK_COMPONENTS`; texto vira `contentEditable`
  (inline no canvas), url/markdown/html no painel. `iframe:{enabled:false}`.
- `App.tsx` — shell com abas Página (`<Puck>`) / Tema / Cabeçalho-Rodapé;
  lê `window.__EDITOR_DATA__`, injeta `:root{--brand-*}` ao vivo, botão Salvar
  faz POST. `main.tsx` monta e importa `saas.css` + `@measured/puck` css.
- `defaults.ts` — placeholder por bloco (o que "adicionar bloco" insere).
- **Bundle:** `vite.config.editor.mjs` (raiz) → `npm run build:editor` →
  `vitrine/core/static/puck-editor/editor.{js,css}`. Reusa blocos + saas.css
  (single-source). **NUNCA `core/static/editor/`** (sem sufixo) — esse path já
  é do blog-image-editor (feature #56), não relacionado — ver incidente abaixo.

**Django — editor**
- `core/admin.py` `PageAdmin`: `editor_view` (rota `<id>/editor/`, serve o
  bundle + `__EDITOR_DATA__` via `json_script`), `editor_save` (POST, grava
  `Page.blocks` + `Project.theme`/`chrome` + `needs_rebuild`), botão
  `edit_visually_link`. Escopo do client via `get_queryset` (ClientScopedAdmin).
- `core/templates/core/editor.html` — página standalone do editor.

**Django — templates (fase 3)**
- `vitrine/core/models.py` — `Template` (`is_official` + `owner_client` nullable
  + `snapshot` JSON `{pages,theme,chrome}`); `TemplateQuerySet.visible_to(client)`
  (oficiais + privados do client)
- `vitrine/core/templates_snapshot.py` — `snapshot_project()`,
  `anonymize_snapshot()` (só PII estruturado), `instantiate_template()`
- `vitrine/core/admin.py` — `ProjectAdmin.action_save_as_template`;
  `TemplateAdmin` (get_queryset por escopo + action "criar projeto a partir de")
- `vitrine/core/management/commands/seed_official_templates.py` — 1 oficial (Advocacia)

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
- **Editor: Puck como ilha em view do admin** (fase 2, seção 14 da spec). Bundle
  Vite buildado no projeto raiz (reusa blocos + saas.css), servido como static
  do Django. `iframe:{enabled:false}` no Puck pra o saas.css/tema aplicarem no
  canvas sem precisar injetar estilo no iframe.
- **Config do Puck deriva do `BLOCK_SCHEMAS`** — não redefine campo por bloco.
  Adicionar bloco/campo novo no registry aparece no editor automaticamente.
- **Save é explícito** (botão), grava draft + `needs_rebuild`. Publish continua
  no `ProjectAdmin` (build/deploy existente), não acoplado ao editor.
- **Template = snapshot JSON** (`{pages,theme,chrome}`), um modelo só com
  `is_official` + `owner_client` nullable (null=oficial/global). NÃO é
  ClientModel (oficiais não têm dono); escopo via `visible_to(client)`.
- **Anonimização de template = só PII estruturado** (Contato, logo/copyright,
  autor de depoimento, hrefs tel/mailto/wa.me). Prosa (títulos, Sobre, citações)
  fica intacta — texto livre não anonimiza com confiança; usuário revisa.
- **Projeto instanciado nasce `is_published=False`** (draft) — publicar é passo
  explícito depois. Thumbnail de template é campo manual (geração automática é
  fase futura). Marketplace público de templates fica fora do v1 (seção 10).
- **`PricePlan.features` é `{text}[]`** (não `string[]`) — arrays do Puck são
  arrays de objetos, sempre nomeados. Padrão a repetir em blocos futuros com
  listas de itens simples.
- **`build:editor` é automatizado em `rebuild.sh`** (não em `build_project()`).
  Ganchos possíveis têm frequência MUITO diferente: `build_project()` roda a
  cada publish de QUALQUER cliente (alto volume — descartado, desperdiçaria
  ~11s por publish); `rebuild.sh` roda só quando você faz deploy de código
  (baixo volume, sob seu controle). `rebuild.sh` já faz `git pull` (atualiza o
  monorepo inteiro, blocos+editor inclusos) — `npm run build:editor` entra
  logo depois, no HOST, ANTES de `docker compose up --build` (a imagem copia
  `core/static/puck-editor/` via `COPY . .`, então o bundle precisa estar
  fresco antes do build da imagem). Local/dev continua manual (`npm run
  build:editor` antes de testar) — isso não muda, só o caminho até produção.
- **Sem autosave nem aviso de saída** (decisão explícita) — Salvar é sempre
  manual/explícito. Mudança de mente perde trabalho não salvo se a aba fechar.
  Reavaliar (ex: `beforeunload` ou autosave) se isso incomodar no uso real.
- **Sem watch mode** (decisão revertida após incidente — ver "Riscos/dívidas").
  Só `npm run build:editor` manual, rodado uma vez, termina sozinho. Nenhum
  processo de build fica parado consumindo CPU/memória.

## Riscos/dívidas conhecidos

- **INCIDENTE (corrigido): `publicDir` do Vite poluía/colidia com outra
  feature.** Por padrão o Vite copia a pasta `public/` (raiz do repo) INTEIRA
  pro `outDir` a cada build. `public/` deste repo contém assets de uma feature
  não relacionada (`blog-image-editor.js` + imagens por site legado — ver
  `public/blog-image-editor.js`, o arquivo real e git-tracked). Sem
  `publicDir: false` em `vite.config.editor.mjs`, todo `npm run build:editor`
  recopiava ~1.3MB alheio pro destino do bundle — e como o destino inicial era
  `vitrine/core/static/editor/` (nome quase igual, escolhido sem checar
  colisão) e essa pasta usa `emptyOutDir: true`, cada build também **apagava**
  esse conteúdo antes de recopiá-lo do `public/`. Nenhuma perda real (a fonte
  git-tracked é `public/blog-image-editor.js`, nunca tocada — confirmado via
  `git log --all` e comparação byte a byte), mas custou uma investigação
  grande pra confirmar. **Corrigido:** `publicDir: false` em
  `vite.config.editor.mjs` (não precisa copiar nada de `public/`) + destino
  movido pra `vitrine/core/static/puck-editor/` (path exclusivo). **Lições:**
  (1) `publicDir: false` deveria ter sido a config padrão desde o início pra
  qualquer build Vite que não seja o app "principal" de um projeto — é
  copiado silenciosamente sem aviso; (2) antes de apontar `outDir`/
  `emptyOutDir:true` pra qualquer path, checar se já está em uso (`ls`/`git
  log -- <path>`).
- **Watch mode tentado e abandonado.** Tentativa de `npm run watch:editor`
  (antes do fix acima) causou um processo vite preso em CPU alto
  (120%+, 400-500MB) — muito provavelmente o watcher reagindo a mudanças
  dentro do `public/` copiado (imagens de vários sites) a cada rebuild, não um
  processo externo. Com `publicDir:false` isso deixa de existir, mas a decisão
  foi manter **sem watch mode por ora** — só build manual (`npm run
  build:editor`, roda uma vez, termina sozinho). Reavaliar só se o build
  manual virar fricção real —
  e, se reavaliar, testar isolado com o path já corrigido primeiro.
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
- **Puck UI × Tailwind preflight:** o saas.css (com reset do Tailwind) e o CSS do
  Puck coexistem no bundle (`main.tsx` importa `saas.css` antes do CSS do Puck);
  o canvas do editor **não foi verificado visualmente em browser** — bundle
  compila e o contrato de dados foi testado ponta-a-ponta, mas conferir a UI
  real (botões/inputs do Puck podem sofrer do preflight zerando padding/borda).
- Bug corrigido nesta fase: comentário Django `{# #}` multi-linha no
  `editor.html` vazava texto literal pro HTML (Django não suporta esse
  comentário em mais de uma linha) — o Puck usa o `document.body` pro preview
  de drag, então o texto vazado só aparecia ao arrastar um bloco.

## Roadmap (fases)

0. Fundação: data model + render (FEITA) · 1. Blocos estruturados +
tema/Header/Footer de Site (FEITA) · 2. Editor inline Puck (FEITA) · 3.
Templates (FEITA) · 4. IA questionário (6) · 5. Importador Inteligente (4) · 6.
SEO/redirects (4.4) + endurecimento do sandbox (7) + validação pré-publicação (8).
Fases futuras avulsas: Blog (modelo Post) e formulário de Contato real.

## Convenção de commit/branch

Nunca rodar `git commit`/`push`/PR sozinho — o usuário faz. Track novo:
branches `editor-fase-N-slug` (não `seo-fase-N`), mesmo padrão de
[../padrao-branches-por-fase.md](../padrao-branches-por-fase.md).
