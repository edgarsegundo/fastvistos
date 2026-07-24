import type { FaqProps } from './types';

/**
 * Bloco FAQ — usa <details>/<summary> nativo (acordeão sem JS). Independente
 * do JSON-LD de FAQ do SEO por ora (unificar depois — ver plano/fase).
 */
export default function Faq({ heading, items = [] }: FaqProps) {
    return (
        <section className="mx-auto max-w-3xl px-4 py-16">
            {heading && (
                <h2 className="mb-8 text-center font-heading text-3xl font-bold text-ink">{heading}</h2>
            )}
            <div className="divide-y divide-line border-y border-line">
                {items.map((item, i) => (
                    <details key={i} className="group py-4">
                        <summary className="cursor-pointer list-none font-medium text-ink">
                            {item.question}
                        </summary>
                        <p className="mt-2 text-muted leading-relaxed">{item.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
