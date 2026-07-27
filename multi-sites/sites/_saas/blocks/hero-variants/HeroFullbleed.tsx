import type { HeroProps } from '../types';
import { PrimaryCta } from './shared';

/**
 * 03 — Imagem de fundo: imagem cobrindo a seção, overlay escuro, texto embaixo.
 * Texto em branco sobre overlay (convenção de full-bleed, independe da marca).
 */
export default function HeroFullbleed({
    eyebrow,
    title,
    imageUrl,
    ctaText,
    ctaHref,
}: HeroProps) {
    return (
        <section className="relative flex min-h-[70vh] items-end overflow-hidden">
            {imageUrl ? (
                <img src={imageUrl} alt={title ?? ''} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
                <div className="absolute inset-0 bg-ink" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative flex w-full flex-col gap-4 px-4 pb-16 sm:px-8 sm:pb-20 md:px-12">
                {eyebrow && (
                    <span className="font-heading text-sm font-semibold uppercase tracking-widest text-white/80">
                        {eyebrow}
                    </span>
                )}
                {title && (
                    <h1 className="max-w-2xl font-heading text-4xl font-bold text-white sm:text-5xl">{title}</h1>
                )}
                <div className="mt-2">
                    <PrimaryCta text={ctaText} href={ctaHref} />
                </div>
            </div>
        </section>
    );
}
