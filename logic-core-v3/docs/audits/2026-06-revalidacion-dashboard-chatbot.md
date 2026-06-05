# Revalidación dashboard + chatbot — Logic Core v3

**Fecha:** 2026-06-04 · **Tipo:** Report-only (cero cambios de código, cero migraciones, cero escrituras a producto)
**Método:** caja blanca (5 subagentes Explore paralelos) + caja negra automatizada (Playwright) + caja negra del bot (HTTP + evidencia de DB viva) + `npm audit` + build.
**Base previa:** `docs/audits/2026-05-auditoria-profunda.md`, `docs/auditoria-seguridad-2026-05.md`, `docs/audits/2026-05-auditoria-db.md`, `docs/baselines/2026-05-chatbot-runtime.md`.
**Commit auditado:** `82185b0` (HEAD, branch `main`). Delta desde la auditoría de mayo (`7d551ba`): **455 archivos, +61k/−8.5k líneas.**
**Entorno:** Windows 11, Neon `neondb` host `ep-quiet-waterfall-acv0fpll` (sa-east-1) — **distinto** al de mayo (`ep-rapid-mode-ac5ex84b`): la DB fue re-seedeada/migrada.

> **Regla aplicada:** se confía en el CÓDIGO y la DB viva, no en los `.md` de estado. Donde el entorno no permitió verificar, está marcado en §5 "No verificado".

---

## 0. Veredicto ejecutivo

**El proyecto avanzó muchísimo desde mayo** — la mayoría de los P0/P1 y casi todos los hallazgos de seguridad están **cerrados**. Pero hay **un defecto P0 nuevo y catastrófico** que invalida el corazón del producto, más dos problemas de entorno/deploy que hay que resolver antes de cualquier release.

### 🔴 Lo que está ROTO (acción inmediata)

1. **EL CHATBOT ESTÁ CAÍDO. Devuelve HTTP 500 en CADA mensaje.** (NUEVO-P0-1)
   Mismatch de casing del provider: el enum Prisma `LlmProvider` guarda `GOOGLE` (mayúsculas) y los 4 bots lo tienen así, pero el factory `getLLMProvider()` solo conoce `'google'` (minúsculas). `handleChatRequest.ts:524` hace `getLLMProvider(bot.llmProvider as LLMProviderName)` — el cast `as` **enmascaró** el mismatch. Resultado: `throw new Error('Unknown LLM provider: GOOGLE')` → 500.
   **Evidencia de DB viva:** último mensaje exitoso `chat.message_completed` = **2026-05-23**; errores `"Unknown LLM provider: GOOGLE"` el 2026-05-27 y **2026-06-03 (×4, ajenos al auditor)**, más la reproducción del auditor el 2026-06-05. **Cero mensajes exitosos en ~12 días.** (La DB Neon es compartida dev+prod; sea deploy o dev local, el código en HEAD produce 500 — reproducido.) Afecta a `matsu` (cliente real, 64 leads históricos), `develop`, `sanmiguel` y `chatbot`.

2. **`npm run build` FALLA.** (NUEVO-P0-2)
   `@googleapis/webmasters` está declarado en `package.json` (`^4.0.0`) pero **no instalado** en `node_modules`; lo importa `src/lib/searchconsole.ts:2` (vía `api/reports/monthly`). Además `node_modules` está **desfasado**: Next instalado = **16.2.1** (el banner del build lo confirma) vs `^16.2.6` declarado. Falta correr `npm install`. Sin build no hay deploy de producción del árbol actual.

3. **Health/smoke del bot dan 503 falso-negativo.** (NUEVO-P1-1)
   `checkHealth.ts:40,55` exige `CHATBOT_GOOGLE_API_KEY`, pero el runtime real usa **Vertex** (`createVertex`, solo necesita `CHATBOT_GCP_PROJECT_ID` + `GOOGLE_APPLICATION_CREDENTIALS`). El health check chequea una env var legacy que el provider ya no usa → `/health` y `/smoke` reportan `llmProvider:false` aunque la config de Vertex esté completa. Monitoreo de uptime inservible.

### 🟢 Lo que está SANO (cerrado desde mayo)

