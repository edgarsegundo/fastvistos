import type { DepoimentosProps } from './types';

/**
 * Bloco Prova social / Depoimentos — grid de citações. Estático (zero JS).
 */
export default function Depoimentos({ heading, items = [] }: DepoimentosProps) {
    return (
        <section className="bg-surface py-16">
            <div className="mx-auto max-w-6xl px-4">
                {heading && (
                    <h2 className="mb-10 text-center font-heading text-3xl font-bold text-ink">{heading}</h2>
                )}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((t, i) => (
                        <figure key={i} className="rounded-brand border border-line bg-canvas p-6">
                            <blockquote className="text-ink">“{t.quote}”</blockquote>
                            <figcaption className="mt-4 text-sm">
                                <span className="font-semibold text-ink">{t.author}</span>
                                {t.role && <span className="text-muted"> — {t.role}</span>}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
