> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# Operaciones

> **Borrador E11** · base `57c421bc` · destino propuesto `logic-core-v3/docs/OPERACIONES.md`.
> Credenciales: la fuente es `docs/auditoria-2026-10/01-INVENTARIO.md` §6.1 (E10), abreviado `INV`. **Solo nombres de variables, nunca valores.**
> Fuentes: rutas relativas a `logic-core-v3/`; `raíz:` = raíz del repo; `atlas:` = `docs/auditoria-2026-10/06-ATLAS/`. **[A DECIDIR]** = contradicción sin resolver.

## 1. Deploy

- Hosting en Netlify con `@netlify/plugin-nextjs`. Build `npx prisma generate && npm run build`, publish `.next`, Node 22, `NODE_OPTIONS=--max-old-space-size=4096` (netlify.toml:1-10). El plugin no está pineado (docs/baselines/2026-07-auditoria-seguridad.md:3542).
- URL servida: develop-portfolio.netlify.app; dominio canónico configurado: develop.com.ar (`metadataBase`, src/app/layout.tsx:23; docs/bitacora-roadmap.md:9607, 9721-9723). **A verificar (VH-175):** qué dominio sirve hoy `widget.js`; el snippet de instalación apunta a develop.com.ar (docs/operations/06-instalar-widget.md:29).
- **Migraciones:** el build no corre `prisma migrate deploy` (netlify.toml:2). **[A DECIDIR]** docs/operations/00-entornos.md:86 y docs/chatbot-deploy.md:71-74 dicen que sí. Mientras tanto se aplican a mano contra la branch main, con el SQL a la vista (§4).
- Cache de CDN: hubo un incidente con «/» servido con Age de ~71 días; se mitiga con «Clear cache and deploy site» (docs/bitacora-roadmap.md:14137-14143).
- `vercel.json` y `logic-core-v3/DEPLOY.md` son legado de Vercel (CE: `docs/_insumos/drive/Franco/Work Flow/Proyecto DevelOP/Contexto/develOP-contexto-estable-v1.0.md:51`). **[A DECIDIR]** qué hacer con los 3 crons que solo están ahí (§2).
- Verificación después de un deploy: health del bot (`/api/chatbot/[slug]/health`), una conversación de prueba por `curl` y revisar Netlify Function Logs (docs/chatbot-deploy.md:78-106; docs/operations/02-activar-bot.md:37-52). El health da ok aunque Vertex esté caído, porque no llama al modelo (INV:101).
- Rollback: Netlify → Deploys → volver al deploy anterior, o `git revert` y push; si se revierte, revertir también cualquier migración que no sea compatible hacia atrás (docs/chatbot-deploy.md:108-119).

## 2. Crons

| Cron | Agenda (UTC) | Registrador | Qué hace | ¿Corre? | Fuente |
|---|---|---|---|---|---|
| generate-insights | `0 9 * * *` | netlify.toml:25-26 | Insights del chatbot | declarado; en producción sin verificar (VH-136) | netlify/functions/generate-insights-cron.ts |
| send-weekly-reports | `0 12 * * MON` | netlify.toml:28-29 | Reporte semanal | declarado; en producción sin verificar (VH-136) | netlify/functions/ |
| cleanup-old-events | `0 6 * * *` | netlify.toml:31-32 | Purga `chatbot_events` a 30 días | declarado; en producción sin verificar (VH-136) | src/app/api/cron/cleanup-old-events/route.ts:14 |
| os-follow-up | `0 12 * * *` | vercel.json:4-5 | Follow-up de LeadOS | no (BUG-047) | atlas:arquitectura.md:72 |
| regenerate-briefs | `0 10 * * 1` | vercel.json:8-9 | Briefs | no (BUG-047) | atlas:arquitectura.md:72 |
| send-executive-reports | `0 12 * * 1` | vercel.json:12-13 | Reporte ejecutivo | no (BUG-047) | atlas:arquitectura.md:72 |
| detect-bot-issues | documentado cada 15 min | ninguno | Detector de alertas | no (FAL-016) | docs/operations/cron-jobs.md:6; docs/operations/alerts-types.md:5 |
| alerts | — | ninguno | Alertas periódicas de agencia | no | INV:93 |

