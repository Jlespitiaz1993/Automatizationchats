# Automatizationchats

Servidor Node.js/Express que se conecta a la **API oficial de WhatsApp Business Cloud (Meta)** para enviar y recibir mensajes.

## Requisitos previos

1. Crea (o usa) una cuenta en [Meta for Developers](https://developers.facebook.com/apps).
2. **Crear la app**: My Apps > Create App > tipo **Business** > completa nombre y correo de contacto.
3. Dentro de la app, en el panel de productos, agrega **WhatsApp**.
4. Ve a **WhatsApp > API Setup**. Ahi encontraras:
   - Un **numero de prueba gratuito** ya asignado (sirve para desarrollo).
   - El **Phone Number ID** de ese numero (copialo).
   - Un **Temporary access token** (dura 24 horas; copialo tambien).
5. En la misma pantalla, seccion "To" (destinatarios de prueba), agrega tu propio numero de WhatsApp y verificalo con el codigo que llega por WhatsApp. Mientras la app este en modo desarrollo, **solo puedes enviar mensajes a numeros verificados aqui**.
6. (Opcional, para produccion) En **App settings > Basic** copia el **App Secret**, y en **Business Settings > System Users** crea un token permanente en vez del temporal.

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

## Probar el envio desde GitHub Actions (sin correr nada localmente)

Esta sesion remota tiene restringido el acceso a `graph.facebook.com` por politica de red, y no puede exponer tuneles publicos (ngrok/cloudflared/localtunnel bloqueados). Como alternativa para probar el **envio de mensajes** sin depender de tu maquina ni de esta sesion, el repo incluye un GitHub Action manual: `.github/workflows/whatsapp-send.yml`.

**Nota:** esto solo sirve para *enviar* un mensaje de prueba bajo demanda. No sirve para *recibir* mensajes (webhook), porque los runners de GitHub Actions no quedan corriendo ni tienen URL publica fija; para eso necesitas correr el servidor en tu maquina (seccion anterior) o en un hosting con URL publica.

1. En GitHub, ve a **Settings > Secrets and variables > Actions** del repo y agrega:
   - `WHATSAPP_TOKEN`: el token de acceso (temporal o permanente).
   - `WHATSAPP_PHONE_NUMBER_ID`: el Phone Number ID.
2. Ve a la pestana **Actions > Enviar mensaje de WhatsApp > Run workflow**.
3. Completa `to` (numero destino con codigo de pais, sin `+`) y `text` (el mensaje), y ejecuta.
4. Revisa el log del job para ver la respuesta de la API o el error.

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
