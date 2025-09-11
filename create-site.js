#!/usr/bin/env node

/**
 * Site Creation Script
 * Creates a new site with all necessary folders and configuration files
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Generate a random business ID (32 character hex string)
function generateBusinessId() {
  return Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Create site configuration template
function createSiteConfigTemplate(siteId, domain, siteName, businessId) {
  return `import type { SiteConfig } from '../../core/lib/site-config.ts';

export const siteConfig: SiteConfig = {
  business_id: '${businessId}', // ${siteName} business ID - Update this with your actual business ID
  id: '${siteId}',
  domain: '${domain}',
  name: '${siteName}',
  description: 'Professional services and consulting',
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  
  // Branding
  logo: '/logo.png',
  primaryColor: '#3B82F6', // Blue
  secondaryColor: '#1E40AF', // Dark blue
  
  // Contact
  contactEmail: 'contato@${domain}',
  phone: '+55 11 99999-9999',
  whatsapp: '+5511999999999',
  
  // Social
  socialMedia: {
    facebook: 'https://facebook.com/${siteId}',
    instagram: 'https://instagram.com/${siteId}',
    youtube: 'https://youtube.com/@${siteId}'
  },
  
  // SEO
  seo: {
    title: '${siteName} - Professional Services',
    description: 'Professional services and consulting solutions.',
    keywords: ['${siteId}', 'professional services', 'consulting'],
    ogImage: '/og-image.jpg'
  },
  
  // Features
  features: {
    blog: true,
    booking: true,
    payments: true,
    multilingual: false
  },
  
  // Styling
  customStyles: {
    cssVars: {
      '--accent-color': '#10B981'
    }
  }
};
`;
}

// Create Tailwind config template
function createTailwindConfigTemplate(siteId) {
  return `/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', 
        './multi-sites/sites/${siteId}/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './multi-sites/core/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './public-sites/${siteId}/**/*.html'
    ],
    theme: {
        extend: {
            colors: {
                // ${siteId} brand colors (customize as needed)
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },
                secondary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                }
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'heading': ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/aspect-ratio'),
    ],
}
`;
}

// Create content config template
function createContentConfigTemplate(siteId) {
  return `import { defineCollection, z } from 'astro:content';

// Define content collections for ${siteId}
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
`;
}

// Create basic index page template
function createIndexPageTemplate(siteId, siteName) {
  return `---
// ${siteName} homepage
import Layout from '../layouts/Layout.astro';
import { siteConfig } from '../site-config.ts';
---

<Layout title="Welcome to ${siteName}">
  <main class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
    <div class="container mx-auto px-4 py-20">
      <div class="text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span class="text-primary-600">${siteName}</span>
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {siteConfig.description}
        </p>
        <div class="space-x-4">
          <a 
            href="/blog" 
            class="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Visit Blog
          </a>
          <a 
            href="/contact" 
            class="inline-block border border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  </main>
</Layout>
`;
}

// Create basic layout template
function createLayoutTemplate(siteId, siteName) {
  return `---
export interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
import { siteConfig } from '../site-config.ts';
---

<!DOCTYPE html>
<html lang={siteConfig.language}>
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content={description || siteConfig.description} />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    
    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description || siteConfig.description} />
    <meta property="og:url" content={\`https://\${siteConfig.domain}\${Astro.url.pathname}\`} />
    <meta property="og:site_name" content={siteConfig.name} />
    <meta property="og:type" content="website" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description || siteConfig.description} />
  </head>
  <body>
    <slot />
  </body>
</html>
`;
}

// Create styles template
function createStylesTemplate(siteId) {
  return `/* ${siteId} custom styles */

/* Import Tailwind CSS */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS for ${siteId} */
@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700;
  }
  
  .btn-secondary {
    @apply bg-secondary-600 text-white hover:bg-secondary-700;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
`;
}

