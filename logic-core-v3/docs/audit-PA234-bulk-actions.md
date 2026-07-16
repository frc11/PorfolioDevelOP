# Auditoría dirigida PA-2/3/4 — bulk actions del admin de chatbots (READ-ONLY)

Fecha: 2026-07-11. Prepara el/los sprint(s) de endurecimiento de los bulk actions del admin. NO es re-auditoría integral. Método: workflow de 5 subagentes Explore read-only en paralelo (P1 archivo, P2 helper CSV cliente + inventario, P3 contrato UI + convención de retorno, P4 logAdminAction/batch/aislamiento, P5+P6 seeds/modelo/tests/frozen) + crítico de completitud con 6 ángulos extra. Cero ejecución (ni queries, ni el export). Único cambio al repo: este .md.

**Resumen de drifts vs. el cruce previo:**
1. **PA-2 es DOBLE**: hay DOS exports CSV admin inseguros, no uno. El auditado (`admin/chatbots/bulk-actions.ts`) y un segundo (`src/lib/bulk-actions.ts`, bulk por orgs desde `/admin/clients`) que solo el crítico detectó. Ninguno mitiga fórmula; el primero además rompe el quoting (solo `intent` duplica comillas).
2. **PA-3 está PARCIALMENTE mitigado ya**: la UI (`announceBulk`) hoy distingue el fallo total con `failures` vacío y muestra "sin permisos o la sesión expiró" en toast de error. El gap restante es más chico de lo asumido (detalle por ítem solo a console; parse Zod también devuelve `failures: []`; el export ignora `result.error`).
3. **El helper a reusar (`csvEscape`) vive DENTRO de `src/modules/chatbot/server/leads/csv/`** — exportado y reutilizable, pero del otro lado de la frontera de módulo. Ambos bulk-actions admin ya importan de `chatbot/server` hoy (`invalidateBotCache`, `requireSuperAdmin`), y la regla eslint de frontera NO los alcanza (hecho, no opinión).
4. **PA-4 confirmado + una instancia extra**: loops 100% seriales (2-3 queries/ítem) en el archivo auditado, y en `src/lib/bulk-actions.ts` el `updateMany` es batch pero el log sigue siendo N awaits seriales. NO existe en el repo ningún patrón "batch + log agregado" para espejar.

---

## P1 — El archivo y las 4 actions

### 1.1 Ruta y exports

**Ruta exacta:** `src/app/(protected)/admin/chatbots/bulk-actions.ts` — 234 líneas. NO está bajo `src/modules/chatbot/server/*` (es App Router). Ojo: existe un homónimo NO relacionado en dominio chatbots-page: `src/lib/bulk-actions.ts` (bulk por orgs; ver P2.3 y crítico).

Imports (L1-8):
```ts
'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/audit-log'
import { invalidateBotCache } from '@/modules/chatbot/server/conversation'
```

| Export | Firma | Línea |
|---|---|---|
| `bulkPauseBotsAction` | `(botIds: string[]): Promise<BulkResult>` | 18 |
| `bulkActivateBotsAction` | `(botIds: string[]): Promise<BulkResult>` | 64 |
| `exportLeadsBulkAction` | `(botIds: string[])` — retorno inferido `{ok:...}` | 110 |
| `bulkDeleteBotsAction` | `(botIds: string[]): Promise<BulkResult>` | 163 |

`BulkResult` (L10-14, NO exportada): `{ success: number; failed: number; failures: Array<{ botId: string; error: string }> }`. `BulkBotIdsSchema` (L16, NO exportado).

### 1.2 Generación del CSV de leads (PA-2) — VERBATIM L131-144

```ts
  const headers = ['Cliente', 'Bot', 'Nombre', 'Email', 'Teléfono', 'Intent', 'Status', 'Fecha']

  const rows = leads.map(lead => [
    lead.botConfig.organization.companyName,
    lead.botConfig.botName,
    lead.name ?? '',
    lead.email ?? '',
    lead.phone ?? '',
    (lead.intent ?? '').replace(/"/g, '""'),
    lead.status,
    lead.capturedAt.toISOString(),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
```

