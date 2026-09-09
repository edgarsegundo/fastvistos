# Gerar Primary Image (1200×630) a partir de uma seção do site

## Contexto

Todo `site-config.ts` tem um campo `site.primaryImage` (usado em `og:image`, Twitter Card e
JSON-LD) que precisa de uma imagem **1200×630**. Hoje, quando um site novo é criado pelo
`create-site.js`, esse campo fica apontando para o placeholder herdado do template
(`home-page-main-image-fastvistos-mulher-passaporte.webp`) — ver aviso em
[`⭐ README-multi-site-starting-a-new-site.md`](./⭐%20README-multi-site-starting-a-new-site.md).

Este documento registra **como a primary image do site `contratar` foi gerada manualmente**
(setembro/2026, a partir do componente `ContratarParaEmpresas.astro`) e propõe o desenho de um
script (`generate-primary-image.js`, ainda não implementado) para automatizar esse processo em
qualquer site novo.

## O que foi feito manualmente (receita de referência)

Objetivo: transformar uma seção da landing page (`ContratarParaEmpresas.astro`) numa imagem
estática 1200×630, com fundo real, logo da marca, e **sem** o botão de CTA (que não faz sentido
numa imagem estática de compartilhamento).

### Ferramentas usadas (CLI, via Homebrew)

| Ferramenta | Uso | Instalar |
|---|---|---|
| `rsvg-convert` | Renderiza SVG → PNG num tamanho exato | `brew install librsvg` |
| `cwebp` | Converte PNG → WebP (formato usado no site) | `brew install webp` |
| `dwebp` | Converte WebP → PNG (para poder embutir/editar) | vem junto com `webp` |
| `python3` | Pequenos scripts de texto (extrair/limpar SVG) | já vem no macOS |

### Passo a passo

1. **Ler o componente-fonte** (`ContratarParaEmpresas.astro`) para extrair o copy real: headline
   (`h2`), subtítulo, itens da lista, texto do banner "grátis", tagline — em vez de inventar texto,
   usei exatamente o que já existe na seção.
2. **Montar um SVG do zero** (1200×630) reproduzindo o layout da seção (coluna de headline à
   esquerda + card glassmorphism à direita), usando `<text>`, `<tspan>`, `<rect>` e um `<symbol>`
   reutilizável para o ícone de check — sem depender de screenshot de navegador.
3. **Baixar a imagem de fundo real** já usada no ecossistema
   (`https://empregoaqui.com.br/assets/images/v2/emprego-aqui-empresas-bg-secao.webp`) com `curl`,
   converter para PNG com `dwebp` (SVG não referencia `.webp` diretamente) e **embutir como
   `data:image/png;base64,...`** dentro de uma tag `<image>` — evita problemas de carregamento de
   arquivo externo pelo `rsvg-convert`.
4. **Calcular o "cover" manualmente**: a foto de origem era 1400×791; para cobrir 1200×630 sem
   distorcer, escalei pela largura (`1200/1400 = 0.857`) e apliquei o mesmo fator na altura
   (`791×0.857 ≈ 678`), depois recortei o excesso vertical centralizando (`y = -(678-630)/2 = -24`)
   dentro de um `<clipPath>` do tamanho do canvas.
5. **Aplicar um overlay escuro em gradiente** (`linearGradient`, mais opaco à esquerda onde fica o
   texto, mais transparente à direita) — mesma lógica do `.b2b__overlay` do componente original,
   pra garantir contraste do texto sobre a foto.
6. **Embutir o logo real da marca**: abri `public/contratar/assets/images/logo/contrataraqui-logo.svg`,
   extraí só o conteúdo interno (removendo `<?xml?>`, `<sodipodi:namedview>` e atributos
   `sodipodi:*`, que quebram o parser XML quando aninhados sem o namespace declarado), e colei como
   `<svg>` aninhado (`viewBox` original + `x`/`y`/`width`/`height` novos) no lugar de um texto
   "ContratarAqui" que eu tinha usado numa primeira versão.
7. **Omitir o bloco do botão CTA** (rect + text "Quero contratar agora") — pedido explícito do
   usuário, já que a imagem é estática e não tem para onde clicar.
8. **Renderizar**: `rsvg-convert -w 1200 -h 630 origem.svg -o saida.png`.
9. **Converter para WebP**: `cwebp -q 90 saida.png -o saida.webp` (qualidade 90 deu ~68KB, bom
   equilíbrio tamanho/nitidez para uma imagem com foto + texto).
10. **Salvar nos dois lugares certos**:
    - Fonte editável (`.svg`): `multi-sites/sites/<siteId>/docs/images/<siteId>-primary-image.svg`
    - Arquivo final servido (`.webp`): `public/<siteId>/assets/images/home/home-page-main-image-<siteId>-<slug>.webp`
11. **Atualizar `site-config.ts`**: troquei a `url` em **4 lugares** que referenciam a mesma imagem
    de fallback — `site.primaryImage`, `homePageConfig.seo.openGraph.image`,
    `privacyPolicyPageConfig.seo.openGraph.image`, `termsOfUsePageConfig.seo.openGraph.image`.

### Limitações desta abordagem (SVG manual)

- **Fontes**: `rsvg-convert` usa as fontes instaladas no sistema operacional, não as fontes web da
  marca (ex.: "Plus Jakarta Sans" do `theme.css`). Por isso usei `Arial, sans-serif` — visualmente
  parecido, mas não é pixel-perfect com o site real.
- **Copy manual**: o texto foi lido e copiado à mão do `.astro`. Um parser automático de JSX/Astro
  é frágil (texto pode estar em variáveis JS, quebrado em `<br>`, etc.).
