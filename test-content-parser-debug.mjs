#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { join } from 'path';

// Import the content parser
const { contentParser } = await import('./multi-sites/core/lib/content-parser.ts');

console.log('🧪 Testing ContentParser with actual blog file\n');

// Read the actual blog post file
const blogPath = './multi-sites/sites/fastvistos/content/blog/como-consultar-o-status-do-visto-americano-no-site.md';
const fileContent = await readFile(blogPath, 'utf-8');

// Extract just the markdown content (skip frontmatter)
const contentParts = fileContent.split('---');
const markdownContent = contentParts.slice(2).join('---').trim();

console.log('📄 Blog file loaded');
console.log(`Content length: ${markdownContent.length} characters`);
console.log(`First 200 chars: "${markdownContent.substring(0, 200)}..."`);
console.log();

// Test hasParseableTags
console.log('🔍 Testing hasParseableTags...');
const hasParseableTags = contentParser.hasParseableTags(markdownContent);
console.log(`Result: ${hasParseableTags}`);
console.log();

if (hasParseableTags) {
    console.log('✅ Parser detected parseable tags! Proceeding with parsing...');
    
    try {
        const parseResult = await contentParser.parseContent(markdownContent, {
            debug: true,
            context: {
                articleSlug: 'test-slug',
                articleId: 'test-id',
                businessId: 'test-business-id',
                debug: true
            }
        });
        
        console.log(`📊 Parse Results:`);
        console.log(`  Tags processed: ${parseResult.tagsProcessed}`);
        console.log(`  Errors: ${parseResult.stats.errors}`);
        console.log(`  Content changed: ${parseResult.content !== markdownContent}`);
        
        if (parseResult.content !== markdownContent) {
            console.log(`\n🔄 Content was modified`);
            console.log(`Original length: ${markdownContent.length}`);
            console.log(`Parsed length: ${parseResult.content.length}`);
            
            // Show where HIDDEN-REF was found and removed
            const hiddenRefPattern = /\[\[HIDDEN-REF(?::([^\]]+))?\]\]([\s\S]*?)\[\[\/HIDDEN-REF\]\]/gi;
            const matches = [...markdownContent.matchAll(hiddenRefPattern)];
            
            console.log(`\n🎯 HIDDEN-REF matches found: ${matches.length}`);
            matches.forEach((match, index) => {
                console.log(`  Match ${index + 1}: "${match[0].substring(0, 50)}..."`);
            });
        } else {
            console.log(`\n❌ Content was NOT modified - no tags were actually processed`);
        }
        
    } catch (error) {
        console.error('❌ Error during parsing:', error);
    }
} else {
    console.log('❌ No parseable tags detected');
    
    // Debug: Let's manually check for HIDDEN-REF
    const hiddenRefPattern = /\[\[HIDDEN-REF(?::([^\]]+))?\]\]([\s\S]*?)\[\[\/HIDDEN-REF\]\]/gi;
    const manualMatches = [...markdownContent.matchAll(hiddenRefPattern)];
    
    console.log(`\n🔍 Manual regex check found: ${manualMatches.length} HIDDEN-REF matches`);
    if (manualMatches.length > 0) {
        console.log('⚠️  This suggests an issue with hasParseableTags method!');
        manualMatches.forEach((match, index) => {
            console.log(`  Match ${index + 1}: "${match[0].substring(0, 80)}..."`);
        });
    }
}