- **Captura de lead (P0-7):** ahora guarda `email` Y `phone` por separado — **19 de 66 leads tienen ambos** en la DB. Módulo `scoring/` nuevo (score, DQ filter, validación de teléfono AR).
- **Cliente piloto (P0-1):** `san-miguel` ya tiene bot (`slug=sanmiguel`, activo) — creado en seed. *(Caveat: 0 tráfico todavía; nunca recibió un mensaje real.)*
- **Migración pendiente (P0-2):** `20260520190000_add_alert_types` **aplicada** el 2026-05-21. **0 migraciones pendientes** (56 aplicadas).
- **`Project.organizationId` (P0-5):** ahora `NOT NULL` (migration `b11_1`), confirmado a nivel de tipos.
- **Sistema de planes (DB-P0-1):** modelo `Plan` creado (3 planes sembrados), `Subscription.planId` FK **backfilleada** (ambas subs → "Business"). Gating cableado en `handleChatRequest` (`getPlanForOrg` + degraded mode B4.2).
- **Seguridad — 10+ hallazgos cerrados:** OAuth state HMAC (SEC-AUTH-01/02), `sessionVersion` post-reset (SEC-AUTH-03), **rate-limit atómico en Postgres** (SEC-RATELIMIT-01/P1-5), Next.js bumpeado en package.json. **`npm audit` pasó de 15 vulns (1 crítica + 5 high + 9 mod) a SOLO 2 moderate** (postcss transitivo) — el P0 de Next de mayo estaba **sobredimensionado**.
- **Dependencias de UX:** forgot-password automatizado (P1-4), EmptyState en las 6 listas (P1-3), CRM sync n8n cableado (P1-13), `unlockedFeatures` dropeada (P2-9/DB-P1-3), enums encubiertos promovidos (DB-P1-2), `clientId→organizationId` (DB-P1-4), índices faltantes agregados (DB-P1-7/8), `prisma.config.ts` (P2-5).
- **Deuda estática reducida:** `any` types 18→7, TODOs 12→2.

### 🟡 Lo que FALTA (deuda persistente, no bloqueante)

- Admin queries sin scoping defensivo por org (P0-6, mitigado por `requireSuperAdmin`).
- AIExecutiveBrief sin feature-flag por plan ni badge "Generado por IA" (P0-4; ahora usa `gemini-2.5-flash`, ya tiene historial `ExecutiveBriefSnapshot`).
- 4 Server Actions sin Zod (P1-12). Mock data sin badge visible al cliente (P1-7/8). `error.tsx`/`loading.tsx` parcial en `/dashboard/**` (P1-1/2).
- Hardening de seguridad abierto: sin `middleware.ts` global (SEC-AUTH-04), sin headers globales (SEC-MISC-01), sin delimitadores/redaction PII en prompts (SEC-LLM-01/02), sin disclaimers en widget (SEC-PII-02/03), DNS-rebinding SSRF (SEC-SSRF-01).
- Limpieza: 3 imports `framer-motion`, 10 scripts basura en raíz, 10 componentes dead-code, `Subscription.planName` coexiste con `planId` (doble fuente de verdad).

**Recomendación dura:** **NO mostrar el bot a ningún cliente hasta arreglar NUEVO-P0-1** (1 línea: normalizar el provider a minúsculas, o mapear el enum). Arreglar el build (NUEVO-P0-2: `npm install`) antes de cualquier deploy. Lo demás es deuda gestionable.

---

## 1. Tablero priorizado con ESTADO (vs mayo)

> ESTADO: **CERRADO** = resuelto · **ABIERTO** = sigue igual · **PARCIAL** = avanzó pero queda algo · **NUEVO** = no estaba en mayo.

### P0 — Bloqueante / seguridad / corazón del producto

