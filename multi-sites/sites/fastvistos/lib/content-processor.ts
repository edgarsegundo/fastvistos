
/**
 * Content Processor for RELATED-ARTICLE tags
 * Processes content before rendering to replace RELATED-ARTICLE blocks
 */

import { BlogService } from './blog-service.ts';

export class ContentProcessor {
    /**
     * Process content to handle RELATED-ARTICLE tags
     * @param content - Raw markdown content
     * @returns Processed content with RELATED-ARTICLE tags resolved
     */
    static async processContent(content: string): Promise<string> {
        if (!content || typeof content !== 'string') {
            return content;
        }

        // Pattern to match [[RELATED-ARTICLE:uuid]]...[[/RELATED-ARTICLE]]
        const relatedArticlePattern = /\[\[RELATED-ARTICLE:([^\]]+)\]\]([\s\S]*?)\[\[\/RELATED-ARTICLE\]\]/gi;
        
        let processedContent = content;
        const matches = Array.from(content.matchAll(relatedArticlePattern));
        
        if (matches.length === 0) {
            return content;
        }

        console.log(`🔄 Processing ${matches.length} RELATED-ARTICLE tag(s)`);

        // Process each match
        for (const match of matches) {
            const fullMatch = match[0]; // Full [[RELATED-ARTICLE:uuid]]...[[/RELATED-ARTICLE]]
            const uuid = match[1]?.trim(); // UUID from :uuid part
            const innerContent = match[2]; // Content between tags
            
            if (!uuid) {
                console.warn('⚠️ RELATED-ARTICLE tag found without UUID, removing tag');
                processedContent = processedContent.replace(fullMatch, '');
                continue;
            }

            try {
                console.log(`🔍 Processing RELATED-ARTICLE with UUID: ${uuid}`);
                
                // Fetch the article by UUID
                const article = await BlogService.getArticleById(uuid);
                
                if (!article) {
                    console.log(`❌ Article with UUID ${uuid} not found, removing tag`);
                    processedContent = processedContent.replace(fullMatch, '');
                    continue;
                }

                // Check if article is published
                const isPublished = this.isArticlePublished(article);
                
                if (!isPublished) {
                    console.log(`❌ Article with UUID ${uuid} is not published, removing tag`);
                    processedContent = processedContent.replace(fullMatch, '');
                    continue;
                }

                // Article is published, process the content
                console.log(`✅ Article "${article.title}" is published, processing content`);
                
                // Build the article URL
                const articleUrl = `/blog/${article.slug}`;
                
                // Replace [[ARTICLE-URL]] placeholder with actual URL
                const processedInnerContent = innerContent.replace(/\[\[ARTICLE-URL\]\]/g, articleUrl);
                
                // Replace the entire RELATED-ARTICLE block with just the processed inner content
                processedContent = processedContent.replace(fullMatch, processedInnerContent);
                
                console.log(`✅ Successfully processed RELATED-ARTICLE: ${uuid} -> ${articleUrl}`);
                
            } catch (error) {
                console.error(`❌ Error processing RELATED-ARTICLE with UUID ${uuid}:`, error);
                // On error, remove the tag to prevent broken content
                processedContent = processedContent.replace(fullMatch, '');
            }
        }

        return processedContent;
    }

    /**
     * Process HowTo and HowToStep tags, build HowTo JSON, and remove tags from content
     * @param content - Raw markdown content
     * @returns { processedContent: string, howToJson: object|null }
     */
    static processHowToTags(content: string): { processedContent: string, howToJson: any } {
        if (!content || typeof content !== 'string') {
            return { processedContent: content, howToJson: null };
        }

        // Patterns for HowTo and HowToStep blocks
        const howToPattern = /\[\[HowTo\]\](.*?)\[\[\/HowToAnwer:(.*?)\]\]/gis;
        const howToStepPattern = /\[\[HowToStep\]\](.*?)\[\[\/HowToStepAnwer:(.*?)\]\]/gis;

        let howToMatch = howToPattern.exec(content);
        let howToName = '';
        let howToDescription = '';
        if (howToMatch) {
            howToName = (howToMatch[1] || '').trim();
            howToDescription = (howToMatch[2] || '').trim();
        }

        // Find all HowToStep blocks
        const steps: any[] = [];
        let stepMatch;
        while ((stepMatch = howToStepPattern.exec(content)) !== null) {
            const name = (stepMatch[1] || '').trim();
            const text = (stepMatch[2] || '').trim();
            // Generate a URL-friendly anchor from the name
            // const anchor = name
            //     .toLowerCase()
            //     .replace(/[^a-z0-9]+/g, '-')
            //     .replace(/^-+|-+$/g, '');
            steps.push({
                "@type": "HowToStep",
                name,
                text,
                // url: `https://...#${anchor}`
            });
        }

        // Build HowTo JSON if any HowTo or HowToStep found
        let howToJson = null;
        if (howToName || steps.length > 0) {
            howToJson = {
                "@type": "HowTo",
                name: howToName || "",
                description: howToDescription || "",
                step: steps
            };
        }

        // Remove all HowTo and HowToStep blocks from content
        let processedContent = content
            .replace(howToPattern, '')
            .replace(howToStepPattern, '');

        return { processedContent, howToJson };
    }    

    /**
     * Check if an article is published
     * @param article - Article object from database
     * @returns true if article is published and public
     */
    private static isArticlePublished(article: any): boolean {
        if (!article) {
            return false;
        }

        // Check if published date exists and is not null
        if (!article.published) {
            return false;
        }

        // Check if published date is in the past (published)
        const now = new Date();
        const publishedDate = new Date(article.published);
        
        if (publishedDate > now) {
            return false; // Future publication date
        }

        // Check if type is "public" (case insensitive)
        if (!article.type || article.type.toLowerCase() !== 'public') {
            return false;
        }

        // Check if article is not removed
        if (article.is_removed === true) {
            return false;
        }

        return true;
    }

    /**
     * Extract all RELATED-ARTICLE UUIDs from content (for debugging)
     * @param content - Raw content to analyze
     * @returns Array of UUIDs found in RELATED-ARTICLE tags
     */
    static extractRelatedArticleUuids(content: string): string[] {
        const relatedArticlePattern = /\[\[RELATED-ARTICLE:([^\]]+)\]\]/gi;
        const matches = Array.from(content.matchAll(relatedArticlePattern));
        return matches.map(match => match[1]?.trim()).filter(Boolean);
    }

    /**
     * Check if content contains RELATED-ARTICLE tags
     * @param content - Content to check
     * @returns true if content contains RELATED-ARTICLE tags
     */
    static hasRelatedArticleTags(content: string): boolean {
        return /\[\[RELATED-ARTICLE:/i.test(content);
    }
}
