require('dotenv').config();
const express = require('express');
const { sendTextMessage, markMessageAsRead } = require('./whatsappClient');

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

const app = express();
app.use(express.json());

// Meta llama a esta ruta para verificar la URL del webhook al configurarla.
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Meta envia aqui los mensajes entrantes y actualizaciones de estado.
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Confirmar recepcion de inmediato, procesar despues.

  const entry = req.body?.entry?.[0];
  const change = entry?.changes?.[0]?.value;
  const message = change?.messages?.[0];

  if (!message) return;

  console.log('Mensaje recibido:', JSON.stringify(message, null, 2));

  try {
    await markMessageAsRead(message.id);

    if (message.type === 'text') {
      const from = message.from;
      const body = message.text.body;
      await sendTextMessage(from, `Recibi tu mensaje: "${body}"`);
    }
  } catch (err) {
    console.error('Error procesando el mensaje entrante:', err.details || err.message);
  }
});

// Endpoint propio para disparar un mensaje manualmente.
app.post('/send', async (req, res) => {
  const { to, text } = req.body;
  if (!to || !text) {
    return res.status(400).json({ error: 'Se requieren los campos "to" y "text"' });
  }

  try {
    const result = await sendTextMessage(to, text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.details });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Servidor de WhatsApp escuchando en http://localhost:${PORT}`);
});
