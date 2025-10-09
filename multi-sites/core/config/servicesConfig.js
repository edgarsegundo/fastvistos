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
            description:
                'Acompanhamento completo para solicitação de vistos de turismo, estudo, trabalho e negócios para os EUA.',
            offers: {
                '@type': 'Offer',
                price: 'Sob consulta',
                priceCurrency: 'BRL',
                availability: 'https://schema.org/Available',
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
            description:
                'Acompanhamento completo para obtenção da autorização eletrônica de viagem (eTA) para o Canadá.',
            offers: {
                '@type': 'Offer',
                price: 'Sob consulta',
                priceCurrency: 'BRL',
                availability: 'https://schema.org/Available',
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
            description:
                'Acompanhamento completo para solicitação de visto mexicano para turismo, negócios ou estudos.',
            offers: {
                '@type': 'Offer',
                price: 'Sob consulta',
                priceCurrency: 'BRL',
                availability: 'https://schema.org/Available',
            },
        },
    },
    // Adicione outros serviços conforme necessário
];
