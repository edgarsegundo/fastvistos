
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
    static async createSectionAndVersion({ webpageRelativePath, title, updatableUuid, businessId }: { webpageRelativePath: string, title: string, updatableUuid: string, businessId: string }) {
    return await prisma.$transaction(async (tx: any) => {
            // 1. Find the web_page by relative_path and business_id
            const webPage = await tx.web_page.findUnique({
                where: {
                    relative_path: webpageRelativePath,
                    business_id: businessId,
                    is_removed: false,
                },
            });
            if (!webPage) throw new Error('WebPage not found for given relative_path and business_id');

            // 2. Find or create the WebPageSection
            let webPageSection = await tx.web_page_section.findFirst({
                where: {
                    web_page_id: webPage.id,
                    updatable_uuid: updatableUuid,
                    business_id: businessId,
                    is_removed: false,
                },
            });
            if (!webPageSection) {
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
            }
            const webPageSectionId = webPageSection.id;

            // 3. Count existing versions for this section
            const versionCount = await tx.web_page_section_version.count({
                where: {
                    web_page_section_id: webPageSectionId,
                },
            });
            const filePath = `${updatableUuid}_${versionCount + 1}`;

            // 4. Create the new version
            const webPageSectionVersion = await tx.web_page_section_version.create({
                data: {
                    file_path: filePath,
                    business_id: businessId,
                    web_page_section_id: webPageSectionId,
                    is_removed: false,
                    created: new Date(),
                    modified: new Date(),
                },
            });

            return {
                webPageSectionId,
                webPageSectionVersionId: webPageSectionVersion.id,
                filePath,
            };
        });
    }
}
