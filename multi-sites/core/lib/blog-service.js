// blog-service.js
// JavaScript version of createBlogArticle for use in Node.js (CommonJS or ESM)
// Assumes prisma is imported from the correct location

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
                    // faq_json: data.faq_json,
                }
            });
            return article;
        } catch (error) {
            console.error('Error creating blog article:', error);
            throw error;
        }
    }
}
