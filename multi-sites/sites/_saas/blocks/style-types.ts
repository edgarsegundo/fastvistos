/**
 * Tipos genéricos de "Aparência por elemento" (estilo Carrd), reaproveitáveis
 * por qualquer bloco — não só o Hero. Cada elemento estilizável de um bloco
 * usa uma destas 3 interfaces conforme seu tipo (texto / botão / mídia).
 * Ausência de uma chave = herda do tema/Tailwind (opt-in, nunca substitui o
 * default). Ver `theme/validation.ts` (sanitização) e `blocks/style-runtime.ts`
 * (conversão pra CSS no render).
 */

/** Comum a todo elemento estilizável: escape hatches. */
export interface BaseElementStyle {
    /** Declarações CSS extra, já sanitizadas (chaves camelCase, tipo React.CSSProperties). */
    css?: Record<string, string>;
    /** ID/classe HTML customizados, pra hooks de CSS externos (ex: um bloco HtmlSafe/CodeEmbed). */
    htmlAttrs?: { id?: string; className?: string };
}

/** Elemento de texto (eyebrow, título, subtítulo, helper text, rating, trust bar). */
export interface TextElementStyle extends BaseElementStyle {
    color?: string;
    /** Chave do FONT_CATALOG (theme/fonts.ts), ex: "Poppins". */
    font?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    align?: 'left' | 'center' | 'right';
}

export interface ElementBorder {
    width?: string;
    style?: 'solid' | 'dashed' | 'dotted' | 'none';
    color?: string;
}

export interface ElementShadow {
    color?: string;
    x?: string;
    y?: string;
    blur?: string;
    spread?: string;
}

/** Elemento de botão (CTAs). */
export interface ButtonElementStyle extends BaseElementStyle {
    color?: string;
    bgColor?: string;
    hoverBgColor?: string;
    border?: ElementBorder;
    radius?: string;
    shadow?: ElementShadow;
    font?: string;
    fontSize?: string;
    fontWeight?: string;
    letterSpacing?: string;
}

/** Elemento de mídia (hero visual/imagem). */
export interface MediaElementStyle extends BaseElementStyle {
    border?: ElementBorder;
    radius?: string;
    shadow?: ElementShadow;
}

/** Selo/badge: texto + fundo/borda/raio (como um botão pequeno). */
export type BadgeElementStyle = TextElementStyle & {
    bgColor?: string;
    border?: ElementBorder;
    radius?: string;
};
