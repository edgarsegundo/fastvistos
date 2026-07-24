import type { FeaturesProps } from './types';

/**
 * Bloco Features — grid de cards de serviço/benefício. Segundo bloco
 * estruturado; exercita um campo de LISTA (items[]). Tailwind + tokens do
 * tema; renderizado estático (zero JS).
 */
export default function Features({ heading, items = [] }: FeaturesProps) {
    return (
        <section className="mx-auto max-w-6xl px-4 py-12">
            {heading && (
                <h2 className="mb-8 text-center font-heading text-3xl font-bold text-ink">{heading}</h2>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => (
                    <div key={i} className="rounded-brand border border-line p-6">
                        <h3 className="mb-2 font-heading text-lg font-semibold text-ink">{item.title}</h3>
                        {item.description && <p className="text-muted">{item.description}</p>}
                    </div>
                ))}
            </div>
        </section>
    );
}
