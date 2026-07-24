/*
 * Tema por-tenant: transforma o `project.theme` (JSON vindo do Django) nas
 * coisas que o Layout precisa emitir — o bloco `:root{--brand-*}` (valores) e
 * os <link> de fonte. Os DEFAULTS moram no CSS (styles/saas.css :root), então
 * aqui só emitimos overrides das chaves que o projeto de fato definiu.
 */
import { FONT_CATALOG, FONT_NAMES, type FontEntry } from './fonts';

export interface ProjectTheme {
    colors?: {
        primary?: string;
        ink?: string;
        muted?: string;
        canvas?: string;
        surface?: string;
        line?: string;
    };
    /** Chaves do FONT_CATALOG (ex: "Poppins"). */
    fonts?: { heading?: string; body?: string };
    /** ex: "12px" | "0" | "9999px" */
    radius?: string;
}

const COLOR_VARS: Record<string, string> = {
    primary: '--brand-primary',
    ink: '--brand-ink',
    muted: '--brand-muted',
    canvas: '--brand-canvas',
    surface: '--brand-surface',
    line: '--brand-line',
};

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function resolveFont(key?: string): FontEntry | null {
    if (!key) return null;
    return FONT_CATALOG[key] ?? null;
}

/** CSS pro `<style>` do Layout: `:root{ --brand-*: ... }` só com overrides. */
export function buildBrandVars(theme?: ProjectTheme | null): string {
    const t = theme ?? {};
    const decls: string[] = [];

    for (const [key, cssVar] of Object.entries(COLOR_VARS)) {
        const val = t.colors?.[key as keyof NonNullable<ProjectTheme['colors']>];
        if (typeof val === 'string' && HEX.test(val)) {
            decls.push(`${cssVar}:${val}`);
        }
    }

    const heading = resolveFont(t.fonts?.heading);
    if (heading) decls.push(`--brand-heading:${heading.family}`);
    const body = resolveFont(t.fonts?.body);
    if (body) decls.push(`--brand-body:${body.family}`);

    if (typeof t.radius === 'string' && /^[0-9.]+(px|rem|em|%)?$|^0$/.test(t.radius)) {
        decls.push(`--brand-radius:${t.radius}`);
    }

    return decls.length ? `:root{${decls.join(';')}}` : '';
}

/** hrefs únicos de Google Fonts pras fontes escolhidas (heading + body). */
export function fontLinks(theme?: ProjectTheme | null): string[] {
    const t = theme ?? {};
    const hrefs = new Set<string>();
    for (const f of [resolveFont(t.fonts?.heading), resolveFont(t.fonts?.body)]) {
        if (f) hrefs.add(f.href);
    }
    return [...hrefs];
}

/** Schema neutro-de-framework (semente do painel de tema da fase 2). */
export const THEME_SCHEMA = {
    colors: {
        primary: { type: 'color', label: 'Cor primária' },
        ink: { type: 'color', label: 'Texto' },
        muted: { type: 'color', label: 'Texto secundário' },
        canvas: { type: 'color', label: 'Fundo da página' },
        surface: { type: 'color', label: 'Fundo de cards/seções' },
        line: { type: 'color', label: 'Bordas' },
    },
    fonts: {
        heading: { type: 'select', label: 'Fonte dos títulos', options: FONT_NAMES },
        body: { type: 'select', label: 'Fonte do corpo', options: FONT_NAMES },
    },
    radius: { type: 'text', label: 'Arredondamento (ex: 12px)' },
} as const;
