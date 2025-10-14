#!/usr/bin/env node

import { parseHiddenRefs } from './multi-sites/core/lib/utils.js';

// Mock function to simulate article existence checks
async function mockArticleCheck(uuid) {
    // Simulate some articles being published and others not
    const publishedArticles = [
        'published-uuid-1',
        'published-uuid-2',
        'abc123',
        'valid-article-id'
    ];
    
    console.log(`🔍 Checking UUID: ${uuid} - ${publishedArticles.includes(uuid) ? 'PUBLISHED' : 'NOT FOUND/UNPUBLISHED'}`);
    return publishedArticles.includes(uuid);
}

// Test cases
const testCases = [
    {
        name: 'Single published article',
        content: 'This is content with [[HIDDEN-REF]]published-uuid-1[[/HIDDEN-REF]] inside.',
        expected: 'This is content with published-uuid-1 inside.'
    },
    {
        name: 'Single unpublished article',
        content: 'This is content with [[HIDDEN-REF]]unpublished-uuid[[/HIDDEN-REF]] inside.',
        expected: 'This is content with  inside.'
    },
    {
        name: 'Multiple mixed articles',
        content: 'Start [[HIDDEN-REF]]published-uuid-1[[/HIDDEN-REF]] middle [[HIDDEN-REF]]unpublished-uuid[[/HIDDEN-REF]] end [[HIDDEN-REF]]published-uuid-2[[/HIDDEN-REF]] final.',
        expected: 'Start published-uuid-1 middle  end published-uuid-2 final.'
    },
    {
        name: 'Empty UUID',
        content: 'Content with [[HIDDEN-REF]][[/HIDDEN-REF]] empty uuid.',
        expected: 'Content with  empty uuid.'
    },
    {
        name: 'No HIDDEN-REF tags',
        content: 'This content has no hidden references.',
        expected: 'This content has no hidden references.'
    },
    {
        name: 'Complex content with markdown',
        content: `# Title
        
Some text [[HIDDEN-REF]]published-uuid-1[[/HIDDEN-REF]] more text.

## Section

Another paragraph [[HIDDEN-REF]]unpublished-uuid[[/HIDDEN-REF]] and [[HIDDEN-REF]]published-uuid-2[[/HIDDEN-REF]] final text.`,
        expected: `# Title
        
Some text published-uuid-1 more text.

## Section

Another paragraph  and published-uuid-2 final text.`
    }
];

async function runTests() {
    console.log('🧪 Running HIDDEN-REF Parser Tests\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const testCase of testCases) {
        console.log(`📝 Test: ${testCase.name}`);
        console.log(`📄 Input: ${testCase.content.replace(/\n/g, '\\n')}`);
        
        try {
            const result = await parseHiddenRefs(testCase.content, mockArticleCheck);
            console.log(`✅ Output: ${result.replace(/\n/g, '\\n')}`);
            
            // Normalize whitespace for comparison
            const normalizedResult = result.replace(/\s+/g, ' ').trim();
            const normalizedExpected = testCase.expected.replace(/\s+/g, ' ').trim();
            
            if (normalizedResult === normalizedExpected) {
                console.log('✅ PASSED\n');
                passed++;
            } else {
                console.log('❌ FAILED');
                console.log(`Expected: ${normalizedExpected}`);
                console.log(`Got:      ${normalizedResult}\n`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}\n`);
            failed++;
        }
    }
    
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️  Some tests failed. Please review the implementation.');
    }
}

// Run the tests
runTests().catch(console.error);
