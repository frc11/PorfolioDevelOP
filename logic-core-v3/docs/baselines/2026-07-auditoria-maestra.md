# AUDITORÍA MAESTRA — logic-core-v3 · 7 lentes, una corrida

**Auditado sobre `62544284b03ba4753abbba6f085622008833b1f7` del 2026-07-10.**

## Estado de la rama y del repo (Paso 0)

- Rama de auditoría: `chore/auditoria-maestra`, creada desde `origin/main` en worktree aislado (el checkout principal tenía WIP de `b1-s2-bsp-outbound`; el índice compartido entre sesiones es un hazard conocido — la auditoría corrió en worktree con índice privado).
- La rama main está **CALIENTE** — `git log --oneline -15` al momento de la foto:

```
6254428 Merge branch 'main' of https://github.com/frc11/PorfolioDevelOP
9910973 INFRA.2: idempotencia del user message + retry del widget para cold-start
affa06a Merge remote-tracking branch 'origin/main'
9aee04f docs(auditoria): regresión final 2026-07 + cierre bitácora
d19daa8 INFRA.1
751b4d7 Q1.1-fix
7da07fc Q1.2: scoring de la bateria (asserts duros + juez LLM Opus)
c7631a5 Q1.1: harness de conversaciones doradas (corredor, ejecuta y captura, no evalua)
8e8c849 docs: corrige nota de verificacion parcial de P4.1 + pendientes UTM (embed directo, gap de tests cliente)
56f8306 P4.1: render de atribucion por campana (UTM) en el panel
d21ac7c UTM.1: captura de atribucion first-touch (widget -> conversacion -> lead)
6e5b54c P3-A.2-acceso: vitrina lleva al LockedView; pedido unico en el LockedView
fecda1b fix(a11y): Field accesible por teclado y lector (pendiente 5.6)
f15acba docs(bitacora): cierre Sprint 7.1 (pase perceptual — header compacto en mobile)
c82ff48 fix(manual): pase perceptual 7.1 — header compacto en mobile (acción sobre el fold)
```

- `npx prisma migrate status` (Neon DEV): **`Database schema is up to date!`** — sin migraciones pendientes ni fallidas. (Prisma avisa upgrade major disponible — informativo, no bloqueante.)
- `docs/baselines/2026-06-bundle-baseline.md`: **NO existe** (P1 no cerró esa foto). El lente PERF toma su propia foto como baseline nueva y lo marca.
- `npm install` (nunca `npm ci`, por el drift conocido de `@emnapi/sharp`): OK.
- Build de PROD: `npm run build` = `next build --webpack` (Next.js 16.2.9, webpack). Compilación **exitosa en 4.1 min**, 31 páginas estáticas generadas, `EXIT=0`. `BUILD_ID=82u6Bc3z_GcYiaM3zqpk0`, 97 archivos en `.next/static/chunks`. Warning benigno: key `eslint` en `next.config.ts` ya no soportada por Next 16 (candidato a limpieza trivial).
- `@next/bundle-analyzer` está en `package.json` pero **no está cableado** en `next.config.ts` → el lente PERF midió bundle por chunks + manifests (método documentado en su sección), sin modificar config.
- Todas las mediciones de rendimiento son datos de **LAB** (pre-deploy, máquina local Windows 11), documentadas como tales.

## Cómo leer este reporte

- Cada lente: hallazgos con evidencia `archivo:línea` contra el hash auditado, priorizados P0/P1/P2 por riesgo real, y sección **INSUMOS PARA SPRINTS** (spec del fix por hallazgo P0/P1).
- ARQ y PERF separan **CRITERIO (durable)** de **MAPA (perecedero)** — el repo está pre-refactor (P1 a medias) y vivo; los mapas se refrescan post-limpieza con el comando de re-check documentado en cada lente.
- El dead code obvio está marcado "candidato P1" sin desarrollo profundo — hay un bloque de limpieza ya diseñado que lo va a borrar.
- Al final: tabla-resumen de TODO el programa propuesto (sprint × lente × prioridad × tamaño × re-check post-P1).

---


---

# LENTE SEC — auditado sobre 6254428 (2026-07-10)

Worktree: `C:/Users/franc/Desktop/wt-auditoria-maestra` (rama `chore/auditoria-maestra` = origin/main @ 6254428). Rutas relativas a `logic-core-v3/`. READ-ONLY: cero cambios (un `package-lock.json` tocado por `npm audit` fue restaurado con `git checkout --`; `git status -s` final vacío).

**Nota de fuentes**: `docs/auditoria-total-pre-deploy.md` es la auditoría AUDIT-4 de **performance** (hallazgos O-1…O-16, sin IDs de seguridad). Los hallazgos numerados P0-*/P1-* referidos por los commits de hardening viven en `docs/audits/2026-05-auditoria-profunda.md` (referenciada por el propio pre-deploy en su encabezado, líneas 3-6). El ledger cubre entonces: `docs/auditoria-seguridad-2026-05.md` (SEC-*, 32 hallazgos) + `docs/audits/2026-05-auditoria-profunda.md` (P0-1…P0-7, P1-1…P1-13 — solo los de seguridad).

**Fuera de alcance**: el motor 360dialog (B1-S1/S2/S3) NO está en main @6254428 (`src/lib/crypto/secret-box.ts` y `src/app/api/motor` no existen en el worktree — verificado por `ls`). Vive en ramas `b1-s*`; auditarlo cuando mergee.

---

## 1. LEDGER — hallazgos numerados de las auditorías previas

### 1.a `auditoria-seguridad-2026-05.md` (32)

| ID | Descripción corta | Sev. original |
|---|---|---|
| SEC-DEP-01 | Next.js 16.2.1 con 14 advisories (middleware bypass, SSRF, XSS) | P0 |
| SEC-DEP-02 | protobufjs <7.5.5 RCE (transitive) | P0 |
| SEC-AUTH-01 | OAuth state Google Business sin HMAC (state-swap CSRF) | P1 |
| SEC-AUTH-02 | OAuth state Tiendanube sin HMAC | P1 |
| SEC-AUTH-03 | JWT no invalidado tras password reset | P1 |
| SEC-AUTH-04 | Sin middleware global (defensa en profundidad) | P1 |
| SEC-RATELIMIT-01 | Rate-limit in-memory poroso en serverless | P1 |
| SEC-LLM-01 | Prompt injection sin delimitadores (spotlighting) | P1 |
| SEC-LLM-02 | PII del visitante a Vertex sin disclosure/anonimización | P1 |
| SEC-LLM-03 | capture_lead no verifica pertenencia de los datos | P1 |
| SEC-SSRF-01 | validateWebhookUrl no protege DNS rebinding | P1 |
| SEC-MISC-01 | Headers de seguridad globales faltantes | P1 |
| SEC-MISC-02 | Cookies NextAuth sin config explícita | P1 |
| SEC-PII-01 | Email de cliente en logs | P1 |
| SEC-DEP-03 | defu prototype pollution + effect ALS race | P1 |
| SEC-AUTH-05 | /api/track acepta organizationId arbitrario (SUPER_ADMIN) | P2 |
| SEC-AUTH-06 | exchangeCodeForTokens sin state validado | P2 |
| SEC-AUTH-07 | validateOrigin permite no-origin en non-prod | P2 |
| SEC-AUTH-08 | startImpersonationAction sin validar shape del orgId | P2 |
| SEC-RATELIMIT-02 | Chat rate-limit key con sessionId controlable | P2 |
| SEC-RATELIMIT-03 | IP de x-forwarded-for sin validar | P2 |
| SEC-LLM-04 | System prompt con KB completa en cada request | P2 |
| SEC-LLM-05 | ReactMarkdown sin skipHtml/urlTransform explícito | P2 |
| SEC-LLM-06 | show_whatsapp_handoff sin sanitizar prefilledMessage | P2 |
| SEC-LLM-07 | capture_lead sin CAPTCHA/verificación | P2 |
| SEC-LOGGING-01 | Posibles logs de PII en paths del chatbot | P2 |
| SEC-CACHE-01 | Cache bot+KB 60s sin invalidación | P2 |
| SEC-CACHE-02 | Cache keys globales admin-clients/admin-leads | P2 |
| SEC-PII-02 | Widget sin disclaimer envío a n8n | P2 |
| SEC-PII-03 | Widget sin disclaimer Vertex AI | P2 |
| SEC-INJ-01 | Input sin normalización Unicode/null bytes | P2 |
| SEC-SECRETS-01 | API key en .env local (falso P0, higiene) | P2 |
| SEC-DEP-04 | Deps moderate (dompurify, postcss, qs, …) | P2 |

### 1.b `docs/audits/2026-05-auditoria-profunda.md` (solo seguridad)

| ID | Descripción corta |
|---|---|
| P0-5 | `Project.organizationId` nullable → Tasks sin scoping |
| P0-6 | Queries admin sin scoping defensivo por org |
| P0-7 | capture_lead pierde un canal de contacto (email+phone) |
| P1-5 | Rate limiter in-memory en serverless (= SEC-RATELIMIT-01) |
| P1-12 | 4 server actions sin Zod |
| §3.5 | `/api/dashboard/leads/recent` devolvía 401 con body ambiguo |

---

## 2. RECONCILIACIÓN — cada hallazgo contra el código actual

Commits de la ola de hardening verificados con `git show --stat`: 933a141 (headers+cookies+PII+RL key), 6def504 (P0-6+Zod, crea `src/lib/auth/assert-ownership.ts`), 45642b9 (3ª instancia P0-6), 4114ff7 (guards en 5 mutations), 81c7301 (RL contactForm), 122c915 (SEC-LLM-01), 60db8a0 (SEC-LLM-03).

| ID | Estado | Evidencia |
|---|---|---|
| SEC-DEP-01 | **CERRADO-VERIFICADO** | `npm ls next` → `next@16.2.9`; `npm audit --omit=dev` → 0 critical/high (solo 2 moderate, ver §3.h) |
| SEC-DEP-02 | **CERRADO-VERIFICADO** | protobufjs ausente del output de `npm audit --omit=dev` (metadata: 2 moderate totales) |
| SEC-AUTH-01 | **CERRADO-SIN-TEST** | `src/lib/security/oauth-state.ts:50-59,72-120` (HMAC+nonce+TTL 10min+timingSafeEqual); consumido en `src/app/api/auth/google-business/callback/route.ts:30` y `src/lib/integrations/google-business-profile.ts:44`. Ningún test importa `oauth-state` (grep en `tests/`, `scripts/` → 0) |
| SEC-AUTH-02 | **CERRADO-SIN-TEST** | `src/app/api/auth/tiendanube/callback/route.ts:42` + `src/lib/integrations/tiendanube.ts:20`. Sin test |
| SEC-AUTH-03 | **CERRADO-SIN-TEST** | `prisma` User.sessionVersion + check en `src/auth.ts:212-230` (retorna `null` si versión no matchea → re-login); incrementos en `src/app/reset-password/actions.ts:76`, `src/app/cambiar-password/actions.ts:59`, `src/app/api/admin/users/[userId]/resend-credentials/route.ts:71`. Sin test |
| SEC-AUTH-04 | **CERRADO-VERIFICADO (parcial)** | Existe `src/proxy.ts` (middleware Next 16) con `matcher: ['/admin/:path*','/dashboard/:path*','/setter/:path*',…]` (:171-173) + redirect sin sesión (:104-108) + gates por rol (:117-156). Cubierto por `tests/e2e/19-security.spec.ts:4,12` (redirect /admin y /dashboard sin auth). NO cubre `/api/*` (por diseño: cada route hace su guard) |
| SEC-RATELIMIT-01 / P1-5 | **PARCIAL** | Migrado a limiter compartido en Neon (B14.1): `src/lib/rate-limit/limiter.ts:37-84` (UPSERT atómico, **fail-closed** :65-70) + presets `src/lib/rate-limit/presets.ts`. Consumido por chat, forgot/reset password, resend-credentials, contactForm, CRM retry/test, test-notification, send-executive-report. **Instancia SIN fix: `src/app/login/actions.ts:8-48`** — brute-force de login sigue con `Map` in-memory por lambda (comentario propio: "En producción multi-instancia reemplazar por Redis"). Además **`magicLinkAction` (login/actions.ts:135-158) no tiene NINGÚN rate-limit** (ver SEC-05) |
| SEC-RATELIMIT-02 | **CERRADO-SIN-TEST** | Key ahora `origin + sha256(IP)` en `src/app/api/chatbot/[slug]/chat/route.ts:70-76` (comentario cita el hallazgo). El limiter interno (`handleChatRequest.ts:285-287`, key slug+sessionId) queda como capa extra, el de route es el que frena |
| SEC-RATELIMIT-03 | **CERRADO-DOCUMENTADO** | Comentario "IP is set by the Netlify edge and is not spoofeble" en `chat/route.ts:72` |
| SEC-LLM-01 | **CERRADO-SIN-TEST-CI** | Spotlighting nonce por request `handleChatRequest.ts:665-692` (`vmsg_${randomUUID()}` + strip anti delimiter-escape + envuelve TODO rol no-assistant); regla en system prompt `prompts/sections.ts:148-149`; detección de eco `safety/validateOutput.ts:68-75`. La única cobertura es `scripts/regression/cases.ts` (runner conversacional contra LLM real — no corre en CI) |
| SEC-LLM-02 | **ABIERTO** | Sin disclaimer de IA/privacidad en el widget (grep "IA generativa|privacidad|No compartas|con IA" en `src/modules/chatbot/components/` y `public/widget.js` → 0 hits) y sin PII-redaction pre-Vertex (grep "REDACTED|redact" en `src/modules/chatbot/server` → 0 relevantes) |
| SEC-LLM-03 / P0-7 | **CERRADO-SIN-TEST-CI** | Ownership: `captureLead.ts:119-190` (`classifyChannel`, `phoneAppearsInVisitorText` cola-7, `emailAppearsInVisitorText`) + descarte/re-ask graceful :222-296; persiste AMBOS canales (email y phone, :365-366) cerrando P0-7. Casos de regresión en `scripts/regression/cases.ts` (60db8a0) — requieren LLM vivo, no CI |
| SEC-SSRF-01 | **ABIERTO** | `validateWebhookUrl.ts:11-13` reconoce la deuda ("DNS rebinding… requiere resolver la IP justo antes del POST"); `postToN8n.ts:87-92` hace `fetch(input.webhookUrl)` directo, sin re-resolución DNS **y sin `redirect: 'manual'`** → vector adicional: URL pública validada que responde 302 hacia IP privada/metadata es seguida por fetch. Base del sprint 3.2 |
| SEC-MISC-01 | **PARCIAL** | `next.config.ts:24-71`: HSTS, nosniff, Referrer-Policy, Permissions-Policy globales + X-Frame-Options DENY en `/(admin|dashboard)`. **PERO** la CSP sigue en `Content-Security-Policy-Report-Only` (:48) con `unsafe-inline`+`unsafe-eval` (:51) — el comentario (:43-44) decía "tighten after 1–2 weeks"; el commit 933a141 es del 2026-06-05 y hoy es 2026-07-10 (5 semanas). Nunca se enforceó |
| SEC-MISC-02 | **CERRADO-VERIFICADO** | Bloque `cookies` explícito `src/auth.ts:89-94` desde fuente única `src/lib/auth-cookies.ts` |
| SEC-PII-01 | **CERRADO-VERIFICADO** | `src/lib/email/notify-message.ts:62` usa `obfuscateEmail()` (definida :69-77) |
| SEC-DEP-03 | **CERRADO-VERIFICADO** | defu/effect ausentes de `npm audit --omit=dev` |
| SEC-AUTH-05 | **CERRADO-REDISEÑADO** | B11.6 en `src/app/api/track/route.ts:15-33`: ORG_MEMBER deriva org de la sesión (no acepta body); SUPER_ADMIN puede pasar orgId explícito (uso legítimo impersonation) — FK de `PageView.organizationId` valida existencia estructuralmente |
| SEC-AUTH-06 | **CERRADO** | El callback valida state ANTES del exchange (`google-business/callback/route.ts:30` → `:47`) |
| SEC-AUTH-07 | **CERRADO-DOCUMENTADO** | `validate-origin.ts:40-56`: no-origin permitido solo en non-prod, con comentario de intención + flag QA opt-in |
| SEC-AUTH-08 | **ABIERTO (menor)** | `src/lib/actions/impersonation.ts:11-24` sigue sin Zod sobre `orgId` (mitigado: `findUnique` + redirect si no existe) |
| SEC-LLM-04 | **ABIERTO (aceptado)** | `prompts/sections.ts:50-72` sigue mandando la KB completa por request. Trade-off de producto |
| SEC-LLM-05 | **CERRADO-POR-DEFAULT** | `ChatWindow.tsx:21-40` define components custom (p/code/strong) sin `rehype-raw`; react-markdown v10 escapa HTML y sanitiza `javascript:` por default. Sin `urlTransform` explícito (nota de higiene) |
| SEC-LLM-06 | **PARCIAL** | `showWhatsappHandoff.ts:41-43`: `prefilledMessage` ahora capped `min(20).max(500)`; sin strip de caracteres de control |
| SEC-LLM-07 | **ABIERTO (aceptado)** | Sin CAPTCHA; mitigado por rate-limit DB por IP (chat/route.ts:70-91) |
| SEC-LOGGING-01 | **CERRADO** | `captureLead.ts:248` ("SOLO el motivo, nunca el valor (PII)") — los logs de canal descartado no incluyen valores |
| SEC-CACHE-01 | **ABIERTO** | `conversation/resolver.ts:11` TTL 60s in-memory por lambda; sin invalidación posible cross-lambda (kill-switch del bot tarda hasta 60s) |
| SEC-CACHE-02 | **ABIERTO (aceptado)** | Sin cambios; sigue siendo listado global SUPER_ADMIN-only |
| SEC-PII-02/03 | **ABIERTO** | Ver SEC-LLM-02 — mismo grep, 0 disclaimers |
| SEC-INJ-01 | **ABIERTO** | Sin `normalize('NFC')` ni strip de null bytes en `handleChatRequest.ts` (grep "normalize" → solo `normalizeLlmProvider`) |
| SEC-SECRETS-01 | **CERRADO (falso positivo confirmado)** | Sin acción pendiente en repo |
| SEC-DEP-04 | **CERRADO-MAYORMENTE** | Solo queda `postcss <8.5.10` moderate vía `next` (ver §3.h) |
| P0-5 | **CERRADO-VERIFICADO** | `prisma/schema.prisma:550` — `Project.organizationId String` (non-nullable). El único nullable restante es `Notification.organizationId` (:704, por diseño: notificación user-scoped) |
| P0-6 | **PARCIAL** | Helpers creados: `src/lib/auth/assert-ownership.ts` (assertTicketBelongsToOrg, assertProjectBelongsToOrg, callerCanAccessOrg — 6def504/45642b9). **Instancia NUEVA sin guard: `runPreflightChecks` (ver SEC-02)** |
| P1-12 | **CERRADO** | 6def504 tocó `chatbots/[botId]/actions.ts`, `regenerate-brief.ts`, `onboarding-actions.ts`, `clients.ts`; los 4 hoy tienen Zod (inventario §3.a) |
| §3.5 leads/recent | **CERRADO** | `src/app/api/dashboard/leads/recent/route.ts:11-12` — guard `auth()` con 401 |

---

## 3. SUPERFICIE NO AUDITADA

### 3.a Inventario — API routes (35)

Leyenda: auth = guard verificado; org = scoping por organización; RL = rate-limit; Zod = validación schema del input.

