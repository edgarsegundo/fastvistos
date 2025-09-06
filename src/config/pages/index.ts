// Export all page-specific SEO configurations
export { homePageSEO } from './home';
export { blogPageSEO } from './blog';
export { aboutPageSEO } from './about';
export { contactPageSEO } from './contact';

// Re-export the config utilities for convenience
export { createPageSEO, type PageSEOConfig } from './pageConfig';
export { baseSEOConfig } from '../seoConfig';
