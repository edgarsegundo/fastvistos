import type { ChromeFooter } from './chrome';

/**
 * Footer de nível de Site. Renderizado estático em volta de toda página, a
 * partir do project.chrome.footer.
 */
export default function Footer({ columns = [], copyright }: ChromeFooter) {
    if (columns.length === 0 && !copyright) return null;

    return (
        <footer className="mt-16 border-t border-line bg-surface">
            <div className="mx-auto max-w-6xl px-4 py-12">
                {columns.length > 0 && (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8">
                        {columns.map((col, i) => (
                            <div key={i}>
                                {col.title && (
                                    <h3 className="mb-3 font-heading text-sm font-semibold text-ink">
                                        {col.title}
                                    </h3>
                                )}
                                <ul className="space-y-2">
                                    {(col.links ?? []).map((link, j) => (
                                        <li key={j}>
                                            <a
                                                href={link.href}
                                                className="text-sm text-muted no-underline hover:text-ink"
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
                {copyright && (
                    <p className="mt-8 text-sm text-muted">{copyright}</p>
                )}
            </div>
        </footer>
    );
}