| Ruta | Método | Auth | Org-scope | RL | Zod/valid. |
|---|---|---|---|---|---|
| api/admin/alerts/trigger-detector | POST | SUPER_ADMIN (:6-7) | global admin (por diseño) | — | n/a |
| api/admin/chatbot/demo-chat/[slug] | POST | requireSuperAdmin (:24) | slug bajo admin | — | sí |
| api/admin/chatbot/events | GET | SUPER_ADMIN (:8-9) | global admin | — | n/a |
| api/admin/chatbot/insights/generate | POST | SUPER_ADMIN (:7-8) | global admin | — | n/a |
| api/admin/chatbot/test-prompt | POST | requireSuperAdmin (:20) | global admin | — | sí |
| api/admin/clients/[organizationId]/send-executive-report | POST | requireSuperAdmin (:14) | param = org target (admin global) | sí (`sendExecutiveReportNowPerAdmin`, :36) | n/a |
| api/admin/reports/send-now | POST | SUPER_ADMIN (:6-7) | global admin | — | n/a |
| api/admin/users/[userId]/resend-credentials | POST | SUPER_ADMIN (:16-17) | global admin | sí (`resendCredentialsPerAdmin`, :10) | n/a |
| api/auth/[...nextauth] | * | NextAuth propio | n/a | — | n/a |
| api/auth/google-business/start | GET | SUPER_ADMIN (:6-7) | state firmado | — | n/a |
| api/auth/google-business/callback | GET | SUPER_ADMIN (:14-15) | verifyOAuthState (:30) | — | sí |
| api/auth/tiendanube/start | GET | SUPER_ADMIN (:10-11) | state firmado | — | n/a |
| api/auth/tiendanube/callback | GET | SUPER_ADMIN (:28-29) | verifyOAuthState (:42) | — | sí |
| api/chatbot/[slug]/chat | POST | público por diseño | aislado por slug/origin (`validateOrigin` :43) | **sí, 2 capas** (:77-91 y handleChatRequest:285) | sí (body schema interno) |
| api/chatbot/[slug]/config | GET | público por diseño | validateOrigin (:43) | — (cache 60s) | n/a |
| api/chatbot/[slug]/health | GET | **público, sin origin-check** | por slug | — | n/a |
| api/chatbot/[slug]/smoke | GET | **NINGUNO** | n/a | **NO** | n/a → **SEC-01** |
| api/cron/* (7 rutas) | GET/POST | CRON_SECRET — 4 guardan `!expected`, **3 fail-open** | n/a | — | n/a → **SEC-03** |
| api/dashboard/chatbot/leads/export | GET | getClientChatbotSession (:84-85) | `session.organization.id` (:89) | — | sí |
| api/dashboard/leads/recent | GET | auth() (:11-12) | `botConfig.organizationId` de sesión (:24) | — | n/a |
| api/dev/email-preview/executive-weekly | GET | 404 en prod (:107-108) | n/a | — | n/a |
| api/email/optout/[contactId] | GET/POST | token HMAC (:71-77) | por-contacto firmado | — | sí |
| api/email/unsubscribe-executive | GET | token HMAC (:42-62) | por-org firmado | — | sí |
| api/qa/login | POST | triple-guard localhost+NETLIFY+VERCEL (:55-72) | n/a | — | sí (persona whitelist) |
| api/reports/client-monthly | GET | resolveOrgId (:26-28) | sesión-only, sin params (:1-11) + gate de plan (:31-33) | — | n/a |
| api/reports/monthly | GET | auth() (:22-23) | valida param vs sesión (:38-69) | — | sí |
| api/test-sentry | GET | **NINGUNO** (lanza error a propósito) | n/a | — | n/a → SEC-11 |
| api/track | POST | auth() (:11-12) | org de sesión; SUPER_ADMIN puede pasar orgId (:19-27, B11.6) | — | parcial (coerción manual) |
| api/version | GET | público (info build) | n/a | — | n/a |

### 3.b Inventario — server actions (archivos con `'use server'` real: 93; excluidos los que solo exportan constantes/schemas)

Patrón dominante verificado: **admin** → `requireSuperAdmin()` (`src/lib/auth-guards.ts:3-11`); **dashboard** → `resolveOrgId()` (`src/lib/preview.ts:6-20`, deriva org de sesión o de impersonation firmada — el authz ES el scoping); **setter** → `requireSetter()` (`auth-guards.ts:13-21`) + ownership por `setterId` (`ownedLead*` en prospecto*.actions). Tabla compacta (fila = archivo; "auth" listado por el guard más fuerte encontrado y verificado por lectura en los casos dudosos):

| Archivo | Auth | Org-scope | Zod | RL |
|---|---|---|---|---|
| actions/admin/onboarding-tasks.ts | auth()+rol | org manual | — | — |
| actions/agency-actions.ts | auth()+rol | assertProjectBelongsToOrg | — | — |
| actions/auth-actions.ts | n/a (solo signOut) | n/a | n/a | — |
| actions/dashboard-actions.ts | auth() | org manual | sí | — |
| actions/metrics-actions.ts | auth() | org manual | — | — |
| actions/onboarding-actions.ts | auth() | resolveOrgId | sí | — |
| actions/task-approvals.ts | auth() | org manual | — | — |
| admin/announcements, chatbots (6 arch.), clients/plan, leados/revision, leads (6 arch.), messages, projects (3), referrals, settings, team (2), tickets | requireSuperAdmin o auth()+SUPER_ADMIN | global admin (org como target legítimo) | sí en 19/22; sin Zod: module-demand, referrals.admin, (leads.ts usa validación manual `ensureAdmin` + whitelist :19-45) | — |
| admin/clients/_actions/client.actions.ts | re-export de impersonation (guardada) | — | — | — |
| dashboard/_actions/business-profile, executive-report-prefs, regenerate-brief, mark-read, email-marketing/_actions, motor-resenas/_actions | resolveOrgId (auth implícito: null sin sesión) | resolveOrgId | sí (3/6); mark-read/email-mkt/resenas sin Zod (inputs simples) | — |
| dashboard/chatbot/conversations/transcript-action.ts | getClientChatbotSession (:36-39) | query org-scopeada anti-IDOR (:46-50) | sí | — |
| setter/_actions/* (8 archivos) | requireSetter | ownership por setterId (`ownedLead*`) | sí en 7/8 (novedades sin Zod — input trivial) | — |
| accept-invite/actions.ts | token de invitación (por diseño público) | vía invitación | — | — |
| bienvenida/complete-onboarding | auth() | resolveOrgId | sí | — |
| cambiar-password | auth() | self | sí | — |
| forgot-password / reset-password | público por diseño | token HMAC reset | sí | **sí (DB)** `forgot:44-51`, `reset:20` |
| login/actions.ts loginAction | público por diseño | n/a | manual | **in-memory** (:8-48) → SEC-05 |
| login/actions.ts magicLinkAction | público por diseño | n/a | manual | **NO** → SEC-04 |
| lib/actions/* (16 archivos) | auth()+rol o requireSuperAdmin en todos (verificado: leads.ts `ensureAdmin` :15-16; contact.ts público con RL `contactFormPerIp`) | org manual / assert-ownership (tickets :contra `assertTicketBelongsToOrg`) | mixto | contact sí |
| lib/tickets/actions.ts | auth()+rol | resolveOrgId + assertTicketBelongsToOrg | sí | — |
| modules/chatbot/server/admin/* (18) | requireSuperAdmin en 15; `getClientChatbotSession`+ownership en updateLeadStatus (:18-30) y manageInsight (:16-27); saveClientSettings delega en updateBotAppearance (guardada) | org manual | sí | retryCrmSync/testCrmConnection/sendTestNotification con RL |
| modules/chatbot/server/admin/**preflightChecks.ts** | **NINGUNO** (:13-19) | **NINGUNO** | **NO** | **NO** → **SEC-02** |

**Mutaciones sin guard o sin org-scope detectadas**: solo `runPreflightChecks` (read-only pero sin guard — SEC-02). No se encontró ninguna MUTACIÓN sin guard de auth en la superficie actual.

### 3.c Rate-limit — respuesta explícita

**¿Los endpoints LLM públicos tienen rate-limit? — SÍ el principal, NO todos:**
- `/api/chatbot/[slug]/chat` (widget): **SÍ** — 2 capas sobre tabla Neon compartida (fail-closed): route por `origin+sha256(IP)` 30/min (`chat/route.ts:70-91`, preset `presets.ts:27`) + handler interno por `slug:sessionId` 10/min (`handleChatRequest.ts:285-287`, preset :33).
- `/api/chatbot/[slug]/smoke`: **NO** — y dispara una llamada REAL a Vertex (`smokeTest.ts:26-30`) sin auth, sin origin-check, sin límite → **SEC-01 (DoS de billetera)**.
- Endpoints LLM de admin (`demo-chat`, `test-prompt`, `insights/generate`): auth SUPER_ADMIN, sin RL (aceptable: superficie autenticada de 1 usuario).
- Cron LLM (`generate-insights`): protegido por CRON_SECRET pero **fail-open si la var falta** (SEC-03) — si se dispara, itera bots × LLM.

Inventario completo de consumidores del limiter DB: chat (2), forgot (2 scopes), reset, resend-credentials, send-executive-report, contactForm, crmRetry, crmTest, testNotification, leadNotify/leadDigest (presets.ts:8-62). Login = in-memory (SEC-05); magic-link = nada (SEC-04).

### 3.d Multi-tenant — patrón real

- **No hay RLS.** El aislamiento es: (1) `src/proxy.ts` separa ZONAS por rol (admin/dashboard/setter, matcher :171-173); (2) dentro de la zona, cada query filtra `where { organizationId }` **manualmente**, con el orgId derivado SIEMPRE de la sesión vía `resolveOrgId()` (`src/lib/preview.ts:6-20`) o `getClientChatbotSession()`; (3) decisión pura `resolveScopedOrgId()` (`src/lib/security/org-scope.ts`) cuando además llega un orgId por parámetro (rechaza mismatch); (4) recursos por-ID con `assert*BelongsToOrg` / `callerCanAccessOrg` (`src/lib/auth/assert-ownership.ts`); (5) runtime del bot aislado por `botConfigId` derivado del slug + `validateOrigin` contra `allowedDomains`.
- **Depende de disciplina manual**: nada fuerza que una action nueva llame `resolveOrgId`/`requireX` — el único enforcement ejecutable es `idor-tokens.invariant.ts` (cubre `resolveScopedOrgId` y tokens opt-out) + `tests/e2e/20-idor-optout.spec.ts`. Ese es el hueco que ataca el sprint 3.4.
- **Impersonation (jose)**: flujo completo rastreado. `startImpersonationAction` (`lib/actions/impersonation.ts:11-34`): solo SUPER_ADMIN, valida existencia de la org, firma JWT HS256 `{adminId, orgId, expiresAt}` (`lib/impersonation.ts:24-30`) en cookie httpOnly/lax/secure (:82-90). Consumo: `getImpersonationSession` (:54-80) exige sesión SUPER_ADMIN viva **y** `payload.adminId === session.user.id` **y** expiry. `resolveOrgId` devuelve el orgId del token → **la sesión impersonada queda scopeada a ESA org en todas las queries del dashboard** (dashboard/layout.tsx:72-107 filtra todo por ese organizationId). `proxy.ts:154` solo deja a SUPER_ADMIN entrar a /dashboard si `isImpersonating`. Veredicto: **respeta el scope**. Debilidad menor: fallback de secret hardcodeado `'develOP-dev-impersonation-secret'` si faltan las 3 env vars (`impersonation.ts:14-22`) → SEC-10.

### 3.e Chatbot/LLM

- **SEC-LLM-01**: cerrado (spotlighting nonce, §2). **SEC-LLM-03**: cerrado (ownership + botConfigId del ctx server-side, jamás del LLM — `captureLead.ts:365`). **SEC-LLM-02 SÍ existe en la auditoría previa**: era "PII del visitante enviada a Vertex sin disclosure ni anonimización" (auditoria-seguridad-2026-05.md:177-186) — **sigue abierto** (SEC-07).
- **Tools expuestas** (`getTools.ts:12-17`): `capture_lead` (MUTA: crea ChatbotLead + update Conversation, transaccional :361-400), `offer_handoff_options` (no muta), `show_whatsapp_handoff` (server-side, loguea evento), `navigate_to_page` (client-side, sin execute). Gating por plan vía `getPlanForOrg` → `getTools(ctx, plan.tools)` (`handleChatRequest.ts:577`).
- **¿capture_lead valida org?** Sí estructuralmente: `botConfigId`/`conversationId`/UTM salen de `ToolCallContext` armado server-side; el input del LLM no puede redirigir el write a otra org.
- **Fuga de system prompt**: caminos probados por diseño — (a) instrucciones del usuario: mitigadas por spotlighting + regla sections.ts:148-149; (b) tools de eco: ninguna tool devuelve el prompt; (c) errores verbosos: `handleChatRequest` enmascara con Sentry + log; **PERO `/smoke` devuelve `error.message` crudo de Vertex** (`smokeTest.ts:53`) — puede filtrar detalles de infra (proyecto GCP, modelo) a cualquiera (parte de SEC-01). Detección post-hoc de fuga: `validateOutput.ts:56-59` (headers del prompt) y :68-75 (eco de delimitador) — solo warning, no bloquea.
- `navigate_to_page` sirve paths de develOP hardcodeados a TODOS los bots (`navigateToPage.ts:15-24`, "Phase 1.5: paths come from BotConfig… per org" pendiente) → SEC-14.

### 3.f Secrets

- `encryptSecret.ts`: **AES-256-GCM** (:14), key de 32 bytes hex en env `CRM_SECRET_KEY` (:25-44), **IV aleatorio de 12 bytes por cifrado** (:70), authTag persistido → tamper-proof. Decrypt solo en memoria pre-fetch (`postToN8n.ts:82-84`). Correcto.
- Env vars de seguridad requeridas: `AUTH_SECRET`, `CRON_SECRET`, `CRM_SECRET_KEY`, `OAUTH_STATE_SECRET` (fallback AUTH_SECRET, `oauth-state.ts:26-35` — falla duro si faltan ambas ✔), `IMPERSONATION_SECRET` (fallback… hardcodeado ✘ SEC-10). Documentadas en `docs/env-vars.md:83` y `docs/netlify-env-vars.md:30`.
- **Cron**: NINGUNA ruta usa `timingSafeEqual` (grep → 0 en `src/app/api/cron`) — comparación `!==` (SEC-09, menor). Peor: **3 de 7 fail-open** si `CRON_SECRET` no está seteada — `detect-bot-issues/route.ts:7-9`, `generate-insights/route.ts:11-15`, `send-weekly-reports/route.ts:7-9` comparan contra `` `Bearer ${undefined}` `` → header literal `Bearer undefined` autentica. Las otras 4 (alerts:8, regenerate-briefs:22, send-executive-reports:14-17, os-follow-up:157) guardan `!expectedSecret` → fail-closed (SEC-03).

### 3.g Cookies / headers / CSP

933a141 configuró: HSTS `max-age=31536000; includeSubDomains` (`next.config.ts:35`), `X-Content-Type-Options` (:37), `Referrer-Policy` (:39), `Permissions-Policy` (:41) — **globales via `source: '/:path*'`, cubren todas las rutas**; `X-Frame-Options: DENY` solo en `/(admin|dashboard)` (:67-70, correcto: /embed debe ser iframeable); cookies NextAuth explícitas (`auth.ts:89-94`). **Falta**: (1) CSP en enforcement — sigue Report-Only con unsafe-inline/eval desde hace 5 semanas (:47-61) → SEC-08; (2) `/embed/:slug*` con `frame-ancestors *` (:87) — la restricción por whitelist ("R18") sigue pendiente → SEC-15. Nota: `typescript.ignoreBuildErrors: true` + `eslint.ignoreDuringBuilds: true` (:10-14) apagan los gates de build → SEC-16.

### 3.h npm audit --omit=dev (corrido en el worktree, 2026-07-10)

```
{"info":0,"low":0,"moderate":2,"high":0,"critical":0,"total":2}
next    | moderate | via postcss (transitive)
postcss | moderate | <8.5.10 — XSS via unescaped </style> en stringify
```
- `npm ls next-auth` → **next-auth@5.0.0-beta.31**, `next@16.2.9`. Sin advisory activa contra next-auth 5.0.0-beta.31 en el output de audit. Riesgo estructural de "beta" persiste (API churn), no accionable hoy.
- El "fix" que propone npm para postcss es un downgrade absurdo de next (`next@9.3.3 MAJOR`) — ignorar; se resuelve cuando next bumpee su postcss interno. Impacto real ~nulo (el vector es stringify de CSS no confiable, que la app no hace).

### 4. /security-scan (ECC)

No ejecutable desde este subagente (skill del harness padre; audita superficies de agentes/hooks/MCP/permisos, no la app). **Recomendado como corrida separada para Franco** en una sesión interactiva del repo principal.

---

## 5. HALLAZGOS PRIORIZADOS (estado actual, código vivo)

### P0

Ninguno. Los dos P0 previos (SEC-DEP-01/02) están cerrados y verificados; no se encontró mutación cross-tenant ni bypass de auth explotable en la superficie viva.

### P1

- **SEC-01 — `/api/chatbot/[slug]/smoke` público dispara LLM real sin auth ni rate-limit.** `smoke/route.ts:16-42` (sin guard, sin validateOrigin, sin checkRateLimit) → `smokeTest.ts:26-30` (streamText a gemini-2.5-flash). Es el ÚNICO endpoint LLM público sin límite: DoS de billetera (costo por call chico ~15 tokens, pero invocaciones Netlify + Vertex ilimitadas y sin fricción) + `:53` devuelve `error.message` crudo de Vertex (fuga de detalles de infra). Severidad: P1-alto.
- **SEC-02 — Server action `runPreflightChecks(botId)` sin NINGÚN guard.** `modules/chatbot/server/admin/preflightChecks.ts:13-19` — `'use server'` + `findUnique` por botId arbitrario, devuelve estado de KB (qué secciones faltan, :55-60), mensaje de bienvenida, y el **número de WhatsApp de la org** (:117 `Numero: +${bot.whatsappNumber}`). Los action-IDs de Next son extraíbles de los chunks estáticos (servidos sin auth) → invocable por un no-autenticado que conozca un botId (cuid, no adivinable pero puede filtrarse). Es la 4ª instancia del patrón P0-6, esta vez SIN mitigación de rol. Read-only, pero fuga de datos de tenant. P1.
- **SEC-03 — 3 rutas cron fail-open si `CRON_SECRET` falta.** `detect-bot-issues/route.ts:7-9`, `generate-insights/route.ts:11-15`, `send-weekly-reports/route.ts:7-9`: `authHeader !== \`Bearer ${process.env.CRON_SECRET}\`` — con la var ausente, `Authorization: Bearer undefined` autentica y dispara detector de alertas / LLM por bot / envío de emails reales. Hoy la var está documentada como requerida en prod (`docs/env-vars.md:83`) — el riesgo es latente (staging, deploy nuevo, typo de var), y el patrón coexiste con 4 rutas hermanas que SÍ guardan `!expectedSecret`. P1 (inconsistencia de patrón con fail-open real).
- **SEC-04 — `magicLinkAction` sin rate-limit.** `login/actions.ts:135-158` → `signIn('resend')` → email real por Brevo (`auth.ts:97-107`). Sin límite por IP ni email: bombing de inbox de terceros + quema de créditos Brevo + señal de account-enumeration. Contrast: forgot-password tiene 2 scopes de RL. P1.
- **SEC-05 — Brute-force de login sigue con limiter in-memory (instancia residual de SEC-RATELIMIT-01/P1-5).** `login/actions.ts:8-48` (`Map` por proceso, "reemplazar por Redis" en el comentario :10). En Netlify multi-lambda el límite efectivo es 5×N intentos/5min. El resto de auth ya migró al limiter Neon — esta instancia quedó afuera de B14.1. P1.
- **SEC-06 — SSRF del webhook CRM: DNS rebinding + redirects (SEC-SSRF-01 sigue abierto).** `validateWebhookUrl.ts:11-13` (deuda declarada) + `postToN8n.ts:87-92`: fetch sin re-resolución DNS pre-POST y sin `redirect: 'manual'` → una URL pública válida en config-time puede (a) re-resolver a IP privada/metadata en runtime, o (b) responder 302 a `http://169.254.169.254` y fetch lo sigue. Superficie: SUPER_ADMIN configura la URL hoy (baja probabilidad, alto impacto GCP metadata). Base del sprint 3.2. P1.
- **SEC-07 — SEC-LLM-02 + SEC-PII-02/03 abiertos: conversación completa (con PII espontánea del visitante) a Vertex y leads a n8n sin disclosure; sin redaction.** Grep de disclaimers en `src/modules/chatbot/components/` y `public/widget.js` → 0. Compliance (LPDP/GDPR si hay tráfico UE). P1 (decisión humana: texto y alcance).

### P2

- **SEC-08 — CSP nunca pasó de Report-Only** (planeado 1-2 semanas, van 5) y con `unsafe-inline`/`unsafe-eval` (`next.config.ts:47-61`). Enforcement + plan de nonce.
- **SEC-09 — Comparación de CRON_SECRET no constant-time** en las 7 rutas cron (0 hits `timingSafeEqual` bajo `src/app/api/cron`; contraste: `unsubscribe-token.ts` y `oauth-state.ts:91` sí lo usan). Explotación impracticable sobre HTTPS/lambda, pero es el patrón-casa.
- **SEC-10 — Fallback secret hardcodeado en impersonation**: `lib/impersonation.ts:19` `'develOP-dev-impersonation-secret'` si faltan IMPERSONATION_SECRET/AUTH_SECRET/NEXTAUTH_SECRET. Debe fallar duro como `oauth-state.ts:30-34`.
- **SEC-11 — `/api/test-sentry` público en prod** (`test-sentry/route.ts:3-5`): genera excepciones a demanda (ruido/costo Sentry). Gatearlo a dev o borrar.
- **SEC-12 — SEC-CACHE-01 abierto**: kill-switch del bot tarda hasta 60s por cache in-memory sin invalidación (`resolver.ts:11`).
- **SEC-13 — SEC-INJ-01 abierto**: sin normalización NFC/strip null-bytes del input del chat.
- **SEC-14 — `navigate_to_page` con paths develOP hardcodeados para bots de terceros** (`navigateToPage.ts:15-24`; coincide con la auditoría de runtime). Deshabilitar por plan para tenants o mover a `BotConfig.allowedNavigationPaths`.
- **SEC-15 — `/embed/:slug*` `frame-ancestors *`** (`next.config.ts:87`) — whitelist R18 pendiente.
- **SEC-16 — `ignoreBuildErrors`/`ignoreDuringBuilds`** (`next.config.ts:10-14`): tipos y lint no gatean el build de prod — deuda que esconde regresiones (incl. de seguridad de tipos).
- **SEC-17 — `prefilledMessage`/`topicSummary` sin strip de control-chars** (`showWhatsappHandoff.ts:41-57`; ya con caps de longitud). SEC-LLM-06 residual.
- **SEC-18 — SEC-AUTH-08 residual**: `startImpersonationAction` sin Zod en `orgId` (`lib/actions/impersonation.ts:11`).

Candidato P1 (dead code, no desarrollado): `src/app/api/test-sentry` y `src/app/api/dev/email-preview/*` son superficies de desarrollo servidas en prod (la segunda bien gateada) — candidato a poda en el refactor.

---

## 6. PROPUESTA — sprint 3.1 (tests de regresión) y 3.4 (golden suite multi-tenant)

### Sprint 3.1 — regresión de protecciones (prioridad: CERRADO-SIN-TEST primero)

El repo ya tiene el patrón perfecto para esto: invariants puros en `src/lib/**/*.invariant.ts` corridos por ts-node vía `npm run check:invariants` (package.json:18-48; ejemplo de seguridad ya existente: `check:invariant:security` → `idor-tokens.invariant.ts`). Propuesta = **extender ese patrón** (cero infra nueva) + 1 spec Playwright para lo HTTP-visible:

1. **`oauth-state.invariant.ts`** (nuevo): sign→verify roundtrip; tamper de firma → `bad_signature`; expiry → `expired`; state de scope tiendanube rechazado en scope GBP; state malformado. Todo puro (crypto nativo). — cubre SEC-AUTH-01/02.
2. **`session-version.invariant.ts`**: extraer la decisión del jwt callback (`auth.ts:216-224`) a una función pura `shouldInvalidateToken(tokenVersion, dbVersion, trigger)` y testear: mismatch→invalida, signIn/update→no, undefined→no. — cubre SEC-AUTH-03 (requiere refactor mínimo de extracción; alternativa sin tocar código: test de integración del callback).
3. **`spotlighting.invariant.ts`**: exportar `wrapUntrusted`/generación de tag desde `handleChatRequest.ts:671-677` (hoy inline) y probar: strip de `</vmsg_*>` inyectado, nonce presente, roles no-assistant siempre envueltos. — cubre SEC-LLM-01 sin depender del runner LLM vivo.
4. **`capture-ownership.invariant.ts`**: exportar `classifyChannel`, `phoneAppearsInVisitorText`, `emailAppearsInVisitorText` (`captureLead.ts:134-189`, hoy privadas) y fijar la tabla de casos del comentario (cola-7, 15↔9, fabricación → `not_owned`). — cubre SEC-LLM-03 en CI.
5. **`rate-limit.integration.spec.ts`** (patrón `tests/integration/*`, ya existen 3): N+1 requests al preset más chico contra Neon dev → el N+1 da `allowed:false`; ventana expirada resetea; **fail-closed** cuando la query no devuelve fila. — cubre SEC-RATELIMIT-01/02 (capa DB).
6. **`cron-auth.invariant.ts`**: extraer/probar el guard `!expectedSecret || provided !== expected` como helper único compartido por las 7 rutas (es también el fix de SEC-03): sin env → 401 SIEMPRE; `Bearer undefined` → 401. 
7. **`security-headers.spec.ts`** (Playwright, proyecto e2e existente): asserts sobre HSTS/nosniff/Referrer-Policy/Permissions-Policy en `/`, X-Frame-Options en `/dashboard`, CSP presente; y `GET /api/chatbot/<slug>/smoke` → exige 401/429 post-fix de SEC-01. — congela SEC-MISC-01.
8. Ya cubierto, no duplicar: opt-out IDOR (`20-idor-optout.spec.ts`), redirects de proxy (`19-security.spec.ts`), `resolveScopedOrgId` (`idor-tokens.invariant.ts`).

### Sprint 3.4 — golden suite de aislamiento multi-tenant

**Recomendación: híbrido, con el peso en Playwright e2e con dos orgs seed — y la razón es de ESTE repo**: ya existen (a) 6 configs de Playwright (`playwright.config.ts`, `.integration`, `.leados`, `.qa-persona`, `.setter`, `.qa-walkthrough`), (b) **`/api/qa/login` con personas `client-a` y `client-b` YA implementadas** (`api/qa/login/route.ts:75-81`) con triple-guard hermético, y (c) el patrón invariant para lo puro. No hay que construir harness: hay que escribir los casos.

- **Capa e2e (nueva config `playwright.golden.config.ts` o proyecto dentro de `.integration`)**: login como `client-a` y `client-b` vía `/api/qa/login`; para cada recurso con ID dinámico, crear el recurso en org A y probar acceso desde B esperando 404/[] (nunca 200 con datos — ojo: `notFound()` streamea 200, afirmar por CONTENIDO, lección ya documentada). Rutas a atacar (del inventario 3.a/3.b): `/dashboard/soporte/[ticketId]` cross-org; `getClientConversationTranscriptAction` con conversationId ajeno (espera `[]` por guard relacional `transcript-action.ts:46-50`); `/api/dashboard/chatbot/leads/export` (solo leads de la propia org); `/api/reports/monthly?organizationId=<otra>` (espera rechazo :69); `/api/track` como ORG_MEMBER con orgId ajeno en body (espera atribución a la propia); `/api/chatbot/[slug]/chat` con Origin del dominio de OTRA org (403); cookie de impersonation manipulada (firma inválida / adminId ajeno → `getImpersonationSession` null → sin acceso a /dashboard).
- **Capa invariant (pura, CI-barata)**: `callerCanAccessOrg` matrix (SUPER_ADMIN bypass, rol org mismatch→false, resourceOrgId null→false) — `assert-ownership.ts:96-107` hoy sin test; `resolveScopedOrgId` ya cubierta.
- **Seed**: reutilizar las personas del QA-login (ya crean client-a/client-b consistentes) + un fixture mínimo por recurso (ticket, conversación, lead) por org — patrón de `tests/e2e/20-idor-optout.spec.ts:33-52` (beforeAll crea, afterAll limpia).
- Gate de suite: correr en CI local (`npm run check:invariants` + proyecto golden) antes de cada merge a main que toque `_actions/`, `api/`, `lib/actions/`, `modules/chatbot/server/`.

---

## INSUMOS PARA SPRINTS

**SEC-01 (smoke sin auth/RL)** — Tocar `src/app/api/chatbot/[slug]/smoke/route.ts`. Fix: exigir `Authorization: Bearer ${CRON_SECRET}` (patrón fail-closed de `regenerate-briefs`) O `requireSuperAdmin()`; además `checkRateLimit` preset nuevo `smokePerIp {limit:3, windowMs:60_000}`; y reemplazar `smoke.error` verbatim por mensaje genérico (dejar el detalle en `chatbotError`, que ya lo loguea). Aceptación: `curl GET /api/chatbot/develop/smoke` sin header → 401; con secret → 200; 4ª request en 1 min → 429; el body de error no contiene strings de Vertex. Decisión humana: ¿el monitor externo de uptime usa este endpoint hoy? (si sí, darle el secret; `/health` queda público y no llama LLM).

**SEC-02 (preflightChecks sin guard)** — Tocar `src/modules/chatbot/server/admin/preflightChecks.ts`. Fix: primera línea del execute `await requireSuperAdmin()` (import de `@/modules/chatbot/server/admin/requireSuperAdmin`, mismo patrón que las 15 hermanas). Aceptación: invocación sin sesión SUPER_ADMIN lanza `Unauthorized`; e2e golden: POST del action-id sin cookie → error, nunca los checks. Sin decisión humana.

**SEC-03 (cron fail-open)** — Tocar `detect-bot-issues`, `generate-insights`, `send-weekly-reports` (rutas en §3.f). Fix: extraer helper único `src/lib/security/cron-auth.ts` con `requireCronSecret(request): boolean` que (a) devuelve false si `!process.env.CRON_SECRET?.trim()`, (b) acepta Bearer o X-Cron-Secret (unificar los 2 dialectos existentes), (c) compara con `timingSafeEqual` (cierra SEC-09 de paso); migrar las 7 rutas. Aceptación: invariant nuevo `cron-auth.invariant.ts`: sin env → false; `Bearer undefined` → false; secret correcto → true; los 7 route.ts importan el helper (grep). Sin decisión humana.

**SEC-04 (magic-link sin RL)** — Tocar `src/app/login/actions.ts` + `src/lib/rate-limit/presets.ts`. Fix: presets `magicLinkPerIp {limit:5, windowMs:15*60_000}` y `magicLinkPerEmail {limit:3, windowMs:60*60_000}` (espejo de forgotPassword); en `magicLinkAction` aplicar `applyAuthRateLimit`-equivalente antes de `signIn('resend')` (ampliar el union type de `auth-rate-limit.ts:11-18`). Aceptación: 4º intento con mismo email en 1h devuelve mensaje de espera sin mandar mail (assert por conteo en Brevo mock o por outcome del action). Sin decisión humana.

**SEC-05 (login RL in-memory)** — Tocar `src/app/login/actions.ts:8-57`. Fix: borrar el Map local y usar `checkRateLimit` con preset `loginPerIp {limit:5, windowMs:5*60_000}` keyed `sha256(ip)` (idéntico a `getClientIpHash` de auth-rate-limit); mantener el clear en éxito (borrar la key o aceptar ventana). Aceptación: test de integración: 6º intento fallido desde la misma IP → bloqueado aunque el "proceso" sea nuevo (el estado vive en Neon); login exitoso resetea. Sin decisión humana.

**SEC-06 (SSRF postToN8n — sprint 3.2)** — Tocar `src/modules/chatbot/server/crm/postToN8n.ts` (+ reuso de la lista de bloqueo de `validateWebhookUrl.ts`). Fix: (1) `redirect: 'manual'` en el fetch y tratar 3xx como fallo permanente; (2) pre-fetch `dns.lookup(hostname, {all:true})` y rechazar si ALGUNA IP resuelta cae en los rangos privados/metadata (exportar `isBlockedIp(ip)` desde validateWebhookUrl para una sola fuente); (3) opcional endurecer: pinnear la IP validada vía `undici.Agent` con `connect.lookup` custom (evita el TOCTOU entre lookup y fetch). Aceptación: unit con dns mockeado: hostname→127.0.0.1 rechaza sin fetch; hostname→IP pública procede; respuesta 302 no se sigue; invariant de la lista de IPs. Decisión humana: ¿alcanza lookup-antes-de-fetch (ventana TOCTOU pequeña) o se exige pinning con undici (más código)? Recomendado: lookup ahora, pinning si el motor WhatsApp multiplica los webhooks.

**SEC-07 (disclosure IA/PII — decisión humana primero)** — Tocar `src/modules/chatbot/components/chat/ChatWindow.tsx` (primer mensaje / footer del panel) y opcionalmente `handleChatRequest` (redaction). Fix mínimo compliance: línea fija bajo el input: "Este chat usa IA (Google Vertex). No compartas datos sensibles. [Política]" + en el payload a n8n, nota de que el consentimiento se recaba en el widget. Fix técnico opcional: regex-redaction de teléfonos/emails/DNI en los mensajes ANTES de `streamText` (el capture_lead no lo necesita: recibe los datos del turno del visitante que ya validó ownership). Aceptación: SSR del embed contiene el disclaimer; snapshot e2e; si hay redaction, invariant de las regex. Decisión humana: texto legal, si aplica redaction (afecta calidad del bot al referirse a datos), y confirmación del plan Vertex (data-residency/logging) en GCP — eso es consola, no repo.

**Batch P2 (SEC-08..18, sprint corto de higiene)** — CSP: pasar el bloque de `next.config.ts:48` a `Content-Security-Policy` tras 1 semana de revisar reportes (decisión humana: fecha de corte y si se intenta nonce ya o se acepta unsafe-inline temporal); SEC-10: reemplazar el fallback de `impersonation.ts:14-22` por throw (patrón oauth-state); SEC-11: `NODE_ENV === 'production'` → 404 en test-sentry; SEC-12: bajar TTL a 10s o clave con `updatedAt`; SEC-13: `content.normalize('NFC').replace(//g,'')` en el intake del chat; SEC-14: sacar `navigate_to_page` del set default de tenants vía plan gating (decisión humana: qué planes la tienen) — aceptación por preset; SEC-16: decisión humana explícita (¿cuándo se re-activa el gate de tipos? hoy lo compensa CI manual).

---

## FILAS PARA LA TABLA-PROGRAMA

| sprint propuesto | lente | prioridad | tamaño S/M/L | re-check post-P1 sí/no |
|---|---|---|---|---|
| 3.0 — quick-fixes P1 (SEC-01 smoke, SEC-02 preflight, SEC-03 cron fail-open, SEC-04 magic-link RL, SEC-05 login RL) | SEC | P1 | S | sí |
| 3.1 — regresión de protecciones cerradas-sin-test (oauth-state, sessionVersion, spotlighting, ownership capture_lead, limiter DB, cron-auth, headers) | SEC | P1 | M | sí |
| 3.2 — SSRF postToN8n (SEC-06: redirect manual + DNS pre-check, opcional pinning) | SEC | P1 | S-M | sí |
| 3.3 — disclosure IA/PII del widget + decisión redaction (SEC-07) | SEC | P1 | S (+decisión humana) | sí |
| 3.4 — golden suite multi-tenant (Playwright client-a/client-b vía qa-login + invariants callerCanAccessOrg) | SEC | P1 | L | sí |
| 3.5 — higiene P2 (CSP enforce, timingSafeEqual cron, fallback impersonation, test-sentry, TTL resolver, NFC, navigate_to_page gating, embed frame-ancestors) | SEC | P2 | S-M | no |
| post-merge motor — re-auditar B1-S1/S2/S3 (360dialog) cuando entre a main | SEC | P1 | M | sí |


---

# LENTE PERF — auditado sobre 6254428 (2026-07-10)

**Método**: TODOS los datos son de LAB (Lighthouse 12.x headless mobile-throttled / desktop preset, Playwright Chromium 1228, Windows 11, RTX 5070 Laptop). Build de PROD preexistente en `.next` (`next build --webpack`, Next 16.2.9), servido con `QA_ALLOW_LOCALHOST=1 npx next start -p 3000` (PID 18448, matado al cierre). Auth de dashboard vía `POST /api/qa/login` persona `client-a` + cookie `__Secure-authjs.session-token` por header. NO se optimizó nada: esto es la foto ANTES.

**Caveat central de medición**: `PreloaderContext.tsx:70-85` salta el preloader a `done` cuando `navigator.webdriver === true`. Lighthouse y Playwright default corren CON bypass → todos los CWV de abajo miden la página SIN preloader. La experiencia real de primer hard-load se midió aparte (§4) con webdriver enmascarado y browser headed.

**Artefactos**: JSONs Lighthouse en `scratchpad/lighthouse/` (36 corridas + warmup + retry), HARs en `scratchpad/har/` (7 rutas), log de battery en `scratchpad/lh-battery.log`.

---

## 1. CWV por ruta (LAB)

Rutas públicas existentes verificadas en `src/app`: `/`, `/web-development`, `/ai-implementations`, `/process-automation`, `/software-development`, `/contact`, `/login`, `/forgot-password` (esta última excluida de la batería por tiempo — página estática gemela de login, documentado). Las rutas spec "/ia" y "/automation" NO existen; sus equivalentes reales son `ai-implementations` y `process-automation`. Dashboard: `/dashboard` y `/dashboard/chatbot` autenticadas como client-a.

### MOBILE (mediana de 3 corridas, throttling Lighthouse default)

| ruta | score | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|
| / | 36 | 1.67s | 7.08s | **8570ms** | 0.000 | 11.12s |
| /web-development | 41 | 4.07s | 8.07s | 1620ms | 0.000 | 6.43s |
| /ai-implementations | 45 | 1.51s | 7.64s | 1415ms | 0.001 | 4.88s |
| /process-automation | 41 | 1.82s | 7.99s | 2195ms | 0.000 | 6.15s |
| /software-development | 46 | 1.52s | 7.68s | 1499ms | 0.000 | 4.84s |
| /contact | 55 | 1.37s | 7.00s | 866ms | 0.000 | 3.34s |
| /login | 40 | 2.01s | 8.91s | **4894ms** | 0.000 | 4.91s |
| /dashboard | 50 | 1.52s | 8.92s | 965ms | 0.000 | 4.72s |
| /dashboard/chatbot | 50 | 1.52s | 8.74s | 1032ms | 0.000 | 4.21s |

### DESKTOP (1 corrida)

| ruta | score | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|
| / | (inválido)* | 0.42s | 1.40s | 2528ms | 0.007 | n/a |
| /web-development | 55 | 0.62s | 1.66s | 3143ms | 0.001 | 3.95s |
| /ai-implementations | 55 | 0.37s | 1.66s | 3007ms | 0.001 | 3.59s |
| /process-automation | 53 | 0.42s | 1.92s | 3145ms | 0.001 | 3.64s |
| /software-development | 56 | 0.38s | 1.56s | 3500ms | 0.001 | 3.84s |
| /contact | 58 | 0.33s | 1.44s | 3920ms | 0.001 | 3.15s |
| /login | 58 | 0.45s | 2.20s | 984ms | 0.007 | 1.62s |
| /dashboard | **89** | 0.42s | 1.75s | 79ms | 0.000 | 2.00s |
| /dashboard/chatbot | **88** | 0.42s | 1.79s | 118ms | 0.000 | 1.82s |

\* Home desktop: 2 intentos fallaron el Speed Index (`SPEEDINDEX_OF_ZERO` / `PROTOCOL_TIMEOUT` en CSSUsage — Chrome no capturó screenshots del load) → score no computable. FCP/LCP/TBT/CLS del retry son válidos (`home-desktop-retry.json`). Documentado, no inventado.

**Lecturas clave**:
- CLS ≈ 0 en todo el sitio: excelente, no hay layout shift. Los esqueletos/loaders funcionan.
- LCP mobile 7-9s **transversal** — el driver no es imagen sino JS: hidratación de ~700-790KB gz de JS compartido (§3) en CPU mobile throttled. Con `mainthread-work-breakdown` del home: 16.276ms de Script Evaluation (home-m3.json).
- TBT home mobile 8.57s: bootup-time top = `b79b7286` (react-three-fiber) 8535ms, `7149` (Sentry) 4481ms, `5354` (framer-motion) 3543ms.
- TBT login mobile 4.9s **sin tener 3D visible más que un DotMatrix** — paga el grafo three completo (§3).
- Dashboard desktop 88-89: el portal en desktop está sano; su LCP mobile ~8.9s es post-hydration data fetch, no assets.

---

## 2. ASSETS PESADOS (HAR de carga fría, webdriver enmascarado, scroll completo, 1440×900)

HARs: `scratchpad/har/<ruta>.har`. Transfer real observado (gzip/brotli aplicado):

| ruta | total | requests | JS | IMG | VIDEO | HDR | FONT | CSS |
|---|---|---|---|---|---|---|---|---|
| / | 3.01MB | 96 | 1234KB | 9KB | 0 | **1642KB** | 29KB | 65KB |
| /web-development | **14.66MB** | **213** | 2238KB | **9524KB** | 2567KB | 0 | 448KB | 114KB |
| /ai-implementations | 1.38MB | 89 | 1234KB | 2KB | 0 | 0 | 29KB | 65KB |
| /process-automation | 1.40MB | 91 | 1236KB | 2KB | 0 | 0 | 29KB | 65KB |
| /software-development | 1.38MB | 90 | 1234KB | 2KB | 0 | 0 | 29KB | 65KB |
| /contact | 1.35MB | 89 | 1234KB | 2KB | 0 | 0 | 29KB | 65KB |
| /login | 1.34MB | 91 | 1240KB | 7KB | 0 | 0 | 0KB* | 65KB |

\* login: fonts ya en cache de contexto o inline — en las demás rutas son 29KB (2 familias next/font).

### 2a. HDRI (el conocido de ~1.6MB) — CONFIRMADO
`https://raw.githubusercontent.com/pmndrs/drei-assets/.../hdri/studio_small_03_1k.hdr` = **1642KB**, el request más pesado del home (55% del transfer). Origen: `src/components/layout/Hero.tsx:375` `<Environment preset="studio" />` (drei baja el preset de GitHub raw en runtime). Es dependencia externa de un tercero SIN SLA para el hero de la home. Los otros presets (`city` ×2 en `Interactive3DNetwork.tsx:377,582`, `warehouse` en `LiquidProject.tsx:58`) están en componentes HUÉRFANOS (sin consumidores) — candidatos P1. `BrandedIntroCanvas.tsx` usa `<Environment>` con `<Lightformer>` custom (BrandedIntroCanvas.tsx:180-195) → NO baja HDR: ese es el patrón correcto ya presente en el repo.

### 2b. /web-development — 14.66MB, 213 requests (el desastre de assets)
Por dominio: localhost 4.12MB · template-noir.netlify.app 3.66MB · images.unsplash.com 3.00MB · images.pexels.com 2.20MB · thum.io 0.35MB · template-{bold,skyline,nebula,ethernal,zero}.netlify.app ~0.74MB · fonts.gstatic 0.17MB · **cdn.tailwindcss.com 0.12MB**.
- `WebTemplatesImmersive` embebe IFRAMES VIVOS de los sitios template (cada uno baja su Next runtime, sus fonts de Google, sus PNGs de 500-725KB; template-noir solo = 3.66MB).
- Imágenes externas full-res sin `next/image`: unsplash `w=2667` 984KB, pexels 659KB, etc.
- Video `Woman_engrossed_in_screen_delpmaspu_.mp4` (fuente 5.9MB, transfer parcial observado 2547KB) via `src/components/ui/VideoCard.tsx` — `autoPlay muted loop` SIN `preload="none"` ni `poster` (VideoCard.tsx:8-10). Ídem `WebDevelopmentSensory.tsx:125-138` con `Male_business_owner_opens_laptop_delpmaspu_.mp4` (7.3MB fuente).

### 2c. Prefetch cruzado
En TODAS las rutas (incl. /login y /contact) el HAR muestra los page-chunks de LAS OTRAS páginas de marketing: `app/page` 84KB + `process-automation` 61KB + `software-development` 52KB + `web-development` 51KB + `ai-implementations` 39KB ≈ **287KB gz extra por ruta** — prefetch automático de `<Link>` de Next (navbar/dock). Trade-off deliberable: navegación instantánea vs transfer en mobile.

### 2d. Fonts propias — SANO
2 familias (`Geist`, `Geist_Mono`) vía `next/font/google` self-hosted, subsets latin (layout.tsx:6-14), ~29KB por ruta, `@font-face` extra en globals.css: 0. Sin acción. Las 448KB de fonts en /web-development son de los IFRAMES de templates (Playfair/Manrope/Cinzel/Lora de fonts.gstatic + fonts propias de cada template).

---

## 3. BUNDLE (foto = BASELINE NUEVA)

`docs/baselines/2026-06-bundle-baseline.md` NO existe (verificado por el orquestador) → **esta sección ES la baseline**. El build.log NO trae columna First Load JS (la tabla de rutas salió sin tamaños) — documentado; se reconstruyó desde `.next/server/app/*.html` (script tags) + gzip real. No hay sourcemaps en `.next/static/chunks` (0 archivos .map) → `source-map-explorer` no aplicable; composición identificada por fingerprint de strings.

### First-load JS por ruta (scripts del HTML prerendered, gzip real)

| ruta | JS gz | CSS gz | budget landing (150KB) |
|---|---|---|---|
| / | 790KB | 60KB | **5.3×** |
| /web-development | 748KB | 60KB | 5.0× |
| /ai-implementations | 732KB | 60KB | 4.9× |
| /process-automation | 759KB | 60KB | 5.1× |
| /software-development | 746KB | 60KB | 5.0× |
| /contact | 694KB | 60KB | 4.6× |
| /login | 695KB | 60KB | 4.6× |

/dashboard (dinámico, medido por Lighthouse network): 955KB JS transfer — **incluye los 4 chunks three/sentry** (143+99+84+46KB) sin renderizar ni un triángulo.

### Top chunks compartidos (presentes en las 7 rutas públicas + portales) — clasificación P1-candidato vs legítimo

| chunk | raw | gz | contenido (fingerprint) | clasificación |
|---|---|---|---|---|
| `7149-59da5bbc` | 467KB | 142KB | **@sentry/nextjs client** + router instr. | Legítimo pero inflado: `replaysOnErrorSampleRate:1.0` (instrumentation-client.ts:10) embebe Replay y graba buffer SIEMPRE |
| `bd904a5c` | 363KB | 97KB | **three.js core** (BufferGeometry/SkinnedMesh; sin renderer) | Legítimo para home/marketing-intro — MAL UBICADO en grafo compartido |
| `b536a0f1` | 341KB | 82KB | **three.js renderer** (WebGLRenderer ×35) | Ídem — es UNA copia de three partida en 2 chunks, NO duplicación |
| `4bd1b696` | 195KB | 61KB | react-dom | Legítimo |
| `b79b7286` | 143KB | 45KB | @react-three/fiber | Mal ubicado (ídem three) |
| `5354` | 128KB | 42KB | framer-motion | Legítimo (animación en todo el sitio) |
| `main` | 304KB | 92KB | Next main + init @sentry | Legítimo; adelgaza si Sentry se poda |
| `polyfills` | 113KB | 38KB | polyfills | Legítimo |
| `f6211eb1` | 86KB | 65KB | postprocessing (LUTs base64, importa three) | Mal ubicado (cadena three) |
| `915` | 81KB | 28KB | drei + postprocessing wrappers | Mal ubicado (cadena three) |
| `a3cd4a83` | 82KB | 18KB | postprocessing (Vignette) | Mal ubicado (cadena three) |

**La cadena que mete three en TODAS las rutas** (evidencia): `src/app/layout.tsx:43` importa `Preloader` → `src/components/ui/Preloader.tsx:10` importa **estáticamente** `MarketingIntro` → `MarketingIntro.tsx:10` importa `BrandedIntroCanvas` → `BrandedIntroCanvas.tsx:3-16` importa `@react-three/fiber`, `three-stdlib`, `@react-three/drei`, `@react-three/postprocessing`. Total cadena three ≈ **335KB gz** presentes hasta en `/login` y `/dashboard`.

### Chunks lazy pesados (no compartidos — carga on-demand, OK de ubicación)
- `fcfb803e` 303KB raw: **emoji-picker-react data** (diccionario emoji) — solo admin (`admin/messages`, `admin/tickets`, chatbot config). Legítimo-lazy pero 303KB por un picker: candidato a alternativa liviana, P2.
- `3286` 355KB raw: recharts (+redux-toolkit) — dashboard/resultados y admin. Legítimo-lazy.
- `3405` 121KB raw: micromark/remark (markdown del chat). Legítimo-lazy.

### Páginas de marketing: monolitos client
Las 4 páginas de servicio son `"use client"` completas con TODAS las secciones importadas estáticamente (p.ej. `web-development/page.tsx:6-19`: 13 secciones estáticas, solo `HeroBackground` dynamic) → page-chunks de 208-242KB raw (`app/process-automation/page` 242KB, `web-development` 208KB, `software-development` 208KB, `ai-implementations` 156KB, home `app/page` 371KB). Material directo de 5.2.

### Candidatos P1 (morirán solos en la limpieza — una línea c/u, sin desarrollar)
- `public/video/Man_sips_coffee_scrolls_phone_delpmaspu_.mp4` (10.4MB) y `public/video/Muestra-pagina-ejemplo.mp4` (5.3MB): sin referencias en src → peso muerto de deploy.
- `public/images/backgrounds/pipeline-section-bg.png` (1.1MB): sin referencias en src.
- `src/components/canvas/Interactive3DNetwork.tsx` y `LiquidProject.tsx`: huérfanos (0 consumidores), ambos con `Environment preset` que bajaría HDRs.
- `LegacyNeuroAvatar*` (avatar dual junto a `NeuroAvatar`, elegido por `AvatarRenderer.tsx`): rama legacy compilada en bundle del chatbot.
- `public/logodevelOP.png` 1.2MB como fuente de un logo de 96px en login (login/page.tsx:253-258, next/image lo redimensiona; existe `logodevelOP.svg`).

---

## 4. PRELOADER (real vs percibido)

**Dónde vive**: `src/context/PreloaderContext.tsx` (estado/fases) + `src/components/ui/Preloader.tsx` (orquestador home) + `MarketingIntro.tsx` (rama marketing) + gates `home-routes.ts`/`marketing-routes.ts` (solo hard-load; client-nav lo salta — bien diseñado).

**Qué tapa**: velo negro full-screen `z-[9999]` (Preloader.tsx:319-325) + scroll lock (html/body overflow + lenis.stop) hasta phase `done`.

**Duración teórica (constantes)**: desktop home = logo-ready gate (0-2.5s, cap LOGO_READY_TIMEOUT_MS=2500 en Preloader.tsx:27) + velo 1.4s + 0.15s + trazo 0.85s + fill 0.45s + crossfade 0.4s + READ_HOLD 1.5s + ERASE 1.5s + flying 0.78s + swapping 0.24s ≈ **7.3-9.8s** (constantes en Preloader.tsx:24-34 e IntroLockupText.tsx:19-22: WRITE=1500/HOLD=1500/ERASE=1500).

**Medición real** (Playwright HEADED, webdriver enmascarado, GPU real — el modo headless STALLEA el intro, exactamente como documenta el comentario de PreloaderContext.tsx:65-69):

| ruta | scroll unlock / overlay gone | LCP técnico (Lighthouse, bypass) | factor |
|---|---|---|---|
| / (hard load) | **12.594ms** | 1.40s desktop | **9×** |
| /web-development | 6.916ms (toldo) | 1.66s desktop | 4.2× |

**Veredicto**: no "esconde" carga — la EXCEDE. El contenido ya está pintado (~1.4-2.8s) y el intro lo retiene ~10s más por coreografía pura. De los 12.6s del home, ~3.0s son solo READ_HOLD+ERASE y ~2.5s pueden ser el logo-ready gate. CLS=0 y el gate de readiness evitan pops — la ejecución es limpia; el costo es tiempo-a-interacción en PRIMERA visita (hard-load). Restricción vigente "no perder calidad visual": cualquier recorte es decisión de Franco (ver INSUMOS).

---

## 5. FPS RUNTIME (pilar 60fps) — LAB, RTX 5070, ANGLE D3D11, headless=new + GPU flags

Rutas con `<Canvas>` vivo verificadas: `/` (Hero + EffectComposer), `/web-development` (HeroBackground, `frameloop="always"`), `/login` (DotMatrix). Muestreo rAF 10s idle + 10s scroll programático (25px/16ms):

| ruta | idle avg | idle p5-low | scroll avg | scroll p5-low | worst frame | long tasks (scroll) |
|---|---|---|---|---|---|---|
| / | 58.8fps | 59.5 | **34.3fps** | **15fps** | 483ms | 5 (357ms) |
| /web-development | 59.1fps | 59.5 | **33.1fps** | **15fps** | 417ms | 12 (1318ms) |
| /login | 60fps | 59.5 | 60fps | 59.5 | 17ms | 0 |

**Clasificación de hipótesis (sin arreglar)**: MAIN-THREAD JS, no GPU-bound. Evidencia: (a) GPU es una RTX 5070 y el idle clava 60fps — el render 3D per se no satura; (b) las caídas aparecen SOLO con scroll y vienen con long tasks (1.3s acumulados en web-dev = mounting/reveal de secciones framer + IntersectionObserver + scroll-driven `useScroll`/`useTransform`); (c) login con canvas DotMatrix a `dpr={[1,2]}` sostiene 60/60 — el canvas no es el cuello. En hardware modesto (sin dGPU) el piso de 15fps será peor. El scroll programático agrega su propio costo pero es idéntico en las 3 rutas y login no cae → la señal relativa es real.

Nota: `DotMatrix.tsx:213` usa `dpr={[1, 2]}` — contradice la regla del CLAUDE.md ("Never dpr={2} in production"). En esta GPU no duele; en mobile real no se midió.

---

## 6. PRIORIZACIÓN costo → impacto

| ruta | problema dominante | costo del fix | impacto esperado |
|---|---|---|---|
| /login, /contact, portales | 335KB gz three sin uso + 142KB Sentry | S-M (re-wiring imports) | TBT login mobile 4.9s→~1-2s esperable; −40% transfer |
| / | HDRI 1.64MB externo + TBT 8.6s | S (self-host/Lightformer) + M | −55% transfer home; menos riesgo de 3ro |
| /web-development | 14.7MB iframes+imgs externas | M (facade pattern) | −85% transfer, −120 requests |
| marketing ×4 | páginas client monolíticas 156-242KB | M (dynamic sections) | FCP web-dev 4.1s→<2s esperable |
| / , /web-dev | 34fps scroll | M-L (diagnóstico fino post-P1) | pilar 60fps |

(Los "esperables" son estimaciones direccionales, NO mediciones — medir post-fix con el re-check del MAPA.)

**Top-3 por impacto con evidencia**:
1. **Sacar la cadena three del grafo compartido** (layout→Preloader→MarketingIntro estático; evidencia §3): −335KB gz en CADA ruta que no la usa, y es prerequisito para que login/portales bajen de TBT.
2. **Facade en WebTemplatesImmersive + imágenes externas a next/image**: /web-development pasa de 14.66MB/213req a ~2MB (evidencia §2b — 12.5MB son terceros).
3. **HDRI self-host o Lightformers**: −1.64MB del home y elimina dependencia runtime de raw.githubusercontent.com (evidencia §2a; patrón Lightformer ya existe en BrandedIntroCanvas.tsx:180).

### Propuesta 5.2 (dynamic imports / partición)
- `Preloader.tsx:10`: `MarketingIntro` a `next/dynamic` con gate — solo se resuelve cuando `shouldRunMarketingIntro(pathname)` (hard-load de marketing). Con eso `BrandedIntroCanvas`+three salen del grafo de layout.
- Home: `Hero` puede quedar estático en `app/page.tsx` (es ATF real del home) — three queda en el chunk del home, no compartido.
- Las 4 páginas de marketing: secciones bajo el fold a `dynamic()` con placeholders min-h (patrón que el home YA usa en `page.tsx:11-19`); ATF estático.
- Portales: criterio de aceptación = HAR de /dashboard sin `b536a0f1`/`bd904a5c`/`b79b7286`.
- Sentry: `replayIntegration` a lazy (`Sentry.lazyLoadIntegration`) o bajar `replaysOnErrorSampleRate` — decisión con Franco (pierde replays del primer error si va lazy-on-error).

### Propuesta 5.3 (assets)
- HDRI: bajar `studio_small_03_1k.hdr` a `public/hdri/` (o mejor: replicar Lightformers del BrandedIntroCanvas en Hero y eliminar el archivo). Si se self-hostea: servir con cache immutable.
- WebTemplatesImmersive: screenshot estático (los thum.io ya existen en el flujo) + iframe solo on-click ("facade" tipo lite-youtube). Mata también cdn.tailwindcss.com y fonts de terceros.
- Imágenes unsplash/pexels: pasar por `next/image` con `sizes` correctos (remotePatterns ya existe para placehold.co en next.config.ts:16-23; agregar dominios) o curar copias locales AVIF.
- Videos: `preload="none"` + `poster` en VideoCard.tsx y WebDevelopmentSensory.tsx; re-encode de los mp4 vivos (Male 7.3MB→~1.5MB H.264 CRF28 o AV1); borrar los 3 huérfanos (Man_sips 10.4MB, Muestra 5.3MB, pipeline-bg 1.1MB) — mueren en limpieza P1.
- `logodevelOP.png` (1.2MB): reemplazar por el SVG existente o un PNG 192px (~10KB).

### Propuesta 5.4 (fonts/CSS)
- Fonts propias: NADA que hacer (2 familias next/font self-host, 29KB — sano). Las fonts de terceros desaparecen con el facade de 5.3.
- CSS: un único global de 498KB raw / 60KB gz para todo el sitio (2× el budget de 30KB). No partir a mano: (a) re-medir post-limpieza P1 (tailwind purga solo el CSS de componentes muertos), (b) si sigue >40KB gz, auditar `globals.css` y safelists. CLS=0 hoy: no tocar la estrategia de carga, solo el peso.
- Prefetch cruzado (§2c): si se quiere recortar, `prefetch={false}` en links del dock/navbar hacia rutas de marketing — decisión UX (hoy compra navegación instantánea).

---

## HALLAZGOS PRIORIZADOS

### P0
- **PERF-01 — La cadena three.js (~335KB gz) viaja en el grafo compartido de TODAS las rutas.** Evidencia: `layout.tsx:43` → `Preloader.tsx:10` (import estático de MarketingIntro) → `MarketingIntro.tsx:10` → `BrandedIntroCanvas.tsx:3-16`; HAR de /login con `b536a0f1`+`bd904a5c`+`b79b7286` (§2); Lighthouse /dashboard con los 4 chunks (§3). Impacto: TBT login mobile 4894ms, JS por ruta 5× el budget. Severidad: ALTA (afecta cada página del producto).
- **PERF-02 — /web-development: 14.66MB / 213 requests por iframes de templates vivos + imágenes externas full-res.** Evidencia HAR §2b (template-noir 3.66MB, unsplash 3.0MB, pexels 2.2MB, cdn.tailwindcss.com en runtime). Severidad: ALTA (es la página de venta del servicio web).
- **PERF-03 — HDRI 1.64MB desde raw.githubusercontent.com en runtime en el hero del home.** Evidencia: `Hero.tsx:375` + network Lighthouse/HAR §2a. Riesgo doble: 55% del peso del home + dependencia de un raw de GitHub (sin SLA, rate-limiteable) para el above-the-fold. Severidad: ALTA.

### P1
- **PERF-04 — TBT móvil home 8.57s / SI 11.1s** (script eval 16.3s; bootup R3F 8.5s). Mayormente consecuencia de PERF-01 + hidratación del home monolítico (`app/page` 371KB raw). Re-medir tras 5.2.
- **PERF-05 — Sentry client 467KB raw/142KB gz en todas las rutas con Replay en buffer-mode** (`instrumentation-client.ts:4-11`, `replaysOnErrorSampleRate:1.0` → graba sesión en memoria SIEMPRE). Costo de bundle + main-thread en cada página.
- **PERF-06 — Preloader home retiene 12.6s reales el scroll en primera visita** (medido headed; LCP técnico 1.4s → factor 9×). ~3s son READ_HOLD+ERASE puros. Marketing intro 6.9s. Decisión humana requerida (marca vs velocidad).
- **PERF-07 — Scroll a 33-34fps (p5 15fps) en / y /web-development con GPU fuerte** — main-thread JS (long tasks 0.4-1.3s/10s; login 60/60). En hardware modesto será peor. Diagnóstico fino post-5.2 (hoy el ruido de hidratación contamina).
- **PERF-08 — Prefetch cruzado ~287KB gz por ruta** (chunks de otras páginas marketing hasta en /login). Trade-off deliberado a decidir.
- **PERF-09 — Videos autoplay sin `preload="none"`/`poster`** (`VideoCard.tsx:8-10`, `WebDevelopmentSensory.tsx:125-138`) con fuentes de 5.9-7.3MB.
- **PERF-10 — Peso muerto en public/ y componentes huérfanos** (candidatos P1, una línea c/u en §3: 2 videos 15.7MB + PNG 1.1MB + Interactive3DNetwork + LiquidProject + LegacyNeuroAvatar).

### P2
- **PERF-11 — `DotMatrix.tsx:213` `dpr={[1,2]}`** contra la regla dpr≤1.5 del CLAUDE.md (login/forgot-password). Sin síntoma en desktop (60fps); mobile sin medir.
- **PERF-12 — CSS global único 498KB raw / 60KB gz** (2× budget). Re-medir post-limpieza antes de actuar.
- **PERF-13 — `logodevelOP.png` 1.2MB fuente para logo 96px** (login/page.tsx:253); existe SVG.
- **PERF-14 — emoji-picker-react 303KB raw lazy en admin** — legítimo pero candidato a alternativa liviana si se toca ese surface.
- **PERF-15 — LCP mobile de /dashboard ~8.9s** por data-fetch post-hydration (desktop 89 — sano). Mirar streaming/suspense del portal en algún sprint de portal, no urgente.

---

## CRITERIO (durable)

**Método de medición** (reproducible, todo LAB):
1. Server: build prod servido con `npx next start` en el puerto que diga `NEXTAUTH_URL` (hoy :3000) con `QA_ALLOW_LOCALHOST=1`; auth por `POST /api/qa/login` + cookie header (nunca medir contra `next dev`).
2. CWV: Lighthouse perf-only, Chromium de Playwright (`CHROME_PATH`), 3× mobile (mediana) + 1× desktop por ruta. OJO: el preloader se auto-salta bajo webdriver (PreloaderContext.tsx:70) → Lighthouse mide SIN intro; la experiencia de primera visita se mide aparte con Playwright headed + webdriver enmascarado.
3. Assets: HAR de Playwright (`recordHar`, content omit) con scroll completo; leer `_transferSize`. Clasificar por dominio (propio vs terceros).
4. Bundle: sin analyzer cableado → `.next/server/app/*.html` script tags + `gzip -c | wc -c` por chunk + fingerprint por strings. La transferencia REAL por ruta la da el HAR, no el build log.
5. FPS: rAF sampling 10s idle + 10s scroll programático, con GPU flags (`--use-angle=d3d11`) y verificando `UNMASKED_RENDERER_WEBGL` (si dice SwiftShader, el número no vale). Reportar avg + p5-low + long tasks.

**Umbrales** (de las reglas del repo/usuario): landing <150KB gz JS, <30KB CSS; LCP <2.5s, TBT <200ms, CLS <0.1; pilar 60fps en canvas vivo; dpr≤1.5.

**Cómo priorizar**: (1º) peso compartido mal ubicado (paga TODA ruta), (2º) terceros en runtime del critical path (HDRI/iframes: peso + riesgo), (3º) monolitos por página, (4º) micro-tuning (dpr, posters, prefetch). Nada de optimizar sin re-medir el MISMO protocolo antes/después. Restricción de producto vigente: cero pérdida de calidad visual/animaciones — los fixes son de UBICACIÓN y CARGA, no de contenido.

## MAPA (perecedero — refrescar post-P1)

Todo §1-§5 y los tamaños/hashes de chunks son de ESTE build (BUILD_ID del .next del 2026-07-10, commit 6254428). La limpieza P1 (huérfanos, dead deps) invalida: hashes de chunks, pesos de public/, CSS global, y probablemente los page-chunks de marketing. NO invalida: la cadena layout→three (hay que arreglarla, no muere sola), Sentry, HDRI, preloader, iframes.

**Re-check copy-paste** (tras limpieza o sprint 5.x):
```bash
cd /c/Users/franc/Desktop/wt-auditoria-maestra/logic-core-v3   # o el checkout que corresponda
npm run build 2>&1 | tee /tmp/build.log                        # solo si no hay servers colgados del .next
QA_ALLOW_LOCALHOST=1 npx next start -p 3000 & echo "PID=$!"
export CHROME_PATH="$(node -e "console.log(require('playwright').chromium.executablePath())")"
# bundle: top-20 chunks + gz por ruta
find .next/static/chunks -name '*.js' -printf '%s %p\n' | sort -rn | head -20
for p in index web-development ai-implementations process-automation software-development contact login; do
  t=0; for c in $(grep -oE '/_next/static/chunks/[^"]+\.js' ".next/server/app/$p.html" | sort -u); do
    s=$(gzip -c ".next${c#/_next}" | wc -c); t=$((t+s)); done; echo "$p: $((t/1024))KB gz"; done
# CWV (repetir 3x mobile por ruta y 1x desktop; medianas)
npx -y lighthouse http://localhost:3000/ --output=json --output-path=./lh-home-m1.json \
  --only-categories=performance --chrome-flags="--headless=new" --quiet
# criterio de aceptación 5.2: login/dashboard SIN chunks three
grep -oE 'b536a0f1|bd904a5c|b79b7286' .next/server/app/login.html || echo "OK: login sin three"
kill <PID>
```
(Los hashes `b536a0f1` etc. cambian por build: identificar los chunks three por fingerprint `grep -l "WebGLRenderer" .next/static/chunks/*.js`.)

## INSUMOS PARA SPRINTS

**PERF-01 (P0) → sprint 5.2**
- Tocar: `src/components/ui/Preloader.tsx:10` (import estático de MarketingIntro → `next/dynamic` con `ssr:false` y render condicional tras `shouldRunMarketingIntro`), verificar que ningún otro import estático del layout llegue a `@react-three/*` (`grep -r "react-three" src/components/layout src/context src/app/layout.tsx`).
- Fix propuesto: `const MarketingIntro = dynamic(() => import("@/components/ui/MarketingIntro").then(m => m.MarketingIntro), { ssr: false })` + mantener el velo SSR para marketing (el velo actual es un div plano, no necesita three; el canvas llega ~200ms después con el settle de 420ms ya existente como colchón). Cuidado con el gate SSR de MarketingIntro (marketing-routes.ts:51-61, primer paint del velo): el velo debe seguir viniendo del server — solo el CANVAS va dynamic. Alternativa más quirúrgica: dentro de `MarketingIntro.tsx`, hacer dynamic SOLO `BrandedIntroCanvas`.
- Aceptación (verificable): `.next/server/app/login.html` sin chunks con `WebGLRenderer`; HAR /dashboard sin three; intro de marketing visualmente intacto en hard-load (visual-qa desktop+mobile); TBT login mobile re-medido.
- Decisión humana: ninguna (es re-ubicación pura).

**PERF-02 (P0) → sprint 5.3**
- Tocar: `src/components/sections/web-development/WebTemplatesImmersive.tsx` (y quien renderice los iframes template-*.netlify.app).
- Fix: patrón facade — screenshot local AVIF/WebP de cada template como poster (los thumbnails de thum.io ya existen como fuente) + `<iframe loading="lazy">` montado SOLO on-click/on-interaction. Imágenes unsplash/pexels a `next/image` con `sizes` (sumar dominios a remotePatterns next.config.ts:16-23) o copias locales.
- Aceptación: HAR /web-development <3MB y <90 requests en carga fría con scroll completo; visual idéntico pre-interacción (screenshot diff).
- Decisión humana: ¿los templates deben verse VIVOS sin click (valor demo) o alcanza el poster? — define cuánto se recorta.

**PERF-03 (P0) → sprint 5.3**
- Tocar: `src/components/layout/Hero.tsx:375`.
- Fix (2 opciones): (a) `<Environment files="/hdri/studio_small_03_1k.hdr" />` con el archivo en public/ (cache immutable en headers()); (b) replicar el patrón `<Environment><Lightformer/></Environment>` de `BrandedIntroCanvas.tsx:180-195` y eliminar el HDR (0KB). (b) es preferible (criterio agencia: cero peso, cero terceros) PERO cambia sutilmente los reflejos del logo 3D.
- Aceptación: HAR del home sin requests a raw.githubusercontent.com; home <1.5MB transfer; **visual-qa apruebe que los reflejos del hero no perdieron calidad** (restricción dura).
- Decisión humana: (a) vs (b) — (b) requiere ojo de Franco sobre el look del logo.

**PERF-04 (P1) → sprint 5.2 (mismo sprint, re-check)**
- No tocar nada extra: re-medir TBT/SI home mobile tras PERF-01 + secciones dynamic de marketing (patrón `app/page.tsx:11-19` aplicado a las 4 páginas de servicio). Aceptación: TBT home mobile <3000ms como primer hito (el <200ms del umbral queda para iteración posterior).

**PERF-05 (P1) → sprint 5.2 o propio**
- Tocar: `src/instrumentation-client.ts:4-11`.
- Fix: cargar Replay lazy (`Sentry.lazyLoadIntegration("replayIntegration")` post-init en idle) o `replaysOnErrorSampleRate: 0` en cliente si los replays no se usan (verificar en el dashboard de Sentry si alguna vez se miró un replay — dato que solo tiene Franco).
- Aceptación: chunk Sentry <60KB gz por ruta; un error de prueba (`/api/test-sentry`) sigue reportándose.
- Decisión humana: ¿se usan los session replays? Si nunca se miraron → apagar.

**PERF-06 (P1) → decisión de producto, luego sprint S**
- Tocar (si se aprueba): `Preloader.tsx:24-34` + `IntroLockupText.tsx:19-22` (constantes) — p.ej. READ_HOLD 1500→800, ERASE 1500→700, VEIL 1.4→1.0 recorta ~2.9s sin eliminar ningún paso coreográfico; y precargar el HDRI/hero DURANTE el velo (hoy el gate espera el SVG, no el entorno).
- Aceptación: intro completo <9s medido headed; cero cambios de coreografía (mismos pasos, mismos easings).
- Decisión humana: SÍ — es la firma de marca; Franco define cuánto vale 12.6s vs 9s.

**PERF-07 (P1) → sprint 5.2-bis (diagnóstico) — NO arreglar a ciegas**
- Re-perfilar scroll post-5.2 con el mismo protocolo FPS (§CRITERIO 5). Si persiste <45fps: trace de Chrome DevTools sobre las secciones framer con `useScroll` (sospechosos: reveals whileInView encadenados en web-dev, Lenis + rAF doble). Aceptación del diagnóstico: lista de los 3 componentes top por long-task con evidencia de trace.

**PERF-08 (P1) → micro-sprint con 5.4**
- Tocar: links del dock/navbar (`DynamicDock.tsx`/`Navbar.tsx`) con `prefetch={false}` en rutas de marketing. Aceptación: HAR de /login sin page-chunks ajenos. Decisión humana: ¿se acepta el hit de latencia en la PRIMERA navegación del dock? (client-nav pierde el instant-load).

**PERF-09 (P1) → sprint 5.3**
- Tocar: `src/components/ui/VideoCard.tsx:6-12`, `WebDevelopmentSensory.tsx:124-139`.
- Fix: `preload="none"` + `poster` (frame exportado) + montar `src` on-viewport (IntersectionObserver ya es patrón del repo); re-encode fuentes >2MB.
- Aceptación: transfer de video en HAR /web-development = 0 antes de que el video entre al viewport; autoplay visualmente intacto al llegar.

**PERF-10 (P1) → sprint de limpieza (ya planificado como P1 global)**
- Borrar los 5 ítems listados en §3-candidatos. Aceptación: `find public -size +1M` sin huérfanos; build verde; `git grep` de cada nombre = 0.

## FILAS PARA LA TABLA-PROGRAMA

| sprint propuesto | lente | prioridad | tamaño S/M/L | re-check post-P1 |
|---|---|---|---|---|
| 5.2 — three fuera del grafo compartido (PERF-01) + secciones marketing dynamic (PERF-04) | PERF | P0 | M | sí |
| 5.2b — Sentry replay lazy/off (PERF-05) | PERF | P1 | S | sí |
| 5.3 — facade templates + imgs externas a next/image (PERF-02) | PERF | P0 | M | sí |
| 5.3b — HDRI self-host o Lightformers (PERF-03) | PERF | P0 | S | sí |
| 5.3c — videos preload/poster + re-encode (PERF-09) | PERF | P1 | S | sí |
| 5.4 — CSS re-check + prefetch tuning (PERF-08/12) | PERF | P2 | S | sí (post-limpieza) |
| decisión preloader + recorte de holds (PERF-06) | PERF | P1 | S | no (independiente) |
| diagnóstico FPS scroll post-5.2 (PERF-07) | PERF | P1 | M | sí (bloqueado por 5.2) |
| limpieza: assets/componentes huérfanos (PERF-10) | PERF | P1 | S | n/a (es la limpieza) |
| dpr DotMatrix + logo PNG login (PERF-11/13) | PERF | P2 | S | no |


---

# LENTE ARQ — auditado sobre 6254428 (2026-07-10)

Worktree: `C:/Users/franc/Desktop/wt-auditoria-maestra/logic-core-v3` @ `62544284b03ba4753abbba6f085622008833b1f7`.
Herramientas del propio repo: `dependency-cruiser@^17.4.3` + `.dependency-cruiser.cjs` (regla `no-circular` en `warn`, `.dependency-cruiser.cjs:5-10`, con `tsPreCompilationDeps: true` `.dependency-cruiser.cjs:27`) y `knip@^6.16.1` + `knip.ts`. Ningún script de `package.json` ni workflow de CI (`.github/workflows/` = `e2e.yml`, `db-backup.yml`) corre estas herramientas hoy — el diagnóstico existe pero el candado no.

**Resultado global: 0 P0 · 4 P1 · 3 P2.** Los 16 ciclos conocidos siguen vivos y aparecieron **6 ciclos NUEVOS** (cluster `lead-pipeline`). Los 22 ciclos comparten UN solo patrón y una sola receta de fix. El barrel cliente del chatbot (52 exports) tiene exactamente 1 consumidor. Ningún ciclo es de runtime: todos tienen la pata de vuelta como `import type` (se borran al compilar) — por eso el build pasa. El riesgo es de mantenimiento/refactor, no de producción.

---

## CRITERIO (durable)

Esta sección NO caduca con P1. Son los patrones, el método de resolución paso a paso y la regla que previene cada uno.

### Patrón A — "tipos definidos en el padre" (ciclo parent ↔ hijos)

**Forma:** un componente padre define tipos compartidos (`export type X`) e importa a sus hijos como valores; los hijos importan `import type { X } from '../Padre'`. dependency-cruiser con `tsPreCompilationDeps: true` lo reporta como ciclo aunque TypeScript borre los `import type` (ciclo de grafo, no de runtime).

**Ocurrencias actuales:** BotDetailClient ↔ tabs (6 ciclos) y ClientLeadsTable ↔ lead-pipeline (6 ciclos). Ver MAPA §1.

**Método de resolución (paso a paso, mecánico):**
1. Crear `types.ts` hermano del padre (o reutilizar un `.ts` de solo-datos ya existente en la carpeta, como `tabs.ts`).
2. Mover ahí TODAS las declaraciones `export type` / `export interface` del padre que algún hijo importe (no las que solo usa el padre).
3. En cada hijo: cambiar `import type { X } from '../Padre'` → `from '../types'`.
4. En el padre: importar los tipos desde `./types` y **re-exportarlos** (`export type { X } from './types'`) para no romper consumidores externos (ej: `page.tsx` importa 5 tipos desde BotDetailClient).
5. Verificar: `depcruise` (comando del MAPA) debe mostrar 0 ciclos en ese cluster; `npx tsc --noEmit` sin errores nuevos.

**Regla preventiva:** `no-circular` en `severity: error` (ver snippet abajo). Con la regla en error, cualquier reintroducción del patrón rompe el chequeo aunque sea type-only, porque `tsPreCompilationDeps: true` ya está activado en la config del repo.

### Patrón B — "interface en el barrel" (ciclo barrel ↔ módulos hoja)

**Forma:** el `index.ts` de una carpeta define un tipo (`KBTemplate`, `kb-templates/index.ts:3-12`) y a la vez agrega los módulos hoja (`index.ts:14-23`); cada hoja importa el tipo DESDE el index (`restaurant.ts:1`). 10 ciclos idénticos.

**Método de resolución:**
1. Crear `types.ts` en la carpeta del barrel con el/los tipos que las hojas consumen (en kb-templates: solo `KBTemplate`).
2. Hojas: `import type { KBTemplate } from './types'`.
3. `index.ts`: `export type { KBTemplate } from './types'` + mantener el mapa/función (`KB_TEMPLATES`, `getTemplate`) — los consumidores externos no cambian.
4. Verificar igual que Patrón A.

**Regla durable de estilo:** un barrel `index.ts` NO declara tipos ni lógica propia; solo re-exporta. Si un tipo lo consumen las hojas de la misma carpeta, vive en `types.ts`, nunca en `index.ts`.

### Patrón C — barrel gordo sin consumidores (fachada muerta)

**Forma:** barrels que re-exportan decenas de símbolos que nadie importa VÍA el barrel (los consumidores hacen deep-import del archivo fuente). El barrel deja de ser API y pasa a ser inventario desactualizado que enmascara dead code: knip reporta el re-export como "unused export" y hace ruido sobre el dead code real.

**Método de resolución (por barrel, sin tocar consumidores):**
1. Medir consumo real del barrel (comando del MAPA §re-check, script `barrel-analysis.cjs`): clase A (consumido desde fuera vía barrel), B (solo desde dentro del módulo), C (nunca vía barrel).
2. Clase A → queda en el barrel. Clase B → los consumidores internos pasan a importar el archivo fuente directo (import relativo), y el símbolo sale del barrel. Clase C → sale del barrel sin tocar nada más (el símbolo fuente puede seguir usado por deep-import; su muerte real la decide knip sobre el ARCHIVO fuente, no sobre el barrel).
3. Cuidado con CADENAS de re-export: un símbolo "C" en un sub-barrel puede estar consumido vía el barrel padre (ej: `handleChatRequest` es C en `server/chat/index.ts` pero A vía `index.server.ts:48`). Antes de borrar de un sub-barrel, grep del símbolo en los barrels padres.
4. Verificar: `npx tsc --noEmit` + build + `knip --include exports,types` con menos ruido que antes.

**Regla durable:** el barrel se justifica solo si tiene consumidores externos. Para consumo interno de una carpeta, imports relativos directos. Frontera pública del módulo chatbot = `index.server.ts` (16 consumidores reales hoy) — el barrel cliente `index.ts` casi no existe como API (1 consumidor).

### Patrón D — duplicate export (named + default del mismo símbolo)

**Forma:** `export function X` + `export default X` en el mismo archivo. 10 de los 12 casos actuales; en 9 el default está muerto (knip). Genera dos formas de import para lo mismo y confunde a knip/refactors.

**Método de resolución:**
1. Grep de importadores del archivo: ¿named o default?
2. Si named → borrar la línea `export default X`. Si default (solo `DynamicDock`) → cambiar el import del consumidor a named y borrar el default. Si mixto (solo `DotMatrix`) → normalizar el consumidor default (`.then(m => m.DotMatrix)` en el dynamic import) y borrar el default.
3. EXCEPCIÓN dura: `page/layout/loading/error/route/not-found` de `src/app/**` requieren default por framework — no se tocan (ninguno de los 12 casos actuales es de esos).
4. Los "duplicates" por alias semántico de schemas Zod (`GetTicketByIdSchema = TicketIdSchema`) NO son el patrón: son alias intencionales consumidos por nombre — se dejan.

**Regla preventiva:** lint `import/no-default-export` con override para `src/app/**` es la versión ESLint; con knip, mantener `--include duplicates` en el re-check periódico.

### Candado dependency-cruiser propuesto (sprint 4.5)

Verificado contra el código ACTUAL: las dos reglas de capas pasan HOY con 0 violaciones (grep sobre el dump completo de 3145 dependencias):
- `src/modules/** → src/app/**`: **0 edges** hoy.
- `src/app/api/** → src/components|src/context|src/modules/chatbot/components`: **0 edges** hoy.

`no-circular` en `error` pasa a verde recién después de 4.1–4.2b (hoy daría 22 errores — ese es el punto del candado: fija el estado post-fix).

```js
/** .dependency-cruiser.cjs — candado 4.5 (reemplaza el forbidden actual) */
forbidden: [
  {
    name: 'no-circular',
    severity: 'error', // hoy está en 'warn' (.dependency-cruiser.cjs:6) — subir DESPUÉS de romper los 22
    from: {},
    to: { circular: true },
  },
  {
    name: 'modules-no-import-app',
    comment: 'Un módulo extraíble no puede depender del app router (0 violaciones hoy — fija el presente)',
    severity: 'error',
    from: { path: '^src/modules' },
    to: { path: '^src/app' },
  },
  {
    name: 'api-routes-no-ui',
    comment: 'Rutas API no importan UI (0 violaciones hoy — fija el presente)',
    severity: 'error',
    from: { path: '^src/app/api' },
    to: { path: '^src/(components|context)|^src/modules/chatbot/components' },
  },
],
```

Wiring mínimo (agencia de 2 personas, gratis): script `"arch:check": "depcruise src --config .dependency-cruiser.cjs --output-type err-long"` en `package.json` + paso en el workflow e2e existente o pre-push local. NO reglas aspiracionales (ej: "server no importa components" FALLA hoy: `server/admin/createBot.ts:4` → kb-templates, 6 edges server→components/avatar — ver ARQ-06).

---

## MAPA (perecedero — refrescar post-P1)

**RE-CHECK (copy-paste, correr las 4 líneas desde Git Bash; diffear la salida contra este mapa):**

```bash
cd /c/Users/franc/Desktop/wt-auditoria-maestra/logic-core-v3
./node_modules/.bin/depcruise src --config .dependency-cruiser.cjs --output-type err-long
./node_modules/.bin/knip --include duplicates --no-progress
./node_modules/.bin/knip --include exports,types --no-progress | head -40
node "/c/Users/franc/AppData/Local/Temp/claude/C--Users-franc-Desktop-PorfolioDevelOP/f609b81f-e6d0-4f1c-99d8-cf9cee6b91e6/scratchpad/barrel-analysis.cjs"
```

(El 4º script y `route-weights.cjs` viven en el scratchpad de esta corrida; si el scratchpad ya no existe, ambos están reproducidos íntegros en `barrel-analysis.cjs` / `route-weights.cjs` de esta misma carpeta — copiarlos a cualquier lado y ajustar la const `ROOT`.)

### §1 — Ciclos: 22 totales (16 conocidos SIGUEN + 6 NUEVOS)

Salida `depcruise ... err-long`: `x 22 dependency violations (0 errors, 22 warnings). 1274 modules, 3145 dependencies cruised.`

**Cluster 1 — kb-templates (10 ciclos, CONOCIDOS, patrón B).** `index.ts ↔ {restaurant, medico, legal, inmobiliaria, gimnasio, generico, distribuidora, contable, constructora, concesionaria}.ts`. Cada hoja: `import type { KBTemplate } from './index'` (línea 1 de los 10 archivos); el index importa las 10 constantes (`kb-templates/index.ts:14-23`).

**Cluster 2 — BotDetailClient ↔ tabs (6 ciclos, CONOCIDOS, patrón A).** Parent importa 7 tabs (`BotDetailClient.tsx:18-24`); 6 tabs devuelven `import type` (ver §3). `InstallTab` y `IntegrationsTab` NO participan (no importan del parent).

**Cluster 3 — lead-pipeline (6 ciclos, NUEVOS, patrón A).** `src/modules/chatbot/components/dashboard/`:
- `ClientLeadsTable.tsx:13` importa `LeadPipeline` (valor) y `ClientLeadsTable.tsx:23` define `export type LeadWithScore`.
- Vuelven type-only: `lead-pipeline/LeadPipeline.tsx:8`, `lead-pipeline/LeadPipelineColumn.tsx:8`, `lead-pipeline/LeadColumnOverview.tsx:12`, `lead-pipeline/classes.ts:3` — los 4 hacen `import type { LeadWithScore } from '../ClientLeadsTable'`.
- Cadenas reportadas: combinaciones de `LeadPipeline → LeadPipelineColumn/LeadColumnOverview/classes → ClientLeadsTable → LeadPipeline`.

Los 22 ciclos tienen la pata de vuelta type-only → 0 riesgo de runtime hoy; riesgo real = refactor/extract y ruido de tooling.

### §2 — kb-templates: qué extrae 4.1 y consumidores

Lo ÚNICO que las hojas importan del index es el tipo `KBTemplate` (`kb-templates/index.ts:3-12`; interface de 8 campos: businessInfo, servicesOrProducts, faq, policies, salesGuidance, toneExamples, forbiddenStatements, quickReplies). Eso es todo lo que va a `types.ts`. El index además: importa `type Industry` desde `../../../../server/admin/createClientWithBot` (`index.ts:1`) — components→server, queda igual —, define `KB_TEMPLATES: Record<Industry, KBTemplate>` (`index.ts:25-36`) y `getTemplate()` (`index.ts:38-40`).

Consumidores externos del barrel (los 3 importan SOLO `getTemplate`):
- `src/modules/chatbot/server/admin/createBot.ts:4`
- `src/modules/chatbot/components/admin/onboarding/Step3KnowledgeBase.tsx:5`
- `src/lib/onboarding/core.ts:7`
`KB_TEMPLATES` no tiene consumidores externos. Referencia en comentario (no-código): `server/verticals/types.ts:146`.

### §3 — BotDetailClient ↔ tabs: el ciclo exacto (insumo 4.2)

Parent → tabs (valores, `BotDetailClient.tsx:18-24`): OverviewTab, ConfigTab, KnowledgeTab, ActivityTab, LeadsTab, ConversationsTab, InstallTab.
Tabs → parent (SOLO tipos):
| Tab | línea | importa |
|---|---|---|
| ActivityTab.tsx | 4 | `MappedEvent` |
| ConfigTab.tsx | 4 | `BotWithDetails` |
| ConversationsTab.tsx | 5 | `ConversationItem` |
| KnowledgeTab.tsx | 4 | `BotWithDetails` |
| LeadsTab.tsx | 5 | `LeadItem` |
| OverviewTab.tsx | 17 | `BotWithDetails, MonthlyUsage` |

Tipos a extraer (definidos en `BotDetailClient.tsx:29-89`): `BotWithDetails` (Prisma payload), `MappedEvent`, `MonthlyUsage`, `LeadItem`, `ConversationItem`. Consumidor externo a preservar: `page.tsx:11-18` importa `BotDetailClient` + los 5 tipos desde `./BotDetailClient` → re-export desde el parent tras mover a `types.ts` (o cambiar page.tsx, 1 archivo). Ya existe `tabs.ts` (hermano, solo-datos: `VALID_TABS`/`TabId`, `tabs.ts:1-2`) como precedente del patrón. Bonus limpieza: el re-export `BotDetailClient.tsx:26-27` de `VALID_TABS`/`TabId` está muerto (knip lo flaggea; page.tsx:19 los toma de `./tabs`).

### §4 — Barrels chatbot: clasificación A/B/C (insumo 4.3)

32 barrels, 340 exports parseados. A = consumido desde FUERA del módulo vía barrel; B = solo consumo interno vía barrel; C = nunca vía barrel (detalle símbolo-por-símbolo en `barrel-report.json` del scratchpad). knip flaggea **205 exports muertos-a-nivel-barrel** en 25 barrels chatbot (de 306 unused exports + 215 unused types del repo).

| barrel (src/modules/chatbot/) | exports | A | B | C |
|---|---|---|---|---|
| index.server.ts | 86 | 17 | 1 | 68 |
| index.ts (cliente) | 52 | 2 | 0 | 50 |
| components/avatar/index.ts | 31 | 0 | 9 | 22 |
| server/scoring/index.ts | 30 | 5 | 15 | 10 |
| server/tools/index.ts | 26 | 0 | 1 | 25 |
| server/crm/index.ts | 19 | 0 | 6 | 13 |
| server/verticals/index.ts | 16 | 0 | 1 | 15 |
| components/chat/index.ts | 10 | 0 | 0 | 10 |
| server/health/index.ts | 8 | 4 | 0 | 4 |
| server/logging/index.ts | 8 | 1 | 4 | 3 |
| server/prompts/index.ts | 8 | 2 | 0 | 6 |
| server/quota/index.ts | 8 | 0 | 4 | 4 |
| components/dashboard/index.ts | 7 | 0* | 0 | 7 |
| server/admin/index.ts | 7 | 0* | 0 | 7 |
| server/leads/csv/index.ts | 7 | 2 | 0 | 5 |
| server/llm/index.ts | 7 | 1 | 1 | 5 |
| components/installation/index.ts | 6 | 5 | 0 | 1 |
| tool-cards 5 / conversation 5 / insights 5* / admin(comp) 4 / tooltip 4 / safety 4 / kb-templates 3 / preview 3 / hooks 3 / intent 3 / dashboards 2 / config 2* / notifications 2 / pricing 2 / chat 1* | 48 | 3 | 10 | 35 |
| **TOTAL** | **340** | **42** | **52** | **246** |

\* **Caveat cadenas de re-export** (el script cuenta `import ... from`, no `export ... from`): símbolos C de sub-barrels consumidos vía barrel padre: `components/dashboard` (ChatbotUpsellLanding, ChatbotOverview → vía `index.ts:82`), `server/chat` (handleChatRequest → `index.server.ts:48`), `server/config` (handleConfigRequest → `index.server.ts:67`), `server/insights` (generateInsightsForBot, getInsightsCountForBot → `index.server.ts:69-74`), `server/admin` (5 saves → `index.server.ts:77-84`). Aplicar el paso 3 del Patrón C antes de podar esos 5 sub-barrels.

**Keep-list A del barrel público `index.server.ts` (17):** handleChatRequest, handleConfigRequest, generateInsightsForBot, getInsightsCountForBot, getClientChatbotSession, checkClientHasChatbot, listLeadsByOrgSlug, listLeadsForDashboard, countDqLeadsForOrg, listConversationsByOrgSlug, getUsageByOrgSlug, listRecentHandoffsByOrgSlug, getLeadByIdForOrg, getConversationMessagesForOrg, countHotNewLeadsForOrg, LeadDashboardFilters (type), getMonthlyAnalysisForOrg. Consumidores: 16 archivos (rutas API + dashboard, ej: `src/app/api/chatbot/[slug]/chat/route.ts`, `src/app/(protected)/dashboard/layout.tsx`).
**Keep-list A de `index.ts` (2):** ChatbotUpsellLanding, ChatbotOverview ← único consumidor `src/app/(protected)/dashboard/chatbot/page.tsx:9`.
**Contexto de frontera:** deep-imports desde fuera del módulo a internals del chatbot = **103 edges** vs **18 vía barrels** (dump depcruise). El contrato del README ("Public API only via index.ts — no deep imports", `src/modules/chatbot/README.md:14-16`; "no imports from src/ salvo @/lib/prisma", `README.md:11-13` vs realidad: audit-log, plan, rate-limit, email, components/ui — 13 edges solo a `components/ui/index.ts`) está muerto en la práctica → decisión humana en ARQ-06.

**Candidatos P1 (fase limpieza, una línea c/u):** archivos sin referencias (knip files): `src/modules/chatbot/components/admin/config/Toggle.tsx`, `src/modules/chatbot/prisma/{seed,developProactivePrompts,update-proactive-prompts}.ts`, `src/modules/chatbot/server/verticals/__tests__/ev3.generate-fixture.ts`; re-export muerto `BotDetailClient.tsx:26-27`.

### §5 — Duplicate exports: 12 archivos (knip re-medido; eran 13, uno desapareció con P1)

Comando: `./node_modules/.bin/knip --include duplicates --no-progress` (exit 1 = hay hallazgos).

| archivo | duplicado (líneas) | forma consumida | veredicto |
|---|---|---|---|
| src/components/layout/Navbar.tsx | Navbar:114 / default:415 | named (`src/app/layout.tsx:42`) | borrar default |
| src/components/canvas/DotMatrix.tsx | DotMatrix:209 / default:224 | MIXTO: default (`accept-invite/InviteBackground.tsx:6`), named (`forgot-password/page.tsx:10`, `login/page.tsx:12`) | unificar a named (tocar InviteBackground) + borrar default |
| src/components/layout/DynamicDock.tsx | DynamicDock:371 / default:629 | default (`Navbar.tsx:9`); named MUERTO (knip) | unificar a named (tocar Navbar.tsx:9) + borrar default |
| src/components/ui/MarketingIntro.tsx | :65 / default:354 | named (`Preloader.tsx:10`) | borrar default |
| src/components/ui/IntroLockupText.tsx | :183 / default:256 | named (`Hero.tsx:13`) | borrar default |
| src/components/ui/LogoStrokeOverlay.tsx | :58 / default:142 | named (`Hero.tsx:12`) | borrar default |
| src/components/ui/BrandedIntroCanvas.tsx | :100 / default:200 | named (`MarketingIntro.tsx:10`) | borrar default |
| src/components/3d/BrandedLogoWhite.tsx | :30 / default:87 | named (`BrandedIntroCanvas.tsx:15`) | borrar default |
| src/emails/TicketReplyEmail.tsx | :22 / default:153 | named (`src/lib/tickets/actions.ts:10`) | borrar default* |
| src/emails/ActionRequiredEmail.tsx | :20 / default:143 | named (`src/actions/agency-actions.ts:8`) | borrar default* |
| src/app/(protected)/admin/tickets/_actions/ticket.schemas.ts | TicketIdSchema:13 = GetTicketByIdSchema:25 | alias consumido (`ticket.actions.ts:8,135`) | DEJAR (alias semántico) |
| src/app/(protected)/admin/messages/_actions/message.schemas.ts | MessageOrganizationIdSchema:12 = GetConversationSchema:13 = MarkAsReadSchema:14 | alias consumidos (`message.actions.ts:9-10,142,211`) | DEJAR (alias semántico) |

\* Emails: el default de react-email solo lo exige el preview server (`email dev`), que NO está instalado (package.json solo tiene `@react-email/components`, línea 88). Si Franco planea usar el preview, dejar el default — decisión humana chica. Ningún caso de los 12 es page/layout/error/loading de Next (esos defaults no se tocan por regla).

### §6 — Rutas del build (referencia anti-boundary)

**Limitación:** `build.log` (Next 16.2.9 `--webpack`) imprime la tabla de rutas SIN columna de tamaños — no hay "First Load JS" en el log (`build.log:27-148`, solo lista + `ƒ/○`). Sustituto reproducible: `node route-weights.cjs` (scratchpad) suma chunks del client-reference-manifest por ruta + `rootMainFiles`. Números RAW pre-gzip, sirven para ORDENAR, no comparan con la métrica gzip de Next.

- **Baseline compartido en TODAS las rutas** (`rootMainFiles` de `.next/build-manifest.json`): **676 KB raw**, dominado por `static/chunks/7149-*.js` = **467 KB**. El piso por manifest (incluye client components del root layout: Navbar+dock+widget chat) es ~2.499 KB raw hasta en `_not-found` y `/login`.
- Top gordas (aprox raw KB): admin/clients/new 3370 · admin/chatbots/[botId] 3358 · dashboard/chatbot/settings 3339 · dashboard/chatbot/leads/[id] 3330 · dashboard/chatbot/install 3317 · dashboard/chatbot/{leads,conversations} 3312 · admin/projects/* ~3195 · admin/leads/[leadId] 3158.
- Livianas: bienvenida/cambiar-password/accept-invite/forgot-password/reset-password ~2506-2511 · `/` (landing) 2499.
- Lectura anti-boundary: el bloque chatbot (admin+dashboard) es el más pesado sobre un baseline ya alto; cualquier sprint que toque barrels NO debe empeorar esto (el barrel cliente `index.ts` mezcla UI+server-actions en un solo entry — `index.ts:77-86` exporta server actions junto a componentes: razón extra para partirlo).
- 31 páginas estáticas generadas, 87 rutas app con manifest, proxy/middleware activo (`build.log:151`).

---

## HALLAZGOS PRIORIZADOS

### P0 — (ninguno)
Ningún hallazgo de este lente rompe producción hoy: los 22 ciclos son type-only (se borran al compilar), el build pasa (`build.log:15`), y los barrels muertos no afectan runtime.

### P1

**ARQ-01 — 22 ciclos de dependencia, 3 clusters, 1 solo patrón (16 conocidos + 6 NUEVOS).**
Evidencia: salida depcruise (MAPA §1); `kb-templates/*.ts:1` ×10; `BotDetailClient.tsx:18-24` + tabs líneas 4/5/17; `ClientLeadsTable.tsx:13,23` + `lead-pipeline/*.ts(x):3,8,12`.
Riesgo: cada refactor/extract del chatbot (objetivo declarado del módulo, README.md:4-5) tropieza con los ciclos; el cluster lead-pipeline demuestra que el patrón se REPRODUCE (6 nuevos desde el diagnóstico previo) porque no hay candado.
Severidad: P1 — no rompe hoy, pero crece.

**ARQ-02 — El barrel cliente `index.ts` (52 exports) tiene 1 consumidor; la API real del módulo es `index.server.ts`.**
Evidencia: único import externo `dashboard/chatbot/page.tsx:9` (2 símbolos); 50/52 exports jamás consumidos vía barrel; mezcla server actions con UI (`index.ts:77-86`).
Riesgo: fachada falsa — invita a crear dependencias nuevas sobre una API que nadie usa; knip queda ciego al dead code real detrás.

**ARQ-03 — 205 exports muertos-a-nivel-barrel en 25 barrels del chatbot (de 246 clase C totales).**
Evidencia: knip exports/types (MAPA §4); tabla A/B/C completa.
Riesgo: el chatbot es EL producto; este ruido esconde qué está realmente muerto y encarece cada auditoría. La poda 4.3 es mecánica con la keep-list A + caveat de cadenas.

**ARQ-04 — Contrato de frontera del módulo (README) muerto en la práctica; sin candado en CI.**
Evidencia: `README.md:9-16` ("no deep imports", "solo @/lib/prisma") vs 103 deep-import edges y 47 edges a lib/prisma + audit-log(18), components/ui(13+), plan(12), rate-limit(8)...; `.dependency-cruiser.cjs:6` en `warn`; ningún script/workflow lo corre.
Riesgo: decisiones de import se toman contra un contrato ficticio. Necesita decisión humana (ver INSUMOS): re-escribir el contrato al real y candarlo (barato) vs re-imponer el contrato aspiracional (caro, NO recomendado en este scope).

### P2

**ARQ-05 — 12 archivos con duplicate exports (9 defaults muertos, 1 mixto, 1 invertido, 2 alias intencionales).** Evidencia y veredicto por archivo: MAPA §5. Riesgo bajo: confusión de forma de import y ruido knip.

**ARQ-06 — Reglas de capas solo pueden fijar 2 fronteras hoy; server→components del chatbot está sucio.** Evidencia: `modules→app` = 0 y `api→UI` = 0 (verificado); pero `chatbot/server → chatbot/components` tiene 6+ edges (`server/admin/createBot.ts:4`→kb-templates; `server/admin/saveBotConfig.ts`→components/avatar, etc.) — una regla server-no-UI FALLA hoy y queda FUERA del candado 4.5 (el candado fija el presente). Nota: 4.1 mueve kb-templates a types.ts pero el edge server→components/avatar persiste (AVATAR_STYLE_SCHEMA vive en components/avatar — candidato a mover a shared/ en un sprint futuro, fuera de scope).

**ARQ-07 — Baseline JS compartido alto: 676 KB raw en todas las rutas, chunk único de 467 KB.** Evidencia: MAPA §6. Fuera del scope de romper-ciclos, pero es LA referencia anti-boundary del bloque: ninguna limpieza de barrels debe mover estos números para arriba (re-check: `node route-weights.cjs` antes/después).

---

## INSUMOS PARA SPRINTS

**Sprint 4.1 — kb-templates types.ts (ARQ-01 cluster 1)**
- Tocar: crear `kb-templates/types.ts` (interface `KBTemplate` movida de `index.ts:3-12`); editar línea 1 de los 10 templates (`'./index'`→`'./types'`); `index.ts` re-exporta `export type { KBTemplate } from './types'`.
- No tocar: `getTemplate`/`KB_TEMPLATES` ni los 3 consumidores externos (createBot.ts:4, Step3KnowledgeBase.tsx:5, core.ts:7).
- Aceptación: `depcruise ... err-long` sin ciclos kb-templates (quedan ≤12 totales); `npx tsc --noEmit` limpio; los 3 consumidores compilan sin cambios.
- Decisión humana: ninguna.

**Sprint 4.2 — BotDetailClient types (ARQ-01 cluster 2)**
- Tocar: crear `[botId]/types.ts` con los 5 tipos (`BotDetailClient.tsx:29-89`); editar los 6 tabs (líneas 4/4/5/4/5/17) a `'../types'`; BotDetailClient importa de `./types` y re-exporta los 5 tipos (page.tsx:11-18 no cambia). Borrar re-export muerto `BotDetailClient.tsx:26-27`.
- Aceptación: depcruise sin ciclos BotDetailClient (quedan ≤6); build verde; page.tsx sin cambios.
- Decisión humana: ninguna.

**Sprint 4.2b (NUEVO) — lead-pipeline types (ARQ-01 cluster 3)**
- Tocar: mover `export type LeadWithScore` (`ClientLeadsTable.tsx:23`) a `dashboard/lead-pipeline/types.ts` (o `dashboard/types.ts`); editar los 4 importadores (`LeadPipeline.tsx:8`, `LeadPipelineColumn.tsx:8`, `LeadColumnOverview.tsx:12`, `classes.ts:3`); ClientLeadsTable re-exporta para compat.
- Aceptación: `depcruise ... err-long` → **0 ciclos en TODO src** (es el último cluster); tsc limpio.
- Decisión humana: ninguna.

**Sprint 4.3 — poda de barrels chatbot (ARQ-02, ARQ-03)**
- Tocar: `index.ts` queda con la keep-list A (2 símbolos + los tipos que consuma page.tsx si aplica) o se ELIMINA moviendo el consumidor único a deep-import (preferido: eliminar — 1 archivo tocado); `index.server.ts` queda con la keep-list A (17); sub-barrels: podar clase C respetando el caveat de cadenas (§4), clase B pasa a imports relativos directos.
- Método: Patrón C del CRITERIO, barrel por barrel, con `barrel-report.json` como mapa símbolo-a-símbolo.
- Aceptación: build verde + `knip --include exports,types` reporta <50 unused en `src/modules/chatbot/**` (hoy 205 en barrels) + `node route-weights.cjs` sin regresión en top-15.
- Decisión humana: ¿eliminar `index.ts` (cliente) o dejarlo mínimo con 2 exports? Recomendación: eliminar y actualizar README (junto con ARQ-04).

**Sprint 4.4 — duplicate exports (ARQ-05)**
- Tocar: borrar 9 defaults muertos (tabla §5); DotMatrix: editar `InviteBackground.tsx:6` a `.then(m => m.DotMatrix)` y borrar default; DynamicDock: editar `Navbar.tsx:9` a named y borrar default. Schemas: NO tocar.
- Aceptación: `knip --include duplicates` → solo los 2 archivos de schemas (o 0 si se ignoran por config); build verde; grep de `import <Nombre> from` sobre los 10 archivos → 0 hits.
- Decisión humana: emails — ¿se va a usar react-email preview (`email dev`)? Si sí, dejar esos 2 defaults.

**Sprint 4.5 — candado depcruise (ARQ-04, ARQ-06)**
- Tocar: `.dependency-cruiser.cjs` con el snippet del CRITERIO (no-circular→error + modules-no-import-app + api-routes-no-ui); `package.json` script `arch:check`; paso opcional en workflow e2e.
- Precondición: 4.1+4.2+4.2b cerrados (si no, no-circular error rompe con los ciclos restantes).
- Aceptación: `npm run arch:check` exit 0 sobre main post-merges; introducir un import `src/modules→src/app` de prueba local lo hace fallar.
- Decisión humana (ARQ-04): actualizar `README.md:9-16` al contrato REAL (frontera pública = index.server.ts; deps permitidas = lib/{prisma,audit-log,plan,rate-limit,email,utils}+components/ui) — redacción propuesta la escribe el sprint, Franco aprueba. La alternativa (re-imponer "no deep imports", re-cablear 103 edges) se descarta por costo/beneficio en este scope.

---

## FILAS PARA LA TABLA-PROGRAMA

| sprint propuesto | lente | prioridad | tamaño S/M/L | re-check post-P1 sí/no |
|---|---|---|---|---|
| 4.1 kb-templates types.ts (romper 10 ciclos) | ARQ | P1 | S | sí |
| 4.2 BotDetailClient types.ts (romper 6 ciclos) | ARQ | P1 | S | sí |
| 4.2b lead-pipeline types.ts (romper 6 ciclos NUEVOS) | ARQ | P1 | S | sí |
| 4.3 poda barrels chatbot (keep-list A, 205 muertos) | ARQ | P1 | M | sí |
| 4.4 normalizar duplicate exports (10 archivos) | ARQ | P2 | S | sí |
| 4.5 candado depcruise (no-circular error + 2 capas) + README contrato real | ARQ | P1 | S | sí |

---

*Corrida read-only verificada: escrituras solo en scratchpad. `git status -s` del worktree al cierre: VACÍO. (Al inicio de la corrida figuraban `M logic-core-v3/.env.example` y `M logic-core-v3/package-lock.json` del setup; quedaron restauradas durante la corrida por fuera de este lente.)*


---

# LENTE DATOS+DR — auditado sobre 6254428 (2026-07-10)

Worktree: `C:/Users/franc/Desktop/wt-auditoria-maestra` (rama `chore/auditoria-maestra` = origin/main @ `62544284b03ba4753abbba6f085622008833b1f7`). Rutas relativas a `logic-core-v3/` salvo indicación. READ-ONLY total sobre DB: solo `migrate status`, `migrate diff` (lectura), `db pull --print` y un `SELECT` sobre `_prisma_migrations`.

**Alcance de las mediciones de DB**: el `.env` del worktree apunta a la branch **dev** de Neon (`ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`, salida de `migrate status`). La branch `main` de Neon (= PROD según `docs/operations/00-entornos.md:8-11`) **no es inspeccionable desde acá** — su estado de migraciones queda "a confirmar por Franco".

---

## 1. BACKUP ACTUAL — `.github/workflows/db-backup.yml` (raíz del repo)

### Qué hace (diseño)
- **Job 1 `dump`**: instala `postgresql-client-16`, corre `pg_dump` contra `secrets.DIRECT_DATABASE_URL_PROD` (o `_DEV` vía `workflow_dispatch`), `--no-owner --no-acl --format=plain --quote-all-identifiers` (yml:115-118), comprime `gzip -9` y cifra `gpg --symmetric AES256` con `secrets.BACKUP_GPG_PASSPHRASE` (yml:119-122). Sube como **GitHub Actions artifact, retención 30 días** (yml:126-132). No es S3 ni bucket externo: artifact de GH.
- **Job 2 `restore-test`**: Postgres 16 side-car, descifra+restaura el artifact, valida `COUNT(*) >= 1` en `_prisma_migrations` (yml:198-208). Diseño correcto: backup verificado por restore en cada corrida.
- **Schedule**: cron diario `0 6 * * *` (06:00 UTC = 03:00 ART) + `workflow_dispatch` manual (yml:38-48).
- **Cifrado**: justificado porque el repo es **PUBLIC** (verificado: `gh repo view --json visibility` → `{"visibility":"PUBLIC"}`); los artifacts de repos públicos son descargables por cualquiera.
- Runbook y racional completos en `docs/operations/neon-backups.md` (existe, 237 líneas, actualizado 2026-05-26). Scripts locales paralelos existen: `scripts/db-backup-local.sh` y `scripts/db-restore-local.sh`.

### Estado REAL (verificado con gh CLI, repo frc11/PorfolioDevelOP)
- **ACTIVO pero 100% FALLIDO**: `gh run list --workflow=db-backup.yml --limit 100` → **44 corridas, 44 `failure`** (`Counter({'failure': 44})`), desde 2026-05-28 hasta hoy 2026-07-10. Duración 13-16s cada una (muere en el primer check).
- **Causa confirmada** (log del run 29083641469, 2026-07-10): `ERROR: secret faltante para target=prod` → falla en el step "Resolve target URL" (yml:93-97).
- **Secrets del repo: CERO**. `gh secret list` devuelve vacío. Faltan los 3: `DIRECT_DATABASE_URL_PROD` (bloqueante), `BACKUP_GPG_PASSPHRASE` (bloquearía el paso siguiente, yml:107-110), `DIRECT_DATABASE_URL_DEV` (opcional). También faltan `DATABASE_URL_TEST` y `AUTH_SECRET` que referencia `logic-core-v3/.github/workflows/e2e.yml:32,48,53`.
- **Backups locales: tampoco existen**. `backups/` no existe ni en el worktree ni en `Desktop/PorfolioDevelOP/logic-core-v3/`.

**Conclusión: hoy NO existe ningún backup restaurable de ninguna DB del proyecto. El sistema está construido y verificado por diseño, pero nunca produjo un backup en ~6 semanas de corridas diarias fallidas.** → DR-01 (P0).

---

## 2. NEON NATIVO

- **Restore por branching / PITR instantáneo**: Neon permite crear una branch desde timestamp/LSN (restore <1s, copy-on-write). El repo ya usa branching para dev (`docs/operations/00-entornos.md:29-48`).
- **LÍMITE = ventana de retención de history según plan** (doc pública de Neon, 2026): **Free ≈ 6 horas de restore window, con tope de 1 GB de change history** (lo que ocurra primero); Launch ($19/mes) ≈ 7 días; Scale ≈ 30 días. Fuentes: [Neon plans](https://neon.com/docs/introduction/plans), [Backup & restore](https://neon.com/docs/guides/backup-restore).
- El repo declara plan Free: `docs/operations/neon-backups.md:5` ("Neon Free no incluye backups confiables (sin PITR, retención corta)") — nota: la afirmación "sin PITR" del doc es imprecisa; Free SÍ tiene restore window, pero corta (6h/1GB).
- **Snapshots programados**: feature de planes pagos. En Free no hay snapshots programados.
- 🔶 **A CONFIRMAR POR FRANCO en el dashboard de Neon**: plan exacto del proyecto develOP y ventana de restore vigente (Settings → plan; Branches → restore window). Toda la Capa 1 de DR depende de este número.

---

## 3. MIGRACIONES — estado

### 3a. `npx prisma migrate status` (branch dev de Neon)
```
81 migrations found in prisma/migrations
Database schema is up to date!
```
Conectado a `ep-quiet-waterfall-acv0fpll-pooler...` (pooler). Contra la corrida de junio (69 migs): hoy son **81 locales, todas aplicadas, 0 pendientes**.

Verificación directa de `_prisma_migrations` (SELECT read-only, script `check-migs.js` del scratchpad):
- **DB dev: 85 aplicadas · 0 fallidas (`finished_at` null) · 0 rolled back**.
- **4 DB-only** (aplicadas en dev pero ausentes de main): `20260707044711_motor_whatsapp_b0_schema`, `20260709163143_b1s1_webhook_credentials_and_identity_transitions`, `20260709180000_b1s2_outbound_apikey_templates_idempotency`, `20260709200000_b1s3_health_events_and_alerts` — las 4 son del motor WhatsApp (ramas b1-s*, aún no mergeadas a main). **Local-only: 0.**
- **No hay ninguna migración fallida que limpiar con `migrate resolve` en dev.** (Prod: a confirmar.)

### 3b. Drift DB real vs `prisma/schema.prisma`
`npx prisma db pull --print` guardado en `scratchpad/db-pull.prisma` (1.739 líneas). Diff estructural autoritativo con `npx prisma migrate diff --from-schema-datasource --to-schema-datamodel` (guardado en `scratchpad/drift-diff.txt`):
- **Único drift = superficie del motor**: 7 tablas `motor_*` (`motor_alert`, `motor_contact_identity`, `motor_contact_identity_transition`, `motor_conversation`, `motor_message`, `motor_template`, `motor_waba_channel`) + 12 enums `Motor*`/`WabaChannelStatus` existen en la DB dev y NO en el schema de main.
- Fuera del motor, **el schema de main coincide con la DB dev al 100%** (el diff no reporta nada más).
- Riesgo operativo: cualquier `migrate dev` corrido desde main contra la dev DB propondría **DROPear las 7 tablas del motor**. Se auto-resuelve al mergear b1; hasta entonces es un guardrail de runbook (ya cubierto por la regla "nunca migrate dev/reset" de CLAUDE.md:9 y prisma.config.ts:7). → MIG-02 (P1 de runbook, no de código).

### 3c. Inventario de migraciones DESTRUCTIVAS (grep + revisión manual)
13 migraciones con statements destructivos (evidencia `prisma/migrations/<nombre>/migration.sql`):

| Migración | Qué borra/cambia | Nota |
|---|---|---|
| `20260320200000_multi_tenancy_organizations` | `DROP COLUMN Organization.userId` (:53), drop de 5 FKs `clientId` (:51-78), `ALTER TYPE Role RENAME VALUE 'CLIENT'→'ORG_MEMBER'` (:84) | refactor multi-tenant fundacional |
| `20260406010000_v2-unify-project-task` | 3× DropForeignKey (Os*Payment/TimeEntry) (:2-8) | |
| `20260406040000_v2-cleanup-deprecated-models` | **`DROP TABLE OsTask; DROP TABLE OsProject;`** (:1-2) | tablas deprecadas v2 |
| `20260406113000_allow_internal_projects_without_organization` | drop FK `Project_organizationId_fkey` (:1) | re-creada nullable |
| `20260420000000_baseline_premium_modules` | `DROP TABLE IF EXISTS ModulePricing CASCADE` (:4) | baseline |
| `20260515180808_chatbot_leads_crm_status` | **`DROP COLUMN status` + recrea como enum** (:13-14) — el propio header de Prisma advierte data loss (:1-5) | pérdida real si había valores |
| `20260522214201_drop_user_unlocked_features` | `DROP COLUMN User.unlockedFeatures` (:15) | |
| `20260525182135_b11_1_project_organizationid_not_null` | `ALTER COLUMN organizationId SET NOT NULL` (:11) + drop/re-add FK | valida datos; falla si hay NULLs |
| `20260525190100_b11_4b_promote_columns_to_enum` | 5× `ALTER COLUMN ... TYPE <enum> USING cast` (:24-40) | falla si hay valores fuera del enum |
| `20260525192312_b11_6_clientid_to_organizationid` | `DROP COLUMN clientId` en BusinessMetric y PageView + 2 índices (:11-24) | |
| **`20260605225019_drop_subscription_plan_name`** | **`ALTER TABLE "Subscription" DROP COLUMN "planName"`** (única línea) | el caso conocido; contract del expand-contract hacia `planId` |
| `20260619140100_drop_chatbot_lead_converted_column` | `DROP COLUMN IF EXISTS convertedToOsLeadId` (:9) | |
| `20260621120000_reconcile_dev_drift_schema_align` | `DROP INDEX/COLUMN IF EXISTS` × 8 (AgencySettings.singleton, Organization.avatar*/city/deletedAt/internalNotes, chatbot_lead.convertedToOsLeadId) (:14-29) | idempotente por diseño, header :1-12 documenta el criterio |

