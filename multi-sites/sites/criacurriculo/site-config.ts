// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig = {
    site: {
        business_id: 'd206a9d0bdd948a6a3569eb19ed007dc',
        id: 'criacurriculo',
        siteName: 'Cria Currículo',
        locale: 'pt-BR',
        faviconPath: '/favicon.ico',
        domain: 'criacurriculo.com.br',
        canonical: 'https://criacurriculo.com.br/',
        authorName: 'Cria Currículo', // TODO: confirmar nome do autor/responsável editorial
        primaryImage: {
            url: '/assets/images/logo/home-page-main-image-fastvistos-mulher-passaporte.webp', // TODO: trocar pela imagem principal do criacurriculo (1200x630)
            width: 1200,
            height: 630,
            type: 'image/webp',
            alt: 'Cria Currículo — Captação gratuita de currículos e conexão com empresas parceiras de recrutamento'
        },
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: {
            url: 'https://criacurriculo.com.br/assets/images/logo/criacurriculo_logo_icone.svg',
            alt: 'Cria Currículo',
            width: 256,
            height: 260,
        },
        primaryColor: '#F28B30',
        secondaryColor: '#1e2237',
        thumbnailUrl: 'https://criacurriculo.com.br/assets/images/logo/criacurriculo_logo_icone.svg', // TODO: trocar por uma imagem retangular quando existir (ideal p/ social previews)

        assetsUrlBase: 'https://criacurriculo.com.br/assets/images/blog/', // Base URL for images used in blog posts and other content

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
            telephone: '+551150283044',
            telephoneFormatted: '+55 (11) 5028-3044',
            contactType: 'Customer Service',
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ['Portuguese'],
            email: 'contato@criacurriculo.com.br',
        },
        whatsapp: {
            telephone: '+551150283044',
            telephoneFormatted: '+55 (11) 5028-3044',
            contactType: 'customer support',
            contactOption: 'WhatsApp',
            url: '#', // TODO: link de contato/WhatsApp real (mocado por enquanto)
            areaServed: {
                "@type": "Country",
                "name": "Brazil"
            },
            availableLanguage: ['pt-BR'],
            email: 'contato@criacurriculo.com.br',
        },

        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: '',
            youtube: '',
        },
    },

    organization: {
        id: 'https://criacurriculo.com.br/#organization',
        name: 'Cria Currículo',
        url: 'https://criacurriculo.com.br',
        canonical: 'https://criacurriculo.com.br/',
        logo: {
            url: 'https://criacurriculo.com.br/assets/images/logo/criacurriculo_logo_icone.svg',
            alt: 'Cria Currículo',
            width: 256,
            height: 260,
        },
    },

    homePageConfig: {
        seo: {
            title: 'Cria Currículo — Currículo Gratuito e Conexão com Empresas Parceiras de Recrutamento',
            description: 'Captamos currículos gratuitamente e conectamos candidatos a empresas parceiras de recrutamento. Sem custo para o candidato, sem burocracia para quem contrata.',
            themeColor: '#F28B30',
            openGraph: {
                type: 'website',
                image: {
                    url: '/assets/images/logo/home-page-main-image-fastvistos-mulher-passaporte.webp', // TODO: trocar pela imagem principal do criacurriculo
                    width: 1200,
                    height: 630,
                    type: 'image/webp',
                    alt: 'Cria Currículo — Captação gratuita de currículos e conexão com empresas parceiras de recrutamento'
                },
                title: 'Cria Currículo — Conectamos candidatos a empresas parceiras',
                description: 'Captação gratuita de currículos e conexão direta com empresas parceiras de recrutamento.'
            }
        },
    },

    blogPageConfig: {
        seo: {
            title: 'Blog | Currículo, Vagas e Recrutamento | Cria Currículo',
            description: 'Dicas para montar um currículo melhor, entender processos seletivos e se conectar com empresas parceiras de recrutamento.',
            themeColor: '#1e2237',
            canonical: 'https://criacurriculo.com.br/',
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
                author: 'Cria Currículo',
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
        gtmId: '', // TODO: preencher quando existir
    },

    verification: {
        googleSiteVerification: '', // TODO: preencher quando existir
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
