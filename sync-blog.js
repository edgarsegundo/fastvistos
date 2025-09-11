#!/usr/bin/env node

/**
 * Blog Sync Script
 * Syncs the core blog templates to all sites before building
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITES = ['fastvistos', 'conceptvistos', 'vibecode'];
const CORE_BLOG_DIR = join(__dirname, 'multi-sites/core/pages/blog');
const CORE_LIB_DIR = join(__dirname, 'multi-sites/core/lib');
const CORE_LAYOUTS_DIR = join(__dirname, 'multi-sites/core/layouts');

async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function copyDirectoryRecursive(src, dest) {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function copyFile(src, dest) {
  await ensureDir(dirname(dest));
  await fs.copyFile(src, dest);
}

async function syncBlogToSite(siteId) {
  console.log(`📄 Syncing blog to ${siteId}...`);
  
  const siteDir = join(__dirname, `multi-sites/sites/${siteId}`);
  const siteBlogDir = join(siteDir, 'pages/blog');
  const siteLibDir = join(siteDir, 'lib');
  const siteLayoutsDir = join(siteDir, 'layouts');
  
  // Read core blog templates
  const indexTemplate = await fs.readFile(join(CORE_BLOG_DIR, 'index.astro'), 'utf-8');
  const postTemplate = await fs.readFile(join(CORE_BLOG_DIR, '[slug].astro'), 'utf-8');
  
  // Read core layouts
  const sharedBlogLayout = await fs.readFile(join(CORE_LAYOUTS_DIR, 'SharedBlogLayout.astro'), 'utf-8');
  
  // Replace core imports with local imports and make site-specific
  const localizedIndexTemplate = indexTemplate
    .replace(/import \{ BlogService \} from '\.\.\/\.\.\/lib\/multi-blog-service\.js';/, `import { BlogService } from '../../lib/blog-service.js';`)
    .replace(/import \{ getSiteConfig \} from '\.\.\/\.\.\/lib\/site-config\.js';/, `import { getSiteConfig } from '../../lib/site-config.js';`)
    .replace(/import BlogLayout from '\.\.\/\.\.\/\.\.\/\.\.\/core\/layouts\/SharedBlogLayout\.astro';/, `import BlogLayout from '../layouts/SharedBlogLayout.astro';`)
    .replace(/const siteId = import\.meta\.env\.SITE_ID \|\| 'fastvistos';/, `const siteId = '${siteId}';`)
    .replace(/import '\.\.\/\.\.\/styles\/global\.css';/g, `import '../../styles/global.css';`);
    
  const localizedPostTemplate = postTemplate
    .replace(/import \{ BlogService \} from '\.\.\/\.\.\/lib\/multi-blog-service\.js';/, `import { BlogService } from '../../lib/blog-service.js';`)
    .replace(/import \{ getSiteConfig \} from '\.\.\/\.\.\/lib\/site-config\.js';/, `import { getSiteConfig } from '../../lib/site-config.js';`)
    .replace(/import BlogLayout from '\.\.\/\.\.\/\.\.\/\.\.\/core\/layouts\/SharedBlogLayout\.astro';/, `import BlogLayout from '../layouts/SharedBlogLayout.astro';`)
    .replace(/const siteId = import\.meta\.env\.SITE_ID \|\| 'fastvistos';/, `const siteId = '${siteId}';`)
    .replace(/import '\.\.\/\.\.\/styles\/global\.css';/g, `import '../../styles/global.css';`);
  
  // Localize SharedBlogLayout
  const localizedSharedBlogLayout = sharedBlogLayout
    .replace(/import \{ getSiteConfig \} from '\.\.\/lib\/site-config\.js';/, `import { getSiteConfig } from '../lib/site-config.js';`)
    .replace(/const siteId = import\.meta\.env\.SITE_ID \|\| 'fastvistos';/, `const siteId = '${siteId}';`)
    .replace(/import '\.\.\/styles\/global\.css';/g, `import '../styles/global.css';`);
  
  // Ensure directories exist
  await ensureDir(siteBlogDir);
  await ensureDir(siteLibDir);
  await ensureDir(siteLayoutsDir);
  
  // Write localized templates
  await fs.writeFile(join(siteBlogDir, 'index.astro'), localizedIndexTemplate);
  await fs.writeFile(join(siteBlogDir, '[slug].astro'), localizedPostTemplate);
  
  // Write localized layout
  await fs.writeFile(join(siteLayoutsDir, 'SharedBlogLayout.astro'), localizedSharedBlogLayout);
  
  console.log(`✅ Blog synced to ${siteId}`);
}

async function syncAllSites() {
  console.log('🔄 Starting blog sync to all sites...');
  
  for (const siteId of SITES) {
    await syncBlogToSite(siteId);
  }
  
  console.log('🎉 All sites synced successfully!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncAllSites().catch(console.error);
}

export { syncAllSites, syncBlogToSite };
