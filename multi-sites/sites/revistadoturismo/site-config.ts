import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig: SiteConfig = {
    site: {
        business_id: '???',
        id: 'revistadoturismo',
        siteName: 'Revista do Turismo',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: 'revistadoturismo.com.br',
        canonical: 'https://revistadoturismo.com.br/',
        authorName: 'Daniela Otaviano',
        primaryImage: {
            url: 'https://revistadoturismo.com.br/assets/images/logo/home-page-main-image-fastvistos-mulher-passaporte.webp',
            width: 1280,
            height: 720,
            type: 'image/webp',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem'
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://revistadoturismo.com.br/assets/images/logo/logo-fast-orange.png',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem',
            width: 530,
            height: 67,
        },
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        thumbnailUrl: 'https://revistadoturismo.com.br/assets/images/logo/home-page-main-image-fastvistos-mulher-passaporte.webp', // Important for search and social previews

        assetsUrlBase: 'https://revistadoturismo.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content

        priceRange: '$$', // e.g. $, $$, $$$, $$$$
        openingHours: [
            'Mo-Fr 09:00-18:00',
            'Sa 09:00-13:00',
        ],
        sameAs: [  // Social media profiles
            'https://www.facebook.com/revistadoturismo/',
            'https://x.com/revistadoturismo',
            'https://www.youtube.com/@revistadoturismo/shorts',
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
            title: 'Fast Vistos — Assessoria Especializada em Vistos e Documentos de Viagem',
            description: 'Fast Vistos — Assessoria especializada em vistos e documentos para viagens internacionais. Facilitamos a obtenção de vistos e passaportes com agilidade.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://fastvistos.com.br/assets/images/logo/home-page-main-image-fastvistos-mulher-passaporte.webp',
                    width: 1280,
                    height: 720,
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
                type: 'blog',
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
        facebook: 'https://facebook.com/revistadoturismo',
        twitter: '@revistadoturismo',
        instagram: 'https://instagram.com/revistadoturismo',
        youtube: 'https://youtube.com/@revistadoturismo',
    },

    analytics: {
        gtmId: 'GTM-XXXXXX',
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
