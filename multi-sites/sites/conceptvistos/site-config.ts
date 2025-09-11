import type { SiteConfig } from '../../core/lib/site-config.ts';

export const siteConfig: SiteConfig = {
  business_id: 'd4f5e6a7890b123c456d789e012f3456', // Concept Vistos business ID from database
  id: 'conceptvistos',
  domain: 'conceptvistos.com.br',
  name: 'Concept Vistos',
  description: 'Consultoria premium para vistos internacionais',
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  
  // Branding
  logo: '/logo.png',
  primaryColor: '#6366F1',
  secondaryColor: '#0F172A',
  
  // Contact
  contactEmail: 'contato@conceptvistos.com.br',
  phone: '+55 11 88888-8888',
  whatsapp: '+5511888888888',
  
  // Social
  socialMedia: {
    linkedin: 'https://linkedin.com/company/conceptvistos',
    instagram: 'https://instagram.com/conceptvistos'
  },
  
  // SEO
  seo: {
    title: 'Concept Vistos - Consultoria Premium para Vistos',
    description: 'Consultoria especializada em vistos para Estados Unidos, Canadá e Europa.',
    keywords: ['consultoria visto', 'concept vistos', 'visto premium'],
    ogImage: '/og-image.jpg'
  },
  
  // Features
  features: {
    blog: true,
    booking: true,
    payments: true,
    multilingual: true
  },
  
  // Styling
  customStyles: {
    cssVars: {
      '--primary-color': '#6366F1',
      '--secondary-color': '#0F172A',
      '--accent-color': '#8B5CF6'
    }
  }
};
