import { BlogService } from './src/lib/blog-service.ts';

async function testImageUrls() {
  try {
    const articles = await BlogService.getPublishedArticles();
    console.log('🔍 Testing image URL transformation...');
    
    if (articles.length > 0) {
      console.log('✅ Sample article image URL:', articles[0]?.image);
      console.log('📝 Article title:', articles[0]?.title);
    } else {
      console.log('⚠️  No articles found');
    }
    
    const topicsWithArticles = await BlogService.getTopicsWithArticles();
    console.log('📊 Topics with articles found:', topicsWithArticles.length);
    
    if (topicsWithArticles.length > 0 && topicsWithArticles[0].blog_article.length > 0) {
      console.log('✅ First topic article image:', topicsWithArticles[0].blog_article[0]?.image);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testImageUrls();
