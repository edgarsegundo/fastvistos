// Servidor de preview do Modo de edição local — express servindo o
// `page.html` cru direto do disco (sem passar pela Astro: é isso que torna
// o preview instantâneo). Live-reload via Server-Sent Events (SSE), sem
// biblioteca nova (evita adicionar `ws`/browser-sync — `express` já é
// dependência do repo).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import express from 'express';

function wrapDocument(bodyHtml, { sanitized }) {
    // A ressalva de fidelidade (arquivo cru vs. banco sanitizado) fica
    // visível na própria página, não escondida — ver plano, risco 5.
    const badge = sanitized
        ? '<div style="position:fixed;top:0;left:0;right:0;background:#7c3aed;color:#fff;font:12px system-ui;padding:6px 10px;z-index:2147483647;">banco (sanitizado) — <a href="/" style="color:#fff;">ver arquivo cru</a></div>'
        : '<div style="position:fixed;top:0;left:0;right:0;background:#059669;color:#fff;font:12px system-ui;padding:6px 10px;z-index:2147483647;">arquivo (cru) — <a href="/__sanitized" style="color:#fff;">ver versão do banco</a></div>';
    const reloadScript = sanitized
        ? ''
        : `<script>new EventSource('/__events').onmessage = () => location.reload();</script>`;
    // `body{margin:0}` — sem isso sobra a margem default do UA (8px) como
    // uma borda branca em volta da página inteira: quando isto serve o
    // `page.html` cru (sem passar pela Astro), nada mais zera essa margem
    // (normalmente é o CSS global do tema que faz isso).
    return `<!doctype html><html><head><meta charset="utf-8"><style>html{margin-top:26px}body{margin:0}</style></head><body>${badge}${bodyHtml}${reloadScript}</body></html>`;
}

export function createPreviewServer({ dir, manifest, port }) {
    const app = express();
    const clients = new Set();

    app.get('/', (_req, res) => {
        const html = fs.readFileSync(path.join(dir, 'page.html'), 'utf-8');
        res.type('html').send(wrapDocument(html, { sanitized: false }));
    });

    app.get('/__sanitized', async (_req, res) => {
        try {
            const r = await fetch(manifest.endpoint, {
                headers: { 'X-Local-Edit-Token': manifest.token },
            });
            const data = await r.json();
            res.type('html').send(wrapDocument(data.html || '', { sanitized: true }));
        } catch (err) {
            res.status(502).send(`Não foi possível buscar a versão do banco: ${err.message}`);
        }
    });

    app.get('/__events', (req, res) => {
        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });
        res.flushHeaders();
        clients.add(res);
        req.on('close', () => clients.delete(res));
    });

    // Assets irmãos (raro, mas o HTML achatado pode referenciar algo
    // relativo à própria pasta) — depois das rotas especiais de propósito.
    // `dotfiles: 'ignore'` explícito: `.vitrine-local-edit.json` carrega o
    // token de autenticação, nunca deveria ser servível por HTTP nem por
    // acidente (o default do express já é esse, mas não vale depender de
    // um default implícito pra isso).
    app.use(express.static(dir, { dotfiles: 'ignore' }));

    const server = http.createServer(app);
    server.listen(port);

    return {
        server,
        notifyReload() {
            for (const res of clients) res.write('data: reload\n\n');
        },
    };
}
