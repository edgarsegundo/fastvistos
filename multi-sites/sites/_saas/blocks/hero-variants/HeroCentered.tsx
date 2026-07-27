import type { HeroCta, HeroProps } from '../types';
import { Eyebrow, CtaButton, Stars } from './shared';

/**
 * 01 — Centralizado (paridade com o s1 da galeria). Todos os elementos são
 * opcionais e regidos por CONTEÚDO: campo vazio = elemento não renderiza.
 * Cada elemento leva `data-el`/`data-el-label` (inertes na produção; alimentam
 * os labels do canvas no editor, via CSS do bundle do editor). Zero JS.
 */

/** Caixa do Hero Visual: imagem quando houver; placeholder só no editor. */
function HeroVisual({ imageUrl, title, isEditing }: { imageUrl?: string; title?: string; isEditing?: boolean }) {
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={title ?? ''}
                loading="lazy"
                data-el="heroVisual"
                data-el-label="Hero Visual"
                className="mt-8 aspect-video w-full max-w-md rounded-brand border border-line object-cover"
            />
        );
    }
    if (isEditing) {
        return (
            <div
                data-el="heroVisual"
                data-el-label="Hero Visual"
                className="mt-8 flex aspect-video w-full max-w-md items-center justify-center rounded-brand border border-line bg-surface text-xs uppercase tracking-widest text-muted"
            >
                Imagem do hero
            </div>
        );
    }
    return null;
}

export default function HeroCentered(props: HeroProps) {
    const {
        eyebrow,
        title,
        subtitle,
        align = 'center',
        announcementBadge,
        heroVisual,
        ctas,
        ctaText,
        ctaHref,
        helperText,
        rating,
        trustBar,
        socialProofOrder = 'rating-first',
        showEyebrow,
        showSubtitle,
        showBadge,
        showHelper,
        showRating,
        showTrust,
        puck,
    } = props;
    const isEditing = puck?.isEditing;
    const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left';
    // toggle: undefined/'yes' = mostrar, 'no' = ocultar
    const on = (t?: string) => t !== 'no';

    // CTAs: usa a lista nova; se vazia, cai no par legado (retrocompat).
    const ctaList: HeroCta[] =
        ctas && ctas.length > 0
            ? ctas
            : ctaText && ctaHref
              ? [{ label: ctaText, href: ctaHref, variant: 'primary' }]
              : [];

    const pos = heroVisual?.position ?? 'none';
    const showVisual = pos !== 'none' && (heroVisual?.imageUrl || isEditing);

    const ratingEl = on(showRating) && (rating?.value || rating?.count) && (
        <div data-el="rating" data-el-label="Avaliação" className="mt-6">
            <Stars value={rating?.value} count={rating?.count} />
        </div>
    );
    const trustEl = on(showTrust) && trustBar && trustBar.length > 0 && (
        <div
            data-el="trustBar"
            data-el-label="Confiança"
            className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-widest text-muted opacity-80"
        >
            {trustBar.map((t, i) => (
                <span key={i}>{t.text}</span>
            ))}
        </div>
    );
    const socialProof =
        socialProofOrder === 'trust-first' ? (
            <>
                {trustEl}
                {ratingEl}
            </>
        ) : (
            <>
                {ratingEl}
                {trustEl}
            </>
        );

    return (
        <section className={`mx-auto flex max-w-4xl flex-col gap-4 px-6 py-16 sm:py-20 md:px-10 ${alignClass}`}>
            {on(showBadge) && announcementBadge?.label && (
                <a
                    href={announcementBadge.href || '#'}
                    data-el="announcementBadge"
                    data-el-label="Selo de anúncio"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-ink no-underline transition hover:border-ink"
                >
                    {announcementBadge.tag && (
                        <span className="font-semibold uppercase tracking-wide text-primary">{announcementBadge.tag}</span>
                    )}
                    <span>{announcementBadge.label}</span>
                    <span aria-hidden="true">→</span>
                </a>
            )}

            {on(showEyebrow) && eyebrow && (
                <span
                    data-el="eyebrow"
                    data-el-label="Eyebrow"
                    className="font-heading text-sm font-semibold uppercase tracking-widest text-primary"
                >
                    {eyebrow}
                </span>
            )}

            {title && (
                <h1
                    data-el="title"
                    data-el-label="Título"
                    className="font-heading text-4xl font-bold text-ink sm:text-5xl lg:text-6xl"
                >
                    {title}
                </h1>
            )}

            {on(showSubtitle) && subtitle && (
                <p data-el="subtitle" data-el-label="Subtítulo" className="max-w-2xl text-lg text-muted sm:text-xl">
                    {subtitle}
                </p>
            )}

            {pos === 'mid' && showVisual && (
                <HeroVisual imageUrl={heroVisual?.imageUrl} title={title} isEditing={isEditing} />
            )}

            {ctaList.length > 0 && (
                <div
                    data-el="ctas"
                    data-el-label="Botões"
                    className={`mt-5 flex flex-wrap items-center gap-4 ${align === 'center' ? 'justify-center' : 'justify-start'}`}
                >
                    {ctaList.slice(0, 3).map((cta, i) => (
                        <CtaButton key={i} cta={cta} />
                    ))}
                </div>
            )}

            {on(showHelper) && helperText && (
                <span data-el="helperText" data-el-label="Texto de apoio" className="mt-2 text-sm text-muted">
                    {helperText}
                </span>
            )}

            {socialProof}

            {pos === 'bottom' && showVisual && (
                <HeroVisual imageUrl={heroVisual?.imageUrl} title={title} isEditing={isEditing} />
            )}
        </section>
    );
}
