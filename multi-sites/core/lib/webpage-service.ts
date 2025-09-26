import fs from 'fs';
import path from 'path';
interface CreateSectionAndVersionParams {
    webpageRelativePath: string;
    title: string;
    updatableUuid: string;
    businessId: string;
    htmlContent: string;
    siteId: string;
}

export interface PublishSectionParams {
    webpageRelativePath: string;
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
     * @param {string} htmlContent
     * @param {string} siteId
     * @returns {Promise<{ webPageSectionId: string, webPageSectionVersionId: string, filePath: string }>} ids and filePath
     */
    static async createSectionAndVersion({ webpageRelativePath, title, updatableUuid, businessId, htmlContent, siteId }: CreateSectionAndVersionParams) {

    if (!prisma) {
            console.error('[DEBUG] prisma is undefined or null!');
            throw new Error('Prisma client is not initialized');
        }

        // Debug log for htmlContent param
        console.log('[DEBUG] Received htmlContent param:', htmlContent, '| typeof:', typeof htmlContent);

        // Validate htmlContent
        if (typeof htmlContent !== 'string' || !htmlContent) {
            console.error('[DEBUG] htmlContent param is missing or not a string:', htmlContent);
            throw new Error('HTML content is required and must be a string');
        }

        // if those have dashes, strip them for the query
        businessId = businessId.replace(/-/g, '');
        updatableUuid = updatableUuid.replace(/-/g, '');

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
                            id: crypto.randomUUID().replace(/-/g, ''),
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


            // 4. Create the webpage_sections directory if it doesn't exist
            const { exec } = await import('child_process');
            // siteId already declared above
            const sectionsDir = `/var/www/${siteId}/webpage_sections`;
            // Ensure directory exists and is owned by edgar
            if (!fs.existsSync(sectionsDir)) {
                try {
                    await new Promise((resolve, reject) => {
                        // add comment
                        exec(`sudo mkdir -p ${sectionsDir} && sudo chown -R edgar:edgar ${sectionsDir}`, (error, stdout, stderr) => {
                            if (error) {
                                console.error('[ERROR] Failed to create/chown webpage_sections:', error);
                                return reject(error);
                            }
                            console.log('[DEBUG] mkdir/chown stdout:', stdout);
                            console.warn('[DEBUG] mkdir/chown stderr:', stderr);
                            resolve(true);
                        });
                    });
                } catch (err) {
                    // Throw to roll back transaction
                    throw new Error('Failed to create or chown webpage_sections directory: ' + err);
                }
            } else {
                console.log('[DEBUG] Directory already exists, skipping mkdir/chown:', sectionsDir);
            }

            // 5. Create the new version
            let webPageSectionVersion;
            try {
                if (!businessId) {
                    throw new Error('businessId is undefined when creating web_page_section_version');
                }
                webPageSectionVersion = await tx.web_page_section_version.create({
                    data: {
                        id: crypto.randomUUID().replace(/-/g, ''),
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

            // create file with the name in the `file_path` on disk putting it at `/var/www/siteid/webpage_sections/`,
            // create the folder if it doesn't exist. Put the html content inside the just created file and save. 
            // If this operation fails, rollback the transaction and log the error.

            // Write HTML to file on disk
            // You may want to replace 'siteid' with a real value or param
            // siteId already declared above
            const baseDir = `/var/www/${siteId}/webpage_sections`;
            const outFile = path.join(baseDir, filePath);
            try {
                fs.writeFileSync(outFile, htmlContent, 'utf8');
                console.log(`[DEBUG] HTML written to ${outFile}`);
            } catch (err) {
                console.error('[DEBUG] Error writing HTML file:', err);
                throw new Error('Failed to write HTML file, transaction will be rolled back.');
            }
            return {
                webPageSectionId,
                webPageSectionVersionId: webPageSectionVersion.id,
                filePath,
            };
        });
    }

    static async publishSection({ webpageRelativePath, updatableUuid, businessId }: PublishSectionParams) {

        if (!prisma) {
            console.error('[DEBUG] prisma is undefined or null!');
            throw new Error('Prisma client is not initialized');
        }

        // Remove dashes for DB lookup
        const businessIdClean = businessId.replace(/-/g, '');
        const updatableUuidClean = updatableUuid.replace(/-/g, '');

        // 1. Find the web_page by relative_path and business_id
        const webPage = await prisma.web_page.findUnique({
            where: {
                relative_path: webpageRelativePath,
                business_id: businessIdClean,
                is_removed: false,
            },
        });
        if (!webPage) {
            throw new Error('web_page not found for given relative_path and business_id');
        }

        // 2. Find the web_page_section by updatableUuid and web_page_id
        const webPageSection = await prisma.web_page_section.findFirst({
            where: {
                web_page_id: webPage.id,
                updatable_uuid: updatableUuidClean,
                business_id: businessIdClean,
                is_removed: false,
            },
        });
        if (!webPageSection) {
            throw new Error('web_page_section not found for given updatableUuid and web_page_id');
        }

        // 3. Get the active_version_id
        const activeVersionId = webPageSection.active_version_id;
        if (!activeVersionId) {
            throw new Error('No active_version_id set for this web_page_section');
        }

        // 4. Get the web_page_section_version by id
        const sectionVersion = await prisma.web_page_section_version.findUnique({
            where: {
                id: activeVersionId,
            },
        });
        if (!sectionVersion) {
            throw new Error('web_page_section_version not found for active_version_id');
        }

        console.log('[DEBUG] Publishing sectionVersion:', sectionVersion);


        // 5. Return the file_path
        return {
            filePath: sectionVersion.file_path,
            activeVersionId,
        };
    }

    /**
     * Get all versions for a section by updatable-section-uuid and updatable-section-filepath.
     * @param {object} params
     * @param {string} params.updatableSectionUuid
     * @param {string} params.updatableSectionFilepath
     */
    static async getPageSectionVersions({ updatableSectionUuid, businessId }: { updatableSectionUuid: string, businessId: string }) {
        console.log('[DEBUG] getPageSectionVersions called with:', { updatableSectionUuid, businessId });
        const updatableUuidClean = updatableSectionUuid.replace(/-/g, '');
        const businessIdClean = businessId.replace(/-/g, '');
        console.log('[DEBUG] Cleaned params:', { updatableUuidClean, businessIdClean });
        const section = await prisma.web_page_section.findFirst({
            where: {
                updatable_uuid: updatableUuidClean,
                business_id: businessIdClean,
                is_removed: false,
            },
        });
        console.log('[DEBUG] web_page_section result:', section);
        if (!section) {
            console.log('[DEBUG] No section found, returning empty list and null active_version');
            return { list: [], active_version: null };
        }
        const versions = await prisma.web_page_section_version.findMany({
            where: {
                web_page_section_id: section.id,
                is_removed: false,
            },
            orderBy: {
                created: 'desc',
            },
        });
        console.log('[DEBUG] web_page_section_version list:', versions);

        // Find active version and read its file content
        let active_version = null;
        if (section.active_version_id) {
            console.log('[DEBUG] section.active_version_id:', section.active_version_id);
            const activeVer = versions.find((v: any) => v.id === section.active_version_id);
            console.log('[DEBUG] activeVer found:', activeVer);
            if (activeVer && activeVer.file_path) {
                const siteId = 'p2digital';
                const filePath = `/var/www/${siteId}/webpage_sections/${activeVer.file_path}`;
                let file_content = '';
                try {
                    file_content = fs.readFileSync(filePath, 'utf8');
                    console.log('[DEBUG] Read file_content from:', filePath);
                } catch (err) {
                    // File may not exist or be readable
                    console.error('[DEBUG] Error reading file_content from:', filePath, err);
                    file_content = '';
                }
                active_version = {
                    id: activeVer.id,
                    file_content
                };
                console.log('[DEBUG] active_version object:', active_version);
            }
        } else {
            console.log('[DEBUG] section.active_version_id is not set');
        }
        console.log('[DEBUG] Returning from getPageSectionVersions:', { list: versions, active_version });
        return { list: versions, active_version };
    }


    /**
     * Get a specific version by its ID, including reading the HTML content from disk.
     * @param {object} params
     * @param {string} params.id
     * @param {string} params.siteId
     */
    static async getPageSectionVersionById({ id, siteId }: { id: string, siteId: string }) {
        // if id has :original suffix, remove it and set a flag
        const original = id.endsWith(':original');
        console.log('[DEBUG] getPageSectionVersionById called with:', { id, siteId, original });
        if (original) {
            id = id.replace(/:original$/, '');
        }

        // console.log('[DEBUG] Fetching web_page_section_version with id:', id);

        const ver = await prisma.web_page_section_version.findUnique({
            where: { id }
        });

        // console.log('[DEBUG] Fetched version:', ver);
        
        let file_content = 'Conteudo corrompido. Por favor, crie uma nova versao a partir de uma versão anterior, posterior ou a original que não esteja corrompida.';
        
        if (ver && ver.file_path) {
            let file_path = null;
            if (original) {
                // If original, it means the original version without suffix
                // So we need to replace the _number suffix with _0
                file_path = ver.file_path.replace(/_\d+$/, '_0');
            } else {
                file_path = ver.file_path;
            }

            const filePath = `/var/www/${siteId}/webpage_sections/${file_path}`;

            try {
                file_content = fs.readFileSync(filePath, 'utf8');
                console.log('[DEBUG] Read file_content from:', filePath);
                console.log('[DEBUG] file_content:', file_content.slice(0, 30) + (file_content.length > 30 ? '...' : ''));
            } catch (err) {
                // File may not exist or be readable
                console.error('[DEBUG] Error reading file_content from:', filePath, err);
                // [BUG][P0][DEV] Needs monitoring, logging, and notification
            }
        } else {
            // [BUG][P0][DEV] Needs monitoring, logging, and notification
            console.log('[DEBUG] ver is null or has no file_path:', ver);
        }
        return { id: ver.id, file_content };
    }

}