Hechos:
- **Único campo con escape real:** `intent` (L139) duplica `"` → `""` (RFC 4180).
- **Crudos** (envueltos en `"${v}"` pero SIN duplicar comillas internas): `companyName` (L134), `botName` (L135), `name` (L136), `email` (L137), `phone` (L138), `status` (L140), fecha (L141). Una `"` dentro de cualquiera de ellos rompe la celda/corre columnas.
- **Mitigación de fórmula (`= + - @`, tab, CR): NO existe.** Ningún prefijo ni sanitización. `name`/`email`/`phone` son input del visitante del widget (ver P5.2) → CSV formula injection directa al Excel del admin.
- Separador `\n` (no CRLF), sin BOM UTF-8 (a diferencia del helper cliente, ver P2.2).
- Nota de drift menor: `intent` hoy es enum en el schema (`ChatbotLeadIntent`, valores acotados) — el ÚNICO campo que escapa es justamente el menos inyectable.

### 1.3 Guards y shape de retorno (PA-3) — VERBATIM

Guard idéntico en pause (L19-24) / activate (L65-70) / delete (L164-169):
```ts
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { success: 0, failed: botIds.length, failures: [] }
  }
  const userId = session.user.id
  if (!userId) return { success: 0, failed: botIds.length, failures: [] }
```

Guard del export (L111-116) — shape DISTINTO:
```ts
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { ok: false as const, error: 'Forbidden' }
  }
  const userId = session.user.id
  if (!userId) return { ok: false as const, error: 'Forbidden' }
```

| Acción | Éxito | Fallo de permiso | Fallos parciales |
|---|---|---|---|
| pause/activate/delete | `{ success, failed, failures }` con conteos (L61/107/232) | `{ success: 0, failed: N, failures: [] }` — **vacío** (L21, 67, 166) | `failures` poblado por ítem (abajo) |
| export | `{ ok: true as const, csv, totalLeads }` (L157) | `{ ok: false as const, error: 'Forbidden' }` (L113/116) | N/A (findMany atómico) |

**`failures` queda VACÍO en 3 caminos:** permiso (L21/67/166), `userId` ausente (L24/70/169), y parse Zod fallido en delete (L171-174):
```ts
  const parsed = BulkBotIdsSchema.safeParse(botIds)
  if (!parsed.success) {
    return { success: 0, failed: botIds.length, failures: [] }
  }
```

**`failures` SÍ se puebla con causa** solo dentro del loop: bot inexistente en delete (L192-196: `failures.push({ botId, error: 'El bot no existe o ya fue eliminado.' })`) y el catch genérico idéntico en las 3 (ej. L51-57: `error: error instanceof Error ? error.message : 'unknown'`).

### 1.4 Loops (PA-4) — todo SERIAL, cero `updateMany`/`deleteMany`/`createMany` en el archivo

| Acción | Ops DB por ítem | Queries/ítem |
|---|---|---|
| `bulkPauseBotsAction` | `botConfig.update` (L32) + `logAdminAction` (L39) | **2** (+`invalidateBotCache` L37, no-DB) |
| `bulkActivateBotsAction` | `botConfig.update` (L78) + `logAdminAction` (L85) | **2** |
| `bulkDeleteBotsAction` | `findUnique` (L183) + `delete` (L198) + `logAdminAction` (L201) | **3** (1 si el bot no existe) |

Loop de pause verbatim (L30-58) — activate es idéntico salvo `isActive: true` / `BOT_ACTIVATED`:
```ts
  for (const botId of botIds) {
    try {
      const bot = await prisma.botConfig.update({
        where: { id: botId },
        data: { isActive: false },
        select: { slug: true },
      })
      invalidateBotCache(bot.slug)

      await logAdminAction({
        userId,
        userEmail: session.user.email,
        userName: session.user.name,
        actionType: 'BOT_DEACTIVATED',
        action: `Pausó bot ${botId} (acción bulk)`,
        targetType: 'BotConfig',
        targetId: botId,
        metadata: { bulk: true },
      })

      success++
    } catch (error) {
      failed++
      failures.push({
        botId,
        error: error instanceof Error ? error.message : 'unknown',
      })
    }
  }
```

