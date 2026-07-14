# Auditoría dirigida — migraciones fantasma b1s* (READ-ONLY)

Fecha: 2026-07-13. Objetivo: mapear dónde quedó el SQL de las 3 migraciones aplicadas en la DB Neon compartida que no existen como carpetas en git/disco, y qué cambiaron en la DB — para planificar la reconciliación después. **En esta corrida NO se reconcilió nada.**

Método: workflow de 5 subagentes Explore read-only (git/disco en ambos worktrees, SQL suelto, docs, DDL directo) + crítico de completitud con 5 ángulos. Los DOS únicos accesos a la DB los hizo el hilo principal: (1) un SELECT de solo lectura a `_prisma_migrations`; (2) `prisma migrate diff` en modo comparación a stdout — el propio help de la CLI lo declara: *"prisma migrate diff is a read-only command that does not write to your datasource(s)"* (Prisma 6.19.3; sin shadow DB, que solo la exigen las variantes `--*-migrations`). Cero `migrate dev/deploy/reset/resolve`, cero `db push/execute`, cero DML/DDL. Único cambio al repo: este .md.

---

## VEREDICTO EJECUTIVO

| Migración | ¿SQL recuperable? | Fuente |
|---|---|---|
| `20260709163143_b1s1_webhook_credentials_and_identity_transitions` | **PERDIDO** — reconstruir desde la DB | ninguna |
| `20260709180000_b1s2_outbound_apikey_templates_idempotency` | **PERDIDO** — reconstruir desde la DB | ninguna |
| `20260709200000_b1s3_health_events_and_alerts` | **PERDIDO** — reconstruir desde la DB | ninguna |

**El hallazgo es más profundo que "carpetas borradas": el trabajo B1 nunca entró al control de versiones en ninguna forma.**
- Las carpetas **jamás fueron commiteadas** en ninguna rama (git log --all --diff-filter=A/D sobre `*b1s*`: vacío) → no hay hash del que hacer `git show`.
- **Tampoco los modelos**: `git grep` de `MotorTemplateStatus|outboundIdempotencyKey|MotorAlertType|webhookSecretHash|apiKeyEncrypted` sobre `schema.prisma` en las **8 refs** (locales `b0-isolation-motor-chatbot`, `main`, `runtime/mejoras` + remotas `origin/main`, `origin/b0-…`, `origin/runtime/mejoras`, `origin/feat/b1.6-health-score-real`, `origin/chore/b14-block-complete`): **0 matches en todas**.
- Ni stash (vacío en ambos worktrees), ni reflog (sin menciones b1*), ni objetos unreachable (los 17 commits unreachable escaneados: 0 hits), ni SQL suelto (los únicos `.sql` fuera de patrón son `__diff_check.sql` ×2, **0 bytes**), ni scratchpads de sesiones previas (solo existe `migrate-diff-b0s2.sql` con el DDL de **B0**, no de B1).
- Corolario: el estado B1 (schema + carpetas + presumiblemente código server) vive —si vive— en un working tree **fuera del universo visible de este repo** (otra máquina/clon sin push), o fue efímero. La DB solo guarda el checksum (64 chars), no el contenido (`logs` vacío).

**La buena noticia:** el efecto neto de las 3 en la DB está **completamente capturado** por el `migrate diff` de esta corrida (B2.2 abajo) — la reconstrucción es mecánica.

---

## B1 — Búsqueda del SQL en todo el universo git/disco

### 1.1 Disco y git trackeado (ambos worktrees)

Topología confirmada: `logic-core-runtime` es un **worktree linkeado del mismo repo** (`git rev-parse --git-common-dir` → `C:/PorfolioDevelOP/.git`), en rama `main` (HEAD `776e9b4`, "CRON-2…"); el principal está en `b0-isolation-motor-chatbot` (HEAD `2d8701e`). No hay más worktrees ni clones hermanos (crítico, ángulo 1: `git worktree list` = 2; Glob de `.git` anidados: solo el del worktree).

