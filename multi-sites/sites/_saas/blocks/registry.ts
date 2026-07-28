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
export type FieldType = 'text' | 'textarea' | 'markdown' | 'html' | 'url' | 'image' | 'select' | 'radio' | 'toggle' | 'array' | 'object';

/** Opção de select/radio: string simples (label = value) ou par label/valor. */
export type SelectOption = string | { label: string; value: string };

export interface FieldSchema {
    type: FieldType;
    label: string;
    /** para type 'array': schema de cada item */
    itemFields?: Record<string, FieldSchema>;
    /** para type 'array': limite de itens (usa o `max` nativo do Puck) */
    max?: number;
    /** para type 'object': schema dos sub-campos (objeto único, não lista) */
    objectFields?: Record<string, FieldSchema>;
    /** para type 'select'/'radio': opções válidas (string ou {label,value}) */
    options?: SelectOption[];
    /**
     * `text`/`textarea` viram inline (contentEditable) no canvas do Puck por
     * padrão — mas o Puck troca o valor de string por um objeto/ReactNode
     * quando faz isso, o que quebra blocos que fazem `.replace`/`.split` no
     * valor cru (ex: Contato.phone/whatsapp, Sobre.text). Marcar `false`
     * nesses campos força edição só pelo painel lateral (valor continua string).
     */
    inlineEditable?: boolean;
    /**
     * Para blocos com `variantField`: lista de valores da variante em que este
     * campo aparece no painel. Ausente = sempre aparece. O adapter (puck.config)
     * emite um `resolveFields` que mostra/esconde por aqui — o registry continua
     * a fonte única de quais campos existem por variante.
     */
    showFor?: string[];
    /**
     * Esconde ESTE campo do painel quando `props[field] === equals` — usado
     * pelos toggles de "Mostrar/Ocultar" por elemento: quando o toggle está em
     * 'no', o(s) campo(s) de conteúdo daquele elemento somem do painel (e o
     * render também não mostra o elemento). Só oculta com match exato, então em
     * variantes onde o toggle nem existe (undefined) o campo continua visível.
     */
    hideWhen?: { field: string; equals: string };
}

/** Opções padrão de um toggle Mostrar/Ocultar por elemento. */
export const SHOW_HIDE_OPTIONS: SelectOption[] = [
    { label: 'Mostrar', value: 'yes' },
    { label: 'Ocultar', value: 'no' },
];

