
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

// app.get('/ping', async (req, res) => {
//     console.log('🚀 /ping fired!');

//     return res.sendStatus(200);
// });


app.get('/ping', (req, res) => {
    res.json({
        message: 'pong',
        timestamp: new Date().toISOString(),
    });
});

export default app;
