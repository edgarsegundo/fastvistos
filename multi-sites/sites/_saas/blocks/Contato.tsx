import type { ContatoProps } from './types';

/**
 * Bloco Contato DISPLAY-ONLY — telefone/WhatsApp/e-mail/endereço/horário +
 * mapa. Sem formulário que envia (o form real, com backend de submit, é uma
 * fase própria). Casa com o ICP local WhatsApp-first. Estático (zero JS).
 */
export default function Contato({
    heading,
    phone,
    whatsapp,
    email,
    address,
    hours,
    mapEmbedUrl,
}: ContatoProps) {
    const waDigits = (whatsapp ?? '').replace(/\D/g, '');
    const linkClass = 'text-primary no-underline hover:underline';

    return (
        <section className="mx-auto max-w-6xl px-4 py-16">
            {heading && (
                <h2 className="mb-8 font-heading text-3xl font-bold text-ink">{heading}</h2>
            )}
            <div className="grid gap-8 md:grid-cols-2">
                <ul className="space-y-3 text-ink">
                    {phone && (
                        <li>📞 <a className={linkClass} href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a></li>
                    )}
                    {waDigits && (
                        <li>💬 <a className={linkClass} href={`https://wa.me/${waDigits}`} rel="noopener" target="_blank">WhatsApp</a></li>
                    )}
                    {email && (
                        <li>✉️ <a className={linkClass} href={`mailto:${email}`}>{email}</a></li>
                    )}
                    {address && <li>📍 <span className="text-muted">{address}</span></li>}
                    {hours && <li>🕒 <span className="text-muted">{hours}</span></li>}
                </ul>
                {mapEmbedUrl && (
                    <iframe
                        src={mapEmbedUrl}
                        loading="lazy"
                        title={heading || 'Mapa'}
                        className="h-64 w-full rounded-brand border border-line"
                    />
                )}
            </div>
        </section>
    );
}