- **Layout manual**: recriei o layout "de olho", calculando coordenadas x/y na mão — não é uma
  extração 1:1 do componente real, é uma reinterpretação fiel ao design.

## Proposta: script `generate-primary-image.js`

Ideia: um wizard interativo (mesmo padrão do `create-site.js`, usando `readline`/`prompts`) que
faz perguntas simples e roda o pipeline acima automaticamente.

### Perguntas do wizard

1. **Qual site?** (`siteId`) — valida que existe `multi-sites/sites/<siteId>/`.
2. **Qual seção/componente usar como base?** — lista os arquivos `.astro` de
   `multi-sites/sites/<siteId>/components/` e deixa escolher (ex.: `ContratarParaEmpresas.astro`),
   ou aceita um componente por título ("Hero", "Para Empresas", "Como Funciona").
3. **Manter imagem de fundo?** (sim/não)
   - Se sim: **de onde?** — detectar automaticamente a imagem de `background-image` usada no
     `<style>` do componente escolhido (regex simples em `url\(['"]?([^'")]+)['"]?\)`), com opção de
     sobrescrever com outra URL/path.
4. **Incluir logo da marca?** (sim/não)
   - Se sim: localizar automaticamente em
     `public/<siteId>/assets/images/logo/*logo*.svg` (pega o primeiro `.svg` que bater no glob;
     se houver mais de um, listar e perguntar qual).
5. **Incluir botão de CTA?** (sim/não) — se não, pular geração do bloco de botão mesmo que exista
   no componente-fonte.
6. **Headline/subtítulo**: extrair automaticamente do primeiro `<h1>`/`<h2>` e `<p>` do componente
   (regex ou um parser simples de Astro), **mostrar pro usuário e pedir confirmação/edição** antes
   de gerar — não confiar 100% na extração automática (JSX pode ter `{variáveis}` ou `<br>` no meio
   do texto).

### Pipeline técnico (reaproveitando o que já foi validado manualmente)

```
1. Ler o componente .astro escolhido (fs.readFileSync)
2. Extrair headline/subtítulo/lista de bullets (regex simples + confirmação manual no terminal)
3. Se manter bg=true:
     - resolver a URL/path da imagem
     - baixar (se URL remota, via curl/fetch) ou copiar (se já local em public/)
     - se for .webp, converter pra .png com `dwebp` (spawn de processo)
     - calcular fator de "cover" (comparar aspect ratio da imagem vs. 1200x630) e computar x/y/width/height
     - converter pra base64 e montar a tag <image>
4. Se logo=true:
     - localizar o .svg do logo
     - extrair conteúdo interno (remover <?xml?>, sodipodi:namedview, atributos sodipodi:*)
     - montar o <svg> aninhado
5. Montar o SVG final a partir de um TEMPLATE (string com placeholders {{BG_IMAGE}}, {{LOGO}},
   {{HEADLINE_LINES}}, {{SUBTITLE_LINES}}, {{CTA_BLOCK}} condicional)
6. Salvar o .svg fonte em multi-sites/sites/<siteId>/docs/images/
7. spawn: rsvg-convert -w 1200 -h 630 <svg> -o <tmp.png>
8. spawn: cwebp -q 90 <tmp.png> -o <final.webp>
9. Salvar em public/<siteId>/assets/images/home/home-page-main-image-<siteId>-<slug>.webp
10. Perguntar: "Atualizar site-config.ts automaticamente?" (sim/não)
      - se sim: regex/AST replace nas 4 ocorrências de site.primaryImage e dos 3 openGraph.image
```

### Estrutura de arquivos (convenção a manter)

- Fonte editável: `multi-sites/sites/<siteId>/docs/images/<siteId>-primary-image.svg`
- Arquivo final: `public/<siteId>/assets/images/home/home-page-main-image-<siteId>-<descrição-curta>.webp`

### Alternativa mais fiel: screenshot real via Playwright/Puppeteer

A abordagem de montar o SVG na mão é rápida e não exige dependências pesadas, mas **não é
pixel-perfect** (fontes diferentes, layout reinterpretado). Uma alternativa mais fiel — a ser
avaliada antes de implementar — é:

1. Rodar o site em modo dev (`npm run dev:watch:<siteId>`) ou renderizar só o componente isolado
   numa página HTML temporária que importa o `theme.css` real do site.
2. Abrir essa página com **Playwright/Puppeteer** num viewport de `1200x630`.
3. Tirar um screenshot (`page.screenshot()`) da seção exata (`element.screenshot()` no componente).
4. Converter o PNG resultante pra `.webp` com `cwebp` (mesmo passo final de hoje).

**Trade-off**: Playwright/Puppeteer precisa baixar um binário de navegador (~300MB), o que é peso
extra no repo/CI, mas dá 100% de fidelidade visual (fontes reais, CSS real, imagens reais sem
recalcular "cover" na mão). Vale decidir isso **antes** de implementar o script — se a fidelidade
visual pixel-perfect for prioridade, vale o peso extra; se "parecido o suficiente" já resolve, o
caminho SVG manual (mais leve, zero dependência de browser) é suficiente.

## Resumo rápido (TL;DR para quem for implementar)

- Hoje: processo 100% manual, documentado passo a passo acima.
- Próximo passo sugerido: escolher entre (a) template SVG + `rsvg-convert`/`cwebp` (leve, "quase
  fiel") ou (b) Playwright/Puppeteer (pesado, 100% fiel) — depois implementar o wizard de perguntas
  descrito acima em `generate-primary-image.js`, seguindo o mesmo padrão de UX do `create-site.js`.
