import type { HeroCta } from '../types';
import type { ButtonElementStyle, TextElementStyle } from '../style-types';
import { buttonStyleToCss, styleHtmlAttrs, textStyleToCss } from '../style-runtime';

/**
 * Helpers compartilhados entre as variantes de Hero.
 * Tailwind sobre tokens de tema (text-primary, bg-primary, font-heading,
 * rounded-brand...) por padrão; `style` (Aparência por elemento, opt-in)
 * vira `style=`/`id=`/`className=` calculado por cima, sem remover nenhuma
 * classe Tailwind condicionalmente — ver blocks/style-runtime.ts.
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

/** Botão com variante (primary/outline/ghost). Só renderiza com texto E link.
 *  `style` é UM ÚNICO estilo aplicado a TODOS os CTAs (não por-item) — ver
 *  nota em blocks/types.ts::HeroElementStyles. Por isso `id`/`className`
 *  (`htmlAttrs`) NÃO entram aqui — repetir o mesmo `id` em 3 botões seria
 *  HTML inválido; esse escape hatch vive no wrapper (`data-el="ctas"` em
 *  HeroCentered.tsx), só a aparência visual (cor/borda/sombra/CSS) é
 *  aplicada por botão. */
export function CtaButton({ cta, style }: { cta: HeroCta; style?: ButtonElementStyle }) {
    if (!cta?.label || !cta?.href) return null;
    const cls = CTA_VARIANT_CLASS[cta.variant ?? 'primary'] ?? CTA_VARIANT_CLASS.primary;
    return (
        <a
            href={cta.href}
            className={`inline-block no-underline transition ${style?.hoverBgColor ? 'cta-hover-bg' : ''} ${cls}`.trim()}
            style={buttonStyleToCss(style)}
        >
            {cta.label}
        </a>
    );
}

/** Fileira de 5 estrelas + nota/contagem. Só renderiza com value ou count.
 *  `dataEl`/`dataElLabel`/`extraClassName` deixam o CHAMADOR decidir se este
 *  é o elemento marcado (o mesmo nó que recebe `id`/`style` de Aparência —
 *  nunca um wrapper por fora, senão o clique-no-canvas mira o nó errado). */
export function Stars({
    value,
    count,
    style,
    dataEl,
    dataElLabel,
    extraClassName,
}: {
    value?: string;
    count?: string;
    style?: TextElementStyle;
    dataEl?: string;
    dataElLabel?: string;
    extraClassName?: string;
}) {
    if (!value && !count) return null;
    const attrs = styleHtmlAttrs(style);
    return (
        <div
            data-el={dataEl}
            data-el-label={dataElLabel}
            id={attrs.id}
            className={`flex items-center gap-1.5 text-primary ${extraClassName ?? ''} ${attrs.className ?? ''}`.trim()}
            style={textStyleToCss(style)}
            aria-label={value ? `${value} de 5 estrelas` : 'avaliação'}
        >
            <span aria-hidden="true">★★★★★</span>
            {value && <span className="font-semibold text-ink">{value}</span>}
            {count && <span className="text-sm text-muted">· {count} avaliações</span>}
        </div>
    );
}
