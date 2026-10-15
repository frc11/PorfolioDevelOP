# 01 — Inventario

> Qué hay en `origin/main` @ `57c421bc` (2026-09-06), medido el 2026-10-13. Todo lo de este documento sale de scripts de solo lectura de `scripts/auditoria/` (re-ejecutables) o de comandos citados; los crudos están en `_crudo/`. Rutas relativas a `logic-core-v3/` salvo `raíz:`. Los IDs entre corchetes (`h2.cli-inicio`, `lib.isolation`…) son los nodos del Atlas (DEC-40). Esto es inventario: los problemas que asoman acá se auditan en su dominio y se escriben en 02/03.

## 1. Números generales

Fuente: `_cobertura.csv` (`scripts/auditoria/cobertura.mjs`).

| | Archivos | LOC |
|---|---|---|
| Versionados en el repo | 2.212 | — |
| Alcance profundo (D1–D9) | 1.298 | 162.638 |
| Alcance superficial (sitio público, docs, tests, scripts) | 691 | — |
| Fuera (binarios, assets, lockfile, salidas generadas, skill vendorizada) | 223 | — |

Por dominio (profundo, archivos · LOC): D1 Auth 33 · 3.909 — D2 Portal 219 · 25.405 — D3 Admin 221 · 29.952 — D4 Setter 171 · 27.867 — D5 Chatbot e IA 372 · 42.821 — D6 Datos 104 · 10.802 — D7 Integraciones 59 · 6.849 — D8 Plataforma 20 · 2.787 — D9 Transversal 99 · 12.246. La poda de F1.11 saca de la lectura profunda los archivos de confianza ALTA (ver `10-PODA.md`).

## 2. Stack y dependencias

- **Stack declarado** (`package.json`): Next.js `^16.2.6` (instalado 16.2.9), React 19.2.3, TypeScript `^5` (5.9.3), Tailwind 4, Prisma 6.19 + PostgreSQL (Neon), NextAuth `5.0.0-beta.31`, `motion` 12 (no `framer-motion`), Three.js 0.182 + R3F 9, AI SDK 6 con `@ai-sdk/google-vertex` 4, `@anthropic-ai/sdk` 0.95, Brevo 5 y Resend 6, Sentry 10, Zod 3.25.
- **Dependencias directas**: 48 de producción + 19 de desarrollo (`npm ls --depth=0` → `_crudo/npm-ls.txt`, sale 0).
- **Desactualizadas** (`npm outdated --json` → `_crudo/npm-outdated.json`): 48 paquetes, **20 a una versión mayor** de distancia — entre ellos Prisma (7.10; 8 en RC), Zod (4.6), `@sentry/nextjs` (11.7), `ai` (7), `@ai-sdk/google-vertex` (5), ESLint (10), TypeScript (7.0), `lucide-react` (1.56), `motion` (14), `@types/node` (26 contra el `^20` declarado). `next-auth` sigue en beta (`latest` en npm es la 4.24). Se evalúan en D8 contra las guías de migración.
- **Vulnerabilidades** (`npm audit --json` → `_crudo/npm-audit.json`): **30 — 4 críticas, 18 altas, 8 moderadas.** Críticas: `next` (entre ellas un bypass de middleware/proxy en App Router y un DoS por server actions), `next-auth`, `@auth/core` y `@auth/prisma-adapter`. Todas con fix disponible; varias altas solo se arreglan con un salto de major. Se auditan en D1/D8.

## 3. Áreas y herramientas

Lista cerrada de §6 del plan: 6 áreas y 51 herramientas.

| Área | Herramientas |
|---|---|
| `h1` Acceso | login (contraseña, magic link por Brevo, Google), recupero, cambio obligatorio, invitación, impersonación |
| `h2` Portal del cliente | bienvenida, shell, inicio, proyecto, resultados, servicios, mensajes, soporte, plan, referidos, cuenta, reportes por email; módulos premium: reseñas, email marketing, tienda, agenda |
| `h3` Chatbot centralizado | chatbot del cliente, chatbots (admin), actividad, health, widget embebible + `/embed`, API pública, widget de develOP en el sitio, canal WhatsApp (motor) |
| `h4` Panel de admin | shell, dashboard, clientes, proyectos, equipo, leads, tickets, mensajes, novedades, referidos, alertas, configuración, audit log |
| `h5` Setter y LeadOS (ZONA-FRANCO) | tu día, cargar prospecto, importar, ficha del lead, manual del lead, revisión de demos, FG-2 Lab |
| `h6` Entradas públicas | formulario de contacto (+ form del footer a n8n), baja de emails de marketing |

