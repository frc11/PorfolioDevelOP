# Revalidación 2026-06 — estado real vs auditorías de mayo

**Fecha:** 2026-06-05 · **Tipo:** Report-only (cero cambios, cero migraciones, cero escrituras).
**Commit:** `82185b0` (HEAD = `origin/main`). · **Método:** lectura de código + DB viva (probes read-only) + `git log` + `npm audit` + build + Playwright + HTTP al bot.
**Insumos:** `2026-05-auditoria-profunda.md`, `auditoria-seguridad-2026-05.md`, `2026-05-auditoria-db.md`, `2026-05-cleanup-db-dev.md`, `2026-05-bfg-leak-cleanup.md`.

> Regla aplicada: se confía en el **código y la DB de hoy**, no en los `.md` de estado.

---

## Resumen ejecutivo — qué quedó REALMENTE por hacer

Desde mayo se cerró la gran mayoría del tablero (P0/P1, ~10 de seguridad, los 3 DB-P0). Pero hay **3 cosas rojas** que bloquean producción y **2 deudas operativas** que el equipo cree cerradas y no lo están:

🔴 **1. El chatbot está CAÍDO — HTTP 500 en cada mensaje.** (NUEVO-P0)
Casing del provider: el enum Prisma `LlmProvider` guarda `GOOGLE` (los 4 bots), pero el factory `getLLMProvider()` solo conoce `'google'`. `handleChatRequest.ts:524` pasa `bot.llmProvider as LLMProviderName` — el cast `as` enmascaró el mismatch → `throw 'Unknown LLM provider: GOOGLE'`. Reproducido hoy (HTTP 500). Sin mensajes exitosos en la DB desde **2026-05-23**. **Fix de 1 línea.**

🔴 **2. `npm run build` no compila.** (NUEVO-P0) — `@googleapis/webmasters` declarado pero **no instalado**; `node_modules` desfasado (Next **16.2.1** instalado vs `^16.2.6` declarado). **`npm install` lo arregla.** (El fix `maxTokens→maxOutputTokens` SÍ se aplicó — ver abajo; el build ahora rompe en otro punto.)

🔴 **3. Health/smoke del bot dan 503 falso-negativo.** (NUEVO-P1) — `checkHealth.ts` exige `CHATBOT_GOOGLE_API_KEY`, pero el runtime usa Vertex (`createVertex`). Monitoreo inservible.

🟠 **4. El secret `enviroment.env` SIGUE en la history del remote.** El purgado con `git-filter-repo` se preparó en un mirror throwaway pero **nunca se force-pusheó**. La key estaba deshabilitada (mitiga), pero la higiene quedó a medias.

🟠 **5. La app corre contra la branch Neon `dev`, no `main`/prod.** Los cleanups del 21-may están en `dev`; su replicación a `main` quedó pendiente (no verificable sin la URL de prod).

**Lo demás está sano:** captura de lead email+phone, planes, OAuth HMAC, sessionVersion, rate-limit atómico, forgot-password, CRM sync, enums, índices, `npm audit` en 2 moderate. La arquitectura del bot funcionaba bien hasta el 23-may; un bug de casing la tiró.

---

## PARTE A — Estado real de la base y los cleanups

| # | Pregunta | Respuesta (evidencia viva 2026-06-05) | Estado |
|---|---|---|---|
| A.1 | ¿A qué host/branch de Neon apunta la app? | `DATABASE_URL` host = **`ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech`**. Según `cleanup-db-dev.md:4` ese host es la **branch `dev`** de Neon. → **la app corre contra `dev`, no `main`/prod.** | ⚠️ dev |
| A.2 | ¿Sigue pendiente `20260520190000_add_alert_types`? | **NO.** `_prisma_migrations`: `finished_at = 2026-05-21T22:52`. **0 pendientes** (56 aplicadas). *(El CLI `prisma migrate status` tira `P1001` por un quirk de conexión del pooler; `_prisma_migrations` es la fuente autoritativa.)* | ✅ aplicada |
| A.3a | ¿Cuántas orgs? ¿siguen las 2 `agency-os-cmnki...`? | **6 orgs** (san-miguel, ejemplo, develop, empresa-demo, matsu, qa-cliente-b). Duplicadas `agency-os-cmnki*`: **0 (NINGUNA)**. | ✅ limpio |
| A.3b | ¿Projects con `organizationId` NULL? | **0** (`SELECT count(*) WHERE organizationId IS NULL` = 0; además el schema ya es NOT NULL — B11.1). | ✅ limpio |
| A.3c | ¿El bot `chatbot` está inactivo? ¿`dsa` ya no existe? | `chatbot` → **`isActive: false`** ✓. Bot `dsa` → **no existe** (`count{slug:'dsa'}` = 0) ✓. | ✅ limpio |
| A.3 | **¿Los cleanups del 21-may están presentes o se perdieron?** | **PRESENTES.** Las 4 verificaciones (orgs dup, orphans, `chatbot` inactivo, `dsa` borrado) coinciden con `cleanup-db-dev.md §4`. La app sigue en la branch `dev` donde se ejecutaron → **no se perdieron.** *(matsu y sanmiguel se agregaron después: hoy hay 4 bots vs los 2 post-cleanup.)* | ✅ presentes |
| A.4 | ¿El secret de `enviroment.env` sigue en el history del remote? | **SÍ.** Commit infectado `3953558` es **ancestro de `origin/main`** (`merge-base --is-ancestor` → exit 0); `logic-core-v3/enviroment.env` es reachable desde `origin/main` (commits `3953558`, `c351b79`). El HEAD purgado del mirror (`14dc98f`) **no existe** en el repo → la purga nunca se trajo. `.gitignore:39` ya cubre `*enviroment*`. Key **deshabilitada** según `bfg-leak-cleanup.md`. | 🟠 ABIERTO |

