interface CreateSectionAndVersionParams {
    webpageRelativePath: string;
    title: string;
    updatableUuid: string;
    businessId: string;
}
import { prisma } from './prisma.js';
import crypto from 'crypto';
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
        if (!prisma) {
            console.error('[DEBUG] prisma is undefined or null!');
            throw new Error('Prisma client is not initialized');
        }
    return await prisma.$transaction(async (tx: any) => {
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
                throw err;
            }
            if (!webPage) {
                console.error('[DEBUG] webPage not found for', { webpageRelativePath, businessId });
                throw new Error('WebPage not found for given relative_path and business_id');
            }
            // 2. Find or create the WebPageSection
            let webPageSection;
            try {
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
                throw err;
            }
            if (!webPageSection) {
                try {
                    if (!businessId) {
                        throw new Error('businessId is undefined when creating web_page_section');
                    }
                    webPageSection = await tx.web_page_section.create({
                        data: {
                            id: crypto.randomUUID(),
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
                    throw err;
                }
            }
            const webPageSectionId = webPageSection.id;
            // 3. Count existing versions for this section
            let versionCount = 0;
            try {
                versionCount = await tx.web_page_section_version.count({
                    where: {
                        web_page_section_id: webPageSectionId,
                    },
                });
                console.log('[DEBUG] versionCount:', versionCount);
            } catch (err) {
                console.error('[DEBUG] Error counting webPageSectionVersion:', err);
                throw err;
            }
            const filePath = `${updatableUuid}_${versionCount + 1}`;
            // 4. Create the new version
            let webPageSectionVersion;
            try {
                if (!businessId) {
                    throw new Error('businessId is undefined when creating web_page_section_version');
                }
                webPageSectionVersion = await tx.web_page_section_version.create({
                    data: {
                        id: crypto.randomUUID(),
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
                throw err;
            }
            return {
                webPageSectionId,
                webPageSectionVersionId: webPageSectionVersion.id,
                filePath,
            };
        });
    }
}