Usuario de cada portal: el proxy solo deja entrar a `/dashboard` a `ORG_MEMBER` o a SUPER_ADMIN impersonando (`src/proxy.ts:154`); `/admin` exige SUPER_ADMIN (`src/app/(protected)/admin/layout.tsx:47`); `/setter` exige `SETTER` (`src/app/(protected)/setter/layout.tsx:32`). Enum `Role`: `SUPER_ADMIN`, `ORG_MEMBER`, `CLIENT`, `SETTER` (`prisma/schema.prisma:12-17`).

## 4. Rutas

Fuente: `_crudo/inventario.json` (`scripts/auditoria/inventario.mjs`).

- **86 `page.tsx`** (79 internas: `/admin`, `/dashboard`, `/setter`, auth, `/bienvenida`, `/embed`), **17 `layout.tsx`**, 54 `loading.tsx`, 24 `error.tsx`, 2 `not-found.tsx`.
- **36 route handlers**:

| URL | Métodos | runtime · maxDuration |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | — |
| `/api/qa/login` | POST, GET, DELETE | nodejs |
| `/api/auth/google-business/{start,callback}` | GET | — |
| `/api/auth/tiendanube/{start,callback}` | GET | — |
| `/api/chatbot/[slug]/chat` | OPTIONS, POST | nodejs · **30 s** |
| `/api/chatbot/[slug]/config` | OPTIONS, GET | nodejs |
| `/api/chatbot/[slug]/health` | GET | nodejs |
| `/api/motor/webhook/[channelToken]` | POST | nodejs · **15 s** |
| `/api/admin/chatbot/demo-chat/[slug]` | POST | nodejs · **30 s** |
| `/api/admin/chatbot/test-prompt` | POST | nodejs · **30 s** |
| `/api/admin/chatbot/events` · `/insights/generate` | GET · POST | — |
| `/api/admin/alerts/trigger-detector` · `/reports/send-now` | POST | — |
| `/api/admin/clients/[organizationId]/send-executive-report` | POST | — |
| `/api/admin/users/[userId]/resend-credentials` | POST | — |
| `/api/cron/{alerts,cleanup-old-events,detect-bot-issues,os-follow-up,send-weekly-reports}` | GET | — |
| `/api/cron/generate-insights` | POST | — |
| `/api/cron/{regenerate-briefs,send-executive-reports}` | GET | **300 s** |
| `/api/dashboard/chatbot/leads/export` · `/api/dashboard/leads/recent` | GET | — |
| `/api/reports/{client-monthly,monthly}` | GET | nodejs |
| `/api/email/optout/[contactId]` · `/api/email/unsubscribe-executive` | GET · GET, POST | — |
| `/api/track` | OPTIONS, POST | — |
| `/api/dev/email-preview/executive-weekly` · `/api/test-sentry` · `/api/version` | GET | — |

Los `maxDuration` de 15–300 s se contrastan en D8 con el límite real de las functions de Netlify.

- **Server actions**: 92 archivos con `'use server'`, **200 funciones exportadas** (D1 9 · D2 17 · D3 29 · D4 15 · D5 21 · D7 1 archivos).

## 5. Datos

- **Schema** (`prisma/schema.prisma`, 2.247 líneas, FROZEN): **63 modelos y 62 enums**, agrupados por dominio — auth (5: `Account`, `Session`, `VerificationToken`, `User`, `PasswordResetToken`), tenant (11: `Organization`, `OrgMember`, `AgencySettings`, `ExecutiveBriefSnapshot`, `WeeklyReportLog`, `BusinessMetric`, `PageView`, `ClientAsset`, `ClientBrandProfile`, `OnboardingTask`, `Notification`), proyectos y soporte (7), facturación (3: `Plan`, `Subscription`, `Invoice`), LeadOS (9, `Os*`, ZONA-FRANCO), módulos y email marketing (4), chatbot (11), plataforma (6: auditoría, rate limit, novedades, referidos) y motor WhatsApp (7).
- **33 modelos no tienen `organizationId` propio**: los globales (auth, `Plan`, `AgencySettings`, `RateLimit`, `AdminAuditLog`, `PremiumModule`), los de LeadOS (de develOP, no de un tenant) y los hijos que se scopean por el padre (`Conversation`, `ChatMessage`, `ChatbotLead`, `TicketMessage`…). Cómo se aísla cada uno se audita en D6/D2/D5 (frontera `src/lib/isolation`: `forOrg` / `unsafeGlobalQuery`).
- **86 migraciones** (`20260318202838_init` → `20260710203413_add_portal_indexes`; último cambio del schema: 2026-07-15). `prisma/migrations/__diff_check.sql` está vacío. `prisma migrate status` no corrió (sin `DATABASE_URL`; `_crudo/prisma-migrate-status.txt`). El drift schema↔migraciones se mide en D6 con `scripts/auditoria/drift.mjs`.
- **Seeds y escritores de la base**: `prisma/seed.ts` (exige `SEED_*_PASSWORD` y tiene guard de prod en `prisma/seed-guard.ts`), `prisma/seed-agency-os.ts`, 6 seeds en `prisma/seeds/` (`sync-plans.ts` se documenta para correr contra prod, `prisma/seeds/sync-plans.ts:12-13`; `sync-premium-modules.ts` sincroniza el catálogo que lee la app), 2 scripts en `src/modules/chatbot/prisma/` y 25 scripts de `scripts/` que escriben en la base (marca `escribe-db` del ledger).

