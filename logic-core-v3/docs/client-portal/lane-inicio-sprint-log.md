# Lane Inicio — Log de sprints

Worktree: `C:\lane-inicio\logic-core-v3\` · Branch: `lane/inicio`
Fuente de verdad del relevamiento: [lane-inicio-explore.md](./lane-inicio-explore.md)

Gate por sprint: `.\node_modules\.bin\tsc.cmd --noEmit` (solo, sin encadenar) sin errores NUEVOS
+ lint limpio en archivos tocados + COMMIT. Visual lo verifica Valentino en :3000 (desktop+mobile).
Baseline tsc a ignorar: `@googleapis/webmasters` faltante, `react-hooks/set-state-in-effect` en PreloaderContext.

Canon (verificado en código, no inventado):
- `adminHoverCls` / `adminHoverAmplifiedCls` desde `@/lib/hover` (string CSS, sin rounded/grid).
- Split-wrapper: hover en `<div className={cn('grid', adminHoverCls, 'rounded-X')}>`, motion.div/Card adentro.
- `Stat` (ui/) tiene `caption` → subtext honesto nativo.
- `formatNumberEs` en `@/lib/plan/plan-presentation`.

---

## S1 — OnboardingStatusCard: glass inline → tokens + hover

**Archivo:** `src/components/dashboard/OnboardingStatusCard.tsx` (server component)
**Estado:** ✅ código commiteado (`2725caf`) · gate verde · ⏳ esperando OK visual de Valentino en :3000

Cambios:
- `style={{ background, backdropFilter, border, borderRadius }}` inline → className con tokens:
  `rounded-[24px] border border-cyan-500/[0.12] bg-cyan-500/[0.04] backdrop-blur-xl` (conserva tono cyan).
- Hover CSS puro (server component, sin FM): `adminHoverCls` aplicado al div de la card.
- Eyebrow: tracking-[0.2em] → tracking-[0.24em] (canon), conserva tinte cyan.
- ArrowRight ya tenía strokeWidth={1.5}; íconos de categoría son emoji (no Lucide). Sin font-black presente.

NO tocado: query Prisma, lógica de tareas, copy, link, returns null (empty preservado).

Gate: tsc `--noEmit` exit 0 (limpio, sin baseline tampoco) · eslint archivo tocado exit 0
Commit: `2725caf`

### Helper de QA (no es parte del commit S1)
`scripts/seed-matsu-onboarding.ts` — deja a Matsu con onboarding incompleto (3 tareas
marcadas, 2 PENDING + 1 IN_PROGRESS) para que la card renderice. INSERT-only, guard
`assertDevSeedTarget`, slug `matsu`, marcador en `internalNotes`, `--clean` revierte solo
lo marcado. NO toca tareas reales/otras orgs/schema/drift Franco. Validado: tsc standalone
exit 0 (scripts/** está excluido del tsconfig del proyecto), eslint exit 0. **Sin commitear
y sin ejecutar** — lo corre Valentino. Guard confirmado contra `.env.local` (host
`ep-quiet-waterfall-acv0fpll` = Neon dev). Run: `npx tsx scripts/seed-matsu-onboarding.ts [--clean]`
desde logic-core-v3/. (Runner = **tsx**, NO ts-node: en Node 24 ts-node corre como ESM y no
resuelve el import relativo sin extensión de `../prisma/seed-guard`.)

---

## S2 — AttentionStack: hover paridad (split-wrapper)

**Archivo:** `src/components/dashboard/home/AttentionStack.tsx` ('use client', motion.div)
**Estado:** ✅ código commiteado (`6e19f7e`) · gate verde · ⏳ esperando OK visual de Valentino en :3000

Cambios:
- Cada ítem: `hover:scale-[1.005]` (en la Card) → `adminHoverCls` (scale 1.015 + ring-white/15
  + shadow, motion-reduce-safe).
- **Split-wrapper**: hover en un `<div className={cn('grid rounded-2xl', adminHoverCls)}>` externo
  NO-Framer; el `motion.div` queda adentro (su transform de entrada pisaría un scale CSS aplicado
  sobre él). `rounded-2xl` matchea la Card → ring/shadow siguen el radio.
- `key` movida al div externo. Removido `hover:scale-[1.005]` de la Card.

NO tocado: queries/datos, lógica de armado, severidades/colores, link CTA, `group-hover` del arrow,
`return null` si no hay ítems. strokeWidth de íconos se deja para el sweep S5.

Gate: tsc `--noEmit` exit 0 · eslint archivo tocado exit 0
Commit: `6e19f7e`

---

## S3a — WeekResultsGrid: hover (mecánico) + eyebrow canon

**Archivo:** `src/components/dashboard/home/WeekResultsGrid.tsx` ('use client', motion.div)
**Estado:** ✅ código commiteado (`f9eb475`) · gate verde · ⏳ esperando OK visual de Valentino en :3000

Cambios:
- Cada card gana hover vía **split-wrapper** (`<div className={cn('grid rounded-2xl', adminHoverCls)}>`
  externo, `motion.div` adentro). Antes estaban planas, sin hover. `rounded-2xl` matchea la Card default.
- `key` movida al div externo.
- Label de sección: removido `font-bold` → eyebrow canon (`text-[10px] uppercase tracking-[0.24em]
  text-zinc-500`). Se mantiene el eyebrow, NO se migra al SectionHeader h3 del admin.

NO tocado: queries/datos (`week-results.ts`), `Stat`/`Card` (ui frozen), trend, animación de entrada.
Señales honestas de visits/leads → **S3b**.

Gate: tsc `--noEmit` exit 0 · eslint archivo tocado exit 0
Commit: `f9eb475`

---

## S3b — WeekResultsGrid: señales honestas (presentación)

**Archivo:** `src/components/dashboard/home/WeekResultsGrid.tsx` (solo render)
**Estado:** ✅ código commiteado (`b735b3f`) · gate verde · ⏳ esperando OK visual de Valentino en :3000

Análisis previo (requerido por el sprint):
- **Deltas reales**: `calcTrend()` en `week-results.ts` calcula week-over-week real; ninguno hardcodeado.
  visits = `0/0` → `null` (no muestra delta). leads = real pero sobre conteo agency-wide. msgs/tasks =
  reales org-scoped. → Se dejan (no hay delta fake que flaggear).
- `Stat` (ui/) tiene prop **`caption`** (`text-[10px] text-zinc-600`) → se usa, sin hand-roll.

Cambios (SOLO presentación):
- **visits**: cuando `value === '—'` (sin GA4) → caption "Sin integración aún".
- **leads**: caption neutro **"En calibración"** (no revela que es agency-wide; alinea con el "Calibrando"
  del HealthScore). _Wording elegido por mí; alternativa ofrecida: "Estimado"._
- `h-full` en las Card: con caption solo en 2 de 4, iguala altura por fila (grid stretch) para que el
  ring/shadow del hover siga el borde real de cada card y no flote.

NO tocado: `week-results.ts`, queries, `Stat`/`Card` (ui frozen), trend, animación de entrada.

Gate: tsc `--noEmit` exit 0 · eslint archivo tocado exit 0
Commit: `b735b3f`

---

## S4 — HealthScore: ocultar TrendChip (Opción B)

**Archivo:** `src/components/dashboard/home/HealthScore.tsx`
**Estado:** ✅ código commiteado (`7777cdc`) · gate verde · ⏳ esperando OK visual de Valentino en :3000

Cambios (solo presentación, dentro del componente; lib NO tocada):
- Removido `<TrendChip value={data.trend.value} />` del header (breadcrumb comment en su lugar).
- Removida la función `TrendChip` (código en git para revivir cuando haya history real).
- Limpiados imports sin uso: `ArrowUp`, `ArrowDown`, `Minus` (queda `Sparkles`).

NO tocado: `lib/health-score.ts` (`computeTrend` sigue devolviendo trend; el componente lo ignora
para el chip), gradiente/anillos del hero.

### ⚠️ PENDIENTE/PARADA fichado (decisión de copy, NO implementado)
`scoreToSubtitle(data.total, data.trend.value)` (HealthScore.tsx) sigue usando el **mismo trend falso**
para generar prosa: "Subió fuerte esta semana" / "Sube esta semana" / "Estable esta semana" / etc.
Ocultar el chip NO resuelve esto — el subtítulo presenta el dato falso en palabras. Es cambio de
**copy** → requiere OK de Valentino. Opciones: (a) sacar la parte de trend del subtítulo (quedaría
"Estás por encima del promedio." sin la coletilla semanal); (b) dejarlo hasta el lane de datos.
También latente: `rounded-3xl` del hero (alineación opcional a `rounded-[28px]`, no tocada).

Gate: tsc `--noEmit` exit 0 · eslint archivo tocado exit 0
Commit: `7777cdc`

---

### Helper de QA (no commiteado)
`scripts/seed-matsu-week-results.ts` — da números realistas al grid: Message fromAdmin
(8 esta semana + 5 anterior → "Respondidos" 8, ↑60%) + Task DONE bajo el primer proyecto
de matsu (→ "Completadas" 4, ↑100%). INSERT-only org-scoped, marcador en `content`/`description`,
`--clean` revierte solo lo marcado. NO toca ContactSubmission (global → "Leads" queda con su
número + caption "En calibración") ni visits (hardcoded → '—' + "Sin integración aún").
⚠️ `getWeekResults` cachea 30 min (unstable_cache) → **reiniciar dev server** tras correr.
Validado: tsc standalone exit 0, eslint exit 0. **Sin commitear** — lo corre Valentino.
Run: `npx tsx scripts/seed-matsu-week-results.ts [--clean]` (runner = **tsx**, NO ts-node).

---
