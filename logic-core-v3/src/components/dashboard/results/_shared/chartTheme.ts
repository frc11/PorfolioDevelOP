import type { CSSProperties } from 'react'

/**
 * Tokens compartidos de recharts para Resultados, extraídos de los charts del
 * admin que ya funcionan (`LatencyChart`, `ActivityChart`). Centraliza el tooltip
 * glass oscuro, los tokens de ejes/grid y el helper de reduced-motion para que
 * todos los charts del lane se vean idénticos al admin.
 *
 * Uso de reduced-motion en cada serie:
 *   const reduced = useReducedMotion()
 *   <Bar isAnimationActive={!reduced} ... />
 */
export { useReducedMotion } from '@/lib/use-reduced-motion'

/** Tooltip glass oscuro del admin. */
export const chartTooltipContentStyle: CSSProperties = {
  backgroundColor: 'rgba(9, 9, 11, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#e4e4e7',
  fontSize: '12px',
}

/** Grid canon: punteado, sólo horizontal, muy tenue. */
export const CHART_GRID_STROKE = 'rgba(255,255,255,0.05)'

/** Ejes canon: stroke tenue + ticks chicos apagados, sin axis/tick line. */
export const CHART_AXIS_STROKE = 'rgba(255,255,255,0.3)'
export const CHART_AXIS_TICK = { fontSize: 10, fill: 'rgba(255,255,255,0.4)' } as const

/** Cursores canon: línea cyan para line/area, fill cyan tenue para barras. */
export const chartCursorLine = { stroke: 'rgba(6, 182, 212, 0.3)' } as const
export const chartCursorFill = { fill: 'rgba(6, 182, 212, 0.06)' } as const
