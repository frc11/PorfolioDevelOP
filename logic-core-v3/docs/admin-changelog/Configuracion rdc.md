# Registro de cambios — Sector CONFIGURACIÓN (`/admin/settings` \+ `/admin/audit-log`)

**Fecha de cierre:** 2026-06-19 **Base común de los lanes (BASE):** `3ba49dfd9414cf9429dd3357625d265e14dc697d` **Lanes del sector:** `config-settings` · `config-audit` · `config-design` **Detalle fino:** ver los changelogs individuales por lane (`changelog-config-settings.md`, `changelog-config-audit.md`, `relevamiento-design.md`).

---

## Resumen ejecutivo

| Lane | Ruta | Estado | Mergea código |
| :---- | :---- | :---- | :---- |
| `config-settings` | `/admin/settings` | ✅ Cerrado | **Sí** |
| `config-audit` | `/admin/audit-log` | ✅ Cerrado | **Sí** |
| `config-design` | `/admin/_design` | ⛔ No-go (sin cambios) | **No** |

- Los dos lanes con código salieron del **mismo BASE** (`3ba49df`) y tocaron **rutas disjuntas** (`settings/*` vs `audit-log/*`).  
- **Ningún archivo compartido, de `ui/*` ni de schema fue editado** en ningún lane.  
- Verificación visual completada por Valentino en ambos lanes. Gate verde (tsc 0, eslint 0\) por sprint.

---

## `config-settings` — `/admin/settings`

**Rama:** `lane/config-settings` · **HEAD:** `8f93de38a7f292a08be1230a3f7d1585f3d88de1`

### Qué se hizo

- **Sprint 1 — Hover canónico.** `adminHoverCls` (de `@/lib/hover`, consumido sin editar) en las 7 familias de cards oscuras internas (módulos premium, Meta actual, Intervalos de follow-up, chips Día 2/4/7, miembros del equipo, Hora del cron, los 5 `ToggleRow`). Sin `will-change` (evita blur del scale), GPU-only, `motion-reduce` incluido.  
- **Sprint 2 — Spinners.** Const local `NUMBER_INPUT_NO_SPINNER` aplicada a los `<input type="number">` (Objetivo semanal \+ precios de módulos). CSS localizado, sin tocar `type`/`min`/`step`/coerción.  
- **Sprint 3 — Limpieza segura \+ checkeo.** Removidos import muerto `PREMIUM_FEATURE_KEYS` y schema huérfano `AgencySettingsIdSchema` (0 importadores). Estados loading/error/empty verificados OK.  
- **Fix post-auditoría — Pricing.** Resuelto el bug confirmado en pantalla ("Módulo inválido" \+ ZodError crudo al guardar módulos con slug ≠ key de catálogo):  
  - `UpdateModulePricingSchema.moduleKey`: deja de validar contra `PREMIUM_FEATURE_KEYS`; valida formato (`z.string().trim().min(1)`).  
  - `updateModulePricing`: usa `findUnique` por `slug` real (`@unique`); si no existe → `fail`, sin éxito silencioso; mensaje con el nombre real de la fila. Removidos `LEGACY_TO_SLUG` y `PREMIUM_FEATURE_DEFAULTS` (muertos tras el cambio).  
  - Leak: `ZodError` → `issues[0].message` (string limpio), nunca JSON crudo al cliente.  
  - **Shape de `getSettings` y revalidación de `/dashboard/services`: intactos.** Cliente sin cambios.

### Commits

`b1000cc` (hover) · `78e7d86` (spinners) · `b0a8ea5` (limpieza) · `20dd783` (fix pricing contract) · `8f93de3` (fix leak).

### Archivos tocados

src/app/(protected)/admin/settings/\_components/settings-console.tsx

src/app/(protected)/admin/settings/\_actions/settings.actions.ts

src/app/(protected)/admin/settings/\_actions/settings.schemas.ts

---

## `config-audit` — `/admin/audit-log`

**Rama:** `lane/config-audit` · **HEAD:** `2c51a908c405a025d4a48e4e72a5153110601c1e`

### Qué se hizo

