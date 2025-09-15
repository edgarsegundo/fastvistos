import type { SiteConfig } from '../../core/lib/site-config.ts';

export const siteConfig: SiteConfig = {
    business_id: 'd6e8013cfcbe27af26c24b790b6cd3a1', // Mysite business ID - Update this with your actual business ID
    id: 'mysite',
    domain: 'mysite.com.br',
    name: 'Mysite',
    description: 'Professional services and consulting',
    language: 'pt-BR',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',

    // Branding
    logo: '/logo.png',
    primaryColor: '#3B82F6', // Blue
    secondaryColor: '#1E40AF', // Dark blue

    // Contact
    contactEmail: 'contato@mysite.com.br',
    phone: '+55 11 99999-9999',
    whatsapp: '+5511999999999',

    // Social
    socialMedia: {
        facebook: 'https://facebook.com/mysite',
        instagram: 'https://instagram.com/mysite',
        youtube: 'https://youtube.com/@mysite',
    },

    // SEO
    seo: {
        title: 'Mysite - Professional Services',
        description: 'Professional services and consulting solutions.',
        keywords: ['mysite', 'professional services', 'consulting'],
        ogImage: '/og-image.jpg',
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
            '--accent-color': '#10B981',
        },
    },
};
