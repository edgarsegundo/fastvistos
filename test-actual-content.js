#!/usr/bin/env node

console.log('🧪 Testing HIDDEN-REF regex with actual blog content\n');

const pattern = /\[\[HIDDEN-REF(?::([^\]]+))?\]\]([\s\S]*?)\[\[\/HIDDEN-REF\]\]/gi;

// Actual content from the blog post
const actualContent = `**Não se desespere!** Nossa equipe de especialistas pode orientar você sobre os próximos passos. [[HIDDEN-REF]]Leia nosso artigo com [**casos reais de sucesso**]([[UUID:d28f34fa3e1d4691855a6d5d9e76eb3e]]) de pessoas que conseguiram o visto mesmo após uma negativa.[[/HIDDEN-REF]]`;

console.log(`Pattern: ${pattern}\n`);
console.log(`📝 Testing actual blog content:`);
console.log(`Input: "${actualContent.substring(0, 100)}..."`);
console.log();

const matches = [...actualContent.matchAll(pattern)];

console.log(`Matches found: ${matches.length}`);

matches.forEach((match, index) => {
    console.log(`  Match ${index + 1}:`);
    console.log(`    Full match: "${match[0]}"`);
    console.log(`    UUID (group 1): "${match[1] || 'N/A (legacy format)'}"`);
    console.log(`    Content (group 2): "${match[2]}"`);
});

// Test the content that would remain after parsing
if (matches.length > 0) {
    let processedContent = actualContent;
    matches.forEach(match => {
        processedContent = processedContent.replace(match[0], '');
    });
    
    console.log('\n🔄 Content after HIDDEN-REF removal:');
    console.log(`"${processedContent}"`);
} else {
    console.log('\n❌ No matches found - content would remain unchanged');
}
