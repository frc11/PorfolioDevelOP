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

---

# Sprint B — Filtros client-side + DnD proyectos + tareas (CAMBIO A–H)

Branch `lane/proyectos`. Workflow FASE 0 = 5 subagentes read-only (status-action, overview, tasks, scroll-cards, filters-clientization). Resumen de hallazgos + decisiones por cambio. Commit POR CAMBIO.

## FASE 0 — Hallazgos

- **#1 Filtros recargan (CONFIRMADO):** hoy `page.tsx` (server) lee `searchParams`, `listProjects()` trae todo, filtra in-memory SERVER-SIDE y pasa `filteredProjects` a `ProjectList`. Cada cambio de filtro es NAVEGACIÓN: las chips de visibilidad son `<Link>` (la premisa del brief de que cliente/interno ya eran useState es ERRÓNEA), servicio+período viven en un `<form action="/admin/projects">` con `requestSubmit()` on-change, "Limpiar" es `<Link>`. → CAMBIO A convierte LOS TRES a useState client-side.
- **#2 Action de estado de PROYECTO (EXISTE):** `updateProjectStatus({projectId, status})` en `project.actions.ts:710` — `requireSuperAdmin` + Zod `UpdateProjectStatusSchema` + `prisma.project.update` por PK. COMPLETED auto-sella `deliveredAt = new Date()` (y NO lo limpia al salir de COMPLETED). Scope por `requireSuperAdmin`, no por `organizationId` (convención del archivo). → CAMBIO D la reusa tal cual; NO crear action nueva, NO tocar schema.
- **#3 Overview (componente REAL):** único renderer `[projectId]/page.tsx:185-235`. Es el index del segmento `[projectId]` (tabs = rutas anidadas, no estado). El fix previo (commit `2a95ced`) YA está en disco y commiteado (`md:grid-cols-2 md:items-stretch` + `h-full` + `md:col-span-2`). El "no se reflejó" es cache/rebuild/breakpoint `md`, NO archivo equivocado. → CAMBIO H endurece la estructura (2-up grid de altura pareja + Cliente vinculado como hermano full-width) y se reporta que el markup previo ya estaba vivo.
- **#4 Scroll horizontal (causa):** el markup del row (`flex gap-4 overflow-x-auto` + cards `w-[340px] shrink-0`) es correcto pero el row puede crecer porque nada lo clampa, y `<main>` (`overflow-y-auto`, PROHIBIDO) se roba el gesto vertical. Fix lane-side: row con `min-w-0 max-w-full items-stretch overflow-y-hidden`; altura pareja real = `h-full` en el `<Link>` de la card (hoy solo estira el wrapper, no el Link) + card `flex flex-col` con footer `mt-auto`. MONTO ACORDADO no se corta hoy; mantener body `flex-col` (sin max-height duro). → CAMBIO C.
- **#5 Tareas (E/F/G):** `updateTask({taskId,status})` + `deleteTask(taskId: string)` con optimista+rollback. Borrado usa `ConfirmDialog` (PROHIBIDO) en `task-list.tsx:596`. `OverlayModal` (lane shell) NO trae footer ni isPending → se arma como children. Drag hoy sólo desde el grip `GripVertical` (oculto sm:flex, aria-hidden).

## Decisiones por cambio

- **A:** nuevo `projects-board.tsx` (client) dueño de todo el `<section>` (header + ProjectForm + filter bar + counts + lista). `page.tsx` queda como wrapper server (fetch + pasa la lista COMPLETA). Counts ("con cliente/internos") SIEMPRE sobre la lista completa, nunca filtrada. Vocab + helpers puros (`SERVICE/VISIBILITY/PERIOD_OPTIONS`, `matchesPeriod`, `periodStart`, `filterProjects`) centralizados en `projects-filters.ts`. Se borran `projects-filter-select.tsx` y `projects-period-filter.tsx` (quedan muertos). `matchesPeriod` mantiene: `lastActivityAt === null` → no se oculta. Default período `1m`. **Cambio de comportamiento:** se pierde el estado en URL / back-button (aceptado por el objetivo in-memory) → flag al humano.
- **B:** `projects-period-dropdown.tsx` (client) popover: las 5 opciones + al elegir "Personalizado" aparecen los 2 date inputs DENTRO del dropdown + botón "Aplicar" (el rango aplica recién con ambas fechas). Date inputs estilados dark/glass. Sin dep nueva.
- **C:** `project-card.tsx` → `flex h-full w-full flex-col`, footer `mt-auto`; `project-list.tsx` row → `min-w-0 max-w-full items-stretch overflow-x-auto overflow-y-hidden`, wrapper de card flex para que el Link estire.
- **D:** DnD nativo HTML5 de la CARD ENTERA entre las 4 secciones; reusa `updateProjectStatus`, optimista+rollback. La card es un `<Link>` → `draggable={false}` en el Link, wrapper `draggable` que arrastra; click navega, drag mueve. Convive con el scroll horizontal.
- **E:** kebab "..." de tarea → se elimina; queda un ícono de tacho directo. Cambio de estado SOLO por drag (decisión explícita del humano; NO re-agregar vía de estado en menú).
- **F:** borrado de tarea sale de `ConfirmDialog` y pasa por `OverlayModal` (portaleado, centrado, cubre todo). NO se edita `confirm-dialog.tsx` (sólo se deja de importar en `task-list.tsx`); `time-entry-panel.tsx` sigue usándolo (out-of-scope este cambio) → **PENDIENTE #1 queda parcialmente resuelto** (tareas sí, horas no).
- **G:** drag de tarea pasa al `<article>` entero; controles internos (expandir, Editar, tacho) con `draggable={false}` + `stopPropagation`/`preventDefault` para no iniciar drag y seguir clickeables.
- **H:** ver arriba — hardening + reporte de que ya estaba vivo.

