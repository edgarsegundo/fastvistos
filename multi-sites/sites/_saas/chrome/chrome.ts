/*
 * Chrome = Header/Nav + Footer de NÍVEL DE SITE (seção 2 da spec: não é bloco
 * por página; é config do Project renderizada em volta de TODAS as páginas).
 * Vem do `project.chrome` (JSON no Django) e é renderizado pelo Layout.
 */

export interface NavLink {
    label: string;
    href: string;
}

export interface ChromeHeader {
    logoText?: string;
    /** URL de imagem de logo; se presente, tem precedência sobre logoText. */
    logoUrl?: string;
    links?: NavLink[];
    cta?: NavLink;
}

export interface FooterColumn {
    title?: string;
    links?: NavLink[];
}

export interface ChromeFooter {
    columns?: FooterColumn[];
    copyright?: string;
}

export interface ProjectChrome {
    header?: ChromeHeader;
    footer?: ChromeFooter;
}

/** Defaults sensatos pra um projeto sem chrome ainda configurado. */
export const DEFAULT_CHROME: ProjectChrome = {
    header: { logoText: '', links: [], cta: undefined },
    footer: { columns: [], copyright: '' },
};

/** Schema neutro-de-framework (semente do painel de chrome da fase 2). */
export const CHROME_SCHEMA = {
    header: {
        logoText: { type: 'text', label: 'Texto do logo' },
        logoUrl: { type: 'url', label: 'Imagem do logo' },
        links: {
            type: 'array', label: 'Links de navegação',
            itemFields: {
                label: { type: 'text', label: 'Texto' },
                href: { type: 'text', label: 'Link' },
            },
        },
        cta: {
            type: 'object', label: 'Botão de ação',
            fields: {
                label: { type: 'text', label: 'Texto' },
                href: { type: 'text', label: 'Link' },
            },
        },
    },
    footer: {
        columns: {
            type: 'array', label: 'Colunas',
            itemFields: {
                title: { type: 'text', label: 'Título' },
                links: {
                    type: 'array', label: 'Links',
                    itemFields: {
                        label: { type: 'text', label: 'Texto' },
                        href: { type: 'text', label: 'Link' },
                    },
                },
            },
        },
        copyright: { type: 'text', label: 'Rodapé (copyright)' },
    },
} as const;
