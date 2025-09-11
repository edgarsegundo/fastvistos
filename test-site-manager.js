#!/usr/bin/env node

// Test file to demonstrate site-manager.ts usage
// Run with: node test-site-manager.js

import { siteManager } from './multi-sites/core/lib/site-manager.ts';

async function testSiteManager() {
  console.log('🧪 Testing Site Manager\n');

  try {
    // Test 1: Initialize and get site config in one call
    console.log('1️⃣ Testing initialization (returns config directly)...');
    const currentSite = await siteManager.init('fastvistos');
    console.log(`✅ Loaded site: ${currentSite.name} (${currentSite.id})`);
    console.log(`   Domain: ${currentSite.domain}`);
    console.log(`   Primary Color: ${currentSite.primaryColor}`);
    console.log(`   Features: Blog=${currentSite.features.blog}, Booking=${currentSite.features.booking}\n`);

    // Test 2: Load other site configs (independent of current site)
    console.log('2️⃣ Testing loading other site configs...');
    const allSites = ['fastvistos', 'conceptvistos', 'vibecode'];
    
    for (const siteId of allSites) {
      const site = await siteManager.loadOtherSite(siteId);
      if (site) {
        console.log(`✅ ${site.name}:`);
        console.log(`   ID: ${site.id}`);
        console.log(`   Domain: ${site.domain}`);
        console.log(`   Colors: ${site.primaryColor} / ${site.secondaryColor}`);
        console.log(`   Contact: ${site.contactEmail}`);
        console.log(`   Social Media: ${Object.keys(site.socialMedia).join(', ')}`);
        console.log(`   SEO Title: ${site.seo.title}`);
        console.log('');
      } else {
        console.log(`❌ Failed to load ${siteId}`);
      }
    }

    // Test 3: Initialize by domain
    console.log('3️⃣ Testing initialization by domain...');
    const conceptSite = await siteManager.init('conceptvistos.com.br');
    console.log(`✅ Loaded by domain: ${conceptSite.name}`);
    console.log(`   Multilingual: ${conceptSite.features.multilingual}`);
    console.log(`   CSS Variables: ${JSON.stringify(conceptSite.customStyles.cssVars, null, 2)}\n`);

    // Test 4: Using current site after initialization
    console.log('4️⃣ Testing current site access...');
    const currentSiteAgain = siteManager.getCurrentSite();
    console.log(`✅ getCurrentSite(): ${currentSiteAgain.name}`);
    
    const specificSite = await siteManager.loadOtherSite('vibecode');
    console.log(`✅ loadOtherSite('vibecode'): ${specificSite.name}`);
    console.log(`   Features: ${JSON.stringify(specificSite.features, null, 2)}\n`);

    // Test 5: Environment simulation
    console.log('5️⃣ Testing environment detection...');
    
    // Simulate different environments
    const envTests = [
      { env: 'fastvistos.com.br', expected: 'fastvistos' },
      { env: 'conceptvistos.com.br', expected: 'conceptvistos' },
      { env: 'vibecode-lovable.com.br', expected: 'vibecode' },
      { env: 'unknown-domain.com', expected: 'fastvistos' }
    ];

    for (const test of envTests) {
      const siteId = siteManager.getSiteIdByDomain(test.env);
      const match = siteId === test.expected ? '✅' : '❌';
      console.log(`${match} Domain "${test.env}" → Site ID: "${siteId}" (expected: "${test.expected}")`);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}


// Run the tests
testSiteManager().then(() => {
    console.log('🛑 Test script finished.');
});