## A confirmar / flags al humano (Sprint B)

- A: filtros sin estado en URL (back-button/deeplink ya no reflejan filtro). Confirmar que es aceptable.
- E/G: cambio de estado de tarea SOLO por drag → sin camino teclado/mobile (decisión explícita del humano). a11y reducida asumida.
- D: arrastrar a "Completado" sella `deliveredAt`; sacar de Completado NO lo limpia (la action sólo setea). Comportamiento heredado.
- B: el panel del dropdown de período se posiciona `absolute` (no portaleado). En la barra arriba de la página no lo recorta el scroll de `<main>`; si en mobile/scroll se viera cortado, portalear como `<Select>`.

## Cierre Sprint B

Estado: **A–H implementados y commiteados** (8 commits, uno por cambio). Gate por cambio: `eslint` por archivo + `tsc --noEmit` de todo el proyecto = **verde** en cada commit. `prisma migrate status` = "Database schema is up to date!".

**Build full no se pudo correr acá:** `next build` aborta porque el `next dev` del usuario en `:3000` tiene tomado el lock de `.next` (Next 16) — exit 9 ni bien arranca, antes de compilar archivos del lane; el único intento que esquivó el lock se quedó sin heap (OOM, memoria del host). No es regresión de código (tsc/eslint verdes, sin imports colgados de los archivos borrados). **Verificación runtime del humano sobre `:3000`** (HMR levanta los cambios commiteados). Visual-qa subagente NO corrido (no puede levantar un 2º dev server por el lock; memoria `preview-mcp-untracked`).

Rutas a revisar en `:3000`: `/admin/projects` (filtros client-side + dropdown período + secciones con scroll horizontal + DnD de cards entre estados), `/admin/projects/[id]` overview (cards parejas), `/admin/projects/[id]/tasks` (tacho directo, borrar por OverlayModal, drag de card entera).

