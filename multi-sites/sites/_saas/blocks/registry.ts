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
import Sobre from './Sobre';
import Depoimentos from './Depoimentos';
import Preco from './Preco';
import Faq from './Faq';
import Cta from './Cta';
import Contato from './Contato';

export const BLOCK_COMPONENTS: Record<string, ComponentType<any>> = {
    RichText,
    HtmlSafe,
    CodeEmbed,
    Hero,
    Features,
    Sobre,
    Depoimentos,
    Preco,
    Faq,
    Cta,
    Contato,
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
    /**
     * `text`/`textarea` viram inline (contentEditable) no canvas do Puck por
     * padrão — mas o Puck troca o valor de string por um objeto/ReactNode
     * quando faz isso, o que quebra blocos que fazem `.replace`/`.split` no
     * valor cru (ex: Contato.phone/whatsapp, Sobre.text). Marcar `false`
     * nesses campos força edição só pelo painel lateral (valor continua string).
     */
    inlineEditable?: boolean;
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
    Sobre: {
        label: 'Sobre',
        freeform: false,
        fields: {
            heading: { type: 'text', label: 'Título' },
            text: { type: 'textarea', label: 'Texto (parágrafos)', inlineEditable: false },
            imageUrl: { type: 'url', label: 'Imagem' },
            imagePosition: { type: 'select', label: 'Posição da imagem', options: ['left', 'right'] },
        },
    },
    Depoimentos: {
        label: 'Depoimentos',
        freeform: false,
        fields: {
            heading: { type: 'text', label: 'Título da seção' },
            items: {
                type: 'array', label: 'Depoimentos',
                itemFields: {
                    quote: { type: 'textarea', label: 'Citação' },
                    author: { type: 'text', label: 'Autor' },
                    role: { type: 'text', label: 'Cargo/empresa' },
                },
            },
        },
    },
    Preco: {
        label: 'Preço/Planos',
        freeform: false,
        fields: {
            heading: { type: 'text', label: 'Título da seção' },
            plans: {
                type: 'array', label: 'Planos',
                itemFields: {
                    name: { type: 'text', label: 'Nome' },
                    price: { type: 'text', label: 'Preço' },
                    period: { type: 'text', label: 'Período (ex: mês)' },
                    features: { type: 'array', label: 'Itens', itemFields: { text: { type: 'text', label: 'Item' } } },
                    ctaText: { type: 'text', label: 'Texto do botão' },
                    ctaHref: { type: 'url', label: 'Link do botão' },
                    highlighted: { type: 'text', label: 'Destaque (true/false)' },
                },
            },
        },
    },
    Faq: {
        label: 'FAQ',
        freeform: false,
        fields: {
            heading: { type: 'text', label: 'Título da seção' },
            items: {
                type: 'array', label: 'Perguntas',
                itemFields: {
                    question: { type: 'text', label: 'Pergunta' },
                    answer: { type: 'textarea', label: 'Resposta' },
                },
            },
        },
    },
    Cta: {
        label: 'CTA final',
        freeform: false,
        fields: {
            title: { type: 'text', label: 'Título' },
            subtitle: { type: 'textarea', label: 'Subtítulo' },
            ctaText: { type: 'text', label: 'Texto do botão' },
            ctaHref: { type: 'url', label: 'Link do botão' },
        },
    },
    Contato: {
        label: 'Contato',
        freeform: false,
        fields: {
            heading: { type: 'text', label: 'Título' },
            phone: { type: 'text', label: 'Telefone', inlineEditable: false },
            whatsapp: { type: 'text', label: 'WhatsApp (com DDI/DDD)', inlineEditable: false },
            email: { type: 'text', label: 'E-mail' },
            address: { type: 'textarea', label: 'Endereço' },
            hours: { type: 'text', label: 'Horário' },
            mapEmbedUrl: { type: 'url', label: 'URL de mapa (embed)' },
        },
    },
};