- Glob `**/*b1s*` en ambos árboles: **No files found**. Glob `**/migrations/20260709*`: **No files found**.
- `git ls-files | grep -i b1s`: vacío en ambos.
- `prisma/migrations/` en AMBOS árboles: idénticos (85 carpetas; disco == git). La secuencia salta de `20260707044711_motor_whatsapp_b0_schema` (07-07) directo a `20260710203413_add_portal_indexes` (07-10). El hueco del 07-09 está vacío.
- Runtime worktree **limpio** (`git status --porcelain` vacío) — las carpetas tampoco están como untracked sin commitear.

### 1.2 Historia completa (todas las ramas, incluidas remotas)

```
git log --all --oneline -- "*b1s*"                 → vacío
git log --all --diff-filter=A --oneline -- "*b1s*" → vacío   (nadie las agregó)
git log --all --diff-filter=D --oneline -- "*b1s*" → vacío   (nadie las borró)
git log --all --grep b1s/-i (y variantes)          → vacío   (ni en mensajes)
```

Crítico (ángulo 2): `git ls-tree -r <ref> -- logic-core-v3/prisma/migrations/ | grep -iE 'b1s|20260709'` sobre las **7 refs** → **(none)** en todas, incluidas `origin/feat/b1.6-health-score-real` y `origin/chore/b14-block-complete` (nomenclatura b1*/b14 pero sin relación con las fantasma).

### 1.3 SQL suelto

- Los únicos `.sql` fuera del patrón `<timestamp>_*/migration.sql`: `prisma/migrations/__diff_check.sql` en cada árbol — **0 bytes ambos** (el del principal está *trackeado*, del 28-abr; artefacto vacío de algún `migrate diff -o` viejo). Sin DDL.
- Grep de contenido en TODOS los tipos de archivo de ambos árboles: `webhook_credentials`, `apikey_template`, `health_event`, `identity_transition` → **0 matches**. Los nombres exactos de las 3 migraciones → **0 matches**. `idempotency` → solo matches preexistentes sin relación (roadmap B5.8, pseudocódigo de bitácora, mensaje de un cron).
- Backups (`prisma/backups/*`: pricing/módulos) y `.bak` (páginas marketing): sin relación.

### 1.4 Stashes, reflog, unreachable

- `git stash list`: **vacío** en ambos worktrees.
- `git reflog`: sin ninguna mención b1*; la actividad reciente es PA/PD/COST/T0/C0/B0.
- `git fsck --unreachable --no-reflogs`: 196 objetos, 17 commits — escaneados los 17 con `--stat`: **0 hits** (ruido de stash/index viejos de junio).

---

## B2 — Estado REAL de la DB (solo lectura)

### 2.1 `_prisma_migrations` (SELECT único, filas relevantes)

| migration_name | started_at (UTC) | finished_at | steps | checksum | logs |
|---|---|---|---|---|---|
| `20260707044711_motor_whatsapp_b0_schema` | 2026-07-07 04:48:17 | 04:48:17 | 1 | 64 chars | vacío |
| `20260709163143_b1s1_webhook_credentials_and_identity_transitions` | **2026-07-09 16:31:58** | 16:31:58 | 1 | 64 chars | vacío |
| `20260709180000_b1s2_outbound_apikey_templates_idempotency` | **2026-07-09 22:12:09** | 22:12:10 | 1 | 64 chars | vacío |
| `20260709200000_b1s3_health_events_and_alerts` | **2026-07-10 01:35:42** | 01:35:42 | 1 | 64 chars | vacío |

Hechos: las 3 se aplicaron el 09-10/07 (nótese: b1s2 con timestamp de carpeta `180000` se aplicó a las 22:12, y b1s3 `200000` a la 01:35 del día 10 — los timestamps de nombre son manuales/redondos, el orden de aplicación es el del nombre). `applied_steps_count=1` y `rolled_back_at=null` en las 3. **Prisma no guarda el SQL** — solo el checksum SHA-256 del `migration.sql` original (que por lo tanto EXISTIÓ como archivo en el working tree que las aplicó) y `logs` vacío. Dato lateral del mismo SELECT: `20260710203413_add_portal_indexes` **NO figura** → sigue pendiente de aplicación (consistente con CO-5/6).

### 2.2 `migrate diff` (local → DB): lo que la DB tiene y esta rama no

