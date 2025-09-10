// FastVistos site configuration
import { siteManager } from '../../core/lib/site-manager.js';

// Initialize site
siteManager.init('fastvistos.com.br');

// Site-specific page configurations
export const HOME_CONFIG = {
  hero: {
    title: 'Seu Visto Americano Aprovado',
    subtitle: 'Assessoria completa e especializada para obtenção do seu visto americano com alta taxa de aprovação',
    ctaText: 'Quero Meu Visto',
    ctaLink: '#contato',
    backgroundImage: '/assets/images/cover/hero-fastvistos.jpg'
  },
  services: [
    {
      id: 'visto-turismo',
      title: 'Visto de Turismo',
      description: 'Assessoria completa para visto B1/B2',
      icon: '✈️',
      price: 'A partir de R$ 599',
      features: ['Análise de perfil', 'Preenchimento do DS-160', 'Preparação para entrevista', 'Suporte até a aprovação']
    },
    {
      id: 'visto-trabalho',
      title: 'Visto de Trabalho',
      description: 'Vistos H1B, L1, O1 e outros',
      icon: '💼',
      price: 'Consulte',
      features: ['Análise especializada', 'Documentação completa', 'Acompanhamento jurídico', 'Suporte pós-aprovação']
    },
    {
      id: 'visto-estudante',
      title: 'Visto de Estudante',
      description: 'Vistos F1 e M1 para estudos',
      icon: '🎓',
      price: 'A partir de R$ 799',
      features: ['Orientação SEVIS', 'Documentação acadêmica', 'Preparação financeira', 'Treinamento para entrevista']
    }
  ],
  testimonials: [
    {
      name: 'Maria Silva',
      role: 'Empresária',
      content: 'Excelente atendimento! Consegui meu visto americano na primeira tentativa.',
      rating: 5,
      image: '/assets/images/testimonials/maria-silva.jpg'
    },
    {
      name: 'João Santos',
      role: 'Engenheiro',
      content: 'Profissionais muito competentes. Recomendo a todos!',
      rating: 5,
      image: '/assets/images/testimonials/joao-santos.jpg'
    }
  ],
  faq: [
    {
      question: 'Qual a taxa de aprovação da Fast Vistos?',
      answer: 'Nossa taxa de aprovação é superior a 95% para perfis adequadamente preparados.'
    },
    {
      question: 'Quanto tempo demora o processo?',
      answer: 'O processo completo leva de 2 a 4 semanas, dependendo da disponibilidade de agendamento no consulado.'
    },
    {
      question: 'Vocês garantem a aprovação?',
      answer: 'Oferecemos consultoria especializada que maximiza suas chances, mas a decisão final é sempre do consulado americano.'
    }
  ]
};

export const BLOG_CONFIG = {
  title: 'Blog Fast Vistos',
  description: 'Dicas, notícias e informações sobre vistos americanos',
  categories: [
    'Visto Americano',
    'Entrevista Consular',
    'Documentação',
    'Dicas de Viagem',
    'Legislação'
  ]
};

export const SEO_CONFIG = {
  defaultTitle: 'Fast Vistos - Assessoria para Visto Americano',
  titleTemplate: '%s | Fast Vistos',
  defaultDescription: 'Especialistas em assessoria para obtenção de visto americano. Processo rápido, seguro e com alta taxa de aprovação.',
  keywords: ['visto americano', 'assessoria visto', 'fast vistos', 'visto EUA', 'consultoria visto'],
  canonical: 'https://fastvistos.com.br',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://fastvistos.com.br',
    siteName: 'Fast Vistos',
    images: [
      {
        url: 'https://fastvistos.com.br/assets/images/og/fastvistos-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Fast Vistos - Assessoria para Visto Americano'
      }
    ]
  }
};
