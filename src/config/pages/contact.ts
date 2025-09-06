import { baseSEOConfig } from '../seoConfig';
import { createPageSEO, type PageSEOConfig } from './pageConfig';

const contactPageConfig: PageSEOConfig = {
    title: 'Contato - Entre em Contato com a Fast Vistos',
    description:
        'Entre em contato com a Fast Vistos para esclarecimentos sobre vistos americanos, eTA do Canadá e México. Atendimento especializado para suas necessidades.',
    keywords: 'contato fast vistos, telefone fast vistos, email fast vistos, atendimento vistos',
    ogType: 'website',
    ogImage: baseSEOConfig.images.defaultOgImage,
    ogUrl: `${baseSEOConfig.site.url}/contato`,

    jsonLd: {
        webPage: {
            name: 'Contato - Entre em Contato com a Fast Vistos',
            description:
                'Entre em contato com a Fast Vistos para esclarecimentos sobre vistos americanos, eTA do Canadá e México.',
        },
    },
};

export const contactPageSEO = createPageSEO(baseSEOConfig, contactPageConfig);
