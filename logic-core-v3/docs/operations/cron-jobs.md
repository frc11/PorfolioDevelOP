# Cron Jobs - develOP

## detect-bot-issues

- Endpoint: `GET /api/cron/detect-bot-issues`
- Schedule: cada 15 minutos
- Auth: `Authorization: Bearer ${CRON_SECRET}`

### Setup en Netlify

1. Crear una Netlify Scheduled Function o cron externo.
2. Configurar schedule: `*/15 * * * *`.
3. Llamar al endpoint con header `Authorization: Bearer ${CRON_SECRET}`.

Referencia: https://docs.netlify.com/functions/scheduled-functions/

### Variables de entorno requeridas

- `CRON_SECRET`: secret compartido para autenticar al cron.
- `DEVELOP_ALERTS_EMAIL`: destino interno de emails de alerta.
- `NEXT_PUBLIC_APP_URL`: base URL para links al panel.
- `BREVO_API_KEY`: API key de Brevo para email transaccional.
- `BREVO_FROM_EMAIL`: remitente opcional para alertas.

### Alternativa

Si el plan de Netlify no soporta scheduled functions, usar un cron externo como cron-job.org llamando al mismo endpoint con el header de autorizacion.
