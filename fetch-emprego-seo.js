#!/usr/bin/env node
/**
 * Busca no Django (empregoadmin, candidate/seo_api.py) os dados das páginas de
 * SEO programático do empregoaqui.com.br e grava em
 * multi-sites/sites/emprego/lib/generated/seo-bundle.json (gitignored).
 *
 * Roda ANTES do `astro build` (ver package.json: build:emprego). As páginas
 * /candidatos/... e /cidades/... e o lastmod do sitemap leem esse arquivo.
 *
 * Env (.env da raiz):
 *   EMPREGO_API_BASE     ex.: https://app.empregoaqui.com.br/api
 *   EMPREGO_SEO_API_KEY  mesma chave de SEO_API_KEY do Django
 *
 * Política de falha:
 *   - env ausente            -> mantém o bundle anterior (ou cria vazio se não houver) + aviso;
 *                               com EMPREGO_SEO_REQUIRED=1 (cron) o build falha
 *   - API fora do ar         -> reaproveita o arquivo anterior se existir; senão sai com erro
 *     (evita publicar um site sem as páginas e apagar as antigas num deploy com --delete)
 */
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config as loadDotenv } from 'dotenv';

loadDotenv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'multi-sites/sites/emprego/lib/generated/seo-bundle.json');
const EMPTY = { generated_at: null, min_candidates: 0, combos: [], cargos: [], cidades: [] };

async function write(bundle) {
    await fs.mkdir(dirname(OUT), { recursive: true });
    await fs.writeFile(OUT, JSON.stringify(bundle));
}

async function readPrevious() {
    try {
        return JSON.parse(await fs.readFile(OUT, 'utf8'));
    } catch {
        return null;
    }
}

const base = (process.env.EMPREGO_API_BASE || '').replace(/\/$/, '');
const key = process.env.EMPREGO_SEO_API_KEY || '';

if (!base || !key) {
    // Nunca sobrescreve um bundle bom: sem as variáveis, o build publicaria um
    // sitemap sem as páginas e trocaria /candidatos/ por um redirect.
    if (process.env.EMPREGO_SEO_REQUIRED === '1') {
        console.error('❌ EMPREGO_API_BASE/EMPREGO_SEO_API_KEY ausentes e EMPREGO_SEO_REQUIRED=1.');
        process.exit(1);
    }
    console.warn('⚠️  EMPREGO_API_BASE/EMPREGO_SEO_API_KEY ausentes: páginas /candidatos/ NÃO serão (re)geradas.');
    if (!(await readPrevious())) await write(EMPTY);
    process.exit(0);
}

try {
    const res = await fetch(`${base}/seo/landing-bundle/`, {
        headers: { 'X-SEO-Api-Key': key },
        signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bundle = await res.json();
    const previous = await readPrevious();
    if (!bundle.combos?.length && previous?.combos?.length) {
        // Resposta vazia depois de um bundle com páginas: provável falha de dados, não "zero candidatos".
        throw new Error('resposta sem nenhuma página (mantendo o bundle anterior)');
    }
    await write(bundle);
    console.log(
        `✅ SEO bundle: ${bundle.combos.length} páginas cargo+cidade, ` +
        `${bundle.cargos.length} hubs de cargo, ${bundle.cidades.length} hubs de cidade`
    );
} catch (err) {
    const previous = await readPrevious();
    if (previous && previous.combos?.length) {
        console.warn(`⚠️  Falha ao buscar o SEO bundle (${err.message}); reutilizando o anterior de ${previous.generated_at}.`);
        process.exit(0);
    }
    console.error(`❌ Falha ao buscar o SEO bundle (${err.message}) e não há cópia anterior.`);
    process.exit(1);
}
