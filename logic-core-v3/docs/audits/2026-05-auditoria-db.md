# Auditoría de DB / Schema — Logic Core v3

**Fecha:** 2026-05-21
**Auditor:** Claude Opus 4.7 (1M context, thinking alto), modo autónomo
**Alcance:** Diseño de datos puro. Schema, migraciones, queries reales, base viva (read-only).
**Tipo:** Report-only. Cero escrituras, cero migraciones, cero ALTER/DROP.
**Base inspeccionada:** Neon PostgreSQL `neondb`, host `ep-rapid-mode-ac5ex84b-pooler.sa-east-1.aws.neon.tech`.
**Tag previo:** continúa de `docs/audits/2026-05-auditoria-profunda.md` — no repite hallazgos de aquel; profundiza diseño de datos.

> Lectura obligatoria antes de construir el sistema de planes y el hardening multi-tenant.
> Si decidís refactorizar el schema, hacelo ANTES de meterle Plan encima.

---

## 0. Veredicto (8 líneas)

El schema está **sano para construir encima**, con dos asteriscos. Los modelos están razonablemente normalizados, los `@@index` cubren los patrones más calientes, la frontera tenant (`organizationId` ⇒ tabla) está clara y los modelos OS/Audit globales están justificados. **No hace falta refactor grande antes del sistema de planes.**

Los dos asteriscos: **(a)** `Subscription.planName` es un `String` libre — es donde Plan tiene que entrar como FK, no campo nuevo; y **(b)** hay deuda barata pero real en enums (5 columnas `String` que son enums encubiertos), en un par de índices muertos/redundantes, y en `Project.organizationId` que sigue nullable con 1 fila huérfana en la base viva. Todo P1, no bloqueante.

La migration pendiente `20260520190000_add_alert_types` **debe aplicarse YA**: solo agrega valores al enum `BotAlertType`, es additive-only, y el código ya los referencia — sin esa migration, `detectBotIssues.ts` rompe en runtime al persistir un alert nuevo.

---

## 1. Chequeos pre-migration (lo que Franco necesita YA)

### 1.1 ¿Qué hace exactamente la migration pendiente?

[`prisma/migrations/20260520190000_add_alert_types/migration.sql`](../../prisma/migrations/20260520190000_add_alert_types/migration.sql):

```sql
-- Add missing BotAlertType values for R22 sprint
ALTER TYPE "BotAlertType" ADD VALUE IF NOT EXISTS 'DOMAIN_NOT_AUTHORIZED_SPIKE';
ALTER TYPE "BotAlertType" ADD VALUE IF NOT EXISTS 'LEAD_CAPTURE_FAILURE';
```

**Análisis de seguridad:**

- **Tipo de cambio:** additive a un enum existente, dos `ADD VALUE IF NOT EXISTS`.
- **Riesgo de pérdida de datos:** ❌ **CERO**. `ALTER TYPE ADD VALUE` no toca filas; solo amplía el dominio del enum.
- **Locks:** `ALTER TYPE ... ADD VALUE` toma un lock ligero por catálogo, no bloquea lecturas/escrituras de la tabla `chatbot_bot_alert`. En Postgres ≥ 12 (Neon corre 16) puede correr fuera de transacción y es prácticamente instantáneo.
- **Idempotencia:** `IF NOT EXISTS` la hace re-ejecutable sin error.
- **Rollback:** Postgres **no soporta `DROP VALUE` de enum**. Si quisieras revertir, hay que recrear el enum. Pero como los nuevos valores son additive y el código ya depende de ellos, no hay caso de uso real para revertir.

**¿Es seguro `prisma migrate deploy`?** ✅ Sí. Sin caveats.

**¿Es URGENTE aplicarla?** ✅ Sí — el código ya referencia los dos nuevos valores con cast `as BotAlertType`:

- [`src/modules/chatbot/server/admin/detectBotIssues.ts:209`](../../src/modules/chatbot/server/admin/detectBotIssues.ts:209): `type: 'DOMAIN_NOT_AUTHORIZED_SPIKE' as BotAlertType`
- [`src/modules/chatbot/server/admin/detectBotIssues.ts:229`](../../src/modules/chatbot/server/admin/detectBotIssues.ts:229): `type: 'LEAD_CAPTURE_FAILURE' as BotAlertType`
- [`src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx:16-17`](../../src/app/(protected)/admin/settings/alerts/AlertSettingsClient.tsx:16)

Sin la migration, la primera vez que `detectBotIssues` quiera persistir uno de esos alerts, Postgres tira `invalid input value for enum "BotAlertType"` y el cron de alertas falla. Hoy no rompe porque `BotAlert` tiene 0 filas y no se gatilló todavía — es una bomba con mecha corta.

### 1.2 Estado de la base de prod (Neon `neondb`)

**Una sola base para dev y prod.** `.env` y `.env.local` apuntan al mismo connection string (`ep-rapid-mode-ac5ex84b-pooler.sa-east-1.aws.neon.tech/neondb`). No hay separación local vs prod a nivel de Neon. Esto importa: la base que ves cuando corrés cualquier comando es la base que verá un cliente real. Aplicar la migration acá es aplicar en "prod".

**Inventario de filas (counts crudos, capturados ahora):**