**Conclusión Parte A:** la DB activa (branch `dev`) está limpia y migrada — los cleanups del 21-may resistieron. Las dos deudas son **operativas, fuera de la DB**: (1) el force-push del purgado del secret nunca se hizo (el secret vive en `origin/main`), y (2) los cleanups no se replicaron a la branch `main`/prod de Neon (no verificable desde acá).

---

## PARTE B — Tablero consolidado (ESTADO vs mayo)

> ABIERTO / CERRADO / PARCIAL / **NUEVO**. Evidencia = `archivo:línea`.

### Hallazgos NUEVOS (no estaban en mayo)

| ID | Hallazgo | ESTADO | Evidencia |
|---|---|---|---|
| **N-1** | **Bot caído: HTTP 500 en cada chat** (casing `GOOGLE`≠`google`, cast `as` lo tapa) | 🔴 NUEVO | `handleChatRequest.ts:524,642`; `llm/factory.ts:28-42`; `schema.prisma:1115` `llmProvider LlmProvider @default(GOOGLE)`; `shared/types:45` union lowercase. Repro live 500 + DB: 0 éxitos desde 2026-05-23. |
| **N-2** | `npm run build` roto: `@googleapis/webmasters` no instalado + Next 16.2.1 vs ^16.2.6 | 🔴 NUEVO | `npm run build` → "Can't resolve '@googleapis/webmasters'" en `searchconsole.ts:2`. `npm ls next` → `16.2.1 invalid`. Fix: `npm install`. |
| **N-3** | Health/smoke 503 falso-negativo (chequea API key legacy, runtime usa Vertex) | 🔴 NUEVO | `checkHealth.ts:40,55` vs `providers/google.ts:47-80`. Probado: `/health` y `/smoke` develop → 503. |
| **N-4** | `Subscription.planName` coexiste con `planId` (doble fuente de verdad) | 🟠 NUEVO | `schema.prisma:577-579`; DB: subs con `planName="Business"` + `planId` poblado. |

### P0 (auditoría profunda)

| # | ESTADO | Evidencia |
|---|---|---|
| P0-1 cliente sin bot | ✅ CERRADO | bot `sanmiguel` activo (seed). *(0 tráfico aún.)* |
| P0-2 migration pendiente | ✅ CERRADO | aplicada 2026-05-21; 0 pendientes. |
| P0-3 visual regression | ⚪ NO VERIFICADO | sin `test-results/` (sin last-run); `22-visual` excluido (dev-mode). |
| P0-4 AIExecutiveBrief sin flag/badge | 🟡 PARCIAL | `executive-brief.ts:11` `gemini-2.5-flash`; historial `ExecutiveBriefSnapshot` ✅; sin feature-flag por plan ni badge "IA". |
| P0-5 `Project.organizationId` nullable | ✅ CERRADO | `schema.prisma:500` NOT NULL; DB orphans=0. |
| P0-6 queries admin sin scoping | 🟡 PARCIAL | `admin/chatbots/[botId]/page.tsx:36`, `admin/projects/[projectId]/page.tsx:97` `findUnique` sin org; mitigado por `requireSuperAdmin`. |
| P0-7 capture_lead pierde contacto | ✅ CERRADO | `captureLead.ts:84-190` guarda email+phone; DB 19/66 con ambos. |
| **maxTokens→maxOutputTokens** (caso pedido) | ✅ CERRADO | `executive-brief.ts:304` `maxOutputTokens: BRIEF_MAX_OUTPUT_TOKENS`; sin `maxTokens`. **Build ya no rompe ahí** (ahora rompe en webmasters, N-2). |

