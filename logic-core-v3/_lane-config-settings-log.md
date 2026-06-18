# Lane config-settings — Sprint Log (fuente de verdad)

Rama: `lane/config-settings` · Worktree: `C:\develop-config-settings` · Proyecto: `logic-core-v3/`
Base: `src/app/(protected)/admin/settings/`
Gate: `node_modules\.bin\tsc.cmd --noEmit` (baseline exit 0) + lint limpio en archivos tocados. Verificación visual la hace Valentino.

> Nota de entorno: este worktree lane no traía `node_modules`. Se creó un **junction** a `C:\PorfolioDevelOP\logic-core-v3\node_modules` (mismo commit `3ba49df`, mismo lockfile) para poder correr el gate. node_modules es gitignored; no afecta el commit.

## Scope (exclusivo)
- `page.tsx`, `loading.tsx`, `error.tsx`
- `_components/settings-console.tsx` (723 líneas, OVERSIZE preexistente — no agravar)
- `_actions/settings.actions.ts`, `_actions/settings.schemas.ts`
- `src/lib/premium-features.ts`

## Prohibido (solo consumir)
`src/components/ui/*`, `@/lib/prisma`, `@/auth`, `@/lib/auth-guards`, `@/lib/action-utils`, `AdminErrorBoundary`, `prisma/schema.prisma`, API routes de alerts/reports.

---

## SPRINT 1 — Hover canónico en cards internas  ✅ HECHO

Subagente `Explore` mapeó el admin. Existe constante compartida **`adminHoverCls`** en `src/lib/hover.ts` (NO prohibido → se consume, no se edita). Es el estándar (dashboard stat-cards, `chart-card.tsx`, `task-list.tsx`, `admin/page.tsx`).

```
transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
hover:scale-[1.015] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]
hover:ring-1 hover:ring-white/15
motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:shadow-none
```

- **Anti-blur**: NO usa `will-change-transform` (removido en commit `c127467` justo para matar el blur del scale). Replicado exacto importando la constante (no hardcodear el string).
- GPU-only (transform/box-shadow), 200ms < 300ms, easing custom, `motion-reduce` incluido.
- Implementación: `import { adminHoverCls } from '@/lib/hover'` + aplicado con el helper local `cn()`.

### Cards a las que se aplicó el hover (old → new = + `adminHoverCls`)
| # | Card | Ubicación | Antes | Después |
|---|------|-----------|-------|---------|
| 1 | Fila de cada módulo premium | L355 | `className="rounded-[24px] … bg-black/20 p-4"` | `className={cn('rounded-[24px] … bg-black/20 p-4', adminHoverCls)}` |
| 2 | Card "Meta actual" | L463 | `bg-black/20 p-4` | `+ adminHoverCls` |
| 3 | Card "Intervalos de follow-up" | L478 | `mt-6 … bg-black/20 p-5` | `+ adminHoverCls` |
| 4 | Chips Día 2 / 4 / 7 | L485 | `rounded-full … bg-white/5 …` | `+ adminHoverCls` (flex items → blockified → scale aplica) |
| 5 | Card de cada miembro del equipo | L514 | `grid … bg-black/20 …` | `+ adminHoverCls` |
| 6 | Card "Hora del cron" | L594 | `bg-black/20 p-5` | `+ adminHoverCls` |
| 7 | `ToggleRow` (cada toggle de alerta) | L692 | `cn('flex … bg-black/20 p-4', className)` | `cn('…', adminHoverCls, className)` — 1 edición cubre los 5 toggles |

Empty-state de equipo (dashed, L528): NO recibe hover (placeholder, no es card interactiva). Decisión.

**Gate Sprint 1**: `tsc --noEmit` exit 0 (sin output) · ESLint `settings-console.tsx` exit 0.

---

## SPRINT 2 — spinners de inputs number  (pendiente)
Inputs: "Objetivo semanal de demos" (L448, vía `<Input>` compartido) + precio de módulos (L385, `<input>` nativo).
CSS localizado vía Tailwind arbitrary variants: `[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`. Sin tocar CSS global, type ni coerción.

## SPRINT 3 — checkeo + limpieza segura  (pendiente)
- Remover import muerto `PREMIUM_FEATURE_KEYS` en `settings.actions.ts` (L12) — sin uso en el cuerpo.
- Remover schema huérfano `AgencySettingsIdSchema` (`settings.schemas.ts` L25) — grep global = 0 importadores → seguro.

### Parada — DECISIÓN DE VALENTINO (no tocar, solo reportar)
- (a) `updateModulePricing`: `updateMany({ where: { slug } })` puede dar "éxito" silencioso (count 0) si `moduleKey` no matchea un slug real.
- (b) Máscara del token Telegram duplicada cliente/server: `maskFromInput` (console L58) vs `maskSecret` (actions L21).

---

## Log de ejecución
- [✅] Sprint 1 — hover canónico (commit)
- [ ] Sprint 2 — spinners
- [ ] Sprint 3 — checkeo + limpieza
