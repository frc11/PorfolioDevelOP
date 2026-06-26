# Lane Proyectos (Portal Cliente) — Log fuente de verdad

Branch: `lane/project` · Worktree: `C:\lane-project\logic-core-v3\` · Stack: Next.js 16 App
Router · TS estricto (cero `any`) · Prisma/Neon · NextAuth v5 · Tailwind 4 · motion/react.

**Pantalla objetivo:** `/dashboard/project` (portal CLIENTE). NO confundir con el lane ADMIN
`lane/proyectos` (`/admin/projects`, Sprints A–F), cuyo log es `_lane-proyectos-log.md` y cuyo
worktree es `C:/develop-proyectos/`. Son lanes distintos que comparten historia de branch.

Corrida desatendida (rutina nocturna): S1→S6 de corrido, commit por sprint, sin checkpoints
humanos. Verificación visual la hace Valentino al día siguiente sobre lo commiteado.

---

## Plan (del brief)

- **S1** — chrome/header + fix de boundary `EmptyState`. (`page.tsx`, `loading.tsx`,
  `ProjectEmptyState.tsx`).
- **S2** — Cards / lista de entregas (`ProjectTaskTabs.tsx`, `TaskCard` inline) → tokens admin.
- **S3** — Tabs (ajustes menores sobre `ui/Tabs`, cyan-locked).
- **S4** — `page.tsx`: query single→multi + switcher (4a), hero reskin (4b), detail-fields
  read-only (4c). Commits separados.
- **S5** — Hover (`adminHoverCls` con split wrapper) + no-regresión de estados.
- **S6** — Botón eliminar DENTRO del detalle admin `admin/projects/[projectId]` (consume la
  `deleteProjectAction` EXISTENTE, redirect server-side). READ-FIRST + parada obligatoria si el
  guard SUPER_ADMIN no está claro.

---

## 2026-06-25 — ARRANQUE: lane DETENIDO por discrepancia (Arranque rule 3)

**Estado encontrado al despertar (read-only, no toqué código):**

- Branch correcta: `lane/project`. Worktree correcto: `C:\lane-project\logic-core-v3\`.
- **NO existía ningún `.md` fuente de verdad para este lane.** Los `.md` presentes en el worktree
  (`_lane-proyectos-log.md`, `__dev_task.md`) pertenecen a OTROS lanes (admin proyectos / pulida
  process-automation). Este archivo (`_lane-project-log.md`) lo creo yo ahora como fuente de
  verdad del lane cliente.
- **`git log --oneline`: NO hay commit de S1.** El último commit es `dd0a3c4 commit changelogs de
  clientes` (no relacionado con este lane).
- **Working tree SUCIO con S1 sin commitear:**
  - `M src/app/(protected)/dashboard/project/page.tsx`
  - `M src/app/(protected)/dashboard/project/loading.tsx`
  - `?? src/components/dashboard/ProjectEmptyState.tsx` (nuevo, untracked)

**Qué contiene esa S1 sin commitear (inspección estática del diff, NO ejecuté gate):**

- `ProjectEmptyState.tsx`: wrapper `'use client'` que envuelve `EmptyState` (ui/*) con el ícono
  `FolderKanban` importado adentro del módulo client → evita cruzar la función-componente por el
  boundary Server→Client. Coincide exacto con la memoria `empty-state-client-boundary`.
- `page.tsx`: `PageHeader`/`EmptyState` reemplazados por header-card con tokens admin
  (`rounded-[28px] border-white/10 bg-white/5 p-5 backdrop-blur-xl`); status pill alineado al
  `statusTone` admin (IN_PROGRESS = sky, `*-400/20` borde, `*-400/10` bg, `*-200` texto);
  erradicado `font-black` / `uppercase italic`; empty de tareas enrutado por `<ProjectEmptyState/>`.
- `loading.tsx`: skeleton del header espeja la nueva header-card.

El diff se ve coherente y completo, y matchea la descripción de "S1 — chrome/header + fix de
boundary EmptyState". PERO está **sin commitear y sin gate verificado por mí**.

**Por qué DETENGO el lane (no improviso, no commiteo, no avanzo a S2):**

El brief de arranque asume que al correr esta rutina, S1 ya está **commiteado** (la lista de
reanudar arranca en S2, nunca menciona hacer S1) y que existe un `.md` fuente de verdad para
leer. La realidad NO coincide: S1 sin commitear + sin `.md`. Eso es exactamente el disparador de
la **Arranque rule 3**:

> "Si el estado del worktree no coincide con el .md (working tree sucio, sprint a medio hacer sin
> commit) → NO improvises: anotá la discrepancia en el .md y DETENÉ el lane. Mejor detenido que
> pisando trabajo."

No fui yo quien dejó estos cambios; no puedo verificar su procedencia ni que el gate (tsc + lint +
visual-qa) haya pasado alguna vez. Commitearlos bajo el lane y construir S2–S6 encima arriesga
"pisar trabajo" en curso de Valentino. Conservador > forzar.

**NO hice:** ni `git add`, ni `git commit`, ni edición de `page.tsx`/`loading.tsx`/
`ProjectEmptyState.tsx`, ni arranque de S2. El código de S1 queda EXACTAMENTE como lo encontré
(unstaged, untracked).

**Para desbloquear (lo hace Valentino despierto):**

1. Revisar el diff de S1 (`git diff` + el untracked `ProjectEmptyState.tsx`) y correr el gate
   (`.\node_modules\.bin\tsc.cmd --noEmit` + lint en los 3 archivos + visual-qa sobre
   `/dashboard/project`).
2. Si S1 está OK → commitearlo (cierra S1) y dejar el working tree limpio.
3. Re-disparar la rutina: con S1 commiteado y este `.md` presente, el próximo arranque reanuda
   limpio desde **S2**.
   - Alternativa: si Valentino quiere que la rutina commitee S1 ella misma y siga, ajustar el
     brief para autorizar explícitamente adoptar+commitear el S1 encontrado (hoy el brief no lo
     autoriza; por eso detuve).

Lane DETENIDO en pre-S2. Sin loops, sin reintentos.

---

## 2026-06-25 — CORRIDA AUTÓNOMA AUTORIZADA: S1 adoptado + commiteado

El nuevo brief de arranque **autoriza explícitamente** adoptar y commitear el S1
encontrado en el working tree (estado idéntico al de la corrida anterior). Se
desbloquea el lane y se ejecuta S1→S6 de corrido.

**S1 — CERRADO (commit `e644e55`).**
- Gate: `tsc --noEmit` exit 0 (sin errores; baseline `@googleapis/webmasters` NO
  apareció — árbol limpio). Lint exit 0 en los 3 archivos.
- Commit único `feat(dashboard/project): S1 — chrome/header reskin + fix EmptyState
  boundary`. Working tree limpio.
- 1 deuda fichada para S4a: `page.tsx:117-118` tiene `const tasks = project.tasks
  as any[]` con `eslint-disable`. NO se toca en S1 (unidad pre-aprobada). Se elimina
  en S4a (commit de comportamiento que reescribe ese bloque de selección): el
  `include: { tasks }` ya tipa `project.tasks`, el cast es innecesario.

### READ-FIRST consolidado (anclas reales, leídas read-only)

**Modelo `Project` (schema FROZEN, líneas 507-528):** campos directos =
`name, description, status, agreedAmount (Decimal?), monthlyRate (Decimal?),
maintenanceStartDate (DateTime?), deliveredAt (DateTime?), estimatedEndDate
(DateTime?), osLeadId, organizationId`. **NO existen** columnas `startDate` ni
`serviceType` directas.

**S4c detail-fields — mapeo a campos reales:**
- `monto/valor acordado` → `agreedAmount` (directo). ✓
- `entrega estimada` → `estimatedEndDate` (directo). ✓
- `tipo de proyecto` → **derivado** (NO columna): el admin lo deriva de
  `organization.services[0].type` (ACTIVE) o `osLead.serviceType` mapeado
  (`mapLegacyServiceTypeToPortal`). Se replica esa derivación SIN cambio de schema
  → NO es parada obligatoria (no inventa columna).
- `fecha de inicio` → **derivado** (NO columna): el admin (`page.tsx deriveStartDate`)
  toma `min(osLead.createdAt, paymentMilestones.createdAt, maintenancePayments.createdAt)`.
  Se replica igual SIN cambio de schema.
- Conclusión: los 4 campos son renderizables sin tocar schema. tipo/inicio se
  derivan (no son columnas) → se documenta; los directos van por select.

**S4a — selección actual:** la query YA es `findMany({ where: { organizationId } })`
(multi-fetch presente desde S1). Selección hoy = `projects.find(p => p.status ===
'IN_PROGRESS') ?? projects[0]` (por estado, no por param). S4a cambia a selección
por `?p=<id>` con guard `find(id) ?? fallback` (fallback = in-progress-first), id
fuera del set scopeado cae al fallback → cero leak multi-tenant.

**S6 — `deleteProjectAction` (RESUELTO, NO es parada):** hay DOS actions de borrado:
1. `admin/projects/_actions/project.actions.ts::deleteProject(input)` → `ActionResult`,
   guard `requireSuperAdmin()`, NO redirige, lo usa `projects-board.tsx:156` (lista).
2. `lib/actions/projects.ts:108::deleteProjectAction(formData)` → **la nombrada por el
   brief**: `'use server'`, guard `requireSuperAdmin()` ✓, `prisma.project.delete`
   (cascade por schema) + `revalidatePath('/admin/projects')` + **`redirect('/admin/projects')`
   server-side**. Encaja exacto con `<form action={deleteProjectAction}>` + hidden
   `projectId`. Guard SUPER_ADMIN claro + redirect limpio → S6 DESBLOQUEADO, se consume
   tal cual (no se edita).
- Placement decidido: sección "Zona de peligro" al final del Overview
  `admin/projects/[projectId]/page.tsx` (mínimo blast-radius; NO toco el `layout.tsx`
  shared header que puede estar bajo otro lane). Confirm via `OverlayModal` (mismo
  patrón destructivo que `task-list.tsx`), nuevo client island `_components/
  delete-project-button.tsx`. `useFormStatus` para pending.

**S3 — Tabs:** `ui/Tabs` (FROZEN, consumir) YA = admin: underline `bg-cyan-400`,
sizing md `px-4 py-3 text-sm`, badges de conteo. cyan-locked. → **S3 = no-op**, sin
diff; se cierra documentado (no fuerzo color).

### Gate visual (visual-qa) — INFRA AUSENTE en corrida headless

El subagente `visual-qa` depende del MCP `Claude_Preview` (preview_start/screenshot),
que NO está registrado en este entorno headless (ToolSearch → "No matching deferred
tools"; coincide con la memoria preview-mcp-untracked). Sin server :3000 ni MCP de
browser no hay screenshots automáticos. Decisión (anti-loop + alineado al brief "la
verificación visual la hace Valentino al día siguiente"): el gate VISUAL se delega a
Valentino sobre lo commiteado; el gate TÉCNICO (`tsc --noEmit` exit 0 + lint exit 0 en
archivos tocados) se aplica estricto en cada sprint. No despacho visual-qa (sin tools
sería ruido).

## S2 — Cards / lista de entregas — CERRADO

`ProjectTaskTabs.tsx` (`TaskCard` inline + banner + link). Solo tokens estáticos; el
hover NO se tocó (queda para S5), hero/tabs sin tocar.
- TaskCard tile → token admin `rounded-[24px] border border-white/10 bg-black/20`
  (antes `rounded-2xl` + borde t/l split + `bg-white/[0.02]` + `backdrop-blur-2xl
  shadow-lg`). La línea de hover (`hover:bg-white/[0.05]…translate-x-0.5`) intacta.
- Badges "Requiere aprobación"/"✓ Aprobado" → pill base admin `rounded-full border
  px-2.5 py-1 text-[11px] font-medium`, tonos admin (amber-200/emerald-200).
  Erradicado `text-[9px] font-black uppercase tracking-widest`.
- Chip de fecha → `rounded-lg border px-2.5 py-1 text-[11px] font-medium` (erradicado
  `font-black tracking-[0.15em] uppercase`); no-urgente a `border-white/10 text-zinc-400`.
- Título `font-bold`→`font-semibold`. Banner: heading `font-bold`→`font-semibold`,
  "Ver ahora" `font-black tracking-widest`→`font-semibold tracking-[0.18em]`. Link
  "Hablar con el equipo": `tracking-widest`→`tracking-[0.22em]`, zinc-600→zinc-500.
- Gate: tsc exit 0 + lint exit 0. Visual → Valentino.

## S3 — Tabs — CERRADO (no-op, sin diff)

`ui/Tabs` (FROZEN, consumir) ya = admin: underline `bg-cyan-400`, sizing md
`px-4 py-3 text-sm`, badges de conteo (`bg-cyan-500 text-zinc-950` activo). cyan-locked
→ no se fuerza color; labels/badges correctos. Sin cambios → cerrado en doc, foldeado
con S2.

## S4 — page.tsx: datos + hero (PESADO) — commits separados

### S4a — query multi + switcher — CERRADO
- READ-FIRST: la query YA era `findMany({ where: { organizationId } })` (multi-fetch).
  Selección previa = por estado (`IN_PROGRESS ?? [0]`). Ahora por searchParam `?p=<id>`
  con guard `find(id) ?? fallback` (fallback = in-progress-first). Id ajeno al set
  scopeado → fallback → cero leak multi-tenant. Nunca `findUnique({id:param})`.
- `searchParams: Promise<{ p?: string }>` (Next 16, awaited).
- Switcher: `<nav>` de pills `<Link href="?p=id">` (portal nav, sin router.push), activo
  cyan (`border-cyan-400/30 bg-cyan-400/10 text-cyan-100`), `max-w-[14rem] truncate`,
  oculto si ≤1 proyecto. 0 proyectos → empty intacto (rama previa al switcher).
- Eliminado `const tasks = project.tasks as any[]` + eslint-disable → `project.tasks` ya
  tipado por el include (CERO any; deuda de S1 saldada en este commit de comportamiento
  que reescribe el bloque de selección, no en un commit de reskin).
- Gate: tsc exit 0 + lint exit 0.

### S4b — hero reskin — CERRADO
- Card hero → token panel admin `rounded-[28px] border border-white/10 bg-white/5 p-5
  backdrop-blur-xl`. Removidos: `rounded-[2rem]` + borde t/l + `bg-[#07080a]/60` +
  `shadow-2xl backdrop-blur-3xl` + `group hover:border-cyan-500/20`, los 2 blobs cyan
  blur y el wrapper `relative z-10`.
- `AnimatedCounter` reestilado SOLO por className → `text-3xl font-semibold tracking-tight
  text-white` (erradicado `text-5xl/6xl font-black` + `drop-shadow` cyan; el drop-shadow
  vivía en MI className en page.tsx, no en el primitivo → overrideable). "%" → `text-xl
  font-semibold text-zinc-500`. Subcopy "x/y tareas" → micro-label `text-[10px] uppercase
  tracking-[0.22em] text-zinc-500`.
- Nombre proyecto `font-bold`→`font-semibold tracking-tight`; descripción zinc-500→zinc-400.
- `AnimatedProgressBar` INTACTA (cyan + spring + sweep + copy, no tocada).
- Gate: tsc exit 0 + lint exit 0.

### S4c — detail-fields read-only en el hero — CERRADO
- READ-FIRST (campos reales del modelo `Project`): `agreedAmount` (Decimal?) y
  `estimatedEndDate` (DateTime?) son **columnas directas** (ya las devolvía el query, sin
  `select` restrictivo). `tipo de proyecto` y `fecha de inicio` **NO son columnas** →
  se **derivan** igual que el admin, SIN cambio de schema (no es parada obligatoria):
  - tipo: `mapOsServiceType(osLead.serviceType) ?? organization.services[0].type` →
    label Web/AI/Automation/Software.
  - inicio: `min(osLead.createdAt, paymentMilestones.createdAt, maintenancePayments.createdAt)`.
- Query: agregados includes mínimos (`organization.services` activos take 1 `select type`,
  `osLead {serviceType,createdAt}`, `paymentMilestones {createdAt}`, `maintenancePayments
  {createdAt}`). El `where: { organizationId }` intacto → multi-tenant preservado.
- Render: grid de tiles token admin `rounded-2xl border-white/10 bg-black/20 p-4`, micro-label
  `text-[10px] uppercase tracking-[0.22em] text-zinc-500` + valor `text-white`. Fecha es-AR
  legible, monto USD como el admin. **Campo null → tile OCULTO** (sin "null"/vacío); si los
  4 son null no se renderiza el grid.
- NO hubo PARADA: ningún campo requirió columna nueva ni migración.
- Gate: tsc exit 0 + lint exit 0.

## S5 — Hover / no-regresión — CERRADO

`ProjectTaskTabs.tsx` (`TaskCard`). Importado `adminHoverCls` de `src/lib/hover.ts`
(no reescrito). Split wrapper:
- Outer NO-Framer `<div className={['grid rounded-[24px]', adminHoverCls]}>` lleva el lift
  (scale/ring/shadow + motion-reduce). Inner = `motion.div` (entrance spring intacta) con
  el tile `rounded-[24px] border-white/10 bg-black/20 ... transition-colors`.
- GOTCHA resuelto: el `hover:scale` de adminHoverCls NO pelea con el transform inline de
  Framer porque vive en el div NO-Framer. Mismo patrón que el admin (overview/task-list).
- Removida la línea de hover vieja (`hover:bg-white/[0.05] hover:border-white/15
  hover:translate-x-0.5` — esta última era un transform que Framer pisaba). `group` queda
  en el inner → el reveal de descripción y el `group-hover` del título siguen.
- `motion-reduce` preservado (viene dentro de `adminHoverCls`).
- No-regresión: aprobar/rechazar + reject-form inline (motivo obligatorio en
  `TaskApprovalButtons`, no tocado) y loading/error/empty intactos. Acentos urgente/aprobación
  (border+shadow condicionales) siguen en el inner.
- Gate: tsc exit 0 + lint exit 0.

## S6 — Eliminar dentro del detalle admin — CERRADO (sin parada)

READ-FIRST (ver READ-FIRST consolidado arriba): `deleteProjectAction(formData)` en
`lib/actions/projects.ts:108` — `'use server'`, guard `requireSuperAdmin()` claro,
`prisma.project.delete` (cascade por schema) + `revalidatePath('/admin/projects')` +
`redirect('/admin/projects')` server-side. Invocada hoy desde el board (lista) vía la OTRA
action (`_actions/project.actions.ts::deleteProject`, ActionResult, sin redirect). Para S6
se consume la NOMBRADA (`deleteProjectAction`) tal cual — guard claro + redirect limpio →
NO hubo parada obligatoria.

Implementación (adición mínima, sin refactor del resto):
- Nuevo client island `[projectId]/_components/delete-project-button.tsx`: botón destructivo
  + `OverlayModal` (consumido del patrón existente, portaleado a body) + `<form
  action={deleteProjectAction}>` con hidden `projectId` + `useFormStatus` (pending/spinner).
  El submit dispara la action y su `redirect` server-side (sin router.push).
- `[projectId]/page.tsx` (Overview): +1 import y +1 `<section>` "Zona de peligro" al final.
  NO se tocó el `layout.tsx` (header shared, posible trabajo de otro lane admin).
- Guard SUPER_ADMIN: lo enforce la action (`requireSuperAdmin`) además del shell /admin/* y
  el `callerCanAccessOrg` de la page → defensa en profundidad. No se creó action ni permiso.
- Gate: tsc exit 0 + lint exit 0 (page.tsx + delete-project-button.tsx, brackets escapados
  en el glob de eslint: `[[]projectId[]]`).

---

## LANE COMPLETO — S1→S6 cerrados, gate técnico verde en cada uno

Todos los sprints commiteados, working tree limpio, sin paradas obligatorias disparadas,
sin schema/frozen/main tocados. Verificación VISUAL pendiente de Valentino (MCP de browser
ausente en headless — ver nota arriba) sobre `/dashboard/project` (con/sin tareas, sin
proyectos, switcher, reject-form) y el detalle admin `admin/projects/[projectId]` (Zona de
peligro + confirm de borrado).

### Estado por sprint (final)
- **S1** ✅ `e644e55` — chrome/header + fix EmptyState boundary
- **S2 + S3** ✅ `92f1218` — cards reskin (+ S3 Tabs no-op)
- **S4a** ✅ `be6aa4c` — query `?p` + switcher + drop `any`
- **S4b** ✅ `e86ae3d` — hero reskin
- **S4c** ✅ `7876c02` — detail-fields read-only
- **S5** ✅ `8c71ec1` — hover adminHoverCls split
- **S6** ✅ (este commit) — eliminar en detalle admin

### Para Valentino (post-merge / verificación)
- Switcher multi-proyecto: probar con un org de >1 proyecto y un `?p=<id>` ajeno (debe caer
  al fallback, no leakear). Con 1 proyecto el switcher no se muestra.
- S4c: `Inicio` y `Tipo` son DERIVADOS (no columnas). Si se quiere otra semántica de "inicio",
  es decisión de producto (hoy = mín de createdAt de lead/hitos/mantenimiento, igual al admin).
- S6: el borrado redirige a `/admin/projects`. La action consumida usa `prisma.project.delete`
  (cascade del schema); la otra `deleteProject` (board) borra dependientes explícitos en tx —
  ambas válidas, no se unificaron (fuera de scope).

---

## 2026-06-25 — S7 (PULIDA, atendido) — 4 ajustes sobre S1–S6 ya verificados

Visual-qa: el MCP `Claude_Preview` SIGUE ausente (ToolSearch sin match) → verificación
visual a cargo de Valentino. Gate técnico (tsc+lint) estricto por commit.

### READ-FIRST (ancho — A7.1 / A7.3)
- **Ancho de `/dashboard/project`:** el shell del dashboard NO impone max-width. En
  `DashboardLayoutClient`, `<main>` es `absolute inset-0 ... p-4 sm:p-6` (sin `max-w-*`) y
  `PageTransition` es `min-h-full w-full`. El ÚNICO constraint vive LOCAL en
  `project/page.tsx`: rama poblada `max-w-5xl mx-auto`, rama empty `max-w-4xl mx-auto`. →
  Fullwidth con override local, SIN tocar shell. NO hubo parada.
- **Loading admin (A7.3):** `admin/projects/[projectId]/loading.tsx` (NO shell) envuelve en
  `mx-auto max-w-7xl`, pero el contenido real (`layout.tsx` `<section space-y-6>` + Overview
  `<div space-y-6>`) es fullwidth. Es el ÚNICO loading del segmento (no hay loading.tsx por
  tab) → cubre los 4 tabs. Constraint local en el propio loading → fix local, sin parada.

### A7.1 — Fullwidth en /dashboard/project — CERRADO
- `page.tsx` rama poblada: removido `max-w-5xl mx-auto` → usa todo el ancho del `<main>`.
  Tiles del hero (`grid-cols-2 lg:grid-cols-4`) y task-list respiran sin cap, igual que el
  detalle admin (también fullwidth).
- **Rama EMPTY (0 proyectos) se DEJÓ centrada** (`max-w-4xl mx-auto`): único mensaje centrado
  sin grids/tiles → fullwidth ahí sería "estirado feo" (guarda explícita del brief). Decisión
  de aesthetic, no de negocio; si Valentino la quiere fullwidth también, es 1 línea.
- `ProjectTaskTabs.tsx` no necesitó cambios de ancho (no tenía max-w propio).
- Gate: tsc exit 0 + lint exit 0.

### A7.2 — Banner "Ver ahora" al tab correcto (bug de lógica) — CERRADO
- Antes: `setActiveTab('IN_PROGRESS')` hardcodeado, pero la entrega pendiente de aprobación
  tiene status DONE (una tarea pasa a aprobación con status Completada) → se renderiza en
  "Completadas", no en "En curso". El banner llevaba al tab equivocado.
- Tabs por ESTADO (`useState activeTab`), no searchParam → el fix es el target del
  `setActiveTab` (sigue siendo botón, sin router.push). Se deriva `pendingApprovalTab` del
  tab que CONTIENE la tarea pendiente (`taskMap[status].some(approvalStatus ===
  'PENDING_APPROVAL')`, prioridad DONE, fallback DONE).
- dashboard-actions (aprobar/rechazar) NO tocado — solo el destino del link.
- Comportamiento, no cosmético → commit propio.
- Gate: tsc exit 0 + lint exit 0.

### A7.4 — Empty por-tab "sin tareas": doble redondeo — CERRADO
- El empty por-tab (`ProjectTaskTabs.tsx`, "Sin tareas en esta categoría", PROPIO, NO el
  `EmptyState` ui/* frozen) tenía DOS formas redondeadas anidadas con radios distintos: el
  box transparente `rounded-xl bg-white/[0.015]` + un círculo `rounded-full bg-zinc-900
  border` alrededor del ícono. Se sacó el círculo → queda UNA sola forma transparente limpia
  (box) con el ícono (size 20→28) y el texto.
- NOTA p/Valentino (preview MCP ausente, no pude ver el render): el brief describía la 2da
  capa como "tinte verde". En el CÓDIGO no hay clase verde en ese empty (el círculo era
  `bg-zinc-900`; el único verde cercano es el glow ambiente del shell `rgba(16,185,129,.05)`
  que se filtra por el box casi-transparente). Interpreté "sacá la capa/redondeo extra,
  dejá solo la transparente" = remover el círculo anidado. Si la capa que molestaba era otra,
  es 1 línea ajustar.
- Cosmético → commit propio (separado del A7.2 de comportamiento aunque ambos en el mismo file).
- Gate: tsc exit 0 + lint exit 0.

### A7.3 — Loading admin fullwidth en los 4 tabs — CERRADO
- `admin/projects/[projectId]/loading.tsx`: removido `mx-auto max-w-7xl` del wrapper →
  `flex w-full flex-col gap-6 pb-20`. El skeleton ahora espeja fullwidth el contenido real
  (que no tiene max-w). Es el ÚNICO loading del segmento → cubre Overview/Tareas/Horas/Pagos.
- El skeleton es PROPIO del detalle admin (consume `LoadingState` ui/* por `variant`, no se
  edita el primitivo). El ancho lo imponía el propio loading, NO el shell → fix local, sin parada.
- Gate: tsc exit 0 + lint exit 0 (loading.tsx).

---

## S7 COMPLETO — 4 ajustes, gate verde por commit

- **A7.1** `fe89c1b` — fullwidth /dashboard/project (empty centrado a propósito)
- **A7.2** `32caad8` — banner "Ver ahora" → tab real de la entrega pendiente (bug lógica)
- **A7.4** `0c7daed` — empty por-tab: una sola forma transparente (sacado el círculo anidado)
- **A7.3** (este commit) — loading admin fullwidth en los 4 tabs

Working tree limpio. Sin tocar shell/ui/schema/primitivos/main. Sin paradas disparadas.
Verificación visual → Valentino. Pendiente que confirme A7.4 (interpreté la "capa verde"
como el círculo anidado; preview MCP ausente).

### A7.5 — Empty por-tab: matar el bleed verde del shell — CERRADO
- CONFIRMADO el diagnóstico de A7.4: el "verde" era glow ambiente del shell filtrándose por
  el box casi-transparente, NO una clase de color del componente.
- READ-FIRST: el box tras A7.4 era `rounded-xl border border-white/5 bg-white/[0.015]` —
  `bg-white/[0.015]` (~1.5% opaco) deja pasar el `radial-gradient(... rgba(16,185,129,0.05)
  ...)` del shell (`DashboardLayoutClient`).
- FIX: fondo NEUTRO opaco on-token → `rounded-2xl border border-white/10 bg-zinc-950/70`
  (antes rounded-xl / border-white/5 / bg-white/[0.015]). zinc-950 = neutro near-black; /70
  transmite ~30% → el bleed verde (~5%) cae a ~1.5%, imperceptible. Elegí /70 (por encima del
  ej. /60 del brief) como margen, porque no puedo verificar visualmente (preview MCP ausente)
  y prefiero matarlo en un solo intento. SIN acento nuevo (zinc/black). Una forma, un radio.
- ALCANCE: solo el empty por-tab en `ProjectTaskTabs.tsx`. Shell NO tocado (de ahí viene el
  glow, pero es cross-portal). Sin parada.
- Gate: tsc exit 0 + lint exit 0.
- Si /70 quedara muy oscuro o aún se notara algo, ajuste de 1 token (subir/bajar opacidad).
