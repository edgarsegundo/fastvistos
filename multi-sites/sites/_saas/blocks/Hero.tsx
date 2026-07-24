import type { HeroProps } from './types';

/**
 * Bloco Hero — primeiro bloco ESTRUTURADO (campos tipados, não HTML livre).
 * É o modelo do resto do catálogo: campos discretos que a IA preenche, o
 * importador classifica e o editor edita por clique, sem o usuário ver HTML.
 * Renderizado estático pelo Astro (zero JS).
 */
export default function Hero({
    title,
    subtitle,
    imageUrl,
    ctaText,
    ctaHref,
    align = 'center',
}: HeroProps) {
    return (
        <section
            className="block-hero"
            style={{
                textAlign: align,
                padding: '4rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: align === 'center' ? 'center' : 'flex-start',
            }}
        >
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{title}</h1>
            {subtitle && (
                <p style={{ fontSize: '1.25rem', color: '#4b5563', maxWidth: '48rem', margin: 0 }}>
                    {subtitle}
                </p>
            )}
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={title}
                    loading="lazy"
                    style={{ maxWidth: '100%', borderRadius: '12px' }}
                />
            )}
            {ctaText && ctaHref && (
                <a
                    href={ctaHref}
                    style={{
                        display: 'inline-block',
                        padding: '0.75rem 1.5rem',
                        background: '#2563eb',
                        color: '#fff',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    {ctaText}
                </a>
            )}
        </section>
    );
}
