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
 * Hidden Reference Tag Parser
 * Handles [[HIDDEN-REF]]uuid[[/HIDDEN-REF]] tags
 */
export class HiddenRefParser implements TagParser {
    tagName = 'HIDDEN-REF';
    
    // Matches [[HIDDEN-REF]]content[[/HIDDEN-REF]] (case-insensitive, multiline)
    pattern = /\[\[HIDDEN-REF\]\](.*?)\[\[\/HIDDEN-REF\]\]/gis;
    
    async parse(match: RegExpMatchArray, context?: ParseContext): Promise<string> {
        const fullMatch = match[0];
        const uuid = match[1]?.trim();
        
        // Validate UUID
        if (!uuid) {
            if (context?.debug) {
                console.log(`🔍 HIDDEN-REF: Empty UUID found, removing tag`);
            }
            return '';
        }
        
        try {
            // Check if article exists and is published
            const isPublished = await BlogService.isArticlePublished(uuid);
            
            if (isPublished) {
                if (context?.debug) {
                    console.log(`✅ HIDDEN-REF: UUID ${uuid} is published, showing content`);
                }
                return uuid; // Return the UUID content (remove tags)
            } else {
                if (context?.debug) {
                    console.log(`❌ HIDDEN-REF: UUID ${uuid} not published or doesn't exist, removing content`);
                }
                return ''; // Remove entire tag and content
            }
        } catch (error) {
            if (context?.debug) {
                console.error(`🚫 HIDDEN-REF: Error checking UUID ${uuid}:`, error);
            }
            return ''; // On error, remove content for safety
        }
    }
    
    validate(content: string): boolean {
        // Basic UUID validation (can be enhanced)
        return content.trim().length > 0 && content.trim().length <= 100;
    }
    
    preProcess(content: string): string {
        // Normalize line endings and trim whitespace around UUIDs
        return content.replace(/\[\[HIDDEN-REF\]\]\s*(.*?)\s*\[\[\/HIDDEN-REF\]\]/gis, 
                            '[[HIDDEN-REF]]$1[[/HIDDEN-REF]]');
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
        this.registerParser(new HiddenRefParser());
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
        
        // Main parsing loop
        while (iteration < (opts.maxIterations || 10)) {
            let hasChanges = false;
            
            for (const parser of parsersToUse) {
                const matches = Array.from(currentContent.matchAll(parser.pattern));
                result.stats.totalMatches += matches.length;
                
                if (matches.length === 0) continue;
                
                for (const match of matches) {
                    const originalMatch = match[0];
                    const beforeContent = currentContent;
                    
                    try {
                        // Validation
                        if (!opts.skipValidation && parser.validate && match[1]) {
                            if (!parser.validate(match[1])) {
                                if (opts.debug) {
                                    console.warn(`⚠️  Validation failed for ${parser.tagName}: ${match[1]}`);
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
            if (parser.pattern.test(content)) {
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
}

// Export singleton instance
export const contentParser = new ContentParserService();

// Export convenience function
export async function parseContent(content: string, options: ParseOptions = {}): Promise<string> {
    const result = await contentParser.parseContent(content, options);
    return result.content;
}
