
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
     * Process HowTo and HowToStep XML-like tags, build HowTo JSON, and remove tags from content
     * @param content - Raw markdown content with <HowTo> and <HowToStep> tags
     * @returns { processedContent: string, howToJson: object|null }
     * 
     * Example input:
     * <HowTo>
     *   <name>Main question</name>
     *   <text>Main answer</text>
     * </HowTo>
     * <HowToStep>
     *   <name>Step question</name>
     *   <text>Step answer</text>
     *   <url>https://example.com#anchor</url>
     * </HowToStep>
     */
    static processHowToTags(content: string): { processedContent: string, howToJson: any } {
        if (!content || typeof content !== 'string') {
            return { processedContent: content, howToJson: null };
        }

        console.log('🔍 [HowTo] Checking content for HowTo tags...');
        
        // Check if content has HowTo tags
        const hasHowToTag = content.includes('<HowTo>');
        const hasHowToStepTag = content.includes('<HowToStep>');
        console.log('🔍 [HowTo] Has <HowTo>:', hasHowToTag);
        console.log('🔍 [HowTo] Has <HowToStep>:', hasHowToStepTag);

        // Extract main HowTo block: <HowTo>...</HowTo>
        const howToMainPattern = /<HowTo>([\s\S]*?)<\/HowTo>/i;
        let howToName = '';
        let howToDescription = '';
        
        const howToMatch = howToMainPattern.exec(content);
        if (howToMatch) {
            const howToContent = howToMatch[1];
            // Extract <name> and <text> from HowTo block
            const nameMatch = /<name>([\s\S]*?)<\/name>/i.exec(howToContent);
            const textMatch = /<text>([\s\S]*?)<\/text>/i.exec(howToContent);
            
            howToName = nameMatch ? nameMatch[1].trim() : '';
            howToDescription = textMatch ? textMatch[1].trim() : '';
            
            console.log('✅ [HowTo] Found main HowTo block');
            console.log('   Name:', howToName.substring(0, 80));
            console.log('   Description:', howToDescription.substring(0, 80));
        } else {
            console.log('❌ [HowTo] No main HowTo block found');
        }

        // Extract all HowToStep blocks: <HowToStep>...</HowToStep>
        const steps: any[] = [];
        const howToStepPattern = /<HowToStep>([\s\S]*?)<\/HowToStep>/gi;
        let stepMatch;
        
        while ((stepMatch = howToStepPattern.exec(content)) !== null) {
            const stepContent = stepMatch[1];
            
            // Extract <name>, <text>, and optional <url> from HowToStep block
            const stepNameMatch = /<name>([\s\S]*?)<\/name>/i.exec(stepContent);
            const stepTextMatch = /<text>([\s\S]*?)<\/text>/i.exec(stepContent);
            const stepUrlMatch = /<url>([\s\S]*?)<\/url>/i.exec(stepContent);
            
            const stepName = stepNameMatch ? stepNameMatch[1].trim() : '';
            const stepText = stepTextMatch ? stepTextMatch[1].trim() : '';
            const stepUrl = stepUrlMatch ? stepUrlMatch[1].trim() : null;
            
            if (stepName || stepText) {
                const step: any = {
                    "@type": "HowToStep",
                    name: stepName,
                    text: stepText
                };
                
                // Only add URL if it exists
                if (stepUrl) {
                    step.url = stepUrl;
                }
                
                steps.push(step);
                console.log(`✅ [HowTo] Found HowToStep #${steps.length}`);
                console.log('   Name:', stepName.substring(0, 60));
                console.log('   Text:', stepText.substring(0, 60));
                if (stepUrl) console.log('   URL:', stepUrl);
            }
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

        console.log('🔍 [HowTo] Content processed, tags removed');

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
