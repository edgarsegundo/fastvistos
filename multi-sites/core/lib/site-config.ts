// Core site configuration structure and helper functions
// This defines the standard interface that all sites must follow

export interface SiteConfig {
  // Basic Info
  id: string;
  domain: string;
  name: string;
  description: string;
  language: string;
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
      language: config.language
    };
  }

  static getCssVariables(config: SiteConfig): Record<string, string> {
    return {
      '--primary-color': config.primaryColor,
      '--secondary-color': config.secondaryColor,
      ...config.customStyles.cssVars
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
      socialMedia: config.socialMedia
    };
  }

  static getWhatsAppLink(config: SiteConfig, message?: string): string {
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return `https://wa.me/${config.whatsapp.replace(/\D/g, '')}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  }
}