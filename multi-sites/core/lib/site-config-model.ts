/**
 * SITE CONFIG TEMPLATE (Documentation Only)
 *
 * This file is a template and documentation model for site configuration.
 *
 * - DO NOT use this file directly for your live site configuration.
 * - To configure a real site, COPY this file as `site-config.ts` into the root of your siteid folder (e.g. `/multi-sites/sites/your-siteid/site-config.ts`).
 * - Fill in all fields with information specific to your website/project.
 * - All values here are placeholders and should be replaced with your actual business, branding, and SEO details.
 *
 * This template helps ensure consistency and best practices across all site configs.
 */
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
            url: '/images/og-fast-vistos.jpg',
            width: 1200,
            height: 630,
            type: 'image/jpeg',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem'
        },
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
        thumbnailUrl: 'https://fastvistos.com.br/assets/images/logo/logo-footer.png', // Important for search and social previews

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
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },            
            availableLanguage: ['Portuguese', 'English'],
            email: 'contato@fastvistos.com.br',
        },
        whatsapp: {
            telephone: '+551150283044',
            telephoneFormatted: '+55 (11) 5028-3044',
            contactType: 'customer support',
            contactOption: "WhatsApp",
            url: 'https://wa.me/551150283044',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ["pt-BR", "en"],
            email: 'contato@fastvistos.com.br', // ex: 'contato@fastvistos.com.br'
        },

        socialMedia: {
            facebook: 'https://www.facebook.com/fastvistos/',
            twitter: '@yourtwitter',
            instagram: '',
            youtube: '',
        },
    },

    organization: {
        id: 'https://fastvistos.com.br/#organization',
        name: 'Fast Vistos',
        url: 'https://fastvistos.com.br',
        canonical: 'https://fastvistos.com.br/',
        logo: {
            url: 'https://fastvistos.com.br/assets/images/logo/logo-fast-orange.png',
            alt: 'Fast Vistos - Assessoria de vistos e documentos de viagem, sede em Campinas',
            width: 530,
            height: 67,
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
                },
                title: 'Guia completo para tirar visto americano 🇺🇸',
                description: 'Entenda como funciona o processo, documentos e entrevista para tirar o visto americano.'
            }
        },
    },

    blogPageConfig: {
        seo: {
            title: 'Blog | Visto Americano, DS-160, Entrevista Consular e Mais | Central de Vistos',
            description: 'Tire suas dúvidas sobre visto americano, DS-160, entrevista consular e documentação. Conteúdo atualizado para brasileiros em todo o país.',
            themeColor: '#0070f3',
            canonical: 'https://centraldevistos.com/',
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
        customStyles: {
            cssVars: {
                '--blog-bg-color': '#4A4047',
            },
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
