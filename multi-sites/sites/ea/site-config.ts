// 🌐 Shared Site Config (site + branding + global stuff)
// Blog "O Dono que Constrói" — blog.ea.tv.br (siteId: ea)
// Casos reais de donos de pequenos negócios que criaram seus próprios apps/sistemas com IA.
//
// Itens marcados com [PREENCHER] ainda não existem e foram deixados vazios
// de propósito, para não publicar dados falsos (Schema.org / Open Graph).

const DOMAIN = 'blog.ea.tv.br';
const BASE_URL = `https://${DOMAIN}`;
const SITE_NAME = 'O Dono que Constrói';
const TAGLINE = 'Casos reais de donos de negócio que criaram o próprio app com IA';

export const siteConfig = {
    site: {
        business_id: '0cd1a371be1f482c85a21edcef60555e',
        id: 'ea',
        siteName: SITE_NAME,
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: DOMAIN,
        canonical: `${BASE_URL}/`,
        authorName: 'Edgar Rezende',
        primaryImage: {
            url: '/images/og-dono-que-constroi.jpg', // [PREENCHER] criar imagem 1200x630
            width: 1200,
            height: 630,
            type: 'image/jpeg',
            alt: `${SITE_NAME} — ${TAGLINE}`
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: `${BASE_URL}/logo.png`, // [PREENCHER] subir logo 512x512
            alt: SITE_NAME,
            width: 512,
            height: 512,
        },
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        thumbnailUrl: `${BASE_URL}/logo.png`, // Important for search and social previews

        assetsUrlBase: `${BASE_URL}/assets/images/blog/`, // Base URL for images used in blog posts and other content

        // Blog editorial: sem endereço físico, horário, avaliações nem faixa de preço.
        // (removidos os dados copiados do Fast Vistos: endereço, geo, horários, nota 5.0/277)
        sameAs: [], // [PREENCHER] perfis sociais do blog, quando existirem

        serviceArea: {
            name: 'Brazil',
        },

        contactPoint: {
            contactType: 'customer service',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ['Portuguese'],
            email: 'contato@empregoaqui.com.br', // [CONFIRMAR] e-mail de contato do blog
        },

        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: '',
            youtube: '',
        },
    },

    organization: {
        id: `${BASE_URL}/#organization`,
        name: SITE_NAME,
        url: BASE_URL,
        canonical: `${BASE_URL}/`,
        logo: {
            url: `${BASE_URL}/logo.png`, // [PREENCHER] mesma logo acima
            alt: SITE_NAME,
            width: 512,
            height: 512,
        },
    },

    homePageConfig: {
        seo: {
            title: `${SITE_NAME} — Casos reais de apps criados com IA por donos de negócio`,
            description: 'Histórias de donos de pequenos negócios que criaram o próprio site, app ou sistema com IA: o que deu certo, quanto custou e onde pediram ajuda.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: '/images/og-dono-que-constroi.jpg',
                    width: 1200,
                    height: 630,
                    type: 'image/jpeg',
                    alt: `${SITE_NAME} — ${TAGLINE}`
                },
                title: `${SITE_NAME}: donos de negócio que criam o próprio app com IA`,
                description: 'Casos reais, com números e limites honestos: até onde a IA leva sozinha e onde vale pedir ajuda.'
            }
        },
    },

    blogPageConfig: {
        seo: {
            title: `Casos | ${SITE_NAME}`,
            description: 'Casos reais de donos de pequenos negócios que construíram o próprio app com IA: ferramentas, custos, resultados e os limites de cada história.',
            themeColor: '#0070f3',
            canonical: `${BASE_URL}/`,
            openGraph: {
                type: 'blog',
                tags: [
                    'inteligência artificial',
                    'pequenos negócios',
                    'dono que constrói',
                    'criar app com IA',
                    'casos reais'
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
                author: 'Edgar Rezende',
                section: 'Casos: O Dono que Constrói',
                tags: [
                    'inteligência artificial',
                    'pequenos negócios',
                    'dono que constrói',
                    'criar app com IA',
                    'casos reais'
                ],
            }
        },
        readingTime: true, // true/false
        showAuthor: true, // true/false
        relatedPosts: true, // true/false
    },

    socialMedia: {
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: '',
    },

    analytics: {
        gtmId: '', // [PREENCHER] o GTM do Fast Vistos foi removido; criar um container próprio
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
            '--accent-color': '#0070f3',
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
