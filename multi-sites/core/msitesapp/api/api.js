// Carrega variáveis de ambiente do arquivo .env
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// To add a new lib, always import fom dist like for example: `../../dist/lib/libname.js`

import { WebPageService } from '../../dist/lib/webpage-service.js';

const { BlogService } = await import('../../dist/lib/blog-service.js');

import express from 'express';
import bodyParser from 'body-parser';

// Modular routers
import sectionRoutes from './section-routes.js';
import publishRoutes from './publish-routes.js';
import blogArticleRoutes from './blog-article-routes.js';
import imageRoutes from './image-routes.js';

const app = express();
app.use(bodyParser.json());

// Request logging
app.use((req, res, next) => {
    if (process.env.DEBUG_VERBOSE === 'true') {
        console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
        if (req.body) {
            console.log('Request body:', JSON.stringify(req.body, null, 2));
        }
    }
    next();
});

app.use('/admin/static', express.static(path.join(__dirname, '../admin/static')));

app.use(sectionRoutes(WebPageService));
app.use(publishRoutes(BlogService));
app.use(blogArticleRoutes(BlogService));
app.use(imageRoutes(BlogService));

app.get('/ping', (req, res) => {
    res.json({
        message: 'pong',
        timestamp: new Date().toISOString(),
    });
});

// Middleware para autenticação por chave de API
export function apiKeyAuth(req, res, next) {
    const apiKey = req.header('x-api-key') || req.query.api_key;
    const validKey = process.env.MYSITESAPP_API_KEY || 'minha-chave-secreta';
    if (apiKey !== validKey) {
        return res.status(403).json({ error: 'Acesso negado: chave de API inválida.' });
    }
    next();
}

export default app;
