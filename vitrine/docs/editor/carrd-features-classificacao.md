# Funcionalidades estilo-Carrd no editor Puck — classificação por degrau

Roadmap de referência pra evoluir o editor de blocos rumo à paridade com o
Carrd **sem fork do Puck**. Cada funcionalidade é marcada pelo *degrau* de
esforço/arquitetura que ela exige. Serve pra decidir com dado (não achismo)
quanto do "feeling Carrd" é config barata e quanto é engenharia de verdade —
e pra confirmar se/quando o motor (Puck) ainda serve.

Ver também: [guia-editor-blocos-context.md](guia-editor-blocos-context.md)
(arquitetura atual) e [hero-layouts/hero-layouts.html](hero-layouts/hero-layouts.html)
(galeria de referência de layouts de hero).

## Os três degraus

- **Degrau 1 — Config do Puck.** Só usa API pública declarativa: campos
  (`text`/`select`/`array`/`object`/`custom`), `resolveFields` (mostra/esconde
  campos por contexto), `defaultProps`, `categories`. O registry
  (`blocks/registry.ts`) continua a fonte única; o adapter
  (`editor/puck.config.tsx`) deriva o config. **Custo baixo, sem dívida.**
- **Degrau 2 — Camada construída em cima do Puck.** O Puck continua o motor
  (árvore de blocos, drag-and-drop, persistência), mas você constrói
  subsistemas próprios acoplados a ele: editor de rich text embutido no
  render do bloco (Tiptap/Lexical), overlay de seleção de sub-elemento no
  canvas, toolbar flutuante ancorada na seleção, estado próprio sincronizado
  nos `props`. **Engenharia de verdade; acopla a uma lib pré-1.0 (0.20.x).**
- **Degrau 3 — `patch-package` cirúrgico.** 1–2 mudanças pontuais no core do
  Puck que a API não expõe (ex: interceptar o clique de seleção), aplicadas
  como patch versionado, reaplicado no `npm install`. **Ainda não é fork.**

> **Fork completo** só se justificaria com um paradigma central incompatível
> (ex: canvas freeform com posição absoluta + resize livre, brigando com o
> modelo slot/árvore do Puck em todo lugar). Não é o alvo atual.

## Classificação

### Layout & estrutura

| Funcionalidade | Degrau | Como |
|---|---|---|
| Escolher variante de layout de um bloco (ex: 18 heros) | **1** | campo `select` + `resolveFields` — **FEITO** para o Hero |
| Campos que aparecem/somem conforme a variante/contexto | **1** | `resolveFields` (filtra por `showFor`) — **FEITO** |
| Reordenar / duplicar / deletar blocos | **1** | nativo do Puck |
| Adicionar bloco de um catálogo curado | **1** | `categories` + registry — já existe |
| Colunas / grid dentro de um bloco | **1** | props de layout + render responsivo |
| Arrastar elementos livremente (posição absoluta) | **3+** | briga com o modelo slot; evitar |
| Handles de resize no canvas | **2** | overlay próprio sobre o render do bloco |

### Edição de texto

| Funcionalidade | Degrau | Como |
|---|---|---|
| Editar texto por campo no painel | **1** | campos `text`/`textarea` — já existe |
| Editar texto inline no canvas (contentEditable simples) | **1** | flag `contentEditable` do Puck — só nos campos que NÃO viraram `richText` (ver linha abaixo) |
| **Toolbar de formatação inline** (negrito/itálico/sublinhado/link/código/riscado/highlight/sub/sobrescrito/spoiler/cor/fundo) | **1** (não 2!) | **FEITO** no Hero (eyebrow/título/subtítulo/texto de apoio, todas as variantes) — `<textarea>` do painel (não contentEditable) + toolbar que envolve a seleção com sintaxe própria; `blocks/inline-markup.ts` parseia pra React direto (nunca HTML cru) tanto no preview quanto no build. Rebaixou de Degrau 2 pra 1 exatamente por editar no painel, não inline no canvas — ver decisão registrada no guia do editor |
| Títulos com nível (H1/H2/H3) por elemento | **2** | editor de rich text embutido — ainda não feito |

### Aparência por elemento (o painel "Appearance" do Carrd)

