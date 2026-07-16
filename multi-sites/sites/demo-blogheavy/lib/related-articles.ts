import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RelatedArticlesService {
        /**
     * Get related articles for a given blog post
     * @param articleId The ID of the blog article
     * @param limit Maximum number of related articles to return (default: 6)
     * @returns Array of related blog articles
     */
    static async getRelatedArticles(articleId: string, limit = 6) {
        try {
            // Use the simpler approach which handles Django's symmetrical relationships better
            return await this.getRelatedArticlesSimple(articleId).then(articles => 
                articles.slice(0, limit)
            );

        } catch (error) {
            console.error('Error fetching related articles:', error);
            return [];
        }
    }

    /**
     * Get related articles with simpler query (alternative approach)
     * This handles Django's symmetrical ManyToManyField properly
     */
    static async getRelatedArticlesSimple(articleId: string) {
        // First, get all relationship records where this article is involved
        const relationships = await prisma.blog_article_related_articles.findMany({
            where: {
                OR: [
                    { from_blogarticle_id: articleId },
                    { to_blogarticle_id: articleId }
                ]
            }
        });

        if (relationships.length === 0) {
            return [];
        }

        // Collect all related article IDs
        const relatedArticleIds = new Set<string>();
        
        for (const rel of relationships) {
            if (rel.from_blogarticle_id === articleId) {
                relatedArticleIds.add(rel.to_blogarticle_id);
            } else if (rel.to_blogarticle_id === articleId) {
                relatedArticleIds.add(rel.from_blogarticle_id);
            }
        }

        // Remove the original article ID if it somehow got included
        relatedArticleIds.delete(articleId);

        if (relatedArticleIds.size === 0) {
            return [];
        }

        // Now fetch the actual blog articles with all their data
        const relatedArticles = await prisma.blog_article.findMany({
            where: {
                id: {
                    in: Array.from(relatedArticleIds)
                },
                is_removed: false,
                published: {
                    not: null
                },
                slug: {
                    not: null
                }
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                seo_description: true,
                published: true,
                image: true,
                seo_image_url: true,
                seo_image_caption: true,
                seo_image_width: true,
                seo_image_height: true,
                author_name: true,
                blog_topic: {
                    select: {
                        title: true,
                        slug: true,
                    }
                }
            },
            orderBy: {
                published: 'desc'
            }
        });

        return relatedArticles;
    }
}
