/**
 * Content Parser Service
 * 
 * A robust and extensible system for parsing custom tags in markdown content.
 * Designed to handle multiple tag types with different parsing strategies.
 * 
 * @author FastVistos Team
 * @version 1.0.0
 */

import { BlogService } from './blog-service.js';

/**
 * Interface for tag parsers
 */
export interface TagParser {
    /** Tag name (e.g., 'HIDDEN-REF') */
    tagName: string;
    
    /** Regex pattern to match the tag */
    pattern: RegExp;
    
    /** 
     * Parse function that processes the matched content
     * @param match The regex match result
     * @param context Optional context for parsing decisions
     * @returns Promise<string> The processed content (empty string to remove)
     */
    parse(match: RegExpMatchArray, context?: ParseContext): Promise<string>;
    
    /** Optional: Validation function for tag content */
    validate?(content: string): boolean;
    
    /** Optional: Pre-processing function */
    preProcess?(content: string): string;
    
    /** Optional: Post-processing function */
    postProcess?(content: string): string;
}

/**
 * Parsing context interface
 */
export interface ParseContext {
    /** Current article slug */
    articleSlug?: string;
    
    /** Current article ID */
    articleId?: string;
    
    /** Business ID for scoping */
    businessId?: string;
    
    /** Additional metadata */
    metadata?: Record<string, any>;
    
    /** Debug mode flag */
    debug?: boolean;
}

/**
 * Parsing options interface
 */
export interface ParseOptions {
    /** Enable debug logging */
    debug?: boolean;
    
    /** Maximum parsing iterations to prevent infinite loops */
    maxIterations?: number;
    
    /** Context for parsing */
    context?: ParseContext;
    
    /** Skip validation step */
    skipValidation?: boolean;
    
    /** Custom parsers to use (if not provided, uses default registry) */
    customParsers?: TagParser[];
}

/**
 * Parsing result interface
 */
export interface ParseResult {
    /** The processed content */
    content: string;
    
    /** Number of tags processed */
    tagsProcessed: number;
    
    /** Processing statistics */
    stats: {
        totalMatches: number;
        successfulParsing: number;
        errors: number;
        removedTags: number;
        preservedTags: number;
    };
    
    /** Error details if any */
    errors?: Array<{
        tagName: string;
        error: string;
        originalContent: string;
    }>;
    
    /** Debug information if enabled */
    debug?: Array<{
        step: string;
        tagName: string;
        before: string;
        after: string;
        action: 'preserved' | 'removed' | 'transformed';
    }>;
}

/**
 * Related Article Tag Parser
 * Format: [[RELATED-ARTICLE:uuid]]content with [[ARTICLE-URL]] placeholder[[/RELATED-ARTICLE]]
 * - Shows content if article with uuid exists and is published
 * - Replaces [[ARTICLE-URL]] with the actual article URL
 * - Removes entire tag and content if article doesn't exist or isn't published
 */
export class RelatedArticleParser implements TagParser {
    tagName = 'RELATED-ARTICLE';
    
    // Matches: [[RELATED-ARTICLE:uuid]]content[[/RELATED-ARTICLE]]
    pattern = /\[\[RELATED-ARTICLE:([^\]]+)\]\]([\s\S]*?)\[\[\/RELATED-ARTICLE\]\]/gi;
    
    async parse(match: RegExpMatchArray, context?: ParseContext): Promise<string> {
        const fullMatch = match[0];
        const uuid = match[1]?.trim(); // UUID from :uuid part
        const contentTemplate = match[2]; // Content between tags with [[ARTICLE-URL]] placeholder
        
        // Add debugger breakpoint here
        if (context?.debug) {
            debugger; // 🔍 BREAKPOINT: Inspect match, uuid, and contentTemplate
            console.log(`🔍 RELATED-ARTICLE parsing: "${fullMatch.substring(0, 50)}..."`);
            console.log(`  UUID: ${uuid}`);
            console.log(`  Content template: "${contentTemplate.substring(0, 50)}..."`);
        }
        
        // Validate UUID
        if (!uuid) {
            if (context?.debug) {
                console.log(`❌ RELATED-ARTICLE: Missing UUID, removing content`);
            }
            return '';
        }
        
        try {
            // Check if article exists and is published, and get its URL
            const articleUrl = await BlogService.getArticleUrlByUuid(uuid);
            
            if (articleUrl) {
                // Add debugger breakpoint for successful URL resolution
                if (context?.debug) {
                    debugger; // 🔍 BREAKPOINT: Inspect articleUrl and contentTemplate before replacement
                }
                
                // Replace [[ARTICLE-URL]] placeholder with actual URL
                const processedContent = contentTemplate.replace(/\[\[ARTICLE-URL\]\]/g, articleUrl);
                
                if (context?.debug) {
                    console.log(`✅ RELATED-ARTICLE: UUID ${uuid} found, URL: ${articleUrl}`);
                    console.log(`  Processed content: "${processedContent.substring(0, 50)}..."`);
                }
                
                return processedContent;
            } else {
                if (context?.debug) {
                    console.log(`❌ RELATED-ARTICLE: UUID ${uuid} not found or not published, removing content`);
                }
                return ''; // Remove entire tag and content
            }
        } catch (error) {
            if (context?.debug) {
                console.error(`🚫 RELATED-ARTICLE: Error processing UUID ${uuid}:`, error);
            }
            return ''; // On error, remove content for safety
        }
    }
    
    validate(content: string): boolean {
        // Content should contain the [[ARTICLE-URL]] placeholder
        return content.includes('[[ARTICLE-URL]]');
    }
    
    preProcess(content: string): string {
        // Normalize whitespace around tags
        return content.replace(/\[\[RELATED-ARTICLE:([^\]]+)\]\]\s*([\s\S]*?)\s*\[\[\/RELATED-ARTICLE\]\]/gi, 
                             '[[RELATED-ARTICLE:$1]]$2[[/RELATED-ARTICLE]]');
    }
}

