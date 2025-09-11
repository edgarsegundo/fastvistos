import { BlogService } from './blog-service.js';

/**
 * Integration test for BlogService with real database
 * This test requires a working database connection
 * Run with: npm run test:blog:integration
 */

async function runIntegrationTests() {
  console.log('🔗 Running BlogService Integration Tests');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Get blog configuration
    console.log('\n📊 Testing getBlogConfig()...');
    const config = await BlogService.getBlogConfig();
    if (config) {
      console.log('✅ Blog Config Found:');
      console.log(`   ID: ${config.id}`);
      console.log(`   Title: ${config.title}`);
      console.log(`   Description: ${config.description}`);
    } else {
      console.log('ℹ️  No blog config found in database');
    }

    // Test 2: Get all published articles
    console.log('\n📝 Testing getPublishedArticles()...');
    const articles = await BlogService.getPublishedArticles();
    console.log(`✅ Found ${articles.length} published articles:`);
    articles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      Slug: ${article.slug}`);
      console.log(`      Published: ${new Date(article.published).toLocaleDateString()}`);
      console.log(`      Topic: ${article.blog_topic?.name || 'No topic'}`);
      console.log('');
    });

    // Test 3: Get topics
    console.log('\n🏷️ Testing getTopics()...');
    const topics = await BlogService.getTopics();
    console.log(`✅ Found ${topics.length} topics:`);
    topics.forEach((topic, index) => {
      console.log(`   ${topic.order}. ${topic.name} (${topic.slug})`);
      if (topic.description) {
        console.log(`      Description: ${topic.description}`);
      }
    });

    // Test 4: Get recent articles
    console.log('\n⏰ Testing getRecentArticles(3)...');
    const recentArticles = await BlogService.getRecentArticles(3);
    console.log(`✅ Found ${recentArticles.length} recent articles:`);
    recentArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      Published: ${new Date(article.published).toLocaleDateString()}`);
    });

    // Test 5: Get topics with articles
    console.log('\n🗂️ Testing getTopicsWithArticles()...');
    const topicsWithArticles = await BlogService.getTopicsWithArticles();
    console.log(`✅ Found ${topicsWithArticles.length} topics with articles:`);
    topicsWithArticles.forEach((topic) => {
      console.log(`\n   📁 ${topic.name} (${topic.blog_article.length} articles):`);
      topic.blog_article.forEach((article, index) => {
        console.log(`      ${index + 1}. ${article.title}`);
        console.log(`         Published: ${new Date(article.published).toLocaleDateString()}`);
      });
    });

    // Test 6: Get specific article by slug (if articles exist)
    if (articles.length > 0) {
      const firstArticleSlug = articles[0].slug;
      console.log(`\n📄 Testing getArticleBySlug('${firstArticleSlug}')...`);
      const article = await BlogService.getArticleBySlug(firstArticleSlug);
      if (article) {
        console.log('✅ Article found:');
        console.log(`   Title: ${article.title}`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`   Published: ${new Date(article.published).toLocaleDateString()}`);
        console.log(`   Topic: ${article.blog_topic?.name || 'No topic'}`);
        if (article.content) {
          console.log(`   Content length: ${article.content.length} characters`);
        }
      }
    }

    console.log('\n✅ All integration tests completed successfully!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    
    if (error.message.includes('PrismaClientInitializationError') || 
        error.message.includes('connect') ||
        error.message.includes('database')) {
      console.log('\n💡 Tip: Make sure your database is running and configured correctly.');
      console.log('   Check your DATABASE_URL environment variable.');
    }
    
    throw error;
  }
}

export { runIntegrationTests };