Patrón observado: las destructivas son mayormente "contract" de refactors ya migrados en código, varias con `IF EXISTS` y comentarios de intención. **Ninguna corre hoy con backup previo garantizado** (ver §1).

### 3d. Dónde/cómo corren las migraciones en deploy
- **El pipeline de deploy NO corre migraciones.** `netlify.toml:2` → `command = "npx prisma generate && npm run build"`. No hay `migrate deploy` en netlify.toml ni en `.github/workflows/` de la raíz (solo db-backup.yml existe ahí).
- **Se corren MANUALMENTE**: `docs/operations/b14-deploy-checklist.md:60-80` — Fase 2 "Pre-deploy" con `DATABASE_URL='<prod_url>' npx prisma migrate deploy` a mano, DESPUÉS del push a main (Fase 1.3 :47-56). Como el push a main dispara el build de Netlify automáticamente, en la práctica hay **ventana código-nuevo-desplegado / schema-viejo** hasta que Franco corre el deploy manual. → MIG-03 (P2).
- **¿Con qué URL? NO con direct**: `prisma/schema.prisma:5-8` — el datasource solo tiene `url = env("DATABASE_URL")`, **sin `directUrl`**. Ni `.env` ni `.env.local` definen `DIRECT_URL`/`DIRECT_DATABASE_URL` (nombres verificados; `.env.example:` sí lista `DIRECT_DATABASE_URL` como documentada). `migrate status` conectó al host `-pooler`. Los docs operativos incluso instruyen usar la pooled para todo (`docs/operations/00-entornos.md:45-48`), y `b14-deploy-checklist.md:117` correctamente dice que el runtime use pooled — pero migraciones por pooler es la configuración no soportada por Neon/Prisma. Corroboración empírica del riesgo: el quirk `P1001` de `prisma migrate status` documentado en `docs/audits/2026-06-revalidacion.md:35,125`. → MIG-01 (P1).
- `logic-core-v3/.github/workflows/e2e.yml:30,46` sí tiene `migrate deploy` contra `DATABASE_URL_TEST`, pero está **mal ubicado y nunca corrió** (GH solo lee `<root>/.github/workflows/`; lo documenta db-backup.yml:4-6) y sus secrets no existen. **Candidato P1 (dead file): mover o borrar `logic-core-v3/.github/workflows/e2e.yml`.**

