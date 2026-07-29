/**
 * Fonte única de verdade por PROPRIEDADE de estilo (não por "tipo" de
 * elemento). Cada propriedade lógica (cor, fonte, tamanho, sombra, etc.)
 * aparece UMA vez aqui, com: o schema do campo do editor (`fieldSchema`),
 * como sanitizar o valor bruto (`sanitize`) e como convertê-lo em
 * `React.CSSProperties` (`toCss`). `blocks/style-fields.ts` (schemas por
 * tipo + pick/omit por elemento) e `blocks/style-runtime.ts` (conversores
 * `*StyleToCss` chamados pelos blocos) derivam DESTA tabela — antes desse
 * refactor, a mesma propriedade era escrita à mão em ~4 lugares diferentes
 * (tipo TS, schema, sanitizador, conversor), fora o espelho em Python
 * (`vitrine/core/models.py`, que continua hand-mantido: TS não gera Python,
 * mas o teste de paridade em `vitrine/core/tests/test_style_sanitizer_parity.py`
 * pega divergência).
 *
 * Validadores primitivos (isValidHex etc.) e sanitizadores compostos
 * (border/shadow/css/htmlAttrs) vivem em `theme/validation.ts` — este
 * arquivo só COMPÕE eles por propriedade.
 */
import type { CSSProperties } from 'react';
import type { FieldSchema } from './registry';
import {
    isValidAlign,
    isValidDimension,
    isValidFontKey,
    isValidHex,
    sanitizeBorder,
    sanitizeCssObject,
    sanitizeHtmlAttrs,
    sanitizeShadow,
} from '../theme/validation';
import { FONT_CATALOG } from '../theme/fonts';
import type {
    BadgeElementStyle,
    ButtonElementStyle,
    ElementShadow,
    MediaElementStyle,
    TextElementStyle,
} from './style-types';

function fontFamily(key?: string): string | undefined {
    return key ? FONT_CATALOG[key]?.family : undefined;
}

function shadowToCssValue(shadow?: ElementShadow): string | undefined {
    if (!shadow) return undefined;
    const { color = 'rgba(0,0,0,.2)', x = '0', y = '2px', blur = '4px', spread = '0' } = shadow;
    return `${x} ${y} ${blur} ${spread} ${color}`;
}

const TEXT_TRANSFORM_VALUES = new Set(['none', 'uppercase', 'lowercase', 'capitalize']);
function isValidTextTransform(v: unknown): v is NonNullable<TextElementStyle['textTransform']> {
    return typeof v === 'string' && TEXT_TRANSFORM_VALUES.has(v);
}

export interface StylePropDef {
    /** Schema CANÔNICO do campo (label/units/range podem ser sobrescritos por-tipo via `pickFields`, ver style-fields.ts). */
    fieldSchema: FieldSchema;
    /** Valida o valor bruto (props[key]); `undefined` = inválido/ausente, descarta silenciosamente. */
    sanitize: (raw: unknown) => unknown;
    /** Converte o valor JÁ sanitizado num pedaço de `React.CSSProperties` (ou CSS var). */
    toCss: (value: any) => Record<string, string | number>;
}

