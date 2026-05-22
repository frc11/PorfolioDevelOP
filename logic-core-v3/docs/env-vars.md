# Variables de entorno — develOP / Logic Core v3

**Última actualización:** 2026-05-21 — inventario verificado contra `process.env.*` en `src/`.

> Fuente: `grep -rE "process\.env\.[A-Z_]+" src/`. Tabla cruzada contra `.env`, `.env.local`, `.env.example`. Si agregás una variable nueva, actualizá este documento + `.env.example` + `scripts/check-env.js`.

---

## Matriz maestra

Columnas:
- **Variable** — nombre exacto que lee el código
- **Status** — REQUERIDA / REQUERIDA EN PROD / OPCIONAL / AUTOINYECTADA / LEGACY
- **Entorno** — dev / prod / ambos
- **Doc?** — ¿estaba documentada en `.env.example` antes de este sprint?
- **Usado en** — un archivo donde se lee (no exhaustivo)

### Infra / Auth

| Variable | Status | Entorno | Doc? | Usado en |
|---|---|---|---|---|
| `DATABASE_URL` | REQUERIDA | ambos | sí | `src/lib/prisma.ts` (Prisma) |
| `AUTH_SECRET` | REQUERIDA | ambos | sí | NextAuth + `src/lib/impersonation.ts:17` |
| `NEXTAUTH_SECRET` | OPCIONAL (legacy alias) | ambos | parcial | `src/lib/impersonation.ts:18` fallback |
| `NEXTAUTH_URL` | REQUERIDA | ambos (valor difiere) | sí | `src/lib/actions/settings.ts:191`, `lib/actions/invitations.ts:109`, `app/forgot-password/actions.ts:41`, `lib/alerts.ts:50` |
| `IMPERSONATION_SECRET` | REQUERIDA | ambos | sí | `src/lib/impersonation.ts:16` |

### Chatbot — LLM

| Variable | Status | Entorno | Doc? | Usado en |
|---|---|---|---|---|
| `CHATBOT_LLM_PROVIDER` | OPCIONAL (default `'google'`) | ambos | parcial | `src/modules/chatbot/server/llm/factory.ts:22` |
| `CHATBOT_GCP_PROJECT_ID` | REQUERIDA si provider=google | ambos | sí | `src/modules/chatbot/server/llm/providers/google.ts:50,70` |
| `CHATBOT_GCP_LOCATION` | OPCIONAL (default `'us-central1'`) | ambos | sí | `google.ts:71` |
| `GOOGLE_APPLICATION_CREDENTIALS` | REQUERIDA en dev (path al JSON) | dev | sí | `google.ts:48` |
| `GOOGLE_VERTEX_CREDENTIALS_JSON` | REQUERIDA en prod (JSON inline) | prod | parcial | `google.ts:49,67` |
| `CHATBOT_IP_HASH_SALT` | REQUERIDA EN PROD | ambos | sí | `src/modules/chatbot/server/safety/ipHash.ts:13` |
| `ANTHROPIC_API_KEY` | OPCIONAL | ambos | sí | `src/lib/ai/review-reply-draft.ts:3`, `src/lib/ai/results-insights.ts:163,173` |
| `CHATBOT_GOOGLE_API_KEY` | LEGACY (no autentica nada) | — | parcial | `src/modules/chatbot/server/health/checkHealth.ts:40,55`, `envValidator.ts:54` — solo warning informativo |

### Email

| Variable | Status | Entorno | Doc? | Usado en |
|---|---|---|---|---|
| `RESEND_API_KEY` | OPCIONAL (alternativa a Brevo) | ambos | sí | `src/lib/email.ts:4`, `notify-message.ts:13,18`, `modules/chatbot/server/notifications/{sendLeadNotification,sendInsightsNotification}.ts` |
| `RESEND_FROM_EMAIL` | OPCIONAL | ambos | parcial | `sendLeadNotification.ts:29` |
| `BREVO_API_KEY` | OPCIONAL (alternativa a Resend) | ambos | parcial | `src/lib/email/brevo-service.ts:4,17`, `src/lib/integrations/brevo.ts:4,112` |
| `BREVO_FROM_EMAIL` | OPCIONAL | ambos | parcial | `brevo-service.ts:30`, `integrations/brevo.ts:124` |
| `BREVO_FROM_NAME` | OPCIONAL | ambos | parcial | `brevo-service.ts:29` |
| `DEVELOP_ALERTS_EMAIL` | REQUERIDA | ambos | sí | `src/modules/chatbot/server/admin/detectBotIssues.ts:304` |

