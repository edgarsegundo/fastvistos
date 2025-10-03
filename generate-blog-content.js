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
    const siteConfigPath = path.join(__dirname, 'multi-sites', 'sites', siteId, 'site-config.ts');

    if (!fs.existsSync(siteConfigPath)) {
        throw new Error(`Site config not found for site: ${siteId}. Path: ${siteConfigPath}`);
    }

    // Read and parse the site config file
    const configContent = fs.readFileSync(siteConfigPath, 'utf-8');

    // Extract business_id using regex (since we can't directly import .ts file)
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
    const sitesDir = path.join(__dirname, 'multi-sites', 'sites');
    return fs
        .readdirSync(sitesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
}

// Function to ensure content directory exists for a site
function ensureContentDirectory(siteId) {
    const contentBlogDir = path.join(__dirname, 'multi-sites', 'sites', siteId, 'content', 'blog');

    if (!fs.existsSync(contentBlogDir)) {
        fs.mkdirSync(contentBlogDir, { recursive: true });
        console.log('📁 Created directory:', contentBlogDir);
    }

    return contentBlogDir;
}

// Function to ensure content config exists for a site
function ensureContentConfig(siteId) {
    const srcConfigPath = path.join(__dirname, 'multi-sites', 'core', 'lib', 'content-config-template.ts');
    const destConfigDir = path.join(__dirname, 'multi-sites', 'sites', siteId, 'content');
    const destConfigPath = path.join(destConfigDir, 'config.ts');

    // Ensure destination directory exists
    if (!fs.existsSync(destConfigDir)) {
        fs.mkdirSync(destConfigDir, { recursive: true });
    }

    // Copy and rename the config file
    fs.copyFileSync(srcConfigPath, destConfigPath);
    console.log(`📄 Copied content-config-template.ts to ${destConfigPath}`);
}

// Function to sanitize filename
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9\-_]/gi, '-') // Replace non-alphanumeric with dash
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-|-$/g, '') // Remove leading/trailing dashes
        .toLowerCase();
}

// Function to generate frontmatter and content
function generateMarkdownContent(article) {
    // const publishedDate = new Date(article.published).toISOString().split('T')[0];
    // const modifiedDate = new Date(article.modified).toISOString().split('T')[0];
    const publishedDate = new Date(article.published).toISOString(); // e.g., "2025-09-09T00:00:00.000Z"
    const modifiedDate = new Date(article.modified).toISOString();

    // Add the markdown content
    const content = article.content_md || article.content_html || '';

    // Count words using remark
    const tree = remark().use(remarkParse).parse(content);
    let wordCount = 0;
    visit(tree, 'text', (node) => {
        wordCount += node.value.split(/\s+/).filter(Boolean).length;
    });

    // Create frontmatter
    const frontmatter = `---
title: "${article.title.replace(/"/g, '\\"')}"
description: "${(article.metatitle || article.title).replace(/"/g, '\\"')}"
pubDate: "${publishedDate}"
updatedDate: "${modifiedDate}"
slug: "${article.slug}"
topic: "${article.blog_topic.title}"
topicSlug: "${article.blog_topic.slug}"
image: "/assets/images/blog/${article.image ? article.image.replace(/^.*\//, '') : ''}"
type: "${article.type}"
published: true
wordCount: "${wordCount}"
---

`;

    return frontmatter + content;
}