---

## 4. INTEGRIDAD (schema.prisma)

Cobertura de `onDelete`: 67 relaciones con `fields:`, 61 explícitas (55 `Cascade`, 5 `SetNull`, 1 `Restrict`), 6 implícitas.

- **Borrar Organization arrastra 23 modelos por Cascade** (BotConfig, Subscription, Project, Ticket, Message, Invoice, Service, OrgMember, Notification, EmailCampaign/Contact, CrmIntegration, ClientAsset, ClientBrandProfile, BusinessMetric, PageView, OrganizationModule, OnboardingTask, PanelAnnouncement, Referral, ReferralCode, ExecutiveBriefSnapshot, WeeklyReportLog + transitivos: Conversation/ChatbotLead vía BotConfig `onDelete: Cascade`, TicketMessage vía Ticket, CrmSyncAttempt vía ChatbotLead/CrmIntegration). Es **intencional y está bien manejado**: `src/modules/chatbot/server/admin/hardDeleteClient.ts` (modal de resumen previo :107-118, transacción :126-135, audit log fuera de tx :155-168, OsLead deliberadamente preservado :13-15). El riesgo no es el diseño — es que ese botón existe en prod **sin ningún backup detrás** (§1): un hard-delete equivocado hoy es irreversible pasada la ventana de 6h de Neon Free.
- **6 relaciones sin `onDelete` explícito** (defaults de Prisma: opcional→`SetNull`, requerida→`Restrict`): `Project.osLead` (:553), `Subscription.plan` (:628), `Subscription.pendingPlan` (:643), `OsLead.assignedTo` (:871), `OsLeadActivity.performedBy` (:949) — todas opcionales, default SetNull, comportamiento razonable; y `OsTimeEntry.user` (:1048) — **requerida**, default Restrict: borrar un User con time entries falla. Aceptable (no hay callsites de `user.delete` en src/), pero implícito. → INT-01 (P2: hacer explícitos los 6).
- **`CrmSyncAttempt.organizationId` es string plano sin FK** (schema.prisma:1721, índice :1735) — denormalizado a propósito; la limpieza llega por cascada transitiva de `leadId`/`integrationId`, así que no deja huérfanos en el flujo actual. Solo señalado; no accionar. (P2 informativo.)
- `onDelete: Restrict` en `OrganizationModule.module` (:1188): correcto — impide borrar un `PremiumModule` en uso.