| Tabla | Filas | Comentario |
|---|---:|---|
| Organization | 8 | 5 reales + 3 dudosas (ver §1.4) |
| User | 8 | |
| OrgMember | 5 | |
| Subscription | 3 | 3 planNames distintos como String libre |
| Project | 8 | **1 huérfana** (ver §1.3) |
| Task | 34 | |
| BotConfig | **2** | 1 activo (`develop`), 1 inactivo (`chatbot`) |
| KnowledgeBase | 2 | |
| Conversation | 49 | |
| ChatMessage | 122 | 73 user / 49 assistant (0 system) |
| ChatbotLead | 2 | ambos status=NEW, intent=quote |
| ChatbotEvent | 73 | 47 chat.message_completed / 13 SECURITY.BLOCKED_ORIGIN / 9 tool.lead_captured / 3 chat.unhandled_error / 1 handoff.whatsapp |
| ChatbotInsight | 0 | |
| QuotaUsage | 1 | |
| BotAlert | 0 | **explica por qué la migration aún no rompió nada** |
| PremiumModule | 9 | catálogo correcto |
| OrganizationModule | 1 | una sola activación real (mini-crm en San Miguel) |
| OsLead | 15 | CRM interno develOP |
| OsLeadActivity | 84 | |
| OsDemo | 13 | |
| OsPaymentMilestone | 10 | |
| OsTimeEntry | 29 | |
| AdminAuditLog | 155 | |
| ContactSubmission | 4 | |
| Message | 24 | |
| Invoice | 3 | |
| Notification | 19 | |
| Ticket / TicketMessage | 6 / 12 | |
| ClientAsset | 6 | |
| ClientBrandProfile | 1 | |
| EmailContact / EmailCampaign | 0 / 0 | módulo email-marketing no usado todavía |
| OnboardingTask | 0 | |
| BusinessMetric / PageView | 0 / 0 | nunca se escribieron |
| AgencySettings | 1 | |

**Lectura ejecutiva:** la base no está "vacía" pero está en **estado pre-producción** — la mayor parte de datos son del CRM interno (OsLead = 15 filas) y del bot develOP (Conversation = 49). Aplicar la migration es trivial: cero filas en BotAlert, cero filas en tablas afectadas.

### 1.3 Projects huérfanos (P0-5 de la auditoría previa)

**Query corrida (read-only):** `prisma.project.count({ where: { organizationId: null } })`

**Resultado:** **`1` Project huérfano de 8.**

**Implicancia:** volver `Project.organizationId` a `NOT NULL` requiere primero decidir qué hacer con esa fila — borrarla, asignarla a una org, o introducir un Project "interno" sin tenant.

**Recomendación concreta (NO ejecutada):**

1. Ver qué Project es:
   ```sql
   SELECT id, name, status, "osLeadId", "createdAt"
   FROM "Project" WHERE "organizationId" IS NULL;
   ```
2. Si es un Project legacy de develOP propio (sin tenant) — crear org `develop` (ya existe, slug `develop`) y asignárselo, o dejarlo intencionalmente como project "interno" pero con un mecanismo distinto al `organizationId IS NULL` (mucho más explícito: una flag `isInternal Boolean`).
3. Una vez asignado, la migración para volverlo `String` no-nullable es trivial:
   ```sql
   -- (no ejecutado, solo propuesto)
   UPDATE "Project" SET "organizationId" = '<id-org-develOP>' WHERE "organizationId" IS NULL;
   ALTER TABLE "Project" ALTER COLUMN "organizationId" SET NOT NULL;
   ```

### 1.4 Drift schema ↔ base

`npx prisma migrate status` muestra **únicamente** la migration pendiente:

```
42 migrations found in prisma/migrations
Following migration have not yet been applied:
20260520190000_add_alert_types
```

**No hay otro drift.** El schema declarado y la base coinciden salvo por esos dos enum values. `prisma/migrations/__diff_check.sql` está vacío (0 bytes). Bien.

**Observación lateral:** hay **3 orgs duplicadas** en `Organization` por una migración vieja (`v2-unify-project-task` de abril) que creó las orgs `agency-os-cmnkiwar4003a9fdwr63115kc` y `agency-os-cmnkiw999002u9fdw2xr733hl` además de las "verdaderas" `sigma-contable` y `sonrisa-norte`. No es drift de schema, es **drift de datos** — basura semántica que conviene limpiar antes de mostrar admin a un tercero. No bloquea nada técnico hoy.

---

## 2. Deuda de schema priorizada

### P0 — Resolver antes de planes/hardening

