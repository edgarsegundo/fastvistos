#!/usr/bin/env node

import { readFile } from 'fs/promises';

console.log('🧪 Testing HIDDEN-REF detection in actual blog file\n');

// Read the actual blog post file
const blogPath = './multi-sites/sites/fastvistos/content/blog/como-consultar-o-status-do-visto-americano-no-site.md';
const fileContent = await readFile(blogPath, 'utf-8');

// Extract just the markdown content (skip frontmatter)
const contentParts = fileContent.split('---');
const markdownContent = contentParts.slice(2).join('---').trim();

console.log('📄 Blog file loaded');
console.log(`Content length: ${markdownContent.length} characters`);
console.log();

// Test manual HIDDEN-REF detection
const hiddenRefPattern = /\[\[HIDDEN-REF(?::([^\]]+))?\]\]([\s\S]*?)\[\[\/HIDDEN-REF\]\]/gi;
const matches = [...markdownContent.matchAll(hiddenRefPattern)];

console.log(`🔍 Manual HIDDEN-REF detection:`);
console.log(`Matches found: ${matches.length}`);

if (matches.length > 0) {
    matches.forEach((match, index) => {
        console.log(`\n  Match ${index + 1}:`);
        console.log(`    Full match: "${match[0].substring(0, 100)}${match[0].length > 100 ? '...' : ''}"`);
        console.log(`    Content to be removed: "${match[2].substring(0, 60)}${match[2].length > 60 ? '...' : ''}"`);
    });

    // Show the content after removal
    let processedContent = markdownContent;
    matches.forEach(match => {
        processedContent = processedContent.replace(match[0], '');
    });

    console.log(`\n🔄 After HIDDEN-REF removal:`);
    console.log(`Original length: ${markdownContent.length}`);
    console.log(`Processed length: ${processedContent.length}`);
    console.log(`Characters removed: ${markdownContent.length - processedContent.length}`);
    
    // Show the area around where the content was
    const originalIndex = markdownContent.indexOf(matches[0][0]);
    const contextBefore = markdownContent.substring(Math.max(0, originalIndex - 50), originalIndex);
    const contextAfter = markdownContent.substring(originalIndex + matches[0][0].length, originalIndex + matches[0][0].length + 50);
    
    console.log(`\n📍 Context around HIDDEN-REF (original):`);
    console.log(`Before: "...${contextBefore}"`);
    console.log(`HIDDEN-REF: "${matches[0][0].substring(0, 50)}..."`);
    console.log(`After: "${contextAfter}..."`);
    
    // Show what it looks like after processing
    const processedIndex = processedContent.indexOf(contextBefore) + contextBefore.length;
    const processedAfter = processedContent.substring(processedIndex, processedIndex + 50);
    
    console.log(`\n📍 Context after HIDDEN-REF removal:`);
    console.log(`Before: "...${contextBefore}"`);
    console.log(`After: "${processedAfter}..."`);
    
} else {
    console.log('❌ No HIDDEN-REF tags found in the content');
    
    // Let's check if HIDDEN-REF appears as plain text
    if (markdownContent.includes('HIDDEN-REF')) {
        console.log('⚠️  But "HIDDEN-REF" text was found in the content');
        const index = markdownContent.indexOf('HIDDEN-REF');
        const context = markdownContent.substring(Math.max(0, index - 50), index + 100);
        console.log(`Context: "${context}"`);
    }
}
