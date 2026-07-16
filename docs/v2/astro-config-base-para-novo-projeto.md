# Base para replicar em projeto novo — Astro multi-site do zero

> Use este arquivo como checklist + código-fonte de partida. Não copie `multi-sites/sites/*`
> nem `templates/` deste repo (é conteúdo específico do fastvistos) — copie só a estrutura
> abaixo, criando UM site de exemplo para validar o mecanismo.
>
> Contexto completo de cada decisão está em `astro-config-explicado.md`, no mesmo diretório.

## Passo 0 — Pré-requisitos

```bash
npm create astro@latest meu-novo-projeto -- --template minimal --no-install
cd meu-novo-projeto
npm install astro @astrojs/mdx @astrojs/sitemap @tailwindcss/vite tailwindcss dotenv
npm install --save-dev prettier prettier-plugin-astro
# Prisma só se o backend/banco já existir e você for LER direto (ver seção "Prisma" no doc explicado)
npm install @prisma/client
npm install --save-dev prisma tsx
```

## Passo 1 — Estrutura de pastas

```bash
mkdir -p multi-sites/core/{components,layouts,pages,config,styles}
mkdir -p multi-sites/sites/meu-primeiro-site/{components,layouts,pages,config,content,lib,styles}
mkdir -p templates/site-template-minimal/{components,layouts,pages}
mkdir -p public/meu-primeiro-site
```

## Passo 2 — `multi-sites/sites/meu-primeiro-site/site-config.ts`

Copie a forma (não o conteúdo) de `templates/site-template-minimal/site-config.ts` deste repo.
Estrutura mínima para começar:

```ts
export const siteConfig = {
    site: {
        business_id: 'defina-um-uuid-ou-slug',
        id: 'meu-primeiro-site',
        siteName: 'Meu Primeiro Site',
        locale: 'pt-BR',
        domain: 'meuprimeirosite.com.br',
        canonical: 'https://meuprimeirosite.com.br/',
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
    },
    homePageConfig: {
        seo: { title: '...', description: '...', themeColor: '#0070f3' },
    },
    features: {
        blog: true,
        booking: false,
        payments: false,
        multilingual: false,
    },
};
```

## Passo 3 — `astro.config.mjs` (adaptado, sem o específico do fastvistos)

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config as loadDotenv } from 'dotenv';
loadDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_CHANGEFREQ = 'monthly';
const HOME_PRIORITY = 1.0;
const STANDARD_PRIORITY = 0.8;
const SITEMAP_BLOCKLIST = []; // adicione rotas de dev/admin aqui conforme necessário

async function loadSiteConfigurations() {
    const sitesDir = join(__dirname, 'multi-sites/sites');
    const sites = {};

    await fs.access(sitesDir);
    const entries = await fs.readdir(sitesDir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const siteId = entry.name;
        const siteConfigPath = join(sitesDir, siteId, 'site-config.ts');

        try {
            await fs.access(siteConfigPath);
            const siteConfigModule = await import(`./multi-sites/sites/${siteId}/site-config.ts`);
            const siteConfig = siteConfigModule.siteConfig;

            const domain = siteConfig.site?.domain;
            const canonical = siteConfig.site?.canonical?.replace(/\/$/, '');

            sites[siteId] = {
                domain,
                url: canonical || `https://${domain}`,
                name: siteConfig.site?.siteName,
                fullConfig: siteConfig,
            };
        } catch (error) {
            console.warn(`Could not load config for site ${siteId}:`, error.message);
        }
    }

    if (Object.keys(sites).length === 0) {
        console.error('No valid site configurations found in', sitesDir);
        process.exit(1);
    }

    return sites;
}

const SITES = await loadSiteConfigurations();
const CURRENT_SITE = process.env.SITE_ID || Object.keys(SITES)[0];
const siteConfig = SITES[CURRENT_SITE];

if (!siteConfig) {
    console.error(`SITE_ID="${CURRENT_SITE}" não encontrado em multi-sites/sites/`);
    process.exit(1);
}

function resolveChangefreq(url, override) {
    if (override) return override;
    if (url === siteConfig.url || url === siteConfig.url + '/') return 'weekly';
    if (url.includes('/blog/')) return 'monthly';
    return DEFAULT_CHANGEFREQ;
}

function resolvePriority(url, override) {
    if (override !== undefined) return override;
    if (url === siteConfig.url || url === siteConfig.url + '/') return HOME_PRIORITY;
    return STANDARD_PRIORITY;
}

function isBlocked(url) {
    return SITEMAP_BLOCKLIST.some((blocked) => url.includes(blocked));
}

