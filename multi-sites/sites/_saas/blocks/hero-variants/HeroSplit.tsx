import type { HeroProps } from '../types';
import { Eyebrow, PrimaryCta } from './shared';

/** 02 — Dividido: texto à esquerda, imagem à direita (empilha no mobile). */
export default function HeroSplit({
    eyebrow,
    title,
    subtitle,
    imageUrl,
    ctaText,
    ctaHref,
}: HeroProps) {
    return (
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-16 sm:py-20 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col items-start gap-4 text-left">
                <Eyebrow>{eyebrow}</Eyebrow>
                {title && <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl">{title}</h1>}
                {subtitle && <p className="max-w-md text-lg text-muted">{subtitle}</p>}
                <div className="mt-2">
                    <PrimaryCta text={ctaText} href={ctaHref} />
                </div>
            </div>
            <div className="order-first md:order-last">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title ?? ''}
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-brand object-cover"
                    />
                ) : (
                    <div className="aspect-[4/3] w-full rounded-brand bg-surface" />
                )}
            </div>
        </section>
    );
}
