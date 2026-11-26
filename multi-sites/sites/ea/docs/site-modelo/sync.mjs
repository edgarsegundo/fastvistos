// Motor de sincronização do Modo de edição local — empurra `page.html` pro
// Django em background, com debounce feito por quem chama (watch.mjs) e
// single-flight aqui dentro: nunca mais de uma requisição em voo por vez.
//
// Por que single-flight resolve a corrida de ordenação: se três edições
// acontecem enquanto uma requisição ainda está em voo, elas só ficam
// guardadas como "a mais recente" (`pendingHtml`) — quando a requisição em
// voo termina (sucesso ou erro), dispara IMEDIATAMENTE a próxima com o
// conteúdo mais recente. Como nunca existem duas requisições concorrentes,
// não existe resposta "fora de ordem" pra se preocupar — o banco só pode
// terminar na versão mais recente que foi de fato enviada.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function sha256(text) {
    return crypto.createHash('sha256').update(text, 'utf-8').digest('hex');
}

function nowIso() {
    return new Date().toISOString();
}

export function createSyncEngine({ dir, manifest, adoptSanitized, log }) {
    const snapshotsDir = path.join(dir, '_snapshots');
    const logPath = path.join(snapshotsDir, 'log.jsonl');
    fs.mkdirSync(snapshotsDir, { recursive: true });

    let baseHash = manifest.baseHash;
    let seq = 0;
    let inFlight = false;
    let pendingHtml = null;
    let selfWriteHash = null;
    let conflicted = false;
    // Hash do último conteúdo LOCAL que o servidor aceitou (200). Reenviar
    // bytes idênticos é, por definição, um no-op — e era exatamente o que
    // acontecia no loop causado pelo `ignored` quebrado do watcher: 60
    // pushes do MESMO arquivo até levar 429. Isto corta o desperdício na
    // raiz, independente de quem dispare o ciclo (watcher, editor, agente).
    // Não substitui o debounce: aqui só se sabe que é no-op DEPOIS de já
    // ter empurrado uma vez com sucesso.
    let lastPushedHash = null;

    function writeSnapshot(html, tag) {
        const stamp = nowIso().replace(/[:.]/g, '-');
        const file = path.join(snapshotsDir, `${stamp}-${tag}.html`);
        fs.writeFileSync(file, html, 'utf-8');
        pruneSnapshots();
    }

    function pruneSnapshots() {
        const files = fs.readdirSync(snapshotsDir)
            .filter((f) => f.endsWith('.html'))
            .sort();
        while (files.length > 50) {
            fs.unlinkSync(path.join(snapshotsDir, files.shift()));
        }
    }

    function appendLog(entry) {
        fs.appendFileSync(logPath, JSON.stringify({ ts: nowIso(), ...entry }) + '\n', 'utf-8');
    }

    async function runPush(html, force) {
        inFlight = true;
        seq += 1;
        const mySeq = seq;
        writeSnapshot(html, `seq${mySeq}`);

        try {
            const res = await fetch(manifest.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Local-Edit-Token': manifest.token },
                body: JSON.stringify({ html, baseHash, seq: mySeq, force: !!force }),
            });
            const data = await res.json().catch(() => ({}));

            if (res.status === 200) {
                baseHash = data.newHash;
                lastPushedHash = sha256(html);
                conflicted = false;
                log(`✅ [seq ${mySeq}] sincronizado (${data.bytesBefore}→${data.bytesAfter} bytes)`);
                appendLog({ seq: mySeq, status: 'ok', sanitizedChanged: data.sanitizedChanged });
                if (data.sanitizedChanged) {
                    log(`⚠️  [seq ${mySeq}] a sanitização alterou o HTML — banco difere do arquivo (veja /__sanitized no preview)`);
                    if (adoptSanitized) {
                        selfWriteHash = sha256(data.sanitizedHtml);
                        fs.writeFileSync(path.join(dir, 'page.html'), data.sanitizedHtml, 'utf-8');
                    }
                }
            } else if (res.status === 409) {
                conflicted = true;
                log(`🚫 [seq ${mySeq}] conflito — o banco mudou por fora (editor visual?). Sincronização PAUSADA.`);
                log(`   Digite "force" + Enter aqui pra sobrescrever o banco com o arquivo local, ou restaure antes de continuar editando.`);
                if (data.currentHtml) writeSnapshot(data.currentHtml, `conflict-seq${mySeq}`);
                appendLog({ seq: mySeq, status: 'conflict' });
            } else {
                log(`❌ [seq ${mySeq}] servidor recusou (${res.status}): ${data.error || ''}`);
                appendLog({ seq: mySeq, status: `error_${res.status}`, error: data.error });
            }
        } catch (err) {
            log(`❌ [seq ${mySeq}] falha de rede ao sincronizar: ${err.message}`);
            appendLog({ seq: mySeq, status: 'network_error', error: err.message });
        } finally {
            inFlight = false;
            if (pendingHtml !== null && !conflicted) {
                const next = pendingHtml;
                pendingHtml = null;
                // Mesma guarda de `schedulePush`: o que ficou na fila pode
                // ter virado no-op enquanto a requisição estava em voo.
                if (sha256(next) !== lastPushedHash) runPush(next, false);
            }
        }
    }

    return {
        schedulePush(html) {
            if (conflicted) {
                log('⏸  sincronização pausada por conflito — digite "force" + Enter, ou restaure um snapshot antes de continuar.');
                return;
            }
            // Silencioso de propósito: no fluxo normal isto só acontece
            // quando algo redisparou o ciclo sem o arquivo ter mudado, e
            // avisar a cada vez seria o mesmo spam que se quer evitar.
            if (sha256(html) === lastPushedHash) return;
            if (inFlight) {
                pendingHtml = html;
                return;
            }
            runPush(html, false);
        },

        forcePush(html) {
            conflicted = false;
            pendingHtml = null;
            if (inFlight) {
                // deixa a requisição em voo terminar; ela mesma vai disparar
                // esta como a próxima assim que `inFlight` virar false.
                pendingHtml = html;
                return;
            }
            runPush(html, true);
        },

        isSelfWrite(html) {
            if (selfWriteHash === null) return false;
            const match = sha256(html) === selfWriteHash;
            if (match) selfWriteHash = null; // consome o guard — só ignora uma vez
            return match;
        },

        // Mesmo guard de `isSelfWrite`, exposto pra quem mais reescreve
        // `page.html` no disco por fora do fluxo de sanitização (ver
        // `images.mjs`, que reescreve a referência local pra URL real
        // depois do upload) — sem isto, essa escrita disparava o watcher
        // de novo e re-processava a mesma imagem à toa.
        markSelfWrite(html) {
            selfWriteHash = sha256(html);
        },

        async pollForExternalChange() {
            if (inFlight || conflicted) return;
            try {
                const res = await fetch(manifest.endpoint, {
                    headers: { 'X-Local-Edit-Token': manifest.token },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.hash && data.hash !== baseHash) {
                    log('⚠️  o banco mudou por fora deste watcher (provavelmente o editor visual salvou por cima) — confira antes de continuar editando.');
                    appendLog({ status: 'external_change_detected', theirHash: data.hash, ourHash: baseHash });
                }
            } catch {
                // melhor esforço — nunca derruba o watcher por causa do poll.
            }
        },
    };
}