| # | Hallazgo | Modelo / línea | Cambio propuesto (no ejecutado) |
|---|---|---|---|
| **DB-P0-1** | `Subscription.planName String` libre, sin estructura. Es exactamente el lugar donde el modelo `Plan` tiene que reemplazar. Construir Plan sin esto es construir una segunda fuente de verdad. | [`schema.prisma:424-435`](../../prisma/schema.prisma:424) | Ver §5. Reemplazar `planName String` por `planId String` (FK a nuevo modelo `Plan`). Migración de datos: 3 filas (Plan Profesional, Plan AI Care, Plan Maintenance). |
| **DB-P0-2** | Migration `20260520190000_add_alert_types` sin aplicar. Código en `detectBotIssues.ts` referencia valores enum que la DB no conoce. Hoy no rompió porque `BotAlert.count = 0`. | `migration.sql` | `npx prisma migrate deploy`. Es additive, cero riesgo, ~50 ms en Neon. |
| **DB-P0-3** | `Project.organizationId String?` (nullable) y **1 fila huérfana** en la base viva. Si esa fila aparece en cualquier listado admin sin filtro defensivo, queda accesible sin scoping. | [`schema.prisma:381-388`](../../prisma/schema.prisma:381) | Asignar la fila huérfana o purgarla; luego `ALTER COLUMN ... SET NOT NULL`. La auditoría previa ya lo marcó (P0-5) — sigue abierto. |

### P1 — Mejora clara, no urgente pero antes de crecer

| # | Hallazgo | Modelo / línea | Cambio propuesto |
|---|---|---|---|
| **DB-P1-1** | Métricas denormalizadas en `Conversation` sin garantía transaccional documentada: `messageCount`, `tokensIn`, `tokensOut`, `estimatedCostUsd`, `leadCaptured`. El schema dice "actualizadas en transacción al guardar mensaje" pero no hay test ni constraint que lo garantice. Riesgo: drift si un escritor olvida `update`. | [`schema.prisma:1003-1010`](../../prisma/schema.prisma:1003) | Dos opciones: (a) consolidar en un único helper `appendChatMessage(conversationId, ...)` que es el único punto de escritura y abrir test de propiedad; (b) reemplazar por views materializadas / queries on-demand (más caro pero sin drift). Recomiendo (a). |
| **DB-P1-2** | 5 columnas `String` que son enums encubiertos: `Subscription.planName`, `ChatMessage.role` ("user"\|"assistant"\|"system"), `ChatbotLead.intent` ("quote"\|"info"\|"demo"\|"support"\|"other"), `ChatbotEvent.type`, `ChatbotEvent.level` ("info"\|"warn"\|"error"\|"debug"). | [`schema.prisma:428,1028,1055,1131,1132`](../../prisma/schema.prisma:428) | `planName` → ver DB-P0-1. `role` → `enum ChatRole`. `intent` → `enum ChatbotLeadIntent`. `event.level` → `enum LogLevel`. `event.type` → **dejarlo String** (es alta-cardinalidad, ej: `SECURITY.BLOCKED_ORIGIN`, `cron.generate_insights_failed`, `tool.lead_captured` — convertir a enum lo congela y obliga migration por cada nuevo tipo). |
| **DB-P1-3** | `User.unlockedFeatures String[]` legacy pero **sigue activo en código**: leído por [`src/app/(protected)/dashboard/layout.tsx:108`](../../src/app/(protected)/dashboard/layout.tsx:108), escrito por [`src/lib/actions/clients.ts:222-244`](../../src/lib/actions/clients.ts:222), leído por `SidebarNav` y `metrics-actions`. Coexiste con `OrganizationModule`. **1 user en la base** (`cliente@sanmiguel.com`) tiene `["mini-crm"]` ahí. | [`schema.prisma:240`](../../prisma/schema.prisma:240) | Cuando se introduzca `Plan`, este campo queda obsoleto definitivamente. Hoy: migrar a `OrganizationModule` con el script existente `prisma/seeds/migrate-unlocked-features.ts`, luego **drop column** en una migration explícita. No antes de Plan — sumarías un cambio extra sin valor. |
| **DB-P1-4** | `BusinessMetric.clientId` y `PageView.clientId` apuntan a `User` en vez de `Organization`. Si un user pertenece a múltiples orgs en el futuro, las métricas pierden contexto de tenant. **Hoy ambas tablas tienen 0 filas** — está libre el camino. | [`schema.prisma:547-568`](../../prisma/schema.prisma:547) | Renombrar `clientId` → `organizationId` y volver a apuntar a `Organization`. Sin filas a migrar. Aprovechá el corte. |
| **DB-P1-5** | `AdminAuditLog` sin `organizationId`. Es intencional (acciones globales SUPER_ADMIN), pero no está documentado en el schema. La auditoría previa lo señaló (P2-10). | [`schema.prisma:1177-1201`](../../prisma/schema.prisma:1177) | Agregar `targetOrganizationId String?` *opcional* (no FK obligatoria) para filtrar log "acciones que afectaron a org X". Cero costo, alto valor para soporte/forensia. |
| **DB-P1-6** | `LeadStatus` (CRM develOP, 8 estados rioplatenses: PROSPECTO/DEMO_ENVIADA/...) y `ChatbotLeadStatus` (5 estados ingleses: NEW/CONTACTED/...). Son DOS pipelines distintos y **debe** seguir siendo así — uno es CRM interno propio, el otro es de tenants. Está OK que sean distintos. No fusionar. | [`schema.prisma:723-732,1075-1081`](../../prisma/schema.prisma:723) | **Documentar la decisión** con un comment en el schema. Cero código. |
| **DB-P1-7** | `Conversation.lastMessageAt` se usa para ordenar en admin (queries.ts:19, multiTenantQueries.ts:59) pero el único índice de `Conversation` es `(botConfigId, startedAt)`. La query traerá filas ordenadas por startedAt aproximado en disco y luego ordenará en memoria. | Queries: [`src/modules/chatbot/server/admin/queries.ts:17-19`](../../src/modules/chatbot/server/admin/queries.ts:17), [`multiTenantQueries.ts:57-60`](../../src/modules/chatbot/server/admin/multiTenantQueries.ts:57) | Agregar `@@index([botConfigId, lastMessageAt(sort: Desc)])`. 49 filas hoy → impacto invisible, pero a 10k filas/bot la diferencia es real. |
| **DB-P1-8** | `ChatbotEvent.type` se filtra masivamente combinado con `botConfigId + createdAt` (al menos 7 queries distintas en `detectBotIssues.ts`, `buildWeeklyReport.ts`). El índice actual `(botConfigId, createdAt DESC)` se usa (201 scans) pero hace tail-filter en memoria por `type`. | Schema: [`schema.prisma:1141`](../../prisma/schema.prisma:1141). Queries: [`detectBotIssues.ts:84-225`](../../src/modules/chatbot/server/admin/detectBotIssues.ts:84). | Agregar `@@index([botConfigId, type, createdAt(sort: Desc)])` y dejar el actual. Con 73 filas no se nota; a 100k eventos/bot, el cron de detección pasa de segundos a milisegundos. |

