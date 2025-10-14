#!/usr/bin/env node

// Test script for HIDDEN-REF regex pattern
const pattern = /\[\[HIDDEN-REF(?::([^\]]+))?\]\]([\s\S]*?)\[\[\/HIDDEN-REF\]\]/gi;

const testCases = [
    'Text with [[HIDDEN-REF]]uuid123[[/HIDDEN-REF]] here',
    'Text with [[HIDDEN-REF:uuid123]]content here[[/HIDDEN-REF]] here',
    'Não se desespere! [[HIDDEN-REF]]Leia nosso artigo com casos reais de sucesso de pessoas que conseguiram o visto mesmo após uma negativa.[[/HIDDEN-REF]] mais texto.',
    'Another test [[HIDDEN-REF:abc123]]This is some content that should show[[/HIDDEN-REF]] end.',
    'Multi\nline [[HIDDEN-REF]]content\nwith\nbreaks[[/HIDDEN-REF]] test'
];

console.log('🧪 Testing HIDDEN-REF regex pattern\n');
console.log(`Pattern: ${pattern}\n`);

testCases.forEach((testCase, index) => {
    console.log(`📝 Test Case ${index + 1}:`);
    console.log(`Input: "${testCase}"`);
    
    const matches = Array.from(testCase.matchAll(pattern));
    console.log(`Matches found: ${matches.length}`);
    
    matches.forEach((match, matchIndex) => {
        console.log(`  Match ${matchIndex + 1}:`);
        console.log(`    Full match: "${match[0]}"`);
        console.log(`    UUID (group 1): "${match[1] || 'N/A'}"`);
        console.log(`    Content (group 2): "${match[2]}"`);
    });
    
    console.log('---\n');
});

// Test the specific case from the user
const userCase = `Não se desespere! Nossa equipe de especialistas pode orientar você sobre os próximos passos. [[HIDDEN-REF]]Leia nosso artigo com casos reais de sucesso de pessoas que conseguiram o visto mesmo após uma negativa.[[/HIDDEN-REF]]`;

console.log('🎯 User Specific Test:');
console.log(`Input: "${userCase}"`);

const userMatches = Array.from(userCase.matchAll(pattern));
console.log(`Matches found: ${userMatches.length}`);

userMatches.forEach((match, matchIndex) => {
    console.log(`  Match ${matchIndex + 1}:`);
    console.log(`    Full match: "${match[0]}"`);
    console.log(`    UUID (group 1): "${match[1] || 'N/A (legacy format)'}"`);
    console.log(`    Content (group 2): "${match[2]}"`);
});