| Funcionalidade | Degrau | Como |
|---|---|---|
| Cor de um elemento (color picker) | **1** | `type:'custom'` field → salva no prop; render aplica via CSS var inline — **FEITO no Hero centered** |
| Fonte por elemento (dropdown) | **1** | `custom` field reusando `FONT_CATALOG`/`FONT_NAMES` de `theme/fonts.ts`; `fontLinksForKeys()` emite `<link>` da fonte escolhida — **FEITO** |
| Tamanho de fonte / peso / espaçamento (sliders) | **1** | `custom` fields numéricos → CSS var inline no render — **FEITO** |
| Alinhamento, largura, padding, margin | **1** | `custom`/`select` fields — **FEITO (alinhamento)** em Hero centered |
| Background por seção (cor / imagem / gradiente) | **1** | `custom` field — **cor FEITA**, imagem/gradiente pra depois |
| Estilo de botão (raio, cor, contorno, hover) | **1** | `custom` fields — **FEITO no Hero centered** |
| ID/classe HTML + CSS customizado por elemento | **1** | `htmlAttrs` field + `css` field (parser inline com allowlist) — **FEITO** |
| **Selecionar sub-elemento** (o `<h1>` dentro do Hero) e estilizar só ele | **2** | clique-no-canvas rola/expande `<details>` do painel — **FEITO (Degrau 1, sem overlay)** |
| Estilizar no canvas (não no painel), direct-manipulation | **2** | overlay próprio + toolbar contextual |

> **Nota de arquitetura pro degrau 1 de aparência:** hoje NENHUM bloco tem
> canal de estilo por-elemento — é tudo tema global via `--brand-*` +
> utilities compiladas. Introduzir estilo por-elemento = novo shape
> `style?` nos props + novos `FieldType` (color/font/size) + render via
> `style`/CSS var inline (utilities Tailwind são pré-compiladas, não
> carregam valor arbitrário de runtime). Espelhar a validação whitelist do
> `buildBrandVars` (regex de hex, catálogo de fontes) pra não virar vetor de
> injeção.

### Mídia

| Funcionalidade | Degrau | Como |
|---|---|---|
| URL de imagem por campo | **1** | campo `url` — já existe |
| Upload / biblioteca de mídia própria | **1–2** | `custom` field simples (1); com uploader + galeria própria (2) |
| Vídeo de fundo / carrossel / parallax (com JS) | **2** | quebra o "zero JS" da produção — exige hidratação pontual (`client:visible`) dessas ilhas; decisão à parte |
| Ícones | **1** | `custom` field (seletor de ícone) |

### Interação & publicação

| Funcionalidade | Degrau | Como |
|---|---|---|
| Animações de entrada por elemento | **2** | metadados nos props + runtime próprio (hidratação) |
| Preview responsivo (desktop/mobile) | **1** | já prototipado em `hero-layouts.html`; no editor, toggle de largura do canvas |
| Publicar / draft / rebuild | **1** | já existe fora do Puck (fluxo `ProjectAdmin` + `needs_rebuild`) |
| SEO por página | **1** | já existe (`resolve_seo()`), fora do Puck |
| Interceptar o clique de seleção do Puck | **3** | patch cirúrgico se a API não expuser o hook |

## Leitura estratégica

- **O grosso da customização de aparência é degrau 1** — dá pra chegar
  longe só com `custom` fields + `resolveFields`, sem tocar no core.
- **O que define o "feeling Carrd" de verdade é degrau 2**: edição inline
  rica de texto e seleção/estilo de sub-elemento no canvas. É construível
  sobre o Puck, mas é um editor próprio por cima — não config.
- **Nada aqui exige fork.** O risco real não é fork-vs-não, é o
  acoplamento profundo a uma lib **pré-1.0**: quanto mais degrau 2, mais dor
  de upgrade. Reavaliar o motor ANTES de investir pesado no degrau 2, não
  depois.

## Estado atual (o que já foi feito)

- **Degrau 1 — variantes de layout do Hero:** campo `Layout` + `resolveFields`
  + 6 variantes (centralizado, dividido, imagem de fundo, tipográfico,
  avatares, cartão de preço). Mecanismo genérico (`variantField`/`showFor` no
  registry) reutilizável por qualquer bloco. Faltam 12 das 18 variantes
  (trabalho repetitivo) + as 3 com JS (vídeo/carrossel/parallax → precisam da
  decisão de hidratação).
