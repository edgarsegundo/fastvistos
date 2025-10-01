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
        business_id: 'your-business-id',
        id: 'your-site-id',
        domain: 'your-domain.com',
        name: 'Your Business Name',
        description: 'Your business description here',
        language: 'your-language-tag',
        useFullLanguageTag: true, // true/false
        currency: 'CURRENCY',
        timezone: 'Your/Timezone',
        logo: '/path-to-logo.png',
        primaryColor: '#0070f3',
        secondaryColor: '#1c1c1e',
        author: 'Your Author Name', // Default author name for Open Graph
        thumbnailUrl: '/path-to-thumbnail.jpg', // Important for search and social previews
        image: 'https://fastvistos.com.br/assets/images/logo/logo-footer.png', // General image for the site
        datePublished: '2024-01-01T00:00:00Z', // ISO 8601 format
        dateModified: '2024-01-01T00:00:00Z', // ISO 8601 format
    },

    contact: {
        email: 'contact@yourdomain.com',
        whatsapp: '+1234567890',
    },

    socialMedia: {
        facebook: 'https://facebook.com/yourpage',
        twitter: '@yourtwitter',
        instagram: 'https://instagram.com/yourprofile',
        youtube: 'https://youtube.com/@yourchannel',
    },

    analytics: {
        gtmId: 'GTM-XXXXXXX',
    },

    verification: {
        googleSiteVerification: 'your-google-site-verification',
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

    homePageConfig: {
        seo: {
            title: 'Your Site Title',
            description: 'Your site description here.',
            keywords: ['keyword1', 'keyword2', 'keyword3'],
            themeColor: '#PRIMARY',
            msTileColor: '#PRIMARY',
            msTileConfig: '/browserconfig.xml',
            applicationName: 'Your App Name',
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
            title: 'Your Site Title',
            description: 'Your site description here.',
            keywords: ['keyword1', 'keyword2', 'keyword3'],
            ogImage: '/path-to-og-image.jpg',
            themeColor: '#PRIMARY',
            msTileColor: '#PRIMARY',
            msTileConfig: '/browserconfig.xml',
            applicationName: 'Your App Name',
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
            title: 'Your Site Title',
            description: 'Your site description here.',
            keywords: ['keyword1', 'keyword2', 'keyword3'],
            ogImage: '/path-to-og-image.jpg',
            themeColor: '#PRIMARY',
            msTileColor: '#PRIMARY',
            msTileConfig: '/browserconfig.xml',
            applicationName: 'Your App Name',
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