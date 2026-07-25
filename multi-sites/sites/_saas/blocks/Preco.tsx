import type { PrecoProps } from './types';

/**
 * Bloco Preço/Planos — cards de plano; um pode ser destacado. Estático (zero JS).
 */
export default function Preco({ heading, plans = [] }: PrecoProps) {
    return (
        <section className="mx-auto max-w-6xl px-4 py-16">
            {heading && (
                <h2 className="mb-10 text-center font-heading text-3xl font-bold text-ink">{heading}</h2>
            )}
            <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className={
                            'flex flex-col rounded-brand border p-6 ' +
                            (plan.highlighted ? 'border-primary shadow-lg' : 'border-line')
                        }
                    >
                        <h3 className="font-heading text-lg font-semibold text-ink">{plan.name}</h3>
                        <div className="mt-4 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-ink">{plan.price}</span>
                            {plan.period && <span className="text-muted">/{plan.period}</span>}
                        </div>
                        <ul className="mt-6 flex-1 space-y-2">
                            {(plan.features ?? []).map((f, j) => (
                                <li key={j} className="text-sm text-muted">{f?.text}</li>
                            ))}
                        </ul>
                        {plan.ctaText && plan.ctaHref && (
                            <a
                                href={plan.ctaHref}
                                className={
                                    'mt-6 rounded-brand px-4 py-2 text-center text-sm font-semibold no-underline ' +
                                    (plan.highlighted
                                        ? 'bg-primary text-white hover:opacity-90'
                                        : 'border border-primary text-primary hover:bg-primary hover:text-white')
                                }
                            >
                                {plan.ctaText}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
