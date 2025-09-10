// ConceptVistos site configuration
import { siteManager } from '../../core/lib/site-manager.js';

// Initialize site
siteManager.init('conceptvistos.com.br');

// Site-specific page configurations
export const HOME_CONFIG = {
  hero: {
    title: 'Consultoria Premium para Vistos',
    subtitle: 'Atendimento exclusivo e personalizado para obtenção de vistos internacionais com máxima eficiência',
    ctaText: 'Consultoria Exclusiva',
    ctaLink: '#contato',
    backgroundImage: '/assets/images/cover/hero-conceptvistos.jpg'
  },
  services: [
    {
      id: 'consultoria-premium',
      title: 'Consultoria Premium',
      description: 'Atendimento VIP com consultor dedicado',
      icon: '👑',
      price: 'A partir de R$ 1.499',
      features: ['Consultor dedicado', 'Atendimento 24/7', 'Processo acelerado', 'Garantia de reembolso']
    },
    {
      id: 'vistos-internacionais',
      title: 'Vistos Internacionais',
      description: 'EUA, Canadá, Europa e outros destinos',
      icon: '🌍',
      price: 'Consulte',
      features: ['Múltiplos destinos', 'Análise comparativa', 'Melhor estratégia', 'Suporte multilíngue']
    },
    {
      id: 'empresarial',
      title: 'Soluções Empresariais',
      description: 'Vistos corporativos e de negócios',
      icon: '🏢',
      price: 'Pacotes customizados',
      features: ['Múltiplos funcionários', 'Gestão centralizada', 'Relatórios executivos', 'SLA garantido']
    }
  ],
  testimonials: [
    {
      name: 'Dr. Carlos Mendes',
      role: 'CEO, Tech Corp',
      content: 'Excelência em todos os aspectos. Conseguimos vistos para toda nossa equipe sem complicações.',
      rating: 5,
      image: '/assets/images/testimonials/carlos-mendes.jpg'
    },
    {
      name: 'Ana Paula Rodrigues',
      role: 'Executiva',
      content: 'Atendimento impecável e resultados garantidos. Recomendo sem hesitação.',
      rating: 5,
      image: '/assets/images/testimonials/ana-paula.jpg'
    }
  ],
  faq: [
    {
      question: 'O que diferencia a Concept Vistos?',
      answer: 'Oferecemos atendimento premium com consultores dedicados e processo acelerado para clientes que valorizam excelência.'
    },
    {
      question: 'Vocês atendem empresas?',
      answer: 'Sim, temos soluções corporativas completas para empresas que precisam de vistos para seus funcionários.'
    },
    {
      question: 'Qual o prazo para atendimento?',
      answer: 'Nossos clientes premium recebem atendimento imediato, com SLA de resposta em até 2 horas.'
    }
  ]
};

export const BLOG_CONFIG = {
  title: 'Blog Concept Vistos',
  description: 'Insights exclusivos sobre vistos internacionais e tendências migratórias',
  categories: [
    'Vistos Premium',
    'Tendências Migratórias',
    'Negócios Internacionais',
    'Legislação Internacional',
    'Casos de Sucesso'
  ]
};

export const SEO_CONFIG = {
  defaultTitle: 'Concept Vistos - Consultoria Premium para Vistos',
  titleTemplate: '%s | Concept Vistos',
  defaultDescription: 'Consultoria especializada em vistos para Estados Unidos, Canadá e Europa. Atendimento personalizado e resultados garantidos.',
  keywords: ['consultoria visto', 'concept vistos', 'visto premium', 'visto internacional', 'consultoria migratória'],
  canonical: 'https://conceptvistos.com.br',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://conceptvistos.com.br',
    siteName: 'Concept Vistos',
    images: [
      {
        url: 'https://conceptvistos.com.br/assets/images/og/conceptvistos-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Concept Vistos - Consultoria Premium para Vistos'
      }
    ]
  }
};
