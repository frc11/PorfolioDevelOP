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
