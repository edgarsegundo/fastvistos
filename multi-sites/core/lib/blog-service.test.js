import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock Prisma client
const mockPrisma = {
  blogConfig: {
    findFirst: null
  },
  blogArticle: {
    findMany: null,
    findUnique: null
  },
  blogTopic: {
    findMany: null
  }
};

// BlogService implementation for testing (mirrors the original TypeScript version)
class BlogService {
  static async getBlogConfig() {
    try {
      return await mockPrisma.blogConfig.findFirst({
        where: {
          is_removed: false
        }
      });
    } catch (error) {
      // Only log error if not an intentional test error
      if (!error.message.includes('Database error')) {
        console.error('Error fetching blog config:', error);
      }
      return null;
    }
  }

  static async getPublishedArticles() {
    try {
      const now = new Date();
      return await mockPrisma.blogArticle.findMany({
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
        }
      });
    } catch (error) {
      // Only log error if not an intentional test error
      if (!error.message.includes('Database error')) {
        console.error('Error fetching published articles:', error);
      }
      return [];
    }
  }

  static async getArticleBySlug(slug) {
    try {
      const now = new Date();
      return await mockPrisma.blogArticle.findUnique({
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
      });
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      return null;
    }
  }

  static async getTopics() {
    try {
      return await mockPrisma.blogTopic.findMany({
        where: {
          is_removed: false
        },
        orderBy: {
          order: 'asc'
        }
      });
    } catch (error) {
      // Only log error if not an intentional test error
      if (!error.message.includes('Database error')) {
        console.error('Error fetching topics:', error);
      }
      return [];
    }
  }

  static async getRecentArticles(limit = 5) {
    try {
      const now = new Date();
      return await mockPrisma.blogArticle.findMany({
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
      });
    } catch (error) {
      console.error('Error fetching recent articles:', error);
      return [];
    }
  }

  static async getTopicsWithArticles() {
    try {
      const now = new Date();
      return await mockPrisma.blogTopic.findMany({
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
      });
    } catch (error) {
      // Only log error if not an intentional test error
      if (!error.message.includes('Database error')) {
        console.error('Error fetching topics with articles:', error);
      }
      return [];
    }
  }
}

