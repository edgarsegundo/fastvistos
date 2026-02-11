import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig: SiteConfig = {
    site: {
        business_id: 'e3bbe77b68c44b81b69d1573a264ede8',
        id: 'revistadoturismo',
        siteName: 'Revista do Turismo',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: 'revistadoturismo.com.br',
        canonical: 'https://revistadoturismo.com.br/',
        authorName: 'Edgar Rezende',
        primaryImage: {
            url: 'https://revistadoturismo.com.br/assets/images/logo/primary-image-revista-turismo.webp',
            width: 1280,
            height: 720,
            type: 'image/webp',
            alt: 'Revista digital brasileira sobre viagens, cultura e experiências turísticas.',
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://revistadoturismo.com.br/assets/images/logo/???',
            alt: 'Revista do Turismo - Revista digital brasileira sobre viagens, cultura e experiências turísticas',
            width: 530,
            height: 67,
        },
        primaryColor: '#111828',
        secondaryColor: '#6776E0',
        thumbnailUrl: 'https://revistadoturismo.com.br/assets/images/logo/???', // Important for search and social previews

        assetsUrlBase: 'https://revistadoturismo.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content

        priceRange: '$$', // e.g. $, $$, $$$, $$$$
        // openingHours: [],
        sameAs: [  // Social media profiles
            // 'https://www.facebook.com/revistadoturismo/',
            // 'https://x.com/revistadoturismo',
            // 'https://www.youtube.com/@revistadoturismo/shorts',
        ],
        // geo: {
        //     latitude: -22.8807734, // Latitude for the business location
        //     longitude: -47.0596895, // Longitude for the business location
        // },
        // serviceArea: {
        //     name: 'Campinas e região metropolitana de São Paulo',
        // },
        // aggregateRating: {
        //     ratingValue: '5.0',
        //     reviewCount: '277',
        // },
        // address: {
        //     streetAddress: 'Av. Júlio Diniz, 257',
        //     addressLocality: 'Taquaral, Campinas',
        //     addressRegion: 'SP',
        //     postalCode: '13075-420',
        //     addressCountry: 'BR',
        // },
        // contactPoint: {
        //     telephone: '+551920422785',
        //     telephoneFormatted: '+55 (19) 2042-2785',
        //     contactType: 'Customer Service',
        //     areaServed: 'BR',
        //     availableLanguage: ['Portuguese', 'English'],
        //     email: 'contato@fastvistos.com.br',
        // },
        // socialMedia: {
        //     facebook: 'https://www.facebook.com/fastvistos/',
        //     twitter: '@yourtwitter',
        //     instagram: '',
        //     youtube: '',
        // },
    },

    homePageConfig: {
        seo: {
            title: 'Revista do Turismo - Sua fonte de inspiração para viagens, cultura e experiências turísticas',
            description: 'Revista do Turismo — Sua fonte de inspiração para viagens, cultura e experiências turísticas. Descubra destinos, dicas e histórias para suas próximas aventuras.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://revistadoturismo.com.br/assets/images/logo/home-page-main-image-revista-turismo.webp',
                    width: 1280,
                    height: 720,
                    type: 'image/webp',
                    alt: 'Revista do Turismo - Sua fonte de inspiração para viagens, cultura e experiências turísticas'
                }
            }
        },
    },

    blogPageConfig: {
        seo: {
            themeColor: '#111828',
            openGraph: {
                type: 'blog',
                // tags: [
                //     'vistos internacionais',
                //     'visto americano',
                //     'visto canadense',
                //     'passaporte brasileiro'
                // ],
            }
        },
        pagination: {
            postsPerPage: 10,
        },
    },

    blogPostConfig: {
        seo: {
            themeColor: '#111828',
            openGraph: {
                type: 'article',
                section: 'Turismo',
                // tags: [
                //     'vistos internacionais',
                //     'visto americano',
                //     'visto canadense',
                //     'passaporte brasileiro'
                // ],
            }
        },
        readingTime: true, // true/false
        showAuthor: true, // true/false
        relatedPosts: true, // true/false
    },

    // socialMedia: {
    //     facebook: 'https://facebook.com/revistadoturismo',
    //     twitter: '@revistadoturismo',
    //     instagram: 'https://instagram.com/revistadoturismo',
    //     youtube: 'https://youtube.com/@revistadoturismo',
    // },

    // analytics: {
    //     gtmId: 'GTM-XXXXXX',
    // },

    // verification: {
    //     googleSiteVerification: '',
    // },

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
