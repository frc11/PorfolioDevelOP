# develOP — Leads (admin): registro de cambios (cierre de etapa)

Cierre del trabajo sobre el **módulo Leads del admin** (Logic Core v3), realizado como **lane/leads** en una tanda de trabajo en paralelo (3 lanes en git worktrees). **Repo:** github.com/frc11/PorfolioDevelOP · **app:** logic-core-v3/ · **archivos:** `src/app/(protected)/admin/leads/**`. **Fecha de cierre:** 16 de junio de 2026\.

**Resumen.** 32 commits, 33 archivos (+2150 / −648). El más limpio y autocontenido de los 3 lanes: todo el trabajo vivió bajo `admin/leads/**`; el único cambio fuera de ahí fueron las deps de `@dnd-kit` en `package.json`. Mergeado a main en `fe1fa2b`. Modelos que opera: `OsLead`, `OsLeadActivity`, `OsDemo`, `ContactSubmission` (sistemas disjuntos del `ChatbotLead` del chatbot — sin relación).

---

## 1\. Cambios hechos

### Kanban — base (fullscreen \+ DnD)

- **Layout 3+3+2 estático, responsive.** El pipeline pasó a una grilla de columnas. Se intentó primero una coreografía de cross-fade dirigida por scroll (stage sticky \+ grupos superpuestos) pero **se descartó** porque los grupos ocultos capturaban clicks (abrías otra card) y el scroll no transicionaba bien — quedó la grilla estática, más robusta. Se borró el `use-scroll-fade.ts`.  
- **Overview fullscreen de columna portalizado a `document.body`** (`createPortal` \+ `useIsClient`) para escapar el containing block del `<main>` admin (su `backdrop-blur` atrapa los `position:fixed`). Con focus trap \+ Esc \+ backdrop \+ scroll-lock; `AnimatePresence` dentro del portal.  
- **DnD entre columnas con `@dnd-kit`** (core \+ utilities; se probó y removió `sortable`). `DragOverlay` portalizado. El cambio de estado cross-columna persiste vía `updateLeadStatus`; el reordenar dentro de la misma columna es no-op (ver Deuda — falta campo de orden en `OsLead`).  
- **Hardening adversarial del DnD:** DnD por teclado arreglado, `onClose` estabilizado con `useCallback` (evita robo de foco), `role=group` \+ `aria-current`, match sin casts contra `ALL_PIPELINE_STATUSES`, clon del `DragOverlay` en modo presentational.  
- **BLOCKER resuelto — drag desde el overview (2 partes):** al arrastrar un lead desde el overview de una columna, la card fuente se desmonta y `@dnd-kit` vacía `event.active.data.current` → el drop se perdía. Fix: capturar el lead activo en estado React (`activeDragLead`) en `handleDragStart` y usar ESE en `handleDragEnd`, no el evento. Además: el overview se monta dentro del `DndContext`, `dragId` con prefijo anticolisión, sensor en HOLD (delay 200 / tolerance 5), y el overview se cierra en `handleDragStart`. **(Este patrón fue después la base para el mismo feature en el kanban de Proyectos.)**  
- **Card con solo tacho:** se sacó el dropdown "mover a estado" de la card; el cambio de estado es exclusivamente por drag. Se eliminó `onMoveStatus` de toda la cadena (dead code).

### Inbound / form / limpieza

- **Form "Nuevo lead" portalizado a body** (escapa el backdrop-blur del `<main>`).  
- **Filtro de período server-driven para Inbound** (`InboundRangeSchema` Zod, `where createdAt {gte,lte?}`).  
- **Hover scale-up leve en `LeadCard`** (solo cards reales, no pelea con el transform de dnd-kit).  
- **Refactors \<300 líneas:** se extrajo `inbound-period-filter.tsx` (tabla 307→217) y helpers de varias piezas.

### Barra de filtros \+ detalle

