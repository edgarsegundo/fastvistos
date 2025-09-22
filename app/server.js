
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

// Start Express server
const server = app.listen(PORT, () => {
    console.log(`fastvistos api server running on port ${PORT}`);
});

// Aumenta timeout para 3 minutos (180000 ms)
server.setTimeout(180000);
