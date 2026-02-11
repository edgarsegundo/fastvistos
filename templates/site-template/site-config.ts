import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig: SiteConfig = {
    site: {
        business_id: '[BUSINESS_ID]',
        id: '[SITE_ID]',
        siteName: '[SITE_NAME]',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: '', // ex: 'fastvistos.com.br'
        canonical: '', // ex: 'https://fastvistos.com.br/'
        authorName: '', // ex: 'Daniela Otaviano'
        primaryImage: {
            url: '', // ex: 'https://fastvistos.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp',
            width: 1200,
            height: 630,
            type: 'image/webp',
            alt: '' // ex: 'Fast Vistos - Assessoria de vistos e documentos de viagem, sede em Campinas'
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: '', // ex: 'https://fastvistos.com.br/assets/images/logo/logo-fast-orange.png'
            alt: '', // ex: 'Fast Vistos - Assessoria de vistos e documentos de viagem, sede em Campinas'
            width: 530,
            height: 67,
        },
        primaryColor: '', // ex: '#0070f3'
        secondaryColor: '', // ex: '#1c1c1e'
        thumbnailUrl: '', // ex: 'https://fastvistos.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp', // Important for search and social previews
        
        assetsUrlBase: '', // ex: 'https://fastvistos.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content
        
        priceRange: 'R$ sob consulta', // e.g. $, $$, $$$, $$$$
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
                ],
                "opens": "09:00",
                "closes": "18:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "09:00",
                "closes": "13:00"
            }
        ],
        sameAs: [  // Social media profiles
            // ex: 'https://www.facebook.com/fastvistos/',
            // ex: 'https://x.com/FVistos32701',
            // ex: 'https://www.youtube.com/@FastVistos/shorts',
        ],
        // geo: {
        //     latitude: -22.8807734, // Latitude for the business location
        //     longitude: -47.0596895, // Longitude for the business location
        // },
        serviceArea: {
            name: 'Brazil',
        },
        // aggregateRating: {
        //     ratingValue: 5,
        //     reviewCount: 298,
        // },

        // reviews: [
        //     {
        //         author: 'Analice de Medeiros Chianca Pavan',
        //         datePublished: '2025-01-20',
        //         reviewBody: 'Excelente assessoria para visto americano! O processo foi super rápido, a Daniela é extremamente atenciosa e demonstra muito conhecimento em cada etapa. Me senti muito segura e bem orientada o tempo todo. Recomendo fortemente para quem busca um atendimento sério, eficiente e de alta qualidade.',
        //         ratingValue: 5,
        //     },
        //     {
        //         author: 'Jetsuo Mine',
        //         datePublished: '2025-01-28',
        //         reviewBody: 'Processo muito ágil, claro e confiável. Meu visto saiu em menos de 15 dias.',
        //         ratingValue: 5,
        //     },
        //     {
        //         author: 'Aramis Lima',
        //         datePublished: '2025-01-31',
        //         reviewBody: 'Excelente consultoria, me orientaram em todo o processo e ainda deram dicas importantes para garantir uma ótima experiência. Super recomendo.',
        //         ratingValue: 5,
        //     },
        //     {
        //         author: 'Selma Aparecida de Rezende Borim',
        //         datePublished: '2024-12-27',
        //         reviewBody: 'Atendimento top, equipe muito atenciosa e conseguiram datas bem próximas para a entrevista. Eu recomendo.',
        //         ratingValue: 5,
        //     },
        // ],

        // makesOffer: [
        //     {
        //         service: 'Assessoria para Visto Americano',
        //         priceCurrency: 'BRL',
        //     },
        //     {
        //         service: 'Assessoria para eTA Canadá',
        //         priceCurrency: 'BRL',
        //     },
        //     {
        //         service: 'Assessoria para Visto Mexicano',
        //         priceCurrency: 'BRL',
        //     },
        //     {
        //         service: 'Assessoria para Registro Nacional de Estrangeiros (RNE)',
        //         priceCurrency: 'BRL',
        //     },
        //     {
        //         service: 'Assessoria para ESTA (Autorização Eletrônica para os EUA)',
        //         priceCurrency: 'BRL',
        //     },
        //     {
        //         service: 'Assessoria para ETIAS (Autorização Eletrônica para a Europa)',
        //         priceCurrency: 'BRL',
        //     },
        // ],

        address: {
            streetAddress: '', // ex: 'Av. Júlio Diniz, 257'
            addressLocality: '', // ex: 'Taquaral, Campinas'
            addressRegion: '', // ex: 'SP'
            postalCode: '', // ex: '13087-001'
            addressCountry: 'BR',
        },
        contactPoint: {
            telephone: '', // ex: '+551920422785'
            telephoneFormatted: '', // ex: '+55 (19) 2042-2785'
            contactType: 'customer service',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ["pt-BR", "en"],
            email: '', // ex: 'contato@fastvistos.com.br'
        },
        whatsapp: {
            telephone: '', // ex: '+551920422785'
            telephoneFormatted: '', // ex: '+55 (19) 2042-2785'
            contactType: 'customer support',
            contactOption: "WhatsApp",
            url: '', // ex: 'https://wa.me/551920422785'
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ["pt-BR", "en"],
            email: '', // ex: 'contato@fastvistos.com.br'
        },
        socialMedia: {
            facebook: '', // ex: 'https://www.facebook.com/fastvistos/'
            twitter: '',  // ex: '@FVistos32701'
            instagram: '', // ex: 'https://www.instagram.com/fastvistos/'
            youtube: '', // ex: 'https://www.youtube.com/@FastVistos/shorts'
        },
    },

    homePageConfig: {
        seo: {
            title: '', // ex: 'Fast Vistos - Assessoria de Vistos Americanos para Todo Brasil | Campinas SP'
            description: '', // ex: 'Assessoria especializada em vistos americanos com atendimento em todo o Brasil. Sede em Campinas/SP. Taxa de aprovação 95%+. Agende sua entrevista.'
            themeColor: '', // ex:'#0070f3'
            openGraph: {
                type: 'website',
                image: {
                    url: '', // ex: 'https://fastvistos.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp'
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: '', // ex: 'Fast Vistos - Assessoria de vistos americanos para todo Brasil'
                },
                title: '', // ex: 'Fast Vistos - Assessoria de Vistos Americanos para Todo Brasil'
                description: '', // ex: 'Assessoria especializada em vistos americanos com atendimento em todo o Brasil. Sede em Campinas/SP.'
            }
        },
    },

    blogPageConfig: {
        seo: {
            title: '', // ex: 'Blog Fast Vistos - Dicas e Informações sobre Vistos Internacionais'
            description: '', // ex: 'Artigos e dicas sobre vistos americanos, canadenses, passaportes e viagens internacionais. Atendimento para todo Brasil.'
            themeColor: '', // ex: '#0070f3'
            openGraph: {
                type: 'website',
            }
        },
        pagination: {
            postsPerPage: 10,
        },
    },

    blogPostConfig: {
        seo: {
            themeColor: '', // ex: '#0070f3'
            openGraph: {
                type: 'article',
                section: '', // ex: 'Serviços de Vistos e Documentos'
            }
        },
        readingTime: true, // true/false
        showAuthor: true, // true/false
        relatedPosts: true, // true/false
    },

    analytics: {
        gtmId: '', // ex: 'GTM-59SRNCQD'
    },

    verification: {
        googleSiteVerification: '', // ex: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567abc890'
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