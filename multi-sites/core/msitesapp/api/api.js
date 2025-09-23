import { WebPageService } from '../../lib/webpage-service.js';
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


app.get('/msitesapp/api/ping', (req, res) => {
    res.json({
        message: 'pong',
        timestamp: new Date().toISOString(),
    });
});


// POST endpoint to create a WebPageSection and Version (for htmx or API)
app.post('/msitesapp/api/webpage-section', async (req, res) => {
    try {
        const { webpageRelativePath, title, updatableUuid } = req.body;
        if (!webpageRelativePath || !title || !updatableUuid) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        const result = await WebPageService.createSectionAndVersion({ webpageRelativePath, title, updatableUuid });
        // If htmx, you can return HTML here, but JSON is fine for most cases
        res.json(result);
    } catch (error) {
        console.error('Error in /api/webpage-section:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


export default app;
