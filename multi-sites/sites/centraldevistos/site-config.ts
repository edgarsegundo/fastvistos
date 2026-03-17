import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig: SiteConfig = {
    site: {
        business_id: '3cfe8493907c488480f55c9ee10f8c05',
        id: 'centraldevistos',
        siteName: 'Fast Vistos',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: 'centraldevistos.com.br', // ex: 'fastvistos.com.br'
        canonical: 'https://centraldevistos.com.br/', // ex: 'https://fastvistos.com.br/'
        authorName: 'Daniela Otaviano', // ex: 'Daniela Otaviano'
        primaryImage: {
            url: 'https://centraldevistos.com.br/assets/images/ld-json/primary-image/assessoria-visto-americano-fastvistos.webp',
            width: 1200,
            height: 630,
            type: 'image/webp',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem para todo o Brasil' // ex: 'Fast Vistos - Assessoria de vistos e documentos de viagem, sede em Campinas'
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://centraldevistos.com.br/assets/images/ld-json/logo/logo-fast-vistos-assessoria.png',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem para todo o Brasil', // ex: 'Fast Vistos - Assessoria de vistos e documentos de viagem, sede em Campinas'
            width: 530,
            height: 67,
        },
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        thumbnailUrl: 'https://centraldevistos.com.br/assets/images/ld-json/primary-image/assessoria-visto-americano-fastvistos.webp', 
        
        assetsUrlBase: 'https://centraldevistos.com.br/assets/images/blog/', // ex: 'https://fastvistos.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content
        
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
            'https://www.facebook.com/fastvistos/',
            'https://x.com/FVistos32701',
            'https://www.youtube.com/@FastVistos/shorts',
        ],
        geo: {
            latitude: -22.8807734, // Latitude for the business location
            longitude: -47.0596895, // Longitude for the business location
        },
        serviceArea: {
            name: 'Brazil',
        },
        aggregateRating: {
            ratingValue: 5,
            reviewCount: 300,
        },

        reviews: [
            {
                author: 'Analice de Medeiros Chianca Pavan',
                datePublished: '2025-01-20',
                reviewBody: 'Excelente assessoria para visto americano! O processo foi super rápido, a Daniela é extremamente atenciosa e demonstra muito conhecimento em cada etapa. Me senti muito segura e bem orientada o tempo todo. Recomendo fortemente para quem busca um atendimento sério, eficiente e de alta qualidade.',
                ratingValue: 5,
            },
            {
                author: 'Jetsuo Mine',
                datePublished: '2025-01-28',
                reviewBody: 'Processo muito ágil, claro e confiável. Meu visto saiu em menos de 15 dias.',
                ratingValue: 5,
            },
            {
                author: 'Aramis Lima',
                datePublished: '2025-01-31',
                reviewBody: 'Excelente consultoria, me orientaram em todo o processo e ainda deram dicas importantes para garantir uma ótima experiência. Super recomendo.',
                ratingValue: 5,
            },
            {
                author: 'Selma Aparecida de Rezende Borim',
                datePublished: '2024-12-27',
                reviewBody: 'Atendimento top, equipe muito atenciosa e conseguiram datas bem próximas para a entrevista. Eu recomendo.',
                ratingValue: 5,
            },
        ],

        makesOffer: [
            {
                service: 'Assessoria para Visto Americano',
                priceCurrency: 'BRL',
            },
            {
                service: 'Assessoria para eTA Canadá',
                priceCurrency: 'BRL',
            },
            {
                service: 'Assessoria para Visto Mexicano',
                priceCurrency: 'BRL',
            },
            {
                service: 'Assessoria para Registro Nacional de Estrangeiros (RNE)',
                priceCurrency: 'BRL',
            },
            {
                service: 'Assessoria para ESTA (Autorização Eletrônica para os EUA)',
                priceCurrency: 'BRL',
            },
            {
                service: 'Assessoria para ETIAS (Autorização Eletrônica para a Europa)',
                priceCurrency: 'BRL',
            },
        ],

        address: {
            streetAddress: 'Av. Júlio Diniz, 257',
            addressLocality: 'Taquaral, Campinas',
            addressRegion: 'SP',
            postalCode: '13075-420',
            addressCountry: 'BR',
        },

        contactPoint: {
            telephone: '+551150283044', // ex: '+551920422785'
            telephoneFormatted: '+55 (11) 5028-3044', // ex: '+55 (19) 2042-2785'
            contactType: 'customer service',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ["pt-BR", "en"],
            email: 'contato@centraldevistos.com.br', // ex: 'contato@fastvistos.com.br'
        },
        whatsapp: {
            telephone: '+551150283044', // ex: '+551920422785'
            telephoneFormatted: '+55 (11) 5028-3044', // ex: '+55 (19) 2042-2785'
            contactType: 'customer support',
            contactOption: "WhatsApp",
            url: 'https://wa.me/551150283044', // ex: 'https://wa.me/551920422785'
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ["pt-BR", "en"],
            email: 'contato@centraldevistos.com.br', // ex: 'contato@fastvistos.com.br'
        },
        socialMedia: {
            facebook: 'https://www.facebook.com/fastvistos/',
            twitter: '@FVistos32701',
            instagram: '', // ex: 'https://www.instagram.com/fastvistos/'
            youtube: '', // ex: 'https://www.youtube.com/@FastVistos/shorts'
        },
    },

    homePageConfig: {
        seo: {
            title: 'Assessoria em Visto Americano para Todo o Brasil | Fast Vistos',
            description: 'Assessoria especializada em visto americano para todo o Brasil. Taxa de aprovação acima de 95%. Processo rápido e seguro. Fale pelo WhatsApp.',
            themeColor: '#0070f3', // ex:'#0070f3'
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://centraldevistos.com.br/assets/images/ld-json/primary-image/assessoria-visto-americano-fastvistos.webp',
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'Fast Vistos - Assessoria de visto americano para todo o Brasil',
                },
                title: 'Precisa de Visto Americano? Resolvemos para você 🇺🇸',
                description: 'Mais de 300 clientes aprovados. Atendemos em todo o Brasil. Fale agora pelo WhatsApp e comece seu processo hoje.',
            }
        },
    },

    blogPageConfig: {
        seo: {
            title: 'Blog | Visto Americano, DS-160, Entrevista Consular e Mais | Fast Vistos',
            description: 'Tire suas dúvidas sobre visto americano, DS-160, entrevista consular e documentação. Conteúdo atualizado para brasileiros em todo o país.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                tags: [
                    'visto americano',
                    'DS-160',
                    'entrevista consular',
                    'visto B1 B2',
                    'ESTA EUA',
                    'assessoria de vistos',
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
                    'visto americano',
                    'DS-160',
                    'entrevista consular',
                    'visto B1 B2',
                    'ESTA EUA',
                    'assessoria de vistos',
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
