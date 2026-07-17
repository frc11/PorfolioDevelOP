# Bitácora — Motor WhatsApp

Registro de bloques y sprints del Motor WhatsApp (BSP 360dialog,
multi-tenant). Cada entrada sigue este formato:

```
## AAAA-MM-DD — B{bloque}-S{sprint}: {título}

**Qué se hizo:** ...
**Qué se decidió:** ...
**Qué se midió:** ...
**Pendiente:** ...
```

---

## 2026-07-06 — B0-S1: esqueleto del módulo, frontera de imports y registro

**Qué se hizo:**
- Estructura creada: `src/modules/motor/` con `adapters/` (con
  `.gitkeep`), `domain/`, `services/`, `types/`.
- `src/modules/motor/README.md`: describe el módulo (motor multi-tenant
  de WhatsApp Business Platform vía BSP 360dialog), la regla de
  frontera de imports y la regla de aislamiento de datos.
- `eslint.config.mjs`: agregado bloque `no-restricted-imports` scoped a
  `src/modules/motor/**/*.{ts,tsx}` con tres patrones:
  1. Bloquea imports de otros módulos (`@/modules/*`), con excepción
     explícita de `@/modules/motor` (propio) y
     `@/modules/chatbot/public-api` (barrel que se creará en B2).
  2. Bloquea imports de `@/app/*`.
  3. Bloquea `@/lib/prisma` directo (deberá pasar por
     `src/lib/isolation/`, a crear en B0-S2).
- `docs/motor-whatsapp/bitacora.md`: este archivo, con encabezado y
  formato de entrada.

**Qué se decidió:**
- La excepción a `@/modules/chatbot/public-api` se deja activa en la
  regla aunque el archivo no exista todavía (se crea en B2) — no
  bloquea al lint porque `no-restricted-imports` no verifica
  existencia de módulos, solo el patrón del specifier.
- `src/lib/isolation/` no se crea en este sprint (es scope de B0-S2).
  La regla de bloqueo de `@/lib/prisma` queda activa desde ya para que
  ningún archivo del módulo la viole mientras tanto.

**Qué se midió (evidencia de la frontera):**
- Se creó temporalmente `src/modules/motor/domain/_boundary-test.ts`
  con `import { prisma } from "@/lib/prisma";`.
- Comando: `npm run lint`
- Resultado: **FALLA** como se esperaba, con el mensaje de la regla:
  `src/modules/motor no puede importar @/lib/prisma directamente. Usar
  src/lib/isolation/ (B0-S2).` apuntando a la línea del import en
  `_boundary-test.ts`.
- El archivo de prueba se borró inmediatamente después de confirmar el
  fallo.

**Pendiente:**
- B0-S2: crear `src/lib/isolation/` (capa de queries multi-tenant).
- B2: crear `src/modules/chatbot/public-api` (barrel) — hoy la
  excepción de la regla de frontera lo permite preventivamente.
- Verificación humana: texto del README y de las excepciones de la
  regla de frontera (pedido explícito del sprint).

**Cierre del sprint:**
- `npx tsc --noEmit`: 1 error preexistente en `src/lib/searchconsole.ts`
  (conflicto de tipos entre dos copias de `google-auth-library` vía
  `googleapis`), no relacionado con este sprint. Sin errores en
  `src/modules/motor/`.
- `npm run lint`: 103 errores / 135 warnings preexistentes, todos en
  `src/modules/chatbot/**` y otros archivos fuera de scope. Sin errores
  en `src/modules/motor/` (fuera del test de frontera, ya removido).
  El conteo bajó de 104→103 al borrar `_boundary-test.ts`, confirmando
  que la regla nueva no introdujo errores adicionales en el resto del
  repo.
- `npm run build`: PASS (exit code 0, verificado explícitamente —no
  inferido del pipe a `tail`, que enmascara el código de salida real).
  Nota de entorno: el build por defecto (heap de Node sin ajustar)
  falla por out-of-memory en esta máquina incluso en la rama base
  antes de este sprint (`heap limit Allocation failed` a los ~54s);
  no es una regresión de este sprint. Se corrió con
  `NODE_OPTIONS="--max-old-space-size=4096"` y completó en ~4 minutos,
  compilando y generando las 31 páginas estáticas sin errores.
- `npx prisma migrate status`: "Database schema is up to date!". Sin
  migraciones en este sprint (no correspondía).

---

## 2026-07-07 — B0-S2: schema RLS-ready del motor + helper de aislamiento único del repo + test negativo real

**Qué se hizo:**
- Schema del motor en `prisma/schema.prisma`: 4 modelos (`WabaChannel`,
  `ContactIdentity`, `MotorConversation`, `MotorMessage`) + 5 enums
  (`MotorChannelType`, `WabaChannelStatus`, `MotorConversationStatus`,
  `MotorMessageDirection`, `MotorMessageStatus`) + 4 relaciones inversas en
  `Organization`. Migración `20260707044711_motor_whatsapp_b0_schema`,
  aplicada (82 migraciones al día).
- Helper único de aislamiento en `src/lib/isolation/` (3 archivos):
  `index.ts` (API pública: `forOrg`, `unsafeGlobalQuery`, errores, y el
  doc-comment de qué se adoptó/generalizó de LeadOS), `scoped-model.ts`
  (núcleo genérico `ScopedModelDelegate`), `registry.ts` (estrategia de
  tenancy por modelo + armado del scope). Cobertura: los 4 modelos del motor
  + los 5 del chatbot que B0-S3 porta (`BotConfig`, `Conversation`,
  `ChatMessage`, `ChatbotLead`, `CrmIntegration`).
- Test negativo real `tests/integration/motor-isolation.spec.ts` (Playwright
  in-process contra Neon, mismo `DATABASE_URL`/rol que la app): 2 orgs
  efímeras con claves solapadas (mismo `externalId`, mismo `phoneNumberId`),
  seed vía el propio helper, verificación dura del seed (si queda 1 org, la
  suite FALLA — sin `test.skip`), casos (a)–(h) (el (h) se sumó post-review),
  teardown por id exacto.

**Qué se decidió:**
- **FKs compuestas `(organizationId, id)` en las relaciones internas del
  motor** (conversación→identidad, conversación→canal, mensaje→conversación),
  con `@@unique([organizationId, id])` en las tablas padre como target. Es la
  materialización de "ninguna FK cruza organizaciones": la DB rechaza la
  referencia cross-org aunque el código se saltee el helper (P2003). Primer
  uso de relaciones multi-columna en el repo — decisión deliberada: este es
  el patrón que el resto va a copiar y el DB-level guard cierra el agujero de
  nested writes / bypass. Los modelos del chatbot NO pueden recibir este
  constraint (tablas existentes, migraciones solo aditivas) → para ellos el
  guard equivalente vive en el helper (`parentChecks`).
- **Índices org-first en las 4 tablas**: el `organizationId` queda cubierto
  como PRIMERA columna de un índice en todas (uniques compuestos en canal/
  identidad/conversación; `(organizationId, createdAt)` y
  `(organizationId, conversationId, createdAt)` en mensaje). No se agregó
  `@@index([organizationId])` suelto: sería prefijo redundante de los
  compuestos. Condición RLS-ready cumplida sin duplicar índices en la tabla
  caliente.
- **`providerMessageId` es el ÚNICO unique global del bloque** (idempotencia
  contra retries del BSP, nullable). Todo lo demás es único POR ORG —
  en particular `(organizationId, channelType, externalId)` en
  `ContactIdentity` (BSUID-first: `externalId` = BSUID cuando exista, `waId`
  de transición, `reconciledAt` marca la migración).