Loop de delete (L181-229): `findUnique` (con `_count` de conversations/leads/events para el log) → `delete` → `logAdminAction` con metadata rica (`botSlug`, `organizationId`, `deletedCounts`). El `delete` arrastra el subárbol por `onDelete: Cascade` (1 sentencia Prisma por ítem). `exportLeadsBulkAction` NO tiene loop de escritura: 1 `chatbotLead.findMany` con `botConfigId: { in: botIds }` (L118-129) + 1 `logAdminAction` (L146).

---

## P2 — El helper anti-inyección del dashboard cliente (a reusar)

### 2.1 Dónde está

El export cliente seguro NO es una action llamada `exportLeads` — es un **route handler**: `src/app/api/dashboard/chatbot/leads/export/route.ts:83` (GET), que llama `buildLeadsCsv(...)` en `:166` y sirve `text/csv; charset=utf-8` en `:203`. El helper vive en módulo dedicado:

- `src/modules/chatbot/server/leads/csv/csvEscape.ts:25` — `csvEscape` (la función núcleo)
- `src/modules/chatbot/server/leads/csv/buildLeadsCsv.ts:132` — `buildLeadsCsv`
- `src/modules/chatbot/server/leads/csv/index.ts` — barrel que re-exporta `csvEscape`, `rowToCsv`, `UTF8_BOM`, `CSV_NEWLINE`, `buildLeadsCsv`

Los nombres `escapeCsv`/`sanitizeCsv` del hallazgo previo **no existen** — la función real es `csvEscape`.

### 2.2 La función — VERBATIM (`csvEscape.ts:22-53`), EXPORTADA (module scope, reutilizable, NO inline)

```ts
const DANGEROUS_PREFIX = /^[=+\-@\t\r]/
const NEEDS_QUOTING = /[",\r\n]/

export function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''

  let s = typeof value === 'number' ? String(value) : value

  // 1) Anti-injection: prefijo con comilla simple si arranca con char peligroso.
  if (DANGEROUS_PREFIX.test(s)) {
    s = `'${s}`
  }

  // 2) Wrap con quotes si contiene coma, quote o newline. Quotes internas se
  //    duplican (RFC 4180).
  if (NEEDS_QUOTING.test(s)) {
    s = `"${s.replace(/"/g, '""')}"`
  }

  return s
}

/** BOM UTF-8 para que Excel detecte la codificación y abra tildes/ñ correctas. */
export const UTF8_BOM = '﻿'

/** CRLF como separator — máxima compat con Excel (RFC 4180). */
export const CSV_NEWLINE = '\r\n'

/** Convierte un array de valores en una línea CSV con cada celda escapeada. */
export function rowToCsv(values: Array<string | number | null | undefined>): string {
  return values.map(csvEscape).join(',')
}
```

- Comillas: duplica + envuelve solo cuando `NEEDS_QUOTING` matchea (`,` `"` `\r` `\n`).
- Fórmula: prefijo `'` si arranca con `= + - @ \t \r` (anti-injection PRIMERO, wrap DESPUÉS — orden documentado en el archivo).
- `null`/`undefined` → `''`; números → `String`.
- **Hecho de frontera:** vive bajo `src/modules/chatbot/server/*`. Está exportado vía barrel; los dos bulk-actions admin ya importan símbolos de `chatbot/server` hoy (`invalidateBotCache`, `requireSuperAdmin`), y la regla eslint de frontera no cubre esos archivos (ver P4.3) — la decisión de importar directo vs. extraer a `src/lib/` es de diseño, fuera de esta corrida.

### 2.3 Inventario COMPLETO de generadores CSV del repo

Sin librería CSV (papaparse/csv-stringify/json2csv: 0 matches en package.json y src/). Todo string-building manual.

| # | Generador | Ruta | Lado | ¿Escapa? |
|---|---|---|---|---|
| 1 | `buildLeadsCsv` (route export) | `src/app/api/dashboard/chatbot/leads/export/route.ts:166` → `chatbot/server/leads/csv/*` | Cliente | **SÍ completo**: `csvEscape` por celda + BOM + CRLF |
| 2 | `exportLeadsBulkAction` | `src/app/(protected)/admin/chatbots/bulk-actions.ts:110` → UI `BulkActionBar.tsx:93` | Admin | **PARCIAL/ROTO**: solo `intent` duplica `"`; sin anti-fórmula; `\n`; sin BOM |
| 3 | `bulkExportLeads` | `src/lib/bulk-actions.ts:46` → UI `ClientsListClient.tsx:121-124` | Admin | **PARCIAL**: quoting RFC 4180 OK en todas las celdas; **sin anti-fórmula**; `\n`; sin BOM |
| 4 | `PLANTILLA_CSV` | `src/lib/leados/prospecto-import.ts:54` → descarga en `setter/nuevo/importar` | Setter | N/A (string estático, sin datos de usuario) |

