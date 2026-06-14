# Lane Proyectos + Equipo — Log de trabajo

Branch: `lane/proyectos` · Stack: Next.js 16 App Router · TS estricto (cero `any`) · Prisma/Neon · NextAuth v5 · Tailwind 4 · motion/react.
Fuente de verdad de este lane. Worktree en `C:/develop-proyectos/logic-core-v3` (sin `node_modules` hasta `npm install`).

---

## Scope (archivos editables)

**Proyectos** `src/app/(protected)/admin/projects/` — _components (project-card, project-list, project-form, task-form, task-list, time-entry-panel), [projectId]/_components (project-tabs), páginas (projects, [projectId] overview/tasks/hours/payments), _actions (project/milestone/maintenance + schemas).
**Equipo** `src/app/(protected)/admin/team/` — page, _components/member-workload, loading/error, _actions (task/time-entry + schemas).
**Prohibidos (consumir, no editar):** schema.prisma · components/ui/* (incl. Modal.tsx, Select.tsx, index.ts) · lib/action-utils · lib/auth-guards · lib/prisma · confirm-dialog.tsx · AdminErrorBoundary.tsx · AdminLayoutClient (`<main>` con backdrop-filter).
**Dead code (ignorar):** convert-lead-dialog.tsx · lib/actions/projects.ts · actions/task-approvals.ts.

---

## FASE 0 — Discovery (7 subagentes read-only)

**Q1/Q2 — Overlays de forms.** `project-form.tsx` (z-130) y `task-form.tsx` (z-140) son overlays **inline `fixed` SIN portal**, renderizados dentro del `<main>` del admin (`AdminLayoutClient.tsx:82`, `backdrop-blur-md`). Ese `backdrop-filter` en el ancestro crea un **containing block** que re-ancla el `position:fixed` → el overlay solo oscurece hasta el borde de `<main>`, no el viewport. `ui/Modal.tsx` **NO portalea, sin aria/scroll-lock/escape, 0 usos** → descartado. `confirm-dialog.tsx` tiene `role=dialog`+`aria-modal` pero tampoco portalea. **Fix correcto: overlay shell lane-local con `createPortal(document.body)`** (coincide con memoria `admin-fixed-backdrop-trap`). El consejo del agente Q2 de "no portalear" es ERRÓNEO para el objetivo.

**Q3 (#8) — Diálogo de borrar.** Borrar TAREA → usa `ConfirmDialog` (confirm-dialog.tsx, **PROHIBIDO**) en `task-list.tsx`. Borrar registro de horas → idem en `time-entry-panel.tsx`. **Borrar PROYECTO → no tiene UI** (`deleteProjectAction` es dead code). El overlay roto vive en la primitiva PROHIBIDA → **PEDIDO C = PENDIENTE DE COORDINACIÓN**.

**Q4 — Schema (FROZEN).** ⚠️ `Project` **NO tiene `createdAt` ni `updatedAt`** (sí `maintenanceStartDate`, `deliveredAt`, `estimatedEndDate`). Enums: `ProjectStatus = PLANNING | IN_PROGRESS | REVIEW | COMPLETED`; `TaskStatus = TODO | IN_PROGRESS | DONE`. `Task` sí tiene createdAt/updatedAt. → **Decisión #3/F:** filtrar período por proxy de "última actividad" = `deriveProjectActivityAt()` (ya existe en project.actions.ts: `max(deliveredAt, estimatedEndDate, maintenanceStartDate, osLead.updatedAt, milestones.createdAt, maintenance.createdAt, timeEntries)`), expuesto como timestamp en el item. **REPORTADO**: no hay updatedAt en Project; uso este proxy.

**Q5 (#9) — Estado de tarea.** El `<Select>` inline (`ProjectStatusQuickChange` en task-list) dispara `handleQuickStatusChange(taskId, status)` → `updateTask({taskId, status})` (`team/_actions/task.actions.ts:197`, Zod `UpdateTaskSchema`, `requireSuperAdmin`). Ya hay update optimista con rollback. Kebab `MoreHorizontal` existe (solo "Eliminar"). task-list ya agrupa por estado en 3 secciones verticales (no kanban). **DnD reusa `updateTask` con enum destino.**

**Q6 (#4) — Ver como cliente.** Es un **`<form action={startImpersonationAction.bind(...)}>`** en `[projectId]/layout.tsx:217-225` (Server Action → `redirect('/dashboard')`), **NO `router.push`**. El trigger in-scope está OK. El **freeze al volver** vive en `lib/actions/impersonation.ts` (`stopImpersonationAction` → `redirect`) + `AdminLayoutClient.mobileOpen` que no se resetea en hard-redirect — todo **OUT-OF-SCOPE**. → **PEDIDO H = mayormente COORDINACIÓN** (patch sugerido out-of-scope: `useEffect(()=>setMobileOpen(false),[pathname])`).

**Q7 (#2/#3/#5) — Filter bar + overview.** Filtrado server-driven: `page.tsx` lee searchParams, `listProjects()` trae TODO, filtra in-memory, pasa a `ProjectList` (client, solo grid). Controles: chips de visibility (Links), chips de status (Links), `<Select serviceType>` + botón **"Aplicar filtro"** (form GET) + "Limpiar" (Link). `listProjects` **descarta `sortTimestamp`** y se consume **solo en page.tsx**. Overview `[projectId]/page.tsx`: Proyecto+Fechas en `md:grid-cols-2`, Cliente vinculado full-width abajo (`mt-4`) — consolidar en un grid con `col-span-2`.

---

## Ejecución por pedido

### ✅ A (#1,#6) — Overlay form de proyecto
Nuevo `projects/_components/overlay-modal.tsx`: shell lane-local con `createPortal(document.body)` (escapa el trap del `<main>`), backdrop full-viewport oscuro+blur, panel centrado `flex`, `max-h-[90vh]` + scroll interno, **scroll lock** del body, **Escape** + click-backdrop cierran, foco al panel + retorno al cerrar, `role=dialog`+`aria-modal`+`aria-labelledby`, `aria-label` en la X, z-[200]. Client-gate con `useSyncExternalStore` (hydration-safe, sin setState-in-effect → cumple `react-hooks/set-state-in-effect`). `project-form.tsx` consume el shell (cubre crear y editar). Gate: eslint OK + `tsc --noEmit` exit 0.

### ✅ B (#7) — Overlay form de tarea
`task-form.tsx` consume el mismo shell (nueva y editar). Gate: eslint OK + tsc OK.

### ⛔ C (#8) — Diálogo de borrar → PENDIENTE DE COORDINACIÓN (sin código, ver abajo)

### ✅ D (#2) — Filtro de servicio dinámico
Nuevo `projects-filter-select.tsx` (client) que consume el `<Select>` compartido y hace `form.requestSubmit()` en `onChange`. En `page.tsx` reemplaza el select de servicio y se elimina el botón "Aplicar filtro"; "Limpiar" se mantiene; `aria-label` agregado. El `<Select>` lleva un `<select>` nativo oculto con `name` dentro del form, así que el submit on-change funciona sin botón. Gate: eslint OK + tsc OK.

### ✅ E (#5) — Grid parejo overview
`[projectId]/page.tsx`: los 3 cuadros pasan a un solo grid `md:grid-cols-2 md:items-stretch`; Proyecto y Fechas con `h-full` (igual altura), "Cliente vinculado" con `md:col-span-2` (full width). "Lead original" queda como card aparte abajo. Gate: eslint OK + tsc OK.

### ✅ F (#3) — Secciones por estado + filtro de período
- `project-list.tsx` reescrito: siempre 4 secciones por estado (Planning → En progreso → Revision → Completado), fila horizontal con `overflow-x-auto`, empty state por sección.
- Chips de filtro por estado eliminados de `page.tsx`. Se mantienen visibility (chips Link) y servicio (select on-change).
- Filtro de período nuevo (`projects-period-filter.tsx`, client): 1 semana / 1 mes / 6 meses / 1 año / custom (from-to), **default 1 mes**, on-change vía el form GET. Filtros combinados con AND, server-side por URL.
- **Proxy de fecha (decisión + reporte):** Project no tiene createdAt/updatedAt → nuevo `deriveProjectLastActivityAt` (pasado: max de deliveredAt, maintenanceStartDate, osLead.updatedAt, milestones/mantenimiento/time-entries; **excluye estimatedEndDate** por futura), expuesto como `lastActivityAt`. Proyectos sin señal de actividad NO se ocultan. `listProjects` se consume solo en page.tsx (sin impacto cross-lane). Limitación conocida: el proxy es imperfecto vs un updatedAt real; el humano valida.
- Warning baseline conocido en project.actions.ts: `sortTimestamp` destructurado-y-descartado en el strip de `listProjects` (línea no tocada). Gate: eslint OK (1 warning baseline) + tsc OK.

### ✅ G (#9) — DnD tareas + kebab
`task-list.tsx`: handle `GripVertical` `draggable` por card (DnD nativo HTML5, sin deps); cada `<section>` de estado es drop zone (`onDragOver`/`onDrop`) y resalta al pasar por encima un drag de otro estado; el drop llama `handleQuickStatusChange(taskId, statusDestino)` → misma action `updateTask` con update optimista + rollback. Se quitó el `<Select>` inline (`ProjectStatusQuickChange` borrado). El cambio de estado se movió al kebab "..." (opciones de los otros estados) → camino accesible para teclado/touch. Gate: eslint OK + tsc OK.

### ⛔ H (#4) — Ver-como-cliente → DIAGNÓSTICO + PENDIENTE DE COORDINACIÓN (sin código)
Verificado in-scope: el trigger en `[projectId]/layout.tsx:217` es `<form action={startImpersonationAction.bind(null, org.id)}>` — Server Action que hace `redirect('/dashboard')`. **NO usa `router.push`**, no deja scroll-lock ni estado de transición; `layout.tsx` es Server Component. La condición del pedido ("si navega con router.push o deja lock") NO aplica → no hay nada que arreglar in-scope. El freeze AL VOLVER es out-of-scope (ver abajo).

---

## PENDIENTE DE COORDINACIÓN (consolidado)

1. **(#8) confirm-dialog.tsx — portal/centrado del diálogo de borrar.** El diálogo de borrar tarea (`task-list.tsx`) y borrar registro de horas (`time-entry-panel.tsx`) usan la primitiva PROHIBIDA `src/app/(protected)/admin/_components/confirm-dialog.tsx`, que renderiza `fixed inset-0 z-[180]` inline dentro del `<main>` con `backdrop-filter` → mismo containing-block trap que arreglamos en los forms. Fix requerido: portalear `ConfirmDialog` a `document.body` (mismo patrón que el `overlay-modal.tsx` del lane). No editable desde este lane. (Borrar proyecto no tiene UI: `deleteProjectAction` es dead code.)

2. **(#4) Freeze post-impersonación.** El trigger in-scope está OK. El freeze al SALIR de "Ver como cliente" y volver al admin involucra: (a) `lib/actions/impersonation.ts` → `stopImpersonationAction` hace `redirect('/admin/clients')` (hard nav, PROHIBIDO); (b) `AdminLayoutClient.tsx` → estado `mobileOpen` del sidebar no se resetea en hard-redirect (PROHIBIDO). Patch sugerido fuera de scope: `useEffect(() => setMobileOpen(false), [pathname])` en `AdminLayoutClient`, y/o revisar si la impersonación debe limpiar estado antes del redirect. Requiere coordinación con los dueños de auth/impersonación y del layout admin (lane Dashboard).
