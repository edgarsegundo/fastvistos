
/**
 * Content Processor for RELATED-ARTICLE tags
 * Processes content before rendering to replace RELATED-ARTICLE blocks
 */

import { BlogService } from './blog-service.ts';
import { XMLParser } from 'fast-xml-parser';

export class ContentProcessor {
    /**
     * Process content to handle RELATED-ARTICLE tags (new XML format)
     * Format: <!--<RelatedArticle><id>uuid</id><text>content with [[ARTICLE-URL]]</text></RelatedArticle>-->
     * @param content - Raw markdown content
     * @returns Processed content with RELATED-ARTICLE tags resolved
     */
    static async processRelatedArticleTags(content: string): Promise<string> {
        console.log(`🛑 (0)`);
        if (!content || typeof content !== 'string') {
            console.log(`🛑 (1)`);
            return content;
        }

        // Pattern to match <!--<RelatedArticle>...</RelatedArticle>--> (with optional whitespace)
        const relatedArticlePattern = /<!--\s*<RelatedArticle>([\s\S]*?)<\/RelatedArticle>\s*-->/gi;
        
        let processedContent = content;
        console.log(`🛑 (2) Searching for RelatedArticle tags...`);
        const matches = Array.from(content.matchAll(relatedArticlePattern));

        console.log(`🛑 (3) Found ${matches.length} matches`);
        
        if (matches.length === 0) {
            console.log(`🛑 (4)`);
            return content;
        }

        console.log(`🔄 Processing ${matches.length} RELATED-ARTICLE tag(s)`);

        // Initialize XML parser
        const parser = new XMLParser({
            ignoreAttributes: false,
            parseTagValue: true,
            trimValues: true,
            ignoreDeclaration: true
        });

        // Process each match
        for (const match of matches) {
            const fullMatch = match[0]; // Full <!--<RelatedArticle>...</RelatedArticle>-->
            const xmlContent = match[1]; // Content between tags

            try {
                // Parse the XML content
                const xmlString = `<RelatedArticle>${xmlContent}</RelatedArticle>`;
                const parsed = parser.parse(xmlString);
                const articleData = parsed.RelatedArticle || parsed.relatedarticle || {};
                
                const uuid = (articleData.id || '').trim();
                const innerText = (articleData.text || '').trim();
                
                if (!uuid) {
                    console.warn('⚠️ RELATED-ARTICLE tag found without ID, removing tag');
                    processedContent = processedContent.replace(fullMatch, '');
                    continue;
                }

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
                const processedInnerContent = innerText.replace(/\[\[ARTICLE-URL\]\]/g, articleUrl);
                
                // Replace the entire RELATED-ARTICLE block with just the processed inner content
                processedContent = processedContent.replace(fullMatch, processedInnerContent);
                
                console.log(`✅ Successfully processed RELATED-ARTICLE: ${uuid} -> ${articleUrl}`);
                
            } catch (error) {
                console.error(`❌ Error processing RELATED-ARTICLE:`, error);
                // On error, remove the tag to prevent broken content
                processedContent = processedContent.replace(fullMatch, '');
            }
        }

        return processedContent;
    }

    /**
     * Process HowTo and HowToStep XML-like tags, build HowTo JSON, and remove tags from content
     * Uses fast-xml-parser for robust XML parsing
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
        
        // Initialize XML parser with options
        const parser = new XMLParser({
            ignoreAttributes: false,
            parseTagValue: true,
            trimValues: true,
            ignoreDeclaration: true,
            parseAttributeValue: true
        });

        // Extract HowTo main block
        const howToMatches = content.match(/<HowTo>[\s\S]*?<\/HowTo>/gi) || [];
        const hasHowToTag = howToMatches.length > 0;
        console.log('🔍 [HowTo] Has <HowTo>:', hasHowToTag);
        
        let howToName = '';
        let howToDescription = '';
        
        if (howToMatches.length > 0) {
            try {
                const parsed = parser.parse(howToMatches[0]!);
                const howToData = parsed.HowTo || parsed.howto || {};
                
                howToName = howToData.name || '';
                howToDescription = howToData.text || '';
                
                console.log('✅ [HowTo] Found main HowTo block');
                console.log('   Name:', howToName.substring(0, 80));
                console.log('   Description:', howToDescription.substring(0, 80));
            } catch (error) {
                console.error('❌ [HowTo] Error parsing main HowTo block:', error);
            }
        } else {
            console.log('❌ [HowTo] No main HowTo block found');
        }

        // Extract all HowToStep blocks
        const stepMatches = content.match(/<HowToStep>[\s\S]*?<\/HowToStep>/gi) || [];
        const hasHowToStepTag = stepMatches.length > 0;
        console.log('🔍 [HowTo] Has <HowToStep>:', hasHowToStepTag);
        
        const steps: any[] = [];
        
        stepMatches.forEach((stepXml, index) => {
            try {
                const parsed = parser.parse(stepXml);
                const stepData = parsed.HowToStep || parsed.howtostep || {};
                
                const stepName = stepData.name || '';
                const stepText = stepData.text || '';
                const stepUrl = stepData.url || null;
                
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
                    console.log(`✅ [HowTo] Found HowToStep #${index + 1}`);
                    console.log('   Name:', stepName.substring(0, 60));
                    console.log('   Text:', stepText.substring(0, 60));
                    if (stepUrl) console.log('   URL:', stepUrl);
                }
            } catch (error) {
                console.error(`❌ [HowTo] Error parsing HowToStep #${index + 1}:`, error);
            }
        });
        
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
        let processedContent = content;
        howToMatches.forEach(match => {
            processedContent = processedContent.replace(match, '');
        });
        stepMatches.forEach(match => {
            processedContent = processedContent.replace(match, '');
        });

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
