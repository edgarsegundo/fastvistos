// 🌐 Shared Site Config (business + branding + global stuff)
export const siteConfig = {
    business: {
        business_id: '41a5c7f95e924d54b120ab9a0e1843c8',
        id: 'fastvistos',
        domain: 'fastvistos.com.br',
        name: 'Fast Vistos',
        description: 'Assessoria completa para obtenção de vistos americanos',
        language: 'pt-BR',
        useFullLanguageTag: true,
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
    },

    branding: {
        logo: '/logo.png',
        primaryColor: '#FF6B35',
        secondaryColor: '#1E3A8A',
    },

    contact: {
        email: 'contato@fastvistos.com.br',
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
        blog: true,
        booking: true,
        payments: false,
        multilingual: false,
    },

    customStyles: {
        cssVars: {
            '--accent-color': '#F59E0B',
        },
    },
};

export const homePageConfig = {
    seo: {
        title: 'Fast Vistos - Assessoria para Visto Americano',
        description: 'Especialistas em assessoria para obtenção de visto americano.',
        keywords: ['visto americano', 'assessoria visto', 'fast vistos'],
        ogImage: '/og-image.jpg',
        themeColor: '#FF6B35',
        msTileColor: '#FF6B35',
        msTileConfig: '/browserconfig.xml',
        applicationName: 'Fast Vistos',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'default',
        formatDetection: 'telephone=no',
        geoRegion: 'BR',
        geoCountry: 'Brazil',
        geoPlacename: 'Brasil',
    },
};

export const blogPageConfig = {
    seo: {
        title: 'Blog da Fast Vistos - Dicas e Informações sobre Visto Americano',
        description: 'Artigos e atualizações sobre como tirar seu visto americano.',
        keywords: ['visto americano', 'blog visto', 'dicas visto EUA'],
        ogImage: '/blog-og-image.jpg',
    },
    pagination: {
        postsPerPage: 10,
    }
};

export const blogPostConfig = {
    seoDefaults: {
        titleSuffix: '| Fast Vistos',
        ogImage: '/default-post-og-image.jpg',
    },
    readingTime: true,
    showAuthor: true,
    relatedPosts: true,
};