export interface BlockSchema {
    label: string;
    /** bloco livre (escape hatch) vs. estruturado (campos tipados) */
    freeform: boolean;
    fields: Record<string, FieldSchema>;
    /**
     * Nome do campo discriminador de variante (ex: 'layout'). Quando presente,
     * o adapter filtra os campos por `showFor` conforme o valor atual desse
     * campo — o mesmo bloco muda de layout e de painel sem virar N blocos.
     */
    variantField?: string;
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
        variantField: 'layout',
        fields: {
            // discriminador — sempre visível; troca o layout e o resto do painel
            layout: {
                type: 'select',
                label: 'Layout',
                options: [
                    { label: 'Centralizado', value: 'centered' },
                    { label: 'Dividido (imagem ao lado)', value: 'split' },
                    { label: 'Imagem de fundo', value: 'fullbleed' },
                    { label: 'Tipográfico', value: 'typographic' },
                    { label: 'Prova social (avatares)', value: 'avatars' },
                    { label: 'Cartão de preço', value: 'pricing' },
                ],
            },
            // compartilhados (o showEyebrow/showSubtitle só existem no centered;
            // nas outras variantes ficam undefined e o campo aparece normal)
            showEyebrow: { type: 'toggle', label: 'Sobretítulo (eyebrow)', showFor: ['centered'] },
            eyebrow: { type: 'text', label: 'Texto do eyebrow', showFor: ['centered', 'split', 'fullbleed', 'avatars', 'pricing'], hideWhen: { field: 'showEyebrow', equals: 'no' } },
            title: { type: 'text', label: 'Título', showFor: ['centered', 'split', 'fullbleed', 'avatars', 'pricing'] },
            showSubtitle: { type: 'toggle', label: 'Subtítulo', showFor: ['centered'] },
            subtitle: { type: 'textarea', label: 'Texto do subtítulo', showFor: ['centered', 'split', 'pricing'], hideWhen: { field: 'showSubtitle', equals: 'no' } },
            align: { type: 'select', label: 'Alinhamento', options: ['left', 'center'], showFor: ['centered'] },
            imageUrl: { type: 'image', label: 'Imagem', showFor: ['split', 'fullbleed'] },
            ctaText: { type: 'text', label: 'Texto do botão', showFor: ['split', 'fullbleed', 'avatars'] },
            ctaHref: { type: 'url', label: 'Link do botão', showFor: ['split', 'fullbleed', 'avatars'] },
            // === Centralizado completo (paridade com o s1 da galeria) ===
            // Cada elemento tem um toggle Mostrar/Ocultar; quando 'no', o campo
            // some do painel (hideWhen) e o render não mostra o elemento.
            showBadge: { type: 'toggle', label: 'Selo de anúncio', showFor: ['centered'] },
            announcementBadge: {
                type: 'object',
                label: 'Conteúdo do selo',
                showFor: ['centered'],
                hideWhen: { field: 'showBadge', equals: 'no' },
                objectFields: {
                    tag: { type: 'text', label: 'Etiqueta (ex: NOVO)' },
                    label: { type: 'text', label: 'Texto' },
                    href: { type: 'url', label: 'Link' },
                },
            },
            heroVisual: {
                type: 'object',
                label: 'Hero Visual',
                showFor: ['centered'],
                objectFields: {
                    imageUrl: { type: 'image', label: 'Imagem' },
                    position: {
                        type: 'radio',
                        label: 'Posição',
                        options: [
                            { label: 'Oculto', value: 'none' },
                            { label: 'Meio', value: 'mid' },
                            { label: 'Final', value: 'bottom' },
                        ],
                    },
                },
            },
            ctas: {
                type: 'array',
                label: 'Botões (máx. 3)',
                showFor: ['centered'],
                max: 3,
                itemFields: {
                    label: { type: 'text', label: 'Texto' },
                    href: { type: 'url', label: 'Link' },
                    variant: {
                        type: 'radio',
                        label: 'Estilo',
                        options: [
                            { label: 'Primário', value: 'primary' },
                            { label: 'Contorno', value: 'outline' },
                            { label: 'Fantasma', value: 'ghost' },
                        ],
                    },
                },
            },
            showHelper: { type: 'toggle', label: 'Texto de apoio', showFor: ['centered'] },
            helperText: { type: 'text', label: 'Texto de apoio', showFor: ['centered'], hideWhen: { field: 'showHelper', equals: 'no' } },
            showRating: { type: 'toggle', label: 'Avaliação', showFor: ['centered'] },
            rating: {
                type: 'object',
                label: 'Conteúdo da avaliação',
                showFor: ['centered'],
                hideWhen: { field: 'showRating', equals: 'no' },
                objectFields: {
                    value: { type: 'text', label: 'Nota (ex: 4.9)' },
                    count: { type: 'text', label: 'Nº de avaliações' },
                },
            },
            showTrust: { type: 'toggle', label: 'Barra de confiança', showFor: ['centered'] },
            trustBar: {
                type: 'array',
                label: 'Logos/nomes',
                showFor: ['centered'],
                hideWhen: { field: 'showTrust', equals: 'no' },
                itemFields: { text: { type: 'text', label: 'Nome' } },
            },
            socialProofOrder: {
                type: 'radio',
                label: 'Ordem da prova social',
                showFor: ['centered'],
                options: [
                    { label: 'Avaliação primeiro', value: 'rating-first' },
                    { label: 'Confiança primeiro', value: 'trust-first' },
                ],
            },
            // tipográfico
            bigWord: { type: 'text', label: 'Palavra grande', showFor: ['typographic'] },
            accentWord: { type: 'text', label: 'Palavra de destaque', showFor: ['typographic'] },
            caption: { type: 'textarea', label: 'Legenda', showFor: ['typographic'] },
            // avatares
            avatars: {
                type: 'array',
                label: 'Avatares',
                showFor: ['avatars'],
                itemFields: {
                    imageUrl: { type: 'image', label: 'Imagem' },
                    alt: { type: 'text', label: 'Descrição (alt)' },
                },
            },
            ratingValue: { type: 'text', label: 'Nota (ex: 4.9)', showFor: ['avatars'] },
            ratingCount: { type: 'text', label: 'Nº de avaliações', showFor: ['avatars'] },
            // cartão de preço (objeto aninhado)
            plan: {
                type: 'object',
                label: 'Plano',
                showFor: ['pricing'],
                objectFields: {
                    name: { type: 'text', label: 'Nome do plano' },
                    price: { type: 'text', label: 'Preço' },
                    period: { type: 'text', label: 'Período (ex: à vista)' },
                    features: { type: 'array', label: 'Itens', itemFields: { text: { type: 'text', label: 'Item' } } },
                    ctaText: { type: 'text', label: 'Texto do botão' },
                    ctaHref: { type: 'url', label: 'Link do botão' },
                },
            },
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
            imageUrl: { type: 'image', label: 'Imagem' },
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
