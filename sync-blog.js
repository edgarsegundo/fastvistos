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
  
  // Read core blog templates
  const indexTemplate = await fs.readFile(join(CORE_BLOG_DIR, 'index.astro'), 'utf-8');
  const postTemplate = await fs.readFile(join(CORE_BLOG_DIR, '[slug].astro'), 'utf-8');
  
  // Read core libraries
  const blogService = await fs.readFile(join(CORE_LIB_DIR, 'multi-blog-service.js'), 'utf-8');
  const siteConfig = await fs.readFile(join(CORE_LIB_DIR, 'site-config.js'), 'utf-8');
  
  // Replace core imports with local imports and make site-specific
  const localizedIndexTemplate = indexTemplate
    .replace(/import \{ BlogService \} from '\.\.\/\.\.\/lib\/multi-blog-service\.js';/, `import { BlogService } from '../../lib/blog-service.js';`)
    .replace(/import \{ getSiteConfig \} from '\.\.\/\.\.\/lib\/site-config\.js';/, `import { getSiteConfig } from '../../lib/site-config.js';`)
    .replace(/const siteId = import\.meta\.env\.SITE_ID \|\| 'fastvistos';/, `const siteId = '${siteId}';`)
    .replace(/import '\.\.\/\.\.\/styles\/global\.css';/g, `import '../../styles/global.css';`);
    
  const localizedPostTemplate = postTemplate
    .replace(/import \{ BlogService \} from '\.\.\/\.\.\/lib\/multi-blog-service\.js';/, `import { BlogService } from '../../lib/blog-service.js';`)
    .replace(/import \{ getSiteConfig \} from '\.\.\/\.\.\/lib\/site-config\.js';/, `import { getSiteConfig } from '../../lib/site-config.js';`)
    .replace(/const siteId = import\.meta\.env\.SITE_ID \|\| 'fastvistos';/, `const siteId = '${siteId}';`)
    .replace(/import '\.\.\/\.\.\/styles\/global\.css';/g, `import '../../styles/global.css';`);
  
  // Ensure directories exist
  await ensureDir(siteBlogDir);
  await ensureDir(siteLibDir);
  
  // Write localized templates
  await fs.writeFile(join(siteBlogDir, 'index.astro'), localizedIndexTemplate);
  await fs.writeFile(join(siteBlogDir, '[slug].astro'), localizedPostTemplate);
  
  // Copy core services and update paths for local usage
  const localizedBlogService = blogService
    .replace(/static contentDir = join\(__dirname, '\.\.\/content\/blog'\);/, `static contentDir = join(__dirname, '../content/blog');`);
  
  await fs.writeFile(join(siteLibDir, 'blog-service.js'), localizedBlogService);
  await fs.writeFile(join(siteLibDir, 'site-config.js'), siteConfig);
  
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
