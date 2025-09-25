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
        const { webpageRelativePath, updatableUuid, businessId } = req.body;
        if (!webpageRelativePath || !updatableUuid || !businessId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const result = await WebPageService.publishSection({ webpageRelativePath, 
                                                             updatableUuid, 
                                                             businessId });

        // make a copy of the webpageRelativePath with the same name but adding .original and removing the extension
        const originalPath = webpageRelativePath.replace(/(\.[^/.]+)$/, '.original$1');
        const fs = await import('fs').then(mod => mod.promises);
        await fs.copyFile(webpageRelativePath, originalPath);
        console.log(`Created backup of original file at: ${originalPath}`);
        
        

        res.json(result);
    } catch (error) {
        console.error('Error in /publish-section:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});




export default app;