Solo-import (no generan): `importar-prospectos-form.tsx:123`, `ImportCSVButton.tsx:38`. Uso en invariantes: `src/lib/plan/lead-scoring-gate.invariant.ts` importa `buildLeadsCsv` (tests de gating de columna).

El generador #3 verbatim (`src/lib/bulk-actions.ts:62-77`):
```ts
  const csv = [
    'Cliente,Nombre,Email,Telefono,Status,Intent,Fecha',
    ...leads.map((lead) =>
      [
        lead.botConfig.organization.companyName,
        lead.name ?? '',
        lead.email ?? '',
        lead.phone ?? '',
        lead.status,
        lead.intent ?? '',
        lead.capturedAt.toISOString(),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ].join('\n')
```

---

## P3 — El contrato de la UI

### 3.1 Call-sites

**Un único componente** invoca las 4 actions: `src/app/(protected)/admin/chatbots/BulkActionBar.tsx` (`'use client'`; imports L11-14; calls L59/71/81/93). Montado por `BotsListClient.tsx:13/:128`. El crítico confirmó (ángulo 3): **cero** invocaciones desde api routes, crons o tests.

### 3.2 Cómo usa el retorno — VERBATIM

El componente re-declara `BulkOutcome` local (L26-30, mismo shape que `BulkResult`) y centraliza en `announceBulk` (L35-48):

```ts
// Elige toast de éxito o error según el resultado. Antes siempre se mostraba
// toast.success, así que un fallo total (p.ej. forbidden → success:0) se
// reportaba en verde. Ahora success:0 con fallos → toast.error.
function announceBulk(result: BulkOutcome, noun: { sing: string; plur: string }) {
  const s = result.success
  if (s === 0) {
    toast.error(
      result.failures.length === 0
        ? 'No se pudo completar la acción: sin permisos o la sesión expiró.'
        : `No se pudo completar la acción. ${result.failed} ${result.failed !== 1 ? 'fallaron' : 'falló'}.`,
    )
    return
  }
  toast.success(
    `${s} bot${s !== 1 ? 's' : ''} ${s !== 1 ? noun.plur : noun.sing}${result.failed > 0 ? `. ${result.failed} fallaron.` : '.'}`,
  )
}
```

**DRIFT clave sobre PA-3:** la UI YA interpreta `failures.length === 0` + `success: 0` como "sin permisos o sesión expirada" — el fallo de permiso ya NO se reporta en verde ni mudo. Lo que queda del gap original:
- El detalle por-ítem de `failures` **nunca llega al usuario** — solo `console.error('Bulk pause failures:', result.failures)` (L61, ídem 73/83).
- El fallo de parse Zod (delete L171-174) devuelve el mismo `failures: []` → la UI lo anuncia como "sin permisos o la sesión expiró" (causa incorrecta).
- El export ignora `result.error`: rama de fallo con `toast.error('Error al exportar')` fijo (L104-105), aunque la action devuelve `error: 'Forbidden'`.

Patrón por handler (pause L57-67; activate/delete análogos): `announceBulk(result, ...)` + `if (result.failed > 0) console.error(...)` + `setConfirm(null)` + `if (result.failed === 0) onClear()` (los fallidos quedan seleccionados para reintentar) + `router.refresh()` solo en delete. El export (L91-107): `Blob` + `<a download>` con filename `leads-export-${fecha}.csv` + `toast.success('Exportados N leads')`.

**Conclusión factual para el fix de PA-3:** poblar `failures` con causa en los 3 caminos que hoy devuelven `[]` NO requiere tocar la UI (ya la lee y ya distingue vacío/no-vacío); mostrar el detalle POR ÍTEM al usuario SÍ requeriría tocar `BulkActionBar.tsx`.

### 3.3 Convención de retorno del repo — TRES conviven

