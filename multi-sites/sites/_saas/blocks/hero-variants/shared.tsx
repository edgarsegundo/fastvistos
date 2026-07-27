import type { HeroCta } from '../types';

/**
 * Helpers compartilhados entre as variantes de Hero.
 * Só Tailwind sobre tokens de tema (text-primary, bg-primary, font-heading,
 * rounded-brand...) — zero JS, zero style inline. Ver blocks/Hero.tsx.
 */

/** Sobretítulo (eyebrow) em caixa alta, na cor primária do tema. */
export function Eyebrow({ children }: { children?: string }) {
    if (!children) return null;
    return (
        <span className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            {children}
        </span>
    );
}

/** Botão primário simples. Só renderiza quando tem texto E link. */
export function PrimaryCta({ text, href }: { text?: string; href?: string }) {
    if (!text || !href) return null;
    return (
        <a
            href={href}
            className="inline-block rounded-brand bg-primary px-6 py-3 font-semibold text-white no-underline hover:opacity-90"
        >
            {text}
        </a>
    );
}

const CTA_VARIANT_CLASS: Record<NonNullable<HeroCta['variant']>, string> = {
    primary: 'rounded-brand bg-primary px-6 py-3 font-semibold text-white hover:opacity-90',
    outline: 'rounded-brand border border-line px-6 py-3 font-semibold text-ink hover:border-ink',
    ghost: 'rounded-brand px-5 py-3 font-medium text-muted hover:text-ink',
};

/** Botão com variante (primary/outline/ghost). Só renderiza com texto E link. */
export function CtaButton({ cta }: { cta: HeroCta }) {
    if (!cta?.label || !cta?.href) return null;
    const cls = CTA_VARIANT_CLASS[cta.variant ?? 'primary'] ?? CTA_VARIANT_CLASS.primary;
    return (
        <a href={cta.href} className={`inline-block no-underline transition ${cls}`}>
            {cta.label}
        </a>
    );
}

/** Fileira de 5 estrelas + nota/contagem. Só renderiza com value ou count. */
export function Stars({ value, count }: { value?: string; count?: string }) {
    if (!value && !count) return null;
    return (
        <div className="flex items-center gap-1.5 text-primary" aria-label={value ? `${value} de 5 estrelas` : 'avaliação'}>
            <span aria-hidden="true">★★★★★</span>
            {value && <span className="font-semibold text-ink">{value}</span>}
            {count && <span className="text-sm text-muted">· {count} avaliações</span>}
        </div>
    );
}
