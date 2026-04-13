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

// ================================================================
// Sitemap constants — por tipo de página
// ================================================================
const HOME_CHANGEFREQ    = 'weekly';   // home muda com frequência
const BLOG_CHANGEFREQ    = 'monthly';  // posts ficam estáveis mas podem ser atualizados
const VISTOS_CHANGEFREQ  = 'monthly';  // regras de visto mudam ocasionalmente
const DEFAULT_CHANGEFREQ = 'monthly';  // fallback para outras páginas

const HOME_PRIORITY     = 1.0;
const STANDARD_PRIORITY = 1.0;
const BLOG_PRIORITY     = 0.7;

// ================================================================
// Páginas que nunca devem aparecer no sitemap
// ================================================================
const SITEMAP_BLOCKLIST = [
    'styleguide-tailwind',
    // adicione outras rotas de dev/admin aqui se necessário
];

// ================================================================
// Carrega configurações dos sites dinamicamente
// ================================================================
async function loadSiteConfigurations() {
    const sitesDir = join(__dirname, 'multi-sites/sites');
    const sites = {};

    try {
        await fs.access(sitesDir);
        const entries = await fs.readdir(sitesDir, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const siteId = entry.name;
            const siteConfigPath = join(sitesDir, siteId, 'site-config.ts');

            try {
                await fs.access(siteConfigPath);

                let siteConfig;
                try {
                    const siteConfigModule = await import(
                        `./multi-sites/sites/${siteId}/site-config.ts`
                    );
                    siteConfig = siteConfigModule.siteConfig;
                } catch (importError) {
                    if (importError.message.includes('Unknown file extension ".ts"')) {
                        console.log(`⚠️  Using fallback parsing for ${siteId} site config`);
                        const content = await fs.readFile(siteConfigPath, 'utf-8');

                        const domainMatch = content.match(/domain:\s*['"`]([^'"`]+)['"`]/);
                        const nameMatch   = content.match(/(?:name|siteName):\s*['"`]([^'"`]+)['"`]/);

                        if (domainMatch && nameMatch) {
                            siteConfig = {
                                domain: domainMatch[1],
                                name:   nameMatch[1],
                                id:     siteId,
                            };
                        } else {
                            throw new Error('Could not parse domain and name from site config file');
                        }
                    } else {
                        throw importError;
                    }
                }

                const domain    = siteConfig.site?.domain   || siteConfig.domain;
                const siteName  = siteConfig.site?.siteName || siteConfig.site?.name || siteConfig.name;
                const canonical = siteConfig.site?.canonical?.replace(/\/$/, '');

                sites[siteId] = {
                    domain,
                    url: canonical || `https://${domain}`,
                    name: siteName,
                    fullConfig: siteConfig,
                };

                console.log(`✅ Loaded configuration for site: ${siteId} (${domain})`);
            } catch (error) {
                console.warn(`⚠️  Could not load configuration for site ${siteId}:`, error.message);
                console.warn(`    Site config path: ${siteConfigPath}`);
            }
        }
    } catch (error) {
        console.error('❌ Error reading sites directory:', error);
        console.error('💥 Cannot proceed without site configurations. Please check:');
        console.error('   1. multi-sites/sites/ directory exists');
        console.error('   2. Sites have valid site-config.ts files');
        console.error('   3. File permissions are correct');
        console.error('   4. Current working directory is correct');
        console.error(`   5. Attempted to read: ${sitesDir}`);
        process.exit(1);
    }

    if (Object.keys(sites).length === 0) {
        console.error('❌ No valid site configurations found!');
        console.error('💥 Please ensure sites have valid site-config.ts files');
        console.error(`   Searched in: ${sitesDir}`);
        try {
            const entries = await fs.readdir(sitesDir, { withFileTypes: true });
            entries.forEach((e) => {
                console.error(`     - ${e.name} (${e.isDirectory() ? 'directory' : 'file'})`);
            });
        } catch {
            console.error('     Could not list directory contents');
        }
        process.exit(1);
    }

    console.log(`🚀 Loaded ${Object.keys(sites).length} site configurations`);
    return sites;
}

// ================================================================
// Inicialização
// ================================================================
const SITES        = await loadSiteConfigurations();
const CURRENT_SITE = process.env.SITE_ID || 'fastvistos';
const siteConfig   = SITES[CURRENT_SITE] || SITES.fastvistos;

console.log('🟢 Astro site URL:', siteConfig.url);

// ================================================================
// Helpers
// ================================================================

/**
 * Formata uma data para o formato YYYY-MM-DD exigido pelo sitemap.
 * Se não houver data, retorna null para evitar lastmod falso (data do build).
 */
function formatDate(dateString) {
    if (!dateString) return null;
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

/**
 * Determina o changefreq com base no tipo de página.
 */
function resolveChangefreq(url, override) {
    if (override) return override;
    if (url === siteConfig.url || url === siteConfig.url + '/') return HOME_CHANGEFREQ;
    if (url.includes('/blog/'))   return BLOG_CHANGEFREQ;
    if (url.includes('/vistos/')) return VISTOS_CHANGEFREQ;
    return DEFAULT_CHANGEFREQ;
}

/**
 * Determina a priority com base no tipo de página.
 */
function resolvePriority(url, override) {
    if (override !== undefined) return override;
    if (url === siteConfig.url || url === siteConfig.url + '/') return HOME_PRIORITY;
    if (url.includes('/blog/')) return BLOG_PRIORITY;
    return STANDARD_PRIORITY;
}

/**
 * Retorna true se a URL deve ser excluída do sitemap.
 */
function isBlocked(url) {
    return SITEMAP_BLOCKLIST.some((blocked) => url.includes(blocked));
}

// ================================================================
// Astro config
// ================================================================
export default defineConfig({
    site: siteConfig.url,

    srcDir:    `./multi-sites/sites/${CURRENT_SITE}`,
    publicDir: `./public/${CURRENT_SITE}`,
    outDir:    `./dist/${CURRENT_SITE}`,

    integrations: [
        mdx({
            syntaxHighlight: 'shiki',
            shikiConfig: { theme: 'github-dark' },
            remarkPlugins: [],
            rehypePlugins: [],
        }),
        sitemap({
            // Exclui páginas de dev/admin e páginas de outros sites
            filter: (page) => {
                if (isBlocked(page)) return false;
                return page.includes(siteConfig.domain) || !page.includes('://');
            },

            serialize: ({ url, data }) => {
                const lastModified  = data?.lastModified || data?.frontmatter?.dateModified;
                const sitemapMeta   = data?.frontmatter?.sitemap;
                const lastmod       = formatDate(lastModified); // null se não houver data real

                const entry = {
                    url,
                    changefreq: resolveChangefreq(url, sitemapMeta?.changefreq),
                    priority:   resolvePriority(url, sitemapMeta?.priority),
                };

                // Só inclui lastmod se houver uma data real — evita enganar o Google
                // com a data do build em todas as páginas
                if (lastmod) entry.lastmod = lastmod;

                return entry;
            },
        }),
    ],

    vite: {
        server: {
            proxy: {
                '/image-editor': {
                    target:       process.env.DJANGO_API_BASE_URL || 'https://sys.fastvistos.com.br',
                    changeOrigin: true,
                    secure:       false,
                    rewrite:      (path) => path.replace(/^\/image-editor/, ''),
                    headers: {
                        'X-API-Key': process.env.DJANGO_MICROSERVICESADM_KEY || '',
                    },
                },
                '/image-upload': {
                    target:       process.env.IMAGE_SERVICE_URL || 'http://localhost:8091',
                    changeOrigin: true,
                    rewrite:      (path) => path.replace(/^\/image-upload/, ''),
                },
                '/article-image': {
                    target:       process.env.API_BASE_URL || 'http://localhost:3000',
                    changeOrigin: true,
                },
            },
        },
        plugins: [
            tailwindcss(),
            {
                name: 'sitemap-xml-header',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        if (req.url?.startsWith('/sitemap.')) {
                            res.setHeader('Content-Type', 'application/xml');
                        }
                        next();
                    });
                },
            },
            {
                name: 'shared-dev-scripts',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        if (req.url === '/blog-image-editor.js') {
                            const filePath = join(__dirname, 'public', 'blog-image-editor.js');
                            res.setHeader('Content-Type', 'application/javascript');
                            import('fs').then(({ createReadStream }) => {
                                const stream = createReadStream(filePath);
                                stream.on('error', () => next());
                                stream.pipe(res);
                            });
                            return;
                        }
                        next();
                    });
                },
            },
        ],
        define: {
            __SITE_CONFIG__:  JSON.stringify(siteConfig),
            __CURRENT_SITE__: JSON.stringify(CURRENT_SITE),
        },
        resolve: {
            alias: {
                '@core': '/multi-sites/core',
                '@site': `/multi-sites/sites/${CURRENT_SITE}`,
                '@':     `/multi-sites/sites/${CURRENT_SITE}`,
            },
        },
    },

    output: 'static',
    build: {
        format:           'directory',
        inlineStylesheets: 'auto',
    },

    server: {
        host: true,
        port: parseInt(process.env.PORT || '3000'),
    },

    markdown: {
        syntaxHighlight: 'shiki',
        shikiConfig: {
            theme: 'github-dark',
            wrap:  true,
        },
    },
});