export default defineConfig({
    site: siteConfig.url,

    srcDir: `./multi-sites/sites/${CURRENT_SITE}`,
    publicDir: `./public/${CURRENT_SITE}`,
    outDir: `./dist/${CURRENT_SITE}`,

    integrations: [
        mdx({
            syntaxHighlight: 'shiki',
            shikiConfig: { theme: 'github-dark' },
        }),
        sitemap({
            filter: (page) => {
                if (isBlocked(page)) return false;
                return page.includes(siteConfig.domain) || !page.includes('://');
            },
            serialize: ({ url, data }) => {
                const sitemapMeta = data?.frontmatter?.sitemap;
                return {
                    url,
                    changefreq: resolveChangefreq(url, sitemapMeta?.changefreq),
                    priority: resolvePriority(url, sitemapMeta?.priority),
                };
            },
        }),
    ],

    vite: {
        plugins: [tailwindcss()],
        define: {
            __SITE_CONFIG__: JSON.stringify(siteConfig),
            __CURRENT_SITE__: JSON.stringify(CURRENT_SITE),
        },
        resolve: {
            alias: {
                '@core': '/multi-sites/core',
                '@site': `/multi-sites/sites/${CURRENT_SITE}`,
                '@': `/multi-sites/sites/${CURRENT_SITE}`,
            },
        },
    },

    output: 'static',
    build: {
        format: 'directory',
        inlineStylesheets: 'auto',
    },

    server: {
        host: true,
        port: parseInt(process.env.PORT || '3000'),
    },

    markdown: {
        syntaxHighlight: 'shiki',
        shikiConfig: { theme: 'github-dark', wrap: true },
    },
});
```

**O que foi deliberadamente removido/simplificado em relação ao fastvistos** (adicione de volta
só quando o novo projeto realmente precisar):
- Proxies de dev (`/image-editor`, `/image-upload`, `/article-image`) — adicione quando o backend
  Django novo existir e o editor de imagem for implementado.
- Plugin `sitemap-xml-header` e `shared-dev-scripts` — específicos de necessidades que
  surgiram depois; adicione se o mesmo sintoma aparecer (ex.: sitemap servido com
  content-type errado em dev).
- `formatDate`/`lastmod` no sitemap — adicione quando o conteúdo tiver campo real de
  "última modificação" (evite popular com data de build).

## Passo 4 — `package.json` scripts (padrão genérico, evitando o problema de escala)

Em vez de duplicar `dev:<site>`/`build:<site>` por site (que no fastvistos já soma ~60 linhas de
scripts para 8 sites), comece já com scripts genéricos parametrizados:

```json
{
  "scripts": {
    "dev": "astro dev",
    "dev:site": "cross-env-shell SITE_ID=$npm_config_site astro dev",
    "build:site": "cross-env-shell SITE_ID=$npm_config_site astro build",
    "preview:site": "cross-env-shell SITE_ID=$npm_config_site astro preview",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "create-site": "node create-site.js"
  }
}
```

Uso: `npm run build:site --site=meu-primeiro-site` (ou simplesmente
`SITE_ID=meu-primeiro-site astro build` direto, sem passar por npm script — mais simples ainda
enquanto o número de sites é pequeno).

**Decisão a tomar cedo:** se você sabe que a plataforma vai ter poucos sites geridos manualmente
(dezenas), o padrão do fastvistos (um script nomeado por site) é mais ergonômico no dia a dia.
Se a visão é "usuário final cria site pelo dashboard e isso vira uma build automatizada" (que é a
visão de produto que vocês descreveram), o **script genérico é obrigatório** — não dá para editar
`package.json` a cada site criado por um usuário via UI. Recomendo começar já genérico.

## Passo 5 — `tsconfig.json`

```json
{
    "extends": "astro/tsconfigs/strict",
    "include": [".astro/types.d.ts", "**/*"],
    "exclude": ["dist"]
}
```

## Passo 6 — `.env.example`

```bash
SITE_ID=meu-primeiro-site
DATABASE_URL=mysql://user:pass@host/dbname   # só se for ler direto do banco do novo Django
DJANGO_API_BASE_URL=http://localhost:8000
DJANGO_API_KEY=your-api-key-here
PORT=3000
```

## Passo 7 — validar o mecanismo

```bash
SITE_ID=meu-primeiro-site npm run dev
# depois:
SITE_ID=meu-primeiro-site npm run build
ls dist/meu-primeiro-site   # deve conter o build isolado desse site
```

Crie um segundo site (`multi-sites/sites/site-dois/site-config.ts` + pastas mínimas) e repita —
confirma que o mesmo config gera builds independentes sem código extra.

## O que fica para depois (não bloqueia validar o mecanismo agora)

- Prisma schema (só existe quando houver banco real por trás — pode nascer vazio/mockado até lá)
- `create-site.js` completo (comece manual: criar pasta + `site-config.ts` à mão até ter 2-3
  sites; automatize quando o padrão ficar claro)
- Integração com o editor WYSIWYG / geração via IA (Etapas 4/5 do roadmap de arquitetura)
- `sync-blog.js` equivalente (só necessário quando houver conteúdo de blog vindo de banco)

## Referência cruzada

- Explicação detalhada de cada peça: `astro-config-explicado.md` (mesmo diretório)
- Decisões de arquitetura do backend (Django novo, schema Site/Domain/Page):
  `README-arquitetura-multi-tenant-etapa1.md` (mesmo diretório)
