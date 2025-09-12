import type { SiteConfig } from './site-config.ts';

// Helper functions that work with any SiteConfig
export class SiteConfigHelper {
    static getMetadata(config: SiteConfig, pageTitle?: string, pageDescription?: string) {
        return {
            title: pageTitle ? `${pageTitle} | ${config.name}` : config.seo.title,
            description: pageDescription || config.seo.description,
            keywords: config.seo.keywords.join(', '),
            ogImage: config.seo.ogImage,
            siteName: config.name,
            domain: config.domain,
            language: config.language,
        };
    }

    static getCssVariables(config: SiteConfig): Record<string, string> {
        return {
            '--primary-color': config.primaryColor,
            '--secondary-color': config.secondaryColor,
            ...config.customStyles.cssVars,
        };
    }

    static hasFeature(config: SiteConfig, feature: keyof SiteConfig['features']): boolean {
        return config.features[feature];
    }

    static getContactInfo(config: SiteConfig) {
        return {
            email: config.contactEmail,
            phone: config.phone,
            whatsapp: config.whatsapp,
            socialMedia: config.socialMedia,
        };
    }

    static getWhatsAppLink(config: SiteConfig, message?: string): string {
        const encodedMessage = message ? encodeURIComponent(message) : '';
        return `https://wa.me/${config.whatsapp.replace(/\D/g, '')}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
    }
}