## 6. Integraciones y crons

- **Servicios externos** (por import y variable de entorno): Vertex AI / Gemini (chatbot y briefs; **credencial vencida**, ENMIENDA-01), Anthropic (dos usos fuera del chatbot), Brevo (email transaccional, magic link) y Resend (declarado, provider de NextAuth), Sentry, Google Search Console y GA4, Google Business Profile (OAuth), Tiendanube (OAuth), cal.com, Telegram, n8n, Neon, Netlify. La tabla de credenciales con qué se cae si vencen está en §6.1 (D7, DEC-43).
- **Crons y jobs** (`_crudo/inventario.json`):

| Registrador | Qué agenda | Observación |
|---|---|---|
| `netlify.toml` (3 scheduled functions) | `generate-insights-cron` (diario 09:00), `send-weekly-reports-cron` (lunes 12:00), `cleanup-old-events-cron` (diario 06:00) | las 3 existen en `netlify/functions/` y llaman a `/api/cron/*` con `CRON_SECRET` |
| `vercel.json` (3 crons) | `/api/cron/os-follow-up` (diario 12:00), `/api/cron/regenerate-briefs` (lunes 10:00), `/api/cron/send-executive-reports` (lunes 12:00) | el deploy es Netlify: a verificar en D7 si algo los dispara |
| GitHub Actions | `raíz:.github/workflows/db-backup.yml` (diario 06:00 UTC) | backup de la base |
| — | `/api/cron/alerts`, `/api/cron/detect-bot-issues` | no figuran en ningún registrador |

### 6.1 Credenciales y dependencias externas (E10, D7)

> Armada en D7-c1 (C13) con el inventario de `scripts/auditoria/env-inventario.mjs` (`_crudo/credenciales-env.json`: solo nombres y `ruta:línea`, nunca valores), la lectura del lote de integraciones y la del padre. **Control positivo: Vertex**, vencida hoy (BUG-145). Resultado general: salvo el chat de Vertex, ninguna integración ni cron reporta a Sentry (FAL-029), y Sentry mismo depende de una variable incrustada en el build (FAL-030). Por eso, si vence una credencial, el sistema no tiene cómo enterarse. Cómo verificar cuándo vence y cómo se renueva cada una: VH-134 (y VH-141 para Vertex) en `08-VERIFICACION-HUMANA.md`.

