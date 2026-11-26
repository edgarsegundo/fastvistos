#!/usr/bin/env node
// Restaura `page.html` a partir de um snapshot ou da cópia original — a
// rede de segurança que substitui o git nesta pasta (ver LEIA-ME.md
// gerado por core/local_edit.py). Só reescreve o arquivo local; se o
// watcher estiver rodando, ele sincroniza a restauração pro banco
// normalmente, como qualquer outra edição.
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--dir') args.dir = argv[++i];
        else if (a === '--list') args.list = true;
        else if (a === '--from') args.from = argv[++i];
    }
    return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.dir) {
    console.error('Uso:');
    console.error('  npm run local-edit:restore -- --dir <pasta> --list');
    console.error('  npm run local-edit:restore -- --dir <pasta> --from <nome-do-snapshot|original>');
    process.exit(1);
}

const dir = path.resolve(args.dir);
const snapshotsDir = path.join(dir, '_snapshots');

if (args.list || !args.from) {
    console.log('original  — cópia intocada de antes da primeira edição');
    const files = fs.existsSync(snapshotsDir)
        ? fs.readdirSync(snapshotsDir).filter((f) => f.endsWith('.html')).sort()
        : [];
    for (const f of files) console.log(f.replace(/\.html$/, ''));
    if (!args.from) process.exit(0);
}

const source = args.from === 'original'
    ? path.join(dir, '_original', 'page.html')
    : path.join(snapshotsDir, `${args.from}.html`);

if (!fs.existsSync(source)) {
    console.error(`❌ Não encontrei "${source}". Use --list pra ver as opções.`);
    process.exit(1);
}

const html = fs.readFileSync(source, 'utf-8');
fs.writeFileSync(path.join(dir, 'page.html'), html, 'utf-8');
console.log(`✅ page.html restaurado a partir de "${args.from}".`);
console.log('   Se o watcher (npm run local-edit) estiver rodando, ele sincroniza isso pro banco automaticamente.');
