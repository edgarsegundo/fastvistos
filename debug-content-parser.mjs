#!/usr/bin/env node

/**
 * Debugging script for content parser
 * Run with: node debug-content-parser.mjs
 * Then use VS Code debugger or add debugger; statements
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

// This will be easier to debug than importing TypeScript directly
console.log('🐛 Content Parser Debug Script');
console.log('=====================================');

// Read the actual blog post file that's causing issues
async function debugContentParser() {
    try {
        console.log('📁 Reading blog file...');
        const blogPath = './multi-sites/sites/fastvistos/content/blog/como-consultar-o-status-do-visto-americano-no-site.md';
        const fileContent = await readFile(blogPath, 'utf-8');
        
        // Extract markdown content (skip frontmatter)
        const contentParts = fileContent.split('---');
        const markdownContent = contentParts.slice(2).join('---').trim();
        
        console.log('📄 Blog content loaded');
        console.log(`📊 Content length: ${markdownContent.length} characters`);
        
        // Test RELATED-ARTICLE pattern matching
        console.log('\n🔍 Testing RELATED-ARTICLE pattern...');
        const relatedArticlePattern = /\[\[RELATED-ARTICLE:([^\]]+)\]\]([\s\S]*?)\[\[\/RELATED-ARTICLE\]\]/gi;
        
        console.log(`🎯 Pattern: ${relatedArticlePattern.toString()}`);
        
        const matches = [...markdownContent.matchAll(relatedArticlePattern)];
        console.log(`🔍 Matches found: ${matches.length}`);
        
        if (matches.length > 0) {
            matches.forEach((match, index) => {
                console.log(`\n📌 Match ${index + 1}:`);
                console.log(`   Full match: "${match[0]}"`);
                console.log(`   UUID (group 1): "${match[1]}"`);
                console.log(`   Content template (group 2): "${match[2]}"`);
                console.log(`   Contains [[ARTICLE-URL]]: ${match[2].includes('[[ARTICLE-URL]]')}`);
                
                // Test URL replacement
                const processedContent = match[2].replace(/\[\[ARTICLE-URL\]\]/g, '/blog/test-slug');
                console.log(`   After URL replacement: "${processedContent}"`);
                
                // Add debugger here for inspection
                debugger; // 🔍 BREAKPOINT: Inspect match details
            });
        } else {
            console.log('❌ No RELATED-ARTICLE matches found');
            
            // Check if the pattern exists as text
            if (markdownContent.includes('RELATED-ARTICLE')) {
                console.log('⚠️  But "RELATED-ARTICLE" text was found in content');
                const index = markdownContent.indexOf('RELATED-ARTICLE');
                const context = markdownContent.substring(Math.max(0, index - 100), index + 200);
                console.log(`📝 Context: "${context}"`);
            }
        }
        
        console.log('\n✅ Debug analysis complete');
        
    } catch (error) {
        console.error('❌ Error during debugging:', error);
    }
}

// Run the debug function
debugContentParser();
