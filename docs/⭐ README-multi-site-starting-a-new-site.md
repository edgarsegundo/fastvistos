# Starting a New Site

## antes precisa criar business e usuario e profile no microservices

## Aqui preciso melhorar a copia de um template que funcione e já atualizar o arquivo site-config.ts

## precisa ajeitar o faq e inclusive no fastvistos está fixo na parte que cria o ld+json e precisa puxar do banco

## **🆕 Create a New Site**

```bash
node create-site.js


Creating the main homepage image, see guidelines. The first image I created for fastvistos and serves as an example can be found [here](multi-sites/sites/fastvistos/docs/images/home-page-main-image.svg)

After creating the main image, put at `public/[SITEID]/assets/images/logo/`. Put a name on the image that describe the image.

For ex:

public/[SITEID]/assets/images/logo/home-page-main-image-fastvistos-mulher-passaporte.webp


| Property                     | Recommended Value / Rule                             |
| ---------------------------- | ---------------------------------------------------- |
| **Format**                   | `.png`, `.jpg`, or `.webp`                           |
| **Size (min)**               | 1200 × 628 px (Google Discover & social cards)       |
| **Aspect ratio**             | Between 1.33:1 and 1.91:1 (landscape)                |
| **File size**                | Under 500 KB if possible (for fast loading)          |
| **Alt text / accessibility** | Descriptive file name and alt text (for SEO context) |
| **URL**                      | Absolute URL, same domain preferred                  |




I already created the HeaderSection.astro and the HeroSection.astro, do the same by creating the respective astro files for the other remaining sections in the index_test.html file.

---

## 🎨 Setup do CSS / tema do site (ANTES de montar a página)

Todo site novo segue o padrão Tailwind v4 descrito em
[`docs/⭐ README.css.tailwind.no.projeto.md`](./⭐%20README.css.tailwind.no.projeto.md). Leia esse
arquivo — ele é a referência oficial. Em resumo, ao iniciar um site:

1. **Edite só o `styles/theme.css`** do site (o `global.css` e os layouts são AUTO-GENERATED).
2. **Defina no `@theme` as três variáveis que o reset do `body` (global.css) consome:**
   `--color-text-main`, `--color-bg-dark` e `--font-sans`. Sem elas o body fica sem cor/fonte/fundo.
   Não re-declare o `body` no `@layer base` só para isso.
3. **Cores e fontes da marca no `@theme`** — uma `--font-*` para cada fonte carregada no `<link>`
   (sem peso morto), nomes sem colidir com paletas nativas do Tailwind (`neutral`...) e sem prefixo
   duplicado (`--color-card` → `bg-card`, nunca `--color-bg-card` → `bg-bg-card`).
4. **Carregue as fontes** dentro de `<Fragment slot="head">` no `index.astro` (cai no `<head>`).
5. **Nada de `style=""` inline** com cor/fonte/tamanho hardcoded — use classes Tailwind apontando
   para as vars do `@theme` (`text-ink`, `font-heading`, `text-[28px]`). Isso vale também para
   `bodyStyle` no layout: não passe `font-family` hardcoded, defina `--font-sans` no `@theme`.

> O site `multi-sites/sites/revistadoturismo/` é um bom exemplo já no padrão.

---

> ⚠️ **Atenção ao template abaixo** (corrigido nesta versão):
> - As props de imagem vêm de `siteConfig.site.primaryImage` como **`.alt` / `.width` / `.height`**
>   (não `.imageCaption` / `.imageWidth` / `.imageHeight`, que não existem e dão erro de tipo).
> - **Não** coloque `font-family: 'Source Sans Pro'` hardcoded no `bodyStyle` nem `text-white gradient`
>   no `bodyClass` por padrão — isso é específico do fastvistos. Defina a fonte via `--font-sans` no
>   `theme.css` e adicione classes de cor/fundo só se o design do seu site pedir.

```html
---
import SharedHomeLayout from '../layouts/SharedHomeLayout.astro';
import { siteConfig } from '../site-config.ts';
import JsonLdHomePageBase from '../components/JsonLdHomePageBase.astro';

import HeaderSection from '../components/HeaderSection.astro';

const { bodyClass = '', bodyStyle = '' } = Astro.props;
---


<SharedHomeLayout
    bodyClass={`${bodyClass} leading-normal tracking-normal antialiased`}
    bodyStyle={`${bodyStyle}`}

    canonicalConf={siteConfig.site.canonical}
    faviconPathFromConf={siteConfig.site.faviconPath}
    seoFromConf={siteConfig.homePageConfig.seo}

    titleFromConf={siteConfig.homePageConfig.seo.title}
    descriptionFromConf={siteConfig.homePageConfig.seo.description}
    authorNameFromConf={siteConfig.site.authorName}
    imageFromConf={null}
    imageUrlFromConf={siteConfig.site.primaryImage.url}
    imageCaptionFromConf={siteConfig.site.primaryImage.alt}
    imageWidthFromConf={siteConfig.site.primaryImage.width}
    imageHeightFromConf={siteConfig.site.primaryImage.height}
>
    <!-- Additional head content specific to this layout -->
    <Fragment slot="head">
        <JsonLdHomePageBase
            faqList={[]}
            servicesList={[]}
            reviewsList={[]}
            disableReviews={false}
        />
    </Fragment>

    <!-- Body content -->
    <HeaderSection />


</SharedHomeLayout>

<style is:global>
</style>
```