| # | Hallazgo | ESTADO | Evidencia |
|---|---|---|---|
| **NUEVO-P0-1** | **Bot caído: HTTP 500 en cada chat.** Casing `GOOGLE` (enum) vs `'google'` (factory), cast `as` lo enmascara. | 🔴 **NUEVO** | `handleChatRequest.ts:524,642`, `llm/factory.ts:28-42`, `schema.prisma:1115` (`llmProvider LlmProvider @default(GOOGLE)`), `shared/types:45`. DB: 0 éxitos desde 2026-05-23; errores el 06-03 (×4) y repro 06-05. |
| **NUEVO-P0-2** | **`npm run build` falla:** `@googleapis/webmasters` no instalado (declarado `^4.0.0`); `node_modules` desfasado (Next 16.2.1 vs `^16.2.6`). | 🔴 **NUEVO** | `_audit_build2.log`: "Module not found: Can't resolve '@googleapis/webmasters'" en `searchconsole.ts:2`. `npm ls next` → `16.2.1 invalid: "^16.2.6"`. |
| P0-1 | Cliente San Miguel sin bot | ✅ **CERRADO** | DB: bot `sanmiguel` (Lucía) activo, org `san-miguel`. Seed `prisma/seed.ts`. *(0 tráfico aún)* |
| P0-2 | Migration `add_alert_types` sin aplicar | ✅ **CERRADO** | `_prisma_migrations`: aplicada 2026-05-21; 0 pendientes. |
| P0-3 | Visual regression `dashboard-settings` falló | ⚪ **NO VERIFICADO** | Test existe (`22-visual-regression.spec.ts:118`). No hay carpeta `test-results/` (sin last-run). Ver §5. |
| P0-4 | AIExecutiveBrief LLM real sin flag/badge | 🟡 **PARCIAL** | `executive-brief.ts:11` ahora `gemini-2.5-flash`; historial `ExecutiveBriefSnapshot` ✅; **sin** feature-flag por plan ni badge "IA". |
| P0-5 | `Project.organizationId` nullable | ✅ **CERRADO** | `schema.prisma:500` `String` NOT NULL (migration `b11_1`). Confirmado a nivel tipo. |
| P0-6 | Queries admin sin scoping defensivo | 🟡 **PARCIAL** | `admin/chatbots/[botId]/page.tsx:36` y `admin/projects/[projectId]/page.tsx:97` siguen `findUnique({where:{id}})` sin org. Mitigado por `requireSuperAdmin`. Cliente-facing sí scoped. |
| P0-7 | capture_lead pierde email O phone | ✅ **CERRADO** | `captureLead.ts:84-87` refine `phone OR email`, `:137-190` persiste ambos. DB: 19/66 leads con email Y phone. |

### P1 — Gap funcional

| # | Hallazgo | ESTADO | Evidencia |
|---|---|---|---|
| **NUEVO-P1-1** | Health/smoke 503 falso-negativo (chequea `CHATBOT_GOOGLE_API_KEY`, runtime usa Vertex) | 🔴 **NUEVO** | `checkHealth.ts:40,55` vs `providers/google.ts:47-63`. `/health` develop → `llmProvider:false`. |
| **NUEVO-P1-2** | `Subscription.planName` coexiste con `planId` (doble fuente de verdad) | 🔴 **NUEVO** | `schema.prisma:577-579`. DB: subs tienen ambos (`planName="Business"` + `planId`). |
| P1-1 | Rutas sin `error.tsx` | 🟡 **PARCIAL** | ~18/59 con `error.tsx` (vs 9/65). Faltan `/dashboard/chatbot/{conversations,install,leads/[id]}`. |
| P1-2 | Rutas sin `loading.tsx` | 🟡 **PARCIAL** | ~26/59 (vs 13/65). Dashboard: 16. Faltan las mismas 3 subrutas chatbot. |
| P1-3 | Listas sin EmptyState | ✅ **CERRADO** | `lead-pipeline`, `conversation-list`, `inbound-leads-table`, `task-list`, `client-list`, `time-entry-panel` importan `EmptyState`. |
| P1-4 | Sin "olvidé contraseña" auto | ✅ **CERRADO** | `forgot-password/actions.ts:24-110` (Zod + rate-limit + token 45min + email Brevo). |
| P1-5 | Rate limiter in-memory en serverless | ✅ **CERRADO** | `lib/rate-limit/limiter.ts:37-84` UPSERT atómico Postgres `ON CONFLICT` (B14.1). |
| P1-7 | `/dashboard/resultados/seo` mock como real | 🟡 **PARCIAL** | `seo/page.tsx:188` comentario sigue; `isMockData` flag existe en payload pero **sin badge visible**. |
| P1-8 | analytics/searchconsole/n8n mock silencioso | 🟡 **PARCIAL** | `analytics.ts:99`, `searchconsole.ts:104`, `n8n.ts:260` devuelven `isMockData:true` pero componentes no lo muestran. |
| P1-9 | health-score placeholders | 🟡 **PARCIAL** | `health-score.ts:454` trend = placeholder dummy (sin historial en DB). |
| P1-10 | Insights AI placeholder en ChatbotOverview | ✅ **CERRADO** | Ya no aparece en `ChatbotOverview.tsx`. |
| P1-11 | `/admin/chatbots` sin error.tsx | ✅ **CERRADO** | Tiene loading + error boundary. |
| P1-12 | Server actions sin Zod | 🟠 **ABIERTO** | `toggleBotActiveAction`, `regenerateBriefAction`, `saveOnboardingProfile`, `createClientAction` siguen sin Zod (4/4). |
| P1-13 | onLeadCaptured no dispara n8n | ✅ **CERRADO** | `captureLead.ts:290` → `syncLeadToCrm()`; modelos `CrmIntegration`/`CrmSyncAttempt`. *(0 integraciones configuradas en DB todavía.)* |