PENDIENTE de coordinación que sigue abierto: borrar **registro de horas** en `time-entry-panel.tsx` aún usa `ConfirmDialog` (prohibido) — mismo trap; CAMBIO F sólo migró tareas. Freeze post-impersonación (#4) sin cambios (out-of-scope).

---

# Sprint C — Dropdown período, filtro por fecha de inicio, scroll/wrap, layout cards, overview 50/50 (CAMBIO 1–7)

## FASE 0 — Hallazgos

1. **Form de proyecto NO tiene input de fecha de inicio.** Campos del form: organización, nombre, descripción, servicio, **estimatedEndDate**, agreedAmount, monthlyRate. NINGÚN start.
2. **🚨 `Project` NO tiene columna de fecha de inicio.** Schema (FROZEN) sólo tiene `maintenanceStartDate`, `deliveredAt`, `estimatedEndDate` (líneas 489-510). El "Inicio" de la card es **DERIVADO** (`deriveProjectStartDate` = min de osLead.createdAt, milestones.createdAt, timeEntries, maintenancePayments). → La premisa del brief ("la columna sigue nullable") es incorrecta: **no existe ninguna columna**. Filtrar/editar/backfillear una fecha de inicio REAL requiere agregar `startDate DateTime?` a `Project` (schema PROHIBIDO).
3. **Filtro de período hoy** usa `lastActivityAt` (derivado max), comparación en `projects-filters.ts:matchesPeriod`. (El brief dice "updatedAt" pero no existe en Project; era lastActivityAt.)
4. **Scroll horizontal:** el row ya trae `overflow-x-auto min-w-0 max-w-full` (Sprint B). El scrollbar aparece pero la **rueda vertical no panea horizontal** (comportamiento nativo) → se percibe "no scrollea". El brief pre-aprueba fallback **WRAP**.
5. **OverlayModal sirve** para borrado de horas (mismo patrón F). `time-entry-panel.tsx:408-423` usa `ConfirmDialog` (prohibido).
6. **Dropdown servicio (referencia):** es el `<Select>` compartido, **PORTALEADO a `document.body`** → su panel `bg-zinc-900/95` queda sobre el bg sólido del root → sólido. Mi dropdown de período es `absolute` DENTRO del `<main>`/header (translúcidos con backdrop-blur) → su `bg-[#11161d]/95 backdrop-blur` deja pasar el fondo (el "0"). Fix in-scope: **panel opaco** (`bg-zinc-900`, sin /95 ni backdrop-blur), radio/borde/ítems igual al Select.

## Decisiones por cambio

- **1:** panel del dropdown de período opaco (`bg-zinc-900`), `rounded-xl`, ítems con activo cyan como el `<Select>`. Adiós bleed.
- **2:** el filtro pasa de `lastActivityAt` → `startDate` (derivado, ya en el item). `startDate` nulo → **EXCLUIDO** de los filtros de fecha (return false). Rango custom inclusivo con bordes de día LOCAL consistentes (sin mezclar UTC/local). Default `1m` → **`6m`**. **Forward-compatible:** cuando exista `Project.startDate`, el serializer hace `project.startDate ?? deriveProjectStartDate(project)` y el filtro no cambia.
- **3:** ⛔ **PENDIENTE DE COORDINACIÓN** — no hay columna para persistir. Agregar input + Zod required sin columna guardaría un "required" que el server descarta (engañoso). Reporto el diff de schema + el wiring.
- **4:** **WRAP** (no scroll). Motivo: rueda vertical no panea overflow-x nativo; el scrollbar-only es frágil. `flex flex-wrap` → cards a 2º/3º renglón, ninguna cortada (acepta opción 2 del brief). Pre-aprobado.
- **5:** card de proyecto — los 3 datos (Monto/Inicio/Pagos) pasan de `sm:grid-cols-3` (3 columnas cramped en 340px → precio cortado) a **3 filas verticales** full-width; badge "Cliente portal"/"Interno" a su **propio renglón** (2º), siempre.
- **6:** borrado de horas → `OverlayModal` (igual que F). No se toca `ConfirmDialog`. → **cierra el PENDIENTE #1** (tareas + horas migradas; queda sólo el `confirm-dialog.tsx` compartido para otros lanes).
- **7:** overview top-level → fila1 Resumen 50% + Tareas 50% (`lg:grid-cols-2 lg:items-stretch`, `h-full`, Tareas distribuye con `auto-rows-fr`), fila2 Finanzas 100%. Las cards internas de Resumen NO se tocan.

## Flags / coordinación (Sprint C)

- **CAMBIO 3 + TAREA DE DATOS + "filtro por fecha real":** todo depende de agregar `startDate DateTime?` a `Project` (schema PROHIBIDO en este lane). Diff: `startDate DateTime?` en `model Project`. Después: (a) serializer `startDate: serializeDate(project.startDate ?? deriveProjectStartDate(project))`; (b) form input `type=date` required (Zod client+server, `CreateProjectSchema.startDate: z.coerce.date()`); (c) `createProject`/`updateProject` setean `startDate`; (d) correr el script de backfill (provisto en el reporte). NOT NULL en DB = paso aparte después del backfill.
- **CAMBIO 2 hoy filtra el `startDate` DERIVADO** (no editable). Demuestra la aceptación con la data actual, pero el script/form recién conectan cuando exista la columna.

## Cierre Sprint C

Estado: **1, 2, 4, 5, 6, 7 implementados y commiteados** (gate por cambio: eslint por archivo + `tsc --noEmit` de todo el proyecto = verde). **CAMBIO 3 = PENDIENTE DE COORDINACIÓN** (no hay columna `Project.startDate` para persistir; agregar un input "required" que el server descarta sería engañoso). `prisma migrate status` quedó verde en Sprint B; `npm run build` no se corre acá (lock de `.next` del dev server en `:3000` + OOM del host) → verificación runtime del humano en `:3000`.

PENDIENTE DE COORDINACIÓN (Sprint C):
1. **`Project.startDate DateTime?` (schema).** Habilita CAMBIO 3 (form required + persistir), el filtro por fecha REAL (serializer pasa a `project.startDate ?? deriveProjectStartDate(project)`) y el backfill. NOT NULL en DB = paso posterior al backfill.
2. **Script de backfill** (one-off, NO commiteado) — entregado en el reporte; corre recién con la columna.

CAMBIO F+6 cerraron el uso de `ConfirmDialog` en el lane (tareas + horas migradas a `OverlayModal`). `confirm-dialog.tsx` sigue prohibido/compartido para otros lanes.

---

# Sprint D — 2º filtro (entrega) + Todos/reset, ancho fijo select, entrega en card, scroll vertical secciones (CAMBIO 1–4)

NOTA: "fecha de inicio obligatoria" CANCELADO → se cae la coordinación de `Project.startDate` del Sprint C. El filtro de inicio sigue sobre el `startDate` derivado.

## FASE 0 — Hallazgos

1. **Entrega = `estimatedEndDate`** (columna REAL en `Project`, schema:498). La card ya trae `estimatedEndDate: string | null` y el serializer la expone. El filtro de entrega va sobre esa columna real (a diferencia de inicio, que es derivado).
2. **Estado de filtros** vive en `ProjectsBoard` (`filters: ProjectFilters` useState) → `ProjectsFilterBar` (controles) → `ProjectsPeriodDropdown` (período). Para el 2º filtro extiendo `ProjectFilters` a `{ service, visibility, start:{period,from,to}, delivery:{period,from,to} }`.
3. **Select de servicio se achica**: el `<Select>` compartido pone `w-full` en su botón dentro de un wrapper `relative` sin ancho → shrink-wrap al contenido → ancho = label. Fix: `min-w` en el control.
4. **Carril de wrap** = `motion.div` (`flex flex-wrap`) en `project-list.tsx`. Sumarle `max-h` calibrable + `overflow-y-auto overflow-x-hidden`.

## Decisiones por cambio

- **1:** `projects-filters.ts` reescrito a 2 filtros de fecha. Unión compartida `PeriodValue = 'all'|'1w'|'1m'|'3m'|'6m'|'1y'|'custom'`; option-lists distintas por filtro (inicio: all/1w/1m/6m/1y/custom; entrega: all/1w/1m/3m/custom). `matchesStart` (hacia atrás sobre startDate, 'all'→no filtra, null→excluido salvo 'all') y `matchesDelivery` (hacia adelante `[hoy, hoy+ventana]` sobre estimatedEndDate, 'all'→no filtra, null→excluido salvo 'all'). Custom inclusivo con bordes de día local. `ProjectsPeriodDropdown` se generaliza (label + ariaLabel + options). Reset → `DEFAULT_FILTERS` (servicio Todos, visibilidad Todos, inicio 6m, entrega Todos); el botón "Limpiar" pasa a "Reestablecer filtros".
- **2:** `min-w-[180px]` al select de servicio (y min-w a los dropdowns de fecha) para que no se achiquen con valores cortos.
- **3:** card — tile "Entrega estimada" debajo de "Inicio" (orden Monto/Inicio/Entrega/Pagos); gaps uniformes (gap-4 entre tiles + mt-4 al footer, se saca `mt-auto` que dejaba Pagos pegado al footer en la card más alta).
- **4:** `project-list.tsx` — el carril de cada sección con `max-h-[Nrem]` (constante calibrable) + `overflow-y-auto overflow-x-hidden`: ~2 renglones visibles, el resto scrollea vertical (la rueda sí panea).

## Cierre Sprint D

Estado: **1, 2, 3, 4 implementados y commiteados** (gate por cambio: eslint por archivo + `tsc --noEmit` de todo el proyecto = verde; sweep final verde). `npm run build` no se corre acá (lock de `.next` del dev server en `:3000`) → verificación runtime del humano en `:3000`.

Notas para calibrar/verificar:
- **CAMBIO 1:** el filtro de **entrega** es sobre `estimatedEndDate` (columna real); el de **inicio** sigue sobre el `startDate` DERIVADO (la obligatoriedad/columna quedó cancelada). "Reestablecer filtros" aparece cuando algo está fuera del default.
- **CAMBIO 4:** `SECTION_MAX_HEIGHT = 'max-h-[48rem]'` en `project-list.tsx` — las cards quedaron altas (4 tiles + footer), así que ~2 renglones reales ≈ 70rem; 48rem es un cap más compacto. **Subir/bajar ese rem ajusta el umbral** (está aislado en una constante).

PENDIENTE DE COORDINACIÓN (consolidado, post Sprint D):
- **Freeze post-impersonación (#4)** — único pendiente real; out-of-scope (auth/impersonation + layout admin). El de `Project.startDate` se cae (requisito de inicio obligatorio cancelado).
