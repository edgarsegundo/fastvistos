# fastvistos — contexto do repo

Monorepo com dois projetos distintos:

- **`multi-sites/`** (raiz do repo) — Astro multi-tenant que builda vários
  sites estáticos legados (fastvistos, centraldevistos, emprego, etc.),
  cada um em `multi-sites/sites/{site-id}/`, orquestrado por
  `astro.config.mjs` / `SITE_ID` env var.
- **`vitrine/`** — Django, o SaaS que permite usuários criarem seus
  próprios `Project`s/`Page`s, buildados via um `site-id` especial
  (`_saas`) dentro do mesmo Astro acima.

## Regra permanente de todas as sessões

**Nunca rodar `git commit`, `git push` ou criar PR sozinho** — o usuário
faz essa parte manualmente, sempre. Pode preparar/mostrar o diff, nunca
efetivar.

## Se a tarefa for sobre Projetos/Páginas/Build/Deploy/SSO do SaaS (`vitrine/`)

Ler primeiro: [vitrine/docs/guia-projetos-paginas-build-deploy-context.md](vitrine/docs/guia-projetos-paginas-build-deploy-context.md)
— tem a lista de paths tocados com frequência e as decisões já tomadas
(evita reabrir debate já resolvido). Docs completos linkados de lá.

## Se a tarefa for sobre SEO/GEO/AEO (nativo ou a evolução em curso)

Ler primeiro: [vitrine/docs/seo/guia-seo-projetos-paginas.md](vitrine/docs/seo/guia-seo-projetos-paginas.md)
— arquitetura de SEO em camadas já implementada (`resolve_seo()` é a
única fonte de verdade de precedência, nunca duplicar fallback no Astro).

Pra tarefas da evolução em curso (JSON-LD por tipo, sitemap/robots/
llms.txt, blocos de conteúdo estruturado, Core Web Vitals, AI visibility
score), o trabalho está quebrado em 6 fases — não tentar implementar mais
de uma por sessão:
- Roadmap completo: [vitrine/docs/seo/plano-evolucao-seo-geo-aeo.md](vitrine/docs/seo/plano-evolucao-seo-geo-aeo.md)
- Prompt de cada fase + decisões de arquitetura já fechadas (não
  reabrir sem motivo novo): [vitrine/docs/seo/prompts-claude-code-seo-geo-aeo.md](vitrine/docs/seo/prompts-claude-code-seo-geo-aeo.md)

Sempre em plan mode, uma fase por vez.

## Se a tarefa for sobre o Editor de blocos / WYSIWYG (evolução em curso)

Ler primeiro: [vitrine/docs/editor/guia-editor-blocos-context.md](vitrine/docs/editor/guia-editor-blocos-context.md)
— modelo mental (página = lista de blocos, os 3 formatos legados viram
blocos livres), estado atual do roadmap e decisões de arquitetura já
fechadas (stack React+Puck, formato do documento, sanitização server-side —
não reabrir sem motivo novo). Spec completa:
[vitrine/docs/editor/spec-de-produto-v1.md](vitrine/docs/editor/spec-de-produto-v1.md).

Trabalho quebrado em 7 fases (0–6) — não tentar implementar mais de uma por
sessão. Sempre em plan mode.

## Se a tarefa for sobre Aparência por elemento (estilo Carrd)

Ler primeiro: [vitrine/docs/editor/carrd-features-classificacao.md](vitrine/docs/editor/carrd-features-classificacao.md)
— classifica as features do Carrd em degraus (1/2/3) de complexidade
implementacional. Degrau 1 (config declarativa do Puck) já está implementado.

**Implementado (Degrau 1):** painel de estilo opt-in por elemento no Hero
variante `centered` — cor, fonte, tamanho, peso, espaçamento, sombra, borda,
alinhamento, ID/classe HTML, CSS customizado. Elementos suportados: eyebrow,
título, subtítulo, badge de anúncio, botões CTA, imagem (heroVisual),
avaliação (rating), barra de confiança (trustBar).

- Arquivo de fundação: `multi-sites/sites/_saas/theme/validation.ts` (allowlist
  de propriedades CSS, regex de hex/dimensão/ID-classe, parseador de CSS inline)
- Tipos genéricos (reaproveitáveis): `blocks/style-types.ts` (TextElementStyle,
  ButtonElementStyle, MediaElementStyle, etc.)
- Runtime (render com fallback): `blocks/style-runtime.ts` (sanitizadores,
  conversores pra CSSProperties, pont de CSS vars pro hover)
- Campos custom do editor: `editor/fields/{ColorField,FontField,DimensionField,
  ShadowField,BorderField,CssField,AttrsField}.tsx`
