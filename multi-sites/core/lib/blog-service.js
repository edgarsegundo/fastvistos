// blog-service.js
// JavaScript version of createBlogArticle for use in Node.js (CommonJS or ESM)
// Assumes prisma is imported from the correct location
// ┌───────────────────────────────────────────────────────────────┐
// │ Intended for use within api.js, our API running on the VPS    │
// └───────────────────────────────────────────────────────────────┘

import { prisma } from './prisma.js';

export class BlogService {
    /**
     * Get a blog article by its ID.
     * @param {string} id - The article ID
     * @returns {Promise<Object|null>} The article or null if not found
     */
    static async getBlogArticleById(id) {
        try {
            const article = await prisma.blog_article.findFirst({
                where: {
                    id,
                    is_removed: false,
                },
            });
            return article || null;
        } catch (error) {
            console.error('Error fetching blog article by ID:', error);
            return null;
        }
    }

    /**
     * Update the content_md field of a blog article by its ID.
     * @param {string} id - The article ID
     * @param {string} content_md - The new markdown content
     * @returns {Promise<Object>} The updated article
     */
    static async updateBlogArticleContentMd(id, content_md, main_image_url = null) {
        try {
            // Loga a URL do banco de dados (se disponível)
            console.log('[DEBUG] DATABASE_URL:', process.env.DATABASE_URL);
            // Loga o id e o novo conteúdo
            console.log('[DEBUG] Atualizando artigo:', { id, content_md: content_md?.slice?.(0, 100), main_image_url }); // Mostra só os 100 primeiros caracteres
            const updated = await prisma.blog_article.update({
                where: { id },
                data: {
                    content_md,
                    image: main_image_url, // Atualiza o campo de imagem SEO também
                    modified: new Date(),
                },
            });
            return updated;
        } catch (error) {
            console.error('Error updating blog article content_md:', error);
            throw error;
        }
    }

    /**
     * Atualiza o campo image de um artigo pelo ID.
     * @param {string} id - O ID do artigo
     * @param {string} imagePath - Caminho relativo da imagem (ex: images/business__slug.jpg)
     * @returns {Promise<Object>} O artigo atualizado
     */
    static async updateBlogArticleImage(id, imagePath) {
        try {
            const updated = await prisma.blog_article.update({
                where: { id },
                data: {
                    image: imagePath,
                    modified: new Date(),
                },
            });
            return updated;
        } catch (error) {
            console.error('Erro ao atualizar imagem do artigo:', error);
            throw error;
        }
    }

    // Optionally, you can implement a getBusinessId() if needed
    static getBusinessId() {
        throw new Error('getBusinessId() not implemented. Pass business_id explicitly.');
    }

    /**
     * Create a new business.
     * @param {Object} data - Business fields (name, display_name, canonical_domain, email, phone fields)
     * @returns {Promise<Object>} The created business record.
     */
    static async createBusiness(data) {
        try {
            const crypto = await import('crypto');
            const uuid = crypto.randomUUID().replace(/-/g, ''); // 32 hex chars, no hyphens
            
            const businessData = {
                id: uuid,
                name: data.name,
                display_name: data.display_name,
                canonical_domain: data.canonical_domain,
                created: new Date(),
                modified: new Date(),
                is_removed: false,
            };
            
            // Add optional fields if provided
            if (data.email) businessData.email = data.email;
            if (data.phone1_country_code) businessData.phone1_country_code = data.phone1_country_code;
            if (data.phone1_area_code) businessData.phone1_area_code = data.phone1_area_code;
            if (data.phone1_number) businessData.phone1_number = data.phone1_number;
            
            const business = await prisma.business.create({
                data: businessData
            });
            
            return business;
        } catch (error) {
            console.error('Error creating business:', error);
            throw error;
        }
    }

    /**
     * Create a new blog article.
     * @param {Object} data - All required fields for creation.
     * @returns {Promise<Object>} The created blog_article record.
     */
    static async createBlogArticle(data) {
        try {
            const now = new Date();
            const businessId = data.business_id || this.getBusinessId();
            // Garante id válido
            let id = data.id;
            if (!id || typeof id !== 'string' || id === 'String') {
                const crypto = await import('crypto');
                id = crypto.randomUUID().replace(/-/g, '');
            }
            const articleData = {
                id,
                created: now,
                modified: now,
                is_removed: false,
                title: data.title,
                content_md: data.content_md,
                type: data.type,
                slug: data.slug,
                published: data.published,
                image: data.image,
                business_id: businessId,
                blog_topic_id: data.blog_topic_id,
                seo_description: data.seo_description ?? null,
                seo_image_caption: data.seo_image_caption ?? null,
                seo_image_height: data.seo_image_height ?? null,
                seo_image_width: data.seo_image_width ?? null,
                faq_json: Array.isArray(data.faq_json) ? data.faq_json : [],
                most_read: data.most_read ?? false,
                show_in_hero: data.show_in_hero ?? false,
            };
            // Log para debug
            console.log('[DEBUG] Dados enviados para prisma.blog_article.create:', JSON.stringify(articleData, null, 2));
            const article = await prisma.blog_article.create({ data: articleData });
            return article;
        } catch (error) {
            console.error('Error creating blog article:', error);
            throw error;
        }
    }

