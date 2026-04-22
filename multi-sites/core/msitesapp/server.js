import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import api from './api/api.js';
import { config } from './config.js';
import fs from 'fs';
// import imageEditorApiStubs from './image-editor-api-stubs.js';

const PORT = config.server.port;

const app = express();

// Add process error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process, just log the error
});

// --- Admin Image Uploader (Mobile) ---
app.use('/admin', (req, res, next) => {
    const token = req.query.token || req.headers['x-admin-token'];
    console.log(`* token received: ${token}`);
    console.log(`* expected token: ${process.env.ADMIN_TOKEN}`);
    if (token !== process.env.ADMIN_TOKEN) {
        console.log('* access denied');
        return res.status(401).send('<h1>401 — Acesso negado</h1>');
    }
    console.log('* access granted');
    next();
});

app.get('/admin/image-uploader', (req, res) => {
    const htmlPath = path.join(__dirname, '../../../admin/image-uploader.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send('Uploader não encontrado');
    }
});

// --- Endpoints de imagem (stubs) ---
// app.use(imageEditorApiStubs);

// Mount webhook endpoint
app.use('/', api);

// Start Express server on IPv4 localhost
const server = app.listen(PORT, '0.0.0.0', () => {
    // const server = app.listen(PORT, '::', () => {
    console.log(`msitesapp api server running on 0.0.0.0:${PORT} (IPv4 + IPv6 if system supports)`);
});

// Aumenta timeout para processamento de imagens (ajuste conforme necessário)
server.setTimeout(300000);

