# Automatizationchats

Servidor Node.js/Express que se conecta a la **API oficial de WhatsApp Business Cloud (Meta)** para enviar y recibir mensajes.

## Requisitos previos

1. Una app en [Meta for Developers](https://developers.facebook.com/apps) con el producto **WhatsApp** agregado.
2. En **WhatsApp > API Setup** obten:
   - `Phone Number ID`
   - Un `Temporary access token` (o un token permanente de un System User para produccion)
3. Un numero de prueba de WhatsApp (Meta te da uno gratis para desarrollo) o tu propio numero verificado.

## Instalacion

```bash
npm install
cp .env.example .env
```

Completa `.env` con tus credenciales:

- `WHATSAPP_TOKEN`: token de acceso de la app.
- `WHATSAPP_PHONE_NUMBER_ID`: ID del numero de telefono.
- `WHATSAPP_VERIFY_TOKEN`: cualquier cadena secreta que tu inventes, se usa para verificar el webhook.
- `WHATSAPP_APP_SECRET`: (opcional) para validar firmas de webhook en produccion.

## Ejecutar localmente

```bash
npm run dev
```

El servidor queda escuchando en `http://localhost:3000`.

## Exponer el webhook a internet

Meta necesita una URL publica HTTPS para enviarte los mensajes entrantes. En desarrollo, usa un tunel como [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Copia la URL HTTPS que te da ngrok (ej. `https://abc123.ngrok.app`) y config urala en Meta for Developers:

- **Callback URL**: `https://abc123.ngrok.app/webhook`
- **Verify token**: el mismo valor que pusiste en `WHATSAPP_VERIFY_TOKEN`
- Suscribete al campo `messages`.

## Endpoints

- `GET /webhook`: usado por Meta para verificar la URL del webhook.
- `POST /webhook`: recibe mensajes entrantes y actualizaciones de estado. Responde automaticamente marcando el mensaje como leido y devolviendo un eco de texto.
- `POST /send`: envia un mensaje de texto manualmente.

  ```bash
  curl -X POST http://localhost:3000/send \
    -H "Content-Type: application/json" \
    -d '{"to": "5215512345678", "text": "Hola desde la API"}'
  ```

- `GET /health`: chequeo de salud del servidor.

## Notas

- El token temporal de Meta expira en 24 horas; para produccion genera un token permanente desde un System User en Meta Business Suite.
- El numero en `to` debe incluir codigo de pais sin `+` ni espacios (ej. `521XXXXXXXXXX`).