    /**
     * Get articles by topicId with offset and limit (for dynamic carousel loading)
    * @param {string} [businessId] - Pass explicitly if not using getBusinessId() 
    * @param {string} topicId
     * @param {number} [offset=0]
     * @param {number} [limit=5]
     * @returns {Promise<Array>} Array of articles
     */
    static async getArticlesByTopicIdWithOffset(businessId, topicId, offset = 0, limit = 5) {
        try {
            // Use explicit businessId if provided, otherwise fallback to class method
            const resolvedBusinessId = businessId || (typeof this.getBusinessId === 'function' ? this.getBusinessId() : undefined);
            const now = new Date();
            return await prisma.blog_article.findMany({
                where: {
                    business_id: resolvedBusinessId,
                    blog_topic_id: topicId,
                    is_removed: false,
                    published: {
                        lte: now,
                    },
                },
                orderBy: {
                    published: 'desc',
                },
                skip: offset,
                take: limit,
            });
        } catch (error) {
            console.error('Error fetching articles by topicId with offset:', error);
            return [];
        }
    }

    /**
     * Get the article to show in the hero section (show_in_hero = true).
     * Returns the most recent published article with show_in_hero, or null if none.
     * @param {string} businessId - Pass explicitly (required)
     * @returns {Promise<Object|null>} The article or null
     */
    static async getShowInHeroArticle(businessId) {
        try {
            const now = new Date();
            const article = await prisma.blog_article.findFirst({
                where: {
                    business_id: businessId,
                    is_removed: false,
                    show_in_hero: true,
                    published: {
                        lte: now,
                    },
                },
                orderBy: {
                    published: 'desc',
                },
                include: {
                    blog_topic: true,
                },
            });
            return article || null;
        } catch (error) {
            console.error('Error fetching show_in_hero article:', error);
            return null;
        }
    }

    /**
     * Update image-related fields on a blog article (local dev only).
     * @param {string} businessId
     * @param {string} slug
     * @param {Object} data - Any subset of: image, seo_image_url, seo_image_caption, seo_image_width, seo_image_height
     * @returns {Promise<{count: number}>}
     */
    static async updateArticleImage(businessId, slug, data) {
        try {
            const updateData = { modified: new Date() };
            if (data.image !== undefined)             updateData.image = data.image;
            if (data.seo_image_url !== undefined)     updateData.seo_image_url = data.seo_image_url;
            if (data.seo_image_caption !== undefined) updateData.seo_image_caption = data.seo_image_caption;
            if (data.seo_image_width !== undefined)   updateData.seo_image_width = data.seo_image_width;
            if (data.seo_image_height !== undefined)  updateData.seo_image_height = data.seo_image_height;

            const result = await prisma.blog_article.updateMany({
                where: { slug, business_id: businessId, is_removed: false },
                data: updateData,
            });
            return result; // { count: number }
        } catch (error) {
            console.error('Error updating article image:', error);
            throw error;
        }
    }

    /**
     * Busca um blog_topic pelo slug e business_id
     * @param {string} slug
     * @param {string} businessId
     * @returns {Promise<Object|null>} O tópico encontrado ou null
     */
    static async getBlogTopicBySlug(slug, businessId) {
        try {
            const topic = await prisma.blog_topic.findFirst({
                where: {
                    slug,
                    business_id: businessId,
                    is_removed: false
                }
            });
            return topic || null;
        } catch (error) {
            console.error('Erro ao buscar blog_topic por slug:', error);
            return null;
        }
    }

    /**
     * Busca imagens do blog filtradas por group, com paginação por offset/limit.
     *
     * @param {string} group      - O group a filtrar (obrigatório)
     * @param {number} offset     - Quantos registros pular (default 0)
     * @param {number} limit      - Quantos registros retornar por página (default 24)
     * @returns {Promise<{ images: Array, total: number }>}
     *
     * O campo `image` é o path relativo gravado pelo Django (ex: "blog/images/foo.webp").
     * O frontend é responsável por montar a URL absoluta prefixando com MEDIA_BASE.
     */
    static async getBlogImagesByGroup(group, offset = 0, limit = 24) {
        console.log(`[DEBUG] getBlogImagesByGroup called with group="${group}", offset=${offset}, limit=${limit}`);
        if (!group) throw new Error('group é obrigatório');
        try {
            const where = { group };
            const [images, total] = await Promise.all([
                prisma.blog_image.findMany({
                    where,
                    orderBy: { modified: 'desc' },
                    skip: offset,
                    take: limit,
                    select: {
                        id:       true,
                        filename: true,
                        image:    true,
                        alt:      true,
                        group:    true,
                        slug:     true,
                        modified: true,
                    },
                }),
                prisma.blog_image.count({ where }),
            ]);
            return { images, total };
        } catch (error) {
            console.error('Erro ao buscar imagens por group:', error);
            throw error;
        }
    }


}
