import { WebPageService } from '../../dist/lib/webpage-service.js';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());


// Add request logging for debugging
app.use((req, res, next) => {
    if (process.env.DEBUG_VERBOSE === 'true') {
        console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
        if (req.body) {
            console.log('Request body:', JSON.stringify(req.body, null, 2));
        }
    }
    next();
});


app.get('/ping', (req, res) => {
    res.json({
        message: 'pong',
        timestamp: new Date().toISOString(),
    });
});


// POST endpoint to create a WebPageSection and Version (for htmx or API)
app.post('/webpage-section', async (req, res) => {
    try {
        const { webpageRelativePath, title, updatableUuid, businessId, htmlContent, siteId } = req.body;
        if (!webpageRelativePath || !title || !updatableUuid || !businessId || !htmlContent || !siteId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const result = await WebPageService.createSectionAndVersion({ webpageRelativePath, 
                                                                      title, 
                                                                      updatableUuid, 
                                                                      businessId, 
                                                                      htmlContent,
                                                                      siteId 
                                                                    });
        // If htmx, you can return HTML here, but JSON is fine for most cases
        res.json(result);
    } catch (error) {
        console.error('Error in /webpage-section:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST endpoint to publish a WebPageSection and Version (for htmx or API)
app.post('/publish-section', async (req, res) => {
    try {
        const { updatableUuid, webpageRelativePath, businessId, htmlContent, siteId, versionId } = req.body;
        if (!webpageRelativePath || !updatableUuid || !businessId || !htmlContent || !siteId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const result = await WebPageService.publishSection({ webpageRelativePath, 
                                                             updatableUuid, 
                                                             businessId,
                                                             versionId});

        // Create a backup file with .original added before
        // the extension, keeping the rest of the name unchanged.

        const originalPath = webpageRelativePath.replace(/(\.[^/.]+)$/, '.original');
        const fs = await import('fs').then(mod => mod.promises);

        // Only copy if backup does not already exist
        try {
            await fs.access(originalPath);
            console.log(`Backup already exists: ${originalPath}`);
        } catch {
            await fs.copyFile(webpageRelativePath, originalPath);
            console.log(`Created backup of original file at: ${originalPath}`);
        }

        // Replace only the content inside the matching
        // <div updatable-section-uuid="...">...</div> with htmlContent,
        // keeping the rest of the file unchanged.
        let fileData = await fs.readFile(webpageRelativePath, 'utf-8');
        // Robust regex: match <div ... updatable-section-uuid="..." ...>...</div> with any attribute order/whitespace
        const uuidRegex = new RegExp(
            `<div[^>]*\\bupdatable-section-uuid=["']${updatableUuid}["'][^>]*>([\\s\\S]*?)<\\/div>`,
            'i'
        );
        const beforeMatch = fileData.match(uuidRegex);
        if (beforeMatch) {
            console.log('[DEBUG] Found matching section for replacement.');
            console.log('[DEBUG] Before replacement snippet:', beforeMatch[0].slice(0, 500));
        } else {
            console.warn('[WARN] No matching section found for updatableUuid:', updatableUuid);
        }
        fileData = fileData.replace(
            uuidRegex,
            (match, innerContent) => {
                // Replace only the inner content, keep the original <div ...> and </div>
                return match.replace(innerContent, htmlContent);
            }
        );
        const afterMatch = fileData.match(uuidRegex);
        if (afterMatch) {
            console.log('[DEBUG] After replacement snippet:', afterMatch[0].slice(0, 500));
        }

        // Debug log before writing file
        console.log(`[DEBUG] Writing updated content to: ${webpageRelativePath}`);
        try {
            await fs.writeFile(webpageRelativePath, fileData, 'utf-8');
            console.log(`[DEBUG] Successfully wrote to: ${webpageRelativePath}`);
        } catch (err) {
            console.error(`[ERROR] Failed to write to: ${webpageRelativePath}`);
            throw err;
        }

        // keep a copy of the original inner content for reference
        // Extract the inner content again for saving
        const match = fileData.match(uuidRegex);
        if (match && match[1]) {
            const originalInnerContent = match[1]; // This is the inner HTML of the div
            // Write to a file, e.g.:
            await fs.writeFile(`${versionId}_0:original`, originalInnerContent, 'utf-8');
            console.log('Original inner content saved.');
        } else {
            console.warn('No matching section found for updatableUuid:', updatableUuid);
        }

        // Now run `npm run build:p2digital` to regenerate the site
        const { exec } = await import('child_process');
        function runBuild() {
            return new Promise((resolve, reject) => {
                exec('npm run build:p2digital', {
                    cwd: process.cwd(),
                    env: process.env
                }, (error, stdout, stderr) => {
                    // Log full output for troubleshooting
                    console.log('[DEBUG] Build stdout (full):', stdout);
                    console.warn('[DEBUG] Build stderr (full):', stderr);
                    if (error) {
                        console.error('[ERROR] Build failed:', error);
                        return reject({ error: error.message, stdout, stderr });
                    }
                    resolve({ stdout, stderr });
                });
            });
        }
        let buildOutput = null;
        try {
            buildOutput = await runBuild();
            console.log('[DEBUG] Build output:', buildOutput.stdout.slice(0, 1000));
            if (buildOutput.stderr) {
                console.warn('[WARN] Build stderr:', buildOutput.stderr.slice(0, 1000));
            }
            // To allow passwordless sudo for deploy-site-vps.sh:
            // 1. Edit the sudoers file with visudo (for safety).
            // 2. Add this line (all on one line):
            //   edgar ALL=(ALL) NOPASSWD: /home/edgar/Repos/fastvistos/deploy-site-vps.sh
            //    (replace "edgar" with your username; check with `whoami`)
            //    (use the full script path; check with `realpath deploy-site-vps.sh`)
            // This lets only that script run as root, no password needed.
            // This allows only that script to be run as root without a password, improving security over a blanket NOPASSWD rule.
            // Next step: run deploy-site-vps.sh with sudo (requires passwordless sudo setup)
            const deployScriptPath = '/home/edgar/Repos/fastvistos/deploy-site-vps.sh';
            const deployCmd = `sudo ${deployScriptPath} ${siteId}`;
            await new Promise((resolve, reject) => {
                exec(deployCmd, {
                    cwd: process.cwd(),
                    env: process.env
                }, (error, stdout, stderr) => {
                    console.log('[DEBUG] Deploy stdout (full):', stdout);
                    console.warn('[DEBUG] Deploy stderr (full):', stderr);
                    if (error) {
                        console.error('[ERROR] Deploy failed:', error);
                        return reject({ error: error.message, stdout, stderr });
                    }
                    resolve({ stdout, stderr });
                });
            });
        } catch (buildErr) {
            console.error('[ERROR] Build process failed:', buildErr);
            // Optionally, you can return build error in the response
            return res.status(500).json({ ...result, buildError: buildErr });
        }

        res.json({ ...result, buildOutput });
    } catch (error) {
        console.error('Error in /publish-section:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


// GET endpoint to fetch all versions for a section by uuid and businessId
// Best practice: use GET for idempotent, read-only queries (like this)
app.get('/page-section-versions', async (req, res) => {
    try {
        const { 'updatable-section-uuid': updatableSectionUuid, 'business-id': businessId } = req.query;
        if (!updatableSectionUuid || typeof updatableSectionUuid !== 'string' ||
            !businessId || typeof businessId !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid updatable-section-uuid or businessId query param.' });
        }
        const versions = await WebPageService.getPageSectionVersions({
            updatableSectionUuid,
            businessId
        });
        res.json({ versions });
    } catch (error) {
        console.error('Error in /page-section-versions:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.get('/page-section-version', async (req, res) => {
    try {
        // const { id, siteId } = req.query;
        const { 'site-id': siteId, id } = req.query;
        if (!id || typeof id !== 'string' || !siteId || typeof siteId !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid id or siteId query param.' });
        }
        const version = await WebPageService.getPageSectionVersionById({
            id,
            siteId
        });
        res.json({ version });
    } catch (error) {
        console.error('Error in /page-section-version:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default app;
