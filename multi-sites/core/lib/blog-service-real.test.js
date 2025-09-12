import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { config } from 'dotenv';

// Load environment variables
config();

// Import the real BlogService that connects to your database
import { BlogService } from './blog-service.ts';
import { prisma } from './prisma.js';

describe('BlogService - Real Database Tests', () => {
    before(async () => {
        console.log('🔗 Connecting to database...');
        console.log(
            `📍 Database URL: ${process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@')}`
        );
    });

    describe('getBlogConfig', () => {
        it('should fetch real blog configuration from database', async () => {
            console.log('\n📊 Testing getBlogConfig() with real database...');

            const result = await BlogService.getBlogConfig();

            console.log('📊 Real Blog Config Result:');
            if (result) {
                console.log(`   ID: ${result.id}`);
                console.log(`   Title: ${result.title}`);
                console.log(`   Slug: ${result.slug || 'No slug'}`);
                console.log(`   Created: ${result.created}`);
                console.log(`   Modified: ${result.modified}`);
                console.log(`   Is Removed: ${result.is_removed}`);
                console.log(`   Business ID: ${result.business_id}`);
                console.log(`   Config: ${JSON.stringify(result.config, null, 2)}`);

                // Verify expected structure
                assert.ok(result.id, 'Should have an ID');
                assert.ok(result.title, 'Should have a title');
                assert.strictEqual(
                    typeof result.is_removed,
                    'boolean',
                    'is_removed should be boolean'
                );
                assert.ok(result.business_id, 'Should have a business_id');
            } else {
                console.log('   ℹ️ No blog config found in database');
            }
        });
    });

    describe('getPublishedArticles', () => {
        it('should fetch real published articles from database', async () => {
            console.log('\n📝 Testing getPublishedArticles() with real database...');

            const result = await BlogService.getPublishedArticles();

            console.log(`📝 Real Published Articles Result: Found ${result.length} articles`);

            if (result.length > 0) {
                console.log('\n   📋 Articles:');
                result.forEach((article, index) => {
                    console.log(`   ${index + 1}. ${article.title}`);
                    console.log(`      ID: ${article.id}`);
                    console.log(`      Slug: ${article.slug}`);
                    console.log(
                        `      Published: ${new Date(article.published).toLocaleDateString()}`
                    );
                    console.log(`      Type: ${article.type}`);
                    console.log(`      Is Removed: ${article.is_removed}`);
                    console.log(`      Business ID: ${article.business_id}`);
                    if (article.blog_topic) {
                        console.log(
                            `      Topic: ${article.blog_topic.title} (${article.blog_topic.slug})`
                        );
                    }
                    if (article.content_html) {
                        console.log(
                            `      Content Length: ${article.content_html.length} characters`
                        );
                    }
                    console.log('');
                });

                // Verify expected structure
                assert.ok(Array.isArray(result), 'Should return an array');
                assert.ok(result[0].id, 'Articles should have IDs');
                assert.ok(result[0].title, 'Articles should have titles');
                assert.ok(result[0].published, 'Articles should have published dates');
            } else {
                console.log('   ℹ️ No published articles found in database');
            }

            // Should always return an array
            assert.ok(Array.isArray(result), 'Should return an array even if empty');
        });
    });

    describe('getTopics', () => {
        it('should fetch real topics from database', async () => {
            console.log('\n🏷️ Testing getTopics() with real database...');

            const result = await BlogService.getTopics();

            console.log(`🏷️ Real Topics Result: Found ${result.length} topics`);

            if (result.length > 0) {
                console.log('\n   📋 Topics:');
                result.forEach((topic, index) => {
                    console.log(`   ${topic.order}. ${topic.title} (${topic.slug})`);
                    console.log(`      ID: ${topic.id}`);
                    console.log(`      Created: ${new Date(topic.created).toLocaleDateString()}`);
                    console.log(`      Is Removed: ${topic.is_removed}`);
                    console.log(`      Business ID: ${topic.business_id}`);
                    if (topic.image) {
                        console.log(`      Image: ${topic.image}`);
                    }
                    if (topic.metatitle) {
                        console.log(`      Meta Title: ${topic.metatitle.substring(0, 100)}...`);
                    }
                    console.log('');
                });

                // Verify expected structure
                assert.ok(Array.isArray(result), 'Should return an array');
                assert.ok(result[0].id, 'Topics should have IDs');
                assert.ok(result[0].title, 'Topics should have titles');
                assert.ok(typeof result[0].order === 'number', 'Topics should have numeric order');
            } else {
                console.log('   ℹ️ No topics found in database');
            }

            // Should always return an array
            assert.ok(Array.isArray(result), 'Should return an array even if empty');
        });
    });

    describe('getRecentArticles', () => {
        it('should fetch real recent articles from database', async () => {
            console.log('\n⏰ Testing getRecentArticles(5) with real database...');

            const result = await BlogService.getRecentArticles(5);

            console.log(
                `⏰ Real Recent Articles Result: Found ${result.length} recent articles (limit: 5)`
            );

            if (result.length > 0) {
                console.log('\n   📋 Recent Articles:');
                result.forEach((article, index) => {
                    console.log(`   ${index + 1}. ${article.title}`);
                    console.log(`      Slug: ${article.slug}`);
                    console.log(
                        `      Published: ${new Date(article.published).toLocaleDateString()}`
                    );
                    console.log(`      Type: ${article.type}`);
                    if (article.blog_topic) {
                        console.log(`      Topic: ${article.blog_topic.title}`);
                    }
                    console.log('');
                });

                // Verify expected structure and ordering
                assert.ok(Array.isArray(result), 'Should return an array');
                assert.ok(result.length <= 5, 'Should respect the limit of 5');

                // Check if articles are ordered by published date (newest first)
                if (result.length > 1) {
                    for (let i = 0; i < result.length - 1; i++) {
                        const current = new Date(result[i].published);
                        const next = new Date(result[i + 1].published);
                        assert.ok(
                            current >= next,
                            'Articles should be ordered by published date (newest first)'
                        );
                    }
                }
            } else {
                console.log('   ℹ️ No recent articles found in database');
            }
        });
    });

    describe('getTopicsWithArticles', () => {
        it('should fetch real topics with their articles from database', async () => {
            console.log('\n🗂️ Testing getTopicsWithArticles() with real database...');

            const result = await BlogService.getTopicsWithArticles();

            console.log(
                `🗂️ Real Topics with Articles Result: Found ${result.length} topics with articles`
            );

            if (result.length > 0) {
                console.log('\n   📋 Topics with Articles:');
                result.forEach((topic) => {
                    console.log(`\n   📁 ${topic.title} (${topic.slug})`);
                    console.log(`      ID: ${topic.id}`);
                    console.log(`      Order: ${topic.order}`);
                    console.log(`      Articles: ${topic.blog_article.length}`);

                    if (topic.blog_article.length > 0) {
                        topic.blog_article.forEach((article, articleIndex) => {
                            console.log(`         ${articleIndex + 1}. ${article.title}`);
                            console.log(`            Slug: ${article.slug}`);
                            console.log(
                                `            Published: ${new Date(article.published).toLocaleDateString()}`
                            );
                            console.log(`            Type: ${article.type}`);
                        });
                    }
                });

                // Verify expected structure
                assert.ok(Array.isArray(result), 'Should return an array');
                if (result.length > 0) {
                    assert.ok(result[0].id, 'Topics should have IDs');
                    assert.ok(result[0].title, 'Topics should have titles');
                    assert.ok(
                        Array.isArray(result[0].blog_article),
                        'Topics should have blog_article array'
                    );
                }
            } else {
                console.log('   ℹ️ No topics with articles found in database');
            }
        });
    });

    describe('getArticleBySlug', () => {
        it('should fetch a real article by slug from database', async () => {
            console.log('\n📄 Testing getArticleBySlug() with real database...');

            // First get an article to test with
            const articles = await BlogService.getPublishedArticles();

            if (articles.length > 0) {
                const testSlug = articles[0].slug;
                console.log(`   Testing with slug: "${testSlug}"`);

                const result = await BlogService.getArticleBySlug(testSlug);

                console.log('📄 Real Article by Slug Result:');
                if (result) {
                    console.log(`   Title: ${result.title}`);
                    console.log(`   Slug: ${result.slug}`);
                    console.log(`   ID: ${result.id}`);
                    console.log(`   Published: ${new Date(result.published).toLocaleDateString()}`);
                    console.log(`   Type: ${result.type}`);
                    console.log(`   Business ID: ${result.business_id}`);
                    if (result.blog_topic) {
                        console.log(
                            `   Topic: ${result.blog_topic.title} (${result.blog_topic.slug})`
                        );
                    }
                    if (result.content_html) {
                        console.log(`   Content Length: ${result.content_html.length} characters`);
                    }
                    if (result.metatitle) {
                        console.log(`   Meta Title: ${result.metatitle.substring(0, 100)}...`);
                    }

                    // Verify expected structure
                    assert.strictEqual(
                        result.slug,
                        testSlug,
                        'Should return article with correct slug'
                    );
                    assert.ok(result.id, 'Article should have an ID');
                    assert.ok(result.title, 'Article should have a title');
                    assert.strictEqual(result.is_removed, false, 'Article should not be removed');
                } else {
                    console.log(`   ⚠️ Article with slug "${testSlug}" not found`);
                }
            } else {
                console.log('   ℹ️ No articles available to test getArticleBySlug');

                // Test with a non-existent slug
                const result = await BlogService.getArticleBySlug('non-existent-slug-test');
                console.log('   Testing with non-existent slug: null result expected');
                assert.strictEqual(result, null, 'Should return null for non-existent slug');
            }
        });
    });
});

console.log('🧪 Real Database Tests Configuration:');
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log('');
