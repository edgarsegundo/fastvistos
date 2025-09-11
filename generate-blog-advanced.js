#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma client
const prisma = new PrismaClient();

// Function to get site configuration
function getSiteConfig(siteId) {
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
    name: nameMatch ? nameMatch[1] : siteId
  };
}

// Function to get available sites
function getAvailableSites() {
  const sitesDir = path.join(__dirname, 'multi-sites', 'sites');
  return fs.readdirSync(sitesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
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

// Function to convert HTML to Markdown (basic conversion)
function htmlToMarkdown(html) {
  if (!html) return '';
  
  return html
    // Convert headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    
    // Convert paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    
    // Convert line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    
    // Convert bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    
    // Convert links
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    // Convert images
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![$1]($2)')
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![]($1)')
    
    // Convert lists
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      let counter = 1;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
    })
    
    // Convert blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n\n')
    
    // Convert code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n\n')
    
    // Remove remaining HTML tags
    .replace(/<[^>]*>/g, '')
    
    // Clean up whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Enhanced generate function with multi-site support
async function generateBlogArticles(siteId) {
  try {
    const siteConfig = getSiteConfig(siteId);
    
    console.log(`🔍 Fetching articles from database for site: ${siteId}...`);
    console.log(`🏢 Business ID: ${siteConfig.business_id}`);
    
    // Ensure content directory exists and get the path
    const contentDir = ensureContentDirectory(siteId);
    console.log(`📁 Content directory: ${contentDir}`);
    
    const now = new Date();
    const articles = await prisma.blogArticle.findMany({
      where: {
        business_id: siteConfig.business_id,
        is_removed: false,
        published: {
          lte: now
        }
      },
      include: {
        blog_topic: true
      },
      orderBy: {
        published: 'desc'
      }
    });

    console.log(`📝 Found ${articles.length} published articles for ${siteId}`);
    
    for (const article of articles) {
      if (!article.slug) continue;
      
      const filename = `${article.slug}.md`;
      const filePath = path.join(contentDir, filename);
      
      // Determine content source priority: content_md > content_html > content_raw
      let content = '';
      if (article.content_md) {
        content = article.content_md;
        console.log(`📄 Using Markdown content for: ${filename}`);
      } else if (article.content_html) {
        content = htmlToMarkdown(article.content_html);
        console.log(`🔄 Converted HTML to Markdown for: ${filename}`);
      } else if (article.content_raw) {
        content = article.content_raw;
        console.log(`📝 Using raw content for: ${filename}`);
      } else {
        console.log(`⚠️  No content found for: ${filename}`);
        continue;
      }
      
      const publishedDate = new Date(article.published).toISOString().split('T')[0];
      const modifiedDate = new Date(article.modified).toISOString().split('T')[0];
      
      const frontmatter = `---
title: "${article.title.replace(/"/g, '\\"')}"
description: "${(article.metatitle || article.title).replace(/"/g, '\\"')}"
pubDate: "${publishedDate}"
updatedDate: "${modifiedDate}"
slug: "${article.slug}"
topic: "${article.blog_topic.title}"
topicSlug: "${article.blog_topic.slug || ''}"
image: "${article.image ? `/assets/images/blog/${article.image.replace(/^.*\//, '')}` : ''}"
type: "${article.type}"
published: true
---

${content}`;
      
      fs.writeFileSync(filePath, frontmatter, 'utf8');
      console.log('✅ Generated:', filename);
    }
    
    console.log(`🎉 Successfully generated ${articles.length} markdown files for ${siteId}!`);
    return articles.length;
    
  } catch (error) {
    console.error(`❌ Error generating content for ${siteId}:`, error);
    return 0;
  }
}

// Main execution with command-line argument support
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
📝 Advanced Blog Content Generator with HTML-to-Markdown Conversion

Usage:
  node generate-blog-advanced.js <site>      Generate content for specific site
  node generate-blog-advanced.js all         Generate content for all sites
  node generate-blog-advanced.js --help      Show this help message

Examples:
  node generate-blog-advanced.js fastvistos
  node generate-blog-advanced.js conceptvistos
  node generate-blog-advanced.js vibecode
  node generate-blog-advanced.js all

Features:
  • Converts HTML content to Markdown
  • Business ID filtering for multi-tenant support
  • Priority content selection: content_md > content_html > content_raw
  • Enhanced HTML-to-Markdown conversion with proper formatting
`);
    process.exit(0);
  }

  const siteArg = args[0];

  try {
    if (siteArg === 'all') {
      console.log('🚀 Generating advanced blog content for all sites...\n');
      const sites = getAvailableSites();
      let totalGenerated = 0;
      
      for (const site of sites) {
        console.log(`\n--- Processing ${site} ---`);
        try {
          const generated = await generateBlogArticles(site);
          totalGenerated += generated;
        } catch (error) {
          console.error(`❌ Failed to process ${site}:`, error.message);
        }
      }
      
      console.log(`\n🎉 Advanced content generation complete! Total articles: ${totalGenerated}`);
    } else {
      // Single site
      const sites = getAvailableSites();
      if (!sites.includes(siteArg)) {
        console.error(`❌ Unknown site: ${siteArg}`);
        console.log(`Available sites: ${sites.join(', ')}`);
        process.exit(1);
      }
      
      console.log(`🚀 Generating advanced blog content for: ${siteArg}\n`);
      const generated = await generateBlogArticles(siteArg);
      console.log(`\n🎉 Advanced content generation complete! Generated ${generated} articles for ${siteArg}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
