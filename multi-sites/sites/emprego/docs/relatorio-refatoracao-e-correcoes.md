# Relatório — Refatoração da Landing Page & Correções (site `emprego`)

Registro de tudo que foi diagnosticado, corrigido e melhorado ao longo do processo, desde a
auditoria inicial do CSS até a reconstrução completa da landing page no novo design da ASA Propaganda.

Referências de padrão: [`README.css.tailwind.no.projeto.md`](../../../../docs/⭐%20README.css.tailwind.no.projeto.md) ·
[`README-multi-site.md`](../../../../docs/⭐%20README-multi-site.md)

---

## Parte 1 — Auditoria inicial do CSS (antes do novo design)

Problemas encontrados no `theme.css`/`index.astro` originais por não seguirem o padrão Tailwind v4 do projeto, e como foram corrigidos:

| # | Problema | Correção |
|---|---|---|
| 1 | Estilos no `<style is:global>` do `index.astro` (variáveis `:root`, estilos de `body`/`h1`/`p`/`a`, classes `.btn-whatsapp`/`.kicker`/`.deck`) que deveriam viver no `theme.css` | Migrados: cores/fontes → `@theme`; elementos → `@layer base`; componentes → `@layer components`. `<style is:global>` esvaziado |
| 2 | `theme.css` com cores e fontes **genéricas** (placeholder azul/laranja, Source Sans Pro) | Substituídas pelas cores/fontes reais da marca |
| 3 | `<link>` do Google Fonts **no corpo** da página (HTML inválido) | Movido para dentro de `<Fragment slot="head">` |
| 4 | `style=""` inline com hex e `font-family` hardcoded no HTML | Trocados por classes Tailwind apontando para tokens do `@theme` |
| 5 | **Bug de tipo:** props `imageCaption`/`imageWidth`/`imageHeight` não existem em `primaryImage` | Corrigido para `alt`/`width`/`height` |
| 6 | Layout carregava `Source Sans Pro`, mas a página usava outras fontes (desalinhamento) | Fontes alinhadas no `@theme` + `<head>` |

---

## Parte 2 — Melhorias importantes implementadas

Após estudar o site de referência `revistadoturismo` (que já seguia o padrão), foram identificadas e corrigidas 4 melhorias de **impacto real** (documentadas em [`melhorias-sugeridas-css.md`](./melhorias-sugeridas-css.md)):

| # | Melhoria | Tipo | O que foi feito |
|---|---|---|---|
| 1 | **Regressão da fonte Bricolage Grotesque** nos títulos (trocada por Poppins sem querer; fonte ainda baixada mas sem uso) | Regressão visual | Restaurada via `--font-heading` no `@theme` |
| 2 | **Variável órfã `--color-bg-dark`** — o reset do `body` no `global.css` exige 3 variáveis que o `theme.css` não definia | Fragilidade de arquitetura | Definidas `--color-text-main`, `--color-bg-dark`, `--font-sans` no `@theme` (contrato do body) |
| 3 | `style="font-size"` inline competindo com `@layer base` | Inconsistência de cascata | Trocado por utilitário Tailwind (`text-[28px]`, `text-xl`) |
| 4 | Nomes de cor problemáticos: `--color-neutral-dark` (colide com paleta nativa) e `--color-bg-card` (gera `bg-bg-card`) | Nomenclatura | Renomeados para `--color-ink` e `--color-card` |

### Documentação atualizada (para refatorações futuras e novos sites)

- **`README.css.tailwind.no.projeto.md`** — adicionadas 4 seções novas + itens no checklist:
  - Contrato do reset do `body` (as 3 variáveis obrigatórias)
  - Convenção de nomes (não colidir com paletas nativas; sem prefixo duplicado)
  - Toda fonte carregada precisa ser usada (sem peso morto)
  - Proibição de `style=""` inline com cor/fonte/tamanho
- **`README-multi-site-starting-a-new-site.md`** — corrigido o **template de exemplo** (que tinha os **mesmos bugs**: props de imagem erradas + `font-family` hardcoded no `bodyStyle`) e adicionada uma seção "Setup do CSS/tema".

> Observação: o mesmo bug das props de imagem e da fonte hardcoded também existe no site **`fastvistos`** — foi reportado, mas **não corrigido** (fora do escopo, que era só `emprego`).

---

## Parte 3 — Reconstrução da landing page (novo design ASA Propaganda)

Refatoração 100% em Astro + Tailwind v4, em 5 fases, recriando tudo como componentes (sem copiar o HTML do Adobe). Fonte de verdade: `etapa1.html` + `etapa2.html`.

