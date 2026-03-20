# Tailwind CSS v4 com Astro — Guia de Referência

Este projeto usa Tailwind v4.

---

## O que mudou no v4

No Tailwind v4, o arquivo `tailwind.config.js` foi **abandonado**. Toda a configuração agora é feita diretamente no CSS via `@theme`, dentro do arquivo `global.css`.

| v3 | v4 |
|---|---|
| `tailwind.config.js` | `@theme` no `global.css` |
| `theme.extend.colors` | `--color-*` |
| `theme.extend.fontFamily` | `--font-*` |
| `theme.extend.animation` | `--animate-*` |
| `content: [...]` | automático |

> No v4 o `content: [...]` não existe mais — o Tailwind detecta os arquivos automaticamente. Com isso, o `tailwind.config.js` inteiro foi abandonado.

---

## Configuração no astro.config.mjs

O plugin é o `@tailwindcss/vite`, sem nenhum parâmetro:

```js
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    vite: {
        plugins: [
            tailwindcss(), // sem parâmetros, sem config
        ],
    },
});
```

> ❌ Não passe `config: './tailwind.config.js'` — é ignorado no v4.

---

## As 4 camadas do CSS (`global.css`)

### Como funciona o `@layer`

`@layer` é um recurso do CSS nativo que define prioridade entre grupos de estilos, independente da ordem física no arquivo.

```
base → components → utilities
```

Quem está mais à direita sempre vence em conflito. `utilities`, `components` e `base` são só os nomes que o Tailwind escolheu para esses grupos — poderiam se chamar qualquer coisa.


Resultado prático: imagine que `.gradient` define `color: blue` e você adiciona `text-white` no HTML:
```html
<div class="gradient text-white">...</div>
```

`text-white` sempre ganha — não porque é do Tailwind, mas porque está no grupo `utilities`, que tem prioridade sobre `components`. Não importa a ordem no arquivo.


---

### `@theme` — cores e fontes da marca

Use `@theme` para criar cores que não existem no Tailwind por padrão. O caso mais comum é definir as cores da marca do projeto. Cada variável `--color-*` vira automaticamente uma classe utilitária (`bg-*`, `text-*`, `border-*`, `ring-*` etc.).

```css
@import 'tailwindcss';

@theme {
  /* Cores da marca — não existem no Tailwind por padrão */
  --color-primary-500: #3b95fa;    /* vira bg-primary-500, text-primary-500, etc. */
  --color-secondary-500: #ff7900;
  --color-custom-dark: #e2532b;

  /* Sobrescreve variáveis que já existem no Tailwind.
     --font-sans já existe mas aponta para fontes do sistema.
     Redefinindo aqui, toda classe font-sans passa a usar sua fonte. */
  --font-sans: 'Source Sans Pro', ui-sans-serif, system-ui, sans-serif;
}
```

**Regras do `@theme`:**
- Declare quando quiser **criar** algo que não existe no Tailwind (`primary`, `secondary`, `custom-dark`)
- Declare quando quiser **substituir** algo que já existe (`--font-sans`, `--color-blue-500`)
- Só declare o que você **realmente usa** — não copie tudo do config antigo

---

### `@layer base` — reset e estilos globais

Estilos aplicados diretamente em elementos HTML (`html`, `body`, `*`, `h1`...) — sem classes, sem seletores customizados. São os comportamentos base do site que valem para tudo. A fonte saiu daqui porque agora vive no `@theme`, mas `box-sizing`, `scroll-behavior`, `margin`, `line-height` continuam fazendo sentido aqui — são resets e defaults globais que não pertencem a nenhum componente específico.

```css
@layer base {
    * {
        box-sizing: border-box;
    }
    html {
        scroll-behavior: smooth;
    }
    body {
        margin: 0;
        padding: 0;
        line-height: 1.6;
    }
}
```

---

### `@layer components` — classes reutilizáveis

Classes que você inventa e que agrupam várias propriedades CSS. Use quando uma combinação de estilos se repete em mais de um lugar e faz sentido ter um nome. Uma classe component descreve **o que é**.

O caso mais comum é um botão com estilo próprio:
```css
@layer components {
    .btn-primary {
        background-color: var(--color-primary-500);
        color: white;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        font-weight: 600;
    }
}
```

Exemplo de uso:

```html
<!-- A classe utilitária text-sm sempre sobrescreve o font-size do .btn-primary -->
<button class="btn-primary text-sm">Enviar</button>
```

Em vez de repetir essas 5 propriedades em cada botão do projeto, você centraliza em `.btn-primary` e ainda pode sobrescrever qualquer propriedade individualmente com classes utilitárias do Tailwind diretamente no HTML.
---

### `@layer utilities` — classes atômicas

Classes de propósito único, exatamente como as do próprio Tailwind (`bg-red-500` = só muda background). Uma utility descreve **o que faz** (`.text-brand-primary`, `.fill-current`). Por estarem no grupo de maior prioridade, sempre sobrescrevem classes de `components` e `base`.

```css
@layer utilities {
    .text-brand-primary {
        color: #1b375c !important;
    }
}
```

---

## Como usar as cores no HTML/Astro

O Tailwind v4 converte automaticamente `--color-*` em classes utilitárias:

```html
<div class="bg-custom-dark text-white">...</div>
<div class="bg-primary-500 text-secondary-500">...</div>
<button class="border-primary-700 hover:bg-primary-800">...</button>
```

Uma variável `--color-primary-500` gera todas essas variantes automaticamente:
- `bg-primary-500` — background
- `text-primary-500` — cor do texto
- `border-primary-500` — borda
- `ring-primary-500` — outline/ring
- `fill-primary-500` — SVG fill
- `stroke-primary-500` — SVG stroke

---

## Boa prática: referencie as variáveis do @theme no CSS

Em vez de hardcodar hex no `@layer components`, use as variáveis:

```css
/* ❌ Evite: */
color: #ff7900;

/* ✅ Prefira: */
color: var(--color-secondary-500);
```

Assim, se você mudar a cor no `@theme`, muda em todo o projeto de uma vez.

---

## Checklist rápido

- [ ] `@import 'tailwindcss'` no topo do `global.css`
- [ ] `@theme { }` logo abaixo com as cores/fontes da marca
- [ ] `tailwindcss()` no `vite.plugins` do `astro.config.mjs` (sem parâmetros)
- [ ] Cores hardcoded no CSS substituídas por `var(--color-*)`
- [ ] Usar classes normalmente: `bg-primary-500`, `text-custom-dark`, etc.