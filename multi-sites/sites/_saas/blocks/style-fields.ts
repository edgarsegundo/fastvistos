/**
 * Campos-folha de Aparência compartilhados por TIPO de elemento (não um
 * formulário genérico de 20 campos pra tudo) — reaproveitados pelo `style`
 * de qualquer elemento do Hero (e, no futuro, de outros blocos) conforme o
 * tipo dele: texto, botão, mídia ou selo/badge.
 */
import type { FieldSchema } from './registry';

export const TEXT_STYLE_FIELDS: Record<string, FieldSchema> = {
    color: { type: 'color', label: 'Cor' },
    font: { type: 'font', label: 'Fonte' },
    fontSize: { type: 'dimension', label: 'Tamanho', units: ['px', 'rem'], range: { min: 10, max: 96, step: 1 } },
    fontWeight: { type: 'dimension', label: 'Peso', units: [], range: { min: 300, max: 900, step: 100 } },
    lineHeight: { type: 'dimension', label: 'Altura da linha', units: [], range: { min: 0.9, max: 2, step: 0.05 } },
    letterSpacing: { type: 'dimension', label: 'Espaçamento entre letras', units: ['px', 'em'], range: { min: -2, max: 10, step: 0.5 } },
    align: { type: 'select', label: 'Alinhamento', options: ['left', 'center', 'right'] },
    htmlAttrs: { type: 'htmlAttrs', label: 'ID / classe CSS' },
    css: { type: 'css', label: 'CSS customizado' },
};

export const BUTTON_STYLE_FIELDS: Record<string, FieldSchema> = {
    color: { type: 'color', label: 'Cor do texto' },
    bgColor: { type: 'color', label: 'Cor de fundo' },
    hoverBgColor: { type: 'color', label: 'Cor de fundo (hover)' },
    border: { type: 'border', label: 'Borda' },
    radius: { type: 'dimension', label: 'Arredondamento', units: ['px', 'rem', '%'], range: { min: 0, max: 64, step: 1 } },
    shadow: { type: 'shadow', label: 'Sombra' },
    font: { type: 'font', label: 'Fonte' },
    fontSize: { type: 'dimension', label: 'Tamanho', units: ['px', 'rem'], range: { min: 10, max: 32, step: 1 } },
    fontWeight: { type: 'dimension', label: 'Peso', units: [], range: { min: 300, max: 900, step: 100 } },
    letterSpacing: { type: 'dimension', label: 'Espaçamento entre letras', units: ['px', 'em'], range: { min: -1, max: 6, step: 0.5 } },
    htmlAttrs: { type: 'htmlAttrs', label: 'ID / classe CSS' },
    css: { type: 'css', label: 'CSS customizado' },
};

export const MEDIA_STYLE_FIELDS: Record<string, FieldSchema> = {
    border: { type: 'border', label: 'Borda' },
    radius: { type: 'dimension', label: 'Arredondamento', units: ['px', 'rem', '%'], range: { min: 0, max: 64, step: 1 } },
    shadow: { type: 'shadow', label: 'Sombra' },
    htmlAttrs: { type: 'htmlAttrs', label: 'ID / classe CSS' },
    css: { type: 'css', label: 'CSS customizado' },
};

export const BADGE_STYLE_FIELDS: Record<string, FieldSchema> = {
    ...TEXT_STYLE_FIELDS,
    bgColor: { type: 'color', label: 'Cor de fundo' },
    border: { type: 'border', label: 'Borda' },
    radius: { type: 'dimension', label: 'Arredondamento', units: ['px', 'rem', '%'], range: { min: 0, max: 999, step: 1 } },
};
