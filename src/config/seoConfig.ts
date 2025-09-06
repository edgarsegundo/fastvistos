// Base SEO Configuration - Common data shared across all pages
// This is your central place to update company info, contact details, etc.

export interface SEOConfig {
    // Site-wide information
    site: {
        name: string;
        url: string;
        locale: string;
        siteName: string;
        author: string;
        robots: string;
        twitterCard: string;
        themeColor: string;
        googleSiteVerification?: string;
        googlebot?: string;
        bingbot?: string;
        geoRegion?: string;
        geoCountry?: string;
        geoPlacename?: string;
    };

    // Company/Organization information
    company: {
        name: string;
        description: string;
        telephone: string;
        email: string;
        address: {
            streetAddress: string;
            addressLocality: string;
            addressRegion: string;
            postalCode: string;
            addressCountry: string;
        };
        socialMedia: string[];
        logo: string;
        mapUrl: string;
        priceRange: string;
        openingHours: string;
    };

    // Default keywords that apply to most pages
    defaultKeywords: string;

    // Images and icons
    images: {
        defaultOgImage: string;
        homePageImage: string;
        blogImage: string;
        favicon: string;
        faviconIco: string;
        appleTouchIcon: string;
    };
}

// Base configuration - UPDATE THIS to customize for your needs
export const baseSEOConfig: SEOConfig = {
    site: {
        name: 'Fast Vistos',
        url: 'https://fastvistos.com.br',
        locale: 'pt_BR',
        siteName: 'Fast Vistos – Assessoria de Vistos e eTAs',
        author: 'Fast Vistos',
        robots: 'index, follow, max-snippet:-1, max-image-preview:large',
        twitterCard: 'summary_large_image',
        themeColor: '#0D3461',
        googleSiteVerification: 'hjc59hifPKB74CYbw8XcgNRz8PIxUC64Illzo4UcpFU',
        googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
        bingbot: 'index, follow',
        geoRegion: 'BR-SP',
        geoCountry: 'Brazil',
        geoPlacename: 'Campinas, São Paulo, Brasil',
    },

    company: {
        name: 'Fast Vistos',
        description:
            'Especialistas em processamento de vistos americanos, eTA do Canadá e vistos para o México',
        telephone: '(19) 2042-2785',
        email: 'contato@fastvistos.com.br',
        address: {
            streetAddress: 'Av. Júlio Diniz, 257',
            addressLocality: 'Campinas',
            addressRegion: 'SP',
            postalCode: '13076-070',
            addressCountry: 'BR',
        },
        socialMedia: [
            'https://www.facebook.com/fastvistos',
            'https://www.instagram.com/fastvistos',
            'https://www.linkedin.com/company/fastvistos',
        ],
        logo: 'https://fastvistos.com.br/assets/images/logo/logo-desktop.png',
        mapUrl: 'https://www.google.com/maps/place/Av.+J%C3%BAlio+Diniz,+257,+Taquaral,+Campinas,+SP,+13075-420,+Brasil',
        priceRange: '$$',
        openingHours: 'Mo-Fr 07:00-18:00',
    },

    defaultKeywords:
        'visto, visto americano, EUA, Estados Unidos, visto EUA, México, visto mexicano, solicitação, ajuda, assistência, trâmite, procedimento, imigração',

    images: {
        defaultOgImage: 'https://fastvistos.com.br/images/fastvistos-social-card.jpg',
        homePageImage: 'https://fastvistos.com.br/images/fastvistos-social-card.jpg',
        blogImage: 'https://fastvistos.com.br/images/fastvistos-blog-card.jpg',
        favicon: 'https://fastvistos.com.br/favicon.png',
        faviconIco: '/favicon.ico',
        appleTouchIcon: '/apple-touch-icon.png',
    },
};