### P2 — Nice-to-have

| # | Hallazgo | Modelo / línea | Cambio |
|---|---|---|---|
| **DB-P2-1** | `BotConfig.slug` tiene **DOS** índices en la DB: `chatbot_bot_config_slug_key` (unique constraint, 0 scans) y `chatbot_bot_config_slug_idx` (regular, 520 scans). El `@@index([slug])` del schema es redundante porque `slug String @unique` ya genera un índice. Costo: doble escritura en cada INSERT/UPDATE de BotConfig. | [`schema.prisma:960`](../../prisma/schema.prisma:960) | Borrar la línea `@@index([slug])`. La unicidad sigue garantizada por `@unique`. |
| **DB-P2-2** | `OsLead` tiene 3 índices simples (`status`, `nextFollowUpAt`, `assignedToId`) + 1 compuesto (`status, nextFollowUpAt`). pg_stat muestra que los simples están en **0 scans**, el compuesto en **24 scans**. | [`schema.prisma:636-639`](../../prisma/schema.prisma:636) | Borrar `@@index([status])` y `@@index([nextFollowUpAt])` solos. Conservar el compuesto y `assignedToId` (que tiene 0 scans hoy pero es del feature de asignación, válido a futuro). |
| **DB-P2-3** | `EmailContact_organizationId_idx` y `EmailCampaign_organizationId_idx` están subsumidos por `(organizationId, optedOut)` / `(organizationId, status)` y `(organizationId, email)` respectivamente. Postgres puede usar el prefijo del compuesto, los simples son redundantes. 0 scans en ambos. | [`schema.prisma:852,883`](../../prisma/schema.prisma:852) | Borrar los `@@index([organizationId])` solos en estas dos tablas. |
| **DB-P2-4** | `BotAlert.metadata Json @default("{}")` y `AdminAuditLog.diff/metadata` están bien como JSON (escritura libre, solo se renderizan), pero ninguno tiene shape documentado. Si el día de mañana querés un dashboard "alertas con `loomUrl` adjunto", tenés que abrir cada fila. | [`schema.prisma:1158,1189-1190`](../../prisma/schema.prisma:1158) | Documentar shape con un comment encima del campo (ej: `// shape: { source?: string, traceId?: string, ... }`). Cero cambio de DB. |
| **DB-P2-5** | `ChatbotEvent` no tiene índice por `(type, createdAt)` global. Se usa en `getLatencyHistory.ts:34` (admin global, sin botConfigId filter, scaneando con LIMIT 2000). Hoy con 73 filas es trivial; a 100k filas/mes hace seq scan. | Schema: [`schema.prisma:1128-1144`](../../prisma/schema.prisma:1128). Query: [`getLatencyHistory.ts:34-41`](../../src/modules/chatbot/server/admin/getLatencyHistory.ts:34) | O agregar `@@index([type, createdAt(sort: Desc)])` o cambiar la query para incluir `botConfigId IN (...)`. Yo elegiría lo segundo — la query es admin global pero igual hace JOIN para identificar el bot después. |

---

## 3. Índices vs queries reales

### 3.1 Índices muertos (0 scans + tabla con data)

Capturados desde `pg_stat_user_indexes`. Se omiten los `*_pkey` y los `*_key` (necesarios por unicidad) que aparecen en 0 simplemente porque la tabla está vacía o nadie hizo lookups por PK. Los siguientes son **índices secundarios redundantes**:

| Índice | Tabla rows | Por qué está muerto |
|---|---:|---|
| `OsLead_status_idx` | 15 | Subsumido por `OsLead_status_nextFollowUpAt_idx` (24 scans). Postgres usa el compuesto como prefijo. |
| `OsLead_nextFollowUpAt_idx` | 15 | Idem — no se usa nunca standalone. |
| `EmailContact_organizationId_idx` | 0 | Subsumido por `(organizationId, optedOut)` y `(organizationId, email)`. |
| `EmailCampaign_organizationId_idx` | 0 | Subsumido por `(organizationId, status)`. |
| `chatbot_lead_status_idx` | 2 | Ninguna query filtra ChatbotLead por `status` solo (siempre `botConfigId + capturedAt`). |
| `chatbot_events_level_createdAt_idx` | 73 | Ninguna query filtra por `level` sin `botConfigId`. |
| `Task_assignedToId_idx` | 34 | Las queries de tasks pasan por `projectId` o `assignedTo` con includes; no se filtra por assignedToId solo. (verificable: 0 scans pese a 34 filas) |
| `admin_audit_log_*_idx` (3) | 155 | Indices muy nuevos (alta-confianza muertos por edad, no por diseño). El log se consulta hoy con `findMany` paginado sin where específico. **Mantener.** Conviene re-medir en 30 días. |
| `chatbot_bot_alert_botConfigId_status_idx` | 0 | Tabla vacía. Mantener — es predictivo. |

**Acción propuesta (NO ejecutada):** borrar los 6 primeros del listado (los marcados P2-2 y P2-3 arriba). Ahorra escrituras en `OsLead`, `EmailContact`, `EmailCampaign`, `ChatbotLead`, `ChatbotEvent`, `Task`. Los `admin_audit_log_*` se mantienen 30 días más y se re-evalúan.

### 3.2 Índices faltantes (queries reales sin índice apto)

| Query / archivo | Patrón | Índice actual | Propuesta |
|---|---|---|---|
| `multiTenantQueries.ts:57-60`, `queries.ts:17-19` | `where: { botConfigId } orderBy: { lastMessageAt: desc }` | `(botConfigId, startedAt)` solo | **`@@index([botConfigId, lastMessageAt(sort: Desc)])`** sobre Conversation |
| `detectBotIssues.ts:84-227` (×6 queries) | `where: { botConfigId, type, createdAt: { gte } }` o `where: { botConfigId, level, createdAt: { gte } }` | `(botConfigId, createdAt DESC)` | **`@@index([botConfigId, type, createdAt(sort: Desc)])`** sobre ChatbotEvent (cubre `type+botConfigId` y deja level con el actual) |
| `audit-log-queries.ts:31-49` | `where: { userId? actionType? targetType? createdAt: { gte? } }` con todos opcionales | 3 indices compuestos (userId, actionType, targetType+targetId) | Suficiente. Sin cambio. Si en el futuro se filtra por `createdAt` solo (range filter sin otro campo), agregar índice descendente puro. |
| `chatbotLead.findMany({ where: { botConfig: { organizationId } } })` ([`leads/recent/route.ts:19-22`](../../src/app/api/dashboard/leads/recent/route.ts:19)) | Join hacia BotConfig por orgId | `chatbot_bot_config_organizationId_key` (unique, 227 scans, OK) + `chatbot_lead_botConfigId_capturedAt_idx` | Suficiente. El planner hace un nested-loop por org → bot → leads que es óptimo aquí. |
| `Notification.findMany({ where: { organizationId } orderBy: createdAt desc })` ([`dashboard/layout.tsx:81`](../../src/app/(protected)/dashboard/layout.tsx:81)) | Per-org + sort por createdAt | **Ningún índice** (solo PK). 5 scans hoy contra 19 filas, OK ahora. | **`@@index([organizationId, createdAt(sort: Desc)])`** sobre Notification. Es la query que corre en cada `/dashboard` request. |

**Resumen: 3 índices a agregar, 6 a borrar.** Saldo neto: −3 índices, mejor escritura, igual o mejor lectura.

---

## 4. JSON vs relacional — tabla de decisión

| Columna | Uso real (leído) | Uso real (filtrado/buscado) | Veredicto |
|---|---|---|---|
| `BotConfig.proactivePrompts` | Sí, consumida entera por el widget (`ProactiveTooltip.tsx:48`) y por el editor admin | No se filtra por contenido | **Dejar Json**. Shape estable: `Record<string, string[]>` por ruta. Documentar el shape con type alias en `publicConfig.ts:36` (ya existe). |
| `BotConfig.quickReplies` | Sí, entera | No | **Dejar Json**. Array corto (≤6), shape conocido. |
| `BotConfig.routeColorMap` | Sí, entera | No | **Dejar Json**. Pequeño dict. |
| `Organization.dataConnections` | Sí, entera (`health-score.ts:90`, `dashboard/attention.ts:65`) | No filtrado en queries | **Dejar Json**. Pero shape complejo (6 keys con sub-objetos) — vale la pena un Zod schema en `parseDataConnections` (ya parece existir). |
| `Organization.notificationPrefs` | Sí, entera (`actions/profile.ts:131`, `cuenta/perfil/page.tsx:203`) | No | **Dejar Json**. Shape pequeño. |
| `BotAlert.metadata` | Sí, entera para UI de alerts | No | **Dejar Json**. Pero documentar shape (P2-4). |
| `AdminAuditLog.diff` | Renderizado entero para UI | No | **Dejar Json**. Por diseño — distinto shape por `actionType`. |
| `AdminAuditLog.metadata` | Renderizado entero | No | **Dejar Json**. |
| `ChatMessage.toolCalls` | Sí, entero para reconstruir UI del bot | No | **Dejar Json**. Array variable, schema dictado por Vercel AI SDK. |
| `ChatbotEvent.metadata` | Sí, entero — `getLatencyHistory.ts:45` accede `meta.durationMs`, `meta.tokens` | **Casi** — leído por key específica en JS post-fetch | **Dejar Json por ahora**. Si en el futuro querés métricas SQL nativas sobre latencia (P50/P95 con `percentile_cont`), considerar columna explícita `durationMs Int?` separada. No urgente. |