/** Uma entrada por propriedade LÓGICA — reaproveitada por quantos "tipos" de elemento fizerem sentido. */
export const STYLE_PROP_REGISTRY: Record<string, StylePropDef> = {
    color: {
        fieldSchema: { type: 'color', label: 'Cor' },
        sanitize: (v) => (isValidHex(v) ? v : undefined),
        toCss: (v) => ({ color: v }),
    },
    bgColor: {
        fieldSchema: { type: 'color', label: 'Cor de fundo' },
        sanitize: (v) => (isValidHex(v) ? v : undefined),
        toCss: (v) => ({ backgroundColor: v }),
    },
    hoverBgColor: {
        fieldSchema: { type: 'color', label: 'Cor de fundo (hover)' },
        sanitize: (v) => (isValidHex(v) ? v : undefined),
        // ponte de CSS var pro hover (não expressável via `style` inline puro) — regra `:hover` em styles/saas.css.
        toCss: (v) => ({ '--cta-hover-bg': v }),
    },
    font: {
        fieldSchema: { type: 'font', label: 'Fonte' },
        sanitize: (v) => (isValidFontKey(v) ? v : undefined),
        toCss: (v) => {
            const out: Record<string, string> = {};
            const family = fontFamily(v);
            if (family) out.fontFamily = family;
            return out;
        },
    },
    fontSize: {
        fieldSchema: { type: 'dimension', label: 'Tamanho', units: ['px', 'rem'], range: { min: 10, max: 96, step: 1 } },
        sanitize: (v) => (isValidDimension(v) ? v : undefined),
        toCss: (v) => ({ fontSize: v }),
    },
    fontWeight: {
        fieldSchema: { type: 'dimension', label: 'Peso', units: [], range: { min: 300, max: 900, step: 100 } },
        sanitize: (v) => (isValidDimension(v) ? v : undefined),
        toCss: (v) => ({ fontWeight: v }),
    },
    lineHeight: {
        fieldSchema: { type: 'dimension', label: 'Altura da linha', units: [], range: { min: 0.9, max: 2, step: 0.05 } },
        sanitize: (v) => (isValidDimension(v) ? v : undefined),
        toCss: (v) => ({ lineHeight: v }),
    },
    letterSpacing: {
        fieldSchema: { type: 'dimension', label: 'Espaçamento entre letras', units: ['px', 'em'], range: { min: -2, max: 10, step: 0.5 } },
        sanitize: (v) => (isValidDimension(v) ? v : undefined),
        toCss: (v) => ({ letterSpacing: v }),
    },
    radius: {
        fieldSchema: { type: 'dimension', label: 'Arredondamento', units: ['px', 'rem', '%'], range: { min: 0, max: 64, step: 1 } },
        sanitize: (v) => (isValidDimension(v) ? v : undefined),
        toCss: (v) => ({ borderRadius: v }),
    },
    align: {
        fieldSchema: { type: 'select', label: 'Alinhamento', options: ['left', 'center', 'right', 'justify'] },
        sanitize: (v) => (isValidAlign(v) ? v : undefined),
        toCss: (v) => ({ textAlign: v }),
    },
    // --- propriedades novas desta sessão (fatia de prova do refactor) ---
    textTransform: {
        fieldSchema: {
            type: 'select', label: 'Transformação de texto',
            options: [
                { label: 'Nenhuma', value: 'none' },
                { label: 'MAIÚSCULAS', value: 'uppercase' },
                { label: 'minúsculas', value: 'lowercase' },
                { label: 'Primeira Letra Maiúscula', value: 'capitalize' },
            ],
        },
        sanitize: (v) => (isValidTextTransform(v) ? v : undefined),
        toCss: (v) => ({ textTransform: v }),
    },
    paragraphSpacing: {
        // Limitação atual: `inline-markup.ts` só converte `\n` em `<br/>` (não
        // monta parágrafos de verdade), então isso aplica como espaço DEPOIS do
        // bloco de texto inteiro (`margin-bottom`), não entre parágrafos
        // internos — resolver isso de verdade é trabalho de uma sessão futura
        // (mexe no parser do markup inline).
        fieldSchema: { type: 'dimension', label: 'Espaçamento entre parágrafos', units: ['px', 'rem', 'em'], range: { min: 0, max: 64, step: 1 } },
        sanitize: (v) => (isValidDimension(v) ? v : undefined),
        toCss: (v) => ({ marginBottom: v }),
    },
    // --- compostos (reaproveitam os sanitizadores já existentes em validation.ts) ---
    border: {
        fieldSchema: { type: 'border', label: 'Borda' },
        sanitize: (v) => sanitizeBorder(v),
        toCss: (v) => {
            const out: Record<string, string> = {};
            if (v?.width) out.borderWidth = v.width;
            if (v?.style) out.borderStyle = v.style;
            if (v?.color) out.borderColor = v.color;
            return out;
        },
    },
    shadow: {
        fieldSchema: { type: 'shadow', label: 'Sombra' },
        sanitize: (v) => sanitizeShadow(v),
        toCss: (v) => {
            const out: Record<string, string> = {};
            const shadow = shadowToCssValue(v);
            if (shadow) out.boxShadow = shadow;
            return out;
        },
    },
    css: {
        fieldSchema: { type: 'css', label: 'CSS customizado' },
        sanitize: (v) => sanitizeCssObject(v),
        // aplicado por último na composição (ver `styleToCss` abaixo) — sempre vence.
        toCss: (v) => v,
    },
    htmlAttrs: {
        fieldSchema: { type: 'htmlAttrs', label: 'ID / classe CSS' },
        sanitize: (v) => sanitizeHtmlAttrs(v),
        // não é uma propriedade CSS — lido separadamente via `styleHtmlAttrs()` em style-runtime.ts.
        toCss: () => ({}),
    },
};