- **Helper**: del patrón LeadOS se ADOPTÓ la fuente única del where de
  aislamiento, el anti-IDOR de lectura (id + dueño en una query → null sin
  leak de existencia) y el anti-IDOR de escritura (el dueño lo fija el
  sistema, jamás el cliente — espejo de `ownedLeadCreateData`). Se
  GENERALIZÓ: eje setter→organización; módulo puro→capa que CONTIENE prisma
  (el motor tiene prohibido `@/lib/prisma` por eslint, así que el scope no es
  opt-in); fragmentos sueltos→accessors por modelo con AND-composición
  no-sobreescribible; scope relacional resuelto internamente para los modelos
  del chatbot (`botConfig.organizationId`, 2 saltos para `ChatMessage`).
- Guards de escritura: `create` inyecta `organizationId` (valor ajeno
  explícito → `IsolationError`); nested writes y re-parenting de FKs scoped
  prohibidos en TIPOS (Omit sobre los inputs unchecked) y en RUNTIME (listas
  por modelo derivadas de las mismas constantes — no pueden divergir);
  `update`/`delete` por id con where unique extendido `{id, organizationId}`
  (atómico) en modelos directos y check-then-write en relacionales. P2025 y
  P2003 se traducen a `IsolationNotFoundError`: un id de otra org es
  indistinguible de uno inexistente.
- **Un solo upsert, deliberado**: `contactIdentity.upsertByExternalId` sobre
  el unique compuesto org-inclusivo. No hay upsert genérico: aceptaría
  uniques globales y podría pisar filas de otra org.
- `unsafeGlobalQuery(reason, fn)` como único escape (alta de tenants, crons
  cross-org): `reason` obligatorio en tipos y no-vacío en runtime; nombre
  greppable (`grep -r unsafeGlobal src/`).
- Sin default en `MotorMessage.status` (quien escribe conoce dirección y
  estado); defaults sí en `WabaChannelStatus.ACTIVE` y
  `MotorConversationStatus.OPEN`. `@@map("motor_*")` siguiendo la convención
  `chatbot_*`/`crm_*`.

**Qué se midió (evidencia):**
- Aditividad: `npx prisma migrate diff --from-schema-datasource
  --to-schema-datamodel --script` ANTES de aplicar → solo `CREATE TYPE` (5),
  `CREATE TABLE motor_*` (4), `CREATE INDEX` (10) y `ADD CONSTRAINT` sobre
  las tablas nuevas (7). Cero sentencias sobre tablas existentes. El SQL de
  la migración generada es idéntico al diff auditado.
- Suite `motor-isolation`: **7/7 PASS** (~8.5s). Casos: (a) listas scoped no
  devuelven nada de B; (b) `findById` de un recurso de B → null (con control
  positivo del propio); (c) update/delete/updateMany desde A sobre B fallan
  con `IsolationNotFoundError` / count 0 y B queda intacto (verificado por
  ground truth sin helper); (d) mismo `externalId` en A y B convive, y el
  duplicado DENTRO de una org explota (P2002); (e) `unsafeGlobalQuery` ve
  ambas orgs y su `reason` vacío lanza antes de tocar la DB; (f) la FK
  compuesta rechaza una conversación de A apuntando a identidad de B TANTO
  vía helper como con prisma crudo (P2003 en
  `motor_conversation_organizationId_contactIdentityId_fkey`); (g) un
  `organizationId` ajeno en el where lanza `IsolationError`.
- **Evidencia de que el test (a) falla si se comenta el scope** (regla del
  sprint: un test de aislamiento que nunca se vio fallar no está probado):
  se saboteó `scopedWhere` en `scoped-model.ts` (scope comentado, devolvía el
  where del caller sin fragmento de org) → `(a)` FALLÓ con
  `Expected length: 1 / Received length: 2` y el array recibido mostró
  conversaciones de AMBAS orgs (dos `organizationId` distintos). Se restauró
  el helper → 7/7 PASS de nuevo. El sabotaje nunca se commiteó.
- Garantías de TIPOS como test: 6 `@ts-expect-error` en el spec
  (`forOrg()` sin arg, `unsafeGlobalQuery` sin reason, `organizationId` en
  create, mover de org en update, re-parenting, nested writes). Si el helper
  afloja los tipos, quedan "sin usar" y `tsc --noEmit` falla con TS2578: el
  typecheck del repo ES el test negativo de tipos.
- Higiene de la Neon compartida: tras las corridas, `organization.count`
  de slugs `motor-iso-*` → **0 remanentes** (teardown por id exacto, cascade
  org→motor_*).

**Post-review (ECC `/code-review`, 10 ángulos en paralelo + sweep):**
- Corregido en el helper, en esta misma pasada: `update`/`delete` de modelos
  relacionales pasó de check-then-write a UNA sentencia con el scope en el
  mismo where (`updateMany`/`deleteMany` + count) — elimina la ventana TOCTOU
  frente a escrituras legacy concurrentes y el SELECT de fila completa;
  `cursor` rechazado en `findMany`/`findFirst` (ancla por unique GLOBAL:
  oráculo de existencia cross-org); `id` prohibido en update (runtime + Omit
  en los 9 tipos — re-keying con cascada); `upsertByExternalId` ahora pasa por
  `translateDbError`; `translateDbError` conserva el error Prisma como `cause`
  y nombra el campo/constraint ofensor (meta) en el mensaje; `parentChecks`
  en paralelo (una etapa de latencia, no N).
- Corregido en el spec: teardown a prueba de seeds parciales (registro
  incremental `createdOrgIds` — antes, si fallaba el seed de B, la org A
  quedaba huérfana en la Neon compartida); `providerMessageIdIn` leído de la
  fila real (no recalculado); caso (h) nuevo — guards de runtime con bypass
  de tipos (`as never`): organizationId ajeno, nested write, re-keying y
  cursor. **Suite final: 8/8 PASS**; `tsc` y `eslint` limpios post-fixes.
- Hallazgos REPORTADOS, no corregidos acá (fuera del scope del sprint; detalle
  en el reporte): los 3 agujeros de la frontera eslint de B0-S1 (la excepción
  `!@/modules/chatbot/public-api` nunca matchea — semántica gitignore; bypass
  por import relativo `../../lib/prisma`; bypass por `@/lib/prisma.ts` con
  `allowImportingTsExtensions` — los tres verificados corriendo el linter
  real); la frontera solo rige dentro de `src/modules/motor/**` (un route
  handler podría tocar `motor_*` con prisma crudo); `hardDeleteClient` no
  cuenta tablas `motor_*` en su resumen de borrado (cascade silencioso);
  sin enforcement automático de tipos en el repo (no hay script `typecheck`
  ni `tsc` en CI y `next.config.ts` ignora errores de build — los
  `@ts-expect-error` del spec solo se validan en la corrida manual);
  `WabaChannel` sin camino de lookup por `phoneNumberId` (lo necesita el
  webhook de B1 para resolver la org de un mensaje entrante); `forOrg` sin
  soporte `$transaction` ni `groupBy`/`aggregate`/upsert genérico (B0-S3 los
  necesita: `captureLead`/`createBot` usan tx, `getMonthlyAnalysisForOrg` usa
  groupBy, `saveCrmIntegration` usa upsert de `crmIntegration`);
  `IsolationNotFoundError` no comparte jerarquía con `ResourceNotOwnedError`
  (`src/lib/auth/assert-ownership.ts`) — unificarlos o no es decisión de la
  revisión humana de la API.

**Pendiente:**
- B0-S3: portar el chatbot al helper (las queries legacy con prisma directo
  sobre los 5 modelos cubiertos siguen vigentes hasta ese sprint).
