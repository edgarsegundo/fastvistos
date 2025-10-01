import type { SiteConfig } from './lib/site-config-model.ts';

// 🌐 Shared Site Config (site + branding + global stuff)
export const siteConfig: SiteConfig = {
    site: {
        business_id: '41a5c7f95e924d54b120ab9a0e1843c8',
        id: 'fastvistos',
        domain: 'fastvistos.com.br',
        name: 'Fast Vistos',
        description: 'Fast Vistos - Your fast visa solution',
        language: 'pt-BR',
        useFullLanguageTag: true, // true/false
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        logo: 'https://fastvistos.com.br/assets/images/logo/logo-footer.png',
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        author: 'Edgar Rezende',
        thumbnailUrl: 'https://fastvistos.com.br/assets/images/logo/logo-footer.png', // Important for search and social previews
        image: 'https://fastvistos.com.br/assets/images/logo/logo-footer.png', // General image for the site
        assets_url_base: 'https://your-domain.com/assets/', // Base URL for images used in blog posts and other content
        datePublished: '2024-01-01T00:00:00Z', // ISO 8601 format
        dateModified: '2024-01-01T00:00:00Z', // ISO 8601 format
        address: {
            streetAddress: 'Av. Paulista, 1000',
            addressLocality: 'São Paulo',
            addressRegion: 'SP',
            postalCode: '01310-100',
            addressCountry: 'BR',
        },
        contactPoint: {
            telephone: '+5511999999999',
            contactType: 'Customer Service',
            areaServed: 'BR',
            availableLanguage: ['Portuguese', 'English'],
            email: 'support@fastvistos.com.br',
        },
        socialMedia: {
            facebook: 'https://facebook.com/yourpage',
            twitter: '@yourtwitter',
            instagram: 'https://instagram.com/yourprofile',
            youtube: 'https://youtube.com/@yourchannel',
        },
    },

    homePageConfig: {
        seo: {
            title: 'Fast Vistos - Your fast visa solution',
            description: 'Fast Vistos - Your fast visa solution',
            keywords: ['fast vistos', 'visa', 'fast visa solution'],
            ogImage: '/path-to-og-image.jpg',
            ogImageWidth: 1200,
            ogImageHeight: 630,
            ogImageType: 'image/jpeg',
            ogImageAlt: 'Your Image Alt Text',
            themeColor: '#0070f3',
            msTileColor: '#0070f3',
            msTileConfig: '/browserconfig.xml',
            applicationName: 'Fast Vistos',
            appleMobileWebAppCapable: 'yes',
            appleMobileWebAppStatusBarStyle: 'default',
            formatDetection: 'telephone=no',
            geoRegion: 'XX',
            geoCountry: 'Country',
            geoPlacename: 'Placename',
            openGraph: {
                type: 'website', // Default type for Open Graph
                locale: 'your-language-tag', // e.g. en_US
                author: 'your-author-name', // Default author name
                publishedTime: '2024-01-01T00:00:00Z', // Default published time
                modifiedTime: '2024-01-01T00:00:00Z', // Default modified time
                section: 'your-section', // Default section
                tags: ['tag1', 'tag2'], // Default tags
                image: '/path-to-og-image.jpg',
                imageWidth: 1200,
                imageHeight: 630,
                imageType: 'image/jpeg',
                imageAlt: 'Your Image Alt Text',
            },
        },
    },

    blogPageConfig: {
        seo: {
            title: 'Fast Vistos - Your fast visa solution',
            description: 'Fast Vistos - Your fast visa solution',
            keywords: ['fast vistos', 'visa', 'fast visa solution'],
            ogImage: '/path-to-og-image.jpg',
            themeColor: '#0070f3',
            msTileColor: '#0070f3',
            msTileConfig: '/browserconfig.xml',
            applicationName: 'Fast Vistos',
            appleMobileWebAppCapable: 'yes',
            appleMobileWebAppStatusBarStyle: 'default',
            formatDetection: 'telephone=no',
            geoRegion: 'XX',
            geoCountry: 'Country',
            geoPlacename: 'Placename',
            openGraph: {
                type: 'blog', // Default type for Open Graph
                locale: 'your-language-tag', // e.g. en_US
                author: 'your-author-name', // Default author name
                publishedTime: '2024-01-01T00:00:00Z', // Default published time
                modifiedTime: '2024-01-01T00:00:00Z', // Default modified time
                section: 'your-section', // Default section
                tags: ['tag1', 'tag2'], // Default tags
                image: '/path-to-og-image.jpg',
                imageWidth: 1200,
                imageHeight: 630,
                imageType: 'image/jpeg',
                imageAlt: 'Your Image Alt Text',
            },
        },
        pagination: {
            postsPerPage: 10,
        },
    },

    blogPostConfig: {
        seo: {
            title: 'Fast Vistos - Your fast visa solution',
            description: 'Fast Vistos - Your fast visa solution',
            keywords: ['fast vistos', 'visa', 'fast visa solution'],
            ogImage: '/path-to-og-image.jpg',
            themeColor: '#0070f3',
            msTileColor: '#0070f3',
            msTileConfig: '/browserconfig.xml',
            applicationName: 'Fast Vistos',
            appleMobileWebAppCapable: 'yes',
            appleMobileWebAppStatusBarStyle: 'default',
            formatDetection: 'telephone=no',
            geoRegion: 'XX',
            geoCountry: 'Country',
            geoPlacename: 'Placename',
            openGraph: {
                type: 'article', // Default type for Open Graph
                locale: 'your-language-tag', // e.g. en_US
                author: 'your-author-name', // Default author name
                publishedTime: '2024-01-01T00:00:00Z', // Default published time
                modifiedTime: '2024-01-01T00:00:00Z', // Default modified time
                section: 'your-section', // Default section
                tags: ['tag1', 'tag2'], // Default tags
                image: '/path-to-og-image.jpg',
                imageWidth: 1200,
                imageHeight: 630,
                imageType: 'image/jpeg',
                imageAlt: 'Your Image Alt Text',
            },
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
        googleSiteVerification: 'wPmMtzby8Xpg',
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


