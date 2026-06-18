# lane/intel-alertas — LOG (Inteligencia · sección Alertas)

Branch: `lane/intel-alertas` · Stack: Next.js 16 · TS estricto (cero `any`) · Prisma/Neon · NextAuth v5 · Tailwind 4 · motion/react.
Gate del lane: `.\node_modules\.bin\tsc.cmd --noEmit` → exit 0 (verde antes y después de cada sprint).

## Scope
Único write surface de la sección Inteligencia (Alertas). Guard propio (`requireSuperAdmin`), audit log (`logAdminAction`) y estados loading/error/empty ya existían OK.

**No tocar (consumir, no editar):** `layout.tsx` · `AdminLayoutClient.tsx` · `admin-sidebar.tsx` (chrome) · `components/ui/*` (incl. `StatCard`) · `prisma.ts` · `auth.ts` · `AdminErrorBoundary` · `schema.prisma` · `ChatbotEvent`/`queries.ts` · `requireSuperAdmin.ts` · `audit-log.ts` · `prisma/seed.ts`. Sin cambiar firmas públicas de `listAlerts`/`acknowledgeAlert`/`resolveAlert` ni la state machine de `BotAlert` (PENDING/ACKNOWLEDGED/RESOLVED).

---

# LOTE 1 — badge refresh + Zod

## Sprint 1 — Refresh del badge `pendingAlerts`
**Commit:** `404b224` fix(alerts): invalidar tag badge al ack/resolve alerta
**Archivo:** `src/modules/chatbot/server/admin/manageAlerts.ts` (único)

- **Problema:** `acknowledgeAlert`/`resolveAlert` solo hacían `revalidatePath('/admin/alerts')`. El count del badge vive en `layout.tsx:10-14` cacheado con `unstable_cache` + tag `'admin-alerts-count'` (revalidate 30). Nadie invalidaba ese tag → badge stale ~30s tras ack/resolve.
- **old→new:**
  - Import: `import { revalidatePath }` → `import { revalidatePath, revalidateTag }`.
  - `acknowledgeAlert` (línea ~57): se agregó `revalidateTag('admin-alerts-count', {})` JUNTO al `revalidatePath` existente (no se sacó).
  - `resolveAlert` (línea ~92): ídem.
- **Hallazgo (firma):** en Next 16 `revalidateTag` toma **2 args** `(tag, profile)` — `revalidateTag('tag')` da `TS2554: Expected 2 arguments, but got 1`. El patrón del proyecto (10 usos en `lib/actions/*`, `setter/_actions`, etc.) es `revalidateTag('tag', {})`. Se usó ese patrón. El tag string es literal `'admin-alerts-count'` (contrato con `layout.tsx`).
- **Contingencia (`router.refresh()` en AlertsClient):** NO hizo falta a nivel de código. Queda como fallback si la verificación humana muestra que el layout no refresca en la misma respuesta del server action.
- **Gate:** tsc exit 0.

## Sprint 2 — Zod en los writes
**Commit:** `e90a195` feat(alerts): validar alertId con Zod en ack/resolve
**Archivos:** `manageAlerts.schemas.ts` (nuevo) + `manageAlerts.ts`

- **Problema:** `acknowledgeAlert`/`resolveAlert` recibían `alertId: string` crudo, sin validar (regla dura: Zod en cada Server Action).
- **`manageAlerts.schemas.ts`** (módulo nuevo, **sin** `"use server"` — un archivo `"use server"` no debe exportar schemas junto a funciones async): `export const alertIdSchema = z.string().cuid()` (el `id` de `BotAlert` es cuid).
- **`manageAlerts.ts` old→new:** primera línea del body de cada write: `const id = alertIdSchema.parse(alertId)`; todas las queries (`findUnique`/`update`) pasan a usar `id`. Firma pública `(alertId: string)` sin cambios.
- **Gate:** tsc exit 0.

---

# LOTE 2 — seed dev + hover

## Sprint 1 — Seed de alertas de prueba
**Commit:** `e60dca4` chore(seed): alertas dev
**Archivo:** `scripts/dev/seed-alerts.ts` (nuevo; `prisma/seed.ts` NO se tocó)

