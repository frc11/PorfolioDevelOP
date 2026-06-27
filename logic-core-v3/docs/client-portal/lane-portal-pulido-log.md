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

### Verificación adversarial Tarea 1 (workflow read-only, 4 lentes) — ✅ ALL PASS
- **scope/frozen:** exactamente 6 archivos cambiados, todos autorizados; ningún frozen tocado.
- **sidebar-fidelity:** relocación byte-fiel (condición por slug, href, ícono, color, pill `layoutId`, `onNavigate`, `pl-6` idénticos; solo cambió montaje + indent, wrapper `div`→fragment). JSX balanceado.
- **hard-rules:** sin `any`, sin `router.push/back`, sin secrets, estados loading/error/empty intactos, tenancy por sesión.
- **fullwidth:** 4 caps removidos OK; `<main>` sin max-w y ningún ancestro re-capea (`PageTransition` = `w-full`, no hay `modules/layout.tsx`) → fullwidth real.
- **PENDIENTE:** OK visual del humano (Tarea 1) antes de arrancar Tarea 2.

### 1-A bis) Fix visual: módulos como hermanos (no sub-ítems) — feedback de Valentino
- **Síntoma (verde ≠ se ve):** tras 1-A los módulos quedaron en "Servicios" pero con el
  markup atenuado heredado del bloque suelto: ícono `size={14}`, texto `text-xs text-zinc-500`,
  `pl-6` (indentado), pill/color por servicio (amber/violet/emerald). Parecían sub-ítems.
- **Causa raíz:** 1-A copió el markup viejo (fiel pero atenuado). La verificación adversarial
  validó "relocación byte-fiel" → correcto contra el spec de 1-A, pero el spec producía un
  visual malo. Una verificación de *diff-fidelity* NO detecta un problema de *diseño del spec*.
- **Fix:** los módulos activos se convierten en `NavItem[]` (`PREMIUM_MODULES`, orden fijo) y se
  inyectan en `section.items` de "Servicios" → se renderizan por el MISMO `.map` que los items
  normales. Visualmente indistinguibles de "Mi Chatbot" (size 16, `text-sm font-medium`,
  `text-zinc-400`/`hover:text-zinc-100`, indent cero, **pill cyan activo** en `/dashboard/modules/<x>`).
  Lo único propio: ícono + label. Se eliminó el bloque IIFE atenuado y `hasPremium`.
- Gate: tsc verde + eslint verde. **PENDIENTE:** re-verificación visual del humano.

---

## TAREA 1 — OK VISUAL de Valentino ✅ (incluye 1-A bis)

## TAREA 2 — Botón volver atrás
- **Estado:** EN CURSO

### 2-A) `src/components/dashboard/BackLink.tsx` (NUEVO)
- **Estado:** ✅ HECHO · gate tsc + eslint verde.
- Presentacional universal (sin hooks/'use client'): `<Link href>` + `ArrowLeft` (strokeWidth 1.5,
  `h-3.5 w-3.5`) + label. Props `href`/`label`/`className?`. Clases del patrón LeadDetail.
  `cn` desde `@/lib/utils` (canónico). href SIEMPRE estático.

### 2-B) Insertar BackLink (ALTA del relevamiento)
- **soporte/[ticketId]** → "Volver a soporte" (upgrade del breadcrumb): ✅ HECHO (tsc+lint verde).
  Reemplazó el breadcrumb "develOP / Tickets" y se quitó el import `Link` (quedaba sin uso).
- **email-marketing/campaigns + contactos** → ⚠️ HALLAZGO, NO implementado pendiente decisión:
  (1) `email-marketing/page.tsx` (root) es `redirect('…/campaigns')` → "Volver al módulo" sería
  un no-op en campaigns y redundante en contactos; (2) el layout ya tiene tab bar (Campañas|Contactos)
  → son tab-navegadas como `resultados/*`/`cuenta/*` (que NO llevan back por regla). Recomiendo SKIP.

### 2-C) Violaciones de navegación
- **send/[id]**: `router.back()` (Cancelar) → `<Link>` al padre `/campaigns`: ✅ HECHO (tsc+lint verde).
  Botón Cancelar → `<Link>` con `pointer-events-none`+`opacity-40`+`aria-disabled`/`tabIndex` durante
  el envío (preserva el "disabled mientras loading"). El `router.push` post-envío (línea 23) queda
  (navegación imperativa post-acción, sancionada por CLAUDE.md).
- **campaigns/new**: los `router.push` son navegación POST-ACCIÓN (corren un server action y después
  navegan) → no pueden ser `<Link>`; `redirect()` server-side rompería la secuencia create→send→error
  de `handleSendNow`. CLAUDE.md permite `router.push` imperativo post-submit CON comentario inline.
  Fix = documentarlos (compliant), NO forzar redirect. Reportado a Valentino.

## TAREA 3 — Empties: aplanar solo listas vacías, canon único
- **Estado:** PENDIENTE (arranca tras OK visual de Tarea 2)

---

## Bitácora de commits
- `7cfe4a4` — feat(dashboard): agrupar módulos premium dentro de "Servicios" en el sidebar (1-A)
- `6bd00a6` — fix(dashboard): páginas de módulo premium a fullwidth (sacar max-w local) (1-B)
- `94efb7c` — docs: log Tarea 1 (verificación adversarial all-pass)
- `9699eaa` — fix(dashboard): módulos del sidebar como items normales de "Servicios" (1-A bis)
- `e6155f5` — feat(dashboard): componente BackLink (2-A)
- `841425c` — feat(soporte): BackLink en detalle de ticket (2-B)
- 2-C (parcial) — fix(email-marketing): Cancelar de send usa Link, no router.back (este commit)
