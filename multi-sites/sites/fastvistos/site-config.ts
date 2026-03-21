// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig = {
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
        // ✅ CORRIGIDO: Mudado para cobertura nacional
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
        // ✅ MELHORADO: Adicionado área de cobertura nacional
        contactPoint: {
            telephone: '+551920422785',
            telephoneFormatted: '+55 (19) 2042-2785',
            contactType: 'customer service',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ["pt-BR", "en"],
            email: 'contato@fastvistos.com.br',
        },
        whatsapp: {
            telephone: '+551920422785',
            telephoneFormatted: '+55 (19) 2042-2785',
            contactType: 'customer support',
            contactOption: "WhatsApp",
            url: "https://wa.me/551920422785",
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ["pt-BR", "en"],
            email: 'contato@fastvistos.com.br',
        },
        socialMedia: {
            facebook: 'https://www.facebook.com/fastvistos/',
            twitter: '@FVistos32701',
            instagram: '',
            youtube: '',
        },
    },

    homePageConfig: {
        seo: {
            // ✅ OPÇÃO 1 IMPLEMENTADA: Título focado em "Todo Brasil"
            title: 'Fast Vistos - Assessoria de Visto Americano para Todo Brasil | Campinas SP',
            // ✅ OPÇÃO 1 IMPLEMENTADA: Descrição com foco nacional
            description: 'Assessoria especializada em visto americano com atendimento em todo o Brasil. Sede em Campinas/SP. Taxa de aprovação 95%+. Processo rápido e seguro. Fale pelo WhatsApp.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://fastvistos.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp',
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'Fast Vistos - Assessoria de visto americano para todo Brasil'
                },
                // ✅ ADICIONADO: OG Title e Description para redes sociais
                title: 'Fast Vistos - Assessoria de Visto Americano para Todo Brasil',
                description: 'Assessoria especializada em visto americano com atendimento em todo o Brasil. Sede em Campinas/SP.',
            }
        },
    },

    blogPageConfig: {
        seo: {
            title: 'Blog Fast Vistos | Visto Americano, DS-160, Entrevista Consular e Mais',
            description: 'Tire suas dúvidas sobre visto americano, DS-160, entrevista consular e documentação. Conteúdo atualizado para brasileiros em todo o país.',
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