| Servicio y credencial | Dónde se lee | Qué se cae si vence o se revoca | ¿El sistema se entera? | Cómo se renueva | Hallazgos |
|---|---|---|---|---|---|
| **Vertex AI** · `GOOGLE_VERTEX_CREDENTIALS_JSON` (Netlify), `GOOGLE_APPLICATION_CREDENTIALS` (local), `CHATBOT_GCP_PROJECT_ID`, `CHATBOT_GCP_LOCATION` | `src/modules/chatbot/server/llm/providers/google.ts:54-56`, `:72-77` | **Hoy, vencida**: el chatbot del sitio y el de todos los clientes (cada mensaje falla), los insights del chatbot, el brief y el resumen ejecutivo IA | Parcial: el chat manda a Sentry (`handleChatRequest.ts:1057`, `:1389`) si el DSN está en el build; el health da ok porque no llama al modelo (`checkHealth.ts:47-54`); el detector no tiene disparador; `src/instrumentation.ts:15-16` descarta RESOURCE_EXHAUSTED y «quota exceeded»; el visitante ve «Se cortó la respuesta» | Key nueva de la service account en Google Cloud → Netlify → redeploy; en local, `vertex-credentials.json` por worktree (VH-141) | BUG-145, BUG-063, UX-025, FAL-016, SEC-064, SEC-071 |
| **Anthropic** · `ANTHROPIC_API_KEY` | `src/lib/ai/results-insights.ts:163`, `src/lib/ai/review-reply-draft.ts:3` | Insights de Resultados y borrador de respuesta a reseñas | No: el fallo se cachea 24 h como «sin insights» y no llega a Sentry; el borrador devuelve el error crudo | Key nueva en la consola de Anthropic → Netlify → redeploy | BUG-066, SEC-046, TEC-003 |
| **Brevo** · `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME` | `src/lib/email/brevo-service.ts:4`, `:20`, `src/lib/integrations/brevo.ts:4` | Magic link, reset, bienvenida (única copia de la contraseña temporal), reportes, avisos de leads e insights; email marketing (campañas y bajas) | No: `console.error` y `{ok:false}` (`brevo-service.ts:40-45`); el magic link muestra éxito igual; marketing devuelve el error crudo (`brevo.ts:81-83`) | API key nueva en Brevo → Netlify → redeploy; remitente verificado (sin `BREVO_FROM_EMAIL` sale de un Gmail personal) | BUG-003, BUG-064, DEU-070 |
| **Resend** (restos) · `RESEND_API_KEY` | `src/lib/email.ts:4`, `src/lib/email/notify-message.ts:13-18` | «Acción requerida», respuesta de ticket y aviso de mensaje del admin | No: sin la key devuelve éxito sin enviar (`email.ts:15-17`); con la key revocada no mira el resultado | Key nueva y dominio verificado en Resend, o pasar esos tres envíos a Brevo | BUG-037, DEU-070 |
| **Google OAuth (login)** · `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (los lee Auth.js solo) | `src/auth.ts:122` (FROZEN + ZONA-FRANCO) | «Continuar con Google», que hoy ya no completa para nadie | No: los errores de Auth no llegan a Sentry y `/login` no muestra el `?error` | Google Cloud → Credenciales → cliente OAuth → secret nuevo → Netlify → redeploy | UX-002, FAL-003 |
| **GA4 y Search Console** · `GOOGLE_SERVICE_ACCOUNT_KEY` | `src/lib/analytics.ts:95`, `src/lib/searchconsole.ts:102` | Tráfico y SEO | No, ni en consola: el catch muestra datos demo con banner (`analytics.ts:196-198`, `searchconsole.ts:108-112`) | Key nueva de la service account, sin perder su acceso a la propiedad de cada cliente → Netlify → redeploy | BUG-041, FAL-010, SEC-045 |
| **Google Business Profile** · `GOOGLE_BUSINESS_PROFILE_CLIENT_ID`, `_CLIENT_SECRET`, `_REDIRECT_URI` + `gbpAccessToken` y `gbpRefreshToken` por org (en claro) | `src/lib/integrations/google-business-profile.ts:29-35`, `:55-72` | Reputación y Motor de reseñas (listar y responder) | No: `console.error` y `null` (`:93-96`); el estado de la conexión sigue diciendo OPERATIONAL (`gbp-connection-logic.ts:163-169`) | Un SUPER_ADMIN reabre `/api/auth/google-business/start?orgId=` a mano (no hay botón). Si la app OAuth está en modo Testing, los refresh tokens vencen solos (HIPÓTESIS: mirar el Publishing status) | FAL-011, BUG-141, SEC-036, UX-015 |
| **Tiendanube** · `TIENDANUBE_CLIENT_ID`, `_CLIENT_SECRET` + `tiendanubeAccessToken` por org (en claro) | `src/lib/integrations/tiendanube.ts:21`, `:33-34`, `:52-58` | Resumen de la tienda | No: cada respuesta con error se toma como lista vacía y queda en ceros 30 min | Reconectar con un SUPER_ADMIN impersonando (el cliente ve un 401) | BUG-032, BUG-033, BUG-143, UX-052 |
| **Cal.com** · `calComApiKey` por org (en claro y en la query) | `src/lib/integrations/cal-com.ts:24-30`, `:49` | Agenda inteligente | No: `console.error` y `null` cacheado 10 min | Hoy no aplica: la API v1 está apagada; hay que migrar a v2 | TEC-002, FAL-004, SEC-036 |
| **PageSpeed** · `GOOGLE_PAGESPEED_API_KEY` | `src/lib/integrations/pagespeed.ts:41` | Velocidad del sitio | No: `console.warn`/`console.error` y `null` por 6 h | Key nueva en Google Cloud → Netlify → redeploy | BUG-143, DEU-071 |
| **Telegram** · `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (o los de Configuración) | `src/lib/notifications/telegram.ts:41-48`, `:54-55` | Avisos de leads al equipo | No: 401 → `console.error` y `false`; `isTelegramConfigured` sigue en true (`:108-110`) | Desde `/admin/settings`, sin redeploy: el único servicio que se rota desde la UI | BUG-100, SEC-073, SEC-036 |
| **Meta / WhatsApp (360dialog)** · API key por canal, cifrada con `MOTOR_CHANNEL_SECRET_KEY`; `MOTOR_D360_BASE_URL` | `src/modules/motor/services/sendMessage.ts:210`, `:234`; `src/modules/motor/adapters/whatsapp/outbound/client.ts:258` | El motor de WhatsApp, hoy latente (nada consume los entrantes y el envío no tiene llamadores) | No: los fallos de envío no se registran y las alertas de salud del canal quedan en MotorAlert sin lector | Key nueva en el hub de 360dialog y guardarla cifrada de nuevo (no hay pantalla de alta) | FAL-021, FAL-022, DEU-051 |
| **n8n** · `N8N_CONTACT_WEBHOOK_URL` (servidor), `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL` (navegador), `N8N_API_URL`, `N8N_API_KEY` | `src/lib/n8n.ts:19`, `src/components/sections/home/Footer.tsx:81` | Leads del formulario de contacto al CRM y el formulario del pie del home | No: el pie muestra éxito aunque n8n falle | URL nueva → Netlify; la variable `NEXT_PUBLIC_` se incrusta en el build y obliga a recompilar | SEC-094, BUG-099, SEC-090 |
| **Neon (Postgres)** · `DATABASE_URL`; `DIRECT_DATABASE_URL_PROD`/`_DEV` en GitHub Actions | `prisma/schema.prisma:7`; `raíz:.github/workflows/db-backup.yml:84-85` | Todo: login, portal, admin, chat, crons y el backup diario | Parcial: los errores no manejados van a Sentry si hay DSN; una falla en el callback `jwt` se ve como «sin sesión»; no hay timeouts; el backup fallido avisa por GitHub | Rol o contraseña nueva en Neon → `DATABASE_URL` en Netlify y los secrets del workflow → redeploy | BUG-006, BUG-020, DEU-007 |
| **Netlify** · cuenta y sitio; `URL` y `NETLIFY` los pone la plataforma | `netlify/functions/generate-insights-cron.ts:45`, `src/app/api/qa/login/route.ts:65` | El sitio, los deploys, las 3 scheduled functions y todas las variables de entorno | Fuera del código: avisos de Netlify por email; las fallas de las functions quedan solo en sus logs | Plan y facturación del team en Netlify | BUG-047, BUG-014 |
| **Sentry** · `NEXT_PUBLIC_SENTRY_DSN` (`SENTRY_DSN` no tiene lector vivo); `SENTRY_AUTH_TOKEN`, `_ORG`, `_PROJECT` para los source maps | `src/instrumentation.ts:7`, `:34`, `src/instrumentation-client.ts:5`, `next.config.ts:254-260` | Todo el monitoreo | No, por definición: sin DSN el SDK queda inerte en silencio | DSN en Netlify con scope de build y recompilar | FAL-030, FAL-029 |
| **`CRON_SECRET`** | `netlify/functions/generate-insights-cron.ts:46`, `src/lib/cron/cron-secret.ts:41` y copias en `regenerate-briefs`, `send-executive-reports` y `alerts` | Insights, reporte semanal y limpieza (los otros crons ya no corren) | Solo en los logs de Netlify Functions: 500 si falta, 401 si difiere | El mismo valor en el sitio y en las functions, y redeploy | SEC-098, SEC-099, BUG-047, FAL-026 |
| **Secretos propios** · `AUTH_SECRET`/`NEXTAUTH_SECRET`, `EMAIL_UNSUBSCRIBE_SECRET`, `OAUTH_STATE_SECRET`, `IMPERSONATION_SECRET`, `CRM_SECRET_KEY`, `MOTOR_CHANNEL_SECRET_KEY`, `ONBOARDING_SECRET_KEY`, `CHATBOT_IP_HASH_SALT` | `src/lib/email/unsubscribe-token.ts:7-9`, `src/lib/security/oauth-state.ts:27-29`, `src/lib/impersonation.ts:16-18` | No vencen. Rotar `AUTH_SECRET` cierra todas las sesiones y, sin secretos propios, invalida los links de baja ya enviados y los OAuth en curso; rotar `CRM_SECRET_KEY` o `MOTOR_CHANNEL_SECRET_KEY` deja sin descifrar lo guardado | No aplica (se rotan a mano) | Rotación coordinada: primero cargar los secretos propios y recién después rotar `AUTH_SECRET` | SEC-097, SEC-096 |

