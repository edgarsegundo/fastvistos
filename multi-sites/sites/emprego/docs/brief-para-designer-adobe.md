# Brief para o Designer — Emprego Aqui Landing Page

Este documento descreve **o que precisamos receber** do designer para converter o layout do Adobe diretamente para o padrão Tailwind CSS v4 usado neste projeto.

---

## Como funciona o nosso sistema de estilos

Para facilitar a conversão, precisamos que as entregas sigam um padrão que se encaixa direto na nossa estrutura:

- **Cores** → viram variáveis CSS no arquivo `theme.css` (ex: `--color-cta: #37D315`)
- **Fontes** → viram variáveis CSS e classes Tailwind (ex: `font-title`, `font-body`)
- **Componentes** → viram classes CSS reutilizáveis (ex: `.btn-cta`, `.card-empresa`)
- **Layout** → HTML por seção com classes semânticas, sem `style=""` inline

---

## 1. Paleta de Cores

Precisamos de **todas as cores** usadas no design organizadas por papel semântico. Entregar como tabela:

| Papel semântico | Hex | Observações |
|---|---|---|
| Fundo da página | | cor do background geral |
| Texto principal | | cor do body text |
| Texto de título | | pode ser igual ou diferente do texto principal |
| Cor primária / destaque | | cor mais usada para elementos de marca |
| Botão CTA (call-to-action) | | cor do botão principal |
| Botão CTA — hover | | cor ao passar o mouse |
| Fundo de card / painel | | fundo das caixas/cards |
| Borda | | cor de bordas e separadores |
| WhatsApp | | se usar o verde do WhatsApp |
| WhatsApp dark | | versão mais escura do verde |
| Outros (listar) | | qualquer outra cor relevante |

> **Importante:** para cada cor, informar o hex exato (ex: `#37D315`), não nome aproximado ("verde claro").

---

## 2. Tipografia

Para cada família tipográfica usada no design:

### 2.1 Fontes utilizadas

| Papel | Família | Fonte (Google Fonts?) | Pesos usados |
|---|---|---|---|
| Títulos (h1, h2) | | | ex: 700, 800 |
| Subtítulos (h3, h4) | | | ex: 600 |
| Corpo de texto (p) | | | ex: 400, 500 |
| Botões e links | | | ex: 600 |
| Labels / kickers | | | ex: 600 |

> Se as fontes estiverem no Google Fonts, enviar o link completo com todos os pesos, ex:
> `https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap`

### 2.2 Escala tipográfica

| Elemento | Tamanho (px) | Peso | Line-height | Letter-spacing |
|---|---|---|---|---|
| h1 | | | | |
| h2 | | | | |
| h3 | | | | |
| Parágrafo / body | | | | |
| Label / kicker | | | | |
| Botão | | | | |
| Caption / small | | | | |

> Indicar se algum tamanho muda entre mobile e desktop (responsive).

---

## 3. Componentes — HTML + CSS separados

Para cada componente, precisamos receber o **HTML com classes semânticas** e o **CSS separado** (sem `style=""` inline com hex).

### Componentes que precisamos:

- [ ] **Botão CTA principal** (ex: "Procurar candidatos")
- [ ] **Botão WhatsApp** (se houver)
- [ ] **Card / painel** (o card de "EMPRESAS" com bordas e sombra)
- [ ] **Navegação / header**
- [ ] **Hero section** (incluindo fundo, posicionamento de texto e imagem/vídeo)
- [ ] **Item de "Como funciona"** (ícone + título + descrição)
- [ ] **Item de "Por que somos diferentes"** (cada vantagem/feature)
- [ ] **Footer**
- [ ] Outros componentes que o design incluir

### Formato de entrega por componente:

```html
<!-- HTML — use nomes de classe semânticos -->
<a class="btn-cta" href="#">Procurar candidatos</a>
```

```css
/* CSS — use os nomes de cor da paleta, não hex direto */
.btn-cta {
  background-color: [COR_CTA];   /* ex: #37D315 */
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.btn-cta:hover {
  background-color: [COR_CTA_HOVER];
}
```