/** Chaves por "tipo" de elemento — única fonte de quais propriedades cada tipo expõe por padrão. */
export const TEXT_STYLE_KEYS = [
    'color', 'font', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
    'align', 'textTransform', 'paragraphSpacing', 'htmlAttrs', 'css',
];
export const BUTTON_STYLE_KEYS = [
    'color', 'bgColor', 'hoverBgColor', 'border', 'radius', 'shadow',
    'font', 'fontSize', 'fontWeight', 'letterSpacing', 'htmlAttrs', 'css',
];
export const MEDIA_STYLE_KEYS = ['border', 'radius', 'shadow', 'htmlAttrs', 'css'];
export const BADGE_STYLE_KEYS = [...TEXT_STYLE_KEYS, 'bgColor', 'border', 'radius'];

/** Sanitiza um valor bruto, mantendo só as chaves de `keys` que passarem no `sanitize` de cada uma. */
export function sanitizeElementStyle(raw: unknown, keys: string[]): Record<string, unknown> {
    if (!raw || typeof raw !== 'object') return {};
    const v = raw as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of keys) {
        const def = STYLE_PROP_REGISTRY[key];
        if (!def) continue;
        const sanitized = def.sanitize(v[key]);
        if (sanitized !== undefined) out[key] = sanitized;
    }
    return out;
}

/** Sanitiza + converte pra `React.CSSProperties` — `css` (escape hatch) sempre por último, sempre vence. */
export function styleToCss(raw: unknown, keys: string[]): CSSProperties {
    const sanitized = sanitizeElementStyle(raw, keys);
    let out: Record<string, string | number> = {};
    for (const key of keys) {
        if (key === 'htmlAttrs' || key === 'css') continue;
        const value = sanitized[key];
        if (value === undefined) continue;
        out = { ...out, ...STYLE_PROP_REGISTRY[key].toCss(value) };
    }
    const cssEscape = sanitized.css as Record<string, string> | undefined;
    return { ...out, ...cssEscape } as CSSProperties;
}

// --- sanitizadores por-tipo (nomes/assinaturas idênticos aos que viviam em theme/validation.ts) ---
export const sanitizeTextStyle = (s?: unknown): TextElementStyle => sanitizeElementStyle(s, TEXT_STYLE_KEYS) as TextElementStyle;
export const sanitizeButtonStyle = (s?: unknown): ButtonElementStyle => sanitizeElementStyle(s, BUTTON_STYLE_KEYS) as ButtonElementStyle;
export const sanitizeMediaStyle = (s?: unknown): MediaElementStyle => sanitizeElementStyle(s, MEDIA_STYLE_KEYS) as MediaElementStyle;
export const sanitizeBadgeStyle = (s?: unknown): BadgeElementStyle => sanitizeElementStyle(s, BADGE_STYLE_KEYS) as BadgeElementStyle;
