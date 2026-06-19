# Cierre — Lane `intel-alertas`

Branch: `lane/intel-alertas` · Fecha cierre: 2026-06-19  
Gate final: `tsc --noEmit` exit 0 · `eslint` exit 0 (todos los archivos del lane)

---

## Tabla de commits

| Hash | Mensaje |
|------|---------|
| `404b224` | fix(alerts): invalidar tag badge al ack/resolve alerta |
| `e90a195` | feat(alerts): validar alertId con Zod en ack/resolve |
| `e60dca4` | chore(seed): alertas dev |
| `a665ffc` | feat(alerts): hover en las 4 stat cards |
| `5f73f80` | docs(lane): log intel-alertas (lotes 1 y 2) |
| `8be5a26` | feat(alerts): filtro de fecha client-side (default ultima semana) |
| `31cdda7` | feat(alerts): difuminado + overview de columna con umbral 5 |
| `991e13c` | feat(alerts): hover por card en las alertas individuales |
| `fc93652` | fix(alerts): fade del difuminado matchea la superficie de la columna |
| `bc3a09a` | docs(lane): log lote 3 (filtro fecha + difuminado/overview + hover cards) |
| `e415b51` | feat(alerts): 'Ver bot' como boton real (nav in-app preservada) |
| `4d2f516` | feat(alerts): rango 'Personalizado' en popover a la derecha |
| `a9f2d7b` | feat(alerts): altura uniforme de columnas + cap/difuminado calibrado |
| `63a63a2` | docs(lane): log lote 4 (boton Ver bot + popover fecha + altura uniforme) |
| `7034c34` | feat(alerts): hover del header de columna de borde a borde |
| `00f7c48` | docs(lane): log lote 5 (hover header columna de borde a borde) |
| `89bab08` | fix(alerts): header hover full-width via wrapper div |

---

## Archivos tocados

### PROPIOS (solo importados dentro de `admin/alerts/`)

| Archivo | Nuevo/Mod | Importadores |
|---------|-----------|-------------|
| `src/app/(protected)/admin/alerts/AlertsClient.tsx` | **MOD** | `alerts/page.tsx` (1 importador, dentro de alerts) |
| `src/app/(protected)/admin/alerts/_components/alert-card.tsx` | **NUEVO** | `AlertsClient.tsx` |
| `src/app/(protected)/admin/alerts/_components/alert-column-overview.tsx` | **NUEVO** | `AlertsClient.tsx`, sí misma (import de tipos) |
| `src/app/(protected)/admin/alerts/_components/alert-types.ts` | **NUEVO** | `AlertsClient.tsx`, `alert-card.tsx`, `alert-column-overview.tsx` |
| `src/app/(protected)/admin/alerts/_components/alerts-filters.ts` | **NUEVO** | `AlertsClient.tsx`, `alerts-date-filter.tsx` |
| `src/app/(protected)/admin/alerts/_components/alerts-date-filter.tsx` | **NUEVO** | `AlertsClient.tsx` |
| `scripts/dev/seed-alerts.ts` | **NUEVO** | CLI dev-only, sin importadores de app |
| `src/modules/chatbot/server/admin/manageAlerts.schemas.ts` | **NUEVO** | Solo `manageAlerts.ts` |

### ⚠️ COMPARTIDO — MODIFICADO

| Archivo | Importadores fuera de `admin/alerts/` | Qué se cambió |
|---------|--------------------------------------|---------------|
| `src/modules/chatbot/server/admin/manageAlerts.ts` | `alerts/page.tsx` (lee `listAlerts`), `alert-types.ts` (infiere tipo de `listAlerts`) | Agregado `revalidateTag('admin-alerts-count', {})` en `acknowledgeAlert` + `resolveAlert`; validación Zod de `alertId` antes de toda query; public signatures de `listAlerts`/`acknowledgeAlert`/`resolveAlert` **sin cambios**. |

> **Superficies afectadas por el cambio en `manageAlerts.ts`:**  
> `alerts/page.tsx` lee `listAlerts` (read-only, sin cambio de signature → no afectada).  
> `alert-types.ts` infiere el tipo retorno de `listAlerts` (sin cambio → no afectada).  
> El `revalidateTag` agregado invalida el cache `'admin-alerts-count'` definido en `admin/layout.tsx` — **contrato implícito existente**, no es nuevo.

