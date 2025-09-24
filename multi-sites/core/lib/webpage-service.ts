interface CreateSectionAndVersionParams {
    webpageRelativePath: string;
    title: string;
    updatableUuid: string;
    businessId: string;
}
import { prisma } from './prisma.js';
export class WebPageService {
    /**
     * Create a WebPageSection and a new WebPageSectionVersion atomically.
     * - If the WebPageSection (by webpage, title, updatable_uuid) exists, use it; otherwise, create it.
     * - Then, create a new WebPageSectionVersion with file_path = `${updatableUuid}_${count}`
     * @param {string} webpageRelativePath - e.g. 'p2digital/pages/index.astro'
     * @param {string} title
     * @param {string} updatableUuid
     * @param {string} businessId
     * @returns {Promise<{ webPageSectionId: string, webPageSectionVersionId: string, filePath: string }>} ids and filePath
     */
    static async createSectionAndVersion({ webpageRelativePath, title, updatableUuid, businessId }: CreateSectionAndVersionParams) {
        console.log('[DEBUG] prisma:', prisma);
        if (!prisma) {
            console.error('[DEBUG] prisma is undefined or null!');
        }
    return await prisma.$transaction(async (tx: any) => {
            console.log('[DEBUG] tx:', tx);
            console.log('[DEBUG] tx.web_page:', tx.web_page);
            if (!tx.web_page) {
                console.error('[DEBUG] tx.web_page is undefined! Available keys:', Object.keys(tx));
            }
            // 1. Find the web_page by relative_path and business_id
            let webPage;
            try {
                webPage = await tx.web_page.findUnique({
                    where: {
                        relative_path: webpageRelativePath,
                        business_id: businessId,
                        is_removed: false,
                    },
                });
                console.log('[DEBUG] webPage:', webPage);
            } catch (err) {
                console.error('[DEBUG] Error calling tx.web_page.findUnique:', err);
            }
            if (!webPage) {
                console.error('[DEBUG] webPage not found for', { webpageRelativePath, businessId });
                throw new Error('WebPage not found for given relative_path and business_id');
            }
            // 2. Find or create the WebPageSection
            let webPageSection;
            try {
                console.log('[DEBUG] tx.web_page_section:', tx.web_page_section);
                webPageSection = await tx.web_page_section.findFirst({
                    where: {
                        web_page_id: webPage.id,
                        updatable_uuid: updatableUuid,
                        business_id: businessId,
                        is_removed: false,
                    },
                });
                console.log('[DEBUG] webPageSection:', webPageSection);
            } catch (err) {
                console.error('[DEBUG] Error calling tx.web_page_section.findFirst:', err);
            }
            if (!webPageSection) {
                try {
                    webPageSection = await tx.web_page_section.create({
                        data: {
                            title,
                            updatable_uuid: updatableUuid,
                            business_id: businessId,
                            web_page_id: webPage.id,
                            is_removed: false,
                            created: new Date(),
                            modified: new Date(),
                        },
                    });
                    console.log('[DEBUG] Created webPageSection:', webPageSection);
                } catch (err) {
                    console.error('[DEBUG] Error creating webPageSection:', err);
                }
            }
            const webPageSectionId = webPageSection.id;
            // 3. Count existing versions for this section
            let versionCount = 0;
            try {
                console.log('[DEBUG] tx.web_page_section_version:', tx.web_page_section_version);
                versionCount = await tx.web_page_section_version.count({
                    where: {
                        web_page_section_id: webPageSectionId,
                    },
                });
                console.log('[DEBUG] versionCount:', versionCount);
            } catch (err) {
                console.error('[DEBUG] Error counting webPageSectionVersion:', err);
            }
            const filePath = `${updatableUuid}_${versionCount + 1}`;
            // 4. Create the new version
            let webPageSectionVersion;
            try {
                webPageSectionVersion = await tx.web_page_section_version.create({
                    data: {
                        file_path: filePath,
                        business_id: businessId,
                        web_page_section_id: webPageSectionId,
                        is_removed: false,
                        created: new Date(),
                        modified: new Date(),
                    },
                });
                console.log('[DEBUG] Created webPageSectionVersion:', webPageSectionVersion);
            } catch (err) {
                console.error('[DEBUG] Error creating webPageSectionVersion:', err);
            }
            return {
                webPageSectionId,
                webPageSectionVersionId: webPageSectionVersion.id,
                filePath,
            };
        });
    }
}
