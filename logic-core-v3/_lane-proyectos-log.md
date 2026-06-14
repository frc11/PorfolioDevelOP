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

### ⏳ C (#8) — Diálogo de borrar → COORDINACIÓN (ver abajo)
### ⏳ D (#2) — Filtro de servicio dinámico
### ⏳ E (#5) — Grid parejo overview
### ⏳ F (#3) — Secciones por estado + filtro de período
### ⏳ G (#9) — DnD tareas + kebab
### ⏳ H (#4) — Ver-como-cliente → diagnóstico + COORDINACIÓN

---

## PENDIENTE DE COORDINACIÓN (consolidar al cierre)

- **(#8) confirm-dialog.tsx** necesita el mismo fix de portal/centrado: el diálogo de borrar tarea (y borrar registro de horas) usa la primitiva PROHIBIDA `confirm-dialog.tsx`, que renderiza `fixed` inline dentro del `<main>` → mismo trap. No editable desde este lane.
- **(#4) freeze post-impersonación** involucra `lib/actions/impersonation.ts` (`stopImpersonationAction` con `redirect`) y `AdminLayoutClient.mobileOpen` (no se resetea en hard-redirect). Patch sugerido fuera de scope: `useEffect(() => setMobileOpen(false), [pathname])` en AdminLayoutClient.
