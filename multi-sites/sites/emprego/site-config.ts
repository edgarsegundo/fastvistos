// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig = {
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
            url: 'https://empregoaqui.com.br/assets/images/ld-json/primary-image/home-page-main-image-emprego.webp',
            width: 1200,
            height: 630,
            type: 'image/webp',
            alt: 'Emprego Aqui — Conexão direta entre pequenos empresários e candidatos disponíveis para trabalhar agora'
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://empregoaqui.com.br/assets/images/ld-json/logo/logo-emprego-aqui.png',
            alt: 'Emprego Aqui — Conexão direta entre pequenos empresários e candidatos disponíveis para trabalhar agora',
            width: 300,
            height: 60,
        },
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        thumbnailUrl: 'https://empregoaqui.com.br/assets/images/ld-json/primary-image/home-page-main-image-emprego.webp',

        assetsUrlBase: 'https://empregoaqui.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content

        priceRange: 'R$', // faixa de preço do serviço (Schema.org: $, $$, $$$)
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
            'https://www.facebook.com/empregoaqui/',
            'https://x.com/EmpregoAqui',
            'https://www.instagram.com/empregoaqui/',
            'https://www.youtube.com/@EmpregoAqui',
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
            reviewCount: 277,
        },

        reviews: [],

        makesOffer: [
            {
                service: 'Conexão Direta entre Pequenas Empresas e Candidatos Disponíveis',
                priceCurrency: 'BRL',
            },
            {
                service: 'Cadastro de Candidatos Prontos para Trabalhar Agora',
                priceCurrency: 'BRL',
            },
            {
                service: 'Busca de Candidatos por Região e Faixa Salarial',
                priceCurrency: 'BRL',
            },
            {
                service: 'Contato Direto com Candidatos via WhatsApp',
                priceCurrency: 'BRL',
            },
            {
                service: 'Contratação Rápida sem Publicar Vaga',
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
            telephone: '+551920422785',
            telephoneFormatted: '+55 (19) 2042-2785',
            contactType: 'customer service',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ["pt-BR"],
            email: 'contato@empregoaqui.com.br',
        },
        whatsapp: {
            telephone: '+551920422785',
            telephoneFormatted: '+55 (19) 2042-2785',
            contactType: 'customer support',
            contactOption: "WhatsApp",
            url: 'https://wa.me/551920422785',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ["pt-BR"],
            email: 'contato@empregoaqui.com.br',
        },
        socialMedia: {
            facebook: 'https://www.facebook.com/empregoaqui/',
            twitter: '@EmpregoAqui',
            instagram: 'https://www.instagram.com/empregoaqui/',
            youtube: 'https://www.youtube.com/@EmpregoAqui',
        },
    },

    organization: {
        id: 'https://empregoaqui.com.br/#organization',
        name: 'Emprego Aqui',
        url: 'https://empregoaqui.com.br',
        canonical: 'https://empregoaqui.com.br/',
        logo: {
            url: 'https://empregoaqui.com.br/assets/images/ld-json/logo/logo-emprego-aqui.png',
            alt: 'Emprego Aqui — Conexão direta entre pequenos empresários e candidatos disponíveis para trabalhar agora',
            width: 300,
            height: 60,
        },
    },

    homePageConfig: {
        seo: {
            title: 'Emprego Aqui — Precisa Contratar pra Ontem? Fale Direto com Quem Quer Trabalhar',
            description: 'Sem currículo. Sem anúncio. Sem enrolação. O Emprego Aqui conecta pequenos empresários com candidatos disponíveis agora — contato direto pelo WhatsApp. Quando é pra agora.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://empregoaqui.com.br/assets/images/ld-json/primary-image/home-page-main-image-emprego.webp',
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'Emprego Aqui — Conexão direta entre pequenos empresários e candidatos disponíveis para trabalhar agora',
                },
                title: 'Emprego Aqui — Quando é pra agora.',
                description: 'Você não publica vaga. Você vê pessoas disponíveis agora. Filtra por região e salário. Fala direto no WhatsApp. Sem burocracia.',
            }
        },
    },

    blogPageConfig: {
        seo: {
            title: 'Blog | Como Contratar Rápido, Dicas para Pequenos Empresários e para Quem Busca Emprego | Emprego Aqui',
            description: 'Dicas práticas para pequenos empresários contratarem rápido e sem RH, e para candidatos serem encontrados pelas empresas. Emprego do jeito que o Brasil vive.',
            themeColor: '#0070f3',
            canonical: 'https://empregoaqui.com.br/',
            openGraph: {
                type: 'website',
                tags: [
                    'contratar funcionário rápido',
                    'pequeno empresário contratar',
                    'vaga urgente',
                    'candidatos disponíveis agora',
                    'contratação sem RH',
                    'emprego sem currículo',
                ],
            }
        },
        pagination: {
            postsPerPage: 10,
        },
        customStyles: {
            cssVars: {
                '--blog-bg-color': '#000',
            },
        },
    },

    blogPostConfig: {
        seo: {
            themeColor: '#0070f3',
            openGraph: {
                type: 'article',
                author: 'Emprego Aqui',
                section: 'Contratação Rápida, Pequenos Negócios e Mercado de Trabalho Real',
                tags: [
                    'contratar funcionário rápido',
                    'pequeno empresário contratar',
                    'vaga urgente',
                    'candidatos disponíveis agora',
                    'contratação sem RH',
                    'emprego sem currículo',
                ],
            }
        },
        readingTime: true, // true/false
        showAuthor: true, // true/false
        relatedPosts: true, // true/false
    },

    searchPageConfig: {
        seo: {
            title: 'Candidatos Disponíveis para Trabalhar Agora | Emprego Aqui',
            description: 'Veja candidatos disponíveis na sua região. Filtre por localidade e faixa salarial. Contato direto pelo WhatsApp. Sem publicar vaga, sem burocracia.',
            themeColor: '#0070f3',
            openGraph: {
                type: 'website',
                image: {
                    url: 'https://empregoaqui.com.br/assets/images/ld-json/primary-image/home-page-main-image-emprego.webp',
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'Candidatos Disponíveis para Trabalhar Agora — Emprego Aqui'
                }
            }
        },
    },

    socialMedia: {
        facebook: 'https://www.facebook.com/empregoaqui/',
        twitter: '@EmpregoAqui',
        instagram: 'https://www.instagram.com/empregoaqui/',
        youtube: 'https://www.youtube.com/@EmpregoAqui',
    },

    analytics: {
        gtmId: 'GTM-59SRNCQD',
    },

    verification: {
        googleSiteVerification: '4mijW5761WZ6vWOjZQUEWgweTpAfpAzSNAjfZLSXyxk',
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
