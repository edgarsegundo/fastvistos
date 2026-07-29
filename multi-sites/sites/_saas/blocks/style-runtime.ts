/**
 * Converte os objetos de estilo por-elemento (`TextElementStyle` etc,
 * já sanitizados por `blocks/style-registry.ts`) em `React.CSSProperties`
 * pro render — e recolhe as fontes customizadas usadas por um documento de
 * blocos (pra emitir os `<link>` certos no `<head>`).
 *
 * Defesa em profundidade: `styleToCss` (style-registry.ts) roda o
 * sanitizador de novo antes de gerar o objeto de estilo, mesmo que algo
 * inválido já esteja salvo em `props.<elemento>Style` (bug futuro, edição
 * direta no banco) — nunca confia no que já está persistido.
 */
import type { CSSProperties } from 'react';
import { styleToCss, BADGE_STYLE_KEYS, BUTTON_STYLE_KEYS, MEDIA_STYLE_KEYS, TEXT_STYLE_KEYS } from './style-registry';
import { sanitizeHtmlAttrs } from '../theme/validation';
import styleManifest from './style-manifest.generated.json';
import type { BadgeElementStyle, BaseElementStyle, ButtonElementStyle, MediaElementStyle, TextElementStyle } from './style-types';

export function textStyleToCss(raw?: TextElementStyle): CSSProperties {
    return styleToCss(raw, TEXT_STYLE_KEYS);
}

export function badgeStyleToCss(raw?: BadgeElementStyle): CSSProperties {
    return styleToCss(raw, BADGE_STYLE_KEYS);
}

export function buttonStyleToCss(raw?: ButtonElementStyle): CSSProperties {
    return styleToCss(raw, BUTTON_STYLE_KEYS);
}

export function mediaStyleToCss(raw?: MediaElementStyle): CSSProperties {
    return styleToCss(raw, MEDIA_STYLE_KEYS);
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

/** Varre um documento de blocos e recolhe as chaves de fonte (FONT_CATALOG) usadas
 *  em `props.<elemento>Style.<elemento>.font`, pra QUALQUER bloco com campos de
 *  Aparência (não só Hero) — o mapa `<prop>Style → elementKey` por bloco vem do
 *  manifest gerado (`npm run gen:style-manifest`), não mais hardcoded aqui. */
export function collectBlockFontKeys(doc?: FontScanDocument | null): string[] {
    const keys: string[] = [];
    const blocks = styleManifest.blocks as Record<string, Record<string, string>>;
    for (const node of doc?.content ?? []) {
        const propToElement = blocks[node.type];
        if (!propToElement) continue;
        const props = node.props ?? {};
        for (const [propKey, elementKey] of Object.entries(propToElement)) {
            const wrapper = props[propKey] as Record<string, unknown> | undefined;
            const group = wrapper?.[elementKey];
            if (group && typeof group === 'object' && typeof (group as { font?: unknown }).font === 'string') {
                keys.push((group as { font: string }).font);
            }
        }
    }
    return keys;
}
