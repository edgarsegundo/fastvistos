/**
 * Tipos genéricos de "Aparência por elemento" (estilo Carrd), reaproveitáveis
 * por qualquer bloco — não só o Hero. Cada elemento estilizável de um bloco
 * usa uma destas 4 interfaces conforme seu tipo (texto / botão / mídia /
 * badge). Ausência de uma chave = herda do tema/Tailwind (opt-in, nunca
 * substitui o default). Ver `theme/validation.ts` (validadores primitivos),
 * `blocks/style-registry.ts` (schema/sanitização/CSS por propriedade, fonte
 * única) e `blocks/style-fields.ts` (agrupamento por tipo + pick/omit).
 *
 * `TextElementStyle`/`ButtonElementStyle`/`MediaElementStyle`/
 * `BadgeElementStyle` são `Pick`s de UMA interface mestra (`AnyElementStyle`)
 * com todas as propriedades possíveis — espelha ao nível de tipo o que o
 * sanitizador Python (`vitrine/core/models.py::_sanitize_style_element`) já
 * assume na prática: um bag de chaves agnóstico de tipo, onde cada
 * `*StyleToCss` só lê as que fazem sentido pro elemento.
 */

/** Comum a todo elemento estilizável: escape hatches. */
export interface BaseElementStyle {
    /** Declarações CSS extra, já sanitizadas (chaves camelCase, tipo React.CSSProperties). */
    css?: Record<string, string>;
    /** ID/classe HTML customizados, pra hooks de CSS externos (ex: um bloco HtmlSafe/CodeEmbed). */
    htmlAttrs?: { id?: string; className?: string };
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

/** Superset de toda propriedade estilizável que qualquer elemento pode ter. */
export interface AnyElementStyle extends BaseElementStyle {
    color?: string;
    bgColor?: string;
    hoverBgColor?: string;
    /** Chave do FONT_CATALOG (theme/fonts.ts), ex: "Poppins". */
    font?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    /** Aplicado como `margin-bottom` no elemento — ver nota em style-registry.ts sobre a limitação atual (1 bloco de texto, não por-parágrafo real). */
    paragraphSpacing?: string;
    border?: ElementBorder;
    radius?: string;
    shadow?: ElementShadow;
}

/** Elemento de texto (eyebrow, título, subtítulo, helper text, rating, trust bar). */
export type TextElementStyle = Pick<
    AnyElementStyle,
    'color' | 'font' | 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing' | 'align' | 'textTransform' | 'paragraphSpacing' | 'css' | 'htmlAttrs'
>;

/** Elemento de botão (CTAs). */
export type ButtonElementStyle = Pick<
    AnyElementStyle,
    'color' | 'bgColor' | 'hoverBgColor' | 'border' | 'radius' | 'shadow' | 'font' | 'fontSize' | 'fontWeight' | 'letterSpacing' | 'css' | 'htmlAttrs'
>;

/** Elemento de mídia (hero visual/imagem). */
export type MediaElementStyle = Pick<AnyElementStyle, 'border' | 'radius' | 'shadow' | 'css' | 'htmlAttrs'>;

/** Selo/badge: texto + fundo/borda/raio (como um botão pequeno). */
export type BadgeElementStyle = TextElementStyle & Pick<AnyElementStyle, 'bgColor' | 'border' | 'radius'>;