- Agrupador do painel: `editor/fields/ElementStylesField.tsx` (renderiza `<details>`
  por elemento, clique-no-canvas rola/expande via `id="appearance-group-${key}"`)
- Sanitização server-side: `vitrine/core/models.py` em `serialize_blocks_for_api()`
  (camada 3: a fronteira de segurança real)

**Fora de escopo**: animações de entrada/hover (exigem hidratação JS em produção),
sistema de Estilos salvos/reutilizáveis, outros blocos além do Hero `centered`.

## Se a tarefa for sobre Upload de imagens / Cloudflare R2 e Editor de imagens

**Backend:** R2 + galeria + busca stock já **pronto e testado**, end-to-end validado.

- `MediaAsset` model (`core/models.py`): client-scoped, soft-delete, denota 
  source (upload/stock/url/adjusted).
- `upload_image` endpoint (`/admin/core/page/upload-image/`, POST): valida 
  `project_id`, cria path `users/{client.id}/projects/{project.id}/{uuid}`, 
  registra MediaAsset row.
- `MediaAssetAdmin` rotas customizadas (`core/admin_media.py`):
  - `gallery/`: GET, retorna JSON paginado de imagens por client.
  - `stock/{pexels,pixabay,unsplash}/`: GET com `?q=` e `?page=`, search via 
    requests + Pexels/Pixabay/Unsplash API keys (próprias do vitrine, não 
    compartilhadas com msitesapp — evita contenção de quota).
  - `stock/proxy/` + `stock/google-proxy/`: GET com `?url=`, proxy same-origin 
    pra evitar CORS na modal do React.
- Settings: `PEXELS_API_KEY`, `PIXABAY_API_KEY`, `UNSPLASH_ACCESS_KEY` em 
  `vitrine/.env`.
- Seam já definido pra per-client BYO keys (v2 futura, veja `resolve_stock_api_key` 
  em `admin_media.py`).

**Frontend (editor Puck):** seletor de imagem **completo e refatorado para melhorar UI/UX**.

- `ui/Modal.tsx` (novo): primitivo genérico reutilizável — sempre via 
  `createPortal(document.body)`, semanticamente correto (role="dialog", a11y), 
  foco gerenciado, trap de Tab built-in, escapa do containing-block do 
  `.fields-panel` do Puck. Pronto pra ser usado em outros diálogos futuros 
  (ex: seletor de logo, confirm dialogs).
- `media/ImagePickerModal.tsx` (refatorado): monta sobre `Modal`, abas 
  Galeria/Stock, preview maior da imagem atual com chip de origem, "Remover 
  imagem" no rodapé (só se há valor).
- `media/GalleryTab.tsx`: drag-and-drop dropzone + grid com skeleton shimmer.
- `media/StockTab.tsx`: busca sticky no topo, grid aspect-ratio 4:3, sub-abas 
  Pexels/Pixabay/Unsplash/URL.
- `media/AdjustPanel.tsx`: 2 colunas (preview esquerda, controles direita) no 
  modal `size="lg"`.
- `fields/ImageField.tsx` (reescrito): **um único controle** sempre — placeholder 
  dashed quando vazio, thumbnail clicável quando preenchido. Nada de botão 
  "Remover" duplicado no sidebar (isso é ação da modal agora).
- `FieldType: 'image'` adicionado em `registry.ts`, 4 campos convertidos 
  (Hero imageUrl split/fullbleed, heroVisual.imageUrl, avatars[].imageUrl, 
  Sobre imageUrl).

**Padrões de UX aplicados** (pesquisa [Atlassian](https://atlassian.design/patterns/media-picker/),
[LogRocket](https://blog.logrocket.com/ux-design/modal-ux-design-patterns-examples-best-practices/)):
- Fade+scale entrance animation, respeta `prefers-reduced-motion`.
- Grid com hover lift, border-ring claro de seleção (não emoji ✅).
- Skeleton placeholders animados vs. "Carregando…" cru.
- Dropdown de fonte na imagem atual (Galeria/Stock/Ajustada).
- Rodapé com ações primária/secundária/danger bem diferenciadas.

**Nota:** o bug da modal presa no sidebar foi causado pelo `transform` do 
`.fields-panel` do Puck — contém `position:fixed` descendentes por regra CSS. 
Solução: `createPortal(document.body)`. Isso também torna o primitivo 
verdadeiramente reutilizável (nenhuma noção de layout de editor, puro modal).

## Outras áreas do repo

Ainda não documentadas num formato de contexto — se a sessão for sobre
outra área (ex: build dos sites legados, `tenancy/`, scripts na raiz),
vale perguntar ao usuário se quer que se crie um contexto equivalente
depois, em vez de assumir.