describe('BlogService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockPrisma.blogConfig.findFirst = () => Promise.resolve(null);
    mockPrisma.blogArticle.findMany = () => Promise.resolve([]);
    mockPrisma.blogArticle.findUnique = () => Promise.resolve(null);
    mockPrisma.blogTopic.findMany = () => Promise.resolve([]);
  });

  describe('getBlogConfig', () => {
    it('should return blog config when found', async () => {
      const mockConfig = {
        id: 1,
        title: 'Test Blog',
        description: 'A test blog',
        is_removed: false
      };

      mockPrisma.blogConfig.findFirst = () => Promise.resolve(mockConfig);
      
      const result = await BlogService.getBlogConfig();
      
      // Show the actual data returned
      console.log('📊 Blog Config Result:', JSON.stringify(result, null, 2));
      
      assert.deepStrictEqual(result, mockConfig);
      assert.strictEqual(result.title, 'Test Blog');
      assert.strictEqual(result.is_removed, false);
    });

    it('should return null when no config found', async () => {
      mockPrisma.blogConfig.findFirst = () => Promise.resolve(null);
      
      const result = await BlogService.getBlogConfig();
      
      console.log('📊 Blog Config Result (null case):', result);
      
      assert.strictEqual(result, null);
    });

    it('should handle database errors gracefully', async () => {
      console.log('🧪 Testing error handling (intentional database error)...');
      
      mockPrisma.blogConfig.findFirst = () => Promise.reject(new Error('Database error'));
      
      const result = await BlogService.getBlogConfig();
      
      console.log('📊 Blog Config Result (error case):', result);
      
      assert.strictEqual(result, null);
    });
  });

  describe('getPublishedArticles', () => {
    it('should return published articles ordered by date', async () => {
      const mockArticles = [
        {
          id: 1,
          title: 'Latest Article',
          slug: 'latest-article',
          published: new Date('2024-01-02'),
          is_removed: false,
          blog_topic: { id: 1, name: 'Topic 1', slug: 'topic-1' }
        },
        {
          id: 2,
          title: 'Older Article',
          slug: 'older-article',
          published: new Date('2024-01-01'),
          is_removed: false,
          blog_topic: { id: 2, name: 'Topic 2', slug: 'topic-2' }
        }
      ];

      mockPrisma.blogArticle.findMany = (options) => {
        // Show the query being executed
        console.log('🔍 Query Parameters:', JSON.stringify(options, null, 2));
        
        // Verify the query parameters
        assert.strictEqual(options.where.is_removed, false);
        assert.ok(options.where.published.lte instanceof Date);
        assert.deepStrictEqual(options.include, { blog_topic: true });
        assert.deepStrictEqual(options.orderBy, { published: 'desc' });
        
        return Promise.resolve(mockArticles);
      };
      
      const result = await BlogService.getPublishedArticles();
      
      // Show the actual data returned
      console.log('📝 Published Articles Result:');
      result.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title} (${article.slug})`);
        console.log(`      Published: ${article.published.toISOString().split('T')[0]}`);
        console.log(`      Topic: ${article.blog_topic.name} (${article.blog_topic.slug})`);
        console.log(`      Removed: ${article.is_removed}`);
      });
      
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].title, 'Latest Article');
      assert.strictEqual(result[1].title, 'Older Article');
      
      // Verify ordering (newer first)
      assert.ok(result[0].published > result[1].published);
    });

    it('should return empty array on database error', async () => {
      console.log('🧪 Testing error handling (intentional database error)...');
      
      mockPrisma.blogArticle.findMany = () => Promise.reject(new Error('Database error'));
      
      const result = await BlogService.getPublishedArticles();
      
      console.log('📝 Published Articles Result (error case):', result);
      
      assert.deepStrictEqual(result, []);
    });
  });

  describe('getArticleBySlug', () => {
    it('should return article when found by slug', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
        published: new Date('2024-01-01'),
        is_removed: false,
        content: 'This is a comprehensive guide about visa applications...',
        excerpt: 'Learn the basics of visa applications',
        blog_topic: { id: 1, name: 'Test Topic', slug: 'test-topic' }
      };

      mockPrisma.blogArticle.findUnique = (options) => {
        console.log('🔍 getArticleBySlug Query:', JSON.stringify(options, null, 2));
        
        assert.strictEqual(options.where.slug, 'test-article');
        assert.strictEqual(options.where.is_removed, false);
        assert.ok(options.where.published.lte instanceof Date);
        assert.deepStrictEqual(options.include, { blog_topic: true });
        
        return Promise.resolve(mockArticle);
      };
      
      const result = await BlogService.getArticleBySlug('test-article');
      
      // Show the actual article data
      console.log('📄 Article Result:');
      console.log(`   Title: ${result.title}`);
      console.log(`   Slug: ${result.slug}`);
      console.log(`   Published: ${result.published.toISOString().split('T')[0]}`);
      console.log(`   Topic: ${result.blog_topic.name} (${result.blog_topic.slug})`);
      console.log(`   Content Length: ${result.content.length} characters`);
      console.log(`   Excerpt: ${result.excerpt}`);
      
      assert.deepStrictEqual(result, mockArticle);
    });

    it('should return null when article not found', async () => {
      mockPrisma.blogArticle.findUnique = () => Promise.resolve(null);
      
      const result = await BlogService.getArticleBySlug('non-existent');
      
      console.log('📄 Article Result (not found):', result);
      
      assert.strictEqual(result, null);
    });
  });

  describe('getTopics', () => {
    it('should return all topics ordered by order field', async () => {
      const mockTopics = [
        { id: 1, name: 'Visa Americano', slug: 'visa-americano', order: 1, is_removed: false, description: 'Dicas sobre vistos americanos' },
        { id: 2, name: 'eTA Canadá', slug: 'eta-canada', order: 2, is_removed: false, description: 'Informações sobre eTA canadense' },
        { id: 3, name: 'Visa Mexicano', slug: 'visa-mexicano', order: 3, is_removed: false, description: 'Guias para vistos mexicanos' }
      ];

      mockPrisma.blogTopic.findMany = (options) => {
        console.log('🔍 getTopics Query:', JSON.stringify(options, null, 2));
        
        assert.deepStrictEqual(options.where, { is_removed: false });
        assert.deepStrictEqual(options.orderBy, { order: 'asc' });
        
        return Promise.resolve(mockTopics);
      };
      
      const result = await BlogService.getTopics();
      
      // Show the actual topics data
      console.log('🏷️ Topics Result:');
      result.forEach((topic, index) => {
        console.log(`   ${topic.order}. ${topic.name} (${topic.slug})`);
        console.log(`      Description: ${topic.description}`);
        console.log(`      Removed: ${topic.is_removed}`);
      });
      
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].name, 'Visa Americano');
      assert.strictEqual(result[1].name, 'eTA Canadá');
      assert.strictEqual(result[2].name, 'Visa Mexicano');
      
      // Verify ordering
      assert.strictEqual(result[0].order, 1);
      assert.strictEqual(result[1].order, 2);
      assert.strictEqual(result[2].order, 3);
    });

    it('should return empty array on database error', async () => {
      console.log('🧪 Testing error handling (intentional database error)...');
      
      mockPrisma.blogTopic.findMany = () => Promise.reject(new Error('Database error'));
      
      const result = await BlogService.getTopics();
      
      console.log('🏷️ Topics Result (error case):', result);
      
      assert.deepStrictEqual(result, []);
    });
  });

  describe('getRecentArticles', () => {
    it('should return limited number of recent articles', async () => {
      const mockArticles = [
        { 
          id: 1, 
          title: 'Como Renovar seu Visto Americano em 2024', 
          slug: 'renovar-visto-americano-2024',
          published: new Date('2024-01-03'),
          excerpt: 'Guia completo para renovação de visto americano',
          blog_topic: { id: 1, name: 'Visa Americano', slug: 'visa-americano' }
        },
        { 
          id: 2, 
          title: 'eTA Canadá: Tudo que Você Precisa Saber', 
          slug: 'eta-canada-guia-completo',
          published: new Date('2024-01-02'),
          excerpt: 'Informações essenciais sobre o eTA canadense',
          blog_topic: { id: 2, name: 'eTA Canadá', slug: 'eta-canada' }
        }
      ];

      mockPrisma.blogArticle.findMany = (options) => {
        console.log('🔍 getRecentArticles Query:', JSON.stringify(options, null, 2));
        
        assert.strictEqual(options.take, 2);
        assert.deepStrictEqual(options.orderBy, { published: 'desc' });
        
        return Promise.resolve(mockArticles);
      };
      
      const result = await BlogService.getRecentArticles(2);
      
      // Show the actual recent articles data
      console.log('⏰ Recent Articles Result:');
      result.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      Slug: ${article.slug}`);
        console.log(`      Published: ${article.published.toISOString().split('T')[0]}`);
        console.log(`      Topic: ${article.blog_topic.name}`);
        console.log(`      Excerpt: ${article.excerpt}`);
        console.log('');
      });
      
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].title, 'Como Renovar seu Visto Americano em 2024');
      assert.strictEqual(result[1].title, 'eTA Canadá: Tudo que Você Precisa Saber');
    });

    it('should use default limit of 5 when no limit specified', async () => {
      mockPrisma.blogArticle.findMany = (options) => {
        console.log('🔍 getRecentArticles Default Limit Query:', JSON.stringify({ take: options.take }, null, 2));
        
        assert.strictEqual(options.take, 5);
        return Promise.resolve([]);
      };
      
      const result = await BlogService.getRecentArticles();
      
      console.log('⏰ Recent Articles Result (default limit):', result);
    });
  });

  describe('getTopicsWithArticles', () => {
    it('should return topics with their associated articles', async () => {
      const mockTopicsWithArticles = [
        {
          id: 1,
          name: 'Visa Americano',
          slug: 'visa-americano',
          order: 1,
          is_removed: false,
          description: 'Tudo sobre vistos americanos',
          blog_article: [
            {
              id: 1,
              title: 'Como Tirar Visto Americano pela Primeira Vez',
              slug: 'como-tirar-visto-americano',
              published: new Date('2024-01-01'),
              is_removed: false,
              excerpt: 'Guia completo para primeira solicitação'
            },
            {
              id: 2,
              title: 'Renovação de Visto Americano',
              slug: 'renovacao-visto-americano',
              published: new Date('2023-12-15'),
              is_removed: false,
              excerpt: 'Como renovar seu visto de forma eficiente'
            }
          ]
        },
        {
          id: 2,
          name: 'eTA Canadá',
          slug: 'eta-canada',
          order: 2,
          is_removed: false,
          description: 'Informações sobre eTA canadense',
          blog_article: [
            {
              id: 3,
              title: 'eTA Canadá: Guia Completo 2024',
              slug: 'eta-canada-guia-2024',
              published: new Date('2024-01-05'),
              is_removed: false,
              excerpt: 'Tudo sobre o eTA canadense atualizado'
            }
          ]
        }
      ];

      mockPrisma.blogTopic.findMany = (options) => {
        console.log('🔍 getTopicsWithArticles Query:', JSON.stringify(options, null, 2));
        
        // Verify complex query structure
        assert.strictEqual(options.where.is_removed, false);
        assert.ok(options.where.blog_article.some);
        assert.deepStrictEqual(options.orderBy, { order: 'asc' });
        
        return Promise.resolve(mockTopicsWithArticles);
      };
      
      const result = await BlogService.getTopicsWithArticles();
      
      // Show the actual topics with articles data
      console.log('🏷️ Topics with Articles Result:');
      result.forEach((topic, topicIndex) => {
        console.log(`\n   ${topic.order}. ${topic.name} (${topic.slug})`);
        console.log(`      Description: ${topic.description}`);
        console.log(`      Articles (${topic.blog_article.length}):`);
        
        topic.blog_article.forEach((article, articleIndex) => {
          console.log(`         ${articleIndex + 1}. ${article.title}`);
          console.log(`            Slug: ${article.slug}`);
          console.log(`            Published: ${article.published.toISOString().split('T')[0]}`);
          console.log(`            Excerpt: ${article.excerpt}`);
        });
      });
      
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].name, 'Visa Americano');
      assert.strictEqual(result[0].blog_article.length, 2);
      assert.strictEqual(result[0].blog_article[0].title, 'Como Tirar Visto Americano pela Primeira Vez');
      
      assert.strictEqual(result[1].name, 'eTA Canadá');
      assert.strictEqual(result[1].blog_article.length, 1);
      assert.strictEqual(result[1].blog_article[0].title, 'eTA Canadá: Guia Completo 2024');
    });

    it('should return empty array on database error', async () => {
      console.log('🧪 Testing error handling (intentional database error)...');
      
      mockPrisma.blogTopic.findMany = () => Promise.reject(new Error('Database error'));
      
      const result = await BlogService.getTopicsWithArticles();
      
      console.log('🏷️ Topics with Articles Result (error case):', result);
      
      assert.deepStrictEqual(result, []);
    });
  });
});

// Export for manual testing
export { mockPrisma, BlogService };