**Conclusión §4:** **Ninguna Json column necesita pasar a relacional hoy.** El uso es "leer entero / renderizar / write-once por el escritor que conoce el shape". Convertir cualquiera de estas a tablas sería sobre-ingeniería. **Sí** hace falta documentar shapes (los TypeScript types ya existen para varios — basta agregar referencias en comentarios del schema).

---

## 5. Preparación para el sistema de planes

### 5.1 Estado actual

Tres conceptos coexisten hoy con responsabilidades solapadas:

- **`Subscription`** — String libre `planName`, registro contable (precio, status, renewalDate). 3 filas. Usado en alerts de churn y display.
- **`Service`** — relación org → tipo de servicio principal (WEB_DEV / AI / AUTOMATION / SOFTWARE). Marca qué servicio "core" tiene el cliente.
- **`OrganizationModule` + `PremiumModule`** — catálogo de módulos premium individuales (WhatsApp Autopilot, AFIP, Mini-CRM, ...) con precio por módulo. 9 módulos en catálogo, 1 activación real.
- **`User.unlockedFeatures`** — String[] legacy, todavía leído y escrito. 1 user con `["mini-crm"]`.

**No hay nada que represente "el cliente está en el plan Pro" como un objeto consultable.** El bot tampoco tiene acceso a "qué puedo hacer según el plan del cliente" — los límites están hardcoded (`BotConfig.monthlyQuota` default 1000) o ausentes (LLM model, tools, KB size, max domains).

### 5.2 Encaje propuesto (NO ejecutar)

**Modelo nuevo `Plan`** (independiente, sembrado):

```prisma
model Plan {
  id                   String   @id @default(cuid())
  slug                 String   @unique  // "starter" | "pro" | "business" | "custom"
  name                 String
  priceMonthlyUsd      Decimal  @db.Decimal(10, 2)

  // Bot runtime gating
  monthlyQuotaConversations Int
  allowedLLMModels     String[]            // ["gemini-2.5-flash", "claude-haiku-4-5"]
  enabledToolSlugs     String[]            // ["capture_lead", "show_whatsapp_handoff", ...]
  kbMaxBytes           Int?                // null = unlimited
  maxAllowedDomains    Int                 // 1 | 3 | unlimited

  // Producto
  includedModuleSlugs  String[]            // ["mini-crm", "motor-resenas"]
  featuresJson         Json     @default("{}")  // toggles: weeklyReports, aiBrief, ...

  status               String   @default("ACTIVE")  // ACTIVE | DEPRECATED
  sortOrder            Int      @default(0)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  subscriptions        Subscription[]

  @@map("plan")
}
```

**Migración de `Subscription`:**

```diff
model Subscription {
  id             String             @id @default(cuid())
  organizationId String             @unique
  organization   Organization       @relation(...)
- planName       String
+ planId         String
+ plan           Plan               @relation(fields: [planId], references: [id])
  status         SubscriptionStatus @default(ACTIVE)
  price          Float               // se mantiene como override
  ...
}
```

**Migración de datos (3 filas):**

```sql
-- (no ejecutado)
-- 1. Sembrar Plan con los 3 nombres actuales
INSERT INTO "plan" (id, slug, name, "priceMonthlyUsd", "monthlyQuotaConversations", "allowedLLMModels", "enabledToolSlugs", "maxAllowedDomains", "includedModuleSlugs") VALUES
  (gen_random_uuid()::text, 'profesional', 'Plan Profesional', 199, 1000, ARRAY['gemini-2.5-flash'], ARRAY['capture_lead','show_whatsapp_handoff'], 3, ARRAY[]::text[]),
  (gen_random_uuid()::text, 'ai-care', 'Plan AI Care', 99, 500, ARRAY['gemini-2.5-flash'], ARRAY['capture_lead'], 1, ARRAY[]::text[]),
  (gen_random_uuid()::text, 'maintenance', 'Plan Maintenance', 49, 0, ARRAY[]::text[], ARRAY[]::text[], 1, ARRAY[]::text[]);

-- 2. Backfill planId
UPDATE "Subscription" s SET "planId" = p.id FROM "plan" p WHERE p.name = s."planName";
-- 3. Cuando todo OK, ALTER COLUMN
```

**Lo bueno:**
- El refactor no toca `OrganizationModule` ni `PremiumModule` — siguen siendo el "addon store" sobre el plan base.
- `includedModuleSlugs` permite que asignar plan = auto-activar módulos en `OrganizationModule` (helper de servicio, no constraint DB).
- Bot runtime lee `getPlanForOrg(orgId)` y aplica gating en los 7 puntos identificados en la auditoría previa (sección 5.a).