Comando: `npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script` (la datasource sale del env que carga `prisma.config.ts`: `.env.local` → `.env`). Salida completa, separada por dirección:

**(a) Payload de las b1s\* — objetos en la DB ausentes del schema local:**

```sql
-- CreateEnum
CREATE TYPE "public"."MotorAlertSeverity" AS ENUM ('CRITICAL', 'HIGH', 'WARNING', 'INFO');
CREATE TYPE "public"."MotorAlertType" AS ENUM ('PHONE_RESTRICTED_OR_BANNED', 'TEMPLATE_REJECTED');
CREATE TYPE "public"."MotorMessagingLimitTier" AS ENUM ('UNKNOWN', 'TIER_50', 'TIER_250', 'TIER_2K', 'TIER_10K', 'TIER_100K', 'TIER_NOT_SET', 'TIER_UNLIMITED');
CREATE TYPE "public"."MotorPhoneQuality" AS ENUM ('UNKNOWN', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE "public"."MotorPhoneStatus" AS ENUM ('UNKNOWN', 'CONNECTED', 'RESTRICTED', 'BANNED', 'DISCONNECTED');
CREATE TYPE "public"."MotorTemplateCategory" AS ENUM ('UTILITY', 'SERVICE');
CREATE TYPE "public"."MotorTemplateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAUSED');

-- AlterTable
ALTER TABLE "public"."motor_waba_channel" ADD COLUMN     "apiKeyEncrypted" TEXT,
ADD COLUMN     "apiKeyIv" TEXT,
ADD COLUMN     "apiKeyTag" TEXT,
ADD COLUMN     "channelStatus" "public"."MotorPhoneStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "channelToken" TEXT,
ADD COLUMN     "messagingLimitTier" "public"."MotorMessagingLimitTier" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "qualityRating" "public"."MotorPhoneQuality" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "webhookSecretHash" TEXT;

-- AlterTable
ALTER TABLE "public"."motor_message" ADD COLUMN     "outboundIdempotencyKey" TEXT;

-- CreateTable
CREATE TABLE "public"."motor_alert" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "wabaChannelId" TEXT NOT NULL,
    "type" "public"."MotorAlertType" NOT NULL,
    "severity" "public"."MotorAlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "motor_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."motor_contact_identity_transition" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contactIdentityId" TEXT,
    "channelType" "public"."MotorChannelType" NOT NULL,
    "fromExternalId" TEXT NOT NULL,
    "toExternalId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "motor_contact_identity_transition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."motor_template" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "wabaChannelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "category" "public"."MotorTemplateCategory" NOT NULL,
    "body" TEXT NOT NULL,
    "status" "public"."MotorTemplateStatus" NOT NULL DEFAULT 'PENDING',
    "providerTemplateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "motor_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "motor_alert_organizationId_id_key" ON "public"."motor_alert"("organizationId", "id");
CREATE INDEX "motor_alert_organizationId_wabaChannelId_createdAt_idx" ON "public"."motor_alert"("organizationId", "wabaChannelId", "createdAt");
CREATE INDEX "motor_contact_identity_transition_organizationId_contactIde_idx" ON "public"."motor_contact_identity_transition"("organizationId", "contactIdentityId");
CREATE INDEX "motor_contact_identity_transition_organizationId_createdAt_idx" ON "public"."motor_contact_identity_transition"("organizationId", "createdAt");
CREATE UNIQUE INDEX "motor_template_organizationId_id_key" ON "public"."motor_template"("organizationId", "id");
CREATE INDEX "motor_template_organizationId_wabaChannelId_idx" ON "public"."motor_template"("organizationId", "wabaChannelId");
CREATE UNIQUE INDEX "motor_template_wabaChannelId_name_language_key" ON "public"."motor_template"("wabaChannelId", "name", "language");
CREATE UNIQUE INDEX "motor_waba_channel_channelToken_key" ON "public"."motor_waba_channel"("channelToken");
CREATE UNIQUE INDEX "motor_message_organizationId_outboundIdempotencyKey_key" ON "public"."motor_message"("organizationId", "outboundIdempotencyKey");

-- AddForeignKey
ALTER TABLE "public"."motor_alert" ADD CONSTRAINT "motor_alert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."motor_alert" ADD CONSTRAINT "motor_alert_organizationId_wabaChannelId_fkey" FOREIGN KEY ("organizationId", "wabaChannelId") REFERENCES "public"."motor_waba_channel"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."motor_contact_identity_transition" ADD CONSTRAINT "motor_contact_identity_transition_contactIdentityId_fkey" FOREIGN KEY ("contactIdentityId") REFERENCES "public"."motor_contact_identity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."motor_contact_identity_transition" ADD CONSTRAINT "motor_contact_identity_transition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."motor_template" ADD CONSTRAINT "motor_template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."motor_template" ADD CONSTRAINT "motor_template_organizationId_wabaChannelId_fkey" FOREIGN KEY ("organizationId", "wabaChannelId") REFERENCES "public"."motor_waba_channel"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
```

