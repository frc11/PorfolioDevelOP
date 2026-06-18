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

## SPRINT 2 — spinners de inputs number  ✅ HECHO

Const DRY a nivel módulo: `NUMBER_INPUT_NO_SPINNER = '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'`. Tailwind 4 + Lightning CSS auto-prefijan `appearance`. CSS localizado al input (no global). No se tocó `type`, `min`, `step`, value ni coerción.

Verificado: el `<Input>` compartido (`@/components/ui/Input.tsx`) reenvía `className` **directo al `<input>`** (`cn(base, …, className)`), así que los selectores de pseudo-elemento matchean.

### Inputs tocados
| Input | Ubicación | Tipo | Cambio |
|-------|-----------|------|--------|
| "Objetivo semanal de demos" | `settings-console.tsx` (sección Operación comercial) | `<Input>` compartido `type="number"` | `className` → `cn(base, NUMBER_INPUT_NO_SPINNER)` |
| Precio USD de cada módulo premium | fila de módulo, `<input type="number">` nativo | nativo | `className` → `cn(base, NUMBER_INPUT_NO_SPINNER)` |

**Gate Sprint 2**: `tsc --noEmit` exit 0 · ESLint `settings-console.tsx` exit 0.

## SPRINT 3 — checkeo + limpieza segura  ✅ HECHO

### Revisión de rutina (todo OK, nada roto)
- `loading.tsx`: `<LoadingState variant="skeleton-card" />` + `skeleton-list` → estado loading presente.
- `error.tsx`: delega a `AdminErrorBoundary` (context="settings") → estado error presente.
- `page.tsx`: maneja `!settingsResult.success` (bloque de error rojo con header estático) y `!teamMembersResult.success` (warning ámbar + pasa `[]` → degradación grácil). Empty-state de equipo: "No hay miembros internos cargados.".
- Handlers `saveAllSettings` / `saveModulePricing`: `useTransition`, toasts de error/success, limpian token, usan `router.refresh()` (NO `router.push` → cumple regla). OK.

### Limpieza segura aplicada
- `settings.actions.ts`: removido import muerto `PREMIUM_FEATURE_KEYS` (sin uso en el cuerpo; grep confirmó solo la línea de import).
- `settings.schemas.ts`: removido schema huérfano `AgencySettingsIdSchema` (grep global = **0 importadores** → seguro).

**Gate Sprint 3**: `tsc --noEmit` exit 0 · ESLint `settings.actions.ts` + `settings.schemas.ts` exit 0.

### ⛔ Parada — DECISIÓN DE VALENTINO (NO tocado, solo reporte)
- **(a) `updateModulePricing` — éxito silencioso + contrato moduleKey/slug enredado.**
  `prisma.premiumModule.updateMany({ where: { slug: moduleSlug }, data })` ignora el `count` y siempre devuelve `ok(...)`. Si `moduleSlug` no matchea ninguna fila → count 0 pero "Precio actualizado" igual.
  Además hay un desfase de contrato: `getSettings` emite `moduleKey = mod.slug` (slug de DB, casteado `as PremiumFeatureKey`), pero `UpdateModulePricingSchema` valida `moduleKey` contra `PREMIUM_FEATURE_KEYS` (keys del **catálogo**, no slugs) y `updateModulePricing` re-mapea catálogo→slug vía `LEGACY_TO_SLUG`. Para módulos donde slug ≠ key de catálogo (`ecommerce`→`tienda-conectada`, `motor-resenias`→`motor-resenas`, `email-*`→`email-marketing-pro`) el cliente manda el slug de DB, que NO es key válida → puede fallar la validación ("Modulo invalido") o caer en el camino silencioso. **Es lógica de pricing/data-contract → no se toca.**
- **(b) Máscara del token Telegram duplicada cliente/server.**
  `maskFromInput` (cliente, `settings-console.tsx`) y `maskSecret` (server, `settings.actions.ts`) implementan la MISMA máscara `••••••••<last4>` por separado. Riesgo de divergencia. **No se toca (decisión de negocio/UX).**

---

## Log de ejecución
- [✅] Sprint 1 — hover canónico (commit `b1000cc`)
- [✅] Sprint 2 — spinners (commit `78e7d86`)
- [✅] Sprint 3 — checkeo + limpieza (commit)
