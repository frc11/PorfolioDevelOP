/**
 * Hover de card que contiene un chart de recharts: variante SIN scale (D3).
 *
 * El `transform: scale` de `adminHoverCls` desincroniza el tooltip de recharts
 * del cursor (recharts posiciona el tooltip con coordenadas del contenedor).
 * Por eso esta variante deja sólo ring + shadow. Es el espejo del const local de
 * `LatencyChart.tsx` (admin, frozen); se define LOCAL en el lane y NO se sube a
 * `lib/hover.ts` (compartido) — subirla sería un follow-up aditivo fuera de scope.
 */
export const chartCardHoverCls =
  'transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:transition-none motion-reduce:hover:shadow-none'
