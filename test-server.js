#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './multi-sites/core/msitesapp/api/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable debug logging for testing
process.env.DEBUG_VERBOSE = 'true';

// Serve static files (for the HTML test interface)
app.use(express.static(__dirname));

// Mount the API routes
app.use(apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
            'GET /ping': 'Basic ping endpoint',
            'POST /api/optimize-image': 'Image optimization endpoint',
            'GET /test-image-optimization.html': 'Web test interface'
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log('\n🚀 Image Optimization Test Server Started!');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log('');
    console.log('🧪 Available Test Methods:');
    console.log(`   1. Web Interface: http://localhost:${PORT}/test-image-optimization.html`);
    console.log(`   2. Node.js Script: node test-image-optimization.js`);
    console.log(`   3. cURL Command: curl -X POST -F "file=@image.jpg" http://localhost:${PORT}/api/optimize-image --output optimized.webp`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log(`   - GET  http://localhost:${PORT}/health`);
    console.log(`   - GET  http://localhost:${PORT}/ping`);
    console.log(`   - POST http://localhost:${PORT}/api/optimize-image`);
    console.log('');
    console.log('💡 Press Ctrl+C to stop the server');
});

export default app;
