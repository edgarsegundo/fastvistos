/**
 * Converte os objetos de estilo por-elemento (`TextElementStyle` etc,
 * já sanitizados por `theme/validation.ts`) em `React.CSSProperties` pro
 * render — e recolhe as fontes customizadas usadas por um documento de
 * blocos (pra emitir os `<link>` certos no `<head>`).
 *
 * Defesa em profundidade: cada função roda o sanitizador de novo antes de
 * gerar o objeto de estilo, mesmo que algo inválido já esteja salvo em
 * `props.style` (bug futuro, edição direta no banco) — nunca confia no que
 * já está persistido.
 */
import type { CSSProperties } from 'react';
import { FONT_CATALOG } from '../theme/fonts';
import {
    sanitizeBadgeStyle,
    sanitizeButtonStyle,
    sanitizeHtmlAttrs,
    sanitizeMediaStyle,
    sanitizeTextStyle,
} from '../theme/validation';
import type {
    BadgeElementStyle,
    BaseElementStyle,
    ButtonElementStyle,
    ElementShadow,
    MediaElementStyle,
    TextElementStyle,
} from './style-types';

function fontFamily(key?: string): string | undefined {
    return key ? FONT_CATALOG[key]?.family : undefined;
}

function shadowToCss(shadow?: ElementShadow): string | undefined {
    if (!shadow) return undefined;
    const { color = 'rgba(0,0,0,.2)', x = '0', y = '2px', blur = '4px', spread = '0' } = shadow;
    return `${x} ${y} ${blur} ${spread} ${color}`;
}

export function textStyleToCss(raw?: TextElementStyle | BadgeElementStyle): CSSProperties {
    const s = sanitizeTextStyle(raw);
    const out: CSSProperties = {};
    if (s.color) out.color = s.color;
    const family = fontFamily(s.font);
    if (family) out.fontFamily = family;
    if (s.fontSize) out.fontSize = s.fontSize;
    if (s.fontWeight) out.fontWeight = s.fontWeight as CSSProperties['fontWeight'];
    if (s.lineHeight) out.lineHeight = s.lineHeight;
    if (s.letterSpacing) out.letterSpacing = s.letterSpacing;
    if (s.align) out.textAlign = s.align;
    return { ...out, ...(s.css as CSSProperties | undefined) };
}

export function badgeStyleToCss(raw?: BadgeElementStyle): CSSProperties {
    const s = sanitizeBadgeStyle(raw);
    const base = textStyleToCss(s);
    const out: CSSProperties = { ...base };
    if (s.bgColor) out.backgroundColor = s.bgColor;
    if (s.border) {
        if (s.border.width) out.borderWidth = s.border.width;
        if (s.border.style) out.borderStyle = s.border.style;
        if (s.border.color) out.borderColor = s.border.color;
    }
    if (s.radius) out.borderRadius = s.radius;
    return out;
}

export function buttonStyleToCss(raw?: ButtonElementStyle): CSSProperties {
    const s = sanitizeButtonStyle(raw);
    const out: CSSProperties = {};
    if (s.color) out.color = s.color;
    if (s.bgColor) out.backgroundColor = s.bgColor;
    if (s.border) {
        if (s.border.width) out.borderWidth = s.border.width;
        if (s.border.style) out.borderStyle = s.border.style;
        if (s.border.color) out.borderColor = s.border.color;
    }
    if (s.radius) out.borderRadius = s.radius;
    const shadow = shadowToCss(s.shadow);
    if (shadow) out.boxShadow = shadow;
    const family = fontFamily(s.font);
    if (family) out.fontFamily = family;
    if (s.fontSize) out.fontSize = s.fontSize;
    if (s.fontWeight) out.fontWeight = s.fontWeight as CSSProperties['fontWeight'];
    if (s.letterSpacing) out.letterSpacing = s.letterSpacing;
    // ponte de CSS var pro hover (não expressável via `style` inline puro) —
    // mesmo padrão já usado pro tema global (--brand-*). Regra `:hover` em styles/saas.css.
    const vars: Record<string, string> = s.hoverBgColor ? { '--cta-hover-bg': s.hoverBgColor } : {};
    return { ...out, ...vars, ...(s.css as CSSProperties | undefined) };
}

export function mediaStyleToCss(raw?: MediaElementStyle): CSSProperties {
    const s = sanitizeMediaStyle(raw);
    const out: CSSProperties = {};
    if (s.border) {
        if (s.border.width) out.borderWidth = s.border.width;
        if (s.border.style) out.borderStyle = s.border.style;
        if (s.border.color) out.borderColor = s.border.color;
    }
    if (s.radius) out.borderRadius = s.radius;
    const shadow = shadowToCss(s.shadow);
    if (shadow) out.boxShadow = shadow;
    return { ...out, ...(s.css as CSSProperties | undefined) };
}

/** `id`/`className` extra do elemento — sanitiza de novo (defesa em profundidade). */
export function styleHtmlAttrs(raw?: BaseElementStyle): { id?: string; className?: string } {
    return sanitizeHtmlAttrs(raw?.htmlAttrs) ?? {};
}

/** Documento mínimo aceito por `collectBlockFontKeys` — estruturalmente compatível
 *  tanto com `BlockDocument` (blocks/types.ts, produção) quanto com `Data` do
 *  Puck (editor, `type` é `string` genérico, não a união discriminada). */
interface FontScanDocument {
    content?: { type: string; props?: Record<string, unknown> }[];
}

/** Varre um documento de blocos e recolhe as chaves de fonte (FONT_CATALOG) usadas em `props.style.*.font`. */
export function collectBlockFontKeys(doc?: FontScanDocument | null): string[] {
    const keys: string[] = [];
    for (const node of doc?.content ?? []) {
        if (node.type !== 'Hero') continue;
        const style = (node.props?.style as Record<string, unknown>) ?? {};
        for (const group of Object.values(style)) {
            if (group && typeof group === 'object' && typeof (group as { font?: unknown }).font === 'string') {
                keys.push((group as { font: string }).font);
            }
        }
    }
    return keys;
}