| Fase | Entrega |
|---|---|
| 1 | `theme.css` com tokens migrados + utilitários compartilhados (`.btn`, `.badge`, `.section-*`, `.reveal`, `.wrap`) + **Navbar** |
| 2 | **Hero** (slider 3 slides + dots) + **Widget WhatsApp** + **Strip** de prova social |
| 3 | **Como Funciona** + **Vídeo** + **Por Que Aqui** + **Números** + **Depoimentos** + **scroll-reveal** global |
| 4 | **Empresas/Marquee** + **B2B fullscreen** + **FAQ accordion** + **CTA Final** + **Footer** + **Barra WhatsApp mobile** |
| 5 | Auditoria de responsividade e consistência |

### Decisões de arquitetura aplicadas
- **CSS compartilhado** (botões, badges, títulos de seção, reveal) no `theme.css`; **CSS específico** de cada seção no `<style>` scoped do próprio componente.
- Tokens do `:root` da entrega migrados para `@theme`, **renomeados** para não colidir/duplicar (ex.: `--color-bg` → `--color-bg-dark`, `--color-bg-light` → `--color-surface`, `--color-text-muted` → `--color-muted`).
- Componentes novos com prefixo `Emprego*` para não colidir com os antigos.
- Todos os CTAs ligados a `siteConfig.site.whatsapp.url`.
- `<picture>` + `srcset` servindo variantes mobile das fotos do "Como Funciona".

---

## Parte 4 — Melhorias e ajustes que VOCÊ sugeriu

Ajustes propostos por você durante a construção (e por que foram bons):

| # | Sua sugestão | O que foi feito | Avaliação |
|---|---|---|---|
| 1 | Aumentar a margem lateral no mobile (20→25px) | Globalizado para **24px** no `.wrap` (alinhando todas as seções) em vez de só no hero | Evitou o hero ficar desalinhado das demais seções; 24px casa com a escala do Tailwind |
| 2 | Centralizar o conteúdo do hero **só no mobile** | Centralização aplicada **dentro dos `@media ≤560px`/`≤480px`** (eyebrow, título, sub, nota e botões); tablet/desktop intactos | Ficou mais bonito no celular sem quebrar tablet/desktop |
| 3 | Nota do hero: gap 8px e fonte 13px **no desktop** (menor no mobile) | Base desktop 8px/13px; override ≤860px para 4px/11px | Coerente com o resto do hero, que já encolhe em 860px |
| 4 | Texto do hero mais legível (o fundo estava interferindo) | **Opção A:** overlay diferente por breakpoint (direcional no desktop, vertical no mobile) + `text-shadow` no título/sub + `brightness` na foto | Resolveu desktop **e** mobile (texto centralizado full-width) |
| 5 | "Não senti muita diferença, escurecer mais" | Reforçado: `brightness .78`, overlay desktop `.96/.85/.58`, mobile `.90/.74/.93` | Contraste agora bem visível, sem matar a foto |
| 6 | Barra do WhatsApp mobile estava com comportamento **invertido** | Trocado para: **escondida no topo**, aparece após ~60% da 1ª tela (passa do hero); volta a sumir no topo. Sem flash (começa com `hidden` no markup) | Faz mais sentido — o hero já tem CTA próprio |

---

## Parte 5 — Bugs detectados e corrigidos durante o processo

| Bug | Onde | Correção |
|---|---|---|
| `</SharedHomeLayout>` duplicado (script do reveal ficou dentro do layout) | `index.astro` | Estrutura corrigida — script fora do layout |
| Props de imagem inexistentes (`imageCaption`/`imageWidth`/`imageHeight`) | `index.astro` original | `alt`/`width`/`height` |
| Margem lateral da seção Números (40px) destoando do padrão (24px) no mobile | `EmpregoNumeros.astro` | Padronizada em 24px |

---

## Pendências — conteúdo provisório a finalizar antes de publicar

Itens marcados com `⚠️` no topo dos componentes:

- [ ] **Logos reais** dos parceiros no marquee (hoje placeholders de setor)
- [ ] **Números** `10k+` / `2.500+` — confirmar (alegação pública; `reviewCount` real do site-config é 277)
- [ ] **Depoimentos** — confirmar autenticidade (1 veio do design, 1 foi escrito provisoriamente)
- [ ] **FAQ** — revisar as 6 perguntas/respostas (todas escritas provisoriamente)
- [ ] **Copy** das seções Vídeo, 2 cards extras de "Por Que Aqui", B2B e CTA Final
- [ ] **Footer** — destinos reais de Privacidade / Termos / Contato (hoje `#`)

## Limpeza pendente (aguardando confirmação)

Componentes antigos do home que ficaram órfãos (não importados pelo `index.astro`) e poderiam ser removidos:
`HeroSection`, `HeroSection.old`, `HowItWorks`, `WowItWorks`, `WhyUs`, `CallToAction`, `HeaderSection`, `FooterSection`, `FaqSection`.

> ⚠️ **Não remover** `Navigation.astro` nem `CarouselSection.astro` — ainda usados por `search.astro` e `blog/index.astro`.
