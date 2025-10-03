import { prisma } from '../multi-sites/core/lib/prisma.js';

async function testFindActiveVersionId() {
    const updatableUuid = '92af51f0-7349-4561-9214-dd7dfca60ff0';
    const relative_path = 'p2digital/pages/index.astro';

    try {
        // Find the web_page by relative_path
        const webPage = await prisma.web_page.findUnique({
            where: {
                relative_path,
                is_removed: false,
            },
        });
        if (!webPage) {
            console.error('web_page not found for relative_path:', relative_path);
            return;
        }
        // Find the web_page_section by updatableUuid and web_page_id
        const webPageSection = await prisma.web_page_section.findFirst({
            where: {
                web_page_id: webPage.id,
                updatable_uuid: updatableUuid.replace(/-/g, ''),
                is_removed: false,
            },
        });
        if (!webPageSection) {
            console.error('web_page_section not found for updatableUuid:', updatableUuid);
            return;
        }
        // Print the active_version_id
        console.log('active_version_id:', webPageSection.active_version_id);
    } catch (err) {
        console.error('Error in testFindActiveVersionId:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testFindActiveVersionId();
