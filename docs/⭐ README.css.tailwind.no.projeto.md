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

## O que pode ser deletado

| Arquivo | Pode deletar? |
|---|---|
| `tailwind.config.js` | ✅ Sim |
| `tailwind.*.config.js` | ✅ Sim |

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

## Estrutura de arquivos CSS

Este projeto usa dois arquivos CSS com responsabilidades distintas:

```
multi-sites/core/styles/global.css                    → 🚨 AUTO-GENERATED. NÃO EDITAR.
                                                         Reset, @layer base e componentes
                                                         compartilhados entre todos os sites.
                                                         Alterações serão sobrescritas pelo script.

multi-sites/sites/{seu-site}/styles/theme.css         → Customizações deste site específico.
                                                         Cores da marca, fontes, componentes
                                                         e utilities específicos do projeto.
                                                         ESTE é o arquivo para editar.
```

**Regra geral:**
- Mudança vale para **todos os sites** → `global.css` (mas lembre que é AUTO-GENERATED)
- Mudança é **específica deste site** → `theme.css`

---

## Layouts e imports obrigatórios

O projeto tem 3 layouts base em `multi-sites/core/layouts/`:

```
SharedBlogLayout.astro
SharedGenericLayout.astro
SharedHomeLayout.astro
```

Todos os layouts devem importar os dois arquivos CSS, **sempre nesta ordem** — `global.css` primeiro, `theme.css` depois:

```astro
// Design system global: reset de elementos HTML via @layer base, e componentes
// compartilhados via @layer components. NÃO EDITAR — é AUTO-GENERATED.
import '../styles/global.css';

// Customizações deste site: sobrescreve ou estende o global.css com cores da marca,
// fontes, componentes e utilities específicos deste projeto.
// Edite este arquivo para personalizar a identidade visual do site.
import '../styles/theme.css';
```

> ⚠️ Se criar um novo layout, lembre de adicionar esses dois imports. Sem eles o Tailwind e as variáveis da marca não funcionam.

> ⚠️ A ordem importa — `global.css` sempre antes do `theme.css`, pois o `theme.css` sobrescreve variáveis do `global.css`.

---

## As 4 camadas do CSS

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

> ⚠️ Cuidado ao definir `background-color` ou `color` no `@layer base` — qualquer classe Tailwind no elemento (como `bg-gray-50` no `body`) vai sobrescrever, porque utilities sempre ganham de base.

---

### `@theme` — cores e fontes da marca

Use `@theme` para criar cores que não existem no Tailwind por padrão. O caso mais comum é definir as cores da marca do projeto. Cada variável `--color-*` vira automaticamente uma classe utilitária (`bg-*`, `text-*`, `border-*`, `ring-*` etc.).

No `global.css` o `@theme` tem apenas defaults genéricos. As cores da marca ficam no `theme.css` de cada site:

```css
/* theme.css */
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

Você pode ter múltiplos blocos `@theme` em arquivos diferentes — o Tailwind junta tudo. O que estiver no `theme.css` tem prioridade sobre o `global.css`.

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

## `global.css` vs `<style>` local no Astro

`global.css` é só para o que é **compartilhado** entre várias páginas ou componentes. Para estilos específicos de uma página ou componente, use o `<style>` do próprio arquivo `.astro` — o Astro faz o scoping automático, o CSS fica isolado e não vaza para o resto do projeto.

```astro
<div class="hero">...</div>

<style>
    /* Específico desta página — fica aqui, não no global.css */
    .hero {
        background: linear-gradient(...);
        min-height: 100vh;
    }
</style>
```

Para estilos simples e específicos, use Tailwind direto no HTML. Crie uma classe local quando são muitas propriedades ou tem seletores complexos (`::before`, `@keyframes`, seletores de irmão/filho).

```astro
<!-- Poucos estilos: Tailwind direto -->
<div class="bg-primary-500 text-white p-4 rounded-lg">...</div>

<!-- Muitas propriedades ou seletores complexos: classe local -->
<div class="hero">...</div>
```

---

## `<style>` local vs `is:global` no Astro

Por padrão, o `<style>` no Astro faz scoping automático — o CSS fica isolado no componente e não afeta nada fora dele, nem os componentes filhos.

```astro
<style>
    /* Só afeta elementos DESTE arquivo */
    .hero { min-height: 100vh; }
</style>
```

O `is:global` remove esse scoping — o CSS vaza para fora e afeta o projeto todo a partir do nível em que está.

```astro
<style is:global>
    /* Afeta QUALQUER elemento do projeto, incluindo componentes filhos */
    .home-layout p { color: #1b375c; }
</style>
```

**Quando usar `is:global`:** quando você precisa estilizar elementos dentro de componentes filhos. Um `<style>` normal no `index.astro` não atravessa o HTML de `<HeroSection>` ou `<Navigation>` — o `is:global` é necessário nesses casos.

**Quando não usar:** se o estilo é só para elementos do próprio arquivo, use `<style>` normal. Se precisa ser compartilhado entre várias páginas, mova para o `global.css`.

| | Escopo |
|---|---|
| `<style>` | Só o componente atual |
| `<style is:global>` | Todo o projeto, incluindo filhos |
| `import 'arquivo.css'` no frontmatter | Sempre global — nunca tem scoping |
| `global.css` | Todo o projeto |

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

## `markdown-blog.css` — estilos do conteúdo gerado a partir de `.md`

Este arquivo é **AUTO-GENERATED** e copiado para cada site pelo script. Ele contém as classes
específicas para estilizar o conteúdo gerado pelo pipeline de artigos a partir de arquivos `.md`.

> ⚠️ Não edite este arquivo — as alterações serão sobrescritas pelo script.

As classes seguem o padrão `.blog-content *` para evitar conflito com o resto do site:
```css
.blog-content h2 { ... }
.blog-content p { ... }
.blog-content ul { ... }
```

É importado diretamente no frontmatter do template de post:
```astro
import '../../styles/markdown-blog.css';
```

Para customizar o estilo dos artigos de um site específico, sobrescreva as classes
no `theme.css` do site:
```css
/* theme.css */
@layer components {
    .blog-content p {
        font-size: 1.2rem; /* sobrescreve o markdown-blog.css */
    }
}
```

## Checklist rápido

- [ ] `@import 'tailwindcss'` no topo do `global.css`
- [ ] Cores e fontes da marca declaradas no `theme.css` do site via `@theme`
- [ ] `tailwindcss()` no `vite.plugins` do `astro.config.mjs` (sem parâmetros)
- [ ] `tailwind.config.js` deletado — não é necessário no v4
- [ ] `global.css` e `theme.css` importados em todos os layouts (nessa ordem)
- [ ] Novos layouts criados com os dois imports obrigatórios
- [ ] Cores hardcoded no CSS substituídas por `var(--color-*)`
- [ ] Usar classes normalmente: `bg-primary-500`, `text-custom-dark`, etc.