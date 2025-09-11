import type { SiteConfig } from '../../core/lib/site-config.ts';

export const siteConfig: SiteConfig = {
  business_id: '5f75b88a1dd0e51527a449a13b0cc84f', // P2digital business ID - Update this with your actual business ID
  id: 'p2digital',
  domain: 'p2digital.com.br',
  name: 'P2digital',
  description: 'Professional services and consulting',
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  
  // Branding
  logo: '/logo.png',
  primaryColor: '#3B82F6', // Blue
  secondaryColor: '#1E40AF', // Dark blue
  
  // Contact
  contactEmail: 'contato@p2digital.com.br',
  phone: '+55 11 99999-9999',
  whatsapp: '+5511999999999',
  
  // Social
  socialMedia: {
    facebook: 'https://facebook.com/p2digital',
    instagram: 'https://instagram.com/p2digital',
    youtube: 'https://youtube.com/@p2digital'
  },
  
  // SEO
  seo: {
    title: 'P2digital - Professional Services',
    description: 'Professional services and consulting solutions.',
    keywords: ['p2digital', 'professional services', 'consulting'],
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
