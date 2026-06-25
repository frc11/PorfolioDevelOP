# lane/plan — Log de trabajo

**Módulo:** "Mi plan" del cliente (`/dashboard/plan`). **Tipo:** rediseño VISUAL (no construcción). **Stack:** Next 16 / TS strict / Tailwind 4.
**Objetivo:** que la sección se vea **idéntica al ADMIN** (mismo chrome/tokens/cards/hover/spacing), anclando cada pieza a una referencia admin concreta. La sección ya anda end-to-end; solo se reskinea.

> Plan completo (aprobado): `C:\Users\Valentino\.claude\plans\lane-mi-plan-dashboard-plan-hidden-tide.md`. Este `.md` es el **source of truth** del avance.

## Scope (único universo editable) — archivos reales bajo `logic-core-v3/`
- `logic-core-v3/src/app/(protected)/dashboard/plan/page.tsx`
- `logic-core-v3/src/app/(protected)/dashboard/plan/loading.tsx`
- `logic-core-v3/src/components/dashboard/plan/UsageMeter.tsx`
- `logic-core-v3/src/components/dashboard/plan/PlansShowcase.tsx`
- `logic-core-v3/src/components/dashboard/plan/UpgradeCtaButton.tsx`

**PROHIBIDO (frozen / solo lectura):** `lib/plan/*`, `lib/actions/upsell.ts`, `src/components/ui/*` (PageHeader, LoadingState, Button…), `AnimatedCounter`/`AnimatedProgressBar`/`FadeIn`/`StaggerWrapper`/`lib/preview`, todo el chrome admin (`AdminLayoutClient`, settings/clients — solo referencia de paridad), `prisma/schema.prisma`, `auth`, `HeroArtifact`, contexts.

## Decisiones locked (Valentino)
- **Superficie = frosted admin** (`bg-white/5` top, `bg-black/20` sub-cards) — igual a `admin/settings`.
- **Estado vacío dedicado** cuando `hasBotConfigured === false` (hoy el campo llega pero `UsageMeter` lo ignora).
- Downgrade NO lleva confirmación (Link no destructivo). Plan máximo ya resuelto (Crown). Hover del meter **sin scale** (la barra no debe desplazarse).

## Anclas admin → pieza
| Pieza | Token a aplicar |
|---|---|
| Card top (meter, tier) | `rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl` (settings GlassCard) |
| Sub-cards (mensaje, teaser, footer) | `rounded-[24px] border border-white/10 bg-black/20 p-4` |
| Hover tier cards | `adminHoverCls` de `@/lib/hover` (scale 1.015 + ring + shadow) |
| Hover meter card | sin scale: `transition-colors hover:border-white/20` (barra inmóvil) |
| Barra de uso | se mantiene inline tono-aware (NO adoptar `AnimatedProgressBar`: trae copy de proyecto + cyan fijo) |
| Contador | se mantiene `formatNumberEs` (NO `AnimatedCounter`: rompe formato es-AR) |

## Gate por sprint (SIN `npm run build`)
El build está **ROJO por baseline ajeno** (`@googleapis/webmasters` faltante + `react-hooks/set-state-in-effect` en `PreloaderContext`). Gate real:
1. `.\node_modules\.bin\tsc.cmd --noEmit` corrido **solo** (PowerShell, sin `;`/`&&`) → sin errores **nuevos**. (No `npx tsc`.)
2. **lint limpio solo en los archivos tocados.**
3. `visual-qa` desktop + mobile (reposo + no-regresión). El padre espera el reporte; ❌/❓ no cierran el sprint. Coreografía/efectos los verifica Valentino por grabación.

**Commits:** commit por sprint SIEMPRE. Los fixes de **comportamiento** van en commit PROPIO, separado del reskin cosmético (revertibilidad; visual-qa no cubre comportamiento). `/compact` en cortes; `/clear` recién al cerrar la feature.

## Findings out-of-scope (registrados, NO se tocan en este lane)
- `getOrgUsageSnapshot` se llama 2× (1 por Suspense) → costo del streaming independiente; `lib/plan` frozen.
- `costUsd` no existe en el snapshot (no se muestra costo al cliente — correcto).
- **`/dashboard/plan` NO tiene `error.tsx`** → no se construye acá (rediseño visual, no construcción). **PENDIENTE para un lane futuro.** `loading.tsx` + estado vacío sí se cubren.

---

## Sprint log

| # | Archivo | Cambio | Commits | tsc | lint | visual-qa | Estado |
|---|---|---|---|---|---|---|---|
| 1 | `UsageMeter.tsx` | reskin frosted + estado vacío | `bedbda8` reskin · `40c37a7` empty-state | ✅ 0 | ✅ | ⏸ humano | code OK, esperando verif. visual |
| 2 | `PlansShowcase.tsx` | reskin tier cards + adminHoverCls | 1 (cosmético) | — | — | — | pendiente |
| 3 | `UpgradeCtaButton.tsx` | spinner pending visible | 1 | — | — | — | pendiente |
| 4 | `loading.tsx` | fix max-w-7xl + formas nuevas | 1 | — | — | — | pendiente |
| 5 | `page.tsx` | alinear skeletons de Suspense | 1 | — | — | — | pendiente |

> Se actualiza al cerrar cada sprint (commit hash + resultado de gates).

### Notas de ejecución
- **visual-qa NO corre automáticamente** en esta sesión: el preview/browser MCP está **ausente** (`ToolSearch` no encuentra `mcp__Claude_Preview__*`) y las rutas tienen auth-wall de cliente. `:3000` está arriba (HMR toma los cambios) → la verificación visual la hace Valentino por grabación contra `:3000`.
- **Blast radius `UsageMeter`:** se monta en `/dashboard/plan` (con `hideUpgradeHint`) **y** en `/dashboard` (home, sin `hideUpgradeHint`). El reskin + el estado vacío propagan a ambas (componente compartido, DRY-correcto). Verif. visual debe cubrir las 2 rutas.
