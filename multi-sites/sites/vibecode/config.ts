// VibeCode site configuration
import { siteManager } from '../../core/lib/site-manager.js';

// Initialize site
siteManager.init('vibecode-lovable.com.br');

// Site-specific page configurations
export const HOME_CONFIG = {
  hero: {
    title: 'Desenvolvimento de Software Inovador',
    subtitle: 'Criamos soluções digitais que transformam ideias em realidade com tecnologias de ponta e design excepcional',
    ctaText: 'Começar Projeto',
    ctaLink: '#contato',
    backgroundImage: '/assets/images/cover/hero-vibecode.jpg'
  },
  services: [
    {
      id: 'desenvolvimento-web',
      title: 'Desenvolvimento Web',
      description: 'Aplicações web modernas e responsivas',
      icon: '💻',
      price: 'A partir de R$ 2.999',
      features: ['React/Next.js', 'TypeScript', 'Design responsivo', 'SEO otimizado']
    },
    {
      id: 'aplicativos-mobile',
      title: 'Aplicativos Mobile',
      description: 'Apps nativos e híbridos para iOS e Android',
      icon: '📱',
      price: 'A partir de R$ 4.999',
      features: ['React Native', 'Flutter', 'Publicação nas lojas', 'Manutenção inclusa']
    },
    {
      id: 'consultoria-tech',
      title: 'Consultoria Tecnológica',
      description: 'Arquitetura e estratégia de software',
      icon: '🚀',
      price: 'R$ 200/hora',
      features: ['Arquitetura de software', 'Code review', 'Mentoria técnica', 'DevOps']
    }
  ],
  technologies: [
    {
      name: 'React',
      icon: '⚛️',
      description: 'Biblioteca JavaScript para interfaces'
    },
    {
      name: 'Node.js',
      icon: '🟢',
      description: 'Runtime JavaScript para backend'
    },
    {
      name: 'TypeScript',
      icon: '🔷',
      description: 'JavaScript com tipagem estática'
    },
    {
      name: 'Python',
      icon: '🐍',
      description: 'Linguagem versátil para backend e IA'
    },
    {
      name: 'AWS',
      icon: '☁️',
      description: 'Infraestrutura em nuvem escalável'
    },
    {
      name: 'Docker',
      icon: '🐳',
      description: 'Containerização de aplicações'
    }
  ],
  testimonials: [
    {
      name: 'Rafael Lima',
      role: 'Startup Founder',
      content: 'A VibeCode transformou nossa ideia em um MVP incrível. Superaram todas as expectativas!',
      rating: 5,
      image: '/assets/images/testimonials/rafael-lima.jpg'
    },
    {
      name: 'Mariana Costa',
      role: 'Product Manager',
      content: 'Equipe técnica excepcional. Entregaram nosso app no prazo e com qualidade impecável.',
      rating: 5,
      image: '/assets/images/testimonials/mariana-costa.jpg'
    }
  ],
  faq: [
    {
      question: 'Quais tecnologias vocês utilizam?',
      answer: 'Trabalhamos com as tecnologias mais modernas do mercado: React, Node.js, TypeScript, Python, AWS, e muito mais.'
    },
    {
      question: 'Qual o prazo médio de desenvolvimento?',
      answer: 'Depende da complexidade do projeto. Um MVP simples leva de 4-6 semanas, projetos maiores podem levar 3-6 meses.'
    },
    {
      question: 'Vocês oferecem suporte pós-entrega?',
      answer: 'Sim, oferecemos pacotes de manutenção e suporte contínuo para garantir que sua aplicação funcione perfeitamente.'
    }
  ]
};

export const BLOG_CONFIG = {
  title: 'Blog VibeCode',
  description: 'Insights sobre desenvolvimento de software, tecnologias emergentes e tendências tech',
  categories: [
    'Desenvolvimento Web',
    'Mobile Development',
    'DevOps',
    'Arquitetura de Software',
    'Tecnologias Emergentes',
    'Tutorial'
  ]
};

export const SEO_CONFIG = {
  defaultTitle: 'VibeCode Lovable - Desenvolvimento de Software',
  titleTemplate: '%s | VibeCode',
  defaultDescription: 'Desenvolvimento de aplicações web e mobile, consultoria tecnológica e soluções digitais inovadoras.',
  keywords: ['desenvolvimento software', 'vibecode', 'aplicações web', 'consultoria tecnológica', 'react', 'node.js'],
  canonical: 'https://vibecode-lovable.com.br',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://vibecode-lovable.com.br',
    siteName: 'VibeCode Lovable',
    images: [
      {
        url: 'https://vibecode-lovable.com.br/assets/images/og/vibecode-og.jpg',
        width: 1200,
        height: 630,
        alt: 'VibeCode Lovable - Desenvolvimento de Software'
      }
    ]
  }
};