- Cada cron de Netlify es una Function real que llama a la ruta por HTTP; nombrar la ruta en `netlify.toml` no alcanza. Hasta el 2026-07-11 prod no ejecutaba ningún cron declarado (docs/bitacora-roadmap.md:13841-13850).
- Auth: `CRON_SECRET` por `Authorization: Bearer` o `X-Cron-Secret`, y falla cerrado si la variable falta (src/lib/cron/cron-secret.ts:35-44). os-follow-up, regenerate-briefs, send-executive-reports y alerts tienen su propio chequeo inline (INV:117).
- Retención: solo `chatbot_events` (30 días). Conversaciones, mensajes y leads no tienen retención automática (docs/privacidad-afirmaciones-cliente.md:68-72).

## 3. Backups y recuperación

- Workflow raíz:.github/workflows/db-backup.yml: cron diario 06:00 UTC (:41) más disparo manual prod/dev; `pg_dump --no-owner --no-acl` → gzip → GPG AES256 → artifact de 30 días → restore-test sobre `postgres:16` con conteo de filas (:56-199; docs/operations/neon-backups.md:12-43).
- Secrets (nombres): `DIRECT_DATABASE_URL_PROD`, `DIRECT_DATABASE_URL_DEV` (db-backup.yml:84-85), `BACKUP_GPG_PASSPHRASE` (:105, :182). Según docs/operations/neon-backups.md:54-56 (2026-05-26), la passphrase iba a vivir como secret de GitHub y en el password manager de Franco; el 2026-10-15 el repo no tenía ningún secret de Actions (BUG-171), así que hoy no está en GitHub.
- **Estado:** el workflow corre todos los días pero nunca terminó bien: 140 corridas fallidas por falta del secret (gh run list, 2026-10-15; BUG-171); la única red hoy es la retención propia de Neon (atlas:arquitectura.md:75). Cargar los secrets y validar el primer run es de Franco (docs/bitacora-roadmap.md:9527-9532).
- Restaurar en emergencia: bajar el artifact del último run bueno, `gpg --decrypt` → `gunzip` → `psql` a una base nueva, verificar `_prisma_migrations` y apuntar `DATABASE_URL` en Netlify. Rollback parcial: restaurar en una base temporal y copiar la tabla con cuidado de FKs (docs/operations/neon-backups.md:112-144).
- Scripts locales: `scripts/db-backup-local.sh` y `scripts/db-restore-local.sh`; el restore aborta si el destino no es dev o localhost, salvo `--i-know-what-im-doing` (docs/operations/neon-backups.md:148-172).
- DR: RTO ~1 h, RPO 24 h. Escalar a Neon Launch y bucket externo si la base pasa 1 GB, hay 10 o más clientes con data crítica o el RPO deja de alcanzar (docs/operations/neon-backups.md:176-201).
- Los dumps tienen PII (emails, conversaciones, tokens de reset, sesiones): nunca al repo, nunca descifrados por canales abiertos (docs/operations/neon-backups.md:205-220).

## 4. Entornos, base de datos y migraciones

- Neon Postgres en sa-east-1 con branching: `dev` para local, en `.env` y `.env.local` (Prisma CLI lee `.env`), y `main` para prod desde Netlify (docs/operations/00-entornos.md:9-19). **[A DECIDIR]** otras fuentes dicen que dev y prod compartían base (docs/audits/2026-05-auditoria-db.md:57; docs/audits/2026-06-revalidacion-dashboard-chatbot.md:21); no se puede verificar desde el código.
- Resetear dev: borrar la branch y recrearla desde main en el dashboard de Neon; nunca `migrate reset` (docs/operations/00-entornos.md:88, 92-103).
- Protocolo de migraciones: DECISIONES D-37. `migrate status` no detecta drift estructural; usar `prisma migrate diff --from-schema-datasource` (docs/admin-changelog/Operaciones rdc.md:66; docs/bitacora-beta.md:1746).
- La Neon dev es compartida con el socio: las migraciones aditivas se avisan (docs/sprints/utm-1-captura.md:228, 252).
- Plan free con autosuspend: el cold start medido fue de ~1 s en mayo y de 14–30 s en julio, contra un corte de ~10 s de la Function free (docs/baselines/2026-05-admin-performance.md:30-90; docs/sprints/infra-2-cold-start-retry.md:18-20). **[A DECIDIR]** plan de Neon.
- Pendientes: no se verificó si la limpieza de datos del 2026-05-21 se replicó en main (docs/audits/2026-06-revalidacion.md:24, 124); el schema `prisma_shadow` (32 tablas) ocupa espacio desde el 2026-04-03 (docs/probe-poda-terreno.md:1174); la credencial de Neon dev quedó parcialmente impresa en un transcript y se recomendó rotarla (docs/diagnostico-visual-2026-08/REPORTE.md:219-222).
- Seeds: `prisma/seed-guard.ts` aborta contra prod salvo `ALLOW_PROD_SEED=1`; los seeds y las migraciones los corre un humano (docs/bitacora-beta.md:18-26; docs/client-portal/changelog/general.md:101, 104).

