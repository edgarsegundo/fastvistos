#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

import { remark } from 'remark';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma client
const prisma = new PrismaClient();

// Function to get site configuration
async function getSiteConfig(siteId) {
    const siteConfigPath = path.join(__dirname, '..', 'multi-sites', 'sites', siteId, 'site-config.ts');

    if (!fs.existsSync(siteConfigPath)) {
        throw new Error(`Site config not found for site: ${siteId}. Path: ${siteConfigPath}`);
    }

    const configContent = fs.readFileSync(siteConfigPath, 'utf-8');

    const businessIdMatch = configContent.match(/business_id:\s*['"`]([^'"`]+)['"`]/);
    if (!businessIdMatch) {
        throw new Error(`business_id not found in site config for site: ${siteId}`);
    }

    const domainMatch = configContent.match(/domain:\s*['"`]([^'"`]+)['"`]/);
    const nameMatch = configContent.match(/name:\s*['"`]([^'"`]+)['"`]/);

    return {
        id: siteId,
        business_id: businessIdMatch[1],
        domain: domainMatch ? domainMatch[1] : siteId + '.com',
        name: nameMatch ? nameMatch[1] : siteId,
    };
}

// Function to get available sites
function getAvailableSites() {
    const sitesDir = path.join(__dirname, '..', 'multi-sites', 'sites');
    return fs
        .readdirSync(sitesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
}

// Function to ensure content directory exists for a site
function ensureContentDirectory(siteId) {
    const contentBlogDir = path.join(__dirname, '..', 'multi-sites', 'sites', siteId, 'content', 'blog');

    if (!fs.existsSync(contentBlogDir)) {
        fs.mkdirSync(contentBlogDir, { recursive: true });
        console.log('📁 Created directory:', contentBlogDir);
    }

    return contentBlogDir;
}

// Function to ensure content config exists for a site
function ensureContentConfig(siteId) {
    const srcConfigPath = path.join(
        __dirname,
        '..',
        'multi-sites',
        'core',
        'lib',
        'content-config-template.ts'
    );
    const destConfigDir = path.join(__dirname, '..', 'multi-sites', 'sites', siteId, 'content');
    const destConfigPath = path.join(destConfigDir, 'config.ts');

    if (!fs.existsSync(destConfigDir)) {
        fs.mkdirSync(destConfigDir, { recursive: true });
    }

    fs.copyFileSync(srcConfigPath, destConfigPath);
    console.log(`📄 Copied content-config-template.ts to ${destConfigPath}`);
}

// Function to sanitize filename
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9\-_]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
}

// Sanitize a string for use inside a YAML single-quoted scalar.
function sanitizeYamlString(value) {
    if (!value) return '';
    return String(value)
        .replace(/'/g, "''")
        .replace(/\r?\n/g, ' ')
        .trim();
}

// Remove H1 Markdown do início do conteúdo
function removeLeadingH1(markdown) {
    if (!markdown) return '';
    const lines = markdown.split('\n');
    if (lines[0].trim().startsWith('# ')) {
        lines.shift();
        while (lines[0] && lines[0].trim() === '') {
            lines.shift();
        }
    }
    return lines.join('\n');
}

// Function to generate frontmatter and content
function generateMarkdownContent(article) {
    const publishedDate = new Date(article.published).toISOString();
    const modifiedDate = new Date(article.modified).toISOString();

    let content = article.content_md
        ? removeLeadingH1(article.content_md)
        : (article.content_html || '');

    // Count words using remark
    const tree = remark().use(remarkParse).parse(content);
    let wordCount = 0;
    visit(tree, 'text', (node) => {
        wordCount += node.value.split(/\s+/).filter(Boolean).length;
    });

    const frontmatter = `---
title: '${sanitizeYamlString(article.title)}'
description: '${sanitizeYamlString(article.description)}'
pubDate: '${publishedDate}'
updatedDate: '${modifiedDate}'
slug: '${article.slug}'
topic: '${sanitizeYamlString(article.blog_topic?.title)}'
topicSlug: '${article.blog_topic?.slug || ''}'
image: '/assets/images/blog/${article.image && typeof article.image === 'string' ? article.image.replace(/^.*\//, '') : ''}'
type: '${article.type}'
published: true
wordCount: '${wordCount}'
---

`;

    return frontmatter + content;
}

// --- Incremental generation helpers ---

function getLastRunTime(siteId) {
    const filePath = path.join(__dirname, `.last-run-${siteId}.json`);
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return new Date(data.lastRun);
    } catch {
        return new Date(0);
    }
}

function saveLastRunTime(siteId) {
    const filePath = path.join(__dirname, `.last-run-${siteId}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ lastRun: new Date().toISOString() }));
}

// Main function to generate blog articles for a specific site
async function generateBlogArticles(siteId, { forceFullRegen = false, slug = null } = {}) {
    try {
        console.log(`🔍 Generating blog content for site: ${siteId}`);

        const siteConfig = await getSiteConfig(siteId);
        console.log(`📋 Site: ${siteConfig.name} (${siteConfig.domain})`);
        console.log(`🏢 Business ID: ${siteConfig.business_id}`);

        const contentBlogDir = ensureContentDirectory(siteId);
        ensureContentConfig(siteId);

        const businessIdCleaned = siteConfig.business_id.replace(/-/g, '');
        const now = new Date();

        // Se slug informado, gera apenas um artigo
        if (slug) {
            const article = await prisma.blog_article.findFirst({
                where: {
                    business_id: businessIdCleaned,
                    is_removed: false,
                    published: { lte: now },
                    slug: slug,
                },
                include: { blog_topic: true },
            });
            if (!article) {
                console.log(`❌ Article with slug '${slug}' not found for site '${siteId}'.`);
                return;
            }
            const filename = `${sanitizeFilename(article.slug)}.md`;
            const filePath = path.join(contentBlogDir, filename);
            const markdownContent = generateMarkdownContent(article);
            fs.writeFileSync(filePath, markdownContent, 'utf8');
            console.log('✅ Generated single article:', filename);
            return;
        }

        // Melhoria 2: query auxiliar de slugs ativos para diff de disco
        const activeSlugs = await prisma.blog_article.findMany({
            where: {
                business_id: businessIdCleaned,
                is_removed: false,
                published: { lte: now },
            },
            select: { slug: true },
        });

        const activeFilenames = new Set(
            activeSlugs.filter((a) => a.slug).map((a) => sanitizeFilename(a.slug) + '.md')
        );

        // Remove apenas arquivos sem correspondência no banco
        const existingFiles = fs
            .readdirSync(contentBlogDir)
            .filter((f) => f.endsWith('.md') && f !== 'first-post.md');

        for (const file of existingFiles) {
            if (!activeFilenames.has(file)) {
                fs.unlinkSync(path.join(contentBlogDir, file));
                console.log('🗑️  Removido:', file);
            }
        }

        // Melhoria 3: filtro Prisma por modified via .last-run-*.json
        const lastRun = forceFullRegen ? new Date(0) : getLastRunTime(siteId);
        const isIncremental = lastRun.getTime() > 0;

        const articles = await prisma.blog_article.findMany({
            where: {
                business_id: businessIdCleaned,
                is_removed: false,
                published: { lte: now },
                ...(isIncremental && { modified: { gt: lastRun } }),
            },
            include: { blog_topic: true },
            orderBy: { published: 'desc' },
        });

        console.log(
            isIncremental
                ? `📝 ${articles.length} artigos modificados desde ${lastRun.toISOString()}`
                : `📝 ${articles.length} artigos encontrados (geração completa)`
        );

        // Melhoria 1: comparação por mtime antes de escrever
        let generatedCount = 0;

        for (const article of articles) {
            if (!article.slug) {
                console.log('⚠️  Skipping article without slug:', article.title);
                continue;
            }

            const filename = `${sanitizeFilename(article.slug)}.md`;
            const filePath = path.join(contentBlogDir, filename);

            if (!forceFullRegen && fs.existsSync(filePath)) {
                const fileMtime = new Date(fs.statSync(filePath).mtime);
                const articleModified = new Date(article.modified);
                if (articleModified <= fileMtime) {
                    console.log('⏭️  Unchanged, skipping:', filename);
                    continue;
                }
            }

            const markdownContent = generateMarkdownContent(article);
            fs.writeFileSync(filePath, markdownContent, 'utf8');
            console.log('✅ Generated:', filename);
            generatedCount++;
        }

        // Salva lastRun apenas se chegou até aqui sem exceção
        saveLastRunTime(siteId);

        console.log(
            `🎉 Successfully generated/updated ${generatedCount} markdown files for ${siteConfig.name}!`
        );
    } catch (error) {
        console.error(`❌ Error generating content for ${siteId}:`, error.message);
        throw error;
    }
}

// Watch mode
async function watchForChanges(siteId) {
    console.log(`👀 Watching for database changes for ${siteId}... (Press Ctrl+C to stop)`);

    setInterval(async () => {
        try {
            await generateBlogArticles(siteId);
        } catch (error) {
            console.error('❌ Error during watch:', error);
        }
    }, 60000);
}

// Main execution logic
async function main() {
    try {
        const args = process.argv.slice(2);
        const shouldWatch = args.includes('--watch') || args.includes('-w');
        const forceFullRegen = args.includes('--full');

        let siteId = args.find((arg) => !arg.startsWith('--') && !arg.startsWith('-'));

        if (!siteId) {
            console.log('📝 Blog Content Generator');
            console.log('=========================\n');

            const availableSites = getAvailableSites();
            console.log('📋 Available sites:', availableSites.join(', '));
            console.log('\n💡 Usage:');
            console.log('  node generate-blog-content.js <site-id> [--watch] [--full]');
            console.log('  node generate-blog-content.js fastvistos');
            console.log('  node generate-blog-content.js fastvistos --watch');
            console.log('  node generate-blog-content.js fastvistos --full');
            console.log('  node generate-blog-content.js all');
            console.log('  node generate-blog-content.js all --full');

            process.exit(1);
        }

        if (siteId === 'all') {
            const availableSites = getAvailableSites();
            console.log(`🔄 Generating blog content for all sites: ${availableSites.join(', ')}`);

            for (const site of availableSites) {
                try {
                    await generateBlogArticles(site, { forceFullRegen });
                    console.log(`✅ Completed: ${site}\n`);
                } catch (error) {
                    console.error(`❌ Failed for ${site}:`, error.message);
                }
            }
        } else {
            const availableSites = getAvailableSites();
            if (!availableSites.includes(siteId)) {
                console.error(
                    `❌ Site '${siteId}' not found. Available sites: ${availableSites.join(', ')}`
                );
                process.exit(1);
            }

            if (shouldWatch) {
                console.log(`🔄 Running in watch mode for ${siteId}...`);
                await generateBlogArticles(siteId, { forceFullRegen });
                await watchForChanges(siteId);
            } else {
                await generateBlogArticles(siteId, { forceFullRegen });
            }
        }
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();