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

**Fase 0 (fundação: data model + render, sem UI nova) — FEITA.** Migration
`core/0013`. Editor visual (fase 2) e resto do catálogo (fase 1) ainda não.

## Paths tocados com mais frequência

**Astro — catálogo de blocos** (`multi-sites/sites/_saas/blocks/`)
- `types.ts` — tipos/props de cada bloco + `BlockDocument` (formato Puck)
- `registry.ts` — `BLOCK_COMPONENTS` (type→componente) e `BLOCK_SCHEMAS`
  (campos editáveis; semente do config do Puck e do contrato de IA)
- `Hero.tsx`, `Features.tsx` — blocos estruturados
- `RichText.tsx`, `HtmlSafe.tsx`, `CodeEmbed.tsx` — blocos livres (os 3 legados)
- `BlockRenderer.astro` — mapeia o documento → componentes, render estático
- `pages/[project]/[...slug].astro` — só chama `<BlockRenderer document={page.blocks} />`

**Django**
- `vitrine/core/models.py` — `Page.blocks` (JSONField, fonte de verdade);
  `Page.serialize_blocks_for_api()` (**fronteira de segurança**: sanitiza
  blocos `HtmlSafe` com bleach antes do build); `_sanitize_html_safe()`;
  `content`/`content_format` são **vestigiais** (remover em migração futura)
- `vitrine/core/views.py` — `api_project_pages` e `preview_page` emitem `blocks`
- `vitrine/core/admin.py` — `PageAdmin` edita `blocks` por JSON cru (STOPGAP
  da fase 0; editor visual real é a fase 2); `blocks_count`
- `vitrine/core/templates/core/preview.html` — preview mostra só a lista de
  blocos (fase 0); render fiel é do Astro/editor

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

## Riscos/dívidas conhecidos

- **CodeEmbed sandbox** herda `allow-scripts`+`allow-same-origin` do mecanismo
  atual — inseguro, marcado com TODO no componente. **Endurecer na fase 6**
  (nota de risco da seção 7). Não liberar Code Embed pro usuário antes disso.
- `CodeEmbed` emite `srcDoc` (camelCase) no HTML por conta do React 19 SSR;
  o parser HTML5 minúscula pra `srcdoc` — funciona, é só cosmético.
- `dist/_astro/client.*.js` (runtime React) é gerado mas não referenciado por
  nenhuma página na fase 0 (0 hidratação). Passa a ser usado na fase 2.

## Roadmap (fases)

0. Fundação: data model + render (FEITA) · 1. Catálogo completo (seção 2) +
tema/Header/Footer de Site (3.3) · 2. Editor inline Puck (1/5/14) · 3.
Templates (3) · 4. IA questionário (6) · 5. Importador Inteligente (4) · 6.
SEO/redirects (4.4) + endurecimento do sandbox (7) + validação pré-publicação (8).

## Convenção de commit/branch

Nunca rodar `git commit`/`push`/PR sozinho — o usuário faz. Track novo:
branches `editor-fase-N-slug` (não `seo-fase-N`), mesmo padrão de
[../padrao-branches-por-fase.md](../padrao-branches-por-fase.md).