---

## 5. ESTRATEGIA DR PROPUESTA (insumo sprint O1.1) — dos capas

**Objetivos para agencia de 2 personas** (coherentes con `neon-backups.md:178-191`, que ya define RTO ~1h / RPO 24h):
- **RPO**: ≤ 24h para catástrofe total (dump diario); ~0 (minutos) para errores lógicos dentro de la ventana PITR de Neon.
- **RTO**: ≤ 15 min para error lógico (branch restore Neon); ≤ 1h para restauración completa desde dump.

**Capa 1 — Neon PITR/branching (recuperación rápida, RTO bajo)**
- Uso: "borré/rompí datos hace un rato" → branch desde timestamp pre-incidente, verificar, promover o copiar filas. Instantáneo, sin mover bytes.
- Límite: ventana del plan (**Free: 6h/1GB — a confirmar por Franco**). Decisión humana: si el negocio ya tiene datos de clientes reales en prod, evaluar **Neon Launch ($19/mes, 7 días de ventana)** — es la mejora de DR con mejor relación costo/esfuerzo del stack.

**Capa 2 — pg_dump cifrado fuera de Neon (retención larga, redundancia, Ley 25.326)**
- Ya construida (db-backup.yml + restore-test + runbook). Solo falta **activarla**: 2 secrets (DR-01).
- Retención hoy: 30 días en GH artifacts. Para retención larga/compliance: agregar step opcional que suba el `.sql.gz.gpg` a **Cloudflare R2 (free tier 10GB, sin egress fees)** o **Backblaze B2 (10GB free)** con lifecycle de 90-365 días. S3 clásico no hace falta a esta escala. Los dumps ya van cifrados AES256 → el bucket no necesita cifrado adicional propio.
- El dump corre contra prod por `DIRECT_DATABASE_URL_PROD` (sin pooler) — correcto por diseño (yml:11, 32).

---

## 6. PROPUESTA O1.2 — runbook de migraciones + guardas

Con el inventario de §3c y el flujo de §3d, contenido concreto propuesto:

1. **Pre-flight de toda migración** (checklist en `docs/operations/`): clasificar aditiva vs destructiva (`grep -iE "DROP|SET NOT NULL|ALTER .* TYPE" migration.sql`). Si es destructiva → (a) disparar `workflow_dispatch` de db-backup (una vez activo) o `scripts/db-backup-local.sh`, y (b) crear branch Neon `pre-<migración>` como snapshot instantáneo gratis (copy-on-write). Recién entonces `migrate deploy`.
2. **Orden deploy**: aplicar `migrate deploy` en prod ANTES del push a main (hoy es al revés: b14-deploy-checklist Fase 1.3 push → Fase 2 migraciones), con la disciplina expand-first que el repo ya practica (ej: planId antes de dropear planName).
3. **Fallo a medias de `migrate deploy`**: NUNCA `migrate dev`/`reset` (regla existente). Diagnóstico: `migrate status` + `SELECT * FROM _prisma_migrations WHERE finished_at IS NULL`. Camino A (preferido): fix-forward — corregir el SQL a mano, aplicarlo, y `migrate resolve --applied <nombre>`. Camino B: restaurar branch Neon `pre-<migración>` y reintentar. **Hoy no hay ninguna fallida que limpiar en dev (0/85); estado de prod a confirmar antes de cerrar O1.2.**
4. **`directUrl` para migraciones** (fix MIG-01, ver Insumos).
5. **Guardrail temporal motor-drift**: hasta mergear b1, prohibición explícita en el runbook de `migrate dev` contra la dev DB (propondría DROP de 7 tablas motor_*; evidencia drift-diff.txt).

---

## HALLAZGOS PRIORIZADOS

| ID | Sev | Hallazgo | Evidencia clave |
|---|---|---|---|
| **DR-01** | **P0** | **Cero backups existentes**: db-backup.yml falla 44/44 corridas desde 2026-05-28 por secrets ausentes (`gh secret list` = vacío; faltan `DIRECT_DATABASE_URL_PROD` y `BACKUP_GPG_PASSPHRASE`); sin backups locales; Neon Free ≈ 6h de ventana; y existe hard-delete en cascada de 23 modelos en prod | §1; run 29083641469; hardDeleteClient.ts:131 |
| MIG-01 | P1 | Migraciones corren por el POOLER: sin `directUrl` en datasource, sin var DIRECT en env local; configuración no soportada para DDL (quirk P1001 ya documentado en el repo) | schema.prisma:5-8; §3d |
| MIG-02 | P1 | Drift dev-DB↔main = 7 tablas + 12 enums del motor (ramas b1 sin mergear): `migrate dev` desde main propondría DROPearlas; falta guardrail escrito hasta el merge | drift-diff.txt; §3b |
| DR-02 | P1 | Retención de backups limitada a 30 días de GH artifacts, sin copia fuera de GitHub/Neon (retención larga / Ley 25.326) | db-backup.yml:131; neon-backups.md:41-43 |
| MIG-03 | P2 | Orden deploy invertido: push a main dispara Netlify antes de las migraciones manuales → ventana código-nuevo/schema-viejo; DEPLOY.md además está desactualizado (habla de Vercel; el deploy real es Netlify) | b14-deploy-checklist.md:47-80; DEPLOY.md:55; netlify.toml:2 |
| INT-01 | P2 | 6 relaciones sin `onDelete` explícito (5 opcionales→SetNull implícito; `OsTimeEntry.user` requerida→Restrict implícito) | schema.prisma:553,628,643,871,949,1048 |
| INT-02 | P2 | `CrmSyncAttempt.organizationId` string sin FK (denormalizado); limpieza cubierta por cascada transitiva — informativo | schema.prisma:1721 |

**Candidatos P1 (una línea, no desarrollados)**: `logic-core-v3/.github/workflows/e2e.yml` mal ubicado y nunca ejecutado (db-backup.yml:4-6) con secrets inexistentes — mover a raíz o borrar · `DEPLOY.md` habla de Vercel siendo Netlify el deploy real — actualizar o borrar.

---

## INSUMOS PARA SPRINTS

### DR-01 (P0) → sprint O1.1a "activar el backup"
- **Qué tocar**: nada de código. GitHub → Settings → Secrets and variables → Actions.
- **Cómo** (el runbook ya existe: `docs/operations/neon-backups.md:60-108`): (1) `openssl rand -base64 48` → secret `BACKUP_GPG_PASSPHRASE` + copia en password manager; (2) direct URL de la branch main de Neon (sacar `-pooler` del subdominio o dashboard → Direct connection) → secret `DIRECT_DATABASE_URL_PROD`; (3) opcional `DIRECT_DATABASE_URL_DEV`; (4) Actions → "DB backup" → Run workflow → target prod.
- **Criterio de aceptación**: 1 run manual con **ambos jobs verdes** (dump + restore-test) y, al día siguiente, el run del cron también verde; `gh run list --workflow=db-backup.yml --limit 2` muestra `success`.
- **Decisión humana**: es Franco quien debe generar/guardar la passphrase y cargar secrets (acceso al repo settings y al dashboard Neon). Además: **confirmar plan Neon y ventana de retención**, y decidir si upgradear a Launch ($19/mes).

### MIG-01 (P1) → sprint O1.2 (parte 1)
- **Qué tocar**: `prisma/schema.prisma:5-8` + `.env`/`.env.local` locales + (Netlify NO: runtime sigue pooled, b14-deploy-checklist.md:117).
- **Cómo**: datasource → `url = env("DATABASE_URL")` + `directUrl = env("DIRECT_DATABASE_URL")`; agregar `DIRECT_DATABASE_URL` (host sin `-pooler`) a `.env` local (branch dev). El CLI de migraciones usará automáticamente `directUrl`; el runtime sigue por pooled.
- **Criterio de aceptación**: `npx prisma migrate status` reporta conexión al host SIN `-pooler`; `npm run build` verde; ninguna migración nueva generada (cambio de config, no de schema — `migrate diff` vacío contra la misma DB).
- **Decisión humana**: Franco debe crear la var también en su entorno y decidir si se agrega a Netlify (no necesaria para runtime).

### MIG-02 (P1) → sprint O1.2 (parte 2, guardrail)
- **Qué tocar**: `docs/operations/` (runbook nuevo o sección en 00-entornos.md) + opcionalmente CLAUDE.md.
- **Cómo**: documentar que hasta el merge de b1-s* la dev DB tiene 4 migraciones motor DB-only y que `migrate dev` desde main propone DROPs; regla operativa: solo `migrate deploy`, y verificación `migrate diff --from-schema-datasource --to-schema-datamodel` antes de cualquier migración nueva desde main.
- **Criterio de aceptación**: runbook mergeado; tras el merge de b1 a main, `migrate diff` vacío y la sección se marca resuelta (re-check).
- **Decisión humana**: ninguna (documental). El merge de b1 es decisión de roadmap ya en curso.

### DR-02 (P1) → sprint O1.1b "retención larga"
- **Qué tocar**: `.github/workflows/db-backup.yml` (step nuevo tras "Upload encrypted artifact").
- **Cómo**: step con `aws s3 cp backup.sql.gz.gpg s3://<bucket>/...` apuntando a Cloudflare R2 (endpoint S3-compatible, free tier 10GB, egress gratis) o Backblaze B2; secrets nuevos `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET`; lifecycle rule de 90-365 días en el bucket. Alternativa aún más simple: subir solo los dumps de los domingos (retención semanal larga, 52/año ≈ <5GB para una DB <100MB).
- **Criterio de aceptación**: objeto `.sql.gz.gpg` visible en el bucket tras un run verde; restore-test local desde el objeto del bucket funciona (descarga + `db-restore-local.sh`).
- **Decisión humana**: Franco elige proveedor (R2 vs B2) y crea la cuenta/bucket. Ejecutar DESPUÉS de DR-01.

---

## FILAS PARA LA TABLA-PROGRAMA

| sprint propuesto | lente | prioridad | tamaño S/M/L | re-check post-P1 sí/no |
|---|---|---|---|---|
| O1.1a — activar db-backup (secrets + primer run verde) [DR-01] | DATOS+DR | P0 | S | sí (cron verde al día siguiente + semana 1) |
| O1.1b — copia a bucket externo R2/B2 con retención larga [DR-02] | DATOS+DR | P1 | S | sí (restore desde bucket) |
| O1.2a — directUrl para migraciones [MIG-01] | DATOS+DR | P1 | S | sí (migrate status por host sin -pooler) |
| O1.2b — runbook fallo de migración + backup-before-destructive + guardrail motor-drift [MIG-02, MIG-03, §6] | DATOS+DR | P1 | M | sí (drift vacío post-merge b1) |
| O1.3 — onDelete explícitos (6 relaciones) + docs deploy (DEPLOY.md/orden Fase 2) [INT-01, MIG-03] | DATOS+DR | P2 | S | no |

---

## LIMITACIONES DE LA CORRIDA

1. **Todo lo medido en DB fue contra la branch `dev` de Neon** (es la URL del `.env` del worktree). El estado de migraciones/drift de **prod (branch main de Neon) no se pudo inspeccionar** — requiere que Franco corra `DATABASE_URL='<prod_url>' npx prisma migrate status` o lo delegue con la URL.
2. **Plan de Neon y ventana de retención exacta**: no verificables desde el repo/CLI — dashboard de Neon (Franco).
3. `gh` estaba autenticado (runs y visibility verificados); no hizo falta el fallback "verificar en GitHub UI".
4. **Estado del worktree**: `git status -s` NO está vacío, pero por modificaciones PRE-EXISTENTES a esta corrida (`logic-core-v3/.env.example` +16 líneas de docs motor B1-S2 y `logic-core-v3/package-lock.json` +23 líneas, presumiblemente del setup/npm install del orquestador). Este lente no modificó ningún archivo trackeado; no las revertí para no pisar a otros lentes en paralelo.
5. Los artefactos de evidencia quedaron en el scratchpad: `db-pull.prisma`, `drift-diff.txt`, `check-migs.js`.


---

# LENTE RESILIENCIA — auditado sobre 6254428 (2026-07-10)

Worktree: `C:/Users/franc/Desktop/wt-auditoria-maestra` (rama chore/auditoria-maestra = origin/main @ 6254428). Rutas relativas a `logic-core-v3/`. Read-only: cero modificaciones (`git status -s` limpio salvo `.env*`/lockfile pre-existentes del setup común).

---

## 1. INVENTARIO DE DEPENDENCIAS EXTERNAS

### A. Vertex AI / Gemini (provider `@ai-sdk/google-vertex`)
| Call-site | Uso | Modelo |
|---|---|---|
| `src/modules/chatbot/server/chat/handleChatRequest.ts:679` (`streamText`) | Chat del widget — **streaming SSE** vía `toUIMessageStreamResponse()` (`handleChatRequest.ts:879`) | `plan.llmModel` = `gemini-2.5-flash` en los 3 planes (`src/lib/plan/fallback.ts:51`) |
| `src/lib/ai/executive-brief.ts:301` (`generateText`) | Brief ejecutivo (dashboard + crons) | `gemini-2.5-flash`, `maxOutputTokens` 1024 (`executive-brief.ts:19,26`) |
| `src/modules/chatbot/server/insights/generateInsights.ts:99-102` (`generateObject`) | Insights (cron diario) | `gemini-2.5-flash` |
| `src/modules/chatbot/server/health/smokeTest.ts:26` (`streamText`) | Health-check LLM | `gemini-2.5-flash` |
| `src/app/api/admin/chatbot/demo-chat/[slug]/route.ts:46` (`streamText`) | Demo admin | ídem |

Provider factory: `src/modules/chatbot/server/llm/providers/google.ts:69-83`. **Ningún call-site pasa `abortSignal` ni `maxRetries`** (grep `maxRetries` en `src/` = 0 hits) → aplica el default del AI SDK v6 (`ai@^6.0.177`, package.json:95): 2 reintentos con backoff exponencial (~2s/4s) **sin límite de tiempo por intento**.

### B. n8n (3 superficies)
| Call-site | Uso | Timeout/Retry |
|---|---|---|
| `src/lib/n8n.ts:18-35` (`sendLeadToN8n`) → llamado por `src/lib/actions/contact.ts:82` | Lead del form de contacto (landing) | Timeout 8s (`n8n.ts:29`), **1 intento**, lanza; el caller lo atrapa (`contact.ts:86-91`) |
| `src/modules/chatbot/server/crm/postToN8n.ts:152-199` (`postToN8nWithRetry`) → `syncLeadToCrm.ts:98` → `captureLead.ts:478` | CRM sync del lead del bot | 3 intentos, timeout 10s c/u, backoff 1s/3s **sin jitter**; no reintenta 4xx ni error de cifrado (`postToN8n.ts:19-22,168-183`). Peor caso ~33s **fire-and-forget** |
| `src/lib/n8n.ts:259-355` (`getN8nMetrics`) | Métricas de workflows | **Sin callers en `src/` (grep `from '@/lib/n8n'` = solo contact.ts) → candidato P1 dead code** (fallback silencioso a mock en error, `n8n.ts:351-354`) |

### C. Neon (Prisma)
- Cliente único sin config de resiliencia: `src/lib/prisma.ts:5-6` (`new PrismaClient({ log: ['error'] })`). `DATABASE_URL` solo trae `sslmode` (grep de nombres de params en `.env`): **sin `connect_timeout` ni `pool_timeout` explícitos** → defaults Prisma (connect 5s).
- En el path del chat: rate-limit por tabla Neon (`src/lib/rate-limit/limiter.ts:44-62`, UPSERT atómico, fail-closed si no vuelve fila `limiter.ts:65-70`), plan/quota/conversación (`handleChatRequest.ts:316-347`), dedup+persist del user msg (`handleChatRequest.ts:516-529`), tool `capture_lead` (varias queries, `captureLead.ts:201,228,358`), persistencia post-stream en `onFinish` (`handleChatRequest.ts:779-816`).
- Cold-start (scale-to-zero ~5 min): cubierto SOLO para el widget por INFRA.2 (commit 9910973): retry client-side 3 intentos backoff 2s/4s (`src/modules/chatbot/shared/chatRetryPolicy.ts:24-27`, orquestado en `useChatbot.ts:203-304`) + idempotencia server del user message (`shouldSkipUserPersist`, `handleChatRequest.ts:516-529`).

### D. next-auth v5 (beta)
- `src/auth.ts:76-272`. JWT strategy, pero `getUserAccessState` pega a Prisma en **cada** validación de sesión (`auth.ts:205-231`: `shouldRefreshFromDb` incluye `!user`, verdadero en toda request post-login) → Neon caída = portal completo (admin+dashboard) inutilizable. Sin catch: el throw burbujea.
- Magic link: `sendVerificationRequest` **await-ea Brevo** (`auth.ts:101-120` → `src/lib/email/brevo-service.ts`, **sin timeout** — grep AbortSignal en brevo-service = 0).

### E. Otras APIs externas
| Dependencia | Call-site | Timeout | Catch |
|---|---|---|---|
| Telegram | `src/lib/notifications/telegram.ts:78-89` | **NO** | sí — nunca lanza (`telegram.ts:90-98`) |
| Brevo (email) | `src/lib/integrations/brevo.ts` (todas las fn) y `src/lib/email/brevo-service.ts` | **NO** | sí — devuelven ok:false/null |
| Webhook de alertas agencia | `src/lib/alerts.ts:131-137` | 8s ✓ | sí (`alerts.ts:144-146`) |
| Cal.com v1/v2 | `src/lib/integrations/cal-com.ts:107`, `cal-com-v2.ts:165-172` (booking del setter: `src/lib/leados/agenda.ts`) | **NO** | sí — errores normalizados (`cal-com-v2.ts:181-199`, mapea `slot_ocupado` 409) |
| Google Business Profile | `src/lib/integrations/google-business-profile.ts:93,140,232,302,363` | **NO** | sí |
| PageSpeed | `src/lib/integrations/pagespeed.ts:70` | **NO** | sí |
| Tiendanube | `src/lib/integrations/tiendanube.ts:44,160` | **NO** | sí |
| GA4 / Search Console | `src/lib/analytics.ts`, `src/lib/searchconsole.ts` | (SDK) | fallback a mock con `isMockData` + `PreviewBanner` visible (`dashboard/resultados/trafico/page.tsx:188`, `seo/page.tsx:226`) — patrón de degradación CORRECTO |
| Sentry | `handleChatRequest.ts:717,871,900` | n/a | best-effort, no-op sin DSN |

---

## 2. TABLA: COMPORTAMIENTO HOY / CRITICIDAD / IDEMPOTENCIA

| Dependencia | Comportamiento HOY ante fallo | Criticidad | Idempotencia ante retry |
|---|---|---|---|
| **Vertex (chat)** | Fallo pre-stream: SDK reintenta 2× (default, sin time-box) → 500 → widget reintenta 3× (`chatRetryPolicy.ts:24`) → hasta **9 llamadas a Vertex por turno** y minutos de espera si Vertex cuelga (sin `abortSignal`, `handleChatRequest.ts:679-877`). Fallo mid-stream: enmascarado como 200, logueado a stderr+Sentry (`onError`, `handleChatRequest.ts:708-721`), el visitante ve la respuesta cortada. Agotado el retry: `connection_failed` honesto con input habilitado (`useChatbot.ts:80-90,214-226`) | **FATAL** | ✓ user msg dedup (INFRA.2, `handleChatRequest.ts:516-529`); ✓ reserva de cuota no se duplica (2º intento reusa la Conversation existente → `isNewConversation=false`, `handleChatRequest.ts:453`); ✓ `capture_lead` idempotente por `conversationId` (`captureLead.ts:201-220`) |
| **Vertex (brief/insights)** | try/catch → null / cuenta failed; brief truncado detectado y no cacheado (`executive-brief.ts:38-42,102-107`); insights per-bot catch (`cron/generate-insights/route.ts:77-90`) | DEGRADABLE (UI) / INVISIBLE (cron) | ✓ re-correr regenera (cache overwrite); reports idempotentes por `(org, periodKey)` vía `WeeklyReportLog` (`src/lib/reports/executive-weekly/send.ts:66-70,110`) |
| **n8n (contacto)** | Outbox correcto: DB primero (`contact.ts:62`), webhook best-effort con catch (`contact.ts:81-91`). Fallo = solo `console.error`, **sin recuperación** (el lead queda visible en /admin/leads) | INVISIBLE | Sin retry → sin duplicados. `ContactSubmission` sin dedup (resubmit del usuario duplica fila — aceptable) |
| **n8n (CRM sync)** | Lead YA persistido antes del sync (`captureLead.ts:358-401`). `CrmSyncAttempt` PENDING→SUCCESS/FAILED (`syncLeadToCrm.ts:78-134`). Pero el dispatch es `void` post-tool (`captureLead.ts:478`) → ver RESIL-02. FAILED queda para **retry manual UI únicamente** (`syncLeadToCrm.ts:20-22`) — no hay cron de resync (inventario de crons §E abajo) | INVISIBLE (negocio: CRM del cliente sin el lead) | ⚠️ hasta 3 POSTs por transitorio; si n8n procesó y el timeout cortó la respuesta → duplicado en el CRM. El payload ya lleva `leadId` (`buildLeadPayload.ts:85`) = clave de dedup disponible pero **contrato no documentado** del lado n8n |
| **Neon** | Chat: throw → 500 → retry del widget (cubre cold-start). Persistencia post-stream: catch INFRA.1, log stderr+Sentry, turno del visitante intacto pero **contabilidad de tokens/cuota perdida** (`handleChatRequest.ts:849-875`). Portal/auth/contact: throw sin retry → 500 / error crudo de action (`contact.ts:24` fuera del try) | **FATAL** (todo) | Lecturas ✓; `incrementQuota`/`messageCount` se pierden, no se duplican |
| **next-auth** | Neon caída = sesión invalidable en cada request (`auth.ts:207-210`); Brevo colgado = login magic-link colgado hasta el deadline (`auth.ts:104` await sin timeout) | **FATAL** (portal) | JWT — sin efecto duplicable |
| **Telegram** | Nunca lanza, devuelve false (`telegram.ts:90-98`); **sin timeout** → puede colgar la lambda/cron | INVISIBLE | Sin retry → at-most-once (noti perdida) |
| **Brevo** | Devuelve ok:false/null con catch; **sin timeout**; `notifyClientOfLead` nunca lanza (`captureLead.ts:443-468`) | INVISIBLE (notis) / FATAL (magic link) | Sin retry → at-most-once |
| **Cal.com (setter agenda)** | Errores normalizados con mensaje accionable; 409 slot pisado mapeado (`cal-com-v2.ts:181-199`); sin timeout | DEGRADABLE | ⚠️ `createBooking` (`cal-com-v2.ts:108`) sin idempotency key — hoy sin retry automático (mitigado) |
| **GBP/PageSpeed/Tiendanube/GA4/GSC** | catch → null o mock con banner visible | DEGRADABLE | Solo lecturas |
| **Widget /config** | Fetch único; fallo → `null` **cacheado para toda la page-view** (`configCache.ts:15-26`) → `LogicCompanion.tsx:94` `return null` = el bot desaparece silenciosamente | **FATAL-silencioso** (adquisición) | n/a |

### E. Inventario de crons (todos INVISIBLE ante fallo)
`src/app/api/cron/`: alerts, detect-bot-issues, generate-insights, os-follow-up, regenerate-briefs, send-executive-reports, send-weekly-reports — todos con Bearer `CRON_SECRET`. `netlify.toml:25-29` agenda `generate-insights-cron` y `send-weekly-reports-cron`, **pero no existe ningún directorio de functions en el repo** (`find . -type d -name functions` = vacío) → esos schedules no apuntan a nada. `docs/operations/cron-jobs.md` delega en "Netlify Scheduled Function o cron externo" — el disparador real vive FUERA del repo y no es verificable acá.

---

## 3. DEADLINE-BUDGET

**Timeout real:** `netlify.toml` no configura timeout de functions (`netlify.toml:16-17` solo `node_bundler`). La ruta del chat declara `export const maxDuration = 30` (`src/app/api/chatbot/[slug]/chat/route.ts:9`) — convención de Vercel cuyo respeto por `@netlify/plugin-nextjs` NO está garantizado; el techo efectivo lo define el plan de Netlify de Franco (**A CONFIRMAR** — spec: default 30s, techo 60s síncronas, 15 min background sin streaming). Crons batch declaran `maxDuration = 300` (`cron/regenerate-briefs/route.ts:5`, `cron/send-executive-reports/route.ts:5`) — **casi seguro no honrado** en Netlify.

**Veredicto streaming:** el chatbot SÍ streamea — `streamText(...)` + `result.toUIMessageStreamResponse()` (`handleChatRequest.ts:679,879`), transporte `DefaultChatTransport` que espera `text/event-stream` (`useChatbot.ts:201-224`). **Descarta background function** para el chat: la resiliencia del turno tiene que caber en la función síncrona.

**Presupuesto del turno (warm), con mediciones del propio repo:**
- TTFB de Vertex medido: **~2.3s** ("Vertex TTFB son ~2.3s y no se mueve", `useChatbot.ts:346-348`, instrumentación B1.3 en `handleChatRequest.ts:722-727`).
- Pre-LLM (validación + resolveBot cacheado + rate-limit + plan/quota/conv en paralelo + dedup/persist): 5-7 roundtrips Neon ≈ 0.5-1.5s warm (cold-start Neon suma 1-5s al primero).
- Multi-step hasta 3 steps (`stopWhen: stepCountIs(3)`, `handleChatRequest.ts:694`): cada step = roundtrip LLM completo; `capture_lead` mete además 3-5 queries + transacción (`captureLead.ts:201-401`). Turno con tool: **~10-20s** realista.
- **Budget de retry restante: ~5-10s** en el peor turno warm. Conclusión: los 2 reintentos default del SDK **sin time-box no caben** (un intento colgado consume solo el deadline entero); menos aún combinados con los 3 intentos del widget (multiplicación 3×3). El reintento síncrono solo es viable como: `abortSignal` de ~10s por intento + **máximo 1 retry** condicionado a `elapsed < ~8s` + fallo pre-stream. Todo lo demás va por **degradar rápido** (canned + CTA WhatsApp, el carril `degradedResponse` YA existe: `handleChatRequest.ts:134-152`).
- Crons batch: loop secuencial por org × Gemini (3-8s por brief con thinking, `executive-brief.ts:22-26`) → con >4-6 orgs el batch no entra en 30s reales. Hoy resumible (progreso persiste per-org y reports son idempotentes por periodKey) pero el corte es un 502 invisible.

---

## 4. HALLAZGOS PRIORIZADOS

### P0

**RESIL-01 — Chat sin timeout de LLM ni degradación rápida: el peor modo de falla multiplica 3×3.**
Evidencia: `handleChatRequest.ts:679-877` (streamText sin `abortSignal` ni `maxRetries`), default SDK = 2 retries sin límite temporal; widget reintenta 5xx/red 3× (`chatRetryPolicy.ts:24-27`, `useChatbot.ts:230-304`). Vertex degradado (colas, 429 largos, cuelgue TCP) → cada request server hace hasta 3 intentos sin tope de tiempo → deadline completo consumido → 500/timeout → el widget lo clasifica transitorio y repite ×3. Usuario: minutos de "Pensando" antes del `connection_failed`. Costo: hasta 9 llamadas Vertex/turno. Severidad: FATAL en la superficie de adquisición.

