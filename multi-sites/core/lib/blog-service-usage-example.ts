// Example usage of BlogService with business_id filtering

import { BlogService } from './blog-service.js';

// Business IDs from your database
const FAST_VISTOS_BUSINESS_ID = '41a5c7f95e924d54b120ab9a0e1843c8';
const TEST_BUSINESS_ID = '5810c2b6125c402a9cff53fcc9d61bf5';

// Example 1: Create service for Fast Vistos
async function getFastVistosData() {
    // Create BlogService instance for Fast Vistos business
    const blogService = new BlogService(FAST_VISTOS_BUSINESS_ID);

    // All methods now automatically filter by business_id
    const config = await blogService.getBlogConfig();
    const articles = await blogService.getPublishedArticles();
    const topics = await blogService.getTopics();
    const recentArticles = await blogService.getRecentArticles(3);

    return { config, articles, topics, recentArticles };
}

// Example 2: Create service for test business
async function getTestBusinessData() {
    const testBlogService = new BlogService(TEST_BUSINESS_ID);

    const articles = await testBlogService.getPublishedArticles();
    const topics = await testBlogService.getTopics();

    return { articles, topics };
}

// Example 3: Use in Astro component context (you would pass business_id from site config)
export function createBlogServiceForSite(businessId: string) {
    if (!businessId) {
        throw new Error('Business ID is required to create BlogService');
    }

    return new BlogService(businessId);
}

// Example 4: Error handling
async function safeGetBlogData(businessId: string) {
    try {
        const blogService = new BlogService(businessId);
        const config = await blogService.getBlogConfig();

        if (!config) {
            console.warn(`No blog configuration found for business: ${businessId}`);
            return null;
        }

        return config;
    } catch (error) {
        console.error('Error getting blog data:', error);
        return null;
    }
}

export {
    getFastVistosData,
    getTestBusinessData,
    safeGetBlogData,
    FAST_VISTOS_BUSINESS_ID,
    TEST_BUSINESS_ID,
};
