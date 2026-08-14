import type { ContatoProps } from './types';
import { mediaStyleToCss, styleHtmlAttrs, textStyleToCss } from './style-runtime';

/**
 * Bloco Contato DISPLAY-ONLY — telefone/WhatsApp/e-mail/endereço/horário +
 * mapa. Sem formulário que envia (o form real, com backend de submit, é uma
 * fase própria). Casa com o ICP local WhatsApp-first. Estático (zero JS).
 * `data-el`/`data-el-label` inertes na produção — mesmo padrão do Hero.
 */
export default function Contato({
    heading,
    phone,
    whatsapp,
    email,
    address,
    hours,
    mapEmbedUrl,
    headingStyle,
    phoneStyle,
    whatsappStyle,
    emailStyle,
    addressStyle,
    hoursStyle,
    mapStyle,
}: ContatoProps) {
    const waDigits = (whatsapp ?? '').replace(/\D/g, '');
    const linkClass = 'text-primary no-underline hover:underline';

    const headingAttrs = styleHtmlAttrs(headingStyle?.heading);
    const phoneAttrs = styleHtmlAttrs(phoneStyle?.phone);
    const whatsappAttrs = styleHtmlAttrs(whatsappStyle?.whatsapp);
    const emailAttrs = styleHtmlAttrs(emailStyle?.email);
    const addressAttrs = styleHtmlAttrs(addressStyle?.address);
    const hoursAttrs = styleHtmlAttrs(hoursStyle?.hours);
    const mapAttrs = styleHtmlAttrs(mapStyle?.map);

    return (
        <section className="mx-auto max-w-6xl px-4 py-16">
            {heading && (
                <h2
                    data-el="heading"
                    data-el-label="Título"
                    id={headingAttrs.id}
                    className={`mb-8 font-heading text-3xl font-bold text-ink ${headingAttrs.className ?? ''}`.trim()}
                    style={textStyleToCss(headingStyle?.heading)}
                >
                    {heading}
                </h2>
            )}
            <div className="grid gap-8 md:grid-cols-2">
                <ul className="space-y-3 text-ink">
                    {phone && (
                        <li>📞 <a
                            data-el="phone"
                            data-el-label="Telefone"
                            id={phoneAttrs.id}
                            className={`${linkClass} ${phoneAttrs.className ?? ''}`.trim()}
                            style={textStyleToCss(phoneStyle?.phone)}
                            href={`tel:${phone.replace(/\s/g, '')}`}
                        >{phone}</a></li>
                    )}
                    {waDigits && (
                        <li>💬 <a
                            data-el="whatsapp"
                            data-el-label="WhatsApp"
                            id={whatsappAttrs.id}
                            className={`${linkClass} ${whatsappAttrs.className ?? ''}`.trim()}
                            style={textStyleToCss(whatsappStyle?.whatsapp)}
                            href={`https://wa.me/${waDigits}`}
                            rel="noopener"
                            target="_blank"
                        >WhatsApp</a></li>
                    )}
                    {email && (
                        <li>✉️ <a
                            data-el="email"
                            data-el-label="E-mail"
                            id={emailAttrs.id}
                            className={`${linkClass} ${emailAttrs.className ?? ''}`.trim()}
                            style={textStyleToCss(emailStyle?.email)}
                            href={`mailto:${email}`}
                        >{email}</a></li>
                    )}
                    {address && (
                        <li>📍 <span
                            data-el="address"
                            data-el-label="Endereço"
                            id={addressAttrs.id}
                            className={`text-muted ${addressAttrs.className ?? ''}`.trim()}
                            style={textStyleToCss(addressStyle?.address)}
                        >{address}</span></li>
                    )}
                    {hours && (
                        <li>🕒 <span
                            data-el="hours"
                            data-el-label="Horário"
                            id={hoursAttrs.id}
                            className={`text-muted ${hoursAttrs.className ?? ''}`.trim()}
                            style={textStyleToCss(hoursStyle?.hours)}
                        >{hours}</span></li>
                    )}
                </ul>
                {mapEmbedUrl && (
                    <iframe
                        src={mapEmbedUrl}
                        loading="lazy"
                        title={heading || 'Mapa'}
                        data-el="map"
                        data-el-label="Mapa"
                        id={mapAttrs.id}
                        className={`h-64 w-full rounded-brand border border-line ${mapAttrs.className ?? ''}`.trim()}
                        style={mediaStyleToCss(mapStyle?.map)}
                    />
                )}
            </div>
        </section>
    );
}