| Convención | Shape | Dónde |
|---|---|---|
| (A) `ActionResult<T>` discriminada — la canónica | `{ success: true; data: T } \| { success: false; error: string }` + helpers `ok()`/`fail()`/`toErrorMessage()` | `src/lib/action-utils.ts:3-13`; usada por tickets, referrals admin, dashboard-actions |
| (B) `ActionResult<T>` booleana | `{ success: boolean; error?: string; data?: T }` | `src/lib/actions/schemas.ts:4-8`; toda la carpeta `src/lib/actions/*` |
| (C) Ad-hoc `{ ok }` | `{ ok: true as const, ... } \| { ok: false as const, error }` | `exportLeadsBulkAction`, `archiveClient`, `mapearFilas` (leados) |

Las bulk actions no siguen ninguna: `BulkResult` usa `success` como **número** (conteo), colisionando semánticamente con el `success` booleano de (A)/(B). Dentro del mismo archivo conviven `BulkResult` y `{ok}`. Dos definiciones rivales comparten el nombre `ActionResult` ((A) y (B)) — hecho a considerar al alinear.

---

## P4 — logAdminAction y el patrón de bulk

### 4.1 Firma — `src/lib/audit-log.ts:5-17`

```ts
interface LogActionInput {
  userId: string
  userEmail?: string | null
  userName?: string | null
  actionType: AuditActionType
  action: string
  targetType: string
  targetId: string
  diff?: object
  metadata?: object
}

export async function logAdminAction(input: LogActionInput): Promise<void> {
```

Async; escribe **1 fila** a `adminAuditLog` vía `prisma.adminAuditLog.create` (`:24`); enriquece con `ipAddress` (`x-forwarded-for`) y `userAgent` (de `next/headers`); todo el cuerpo en try/catch que **no re-lanza** (`:39-41`, `console.error` y sigue — un fallo de auditoría no rompe la acción). No existe variante batch. También exporta `computeDiff` y `omitAuditNoise`.

### 4.2 ¿Existe el patrón batch correcto para espejar? — NO

Sitios de `updateMany/deleteMany/createMany` bajo admin/actions: `src/lib/bulk-actions.ts:23` (botConfig.updateMany), `message.actions.ts:213`, `announcements.actions.ts:69`, `referrals.admin.actions.ts:18/:41`, `project.actions.ts:332/:806-809`, `maintenance.actions.ts:161`, `agency-actions.ts:67` y `dashboard-actions.ts:62/:153` (notification.createMany).

**Ninguno combina escritura batch con log agregado o `createMany` de logs.** El más cercano es `src/lib/bulk-actions.ts:16-43` (`bulkPauseBots`): `findMany` + **1** `updateMany` batch… seguido de un `for` con **N `logAdminAction` seriales** (confirmado también por el crítico, ángulo 4 — es la única otra instancia del antipatrón PA-4 en el repo):

```ts
  await prisma.botConfig.updateMany({
    where: { organizationId: { in: uniqueOrgIds }, isActive: true },
    data: { isActive: false },
  })

  for (const bot of bots) {
    await logAdminAction({ ... targetId: bot.id, metadata: { bulkAction: true, count: uniqueOrgIds.length } })
  }
```

### 4.3 Tenancy y aislamiento — verificación positiva

- **`admin/chatbots/bulk-actions.ts`**: guard = SOLO rol `SUPER_ADMIN` (L19-24 etc.). Los `where` de escritura son `{ id: botId }` **puros, sin `organizationId`** (update L32-36 / L78-82; delete L198 precedido de findUnique L183). El comentario L160-162 lo justifica ("scopeado por id"). Modelo: `BotConfig` (`schema.prisma:1268`), donde `organizationId` es `@unique` (1-a-1 org↔bot).
- **`src/lib/bulk-actions.ts`**: guard vía `requireSuperAdmin()` (import de `@/modules/chatbot/server/admin/requireSuperAdmin`); su `updateMany` SÍ scopea `organizationId: { in: uniqueOrgIds }`.
- **Aislamiento (drift vs. premisa):** `BotConfig` SÍ está en la cobertura declarada de `src/lib/isolation` (`index.ts:40`; `registry.ts:622` expone `botConfig: new ScopedModelDelegate<...>`). **PERO ninguno de los dos bulk-actions usa el helper** — ambos importan `@/lib/prisma` directo (`admin/chatbots/bulk-actions.ts:5`, `lib/bulk-actions.ts:4`), sin `forOrg` ni `unsafeGlobalQuery`. Coherente con el docstring del helper (`index.ts:41-43`): el prisma directo fuera del directorio "queda en el código legacy del chatbot hasta B0-S3".
- **ESLint de frontera NO los alcanza** (crítico, ángulo 6): el bloque chatbot (`eslint.config.mjs:52-87`) cubre `files: ["src/modules/chatbot/**/*.{ts,tsx}", "src/app/api/chatbot/**/*.{ts,tsx}"]` — el glob **no incluye** `src/app/(protected)/admin/chatbots/**`; el bloque motor (L17-46) tampoco aplica. El import directo de `@/lib/prisma` en estos archivos no viola lint hoy.

