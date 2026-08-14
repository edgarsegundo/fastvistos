import type { CtaProps } from './types';
import { buttonStyleToCss, styleHtmlAttrs, textStyleToCss } from './style-runtime';

/**
 * Bloco CTA final — faixa de chamada pra ação. Estático (zero JS).
 * `data-el`/`data-el-label` inertes na produção (alimentam os labels do
 * canvas no editor) — mesmo padrão do Hero, ver blocks/style-runtime.ts.
 */
export default function Cta({ title, subtitle, ctaText, ctaHref, titleStyle, subtitleStyle, ctaStyle }: CtaProps) {
    const titleAttrs = styleHtmlAttrs(titleStyle?.title);
    const subtitleAttrs = styleHtmlAttrs(subtitleStyle?.subtitle);

    return (
        <section className="bg-primary py-16 text-white">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
                <h2
                    data-el="title"
                    data-el-label="Título"
                    id={titleAttrs.id}
                    className={`font-heading text-3xl font-bold ${titleAttrs.className ?? ''}`.trim()}
                    style={textStyleToCss(titleStyle?.title)}
                >
                    {title}
                </h2>
                {subtitle && (
                    <p
                        data-el="subtitle"
                        data-el-label="Subtítulo"
                        id={subtitleAttrs.id}
                        className={`text-lg text-white/90 ${subtitleAttrs.className ?? ''}`.trim()}
                        style={textStyleToCss(subtitleStyle?.subtitle)}
                    >
                        {subtitle}
                    </p>
                )}
                {ctaText && ctaHref && (
                    <a
                        href={ctaHref}
                        data-el="cta"
                        data-el-label="Botão"
                        className="mt-2 rounded-brand bg-white px-6 py-3 font-semibold text-primary no-underline hover:opacity-90"
                        style={buttonStyleToCss(ctaStyle?.cta)}
                    >
                        {ctaText}
                    </a>
                )}
            </div>
        </section>
    );
}
