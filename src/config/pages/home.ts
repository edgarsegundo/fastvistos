import { baseSEOConfig } from '../seoConfig';
import { createPageSEO, type PageSEOConfig } from './pageConfig';

const homePageConfig: PageSEOConfig = {
    title: 'Visto Americano B1/B2, eTA Canadá e México | Fast Vistos',
    description:
        'Obtenha seu visto americano, eTA do Canadá ou visto para o México com a Fast Vistos. Suporte especializado e sem complicação!',
    keywords:
        'visto americano, eTA canadá, visto méxico, assessoria visto, fast vistos, visto EUA, visto B1 B2',
    ogType: 'website',
    ogImage: baseSEOConfig.images.homePageImage,
    ogUrl: baseSEOConfig.site.url,

    jsonLd: {
        webPage: {
            name: 'Visto Americano B1/B2, eTA Canadá e México | Fast Vistos',
            description:
                'Obtenha seu visto americano, eTA do Canadá ou visto para o México com a Fast Vistos. Suporte especializado e sem complicação!',
        },
        services: [
            {
                name: 'Processamento de Vistos Americanos',
                description:
                    'Serviço completo de assessoria para obtenção de vistos americanos B1/B2',
                serviceType: 'VisaProcessing',
                areaServed: ['BR', 'Brasil'],
            },
            {
                name: 'eTA Canadá',
                description: 'Processamento de eTA (Electronic Travel Authorization) para o Canadá',
                serviceType: 'eTAProcessing',
                areaServed: ['BR', 'Brasil'],
            },
            {
                name: 'Visto México',
                description: 'Assessoria para obtenção de vistos mexicanos',
                serviceType: 'VisaProcessing',
                areaServed: ['BR', 'Brasil'],
            },
        ],
    },
};

export const homePageSEO = createPageSEO(baseSEOConfig, homePageConfig);
