/*
 * Parser de formatação inline estilo Carrd — **negrito**, *itálico*,
 * __sublinhado__, `código`, ~~riscado~~, ==highlight==, ~subscrito~,
 * ^sobrescrito^, ||spoiler||, [texto](url), [texto]{fg:#hex},
 * [texto]{bg:#hex}. Converte a string salva (plana, editada via
 * editor/fields/RichTextField.tsx) DIRETO numa árvore de elementos React —
 * nunca produz HTML cru nem usa `dangerouslySetInnerHTML`.
 *
 * Isso é o que dispensa uma camada de sanitização server-side (diferente
 * da Aparência por elemento, que lida com CSS/atributos arbitrários): o
 * parser só reconhece uma gramática fixa e pequena; qualquer coisa fora
 * dela vira texto literal (React escapa sozinho). Roda igual no preview do
 * editor (client) e na produção (build-time do Astro) — mesmo padrão do
 * `marked` no bloco RichText, zero JS extra no HTML final.
 *
 * Cores só em HEX — reaproveita a MESMA allowlist de theme/validation.ts
 * (isValidHex) já usada pela Aparência por elemento. Link valida o esquema
 * da URL (http/https/mailto/tel/relativo) — rejeita `javascript:` e afins.
 */
import { createElement, Fragment, type ReactNode } from 'react';
import { isValidHex } from '../theme/validation';

