import type { ChromeHeader } from './chrome';

/**
 * Header/Nav de nível de Site. Renderizado estático pelo Astro (zero JS) em
 * volta de toda página, a partir do project.chrome.header. Sem menu mobile
 * interativo nesta fase (viria hidratado; fase 1 é estática) — os links
 * quebram pra baixo em telas pequenas.
 */
export default function Header({ logoText, logoUrl, links = [], cta }: ChromeHeader) {
    const hasBrand = logoUrl || logoText;
    if (!hasBrand && links.length === 0 && !cta) return null;

    return (
        <header className="border-b border-line bg-canvas">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                <a href="/" className="flex items-center gap-2 no-underline">
                    {logoUrl ? (
                        <img src={logoUrl} alt={logoText || 'logo'} className="h-8 w-auto" />
                    ) : (
                        <span className="font-heading text-xl font-bold text-ink">{logoText}</span>
                    )}
                </a>

                {(links.length > 0 || cta) && (
                    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {links.map((link, i) => (
                            <a
                                key={i}
                                href={link.href}
                                className="text-sm font-medium text-muted no-underline hover:text-ink"
                            >
                                {link.label}
                            </a>
                        ))}
                        {cta && (
                            <a
                                href={cta.href}
                                className="rounded-brand bg-primary px-4 py-2 text-sm font-semibold text-white no-underline hover:opacity-90"
                            >
                                {cta.label}
                            </a>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}