---

## P5 — Datos de prueba y verificación

### 5.1 Seeds de leads

El seed diseñado para leads de prueba es el par `scripts/dev/qa-seed-leads.ts` (siembra) + `scripts/dev/qa-seed-leads-clean.ts` (limpieza, script separado — **no** hay flag `--clean`):
- **Marcador:** ids deterministas con prefijo `qaseed-` (`qaseed-{slug}-lead-{idx}`), slugs de bot `qaseed-bot-`, y `name` con prefijo `Lead de prueba — ` (L27-29).
- **Acotado a 3 orgs QA:** `QA_ORG_SLUGS = ['sigma-contable', 'sonrisa-norte', 'matsu']` (L26).
- **Idempotente:** `prisma.chatbotLead.upsert({ where: { id: leadId }, create, update })` (L141-195) — correrlo N veces re-escribe, no duplica.

Fragmento representativo (L170-197): el `data` arma `name` (`NAME_PREFIX + tpl.firstName`), `email` (`*.prueba@example.com`), `phone` (`+54 9 11 5555-00{idx}`), `intent`, `message`, `category`, `channel: 'widget'`, señales booleanas, `utmSource`, `score`, `classification`, `status`, fechas — y cierra con el upsert por id determinista. Un seed de leads "sucios" para PA-2 (nombres con `"`, `,`, y prefijos `= + - @`) puede espejar exactamente este patrón (mismo prefijo `qaseed-`, mismas orgs QA, upsert idempotente, limpieza por prefijo).

Otros scripts que crean/tocan `chatbotLead` (no diseñados como seed de prueba): `scripts/seed-matsu-chatbot.ts`, `scripts/dev/_vseed.ts`, `scripts/dev/qa-manual-m5-m16.ts`, `prisma/seed.ts`, `prisma/seed-agency-os.ts`.

### 5.2 Modelo `ChatbotLead` — `prisma/schema.prisma:1434-1523` (mapeado a tabla `chatbot_lead`)

Campos completos: `id`, `botConfigId`→`BotConfig` (Cascade), `conversationId?`→`Conversation` (SetNull, `@unique`), `name String?`, `email String?`, `phone String?`, `intent ChatbotLeadIntent?` (enum), `message String? @db.Text`, `category LeadCategory @default(sales)`, señales booleanas (`requestedAppointment`/`mentionedFinancing`/`mentionedTradeIn`/`askedSpecificModel`/`providedPhone`/`providedEmail`), `channel String?`, `signals Json?`, `utmSource/utmMedium/utmCampaign String?`, `firstContactedAt DateTime?`, `score Int?`, `classification LeadClassification?`, `scoreSignals Json?`, `notificationSent/At`, `status ChatbotLeadStatus @default(NEW)`, `internalNotes String? @db.Text`, `lastStatusChangeAt`, `convertedToOsLeadId String?`, `capturedAt`, `updatedAt`, `crmSyncAttempts[]` + 6 índices.

**Texto libre inyectable** (para el seed sucio): `name`, `email`, `phone` (input del visitante del widget — los 3 que exporta el CSV), `message`, `internalNotes`, `channel`, `utmSource/Medium/Campaign` (capturados de la URL del widget = input externo). Los enums (`intent`, `category`, `status`, `classification`) NO son texto libre. `companyName` NO vive en el lead: llega por relación `botConfig.organization.companyName` (editable por admin, también termina en el CSV).

### 5.3 Tests existentes

