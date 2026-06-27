# Lane `portal-pulido` — log (fuente de verdad)

> Worktree: `C:\lane-portal-pulido\logic-core-v3\` · Branch: `lane/portal-pulido` (desde `57fabe8`)
> NO merge — lo hace Valentino. Commit por sprint. Checkpoint visual humano entre tareas.
> Gate por sprint: `.\node_modules\.bin\tsc.cmd --noEmit` (solo) sin errores nuevos + lint en tocados.
> Baseline ignorado: `@googleapis/webmasters`, `react-hooks/set-state-in-effect` en PreloaderContext.

Guías: `relevamiento-empties.md`, `relevamiento-back-button.md`, plan #3 (sidebar+fullwidth).

---

## TAREA 1 — Módulos premium: sidebar + fullwidth

### 1-A) Sidebar agrupado (EDITA `SidebarNav.tsx` — autorizado por Valentino)
- **Estado:** ✅ HECHO · gate: tsc verde + eslint verde en `SidebarNav.tsx`
- Reubica el bloque de módulos premium activos (antes suelto al fondo, líneas 168-274) DENTRO
  de la sección "Servicios" (`NAV_SECTIONS[1]`), después de "Mi Chatbot".
- Mismos links per-módulo, mismas condiciones por slug (`activeModuleSlugs.includes(...)`),
  mismo markup (colores, pill `layoutId`, indent `pl-6`). Solo cambia el punto de montaje.
- Se elimina el contenedor `{hasPremium && (<div className="space-y-1">…)}` del fondo.
- Cero cambio de lógica/datos (el prop `activeModuleSlugs` ya llega).

### 1-B) Fullwidth de páginas de módulo (NO toca frozen)
- **Estado:** ✅ HECHO · gate: tsc verde + eslint verde en los 4 archivos
- Sacar el cap local `max-w-Nxl` (mantener `flex flex-col gap-6`) en:
  - `modules/motor-resenas/page.tsx:159` (max-w-2xl)
  - `modules/agenda-inteligente/page.tsx:331` (max-w-2xl)
  - `modules/email-marketing/layout.tsx:27` (max-w-3xl — cubre campaigns + contactos + new/send)
  - `modules/tienda-conectada/page.tsx:309` (max-w-3xl)
- `<main>` (DashboardLayoutClient:164) ya es fullwidth (`absolute inset-0 … p-4 sm:p-6`, sin max-w).

---

## TAREA 2 — Botón volver atrás
- **Estado:** PENDIENTE (arranca tras OK visual de Tarea 1)

## TAREA 3 — Empties: aplanar solo listas vacías, canon único
- **Estado:** PENDIENTE (arranca tras OK visual de Tarea 2)

---

## Bitácora de commits
- `7cfe4a4` — feat(dashboard): agrupar módulos premium dentro de "Servicios" en el sidebar (1-A)
- 1-B — fix(dashboard): páginas de módulo a fullwidth (sacar max-w local) (este commit)
