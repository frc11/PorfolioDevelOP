# Changelog — Inicio (Portal Cliente)

> Sección `/dashboard` (índice del portal cliente). Rediseño **visual** a paridad
> con el admin; la sección ya andaba end-to-end (no fue reconstrucción).
> Estado: **cerrada en `lane/inicio`, pendiente de merge a `main`.**

---

## Qué se hizo

### S1 — OnboardingStatusCard: glass inline → tokens canon + hover
`2725caf` (+ fix glass `b811c17`) · `src/components/dashboard/OnboardingStatusCard.tsx`

- Se reemplazó el `style={{ background, backdropFilter, border, borderRadius }}` inline
  por className con tokens del sistema: `rounded-[24px] border border-cyan-500/[0.12]
  bg-cyan-500/[0.04]` (conserva el acento cyan de la card de onboarding).
- Se sumó hover **CSS puro** vía `adminHoverCls` (es server component, sin Framer):
  scale 1.015 + ring-white/15 + shadow, motion-reduce-safe.
- Eyebrow: `tracking-[0.2em]` → `tracking-[0.24em]` (canon).
- **Fix final del glass (`b811c17`):** el refactor inicial había puesto `backdrop-blur-xl`
  (24px) y **dropeado el `saturate(180%)`** del inline original. Se restauró el recipe
  canónico **`backdrop-blur-[20px] backdrop-saturate-[180%]`**.
- NO se tocó: query Prisma, lógica de tareas, copy, link, los `return null`.

### S2 — AttentionStack: hover paridad admin (split-wrapper)
`6e19f7e` · `src/components/dashboard/home/AttentionStack.tsx`

- Cada ítem de "Atención hoy" pasó de `hover:scale-[1.005]` a **`adminHoverCls`**
  (scale 1.015 + ring + shadow).
- **Patrón split-wrapper:** el hover vive en un `<div>` externo NO-Framer
  (`cn('grid rounded-2xl', adminHoverCls)`) con el `motion.div` adentro. **Por qué:**
  aplicar `hover:scale` CSS directo sobre un `motion.div` no se percibe — el `transform`
  de Framer (animación de entrada) lo pisa. `rounded-2xl` matchea la Card para que el
  ring/shadow sigan el radio real.
- Preservado: animación de entrada, prioridad/orden, colores por severidad, link CTA,
  `group-hover` de la flecha, `return null` si no hay ítems.

### S3a — WeekResultsGrid: hover split-wrapper + eyebrow canon
`f9eb475` · `src/components/dashboard/home/WeekResultsGrid.tsx`

- Las 4 cards (Visitas / Leads / Respondidos / Completadas) ganaron hover vía el mismo
  split-wrapper (antes estaban planas, sin hover).
- Eyebrow de sección: removido `font-bold` → canon `text-[10px] uppercase
  tracking-[0.24em] text-zinc-500`. Se mantuvo el eyebrow (no se migró al SectionHeader
  h3 del admin).

### S3b — WeekResultsGrid: señales honestas (presentación)
`b735b3f` · `src/components/dashboard/home/WeekResultsGrid.tsx`

- Vía el prop `caption` del `Stat` (ui), **sin tocar datos**:
  - **Visitas**: cuando el valor es `'—'` (sin GA4) → caption **"Sin integración aún"**.
  - **Leads**: caption neutro **"En calibración"** — no revela que el conteo es
    agency-wide (`ContactSubmission` sin `organizationId`); es un hedge, no el anuncio
    del leak.
- `h-full` en las Card: con caption solo en 2 de 4, iguala altura por fila para que el
  ring/shadow del hover siga el borde real de cada card y no flote.
- Deltas verificados como cálculo real week-over-week (`calcTrend`); ninguno hardcodeado
  → se dejaron como están.

### S4 — HealthScore: TrendChip ocultado (Opción B)
`7777cdc` · `src/components/dashboard/home/HealthScore.tsx`

- `computeTrend()` (en `lib/health-score.ts`) es un **hash del orgId** presentado como
  "+N esta semana" — dato FALSO. Se **ocultó** el `<TrendChip />` (existía solo en el
  estado activo PARTIAL/COMPLETE; el estado ONBOARDING nunca lo tuvo).
- **Opción B**, decisión cerrada: NO se tocó `lib/health-score.ts` (eso era Opción A,
  flag `isFake`, descartada). Solo se suprimió el render.