> Referenciar as cores pelo papel semântico da seção 1, não repetir hex em cada lugar.

---

## 4. Estrutura da Página

Precisamos do HTML da página inteira organizado **por seção**, anotado com o que muda em cada breakpoint.

### Breakpoints do projeto:

| Nome | Largura mínima |
|---|---|
| Mobile | 0px (default) |
| Tablet (sm) | 640px |
| Desktop (md) | 768px |
| Desktop largo (lg) | 1024px |

### Para cada seção, indicar:

- Nome da seção (ex: `hero`, `how-it-works`, `empresas`, `footer`)
- Max-width do container e paddings laterais em cada breakpoint
- O que muda entre mobile e desktop (layout, tamanho de fonte, visibilidade de elementos)
- Ordem dos elementos (em mobile pode mudar em relação ao desktop)

**Exemplo de anotação esperada:**

```
SEÇÃO: hero
- Mobile: texto acima, vídeo abaixo, padding lateral 1rem
- Desktop: texto à esquerda (50%), vídeo à direita (50%), padding 2rem
- Container max-width: 1200px, centralizado
```

---

## 5. Imagens e Assets

### Formatos aceitos (em ordem de preferência):

1. **AVIF** — melhor compressão
2. **WebP** — boa compressão, suporte amplo
3. **PNG** — para imagens com transparência
4. **SVG** — para ícones e logos

### Para cada asset, precisamos:

| Asset | Formato | Dimensões mobile | Dimensões desktop | Fundo transparente? |
|---|---|---|---|---|
| Logo | SVG ou PNG | — | — | Sim |
| Hero background / vídeo | MP4 + WebP poster | 390×844 | 1280×720 | — |
| Imagem hero | AVIF/WebP | 390px largura | 640px largura | Não |
| Ícones (how-it-works, etc.) | SVG | — | — | Sim |
| Outros | | | | |

### Convenção de nome de arquivo:

- Sem espaços, sem acentos, sem caracteres especiais
- Formato kebab-case: `hero-banner-desktop.avif`, `icone-vaga.svg`
- Indicar variante: `-mobile`, `-desktop`, `-hover` quando relevante

---

## 6. O que NÃO precisamos que o designer entregue

Para agilizar a conversão, o designer **não precisa**:

- ❌ Configurar Tailwind CSS ou criar arquivos de configuração
- ❌ Usar `style=""` com hex fixo direto no HTML (ex: `style="color: #232320"`)
- ❌ Usar `!important` nos estilos
- ❌ Criar arquivos `.js` ou configurações de build
- ❌ Entregar em formato de framework específico (React, Vue, etc.) — HTML puro é suficiente
- ❌ Criar classes Tailwind diretamente — vamos fazer a conversão no nosso lado

---

## 7. Checklist de entrega

- [ ] Paleta de cores completa com hex e papel semântico (seção 1)
- [ ] Tabela de tipografia com fontes, pesos e tamanhos (seção 2)
- [ ] Link Google Fonts com todos os pesos necessários
- [ ] HTML + CSS de cada componente (seção 3)
- [ ] HTML da página completa anotado por seção com breakpoints (seção 4)
- [ ] Assets em AVIF/WebP/SVG com nomes kebab-case (seção 5)
- [ ] Dimensões de cada asset por breakpoint

---

## Referência: mapeamento para o nosso código

Quando recebermos a entrega, vamos converter assim:

```
Cor do designer          → @theme { --color-[nome]: [hex]; }     no theme.css
Fonte do designer        → @theme { --font-[papel]: '[família]'; }  no theme.css
Estilo de elemento HTML  → @layer base { h1 { ... } }             no theme.css
Componente reutilizável  → @layer components { .btn-cta { ... } } no theme.css
Classe de uso único      → @layer utilities { .text-brand { ... } } no theme.css
Classes no HTML          → class="bg-cta text-white font-title"   direto no .astro
```
