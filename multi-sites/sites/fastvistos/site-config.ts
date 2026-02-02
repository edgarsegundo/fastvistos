import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig: SiteConfig = {
    site: {
        business_id: '41a5c7f95e924d54b120ab9a0e1843c8',
        id: 'fastvistos',
        siteName: 'Fast Vistos',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: 'fastvistos.com.br',
        canonical: 'https://fastvistos.com.br/',
        authorName: 'Daniela Otaviano',
        primaryImage: {
            url: 'https://fastvistos.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp',
            width: 1200,
            height: 630,
            type: 'image/webp',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem, sede em Campinas'
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://fastvistos.com.br/assets/images/logo/logo-fast-orange.png',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem, sede em Campinas',
            width: 530,
            height: 67,
        },
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        thumbnailUrl: 'https://fastvistos.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp', // Important for search and social previews

        assetsUrlBase: 'https://fastvistos.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content

        priceRange: '$$', // e.g. $, $$, $$$, $$$$
        openingHours: [
            'Mo-Fr 09:00-18:00',
            'Sa 09:00-13:00',
        ],
        sameAs: [  // Social media profiles
            'https://www.facebook.com/fastvistos/',
            'https://x.com/FVistos32701',
            'https://www.youtube.com/@FastVistos/shorts',
        ],
        geo: {
            latitude: -22.8807734, // Latitude for the business location
            longitude: -47.0596895, // Longitude for the business location
        },
        // ✅ CORRIGIDO: Mudado para cobertura nacional
        serviceArea: {
            name: 'Brasil',
        },
        aggregateRating: {
            ratingValue: '5.0',
            reviewCount: '277',
        },
        address: {
            streetAddress: 'Av. Júlio Diniz, 257',
            addressLocality: 'Taquaral, Campinas',
            addressRegion: 'SP',
            postalCode: '13075-420',
            addressCountry: 'BR',
        },
        // ✅ MELHORADO: Adicionado área de cobertura nacional
        contactPoint: {
            telephone: '+551920422785',
            telephoneFormatted: '+55 (19) 2042-2785',
            contactType: 'Customer Service',
            areaServed: ['BR', 'São Paulo'], // Array para múltiplas áreas
            availableLanguage: ['Portuguese', 'English'],
            email: 'contato@fastvistos.com.br',
        },
        socialMedia: {
            facebook: 'https://www.facebook.com/fastvistos/',
            twitter: '@yourtwitter',
            instagram: '',
            youtube: '',
        },
    },

    homePageConfig: {
        seo: {
            // ✅ OPÇÃO 1 IMPLEMENTADA: Título focado em "Todo Brasil"
            title: 'Fast Vistos - Assessoria de Vistos Americanos para Todo Brasil | Campinas SP',
            // ✅ OPÇÃO 1 IMPLEMENTADA: Descrição com foco nacional
            description: 'Assessoria especializada em vistos americanos com atendimento em todo o Brasil. Sede em Campinas/SP. Taxa de aprovação 95%+. Agende sua entrevista.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://fastvistos.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp',
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'Fast Vistos - Assessoria de vistos americanos para todo Brasil'
                },
                // ✅ ADICIONADO: OG Title e Description para redes sociais
                title: 'Fast Vistos - Assessoria de Vistos Americanos para Todo Brasil',
                description: 'Assessoria especializada em vistos americanos com atendimento em todo o Brasil. Sede em Campinas/SP.',
            }
        },
    },

    blogPageConfig: {
        seo: {
            title: 'Blog Fast Vistos - Dicas e Informações sobre Vistos Internacionais',
            description: 'Artigos e dicas sobre vistos americanos, canadenses, passaportes e viagens internacionais. Atendimento para todo Brasil.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                tags: [
                    'vistos internacionais',
                    'visto americano',
                    'visto canadense',
                    'passaporte brasileiro',
                    'todo brasil' // ✅ ADICIONADO: Palavra-chave nacional
                ],
            }
        },
        pagination: {
            postsPerPage: 10,
        },
    },

    blogPostConfig: {
        seo: {
            themeColor: '#0070f3',
            openGraph: {
                type: 'article',
                section: 'Serviços de Vistos e Documentos',
                tags: [
                    'vistos internacionais',
                    'visto americano',
                    'visto canadense',
                    'passaporte brasileiro',
                    'atendimento todo brasil' // ✅ ADICIONADO
                ],
            }
        },
        readingTime: true, // true/false
        showAuthor: true, // true/false
        relatedPosts: true, // true/false
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
        googleSiteVerification: '',
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

/*
Open Graph type options for 'openGraph.type':
==============================================
'website'                   - General site or homepage
'article'                   - News, blog post, or article
'book'                      - Book content
'profile'                   - Person or profile page
'music.song'                - Individual song
'music.album'               - Music album
'music.playlist'            - Music playlist
'music.radio_station'       - Radio station
'video.movie'               - Movie
'video.episode'             - TV episode
'video.tv_show'             - TV show
'video.other'               - Other video content
'business.business'         - Business or organization
'place'                     - Physical location
'restaurant.menu'           - Restaurant menu
'restaurant.menu_item'      - Menu item
'restaurant.menu_section'   - Menu section
'restaurant.restaurant'     - Restaurant
'product'                   - Product page
'product.group'             - Product group
'product.item'              - Product item
'game.achievement'          - Game achievement
*/