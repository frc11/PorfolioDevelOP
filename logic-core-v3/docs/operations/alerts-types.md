# Tipos de Alertas del Sistema — develOP Chatbot

## Resumen

El detector corre cada **15 minutos** vía `/api/cron/detect-bot-issues`.  
También puede ejecutarse manualmente desde `/admin/settings/alerts` (solo SUPER_ADMIN).

## Tipos de alerta

| Tipo | Severity | Trigger | Acción esperada |
|---|---|---|---|
| `LLM_PROVIDER_ERROR` | **CRITICAL** | 3+ errores LLM/provider en la última hora para un bot | Investigar Vertex AI status, revisar config del bot |
| `QUOTA_EXHAUSTED` | **WARNING** | Bot llegó al 100% de su quota mensual | Comunicar al cliente upgrade de plan |
| `BOT_INACTIVE_WITH_TRAFFIC` | **HIGH** | Bot inactivo pero recibió conversaciones en 24h | Reactivar bot o revisar configuración |
| `LATENCY_DEGRADED` | **HIGH** | P95 de respuesta > 10s en la última hora | Revisar performance, posible cold start |
| `CRON_INSIGHTS_FAILED` | **WARNING** | 1+ fallas del cron de insights en 24h | Revisar logs del cron de insights |
| `ACTIVITY_ERRORS_SPIKE` | **HIGH** | 5+ eventos de error en la última hora | Investigar patrón, revisar logs |
| `CLIENT_NO_ACTIVITY` | **INFO** | Bot activo sin conversaciones en 7 días | Verificar instalación, contactar cliente |
| `DOMAIN_NOT_AUTHORIZED_SPIKE` | **INFO** | 10+ bloqueos de origen no autorizado en 24h | Posible abuso, revisar logs de seguridad |
| `LEAD_CAPTURE_FAILURE` | **HIGH** | 3+ errores de `capture_lead` en la última hora | Revisar la tool del bot, validaciones de campos |

## Notificaciones

| Severity | Email | Telegram |
|---|---|---|
| CRITICAL | ✅ | ✅ |
| HIGH | ✅ | ✅ |
| WARNING | ✅ | ❌ |
| INFO | ❌ | ❌ |

- **Email**: configurar `DEVELOP_ALERTS_EMAIL` en env. Usa Brevo (`BREVO_API_KEY`).
- **Telegram**: configurar `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` en env.

## Deduplicación

El detector no crea alertas duplicadas: si ya existe una alerta `PENDING` del mismo tipo
para el mismo bot dentro de las últimas 24 horas, la omite.

## Cron schedule

Configurar en Netlify Scheduled Functions o cron externo (EasyCron, etc.):

```
*/15 * * * *  GET https://develop.com.ar/api/cron/detect-bot-issues
              Authorization: Bearer $CRON_SECRET
```

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `CRON_SECRET` | Token de autenticación del cron |
| `DEVELOP_ALERTS_EMAIL` | Email destino para alertas HIGH/CRITICAL |
| `BREVO_API_KEY` | API key de Brevo para transaccionales |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram (opcional) |
| `TELEGRAM_CHAT_ID` | Chat ID de Telegram (opcional) |

## Workflow operativo ante cada tipo

Ver `docs/operations/04-responder-alerta.md` para el protocolo de respuesta por tipo.
