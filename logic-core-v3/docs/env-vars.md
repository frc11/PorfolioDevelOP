# Variables de entorno — develOP / Logic Core v3

## Resumen

Total de variables: 33 (detectadas en código)
- Críticas (bloquean producción): 8
- Opcionales (degradan gracefully): Varias
- Públicas (expuestas al cliente): 3

## Por categoría

### Base de datos
- `DATABASE_URL` — Connection string Neon. **CRÍTICA.**

### Auth
- `AUTH_SECRET` — Secret JWT. **CRÍTICA.**
- `NEXTAUTH_URL` — URL canónica. **CRÍTICA.**

### Chatbot
- `GOOGLE_APPLICATION_CREDENTIALS` — Path al Service Account JSON. **CRÍTICA.**
- `CHATBOT_GCP_PROJECT_ID` — Project ID de Google Cloud. **CRÍTICA.**
- `CHATBOT_GCP_LOCATION` — Location Vertex AI. Default us-central1.
- `CHATBOT_GOOGLE_API_KEY` — Legacy fallback. **OPCIONAL.**
- `CHATBOT_IP_HASH_SALT` — Salt para hashear IPs. **CRÍTICA en producción.**

### Email
- `BREVO_API_KEY` — Provider email. **CRÍTICA.**
- `DEVELOP_ALERTS_EMAIL` — Destino de alertas. **CRÍTICA.**

### Public
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — Número WhatsApp para CTAs.
- `NEXT_PUBLIC_APP_URL` — URL pública.

## Diferencias entre entornos

### Local (desarrollo)
Normalmente configuradas: DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL, BREVO_API_KEY, CHATBOT_IP_HASH_SALT

### Producción (Netlify)
Debe estar todo configurado en la UI de Netlify Environment Variables.

### Verificación

Para verificar que todas las variables críticas están configuradas:
```bash
npm run check-env
```
O abrir `/admin/chatbot/health` que muestra el estado de cada una.