// Main function to generate blog articles for a specific site
async function generateBlogArticles(siteId) {
    try {
        console.log(`🔍 Generating blog content for site: ${siteId}`);

        // Get site configuration
        const siteConfig = await getSiteConfig(siteId);
        console.log(`📋 Site: ${siteConfig.name} (${siteConfig.domain})`);
        console.log(`🏢 Business ID: ${siteConfig.business_id}`);

        // Ensure content directory exists
        const contentBlogDir = ensureContentDirectory(siteId);

        // Ensure content config exists
        ensureContentConfig(siteId);

        console.log('🔍 Fetching articles from database...');

        const businessIdCleaned = siteConfig.business_id.replace(/-/g, '');

        // Get published articles for this business_id with their topics
        const now = new Date();
        const articles = await prisma.blog_article.findMany({
            where: {
                business_id: businessIdCleaned,
                is_removed: false,
                published: {
                    lte: now,
                },
            },
            include: {
                blog_topic: true,
            },
            orderBy: {
                published: 'desc',
            },
        });

        console.log(`📝 Found ${articles.length} published articles for ${siteConfig.name}`);

        // Clear existing markdown files (optional - you might want to comment this out)
        const existingFiles = fs.readdirSync(contentBlogDir).filter((file) => file.endsWith('.md'));
        existingFiles.forEach((file) => {
            if (file !== 'first-post.md') {
                // Keep the sample file
                fs.unlinkSync(path.join(contentBlogDir, file));
                console.log('🗑️  Removed old file:', file);
            }
        });

        // Generate markdown files for each article
        let generatedCount = 0;

        for (const article of articles) {
            if (!article.slug) {
                console.log('⚠️  Skipping article without slug:', article.title);
                continue;
            }

            // Create filename from slug
            const filename = `${sanitizeFilename(article.slug)}.md`;
            const filePath = path.join(contentBlogDir, filename);

            // Generate markdown content
            const markdownContent = generateMarkdownContent(article);

            // Write file
            fs.writeFileSync(filePath, markdownContent, 'utf8');
            console.log('✅ Generated:', filename);
            generatedCount++;
        }

        console.log(
            `🎉 Successfully generated ${generatedCount} markdown files for ${siteConfig.name}!`
        );
    } catch (error) {
        console.error(`❌ Error generating content for ${siteId}:`, error.message);
        throw error;
    }
}

// Function to watch for changes and regenerate (optional)
async function watchForChanges(siteId) {
    console.log(`👀 Watching for database changes for ${siteId}... (Press Ctrl+C to stop)`);

    // Simple interval-based checking (you could use more sophisticated change detection)
    setInterval(async () => {
        try {
            await generateBlogArticles(siteId);
        } catch (error) {
            console.error('❌ Error during watch:', error);
        }
    }, 60000); // Check every minute
}

// Main execution logic
async function main() {
    try {
        // Check command line arguments
        const args = process.argv.slice(2);
        const shouldWatch = args.includes('--watch') || args.includes('-w');

        // Get site ID from command line arguments
        let siteId = args.find((arg) => !arg.startsWith('--'));

        if (!siteId) {
            console.log('� Blog Content Generator');
            console.log('=========================\n');

            const availableSites = getAvailableSites();
            console.log('📋 Available sites:', availableSites.join(', '));
            console.log('\n💡 Usage:');
            console.log('  node generate-blog-content.js <site-id> [--watch]');
            console.log('  node generate-blog-content.js fastvistos');
            console.log('  node generate-blog-content.js fastvistos --watch');
            console.log('  node generate-blog-content.js all  # Generate for all sites');

            process.exit(1);
        }

        if (siteId === 'all') {
            // Generate for all sites
            const availableSites = getAvailableSites();
            console.log(`🔄 Generating blog content for all sites: ${availableSites.join(', ')}`);

            for (const site of availableSites) {
                try {
                    await generateBlogArticles(site);
                    console.log(`✅ Completed: ${site}\n`);
                } catch (error) {
                    console.error(`❌ Failed for ${site}:`, error.message);
                }
            }
        } else {
            // Generate for specific site
            const availableSites = getAvailableSites();
            if (!availableSites.includes(siteId)) {
                console.error(
                    `❌ Site '${siteId}' not found. Available sites: ${availableSites.join(', ')}`
                );
                process.exit(1);
            }

            if (shouldWatch) {
                console.log(`🔄 Running in watch mode for ${siteId}...`);
                await generateBlogArticles(siteId);
                await watchForChanges(siteId);
            } else {
                await generateBlogArticles(siteId);
            }
        }
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the main function
main();