Notas de lectura: `MotorChannelType` (usado por la tabla de transitions) NO aparece como CreateEnum → ya existía (vino con B0). Todas las tablas nuevas llevan `organizationId` en PKs compuestas/índices/FKs — consistente con el modelo de aislamiento del motor. Las FKs compuestas `(organizationId, wabaChannelId)` → `motor_waba_channel(organizationId, id)` son el patrón identity-FK del helper.

**(b) Dirección contraria — lo que el schema local tiene y la DB no (NO es parte del problema b1s):** los 6 `DROP INDEX` del diff (`Service_organizationId_idx`, `Invoice_organizationId_idx`, `Message_organizationId_createdAt_idx`, `ContactSubmission_{createdAt,read,referralCode}_idx`) = la migración local `20260710203413_add_portal_indexes` (CO-5/6) **pendiente de aplicación**, confirmado por partida doble (SELECT 2.1 + diff).

### 2.3 Schema local — grep

`schema.prisma` de esta rama NO tiene: modelos/columnas de webhook credentials, apikey templates, health/quality de canal, templates, transitions, idempotency key de motor, ni `motor_alert`. Solo hits preexistentes sin relación: `BotAlert*` (alertas del chatbot, mayo), `calComApiKey`/`healthScores` (Organization), `webhookUrl` (CRM n8n). **Faltan tanto las carpetas como el datamodel.**

### Mapeo DDL → migración (por nombre; el diff es acumulativo)

| Objeto | Migración probable |
|---|---|
| `webhookSecretHash` (waba_channel) + tabla `motor_contact_identity_transition` + sus índices/FKs | **b1s1** (webhook_credentials_and_identity_transitions) |
| `apiKeyEncrypted/Iv/Tag` (waba_channel) + tabla `motor_template` + `outboundIdempotencyKey` (motor_message) + uniques | **b1s2** (outbound_apikey_templates_idempotency) |
| `channelStatus`/`qualityRating`/`messagingLimitTier` (waba_channel) + tabla `motor_alert` + enums de salud | **b1s3** (health_events_and_alerts) |
| `channelToken` + su unique | ambiguo (b1s1 credenciales o b1s3 health-polling) — lo desambigua el dueño del lane |

La partición exacta por migración NO es recuperable desde el diff (es el delta acumulado); solo importa si se reconstruyen las 3 carpetas con sus nombres originales (ver recomendación).

---

## B3 — Cómo se aplicaron (contexto)

### 3.1 Registro documental

**Una sola mención en todo el corpus** (idéntica en ambos árboles): la nota de drift del sprint C0.2, `docs/bitacora-roadmap.md:13499-13502`:

> *prisma migrate status reporta drift entre ramas: local tiene 20260710203413_add_portal_indexes sin aplicar y la DB de dev tiene 3 migraciones del motor B1 (b1s1/b1s2/b1s3) que no existen en esta rama. No bloquea este sprint (cero cambios de schema) — a conciliar cuando se mergeen las ramas. Jamás migrate reset.*

La bitácora del propio motor (`docs/motor-whatsapp/bitacora.md`) **corta en B0-S3** (08/07): documentó B0 con hashes y `migrate status` ("82 migraciones al día" tras `motor_whatsapp_b0_schema`) y **nunca registró B1**. Nadie está atribuido; ningún doc dice `dev` vs `deploy`; nada habla de carpetas borradas — *"no existen en esta rama"* asumía que vivían en otra rama, pero git demuestra que no viven en ninguna.

