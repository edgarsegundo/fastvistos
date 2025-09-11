import type { SiteConfig } from '../../core/lib/site-config.ts';

export const siteConfig: SiteConfig = {
  business_id: '{{BUSINESS_ID}}', // {{SITE_NAME}} business ID - Update this with your actual business ID
  id: '{{SITE_ID}}',
  domain: '{{DOMAIN}}',
  name: '{{SITE_NAME}}',
  description: 'Professional services and consulting',
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  
  // Branding
  logo: '/logo.png',
  primaryColor: '#3B82F6', // Blue
  secondaryColor: '#1E40AF', // Dark blue
  
  // Contact
  contactEmail: 'contato@{{DOMAIN}}',
  phone: '+55 11 99999-9999',
  whatsapp: '+5511999999999',
  
  // Social
  socialMedia: {
    facebook: 'https://facebook.com/{{SITE_ID}}',
    instagram: 'https://instagram.com/{{SITE_ID}}',
    youtube: 'https://youtube.com/@{{SITE_ID}}'
  },
  
  // SEO
  seo: {
    title: '{{SITE_NAME}} - Professional Services',
    description: 'Professional services and consulting solutions.',
    keywords: ['{{SITE_ID}}', 'professional services', 'consulting'],
    ogImage: '/og-image.jpg'
  },
  
  // Features
  features: {
    blog: true,
    booking: true,
    payments: true,
    multilingual: false
  },
  
  // Styling
  customStyles: {
    cssVars: {
      '--accent-color': '#10B981'
    }
  }
};
