import express from 'express';

const app = express();
const PORT = 3999;

app.use(express.json());

// In-memory message list (FAKE, resets on restart)
let messages = [];

// External entry point (curl, scripts, etc.)
app.post('/send-message', (req, res) => {
  const { message } = req.body;

  messages.push({
    text: message,
    from: 'bot',
    id: Date.now(),
  });

  res.json({ status: 'ok' });
});

// Browser polls this
app.get('/messages', (req, res) => {
  res.json(messages);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