- **Barra de filtros client-side del board outbound** (Servicio / Período / Setter / Ubicación en AND): nuevos `lead-filters.ts`, `lead-filters-bar.tsx`, `themed-date-input.tsx`, `outbound-leads-view.tsx`. El conteo outbound se movió del server a la barra.  
- **"Cambiar estado" del detalle → `<Select>` compartido** (`change-status-select.tsx`) con manejo de error \+ guard contra re-disparo.  
- **`assign-setter-control` migra a `<Select>` compartido** (opciones con "Sin asignar").  
- **Actividad comercial:** alto acotado (grid alineado \+ fade), y se sacó el `Date.now()` del feed (módulo `isFollowUpPending` \+ prop) — eliminando uno de los 2 errores baseline de lint.  
- **`inbound-period-filter`:** sincroniza `showCustom` con la URL, slide con `AnimatePresence`, reusa `ThemedDateInput`.  
- **Hardening A/B/C/D:** no monta las cards sobrantes (`slice(0,3)`, quita targets invisibles tabbables — a11y), rango custom con `.000/.999`, saca cast `as LeadPeriod`, deduplica el período default.  
- **Timeline con scroll interno y fades scroll-aware** (mask de 4 stops \+ `ResizeObserver`).  
- **`location-typeahead.tsx`** — combobox sin dependencia (flechas/Enter/Esc, `aria-activedescendant`), reemplaza el `<Select>` de Ubicación; dropdown portalizado a body con `position:fixed` por rect del input, reposiciona en scroll/resize.

### Correcciones finales

- **Schemas Zod fuera de `'use server'`:** se extrajeron a `activity.schemas.ts` / `demo.schemas.ts` (Next 16 prohíbe exports no-async en archivos `'use server'`).  
- **Normalización de ubicación** (`lead-zone.helpers.ts`): `normalizeZone` (NFD \+ strip de diacríticos \+ lowercase \+ trim \+ colapso); las opciones del filtro se agrupan por clave normalizada (label \= variante más frecuente), el typeahead matchea normalizado.

---

## 2\. Deuda / pendiente

- **Orden persistente dentro de una columna del kanban.** Arrastrar para reordenar leads en la misma lista es no-op porque `OsLead` no tiene un campo de orden (ej. `pipelineOrder Int`) → requeriría migración de `schema.prisma`. El cross-columna sí persiste. **Mejora diferida, no bloqueante.** (Quedó como pendiente de coordinación porque toca schema.)  
- **Confirm de borrado dentro del overview — refactor agendado.** El bug del z-index (el ConfirmDialog aparecía detrás del overview) se resolvió como hotfix subiendo el z-index (ver registro Transversal). El refactor al patrón "popup local anclado con estilo de Leads" (paridad con Proyectos) quedó **agendado como sprint dedicado**, no ejecutado en esta tanda.

---

## 3\. Estado del gate (en el cierre del lane)

- **`tsc --noEmit`** → exit 0, cero errores.  
- **ESLint (`admin/leads/**`)** → 1 error, **0 nuevos**: `react-hooks/purity` por `Date.now()` en `lead-card.tsx` (`followUpPending` useMemo). Pre-existente; el otro baseline (el del feed) se eliminó en esta tanda.  
- **Build** (`next build --webpack`) → verde (exit 0), con `--max-old-space-size=4096` (sin eso da OOM por el peso del proyecto, ajeno al lane).  
- **Aislamiento:** sin violación. Único cambio fuera de `admin/leads/**` \= `package.json`/`package-lock.json` (deps de `@dnd-kit`, esperado). No depende de campo nuevo de schema (`SETTER` y `OsLeadDossier` ya existían).  
- **Verificación visual:** pendiente de ojo humano en el cierre del lane; verificada post-merge (overlay fullscreen, DnD board, drag desde overview, typeahead, fades).

---

## 4\. Notas para el merge / dependencias

- **Deps nuevas:** `@dnd-kit/core@6.3.1` \+ `@dnd-kit/utilities@3.2.2` (directas) \+ `@dnd-kit/accessibility@3.1.1` (transitiva). Sin `@dnd-kit/sortable`. Tras el merge se regeneró el lock con `npm install`.  
- 18 archivos nuevos (todos en `admin/leads/_components` o `_actions`) \+ 13 modificados dentro del lane. Riesgo de colisión con otros lanes: nulo (área exclusiva).

---

## 5\. Lecciones / notas

- **El patrón drag-desde-overview es reusable.** El BLOCKER que costó 2 commits en Leads (capturar el item en `handleDragStart`) se convirtió en la receta para el mismo feature en Proyectos. Documentado y reutilizado.  
- **Portal a body para todo lo `fixed` dentro del admin:** el `<main>` con `backdrop-blur` es un trap de `position:fixed`. Todo overlay/dropdown/modal del admin se portalea a `document.body` con `useIsClient`. Patrón house consistente (overview, form nuevo lead, typeahead).  
- **Schemas Zod fuera de `'use server'`:** Next 16 prohíbe exports no-async en esos archivos — los schemas van en `.schemas.ts` aparte.