### P1 (profunda) — resumen

CERRADO: P1-3 (EmptyState ×6), P1-4 (forgot-password `forgot-password/actions.ts:24-110`), P1-5 (rate-limit atómico `lib/rate-limit/limiter.ts:37-84`), P1-10, P1-11, P1-13 (CRM sync `captureLead.ts:290`→`syncLeadToCrm`).
PARCIAL: P1-1/P1-2 (error/loading 18/26 de 59, faltan en `/dashboard/chatbot/{conversations,install,leads/[id]}`), P1-7/P1-8 (mock SEO/analytics con flag `isMockData` pero sin badge UI), P1-9 (health-score trend placeholder).
ABIERTO: P1-12 (4 server actions sin Zod: `toggleBotActiveAction`, `regenerateBriefAction`, `saveOnboardingProfile`, `createClientAction`).

### P2 (profunda) — resumen

CERRADO: P2-5 (`prisma.config.ts`), P2-7 (dirs vacíos), P2-9 (`unlockedFeatures` dropeada). PARCIAL: P2-2 (`any` 18→7), P2-3 (legacy chatbot → 1 catchall), P2-12 (TODOs 12→2). ABIERTO: P2-1 (3 `framer-motion`), P2-6 (10 scripts basura raíz), P2-8 (10 componentes dead-code). FALSO-POSITIVO: P2-11 (console.log de captureLead = logging estructurado). NO VERIFICADO: P2-4 (Sentry warnings — build no completó).

### DB (auditoría db)

CERRADO: DB-P0-1 (modelo `Plan` + `planId` FK, 3 planes), DB-P0-2 (migration), DB-P0-3 (NOT NULL), DB-P1-2 (enums `ChatMessageRole`/`ChatbotLeadIntent`/`ChatbotEventLevel`), DB-P1-3 (`unlockedFeatures` drop), DB-P1-4 (`clientId→organizationId`), DB-P1-7/8 (índices).
ABIERTO: DB-P1-1 (métricas denormalizadas sin helper único), DB-P1-2e/N-4 (`planName` coexiste), DB-P1-5 (AdminAuditLog sin targetOrgId), DB-P1-6 (LeadStatus sin doc), DB-P2-1..5 (índices redundantes / shapes JSON).
**Modelos nuevos bien scoped:** `Plan` (global), `CrmIntegration`/`CrmSyncAttempt`/`ExecutiveBriefSnapshot`/`WeeklyReportLog` (orgId ✓), `RateLimit` (global).

### Seguridad (32 SEC-*)

**CERRADOS (~10+):** SEC-DEP-01 (Next ^16.2.6 declarado; `npm audit` = **2 moderate**, el P0 de mayo estaba sobredimensionado — ⚠️ pero el instalado sigue 16.2.1, ver N-2), SEC-DEP-02/03 (protobufjs/defu/effect ya no aparecen), SEC-AUTH-01/02 (OAuth HMAC `signOAuthState`/`verifyOAuthState`), SEC-AUTH-03 (`sessionVersion`), SEC-RATELIMIT-01 (atómico DB), SEC-LLM-06/07 (Zod en tools), SEC-SECRETS-01 (falso positivo). Checklist heredado F2/F3/F4/F7/QA-bypass/JWT/rate-limit/getGlobalBots: **todos CERRADOS**.
**ABIERTOS (P1):** SEC-AUTH-04 (sin `middleware.ts`), SEC-RATELIMIT-02 (key con `sessionId` controlable), SEC-LLM-01/02/03/04 (delimitadores, PII a Vertex, capture_lead pertenencia, prompt completo), SEC-MISC-01/02 (headers globales, cookies), SEC-PII-01 (**confirmado**: email en claro en `notify-message.ts:62`), SEC-PII-02/03 (disclaimers widget).
**PARCIALES:** SEC-SSRF-01 (valida config-time, deuda DNS-rebinding), SEC-DEP-04 (1 postcss moderate), SEC-LLM-05.
**P2 abiertos:** SEC-AUTH-05/06/07/08, SEC-CACHE-01/02, SEC-LOGGING-01, SEC-INJ-01.
**NUEVO (relacionado a A.4):** el secret de `enviroment.env` sigue en `origin/main` (purga sin force-push).

---

## PARTE C — Caja negra acotada

### Bot `develop` (HTTP, dev `:3002`)

