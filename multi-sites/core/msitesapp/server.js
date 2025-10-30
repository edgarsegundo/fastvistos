import express from 'express';
import OpenAI from "openai";
import api from './api/api.js';
import { config } from './config.js';

const PORT = config.server.port;
const OPENAI_API_KEY = config.api.openAiKey;

if (!OPENAI_API_KEY) {
  console.error("❌ Erro: a variável de ambiente OPENAI_API_KEY não foi definida.");
  console.error("💡 Dica: defina sua chave com um dos comandos abaixo:");
  console.error("   - Linux/macOS: export OPENAI_API_KEY='sua_chave_aqui'");
  console.error("   - Windows PowerShell: setx OPENAI_API_KEY 'sua_chave_aqui'");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

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
const server = app.listen(PORT, '0.0.0.0', () => {
    // const server = app.listen(PORT, '::', () => {
    console.log(`msitesapp api server running on 0.0.0.0:${PORT} (IPv4 + IPv6 if system supports)`);
});

// Aumenta timeout para 3 minutos (180000 ms)
server.setTimeout(180000);
