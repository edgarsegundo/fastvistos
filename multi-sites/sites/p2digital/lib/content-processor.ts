
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

        console.log('🔍 [HowTo] Checking content for HowTo tags...');
        
        // Check if content has HowTo tags
        const hasHowToTag = content.includes('[[HowTo]]');
        const hasHowToStepTag = content.includes('[[HowToStep]]');
        console.log('🔍 [HowTo] Has [[HowTo]]:', hasHowToTag);
        console.log('🔍 [HowTo] Has [[HowToStep]]:', hasHowToStepTag);

        // HowTo main block: [[HowTo]]Pergunta[[HowToAnswer:Resposta]]
        const howToMainPattern = /\[\[HowTo\]\]([\s\S]*?)\[\[HowToAnswer:([\s\S]*?)\]\]/i;
        let howToName = '';
        let howToDescription = '';
        let howToMatch = howToMainPattern.exec(content);
        if (howToMatch) {
            howToName = (howToMatch[1] || '').trim();
            howToDescription = (howToMatch[2] || '').trim();
            console.log('✅ [HowTo] Found main HowTo block');
            console.log('   Name:', howToName.substring(0, 50) + '...');
            console.log('   Description:', howToDescription.substring(0, 50) + '...');
        } else {
            console.log('❌ [HowTo] No main HowTo block found');
        }

        // HowToStep blocks: [[HowToStep]]Pergunta[[HowToStepAnswer:Resposta]]
        // Use global regex to find all HowToStep blocks
        const steps: any[] = [];
        const howToStepPattern = /\[\[HowToStep\]\]([\s\S]*?)\[\[HowToStepAnswer:([\s\S]*?)\]\]/g;
        let match;
        while ((match = howToStepPattern.exec(content)) !== null) {
            const name = (match[1] || '').trim();
            const text = (match[2] || '').trim();
            console.log(`✅ [HowTo] Found HowToStep #${steps.length + 1}`);
            console.log('   Name:', name.substring(0, 50) + '...');
            console.log('   Text:', text.substring(0, 50) + '...');
            steps.push({
                "@type": "HowToStep",
                name,
                text
            });
        }
        
        console.log(`🔍 [HowTo] Total steps found: ${steps.length}`);

        // Build HowTo JSON if any HowTo or HowToStep found
        let howToJson = null;
        if (howToName || steps.length > 0) {
            howToJson = {
                "@type": "HowTo",
                name: howToName || "",
                description: howToDescription || "",
                step: steps
            };
            console.log('✅ [HowTo] Built HowTo JSON successfully');
        } else {
            console.log('❌ [HowTo] No HowTo data found, returning null');
        }

        // Remove all HowTo and HowToStep blocks from content
        let processedContent = content
            .replace(howToMainPattern, '')
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