**RESIL-02 — Trabajo post-respuesta fire-and-forget en serverless: el outbox del CRM está a medio construir.**
Evidencia: `captureLead.ts:471` (`void notifyClient()`) y `captureLead.ts:478` (`void syncLeadToCrm(...)`), con retries de hasta ~33s (`postToN8n.ts:7-9`); no hay `after()`/`waitUntil` en todo `src/` (grep = 0). Cuando el stream cierra y la lambda se congela, el POST a n8n, el email al cliente y el Telegram mueren a mitad. El rastro queda: `CrmSyncAttempt` PENDING huérfano (creado en `syncLeadToCrm.ts:78` antes del POST) — pero **nada lo recupera**: el único retry es manual desde la UI (`syncLeadToCrm.ts:20-22`) y ningún cron barre PENDING/FAILED (§2.E). El lead nunca se pierde (DB-primero ✓) pero el CRM del cliente queda desincronizado en silencio.

**RESIL-03 — El disparador de los crons no existe en el repo (o apunta a funciones inexistentes).**
Evidencia: `netlify.toml:25-29` agenda `generate-insights-cron` / `send-weekly-reports-cron` sin archivo de función correspondiente (no hay dir `netlify/functions`); los 7 crons reales son rutas Next con `CRON_SECRET` (`src/app/api/cron/*`) que requieren un cron externo (`docs/operations/cron-jobs.md` §Alternativa). Si el cron externo no está (o se cayó), fallan TODOS los flujos invisibles: insights, reports semanales/ejecutivos, alertas de inactividad, detección de bots rotos, follow-up del setter. Nadie se entera: no hay monitoreo de "último run".

### P1

**RESIL-04 — Crons batch con `maxDuration=300` no honrado + loop secuencial con Gemini.**
Evidencia: `cron/regenerate-briefs/route.ts:5,38-43`, `cron/send-executive-reports/route.ts:5`, `cron/generate-insights/route.ts:36-91`. Con cartera creciente el batch muere a ~30s reales con 502. Mitigación existente: progreso per-org persiste; reports idempotentes por `(org, periodKey)` (`send.ts:66-70`). Falta batching con cursor/límite temporal para que el corte sea limpio y reanudable.

**RESIL-05 — Brevo sin timeout bloquea el login por magic link.**
Evidencia: `auth.ts:101-120` await-ea `sendTransactionalEmail` (brevo-service sin AbortSignal — grep = 0; `brevo.ts` ídem). Brevo colgado = signIn colgado hasta el deadline de la función. Resto de usos (notis de leads, reports) cuelgan lambdas pero no rompen flujo visible.

**RESIL-06 — Widget: un fallo transitorio de `/config` hace desaparecer el bot toda la page-view.**
Evidencia: `configCache.ts:15-26` cachea la promise resuelta a `null` sin retry ni expiración; `LogicCompanion.tsx:94` (`if (isLoading || !config) return null`). Un 500 de cold-start (Neon dormida) en el primer fetch = cero launcher para ese visitante. Es exactamente la ventana que INFRA.2 cubrió para `/chat` pero quedó abierta para `/config`.

**RESIL-07 — Neon cold-start fuera del chat: sin `connect_timeout` configurado ni retry en portal/auth/contact.**
Evidencia: `prisma.ts:5-6` sin params; `DATABASE_URL` solo con `sslmode`; `contact.ts:24` (`checkRateLimit` FUERA del try → throw de action crudo al form de la landing); `auth.ts:205-231` (query por request). Primer hit tras 5 min idle puede dar 500/login fallido sin reintento. El chat quedó cubierto (INFRA.2); el resto no.

**RESIL-08 — Telegram sin timeout.**
Evidencia: `telegram.ts:78-89` fetch sin señal (contrastar con el patrón correcto de `alerts.ts:136`). Un cuelgue retiene la lambda del cron `os-follow-up` o del notify de leads hasta el deadline.

### P2

**RESIL-09 — `getPlanForOrg` contradice su contrato "NUNCA throw".**
`get-plan-for-org.ts:68-125` sin try/catch pese al comentario de diseño (`get-plan-for-org.ts:9`, `fallback.ts:17-19`: "la constante existe aún cuando la DB esté caída"). Con Neon caída el fallback jamás aplica. Impacto menor (el chat necesita DB igual), pero el contrato roto confunde al próximo sprint.

**RESIL-10 — Integraciones de dashboard sin `AbortSignal.timeout`.**
Cal.com v1/v2, GBP, PageSpeed, Tiendanube (§1.E — grep AbortSignal: solo n8n/settings/alerts lo tienen). Todas tienen catch (degradan bien) pero un cuelgue TCP retiene el SSR de la página hasta el deadline → skeleton eterno/timeout de página.

**RESIL-11 — Retry de CRM sin jitter + contrato de dedup n8n no documentado.**
`postToN8n.ts:21` delays fijos 1s/3s (sincroniza reintentos concurrentes); hasta 3 POSTs pueden duplicar la entrada en el CRM si n8n procesó y la respuesta se perdió. La clave de dedup YA viaja (`buildLeadPayload.ts:85` `leadId`) — falta exigirla en el workflow receptor.

**RESIL-12 — `createBooking` de Cal.com sin idempotency key.**
`cal-com-v2.ts:108-148`. Hoy sin retry automático (riesgo latente si alguien agrega retry o el setter re-submitea en el borde del timeout — no hay timeout, ver RESIL-10).

**Candidato P1 (dead code, una línea):** `getN8nMetrics` + todo su bloque mock (`n8n.ts:37-355`) sin callers en `src/` — no desarrollar, limpiar en el refactor.

---

## 5. PROPUESTA DE SPRINTS O2.x (no ejecutar)

**O2.1 — LLM: time-box + degradación rápida + breaker (ataca RESIL-01, toca demo-chat/smoke de paso)**
- Capa: RETRY acotado + FALLBACK. Por qué: el budget (§3) demuestra que el retry ciego no cabe; el carril degradado ya existe (`degradedResponse`).
- `streamText` del chat: `abortSignal: AbortSignal.timeout(10_000)` por intento + `maxRetries: 1` (solo si elapsed < ~8s; los transitorios reales de Vertex son 429/503 pre-stream). Al agotar: NO 500 — devolver `degradedResponse('…te derivo por WhatsApp…', 'provider_error', bot)` reutilizando el shape que el widget ya parsea (`useChatbot.ts:246-281`; agregar la reason al union `DegradedReason`).
- CIRCUIT BREAKER mínimo in-memory por `(provider, model)`: tras N fallos consecutivos en la lambda, saltar directo al degradado por X segundos. Solo acá se justifica: reintentar en vano cuesta tokens/plata y multiplica 3×3 con el widget.

**O2.2 — n8n/outbox: completar la recuperación (ataca RESIL-02, RESIL-11)**
- Capa: OUTBOX + IDEMPOTENCIA. Por qué: la mitad persistente ya está (`CrmSyncAttempt`); falta el barrido.
- Cron nuevo `api/cron/resync-crm` (mismo patrón Bearer): re-postea attempts PENDING con `createdAt > 5 min` y FAILED transitorios, con cap de intentos totales por lead y jitter en los delays de `postToN8n.ts:21`.
- Acortar el retry in-flight del camino caliente (1 intento + timeout 10s) y delegar los reintentos al cron — así el fire-and-forget muere rápido o no importa que muera.
- Documentar/implementar dedup por `leadId` en el workflow n8n (decisión humana abajo).
- Evaluar `import { after } from 'next/server'` para el post-stream (verificar soporte del runtime Netlify antes de apostar).

**O2.3 — Neon: cold-start fuera del chat (ataca RESIL-07, RESIL-09)**
- Capa: RETRY (1 solo, transitorio) + config. Por qué: el modo de falla dominante es el resume de scale-to-zero (~segundos), un único reintento con backoff corto lo absorbe.
- `connect_timeout=10` en `DATABASE_URL` (solo env, sin código).
- `contact.ts`: mover `checkRateLimit` dentro del try con decisión explícita fail-open (form público con Zod + honeypot aguas abajo) o fail-closed (decisión humana).
- `getPlanForOrg`: try/catch → `PLAN_FALLBACK` con log, honrando su propio contrato.

**O2.4 — Degradación del widget + timeouts de notificaciones (ataca RESIL-06, RESIL-05, RESIL-08, RESIL-10)**
- `prefetchBotConfig`: no cachear `null` (borrar la entry en fallo) + 1 retry con backoff 2s — espejo chico de INFRA.2.
- `AbortSignal.timeout(8_000)` (patrón `alerts.ts:136`) en: `telegram.ts:78`, `brevo.ts` (todas), `brevo-service.ts`, `cal-com*.ts`, `google-business-profile.ts`, `pagespeed.ts`, `tiendanube.ts`.
- Magic link: si Brevo falla/expira el timeout, responder el flujo de signIn con mensaje honesto en vez de colgar.

**O2.5 — Crons: disparador verificable + batching (ataca RESIL-03, RESIL-04)**
- Decidir el disparador real (decisión humana): Netlify Scheduled Functions reales (crear los archivos que `netlify.toml:25-29` promete, como thin-fetch a las rutas con el secret) o cron externo documentado (cron-job.org, free tier) — y LIMPIAR la opción que no sea.
- Heartbeat barato: cada cron ya devuelve JSON de resultados; persistir "último run OK" (fila en AgencySettings o ChatbotEvent) y mostrar staleness en /admin — sin servicio nuevo.
- Batch con presupuesto: en regenerate-briefs / generate-insights, cortar el loop a ~20s de elapsed y devolver `partial: true` (el siguiente run retoma — la idempotencia per-org ya existe).

Prioridad: O2.1 y O2.2 primero (FATAL de adquisición + pérdida silenciosa de negocio), O2.5 tercero (todo lo invisible depende de él), O2.3/O2.4 después.

---

## INSUMOS PARA SPRINTS

### RESIL-01 (P0) → O2.1
- **Qué tocar:** `src/modules/chatbot/server/chat/handleChatRequest.ts` (bloque streamText 679-877), `src/modules/chatbot/hooks/useChatbot.ts` (union `DegradedReason`), `src/app/api/admin/chatbot/demo-chat/[slug]/route.ts` (mismo helper).
- **Cómo:** agregar a `streamText`: `abortSignal: AbortSignal.timeout(LLM_ATTEMPT_TIMEOUT_MS)` y `maxRetries: 1`; envolver el arranque del stream: si el primer error llega pre-primer-byte (`ttfbAt === null`) y elapsed < 8s → un único re-intento; sino `return degradedResponse(msg, 'provider_error', botCtx)`. Breaker: módulo `llm/breaker.ts` con Map `(provider:model) → { fails, openUntil }`, umbral 3 fallos / 60s abierto.
- **Criterio de aceptación:** con Vertex bloqueado (mock del provider que cuelga), el POST a /chat responde < 15s con JSON `mode:'degraded', reason:'provider_error'` y el widget muestra CTA WhatsApp con datos reales del bot; cero 500; test de invariante del breaker (3 fallos → salta directo sin llamar al provider).
- **Decisión humana:** ninguna (el patrón degradado ya está lockeado en la economía del producto).

### RESIL-02 (P0) → O2.2
- **Qué tocar:** nuevo `src/app/api/cron/resync-crm/route.ts`; `src/modules/chatbot/server/crm/postToN8n.ts` (jitter + modo 1-intento para el camino caliente); `syncLeadToCrm.ts` (aceptar `attemptCap`); `docs/operations/cron-jobs.md`.
- **Cómo:** cron cada 15 min: `crmSyncAttempt.findMany({ status: 'PENDING', createdAt: { lt: now-5min } })` + FAILED no-permanentes con `attemptNumber < CAP`, re-ejecutar el POST (attempt nuevo encadenado), marcar PENDING viejos como STALE si superan el cap. Camino caliente: `postToN8nWithRetry` con `MAX_ATTEMPTS=1` cuando `trigger==='auto'`.
- **Criterio de aceptación:** matar el proceso entre `crmSyncAttempt.create` y el POST (test de integración) → el cron siguiente lo re-postea y termina SUCCESS; un attempt FAILED 4xx nunca se re-postea; jitter verificable en unit test (delays dentro de rango).
- **Decisión humana:** confirmar que los workflows n8n de clientes dedupliquen por `payload.leadId` (o aceptar el riesgo de duplicado en CRM).

### RESIL-03 (P0) → O2.5
- **Qué tocar:** `netlify.toml:25-29`; opcionalmente crear `netlify/functions/*.mts` scheduled que hagan fetch a las rutas `/api/cron/*` con `Authorization: Bearer ${CRON_SECRET}`; panel admin (staleness).
- **Cómo:** (a) elegir disparador; (b) si Netlify: un archivo por schedule con `export const config = { schedule: '...' }` y fetch interno; (c) heartbeat: al final de cada cron route, upsert de `ChatbotEvent`/fila settings `cron.last_run.<name>`; badge en /admin/settings si > 2× el período.
- **Criterio de aceptación:** en deploy de prueba, los logs de Netlify muestran la ejecución programada; `netlify.toml` no referencia funciones inexistentes; /admin muestra "último run" por cron.
- **Decisión humana:** **cuál disparador** (Scheduled Functions del plan de Netlify vs cron externo free) y confirmar el timeout real del plan de Franco (define además el techo de O2.1/O2.4).

### RESIL-04 (P1) → O2.5
- **Qué tocar:** `cron/regenerate-briefs/route.ts`, `cron/generate-insights/route.ts`, `cron/send-executive-reports` (vía `send.ts`).
- **Cómo:** presupuesto temporal en el loop (`if (Date.now()-start > 20_000) { partial = true; break }`) + respuesta `{ partial, processed }`; opcional `?cursor=` por orgId. NO tocar la idempotencia existente (ya correcta).
- **Criterio de aceptación:** con 20 orgs simuladas y LLM mockeado a 3s, el cron responde < 25s con `partial:true` y la corrida siguiente completa el resto sin re-enviar reports (WeeklyReportLog lo prueba).
- **Decisión humana:** no.

### RESIL-05 (P1) → O2.4
- **Qué tocar:** `src/lib/email/brevo-service.ts`, `src/lib/integrations/brevo.ts` (todas las fetch), `src/auth.ts:101-120`.
- **Cómo:** `signal: AbortSignal.timeout(8_000)` en cada fetch; en `sendVerificationRequest`, catch → rethrow con mensaje corto para que Auth.js muestre error de envío en vez de colgar.
- **Criterio de aceptación:** con Brevo mockeado colgado, `signIn('resend')` responde < 10s con error visible; unit test del timeout.
- **Decisión humana:** no.

### RESIL-06 (P1) → O2.4
- **Qué tocar:** `src/modules/chatbot/shared/configCache.ts`.
- **Cómo:** en el `.catch`/resolución null, `cache.delete(slug)` antes de resolver (no memorizar fallos) + 1 reintento interno con backoff 2s (mismo criterio transitorio de `chatRetryPolicy`: red/5xx sí, 4xx no).
- **Criterio de aceptación:** test unit del cache: primer fetch falla → segunda llamada a `prefetchBotConfig` dispara fetch nuevo (hoy devuelve el null cacheado); manual: bloquear /config 1 vez → el launcher aparece igual tras el retry.
- **Decisión humana:** no.

### RESIL-07 (P1) → O2.3
- **Qué tocar:** env `DATABASE_URL` (Netlify + `.env.example` con placeholder), `src/lib/actions/contact.ts:23-33`, `src/lib/plan/get-plan-for-org.ts` (RESIL-09 de paso).
- **Cómo:** `connect_timeout=10` en la connection string; `checkRateLimit` dentro de try/catch con política elegida; `getPlanForOrg` catch → `PLAN_FALLBACK` + `logger.error`.
- **Criterio de aceptación:** matar la conectividad a Neon en test de integración → `contactFormAction` devuelve `{ success:false, error }` amable (no throw); unit test de `getPlanForOrg` con prisma mock que lanza → devuelve fallback.
- **Decisión humana:** rate-limit del form con DB caída: **fail-open o fail-closed** (recomendado: fail-open — el form ya tiene Zod y el spam sin DB tampoco persiste).

### RESIL-08 (P1) → O2.4
- **Qué tocar:** `src/lib/notifications/telegram.ts:78-89`.
- **Cómo:** `signal: AbortSignal.timeout(8_000)` (patrón `alerts.ts:136`); el catch existente ya lo absorbe.
- **Criterio de aceptación:** unit test: fetch colgado → `sendTelegram` devuelve false en < 9s.
- **Decisión humana:** no.

---

## FILAS PARA LA TABLA-PROGRAMA

| sprint propuesto | lente | prioridad | tamaño S/M/L | re-check post-P1 sí/no |
|---|---|---|---|---|
| O2.1 LLM: time-box + degradar rápido + breaker (RESIL-01) | RESILIENCIA | P0 | M | sí |
| O2.2 n8n/outbox: cron resync CrmSyncAttempt + jitter + dedup leadId (RESIL-02, RESIL-11) | RESILIENCIA | P0 | M | sí |
| O2.5 crons: disparador verificable + heartbeat + batching (RESIL-03, RESIL-04) | RESILIENCIA | P0/P1 | M | sí |
| O2.3 Neon: connect_timeout + contact form + contrato getPlanForOrg (RESIL-07, RESIL-09) | RESILIENCIA | P1 | S | sí |
| O2.4 degradación widget /config + timeouts Brevo/Telegram/integraciones (RESIL-05, RESIL-06, RESIL-08, RESIL-10) | RESILIENCIA | P1 | S/M | sí |
| Limpieza dead code getN8nMetrics/mock (candidato) | RESILIENCIA | P1 (refactor) | S | no |
| Idempotency key en createBooking Cal.com (RESIL-12) | RESILIENCIA | P2 | S | no |


---

# LENTE OBSERVABILIDAD — auditado sobre 6254428 (2026-07-10)

Worktree: `C:/Users/franc/Desktop/wt-auditoria-maestra` (rama chore/auditoria-maestra = origin/main @ 6254428). Rutas relativas a `logic-core-v3/`. Auditoría 100% estática (read-only); nada instrumentado.

**Corrección al framing del encargo:** el sistema NO es completamente ciego. El repo ya tiene: Sentry cableado end-to-end (server+edge+client, PII scrubbing, error boundaries), logging JSON estructurado del chatbot, eventos persistidos en DB con latencia/tokens/costo, un detector de alertas con 9 tipos que despacha email+Telegram, y backup diario con restore-test. Lo que falta es distinto: **verificar que Sentry esté vivo en prod, uptime externo, dead-man's-switch de crons, y cerrar 3 huecos de la telemetría LLM.**

---

## 1. ESTADO ACTUAL (inventario con evidencia)

### 1.1 console.* sueltos por zona

Comando: `grep -rn "console\.\(log\|error\|warn\|info\|debug\)" <zona> | wc -l` (desde `logic-core-v3/`).

| Zona | Total | Neto runtime (sin tests/invariants) |
|---|---|---|
| `src/actions` (server actions globales) | 5 | 5 |
| `src/app/**/_actions` (server actions por ruta) | 6 | 6 |
| `src/app/api` (API routes) | 11 | 11 |
| `src/app` resto (pages/layouts) | 12 | 12 |
| `src/components` | 7 | 7 |
| `src/lib` | 127 | ~91 (36 en `*.invariant.ts`/tests) |
| `src/modules` (chatbot) | 110 | ~32 (78 en `__tests__`/evals/seed) |
| `src/context`, `src/hooks` | 0 | 0 |
| **Total src** | **278** | **~164** |

Por método (`grep -rno "console.error" src | wc -l` etc.): error=156, log=93, warn=27. Matiz importante: en el chatbot la mayoría de los `console.*` runtime son EL logger estructurado (emite JSON por console a propósito — `server/logging/logger.ts:26-29`). El problema real está en el portal (actions/api/lib fuera del chatbot): logging crudo sin niveles, sin contexto estructurado, sin correlación.

### 1.2 Loggers existentes (el germen es más que un germen)

`src/modules/chatbot/server/logging/` (INFRA.1, commit d19da8a):
- `logger.ts:15-30` — `chatbotLog(event, fields, level)`: JSON estructurado a stdout/stderr → Netlify Logs; contrato "Never log PII" documentado en `logger.ts:7-8`.
- `logger.ts:38-51` — `chatbotDebug`: silente en prod.
- `logger.ts:59-88` — `chatbotError`: console + `Sentry.captureException` con tags `{module:'chatbot', event_type}`.
- `logger.ts:98-136` — `extractDbErrorInfo`: extrae `.code` Prisma (P1017/P2024/P1001) y `.cause` de undici — diagnóstico accionable.
- `logger.ts:146-160` — `logPersistFailure`: **sink off-Neon garantizado** — una línea JSON a stderr que NO depende de Prisma ni Sentry, nunca lanza. Usado en `handleChatRequest.ts:712-716` (error mid-stream) y `:854-859` (falla de persistencia).
- `persistentLogger.ts:23-65` — `logChatbotEvent`: console + persiste en tabla `chatbot_events` (dashboard admin); si la DB falla, degrada a console-only (`:54-64`).
- `persistentLogger.ts:71-77` — `cleanupOldEvents(30 días)`: **cero callers en src/scripts** (`grep -rn "cleanupOldEvents" src scripts` solo da la definición y el re-export) → la tabla crece sin límite. Ver OBS-06.

### 1.3 Sentry — instalado y cableado, vida en prod NO verificable

- `package.json:93` — `@sentry/nextjs ^10.53.1`; `next.config.ts:208-216` — `withSentryConfig(nextConfig, { org: "develop-agency", project: "logic-core-v3", tunnelRoute: "/monitoring" })`.
- `src/instrumentation.ts:4-43` — init nodejs + edge, `tracesSampleRate` 0.1 en prod, filtro de errores esperados de quota LLM (`:14-17`), y `onRequestError = Sentry.captureRequestError` (`:49`) para route handlers/server actions/middleware.
- `src/instrumentation-client.ts:4-19` — init client, replays solo on-error (1.0 / 0.0).
- `src/lib/sentry/scrub-pii.ts:17-60+` — scrubbing OBLIGATORIO en todos los `beforeSend`: denylist de keys (password/token/email/phone/dni/cuit) + regex (email/JWT/CC/teléfono). Alineado a Ley 25.326.
- `src/app/global-error.tsx:22-28` y `src/app/error.tsx:24-27` — boundaries raíz capturan a Sentry con tags.
- **Compatibilidad Next 16 + webpack: probada empíricamente en este repo** — el build de prod corrió con `--webpack` y completó (tabla de rutas en `scratchpad/build.log`; `/api/test-sentry` listada en build.log:98). No es una duda teórica.
- **PERO:** `NEXT_PUBLIC_SENTRY_DSN` está vacío en `.env.example:266` y **ausente en `.env`/`.env.local` del worktree** (`grep -c "NEXT_PUBLIC_SENTRY_DSN" .env .env.local` → 0 y 0; solo nombres verificados, no valores). El propio código lo marca: `handleChatRequest.ts:869` — "no-op sin NEXT_PUBLIC_SENTRY_DSN → [FALTA:sentry-dsn]". Sin DSN, TODO el pipeline (server, edge, client, boundaries, scrubbing) es no-op. El env de Netlify prod no es verificable desde el repo → **decisión/verificación humana**.
- `src/app/api/test-sentry/route.ts:3-5` — ruta de smoke que lanza un error; pública y sin auth (ver OBS-09).

### 1.4 Manejo de errores en API routes

Patrón dominante: try/catch → `console.error` + 500 genérico sin filtrar detalles al cliente. Ej.: `src/app/api/track/route.ts:42-45`, `src/app/api/cron/os-follow-up/route.ts:296-299`, `src/app/api/cron/alerts/route.ts:15-18`. Los errores no catcheados los captura `onRequestError` (instrumentation.ts:49) — si hay DSN. El error mid-stream del chat (que `toUIMessageStreamResponse()` enmascara como 200) tiene handler explícito: `handleChatRequest.ts:708-721`.

### 1.5 Error boundaries (inventario)

24 × `error.tsx`: raíz (`src/app/error.tsx`) + 15 admin + 5 dashboard + 3 setter (glob `src/**/error.tsx`), más `src/app/global-error.tsx` y `not-found.tsx`. Raíz y global reportan a Sentry; los de sección son UI de recuperación (los errores igual suben por `onRequestError`/client init cuando hay DSN).

### 1.6 Telemetría y alerting existentes

- **Timings por turno de chat**: `handleChatRequest.ts:722-727` — `llm_ttfb_ms` / `llm_stream_ms` / `llm_total_ms` / `step_count`; breakdown pre-LLM (plan/quota/conv) en `:318-344`. Persisten en `chatbot_events.metadata` (`:833-848`: tokensIn/Out, costUsd, durationMs, latencyMs, timings).
- **Latencia P50/P95 horaria**: `server/admin/getLatencyHistory.ts:59-86` — desde eventos reales.
- **Detector de alertas**: `server/admin/detectBotIssues.ts` — 9 tipos documentados en `docs/operations/alerts-types.md:10-20` (LLM_PROVIDER_ERROR, QUOTA_EXHAUSTED, LATENCY_DEGRADED P95>10s, CRON_INSIGHTS_FAILED, ACTIVITY_ERRORS_SPIKE, LEAD_CAPTURE_FAILURE...), dedup 24h (`detectBotIssues.ts:245-255`), persiste `BotAlert` (schema:1604-1629) y despacha: email Brevo a `DEVELOP_ALERTS_EMAIL` (`:268,303-304`) + Telegram si CRITICAL/HIGH (`:277-283`). Routing documentado: `alerts-types.md:22-32`.
- **Telegram**: sender único `src/lib/notifications/telegram.ts:67-99` — config-first (AgencySettings editable en `/admin/settings`) con fallback env `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`; nunca lanza.
- **Alertas de agencia**: `src/lib/alerts.ts:4-36` — 6 tipos (TICKET_URGENT, LEAD_UPSELL, CLIENT_INACTIVE...) vía webhook configurable `agency_settings.alertWebhookUrl` (schema:811).
- **Upsell/degradado**: `server/quota/upsellAlert.ts:1-25` — 1 alerta por (bot, mes) vía `degradedAt`, webhook + Telegram.
- **Analytics de portal**: modelo `PageView` + `POST /api/track` (`route.ts:33-39`). Sin analytics de terceros (grep gtag/plausible/posthog/umami → 0).
- **n8n CRM sync**: `CrmSyncAttempt.durationMs` (`server/admin/integrations/getCrmSyncHistory.ts:17`).

---

## 2. QUÉ OBSERVAR — las 4 capas contra el código real

### 2.a ERRORES de app

**Server**: API routes + server actions + RSC ya cubiertos por `onRequestError` (instrumentation.ts:49) y proxy (`src/proxy.ts` corre bajo el init edge). **Client**: boundaries + instrumentation-client. Todo condicional a DSN (OBS-01).

**Severidades propuestas** (mapear a `level` de Sentry): FATAL = global-error / persist_failure con quota reservada; ERROR = excepción en route/action/stream; WARNING = validation_warnings, telegram send failed, quota near-limit; INFO = eventos de negocio (quedan en `chatbot_events`, no van a Sentry).

**Contexto a adjuntar**: hoy los capture calls llevan tags `module/event_type` (logger.ts:78-87) y `conversationId` solo como `extra` en el stream error (`handleChatRequest.ts:717-720`). **No existe ningún id de correlación request-scoped**: `grep -rn "correlationId\|requestId\|traceId" src` → 0 hits. La correlación natural del chatbot ya existe como datos — `Conversation.id` + `Conversation.sessionId @unique` (schema:1358) — pero no viaja como **tag** consistente (tags son buscables; extras no). Diseño: un `requestId` (crypto.randomUUID) por request de chat, propagado a `chatbotLog`, `logChatbotEvent.metadata` y `Sentry.setTags({ conversationId, botSlug, requestId })` → un error en Sentry se ata en un paso a la conversación en `/admin` y a la línea de Netlify Logs.

### 2.b DISPONIBILIDAD

**Inventario real de crons (evidencia):**

| Job | Definición | Schedule | Quién lo dispara hoy |
|---|---|---|---|
| alerts agencia | `src/app/api/cron/alerts/route.ts` (X-Cron-Secret) | no versionado | **desconocido — externo** |
| detect-bot-issues | `src/app/api/cron/detect-bot-issues/route.ts` | */15 según `alerts-types.md:5` | **desconocido — externo** |
| generate-insights | `src/app/api/cron/generate-insights/route.ts` (POST Bearer) | — | **desconocido — externo** |
| os-follow-up (digest Telegram) | `src/app/api/cron/os-follow-up/route.ts:153-300` (idempotencia por marker `Notification`) | 9am ART implícito | **desconocido — externo** |
| regenerate-briefs / send-executive-reports / send-weekly-reports | rutas homónimas en `src/app/api/cron/` | — | **desconocido — externo** |
| db-backup | `../.github/workflows/db-backup.yml:38-41` | 0 6 UTC diario + restore-test | GitHub Actions (notifica solo por email de GH al fallar) |
| **fantasmas** | `netlify.toml:25-29` agenda `generate-insights-cron` (0 9 * * *) y `send-weekly-reports-cron` (0 12 * * MON) | — | **las funciones NO existen en el repo** (`grep -rn "generate-insights-cron"` → solo netlify.toml; no hay dir `netlify/functions/`) → config muerta o divergencia repo/Netlify |

**El hueco estructural**: `CRON_INSIGHTS_FAILED` (alerts-types.md:16) solo se detecta si el cron detector corre — que también depende del mismo scheduler externo. **Si el scheduler muere, muere toda la detección con él (fallo circular): follow-ups de 9am, reportes semanales y alertas desaparecen en silencio.** Además `db-backup.yml:4-6` documenta que `logic-core-v3/.github/workflows/e2e.yml` está mal ubicado y nunca corrió (candidato P1 — lente CI).

**Uptime**: cero monitoreo externo en el repo. Probes ya listos para usar: `GET /api/version` (`route.ts:3-9`), `GET /api/chatbot/[slug]/health` que devuelve 200/503 real (`route.ts:12-21`), landing `/`, `/login`, config del widget `/api/chatbot/[slug]/config`.

### 2.c LLM (Gemini vía Vertex, AI SDK)

Proveedor: `@ai-sdk/google-vertex` (`server/llm/providers/google.ts:1`), 3 modelos con pricing hardcodeado (`google.ts:10-41`) y `estimateCost` (`:93-100`). Hay también provider Anthropic (`providers/anthropic.ts`) — multi-proveedor.

**Ya se persiste hoy (por conversación = sesión multi-turno):**
- Por turno: `ChatMessage.tokensIn/tokensOut/toolCalls` (schema:1410-1412; write `handleChatRequest.ts:779-790`), agregación multi-step correcta (`:734-741`).
- Por conversación: `Conversation.messageCount/tokensIn/tokensOut/estimatedCostUsd` (schema:1379-1382; update `:793-802`) + `sessionId` único (1358) = agrupación por sesión YA resuelta.
- Por bot/mes: `QuotaUsage.tokensIn/tokensOut/costUsd/conversationsCount` (schema:1556-1580; `incrementQuota` `:809-816`).
- Latencia + éxito/error: timings en evento `chat.message_completed` (:833-848); errores como eventos `error.*` + `logPersistFailure`.

**Lo que NO se persiste (huecos):**
1. **Modelo/proveedor por turno**: solo existe `BotConfig.llmModel` (schema:1296) que es mutable → si Franco cambia el modelo a mitad de mes, el costo histórico queda inauditables. Falta snapshot `llmModel`/`llmProvider` en `ChatMessage`.
2. **`Conversation.endedAt` nunca se escribe**: `grep -rn "endedAt" src` solo lo escribe project.actions.ts (otro modelo) → duración de conversación solo derivable de `lastMessageAt - startedAt`.
3. **Consumidores LLM fuera del contador**: `src/lib/ai/executive-brief.ts` y `server/insights/generateInsights.ts` llaman a Gemini sin capturar usage/costo (`grep -n "usage\|tokens\|cost"` → 0 hits de captura en ambos) → el gasto real de Vertex > lo que suman las tablas.
4. **Sin OTel**: `grep otel|opentelemetry|experimental_telemetry` en package.json y handleChatRequest → 0. (Es el enchufe futuro para Langfuse vía AI SDK.)

### 2.d NEGOCIO (funnel)

**Ya existen como datos Prisma:** conversación iniciada = row `Conversation` + `startedAt` (schema:1374) y evento `chat.*` (schema:1585); lead capturado = `ChatbotLead.capturedAt` (1495) + `Conversation.leadCaptured` (1385) + evento `chat.lead_captured`; demo pedida = `ChatbotLead.intent` incluye DEMO (1433-1437); scoring hot/warm/cold (1475-1477); atribución UTM first-touch (1367-1369, 1464-1466); funnel del OS/setter = `LeadStatus` PROSPECTO→DEMO_ENVIADA→…→CERRADO (os-follow-up route.ts:92-109); portal = `PageView`.

**Habría que emitir (no existen):** widget_opened (client-side, pre-primer-mensaje — hoy el funnel arranca recién en el primer mensaje); handoff a WhatsApp ejecutado (existe `whatsappNumber` en config, schema:1291, pero ningún evento cuando el visitante lo usa); conversación abandonada (sin `endedAt` no hay señal de cierre).

---

## 3. HERRAMIENTAS (recomendación; Franco decide)