Línea de tiempo: 07/07 se aplica B0 → 06-08/07 bitácora motor B0-S1..S3 (fin del registro) → **09/07 se aplican las 3 b1s sin rastro** → 10/07 C0.2 detecta el drift y difiere → 10/07 se crea `add_portal_indexes` (local, sin aplicar).

### 3.2 ¿DDL directo sin prisma migrate?

**Negativo**: cero scripts en `scripts/`/`src/` que apliquen DDL (todo `$executeRaw*` del repo es DML: cuota atómica en `isolation/registry.ts`, limpieza de rate-limit en un e2e). **Pero hay precedente documental del mecanismo** en `docs/bitacora-beta.md` (:698, :957, :1013, :1271): el repo ya usó manualmente `prisma db execute` + `prisma migrate resolve --applied` para reconciliar — incluido un caso (:1271) donde `resolve --applied` marcó una migración **sin** correr su SQL. El row-shape de las 3 fantasma (checksum real de 64 chars) implica que en el working tree que las aplicó las carpetas **existieron como archivos** (Prisma calcula el checksum desde `migration.sql`) — se aplicaron con tooling estándar de Prisma desde un árbol que nunca se versionó ni pusheó.

---

## RECOMENDACIÓN DE RECONCILIACIÓN (no ejecutada — decisión y timing humanos)

**Paso 0 — antes de reconstruir, preguntar al dueño del lane motor** (la fuente más probable del SQL original es su working tree sin push, en otra máquina o clon). Si aparecen las 3 carpetas originales: commitearlas tal cual → los checksums de `_prisma_migrations` **matchean byte-exacto** → `migrate status` queda limpio sin tocar nada de la DB. Es el único camino sin cirugía. De paso desambigua `channelToken` y trae el datamodel + código server de B1.

**Si el SQL original no aparece → reconstrucción.** Dos rutas, ambas requieren primero traer el **datamodel** al schema (los modelos tampoco existen en git — la reconciliación es parte del merge del lane motor, como ya decía la nota de C0.2):

- **(a) Recomendada — una migración de reconciliación nueva** (`<ts>_reconcile_b1_motor_drift`) con el DDL del punto B2.2(a), siguiendo el precedente propio del repo (`20260621120000_reconcile_dev_drift_schema_align` + el patrón documentado en bitacora-beta): en la DB dev se marca con `migrate resolve --applied` (los objetos ya existen); en cualquier entorno futuro sin B1, `migrate deploy` la aplica de verdad. Las 3 filas fantasma de `_prisma_migrations` quedan entonces obsoletas: o se borran con un DELETE manual único (la única escritura a esa tabla, a cargo del humano, con las 3 `migration_name` exactas), o se aceptan como warning permanente de `migrate status` ("in the database, not found locally"). Pros: sin cirugía de checksums, partición por migración innecesaria. Contras: la historia pierde los 3 nombres originales.
- **(b) Alternativa — recrear las 3 carpetas con sus nombres exactos** repartiendo el DDL según el mapeo de arriba: `migrate status` las encuentra por nombre y deja de reportarlas fantasma, pero los **checksums no van a coincidir** con los registrados (el SQL reconstruido no es byte-idéntico) — Prisma detecta migraciones aplicadas "modificadas" en los flujos de dev, y arreglarlo del todo exige actualizar a mano los 3 checksums en `_prisma_migrations`. Pros: historia con nombres reales y partición correcta. Contras: cirugía extra, partición de `channelToken` ambigua, comportamiento del checksum a validar antes de confiar.

En ambas rutas: coordinar con el merge de la rama del motor, verificar después con `prisma migrate status` (limpio) + `migrate diff` (vacío), y — como fija la nota de C0.2 y la regla del repo — **jamás `migrate reset`**.

Pendiente lateral re-confirmado de paso (no b1s): `20260710203413_add_portal_indexes` sigue sin aplicar en la DB (PASOS HUMANOS de CO-5/6 vigentes).
