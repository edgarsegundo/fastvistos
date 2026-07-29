import type { HeroCta, HeroProps } from '../types';
import type { MediaElementStyle } from '../style-types';
import { CtaButton, Stars } from './shared';
import { badgeStyleToCss, mediaStyleToCss, styleHtmlAttrs, textStyleToCss } from '../style-runtime';
import { parseInlineMarkup } from '../inline-markup';

/**
 * 01 — Centralizado (paridade com o s1 da galeria). Todos os elementos são
 * opcionais e regidos por CONTEÚDO: campo vazio = elemento não renderiza.
 * Cada elemento leva `data-el`/`data-el-label` (inertes na produção; alimentam
 * os labels do canvas no editor, via CSS do bundle do editor) — a MESMA
 * chave nomeia seu prop `<elemento>Style` (Aparência por elemento, opt-in,
 * ver HeroElementStyles em ../types.ts). Zero JS na ausência de
 * customização: `style=`/`id=`/`className=` calculados só adicionam o que
 * foi customizado, nunca removem uma classe Tailwind.
 */

/** Caixa do Hero Visual: imagem quando houver; placeholder só no editor. */
function HeroVisual({
    imageUrl,
    title,
    isEditing,
    style,
}: {
    imageUrl?: string;
    title?: string;
    isEditing?: boolean;
    style?: MediaElementStyle;
}) {
    const attrs = styleHtmlAttrs(style);
    const css = mediaStyleToCss(style);
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={title ?? ''}
                loading="lazy"
                data-el="heroVisual"
                data-el-label="Hero Visual"
                id={attrs.id}
                className={`mt-8 aspect-video w-full max-w-md rounded-brand border border-line object-cover ${attrs.className ?? ''}`.trim()}
                style={css}
            />
        );
    }
    if (isEditing) {
        return (
            <div
                data-el="heroVisual"
                data-el-label="Hero Visual"
                id={attrs.id}
                className={`mt-8 flex aspect-video w-full max-w-md items-center justify-center rounded-brand border border-line bg-surface text-xs uppercase tracking-widest text-muted ${attrs.className ?? ''}`.trim()}
                style={css}
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
        eyebrowStyle,
        titleStyle,
        subtitleStyle,
        announcementBadgeStyle,
        heroVisualStyle,
        ctasStyle,
        helperTextStyle,
        ratingStyle,
        trustBarStyle,
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
        <Stars
            value={rating?.value}
            count={rating?.count}
            style={ratingStyle?.rating}
            dataEl="rating"
            dataElLabel="Avaliação"
            extraClassName="mt-6"
        />
    );
    const trustAttrs = styleHtmlAttrs(trustBarStyle?.trustBar);
    const trustEl = on(showTrust) && trustBar && trustBar.length > 0 && (
        <div
            data-el="trustBar"
            data-el-label="Confiança"
            id={trustAttrs.id}
            className={`mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-widest text-muted opacity-80 ${trustAttrs.className ?? ''}`.trim()}
            style={textStyleToCss(trustBarStyle?.trustBar)}
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

    const badgeAttrs = styleHtmlAttrs(announcementBadgeStyle?.announcementBadge);
    const eyebrowAttrs = styleHtmlAttrs(eyebrowStyle?.eyebrow);
    const titleAttrs = styleHtmlAttrs(titleStyle?.title);
    const subtitleAttrs = styleHtmlAttrs(subtitleStyle?.subtitle);
    const ctasAttrs = styleHtmlAttrs(ctasStyle?.ctas);
    const helperAttrs = styleHtmlAttrs(helperTextStyle?.helperText);

    return (
        <section className={`mx-auto flex max-w-4xl flex-col gap-4 px-6 py-16 sm:py-20 md:px-10 ${alignClass}`}>
            {on(showBadge) && announcementBadge?.label && (
                <a
                    href={announcementBadge.href || '#'}
                    data-el="announcementBadge"
                    data-el-label="Selo de anúncio"
                    id={badgeAttrs.id}
                    className={`inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-ink no-underline transition hover:border-ink ${badgeAttrs.className ?? ''}`.trim()}
                    style={badgeStyleToCss(announcementBadgeStyle?.announcementBadge)}
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
                    id={eyebrowAttrs.id}
                    className={`font-heading text-sm font-semibold uppercase tracking-widest text-primary ${eyebrowAttrs.className ?? ''}`.trim()}
                    style={textStyleToCss(eyebrowStyle?.eyebrow)}
                >
                    {parseInlineMarkup(eyebrow, 'eyebrow')}
                </span>
            )}

            {title && (
                <h1
                    data-el="title"
                    data-el-label="Título"
                    id={titleAttrs.id}
                    className={`font-heading text-4xl font-bold text-ink sm:text-5xl lg:text-6xl ${titleAttrs.className ?? ''}`.trim()}
                    style={textStyleToCss(titleStyle?.title)}
                >
                    {parseInlineMarkup(title, 'title')}
                </h1>
            )}

            {on(showSubtitle) && subtitle && (
                <p
                    data-el="subtitle"
                    data-el-label="Subtítulo"
                    id={subtitleAttrs.id}
                    className={`max-w-2xl text-lg text-muted sm:text-xl ${subtitleAttrs.className ?? ''}`.trim()}
                    style={textStyleToCss(subtitleStyle?.subtitle)}
                >
                    {parseInlineMarkup(subtitle, 'subtitle')}
                </p>
            )}

            {pos === 'mid' && showVisual && (
                <HeroVisual imageUrl={heroVisual?.imageUrl} title={title} isEditing={isEditing} style={heroVisualStyle?.heroVisual} />
            )}

            {ctaList.length > 0 && (
                <div
                    data-el="ctas"
                    data-el-label="Botões"
                    id={ctasAttrs.id}
                    className={`mt-5 flex flex-wrap items-center gap-4 ${align === 'center' ? 'justify-center' : 'justify-start'} ${ctasAttrs.className ?? ''}`.trim()}
                >
                    {ctaList.slice(0, 3).map((cta, i) => (
                        <CtaButton key={i} cta={cta} style={ctasStyle?.ctas} />
                    ))}
                </div>
            )}

            {on(showHelper) && helperText && (
                <span
                    data-el="helperText"
                    data-el-label="Texto de apoio"
                    id={helperAttrs.id}
                    className={`mt-2 text-sm text-muted ${helperAttrs.className ?? ''}`.trim()}
                    style={textStyleToCss(helperTextStyle?.helperText)}
                >
                    {parseInlineMarkup(helperText, 'helperText')}
                </span>
            )}

            {socialProof}

            {pos === 'bottom' && showVisual && (
                <HeroVisual imageUrl={heroVisual?.imageUrl} title={title} isEditing={isEditing} style={heroVisualStyle?.heroVisual} />
            )}
        </section>
    );
}
