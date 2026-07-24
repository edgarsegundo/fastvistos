/**
 * Tipos dos blocos do _saas (Fase 0 — fundação).
 *
 * O conteúdo de uma Page passa a ser um DOCUMENTO de blocos no formato do
 * Puck (o editor visual da Fase 2): { root, content: [...blocos] }. Cada
 * item de `content` tem um `type` (nome do bloco no registry) e `props`
 * (os campos daquele bloco). Este arquivo é a fonte de verdade dos campos
 * de cada bloco — reusada pelo BlockRenderer agora, e depois pelo config do
 * Puck (fase 2) e pelo contrato de saída da IA (fase 4).
 */

/** Props comuns a todo bloco (o Puck injeta um `id` por instância). */
export interface BaseBlockProps {
    id?: string;
}

/** Texto Rico — o "modo markdown" de hoje vira este bloco livre. */
export interface RichTextProps extends BaseBlockProps {
    /** Markdown cru; convertido para HTML no build (marked). */
    markdown: string;
}

/** HTML Seguro — o "modo html_safe" de hoje. Sanitizado no Django (bleach)
 *  ANTES de chegar aqui; este bloco só injeta o HTML já limpo. */
export interface HtmlSafeProps extends BaseBlockProps {
    html: string;
}

/** Code Embed — o "modo html_custom" de hoje: HTML+JS num iframe sandbox
 *  (seção 7 da spec). O endurecimento do sandbox é da fase 6. */
export interface CodeEmbedProps extends BaseBlockProps {
    html: string;
    /** Altura mínima do iframe em px (o conteúdo pode crescer além disso). */
    minHeight?: number;
}

/** Hero — primeiro bloco estruturado (campos tipados, não HTML livre). */
export interface HeroProps extends BaseBlockProps {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaHref?: string;
    align?: 'left' | 'center';
}

export interface FeatureItem {
    title: string;
    description?: string;
}

/** Features — grid de cards de serviço/benefício. */
export interface FeaturesProps extends BaseBlockProps {
    heading?: string;
    items: FeatureItem[];
}

/** Sobre/Apresentação — texto + imagem opcional ao lado. */
export interface SobreProps extends BaseBlockProps {
    heading?: string;
    text: string;
    imageUrl?: string;
    imagePosition?: 'left' | 'right';
}

export interface Testimonial {
    quote: string;
    author: string;
    role?: string;
}

/** Prova social / Depoimentos. */
export interface DepoimentosProps extends BaseBlockProps {
    heading?: string;
    items: Testimonial[];
}

export interface PricePlan {
    name: string;
    price: string;
    period?: string;
    features: string[];
    ctaText?: string;
    ctaHref?: string;
    highlighted?: boolean;
}

/** Preço/Planos. */
export interface PrecoProps extends BaseBlockProps {
    heading?: string;
    plans: PricePlan[];
}

export interface FaqItem {
    question: string;
    answer: string;
}

/** FAQ (conteúdo visível; independente do JSON-LD de FAQ do SEO por ora). */
export interface FaqProps extends BaseBlockProps {
    heading?: string;
    items: FaqItem[];
}

/** CTA final. */
export interface CtaProps extends BaseBlockProps {
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
}

/** Contato display-only — telefone/WhatsApp/endereço/horário/mapa, SEM
 *  formulário que envia (o form real é fase própria). */
export interface ContatoProps extends BaseBlockProps {
    heading?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    hours?: string;
    mapEmbedUrl?: string;
}

/** União discriminada de todos os blocos suportados. */
export type BlockNode =
    | { type: 'RichText'; props: RichTextProps }
    | { type: 'HtmlSafe'; props: HtmlSafeProps }
    | { type: 'CodeEmbed'; props: CodeEmbedProps }
    | { type: 'Hero'; props: HeroProps }
    | { type: 'Features'; props: FeaturesProps }
    | { type: 'Sobre'; props: SobreProps }
    | { type: 'Depoimentos'; props: DepoimentosProps }
    | { type: 'Preco'; props: PrecoProps }
    | { type: 'Faq'; props: FaqProps }
    | { type: 'Cta'; props: CtaProps }
    | { type: 'Contato'; props: ContatoProps };

/** Documento de blocos de uma página (formato Puck). */
export interface BlockDocument {
    root?: { props?: Record<string, unknown> };
    content: BlockNode[];
}
