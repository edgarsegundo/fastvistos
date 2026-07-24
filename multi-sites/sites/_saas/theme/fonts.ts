/*
 * Catálogo curado de fontes (code-defined). O project.theme.fonts referencia
 * uma CHAVE daqui (ex: "Poppins"), não uma família arbitrária — mantém o
 * "catálogo curado" da spec e garante que toda fonte usada tem um <link>
 * correspondente (sem peso morto, sem cair em fallback).
 *
 * `family` entra no --brand-heading/--brand-body; `href` vira o <link> do
 * Google Fonts que o Layout emite só pras fontes de fato escolhidas.
 * Ampliar este catálogo é item de roadmap contínuo (aumenta a taxa de match
 * do Importador na fase 5, seção 4.5 da spec).
 */
export interface FontEntry {
    family: string;
    href: string;
}

const g = (family: string, spec: string): FontEntry => ({
    family,
    href: `https://fonts.googleapis.com/css2?family=${spec}&display=swap`,
});

export const FONT_CATALOG: Record<string, FontEntry> = {
    Inter: g("'Inter', ui-sans-serif, system-ui, sans-serif", 'Inter:wght@400;500;600;700'),
    Poppins: g("'Poppins', ui-sans-serif, system-ui, sans-serif", 'Poppins:wght@400;500;600;700'),
    Montserrat: g("'Montserrat', ui-sans-serif, system-ui, sans-serif", 'Montserrat:wght@400;500;600;700'),
    Roboto: g("'Roboto', ui-sans-serif, system-ui, sans-serif", 'Roboto:wght@400;500;700'),
    'Open Sans': g("'Open Sans', ui-sans-serif, system-ui, sans-serif", 'Open+Sans:wght@400;600;700'),
    Lora: g("'Lora', Georgia, serif", 'Lora:wght@400;500;600;700'),
    'Playfair Display': g("'Playfair Display', Georgia, serif", 'Playfair+Display:wght@400;600;700'),
    'Source Sans 3': g("'Source Sans 3', ui-sans-serif, system-ui, sans-serif", 'Source+Sans+3:wght@400;600;700'),
};

/** Nomes válidos pro select de fonte (editor/admin). */
export const FONT_NAMES = Object.keys(FONT_CATALOG);
