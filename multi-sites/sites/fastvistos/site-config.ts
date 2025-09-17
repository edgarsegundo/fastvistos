import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (business + branding + global stuff)
export const siteConfig: SiteConfig = {
    business: {
    business_id: '41a5c7f95e924d54b120ab9a0e1843c8',
    id: 'fastvistos',
    domain: 'fastvistos.com.br',
    name: 'Fast Vistos',
    description: 'Fast Vistos - Your fast visa solution',
    language: 'pt-BR',
    useFullLanguageTag: true, // true/false
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    },

    branding: {
        logo: '/path-to-logo.png',
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
    },

    contact: {
        email: 'contact@fastvistos.com.br',
        whatsapp: '+5511999999999',
    },

    socialMedia: {
        facebook: 'https://facebook.com/fastvistos',
        twitter: '@fastvistos',
        instagram: 'https://instagram.com/fastvistos',
        youtube: 'https://youtube.com/@fastvistos',
    },

    analytics: {
        gtmId: 'GTM-59SRNCQD',
    },

    verification: {
        googleSiteVerification: 'wPmMtzby8Xpg',
    },

    features: {
        blog: true, // true/false
        booking: false, // true/false
        payments: false, // true/false
        multilingual: false, // true/false
    },

    customStyles: {
        cssVars: {
            '--accent-color': '#ACCENT',
        },
    },
};

export const homePageConfig = {
    seo: {
        title: 'Fast Vistos - Your fast visa solution',
        description: 'Fast Vistos - Your fast visa solution',
        keywords: ['fast vistos', 'visa', 'fast visa solution'],
        ogImage: '/path-to-og-image.jpg',
        themeColor: '#0070f3',
        msTileColor: '#0070f3',
        msTileConfig: '/browserconfig.xml',
        applicationName: 'Fast Vistos',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'default',
        formatDetection: 'telephone=no',
        geoRegion: 'XX',
        geoCountry: 'Country',
        geoPlacename: 'Placename',
    },
};

export const blogPageConfig = {
    seo: {
        title: 'Fast Vistos - Blog',
        description: 'Fast Vistos - Your fast visa solution blog',
        keywords: ['fast vistos', 'visa', 'blog'],
        ogImage: '/path-to-blog-og-image.jpg',
    },
    pagination: {
        postsPerPage: 10,
    }
};

export const blogPostConfig = {
    seoDefaults: {
        titleSuffix: '| Fast Vistos',
        ogImage: '/path-to-default-post-og-image.jpg',
    },
    readingTime: true, // true/false
    showAuthor: true, // true/false
    relatedPosts: true, // true/false
};
