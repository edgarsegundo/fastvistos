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

// Ensure the directory exists
if (!fs.existsSync(CONTENT_BLOG_DIR)) {
  fs.mkdirSync(CONTENT_BLOG_DIR, { recursive: true });
  console.log('📁 Created directory:', CONTENT_BLOG_DIR);
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
  const publishedDate = new Date(article.published).toISOString().split('T')[0];
  const modifiedDate = new Date(article.modified).toISOString().split('T')[0];
  
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
---

`;

  // Add the markdown content
  const content = article.content_md || article.content_html || '';
  
  return frontmatter + content;
}

// Main function to generate blog articles
async function generateBlogArticles() {
  try {
    console.log('🔍 Fetching articles from database...');
    
    // Get published articles with their topics
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
    
    // Clear existing markdown files (optional - you might want to comment this out)
    const existingFiles = fs.readdirSync(CONTENT_BLOG_DIR).filter(file => file.endsWith('.md'));
    existingFiles.forEach(file => {
      if (file !== 'first-post.md') { // Keep the sample file
        fs.unlinkSync(path.join(CONTENT_BLOG_DIR, file));
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
      const filePath = path.join(CONTENT_BLOG_DIR, filename);
      
      // Generate markdown content
      const markdownContent = generateMarkdownContent(article);
      
      // Write file
      fs.writeFileSync(filePath, markdownContent, 'utf8');
      console.log('✅ Generated:', filename);
      generatedCount++;
    }
    
    console.log(`🎉 Successfully generated ${generatedCount} markdown files!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to watch for changes and regenerate (optional)
function watchForChanges() {
  console.log('👀 Watching for database changes... (Press Ctrl+C to stop)');
  
  // Simple interval-based checking (you could use more sophisticated change detection)
  setInterval(async () => {
    try {
      await generateBlogArticles();
    } catch (error) {
      console.error('❌ Error during watch:', error);
    }
  }, 60000); // Check every minute
}

// Check command line arguments
const args = process.argv.slice(2);
const shouldWatch = args.includes('--watch') || args.includes('-w');

if (shouldWatch) {
  console.log('🔄 Running in watch mode...');
  generateBlogArticles().then(() => {
    watchForChanges();
  });
} else {
  generateBlogArticles();
}