**Nuevos P1 funcionales (subagente):** sin loading/error en `/dashboard/chatbot/leads/[id]` (P1-15); mock SEO/analytics sin banner UI (P1-16); CRM sync sin UI para ver fallos/reintentos `CrmSyncAttempt` (P1-17); `deleteClientAction` sin Zod ni confirm explícito (P1-18).

### P2 — Polish / consistencia

| # | Hallazgo | ESTADO | Nota |
|---|---|---|---|
| P2-1 | 3 imports `framer-motion` | 🟠 **ABIERTO** | `KineticText.tsx`, `About.tsx`, `Portfolio.tsx`. |
| P2-2 | 18 violaciones TS estricto | 🟡 **PARCIAL** | Bajó a **7** (`ClientSettingsForm.tsx:25,36`, `generate-insights/route.ts:57`, `SessionsChart.tsx:27`, `pagespeed.ts:77`, `project/page.tsx:119`, `LegacyNeuroAvatar`). |
| P2-3 | 7 rutas legacy chatbot | 🟡 **PARCIAL** | Consolidadas a 1 catchall `[[...tab]]`. |
| P2-4 | Sentry warnings deprecados | ⚪ **NO VERIFICADO** | Build no completó (NUEVO-P0-2). Banner no mostró los 3 warnings de mayo. |
| P2-5 | `package.json#prisma` deprecado | ✅ **CERRADO** | `prisma.config.ts` existe. |
| P2-6 | Archivos basura en raíz | 🟠 **ABIERTO** | 10 scripts (`script*.js`, `replace_analytics.js`, `find_unused.js`) + `.bak`. |
| P2-7 | 2 dirs vacíos | ✅ **CERRADO** | `chatbot-test/` y `dashboard/` standalone no existen. |
| P2-8 | 10 componentes dead-code | 🟠 **ABIERTO** | Sin importadores (confirmar imports dinámicos antes de borrar). |
| P2-9 | `User.unlockedFeatures` legacy | ✅ **CERRADO** | Dropeada (migration `drop_user_unlocked_features`). |
| P2-11 | console.log en captureLead | 🟢 **FALSO POSITIVO** | `:121,:295` son logging estructurado JSON sin PII (modernizar a `chatbotLog`). |
| P2-12 | 12 TODOs activos | 🟡 **PARCIAL** | Quedan **2** (`complete-onboarding.ts:39-40` contactEmail/rubro). |

---

## 2. Desglose por superficie

### 2.1 Bot runtime (`/api/chatbot/[slug]/*`) — 🔴 CAÍDO

- **Chat: 500 en todo mensaje** (NUEVO-P0-1). Confirmado en vivo + timeline de DB.
- **Health: 503 falso-negativo** (NUEVO-P1-1). Checks `env`✅ `database`✅ `bot`✅ `llmProvider`❌(API key legacy).
- **Smoke: 503** (bloqueado por health; además llamaría a Vertex que no inicializa por el casing).
- **Evidencia de runtime (DB viva, histórica ≤ 2026-05-23):** 393 conversaciones, 1142 mensajes, 536 `chat.message_completed`, 73 leads, 57 handoffs WhatsApp. **Quota enforcement funciona** (8 `chat.quota_exceeded`), **origin blocking funciona** (14 `SECURITY.BLOCKED_ORIGIN`). Latencia pre-break p50 4077ms / p95 14316ms (1 outlier 202s). Error rate ~1.7%.
- **Conclusión:** la arquitectura del bot (tools, scoring, quota, origin, rate-limit atómico, degraded mode) es sólida y funcionaba bien hasta el 23/05; **un solo bug de casing lo tiró entero**. Fix de 1 línea.

