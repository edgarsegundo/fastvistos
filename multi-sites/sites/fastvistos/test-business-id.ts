import { siteConfig } from './site-config.ts';

console.log('🔍 Testing business_id extraction:');
console.log('Site ID:', siteConfig.id);
console.log('Business ID:', siteConfig.business_id);
console.log('Site Name:', siteConfig.name);

if (siteConfig.business_id) {
    console.log('✅ business_id found and ready for filtering');
} else {
    console.log('❌ business_id missing!');
}
