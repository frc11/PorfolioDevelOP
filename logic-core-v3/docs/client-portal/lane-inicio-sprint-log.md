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
**Estado:** ⏳ EN CURSO — esperando OK visual de Valentino

Cambios:
- `style={{ background, backdropFilter, border, borderRadius }}` inline → className con tokens:
  `rounded-[24px] border border-cyan-500/[0.12] bg-cyan-500/[0.04] backdrop-blur-xl` (conserva tono cyan).
- Hover CSS puro (server component, sin FM): `adminHoverCls` aplicado al div de la card.
- Eyebrow: tracking-[0.2em] → tracking-[0.24em] (canon), conserva tinte cyan.
- ArrowRight ya tenía strokeWidth={1.5}; íconos de categoría son emoji (no Lucide). Sin font-black presente.

NO tocado: query Prisma, lógica de tareas, copy, link, returns null (empty preservado).

Gate: _pendiente_
Commit: _pendiente_

---