| Endpoint | Resultado | Nota |
|---|---|---|
| `GET /api/chatbot/develop/health` | **503** | env✅ database✅ bot✅ · **llmProvider❌** (`CHATBOT_GOOGLE_API_KEY missing`) → falso-negativo (N-3). |
| `GET /api/chatbot/develop/smoke` | **503** `stage:"health"` | bloqueado por el health falso-negativo; nunca llega al LLM. |
| `POST /api/chatbot/develop/chat` | **HTTP 500** (`Unknown LLM provider: GOOGLE`, ~10s) | bot caído (N-1). **Sin 429** — el 500 ocurre antes de saturar el rate-limit. |

### E2E Playwright (subset read-only contra `:3002`)

**Resultado: 12 passed / 7 failed / 1 did-not-run (2.7 min).** Subset read-only de 12 specs (evitando mutantes onboarding/config/lead para no escribir en la DB `dev` activa). Config throwaway apuntando a `:3002` (el `:3000` lo ocupa otro proyecto, `EsquinaWeb`).

✅ **Pasa el núcleo admin + dashboard:** login admin + navegación entre secciones (07), rechazo de login sin credenciales (06), RBAC cliente↛admin (11) + anónimo↛`/admin`,`/dashboard` (19), API cron exige secret (19), alerts 3 columnas (17), audit-log carga + filtro (18), dashboard cliente + "mi chatbot" dentro del budget warm (13), config pública **sin filtrar** `apiKey`/`llmProvider` (05).

❌ **Fallan (7):** `04-health` (assert `status<500` → **503**, **confirma N-3**); `07:33` (rutas del bot), `11:5` ("Mi Chatbot" no visible), `01-landing` — degradadas por el **bot caído** (N-1) y/o selectores; `06:5` (texto KPI del home admin), `20-mobile` ×2, `21-performance` — drift de selectores/copy o budget (**triage manual**). Corrida en dev-mode con el bot caído (`04` espera 200), no representa regresión de producto salvo `04`.

**Huecos de cobertura (sin E2E):** gating por plan (modelo `Plan`), CRM sync (`CrmIntegration`/`CrmSyncAttempt`), forgot/reset password, aislamiento cross-org, módulos premium del dashboard, alertas CRUD, quota enforcement del bot.

---

## No verificado (con motivo)

| Ítem | Motivo |
|---|---|
| Replicación de cleanups a Neon `main`/prod | No tengo la URL de la branch `main`; la app apunta a `dev`. `cleanup-db-dev.md §6` deja los pasos pendientes. |
| `prisma migrate status` (CLI) | `P1001` (quirk pooler/CLI). Compensado leyendo `_prisma_migrations` (0 pendientes). |
| Build deployable en CI/Netlify | Build local roto (N-2); no corrí `npm install` (alteraría `package-lock`). |
| 8 escenarios guionados del bot | Chat da 500 (N-1) — se root-causeó en vez de correrlos. |
| P0-3 visual regression | Sin `test-results/`; dev-mode no comparable a baselines de prod. |
| E2E mutantes (onboarding/config/lead) | No corridos: la DB Neon `dev` es la activa y esos specs escriben orgs/users/edits. |

---

## Qué hacer (priorizado, NO ejecutado)

1. 🔴 **N-1 (1 línea):** normalizar provider en `handleChatRequest.ts:524,642` (`.toLowerCase()` o mapear enum→union) y **borrar el cast `as`**. Verificar con `/smoke`.
2. 🔴 **N-2:** `npm install` (instala webmasters + sube Next a 16.2.6); re-correr `npm run build`.
3. 🔴 **N-3:** alinear `checkHealth.ts` con Vertex (`GOOGLE_APPLICATION_CREDENTIALS`/`CHATBOT_GCP_PROJECT_ID`, no `CHATBOT_GOOGLE_API_KEY`).
4. 🟠 **A.4:** completar el force-push del purgado del secret (runbook `bfg-leak-cleanup.md §8.3`) — la key está deshabilitada, pero el secret sigue en `origin/main`.
5. 🟠 **A.1/A.3:** replicar los cleanups a la branch Neon `main`/prod (`cleanup-db-dev.md §6`) y decidir si la app debe apuntar a `dev` o `main`.
6. 🟡 P0-4 (badge IA + flag), P1-12 (Zod ×4), P0-6 (helper `assertResourceBelongsToOrg`), N-4 (dropear `planName`).
7. 🟢 limpieza: 3 `framer-motion`, 10 scripts raíz, 10 dead components.

---

*Report-only confirmado. Cero código/schema/migraciones/escrituras de producto. Scripts `_audit_*` temporales eliminados al cierre.*
