import type { ComponentType } from 'react';
import type { HeroLayout, HeroProps } from './types';
import HeroCentered from './hero-variants/HeroCentered';
import HeroSplit from './hero-variants/HeroSplit';
import HeroFullbleed from './hero-variants/HeroFullbleed';
import HeroTypographic from './hero-variants/HeroTypographic';
import HeroAvatars from './hero-variants/HeroAvatars';
import HeroPricing from './hero-variants/HeroPricing';

/**
 * Bloco Hero — bloco ESTRUTURADO com VÁRIAS variantes de layout.
 * Um único componente/registro; o campo `layout` (ver registry) escolhe a
 * variante, e cada uma é um sub-componente em ./hero-variants/. O MESMO
 * componente serve editor (Puck) e produção (ilha Astro estática, zero JS) —
 * o dispatcher só encaminha os props. Estilo: Tailwind sobre tokens de tema.
 *
 * `layout` ausente cai em 'centered' (retrocompat com Heroes salvos antes das
 * variantes, que tinham title/subtitle/imageUrl/ctaText/ctaHref/align).
 */
const VARIANTS: Record<HeroLayout, ComponentType<HeroProps>> = {
    centered: HeroCentered,
    split: HeroSplit,
    fullbleed: HeroFullbleed,
    typographic: HeroTypographic,
    avatars: HeroAvatars,
    pricing: HeroPricing,
};

export default function Hero(props: HeroProps) {
    const layout = props.layout && VARIANTS[props.layout] ? props.layout : 'centered';
    const Variant = VARIANTS[layout];
    return <Variant {...props} />;
}