### 2.2 Admin (`/admin/*`, SUPER_ADMIN)

- Queries `findUnique` sin scoping explícito por org (P0-6) en `[botId]` y `[projectId]` — mitigado por `requireSuperAdmin` en layout; **bomba si entra un rol intermedio**.
- CRM sync (`CrmIntegration`/`CrmSyncAttempt`) implementado pero **sin pantalla admin** para ver sincronizaciones fallidas/reintentos (NUEVO-P1-17).
- Rutas legacy de chatbot consolidadas a 1 catchall (mejora vs 7).
- *(E2E funcional confirmó: login admin, navegación entre secciones, alerts 3 columnas y audit-log + filtro — todos PASS. Ver §3.)*

### 2.3 Dashboard cliente (`/dashboard/*`, CLIENT)

- `error.tsx`/`loading.tsx` mejoró fuerte (9→18 / 13→26) pero quedan huecos en `/dashboard/chatbot/{conversations,install,leads/[id]}`.
- Mock data (SEO/analytics) sigue sin badge visible al cliente (P1-7/8) — flag `isMockData` existe pero la UI no avisa.
- AIExecutiveBrief sin feature-flag por plan ni disclaimer "Generado por IA" (P0-4).
- Módulos premium (`/dashboard/modules/*`) — gating por plan existe en schema (`Plan.crmEnabled/reportsEnabled/insightEnabled`) pero el enforcement en UI no fue verificable en vivo.

### 2.4 Widget embebido

- Origin validation correcto (`validate-origin.ts`): localhost en dev, QA flag, develop.com.ar, allowedDomains; bloqueo loggeado. 14 bloqueos reales en DB.
- **Pero el widget hoy recibe 500 del backend** (NUEVO-P0-1) → el visitante ve modo degradado/error.
- Sin disclaimers de Vertex/n8n al visitante (SEC-PII-02/03, abierto).

---

## 3. Caja negra automatizada — Playwright E2E

**Config:** `playwright.config.ts` → baseURL `:3000`, `webServer: npm run start` (reuseExisting), chromium-only, workers=1.
**Corrida del auditor:** subset **read-only** (12 specs) contra dev server `:3002` vía config throwaway (para no reusar el server ajeno de `:3000` ni escribir en la DB compartida con specs mutantes de onboarding/config).

**Resultado (subset read-only, dev `:3002`, Chromium instalado): 12 passed / 7 failed / 1 did-not-run (3.1 min).**

✅ **Pasan — núcleo admin + dashboard SANO:** login admin + navegación entre secciones (07), rechazo de login sin credenciales (06), RBAC cliente↛admin (11) y anónimo↛`/admin`/`/dashboard` (19), API cron exige secret (19), alerts 3 columnas (17), audit-log carga + filtro por actionType (18), dashboard cliente carga dentro del budget warm + "mi chatbot" (13), y **config pública sin filtrar `apiKey`/`llmProvider`** (05). → **Admin y dashboard cliente renderizan, autentican y aíslan roles correctamente.**

❌ **Fallan (7):**
- `04-health`: assert `status < 500` → recibió **503** → **confirma NUEVO-P1-1 vía la suite** (health falso-negativo).
- `01-landing`, `11:5` ("Mi Chatbot" no visible), `07:33` (rutas multi-tenant del bot): degradadas por el **bot caído** (landing/widget dependen del backend que da 500) y/o selectores/copy desactualizados.
- `06:5` (texto KPI del home admin no visible), `20-mobile` ×2 (iPhone SE): drift de selectores/copy o viewport — **requieren triage manual** (posible regresión menor de UI).

> Caveats: corrida en **dev mode** contra `:3002` (no `npm run start`/prod), con el bot caído (`04` espera 200) y baselines visuales no comparables. Specs mutantes (onboarding/config/lead) NO corridos (no escribir en DB compartida). 1ª corrida había fallado entera por falta del binario Chromium (ya instalado).

**Cobertura E2E (24 specs):** landing, chat-flow, lead-capture, health, config, admin login/nav/onboarding/bot-config/KB/bulk/alerts/audit, client login/chatbot/perf/personalization, security, mobile, visual-regression, onboarding-completo, lead-capture-API.