- **Objetivo:** poblar `BotAlert` para ver las 4 stat cards, el kanban y los filtros de severidad.
- **Schema verificado (read-only):** `acknowledgedBy`/`resolvedBy` son `String?` **libre** (NO FK, no hay `@relation`). Aun así el seed usa el `id` de un SUPER_ADMIN real (`admin@develop.com`) para realismo — fallback a sentinel `seed:intel-alertas` si no hubiera ninguno. `metadata` es `Json @default("{}")`. `BotConfig.slug` es `@unique` → `findUnique({ slug: 'develop' })`.
- **Contenido:** 14 alertas. Por status: PENDING 6 (incl. 2 CRITICAL → llena "Críticas pendientes"), ACKNOWLEDGED 3 (con `acknowledgedAt`+`acknowledgedBy`), RESOLVED 5 (con `resolvedAt` dentro de los últimos 7 días + `resolvedBy` → llena "Resueltas esta semana" y da "Tiempo prom. resolución"). Por severidad: CRITICAL 4 · HIGH 5 · WARNING 3 · INFO 2 (cada filtro muestra algo). `type` variado entre los 9 valores del enum `BotAlertType`. Tipado estricto con enums de Prisma (`Prisma.BotAlertCreateManyInput`), cero `any`.
- **Idempotencia / safety:** cada fila lleva `metadata._seed = 'intel-alertas'`. Al inicio `deleteMany({ where: { metadata: { path: ['_seed'], equals: 'intel-alertas' } } })` — where estricto OBLIGATORIO, nunca borra alertas reales (las del cron no llevan ese marker). Host guard fail-closed contra la rama dev de Neon.
- **Hallazgo (env):** el proyecto guarda `DATABASE_URL` en **`.env.local`** (no hay `.env`); `import 'dotenv/config'` (que solo lee `.env`) dejaba `DATABASE_URL` vacío y el guard abortaba. Fix: `import { config } from 'dotenv'; config({ path: '.env.local' }); config()` antes de `new PrismaClient()`. (Warning `MODULE_TYPELESS_PACKAGE_JSON` al correr vía ts-node es cosmético — no se tocó `package.json`.)
- **Verificación runtime:** corrido 2×. 1ª: limpieza 0, 14 creadas. 2ª: limpieza **14**, 14 creadas → idempotencia probada (el filtro JSON `path:['_seed']` matchea en Neon, sin duplicar).
- **Gate:** tsc exit 0 · eslint exit 0.

### Reversibilidad (cleanup)
```
npx ts-node --transpile-only scripts/dev/seed-alerts.ts --cleanup
```
Borra solo las filas con `metadata._seed = 'intel-alertas'` y no recrea. (Run normal sin flag = delete + recreate.)

## Sprint 2 — Hover en las 4 stat cards
**Commit:** `a665ffc` feat(alerts): hover en las 4 stat cards
**Archivo:** `src/app/(protected)/admin/alerts/AlertsClient.tsx` (único)

- **Patrón canónico (relevado vía subagente):** existe `src/lib/hover.ts` con `adminHoverCls` (CSS puro, no motion): `transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.015] hover:shadow-[...] hover:ring-1 hover:ring-white/15 motion-reduce:*`. Se aplica en un **`<div>` envolvente** (no en el componente). Precedente directo con 4 stat cards: `chatbots/page.tsx:37-69`. Importante: **sin `will-change`** (removido a propósito en `c127467`).
- **old→new:** `import { adminHoverCls } from '@/lib/hover'`; cada uno de los 4 `<StatCard>` ahora va envuelto en `<div className={'grid rounded-2xl ' + adminHoverCls}>...</div>` (verbatim al patrón de chatbots). No se tocó `StatCard` (ui/*) — acepta `className` pero el patrón canónico usa wrapper. Sin `motion/react` nuevo, sin `will-change`, con `motion-reduce`.
- **Gate:** tsc exit 0 · eslint exit 0.

---

## Estado / pendiente humano
- **visual-qa** `/admin/alerts`: despachado 2× (Lote 1 y Lote 2). **El preview/browser MCP NO está conectado esta sesión** (`preview_start`/`preview_screenshot` ausentes — coincide con memoria `preview-mcp-untracked`), así que el agente solo pudo hacer **análisis estático**: estructura correcta, los 4 wrappers de hover aplicados, grids responsive intactos (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` y `lg:grid-cols-3`), sin riesgo de clip, sin errores obvios. **NO hubo screenshot real** → la confirmación visual queda en manos del humano en `:3000` (que además es el criterio de aceptación del lote).
- **Verificación humana (Lote 1):** tras "Visto"/"Resolver" sobre una PENDING, el badge rojo del sidebar debe bajar SIN esperar ~30s y sin re-navegar (captura antes/después). Si no refresca → aplicar contingencia `router.refresh()` en AlertsClient.
- **Verificación humana (Lote 2):** las 4 cards pobladas (2 / 6 / 5 / Xm) y el hover a ojo (scale + shadow + ring, sin clip).
