# Melhorias Sugeridas — CSS do site `emprego`

Revisão das modificações feitas em `styles/theme.css` e `pages/index.astro` contra o padrão de
[`docs/⭐ README.css.tailwind.no.projeto.md`](../../../../docs/⭐%20README.css.tailwind.no.projeto.md).

Lista apenas o que tem **impacto real** (regressão visual, fragilidade de arquitetura ou
inconsistência de cascata) — não inclui ajustes cosméticos triviais.

---

## 🔴 1. Regressão visual: títulos perderam a fonte Bricolage Grotesque

**Onde:** [`pages/index.astro`](../pages/index.astro) linhas 53 e 61 (os `<h2>` "Porque o emprego aqui é diferente?" e "EMPRESAS").

No código original esses títulos usavam **Bricolage Grotesque**:
```html
<h2 style="font-family: 'Bricolage Grotesque', sans-serif !important; ...">
```

Na refatoração eles passaram a usar `class="font-title"`, que mapeia para **Poppins**
(`--font-title` no `theme.css`). Ou seja, **a aparência dos títulos mudou** silenciosamente
de Bricolage para Poppins.

Além disso, Bricolage Grotesque **continua sendo baixada** no `<link>` do Google Fonts
([index.astro](../pages/index.astro) linha 37) mas **não é mais usada por ninguém** — peso morto.

**Decisão necessária:**
- Se o design pede Bricolage nos títulos → adicionar `--font-heading: 'Bricolage Grotesque', sans-serif;`
  no `@theme` e trocar `font-title` por `font-heading` nesses `<h2>`.
- Se Poppins é intencional → **remover** `Bricolage+Grotesque` do `<link>` do Google Fonts.

> Não dá pra ficar no meio do caminho: hoje a fonte é carregada mas ignorada, e o visual
> diverge do original.

---

## 🔴 2. Variável que o `global.css` espera não está definida (`--color-bg-dark`)

**Onde:** [`styles/theme.css`](../styles/theme.css) `@theme` + `@layer base`.

O `global.css` (auto-gerado, **não editável**) tem o reset do `body` referenciando três variáveis:
```css
/* global.css — linha 45-52 */
body {
    color: var(--color-text-main);
    font-family: var(--font-sans);
    background-color: var(--color-bg-dark);   /* ← esperada pelo global.css */
}
```

O `theme.css` atual **não define `--color-bg-dark`** — inventou `--color-bg-page` no lugar — e,
para compensar, **re-declara o `body` inteiro** dentro de `@layer base`.

O resultado funciona (o `body` do `theme.css` sobrescreve o do `global.css`), mas é frágil e
contraria o README, que diz: *"@layer base — use apenas para sobrescrever o reset do global.css,
**só se necessário**"*.

**Sugestão (alinha com o padrão):** em vez de re-declarar o `body`, **definir no `@theme` as
variáveis que o `global.css` já consome**, deixando o reset auto-gerado fazer o trabalho:
```css
@theme {
  --color-text-main: #1f2937;   /* já existe */
  --color-bg-dark: #F3F4F6;     /* renomear --color-bg-page para o nome que o global.css usa */
  --font-sans: 'Roboto', ui-sans-serif, system-ui, sans-serif;  /* já existe */
  /* ... demais cores/fontes da marca ... */
}
```
Assim o `@layer base` do `theme.css` fica só com o que **realmente** precisa sobrescrever
(ex: `background` via `var(--color-bg-dark)` se quiser, ou nada), e não há variável órfã.

---

## 🟠 3. `style="font-size"` inline ainda compete com o `@layer base`

**Onde:** [`pages/index.astro`](../pages/index.astro) linhas 54, 62 (`font-size: 28px`) e 76 (`font-size: 20px`).

O `@layer base` do `theme.css` define `h2 { font-size: clamp(1.4rem, 4vw, 1.9rem) }`, mas esses
`<h2>` forçam `28px` via `style=""` inline — duas fontes de verdade concorrendo para a mesma
propriedade. O README pede Tailwind direto no HTML para casos simples.

**Sugestão:** trocar o `style="font-size: 28px"` por utilitário Tailwind (`text-[28px]` ou um passo
da escala como `text-3xl`) e o `font-size: 20px` por `text-xl`. Elimina o inline e deixa a cascata
previsível.

---

## 🟠 4. Nomes de cor que atritam com o Tailwind / ficam redundantes

**Onde:** [`styles/theme.css`](../styles/theme.css) `@theme`.

- `--color-neutral-dark` → gera `text-neutral-dark`. O Tailwind v4 **já tem a paleta `neutral`**
  nativa (`neutral-50`…`neutral-950`); criar `neutral-dark` confunde quem lê o HTML e pode parecer
  um shade da paleta nativa. Sugestão: renomear para algo inequívoco, ex: `--color-ink` → `text-ink`.
- `--color-bg-card` → gera `bg-bg-card` (o "bg" aparece duas vezes). Sugestão: `--color-card` →
  `bg-card`.

> É só renomear a variável no `@theme` e atualizar as classes correspondentes no `index.astro`
> (`bg-bg-card` → `bg-card`, `text-neutral-dark` → `text-ink`).

---

## ✅ O que já está correto (não mexer)

- `<style is:global>` da página esvaziado — ✔ conforme o padrão do `revistadoturismo`.
- `<link>` de fontes movido para dentro de `<Fragment slot="head">` — ✔ garante que cai no `<head>`
  (inclusive mais correto que o site de referência, que deixa o `<link>` solto antes do layout).
- Componentes (`.btn-cta`, `.btn-whatsapp`, `.kicker`, `.deck`) em `@layer components` usando
  `var(--color-*)` em vez de hex — ✔ segue a boa prática de "referencie as variáveis do `@theme`".
- Cores da marca centralizadas no `@theme` do `theme.css` — ✔.

---

## Resumo de prioridade

| # | Item | Tipo | Ação |
|---|---|---|---|
| 1 | Bricolage Grotesque nos títulos | Regressão visual | Decidir: restaurar Bricolage **ou** remover do `<link>` |
| 2 | `--color-bg-dark` não definida | Fragilidade de arquitetura | Definir vars no `@theme`, parar de re-declarar `body` |
| 3 | `style="font-size"` inline | Inconsistência de cascata | Trocar por utilitário Tailwind |
| 4 | `neutral-dark` / `bg-bg-card` | Nomenclatura | Renomear para `ink` / `card` |