**Gaps de cobertura (sin E2E):** gating por plan (modelo `Plan` nuevo), CRM sync (`CrmIntegration`/`CrmSyncAttempt`), forgot/reset password, aislamiento cross-org multi-tenant, módulos premium del dashboard, alertas CRUD (no solo visualización), quota enforcement del bot, downgrade/upgrade de plan.

---

## 4. Caja negra del bot — escenarios

**No fue posible correr los 8 escenarios guionados:** el endpoint `/api/chatbot/develop/chat` devuelve **HTTP 500** en cada mensaje (NUEVO-P0-1). El warm-up reprodujo el bug:

```
POST /api/chatbot/develop/chat  → 500
{"error":"Internal server error in chatbot.","debug":"Unknown LLM provider: GOOGLE"}
```

- **Health develop/matsu/sanmiguel:** `{ok:false}` (503) — `env`✅ `database`✅ `bot`✅ `llmProvider`❌ (`CHATBOT_GOOGLE_API_KEY missing`, falso-negativo).
- **Los 8 escenarios de §4 de mayo** (precio, financiación, disponibilidad, off-topic, anti-hallucination, jailbreak, captura de lead, handoff) **no son ejecutables hoy** — todos terminarían en 500.
- **Sustituto (evidencia histórica de DB ≤ 23/05):** los escenarios equivalentes funcionaban (73 leads capturados con intent clasificado `PURCHASE_READY`/`QUOTE_REQUEST`/`SCHEDULE_VISIT`, 57 handoffs, anti-origin 14 bloqueos). El bot funcionaba; el casing lo rompió después.

**Rate-limit (429):** no se llegó a saturar — el 500 ocurre antes. El rate-limit atómico (B14.1) está activo en el código (`presets.chatbotPerSession`).

---

## 5. No verificado (con motivo)

| Ítem | Motivo |
|---|---|
| **8 escenarios guionados del bot** | El bot devuelve 500 en cada mensaje (NUEVO-P0-1). Se root-causeó el bug en vez de correr escenarios. |
| **`/smoke` end-to-end** | Bloqueado por el 503 falso-negativo del health (NUEVO-P1-1) + el bot caído. |
| **`prisma migrate status` (CLI)** | `P1001 Can't reach database server` — quirk del modo de conexión del CLI. **Compensado:** estado de migraciones leído directo de `_prisma_migrations` (0 pendientes). |
| **Build deployable en CI/Netlify** | El build local falla por `@googleapis/webmasters` no instalado (NUEVO-P0-2). No se confirmó si un `npm install` limpio en CI compila (depende de que el paquete exista en el registry). No se corrió `npm install` para no alterar `package-lock.json` (report-only). |
| **P0-3 visual regression** | No hay carpeta `test-results/` (sin last-run registrado). Se excluyó `22-visual-regression` del subset: en dev-mode los baselines de prod no son comparables y el spec usa fixture mutante. |
| **E2E mutantes (onboarding 08/30, config 09/10/15, lead 03/40, critical 14)** | No se corrieron para honrar "no escribir en producción": la DB Neon es compartida dev+prod y esos specs crean orgs/users/edits reales. |
| **UI visual por píxeles (22-visual-regression)** | El E2E **funcional** SÍ corrió (12/20 passed — ver §3); la comparación visual por screenshots se excluyó (dev-mode + fixture mutante). `06:5`/`20-mobile` fallaron por drift de selectores — triage manual pendiente. |
| **SEC-DEP (npm audit fix)** | `npm audit` corrido (2 moderate, postcss). El `fix` no se aplicó (modificaría lock/deps). |

---

## 6. Seguridad — revalidación de los 32 SEC-*

**Cerrados (10+):** SEC-DEP-01 (Next ^16.2.6 declarado; `npm audit`=2 moderate, P0 de mayo sobredimensionado), SEC-DEP-02/03 (protobufjs/defu/effect ya no aparecen), SEC-AUTH-01/02 (HMAC `signOAuthState`/`verifyOAuthState`), SEC-AUTH-03 (`sessionVersion`), SEC-RATELIMIT-01 (atómico DB), SEC-LLM-06/07 (Zod en tools), SEC-SECRETS-01 (falso positivo confirmado). **Checklist heredado F2/F3/F4/F7/QA-bypass/JWT/rate-limit/getGlobalBots: todos CERRADOS.**