- Limpieza de imports sin uso (`ArrowUp`, `ArrowDown`, `Minus`) y de la función
  `TrendChip` (queda en git para revivir con history real). Sin hueco/borde: el header
  `flex` con un solo hijo no deja gap.

### S4b — scoreToSubtitle: sin coletilla de tendencia falsa
`8c7f12b` · `src/components/dashboard/home/HealthScore.tsx`

- El subtítulo del hero también usaba el trend falso (`scoreToSubtitle(data.total,
  data.trend.value)`) para generar prosa ("Subió/Sube/Estable… esta semana").
- Se removió la coletilla de tendencia (5 ramas) y el parámetro `trend`; quedan solo las
  frases reales basadas en el score (`data.total`). Tras S4b, `data.trend` ya no se
  consume en el componente.
- Estados: ONBOARDING NO usa `scoreToSubtitle` (copy propio, intacto); PARTIAL y COMPLETE
  quedan con la frase de score sola.

### S5 — Full-width + sweep cosmético
`7b8aa4f` · `src/app/(protected)/dashboard/page.tsx`, `…/loading.tsx`,
`src/components/dashboard/home/AttentionStack.tsx`

- **Full-width:** se quitó el cap `max-w-7xl` del container raíz → `w-full` (paridad con
  cuenta/plan/project/resultados; el `<main>` del shell ya da el padding lateral).
  `loading.tsx` alineado para que el skeleton no salte de ancho al cargar.
- **Sweep cosmético** en `AttentionStack`: eyebrow sin `font-bold`; `strokeWidth={1.5}`
  en el Icon de severidad (era 1.75) y en los dos `ArrowRight`.
- Nota: no quedó `font-black`/`font-mono` para purgar en los componentes NO-frozen — el
  `font-black` del hero `HealthScore` es intencional y FROZEN; el eyebrow de WeekResults
  ya había quedado canon en S3a.

---

## Decisiones cerradas

- **TrendChip → Opción B (ocultar)** sobre Opción A (flag `isFake` en la lib). El dato es
  falso (hash del orgId); la presentación honesta es no mostrarlo. Tocar la lib para
  marcarlo agregaba superficie en datos sin beneficio visual. Se revive cuando exista
  history real (HealthScoreSnapshot, lane de datos aparte).
- **Subtítulo del hero (S4b)**: misma lógica — se sacó la prosa de tendencia falsa, se
  conservaron las frases de score reales (`data.total`).
- **Glass del onboarding**: recipe canónico **`backdrop-blur-[20px]
  backdrop-saturate-[180%]`** (se restauró el `saturate` perdido en el refactor inicial).
- **HealthScore (hero de anillos): FROZEN** para este lane. El gradiente custom es la firma
  del hero; queda fuera del reskin de hover/eyebrow. Solo se le tocó la **honestidad de
  datos** (TrendChip + subtítulo).
- **UsageMeter**: consumido, **NO tocado** (es de `lane/plan`, ya mergeado). Inicio solo le
  pasa el `snapshot` (con el hint de upgrade visible, intencional en el Home).
- **Eyebrow del onboarding**: se dejó `font-semibold` + cyan (acento intencional de la card).

---

## Seed de prueba (Matsu)

Helpers de QA visual — **INSERT-only**, idempotentes (clean-then-reinsert), guard
`assertDevSeedTarget` (aborta si el destino no es la Neon dev/local), org por slug `matsu`
(aborta sin escribir si no existe), `--clean` revierte solo lo marcado. **Los corre
Valentino, no Claude Code.**

- `scripts/seed-matsu-onboarding.ts` — 3 `OnboardingTask` (2 PENDING + 1 IN_PROGRESS) para
  que renderice el `OnboardingStatusCard`. Marcador `[seed:lane-inicio-onboarding]` en
  `internalNotes` (admin-only, no se ve en la card). `sortOrder = max(real)+1` (no colisiona
  con el `@@unique([organizationId, sortOrder])`).
- `scripts/seed-matsu-week-results.ts` — Message `fromAdmin` (8 esta semana + 5 la anterior →
  "Respondidos" 8, ↑60%) + Task `DONE` bajo el primer proyecto de matsu (→ "Completadas" 4).
  Marcador en `content`/`description`. **NO toca `ContactSubmission`** (tabla global → "Leads"
  queda con su número + caption "En calibración"). ⚠️ `getWeekResults` cachea 30 min
  (`unstable_cache`) → **reiniciar el dev server** tras correr para ver los números.

