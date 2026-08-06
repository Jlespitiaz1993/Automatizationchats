require('dotenv').config();
const { sendTextMessage } = require('../src/whatsappClient');

async function main() {
  const to = process.env.WHATSAPP_TO || process.argv[2];
  const text = process.env.WHATSAPP_TEXT || process.argv[3];

  if (!to || !text) {
    console.error('Uso: node scripts/send-message.js <numero> <texto>');
    console.error('(o define WHATSAPP_TO y WHATSAPP_TEXT como variables de entorno)');
    process.exit(1);
  }

  try {
    const result = await sendTextMessage(to, text);
    console.log('Mensaje enviado correctamente:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error enviando el mensaje:', err.message);
    if (err.details) console.error(JSON.stringify(err.details, null, 2));
    process.exit(1);
  }
}

main();
