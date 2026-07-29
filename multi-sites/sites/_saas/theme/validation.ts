/*
 * Validação/sanitização dos valores livres do painel de Aparência por
 * elemento (cor, dimensão, fonte, ID/classe, CSS customizado). Mesmo
 * espírito de `theme.ts::buildBrandVars()` (whitelist, descarta
 * silenciosamente o que não bate) — aplicado por elemento em vez de
 * por-tenant.
 *
 * Roda em 3 camadas: campo do editor (UX imediata, usa os `isValid*`
 * abaixo), render (`blocks/style-runtime.ts`, defesa em profundidade — usa
 * os `sanitize*`) e Django `serialize_blocks_for_api()`
 * (`vitrine/core/models.py`, a fronteira de segurança real — reimplementa
 * estas MESMAS regras em Python, porque não pode importar TS; qualquer
 * mudança aqui precisa ser espelhada lá).
 */
import { FONT_CATALOG } from './fonts';
import type { BaseElementStyle, ElementBorder, ElementShadow } from '../blocks/style-types';

/** 3/6 dígitos = igual buildBrandVars (cor sólida); 4/8 = com canal alpha (usado em sombras). */
export const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
export const DIMENSION_RE = /^-?[0-9]+(\.[0-9]+)?(px|rem|em|%)?$/;
export const ID_CLASS_RE = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
/** Tokens que colidiriam com hooks internos do editor/tema — nunca aceitos como id/classe. */
export const RESERVED_TOKENS = new Set(['brand-vars', 'root', 'editor-root']);

/**
 * Propriedades CSS liberadas pro escape hatch de "CSS customizado". Allowlist
 * como controle PRIMÁRIO (não só bloqueio de valor): um blocklist de valor
 * sozinho não impede propriedades de LAYOUT perigosas (ex: `position:fixed`
 * + `top/left/z-index` monta phishing sem `url(`/`javascript:` envolvido).
 */
const CSS_PROP_ALLOWLIST = new Set([
    'color', 'background-color', 'font-family', 'font-size', 'font-weight', 'font-style',
    'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform', 'text-shadow',
    'border', 'border-color', 'border-width', 'border-style', 'border-radius', 'box-shadow',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'opacity', 'width', 'max-width', 'aspect-ratio', 'object-fit',
]);
/** Camada extra sobre a allowlist acima — padrões de valor nunca aceitos mesmo em propriedade permitida. */
const CSS_VALUE_BLOCKLIST = [/url\(/i, /expression\(/i, /@import/i, /javascript:/i, /[<>]/];

export function isValidHex(v: unknown): v is string {
    return typeof v === 'string' && HEX_RE.test(v);
}
export function isValidDimension(v: unknown): v is string {
    return typeof v === 'string' && DIMENSION_RE.test(v);
}
export function isValidFontKey(v: unknown): v is string {
    return typeof v === 'string' && Object.prototype.hasOwnProperty.call(FONT_CATALOG, v);
}
export function isValidIdOrClass(v: unknown): v is string {
    return typeof v === 'string' && ID_CLASS_RE.test(v) && !RESERVED_TOKENS.has(v);
}
export function isValidAlign(v: unknown): v is 'left' | 'center' | 'right' | 'justify' {
    return v === 'left' || v === 'center' || v === 'right' || v === 'justify';
}
export function isValidBorderStyle(v: unknown): v is NonNullable<ElementBorder['style']> {
    return v === 'solid' || v === 'dashed' || v === 'dotted' || v === 'none';
}

function kebabToCamel(prop: string): string {
    return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Parseia um textarea de declarações `propriedade: valor;` — como um `style`
 * inline digitado à mão, NUNCA um bloco `<style>` com seletor livre (isso
 * replicaria o vetor de risco já documentado como dívida no CodeEmbed).
 * Retorna só as declarações válidas (chaves já em camelCase, prontas pra
 * `React.CSSProperties`) + a lista das que foram rejeitadas, pra feedback
 * na UI do campo.
 */
export function parseInlineCss(raw: string): { style: Record<string, string>; errors: string[] } {
    const style: Record<string, string> = {};
    const errors: string[] = [];
    if (!raw) return { style, errors };

    for (const decl of raw.split(';').map((d) => d.trim()).filter(Boolean)) {
        const idx = decl.indexOf(':');
        if (idx === -1) {
            errors.push(decl);
            continue;
        }
        const prop = decl.slice(0, idx).trim().toLowerCase();
        const value = decl.slice(idx + 1).trim();
        const valid = CSS_PROP_ALLOWLIST.has(prop) && value.length > 0 && !CSS_VALUE_BLOCKLIST.some((re) => re.test(value));
        if (!valid) {
            errors.push(decl);
            continue;
        }
        style[kebabToCamel(prop)] = value;
    }
    return { style, errors };
}

/** Mesma allowlist/blocklist de `parseInlineCss`, aplicada a um objeto já em camelCase (defesa em profundidade). */
export function sanitizeCssObject(v: unknown): Record<string, string> | undefined {
    if (!v || typeof v !== 'object') return undefined;
    const out: Record<string, string> = {};
    for (const [key, val] of Object.entries(v as Record<string, unknown>)) {
        if (typeof val !== 'string') continue;
        const kebab = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        if (!CSS_PROP_ALLOWLIST.has(kebab)) continue;
        if (CSS_VALUE_BLOCKLIST.some((re) => re.test(val))) continue;
        out[key] = val;
    }
    return Object.keys(out).length ? out : undefined;
}

export function sanitizeHtmlAttrs(v: unknown): BaseElementStyle['htmlAttrs'] {
    if (!v || typeof v !== 'object') return undefined;
    const { id, className } = v as { id?: unknown; className?: unknown };
    const out: NonNullable<BaseElementStyle['htmlAttrs']> = {};
    if (isValidIdOrClass(id)) out.id = id;
    if (typeof className === 'string') {
        const classes = className.split(/\s+/).filter(Boolean).filter(isValidIdOrClass);
        if (classes.length) out.className = classes.join(' ');
    }
    return Object.keys(out).length ? out : undefined;
}

export function sanitizeBorder(v: unknown): ElementBorder | undefined {
    if (!v || typeof v !== 'object') return undefined;
    const b = v as Record<string, unknown>;
    const out: ElementBorder = {};
    if (isValidDimension(b.width)) out.width = b.width;
    if (isValidBorderStyle(b.style)) out.style = b.style;
    if (isValidHex(b.color)) out.color = b.color;
    return Object.keys(out).length ? out : undefined;
}

export function sanitizeShadow(v: unknown): ElementShadow | undefined {
    if (!v || typeof v !== 'object') return undefined;
    const s = v as Record<string, unknown>;
    const out: ElementShadow = {};
    if (isValidHex(s.color)) out.color = s.color;
    if (isValidDimension(s.x)) out.x = s.x;
    if (isValidDimension(s.y)) out.y = s.y;
    if (isValidDimension(s.blur)) out.blur = s.blur;
    if (isValidDimension(s.spread)) out.spread = s.spread;
    return Object.keys(out).length ? out : undefined;
}

// Os sanitizadores POR-TIPO de elemento (texto/botão/mídia/badge) vivem em
// `blocks/style-registry.ts` — derivados de `STYLE_PROP_REGISTRY`, uma fonte
// única por propriedade (schema do campo + sanitização + conversão pra CSS),
// em vez de 4 funções hand-written repetindo a mesma lista de `if`s. Aqui
// ficam só os validadores PRIMITIVOS (reaproveitados por aquele registry) —
// movidos pra evitar import circular (`style-registry.ts` importa daqui).
