import { prisma } from './prisma.js'

export class BlogService {
  // Get blog configuration (for dynamic title and other settings)
  static async getBlogConfig() {
    try {
      return await prisma.blogConfig.findFirst({
        where: {
          is_removed: false
        }
      })
    } catch (error) {
      console.error('Error fetching blog config:', error)
      return null
    }
  }

  // Get all published articles with their topics
  static async getPublishedArticles() {
    try {
      const now = new Date()
      return await prisma.blogArticle.findMany({
        where: {
          is_removed: false,
          published: {
            lte: now  // Published date is less than or equal to now
          }
        },
        include: {
          blog_topic: true
        },
        orderBy: {
          published: 'desc'
        }
      })
    } catch (error) {
      console.error('Error fetching published articles:', error)
      return []
    }
  }

  // Get article by slug
  static async getArticleBySlug(slug: string) {
    try {
      const now = new Date()
      return await prisma.blogArticle.findUnique({
        where: {
          slug: slug,
          is_removed: false,
          published: {
            lte: now
          }
        },
        include: {
          blog_topic: true
        }
      })
    } catch (error) {
      console.error('Error fetching article by slug:', error)
      return null
    }
  }

  // Get all topics
  static async getTopics() {
    try {
      return await prisma.blogTopic.findMany({
        where: {
          is_removed: false
        },
        orderBy: {
          order: 'asc'
        }
      })
    } catch (error) {
      console.error('Error fetching topics:', error)
      return []
    }
  }

  // Get articles by topic
  static async getArticlesByTopic(topicSlug: string) {
    try {
      const now = new Date()
      return await prisma.blogArticle.findMany({
        where: {
          blog_topic: {
            slug: topicSlug,
            is_removed: false
          },
          is_removed: false,
          published: {
            lte: now
          }
        },
        include: {
          blog_topic: true
        },
        orderBy: {
          published: 'desc'
        }
      })
    } catch (error) {
      console.error('Error fetching articles by topic:', error)
      return []
    }
  }

  // Get recent articles (for sidebar, homepage, etc.)
  static async getRecentArticles(limit: number = 5) {
    try {
      const now = new Date()
      return await prisma.blogArticle.findMany({
        where: {
          is_removed: false,
          published: {
            lte: now
          }
        },
        include: {
          blog_topic: true
        },
        orderBy: {
          published: 'desc'
        },
        take: limit
      })
    } catch (error) {
      console.error('Error fetching recent articles:', error)
      return []
    }
  }

  // Get topics with their articles for carousel display
  static async getTopicsWithArticles() {
    try {
      const now = new Date()
      return await prisma.blogTopic.findMany({
        where: {
          is_removed: false,
          blog_article: {
            some: {
              is_removed: false,
              published: {
                lte: now
              }
            }
          }
        },
        include: {
          blog_article: {
            where: {
              is_removed: false,
              published: {
                lte: now
              }
            },
            orderBy: {
              published: 'desc'
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      })
    } catch (error) {
      console.error('Error fetching topics with articles:', error)
      return []
    }
  }
}
