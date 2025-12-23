import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors()); 
const PORT = 3999;

app.use(express.json());
app.use(cors({
  origin: `http://localhost:${PORT}`,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// In-memory message list (FAKE, resets on restart)
let messages = [];

// External entry point (curl, scripts, etc.)
app.post('/send-message', (req, res) => {
  const { text } = req.body;

  console.log('Received message via /send-message:', text);

  messages.push({
    text: text,
    from: 'bot',
    id: Date.now(),
  });

  res.json({ status: 'ok' });
});

// Proxy endpoint for WhatsApp webhook
app.post('/proxy-whatsapp', async (req, res) => {
  try {
    let url = 'https://emprego.p2digital.com.br/api/candidateprofile/whatsapp-webhook/'
    url = 'http://127.0.0.1:8000/api/candidateprofile/whatsapp-webhook/'
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/clear-messages', (req, res) => {
  messages = [];
  res.json({ status: 'cleared' });
});

// Browser polls this
app.get('/messages', (req, res) => {
  res.json(messages);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
