// Upload de imagem nova do Modo de edição local — detecta referência
// LOCAL (caminho relativo, não URL) em `<img src="...">` e `url(...)` do
// CSS embutido, sobe o arquivo pro storage real (core/views_local_edit.py::
// local_edit_upload_image) e reescreve a referência pra URL real antes de
// sincronizar. Trocar por uma imagem que JÁ tem URL não passa por aqui —
// é edição de texto pura, já funciona sem nenhum código (só editar
// `src="https://..."` direto no HTML).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Mesmo critério de "isto é uma URL, não um caminho local" já usado em
// `core/css_embed.py::_absolutize_css_urls` (server-side) — mantém as
// duas pontas consistentes sobre o que conta como referência local.
const SRC_RE = /\bsrc\s*=\s*(["'])((?:(?!\1).)*)\1/gi;
// `(?<![\w-])` antes de `url\(`: acha em revisão (rodando contra HTML
// clonado real) — sem isso, "i" (case-insensitive) faz a regex casar
// dentro de QUALQUER identificador JS terminado em "...url(", tipo
// `createObjectURL(r)` (script de detecção de emoji do WordPress, que
// sobrevive no HTML achatado) — o lookbehind garante que só conta como
// função CSS de verdade quando "url(" não é sufixo de uma palavra maior.
const CSS_URL_RE = /(?<![\w-])url\(\s*(['"]?)((?:(?!\1\s*\)).)*)\1\s*\)/gi;

const CONTENT_TYPE_BY_EXT = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
};

function isLocalRef(ref) {
    const trimmed = ref.trim();
    if (!trimmed) return false;
    return !/^(https?:|data:|\/\/|#)/i.test(trimmed);
}

// Só conta como referência de imagem local o que TERMINA numa extensão que
// este fluxo sabe subir (as mesmas de `CONTENT_TYPE_BY_EXT`, que o upload
// exige logo adiante de qualquer forma). Sem este filtro, JS minificado
// dentro do HTML achatado gera falso positivo: `new URL(e,r.href)` casa em
// `CSS_URL_RE` (o lookbehind só barra `url(` como SUFIXO de palavra, tipo
// `createObjectURL(`, não uma chamada legítima e isolada a `URL(...)`), e o
// watcher passava a avisar "imagem referenciada não encontrada: e,r.href"
// a cada sincronização. Barrar por extensão também elimina de uma vez
// qualquer outro `url(...)`/`src=...` que não seja imagem (âncora, iframe,
// fonte) sem precisar caçar caso a caso.
function looksLikeImagePath(ref) {
    const withoutQuery = ref.split(/[?#]/)[0];
    const dot = withoutQuery.lastIndexOf('.');
    if (dot === -1) return false;
    return Object.hasOwn(CONTENT_TYPE_BY_EXT, withoutQuery.slice(dot).toLowerCase());
}

function findLocalReferences(html) {
    const refs = new Set();
    for (const re of [SRC_RE, CSS_URL_RE]) {
        re.lastIndex = 0;
        let match;
        while ((match = re.exec(html))) {
            const ref = match[2];
            if (isLocalRef(ref) && looksLikeImagePath(ref)) refs.add(ref);
        }
    }
    return [...refs];
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function cachePath(dir) {
    return path.join(dir, '.uploaded-images.json');
}

function loadCache(dir) {
    const p = cachePath(dir);
    if (!fs.existsSync(p)) return {};
    try {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {
        return {};
    }
}

function saveCache(dir, cache) {
    fs.writeFileSync(cachePath(dir), JSON.stringify(cache, null, 2), 'utf-8');
}

// Substitui TODAS as ocorrências literais de `ref` por `url` no texto —
// simplificação deliberada (não reparseia src=/url() de novo): o caminho
// relativo de uma imagem colidir por acaso com outro texto do HTML é uma
// situação de borda improvável o suficiente pra não justificar reparsear
// tudo de novo aqui.
function replaceAllLiteral(html, ref, url) {
    return html.split(ref).join(url);
}

/**
 * Resolve toda referência LOCAL de imagem em `html`: sobe o arquivo (se
 * ainda não foi subido, ou mudou desde a última vez — cache por hash em
 * `.uploaded-images.json`) e devolve `{ html, changed }` com as
 * referências já reescritas pra URL real. Nunca lança por causa de UMA
 * imagem quebrada/ausente/rejeitada — loga e segue pras outras, pra não
 * travar a sincronização do texto por causa de uma imagem só.
 */
export async function resolveLocalImages({ dir, html, manifest, log }) {
    const refs = findLocalReferences(html);
    if (refs.length === 0) return { html, changed: false };

    const cache = loadCache(dir);
    const folderRoot = path.resolve(dir);
    let rewritten = html;
    let changed = false;
    let cacheChanged = false;

    for (const ref of refs) {
        const resolved = path.resolve(dir, ref);
        // Guarda contra path traversal (`src="../../etc/passwd"` etc.) —
        // a imagem tem que morar DENTRO da pasta exportada.
        if (resolved !== folderRoot && !resolved.startsWith(folderRoot + path.sep)) {
            log(`⚠️  referência de imagem fora da pasta, ignorada: ${ref}`);
            continue;
        }
        if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
            log(`⚠️  imagem referenciada não encontrada, ignorada: ${ref}`);
            continue;
        }

        const data = fs.readFileSync(resolved);
        const hash = sha256(data);
        const cached = cache[ref];

        if (cached && cached.hash === hash) {
            if (rewritten.includes(ref)) {
                rewritten = replaceAllLiteral(rewritten, ref, cached.url);
                changed = true;
            }
            continue;
        }

        const contentType = CONTENT_TYPE_BY_EXT[path.extname(resolved).toLowerCase()];
        if (!contentType) {
            log(`⚠️  extensão de imagem não suportada, ignorada: ${ref} (use jpg/png/webp/gif)`);
            continue;
        }

        try {
            const res = await fetch(manifest.imagesEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': contentType,
                    'X-Local-Edit-Token': manifest.token,
                    'X-Local-Edit-Filename': path.basename(resolved),
                },
                body: data,
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                log(`❌ falha ao enviar imagem "${ref}" (${res.status}): ${body.error || ''}`);
                continue;
            }
            cache[ref] = { hash, url: body.url };
            cacheChanged = true;
            rewritten = replaceAllLiteral(rewritten, ref, body.url);
            changed = true;
            log(`✅ imagem "${ref}" enviada → ${body.url}`);
        } catch (err) {
            log(`❌ falha de rede ao enviar imagem "${ref}": ${err.message}`);
        }
    }

    if (cacheChanged) saveCache(dir, cache);
    return { html: rewritten, changed };
}
