import type { SiteConfig } from '../../core/lib/site-config.ts';

export const siteConfig: SiteConfig = {
  business_id: 'd4f5e6a7890b123c456d789e012f3456', // Concept Vistos business ID from database
  id: 'fastvistos',
  domain: 'fastvistos.com.br',
  name: 'Fast Vistos',
  description: 'Assessoria completa para obtenção de vistos americanos',
  language: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  
  // Branding
  logo: '/logo.png',
  primaryColor: '#FF6B35',
  secondaryColor: '#1E3A8A',
  
  // Contact
  contactEmail: 'contato@fastvistos.com.br',
  phone: '+55 11 99999-9999',
  whatsapp: '+5511999999999',
  
  // Social
  socialMedia: {
    facebook: 'https://facebook.com/fastvistos',
    instagram: 'https://instagram.com/fastvistos',
    youtube: 'https://youtube.com/@fastvistos'
  },
  
  // SEO
  seo: {
    title: 'Fast Vistos - Assessoria para Visto Americano',
    description: 'Especialistas em assessoria para obtenção de visto americano.',
    keywords: ['visto americano', 'assessoria visto', 'fast vistos'],
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
      '--accent-color': '#F59E0B'
    }
  }
};