/**
 * Conditional Content Parser
 * Example for future expansion: [[IF-FEATURE]]feature-name[[CONTENT]]content[[/IF-FEATURE]]
 */
export class ConditionalContentParser implements TagParser {
    tagName = 'IF-FEATURE';
    
    // Matches [[IF-FEATURE]]feature[[CONTENT]]content[[/IF-FEATURE]]
    pattern = /\[\[IF-FEATURE\]\](.*?)\[\[CONTENT\]\](.*?)\[\[\/IF-FEATURE\]\]/gis;
    
    async parse(match: RegExpMatchArray, context?: ParseContext): Promise<string> {
        const featureName = match[1]?.trim();
        const content = match[2]?.trim();
        
        if (!featureName || !content) {
            return '';
        }
        
        // Example: Check if feature is enabled (you'd implement your feature flag logic)
        const isFeatureEnabled = await this.checkFeatureFlag(featureName, context);
        
        return isFeatureEnabled ? content : '';
    }
    
    private async checkFeatureFlag(featureName: string, context?: ParseContext): Promise<boolean> {
        // Placeholder for feature flag checking logic
        // You could integrate with LaunchDarkly, ConfigCat, or your own system
        return false;
    }
    
    validate(content: string): boolean {
        return content.includes('[[CONTENT]]');
    }
}

/**
 * Dynamic Content Parser
 * Example: [[DYNAMIC]]article-count:recent:5[[/DYNAMIC]]
 */
export class DynamicContentParser implements TagParser {
    tagName = 'DYNAMIC';
    
    pattern = /\[\[DYNAMIC\]\](.*?)\[\[\/DYNAMIC\]\]/gis;
    
    async parse(match: RegExpMatchArray, context?: ParseContext): Promise<string> {
        const directive = match[1]?.trim();
        
        if (!directive) {
            return '';
        }
        
        const [type, ...params] = directive.split(':');
        
        switch (type) {
            case 'article-count':
                return await this.getArticleCount(params, context);
            case 'recent-articles':
                return await this.getRecentArticlesList(params, context);
            case 'current-date':
                return new Date().toLocaleDateString('pt-BR');
            default:
                return '';
        }
    }
    
    private async getArticleCount(params: string[], context?: ParseContext): Promise<string> {
        try {
            const filter = params[0] || 'all';
            const limit = parseInt(params[1]) || 0;
            
            // You'd implement the actual counting logic here
            return '42'; // Placeholder
        } catch {
            return '0';
        }
    }
    
    private async getRecentArticlesList(params: string[], context?: ParseContext): Promise<string> {
        try {
            const limit = parseInt(params[0]) || 5;
            
            // You'd fetch and format recent articles here
            return `<ul><li>Recent Article 1</li><li>Recent Article 2</li></ul>`;
        } catch {
            return '';
        }
    }
    
    validate(content: string): boolean {
        return content.includes(':');
    }
}

/**
 * Main Content Parser Service
 */
export class ContentParserService {
    private parsers: Map<string, TagParser> = new Map();
    private defaultOptions: ParseOptions = {
        debug: false,
        maxIterations: 10,
        skipValidation: false,
    };
    
