// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import rehypeExternalLinks from 'rehype-external-links';

// Constants
const SITE_URL = 'https://fastvistos.com.br';
const DEFAULT_CHANGEFREQ = 'yearly';
const BLOG_PRIORITY = 0.7;
const STANDARD_PRIORITY = 1.0;

// https://astro.build/config
export default defineConfig({
    site: SITE_URL,
    integrations: [
        mdx(),
        tailwind({
            // Apply base styles to Astro components
            applyBaseStyles: false, // We'll handle this in our global.css
        }),
        sitemap({
            // Serialize each route with custom fields like `lastmod`
            serialize: ({ url, data }) => {
                const lastModified = data?.lastModified || data?.frontmatter?.dateModified;
                const sitemapMeta = data?.frontmatter?.sitemap;

                return {
                    url,
                    lastmod: formatDate(lastModified),
                    changefreq: sitemapMeta?.changefreq || DEFAULT_CHANGEFREQ,
                    priority:
                        sitemapMeta?.priority ||
                        (url.includes('/blog/') ? BLOG_PRIORITY : STANDARD_PRIORITY),
                };
            },
        }),
    ],
    vite: {
        plugins: [
            {
                name: 'sitemap-xml-header',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        if (req.url && req.url.startsWith('/sitemap.')) {
                            res.setHeader('Content-Type', 'application/xml');
                        }
                        next();
                    });
                },
            },
        ],
    },
    build: {
        inlineStylesheets: 'auto',
    },
});

// Helper function
function formatDate(dateString) {
    return dateString
        ? new Date(dateString).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
}