import { baseSEOConfig } from '../seoConfig';
import { createPageSEO, type PageSEOConfig } from './pageConfig';

const aboutPageConfig: PageSEOConfig = {
    title: 'Sobre a Fast Vistos - Especialistas em Assessoria de Vistos',
    description:
        'Conheça a Fast Vistos, empresa especializada em processamento de vistos americanos, eTA do Canadá e vistos mexicanos. Nossa história e compromisso com você.',
    keywords:
        'sobre fast vistos, empresa vistos, história fast vistos, equipe especializada vistos',
    ogType: 'website',
    ogImage: baseSEOConfig.images.defaultOgImage,
    ogUrl: `${baseSEOConfig.site.url}/sobre`,

    jsonLd: {
        webPage: {
            name: 'Sobre a Fast Vistos - Especialistas em Assessoria de Vistos',
            description:
                'Conheça a Fast Vistos, empresa especializada em processamento de vistos americanos, eTA do Canadá e vistos mexicanos.',
        },
    },
};

export const aboutPageSEO = createPageSEO(baseSEOConfig, aboutPageConfig);
