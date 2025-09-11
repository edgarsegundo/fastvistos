import { siteConfig } from './multi-sites/sites/p2digital/site-config.ts';
import { BlogService } from './multi-sites/sites/p2digital/lib/blog-service.ts';

async function debugP2Digital() {
  try {
    console.log('🏢 P2Digital business_id:', siteConfig.business_id);
    
    // Test the getTopicsWithArticles method
    const topics = await BlogService.getTopicsWithArticles();
    console.log('📂 Topics found:', topics.length);
    
    if (topics.length > 0) {
      topics.forEach((topic, i) => {
        console.log(`Topic ${i+1}: ${topic.title} (slug: ${topic.slug})`);
        if (topic.blog_article?.length > 0) {
          topic.blog_article.forEach((article, j) => {
            console.log(`  Article ${j+1}: ${article.title}`);
            console.log(`    - Slug: '${article.slug}'`);
            console.log(`    - Image: '${article.image}'`);
            console.log(`    - Type: '${article.type}'`);
            console.log(`    - Published: ${article.published}`);
            console.log('');
          });
        } else {
          console.log('  No articles found for this topic');
        }
      });
    } else {
      console.log('❌ No topics found for business_id:', siteConfig.business_id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugP2Digital();
