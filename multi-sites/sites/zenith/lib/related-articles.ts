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
        // Get all relationship records where this article is involved
        const relationships = await prisma.blog_article_related_articles.findMany({
            where: {
                OR: [
                    { from_blogarticle_id: articleId },
                    { to_blogarticle_id: articleId }
                ]
            },
            include: {
                blog_article_blog_article_related_articles_from_blogarticle_idToblog_article: {
                    where: {
                        is_removed: false,
                        published: {
                            not: null
                        }
                    },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
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
                    }
                },
                blog_article_blog_article_related_articles_to_blogarticle_idToblog_article: {
                    where: {
                        is_removed: false,
                        published: {
                            not: null
                        }
                    },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
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
                    }
                }
            }
        });

        // Collect related articles, excluding the original article
        const relatedArticles = [];
        
        for (const rel of relationships) {
            // If current article is the "from" side, get the "to" article
            if (rel.from_blogarticle_id === articleId && rel.blog_article_blog_article_related_articles_to_blogarticle_idToblog_article) {
                relatedArticles.push(rel.blog_article_blog_article_related_articles_to_blogarticle_idToblog_article);
            }
            // If current article is the "to" side, get the "from" article
            else if (rel.to_blogarticle_id === articleId && rel.blog_article_blog_article_related_articles_from_blogarticle_idToblog_article) {
                relatedArticles.push(rel.blog_article_blog_article_related_articles_from_blogarticle_idToblog_article);
            }
        }

        // Remove duplicates based on article ID
        const uniqueArticles = relatedArticles.reduce((acc, article) => {
            if (!acc.find(existing => existing.id === article.id)) {
                acc.push(article);
            }
            return acc;
        }, [] as typeof relatedArticles);

        return uniqueArticles;
    }
}
