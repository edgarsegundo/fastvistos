import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig: SiteConfig = {
    site: {
        business_id: '5810c2b6125c402a9cff53fcc9d61bf5',
        id: 'p2digital',
        siteName: 'p2digital',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: 'p2digital.com.br',
        canonical: 'https://p2digital.com.br/',
        authorName: 'Daniela Otaviano',
        primaryImage: {
            url: 'https://p2digital.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp',
            width: 1200,
            height: 630,
            type: 'image/webp',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem, sede em Campinas'
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://p2digital.com.br/assets/images/logo/logo-fast-orange.png',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem, sede em Campinas',
            width: 530,
            height: 67,
        },
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        thumbnailUrl: 'https://p2digital.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp', // Important for search and social previews

        assetsUrlBase: 'https://p2digital.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content

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
        serviceArea: {
            name: 'Campinas e região metropolitana de São Paulo',
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
        contactPoint: {
            telephone: '+551920422785',
            telephoneFormatted: '+55 (19) 2042-2785',
            contactType: 'Customer Service',
            areaServed: 'BR',
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
            title: 'Despachante de Visto Americano em Campinas | Fast Vistos — Assessoria Especializada em Vistos e Passaportes',
            description: 'Despachante de Visto Americano em Campinas | Fast Vistos — Assessoria Especializada em Vistos e Passaportes. Atendimento rápido e seguro em todo o Brasil',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://p2digital.com.br/assets/images/logo/visto-americano-campinas-fastvistos.webp',
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem'
                }
            }
        },
    },

    blogPageConfig: {
        seo: {
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                tags: [
                    'vistos internacionais',
                    'visto americano',
                    'visto canadense',
                    'passaporte brasileiro'
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
                    'passaporte brasileiro'
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