**Lo a decidir (Franco):**
- Qué hacer con `Subscription.price Float` — ¿override del precio de Plan o se elimina y se calcula? Recomiendo **mantener** como override para descuentos / negociaciones individuales.
- ¿`unlockedFeatures` desaparece o se mantiene como "addons fuera del plan"? Recomiendo **desaparece**, migrar la única fila a `OrganizationModule` y dropear la columna en el sprint siguiente.
- ¿`Service` queda como está o se replantea? Recomiendo **dejarlo** — son los servicios "originales" (web/AI/automation/software) que son ortogonales al plan SaaS. Otra dimensión.

### 5.3 Esfuerzo y riesgo

- **Schema change:** 1 modelo nuevo, 1 columna nueva en Subscription, 1 columna a deprecar (planName). 1 migration custom para backfill.
- **Código:** helper `getPlanForOrg` con cache (Next.js `cache()` o tag-based revalidate), refactor de 7 puntos de gating del bot (ver auditoría previa §5.a), UI admin "asignar plan" (formulario simple).
- **Riesgo:** medio. Toca runtime del bot; conviene feature flag por org durante rampa (`plan?.featuresJson.enforceGating = false` default mientras se valida).
- **Tiempo estimado bien hecho:** 2-3 días.

**Recomendación final:** sí, hacer el refactor de Plan **antes** de meter el cliente piloto pago real. Es mucho más barato hoy con 3 filas en Subscription que con 30.

---

## 6. Decisiones pendientes para Franco

1. **Migration pendiente:** aplicarla ahora (`prisma migrate deploy`). No hay razón para esperar.
2. **Project huérfano:** ¿borrar la fila, asignarla a `develop`, o introducir flag `isInternal`? Mi voto: asignarla a `develop` y volver `organizationId` NOT NULL.
3. **Plan vs Subscription.planName:** ¿avanzamos con el refactor de §5 antes de cobrar al primer cliente, o sumamos planName como String hasta el primer dolor? Voto: refactor ahora — 3 filas vs 30 después.
4. **`unlockedFeatures` legacy:** ¿migrar ya con el seed script existente y dropear la columna, o esperar a que Plan esté completo? Voto: hacerlo dentro del mismo sprint de Plan.
5. **Orgs duplicadas (`agency-os-cmnki...`):** son basura semántica de una migration vieja. ¿Limpiar con un script de soft-delete, o dejar dormidas? Voto: borrar — no aportan, confunden al admin.
6. **3 índices a agregar, 6 a borrar:** ¿hacerlo en una sola migration `index_cleanup_v1` o ir uno por uno? Voto: una sola migration con todos los CREATE/DROP, atómica.
7. **`BusinessMetric.clientId` y `PageView.clientId` → `organizationId`:** ambas tablas vacías. ¿Renombrar ahora (gratis) o cuando se empiece a poblar? Voto: ahora, mientras es gratis.
8. **`AdminAuditLog.targetOrganizationId String?` (opcional):** ¿agregarlo? Voto: sí, ayuda a soporte/forensia con costo cero.

---

## 7. Anexo — outputs crudos

### 7.A `npx prisma migrate status`

```
Datasource "db": PostgreSQL database "neondb", schema "public" at
  "ep-rapid-mode-ac5ex84b-pooler.sa-east-1.aws.neon.tech"

42 migrations found in prisma/migrations
Following migration have not yet been applied:
20260520190000_add_alert_types

To apply migrations in development run prisma migrate dev.
To apply migrations in production run prisma migrate deploy.
```

### 7.B SQL de la migration pendiente

```sql
-- prisma/migrations/20260520190000_add_alert_types/migration.sql
-- Add missing BotAlertType values for R22 sprint
ALTER TYPE "BotAlertType" ADD VALUE IF NOT EXISTS 'DOMAIN_NOT_AUTHORIZED_SPIKE';
ALTER TYPE "BotAlertType" ADD VALUE IF NOT EXISTS 'LEAD_CAPTURE_FAILURE';
```

### 7.C Counts crudos por modelo

Ya en §1.2. No repito.

### 7.D Projects huérfanos

```js
// Query corrida (read-only): prisma.project.count({ where: { organizationId: null } })
// Resultado: 1
//
// Para identificar la fila concreta (no ejecutado):
// SELECT id, name, status, "osLeadId", "createdAt"
// FROM "Project" WHERE "organizationId" IS NULL;
```

### 7.E Subscription planNames distintos

```json
[
  { "planName": "Plan Profesional", "_count": 1 },
  { "planName": "Plan AI Care", "_count": 1 },
  { "planName": "Plan Maintenance", "_count": 1 }
]
```

### 7.F ChatbotEvent types observados (population real)

```json
[
  { "type": "chat.message_completed",    "_count": 47 },
  { "type": "SECURITY.BLOCKED_ORIGIN",   "_count": 13 },
  { "type": "tool.lead_captured",        "_count":  9 },
  { "type": "chat.unhandled_error",      "_count":  3 },
  { "type": "handoff.whatsapp",          "_count":  1 }
]
```

Niveles: `info=57`, `warn=13`, `error=3`. Total 73.

### 7.G Index usage (top 10 más usados)

