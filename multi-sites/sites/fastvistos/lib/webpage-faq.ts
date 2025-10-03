import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WebpageFaqService {
    /**
     * Get FAQ list for a given relative_path (from web_page model)
     * Returns an array of { question, answer } objects
     */
    static async getPageFaqList(relative_path: string) {
        // Find the web_page record by relative_path
        const webPage = await prisma.web_page.findUnique({
            where: { relative_path },
        });
        if (!webPage) return [];
        // Find all web_page_faq records linked to this web_page
            const faqList = await prisma.web_page_faq.findMany({
                where: {
                    web_page_id: webPage.id,
                    is_removed: false,
                    published: true,
                    is_visible: true,
                },
                select: {
                    question: true,
                    answer: true,
                },
                orderBy: {
                    order: 'asc',
                },
            });
        return faqList;
    }
}