### Google APIs (analytics/SEO/business)

| Variable | Status | Entorno | Doc? | Usado en |
|---|---|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | OPCIONAL (sin esto, fallback a mock) | ambos | parcial | `src/lib/{analytics,searchconsole}.ts`, `src/lib/actions/settings.ts:279` |
| `GOOGLE_PAGESPEED_API_KEY` | OPCIONAL | ambos | parcial | `src/lib/integrations/pagespeed.ts:41` |
| `GOOGLE_BUSINESS_PROFILE_CLIENT_ID` | OPCIONAL | ambos | parcial | `src/lib/integrations/google-business-profile.ts:28` |
| `GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET` | OPCIONAL | ambos | parcial | `google-business-profile.ts:29` |
| `GOOGLE_BUSINESS_PROFILE_REDIRECT_URI` | OPCIONAL | ambos (valor difiere) | parcial | `google-business-profile.ts:30` |

### Integraciones

| Variable | Status | Entorno | Doc? | Usado en |
|---|---|---|---|---|
| `TIENDANUBE_CLIENT_ID` | OPCIONAL | ambos | parcial | `src/lib/integrations/tiendanube.ts:16,28` |
| `TIENDANUBE_CLIENT_SECRET` | OPCIONAL | ambos | parcial | `tiendanube.ts:29` |
| `N8N_API_URL` | OPCIONAL | ambos | parcial | `src/lib/actions/settings.ts:243`, `src/lib/n8n.ts:183,264` |
| `N8N_API_KEY` | OPCIONAL | ambos | parcial | `settings.ts:244`, `n8n.ts:184,265` |
| `N8N_CONTACT_WEBHOOK_URL` | OPCIONAL | ambos | parcial | `src/lib/n8n.ts:19` |

### Notificaciones

| Variable | Status | Entorno | Doc? | Usado en |
|---|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | OPCIONAL | ambos | parcial | `src/lib/notifications/telegram.ts:6`, `app/api/cron/os-follow-up/route.ts:159` |
| `TELEGRAM_CHAT_ID` | OPCIONAL | ambos | parcial | `telegram.ts:7`, `os-follow-up/route.ts:160` |

### Cron

| Variable | Status | Entorno | Doc? | Usado en |
|---|---|---|---|---|
| `CRON_SECRET` | REQUERIDA EN PROD | prod (opcional dev) | parcial | `src/app/api/cron/{send-weekly-reports,detect-bot-issues,regenerate-briefs,alerts,os-follow-up,generate-insights}/route.ts` |

### Públicas (NEXT_PUBLIC_*)

| Variable | Status | Entorno | Doc? | Usado en |
|---|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | REQUERIDA | ambos (valor difiere) | sí | muchos archivos |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | REQUERIDA | ambos | sí | muchos componentes |
| `NEXT_PUBLIC_SENTRY_DSN` | OPCIONAL | ambos | parcial | `src/instrumentation.ts:6,29`, `instrumentation-client.ts:4` |
| `NEXT_PUBLIC_BUILD_TIME` | AUTOINYECTADA | prod (CI/CD) | parcial | `src/app/api/version/route.ts:6` |
| `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL` | OPCIONAL | ambos | parcial | `src/components/sections/home/Footer.tsx:50` |

### Sentry build-time

| Variable | Status | Entorno | Doc? | Usado en |
|---|---|---|---|---|
| `SENTRY_AUTH_TOKEN` | OPCIONAL (solo si subís source maps) | prod | parcial | build-time, cero refs en `src/` |
| `SENTRY_ORG` | OPCIONAL | prod | parcial | build-time |
| `SENTRY_PROJECT` | OPCIONAL | prod | parcial | build-time |

### Autoinyectadas

| Variable | Status | Provista por |
|---|---|---|
| `NODE_ENV` | AUTOINYECTADA | Next.js (`'development'` / `'production'` / `'test'`) |
| `NEXT_RUNTIME` | AUTOINYECTADA | Next.js (`'nodejs'` / `'edge'`) |
| `CI` | AUTOINYECTADA | Netlify durante build |