**Nota operativa:** correr con **`npx tsx`**, NO `ts-node`. En Node 24 ts-node corre el `.ts`
como ESM y no resuelve el import relativo sin extensión `../prisma/seed-guard`; `tsx` sí lo
resuelve (y `npx` lo baja al cache aunque no esté en devDependencies).

---

## PENDIENTES / deuda de datos (fichada, NO se tocó en este lane)

Todo lo de abajo es **datos/schema**, no presentación → lane aparte. En este lane solo se
les puso rótulo honesto.

- **Hero "CALIBRANDO" vs Brief IA "Health Score a 84":** dos fuentes de score distintas
  (onboarding por integraciones conectadas vs health-score 0-100). Incoherencia de
  lógica/datos, no visual.
- **Leads/conversión agency-wide:** `contactSubmission.count` SIN `organizationId`
  (`week-results.ts`, y `computeLeadsScore` del HealthScore) → número y delta incluyen leads
  de otros tenants. Mitigado visual con "En calibración"; fix real = scopear por
  `organizationId` (schema + query).
- **Visitas hardcodeadas en 0:** `Promise.resolve(0)` en `week-results.ts` (sin GA4
  cableado). Rotulado honesto "Sin integración aún"; fix real cablea GA4 y toca la lib frozen.
- **Centinela `↑100%` desde semana-previa-0:** `calcTrend(current, 0) → 100`. Correcto/
  computado pero ambiguo a la lectura ("la semana pasada hubo 0", no +100% real); cambiarlo a
  un rótulo tipo "nuevo" tocaría `calcTrend` en `lib/dashboard/*` (FROZEN). Parada de datos.

---

## Archivos tocados

**Fuente (6):**
- `src/app/(protected)/dashboard/page.tsx`
- `src/app/(protected)/dashboard/loading.tsx`
- `src/components/dashboard/OnboardingStatusCard.tsx`
- `src/components/dashboard/home/AttentionStack.tsx`
- `src/components/dashboard/home/WeekResultsGrid.tsx`
- `src/components/dashboard/home/HealthScore.tsx`

**Docs (2):**
- `docs/client-portal/lane-inicio-explore.md` (relevamiento read-only previo)
- `docs/client-portal/lane-inicio-sprint-log.md` (log de sprints + review)

**Seeds de QA (2):**
- `scripts/seed-matsu-onboarding.ts`
- `scripts/seed-matsu-week-results.ts`

---

## Gate

- `.\node_modules\.bin\tsc.cmd --noEmit` (solo, sin encadenar) + `eslint` en los archivos
  tocados → **exit 0 por sprint**.
- Visual verificado por **Valentino en `:3000`** (desktop + mobile) — **no auto-confirmado
  por compilación** (verde ≠ se ve).
- Review adversarial read-only (3 reviewers, workflow `wlvi9iu9w`) sobre `f42218a..HEAD`:
  **sin blockers**. Confirmado: **ningún frozen tocado** (`ui/*`, `UsageMeter`,
  `lib/health-score.ts`, `lib/dashboard/*`, `schema.prisma`; `HealthScore` solo
  chip + subtítulo, rings/score/mini-cards/gradiente intactos), **cero `any`** introducido,
  **multi-tenant intacto** (`resolveOrgId` por sesión, sin params de tenant por URL).

---

## Lecciones

- **Split-wrapper para hover sobre `motion.div`:** el hover CSS va en un div externo
  NO-Framer; el `motion.div` adentro. Scale CSS sobre el propio `motion.div` no se ve
  (compila, pero el `transform` de Framer lo pisa).
- **Honestidad de datos ≠ tocar la lib:** ocultar/neutralizar en el componente (TrendChip,
  subtítulo, captions) es presentación; el fix real de los datos es un lane aparte. El caption
  honesto ("En calibración", "Sin integración aún") **no debe revelar el leak** (nada de
  "sistema"/"global").
- **Refactor inline→Tailwind puede perder fidelidad:** `backdrop-blur-xl` ≠ el recipe
  `backdrop-blur-[20px] backdrop-saturate-[180%]`; se perdió el `saturate` hasta el fix final.
- **Runner de seeds en Node 24:** `tsx`, no `ts-node` (ESM + import relativo sin extensión).
