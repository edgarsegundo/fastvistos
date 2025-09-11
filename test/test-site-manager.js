#!/usr/bin/env node

// Test file to demonstrate site-manager.ts usage
// Run with: node test-site-manager.js

import { siteManager } from '../multi-sites/core/lib/site-manager.ts';

async function testSiteManager() {
  #!/usr/bin/env node

// Test file to demonstrate simple site-config usage
import { SiteConfigHelper } from './multi-sites/core/lib/site-config.ts';
import { siteConfig as fastvistos } from './multi-sites/sites/fastvistos/site-config.ts';
import { siteConfig as conceptvistos } from './multi-sites/sites/conceptvistos/site-config.ts';
import { siteConfig as vibecode } from './multi-sites/sites/vibecode/site-config.ts';

function testSiteConfigs() {
  console.log('🧪 Testing Simple Site Configs
');

  const sites = { fastvistos, conceptvistos, vibecode };

  // Test 1: Basic config access
  console.log('1️⃣ Testing direct config access...');
  Object.values(sites).forEach(site => {
    console.log(`✅ ${site.name}: ${site.domain} (${site.primaryColor})`);
  });

  // Test 2: Helper functions
  console.log('
2️⃣ Testing helper functions...');
  const metadata = SiteConfigHelper.getMetadata(fastvistos, 'Blog', 'Custom description');
  console.log(`✅ Metadata: ${metadata.title}`);
  
  const cssVars = SiteConfigHelper.getCssVariables(conceptvistos);
  console.log(`✅ CSS Variables: ${JSON.stringify(cssVars, null, 2)}`);

  const hasBlog = SiteConfigHelper.hasFeature(vibecode, 'blog');
  console.log(`✅ VibeCode has blog: ${hasBlog}`);

  const whatsappLink = SiteConfigHelper.getWhatsAppLink(fastvistos, 'Olá! Gostaria de saber sobre vistos.');
  console.log(`✅ WhatsApp link: ${whatsappLink}`);

  const bookingUrl = SiteConfigHelper.getBookingUrl(conceptvistos);
  console.log(`✅ Booking URL: ${bookingUrl}`);

  console.log('
🎉 All tests completed successfully!');
  
  // Show usage examples
  console.log('
📖 Usage Examples:');
  console.log(`
// In an Astro component:
---
import { siteConfig } from '../site-config.ts';
import { SiteConfigHelper } from '../../core/lib/site-config.ts';

// Direct access
const siteName = siteConfig.name;
const primaryColor = siteConfig.primaryColor;

// Helper functions
const metadata = SiteConfigHelper.getMetadata(siteConfig);
const cssVars = SiteConfigHelper.getCssVariables(siteConfig);
const hasBooking = SiteConfigHelper.hasFeature(siteConfig, 'booking');
---

<html>
  <head>
    <title>{metadata.title}</title>
    <style>
      :root { {Object.entries(cssVars).map(([k,v]) => `\${k}: \${v};`).join(' ')} }
    </style>
  </head>
  <body>
    <h1 style="color: {siteConfig.primaryColor}">{siteConfig.name}</h1>
    {hasBooking && <button>Book Now</button>}
  </body>
</html>
`);
}

testSiteConfigs();

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
