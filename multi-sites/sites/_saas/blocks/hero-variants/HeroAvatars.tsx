import type { HeroProps } from '../types';
import { Eyebrow, PrimaryCta } from './shared';

/** 17 — Prova social: fileira de avatares sobrepostos + nota + título + CTA. */
export default function HeroAvatars({
    eyebrow,
    title,
    avatars = [],
    ratingValue,
    ratingCount,
    ctaText,
    ctaHref,
}: HeroProps) {
    return (
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-16 text-center sm:py-20">
            <Eyebrow>{eyebrow}</Eyebrow>
            {avatars.length > 0 && (
                <div className="flex -space-x-3">
                    {avatars.map((a, i) => (
                        <img
                            key={i}
                            src={a.imageUrl}
                            alt={a.alt ?? ''}
                            loading="lazy"
                            className="h-11 w-11 rounded-full border-2 border-canvas object-cover"
                        />
                    ))}
                </div>
            )}
            {(ratingValue || ratingCount) && (
                <div className="flex items-center gap-2 text-sm text-muted">
                    <span className="text-primary" aria-hidden="true">
                        ★★★★★
                    </span>
                    {ratingValue && <span className="font-semibold text-ink">{ratingValue}</span>}
                    {ratingCount && <span>· {ratingCount} avaliações</span>}
                </div>
            )}
            {title && <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">{title}</h1>}
            <div className="mt-1">
                <PrimaryCta text={ctaText} href={ctaHref} />
            </div>
        </section>
    );
}