### DOC

| Archivo | Nuevo/Mod | Propósito |
|---------|-----------|-----------|
| `_lane-intel-alertas-log.md` | **NUEVO/MOD** | Log interno del lane (actualizado por cada lote) |

---

## Cambios por lote/sprint

**Lote 1 — write surface**
- `manageAlerts.ts`: `revalidateTag('admin-alerts-count', {})` en `ack`/`resolve` → badge del sidebar se invalida inmediatamente tras la acción
- `manageAlerts.ts`: `alertIdSchema.parse(alertId)` antes de toda query → input validado con Zod
- `manageAlerts.schemas.ts`: nuevo, contiene `z.string().cuid()` aislado del `'use server'`

**Lote 2 — seed + hover stat cards**
- `scripts/dev/seed-alerts.ts`: seed idempotente de 14 alertas (CRITICAL×4, HIGH×5, WARNING×3, INFO×2 / PENDING×6, ACKNOWLEDGED×3, RESOLVED×5); tag `_seed = 'intel-alertas'`; host guard; `--cleanup` flag
- `AlertsClient.tsx`: hover en las 4 stat cards via wrapper div + `adminHoverCls` (patrón canónico)

**Lote 3 — filtro fecha + difuminado/overview + hover por card**
- `alerts-filters.ts`: lógica pura de filtro de fecha; presets `all/1w/1m/6m/1y/custom`; default `1w`
- `alerts-date-filter.tsx`: chips UI para el filtro de período; "Personalizado" inicialmente inline
- `AlertsClient.tsx`: filtro de período integrado; difuminado (overlay gradiente) + overview con umbral `items.length > 4`; color del fade corregido a `#141618` (superficie compuesta, no `#080a0c`)
- `alert-card.tsx`: hover `whileHover={{ scale: 1.015 }}` vía Framer (no CSS, por la coexistencia con `motion.div layout`); `hover:z-30` sube la card sobre el gradiente de difuminado
- `alert-column-overview.tsx`: portal a `document.body` (escapa el trap `backdrop-filter` de `AdminLayoutClient`); `useIsClient` gate; focus-trap; scroll-lock; Escape + backdrop click

**Lote 4 — "Ver bot" + popover fecha + altura uniforme**
- `alert-card.tsx`: "Ver bot" pasó de texto decorativo a `<Link><Button/></Link>` → nav in-app a `/admin/chatbots/{id}?tab=overview`; patrón de chatbots/page.tsx; sin `router.push`/`triggerTransition`
- `alerts-date-filter.tsx`: "Personalizado" movido a popover `absolute left-full top-0 z-50` → flota sobre el contenido, no empuja layout; cierra con click afuera / Escape
- `AlertsClient.tsx`: `VISIBLE_CAP = { PENDING:4, ACKNOWLEDGED:4, RESOLVED:4 }` (cap uniforme; el lote pedía diferente pero Sprint 1 igualó alturas de cards al añadir el botón "Ver bot" en resueltas); `lg:min-h-[40rem]` para altura uniforme de columnas

**Lote 5 — hover del header full-bleed**
- `AlertsClient.tsx`: header de columna pasó de franja inset a full-bleed; técnica: wrapper `div.-mx-4.-mt-4` (auto-expande confiablemente como div de bloque) + `button.w-full` interior; hover `hover:bg-white/[0.04]` cubre borde a borde; solo columnas con overview tienen hover/click

---

## Decisiones registradas

| Decisión | Razón |
|----------|-------|
| `VISIBLE_CAP` uniforme en 4 para las 3 columnas | Lote 4/S1 equiparó la altura de las cards RESUELTAS (botón "Ver bot" en todas) → cap diferenciado habría roto la altura uniforme |
| Hover de card via `whileHover` (Framer), no `hover:scale` CSS | `motion.div layout` aplica `transform` inline que pisa el `:hover` CSS |
| No `overflow-hidden` en columnas | Difuminado como overlay gradiente (no mask/clip) para no cortar el hover por card |
| Fade a `#141618` (no `#080a0c`) | Superficie compuesta = root `#080a0c` + panel `white/[0.03]` + columna `white/[0.02]` ≈ `rgb(20,22,24)` |
| `button[display:block]` no auto-expande con `-mx` en todos los browsers | Solucionado con wrapper `div` + `button.w-full` interior |
| No usar `triggerTransition` en "Ver bot" | `triggerTransition` es del sitio público; el admin navega con `<Link>` + `PageTransition` |
| `manageAlerts.schemas.ts` separado del `'use server'` | Los módulos `'use server'` no pueden exportar schemas Zod que se usen en contextos client |