// Ensure directory exists
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Main site creation function
async function createSite() {
  console.log('🚀 Site Creation Wizard');
  console.log('======================\n');

  try {
    // Get site ID
    const siteId = await question('Enter site ID (lowercase, no spaces, e.g., "mysite"): ');
    
    if (!siteId) {
      console.error('❌ Site ID is required.');
      rl.close();
      return;
    }
    
    if (!/^[a-z0-9-]+$/.test(siteId)) {
      console.error('❌ Invalid site ID. Use only lowercase letters, numbers, and hyphens.');
      console.log('💡 Examples: mysite, my-company, site123');
      rl.close();
      return;
    }

    // Check if site already exists
    const siteDir = join(__dirname, `multi-sites/sites/${siteId}`);
    try {
      await fs.access(siteDir);
      console.error(`❌ Site '${siteId}' already exists in multi-sites/sites/`);
      console.log('🚫 Exiting without making changes.');
      rl.close();
      return;
    } catch {
      // Site doesn't exist, continue
    }

    // Suggest domain based on siteId
    const suggestedDomain = `${siteId}.com`;
    console.log(`\nSuggested domain: ${suggestedDomain}`);
    const domain = await question(`Enter domain (or press Enter for "${suggestedDomain}"): `) || suggestedDomain;

    // Suggest site name based on siteId
    const suggestedName = siteId.charAt(0).toUpperCase() + siteId.slice(1).replace(/-/g, ' ');
    console.log(`\nSuggested name: ${suggestedName}`);
    const siteName = await question(`Enter site name (or press Enter for "${suggestedName}"): `) || suggestedName;

    console.log('\n📋 Site Configuration:');
    console.log(`   Site ID: ${siteId}`);
    console.log(`   Domain: ${domain}`);
    console.log(`   Name: ${siteName}`);
    
    const confirm = await question('\nProceed with site creation? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('🚫 Site creation cancelled.');
      rl.close();
      return;
    }

    console.log('\n🔨 Creating site structure...');

    // Generate business ID
    const businessId = generateBusinessId();

    // Create main directories
    const directories = [
      'components',
      'content',
      'layouts', 
      'lib',
      'pages',
      'styles'
    ];

    for (const dir of directories) {
      const dirPath = join(siteDir, dir);
      await ensureDir(dirPath);
      console.log(`📁 Created: ${siteId}/${dir}/`);
    }

    // Create site-config.ts
    const siteConfigContent = createSiteConfigTemplate(siteId, domain, siteName, businessId);
    await fs.writeFile(join(siteDir, 'site-config.ts'), siteConfigContent);
    console.log(`📝 Created: ${siteId}/site-config.ts`);

    // Create Tailwind config
    const tailwindConfigContent = createTailwindConfigTemplate(siteId);
    await fs.writeFile(join(__dirname, `tailwind.${siteId}.config.js`), tailwindConfigContent);
    console.log(`📝 Created: tailwind.${siteId}.config.js`);

    // Create content config
    const contentConfigContent = createContentConfigTemplate(siteId);
    await fs.writeFile(join(siteDir, 'content.config.ts'), contentConfigContent);
    console.log(`📝 Created: ${siteId}/content.config.ts`);

    // Create basic pages
    const indexPageContent = createIndexPageTemplate(siteId, siteName);
    await fs.writeFile(join(siteDir, 'pages', 'index.astro'), indexPageContent);
    console.log(`📝 Created: ${siteId}/pages/index.astro`);

    // Create basic layout
    const layoutContent = createLayoutTemplate(siteId, siteName);
    await fs.writeFile(join(siteDir, 'layouts', 'Layout.astro'), layoutContent);
    console.log(`📝 Created: ${siteId}/layouts/Layout.astro`);

    // Create styles
    const stylesContent = createStylesTemplate(siteId);
    await fs.writeFile(join(siteDir, 'styles', 'global.css'), stylesContent);
    console.log(`📝 Created: ${siteId}/styles/global.css`);

    // Create empty component and lib files
    await fs.writeFile(join(siteDir, 'components', '.gitkeep'), '# Components directory');
    await fs.writeFile(join(siteDir, 'lib', '.gitkeep'), '# Lib directory');
    console.log(`📝 Created: ${siteId}/components/.gitkeep`);
    console.log(`📝 Created: ${siteId}/lib/.gitkeep`);

    console.log('\n✅ Site created successfully!');
    console.log('\n📋 Next steps:');
    console.log(`   1. Update business_id in ${siteId}/site-config.ts with your actual business ID`);
    console.log(`   2. Customize colors and branding in tailwind.${siteId}.config.js`);
    console.log(`   3. Add your content to ${siteId}/pages/`);
    console.log(`   4. Update package.json scripts to include your new site`);
    console.log(`   5. Run: npm run dev:${siteId} (after adding package.json scripts)`);
    
    console.log('\n🎉 Happy coding!');

  } catch (error) {
    console.error('❌ Error creating site:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
createSite();
