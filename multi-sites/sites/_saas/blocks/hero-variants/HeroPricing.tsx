import type { HeroProps } from '../types';
import { Eyebrow } from './shared';

/** 18 — Cartão de preço: texto à esquerda, card de plano em destaque à direita. */
export default function HeroPricing({ eyebrow, title, subtitle, plan }: HeroProps) {
    const features = plan?.features ?? [];
    return (
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-16 sm:py-20 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col items-start gap-4 text-left">
                <Eyebrow>{eyebrow}</Eyebrow>
                {title && <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl">{title}</h1>}
                {subtitle && <p className="max-w-md text-lg text-muted">{subtitle}</p>}
            </div>
            <div className="w-full rounded-brand border border-line bg-surface p-7 shadow-sm">
                {plan?.name && (
                    <span className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
                        {plan.name}
                    </span>
                )}
                <div className="mt-3 flex items-end gap-1">
                    {plan?.price && <span className="font-heading text-4xl font-bold text-ink">{plan.price}</span>}
                    {plan?.period && <span className="mb-1 text-sm text-muted">{plan.period}</span>}
                </div>
                {features.length > 0 && (
                    <ul className="mt-6 flex flex-col gap-3 text-sm text-muted">
                        {features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="text-primary" aria-hidden="true">
                                    ✓
                                </span>
                                {f.text}
                            </li>
                        ))}
                    </ul>
                )}
                {plan?.ctaText && plan?.ctaHref && (
                    <a
                        href={plan.ctaHref}
                        className="mt-7 inline-block w-full rounded-brand bg-primary px-6 py-3 text-center font-semibold text-white no-underline hover:opacity-90"
                    >
                        {plan.ctaText}
                    </a>
                )}
            </div>
        </section>
    );
}
