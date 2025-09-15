import type { SiteConfig } from '../../core/lib/site-config.ts';

export const siteConfig: SiteConfig = {
    // Business
    business_id: '41a5c7f95e924d54b120ab9a0e1843c8', // FastVistos business ID from database (without dashes)
    id: 'fastvistos',
    domain: 'fastvistos.com.br',
    name: 'Fast Vistos',
    description: 'Assessoria completa para obtenção de vistos americanos',
    language: 'pt-BR',
    useFullLanguageTag: true,  // Use pt-BR completo para SEO geo-targeting brasileiro
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',

    // Branding
    logo: '/logo.png',
    primaryColor: '#FF6B35',
    secondaryColor: '#1E3A8A',

    // Contact
    contactEmail: 'contato@fastvistos.com.br',
    phone: '+55 11 99999-9999',
    whatsapp: '+5511999999999',

    // Social
    socialMedia: {
        facebook: 'https://facebook.com/fastvistos',
        twitter: '@fastvistos',
        instagram: 'https://instagram.com/fastvistos',
        youtube: 'https://youtube.com/@fastvistos',
    },

    // SEO
    seo: {
        title: 'Fast Vistos - Assessoria para Visto Americano',
        description: 'Especialistas em assessoria para obtenção de visto americano.',
        keywords: ['visto americano', 'assessoria visto', 'fast vistos'],
        ogImage: '/og-image.jpg',
    },

    // Analytics
    analytics: {
        gtmId: 'GTM-59SRNCQD',  // Google Tag Manager ID
        // gtagId: 'G-XXXXXXXXXX',  // Uncomment when adding GA4
        // facebookPixelId: 'XXXXXXXXXXXXXXX',  // Uncomment when adding Facebook Pixel
    },

    // Site verification (Google, Bing, Yandex, Baidu, Pinterest, Facebook, etc)
    verification: {
        googleSiteVerification: 'wPmMtzby8Xpg'
    },

    // Features
    features: {
        blog: true,
        booking: true,
        payments: true,
        multilingual: false,
    },

    // Styling
    customStyles: {
        cssVars: {
            '--accent-color': '#F59E0B',
        },
    },
};