- El helper no envuelve `aggregate`/`groupBy`/`createMany`/`$transaction` ni
  expone `findUnique` genérico (lectura por id = `findById`; por unique
  compuesto org-inclusivo = método curado tipo `upsertByExternalId`). Si
  B0-S3 los necesita, se agregan con el mismo contrato — anotado, no
  implementado (fuera de scope).
- Los comandos ECC `/quality-gate --strict` y el skill `verification-loop`
  NO estaban disponibles en el registro de esta sesión (los comandos se
  detectan al iniciar sesión). La verificación equivalente se corrió a mano
  (tsc, lint scoped, build, suite, sabotaje, higiene); `/code-review` sí
  corrió (hallazgos en el reporte del sprint). Queda correr el gate formal
  en una sesión con el harness cargado.
- Verificación humana: revisión del diseño de la API pública del helper
  (`forOrg`/accessors/`unsafeGlobalQuery`) ANTES de B0-S3 — pedido explícito
  del sprint. Punto de atención: la decisión de FKs compuestas (primera vez
  en el repo) y la traducción P2003→`IsolationNotFoundError`.

**Cierre del sprint:**
- `npx tsc --noEmit`: solo el error preexistente de `src/lib/searchconsole.ts`
  (mismo estado que el baseline pre-sprint y que B0-S1). Cero errores en los
  archivos del sprint.
- `npx eslint src/lib/isolation tests/integration/motor-isolation.spec.ts`:
  0 errores / 0 warnings.
- `npm run build` (con `NODE_OPTIONS="--max-old-space-size=4096"`, ver nota
  de entorno de B0-S1): PASS, exit code 0 verificado.
- `npx prisma migrate status`: "Database schema is up to date!" — 82
  migraciones, la nueva incluida.
- `npx prisma generate`: OK (client v6.19.3).

---

## B0-S3 — El chatbot adopta el helper único de aislamiento (2026-07-08)

**Qué se hizo.** El chatbot pasó de aislar POR CONVENCIÓN (~110 call sites con
`where` a mano + 8 queries global sin guarda) a aislar por el helper único
`src/lib/isolation/`. Fuera de `src/lib/isolation/`, CERO acceso directo a Prisma
en `src/modules/chatbot/**` y `src/app/api/chatbot/**` (frontera eslint activa).
CERO migraciones (refactor de capa de queries, no de schema).

**Decisiones de planificación (confirmadas con el humano al inicio):**
1. **Extender el helper a los 6 modelos no cubiertos** del chatbot (chatbotEvent,
   quotaUsage, botAlert, chatbotInsight, knowledgeBase, crmSyncAttempt), no solo
   portar los 5 ya declarados. crmSyncAttempt scopea por columna `organizationId`
   propia; los otros 5 por cadena relacional vía `botConfig`.
