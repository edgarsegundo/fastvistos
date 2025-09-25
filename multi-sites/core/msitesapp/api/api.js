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
        const { webpageRelativePath, title, updatableUuid, businessId, htmlContent } = req.body;
        if (!webpageRelativePath || !title || !updatableUuid || !businessId || !htmlContent) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const result = await WebPageService.createSectionAndVersion({ webpageRelativePath, 
                                                                      title, 
                                                                      updatableUuid, 
                                                                      businessId, 
                                                                      htmlContent });
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
        const { webpageRelativePath, updatableUuid, businessId, htmlContent } = req.body;
        if (!webpageRelativePath || !updatableUuid || !businessId || !htmlContent) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const result = await WebPageService.publishSection({ webpageRelativePath, 
                                                             updatableUuid, 
                                                             businessId });

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
        const uuidRegex = new RegExp(
            `(<div updatable-section-uuid=["']${updatableUuid}["']>)([\s\S]*?)(<\/div>)`,
            's'
        );
        fileData = fileData.replace(
            uuidRegex,
            `$1${htmlContent}$3`
        );
        await fs.writeFile(webpageRelativePath, fileData, 'utf-8');

        res.json(result);
    } catch (error) {
        console.error('Error in /publish-section:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default app;
