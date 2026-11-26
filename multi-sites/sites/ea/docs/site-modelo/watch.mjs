#!/usr/bin/env node
// Entrypoint do Modo de edição local — observa `page.html` numa pasta
// exportada (ver core/local_edit.py) e sobe, no MESMO processo:
// (1) o preview instantâneo (preview-server.mjs, não passa pela Astro) e
// (2) a sincronização em background pro Django (sync.mjs, debounce +
//     single-flight, nunca bloqueia o preview).
//
// Uso: npm run local-edit -- --dir <pasta exportada> [--port 8901] [--adopt-sanitized]
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

import chokidar from 'chokidar';

import { resolveLocalImages } from './images.mjs';
import { createPreviewServer } from './preview-server.mjs';
import { createSyncEngine } from './sync.mjs';

// Janela de quietude antes de sincronizar. BEM generosa de propósito: quem
// edita esta pasta costuma ser um AGENTE (Claude Code etc.), que reescreve
// o arquivo muitas vezes em sequência rápida — com janela curta, cada
// escrita intermediária virava um POST próprio e uma sessão de edição
// normal estourava o rate limit do servidor sozinha. Custa pouco esperar:
// o preview recarrega na hora, sem passar por aqui (só a ida ao banco
// espera), e o banco não é a fonte da verdade enquanto se edita local.
// Ajustável por `--debounce <ms>` pra quem quiser mais curto.
const DEFAULT_DEBOUNCE_MS = 5000;

function parseArgs(argv) {
    const args = { port: 8901, adoptSanitized: false, debounce: DEFAULT_DEBOUNCE_MS };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--dir') args.dir = argv[++i];
        else if (a === '--port') args.port = Number(argv[++i]);
        else if (a === '--debounce') args.debounce = Number(argv[++i]);
        else if (a === '--adopt-sanitized') args.adoptSanitized = true;
    }
    if (!Number.isFinite(args.debounce) || args.debounce < 0) args.debounce = DEFAULT_DEBOUNCE_MS;
    return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.dir) {
    console.error('Uso: npm run local-edit -- --dir <pasta exportada> [--port 8901] [--adopt-sanitized]');
    process.exit(1);
}

const dir = path.resolve(args.dir);
const manifestPath = path.join(dir, '.vitrine-local-edit.json');
if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Não encontrei ${manifestPath}`);
    console.error('   Exporte a página primeiro: botão "Modo de edição local" no admin da página,');
    console.error('   ou "uv run python manage.py local_edit_export --page <id>".');
    process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const pageHtmlPath = path.join(dir, 'page.html');

function log(msg) {
    console.log(`[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`);
}

// Nada aqui é "conteúdo de trabalho": ou é gerado pelo próprio watcher
// (`_snapshots/`, `.uploaded-images.json`), ou é backup/infra que mudar não
// deve disparar sincronização nenhuma.
const IGNORED_DIRS = new Set(['_original', '_snapshots', 'node_modules', '.git']);
const IGNORED_FILES = new Set([
    '.vitrine-local-edit.json', '.uploaded-images.json', 'package.json', 'package-lock.json',
]);

const sync = createSyncEngine({ dir, manifest, adoptSanitized: args.adoptSanitized, log });
const preview = createPreviewServer({ dir, manifest, port: args.port });

let debounceTimer = null;

// Observa a pasta INTEIRA agora (não só `page.html`) — imagem nova
// solta em `images/` (ou em qualquer lugar dentro da pasta) também
// precisa disparar o ciclo de sincronização, pra `resolveLocalImages`
// (images.mjs) subir o arquivo e reescrever a referência. O que não é
// conteúdo de trabalho fica de fora do watch.
const watcher = chokidar.watch(dir, {
    // PRECISA ser função, não glob. O chokidar 4 REMOVEU suporte a glob no
    // `ignored` (só aceita caminho literal, RegExp ou predicado) — os
    // `'**/_snapshots/**'` que estavam aqui não casavam com nada e,
    // portanto, não ignoravam nada. Bug real que isso causou: `sync.mjs`
    // grava um snapshot em `_snapshots/` a CADA push, essa gravação
    // disparava o watcher, que agendava outro push, que gravava outro
    // snapshot… loop infinito de ~1 sync a cada 500ms com o arquivo
    // parado, até o servidor responder 429. Verificado com chokidar
    // 4.0.3: com glob, `_snapshots/x.html` emitia evento normalmente.
    ignored: (targetPath) => {
        const rel = path.relative(dir, targetPath);
        if (!rel || rel.startsWith('..')) return false;  // a própria pasta observada
        const segments = rel.split(path.sep);
        if (segments.some((seg) => IGNORED_DIRS.has(seg))) return true;
        const name = segments[segments.length - 1];
        return IGNORED_FILES.has(name) || name.endsWith('.md') || name.endsWith('.code-workspace');
    },
    // Espera o arquivo "assentar" antes de disparar — evita ler um HTML
    // (ou uma imagem) pela metade se o editor/SO grava em mais de uma escrita.
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
    ignoreInitial: true,
});

async function handleChange() {
    const html = fs.readFileSync(pageHtmlPath, 'utf-8');
    if (sync.isSelfWrite(html)) return; // eco de uma reescrita nossa (sanitização ou imagem), ignora

    const { html: resolved, changed } = await resolveLocalImages({ dir, html, manifest, log });
    if (changed) {
        sync.markSelfWrite(resolved);
        fs.writeFileSync(pageHtmlPath, resolved, 'utf-8');
        sync.schedulePush(resolved);
    } else {
        sync.schedulePush(html);
    }
}

function onFsEvent() {
    // O reload instantâneo do preview não espera o debounce — só a
    // sincronização (que envolve rede) é que aguarda o arquivo "assentar".
    preview.notifyReload();
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        handleChange().catch((err) => log(`❌ erro processando mudança: ${err.message}`));
    }, args.debounce);
}

// 'add' (não só 'change'): uma imagem NOVA solta na pasta dispara 'add',
// não 'change' — sem isto, soltar o arquivo DEPOIS de já ter referenciado
// ele em `page.html` (ordem comum: escreve o `<img src>` primeiro, arrasta
// o arquivo depois) nunca disparava a resolução sozinho.
watcher.on('change', onFsEvent);
watcher.on('add', onFsEvent);

// Detecta save por fora (ex: editor visual sobrescrevendo o bloco inteiro)
// — só avisa, nunca sobrescreve nada sozinho.
setInterval(() => sync.pollForExternalChange(), 10_000);

// Digitar "force" + Enter no terminal do watcher resolve um conflito (409)
// empurrando o conteúdo ATUAL do arquivo por cima do que está no banco.
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    if (line.trim() === 'force') {
        const html = fs.readFileSync(pageHtmlPath, 'utf-8');
        log('🔓 forçando sincronização com o conteúdo atual do arquivo...');
        sync.forcePush(html);
    }
});

log(`👀 observando ${pageHtmlPath}`);
log(`🖥️  preview: http://localhost:${args.port}`);
log(`   página no admin: ${manifest.djangoBaseUrl}/admin/core/page/${manifest.pageId}/change/`);
log('   em conflito (🚫), digite "force" + Enter aqui pra sobrescrever com o arquivo local.');

function shutdown() {
    log('encerrando...');
    watcher.close();
    preview.server.close();
    process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