    constructor() {
        // Register default parsers
        this.registerParser(new RelatedArticleParser());
        // Uncomment to enable additional parsers
        // this.registerParser(new ConditionalContentParser());
        // this.registerParser(new DynamicContentParser());
    }
    
    /**
     * Register a new tag parser
     */
    registerParser(parser: TagParser): void {
        this.parsers.set(parser.tagName, parser);
        
        if (this.defaultOptions.debug) {
            console.log(`📝 Registered parser: ${parser.tagName}`);
        }
    }
    
    /**
     * Unregister a tag parser
     */
    unregisterParser(tagName: string): boolean {
        return this.parsers.delete(tagName);
    }
    
    /**
     * Get all registered parsers
     */
    getRegisteredParsers(): string[] {
        return Array.from(this.parsers.keys());
    }
    
    /**
     * Parse content with all registered parsers
     */
    async parseContent(content: string, options: ParseOptions = {}): Promise<ParseResult> {
        const opts = { ...this.defaultOptions, ...options };
        const parsersToUse = opts.customParsers || Array.from(this.parsers.values());

        const result: ParseResult = {
            content,
            tagsProcessed: 0,
            stats: {
                totalMatches: 0,
                successfulParsing: 0,
                errors: 0,
                removedTags: 0,
                preservedTags: 0,
            },
            errors: [],
            debug: opts.debug ? [] : undefined,
        };
        
        let currentContent = content;
        let iteration = 0;
        

        

        // Pre-processing
        for (const parser of parsersToUse) {
            if (parser.preProcess) {
                currentContent = parser.preProcess(currentContent);
            }
        }

        console.log("🛑🛑🛑 parseContent 2: ", currentContent)
        
        // Main parsing loop
        while (iteration < (opts.maxIterations || 10)) {
            let hasChanges = false;
            
            for (const parser of parsersToUse) {
                // Create fresh regex to avoid global flag state issues
                const freshPattern = new RegExp(parser.pattern.source, parser.pattern.flags);
                const matches = Array.from(currentContent.matchAll(freshPattern));
                result.stats.totalMatches += matches.length;
                
                if (opts.debug && parser.tagName === 'RELATED-ARTICLE') {
                    console.log(`🔍 ${parser.tagName} - Found ${matches.length} matches in iteration ${iteration + 1}`);
                    if (matches.length === 0) {
                        console.log(`📄 Content length: ${currentContent.length} chars`);
                        console.log(`🎯 Pattern: ${parser.pattern.toString()}`);
                        // console.log(currentContent);
                        // Show a snippet around potential RELATED-ARTICLE tags
                        const relatedArticleIndex = currentContent.indexOf('[[RELATED-ARTICLE');
                        console.log(`🛑🛑🛑🛑 relatedArticleIndex: ${relatedArticleIndex}`);
                        if (relatedArticleIndex >= 0) {
                            const start = Math.max(0, relatedArticleIndex - 50);
                            const end = Math.min(currentContent.length, relatedArticleIndex + 200);
                            console.log(`📝 Content around RELATED-ARTICLE: "${currentContent.substring(start, end)}"`);
                        }
                    }
                }
                
                if (matches.length === 0) continue;
                
                for (const match of matches) {
                    const originalMatch = match[0];
                    const beforeContent = currentContent;
                    
                    try {
                        // Validation
                        if (!opts.skipValidation && parser.validate) {
                            // For RELATED-ARTICLE, validate the content template (match[2])
                            // For other parsers, validate match[1] if it exists
                            const contentToValidate = parser.tagName === 'RELATED-ARTICLE' 
                                ? match[2] 
                                : match[1];
                                
                            if (opts.debug && parser.tagName === 'RELATED-ARTICLE') {
                                console.log(`🔍 RELATED-ARTICLE validation - match[1]: "${match[1]}", match[2]: "${match[2]?.substring(0, 50)}..."`);
                                console.log(`🔍 Content to validate: "${contentToValidate?.substring(0, 50)}..."`);
                            }
                                
                            if (contentToValidate && !parser.validate(contentToValidate)) {
                                if (opts.debug) {
                                    console.warn(`⚠️  Validation failed for ${parser.tagName}: ${contentToValidate?.substring(0, 50)}...`);
                                }
                                currentContent = currentContent.replace(originalMatch, '');
                                result.stats.removedTags++;
                                hasChanges = true;
                                continue;
                            }
                        }
                        
                        // Parse
                        const parsedContent = await parser.parse(match, opts.context);
                        currentContent = currentContent.replace(originalMatch, parsedContent);
                        
                        // Update stats
                        result.stats.successfulParsing++;
                        result.tagsProcessed++;
                        hasChanges = true;
                        
                        if (parsedContent === '') {
                            result.stats.removedTags++;
                        } else if (parsedContent === match[1]) {
                            result.stats.preservedTags++;
                        }
                        
                        // Debug info
                        if (opts.debug && result.debug) {
                            result.debug.push({
                                step: `Iteration ${iteration + 1}`,
                                tagName: parser.tagName,
                                before: originalMatch,
                                after: parsedContent,
                                action: parsedContent === '' ? 'removed' : 
                                       parsedContent === match[1] ? 'preserved' : 'transformed',
                            });
                        }
                        
                    } catch (error) {
                        result.stats.errors++;
                        result.errors?.push({
                            tagName: parser.tagName,
                            error: error instanceof Error ? error.message : String(error),
                            originalContent: originalMatch,
                        });
                        
                        // Remove problematic tag on error
                        currentContent = currentContent.replace(originalMatch, '');
                        result.stats.removedTags++;
                        hasChanges = true;
                        
                        if (opts.debug) {
                            console.error(`🚫 Parser error in ${parser.tagName}:`, error);
                        }
                    }
                }
            }
            
            if (!hasChanges) break;
            iteration++;
        }
        
        // Post-processing
        for (const parser of parsersToUse) {
            if (parser.postProcess) {
                currentContent = parser.postProcess(currentContent);
            }
        }
        
        result.content = currentContent;
        
        if (opts.debug) {
            console.log(`📊 Parsing complete: ${result.tagsProcessed} tags processed in ${iteration} iterations`);
            console.log(`📈 Stats:`, result.stats);
        }
        
        return result;
    }
    
