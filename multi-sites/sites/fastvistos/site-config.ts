import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig: SiteConfig = {
    site: {
        business_id: '41a5c7f95e924d54b120ab9a0e1843c8',
        id: 'fastvistos',
        siteName: 'Fast Vistos',
        locale: 'pt_BR',
        faviconPath: '/favicon.ico',
        domain: 'fastvistos.com.br',
        canonical: 'https://fastvistos.com.br/',
        author_name: 'Daniela Otaviano',


        useFullLanguageTag: true, // true/false


        currency: 'BRL',
        timezone: 'America/Sao_Paulo',

        logo: {
            url: 'https://fastvistos.com.br/assets/images/logo/logo-footer.png',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem',
            width: 512,
            height: 512,
        },
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        author: 'Daniela Otaviano',
        thumbnailUrl: 'https://fastvistos.com.br/assets/images/logo/logo-footer.png', // Important for search and social previews
        image: 'https://fastvistos.com.br/assets/images/logo/logo-footer.png', // General image for the site
        assets_url_base: 'https://fastvistos.com.br/assets/', // Base URL for images used in blog posts and other content
        // datePublished: '2024-01-01T00:00:00Z', // ISO 8601 format
        // dateModified: '2024-01-01T00:00:00Z', // ISO 8601 format
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
                    url: '/images/og-fast-vistos.jpg',
                    width: 1200,
                    height: 630,
                    type: 'image/jpeg',
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
                image: {
                    url: '/images/og-fast-vistos.jpg',
                    width: 1200,
                    height: 630,
                    type: 'image/jpeg',
                    alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem'
                }
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
                author: 'Fast Vistos',
                section: 'Serviços de Vistos e Documentos',
                tags: [
                    'vistos internacionais',
                    'visto americano',
                    'visto canadense',
                    'passaporte brasileiro'
                ],
                image: {
                    url: '/images/og-fast-vistos.jpg',
                    width: 1200,
                    height: 630,
                    type: 'image/jpeg',
                    alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem'
                }
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
