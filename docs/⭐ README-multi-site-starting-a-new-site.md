# Starting a New Site

## ✅ RESOLVIDO: `create-site.js` já cria o business, o usuário e o profile automaticamente
(chama `BlogService.createBusiness()` e a API `create-user-for-business`) — não é mais necessário
fazer isso manualmente antes de rodar o script. Ver detalhes na seção "Create a New Site" abaixo.

## ⚠️ AINDA PENDENTE: melhorar a cópia do template para já atualizar o `site-config.ts` de verdade
O `templates/site-template/site-config.ts` ainda é uma cópia praticamente hardcoded dos dados reais
do fastvistos (telefone, endereço, geo, WhatsApp, redes sociais, GTM id, etc.). O `create-site.js`
só substitui `[SITE_ID]`, `[SITE_NAME]`, `[BUSINESS_ID]`, `[COMPANY_NAME]`, `[COMPANY_SHORT_NAME]`,
`[COMPANY_DESCRIPTION]`, `[COMPANY_CATEGORY_1]` e `[YOUR_DOMAIN]` — os demais campos de negócio
continuam com os valores do fastvistos e precisam ser editados manualmente após a criação do site.

## ⚠️ AINDA PENDENTE: FAQ / ld+json no fastvistos está fixo, precisa puxar do banco
Em `multi-sites/sites/fastvistos/pages/index.astro`, `faqData` vem de um arquivo estático
(`../config/faqConfig.js`), e não do `WebpageFaqService.getPageFaqList()` (`lib/webpage-faq.ts`),
que já existe mas não está sendo usado ali.

## **🆕 Create a New Site**

```bash
node create-site.js
```

O script `create-site.js` é um wizard interativo que faz tudo isso, nesta ordem:

1. **Pergunta o Site ID** (minúsculo, sem espaços, ex.: `mysite`) e valida (`a-z0-9-`, mín. 2
   caracteres). Aborta se já existir `multi-sites/sites/<siteId>` ou `public/<siteId>`.
2. **Pergunta o domínio** (sugere `<siteId>.com` como padrão) e valida o formato.
3. **Deriva automaticamente** o nome de exibição (`siteName`) a partir do `siteId`
   (primeira letra maiúscula, hífens viram espaços) — **não pergunta um nome separado**.
4. **Pergunta dados de negócio (opcionais)** para o banco: email, e telefone (código do país,
   DDD, número) — todos opcionais, mas validados se preenchidos.
5. **Mostra um resumo** e pede confirmação (`y/N`) antes de prosseguir.
6. **Cria o `business` no banco** via `BlogService.createBusiness()` (`multi-sites/core/lib/blog-service.js`),
   usando `siteId` como `name`, o nome derivado como `display_name` e o domínio como `canonical_domain`.
7. **Cria o usuário/perfil** chamando a API
   `POST https://sys.fastvistos.com.br/api/create-user-for-business/` (header `X-API-Key` vindo de
   `process.env.API_KEY`), passando `business_id`, `email` (ou `<siteId>@example.com` se não informado)
   e `username = siteId`. Se essa chamada falhar, o business já criado permanece e é preciso criar o
   usuário manualmente — o script não desfaz o passo anterior.
8. **Copia os templates** de `templates/site-template/` para `multi-sites/sites/<siteId>/` e de
   `templates/public-template/` para `public/<siteId>/`, substituindo os placeholders `[SITE_ID]`,
   `[SITE_NAME]`, `[BUSINESS_ID]`, `[COMPANY_NAME]`, `[COMPANY_SHORT_NAME]`, `[COMPANY_DESCRIPTION]`,
   `[COMPANY_CATEGORY_1]` e `[YOUR_DOMAIN]` em todos os arquivos (recursivamente).
9. **Adiciona scripts ao `package.json`** raiz automaticamente (só se ainda não existirem):
   `dev:<siteId>`, `dev:watch:<siteId>`, `build:<siteId>`, `preview:<siteId>` e `download-images:<siteId>`.
10. **Ao final, já inicia automaticamente** `npm run dev:watch:<siteId>` (não precisa rodar manualmente).

> ⚠️ Não cria mais `tailwind.<siteId>.config.js` a partir de template — esse trecho está comentado
> no script atualmente. O tema é feito via `styles/theme.css` do site (ver seção abaixo).

> ⚠️ O script não pede mais "nome do site" separadamente — ele deriva do Site ID. Se quiser um nome
> de exibição diferente, ajuste depois no banco (`display_name` do business) e no `site-config.ts`.

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