- `BLOB_READ_WRITE_TOKEN` (Vercel Blob, alerta D7-A6) no aparece en el código ni en `.env.example` (`git grep` sobre `origin/main`). El inventario completo (106 variables en 19 grupos, con las de scripts) está en `_crudo/credenciales-env.json`. El conteo de §7 (58 variables) es el de F1, que no contaba las lecturas implícitas de Auth.js ni las de `scripts/`.

## 7. Variables de entorno

Fuente: `process.env.X` en `src/`, `netlify/`, `prisma/` y configs (sin tests) contra `.env.example` (solo nombres).

- **58 variables usadas; 18 no figuran en `.env.example`**: `ALLOW_PROD_SEED`, `CHATBOT_STREAM_PROBE`, `CI`, `DRY_RUN`, `E2E_DIST_DIR`, `EVALS_BASE_URL`, `EVALS_JUDGE_MODEL`, `EVALS_ORIGIN`, `GALERIA_PORT`, `NETLIFY`, `NEXT_RUNTIME`, `NODE_ENV`, `OAUTH_STATE_SECRET`, `SENTRY_DSN`, `SETTER_EXTERNAL_SERVER`, `SETTER_PORT`, `URL`, `VERCEL_ENV`. Las que importan para operar: `OAUTH_STATE_SECRET` (`src/lib/security/oauth-state.ts`), `SENTRY_DSN` (`sentry.{server,edge}.config.ts`; `.env.example` solo trae `NEXT_PUBLIC_SENTRY_DSN`), `URL` (la setea Netlify) y `ALLOW_PROD_SEED`.
- **11 documentadas sin lectura directa por nombre**: `CHATBOT_GOOGLE_API_KEY`, `DIRECT_DATABASE_URL`, `MOTOR_CHANNEL_SECRET_KEY`, `RESEND_FROM_EMAIL`, los cuatro `SEED_*_PASSWORD` (se leen por nombre dinámico en `prisma/seed-guard.ts`, falso positivo), `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (los toma el build de Sentry). Se cruzan en D7/D8.

## 8. Tests y verificación

- **185 archivos de test**: 97 en `tests/` (`e2e` 35, `setter` 30, `integration` 12, `leados` 7, `helpers` 6 y otros 7) y 88 en `src/` (**85 invariantes** `*.invariant.ts` más 3 en `__tests__/` o `*.test.ts`; por carpeta: 32 en `src/lib/leados`, 31 en `src/modules/chatbot`).
- **`package.json`**: 115 scripts — 58 `check:*` (invariantes), 35 `test:*`, 4 `evals*`, 4 `seed*`, 3 `galeria*`, más `dev`, `build`, `start*`, `lint`.
- **CI** (`raíz:.github/workflows/ci.yml`): en cada push y PR corre `tsc` e invariantes; las suites de LeadOS y e2e corren solo si existe el secret `DATABASE_URL_TEST` (y antes migran esa base); el lint está afuera por decisión documentada en su cabecera.
- **Cobertura real** (qué flujo cubre cada test): se mapea en el ciclo 1 de cada dominio (DEC-22) y se consolida en D9.

## 9. Baseline de F1

| Herramienta | Resultado | Crudo |
|---|---|---|
| `tsc --noEmit --incremental false` | **0 errores**, exit 0, 33 s (el error conocido de `searchconsole.ts:119` no apareció) | `_crudo/tsc.txt` (vacío) |
| eslint (todo el proyecto, sin las carpetas de la auditoría) | 1.604 archivos, 116 con problemas: **102 errores, 111 warnings** — entre ellos 37 `react-hooks/set-state-in-effect` (31 archivos), 16 `no-require-imports`, 14 `react-hooks/purity`, **13 `no-explicit-any`** (7 archivos), 45 directivas `eslint-disable` sin uso | `_crudo/eslint.json` (sin código fuente), `_crudo/eslint-resumen.md` |
| `npm outdated` / `npm ls` / `npm audit` | ver §2 | `_crudo/npm-*.json/txt` |
| `prisma migrate status` | no disponible: `P1012 Environment variable not found: DATABASE_URL` (Prisma CLI 6.19.3) | `_crudo/prisma-migrate-status.txt` |
| depcruise (`src/`) | 1.402 módulos, 3.555 dependencias; **22 ciclos** de imports; **63 huérfanos** candidatos | `_crudo/depcruise.json` (2,5 MB, local), `_crudo/depcruise-resumen.json` |
| knip | **no disponible por memoria `[TIMEBOX]`** (DEC-42: tres intentos con menos de 4 GB libres; ver §12 del plan). La poda de `10-PODA.md` salió sin knip, con depcruise y `git grep` | — |

## 10. Ramas y worktrees

Fuente: `_crudo/ramas.json` (`scripts/auditoria/ramas.mjs`, base `origin/main`, fecha 2026-10-13). **89 ramas: 45 mergeadas, 10 vivas, 21 dormidas, 13 abandonadas.**

- **Vivas (10)**: `rediseno/home` (+563, worktree `C:/rediseno-home`; el home v3), cuatro `respaldo/*` de septiembre (+104 a +121, snapshots del rediseño), `rediseno/deslizar` y `rediseno/deslizar2`, `p25/rafaga-tildes` (+5, capturas de LeadOS), `chore/auditoria-clean` (+1, worktree; su copia local difiere de la remota: 1 adelante y 4 atrás) y esta rama.
- **Dormidas (21)**: las 16 ramas `v3/*` y `rediseno/{cimientos,motion,chrome,secciones-a,secciones-b}` (etapas intermedias del rediseño, todas contenidas en `rediseno/home`) y `p25/carrera-tildes`.
- **Abandonadas (13)**: `b0-isolation-motor-chatbot` (+8, 9 archivos solo ahí), `experimento/estetica-goal` (+15), `chore/security-quick-wins`, `leados/b8a-iii`, `revert-home-abortado`, `chore/auditoria-{seguridad,maestra}`, `chore/gs-aislamiento` (6 archivos de golden suite solo ahí), `b1-s1-bsp-inbound`, `b2-s1-bot-sync-surface` (7 archivos del chatbot solo ahí), `chore/wf-home` y dos `claude/*`.
- **Worktrees (5)**: ver §1.1 del plan. `main` local está 52 commits detrás de `origin/main`.
- `rediseno/home` modifica 29 archivos de main (entre ellos `src/app/layout.tsx`, `globals.css`, `src/lib/utils.ts`, `next.config.ts`, `package.json`, `CLAUDE.md`, `components/design-system/` y `styleguide/`), borra la skill `impeccable` (`.github/skills/impeccable/`, `.impeccable/`, `.github/hooks/impeccable.json`) y agrega 3.037 archivos (v3, capturas, y los handlers `/api/contacto` y `/api/newsletter`).

## 11. Scripts operativos y sueltos

- `scripts/`: 99 archivos (68 en la raíz de `scripts/`, 14 en `qa-corridas/`, 11 en `dev/`, 4 en `regression/`, 1 en `load-test/`, 1 en `_experimental/`). La mayoría son de un sprint (`_b13-*`, `_b14-*`, `b1-verify-*`, `p41-*`, `seed-matsu-*`…); 25 escriben en la base. Dos son salidas de bench commiteadas (`_b13-latency-*.json`, `_b14-2-pages-*.json`).
- Sueltos en la raíz de la app: `script.js`, `script2.js`, `script3.js`, `script_{aiscene,analytics,leads,magnetic,maps}.js`, `replace_analytics.js`, `find_unused.js`, `test-chat.mjs` y salidas generadas commiteadas (`ts_errors.{log,txt}`, `.eslint_output.txt`, `audit.txt`, `unused_report*.txt`, `ts_prune_output.txt`, `prisma_err.txt`). En la raíz del repo: dos `_tmp_*.html`.
- Todo esto entra al triage de `10-PODA.md`.

## 12. Documentación e insumos

- **266 filas DOC**: 239 en `docs/` (incluidos 8 transcripts de evals con posible PII y sus 2 README), 16 `.md` en la raíz de la app (entre ellos `STATUS.md` —se declara fuente de verdad y es del 2026-05-21—, `DEPLOY.md` —describe Vercel—, `AGENTS.md`, seis `_lane-*` y `CHANGELOG*`) y 8 en la raíz del repo (`CLAUDE.md`, `DESIGN.md`, `PRODUCT.md`, `AUDITORIA-VS-BRIEF-2026-07.md`, cuatro `lane-*.md`). Inventario por archivo (líneas, último commit, título): `_crudo/inventario-superficial.json`.
- **Auditorías previas**: índice de sus hallazgos CRÍTICA/ALTA/P0/P1 en `_crudo/previas.json` (F1.9; ver §12.1).
- **Insumos de Drive** (`docs/_insumos/drive/`, sin seguimiento, nunca se commitean): 45 `.md` — registros de cambio de Valentino (`Olme/`: admin con `Operaciones/`, cliente, chatbot, panel; `Ideas de nuevas features.md`), bloques a ejecutar de Franco (`Franco/Bloques a Ejecutar/{CHATBOT,DASHBOARD,OSLEAD}`), su flujo de trabajo (`Franco/Work Flow/`) y `Recursos DevelOP.md`. Uso: DEC-35.

### 12.1 Índice de auditorías previas

Fuente: `_crudo/previas.json` (F1.9: 3 agentes de solo lectura, 35 documentos leídos completos). **290 hallazgos CRÍTICA/ALTA/P0/P1** (escala de cada documento), 84 declarados cerrados por algún documento; por dominio probable: D1 18 · D2 23 · D3 18 · D4 42 · D5 55 · D6 48 · D7 29 · D8 28 · D9 29. Cada lote de F2 recibe los que citan sus archivos y los re-verifica contra el código de hoy (DEC-12): un «cerrado» declarado no se da por bueno sin lectura.

| Documento | Hallazgos altos | Declarados cerrados |
|---|---|---|
| `rama:origin/chore/auditoria-maestra:docs/baselines/2026-07-auditoria-maestra.md` | 68 | 14 |
| `docs/audits/2026-06-revalidacion-dashboard-chatbot.md` | 49 | 19 |
| `docs/audits/2026-06-revalidacion.md` | 46 | 20 |
| `docs/audits/2026-05-auditoria-profunda.md` | 21 | 10 |
| `docs/auditoria-seguridad-2026-05.md` | 15 | 7 |
| `docs/audits/2026-05-auditoria-db.md` | 11 | 8 |
| `raíz:AUDITORIA-VS-BRIEF-2026-07.md` | 11 | 0 |
| `docs/auditoria-consistencia-setter.md` | 10 | 2 |
| `rama:chore/auditoria-clean:docs/baselines/2026-07-auditoria-clean.md` | 10 | 0 |
| `docs/sprints/alpha-1-reaudit.md` | 9 | 0 |
| `docs/auditorias/AUDITORIA-CIERRE-2026-07.md` | 8 | 0 |
| `docs/audit-repo-20260707.md` · `docs/b8a-auditoria.md` | 5 · 5 | 1 · 2 |
| `docs/audit-chatbot-runtime.md` · `docs/b8a-ii-auditoria.md` | 4 · 3 | 0 · 0 |
| `docs/baselines/2026-07-auditoria-seguridad.md`, `docs/auditoria-total-pre-deploy.md`, `docs/auditorias/C0-RED-DE-VERIFICACION-2026-08.md`, `docs/auditorias/A3-VIABILIDAD-BIS-2026-08.md`, `docs/auditoria-recorrido-completo-novato.md` | 2 c/u | 0 |
| `docs/auditorias/{SMOKE-TEST-MANUAL-2026-07,REGRESION-FINAL-2026-07,A3-VIABILIDAD-DECISIONES-2026-08}.md`, `docs/audit/2026-04-dashboard-cleanup-audit.md`, `docs/microaudit-frozen-frontera-CO.md` | 1 c/u | 1 en el smoke |

Sin hallazgos de severidad alta (baselines de performance, censos, viabilidad, runbooks o auditorías de diseño sin escala): `docs/baselines/2026-05-{admin-performance,chatbot-runtime}.md`, `docs/auditorias/{A1-CENSO-SUPERFICIES,A2-SETTER-DOCS-VIABILIDAD,A3-ESTADO-ECC-SKILLS}-2026-08.md`, `docs/audits/2026-05-{bfg-leak-cleanup,cleanup-db-dev}.md`, `docs/auditoria-ux-setter.md`, `docs/{admin-design-system-audit,design-system-audit}.md`. La auditoría de seguridad de julio (`docs/baselines/2026-07-auditoria-seguridad.md`) quedó con solo 2 ALTO tras su refutación adversarial; sus MEDIO y BAJO no se indexaron y los lectores los encuentran por su cuenta.

## 13. Sitio público y v3

- Sitio público en main: 138 archivos de alcance superficial (`src/app/` público, `components/{sections,3d,canvas,software,automation,ia,layout,brand,design-system}`, `context/`), inventariados en `_crudo/inventario-superficial.json`. 17 archivos públicos que importa código interno pasaron a D9 profundo (DEC-09).
- `src/app/v3/` no existe en main: vive en `rediseno/home` (883 archivos), fuente de F3.