**App errors: quedarse con Sentry (ya está pago en esfuerzo).** El SDK ^10.53.1 + Next 16 + webpack ya compila y buildea en ESTE repo (build.log) — riesgo de compatibilidad: ninguno demostrado. Free tier (Developer): 1 usuario, ~5k errores/mes, cron monitors y uptime monitors incluidos en cantidad limitada — suficiente para arrancar; el límite de 1 usuario se tolera con cuenta compartida de agencia. Alternativa con objeción de costo/datos: **GlitchTip** (OSS, API compatible Sentry — el mismo SDK apunta a otro DSN), pero es un servicio más que mantener; no lo recomiendo hoy.

**LLM: NO adoptar plataforma externa todavía.** El repo ya construyó en Prisma ~70% de lo que Langfuse daría para el caso de uso actual (costo automático con pricing propio google.ts:10-41, agrupación por sesión schema:1358, latencia por turno, eventos de error) con residencia de datos donde ya vive todo (Neon). Con pocos bots en producción, el valor marginal de Langfuse (debugging visual de prompts, evals) no paga hoy su costo operativo. Cerrar primero los 3 huecos de 2.c.

Cuando el debugging de prompts se vuelva frecuente o haya >5-10 bots:
- **Langfuse cloud free tier (región EU)** + `mask` del SDK para redactar PII antes del envío = punto de entrada recomendado. Trade-off honesto: PII de leads (las conversaciones llevan nombre/email/teléfono — capture_lead) iría a un tercero más; el masking en SDK lo mitiga pero reduce el valor de debugging. Nota de realismo sobre Ley 25.326: la residencia "pura" ya no existe — los mismos datos ya viven en Neon (cloud), Brevo y Telegram; la decisión es de grado, no binaria.
- **Langfuse self-hosted** (OSS MIT, Docker) = control total de residencia, pero el stack v3 real es web + worker + Postgres + ClickHouse + Redis + S3/MinIO: para una agencia de 2 personas es un sistema distribuido más que se rompe de noche y nadie monitorea (¿quién observa al observador?). Solo si un cliente lo exige contractualmente.
- **Helicone: descartado con argumento.** Es un proxy/gateway en el hot path del chat: (1) TODO el contenido PII pasa por un tercero sin opción de masking previo — peor postura Ley 25.326 que ambas opciones Langfuse; (2) acopla la disponibilidad del chatbot a la del proxy y suma latencia a un flujo que ya se mide TTFB (handleChatRequest.ts:724); (3) el stack usa `@ai-sdk/google-vertex` con service account (google.ts:47-63), no una URL swappeable trivial.

**Uptime/crons (gratis, cero mantenimiento):** UptimeRobot free (50 monitores, 5 min) o los uptime monitors del propio Sentry para las rutas de 2.b; **Healthchecks.io free (20 checks, integración Telegram nativa)** como dead-man's-switch de crons — un `fetch(ping_url)` de una línea al final de cada corrida exitosa; si el ping no llega en el período esperado, alerta a Telegram. Esto rompe el fallo circular sin agregar infra propia.

---

## 4. ALERTAS (set mínimo, con destino)

Destinos ya operativos en el código: **Telegram** (`src/lib/notifications/telegram.ts:67` — config-first, editable en /admin/settings) y **email Brevo → `DEVELOP_ALERTS_EMAIL`** (`detectBotIssues.ts:303-304`; env en `.env.example:155`). n8n ya está en el stack (CRM sync) y sirve de puente webhook→Telegram para herramientas externas.

| Alerta | Fuente | Destino | Estado |
|---|---|---|---|
| Error rate spike (app) | Sentry alert rule (umbral: >N errores nuevos/hora) | email; opcional webhook→n8n→`sendTelegram` | falta DSN + regla |
| Cron no corrió (cualquiera de los 7 + backup) | Healthchecks.io (ping al final de corrida exitosa) | **Telegram nativo** + email | no existe — P0 |
| Uptime caído (landing, /login, /api/version, health del bot) | UptimeRobot / Sentry uptime | email + webhook→Telegram | no existe — P0 |
| Umbral de gasto tokens (global mensual) | check nuevo en detect-bot-issues: `SUM(QuotaUsage.costUsd)` del mes > USD X | reusa `persistAndNotifyIssues` (email+Telegram ya resuelto) | no existe — P1 (enganche economía) |
| Quota bot 80% | `QuotaUsage.alert80Sent` (schema:1570-1571) — **campo muerto, 0 referencias en src** | email | diseñado, jamás implementado — P1 |
| Errores LLM / latencia P95 / captura de leads | detectBotIssues (ya implementado, 9 tipos) | email+Telegram según severity (alerts-types.md:22-32) | vivo, condicional al scheduler |

---

## 5. ESQUEMA DE COSTO POR CONVERSACIÓN (para O3.2 / O3.3)

**No crear tabla nueva de conversación: extender lo que existe.**

O3.2 — por conversación (tabla `chatbot_conversation`, schema:1351-1398):
- Ya están: `tokensIn`, `tokensOut`, `estimatedCostUsd` (Decimal 10,6), `messageCount` (turnos = /2), `startedAt`, `lastMessageAt`, `sessionId`.
- Agregar: `ChatMessage.llmModel String?` + `llmProvider String?` (snapshot por turno — escrito en `handleChatRequest.ts:779-790` donde ya se conoce `resolvedBot.llmModel`); empezar a escribir `Conversation.endedAt` (job de cierre por inactividad >30min, o derivarlo en queries de `lastMessageAt`); duración = `endedAt - startedAt`.
- Errores por conversación: derivable de `chatbot_events` (`level=ERROR, conversationId`) con el índice existente (schema:1595-1600) — no duplicar.
- Costo de consumidores no-chat (briefs, insights): tabla mínima nueva `AgencyLlmUsage { id, source ('executive_brief'|'insights'), organizationId?, model, tokensIn, tokensOut, costUsd, createdAt }` — reusa `estimateCost` del provider.

O3.3 — costo/cliente y margen vs pricing (USD 300+):
- Join ya posible sin migración: `QuotaUsage (botConfigId, year, month, costUsd, tokensIn/Out, conversationsCount)` (unique schema:1577) → `BotConfig.organizationId` (@unique) → `Organization` → plan vigente → **`Plan.monthlyPrice` (schema:595-599)**.
- Entregable: server action `getClientCostReport(year, month)` → filas `{ cliente, plan, monthlyPrice, costUsdLlm, costoBriefsInsights, margenBruto, margen% }`. Cero infra nueva; una pantalla en /admin.

---

## HALLAZGOS PRIORIZADOS

### P0

**OBS-01 — Sentry completo pero sin evidencia de vida en prod (posible no-op total).** Todo el pipeline (init server/edge/client, scrub-pii, boundaries, onRequestError) está cableado, pero `NEXT_PUBLIC_SENTRY_DSN` está vacío en `.env.example:266`, ausente en `.env`/`.env.local` del worktree (grep de nombres = 0), y el código lo marca (`handleChatRequest.ts:869` "[FALTA:sentry-dsn]"). Si el DSN tampoco está en Netlify, el sistema ES ciego a errores pese a tener todo montado. Severidad: P0 (una var de entorno separa "ciego" de "observado").

**OBS-02 — Crons sin dead-man's-switch + scheduling fantasma.** `netlify.toml:25-29` agenda dos funciones que no existen en el repo (grep sin hits fuera del toml; no hay `netlify/functions/`); las 7 rutas `/api/cron/*` dependen de un scheduler externo no versionado ni documentado (docs/operations/cron-jobs.md:27 sugiere cron-job.org); la única alerta de cron fallado (`CRON_INSIGHTS_FAILED`, alerts-types.md:16) depende del propio cron detector → **fallo circular: si el scheduler muere, follow-up 9am, reportes y alertas desaparecen en silencio**. db-backup (GH Actions) solo notifica por email de GitHub.

**OBS-03 — Cero monitoreo de uptime.** Ningún monitor externo en repo/docs; un outage de landing, widget o login se descubre cuando avisa el cliente. Los probes ya existen (`/api/version` route.ts:3-9; `/api/chatbot/[slug]/health` con 200/503 route.ts:12-21).

### P1

**OBS-04 — Sin correlationId; conversationId no viaja como tag.** `grep "correlationId|requestId|traceId" src` → 0. Sentry recibe `conversationId` solo como `extra` en un callsite (`handleChatRequest.ts:717-720`); no es buscable ni consistente. Netlify Logs ↔ Sentry ↔ chatbot_events no se pueden atar hoy.

**OBS-05 — Costo LLM subestimado + sin umbral de gasto.** `executive-brief.ts` y `generateInsights.ts` llaman a Gemini sin registrar usage (grep = 0); no existe alerta de gasto global mensual; `QuotaUsage.alert80Sent` (schema:1570-1571) es un campo muerto con 0 referencias en src.

**OBS-06 — Telemetría de conversación incompleta + retención sin control.** Sin snapshot de modelo por turno (BotConfig.llmModel mutable, schema:1296); `Conversation.endedAt` nunca escrito; `cleanupOldEvents` (persistentLogger.ts:71) sin ningún caller → `chatbot_events` crece sin límite (costo Neon + superficie PII innecesaria a largo plazo).

**OBS-07 — Logging del portal crudo.** ~130 `console.*` runtime fuera del chatbot (actions/api/lib) sin estructura, niveles ni contexto; en Netlify Logs free la retención es corta (verificar plan) → los errores del portal solo vivirán en Sentry (condicional a OBS-01).

**OBS-08 — Decisión de plataforma LLM pendiente (diseño en §3).** Recomendación: diferir Langfuse; si se adopta, cloud EU + masking; self-host solo por exigencia contractual; Helicone descartado por PII en proxy.

### P2

**OBS-09 — `/api/test-sentry` pública en prod** (build.log:98 la lista como ruta dinámica; route.ts:3-5 sin auth) → cualquiera puede quemar quota de Sentry y generar ruido. Gatearlo por env o header.
**OBS-10 — `logic-core-v3/.github/workflows/e2e.yml` mal ubicado, nunca corrió** (evidencia: db-backup.yml:4-6). Candidato P1 del lente CI — solo se registra acá.

---

## INSUMOS PARA SPRINTS

**OBS-01 (P0) — "Sentry vivo"**
- Tocar: env de Netlify prod (fuera del repo) + smoke.
- Cómo: (1) Franco verifica en Netlify UI si `NEXT_PUBLIC_SENTRY_DSN` está seteado; si no, crear proyecto Sentry free (org develop-agency ya nombrada en next.config.ts:211) y setear DSN + `SENTRY_AUTH_TOKEN`/`SENTRY_ORG`/`SENTRY_PROJECT` (para sourcemaps, .env.example:281-287); (2) redeploy; (3) `curl https://<prod>/api/test-sentry` y verificar el evento en el dashboard con PII scrubbing activo; (4) crear 1 alert rule (email) para "nuevo issue de nivel error".
- Aceptación: evento del smoke visible en Sentry con tag environment=production y sin PII; alert rule enviando email.
- Decisión humana: SÍ — confirmar estado del env en Netlify (no verificable desde el repo).

**OBS-02 (P0) — "Dead-man's-switch de crons + limpiar fantasmas"**
- Tocar: `netlify.toml` (borrar bloques :25-29 o crear las funciones reales — decidir), las 7 rutas `/api/cron/*/route.ts`, cuenta Healthchecks.io.
- Cómo: crear 8 checks en Healthchecks.io (7 rutas + db-backup) con schedule esperado; en cada route handler, tras la corrida exitosa, `fetch(process.env.HC_PING_URL_<JOB>).catch(()=>{})` (best-effort, 1 línea; mismo patrón nunca-lanza de telegram.ts:17); en db-backup.yml, step final `curl $HC_PING_URL`. Conectar integración Telegram de Healthchecks al chat existente.
- Aceptación: apagar un cron a mano → alerta Telegram en <2× el período esperado; `netlify.toml` sin schedules huérfanos; inventario escrito de QUÉ scheduler externo dispara cada ruta.
- Decisión humana: SÍ — (a) identificar el scheduler externo actual de prod; (b) elegir entre borrar los bloques fantasma o materializar Netlify Scheduled Functions.

**OBS-03 (P0) — "Uptime externo"**
- Tocar: nada de código (opcional: 1 slug canario para el health del bot).
- Cómo: UptimeRobot free (o Sentry uptime) con 5 monitores: `/`, `/login`, `/api/version`, `/api/chatbot/<slug-canario>/health` (valida keyword `"ok":true` — el endpoint devuelve 503 real si el bot está roto, route.ts:16), `/api/chatbot/<slug>/config`. Notificación email + webhook→n8n→`sendTelegram`.
- Aceptación: monitores verdes; prueba de fuego apuntando un monitor a una URL 404 → alerta llega a Telegram.
- Decisión humana: menor — qué bot usar como canario.

**OBS-04 (P1) — "Correlación mínima"**
- Tocar: `handleChatRequest.ts` (generar `requestId` al inicio, ya usa `randomUUID` en :671), `logger.ts`, callsites de `Sentry.captureException` del chatbot.
- Cómo: `Sentry.setTags({ conversationId, botSlug })` al resolver la conversación + incluir `requestId` en todo `chatbotLog`/`logChatbotEvent.metadata` del turno. No hace falta OTel para esto.
- Aceptación: dado un error en Sentry, buscar por tag `conversationId` encuentra el issue, y ese id localiza la conversación en /admin y las líneas JSON en Netlify Logs.

**OBS-05 (P1) — "Costo completo + umbral de gasto"**
- Tocar: `src/lib/ai/executive-brief.ts`, `server/insights/generateInsights.ts`, `detectBotIssues.ts`, migración Prisma (tabla `AgencyLlmUsage` de §5), `incrementQuota`/`upsellAlert` (implementar alert80Sent o dropear el campo).
- Cómo: capturar `usage` del AI SDK en ambos consumidores → `AgencyLlmUsage` con costo vía `estimateCost` (google.ts:93); check nuevo en el detector: `SUM(QuotaUsage.costUsd) + SUM(AgencyLlmUsage.costUsd)` del mes > umbral → issue WARNING (2× umbral → CRITICAL); implementar la alerta 80% de quota usando el campo existente.
- Aceptación: invariante nuevo: todo callsite de streamText/generateText registra usage; alerta de umbral dispara en test con umbral artificial bajo; `alert80Sent` deja de tener 0 referencias (o desaparece del schema).
- Decisión humana: SÍ — el umbral USD mensual (enganche con la economía de planes).

**OBS-06 (P1) — "Cerrar la telemetría de conversación"**
- Tocar: migración (2 columnas en `chatbot_message`), `handleChatRequest.ts:779-790`, un caller para `cleanupOldEvents` (sumarlo al cron detect-bot-issues o al de alerts), definición de cierre de conversación.
- Cómo: `ChatMessage.llmModel/llmProvider` escritos por turno; `cleanupOldEvents(30)` invocado 1×/día desde un cron existente; `endedAt` = job diario que cierra conversaciones con `lastMessageAt < now()-30min` (o documentar que la duración se deriva y dropear el campo).
- Aceptación: query de costo por modelo del mes cuadra aun después de cambiar el modelo de un bot; `chatbot_events` no supera 30 días de historia; toda conversación inactiva >30min tiene `endedAt`.
- Decisión humana: menor — ventana de inactividad para el cierre (default 30min).

**OBS-07 (P1) — "Logger del portal"**
- Tocar: nuevo `src/lib/logging/log.ts` (copiar el patrón probado de chatbot logger.ts:15-30, sin dependencia al módulo chatbot), reemplazo incremental de los ~130 console.* runtime en actions/api/lib (empezar por api routes y server actions).
- Cómo: mismo contrato (JSON, event, level, nunca PII); `console.error` crudo queda prohibido por lint rule (`no-console` con allowlist en los loggers).
- Aceptación: `grep -rn "console\." src/actions src/app/api` → 0 fuera de los loggers; lint verde.

**OBS-08 (P1, decisión) —** ver §3. Decisión humana: SÍ — diferir vs adoptar Langfuse (y si adopta: cloud-EU-con-masking vs self-host). Sin código hasta decidir.

## FILAS PARA LA TABLA-PROGRAMA

| sprint propuesto | lente | prioridad | tamaño S/M/L | re-check post-P1 sí/no |
|---|---|---|---|---|
| O3.0 Sentry vivo en prod (DSN + smoke + 1 alert rule) | OBSERVABILIDAD | P0 | S | sí |
| O3.1 Uptime externo + dead-man's-switch de crons + limpiar netlify.toml fantasma | OBSERVABILIDAD | P0 | S | sí |
| O3.2 Telemetría LLM completa (modelo/turno, endedAt, consumers briefs/insights, cleanup eventos) | OBSERVABILIDAD | P1 | M | sí |
| O3.3 Rollup costo/cliente + margen vs Plan.monthlyPrice + umbral de gasto | OBSERVABILIDAD | P1 | M | no |
| O3.4 correlationId + tags Sentry consistentes en chatbot | OBSERVABILIDAD | P1 | S | no |
| O3.5 Logger estructurado del portal + lint no-console | OBSERVABILIDAD | P1 | M | no |
| O3.6 Gate de /api/test-sentry + decisión Langfuse documentada | OBSERVABILIDAD | P2 | S | no |

## LIMITACIONES DE LA CORRIDA

- Env de Netlify prod inaccesible: DSN de Sentry, CRON_SECRET, TELEGRAM_* y el scheduler externo real de los crons no verificables — solo nombres de vars en repo (`.env`/`.env.local` locales chequeados por nombre, nunca por valor).
- Sin mediciones runtime (prohibido next dev/e2e): latencias y tasas de error citadas son las que el propio código persiste, no medidas frescas.
- Retención exacta de Netlify Logs (free tier) y región/residencia de Neon no verificables offline.
- Cuotas vigentes de free tiers (Sentry/UptimeRobot/Healthchecks/Langfuse) citadas de conocimiento general — verificar al contratar.
- El worktree ya tenía `M logic-core-v3/.env.example` y `M package-lock.json` de la preparación del entorno (pre-existentes a este lente; este lente no modificó nada trackeado).


---

# LENTE CALIDAD-USUARIO — auditado sobre 6254428 (2026-07-10)

Worktree: `C:/Users/franc/Desktop/wt-auditoria-maestra/logic-core-v3` (rama chore/auditoria-maestra = origin/main @ 6254428). Server de prod: `.next` pre-buildeado, `npx next start -p 3112` con `QA_ALLOW_LOCALHOST=1`. Rutas relativas a `logic-core-v3/`. Dashboard auditado con cookie QA (persona client-a via `POST /api/qa/login`) — no hubo rebote de puerto porque la cookie autentica el request directo.

Recorte respetado: **cero hallazgos dependientes del diseño visual** — contraste calculado de tokens, no de píxeles; nada de pixel-perfection ni capturas de regresión.

---

## 1. ACCESIBILIDAD

### 1.a Lighthouse (solo accesibilidad, headless Chromium de Playwright)

JSONs en `scratchpad/a11y/*.json`.

| Ruta | Score | Audits fallidos |
|---|---|---|
| `/` (home) | 90 | button-name, aria-prohibited-attr, heading-order |
| `/web-development` | 90 | button-name, select-name |
| `/ai-implementations` | 90 | button-name, select-name |
| `/process-automation` | 89 | button-name, label |
| `/software-development` | 89 | button-name, select-name |
| `/contact` | 94 | button-name |
| `/login` | 95 | button-name, label-content-name-mismatch |
| `/dashboard` (client-a) | **100** | — |
| `/dashboard/soporte` (client-a) | 98 | heading-order, label-content-name-mismatch |

**Issues únicos deduplicados** (con nodo de evidencia extraído del JSON):

| Audit | Páginas | Nodo representativo | Fuente |
|---|---|---|---|
| `button-name` | 7/7 públicas | `<button class="fixed bottom-6 right-6 z-[9999]...">` (toggle móvil del menú, sin aria-label) + flechas/dots del carrusel | `src/components/layout/Navbar.tsx:257` · `src/components/sections/home/Portfolio.tsx:481,488,543,705` |
| `select-name` | 3 service pages | `<select required class="w-full...">` del form de contacto embebido (`#contacto-form`) | form compartido de las service pages (mismo patrón que `src/app/contact/page.tsx:190`) |
| `label` | process-automation | `<input type="range" min="5" max="200" ... class="...opacity-0">` (sliders de la calculadora) ×3 | `src/components/automation/CalculadoraAutomation.tsx` |
| `heading-order` | home, dashboard-soporte | `<h3 class="text-3xl font-bold text-zinc-50">` sin h2 previo | Portfolio (home) · tarjetas de tickets (soporte) |
| `aria-prohibited-attr` | home | `<span data-cursor="hover" aria-label="equipo técnico...">` — aria-label en elemento no interactivo | sección hero/manifesto |
| `label-content-name-mismatch` | login, dashboard-soporte | launcher del chat: texto visible ≠ aria-label; botón "Ver todos los tickets..." | `src/modules/chatbot/components/LogicCompanion.tsx:150-156` |

### 1.b Manual (Playwright + lectura de código)

**Teclado — widget del chatbot (VERIFICADO EMPÍRICO, script `scratchpad/kbd-test.mjs`):**
- El launcher es un `motion.div` con `role="button"` y `tabIndex={0}` pero **sin ningún handler de teclado** (`grep onKeyDown LogicCompanion.tsx` = 0 matches). Resultado de la corrida: `Enter sobre launcher -> dialog abierto: false`, `Space -> false`, `click mouse -> true`. **El canal principal de captación de leads no se puede abrir sin mouse.** Evidencia: `src/modules/chatbot/components/LogicCompanion.tsx:147-149` (`role="button"`, `tabIndex={0}`, `onClick={handleToggle}`).
- Abierto el diálogo: **sin focus trap** (Tab 2 desde el launcher cae en `BODY` y sigue por la página de atrás: "Quiero una demo gratis" = CTA del Hero, `src/components/layout/Hero.tsx:703`). **Escape no cierra** (`Escape -> dialog sigue abierto: true`; grep `Escape` en ChatWindow/LogicCompanion = 0 matches).
- El textarea del chat **no tiene nombre accesible** — solo placeholder: `src/modules/chatbot/components/chat/ChatWindow.tsx:526-545` (sin `aria-label`; los únicos aria-label del archivo son líneas 246 y 653). Ídem `src/modules/chatbot/components/chat/ChatInput.tsx:44-54` (placeholder + `outline-none` sin estilo de foco sustituto).
- Lo que SÍ está bien: `role="dialog"` + `aria-label` (`ChatWindow.tsx:245-246`), `role="log"` + `aria-live="polite"` (`:275-276`), botones de header con aria-label y `aria-pressed` (`ChatHeader.tsx:94-107`), iframe del embed con `title` y `sandbox` (`public/widget.js:115-124`).

**Teclado — login (VERIFICADO EMPÍRICO):** tab-through completo operable; foco visible (inputs con boxShadow de foco, links/botones con outline nativo `auto/1px`). Labels correctos: floating label con `htmlFor={id}` (`src/app/login/page.tsx:96-97`), toggle de contraseña con `aria-label` dinámico (`:113`), `autoComplete` correcto (`:348-349`). **Login es el patrón bueno del repo.**

**Labels de formularios:**
- `CrmConfigForm` — BIEN: `Field label=` + `aria-label` en el Input (`src/modules/chatbot/components/admin/integrations/CrmConfigForm.tsx:83-95`), `Toggle` con `role="switch"` + `aria-checked` + `aria-label` (`src/components/ui/Toggle.tsx:15-24`).
- Captura de lead del widget: NO hay form de captura — el bot captura nombre/email/teléfono **conversacionalmente** (campos en `prisma/schema.prisma:1420` `ChatbotLead.name/email/phone`). El único input es el textarea sin label ya citado.
- `/contact` — MAL: los 6 `<label>` no tienen `htmlFor` y los inputs no tienen `id` ni `aria-label` (`src/app/contact/page.tsx:151-212`): Nombre, Email, Teléfono, Empresa, Servicio (select), Mensaje. Asociación programática rota (WCAG 1.3.1 / 4.1.2). El mismo form embebido en las service pages produce el `select-name` de Lighthouse.

**Headings (verificado en HTML SSR por curl):** h1 único en home y las 4 service pages. **`/contact` tiene 2×`<h1>`** ("Hablemos" duplicado — render dual mobile/desktop, consistente con el hallazgo de dup de la auditoría home). `/login` tiene 0 h1 (menor, página de utilidad).

**Alt en imágenes:** 0 `<img>` sin alt en `src/` (grep). Con `next/image`: 3 casos de `alt=""` en imágenes de proyectos del portfolio que tienen título disponible (`src/components/sections/home/Portfolio.tsx:251-252, 337-338, 564-565` — `src={project.image} alt=""`). Deberían ser `alt={project.title}` o quedar explícitamente decorativas si el título ya está adyacente (lo está — P2).

**Contraste COMO CRITERIO (calculado de los valores de token, no de píxeles):**

Fondo base del sitio `--color-void: #030303` (`src/app/globals.css:22`). Ratios WCAG calculados (node, fórmula sRGB):

| Token/utility | Ratio sobre #030303 | Veredicto texto normal (≥4.5) | Usos en src (grep) |
|---|---|---|---|
| `text-white/40` (y equivalentes rgba .4) | 3.70:1 | **FALLA** | 64 ocurrencias ≤/40 (incl. placeholder del chat `placeholder-white/40`, `ChatInput.tsx:53`) |
| `text-white/35` | 3.04:1 | **FALLA** | (incluido arriba; placeholders de /contact `placeholder:text-white/35`) |
| `text-zinc-500` #71717a | 4.27:1 | **FALLA** (borderline) | **850 ocurrencias** |
| `text-zinc-600` #52525b | 2.67:1 | **FALLA** | **190 ocurrencias** |
| `text-white/50` | 5.29:1 | pasa | — |
| `text-zinc-400` #a1a1aa | 8.05:1 | pasa | — |
| accent `#06b6d4` | 8.49:1 | pasa | — |
| labels /contact `#8deef5` al 60% sobre `#081a20` | 5.50:1 | pasa | `contact/page.tsx:151` |

Criterio para el rediseño: **el escalón de "texto muted" tiene que ser zinc-400/white-50 como piso**; zinc-500/600 y white/40- solo para texto decorativo/no informativo o tamaño large.

**Foco global:** 125 ocurrencias de `outline-none` vs 17 de `focus-visible:` en src (grep). En la práctica el tab-through de login/home mostró outline nativo en links/botones (no se resetea globalmente), pero cada `outline-none` puntual sin sustituto (ej. textarea del chat) es un hueco.

### 1.c 3D (separado del contenido — poco)

- **El contenido real NO depende de ningún canvas** — verificado dos veces: (1) HTML SSR por curl trae h1 + textos de venta en las 5 públicas; (2) con WebGL deshabilitado el contenido sigue visible (ver §2.a).
- **aria-hidden:** NINGUNO de los canvas decorativos lo tiene. Los wrappers de `HeroCanvas` (logo 3D del home): `Hero.tsx:583-586` (desktop, `motion.div absolute inset-0 z-[6] pointer-events-none` sin aria-hidden) y `:738-745` (mobile). `HeroBackground` root div sin aria-hidden (`src/components/canvas/HeroBackground.tsx:271`). `DotMatrix` de login/forgot/accept-invite: wrapper `div.pointer-events-none.fixed` sin aria-hidden (`src/app/login/page.tsx:477-479`, `src/app/forgot-password/page.tsx:237-239`, `src/app/accept-invite/InviteBackground.tsx:11-13`). Contraste: las decoraciones NO-canvas del Hero sí están bien marcadas (`Hero.tsx:496,505,535,551,560,605...`) — el patrón existe, los canvas quedaron afuera.
- **prefers-reduced-motion:** desparejo. BIEN: `HeroBackground.tsx:229` (reduced → modo low → sin canvas), Hero gate del DotMatrixMesh (`Hero.tsx:372` `isSplitLayout && !prefersReducedMotion`), launcher del chat (`LogicCompanion.tsx` animación condicionada a `reducedMotion`), y uso extendido de `useReducedMotion` en secciones ia/automation/software (grep: 30+ call sites). MAL: `DotMatrix` standalone NO chequea reduced motion — anima esferas en loop en login/forgot/accept-invite (`src/components/canvas/DotMatrix.tsx:209-222`, 0 matches de reduced). Menor: los blobs CSS del fallback de HeroBackground pulsan opacity en loop incluso en reduced (`HeroBackground.tsx:303-314`) — es opacity, no movimiento, tolerable.
- **¿Hay 3D interactivo que gatee contenido?** No. `Interactive3DNetwork` (web-development) reacciona al puntero pero el texto vendedor está en overlay HTML y en el SSR; no requiere evaluación aparte como contenido. Ningún canvas recibe foco ni expone controles.

---

## 2. COMPATIBILIDAD

### 2.a Fallback WebGL (VERIFICADO EMPÍRICO, script `scratchpad/nowebgl-probe.mjs`, Chromium `--disable-webgl --disable-webgl2 --disable-3d-apis`)

| Ruta | ¿Página sobrevive? | ¿Qué queda del canvas? | pageerrors |
|---|---|---|---|
| `/login` | SÍ — form completo usable (input email presente, texto visible) | hueco muerto (DotMatrix no pinta) | 1: `Error creating WebGL context.` |
| `/` | SÍ — h1 + typewriter + contenido | hueco muerto donde va el logo 3D | 1: `Error creating WebGL context.` |
| `/web-development` | SÍ — h1 + contenido de venta | hueco muerto | 2: `Error creating WebGL context.` + **`Cannot read properties of null (reading 'enable')`** |

Conclusión: **no hay pantalla negra ni crash del error boundary** (mejor de lo esperado), pero **no existe detección de WebGL ni poster de reemplazo**: la región 3D queda vacía y los errores suben sin manejar (ruido en Sentry; el segundo error de web-development es un deref de un contexto GL null). Nadie usa el prop `fallback` de `<Canvas>` de R3F ni chequea `getContext('webgl')` (grep `webgl|getContext` en src/components: solo un `getContext('2d')` en `Hero.tsx:301`).

Único fallback real existente: `HeroBackground.tsx:228-247` degrada a blobs CSS — pero la decisión es por **heurística** (`prefersReducedMotion || viewportWidth < 768`, cores/memoria en `:232-233`), NO por disponibilidad de WebGL: un desktop viejo sin WebGL igual intenta el canvas.

### 2.b Matriz mínima propuesta (criterio SMB LATAM, Android gama media importa)

No hay `browserslist` en `package.json` (verificado por node: `NO BROWSERSLIST`) → aplican los targets default de Next.js (browsers modernos). Propuesta de matriz objetivo a fijar:

| Device/Browser | Prioridad | Por qué |
|---|---|---|
| Chrome Android (últimas 2) en gama media (4-6GB RAM, GPU Mali/Adreno básica) | **ALTA** | El dueño de PyME NOA navega desde el teléfono; WebView de WhatsApp/Instagram abre los links compartidos |
| Android WebView (in-app browser de WhatsApp/IG/FB) | **ALTA** | Canal de adquisición real; WebGL frecuentemente degradado o bloqueado ahí — conecta con 2.a |
| Samsung Internet (última) | MEDIA | Cuota alta en Android LATAM |
| Chrome/Edge desktop (últimas 2) | ALTA | Decisor en escritorio |
| Firefox desktop (última) | BAJA | Cuota marginal en el segmento |
| Safari iOS (últimas 2) | MEDIA | Minoría pero decisores premium |
| Hardware bajo: `hardwareConcurrency<=4`, sin WebGL2 | **ALTA como modo degradado** | Ya existe la mitad de la infraestructura (HeroBackground quality tiers) |

Acción: fijar `browserslist` explícito + extender el patrón de tiers de HeroBackground a los demás canvas.

### 2.c Cruce con P5.1 (poster/placeholder de canvas)

El "poster" que P5.1 propone para los canvas **hoy no sirve de fallback WebGL** porque ningún mount decide por disponibilidad: `HeroBackground` elige canvas/CSS por heurística de device (2.a), `Hero`/`DotMatrix`/`Interactive3DNetwork` no tienen rama alternativa (solo `Suspense fallback` de carga: `Interactive3DNetwork.tsx:365,570`, `Hero.tsx:364` `fallback={null}`). **Gap concreto:** el mismo componente-poster que se haga para P5.1 debe montarse también cuando `getContext('webgl')` falla / el contexto se pierde (`webglcontextlost`). Un solo helper `useWebGLAvailable()` + prop `fallback` de R3F Canvas cubre ambos usos.

---

## 3. SEO TÉCNICO

### 3.a Piso técnico — tabla existe/falta

