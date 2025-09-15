#!/usr/bin/env node

/**
 * Blog Sync Script
 * Syncs the core blog templates to all sites before building
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { stripAstroComments } from './utils/stripAstroComments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically discover all sites from the multi-sites/sites directory
async function getSites() {
    const sitesDir = join(__dirname, 'multi-sites/sites');
    try {
        const entries = await fs.readdir(sitesDir, { withFileTypes: true });
        const sites = entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort(); // Sort alphabetically for consistent order

        console.log(`📁 Discovered sites: ${sites.join(', ')}`);
        return sites;
    } catch (error) {
        console.error('❌ Error reading sites directory:', error);
        // Fallback to hardcoded list if directory read fails
        return ['fastvistos', 'conceptvistos', 'vibecode'];
    }
}
const CORE_BLOG_DIR = join(__dirname, 'multi-sites/core/pages/blog');
const CORE_PAGES_DIR = join(__dirname, 'multi-sites/core/pages');
const CORE_LIB_DIR = join(__dirname, 'multi-sites/core/lib');
const CORE_LAYOUTS_DIR = join(__dirname, 'multi-sites/core/layouts');
const CORE_COMPONENTS_DIR = join(__dirname, 'multi-sites/core/components');
const CORE_STYLES_DIR = join(__dirname, 'multi-sites/core/styles');

async function copyFile(src, dest) {
    try {
        if (src.endsWith('.astro')) {
            const content = await fs.readFile(src, 'utf-8');
            const stripped = stripAstroComments(content);
            await fs.writeFile(dest, stripped);
        } else {
            await fs.copyFile(src, dest);
        }
    } catch (error) {
        console.error(`❌ Error copying ${src} to ${dest}:`, error);
    }
}

async function copyDirectory(src, dest) {
    try {
        await ensureDir(dest);
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = join(src, entry.name);
            const destPath = join(dest, entry.name);

            if (entry.isDirectory()) {
                await copyDirectory(srcPath, destPath);
            } else if (entry.isFile() && entry.name.endsWith('.astro')) {
                // Only copy .astro files from components
                await copyFile(srcPath, destPath);
                console.log(`📄 Copied component: ${entry.name}`);
            }
        }
    } catch (error) {
        console.error(`❌ Error copying directory ${src} to ${dest}:`, error);
    }
}

async function ensureDir(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

async function syncBlogToSite(siteId) {
    console.log(`📄 Syncing blog to ${siteId}...`);

    const siteDir = join(__dirname, `multi-sites/sites/${siteId}`);
    const siteBlogDir = join(siteDir, 'pages/blog');
    const sitePagesDir = join(siteDir, 'pages');
    const siteApiDir = join(siteDir, 'pages/api');
    const siteLibDir = join(siteDir, 'lib');
    const siteLayoutsDir = join(siteDir, 'layouts');
    const siteComponentsDir = join(siteDir, 'components');
    const siteStylesDir = join(siteDir, 'styles');

    // Read core blog templates
    const indexTemplate = await fs.readFile(join(CORE_BLOG_DIR, 'index.astro'), 'utf-8');
    const postTemplate = await fs.readFile(join(CORE_BLOG_DIR, '[...slug].astro'), 'utf-8');

    // Read core layouts
    const sharedBlogLayout = await fs.readFile(
        join(CORE_LAYOUTS_DIR, 'SharedBlogLayout.astro'),
        'utf-8'
    );

    const sharedHomeLayout = await fs.readFile(
        join(CORE_LAYOUTS_DIR, 'SharedHomeLayout.astro'),
        'utf-8'
    );

    // Read SEOMeta component for localization (special case)
    const seoMetaComponent = await fs.readFile(join(CORE_COMPONENTS_DIR, 'SEOMeta.astro'), 'utf-8');

    // Read core styles
    const markdownBlogCSS = await fs.readFile(join(CORE_STYLES_DIR, 'markdown-blog.css'), 'utf-8');

    // Read core library files
    const blogServiceContent = await fs.readFile(join(CORE_LIB_DIR, 'blog-service.ts'), 'utf-8');
    const siteConfigContent = await fs.readFile(join(CORE_LIB_DIR, 'site-config.ts'), 'utf-8');
    const siteConfigHelperContent = await fs.readFile(
        join(CORE_LIB_DIR, 'site-config-helper.ts'),
        'utf-8'
    );
    const prismaContent = await fs.readFile(join(CORE_LIB_DIR, 'prisma.js'), 'utf-8');

    // Replace core imports with local imports and make site-specific
    const localizedIndexTemplate = indexTemplate
        .replace(
            /import \{ BlogService \} from '\.\.\/\.\.\/lib\/multi-blog-service\.js';/,
            `import { BlogService } from '../../lib/blog-service.js';`
        )
        .replace(
            /import \{ getSiteConfig \} from '\.\.\/\.\.\/lib\/site-config\.js';/,
            `import { siteConfig } from '../../site-config.ts';`
        )
        .replace(/const siteConfig = getSiteConfig\(\);/, `// siteConfig imported directly`)
        .replace(
            /import BlogLayout from '\.\.\/\.\.\/\.\.\/\.\.\/core\/layouts\/SharedBlogLayout\.astro';/,
            `import BlogLayout from '../layouts/SharedBlogLayout.astro';`
        )
        .replace(
            /const siteId = import\.meta\.env\.SITE_ID \|\| 'fastvistos';/,
            `const siteId = '${siteId}';`
        )
        .replace(/import '\.\.\/\.\.\/styles\/global\.css';/g, `import '../../styles/global.css';`);

    const localizedPostTemplate = postTemplate
        .replace(
            /import \{ BlogService \} from '\.\.\/\.\.\/lib\/blog-service\.ts';/,
            `import { BlogService } from '../../lib/blog-service.ts';`
        )
        .replace(
            /import \{ siteConfig \} from '\.\.\/\.\.\/site-config\.ts';/,
            `import { siteConfig } from '../../site-config.ts';`
        )
        .replace(
            /import \{ getSiteConfig \} from '\.\.\/\.\.\/lib\/site-config\.js';/,
            `import { siteConfig } from '../../site-config.ts';`
        )
        .replace(/const siteConfig = getSiteConfig\(\);/, `// siteConfig imported directly`)
        .replace(
            /import BlogLayout from '\.\.\/\.\.\/\.\.\/\.\.\/core\/layouts\/SharedBlogLayout\.astro';/,
            `import BlogLayout from '../layouts/SharedBlogLayout.astro';`
        )
        .replace(
            /const siteId = import\.meta\.env\.SITE_ID \|\| 'fastvistos';/,
            `const siteId = '${siteId}';`
        )
        .replace(/import '\.\.\/\.\.\/styles\/global\.css';/g, `import '../../styles/global.css';`);

    // Localize SharedBlogLayout
    const localizedSharedBlogLayout = sharedBlogLayout
        .replace(
            /import \{ getSiteConfig \} from '\.\.\/lib\/site-config\.js';/,
            `import { siteConfig } from '../site-config.ts';`
        )
        .replace(/const siteConfig = getSiteConfig\(\);/, `// siteConfig imported directly`)
        .replace(
            /const siteId = import\.meta\.env\.SITE_ID \|\| 'fastvistos';/,
            `const siteId = '${siteId}';`
        )
        .replace(/import '\.\.\/styles\/global\.css';/g, `import '../styles/global.css';`);

    // Localize SharedHomeLayout
    const localizedSharedHomeLayout = sharedHomeLayout
        .replace(
            /import \{ SiteConfigHelper \} from '\.\.\/lib\/site-config-helper\.ts';/,
            `import { SiteConfigHelper } from '../lib/site-config-helper.ts';`
        )
        .replace(
            /const siteConfig = await SiteConfigHelper\.loadSiteConfig\(\);/,
            `import { siteConfig } from '../site-config.ts';\n// const siteConfig = await SiteConfigHelper.loadSiteConfig();`
        )
        .replace(/import '\.\.\/styles\/global\.css';/g, `import '../styles/global.css';`);

    // Localize SEO components
    const localizedSeoMetaComponent = seoMetaComponent
        .replace(
            /import OpenGraph from '\.\/OpenGraph\.astro';/,
            `import OpenGraph from './OpenGraph.astro';`
        )
        .replace(
            /import TwitterCard from '\.\/TwitterCard\.astro';/,
            `import TwitterCard from './TwitterCard.astro';`
        );

    // Ensure directories exist
    await ensureDir(siteBlogDir);
    await ensureDir(sitePagesDir);
    await ensureDir(siteLibDir);
    await ensureDir(siteLayoutsDir);
    await ensureDir(siteComponentsDir);
    await ensureDir(siteStylesDir);

    // Write localized templates (strip comments)
    await fs.writeFile(
        join(siteBlogDir, 'index.astro'),
        stripAstroComments(localizedIndexTemplate)
    );
    await fs.writeFile(
        join(siteBlogDir, '[...slug].astro'),
        stripAstroComments(localizedPostTemplate)
    );

    // Write localized layout (strip comments)
    await fs.writeFile(
        join(siteLayoutsDir, 'SharedBlogLayout.astro'),
        stripAstroComments(localizedSharedBlogLayout)
    );
    await fs.writeFile(
        join(siteLayoutsDir, 'SharedHomeLayout.astro'),
        stripAstroComments(localizedSharedHomeLayout)
    );

    // Copy all core components automatically (except SEOMeta which needs localization)
    // This approach automatically copies ALL .astro files from core/components,
    // so we never need to update this script when adding new components
    console.log(`📦 Copying all components to ${siteId}...`);
    await copyDirectory(CORE_COMPONENTS_DIR, siteComponentsDir);

    // Overwrite SEOMeta with localized version (special case for site-specific config)
    await fs.writeFile(
        join(siteComponentsDir, 'SEOMeta.astro'),
        stripAstroComments(localizedSeoMetaComponent)
    );

    // Write core styles
    await fs.writeFile(join(siteStylesDir, 'markdown-blog.css'), markdownBlogCSS);

    // Sync core library files to site lib directory
    await fs.writeFile(join(siteLibDir, 'blog-service.ts'), blogServiceContent);
    await fs.writeFile(join(siteLibDir, 'site-config.ts'), siteConfigContent);

    // Localize site-config-helper.ts for this specific site
    const localizedSiteConfigHelper = siteConfigHelperContent
        .replace(
            /const module = await import\(`\.\.\/\.\.\/sites\/\$\{siteId\}\/site-config\.ts`\);/,
            `const module = await import('../site-config.ts');`
        )
        .replace(
            /const fallback = await import\(`\.\.\/\.\.\/sites\/fastvistos\/site-config\.ts`\);/,
            `const fallback = await import('../site-config.ts');`
        )
        .replace(
            /const siteId = import\.meta\.env\.SITE_ID \|\| 'fastvistos';/,
            `const siteId = '${siteId}';`
        );

    await fs.writeFile(join(siteLibDir, 'site-config-helper.ts'), localizedSiteConfigHelper);
    await fs.writeFile(join(siteLibDir, 'prisma.js'), prismaContent);

    console.log(`✅ Blog synced to ${siteId}`);
}

async function syncAllSites() {
    console.log('🔄 Starting blog sync to all sites...');

    const sites = await getSites();

    for (const siteId of sites) {
        await syncBlogToSite(siteId);
    }

    console.log('🎉 All sites synced successfully!');
}

async function syncSpecificSite(siteId) {
    console.log(`🔄 Starting blog sync for ${siteId} only...`);

    const sites = await getSites();

    if (!sites.includes(siteId)) {
        console.error(`❌ Site '${siteId}' not found. Available sites: ${sites.join(', ')}`);
        process.exit(1);
    }

    await syncBlogToSite(siteId);

    console.log(`🎉 Site ${siteId} synced successfully!`);
}

async function main() {
    // Get command line arguments
    const args = process.argv.slice(2);
    const siteArg = args.find((arg) => arg.startsWith('--site='));

    if (siteArg) {
        // Sync specific site: node sync-blog.js --site=fastvistos
        const siteId = siteArg.split('=')[1];
        await syncSpecificSite(siteId);
    } else if (args.length === 1 && !args[0].startsWith('--')) {
        // Sync specific site: node sync-blog.js fastvistos
        const siteId = args[0];
        await syncSpecificSite(siteId);
    } else {
        // Sync all sites: node sync-blog.js
        await syncAllSites();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { syncAllSites, syncBlogToSite, syncSpecificSite };
