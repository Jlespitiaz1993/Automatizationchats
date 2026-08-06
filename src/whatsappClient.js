const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v20.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

function baseUrl() {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}`;
}

async function callGraphApi(path, body) {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Error llamando a la API de WhatsApp');
    error.details = data;
    throw error;
  }
  return data;
}

function sendTextMessage(to, text) {
  return callGraphApi('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  });
}

function markMessageAsRead(messageId) {
  return callGraphApi('/messages', {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  });
}

module.exports = { sendTextMessage, markMessageAsRead };