| Pieza | Estado | Evidencia |
|---|---|---|
| `metadataBase` en layout raíz | **EXISTE** | `src/app/layout.tsx:18` (`https://develop.com.ar`) |
| Metadata por página pública | **EXISTE** (title+description+OG en home y 4 services + contact) | `src/app/{web-development,ai-implementations,process-automation,software-development,contact}/layout.tsx:3+` |
| Title 55-60 chars | **PARCIAL** | medidos: home 60 ✓, contact 44 ✓, sw 60 ✓; **web 72, ia 67, auto 67 se truncan** |
| Description 150-160 | **PARCIAL** | home 154 ✓, web 148 ✓, auto 138 ✓, contact 140 ✓; **ia 176, sw 164 se truncan** |
| Canonical | **PARCIAL** | existe en las 4 service pages (`ai-implementations/layout.tsx:38-39` etc.); **FALTA en home y /contact** (verificado en HTML servido: solo web-development lo emite) |
| `sitemap.ts` | **FALTA** | glob `src/app/**/sitemap.*` = 0; `curl /sitemap.xml` → **404** |
| `robots.ts` | **FALTA** | glob = 0; `curl /robots.txt` → **404**. `/admin`, `/api`, `/dashboard` sin directiva alguna |
| noindex en páginas de utilidad | **PARCIAL** | solo `/embed` (`src/app/embed/layout.tsx:5` `robots: {index:false}`); login/forgot-password/reset-password/accept-invite/bienvenida/cambiar-password sin robots meta (grep = 0) |
| JSON-LD (Organization, Service, LocalBusiness) | **FALTA** | grep `application/ld+json|schema.org` en src = **0 archivos** |
| OG images | **ROTO** | los 5 archivos referenciados **no existen**: `/og-image.png`, `/og-web.png`, `/og-ia.png`, `/og-software.png`, `/og-automation.png` → todos **404** (curl). En `public/` no hay ningún `og*` (find = vacío). Toda compartida en WhatsApp/redes sale sin imagen — y WhatsApp es EL canal del segmento |
| `<html lang>` | **ROTO** | `lang="en"` (`src/app/layout.tsx:62`) en un sitio 100% castellano con `locale: "es_AR"` declarado en su propio OG (`layout.tsx:26`). Afecta SEO (señal de idioma) y a11y (WCAG 3.1.1, pronunciación de lectores de pantalla). Verificado en el HTML servido de las 7 rutas |

### 3.b Renderizado (Googlebot sin ejecutar 3D)

Verificado por curl al server de prod (HTMLs guardados en `scratchpad/html/`):
- h1 y textos de venta **presentes en el HTML SSR** de las 5 páginas públicas. Fragmentos: home `<h1 ...>...Tu negocio abierto...` (475KB de HTML), web-development `<h1 ...><span class="block text-balance bg-gradient-to-r ...">TU NEGOCIO, ABIERTO...` (327KB), ai-implementations `<span style="display:block;color:#f2fbff...">Tu empresa trabaja</span>` (227KB).
- Matiz: los h1 de home y ai-implementations llegan con `opacity:0;transform:translateY(...)` inline (animación de entrada). Googlebot renderiza con JS y lo ve; el riesgo real es **sin JS** (contenido queda invisible) — aceptable hoy, anotado como robustez, no como bloqueo SEO.
- Nada del contenido vendedor vive dentro de un canvas: con WebGL apagado el texto sigue (ver 2.a) — **Googlebot ve todo sin ejecutar el 3D**.

---

## 4. GAP LEGAL (mapeo — la redacción final la valida un abogado; no es asesoría jurídica)

### 4.a Inventario de lo que hay HOY en el app

| Pieza | Estado | Evidencia |
|---|---|---|
| Términos de Servicio | **NO EXISTE** | no hay ruta (`ls src/app` — sin /terminos ni similar); grep `Términos|Terms` en componentes = 0 UI |
| Política de Privacidad | **NO EXISTE** | grep `Privacidad|privacidad` en src/*.tsx = **0 ocurrencias de UI**; sin ruta |
| Links legales en footer/nav (público o portales) | **NO EXISTEN** | no hay componente Footer con legales (`src/components/layout/` sin footer legal; dashboard layout tampoco — grep = 0) |
| Banner/gestión de consentimiento de cookies | **NO EXISTE** | grep cookie-banner/consent en src = solo cookies técnicas |
| Aviso en el widget del chatbot antes de capturar datos | **NO EXISTE** | grep `privacidad|tus datos|consentimiento` en `src/modules/chatbot` + `public/widget.js` = 0. El `welcomeMessage` es configurable por bot (`shared/publicConfig.ts:48`) pero no hay pieza fija de aviso |
| Aviso en formulario de contacto | **NO EXISTE** | `src/app/contact/page.tsx:149-215` — pide nombre/email/teléfono/empresa sin ningún texto de tratamiento de datos ni checkbox |

### 4.b Cruce con Ley 25.326 (vigente) y reforma en curso

PII que el sistema **captura y persiste hoy**:
- `ChatbotLead`: `name`, `email`, `phone`, `message`, intent, señales de comportamiento (`prisma/schema.prisma:1420-1460`).
- `Conversation`: transcripción completa (`ChatMessage.content` `@db.Text`, schema:1400-1417), `ipHash` (hasheada — bien, `handleChatRequest.ts:284`), `userAgent`, UTM (schema:1351-1370).
- Form de contacto → leads.
- El widget corre **embebido en sitios de terceros** (`public/widget.js` — iframe hacia `/embed/[slug]`): develOP procesa datos de visitantes de sus CLIENTES → rol de **encargado de tratamiento** además de responsable.
- El lead se re-envía al CRM del cliente vía webhook n8n (`src/modules/chatbot/server/crm/buildLeadPayload.ts`, `syncLeadToCrm.ts`) → cesión/transferencia a definir contractualmente.

Gaps mapeados a 25.326:
1. **Deber de información (art. 6)** — nada informa finalidad, responsable, ni derechos al captar datos (chat, contacto). Es el gap más directo y barato de cerrar.
2. **Consentimiento (art. 5)** — la carga conversacional de email/teléfono no registra base legal; con un aviso visible pre-captura + registro (timestamp del aviso mostrado) alcanza para el estándar actual.
3. **Derechos ARCO (arts. 14-16)** — no hay canal declarado de acceso/rectificación/supresión, ni mecanismo interno de borrado: **ningún cron de purga** (`ls src/app/api/cron` = alerts, detect-bot-issues, generate-insights, os-follow-up, regenerate-briefs, send-executive-reports, send-weekly-reports — 0 retención) → retención indefinida de transcripciones con PII.
4. **Registro de base de datos (RNBD/AAIP)** — obligación organizacional, fuera del repo → cruce externo Franco.
5. **Reforma (proyectos tipo RGPD en el Congreso a jul-2026)**: privacidad por diseño, accountability, y **decisiones automatizadas** — el bot **perfila y puntúa leads automáticamente** (`ChatbotLead.category`, señales B5.1, scoring por vertical `signals Json` schema:1445-1460) → alinear proactivamente: documentar la lógica de scoring y prever aviso de perfilado en la política. Construir a 25.326 hoy, con estos ítems ya redactados.

Positivos existentes (base para el sprint): scrubbing PII obligatorio hacia Sentry (`src/lib/sentry/scrub-pii.ts:1-30`, denylist emails/teléfonos/DNI/CUIT/tarjetas), IP nunca en claro (hash), aislamiento multi-tenant del módulo bot (auditoría previa), y el guard QA de login con triple candado (`api/qa/login/route.ts:49-72`).

### 4.c Cookies y tracking

- Cookies actuales: sesión NextAuth (`__Secure-authjs.session-token` — esencial/auth) y cookie de foco del setter (funcional, httpOnly, `src/lib/leados/foco-cookie.ts:6-17`). **Esenciales/funcionales: no requieren consentimiento.**
- **No hay tracking client-side en el código**: grep `gtag|googletagmanager|plausible|posthog|fbq|hotjar|clarity|@vercel/analytics` en src = 0. Lo único es `@google-analytics/data` **server-side** (`src/lib/analytics.ts:1`) que LEE métricas GA4 de los sitios de clientes para el dashboard (`dashboard/resultados/trafico`) — no trackea este sitio.
- **Anticipación P6**: cuando P6 sume analytics al sitio propio, ahí SÍ nace la obligación de banner/consentimiento — dejar el hook de consentimiento previsto en O5.4 para no re-abrir.

### 4.d Cruce con los 18 documentos legales de develOP

**NO están en el repo** (verificado: docs/ no contiene piezas legales de privacidad). El sprint O5.4 es **BAJAR al app lo ya pensado**, no inventar derecho: Franco debe mapear cuál de los 18 documentos alimenta (1) política de privacidad pública, (2) ToS del portal de clientes, (3) anexo de tratamiento de datos para clientes del chatbot (rol encargado + webhook CRM), (4) texto corto del aviso pre-captura del widget. **Cruce externo pendiente de Franco + validación de abogado.**

---

## HALLAZGOS PRIORIZADOS

### P0

- **LEG-01 — Captura activa de PII sin ninguna pieza legal en el app.** El sitio capta nombre/email/teléfono por chatbot (schema:1420) y formulario (`contact/page.tsx:151-212`), persiste transcripciones completas, y no existe política de privacidad, ToS, aviso de tratamiento ni canal ARCO (inventario §4.a, todo con evidencia = 0 ocurrencias). Incumplimiento directo del deber de información de la 25.326 con tratamiento en curso. Severidad: P0 legal (riesgo real: sanción AAIP + confianza B2B; los clientes del chatbot heredan el gap en SUS sitios).
- **A11Y-01 — El widget del chatbot no es operable por teclado.** Enter/Space no abren el launcher (verificado empírico; `LogicCompanion.tsx:147-149` sin onKeyDown), sin focus trap, Escape no cierra, textarea sin nombre accesible (`ChatWindow.tsx:526+`, `ChatInput.tsx:44-54`). El canal primario de conversión queda inaccesible para usuarios de teclado/AT — además viola el propio baseline del repo (CLAUDE.md "Aria-labels on all icon-only elements" / operabilidad). WCAG 2.1.1 nivel A.

### P1

- **SEO-01 — Las 5 OG images referenciadas no existen (404).** `layout.tsx:31` y las 4 service layouts apuntan a `/og-*.png` inexistentes (find + curl 404). Toda compartida en WhatsApp/redes — el canal del segmento SMB — sale sin imagen.
- **SEO-02 — Sin robots.txt ni sitemap.xml (ambos 404), sin noindex en 6 páginas de utilidad** (login, forgot/reset-password, accept-invite, bienvenida, cambiar-password; solo /embed tiene `robots:{index:false}`, `embed/layout.tsx:5`).
- **SEO-03 — `<html lang="en">` en sitio castellano** (`layout.tsx:62`; doble impacto SEO + WCAG 3.1.1). Fix de una línea.
- **A11Y-02 — Nombres accesibles y labels: fallas sistémicas de patrón.** `button-name` en 7/7 públicas (flechas `Portfolio.tsx:481,488`, dots `:543`, paginado móvil `:705`, botón fijo `Navbar.tsx:257`); select del form embebido sin label en 3 services; sliders de calculadora sin label (process-automation); 6 labels sin `htmlFor`/`id` en `/contact` (`contact/page.tsx:151-212`).
- **A11Y-03 — Contraste (criterio de tokens):** `text-zinc-500` = 4.27:1 (850 usos), `text-zinc-600` = 2.67:1 (190 usos), `white/40-` ≤3.70:1 (64 usos) sobre `#030303`. Fijar el piso "muted = zinc-400 / white-50" como token del rediseño.
- **COMP-01 — Sin detección WebGL ni poster-fallback.** Canvas muere en hueco vacío + errores sin manejar (empírico §2.a; en web-development deref `null.enable`). Solo HeroBackground degrada, y por heurística, no por disponibilidad (`HeroBackground.tsx:228-235`). Clave para Android gama media / WebView de WhatsApp. Conecta con el poster de P5.1 (§2.c).
- **LEG-02 — Retención indefinida sin purga ni derechos ARCO operativos.** Transcripciones + leads para siempre; 0 crons de retención (§4.b punto 3). Definir TTL (decisión humana) + job de purga/anonimización.

### P2

- **A11Y-04 — 3D decorativo sin `aria-hidden`** (wrappers de HeroCanvas `Hero.tsx:583/738`, `HeroBackground.tsx:271`, DotMatrix en `login:477`/`forgot-password:237`/`accept-invite:11`) y **DotMatrix standalone sin reduced-motion** (`DotMatrix.tsx:209-222`).
- **A11Y-05 — Estructura:** 2×h1 en /contact (dual mobile/desktop), 0 h1 en /login, `heading-order` (home, soporte), `aria-prohibited-attr` (span con aria-label en home), `label-content-name-mismatch` (launcher, soporte).
- **A11Y-06 — `alt=""` en imágenes de portfolio con título disponible** (`Portfolio.tsx:251,337,564`).
- **SEO-04 — Ajustes de metadata:** canonical faltante en home y /contact; titles >60 (web 72, ia 67, auto 67); descriptions >160 (ia 176, sw 164); **JSON-LD inexistente** (Organization + Service + LocalBusiness con geo Tucumán — barato y relevante para búsqueda local).
- **COMP-02 — Sin `browserslist` explícito** — fijar la matriz §2.b en package.json y documentarla.
- **LEG-03 — Prever consentimiento para P6 (analytics)** — hoy solo cookies esenciales/funcionales (sin obligación de banner); dejar el punto de extensión listo en la política y en el layout.
- **Candidato P1 (dead code, no desarrollado):** `src/components/canvas/AuroraBackground.tsx` (29 líneas) y `NeuralNetwork`/`ReactiveBackground`/`LiquidProject` sin uso en app/ detectado por grep de usos (§ canvas) — confirmar con knip antes de borrar.

**Positivos a preservar:** login accesible de punta a punta; CrmConfigForm/Field/Toggle correctos; semántica del diálogo del chat (dialog/log/aria-live); iframe del widget con title+sandbox; scrub-pii a Sentry; ipHash; reduced-motion extendido en secciones; dashboard LH 100/98.

---

## INSUMOS PARA SPRINTS

### LEG-01 (P0) → O5.4
- **Qué tocar:** rutas nuevas `src/app/(legal)/privacidad/page.tsx` y `.../terminos/page.tsx` (server components estáticos, metadata propia); aviso corto pre-captura en el widget (`ChatWindow.tsx` — línea fija bajo el header o primer mensaje de sistema: "Al conversar podés dejar datos de contacto. Los tratamos según nuestra [Política de Privacidad]" con link `target=_blank`); texto + checkbox no-preticked en `/contact` y en el form embebido de las services; links legales en footer público y en los portales.
- **Cómo:** contenido BAJADO de los 18 docs externos de develOP (cruce Franco) + placeholders marcados `[VALIDAR ABOGADO]`. El aviso del widget también dentro de `/embed` (sirve a los sitios de clientes).
- **Criterio de aceptación:** las 2 rutas legales SSR con h1 único + metadata; aviso visible en el primer viewport del chat abierto (SSR-curl de /embed lo contiene); checkbox requerido en forms que capturan PII; 0 captura sin aviso alcanzable a 1 click.
- **Decisión humana:** cuál de los 18 docs alimenta cada pieza; TTL de retención (ver LEG-02); rol responsable/encargado por bot embebido (anexo de datos para clientes).

### A11Y-01 (P0) → O5.1
- **Qué tocar:** `LogicCompanion.tsx:147-156` — agregar `onKeyDown` (Enter/Space → `handleToggle`) o convertir el `motion.div` en `motion.button`; `ChatWindow.tsx` — handler global `Escape` → cerrar + devolver foco al launcher, focus trap simple (contener Tab dentro del `role="dialog"` mientras esté abierto); `aria-label="Escribí tu mensaje"` en los textarea de `ChatWindow.tsx:526+` y `ChatInput.tsx:44`; estilo `focus-visible` donde hay `outline-none`.
- **Criterio de aceptación:** re-correr `scratchpad/kbd-test.mjs`: Enter y Space abren (`dialog abierto: true`), Tab nunca cae en BODY con el diálogo abierto, Escape cierra y el foco vuelve al launcher; axe/Lighthouse sin `button-name` en el widget.
- **Decisión humana:** ninguna.

### SEO-01 + SEO-02 + SEO-03 (P1) → O5.3
- **Qué tocar:** (1) generar los 5 `public/og-*.png` 1200×630 — interim con logo+claim sobre fondo de marca hasta que diseño entregue finales; (2) `src/app/robots.ts` (allow público; `disallow: ['/admin','/dashboard','/api','/setter','/embed']`) y `src/app/sitemap.ts` (6 URLs públicas con lastModified); (3) `layout.tsx:62` → `lang="es"`; (4) `robots: {index:false}` en los layouts/pages de login, forgot/reset-password, accept-invite, bienvenida, cambiar-password.
- **Criterio de aceptación:** curl /robots.txt y /sitemap.xml → 200 con contenido; los 5 OG → 200 y validador de OG (opengraph.xyz) muestra imagen; `<html lang="es">` en el HTML servido; `<meta name="robots" content="noindex"` en las 6 utilitarias.
- **Decisión humana:** arte final de las OG images (interim autorizable ya).

### A11Y-02 (P1) → O5.1
- **Qué tocar:** aria-labels: `Portfolio.tsx:481` ("Proyecto anterior"), `:488` ("Proyecto siguiente"), `:543` (`aria-label={'Ir al proyecto ' + (i+1)}`), `:705` (paginado móvil), `Navbar.tsx:257` ("Abrir menú"/aria-expanded); `/contact` y form embebido: `id`+`htmlFor` en los 6 campos y label del select; sliders de CalculadoraAutomation: `aria-label` + `aria-valuetext` legible.
- **Criterio de aceptación:** Lighthouse a11y ≥95 en las 7 públicas con 0 `button-name`/`select-name`/`label`.
- **Decisión humana:** ninguna.

### A11Y-03 (P1) → O5.1 con re-check post-rediseño
- **Qué tocar:** decidir y documentar el piso de texto muted en tokens (globals.css / guía del rediseño): informativo ≥ `zinc-400`/`white-50`; degradar zinc-500/600 y white/40- a texto decorativo o large-only. NO hacer la pasada masiva de 1.100 usos ahora (diseño inestable): fijar el criterio + lint/guía, y aplicarlo como parte del rediseño en curso.
- **Criterio de aceptación:** criterio escrito en la guía de diseño del repo + los tokens nuevos del rediseño calculan ≥4.5:1; spot-check con la fórmula del reporte.
- **Decisión humana:** SÍ — Franco/rediseño eligen el token muted definitivo.

### COMP-01 (P1) → O5.2
- **Qué tocar:** helper `useWebGLAvailable()` (probe `getContext('webgl')` 1 sola vez + listener `webglcontextlost`) en `src/lib/`; usarlo en los mounts: `HeroBackground.tsx:290` (sumar `|| !webglOk` a la rama CSS), `Hero.tsx:360`, `login/forgot/accept-invite` (DotMatrix → no montar, el fondo estático ya existe), `Interactive3DNetwork` (mostrar el overlay estático). Aprovechar el prop `fallback` de R3F `<Canvas>` donde aplique. Mismo componente-poster que P5.1 (§2.c).
- **Criterio de aceptación:** re-correr `scratchpad/nowebgl-probe.mjs`: 0 pageerrors en /login, / y /web-development con WebGL off, y la región del canvas muestra poster/fondo estático (no hueco).
- **Decisión humana:** ninguna (el poster lo define P5.1).

### LEG-02 (P1) → O5.4
- **Qué tocar:** cron nuevo `src/app/api/cron/purge-chatbot-data` (anonimizar `ChatbotLead` + borrar `Conversation`/`ChatMessage` con `lastMessageAt` > TTL, respetando leads convertidos); sección de retención y canal ARCO (mailto dedicado) en la política; documentar el flujo de borrado a pedido.
- **Criterio de aceptación:** cron corre idempotente en dev contra datos seed viejos; la política publica TTL y canal; query de verificación: 0 conversaciones > TTL sin lead activo.
- **Decisión humana:** SÍ — TTL concreto (sugerencia para decidir: 12-24 meses transcripciones; leads convertidos exentos).

---

## FILAS PARA LA TABLA-PROGRAMA

| sprint propuesto | lente | prioridad | tamaño S/M/L | re-check post-P1 sí/no |
|---|---|---|---|---|
| O5.1 a11y — teclado del widget + nombres accesibles + labels forms (A11Y-01, A11Y-02) | CALIDAD | P0 | M | sí (re-correr kbd-test + Lighthouse) |
| O5.1b a11y — criterio de contraste en tokens del rediseño (A11Y-03) + 3D aria-hidden/reduced (A11Y-04) | CALIDAD | P1 | S | sí (post-rediseño) |
| O5.2 compat — useWebGLAvailable + poster compartido con P5.1 + browserslist (COMP-01, COMP-02) | CALIDAD | P1 | S | sí (re-correr nowebgl-probe) |
| O5.3 SEO — OG images + robots/sitemap + lang="es" + noindex utilitarias (SEO-01/02/03) | CALIDAD | P1 | S | no |
| O5.3b SEO — canonicals + largos title/desc + JSON-LD (SEO-04/05) | CALIDAD | P2 | S | no |
| O5.4 legal — piezas legales + aviso widget/forms + retención/ARCO (LEG-01, LEG-02, LEG-03) | CALIDAD | P0 | M | sí (SSR-curl de avisos) |

---

## LIMITACIONES DE LA CORRIDA

- Lighthouse = subset axe automatizable; no reemplaza prueba con lector de pantalla real (NVDA/TalkBack) — no corrida por alcance.
- Dashboard: solo `/dashboard` y `/dashboard/soporte` con persona client-a; admin y setter no auditados en esta pasada (mismo criterio aplica; setter ya tiene suite a11y propia — Field/FieldControlContext).
- Contraste calculado de tokens sobre `#030303`; superficies intermedias (cards `bg-white/[0.04]`) mueven el ratio marginalmente (~+0,02 de luminancia, no cambia ningún veredicto).
- El contenido de los 18 documentos legales de develOP no está en el repo — el mapeo §4.d queda como cruce externo pendiente de Franco.
- Corrida de Lighthouse de home se duplicó por un relanzamiento (proceso duplicado matado; JSONs íntegros, scores consistentes).


---

# CIERRE — programa propuesto (los 7 lentes consolidados)

**Totales de la corrida: 12 P0 · 38 P1 · 33 P2** (SEC 0/7/11 · PERF 3/7/3 · ARQ 0/4/3 · DATOS+DR 1/3/3 · RESILIENCIA 3/5/4 · OBSERVABILIDAD 3/5/2 · CALIDAD 2/7/7).

Los detalles de cada fila (qué tocar, cómo, criterio de aceptación, decisión humana si aplica) están en la sección **INSUMOS PARA SPRINTS** del lente correspondiente, más arriba. Esta tabla es el índice ejecutable del programa.

## Tabla-resumen: sprint propuesto × lente × prioridad × tamaño × re-check post-P1

| sprint propuesto | lente | prioridad | tamaño | re-check post-P1 |
|---|---|---|---|---|
| 3.0 — quick-fixes P1 (SEC-01 smoke, SEC-02 preflight, SEC-03 cron fail-open, SEC-04 magic-link RL, SEC-05 login RL) | SEC | P1 | S | sí |
| 3.1 — regresión de protecciones cerradas-sin-test (oauth-state, sessionVersion, spotlighting, ownership capture_lead, limiter DB, cron-auth, headers) | SEC | P1 | M | sí |
| 3.2 — SSRF postToN8n (SEC-06: redirect manual + DNS pre-check, opcional pinning) | SEC | P1 | S-M | sí |
| 3.3 — disclosure IA/PII del widget + decisión redaction (SEC-07) | SEC | P1 | S (+decisión humana) | sí |
| 3.4 — golden suite multi-tenant (Playwright client-a/client-b vía qa-login + invariants callerCanAccessOrg) | SEC | P1 | L | sí |
| 3.5 — higiene P2 (CSP enforce, timingSafeEqual cron, fallback impersonation, test-sentry, TTL resolver, NFC, navigate_to_page gating, embed frame-ancestors) | SEC | P2 | S-M | no |
| post-merge motor — re-auditar B1-S1/S2/S3 (360dialog) cuando entre a main | SEC | P1 | M | sí |
| 5.2 — three fuera del grafo compartido (PERF-01) + secciones marketing dynamic (PERF-04) | PERF | P0 | M | sí |
| 5.2b — Sentry replay lazy/off (PERF-05) | PERF | P1 | S | sí |
| 5.3 — facade templates + imgs externas a next/image (PERF-02) | PERF | P0 | M | sí |
| 5.3b — HDRI self-host o Lightformers (PERF-03) | PERF | P0 | S | sí |
| 5.3c — videos preload/poster + re-encode (PERF-09) | PERF | P1 | S | sí |
| 5.4 — CSS re-check + prefetch tuning (PERF-08/12) | PERF | P2 | S | sí (post-limpieza) |
| decisión preloader + recorte de holds (PERF-06) | PERF | P1 | S | no (independiente) |
| diagnóstico FPS scroll post-5.2 (PERF-07) | PERF | P1 | M | sí (bloqueado por 5.2) |
| limpieza: assets/componentes huérfanos (PERF-10) | PERF | P1 | S | n/a (es la limpieza) |
| dpr DotMatrix + logo PNG login (PERF-11/13) | PERF | P2 | S | no |
| 4.1 kb-templates types.ts (romper 10 ciclos) | ARQ | P1 | S | sí |
| 4.2 BotDetailClient types.ts (romper 6 ciclos) | ARQ | P1 | S | sí |
| 4.2b lead-pipeline types.ts (romper 6 ciclos NUEVOS) | ARQ | P1 | S | sí |
| 4.3 poda barrels chatbot (keep-list A, 205 muertos) | ARQ | P1 | M | sí |
| 4.4 normalizar duplicate exports (10 archivos) | ARQ | P2 | S | sí |
| 4.5 candado depcruise (no-circular error + 2 capas) + README contrato real | ARQ | P1 | S | sí |
| O1.1a — activar db-backup (secrets + primer run verde) [DR-01] | DATOS+DR | P0 | S | sí (cron verde al día siguiente + semana 1) |
| O1.1b — copia a bucket externo R2/B2 con retención larga [DR-02] | DATOS+DR | P1 | S | sí (restore desde bucket) |
| O1.2a — directUrl para migraciones [MIG-01] | DATOS+DR | P1 | S | sí (migrate status por host sin -pooler) |
| O1.2b — runbook fallo de migración + backup-before-destructive + guardrail motor-drift [MIG-02, MIG-03, §6] | DATOS+DR | P1 | M | sí (drift vacío post-merge b1) |
| O1.3 — onDelete explícitos (6 relaciones) + docs deploy (DEPLOY.md/orden Fase 2) [INT-01, MIG-03] | DATOS+DR | P2 | S | no |
| O2.1 LLM: time-box + degradar rápido + breaker (RESIL-01) | RESILIENCIA | P0 | M | sí |
| O2.2 n8n/outbox: cron resync CrmSyncAttempt + jitter + dedup leadId (RESIL-02, RESIL-11) | RESILIENCIA | P0 | M | sí |
| O2.5 crons: disparador verificable + heartbeat + batching (RESIL-03, RESIL-04) | RESILIENCIA | P0/P1 | M | sí |
| O2.3 Neon: connect_timeout + contact form + contrato getPlanForOrg (RESIL-07, RESIL-09) | RESILIENCIA | P1 | S | sí |
| O2.4 degradación widget /config + timeouts Brevo/Telegram/integraciones (RESIL-05, RESIL-06, RESIL-08, RESIL-10) | RESILIENCIA | P1 | S/M | sí |
| Limpieza dead code getN8nMetrics/mock (candidato) | RESILIENCIA | P1 (refactor) | S | no |
| Idempotency key en createBooking Cal.com (RESIL-12) | RESILIENCIA | P2 | S | no |
| O3.0 Sentry vivo en prod (DSN + smoke + 1 alert rule) | OBSERVABILIDAD | P0 | S | sí |
| O3.1 Uptime externo + dead-man's-switch de crons + limpiar netlify.toml fantasma | OBSERVABILIDAD | P0 | S | sí |
| O3.2 Telemetría LLM completa (modelo/turno, endedAt, consumers briefs/insights, cleanup eventos) | OBSERVABILIDAD | P1 | M | sí |
| O3.3 Rollup costo/cliente + margen vs Plan.monthlyPrice + umbral de gasto | OBSERVABILIDAD | P1 | M | no |
| O3.4 correlationId + tags Sentry consistentes en chatbot | OBSERVABILIDAD | P1 | S | no |
| O3.5 Logger estructurado del portal + lint no-console | OBSERVABILIDAD | P1 | M | no |
| O3.6 Gate de /api/test-sentry + decisión Langfuse documentada | OBSERVABILIDAD | P2 | S | no |
| O5.1 a11y — teclado del widget + nombres accesibles + labels forms (A11Y-01, A11Y-02) | CALIDAD | P0 | M | sí (re-correr kbd-test + Lighthouse) |
| O5.1b a11y — criterio de contraste en tokens del rediseño (A11Y-03) + 3D aria-hidden/reduced (A11Y-04) | CALIDAD | P1 | S | sí (post-rediseño) |
| O5.2 compat — useWebGLAvailable + poster compartido con P5.1 + browserslist (COMP-01, COMP-02) | CALIDAD | P1 | S | sí (re-correr nowebgl-probe) |
| O5.3 SEO — OG images + robots/sitemap + lang="es" + noindex utilitarias (SEO-01/02/03) | CALIDAD | P1 | S | no |
| O5.3b SEO — canonicals + largos title/desc + JSON-LD (SEO-04/05) | CALIDAD | P2 | S | no |
| O5.4 legal — piezas legales + aviso widget/forms + retención/ARCO (LEG-01, LEG-02, LEG-03) | CALIDAD | P0 | M | sí (SSR-curl de avisos) |

## Limitaciones de la corrida (honestas, verificables)

- **Motor 360dialog (B1-S1/S2/S3) NO está en `main@6254428`** — vive en las ramas `b1-*`. SEC lo marca para re-auditar al mergear; DATOS ya mapeó el drift esperable (7 tablas + 12 enums DB-only en la branch dev de Neon).
- **DB**: todo lo medido fue contra la branch **dev** de Neon (la del `.env` local). `migrate status` contra PROD queda pendiente (decisión/acceso de Franco). Plan de Neon y ventana PITR exacta: a confirmar en el dashboard.
- **PERF/CALIDAD**: datos de **LAB** (Windows 11 local, RTX 5070 Laptop, Lighthouse 12 headless + Playwright Chromium). El score desktop del home no fue computable (`SPEEDINDEX_OF_ZERO` en 2 intentos; FCP/LCP/TBT/CLS del retry sí válidos, documentado en el lente). `/forgot-password` excluida de la batería (gemela estática de `/login`).
- **Preloader**: `PreloaderContext.tsx:70-85` saltea el preloader cuando `navigator.webdriver === true` → los CWV de la batería miden la página SIN preloader; la experiencia real de primer load se midió aparte (lente PERF §4).
- **`/security-scan` (ECC)**: audita superficies del harness (agentes/hooks/MCP/permisos), no la app; no es ejecutable desde subagentes. Corrida separada recomendada a Franco.
- **SEC-LLM-01/03**: sus únicas coberturas son el runner conversacional con LLM vivo (no corrido acá; sin CI). Por eso 3.1 los prioriza como invariants puros.
- **A11y**: sin lector de pantalla real (NVDA/TalkBack) en esta pasada; contraste calculado sobre TOKENS (no píxeles) a propósito — el diseño sigue inestable y el criterio sobrevive al rediseño.
- **Netlify**: env de prod inaccesible desde el repo (solo nombres de vars verificados, jamás valores); plan de Netlify (timeout real de functions) a confirmar — define el techo del deadline-budget de O2.x.
- **Operativo**: la corrida se interrumpió dos veces por límite de sesión del harness; cada lente re-corrió COMPLETO después — ningún reporte quedó a medias (verificado: los 7 archivos cierran con su tabla-programa).

## Decisiones humanas pendientes (consolidado — el detalle vive en cada lente)

| # | Decisión | Lente | Bloquea |
|---|---|---|---|
| 1 | Cargar los 2 secrets de `db-backup.yml` (`DIRECT_DATABASE_URL_PROD`, `BACKUP_GPG_PASSPHRASE`) y disparar el primer run | DATOS | O1.1a — **el único P0 de pérdida de datos irreversible** |
| 2 | Confirmar plan de Neon + ventana PITR en dashboard; evaluar Launch ($19/mes, 7 días) | DATOS | O1.1 |
| 3 | Verificar/cargar `NEXT_PUBLIC_SENTRY_DSN` en Netlify prod | OBSERVABILIDAD | O3.0 |
| 4 | Identificar el scheduler real de los 7 crons + limpiar los bloques fantasma de `netlify.toml:25-29` | OBS + RESIL | O3.1 / O2.5 |
| 5 | Confirmar plan de Netlify (timeout de functions) | RESILIENCIA | O2.1/O2.4 |
| 6 | Piezas legales: mapear los 18 docs externos → política/ToS/aviso del widget; validación de abogado; TTL de retención (sugerido 12-24 meses) | CALIDAD + SEC | O5.4 / 3.3 |
| 7 | SSRF n8n: lookup-antes-de-fetch vs pinning undici | SEC | 3.2 |
| 8 | Langfuse: diferir (recomendado) vs adoptar, y modalidad (cloud EU vs self-host) | OBSERVABILIDAD | O3.6 |
| 9 | ¿Eliminar el barrel cliente `chatbot/index.ts`? (recomendado: sí) · ¿react-email preview se usa? | ARQ | 4.3 / 4.4 |
| 10 | Decisión de producto sobre el preloader (duración/holds) | PERF | sprint preloader |
| 11 | Umbral USD mensual de gasto LLM para la alerta | OBSERVABILIDAD | O3.3 |
| 12 | Matriz de soporte (Chrome Android gama media + WebView WhatsApp/IG como prioridad ALTA) | CALIDAD | O5.2 |

## Nota metodológica del re-check post-P1

Los mapas perecederos (ARQ §MAPA, PERF §MAPA, tabla anti-boundary) se refrescan post-limpieza con los comandos copy-paste documentados en cada lente (depcruise/knip/route-weights/lighthouse-battery). La columna "re-check post-P1" de la tabla de arriba marca qué sprints deben re-medir antes de ejecutar. Ese refresh lo puede hacer un modelo menor: los comandos exactos y los archivos de salida esperados están en cada sección MAPA.
