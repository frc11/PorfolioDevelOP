# Variables de entorno en Netlify

Configurar en: Netlify Dashboard → Site Settings → Environment variables.

## Críticas (sin estas no levanta)

| Variable | Valor | Notas |
|---|---|---|
| `DATABASE_URL` | postgres://...neon... | Neon DB connection string |
| `AUTH_SECRET` | (random 32+ chars) | NextAuth secret |
| `NEXTAUTH_URL` | https://tu-dominio.netlify.app | URL pública |
| `NEXT_PUBLIC_APP_URL` | https://tu-dominio.netlify.app | URL pública client-side |
| `NEXT_PUBLIC_SENTRY_DSN` | https://...sentry.io/... | Sentry DSN para reporte de errores |
| `SENTRY_AUTH_TOKEN` | (tu token de sentry) | Para subir source maps durante el build |

## Google / Vertex AI

| Variable | Valor | Notas |
|---|---|---|
| `CHATBOT_GCP_PROJECT_ID` | tu-project-id | De Google Cloud |
| `CHATBOT_GCP_LOCATION` | us-central1 | Region Vertex |
| `GOOGLE_VERTEX_CREDENTIALS_JSON` | (contenido del JSON pegado completo) | Service Account JSON inline |

## Chatbot operativo

| Variable | Valor | Notas |
|---|---|---|
| `CHATBOT_IP_HASH_SALT` | (random 32+ chars) | Para hashear IPs |
| `RESEND_API_KEY` | re_... | Para emails |
| `CRON_SECRET` | (random 32+ chars) | Para protected cron endpoint |

## Opcionales

| Variable | Valor | Notas |
|---|---|---|
| `N8N_API_URL` | https://... | Si usás n8n integration |
| `N8N_API_KEY` | ... | n8n API key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | 549... | Número WhatsApp para handoff |
