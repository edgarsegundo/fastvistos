// 🌐 SaaS Platform Site Config (placeholder domain, trocável via env)
export const siteConfig = {
    site: {
        business_id: 'saas-platform',
        id: '_saas',
        siteName: 'SaaS Platform',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: process.env.PLATFORM_DOMAIN || 'plataforma.local',
        canonical: `https://${process.env.PLATFORM_DOMAIN || 'plataforma.local'}/`,
        authorName: 'Platform Admin',
        primaryImage: {
            url: 'https://via.placeholder.com/1200x630',
            width: 1200,
            height: 630,
            type: 'image/webp',
            alt: 'SaaS Platform'
        },
        useFullLanguageTag: true,
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://via.placeholder.com/530x67',
            alt: 'SaaS Platform Logo',
            width: 530,
            height: 67,
        },
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        thumbnailUrl: 'https://via.placeholder.com/1200x630',
        assetsUrlBase: '/assets/images/',
        priceRange: 'Variável',
    },
};
