#!/usr/bin/env node

// Test the new RELATED-ARTICLE format
const testContent = `**Não se desespere!** Nossa equipe de especialistas pode orientar você sobre os próximos passos. [[RELATED-ARTICLE:d28f34fa3e1d4691855a6d5d9e76eb3e]]Leia nosso artigo com [**casos reais de sucesso**]([[ARTICLE-URL]]) de pessoas que conseguiram o visto mesmo após uma negativa.[[/RELATED-ARTICLE]]`;

console.log('🧪 Testing RELATED-ARTICLE parser pattern\n');

const pattern = /\[\[RELATED-ARTICLE:([^\]]+)\]\]([\s\S]*?)\[\[\/RELATED-ARTICLE\]\]/gi;

console.log(`Pattern: ${pattern.toString()}\n`);
console.log(`Test content: "${testContent}"\n`);

const matches = Array.from(testContent.matchAll(pattern));

console.log(`Matches found: ${matches.length}`);

if (matches.length > 0) {
    matches.forEach((match, index) => {
        console.log(`\n  Match ${index + 1}:`);
        console.log(`    Full match: "${match[0]}"`);
        console.log(`    UUID (group 1): "${match[1]}"`);
        console.log(`    Content template (group 2): "${match[2]}"`);
        
        // Test the replacement
        const processedContent = match[2].replace(/\[\[ARTICLE-URL\]\]/g, '/blog/test-article-slug');
        console.log(`    After URL replacement: "${processedContent}"`);
    });
    
    // Test content after processing
    let finalContent = testContent;
    matches.forEach(match => {
        const processedContent = match[2].replace(/\[\[ARTICLE-URL\]\]/g, '/blog/test-article-slug');
        finalContent = finalContent.replace(match[0], processedContent);
    });
    
    console.log(`\n🔄 Final processed content:`);
    console.log(`"${finalContent}"`);
} else {
    console.log('❌ No matches found');
}
