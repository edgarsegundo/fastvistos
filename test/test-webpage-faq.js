import { WebpageFaqService } from '../multi-sites/core/lib/webpage-faq.js';

async function testGetPageFaqList() {
    const relativePath = 'multi-sites/sites/fastvistos/components/FaqSection.astro';
    const faqList = await WebpageFaqService.getPageFaqList(relativePath);
    console.log('FAQ List for relative_path:', relativePath);
    console.log(faqList);
}

testGetPageFaqList().catch(console.error);