---

## Hallazgos del inventario 2026-05-21

### 🚨 Secret leak histórico
- Archivo `enviroment.env` (typo, sin la "n" — el pattern `.env*` del `.gitignore` no lo cubría) estaba **tracked en git history** desde commit `3953558` con `GOOGLE_GENERATIVE_AI_API_KEY=<UUID>`. La key estaba deshabilitada (confirmado por Franco) → no hay riesgo activo. El archivo se eliminó del working tree (`git rm --cached`) y `.gitignore` se patcheó para atrapar `*enviroment*`, `*environment*`, `*.env` adicionales. **Pendiente**: correr BFG para borrar del history (ver `docs/audits/2026-05-bfg-leak-cleanup.md`).

### Variables zombie identificadas
- `GOOGLE_GENERATIVE_AI_API_KEY` — estaba en `.env.local` y `enviroment.env`, no se referencia en `src/`. El bot usa `@ai-sdk/google-vertex`, no `@ai-sdk/google`. → safe to remove.
- `CHATBOT_GOOGLE_API_KEY` — se referencia solo en `checkHealth.ts` y `envValidator.ts` como warning legacy. El runtime real autentica con Vertex Service Account. Conservar comentada como warning informativo, pero NO es obligatoria.

### Discrepancias `.env.example` antes vs ahora
- Faltaban documentadas (estaban como comentarios o ausentes): `CHATBOT_LLM_PROVIDER`, `GOOGLE_VERTEX_CREDENTIALS_JSON`, `RESEND_FROM_EMAIL`, `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_PAGESPEED_API_KEY`, `GOOGLE_BUSINESS_PROFILE_*`, `TIENDANUBE_*`, `N8N_*`, `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL`, `TELEGRAM_*`, `CRON_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`.
- Marcadas como "OBLIGATORIA" cuando son OPCIONALES: ninguna detectada — pero el script `check-env.js` tenía `BREVO_API_KEY` como CRITICAL siendo que Resend también funciona como alternativa. Corregido en el script post-sprint.

### Diferencias dev vs prod (mismo nombre, distinto valor o forma)

| Variable | Dev (local) | Prod (Netlify) |
|---|---|---|
| `DATABASE_URL` | branch `dev` de Neon (`ep-quiet-waterfall...`) | branch `main` de Neon — set en Netlify env vars |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://<tu-dominio>` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://<tu-dominio>` |
| `GOOGLE_APPLICATION_CREDENTIALS` | path al archivo (ej `./vertex-credentials.json`) | NO usar — usar `GOOGLE_VERTEX_CREDENTIALS_JSON` inline |
| `GOOGLE_VERTEX_CREDENTIALS_JSON` | normalmente no usar (preferir archivo) | sí — JSON inline porque Netlify no permite subir archivos |
| `CHATBOT_IP_HASH_SALT` | warning si vacía | error en arranque si vacía |
| `CRON_SECRET` | opcional (los crons no corren en local) | obligatoria — Netlify scheduled functions la requieren |
| `GOOGLE_BUSINESS_PROFILE_REDIRECT_URI` | `http://localhost:3000/api/auth/google-business/callback` | `https://<tu-dominio>/api/auth/google-business/callback` |

---

## Cómo verificar el estado en local

```bash
# Script CLI (verifica que las CRÍTICAS estén seteadas)
npm run check-env

# UI in-app
# /admin/chatbot/health → muestra cada variable LLM-related con su estado
```

`check-env.js` se actualizó en este sprint para alinearse con el inventario real (ver `scripts/check-env.js`).

---

## Cómo agregar una variable nueva

1. Usarla en código → `process.env.MI_VARIABLE`.
2. Documentarla en `.env.example` con la sección correspondiente y leyenda (REQUERIDA / OPCIONAL / DEV vs PROD).
3. Si es crítica (la app no arranca sin), agregarla a `scripts/check-env.js` en `CRITICAL_VARS`.
4. Agregar fila a la matriz maestra de este archivo.
5. Si difiere dev vs prod, agregarla a la tabla "Diferencias dev vs prod".
6. Si va con prefijo `NEXT_PUBLIC_`, asegurarse de que NO contenga secrets (se embebe en el bundle del browser).
