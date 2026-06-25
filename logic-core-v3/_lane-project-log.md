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

### Estado por sprint
- **S1** ✅ commit `e644e55`
- **S2** ⏳ en curso
