#!/usr/bin/env node

// Test file to demonstrate simple site-config usage
import { SiteConfigHelper } from '../multi-sites/core/lib/site-config.ts';
import { siteConfig as fastvistos } from '../multi-sites/sites/fastvistos/site-config.ts';
import { siteConfig as conceptvistos } from '../multi-sites/sites/conceptvistos/site-config.ts';
import { siteConfig as vibecode } from '../multi-sites/sites/vibecode/site-config.ts';

function testSiteConfigs() {
  console.log('🧪 Testing Simple Site Configs\n');

  const sites = { fastvistos, conceptvistos, vibecode };

  // Test 1: Basic config access
  console.log('1️⃣ Testing direct config access...');
  Object.values(sites).forEach(site => {
    console.log(`✅ ${site.name}: ${site.domain} (${site.primaryColor})`);
  });

  // Test 2: Helper functions
  console.log('\n2️⃣ Testing helper functions...');
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

  console.log('\n🎉 All tests completed successfully!');
}

testSiteConfigs();