| Index | Tabla | Scans |
|---|---|---:|
| Organization_pkey | Organization | 19826 |
| User_pkey | User | 18164 |
| Subscription_organizationId_key | Subscription | 5477 |
| OnboardingTask_organizationId_sortOrder_key | OnboardingTask | 635 |
| chatbot_bot_alert_status_createdAt_idx | chatbot_bot_alert | 639 |
| OsPaymentMilestone_projectId_idx | OsPaymentMilestone | 1056 |
| chatbot_bot_config_slug_idx | chatbot_bot_config | 521 |
| chatbot_quota_usage_botConfigId_year_month_key | chatbot_quota_usage | 446 |
| chatbot_knowledge_base_botConfigId_key | chatbot_knowledge_base | 433 |
| organization_module_organizationId_moduleId_key | organization_module | 406 |

### 7.H Index usage (0 scans, candidates a borrar — secundarios solamente)

Detallado en §3.1. Resumen: 6 a borrar firmemente, 4 a re-evaluar en 30 días, el resto justificado por tablas vacías o unicidad.

### 7.I Queries clave inspeccionadas

| Archivo | Línea | Query | Index actual usado |
|---|---|---|---|
| `src/modules/chatbot/server/admin/queries.ts` | 17 | `conversation.findMany where botConfigId orderBy lastMessageAt desc` | botConfigId_startedAt + memory sort ⚠️ |
| `src/modules/chatbot/server/admin/multiTenantQueries.ts` | 57 | idem | idem ⚠️ |
| `src/modules/chatbot/server/admin/queries.ts` | 42 | `chatbotEvent.findMany where botConfigId orderBy createdAt desc` | botConfigId_createdAt ✅ |
| `src/modules/chatbot/server/admin/detectBotIssues.ts` | 84-225 | múltiples `chatbotEvent.count/findMany where botConfigId + type + createdAt range` | botConfigId_createdAt + filter en heap ⚠️ |
| `src/modules/chatbot/server/admin/getLatencyHistory.ts` | 34 | `chatbotEvent.findMany where createdAt + type contains 'chat'` (GLOBAL, sin orgScope) | ⚠️ seq scan a futuro |
| `src/app/api/dashboard/leads/recent/route.ts` | 19 | `chatbotLead.findMany where botConfig.organizationId orderBy capturedAt desc` | join via botConfig org index + leads_botConfigId_capturedAt ✅ |
| `src/modules/chatbot/server/conversation/resolver.ts` | 66 | `conversation.findFirst where botConfigId + sessionId` | sessionId_idx (78 scans) ✅ |
| `src/app/(protected)/dashboard/layout.tsx` | 81 | `notification.findMany where organizationId orderBy createdAt desc` | **PK only** — falta index ⚠️ |
| `src/lib/audit-log-queries.ts` | 31-49 | múltiples filtros con createdAt + actionType/userId/targetType | 3 indices declarados, 0 scans hoy (tabla joven) |

### 7.J Bots y orgs vivas

```
Bots:
- slug=develop, name="Lucia",   active=true,  org=develop
- slug=chatbot, name="CHATBOT", active=false, org=empresa-demo

Orgs (8 total):
- ejemplo                              (2026-03-19, onboarded)
- empresa-demo                         (2026-03-21, onboarded)
- san-miguel                           (2026-03-21, onboarded)   ← cliente piloto SIN bot (P0-1 audit previa)
- agency-os-cmnkiwar4003a9fdwr63115kc  (2026-04-06, NO onboarded) ← duplicado de sigma-contable
- agency-os-cmnkiw999002u9fdw2xr733hl  (2026-04-06, NO onboarded) ← duplicado de sonrisa-norte
- sonrisa-norte                        (2026-04-06, onboarded)
- sigma-contable                       (2026-04-06, onboarded)
- develop                              (2026-05-12, NO onboarded) ← propia agencia
```

### 7.K Premium modules y activaciones

```
Catálogo: 9 módulos (whatsapp-autopilot, facturacion-afip, mini-crm,
  cobranzas-automatizadas, email-marketing, motor-resenas,
  reactivacion-clientes, agenda-inteligente, ecommerce-mantenimiento)
Activaciones reales (OrganizationModule, ACTIVE): 1
User.unlockedFeatures con datos: 1 (cliente@sanmiguel.com → ["mini-crm"])
```

---

## 8. Cierre

**Lo que NO se hizo en este run** (y conviene cerrar):

1. No se inspeccionó `EXPLAIN ANALYZE` de las queries críticas — todo el análisis de índices viene de `pg_stat_user_indexes` (uso histórico) y lectura de queries. Con 73 events y 49 conversaciones, EXPLAIN no diría nada útil hoy. Re-correr en 2 meses cuando haya 10k+ filas.
2. No se midió `pg_size_pretty(pg_total_relation_size(...))` por tabla — el query falló por columna ambigua (`relname`). Las tablas son chicas (todas <1 MB hoy), no es información que cambie la decisión.
3. No se verificó si Neon tiene réplica de read separada — la auditoría asumió una sola DB. Para growth >100 conversaciones/día convendría mover lecturas pesadas (admin overview, latency history) a réplica.
4. No se modeló el sistema de planes contra dos clientes concretos — la propuesta del §5 es genérica y necesita validarse con la tabla real de precios/cuotas/módulos que Franco quiera vender.

**Report-only confirmado.** Cero código, cero schema, cero migrations, cero filas tocadas.

— Fin del documento.
