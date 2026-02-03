// FastVistos Services Configuration
export const servicesData = [
    {
        id: 'b1b2',
        title: 'VISTO AMERICANO',
        subtitle: 'VISTO B1/B2 🇺🇸',
        description:
            'Se você precisa renovar seu visto americano, ou se está solicitando pela primeira vez, podemos te ajudar.',
        bullets: [
            'Antecipe sua entrevista consular',
            'Evite cometer erros no processo',
            'Deixe a burocracia conosco',
            'Prepare-se para a entrevista',
        ],
        image: '/images/servicos/visto-americano.jpg', // ajuste o caminho conforme necessário
        cta: {
            label: 'Solicitar',
            url: '/solicitar-visto-americano',
        },
        schema: {
            '@type': 'Service',
            name: 'Assessoria para Visto Americano',
            serviceType: 'Consultoria e assessoria para solicitação de visto americano B1/B2',
            description:
                'Acompanhamento completo para solicitação de vistos de turismo, estudo, trabalho e negócios para os EUA.',
            offers: {
                '@type': 'Offer',
                // price: 'Sob consulta', // ❌ Avoid using 'Sob consulta' if possible, better to leave it out or provide a numeric value
                priceCurrency: 'BRL',
            },
        },
    },
    {
        id: 'eta-canada',
        title: 'AUTORIZAÇÃO eTA CANADÁ',
        subtitle: 'eTA CANADÁ 🇨🇦',
        description:
            'Facilitamos o processo de obtenção da autorização eletrônica de viagem para o Canadá.',
        bullets: ['Processo 100% online', 'Acompanhamento até a aprovação', 'Suporte em português'],
        image: '/images/servicos/eta-canada.jpg',
        cta: {
            label: 'Solicitar',
            url: '/solicitar-eta-canada',
        },
        schema: {
            '@type': 'Service',
            name: 'Assessoria para eTA Canadá',
            serviceType: 'Consultoria e assessoria para obtenção da autorização eletrônica de viagem (eTA) para o Canadá',
            description:
                'Acompanhamento completo para obtenção da autorização eletrônica de viagem (eTA) para o Canadá.',
            offers: {
                '@type': 'Offer',
                // price: 'Sob consulta', // ❌ Avoid using 'Sob consulta' if possible, better to leave it out or provide a numeric value
                priceCurrency: 'BRL',
            },
        },
    },
    {
        id: 'visto-mexicano',
        title: 'VISTO MEXICANO',
        subtitle: 'VISTO MÉXICO 🇲🇽',
        description:
            'Auxiliamos na solicitação do visto mexicano para turismo, negócios ou estudos.',
        bullets: [
            'Documentação revisada por especialistas',
            'Agendamento consular',
            'Dicas para entrevista',
        ],
        image: '/images/servicos/visto-mexicano.jpg',
        cta: {
            label: 'Solicitar',
            url: '/solicitar-visto-mexicano',
        },
        schema: {
            '@type': 'Service',
            name: 'Assessoria para Visto Mexicano',
            serviceType: 'Consultoria e assessoria para solicitação de visto mexicano para turismo, negócios ou estudos',
            description:
                'Acompanhamento completo para solicitação de visto mexicano para turismo, negócios ou estudos.',
            offers: {
                '@type': 'Offer',
                // price: 'Sob consulta', // ❌ Avoid using 'Sob consulta' if possible, better to leave it out or provide a numeric value
                priceCurrency: 'BRL',
            },
        },
    },
    {
        id: 'rne',
        title: 'RNE',
        subtitle: 'REGISTRO NACIONAL DE ESTRANGEIROS',
        description:
            'Assessoria para estrangeiros que precisam regularizar sua situação no Brasil, renovação e emissão do RNE.',
        bullets: [
            'Documentação e orientações',
            'Agendamento e acompanhamento',
            'Suporte em todo o processo',
            'Regularização migratória',
        ],
        image: '/images/servicos/rne.webp',
        cta: {
            label: 'Solicitar',
            url: '/solicitar-rne',
        },
        schema: {
            '@type': 'Service',
            name: 'Assessoria para Registro Nacional de Estrangeiros (RNE)',
            serviceType: 'Consultoria e assessoria para regularização migratória e emissão/renovação do RNE no Brasil',
            description:
                'Acompanhamento completo para estrangeiros que precisam regularizar sua situação no Brasil, renovação e emissão do RNE.',
            offers: {
                '@type': 'Offer',
                priceCurrency: 'BRL',
            },
        },
    },
    {
        id: 'esta',
        title: 'ESTA',
        subtitle: 'AUTORIZAÇÃO ELETRÔNICA 🇺🇸',
        description:
            'Autorização eletrônica de viagem para os EUA. Facilita sua entrada sem necessidade de visto para turismo ou negócios.',
        bullets: [
            'Preenchimento do formulário',
            'Orientação sobre requisitos',
            'Suporte até a aprovação',
            'Válido por até 2 anos',
        ],
        image: '/images/servicos/esta.webp',
        cta: {
            label: 'Solicitar',
            url: '/solicitar-esta',
        },
        schema: {
            '@type': 'Service',
            name: 'Assessoria para ESTA (Autorização Eletrônica para os EUA)',
            serviceType: 'Consultoria e assessoria para obtenção da autorização eletrônica de viagem (ESTA) para os Estados Unidos',
            description:
                'Acompanhamento completo para obtenção da autorização eletrônica de viagem (ESTA) para os Estados Unidos, válida por até 2 anos.',
            offers: {
                '@type': 'Offer',
                priceCurrency: 'BRL',
            },
        },
    },
    {
        id: 'etias',
        title: 'ETIAS',
        subtitle: 'AUTORIZAÇÃO ELETRÔNICA 🇪🇺',
        description:
            'Autorização eletrônica para viagens à Europa. Sistema de pré-autorização para entrada nos países do Espaço Schengen.',
        bullets: [
            'Preenchimento do formulário',
            'Orientação sobre requisitos',
            'Suporte até a aprovação',
            'Válido por até 3 anos',
        ],
        image: '/images/servicos/etias.webp',
        cta: {
            label: 'Solicitar',
            url: '/solicitar-etias',
        },
        schema: {
            '@type': 'Service',
            name: 'Assessoria para ETIAS (Autorização Eletrônica para a Europa)',
            serviceType: 'Consultoria e assessoria para obtenção da autorização eletrônica de viagem (ETIAS) para o Espaço Schengen',
            description:
                'Acompanhamento completo para obtenção da autorização eletrônica de viagem (ETIAS) para entrada nos países do Espaço Schengen, válida por até 3 anos.',
            offers: {
                '@type': 'Offer',
                priceCurrency: 'BRL',
            },
        },
    },
    // Adicione outros serviços conforme necessário
];