2. **La frontera cubre el árbol completo, scripts de dev incluidos.** El eslint
   prohíbe `@/lib/prisma` Y `new PrismaClient()` en el árbol del chatbot. Los
   scripts CLI (evals/*, prisma/seed.ts, update-proactive-prompts.ts) se portaron
   a `unsafeGlobalQuery` con prefijos EVAL-/SEED- (filtrables del grep de runtime).

**Adiciones al helper (las que B0-S2 dejó anotadas como "si B0-S3 las necesita"):**
- Núcleo genérico: `groupBy`, `createMany` (mismo contrato de scope/parentChecks).
- `$transaction` scoped: `forOrg(org).$transaction(tx => ...)` liga los mismos
  accessors al cliente transaccional de Prisma. Atomicidad multi-modelo sin salir
  del helper (ej. captureLead: lead.create + conversation.update).
- **parentChecks tx-aware**: `ParentCheck.find` recibe el cliente activo (global o
  `tx`). Sin esto, crear padre+hijo en la misma tx (createBot: bot + KB) fallaría
  porque el check leía FUERA de la tx y no veía el padre recién creado.
- Delegate bespoke `QuotaUsageScopedDelegate`: clave compuesta (botConfigId, year,
  month) verificando bot∈org; y las 2 mutaciones atómicas `$executeRaw` (reserva de
  cupo B4.2 + degradedAt B4.5) preservadas con el guard de org EMBEBIDO en el SQL
  (`EXISTS` sobre chatbot_bot_config) — la garantía TOCTOU no se rompe.
- Delegate bespoke `CrmIntegrationScopedDelegate.upsertForScope` (organizationId
  @unique == el scope).

**Organization/User (no cubiertos, ~24 sitios):** por decisión "cover everything"
van por `unsafeGlobalQuery` con prefijos de razón CATEGORIZADOS para que el grep de
superficie global siga siendo filtrable:
`TENANT-MGMT` (CRUD del tenant raíz), `TENANT-RESOLUTION` (slug/id→org),
`AUTH-RESOLUTION` (user→org), `PLATFORM-AGG` (agregados admin develOP),
`PLATFORM-CRON` / `PLATFORM-HEALTH` / `PLATFORM-MAINTENANCE`, `PUBLIC-CONFIG`
(config pública del widget por slug), `SLUG-UNIQUENESS`, `ADMIN` (ops super-admin
por id cross-org: manageAlerts, saveBotConfig cross-model BotConfig+Organization),
`SEED*`/`EVAL*` (tooling dev-only).

**PENDIENTE-DECISIÓN (subir a planificación):** dos funciones quedaron envueltas en
`unsafeGlobalQuery('PENDIENTE-DECISIÓN: ...')` porque su página las enmarca como el
bot PROPIO de develOP ('develop') pero agregan ChatbotEvent de TODAS las orgs:
- `getLatencyHistory.ts` (página /admin/chatbot/health, junto a checkChatbotHealth('develop')).
- `getActivityChartData.ts` (página /admin/chatbot/activity, junto a un stream ya scopeado al bot develop).
Decisión: o se scopean al bot 'develop' (vista por-org) o se re-enmarca la página
como panel de plataforma. El fix toca solo esas 2 funciones + sus 2 call sites.

**Test negativo real:** `tests/integration/chatbot-isolation.spec.ts` (espejo de
motor-isolation). 2 orgs efímeras con datos solapados (mismo email de lead, mismo
texto de mensaje), seed que FALLA si queda parcial (prohibido skip), casos a-h:
lectura/lectura-por-id/escritura cruzada sobre BotConfig/Conversation/ChatMessage/
ChatbotLead, parentChecks cross-org, escape global, guards runtime + cursor, y
garantías de tipo (@ts-expect-error). El guard de pending de
`generate-insights-pending-guard.spec.ts` se conservó SIN su `test.skip` (ahora
falla explícito si no hay bot seedeado); su parte de aislamiento se movió al spec nuevo.

**Evidencia de falla forzada:** rompiendo `conversationConfig.scopeWhere` a `() => ({})`,
los casos (a)/(b)/(c) del spec del chatbot FALLARON (findMany devolvió 216 filas
cross-org en vez de 1; findById(B) devolvió la fila de B en vez de null; el write
cross-org resolvió en vez de rechazar). Scope restaurado → 8/8 verde de nuevo.

**Inventario de superficie global (grep de `unsafeGlobalQuery`, el gate pre-tenant):**
67 call sites en 36 archivos. Runtime (filtrando dev): TENANT-MGMT 17, TENANT-RESOLUTION 8,
ADMIN 8, SLUG-UNIQUENESS 3, PLATFORM-AGG 3, PLATFORM-HEALTH 2, PLATFORM-CRON 2,
PENDIENTE-DECISIÓN 2, PUBLIC-CONFIG 1, PLATFORM-MAINTENANCE 1, AUTH-RESOLUTION 1.
Dev-only (filtrables): SEED 6, EVAL-CLEANUP 6, EVAL 4, SEED-EVAL 2.

**Cierre del sprint:**
- `npx tsc --noEmit`: solo el error preexistente de `src/lib/searchconsole.ts` (baseline).
  Cero errores en los archivos del sprint ni en los tests.
- Frontera eslint: 0 violaciones (ni `@/lib/prisma` ni `new PrismaClient` en el árbol).
  Los 68 archivos tocados: lint-clean. Los 103 errores repo-wide de eslint son
  PREEXISTENTES (react-compiler/any/directivas, en archivos no tocados — el build los ignora).
- `npm run build`: PASS, exit 0.
- `npx prisma migrate status`: "Database schema is up to date!" — sin migraciones nuevas.
- Suites de aislamiento: `chatbot-isolation` (8) + `motor-isolation` (8) = 16/16 PASS contra Neon dev.

**Queda para verificación humana (pedido del sprint, NO delegado al reporte):**
- Probar el WIDGET del chatbot en un flujo real completo (conversación + captura de
  lead) contra un entorno de prueba. El refactor toca el camino de datos de producción.
- Correr las suites de comportamiento ev1–ev5 / ev3:golden / utm1 (necesitan dev server
  + ANTHROPIC_API_KEY, gated en esta sesión) para confirmar comportamiento preservado.
- Resolver los 2 PENDIENTE-DECISIÓN (latencia/actividad: scopear a 'develop' o re-enmarcar).

## B1-S1 — Adaptador BSP de entrada: webhook 360dialog con auth, idempotencia e identidad BSUID-first (2026-07-09)

**Qué se hizo:**
- Endpoint público `POST /api/motor/webhook/[channelToken]` (route FINO, patrón del
  chat route: rate limit por canal → delegación al módulo). SIN handler GET: 360dialog
  no usa challenge de verificación (el webhook se registra vía su API, no en Meta).
- Pipeline en `src/modules/motor/adapters/whatsapp/inbound/`: `auth.ts` (verificador
  con la cita de la doc), `resolve-channel.ts` (LA única `unsafeGlobalQuery` del sprint,
  reason `TENANT-RESOLUTION: webhook inbound`), `payload.ts` (Zod estricto del subset
  consumido + clasificador), `handle-message.ts` (idempotencia + tx scoped),
  `handle-status.ts`, `process.ts` (orquestador), `handle-request.ts`, `index.ts`.
- Dominio en `src/modules/motor/domain/`: `bsuid.ts` (detección de formato — PROHIBIDO
  asumir E.164), `channel-credentials.ts` (token de URL + secret hasheado, timing-safe),
  `identity.ts` (resolución BSUID-first + user_id_update), `prisma-errors.ts` (P2002).
- Schema ADITIVO: `WabaChannel.channelToken` (@unique — el SEGUNDO unique global
  deliberado del bloque: el webhook llega pre-tenant y el token ES la clave de
  resolución canal→org) + `webhookSecretHash`; tabla nueva
  `motor_contact_identity_transition`. Migración
  `20260709163143_b1s1_webhook_credentials_and_identity_transitions`.
- Registry del helper: accessor scoped `contactIdentityTransition` (parentCheck estilo
  chatbot — ver decisión abajo). Preset `motorWebhookPerChannel` 600/min por canal.
- Suite `tests/integration/motor-inbound.spec.ts` (11 tests, a–k) + fixtures realistas
  en `tests/integration/fixtures/motor-inbound-payloads.ts`. Invocan el route handler
  REAL con `Request` estándar contra la Neon dev; estándar B0 (seed parte del test,
  FALLA explícito si falta, teardown por id exacto, prohibido skip).

**Mecanismo de auth encontrado (paso 0, con citas):**
- **Elegido: header secreto propio por canal** (`Authorization: Bearer <secret>`), lo
  más fuerte disponible en el plan actual (cliente directo de la Messaging API). El
  webhook se configura con headers custom que 360dialog reenvía en cada POST:
  `POST https://waba-v2.360dialog.io/v1/configs/webhook` body `{ "url": ..., "headers": ... }`
  — cita: docs.360dialog.com/docs/messaging-api/api-reference/webhooks ("Partners can
  set http headers that they want to receive in webhook requests") y
  docs.360dialog.com/docs/messaging/webhook (ejemplo con header Authorization; "Meta
  retries failed webhooks for up to 7 days using exponential backoff"; 200 esperado
  dentro de 5s).
- `X-Hub-Signature-256` de Meta NO se reenvía al cliente (la suscripción ante Meta es
  de 360dialog; esa firma usa el app secret de ellos). No hay hub.challenge.
- SÍ existe firma HMAC-SHA256 propia del BSP (`x-360dialog-signature`, platform secret)
  pero es EXCLUSIVA del plan partner (el secret se genera en el Partner Hub) — cita:
  docs.360dialog.com/partner/onboarding/webhook-events-and-setup/signature-validation.
  **Riesgo residual a planificación:** el header estático autentica el origen pero no
  la integridad por-payload; si la cuenta migra a partner, `auth.ts` es el ÚNICO punto
  a reemplazar por verificación HMAC del raw body.
- Implementación: secret por canal persistido SOLO como SHA-256 (`webhookSecretHash`),
  comparación timing-safe, fail-closed (canal sin hash rechaza todo), token opaco de
  256 bits en la URL como segundo factor independiente, rate limit por canal ANTES de
  tocar la DB, shape estricto, y cross-check `metadata.phone_number_id` vs canal.

**Decisiones de diseño de identidad:**
- BSUID (`user_id`) = clave primaria de matching. Reconciliación por `waId` SOLO sobre
  filas con `reconciledAt` null: una fila ya reconciliada a OTRO BSUID no se pisa (un
  número reciclado puede ser hoy de otra persona). Alta race-safe vía
  `upsertByExternalId`. Aprendizaje lateral: si la fila no conocía el teléfono y vino,
  se guarda.
- `user_id_update` → **tabla de historial** (`ContactIdentityTransition`) y no un campo:
  (1) un contacto puede transicionar más de una vez; (2) el evento puede llegar sin
  identidad conocida (fila con `contactIdentityId` null — el dato no se tira); (3) es
  auditoría de reconciliación. FK a ContactIdentity SIMPLE y nullable (Prisma no admite
  FK compuesta con pata opcional) → el guard cross-org del create es un parentCheck en
  el registry (patrón chatbot), `onDelete: SetNull` preserva el log.
- Al migrar el BSUID se **ANULA `waId`**: el evento significa "cambió de número" y el
  número viejo puede estar reasignado — conservarlo arriesga enviarle a un desconocido
  en B1-S2. Conflicto (ya existe identidad con el ID nuevo) → transición marcada
  `user_id_update:conflict`, CERO merges destructivos. Corre SIN transacción a
  propósito (tras una violación de constraint Postgres aborta la tx — 25P02 — y el
  registro del conflicto fallaría); cada paso es idempotente y el retry re-entra limpio.
- Los ids de `user_id_update` se validan contra el patrón BSUID (reescriben identidades
  existentes); el path de mensajes queda tolerante (crear identidad es aditivo).
- Statuses: monotónico SENT→DELIVERED→READ (stale se descarta, nada retrocede), FAILED
  terminal con detalle del error del BSP (truncado a 500), SOLO mensajes OUT y scoped
  por org (el wamid de otra org no se alcanza — probado en test h).

**Limitaciones conocidas (aceptadas y por qué):**
- Sin unique parcial de conversación OPEN en DB: una carrera de dos mensajes DISTINTOS
  concurrentes puede dejar dos conversaciones (elección determinística por
  `createdAt asc` las re-unifica hacia adelante). Un índice parcial requeriría SQL
  fuera del schema Prisma = drift físico — no se paga ese precio por una carrera de
  ventana mínima.
- La forma EXACTA del payload vivo de `user_id_update` queda por confirmar contra el
  sandbox (el parser acepta la variante canónica `old_user_id`/`new_user_id`).
- Las corridas de `/code-review`, revisión TS y `/security-review` con subagentes
  murieron por límite de sesión → revisión ejecutada INLINE por el padre (3 fixes
  aplicados: guard de `object` del envelope, `waId` null en migración de BSUID,
  patrón BSUID en `user_id_update`). Re-correr los agentes dedicados post-reset es
  opcional.
- Hallazgo FUERA de scope (B0, no tocado): en `registry.ts`, `crmSyncAttemptConfig`
  omite `CRM_SYNC_ATTEMPT_REPARENT` de `forbiddenUpdateKeys` (los tipos SÍ lo prohíben
  — divergencia tipo/runtime) y eso genera el único warning de eslint del árbol.

**Cierre del sprint:**
- `npx tsc --noEmit`: 0 errores (el error preexistente de searchconsole.ts del baseline
  B0 ya no existe en esta rama).
- eslint sobre los archivos del sprint: 0 errores, 0 warnings (el único warning del
  árbol es el preexistente de B0 en registry.ts, ver hallazgo).
- `npm run build`: PASS, exit 0.
- Migración aplicada con `prisma migrate diff --from-schema-datasource` +
  `migrate deploy` (`migrate dev` es interactivo y la sesión no tenía TTY; precedente
  en el repo: `20260630000000_add_dossier_progreso`). `migrate status`: 83 migraciones,
  al día. Drift-cero verificado: `migrate diff` datasource→schema devuelve "empty
  migration".
- Suite de integración COMPLETA: **30/30 PASS** (11 motor-inbound nuevas + 8
  motor-isolation B0 + 8 chatbot-isolation B0 + 3 restantes), 30.5s contra Neon dev.

**Queda para verificación humana (pedido del sprint, NO delegado al reporte):**
- Disparar un webhook REAL desde el sandbox/número de prueba de 360dialog contra un
  entorno de dev y ver la fila creada (el fixture no reemplaza al payload vivo).
  Requiere: sembrar un WabaChannel real con credenciales
  (`generateChannelWebhookCredentials()`), configurar el webhook en 360dialog con
  `{ "url": "https://<host>/api/motor/webhook/<channelToken>", "headers": { "Authorization": "Bearer <webhookSecret>" } }`.
- Confirmar contra el payload vivo la forma real de `user_id_update` y de los mensajes
  BSUID-only.
- Decidir si se evalúa upgrade a partner de 360dialog para habilitar la firma HMAC
  (`x-360dialog-signature`) — hoy la auth es header estático (fuerte, pero sin
  integridad por-payload).

## B1-S2 — Adaptador BSP de salida: cliente de envío, ventana de 24h como dominio, plantillas (2026-07-09)

**Qué se hizo:**
- **Cifrado (patrón usado):** existía un helper AES-256-GCM en
  `src/modules/chatbot/server/crm/encryptSecret.ts` (B5.8, `CRM_SECRET_KEY`), pero
  la frontera eslint del motor PROHÍBE importar del módulo chatbot. Se **generalizó
  el patrón a `src/lib/crypto/secret-box.ts`** (`src/lib/**` es el único hogar
  compartido que el motor puede importar): caja key-configurable
  `createSecretBox(envVar)` → `encrypt/decrypt/isConfigured`, misma construcción GCM
  (IV 12 bytes, tag autenticado). El motor usa una env key DEDICADA
  `MOTOR_CHANNEL_SECRET_KEY` (dominio de secretos aislado del CRM, rotación
  independiente). El chatbot NO se tocó (ruta B5.8 en producción, fuera de scope) —
  la consolidación de su copia sobre el helper nuevo queda como deuda DRY reportada
  (ver Pendiente).
- **Schema ADITIVO** (`20260709180000_b1s2_outbound_apikey_templates_idempotency`):
  `WabaChannel.apiKeyEncrypted/apiKeyIv/apiKeyTag` (nullables, mismo shape que
  `CrmIntegration.secret*`; canal sin key = falla cerrado); modelo `MotorTemplate`
  (org NOT NULL, FK COMPUESTA org-safe a `WabaChannel`, enums
  `MotorTemplateCategory{UTILITY,SERVICE}` / `MotorTemplateStatus{PENDING,APPROVED,REJECTED}`,
  `@@unique([wabaChannelId,name,language])` + `@@unique([organizationId,id])`);
  `MotorMessage.outboundIdempotencyKey` + `@@unique([organizationId,outboundIdempotencyKey])`
  (requerido por la idempotencia de salida — no estaba en la lista del pliego pero lo
  exige la tarea 4). Registry del helper: accessor scoped `motorTemplate` (patrón
  motor: FK compuesta en DB, sin parentChecks).
- **Ventana como dominio** (`domain/window.ts`): `windowState(lastInboundAt, now)` puro,
  intervalo semiabierto `[inbound, inbound+24h)` — el borde exacto de 24h es CLOSED.
  `now` inyectado (sin leer reloj adentro). Test unitario de bordes en
  `tests/integration/motor-window.spec.ts`.
- **Cliente** (`adapters/whatsapp/outbound/client.ts`): POST texto/plantilla a
  `{baseUrl}/messages` con `D360-API-KEY`, timeout por intento (AbortController),
  reintento con backoff SOLO para red/timeout/5xx (jamás 4xx), mapeo de error tipado,
  `wamid` en el camino feliz. `fetch`/`logger`/`baseUrl`/`retryDelaysMs` inyectables.
- **Servicio** (`services/sendMessage.ts`): única puerta de salida. `forOrg` para todo;
  idempotencia por `idempotencyKey` (pre-check + reserva PENDING con unique de carrera);
  regla de ventana (texto fuera de ventana → RECHAZO tipado `window_closed`, CERO HTTP);
  plantilla exige `APPROVED` en DB (categoría acotada a utility/service por el enum —
  marketing imposible por construcción); despacha, marca SENT+wamid o FAILED.
  Destinatario = `waId ?? externalId` (BSUID-only se direcciona por BSUID; las
  plantillas de AUTENTICACIÓN no aceptan BSUID — comentado, irrelevante hoy).

**Decisiones del mapeo de errores (provider → tipo cerrado):**
- `401/403` o code `0/190` → `auth`. `429`/`130429`/`131056`/`131048` → `rate_limit`.
- `131047`/`131051` → `window_closed` (el BSP rechaza texto libre fuera de 24h — segunda
  línea de defensa: el servicio ya lo bloquea antes de llamar).
- `132xxx` (familia de plantilla) → `template_not_approved`.
- `131008`/`131026`/`131030`/`1013` → `invalid_recipient`.
- `5xx` → `provider_error` (reintentable); throw de fetch → `network`/`timeout`
  (reintentables). `2xx` sin `wamid` → terminal (no se reintenta: el provider aceptó,
  reintentar duplicaría).

**Qué se midió (cierre):**
- `tsc --noEmit`: 0 errores. eslint sobre los archivos del sprint: 0 errores (el único
  warning del árbol es el PREEXISTENTE de B0 en `registry.ts`,
  `CRM_SYNC_ATTEMPT_REPARENT` — ya anotado en B1-S1).
- Migración aplicada con `migrate diff --from-schema-datasource` + `migrate deploy`
  (`migrate dev` es interactivo, sin TTY — precedente B1-S1). Drift-cero verificado
  (`migrate diff` datasource→datamodel = "empty migration"). `migrate status`: 84
  migraciones, al día.
- Suite de integración COMPLETA: **43/43 PASS** (8 motor-outbound + 5 motor-window
  nuevas + 30 B0/B1-S1), 34s contra Neon dev. Casos outbound: texto en ventana OK
  (header con la API key descifrada), texto fuera de ventana RECHAZADO sin HTTP,
  plantilla fuera de ventana OK, plantilla no aprobada rechazada, 5xx reintenta / 4xx
  no, idempotencyKey secuencial y en paralelo (una sola fila por el unique), API key
  jamás en logs ni en la fila.
- `npm run build`: PASS, exit 0 (con `--max-old-space-size=4096`, nota de entorno B0).

**Post-review (ECC `/code-review` + `/security-review`, subagentes en paralelo):**
- **CORREGIDO (HIGH, ambos reviewers convergieron):** el `decrypt()` estaba DESPUÉS de
  reservar la fila PENDING y sin try/catch — una `MOTOR_CHANNEL_SECRET_KEY`
  ausente/rotada/malformada (o ciphertext corrupto → GCM tag mismatch) lanzaba sin
  atrapar, dejando el OUT colgado en PENDING para siempre y "quemando" la
  idempotencyKey (reintentos → deduped con wamid null eternamente). Fix: el decrypt se
  movió ANTES de la reserva, en try/catch que rechaza `channel_key_invalid` sin crear
  fila ni consumir la clave. Test nuevo (g) cubre el caso (secretBox con decrypt que
  falla → rechazo, cero HTTP, cero fila). Se atrapa sin ligar el error (no arriesga
  nada del secreto).
- **CORREGIDO (LOW, defensa en profundidad):** al persistir `MotorMessage.error` se
  redacta la API key del detalle del provider (`redact()`), por si el BSP alguna vez
  hiciera eco del header en su body de error.
- **CORREGIDO (MEDIUM, tamaño de función):** `sendMotorMessage` se bajó extrayendo
  `resolveTargets` / `checkSendable` / `reserveOutbound` / `findByIdempotencyKey`.

**Limitaciones / deuda reportada (aceptadas):**
- **DRY del cifrado:** `chatbot/.../encryptSecret.ts` quedó como copia independiente del
  patrón; migrarlo sobre `src/lib/crypto/secret-box.ts` (preservando `CrmEncryptionError`
  y la API pública) es un follow-up de bajo riesgo NO hecho acá para no tocar la ruta
  B5.8 viva.
- **Duplicado por reintento (at-least-once):** si el primer intento SÍ llegó al provider
  pero la respuesta se perdió (timeout/5xx), el reintento re-envía → mensaje duplicado
  al usuario. Meta/360dialog no expone un token de idempotencia en el wire que dedup-ee
  del lado del provider; `outboundIdempotencyKey` protege contra el re-invoke del CALLER,
  no contra este reintento interno. Inherente a la entrega at-least-once y al retry que
  el pliego EXIGE; se acepta y se documenta.
- **Reserva PENDING sin despacho:** si el proceso muere entre la reserva de la fila
  OUT (PENDING) y el fetch, la clave queda "usada" con la fila en PENDING; un reintento
  con la misma clave devuelve esa fila (deduped). La reconciliación de PENDING colgados
  es problema de B2 (orquestación).
- **Validación de entrada (Zod):** `sendMotorMessage` es servicio INTERNO, no frontera;
  la Server Action de B2 que lo cablee DEBE validar `content`/`to`/plantilla con Zod
  (convención del repo). Puntero hacia adelante, no defecto de hoy.
- **`MOTOR_D360_BASE_URL`:** solo config de servidor (nunca input de request) → sin SSRF;
  sin assertion de `https://` (hardening opcional si el env se expusiera a superficies
  menos confiables).
- **Provisioning de la API key:** no hay UI/servicio de alta de `WabaChannel` con
  `apiKey*` — hoy se siembra a mano (como el `channelToken` de B1-S1). B2/admin.

**Queda para verificación humana (pedido del sprint, NO delegado al reporte):**
- Un envío REAL de texto (en ventana, al número de prueba) y uno de plantilla desde el
  sandbox de 360dialog: el mock no valida credenciales ni el shape fino del provider
  (forma exacta del body de plantilla con componentes, wamid real, códigos de error
  vivos). Requiere `MOTOR_CHANNEL_SECRET_KEY` en el entorno y un `WabaChannel` sembrado
  con `apiKey*` cifrada.
- Confirmar contra el sandbox el mapeo de códigos de error (especialmente el de ventana
  cerrada del provider) y el shape del componente `body` de la plantilla.

## B1-S3 — Salud del canal: quality rating, ciclo de vida de plantillas y alertas operativas (2026-07-09)

**Qué se hizo:**
- Extendido el clasificador de S1 (`payload.ts`) con tres branches nuevos de
  `classifyChange`: `message_template_status_update`, `phone_number_quality_update`,
  `account_update` → tres miembros nuevos de `InboundEvent`. Nuevo handler
  `handle-health.ts` (`handleTemplateStatusUpdate` / `handlePhoneQualityUpdate` /
  `handleAccountUpdate`), cableado en `process.ts` (3 branches nuevas en `applyEvent` +
  contador `healthApplied` en `InboundProcessSummary`).
- Los tres eventos se aplican SIEMPRE sobre el `channel` ya resuelto por el token del
  webhook (frontera de tenant de la auth, no del payload): ninguno de los tres trae
  `phone_number_id`/org en su `value` confirmado — aplicar sobre `channel` es lo que
  preserva el aislamiento sin inventar un cruce por metadata.
- Schema ADITIVO (`20260709200000_b1s3_health_events_and_alerts`): `WabaChannel`
  gana `qualityRating` (`MotorPhoneQuality`), `messagingLimitTier`
  (`MotorMessagingLimitTier`), `channelStatus` (`MotorPhoneStatus`) — los tres
  `@default(UNKNOWN)`. `MotorTemplateStatus` gana `PAUSED` (`ALTER TYPE ADD VALUE`,
  aditivo). Modelo nuevo `MotorAlert` (org NOT NULL, FK COMPUESTA org-safe a
  `WabaChannel`, `MotorAlertType{PHONE_RESTRICTED_OR_BANNED,TEMPLATE_REJECTED}`,
  `MotorAlertSeverity{CRITICAL,HIGH,WARNING,INFO}`, `metadata Json`). Registry del
  helper: accessor scoped `motorAlert` (mismo patrón que `motorTemplate`: FK compuesta
  en DB, sin parentChecks).
- Suite nueva `tests/integration/motor-health.spec.ts` (11 tests, a–k) + fixtures en
  `motor-inbound-payloads.ts` (`templateStatusUpdatePayload`, `phoneQualityUpdatePayload`,
  `accountUpdatePayload`). Cubre los tres eventos, la dedupe de alertas (retry del BSP no
  duplica), el caso "plantilla no matchea localmente" (200, sin escritura), y el caso
  negativo de aislamiento (evento autenticado con el token de A jamás toca canal/alertas
  de B).

**Por qué `MotorAlert` y no `BotAlert` (decisión, con verificación estructural):**
`BotAlert` escala vía `botConfigId` (FK **requerida** a `BotConfig`, un concepto del
chatbot sin relación con `WabaChannel`) y su scope en el registry es relacional
(`{ botConfig: { organizationId } }`), no columna propia — confirmado leyendo
`registry.ts` antes de decidir, no solo por el nombre. Reusarlo para salud del motor
exigiría un `BotConfig` fantasma por org o un `botConfigId` nullable que rompe el
`parentCheck` existente. `MotorAlert` sigue el patrón del resto del motor: columna
`organizationId` propia + FK compuesta org-safe a `WabaChannel`, igual que
`MotorTemplate`. El transporte (email/WhatsApp al equipo) es B3 — acá es solo el
registro consultable, con una dedupe de 24h por (canal, tipo) para que un retry del
webhook no spamee el registro (patrón tomado de `detectBotIssues.ts` del chatbot).

**Fuentes de los shapes de eventos de salud (paso 0, con citas — igual que B1-S1):**
- Los tres docs de 360dialog que S1 ya citó (`docs.360dialog.com/docs/messaging-api/
  api-reference/webhooks`, `.../docs/messaging/webhook`,
  `.../partner/onboarding/webhook-events-and-setup/signature-validation`) documentan
  SOLO `messages`/`statuses`/`errors` — verificado de nuevo para este sprint (fetch
  directo de las tres páginas): ninguna menciona quality/tier/plantillas. Se fue a la
  referencia oficial de Meta Cloud API (`developers.facebook.com/documentation/
  business-messaging/whatsapp/webhooks/reference/...`), que 360dialog proxea.
- **`message_template_status_update` — CONFIRMADO.** Shape completo verbatim contra la
  referencia de Meta: `field`, `value.event` (enum: `APPROVED, ARCHIVED, UNARCHIVED,
  DELETED, DISABLED, FLAGGED, IN_APPEAL, LIMIT_EXCEEDED, LOCKED, PAUSED, PENDING,
  PENDING_DELETION, REJECTED, REINSTATED`), `message_template_id/name/language`,
  `reason` (enum: `ABUSIVE_CONTENT, CATEGORY_NOT_AVAILABLE, INCORRECT_CATEGORY,
  INVALID_FORMAT, NONE, PROMOTIONAL, SCAM, TAG_CONTENT_MISMATCH, null`). Se mapean 4
  eventos a `MotorTemplateStatus` (`APPROVED/REJECTED/PAUSED/PENDING`); el resto
  (`DISABLED`, `FLAGGED`, `ARCHIVED`, etc.) queda log-only a propósito — extenderlos
  exigiría ensanchar el enum de negocio más allá de lo que este sprint pide.
- **`phone_number_quality_update` — PARCIAL.** Solo `current_limit` (el tier:
  `TIER_50/250/2K/10K/100K/NOT_SET/UNLIMITED`) salió confirmado y consistente contra la
  referencia oficial de Meta. El COLOR de calidad (GREEN/YELLOW/RED, o el HIGH/MEDIUM/LOW
  que pide el pliego) **no tiene shape confirmado**: la doc de 360dialog no lo menciona,
  y dos fetches distintos contra la doc de Meta dieron resultados inconsistentes entre sí
  (uno sin el campo, otro con un `qualityRating` que parece de un BSP tercero, no de Meta
  crudo). Por la regla del pliego ("si un campo no está documentado ahí, dejá la rama con
  log estructurado y seguí — no inventes shapes"), **`qualityRating` NO se popula en este
  sprint**: la columna existe (aditiva, default `UNKNOWN`) pero el handler solo loguea
  `event`/`current_limit` sin tocarla. El disparador de alerta "quality rating baja de
  HIGH" queda SIN implementar por esta misma razón (ver Pendiente).
- **`account_update` — PARCIAL.** La LISTA de valores de `event` salió confirmada contra
  la referencia de Meta (`ACCOUNT_DELETED, ACCOUNT_OFFBOARDED, ACCOUNT_RECONNECTED,
  ACCOUNT_RESTRICTION, ACCOUNT_VIOLATION, AD_ACCOUNT_LINKED,
  AUTH_INTL_PRICE_ELIGIBILITY_UPDATE, BUSINESS_PRIMARY_LOCATION_COUNTRY_UPDATE,
  DISABLED_UPDATE, MM_LITE_TERMS_SIGNED, PARTNER_ADDED, PARTNER_APP_INSTALLED,
  PARTNER_APP_UNINSTALLED, PARTNER_CLIENT_CERTIFICATION_STATUS_UPDATE, PARTNER_REMOVED,
  VOLUME_BASED_PRICING_TIER_UPDATE`), pero las formas ANIDADAS (`ban_info`,
  `restriction_info`, `violation_info`) no lo están. El parser (`accountUpdateValueSchema`)
  solo toma `event` — nunca inventa un campo anidado. `event` se mapea a
  `MotorPhoneStatus` vía whitelist (`ACCOUNT_RECONNECTED→CONNECTED`,
  `ACCOUNT_RESTRICTION/ACCOUNT_VIOLATION/DISABLED_UPDATE→RESTRICTED`,
  `ACCOUNT_DELETED→BANNED`, `ACCOUNT_OFFBOARDED→DISCONNECTED`); el resto (partner/negocio,
  no son de salud del NÚMERO) queda log-only — mismo comportamiento que B1-S1 ya probaba
  para `PARTNER_ADDED` (test j de `motor-inbound.spec.ts`, sigue verde: el evento ahora
  entra por el branch nombrado en vez de por el genérico `other`, pero el resultado
  observable —cero escritura— es el mismo). `DISABLED_UPDATE→RESTRICTED` es una elección
  conservadora: sin el contenido de `ban_info`, no se puede distinguir un disable temporal
  de un ban — se prefiere subestimar severidad antes que inventarla.

**Qué se midió (cierre):**
- `tsc --noEmit`: 0 errores. `eslint` sobre los archivos del sprint: 0 errores, 0
  warnings nuevos (el único warning del árbol sigue siendo el preexistente de B0 en
  `registry.ts`, `CRM_SYNC_ATTEMPT_REPARENT`, ya anotado en B1-S1/B1-S2).
- Migración aplicada con `migrate diff --from-schema-datasource` + `migrate deploy`
  (`migrate dev` sin TTY — mismo precedente). `migrate status`: 85 migraciones, al día.
  Drift-cero verificado (`migrate diff` datasource→datamodel = "empty migration").
- Suite de integración COMPLETA: **55/55 PASS** (11 motor-health nuevas + 44
  preexistentes: motor-inbound, motor-outbound, motor-window, motor-isolation,
  chatbot-isolation), ~9-50s contra Neon dev según el filtro.
- `npm run build`: PASS, exit 0 (con `--max-old-space-size=4096`, nota de entorno B0).

**Pendiente (sube a planificación si aparece en producción):**
- **Trigger "quality rating baja de HIGH": NO implementado.** Motivo: el campo del color
  de calidad no tiene shape confirmado en ninguna doc accesible (ver "Fuentes" arriba).
  Cuando el shape se confirme (payload real capturado en producción, o doc de Meta que
  deje de ser inconsistente entre fetches), agregar: el schema del evento en `payload.ts`,
  el mapeo a `MotorPhoneQuality` en `handle-health.ts`, y un `MotorAlertType.
  QUALITY_DEGRADED` nuevo (no se agregó el enum value todavía a propósito — un valor sin
  ningún code path que lo emita es dead code).
- **`account_update` con formas anidadas (`ban_info`/`restriction_info`) sin usar:** el
  parser las ignora por completo; si en producción aparecen campos ahí (fecha de
  levantamiento del ban, motivo textual) que valga la pena persistir, es un sprint
  aparte — no se especuló con su forma acá.
- **`message_template_status_update` — eventos fuera del mapeo de 4:** `DISABLED`,
  `FLAGGED`, `ARCHIVED`, `IN_APPEAL`, `LOCKED`, `LIMIT_EXCEEDED`, `REINSTATED`,
  `PENDING_DELETION`, `DELETED`, `UNARCHIVED` quedan log-only. Si alguno resulta
  operacionalmente relevante en producción (ej. `DISABLED` bloqueando envíos que el
  chequeo de `sendMessage.ts` ya cubre indirectamente vía `status !== 'APPROVED'`),
  ensanchar el enum es la vía — no se hizo preventivamente.

**Queda para verificación humana (pedido del sprint, NO delegado al reporte):**
- Ninguna específica más allá de la revisión del PR — este sprint no toca caminos de
  producción existentes (no hay UI ni cron que lea `MotorAlert` todavía; el transporte
  de la alerta es B3).

## B2-S1 — Superficie sincrónica del chatbot: `generateBotReply` para el Motor (2026-07-17)

**Qué se hizo:**
- **El corte núcleo/cáscara.** El pipeline del chatbot mezclaba "generar la
  respuesta" con "servir el canal web". Se extrajo el NÚCLEO de generación a
  `src/modules/chatbot/server/chat/core.ts` (`runChatGeneration`), consumido por
  dos cáscaras sin duplicar el pipeline:
  - Núcleo: intent → system prompt (con apertura proactiva/guía de intent) →
    mapeo del historial a ModelMessage con spotlighting anti-inyección → tools
    (gating por plan × perfil del canal) → `resolveEffectiveModel` → la ÚNICA
    llamada a `streamText` (multi-step con tools) → persistencia en `onFinish`
    (ChatMessage ASSISTANT + agregados de Conversation + QuotaUsage + eventos).
  - Cáscara web (`handleChatRequest`, ahora ~350 líneas menos): parseo del
    Request, gate de origin + cap de dominios del plan, rate limit por IP/sesión,
    gating de cuota/hard-cap, persistencia del mensaje del visitante, y el shape
    del stream (`toUIMessageStreamResponse`). Devuelve byte-a-byte lo mismo que antes.
  - Cáscara sync (`generateBotReply`, la superficie nueva): valida bot∈org,
    arma el historial desde la DB, drena el stream internamente hasta el texto completo.
- **`TimingRecorder`** (`timing.ts`): las tres variables sueltas del timing
  (`startTime`/`timings`/`stepStart` + closure `mark`) pasaron a una clase que la
  cáscara pasa al núcleo a medio request (sus marcas de pre-LLM + las de generación
  comparten cursor). `mark`/`sinceCursor`/`setCursor` reproducen la semántica del
  closure original al pie (verificado contra `main`).
- **Perfil de tools por canal** (`channels.ts`): `web` = las 4 tools; `sync` = SOLO
  `capture_lead` (las otras 3 son UI del widget: sin cliente que las pinte, no se
  registran). El perfil se intersecta con `plan.tools`. Para `web` el perfil es el
  catálogo completo → set efectivo idéntico al de hoy (probado: getTools ya filtra
  contra el mismo catálogo).
- **`generateBotReply({ organizationId, botConfigId, sessionId, userMessageText })`
  → `{ text, conversationId, leadCaptured }`**, exportada desde el barrel NUEVO
  `src/modules/chatbot/public-api.ts` (único punto de entrada del Motor, frontera
  ESLint B0 — el hueco que B0-S1 dejó previsto). Corre el MISMO núcleo con perfil
  `sync`; sin origin, sin rate limit por IP, sin gating de cuota (política de
  orquestación → B2-S2). Persiste igual que el widget.
- **Tests** (`tests/integration/chatbot-sync-surface.spec.ts`, 5/5, LLM mockeado en
  la interfaz `LLMProvider` vía `getProvider` + `MockLanguageModelV3`): (a) texto
  completo devuelto y persistido; (b) bot de org B con scope de A → `BotNotInOrgError`
  y CERO escritura; (c) `capture_lead` dispara en sync y el lead queda scoped a la
  org; (d) sessionId `wa:...` crea conversación propia sin colisionar con el widget;
  (e) fallo del modelo (stream sin onFinish) → RECHAZA rápido, no cuelga.
- Script de dev para la verificación humana con LLM real:
  `scripts/dev/b2s1-sync-reply.ts`.

**Qué se decidió:**
- **Un solo `streamText`, compartido.** Prohibido copiar-pegar el handler: el núcleo
  es la fuente única. La superficie sync NO usa `generateText` (sería un segundo
  pipeline) — drena el MISMO `streamText` con `consumeStream()`.
- **Historial DB-backed para sync.** El Motor manda un mensaje; el contexto multi-turno
  se reconstruye desde la conversación persistida (el server es dueño del hilo),
  recortado con la MISMA política del widget (`trimHistory`). El canal decide de dónde
  sale el historial; el núcleo solo lo consume.
- **Orden del drenaje sync (CRÍTICO, encontrado en review adversarial).** Si el modelo
  falla ANTES de completar un step, el SDK (`ai@6`) rechaza sus promesas internas y
  NUNCA llama al onFinish — con lo cual el deferred `persisted` quedaría pendiente
  para siempre. Se materializa `result.text` (que rechaza en ese caso) ANTES de
  esperar `persisted`; así un fallo del modelo es un throw tipado (`GenerateBotReplyError`),
  jamás un cuelgue. Cubierto por el test (e). El canal web no cambia: ignora `persisted`
  (fire-and-forget, como siempre).
- **`leadCaptured` autoritativo desde la fila** (`Conversation.leadCaptured`, que
  `capture_lead` marca transaccionalmente durante el stream), leído post-drenaje.
- **`channel` sumado a `chat.llm_request_start`** (aditivo, para distinguir canales en
  telemetría). No rompe consumidores; único desvío —deliberado— del "mismos logs".

**Qué se midió:**
- tsc: PASS (src limpio; el único error de tsc es `.next/types` del cron
  `cleanup-old-events` — export no-handler PRE-EXISTENTE en `main`, fuera de scope;
  `next build` lo ignora vía `ignoreBuildErrors`).
- ESLint `--max-warnings 0` (fronteras intactas): PASS. `npm run build`: PASS.
- Suites ev del contrato del widget: **7/7** (ev1, ev2, ev3, ev3:golden, ev4, ev5, utm1).
  Invariantes de la tubería tocada: infra2, c02, cost1 PASS.
- Suite de integración COMPLETA: **61/61** (incluyendo las 5 nuevas de la superficie sync).
- Review adversarial independiente (agente code-reviewer): 1 CRITICAL (el cuelgue del
  drenaje) → **corregido y testeado**; 0 HIGH/MEDIUM; verificó equivalencia byte-a-byte
  del canal web (timing, prompts, tools, persistencia) contra `main`.

**Pendiente (B2-S2 y afuera):**
- La orquestación con el webhook (rate limiting del canal WhatsApp, gating de cuota
  para el canal sync, contabilización de conversación) es B2-S2 — NO se hizo acá.
  Hoy `generateBotReply` no chequea cuota ni incrementa el contador de conversaciones
  (el `onFinish` compartido pasa `isNewConversation=false` para no double-contar al
  widget); sí acumula tokens/cost. A resolver cuando el webhook oriente la política.
- El export no-handler `getProvidedCronSecret` de `cleanup-old-events/route.ts` sigue
  ensuciando `tsc`/`.next/types` (pre-existente, documentado desde Sprint S). Fuera de scope.

**Queda para verificación humana (pedido del sprint, NO delegado al reporte):**
- El flujo real del widget post-cambio (que ya se debe por el pendiente de B0/B1 —
  ahora verifica dos cosas de un tiro: que el widget sigue idéntico tras el corte).
- Una llamada real a `generateBotReply` contra un bot de prueba con el LLM real:
  `npx tsx scripts/dev/b2s1-sync-reply.ts [botSlug] ["mensaje"]`.
