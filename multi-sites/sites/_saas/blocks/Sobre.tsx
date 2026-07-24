import type { SobreProps } from './types';

/**
 * Bloco Sobre/Apresentação — texto (parágrafos separados por linha em branco)
 * + imagem opcional ao lado. Estático (zero JS), estilizado com tokens do tema.
 */
export default function Sobre({ heading, text, imageUrl, imagePosition = 'right' }: SobreProps) {
    const paragraphs = (text ?? '').split(/\n\s*\n/).filter(Boolean);
    const imageFirst = imagePosition === 'left';

    return (
        <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid items-center gap-10 md:grid-cols-2">
                {imageUrl && imageFirst && (
                    <img src={imageUrl} alt={heading || ''} loading="lazy" className="w-full rounded-brand" />
                )}
                <div>
                    {heading && (
                        <h2 className="mb-4 font-heading text-3xl font-bold text-ink">{heading}</h2>
                    )}
                    {paragraphs.map((p, i) => (
                        <p key={i} className="mb-4 text-muted leading-relaxed">{p}</p>
                    ))}
                </div>
                {imageUrl && !imageFirst && (
                    <img src={imageUrl} alt={heading || ''} loading="lazy" className="w-full rounded-brand" />
                )}
            </div>
        </section>
    );
}
