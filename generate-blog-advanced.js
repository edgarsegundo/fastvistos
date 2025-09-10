#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma client
const prisma = new PrismaClient();

// Configuration
const CONTENT_BLOG_DIR = path.join(__dirname, 'src', 'content', 'blog');

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

// Enhanced generate function
async function generateBlogArticles() {
  try {
    console.log('🔍 Fetching articles from database...');
    
    const now = new Date();
    const articles = await prisma.blogArticle.findMany({
      where: {
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

    console.log(`📝 Found ${articles.length} published articles`);
    
    for (const article of articles) {
      if (!article.slug) continue;
      
      const filename = `${article.slug}.md`;
      const filePath = path.join(CONTENT_BLOG_DIR, filename);
      
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
    
    console.log(`🎉 Successfully generated ${articles.length} markdown files!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateBlogArticles();
