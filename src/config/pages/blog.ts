import { baseSEOConfig } from '../seoConfig';
import { createPageSEO, type PageSEOConfig } from './pageConfig';

const blogPageConfig: PageSEOConfig = {
    title: 'Blog - Dicas e Informações sobre Vistos | Fast Vistos',
    description:
        'Mantenha-se atualizado com dicas, informações e novidades sobre vistos americanos, eTA do Canadá e México. Guias práticos e atualizações oficiais.',
    keywords:
        'blog vistos, dicas visto americano, informações eTA canadá, novidades vistos, guias visto méxico',
    ogType: 'website',
    ogImage: baseSEOConfig.images.blogImage,
    ogUrl: `${baseSEOConfig.site.url}/blog`,

    jsonLd: {
        webPage: {
            name: 'Blog - Dicas e Informações sobre Vistos',
            description:
                'Mantenha-se atualizado com dicas, informações e novidades sobre vistos americanos, eTA do Canadá e México.',
        },
    },
};

export const blogPageSEO = createPageSEO(baseSEOConfig, blogPageConfig);