## 5. Credenciales y dependencias externas (E10)

Regla general: salvo el chat de Vertex, ninguna integración ni cron reporta a Sentry, y Sentry mismo depende de una variable incrustada en el build; si vence una credencial, el sistema no tiene cómo enterarse. Cómo verificar vencimientos: VH-134 y VH-141 en `docs/auditoria-2026-10/08-VERIFICACION-HUMANA.md` (INV:97).

| Servicio | Variables (nombres) | Si vence o se revoca | ¿Se entera? | Cómo se renueva | Fuente |
|---|---|---|---|---|---|
| Vertex AI | `GOOGLE_VERTEX_CREDENTIALS_JSON` (Netlify), `GOOGLE_APPLICATION_CREDENTIALS` (local), `CHATBOT_GCP_PROJECT_ID`, `CHATBOT_GCP_LOCATION` | **Vencida hoy**: chatbot de todos los clientes, insights, brief y resumen ejecutivo | Parcial: el chat va a Sentry si hay DSN; el health da ok | Key nueva de la service account → Netlify → redeploy; local, `vertex-credentials.json` por worktree | INV:101 |
| Anthropic | `ANTHROPIC_API_KEY` | Insights de Resultados y borrador de respuesta a reseñas | No | Consola de Anthropic → Netlify → redeploy | INV:102 |
| Brevo | `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME` | Magic link, reset, bienvenida (única copia de la contraseña temporal), reportes, avisos, email marketing | No | Key nueva → Netlify → redeploy; sin remitente verificado sale de un Gmail personal | INV:103 |
| Resend | `RESEND_API_KEY` | «Acción requerida», respuesta de ticket, aviso de mensaje del admin | No: sin key devuelve éxito sin enviar | Key y dominio en Resend, o pasar esos envíos a Brevo | INV:104 |
| Google OAuth (login) | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | «Continuar con Google», que hoy no completa | No | Google Cloud → secret nuevo → Netlify → redeploy | INV:105 |
| GA4 y Search Console | `GOOGLE_SERVICE_ACCOUNT_KEY` | Tráfico y SEO (muestra datos demo) | No | Key nueva sin perder el acceso a cada propiedad | INV:106 |
| Google Business Profile | `GOOGLE_BUSINESS_PROFILE_CLIENT_ID`, `_CLIENT_SECRET`, `_REDIRECT_URI` y tokens por org en claro | Reputación y Motor de Reseñas | No: sigue diciendo OPERATIONAL | Un SUPER_ADMIN reabre `/api/auth/google-business/start?orgId=` a mano | INV:107 |
| Tiendanube | `TIENDANUBE_CLIENT_ID`, `_CLIENT_SECRET` y token por org en claro | Resumen de la tienda (queda en ceros) | No | Reconectar impersonando | INV:108 |
| Cal.com | `calComApiKey` por org | Agenda inteligente | No | La API v1 está apagada: migrar a v2 | INV:109 |
| PageSpeed | `GOOGLE_PAGESPEED_API_KEY` | Velocidad del sitio | No | Key nueva → Netlify → redeploy | INV:110 |
| Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (o Configuración) | Avisos de leads al equipo | No | Desde `/admin/settings`, sin redeploy | INV:111 |
| 360dialog (WhatsApp) | API key por canal cifrada con `MOTOR_CHANNEL_SECRET_KEY`; `MOTOR_D360_BASE_URL` | Motor WhatsApp, hoy latente | No | Key nueva y guardarla cifrada (sin pantalla de alta) | INV:112 |
| n8n | `N8N_CONTACT_WEBHOOK_URL`, `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL`, `N8N_API_URL`, `N8N_API_KEY` | Leads del contacto al CRM y formulario del pie | No: el pie muestra éxito | URL nueva; la pública obliga a recompilar | INV:113 |
| Neon | `DATABASE_URL`; `DIRECT_DATABASE_URL_PROD`/`_DEV` en Actions | Todo | Parcial | Rol o contraseña nueva → Netlify y secrets → redeploy | INV:114 |
| Netlify | cuenta y sitio | Sitio, deploys, functions y variables | Fuera del código | Plan y facturación del team | INV:115 |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN`; `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Todo el monitoreo | No, por definición | DSN con scope de build y recompilar | INV:116 |
| `CRON_SECRET` | `CRON_SECRET` | Insights, reporte semanal, limpieza | Solo logs de Functions (500 o 401) | Mismo valor en sitio y functions, y redeploy | INV:117 |
| Secretos propios | `AUTH_SECRET`/`NEXTAUTH_SECRET`, `EMAIL_UNSUBSCRIBE_SECRET`, `OAUTH_STATE_SECRET`, `IMPERSONATION_SECRET`, `CRM_SECRET_KEY`, `MOTOR_CHANNEL_SECRET_KEY`, `ONBOARDING_SECRET_KEY`, `CHATBOT_IP_HASH_SALT` | No vencen. Rotar `AUTH_SECRET` cierra sesiones y, sin secretos propios, invalida links de baja y OAuth en curso; rotar `CRM_SECRET_KEY` o `MOTOR_CHANNEL_SECRET_KEY` deja sin descifrar lo guardado | — | Rotación coordinada: primero cargar los secretos propios y después rotar `AUTH_SECRET` | INV:118 |

