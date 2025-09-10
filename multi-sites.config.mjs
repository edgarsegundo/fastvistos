import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Multi-site configuration
const SITES = {
  fastvistos: {
    domain: 'fastvistos.com.br',
    url: 'https://fastvistos.com.br'
  },
  conceptvistos: {
    domain: 'conceptvistos.com.br',
    url: 'https://conceptvistos.com.br'
  },
  vibecode: {
    domain: 'vibecode-lovable.com.br',
    url: 'https://vibecode-lovable.com.br'
  }
};

// Get current site from environment variable or default to fastvistos
const CURRENT_SITE = process.env.SITE_ID || 'fastvistos';
const siteConfig = SITES[CURRENT_SITE] || SITES.fastvistos;

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  
  // Multi-site configuration - each site has its own source directory
  srcDir: `./multi-sites/sites/${CURRENT_SITE}`,
  publicDir: `./public-sites/${CURRENT_SITE}`,
  
  // Multi-site output configuration
  outDir: `./dist/${CURRENT_SITE}`,
  
  integrations: [
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: { theme: 'github-dark' },
      remarkPlugins: [],
      rehypePlugins: []
    }),
    sitemap({
      filter: (page) => {
        // Only include pages for current site
        return page.includes(siteConfig.domain) || !page.includes('://');
      }
    })
  ],
  
  vite: {
    plugins: [tailwindcss({
      config: `./tailwind.${CURRENT_SITE}.config.js`
    })],
    define: {
      // Make site configuration available to client-side code
      __SITE_CONFIG__: JSON.stringify(siteConfig),
      __CURRENT_SITE__: JSON.stringify(CURRENT_SITE)
    },
    resolve: {
      alias: {
        '@core': '/multi-sites/core',
        '@site': `/multi-sites/sites/${CURRENT_SITE}`,
        '@': `/multi-sites/sites/${CURRENT_SITE}`
      }
    }
  },
  
  // Build configuration for static generation
  output: 'static',
  build: {
    format: 'directory'
  },
  
  // Server configuration for development
  server: {
    host: true,
    port: 3000
  },
  
  // Markdown configuration
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  
  // Environment-specific configuration
  ...(process.env.NODE_ENV === 'development' && {
    // Development-specific settings
    server: {
      host: true,
      port: parseInt(process.env.PORT || '3000')
    }
  })
});