const SAFE_URL_RE = /^(https?:|mailto:|tel:|\/|#)/i;

function isSafeUrl(url: string): boolean {
    return SAFE_URL_RE.test(url.trim());
}

/** Espaço não-quebrável já é inserido como caractere literal pela toolbar (sem sintaxe própria) — só precisa virar `<br/>` nas quebras de linha reais. */
function textWithBreaks(text: string, keyPrefix: string): ReactNode[] {
    const parts = text.split('\n');
    const out: ReactNode[] = [];
    parts.forEach((part, i) => {
        if (part) out.push(part);
        if (i < parts.length - 1) out.push(createElement('br', { key: `${keyPrefix}-br-${i}` }));
    });
    return out;
}

/** Delimitadores simétricos (open === close), testados na ordem — MAIS específico (mais longo) primeiro, pra `**`/`***` nunca serem confundidos com `*` solto. */
const SIMPLE_DELIMS: { token: string; wrap: (children: ReactNode, key: string) => ReactNode }[] = [
    { token: '***', wrap: (c, k) => createElement('strong', { key: k }, createElement('em', null, c)) },
    { token: '**', wrap: (c, k) => createElement('strong', { key: k }, c) },
    { token: '__', wrap: (c, k) => createElement('u', { key: k }, c) },
    { token: '~~', wrap: (c, k) => createElement('s', { key: k }, c) },
    { token: '==', wrap: (c, k) => createElement('mark', { key: k }, c) },
    { token: '||', wrap: (c, k) => createElement(Spoiler, { key: k }, c) },
    { token: '`', wrap: (c, k) => createElement('code', { key: k }, c) },
    { token: '*', wrap: (c, k) => createElement('em', { key: k }, c) },
    { token: '_', wrap: (c, k) => createElement('em', { key: k }, c) },
    { token: '~', wrap: (c, k) => createElement('sub', { key: k }, c) },
    { token: '^', wrap: (c, k) => createElement('sup', { key: k }, c) },
];

let spoilerSeq = 0;

/** Spoiler sem JavaScript: truque do checkbox oculto + `<label>` — clique nativo alterna `:checked` via CSS puro (regra em editor-chrome.css/saas.css), zero handler. */
function Spoiler({ children }: { children?: ReactNode }) {
    const id = `spoiler-${(spoilerSeq += 1)}`;
    return createElement(
        Fragment,
        null,
        createElement('input', { type: 'checkbox', id, className: 'spoiler-toggle' }),
        createElement('label', { htmlFor: id, className: 'spoiler-label' }, children),
    );
}

/** Acha a PRIMEIRA ocorrência de `close` a partir de `from` (não-guloso — mesmo comportamento de marcação inline padrão). */
function findClose(text: string, close: string, from: number): number {
    return text.indexOf(close, from);
}

/**
 * Parseia um trecho de texto (recursivo — permite aninhar, ex:
 * `**[negrito colorido]{fg:#f00}**`). `keyPrefix` garante keys/ids React
 * estáveis e únicos por campo (ex: "title", "eyebrow").
 */
function parseSegment(text: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let buffer = '';
    let i = 0;
    let key = 0;

    function flushBuffer() {
        if (buffer) {
            nodes.push(...textWithBreaks(buffer, `${keyPrefix}-t${key++}`));
            buffer = '';
        }
    }

    while (i < text.length) {
        const ch = text[i];

        // escape: \X vira X literal, nunca interpretado
        if (ch === '\\' && i + 1 < text.length) {
            buffer += text[i + 1];
            i += 2;
            continue;
        }

        // [texto](url) ou [texto]{fg:#hex} / {bg:#hex}
        if (ch === '[') {
            const closeBracket = findClose(text, ']', i + 1);
            if (closeBracket !== -1) {
                const inner = text.slice(i + 1, closeBracket);
                const after = text[closeBracket + 1];
                if (after === '(') {
                    const closeParen = findClose(text, ')', closeBracket + 2);
                    if (closeParen !== -1) {
                        const url = text.slice(closeBracket + 2, closeParen);
                        if (isSafeUrl(url)) {
                            flushBuffer();
                            nodes.push(
                                createElement(
                                    'a',
                                    { key: `${keyPrefix}-a${key++}`, href: url },
                                    parseSegment(inner, `${keyPrefix}-a${key}`),
                                ),
                            );
                            i = closeParen + 1;
                            continue;
                        }
                    }
                } else if (after === '{') {
                    const closeBrace = findClose(text, '}', closeBracket + 2);
                    if (closeBrace !== -1) {
                        const attr = text.slice(closeBracket + 2, closeBrace).trim();
                        const fgMatch = /^fg:(#[0-9a-fA-F]{3,8})$/.exec(attr);
                        const bgMatch = /^bg:(#[0-9a-fA-F]{3,8})$/.exec(attr);
                        const hex = fgMatch?.[1] ?? bgMatch?.[1];
                        if (hex && isValidHex(hex)) {
                            flushBuffer();
                            const style = fgMatch ? { color: hex } : { backgroundColor: hex };
                            nodes.push(
                                createElement(
                                    'span',
                                    { key: `${keyPrefix}-c${key++}`, style },
                                    parseSegment(inner, `${keyPrefix}-c${key}`),
                                ),
                            );
                            i = closeBrace + 1;
                            continue;
                        }
                    }
                }
            }
            // não bateu com nenhum padrão reconhecido — `[` literal
            buffer += ch;
            i += 1;
            continue;
        }

        // delimitadores simétricos — mais específico (mais longo) primeiro
        const delim = SIMPLE_DELIMS.find((d) => text.startsWith(d.token, i));
        if (delim) {
            const closeIdx = findClose(text, delim.token, i + delim.token.length);
            if (closeIdx !== -1 && closeIdx > i + delim.token.length - 1) {
                const inner = text.slice(i + delim.token.length, closeIdx);
                if (inner.length > 0) {
                    flushBuffer();
                    nodes.push(delim.wrap(parseSegment(inner, `${keyPrefix}-w${key}`), `${keyPrefix}-w${key++}`));
                    i = closeIdx + delim.token.length;
                    continue;
                }
            }
        }

        buffer += ch;
        i += 1;
    }

    flushBuffer();
    return nodes;
}

/** Ponto de entrada — `keyPrefix` deve ser estável e único por campo (ex: "title"). */
export function parseInlineMarkup(raw: string | undefined | null, keyPrefix: string): ReactNode {
    if (!raw) return null;
    return createElement(Fragment, null, ...parseSegment(raw, keyPrefix));
}
