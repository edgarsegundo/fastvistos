import type { CtaProps } from './types';

/**
 * Bloco CTA final — faixa de chamada pra ação. Estático (zero JS).
 */
export default function Cta({ title, subtitle, ctaText, ctaHref }: CtaProps) {
    return (
        <section className="bg-primary py-16 text-white">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
                <h2 className="font-heading text-3xl font-bold">{title}</h2>
                {subtitle && <p className="text-lg text-white/90">{subtitle}</p>}
                {ctaText && ctaHref && (
                    <a
                        href={ctaHref}
                        className="mt-2 rounded-brand bg-white px-6 py-3 font-semibold text-primary no-underline hover:opacity-90"
                    >
                        {ctaText}
                    </a>
                )}
            </div>
        </section>
    );
}
