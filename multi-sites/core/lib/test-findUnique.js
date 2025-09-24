import { prisma } from './prisma.js';

// DEBUG: Print all model keys on the Prisma client
console.log('[DEBUG] Prisma client model keys:', Object.keys(prisma));

async function testFindUnique() {
    const params = {
        webpageRelativePath: "p2digital/pages/index.astro",
        title: "Sobre a Empresa",
        updatableUuid: "92af51f0-7349-4561-9214-dd7dfca60ff0",
        businessId: "5810c2b6-125c-402a-9cff-53fcc9d61bf5"
    };
    try {
        const result = await prisma.webPage.findUnique({
            where: {
                relative_path: params.webpageRelativePath,
                business_id: params.businessId,
                is_removed: false,
            },
        });
        console.log('findUnique result:', result);
    } catch (err) {
        console.error('Error in findUnique test:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testFindUnique();
