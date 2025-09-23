
import express from 'express';
import api from './api/api.js';
import { config } from './config.js';

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

// Mount webhook endpoint
app.use('/', api);

// Start Express server on IPv4 localhost
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`fastvistos api server running on 127.0.0.1:${PORT}`);
});

// Aumenta timeout para 3 minutos (180000 ms)
server.setTimeout(180000);
