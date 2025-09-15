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
    seo: {
        title: string;
        description: string;
        keywords: string[];
        ogImage: string;
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
