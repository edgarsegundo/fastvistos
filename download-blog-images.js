#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma client
const prisma = new PrismaClient();

// Configuration
const MEDIA_BASE_URL = 'https://sys.fastvistos.com.br/media/';
const LOCAL_ASSETS_DIR = path.join(__dirname, 'public', 'assets', 'images', 'blog');

// Ensure the directory exists
if (!fs.existsSync(LOCAL_ASSETS_DIR)) {
  fs.mkdirSync(LOCAL_ASSETS_DIR, { recursive: true });
  console.log('📁 Created directory:', LOCAL_ASSETS_DIR);
}

// Function to download a single image
async function downloadImage(imageUrl, localPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localPath);
    
    https.get(imageUrl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('✅ Downloaded:', path.basename(localPath));
          resolve(true);
        });
      } else {
        console.log('❌ Failed to download:', imageUrl, '- Status:', response.statusCode);
        fs.unlink(localPath, () => {}); // Delete the file if download failed
        resolve(false);
      }
    }).on('error', (err) => {
      console.log('❌ Error downloading:', imageUrl, '-', err.message);
      fs.unlink(localPath, () => {}); // Delete the file if download failed
      resolve(false);
    });
  });
}

// Main function to download all blog images
async function downloadBlogImages() {
  try {
    console.log('🔍 Fetching articles from database...');
    
    // Get published articles directly with Prisma
    const now = new Date();
    const articles = await prisma.blogArticle.findMany({
      where: {
        is_removed: false,
        published: {
          lte: now
        }
      },
      select: {
        image: true,
        title: true,
        slug: true
      }
    });
    
    const downloadPromises = [];
    const imageSet = new Set(); // To avoid downloading duplicates
    
    for (const article of articles) {
      if (article.image && !imageSet.has(article.image)) {
        imageSet.add(article.image);
        
        // Convert relative path to full URL
        const fullImageUrl = MEDIA_BASE_URL + article.image;
        
        // Create local filename (keep the same structure)
        const localFilename = article.image.replace(/^images\//, ''); // Remove 'images/' prefix
        const localPath = path.join(LOCAL_ASSETS_DIR, localFilename);
        
        // Check if file already exists
        if (!fs.existsSync(localPath)) {
          downloadPromises.push(downloadImage(fullImageUrl, localPath));
        } else {
          console.log('⏭️  Already exists:', localFilename);
        }
      }
    }
    
    console.log(`📥 Starting download of ${downloadPromises.length} images...`);
    await Promise.all(downloadPromises);
    console.log('🎉 Download complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
downloadBlogImages();
