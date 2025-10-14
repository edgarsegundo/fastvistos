import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RelatedArticlesService {
    /**
     * Get related articles for a given blog article ID
     * Returns an array of related blog articles with basic info
     */
    static async getRelatedArticles(articleId: string) {
        // Find related articles using the many-to-many relationship
        const article = await prisma.blog_article.findUnique({
            where: { 
                id: articleId,
                is_removed: false,
            },
            include: {
                blog_article_related_articles_blog_article_related_articles_from_blogarticle_idToblog_article: {
                    include: {
                        blog_article_related_articles_to_blogarticle_idToblog_article: {
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
                },
                blog_article_related_articles_blog_article_related_articles_to_blogarticle_idToblog_article: {
                    include: {
                        blog_article_related_articles_from_blogarticle_idToblog_article: {
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
                }
            }
        });

        if (!article) return [];

        // Collect all related articles from both directions of the relationship
        const relatedArticles = [
            // Articles where current article is the "from" side
            ...article.blog_article_related_articles_blog_article_related_articles_from_blogarticle_idToblog_article
                .map(rel => rel.blog_article_related_articles_to_blogarticle_idToblog_article),
            // Articles where current article is the "to" side  
            ...article.blog_article_related_articles_blog_article_related_articles_to_blogarticle_idToblog_article
                .map(rel => rel.blog_article_related_articles_from_blogarticle_idToblog_article)
        ].filter(Boolean); // Remove any null/undefined entries

        // Remove duplicates based on article ID
        const uniqueArticles = relatedArticles.reduce((acc, article) => {
            if (!acc.find(existing => existing.id === article.id)) {
                acc.push(article);
            }
            return acc;
        }, [] as typeof relatedArticles);

        return uniqueArticles;
    }

    /**
     * Get related articles with simpler query (alternative approach)
     * This might be easier to work with depending on your Prisma setup
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
                blog_article_related_articles_from_blogarticle_idToblog_article: {
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
                blog_article_related_articles_to_blogarticle_idToblog_article: {
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
            if (rel.from_blogarticle_id === articleId && rel.blog_article_related_articles_to_blogarticle_idToblog_article) {
                relatedArticles.push(rel.blog_article_related_articles_to_blogarticle_idToblog_article);
            }
            // If current article is the "to" side, get the "from" article
            else if (rel.to_blogarticle_id === articleId && rel.blog_article_related_articles_from_blogarticle_idToblog_article) {
                relatedArticles.push(rel.blog_article_related_articles_from_blogarticle_idToblog_article);
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
