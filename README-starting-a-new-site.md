# Starting a New Site

## antes precisa criar business e usuario e profile no microservices

## Aqui preciso melhorar a copia de um template que funcione e já atualizar o arquivo site-config.ts

## precisa ajeitar o faq e inclusive no fastvistos está fixo na parte que cria o ld+json e precisa puxar do banco

## **🆕 Create a New Site**

```bash
node create-site.js


Creating the main homepage image, see guidelines. The first image I created for fastvistos and serves as an example can be found [here](multi-sites/sites/fastvistos/docs/images/home-page-main-image.svg)

After creating the main image, put at `public-sites/[SITEID]/assets/images/logo/`. Put a name on the image that describe the image.

For ex:

public-sites/[SITEID]/assets/images/logo/home-page-main-image-fastvistos-mulher-passaporte.webp


| Property                     | Recommended Value / Rule                             |
| ---------------------------- | ---------------------------------------------------- |
| **Format**                   | `.png`, `.jpg`, or `.webp`                           |
| **Size (min)**               | 1200 × 628 px (Google Discover & social cards)       |
| **Aspect ratio**             | Between 1.33:1 and 1.91:1 (landscape)                |
| **File size**                | Under 500 KB if possible (for fast loading)          |
| **Alt text / accessibility** | Descriptive file name and alt text (for SEO context) |
| **URL**                      | Absolute URL, same domain preferred                  |