---

## Deuda conocida (no tocada por decisión)

- `TicketStatusSelector.tsx` (dashboard): sigue como `<select>` nativo; se decidió en la lección de CLAUDE.md que NO se migra al `<Select>` compartido por el spinner condicional (ver CLAUDE.md "Select compartido con chevron")
- Filtro de severidad y filtro de período son client-side (sobre los datos ya cargados). Si el volumen de alertas crece, habrá que bajar los filtros al Server Action `listAlerts`. No es urgente.
- `alert-column-overview.tsx` replica `leads/_components/column-overview.tsx` (1:1 con tipos de alertas). No se abstrajo en un componente compartido para no tocar fuera del scope del lane.

---

## 🔴 PENDIENTE DE COORDINACIÓN (post-merge)

### Seed vivo en DB

| Atributo | Valor |
|----------|-------|
| **Tag marker** | `_seed = 'intel-alertas'` |
| **Tabla** | `BotAlert` |
| **Registros** | 14 |
| **Cleanup antes de prod** | `npx ts-node --transpile-only scripts/dev/seed-alerts.ts --cleanup` |
| **Ubicación del script** | `logic-core-v3/scripts/dev/seed-alerts.ts` |

> El seed escribe SOLO filas con `metadata._seed === 'intel-alertas'`. Las alertas reales del cron no llevan ese marker → el cleanup es safe.

### Shared file modificado

> **`src/modules/chatbot/server/admin/manageAlerts.ts`** — MODIFICADO  
> Superficies afectadas: `alerts/page.tsx` (consume `listAlerts`) y `admin/layout.tsx` (consume el tag `'admin-alerts-count'` que ahora se invalida al ack/resolve).  
> Riesgo post-merge: bajo. Los cambios son aditivos (nueva validación Zod antes de queries, nuevo `revalidateTag` que ya existía como contrato en el layout). Las signatures públicas de `listAlerts`/`acknowledgeAlert`/`resolveAlert` no cambiaron.

### Contrato implícito de cache

> `revalidateTag('admin-alerts-count', {})` (agregado en `acknowledgeAlert`/`resolveAlert`) invalida el `unstable_cache` de `admin/layout.tsx` (tag `'admin-alerts-count'`, `revalidate: 30`).  
> Este contrato ya existía antes del lane — el lane lo honra, no lo crea. Verificar que el layout no haya cambiado en `main` mientras el lane estuvo abierto.

---

## ⚠️ Verificación humana pendiente en `:3000`

Todo el código fue validado con tsc + eslint pero el preview MCP estuvo ausente en toda la sesión. A verificar a ojo antes del merge:

1. **Stat cards (Lote 2):** valores poblados (2 críticas, 6 pendientes, 5 resueltas, Xm resolución); hover scale sin clip.
2. **Badge sidebar (Lote 1):** tras "Visto"/"Resolver", el conteo rojo del sidebar cae inmediatamente (sin re-navegar).
3. **Filtro período (Lote 3):** "Última semana" activo por defecto en cyan; "Personalizado" abre popover a la derecha del chip.
4. **Difuminado/overview (Lote 3):** PENDING(6) y RESOLVED(5) muestran blur + "Ver todas (N) →"; ACKNOWLEDGED(3) sin blur; click abre portal modal; cierra con X/Esc/backdrop.
5. **Hover card (Lote 3-4):** card hovereada sube sobre el gradiente de difuminado sin recortarse en ningún costado.
6. **"Ver bot" (Lote 4):** botón ghost cyan visible en todas las cards; navega in-app (no nueva pestaña).
7. **Altura uniforme (Lote 4):** las 3 columnas a la misma altura (~4 cards); calibrables con `lg:min-h-[40rem]` y `VISIBLE_CAP` en `AlertsClient.tsx`.
8. **Header hover full-bleed (Lote 5 + ajuste):** en columnas con overview (PENDING, RESOLVED), el highlight al pasar el mouse cubre el header de borde a borde; ACKNOWLEDGED sin hover/click.
