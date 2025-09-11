import type { SiteConfig } from '../../core/lib/site-config.ts';

export const siteConfig: SiteConfig = {
  id: 'vibecode',
  domain: 'vibecode-lovable.com.br',
  name: 'VibeCode Lovable',
  description: 'Desenvolvimento de software e consultoria tecnológica',
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  
  // Branding
  logo: '/logo.png',
  primaryColor: '#10B981',
  secondaryColor: '#374151',
  
  // Contact
  contactEmail: 'contato@vibecode-lovable.com.br',
  phone: '+55 11 77777-7777',
  whatsapp: '+5511777777777',
  
  // Social
  socialMedia: {
    github: 'https://github.com/vibecode',
    linkedin: 'https://linkedin.com/company/vibecode',
    youtube: 'https://youtube.com/@vibecode'
  },
  
  // SEO
  seo: {
    title: 'VibeCode Lovable - Desenvolvimento de Software',
    description: 'Desenvolvimento de aplicações web e mobile, consultoria tecnológica.',
    keywords: ['desenvolvimento software', 'vibecode', 'aplicações web'],
    ogImage: '/og-image.jpg'
  },
  
  // Features
  features: {
    blog: true,
    booking: false,
    payments: false,
    multilingual: false
  },
  
  // Styling
  customStyles: {
    cssVars: {
      '--primary-color': '#10B981',
      '--secondary-color': '#374151',
      '--accent-color': '#06B6D4'
    }
  }
};
