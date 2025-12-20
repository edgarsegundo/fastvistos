// blog-service.js
// JavaScript version of createBlogArticle for use in Node.js (CommonJS or ESM)
// Assumes prisma is imported from the correct location
// ┌───────────────────────────────────────────────────────────────┐
// │ Intended for use within api.js, our API running on the VPS    │
// └───────────────────────────────────────────────────────────────┘

import { prisma } from './prisma.js';

export class BlogService {
    // Optionally, you can implement a getBusinessId() if needed
    static getBusinessId() {
        throw new Error('getBusinessId() not implemented. Pass business_id explicitly.');
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
            const article = await prisma.blog_article.create({
                data: {
                    id: data.id,
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
                    seo_description: data.seo_description,
                    seo_image_caption: data.seo_image_caption,
                    seo_image_height: data.seo_image_height,
                    seo_image_width: data.seo_image_width,
                    faq_json: [],
                    most_read: data.most_read ?? false,
                    show_in_hero: data.show_in_hero ?? false,
                }
            });
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
}