- **Sprint 1 — Hover en filas.** `adminHoverCls` en el `<Card>` de cada fila (no en el `<button>` disabled ni en el `motion.div` — gotchas documentados).  
- **Sprint 2 — Paginación load-more server-side.** `listAuditLog` ahora devuelve `{ entries, hasMore }` (pageSize=10, `take pageSize+1`). Botón real del sistema con loading, visible solo si `hasMore`. Deuda lint `set-state-in-effect` resuelta con `useIsClient`.  
- **Sprint 3 — Filtros server-side.** Filtro de fecha nuevo (look del dropdown de proyectos, replicado local, sin importar de `projects/`) \+ filtro de acción subido a server. Dropdown de acción poblado desde el enum `AuditActionType` (27 valores estables, no de la página cargada). `requestSeq` anti-race.  
- **Fix — Hover stat cards.** `adminHoverCls` en el `<Card>` de `StatBox` (los 3 stat cards superiores).

### Cambio de contrato

`listAuditLog`: `Promise<AdminAuditLog[]>` → `Promise<{ entries: AdminAuditLog[]; hasMore: boolean }>`. **Consumidores externos al `audit-log/`: NINGUNO** (grep confirmado).

### Commits

`53ba0cf` (hover filas) · `0daa5bb` (paginación) · `401bd9c` (filtros) · `2c51a90` (hover stat cards).

### Archivos tocados

src/app/(protected)/admin/audit-log/\_components/AuditLogClient.tsx

src/app/(protected)/admin/audit-log/\_components/audit-filters.ts        (nuevo)

src/app/(protected)/admin/audit-log/\_components/audit-period-filter.tsx (nuevo)

src/app/(protected)/admin/audit-log/page.tsx

src/lib/audit-log-queries.ts

---

## `config-design` — `/admin/_design` — NO-GO

Sin cambios de código. El relevamiento confirmó que la página es un playground **live** de los componentes de `ui/*`, pero:

- Ningún componente de `ui/*` lee CSS vars — todo es Tailwind hardcodeado.  
- **No existe ningún seam** para alterar la apariencia global sin editar `ui/*`.  
- Un editor de tema en runtime obliga a meter wiring de CSS vars en los \~35 componentes de `ui/*` (LANDMINE \#1) y, si persiste, un modelo Prisma nuevo.

**Decisión:** no se justifica el costo/riesgo por una feature especulativa mientras se cierra el sector. Rama descartada. El relevamiento queda como documentación para un eventual proyecto futuro (editor de tema runtime vs build-time).

---

## Archivos compartidos / prohibidos — auditoría consolidada

Verificado con `git diff --name-only BASE..HEAD` en cada lane. **NINGÚN** archivo de las siguientes categorías fue editado en ningún lane:

`src/components/ui/*` · `prisma/schema.prisma` · `@/lib/prisma` · `@/auth` · `@/lib/auth-guards` · `@/lib/action-utils` · `AdminErrorBoundary` · `src/lib/premium-features.ts` · `src/lib/agency-settings.ts` · `src/lib/hover.ts`

Solo se **consumieron** (import, sin editar): `@/lib/hover`, `@/lib/use-is-client`, `@/lib/motion-variants`, `@/lib/use-reduced-motion`, `@/components/ui`, `@/lib/premium-features`.

---

## Pendientes de coordinación inter-sector (para el central)

1. **Pricing canónico de `PremiumModule`.** `config-settings` escribe `priceMonthlyUsd` (vía `updateModulePricing`, ahora con validación correcta por slug). Clientes (lane plan\&billing) consume el mismo modelo. Definir writer canónico y confirmar compatibilidad. *No resuelto en este sector.*  
2. **Revalidación de `/dashboard/services`.** Disparada por `updateModulePricing`. Confirmar con el lane dueño de esa ruta que existe y que el shape es el esperado.

## Decisiones de Valentino — abiertas (no tocadas)

- **Máscara del token Telegram duplicada** cliente/server (`maskFromInput` vs `maskSecret`). Riesgo de divergencia. No tocada (decisión UX/arquitectura).  
- **Leak de `ZodError` en `updateSettings`** (mismo patrón que el ya arreglado en `updateModulePricing`). Recomendado un helper `toErrorMessage(error)` compartido por los catches. No tocado.

---

## Gate

| Lane | tsc `--noEmit` | eslint (archivos tocados) |
| :---- | :---- | :---- |
| `config-settings` | ✅ exit 0 | ✅ exit 0 |
| `config-audit` | ✅ exit 0 | ✅ exit 0 (+ deuda lint preexistente eliminada) |

Verificación visual: completada por Valentino en ambos lanes.  