    /**
     * Parse content with a single specific parser
     */
    async parseWithParser(content: string, tagName: string, options: ParseOptions = {}): Promise<ParseResult> {
        const parser = this.parsers.get(tagName);
        if (!parser) {
            throw new Error(`Parser not found: ${tagName}`);
        }
        
        return this.parseContent(content, {
            ...options,
            customParsers: [parser],
        });
    }
    
    /**
     * Check if content contains any parseable tags
     */
    hasParseableTags(content: string): boolean {
        for (const parser of this.parsers.values()) {
            // Create a fresh regex to avoid global flag state issues
            const freshPattern = new RegExp(parser.pattern.source, parser.pattern.flags);
            const hasMatch = freshPattern.test(content);
            
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔍 Checking ${parser.tagName} pattern: ${hasMatch ? 'FOUND' : 'NOT FOUND'}`);
                if (!hasMatch && parser.tagName === 'HIDDEN-REF') {
                    // Show first 200 chars of content for debugging
                    console.log(`📄 Content preview (first 200 chars): "${content.substring(0, 200)}..."`);
                    console.log(`🎯 Looking for pattern: ${parser.pattern.toString()}`);
                }
            }
            if (hasMatch) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get parsing statistics without actually parsing
     */
    getContentStats(content: string): Record<string, number> {
        const stats: Record<string, number> = {};
        
        for (const parser of this.parsers.values()) {
            const matches = Array.from(content.matchAll(parser.pattern));
            stats[parser.tagName] = matches.length;
        }
        
        return stats;
    }

    /**
     * Test if regex patterns are working with sample content
     */
    testPatterns(): void {
        const testCases = [
            'Text with [[RELATED-ARTICLE:uuid123]]Check out our article at [[ARTICLE-URL]] for more info.[[/RELATED-ARTICLE]] here',
            '**Não se desespere!** [[RELATED-ARTICLE:d28f34fa3e1d4691855a6d5d9e76eb3e]]Leia nosso artigo com [**casos reais de sucesso**]([[ARTICLE-URL]]) de pessoas que conseguiram o visto.[[/RELATED-ARTICLE]]',
            'Some text [[IF-FEATURE]]Show this if enabled[[CONTENT]]This is the content[[/IF-FEATURE]] more text.'
        ];

        for (const parser of this.parsers.values()) {
            console.log(`\n🧪 Testing ${parser.tagName} pattern: ${parser.pattern}`);
            
            testCases.forEach((testCase, index) => {
                const matches = Array.from(testCase.matchAll(parser.pattern));
                console.log(`  Test ${index + 1}: "${testCase}"`);
                console.log(`  Matches: ${matches.length}`);
                matches.forEach((match, matchIndex) => {
                    console.log(`    Match ${matchIndex + 1}:`, match);
                });
            });
        }
    }
}

// Export singleton instance
export const contentParser = new ContentParserService();

// Export convenience function
export async function parseContent(content: string, options: ParseOptions = {}): Promise<string> {
    const result = await contentParser.parseContent(content, options);
    return result.content;
}
