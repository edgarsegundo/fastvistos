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
    if (!fs.existsSync(sitesDir)) {
        return [];
    }
    return fs
        .readdirSync(sitesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
}

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('📁 Created directory:', dirPath);
    }
}

// Function to download a single image
async function downloadImage(imageUrl, localPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(localPath);

        https
            .get(imageUrl, (response) => {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log('✅ Downloaded:', path.basename(localPath));
                        resolve(true);
                    });
                } else {
                    console.log(
                        '❌ Failed to download:',
                        imageUrl,
                        '- Status:',
                        response.statusCode
                    );
                    fs.unlink(localPath, () => {}); // Delete the file if download failed
                    resolve(false);
                }
            })
            .on('error', (err) => {
                console.log('❌ Error downloading:', imageUrl, '-', err.message);
                fs.unlink(localPath, () => {}); // Delete the file if download failed
                resolve(false);
            });
    });
}

// Main function to download blog images for a specific site
async function downloadBlogImages(siteId) {
    try {
        console.log(`🔍 Fetching images for site: ${siteId}`);

        // Get site configuration
        const siteConfig = await getSiteConfig(siteId);
        console.log(`🏢 Business ID: ${siteConfig.business_id}`);

        // Create site-specific assets directory
        const LOCAL_ASSETS_DIR = path.join(
            __dirname,
            'public-sites',
            siteId,
            'assets',
            'images',
            'blog'
        );
        ensureDirectoryExists(LOCAL_ASSETS_DIR);

        // Get published articles for this specific site using business_id
        const now = new Date();
        const articles = await prisma.blog_article.findMany({
            where: {
                business_id: siteConfig.business_id,
                is_removed: false,
                published: {
                    lte: now,
                },
            },
            select: {
                image: true,
                title: true,
                slug: true,
            },
        });

        // Get blog topics for this specific site using business_id
        const topics = await prisma.blog_topic.findMany({
            where: {
                business_id: siteConfig.business_id,
                is_removed: false,
            },
            select: {
                image: true,
                title: true,
                slug: true,
            },
        });

        console.log(`📄 Found ${articles.length} published articles for ${siteId}`);
        console.log(`📂 Found ${topics.length} topics for ${siteId}`);

        const downloadPromises = [];
        const imageSet = new Set(); // To avoid downloading duplicates
        let downloadedCount = 0;
        let skippedCount = 0;

        // Process article images
        for (const article of articles) {
            if (article.image && !imageSet.has(article.image)) {
                imageSet.add(article.image);

                // Convert relative path to full URL
                const fullImageUrl = MEDIA_BASE_URL + article.image;

                // Create local filename (keep the same structure)
                const localFilename = article.image.replace(/^images\//, ''); // Remove 'images/' prefix if present
                const localPath = path.join(LOCAL_ASSETS_DIR, localFilename);

                // Ensure subdirectories exist
                const localDir = path.dirname(localPath);
                ensureDirectoryExists(localDir);

                // Check if file already exists
                if (!fs.existsSync(localPath)) {
                    downloadPromises.push(downloadImage(fullImageUrl, localPath));
                } else {
                    console.log('⏭️  Already exists (article):', localFilename);
                    skippedCount++;
                }
            }
        }

        // Process topic images
        for (const topic of topics) {
            if (topic.image && !imageSet.has(topic.image)) {
                imageSet.add(topic.image);

                // Convert relative path to full URL
                const fullImageUrl = MEDIA_BASE_URL + topic.image;

                // Create local filename (keep the same structure)
                const localFilename = topic.image.replace(/^images\//, ''); // Remove 'images/' prefix if present
                const localPath = path.join(LOCAL_ASSETS_DIR, localFilename);

                // Ensure subdirectories exist
                const localDir = path.dirname(localPath);
                ensureDirectoryExists(localDir);

                // Check if file already exists
                if (!fs.existsSync(localPath)) {
                    downloadPromises.push(downloadImage(fullImageUrl, localPath));
                } else {
                    console.log('⏭️  Already exists (topic):', localFilename);
                    skippedCount++;
                }
            }
        }

        console.log(`📥 Starting download of ${downloadPromises.length} new images...`);
        if (skippedCount > 0) {
            console.log(`⏭️  Skipped ${skippedCount} existing images`);
        }

        const results = await Promise.all(downloadPromises);
        downloadedCount = results.filter((result) => result === true).length;

        console.log(`🎉 Download complete for ${siteId}!`);
        console.log(`✅ Successfully downloaded: ${downloadedCount} images`);
        console.log(`📁 Images saved to: ${LOCAL_ASSETS_DIR}`);
    } catch (error) {
        console.error(`❌ Error downloading images for ${siteId}:`, error.message);
        throw error;
    }
}

// Function to download images for all sites
async function downloadAllSites() {
    try {
        const availableSites = getAvailableSites();
        console.log('🌐 Available sites:', availableSites.join(', '));

        for (const siteId of availableSites) {
            console.log(`\n🚀 Processing site: ${siteId}`);
            await downloadBlogImages(siteId);
        }

        console.log('\n🎉 All sites processed successfully!');
    } catch (error) {
        console.error('❌ Error processing sites:', error.message);
        throw error;
    }
}

// Help function
function showHelp() {
    console.log('🖼️  Blog Image Downloader');
    console.log('========================\n');
    console.log('Usage:');
    console.log('  node download-blog-images.js <site_id>  - Download images for specific site');
    console.log('  node download-blog-images.js all        - Download images for all sites');
    console.log('  node download-blog-images.js --help     - Show this help\n');
    console.log('Examples:');
    console.log('  node download-blog-images.js fastvistos');
    console.log('  node download-blog-images.js conceptvistos');
    console.log('  node download-blog-images.js all\n');
    console.log('Features:');
    console.log('  ✅ Site-specific image downloading based on business_id');
    console.log('  ✅ Images saved to public-sites/{site_id}/assets/images/blog/');
    console.log('  ✅ Automatic directory creation');
    console.log('  ✅ Duplicate detection and skipping');
    console.log('  ✅ Progress reporting and statistics');
}

// Main execution
async function main() {
    try {
        const args = process.argv.slice(2);
        const siteId = args[0];

        if (!siteId || siteId === '--help' || siteId === '-h') {
            showHelp();
            return;
        }

        if (siteId === 'all') {
            await downloadAllSites();
        } else {
            // Validate site exists
            const availableSites = getAvailableSites();
            if (!availableSites.includes(siteId)) {
                console.error(`❌ Site '${siteId}' not found.`);
                console.log('Available sites:', availableSites.join(', '));
                console.log('\nUse --help for usage information.');
                process.exit(1);
            }

            await downloadBlogImages(siteId);
        }
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
main();
