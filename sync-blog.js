#!/usr/bin/env node

/**
 * Blog Sync Script
 * Syncs the core blog templates to all sites before building
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { stripAstroComments } from './utils/stripAstroComments.js';
import { v4 as uuidv4 } from 'uuid';

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

async function handleTemplateAstroFile(src, dest, siteId) {
    const destTemplate = dest.replace('.template.astro', '.astro');
    // Only copy if destination does not exist
    try {
        await fs.access(destTemplate);
        // File exists, skip copying
        return;
    } catch {
        // File does not exist, copy and rename
        let content = await fs.readFile(src, 'utf-8');
        content = await injectUpdatableSectionMetadata(content, src, siteId);
        const stripped = stripAstroComments(content);
        await fs.writeFile(destTemplate, stripped);
    }
}

async function injectUpdatableSectionMetadata(content, src, siteId) {
    // Detect <div ...> tag containing 'updatable-'
    const divRegex = /<div[^>]*updatable-[^>]*>/;
    const match = content.match(divRegex);
    if (match) {
        // Generate dynamic values
        const uuid = uuidv4();
        // Robust filename extraction
        let filename = src.split('/').pop();
        if (filename.endsWith('.template.astro')) {
            filename = filename.replace('.template.astro', '');
        } else if (filename.endsWith('.astro')) {
            filename = filename.replace('.astro', '');
        }
        const sectionTitle = filename.replace(/([A-Z])/g, ' $1').trim();
        // Use provided siteId directly
        const filePath = `multi-sites/sites/${siteId}/components/${filename}.astro`;
        // Read business_id from site-config.ts
        const configPath = `multi-sites/sites/${siteId}/site-config.ts`;
        let businessId = '';
        try {
            const configContent = await fs.readFile(configPath, 'utf-8');
            // Support both business_id: and businessId:
            const businessIdMatch = configContent.match(
                /business[_I]id\s*[:=]\s*['\"`]([^'\"`]+)['\"`]/i
            );
            businessId = businessIdMatch ? businessIdMatch[1] : '';
        } catch {}
        // Replace <div ...> with injected attributes
        const newDiv = `<div 
    updatable-section-uuid="${uuid}" 
    updatable-section-title="${sectionTitle}"
    updatable-section-filepath="${filePath}"
    updatable-section-siteid="${siteId}"
    updatable-section-businessid="${businessId}"
>`;
        content = content.replace(divRegex, newDiv);
    }
    return content;
}

async function copyFile(src, dest, siteId) {
    try {
        if (src.endsWith('.template.astro')) {
            await handleTemplateAstroFile(src, dest, siteId);
            return;
        }
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

async function copyDirectory(src, dest, siteId) {
    try {
        await ensureDir(dest);
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = join(src, entry.name);
            const destPath = join(dest, entry.name);

            if (entry.isDirectory()) {
                await copyDirectory(srcPath, destPath, siteId);
            } else if (entry.isFile() && entry.name.endsWith('.astro')) {
                // Only copy .astro files from components
                await copyFile(srcPath, destPath, siteId);
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
    // Copy updatable-editor.js to each site's lib folder
    try {
        const coreEditorPath = join(__dirname, 'multi-sites/core/lib/updatable-editor.js');
        const siteLibDir = join(__dirname, `multi-sites/sites/${siteId}/lib`);
        const siteEditorPath = join(siteLibDir, 'updatable-editor.js');
        await ensureDir(siteLibDir);
        // Always copy first
        await fs.copyFile(coreEditorPath, siteEditorPath);
        console.log(`📝 Copied updatable-editor.js to multi-sites/sites/${siteId}/lib/`);
        // Copy webpage-faq.ts to each site's lib folder
        const coreFaqPath = join(__dirname, 'multi-sites/core/lib/webpage-faq.ts');
        const siteFaqPath = join(siteLibDir, 'webpage-faq.ts');
        try {
            await fs.copyFile(coreFaqPath, siteFaqPath);
            console.log(`📄 Copied webpage-faq.ts to multi-sites/sites/${siteId}/lib/`);
        } catch (faqErr) {
            console.error(`❌ Error copying webpage-faq.ts to multi-sites/sites/${siteId}/lib/:`, faqErr);
        }

        // Copy faq-json.ts to each site's lib folder
        const coreFaqJsonPath = join(__dirname, 'multi-sites/core/lib/faq-json.ts');
        const siteFaqJsonPath = join(siteLibDir, 'faq-json.ts');
        try {
            await fs.copyFile(coreFaqJsonPath, siteFaqJsonPath);
            console.log(`📄 Copied faq-json.ts to multi-sites/sites/${siteId}/lib/`);
        } catch (faqJsonErr) {
            console.error(`❌ Error copying faq-json.ts to multi-sites/sites/${siteId}/lib/:`, faqJsonErr);
        }

        // Copy related-articles.ts to each site's lib folder
        const coreRelatedArticlesPath = join(__dirname, 'multi-sites/core/lib/related-articles.ts');
        const siteRelatedArticlesPath = join(siteLibDir, 'related-articles.ts');
        try {
            await fs.copyFile(coreRelatedArticlesPath, siteRelatedArticlesPath);
            console.log(`📄 Copied related-articles.ts to multi-sites/sites/${siteId}/lib/`);
        } catch (relatedArticlesErr) {
            console.error(`❌ Error copying related-articles.ts to multi-sites/sites/${siteId}/lib/:`, relatedArticlesErr);
        }

        // Copy content-parser.ts to each site's lib folder
        const coreContentParserPath = join(__dirname, 'multi-sites/core/lib/content-parser.ts');
        const siteContentParserPath = join(siteLibDir, 'content-parser.ts');
        try {
            await fs.copyFile(coreContentParserPath, siteContentParserPath);
            console.log(`📄 Copied content-parser.ts to multi-sites/sites/${siteId}/lib/`);
        } catch (contentParserErr) {
            console.error(`❌ Error copying content-parser.ts to multi-sites/sites/${siteId}/lib/:`, contentParserErr);
        }

        // Only truncate if running a build or preview command (after copy)
        const lifecycle = process.env.npm_lifecycle_event || '';
        if (lifecycle.startsWith('build:') || lifecycle.startsWith('preview:')) {
            try {
                await fs.writeFile(siteEditorPath, '');
                console.log(`🧹 Truncated ${siteEditorPath}`);
            } catch {}
        }
    } catch (err) {
        console.error(
            `❌ Error copying updatable-editor.js to multi-sites/sites/${siteId}/lib/:`,
            err
        );
    }

    console.log(`📄 Syncing blog to ${siteId}...`);

    const siteDir = join(__dirname, `multi-sites/sites/${siteId}`);
    const siteBlogDir = join(siteDir, 'pages/blog');
    const sitePagesDir = join(siteDir, 'pages');
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
    // const seoMetaComponent = await fs.readFile(join(CORE_COMPONENTS_DIR, 'SEOMeta.astro'), 'utf-8');

    // Read core styles
    const markdownBlogCSS = await fs.readFile(join(CORE_STYLES_DIR, 'markdown-blog.css'), 'utf-8');

    // Read core library files
    const blogServiceContent = await fs.readFile(join(CORE_LIB_DIR, 'blog-service.ts'), 'utf-8');
    const siteConfigContent = await fs.readFile(
        join(CORE_LIB_DIR, 'site-config-model.ts'),
        'utf-8'
    );
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

    // // Localize SEO components
    // const localizedSeoMetaComponent = seoMetaComponent
    //     .replace(
    //         /import OpenGraph from '\.\/OpenGraph\.astro';/,
    //         `import OpenGraph from './OpenGraph.astro';`
    //     )
    //     .replace(
    //         /import TwitterCard from '\.\/TwitterCard\.astro';/,
    //         `import TwitterCard from './TwitterCard.astro';`
    //     );

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
    await copyDirectory(CORE_COMPONENTS_DIR, siteComponentsDir, siteId);

    // // Overwrite SEOMeta with localized version (special case for site-specific config)
    // await fs.writeFile(
    //     join(siteComponentsDir, 'SEOMeta.astro'),
    //     stripAstroComments(localizedSeoMetaComponent)
    // );

    // Write core styles
    await fs.writeFile(join(siteStylesDir, 'markdown-blog.css'), markdownBlogCSS);

    // Sync core library files to site lib directory
    await fs.writeFile(join(siteLibDir, 'blog-service.ts'), blogServiceContent);
    await fs.writeFile(join(siteLibDir, 'site-config-model.ts'), siteConfigContent);

    // Copy webpage-service.ts to site lib directory
    const webpageServiceContent = await fs.readFile(
        join(CORE_LIB_DIR, 'webpage-service.ts'),
        'utf-8'
    );
    await fs.writeFile(join(siteLibDir, 'webpage-service.ts'), webpageServiceContent);

    // Copy utils.ts to site lib directory
    const utilsContent = await fs.readFile(join(CORE_LIB_DIR, 'utils.ts'), 'utf-8');
    await fs.writeFile(join(siteLibDir, 'utils.ts'), utilsContent);

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
