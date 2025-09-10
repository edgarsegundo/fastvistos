// Test the blog service with real database connection
import { BlogService } from './src/lib/blog-service.ts'

async function testBlogService() {
  try {
    console.log('🔍 Testing BlogService...')
    
    // Test blog config
    const config = await BlogService.getBlogConfig()
    console.log('📊 Blog Config:', config)
    
    // Test published articles
    const articles = await BlogService.getPublishedArticles()
    console.log(`📝 Found ${articles.length} published articles`)
    
    // Test topics
    const topics = await BlogService.getTopics()
    console.log(`🏷️ Found ${topics.length} topics`)
    
    console.log('✅ All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBlogService()