**Abiertos (P1):** SEC-AUTH-04 (sin `middleware.ts` global), SEC-RATELIMIT-02 (key con `sessionId` controlable), SEC-LLM-01 (sin delimitadores de input), SEC-LLM-02 (PII a Vertex sin redaction/disclosure), SEC-LLM-03 (capture_lead no valida pertenencia del dato), SEC-LLM-04 (system prompt completo), SEC-MISC-01 (headers globales), SEC-MISC-02 (cookies explícitas), SEC-PII-01 (**confirmado**: email completo en claro en `notify-message.ts:62`), SEC-PII-02/03 (disclaimers widget).

**Parciales:** SEC-SSRF-01 (valida config-time, deuda DNS-rebinding documentada), SEC-DEP-04 (1 postcss moderate), SEC-LLM-05 (react-markdown escapa HTML por default; falta `skipHtml` explícito).

**Abiertos (P2):** SEC-AUTH-05/06/07/08, SEC-CACHE-01/02, SEC-LOGGING-01 (logging de PII de leads — confirmar intención), SEC-INJ-01.

---

## 7. DB / Schema — revalidación

**Snapshot vivo:** 6 orgs (mayo tenía 8 — **limpiaron los 2 duplicados `agency-os`**: `san-miguel`, `ejemplo`, `develop`, `empresa-demo`, **`matsu`** (cliente real), `qa-cliente-b`). 4 bots, 3 planes, 2 subs (Business), 66 leads, 0 BotAlerts, 0 CrmIntegrations, 0 migraciones pendientes.

**Cerrados:** DB-P0-1 (Plan + planId FK), DB-P0-2 (migration), DB-P0-3 (NOT NULL), DB-P1-2 (enums `ChatMessageRole`/`ChatbotLeadIntent`/`ChatbotEventLevel`; `type` queda String por diseño), DB-P1-3 (unlockedFeatures drop), DB-P1-4 (clientId→organizationId), DB-P1-7/8 (índices).

**Abiertos:** DB-P1-1 (métricas denormalizadas sin helper único), DB-P1-2e/NUEVO-P1-2 (`planName` coexiste con `planId`), DB-P1-5 (AdminAuditLog sin targetOrgId), DB-P1-6 (LeadStatus sin doc), DB-P2-1..5 (índices redundantes slug/OsLead/Email, shapes JSON sin documentar).

**Modelos nuevos (todos bien scoped):** `Plan` (global, catálogo), `ExecutiveBriefSnapshot` (orgId✅), `WeeklyReportLog` (orgId✅), `CrmIntegration` (orgId @unique✅), `CrmSyncAttempt` (orgId denormalizado✅), `RateLimit` (global, atomic). **Nuevos hallazgos menores:** FKs opcionales `Subscription.plan`/`Project.osLead` sin `onDelete` explícito (SetNull implícito).

---

## 8. Acciones recomendadas (priorizadas, NO ejecutadas)

1. 🔴 **NUEVO-P0-1 (1 línea):** en `handleChatRequest.ts:524,642` normalizar: `getLLMProvider(bot.llmProvider.toLowerCase() as LLMProviderName)`, o mejor, mapear el enum `LlmProvider→LLMProviderName` en un helper y **borrar el cast `as`**. Verificar con `/api/chatbot/develop/smoke` post-fix.
2. 🔴 **NUEVO-P0-2:** `npm install` (instala `@googleapis/webmasters` + sube Next a 16.2.6). Re-correr `npm run build`.
3. 🔴 **NUEVO-P1-1:** alinear `checkHealth.ts` con el provider real (chequear `GOOGLE_APPLICATION_CREDENTIALS`/`CHATBOT_GCP_PROJECT_ID`, no `CHATBOT_GOOGLE_API_KEY`).
4. 🟡 Tras 1-3: re-correr la batería E2E completa y los 8 escenarios del bot (ahora sí ejecutables).
5. 🟡 P0-4 (badge IA + flag plan), P1-12 (Zod en 4 actions), P1-7/8 (badge mock data), P0-6 (helper `assertResourceBelongsToOrg`).
6. 🟢 Limpieza: 3 framer-motion, 10 scripts raíz, 10 dead components, dropear `planName`.

---

*Report-only confirmado. Cero código de producto modificado, cero migraciones, cero escrituras de producto. Los scripts/archivos `_audit_*` temporales del auditor fueron eliminados al cierre.*
