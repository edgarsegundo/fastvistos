// Page-specific SEO configuration interface
import type { SEOConfig } from '../seoConfig';

export interface PageSEOConfig {
    title: string;
    description: string;
    keywords?: string; // If not provided, uses base config keywords
    ogType?: string;
    ogImage?: string; // If not provided, uses base config default
    ogUrl?: string;
    canonicalUrl?: string; // If not provided, uses ogUrl or base site URL
    hreflang?: string; // Language/region code for this page

    // JSON-LD specific data for the page
    jsonLd?: {
        webPage?: {
            name: string;
            description: string;
        };
        services?: Array<{
            name: string;
            description: string;
            serviceType: string;
            areaServed: string[];
        }>;
    };
}

// Helper function to merge base config with page-specific config
export function createPageSEO(baseSEO: SEOConfig, pageConfig: PageSEOConfig) {
    return {
        // Meta tags data
        meta: {
            title: pageConfig.title,
            description: pageConfig.description,
            keywords: pageConfig.keywords || baseSEO.defaultKeywords,
            author: baseSEO.site.author,
            robots: baseSEO.site.robots,
            locale: baseSEO.site.locale,
            siteName: baseSEO.site.siteName,
            themeColor: baseSEO.site.themeColor,
            canonicalUrl: pageConfig.canonicalUrl || pageConfig.ogUrl || baseSEO.site.url,
            hreflang: pageConfig.hreflang || baseSEO.site.locale,
            googleSiteVerification: baseSEO.site.googleSiteVerification,
            googlebot: baseSEO.site.googlebot,
            bingbot: baseSEO.site.bingbot,
            geoRegion: baseSEO.site.geoRegion,
            geoCountry: baseSEO.site.geoCountry,
            geoPlacename: baseSEO.site.geoPlacename,
        },

        // Open Graph data
        openGraph: {
            type: pageConfig.ogType || 'website',
            title: pageConfig.title,
            description: pageConfig.description,
            url: pageConfig.ogUrl || baseSEO.site.url,
            image: pageConfig.ogImage || baseSEO.images.defaultOgImage,
            locale: baseSEO.site.locale,
            siteName: baseSEO.site.siteName,
        },

        // Twitter Card data
        twitter: {
            card: baseSEO.site.twitterCard,
            title: pageConfig.title,
            description: pageConfig.description,
            image: pageConfig.ogImage || baseSEO.images.defaultOgImage,
        },

        // JSON-LD data (if provided)
        jsonLd: pageConfig.jsonLd,

        // Base company data for JSON-LD components
        company: baseSEO.company,
        site: baseSEO.site,
        images: baseSEO.images,
    };
}
