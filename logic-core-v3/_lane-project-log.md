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