## 6. Variables de entorno

- Fuente de nombres: `.env.example` y `scripts/check-env.js`. Inventario completo, 106 variables en 19 grupos con las de scripts: `docs/auditoria-2026-10/_crudo/credenciales-env.json` (INV:120).
- Usadas y ausentes de `.env.example` que importan para operar: `OAUTH_STATE_SECRET`, `SENTRY_DSN`, `URL` (la pone Netlify) y `ALLOW_PROD_SEED` (INV:126).
- Distintas entre dev y prod: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `GOOGLE_APPLICATION_CREDENTIALS` (local) contra `GOOGLE_VERTEX_CREDENTIALS_JSON` (Netlify), `CHATBOT_IP_HASH_SALT` y `CRON_SECRET` (obligatorias en prod), `GOOGLE_BUSINESS_PROFILE_REDIRECT_URI` (docs/operations/00-entornos.md:111-121). `CHATBOT_IP_HASH_SALT` se creó en Netlify el 2026-08-11 (docs/privacidad-afirmaciones-cliente.md:99).
- Las `NEXT_PUBLIC_*` se incrustan en el build: cambiarlas obliga a recompilar (INV:113, 116).

## 7. CI y verificación local

- raíz:.github/workflows/ci.yml corre en push y PR (:65) con Node 24 (:87). Job 1, sin secrets: `npm ci`, `prisma generate`, `check:types` (`tsc --noEmit`) y `check:invariants` (:79-105). Job 2: `test:leados` con `DATABASE_URL_TEST`; si falta, solo deja un warning (:128-170). Job 3: e2e Playwright con `DATABASE_URL_TEST`, `AUTH_SECRET`, `CHATBOT_GCP_PROJECT_ID` y `GOOGLE_VERTEX_CREDENTIALS_JSON`, entre otros (:179-228).
- Suites al 2026-09-06: `test:setter` 187, `test:leados` 33, `test:helpers` 28, `check:invariants` 55/55 (docs/bitacora-beta-3.md:10945-10950).
- QA local: `npm run dev:qa` en :3002 con `QA_ALLOW_LOCALHOST=1`, `start:qa` en :3001 sobre build de prod, suite del setter en :3003 con distDir `.next-setter`; `POST /api/qa/login` con personas (super-admin, setter, client-a, client-b) y triple guard: flag, host localhost y fuera de Netlify o Vercel (docs/bitacora-beta-2.md:22-48; docs/auditorias/A3-ESTADO-ECC-SKILLS-2026-08.md:20; docs/probe-poda-terreno.md:1138).
- Una sesión, un worktree, con puerto y distDir propios (LECCIONES §3).

## 8. Observabilidad y alertas