- `src/**/__tests__/`: **cero** matches de bulk-action/csv.
- `tests/e2e/16-admin-bulk-actions.spec.ts`: cubre el flujo de `/admin/clients` (o sea la variante `src/lib/bulk-actions.ts` / `bulkExportLeads`, filename `leads-YYYY-MM-DD.csv`) y **solo valida el nombre del archivo descargado**, no el contenido ni el escaping. **La variante de la página de chatbots (`exportLeadsBulkAction`, filename `leads-export-*.csv`) — la que tiene el quoting roto — NO tiene test.**
- `tests/leados/alta-import.spec.ts`: es de IMPORT de prospectos (otra feature), no toca el export bulk.
- Ningún test unitario ejercita la construcción/escaping de ninguno de los dos CSV admin.

---

## P6 — Frozen y frontera

### 6.1 Tabla frozen (`CLAUDE.md:163-171`, verbatim)

```md
| File | Rule |
|------|------|
| `src/components/3d/HeroArtifact.tsx` | Never modify |
| `src/context/TransitionContext.tsx` | Always use `triggerTransition()` |
| `src/context/PreloaderContext.tsx` | Do not break the phase flow |
| `prisma/schema.prisma` | `migrate reset` is prohibited |
```

**Ninguno de los archivos del scope está frozen**: ni los dos `bulk-actions.ts`, ni `BulkActionBar.tsx`, ni `BotsListClient.tsx`, ni `ClientsListClient.tsx`. (`schema.prisma` es frozen solo respecto de `migrate reset`; acá ni se toca.)

### 6.2 Frontera de módulo

Todos los archivos que habría que tocar viven en `src/app` o `src/lib` — **ninguno bajo `src/modules/chatbot/server/*`**:

| Archivo | Ruta | ¿Bajo chatbot/server? |
|---|---|---|
| Action export chatbots | `src/app/(protected)/admin/chatbots/bulk-actions.ts` | NO |
| Action export clients | `src/lib/bulk-actions.ts` | NO |
| UI BulkActionBar | `src/app/(protected)/admin/chatbots/BulkActionBar.tsx` | NO |
| UI BotsListClient | `src/app/(protected)/admin/chatbots/BotsListClient.tsx` | NO |
| UI ClientsListClient | `src/app/(protected)/admin/clients/_components/ClientsListClient.tsx` | NO |
| Eventual helper CSV compartido | (a crear en) `src/lib/` | NO |

Imports que YA cruzan hacia el módulo (consumo de API, no edición): `lib/bulk-actions.ts:6` → `requireSuperAdmin` de `@/modules/chatbot/server/admin/requireSuperAdmin`; `admin/chatbots/bulk-actions.ts:8` → `invalidateBotCache` de `@/modules/chatbot/server/conversation`. Y el helper `csvEscape` a reusar vive en `src/modules/chatbot/server/leads/csv/` (exportado por barrel) — importar de ahí desde admin es hoy lint-legal (P4.3); extraerlo a `src/lib/` es decisión de diseño del sprint.

---

## Crítico de completitud — 6 ángulos

1. **Otros `*bulk*`:** HALLAZGO — `src/lib/bulk-actions.ts` (bulk por orgs, mismos defectos PA-2/PA-4-log) y `src/app/(protected)/setter/_actions/prospecto-bulk.actions.ts` (dominio osLead, usa `Promise.all`/`createMany`, sin logAdminAction — no afectado).
2. **Otros exports CSV/descarga:** HALLAZGO — el CSV de `bulkExportLeads` (ya integrado arriba). Descartados: reportes PDF, plantilla estática del setter, download de link de agenda.
3. **Otras invocaciones de las bulk actions de chatbots:** NEGATIVO — solo `BulkActionBar.tsx`.
4. **Otros loops seriales con `logAdminAction`:** HALLAZGO — único extra: `lib/bulk-actions.ts:28-39` (integrado en P4.2). Ningún otro en el repo.
5. **Sanitización CSV centralizada en `src/lib/`:** NEGATIVO — no existe; el único escape completo es `csvEscape` dentro del módulo chatbot.
6. **ESLint fronteras:** HALLAZGO — las reglas existen (motor L17-46, chatbot L52-87) pero sus globs NO cubren `admin/chatbots/**` ni `src/lib/bulk-actions.ts` (integrado en P4.3).
