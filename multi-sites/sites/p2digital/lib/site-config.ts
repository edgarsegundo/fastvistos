// Core site configuration structure and helper functions
// This defines the standard interface that all sites must follow

export interface SiteConfig {
    // Basic Info
    business_id: string;
    id: string;
    domain: string;
    name: string;
    description: string;
    language: string;
    useFullLanguageTag?: boolean;  // Whether to use full language tag (pt-BR) or just language (pt) in HTML
    currency: string;
    timezone: string;

    // Branding
    logo: string;
    primaryColor: string;
    secondaryColor: string;

    // Site verification (Google, Bing, Yandex, Baidu, Pinterest, Facebook, etc)
    verification?: {
        googleSiteVerification?: string;
        bingSiteVerification?: string;
        pinterestSiteVerification?: string;
        facebookDomainVerification?: string;
    };

    // Contact
    contactEmail: string;
    phone: string;
    whatsapp: string;

    // Social
    socialMedia: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
        linkedin?: string;
        github?: string;
    };

    // SEO
    /**
     * SEO and Branding meta tags. All fields are optional except title, description, keywords, and ogImage.
     * Only add fields you need for your site/brand/app. See SEOMeta.astro for usage.
     */
    seo: {
        title: string;
        description: string;
        keywords: string[];
        author?: string;
        ogImage: string;
        ogImageWidth?: number | string; // Open Graph image width (optional)
        ogImageHeight?: number | string; // Open Graph image height (optional)
        ogImageAlt?: string; // Open Graph image alt text (optional)
        /**
         * Browser/OS/Branding meta tags (all optional, best-practice only):
         */
        // --- Optional Geo meta tags (legacy, rarely used by modern search engines) ---
        geoRegion?: string;    // <meta name="geo.region" content="BR">
        geoCountry?: string;   // <meta name="geo.country" content="Brazil">
        geoPlacename?: string; // <meta name="geo.placename" content="Brasil">
        themeColor?: string; // <meta name="theme-color">, browser UI color
        msTileColor?: string; // <meta name="msapplication-TileColor">, Windows tile color
        msTileConfig?: string; // <meta name="msapplication-config">, path to browserconfig.xml
        applicationName?: string; // <meta name="application-name">, app/site name for OS
        appleMobileWebAppCapable?: 'yes' | 'no'; // <meta name="apple-mobile-web-app-capable">
        appleMobileWebAppStatusBarStyle?: 'default' | 'black' | 'black-translucent'; // <meta name="apple-mobile-web-app-status-bar-style">
        formatDetection?: string; // <meta name="format-detection">, e.g. 'telephone=no'
    };

    // Analytics
    analytics?: {
        gtmId?: string;          // Google Tag Manager ID (e.g., 'GTM-59SRNCQD')
        gtagId?: string;         // Google Analytics GA4 ID (e.g., 'G-XXXXXXXXXX')
        facebookPixelId?: string; // Facebook Pixel ID
    };

    // Features
    features: {
        blog: boolean;
        booking: boolean;
        payments: boolean;
        multilingual: boolean;
    };

    // Styling
    customStyles: {
        cssVars: Record<string, string>;
    };
}
