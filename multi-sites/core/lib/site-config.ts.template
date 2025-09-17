/**
 * SITE CONFIG TEMPLATE (Documentation Only)
 *
 * This file is a template and documentation model for site configuration.
 *
 * - DO NOT use this file directly for your live site configuration.
 * - To configure a real site, COPY this file as `site-config.ts` into the root of your siteid folder (e.g. `/multi-sites/sites/your-siteid/site-config.ts`).
 * - You can also run the sync-blog.js script, which will copy this template to each site folder as `site-config.ts` if it does not exist.
 * - Fill in all fields with information specific to your website/project.
 * - All values here are placeholders and should be replaced with your actual business, branding, and SEO details.
 *
 * This template helps ensure consistency and best practices across all site configs.
 */
// 🌐 Shared Site Config (business + branding + global stuff)
export const siteConfig = {
    business: {
    business_id: 'your-business-id',
    id: 'your-site-id',
    domain: 'your-domain.com',
    name: 'Your Business Name',
    description: 'Your business description here',
    language: 'your-language-tag',
    useFullLanguageTag: true, // true/false
    currency: 'CURRENCY',
    timezone: 'Your/Timezone',
    },

    branding: {
        logo: '/path-to-logo.png',
        primaryColor: '#PRIMARY',
        secondaryColor: '#SECONDARY',
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
};

export const homePageConfig = {
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
    },
};

export const blogPageConfig = {
    seo: {
        title: 'Your Blog Title',
        description: 'Your blog description here.',
        keywords: ['blog', 'keyword1', 'keyword2'],
        ogImage: '/path-to-blog-og-image.jpg',
    },
    pagination: {
        postsPerPage: 10,
    }
};

export const blogPostConfig = {
    seoDefaults: {
        titleSuffix: '| Your Site',
        ogImage: '/path-to-default-post-og-image.jpg',
    },
    readingTime: true, // true/false
    showAuthor: true, // true/false
    relatedPosts: true, // true/false
};
