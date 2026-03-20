#!/usr/bin/env node
// detect-changed-countries.js
// Uso: node detect-changed-countries.js centraldevistos
//
// Consulta GET /api/visa-countries/timestamps do serviço visa-crawler,
// compara com o registro salvo em last-build.json e imprime na stdout
// a lista de slugs alterados separados por vírgula.
//
// Específico para o projeto centraldevistos/ — outros projetos
// continuam usando seus próprios fluxos de build/deploy.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAST_BUILD_FILE = path.join(__dirname, 'last-build.json');
const API_BASE = process.env.VISA_API_BASE || 'http://localhost:3001';
const SITE_ID = process.argv[2] || 'centraldevistos';

// Somente age para o projeto centraldevistos
if (SITE_ID !== 'centraldevistos') {
    process.exit(0);
}

function loadLastBuild() {
    if (!fs.existsSync(LAST_BUILD_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(LAST_BUILD_FILE, 'utf-8'));
    } catch {
        return {};
    }
}

function saveLastBuild(data) {
    fs.writeFileSync(LAST_BUILD_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let rows;
try {
    const response = await fetch(`${API_BASE}/api/visa-countries/timestamps`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    rows = await response.json();
} catch (err) {
    console.error(`[detect-changed-countries] Erro ao consultar ${API_BASE}/api/visa-countries/timestamps:`, err.message);
    process.exit(1);
}

const lastBuild = loadLastBuild();
const changed = [];
const newState = {};

for (const row of rows) {
    const { id, atualizadoEm } = row;
    newState[id] = atualizadoEm;
    if (!lastBuild[id] || lastBuild[id] !== atualizadoEm) {
        changed.push(id);
    }
}

saveLastBuild(newState);

if (changed.length > 0) {
    process.stdout.write(changed.join(','));
}
