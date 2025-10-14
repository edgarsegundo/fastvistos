#!/usr/bin/env node

import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = 'http://localhost:3001'; // Adjust this to your API server URL
const TEST_IMAGE_PATH = path.join(__dirname, 'public-sites/fastvistos/favicon.png');
const OUTPUT_PATH = path.join(__dirname, 'test-optimized-output.webp');

async function testImageOptimization() {
    console.log('🧪 Testing Image Optimization Endpoint\n');
    
    try {
        // Check if test image exists
        if (!fs.existsSync(TEST_IMAGE_PATH)) {
            console.error(`❌ Test image not found: ${TEST_IMAGE_PATH}`);
            console.log('💡 Available images to test with:');
            
            // Look for other images
            const publicDir = path.join(__dirname, 'public-sites/fastvistos');
            if (fs.existsSync(publicDir)) {
                const files = fs.readdirSync(publicDir)
                    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
                    .slice(0, 5);
                files.forEach(file => console.log(`   - ${path.join(publicDir, file)}`));
            }
            return;
        }

        // Get file stats
        const stats = fs.statSync(TEST_IMAGE_PATH);
        console.log(`📁 Test Image: ${path.basename(TEST_IMAGE_PATH)}`);
        console.log(`📊 Original Size: ${stats.size} bytes (${(stats.size / 1024).toFixed(2)} KB)`);
        console.log(`🌐 API Endpoint: ${API_BASE_URL}/api/optimize-image`);
        console.log('');

        // Create form data
        const form = new FormData();
        form.append('file', fs.createReadStream(TEST_IMAGE_PATH), {
            filename: path.basename(TEST_IMAGE_PATH),
            contentType: 'image/png'
        });

        console.log('📤 Uploading image for optimization...');
        
        // Make the API request
        const response = await fetch(`${API_BASE_URL}/api/optimize-image`, {
            method: 'POST',
            body: form,
            headers: {
                ...form.getHeaders()
            }
        });

        console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
        console.log('📋 Response Headers:');
        response.headers.forEach((value, key) => {
            console.log(`   ${key}: ${value}`);
        });
        console.log('');

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error: ${response.status}`);
            console.error(`📄 Response Body: ${errorText}`);
            return;
        }

        // Save optimized image
        const buffer = await response.buffer();
        fs.writeFileSync(OUTPUT_PATH, buffer);
        
        const optimizedStats = fs.statSync(OUTPUT_PATH);
        const compressionRatio = ((stats.size - optimizedStats.size) / stats.size * 100);
        
        console.log('✅ Image optimization successful!');
        console.log(`📁 Output: ${OUTPUT_PATH}`);
        console.log(`📊 Optimized Size: ${optimizedStats.size} bytes (${(optimizedStats.size / 1024).toFixed(2)} KB)`);
        console.log(`💾 Compression: ${compressionRatio.toFixed(1)}% reduction`);
        console.log(`⚡ Savings: ${stats.size - optimizedStats.size} bytes`);
        
        if (compressionRatio > 0) {
            console.log('🎉 Great! The image was successfully compressed.');
        } else {
            console.log('ℹ️  The WebP version is slightly larger (normal for small images with transparency).');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Make sure your API server is running');
            console.log('   2. Check if the server is running on port 3000');
            console.log('   3. Verify the endpoint URL is correct');
        }
    }
}

// Show usage information
function showUsage() {
    console.log('🖼️  Image Optimization Test Script');
    console.log('');
    console.log('📋 Usage:');
    console.log('   node test-image-optimization.js');
    console.log('');
    console.log('📝 Prerequisites:');
    console.log('   1. API server must be running');
    console.log('   2. Test image must exist');
    console.log('   3. FFmpeg must be installed');
    console.log('');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
    showUsage();
    testImageOptimization();
}
