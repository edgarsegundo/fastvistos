import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig: SiteConfig = {
    site: {
        business_id: '47f72bb76ec74a078337e38f54ebc213',
        id: 'emprego',
        siteName: 'Emprego Aqui',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: 'empregoaqui.com.br',
        canonical: 'https://empregoaqui.com.br/',
        authorName: 'Edgar Rezende',
        primaryImage: {
            url: 'https://empregoaqui.com.br/assets/images/logo/home-page-main-image-emprego.webp',
            width: 1280,
            height: 720,
            type: 'image/webp',
            alt: 'Emprego Aqui - Plataforma de empregos e oportunidades'
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://empregoaqui.com.br/assets/images/logo/logo-emprego.png',
            alt: 'Emprego Aqui - Plataforma de empregos e oportunidades',
            width: 530,
            height: 67,
        },
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        thumbnailUrl: 'https://empregoaqui.com.br/assets/images/logo/home-page-main-image-emprego.webp', // Important for search and social previews

        assetsUrlBase: 'https://empregoaqui.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content

        priceRange: '$$', // e.g. $, $$, $$$, $$$$
        openingHours: [
            'Mo-Fr 09:00-18:00',
            'Sa 09:00-13:00',
        ],
        sameAs: [  // Social media profiles
            'https://www.facebook.com/empregoaqui/',
            'https://x.com/EmpregoAqui',
            'https://www.youtube.com/@EmpregoAqui/shorts',
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
            email: 'contato@empregoaqui.com.br',
        },
        socialMedia: {
            facebook: 'https://www.facebook.com/empregoaqui/',
            twitter: '@EmpregoAqui',
            instagram: 'https://instagram.com/empregoaqui',
            youtube: 'https://youtube.com/@EmpregoAqui',
        },
    },

    homePageConfig: {
        seo: {
            title: 'Emprego Aqui — Plataforma de empregos e oportunidades',
            description: 'Emprego Aqui — Plataforma de empregos e oportunidades para encontrar vagas de emprego e desenvolver sua carreira.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://empregoaqui.com.br/assets/images/logo/home-page-main-image-emprego.webp',
                    width: 1280,
                    height: 720,
                    type: 'image/webp',
                    alt: 'Emprego Aqui - Plataforma de empregos e oportunidades'
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
                    'emprego',
                    'vagas de emprego',
                    'carreira',
                    'oportunidades de trabalho'
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
                section: 'Emprego e Oportunidades',
                tags: [
                    'emprego',
                    'vagas de emprego',
                    'carreira',
                    'oportunidades de trabalho'
                ],
            }
        },
        readingTime: true, // true/false
        showAuthor: true, // true/false
        relatedPosts: true, // true/false
    },

    searchPageConfig: {
        seo: {
            title: 'Emprego Aqui — Plataforma de empregos e oportunidades',
            description: 'Emprego Aqui — Plataforma de empregos e oportunidades para encontrar vagas de emprego e desenvolver sua carreira.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://empregoaqui.com.br/assets/images/logo/home-page-main-image-emprego.webp',
                    width: 1280,
                    height: 720,
                    type: 'image/webp',
                    alt: 'Emprego Aqui - Plataforma de empregos e oportunidades'
                }
            }
        },
    },

    socialMedia: {
        facebook: 'https://facebook.com/empregoaqui',
        twitter: '@EmpregoAqui',
        instagram: 'https://instagram.com/empregoaqui',
        youtube: 'https://youtube.com/@EmpregoAqui',
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
