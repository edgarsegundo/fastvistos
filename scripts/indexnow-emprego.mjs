#!/usr/bin/env node
/**
 * Avisa Bing/Yandex (IndexNow) das páginas /candidatos/ e /cidades/ atualizadas
 * recentemente — o Bing é de onde o ChatGPT/Copilot tiram resultados.
 *
 * Roda DEPOIS do deploy (ver scripts/emprego-daily-rebuild.sh). Usa o mesmo
 * seo-bundle.json do build. Só envia URLs com lastmod nas últimas HOURS horas.
 *
 * Env: EMPREGO_INDEXNOW_KEY (o arquivo public/emprego/<key>.txt precisa estar no ar)
 */
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config as loadDotenv } from 'dotenv';

loadDotenv();
const __dirname = dirname(fileURLToPath(import.meta.url));
const HOST = 'empregoaqui.com.br';
const HOURS = Number(process.env.INDEXNOW_WINDOW_HOURS || 26);
const key = process.env.EMPREGO_INDEXNOW_KEY;
if (!key) {
    console.log('EMPREGO_INDEXNOW_KEY ausente: IndexNow ignorado.');
    process.exit(0);
}

const file = join(__dirname, '../multi-sites/sites/emprego/lib/generated/seo-bundle.json');
const bundle = JSON.parse(await fs.readFile(file, 'utf8'));
const since = Date.now() - HOURS * 3600_000;
const urls = new Set();
for (const c of bundle.combos) {
    if (new Date(c.lastmod).getTime() < since) continue;
    urls.add(`https://${HOST}/candidatos/${c.cargo_slug}/${c.cidade_slug}/`);
    urls.add(`https://${HOST}/candidatos/${c.cargo_slug}/`);
    urls.add(`https://${HOST}/cidades/${c.cidade_slug}/`);
}
if (urls.size === 0) {
    console.log('Nenhuma página atualizada na janela; nada a enviar.');
    process.exit(0);
}

const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `https://${HOST}/${key}.txt`,
        urlList: [...urls].slice(0, 10000),
    }),
});
console.log(`IndexNow: ${urls.size} URLs enviadas, HTTP ${res.status}`);
if (!res.ok && res.status !== 202) process.exit(1);
