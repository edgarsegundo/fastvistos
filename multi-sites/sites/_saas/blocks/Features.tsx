import type { FeaturesProps } from './types';

/**
 * Bloco Features — grid de cards de serviço/benefício. Segundo bloco
 * estruturado; exercita um campo de LISTA (items[]), que a fase 2 (Puck) e
 * a fase 4 (IA) precisam suportar como array de sub-objetos.
 * Renderizado estático pelo Astro (zero JS).
 */
export default function Features({ heading, items = [] }: FeaturesProps) {
    return (
        <section className="block-features" style={{ padding: '3rem 1rem' }}>
            {heading && (
                <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
                    {heading}
                </h2>
            )}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    maxWidth: '72rem',
                    margin: '0 auto',
                }}
            >
                {items.map((item, i) => (
                    <div
                        key={i}
                        style={{
                            padding: '1.5rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                        }}
                    >
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
                            {item.title}
                        </h3>
                        {item.description && (
                            <p style={{ color: '#4b5563', margin: 0 }}>{item.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
