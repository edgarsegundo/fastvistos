// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig = {
    site: {
        business_id: '3b514325-d9f7-4bbe-af5e-a7750c6d9a07',
        id: 'contratar',
        siteName: 'ContratarAqui',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: 'contrataraqui.com.br',
        canonical: 'https://contrataraqui.com.br/',
        authorName: 'Edgar Rezende',
        primaryImage: {
            url: '/assets/images/home/home-page-main-image-contrataraqui-para-empresas.webp',
            width: 1200,
            height: 630,
            type: 'image/webp',
            alt: 'ContratarAqui — Quando sua empresa precisa contratar, nós conectamos você a candidatos qualificados.',
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://contrataraqui.com.br/assets/images/logo/contratar-logo.svg',
            alt: 'ContratarAqui',
            width: 256,
            height: 260,
        },
        primaryColor: '#F28B30',
        secondaryColor: '#1e2237',
        thumbnailUrl: 'https://contrataraqui.com.br/assets/images/logo/contratar-logo-icone.svg', // TODO: trocar por uma imagem retangular quando existir (ideal p/ social previews)

        assetsUrlBase: 'https://contrataraqui.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content

        priceRange: 'R$',
        openingHours: [
            'Mo-Fr 09:00-18:00',
            'Sa 09:00-13:00',
        ],
        sameAs: [], // TODO: preencher com redes sociais quando existirem

        geo: {
            latitude: -22.8807734, // TODO: confirmar geo real do negócio
            longitude: -47.0596895,
        },
        serviceArea: {
            name: '', // TODO: definir região de cobertura
        },
        aggregateRating: {
            ratingValue: '0', // TODO: preencher quando houver avaliações reais
            reviewCount: '0',
        },

        address: {
            streetAddress: '', // TODO: preencher endereço, se aplicável
            addressLocality: '',
            addressRegion: '',
            postalCode: '',
            addressCountry: 'BR',
        },

        contactPoint: {
            telephone: '+5519988055816',
            telephoneFormatted: '+55 (19) 98805-5816',
            contactType: 'Customer Service',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ['Portuguese'],
            email: 'contato@contrataraqui.com.br',
        },
        whatsapp: {
            telephone: '+5519988055816',
            telephoneFormatted: '+55 (19) 98805-5816',
            contactType: 'customer support',
            contactOption: 'WhatsApp',
            url: 'https://wa.me/5519988055816',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ['pt-BR'],
            email: 'contato@contrataraqui.com.br',
        },

        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: '',
            youtube: '',
        },
    },

    organization: {
        id: 'https://contrataraqui.com.br/#organization',
        name: 'ContratarAqui',
        url: 'https://contrataraqui.com.br',
        canonical: 'https://contrataraqui.com.br/',
        logo: {
            url: 'https://contrataraqui.com.br/assets/images/logo/contratar-logo-icone.svg',
            alt: 'ContratarAqui',
            width: 256,
            height: 260,
        },
    },

    homePageConfig: {
        seo: {
            title: 'ContratarAqui — Contratação Sem Burocracia, Pra Ontem',
            description: 'Sem filtrar 200 currículos, sem marcar entrevistas. Fale direto com candidatos da sua região. Acesse grátis os 5 primeiros currículos, sem cadastro.',
            themeColor: '#F28B30',
            openGraph: {
                type: 'website',
                image: {
                    url: '/assets/images/home/home-page-main-image-contrataraqui-para-empresas.webp',
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'ContratarAqui — Quando você precisa contratar, precisa pra ontem. Candidatos disponíveis na sua região.'
                },
                title: 'ContratarAqui — Contrate Sem Burocracia',
                description: 'Veja candidatos disponíveis na sua região e fale direto com eles. Acesse grátis os 5 primeiros currículos, sem cadastro e sem cartão.'
            }
        },
    },

    privacyPolicyPageConfig: {
        seo: {
            title: 'Política de Privacidade | ContratarAqui',
            description: 'Saiba como a ContratarAqui coleta, utiliza, armazena e compartilha seus dados pessoais, em conformidade com a LGPD.',
            themeColor: '#1e2237',
            openGraph: {
                type: 'website',
                image: {
                    url: '/assets/images/home/home-page-main-image-contrataraqui-para-empresas.webp',
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'Política de Privacidade — ContratarAqui',
                },
            },
        },
    },

    termsOfUsePageConfig: {
        seo: {
            title: 'Termos de Uso | ContratarAqui',
            description: 'Regras de uso da plataforma ContratarAqui para candidatos e empresas parceiras: como funciona, responsabilidades e limitações.',
            themeColor: '#1e2237',
            openGraph: {
                type: 'website',
                image: {
                    url: '/assets/images/home/home-page-main-image-contrataraqui-para-empresas.webp',
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'Termos de Uso — ContratarAqui',
                },
            },
        },
    },

    blogPageConfig: {
        seo: {
            title: 'Blog | Currículo, Vagas e Recrutamento | ContratarAqui',
            description: 'Dicas para montar um currículo melhor, entender processos seletivos e se conectar com empresas parceiras de recrutamento.',
            themeColor: '#1e2237',
            canonical: 'https://contrataraqui.com.br/',
            openGraph: {
                type: 'blog',
                tags: [
                    'currículo gratuito',
                    'como fazer currículo',
                    'vagas de emprego',
                    'recrutamento',
                ],
            }
        },
        pagination: {
            postsPerPage: 10,
        },
        customStyles: {
            cssVars: {
                '--blog-bg-color': '#1e2237',
            },
        },
    },

    blogPostConfig: {
        seo: {
            themeColor: '#F28B30',
            openGraph: {
                type: 'article',
                author: 'ContratarAqui',
                section: 'Currículo, Vagas e Recrutamento',
                tags: [
                    'currículo gratuito',
                    'como fazer currículo',
                    'vagas de emprego',
                    'recrutamento',
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
        gtmId: '', // TODO: preencher quando existir (não copiado do criacurriculo de propósito)
    },

    verification: {
        googleSiteVerification: 'WXIlLRD2zq572jWB49qRzoAWXVbV9SYjkQ9rzmQXZNk', // TODO: preencher quando existir
    },

    features: {
        blog: true, // true/false
        booking: false, // true/false
        payments: false, // true/false
        multilingual: false, // true/false
    },

    customStyles: {
        cssVars: {
            '--accent-color': '#F28B30',
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