- Fallas del chat: stderr en Netlify Function Logs con los eventos `chat.persist_failed`, `chat.stream_error` y `chat.unhandled_failed`; firma típica P1017, P2024 o UND_ERR_SOCKET (docs/sprints/infra-1-observabilidad.md:18, 35-44).
- Sentry (`@sentry/nextjs`, scrub de PII en `src/lib/sentry/scrub-pii.ts`): sin `NEXT_PUBLIC_SENTRY_DSN` en el build queda inerte en silencio (INV:116). **[A DECIDIR]** estado real en prod. El `tunnelRoute` `/monitoring` es un endpoint público y el scrub no cubre transacciones (docs/baselines/2026-07-auditoria-seguridad.md:2369, 3262).
- Alertas: 9 tipos con severidad; email por Brevo a `DEVELOP_ALERTS_EMAIL` para WARNING o más, Telegram para HIGH y CRITICAL; dedup de 24 h (docs/operations/alerts-types.md:10-37). Hoy el detector no tiene disparador (atlas:arquitectura.md:72).
- Reglas de alerta sugeridas para Sentry: error nuevo en production, más de 50 eventos por hora, errores en `/api/chatbot/*` (docs/operations/sentry-setup.md:9-21).

## 9. Procedimientos

### 9.1 Alta de un cliente
1. Juntar nombre comercial, rubro, ciudad, web, WhatsApp con código de país sin `+`, email y nombre del usuario, info para la KB y plan (docs/operations/01-onboarding-cliente.md:9-19).
2. `/admin/clients/new`: wizard de 5 pasos (empresa y usuario; identidad del bot; KB de 7 secciones; apariencia; revisión). El slug sale del nombre y después no se cambia (:34-80).
3. El sistema crea org, usuario con contraseña temporal y `passwordResetRequired`, bot y KB, y manda el email de bienvenida; si el email falla, la contraseña temporal se ve una sola vez en pantalla (:82-98). Reenviar credenciales desde el tab Overview (:100-107).
4. Verificar respuesta del bot, bienvenida, quick replies, handoff a WhatsApp y que el cliente cambió la contraseña (:127-135).

### 9.2 Activar un bot
Pre-flight de 6 checks (KB, bienvenida, 3 quick replies, WhatsApp, color, cuota); resolver los rojos; probar health y una conversación; activar; avisar al cliente (docs/operations/02-activar-bot.md:20-72). El Atlas propone descartar el pre-flight de activación (curado, h3.adm-chatbots.preflight-activacion).

### 9.3 Editar la KB
Editor en `/admin/clients/[orgSlug]/chatbot/knowledge`; buscar antes de editar; probar en el sandbox antes de guardar; revisar el diff; para revertir, copiar el «before» del audit log (docs/operations/03-editar-kb.md:18-108).

### 9.4 Instalar el widget
Bot activo y dominios permitidos cargados (con y sin `www`); copiar el snippet del tab «Instalar»; pegarlo antes de `</body>`; verificar eventos `CHAT.START` con el dominio del cliente (docs/operations/06-instalar-widget.md:7-91).

### 9.5 Alerta o «el bot no anda»
Triage: ¿activo? → ¿health? → ¿actividad en 24 h? → probar por `curl`. Por síntoma: no responde (embed, cookies, consola), responde mal (KB, tono), no llegan leads (`whatsappNumber`, tool de handoff) (docs/operations/05-cliente-no-anda.md:17-73). Respuesta por tipo de alerta y escalamiento: docs/operations/04-responder-alerta.md:11-92.

### 9.6 Alta de un setter
Solo por credentials (Google crea ORG_MEMBER), con `passwordResetRequired: true`, `emailVerified` y sin OrgMember; el aislamiento es por `OsLead.assignedToId` (docs/leados-alta-setter.md:3-18).

### 9.7 Conectar GA4 y Search Console de un cliente
El cliente suma la service account de develOP como Viewer en GA4 y como usuario en Search Console; se cargan los IDs en la organización y se verifica en `/dashboard/resultados/trafico` (docs/onboarding-data-connections.md:32-78).

### 9.8 Reconectar integraciones
GBP: un SUPER_ADMIN reabre el OAuth a mano. Tiendanube: reconectar impersonando. Telegram: desde `/admin/settings`. Cal.com v1: no aplica, migrar a v2 (INV:107-111).

## 10. Higiene de secretos

- `.gitignore` cubre `.env*`, `*.env`, `*environment*` y `*enviroment*`; antes de commitear, `git status` (docs/operations/00-entornos.md:133-139).
- Credenciales vivas jamás en el working directory del repo, ni gitignoreadas (CE:61). Nunca loguear valores de env (raíz:CLAUDE.md:62).
- Al enmascarar un `DATABASE_URL`, cortar antes del `@` imprime parte del password (docs/diagnostico-visual-2026-08/REPORTE.md:219-222).
- Secretos y contraseñas que hoy viven en docs o en la historia: SEGURIDAD-Y-PRIVACIDAD.md §3.
