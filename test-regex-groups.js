#!/usr/bin/env node

// Test the exact regex pattern and groups from the content parser
const pattern = /\[\[HIDDEN-REF(?::([^\]]+))?\]\]([\s\S]*?)\[\[\/HIDDEN-REF\]\]/gi;

// Test with the actual content that's failing
const testContent = '**Não se desespere!** Nossa equipe de especialistas pode orientar você sobre os próximos passos. [[HIDDEN-REF]]Leia nosso artigo com [**casos reais de sucesso**]([[UUID:d28f34fa3e1d4691855a6d5d9e76eb3e]]) de pessoas que conseguiram o visto mesmo após uma negativa.[[/HIDDEN-REF]]';

console.log('🧪 Testing exact regex pattern groups\n');
console.log(`Pattern: ${pattern.toString()}\n`);

const matches = Array.from(testContent.matchAll(pattern));
console.log(`Found ${matches.length} matches:\n`);

matches.forEach((match, index) => {
    console.log(`Match ${index + 1}:`);
    console.log(`  Full match (match[0]): "${match[0].substring(0, 80)}..."`);
    console.log(`  Group 1 (UUID): ${match[1] === undefined ? 'undefined' : `"${match[1]}"`}`);
    console.log(`  Group 2 (content): "${match[2]?.substring(0, 60)}..."`);
    console.log(`  match[1] truthy: ${!!match[1]}`);
    console.log(`  match[1] defined: ${match[1] !== undefined}`);
    console.log();
});

// Test the validation logic
console.log('🔍 Validation analysis:');
if (matches.length > 0) {
    const match = matches[0];
    console.log(`For legacy format [[HIDDEN-REF]]content[[/HIDDEN-REF]]:`);
    console.log(`  match[1] (UUID group): ${match[1]}`);
    console.log(`  match[2] (content group): "${match[2]?.substring(0, 40)}..."`);
    console.log(`  parser.validate && match[1] would be: ${!!(true && match[1])}`);
    console.log(`  This means validation would be: ${match[1] ? 'run' : 'skipped'}`);
}
