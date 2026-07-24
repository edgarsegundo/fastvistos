import type { HeroProps } from './types';

/**
 * Bloco Hero — primeiro bloco ESTRUTURADO (campos tipados, não HTML livre).
 * É o modelo do resto do catálogo: campos discretos que a IA preenche, o
 * importador classifica e o editor edita por clique, sem o usuário ver HTML.
 * Estilizado com Tailwind sobre os tokens do tema; renderizado estático (zero JS).
 */
export default function Hero({
    title,
    subtitle,
    imageUrl,
    ctaText,
    ctaHref,
    align = 'center',
}: HeroProps) {
    const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left';

    return (
        <section className={`mx-auto flex max-w-4xl flex-col gap-4 px-4 py-20 ${alignClass}`}>
            <h1 className="font-heading text-4xl font-bold text-ink sm:text-5xl">{title}</h1>
            {subtitle && <p className="max-w-2xl text-xl text-muted">{subtitle}</p>}
            {imageUrl && (
                <img src={imageUrl} alt={title} loading="lazy" className="mt-2 max-w-full rounded-brand" />
            )}
            {ctaText && ctaHref && (
                <a
                    href={ctaHref}
                    className="mt-2 inline-block rounded-brand bg-primary px-6 py-3 font-semibold text-white no-underline hover:opacity-90"
                >
                    {ctaText}
                </a>
            )}
        </section>
    );
}
