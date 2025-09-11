import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically discover and load site configurations
async function loadSiteConfigurations() {
  const sitesDir = join(__dirname, 'multi-sites/sites');
  const sites = {};
  
  try {
    // Check if sites directory exists
    await fs.access(sitesDir);
    const entries = await fs.readdir(sitesDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const siteId = entry.name;
        const siteConfigPath = join(sitesDir, siteId, 'site-config.ts');
        
        try {
          // Check if site-config.ts exists
          await fs.access(siteConfigPath);
          
          let siteConfig;
          try {
            // Try to import the site configuration
            const siteConfigModule = await import(`./multi-sites/sites/${siteId}/site-config.ts`);
            siteConfig = siteConfigModule.siteConfig;
          } catch (importError) {
            if (importError.message.includes('Unknown file extension ".ts"')) {
              // Fallback: read the file and extract basic info using regex
              console.log(`📝 Using fallback parsing for ${siteId} site config`);
              const content = await fs.readFile(siteConfigPath, 'utf-8');
              
              // Extract domain using regex
              const domainMatch = content.match(/domain:\s*['"`]([^'"`]+)['"`]/);
              const nameMatch = content.match(/name:\s*['"`]([^'"`]+)['"`]/);
              
              if (domainMatch && nameMatch) {
                siteConfig = {
                  domain: domainMatch[1],
                  name: nameMatch[1],
                  id: siteId
                };
              } else {
                throw new Error('Could not parse domain and name from site config file');
              }
            } else {
              throw importError;
            }
          }
          
          // Extract the needed information for Astro config
          sites[siteId] = {
            domain: siteConfig.domain,
            url: `https://${siteConfig.domain}`,
            name: siteConfig.name,
            // Store full config for potential future use
            fullConfig: siteConfig
          };
          
          console.log(`✅ Loaded configuration for site: ${siteId} (${siteConfig.domain})`);
        } catch (error) {
          console.warn(`⚠️  Could not load configuration for site ${siteId}:`, error.message);
          console.warn(`    Site config path: ${siteConfigPath}`);
        }
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
  
  // Ensure we found at least one site
  if (Object.keys(sites).length === 0) {
    console.error('❌ No valid site configurations found!');
    console.error('💥 Please ensure sites have valid site-config.ts files');
    console.error(`   Searched in: ${sitesDir}`);
    console.error('   Available directories:');
    try {
      const entries = await fs.readdir(sitesDir, { withFileTypes: true });
      entries.forEach(entry => {
        console.error(`     - ${entry.name} (${entry.isDirectory() ? 'directory' : 'file'})`);
      });
    } catch (e) {
      console.error('     Could not list directory contents');
    }
    process.exit(1);
  }
  
  console.log(`🎯 Loaded ${Object.keys(sites).length} site configurations`);
  return sites;
}

// Load site configurations
const SITES = await loadSiteConfigurations();

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
