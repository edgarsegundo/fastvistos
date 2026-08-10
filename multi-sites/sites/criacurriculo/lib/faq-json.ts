// FAQ Section Component with inline data
import { WebpageFaqService } from './webpage-faq';

// Define the FAQ type for better type safety
export type Faq = {
    question: string;
    answer: string;
};

export async function getFaqJson(siteId: string): Promise<Faq[]> {
    let faqData: Faq[] = [];
    try {
        faqData = await WebpageFaqService.getPageFaqList(
            `multi-sites/sites/${siteId}/components/FaqSection.astro`
        );
    } catch (err) {
        faqData = [];
    }
    return faqData;
}