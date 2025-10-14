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
 * Supports two formats:
 * 1. [[HIDDEN-REF:uuid]]content[[/HIDDEN-REF]] - Show content if article with uuid exists and is published
 * 2. [[HIDDEN-REF]]uuid[[/HIDDEN-REF]] - Show uuid if article exists and is published (legacy format)
 */
export class HiddenRefParser implements TagParser {
    tagName = 'HIDDEN-REF';
    
    // Matches both formats: [[HIDDEN-REF:uuid]]content[[/HIDDEN-REF]] or [[HIDDEN-REF]]content[[/HIDDEN-REF]]
    pattern = /\[\[HIDDEN-REF(?::([^\]]+))?\]\]([\s\S]*?)\[\[\/HIDDEN-REF\]\]/gi;
    
    async parse(match: RegExpMatchArray, context?: ParseContext): Promise<string> {
        const fullMatch = match[0];
        const explicitUuid = match[1]?.trim(); // UUID from [[HIDDEN-REF:uuid]]
        const content = match[2]?.trim(); // Content between tags
        
        // Determine UUID and content based on format
        let uuidToCheck: string;
        let contentToShow: string;
        
        if (explicitUuid) {
            // New format: [[HIDDEN-REF:uuid]]content[[/HIDDEN-REF]]
            uuidToCheck = explicitUuid;
            contentToShow = content;
            
            if (context?.debug) {
                console.log(`🔍 HIDDEN-REF: New format detected - UUID: ${uuidToCheck}, Content: "${contentToShow.substring(0, 50)}..."`);
            }
        } else {
            // Legacy format: [[HIDDEN-REF]]uuid[[/HIDDEN-REF]]
            uuidToCheck = content;
            contentToShow = content;
            
            if (context?.debug) {
                console.log(`🔍 HIDDEN-REF: Legacy format detected - UUID: ${uuidToCheck}`);
            }
        }
        
        // Validate UUID
        if (!uuidToCheck) {
            if (context?.debug) {
                console.log(`🔍 HIDDEN-REF: Empty UUID found, removing tag`);
            }
            return '';
        }
        
        try {
            // Check if article exists and is published
            const isPublished = await BlogService.isArticlePublished(uuidToCheck);
            
            if (isPublished) {
                if (context?.debug) {
                    console.log(`✅ HIDDEN-REF: UUID ${uuidToCheck} is published, showing content: "${contentToShow.substring(0, 50)}..."`);
                }
                return contentToShow; // Return the content (remove tags)
            } else {
                if (context?.debug) {
                    console.log(`❌ HIDDEN-REF: UUID ${uuidToCheck} not published or doesn't exist, removing content`);
                }
                return ''; // Remove entire tag and content
            }
        } catch (error) {
            if (context?.debug) {
                console.error(`🚫 HIDDEN-REF: Error checking UUID ${uuidToCheck}:`, error);
            }
            return ''; // On error, remove content for safety
        }
    }
    
    validate(content: string): boolean {
        // Allow any non-empty content since it could be either UUID or display text
        return content.trim().length > 0;
    }
    
    preProcess(content: string): string {
        // Normalize line endings and trim whitespace, handle both formats
        return content
            .replace(/\[\[HIDDEN-REF\]\]\s*(.*?)\s*\[\[\/HIDDEN-REF\]\]/gis, '[[HIDDEN-REF]]$1[[/HIDDEN-REF]]')
            .replace(/\[\[HIDDEN-REF:([^:\]]+)\]\]\s*(.*?)\s*\[\[\/HIDDEN-REF\]\]/gis, '[[HIDDEN-REF:$1]]$2[[/HIDDEN-REF]]');
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
                // Create fresh regex to avoid global flag state issues
                const freshPattern = new RegExp(parser.pattern.source, parser.pattern.flags);
                const matches = Array.from(currentContent.matchAll(freshPattern));
                result.stats.totalMatches += matches.length;
                
                if (opts.debug && parser.tagName === 'HIDDEN-REF') {
                    console.log(`🔍 ${parser.tagName} - Found ${matches.length} matches in iteration ${iteration + 1}`);
                    if (matches.length === 0) {
                        console.log(`📄 Content length: ${currentContent.length} chars`);
                        console.log(`🎯 Pattern: ${parser.pattern.toString()}`);
                        // Show a snippet around potential HIDDEN-REF tags
                        const hiddenRefIndex = currentContent.indexOf('[[HIDDEN-REF');
                        if (hiddenRefIndex >= 0) {
                            const start = Math.max(0, hiddenRefIndex - 50);
                            const end = Math.min(currentContent.length, hiddenRefIndex + 200);
                            console.log(`📝 Content around HIDDEN-REF: "${currentContent.substring(start, end)}"`);
                        }
                    }
                }
                
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
            'Text with [[HIDDEN-REF]]uuid123[[/HIDDEN-REF]] here',
            'Text with [[HIDDEN-REF:uuid123]]content here[[/HIDDEN-REF]] here',
            'Não se desespere! [[HIDDEN-REF]]Leia nosso artigo[[/HIDDEN-REF]] mais texto.'
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
