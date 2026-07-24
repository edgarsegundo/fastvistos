/**
 * Registry de blocos (código, não banco).
 *
 * Fonte única do catálogo da fase 0. Dois consumidores:
 *  - BLOCK_COMPONENTS → o BlockRenderer.astro escolhe o componente por `type`.
 *  - BLOCK_SCHEMAS    → semente do config do Puck (fase 2) e do contrato de
 *                       saída da IA (fase 4). Descreve os campos editáveis de
 *                       cada bloco de forma neutra de framework.
 *
 * Decisão (ver plano): BlockDefinition/BlockVariant da seção 11 da spec vivem
 * aqui, em código, não como linhas no banco — o catálogo é finito e curado.
 */
import type { ComponentType } from 'react';
import RichText from './RichText';
import HtmlSafe from './HtmlSafe';
import CodeEmbed from './CodeEmbed';
import Hero from './Hero';
import Features from './Features';

export const BLOCK_COMPONENTS: Record<string, ComponentType<any>> = {
    RichText,
    HtmlSafe,
    CodeEmbed,
    Hero,
    Features,
};

/** Tipo de campo editável — expandido nas fases 2/4. */
export type FieldType = 'text' | 'textarea' | 'markdown' | 'html' | 'url' | 'select' | 'array';

export interface FieldSchema {
    type: FieldType;
    label: string;
    /** para type 'array': schema de cada item */
    itemFields?: Record<string, FieldSchema>;
    /** para type 'select': opções válidas */
    options?: string[];
}

export interface BlockSchema {
    label: string;
    /** bloco livre (escape hatch) vs. estruturado (campos tipados) */
    freeform: boolean;
    fields: Record<string, FieldSchema>;
}

export const BLOCK_SCHEMAS: Record<string, BlockSchema> = {
    RichText: {
        label: 'Texto Rico',
        freeform: true,
        fields: { markdown: { type: 'markdown', label: 'Conteúdo (Markdown)' } },
    },
    HtmlSafe: {
        label: 'HTML Seguro',
        freeform: true,
        fields: { html: { type: 'html', label: 'HTML (sem JavaScript)' } },
    },
    CodeEmbed: {
        label: 'Code Embed',
        freeform: true,
        fields: {
            html: { type: 'html', label: 'HTML + CSS + JavaScript' },
            minHeight: { type: 'text', label: 'Altura mínima (px)' },
        },
    },
    Hero: {
        label: 'Hero',
        freeform: false,
        fields: {
            title: { type: 'text', label: 'Título' },
            subtitle: { type: 'textarea', label: 'Subtítulo' },
            imageUrl: { type: 'url', label: 'Imagem' },
            ctaText: { type: 'text', label: 'Texto do botão' },
            ctaHref: { type: 'url', label: 'Link do botão' },
            align: { type: 'select', label: 'Alinhamento', options: ['left', 'center'] },
        },
    },
    Features: {
        label: 'Features',
        freeform: false,
        fields: {
            heading: { type: 'text', label: 'Título da seção' },
            items: {
                type: 'array',
                label: 'Cards',
                itemFields: {
                    title: { type: 'text', label: 'Título' },
                    description: { type: 'textarea', label: 'Descrição' },
                },
            },
        },
    },
};
