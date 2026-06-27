'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { MonthPoint } from '@/modules/chatbot/lib/monthly-analysis'
import {
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  chartCursorFill,
  useReducedMotion,
} from '@/components/dashboard/results/_shared/chartTheme'

/**
 * P0.2 — Barras sobrias de conversaciones por mes, alineadas a los charts del
 * admin (grid tenue, ejes apagados, tooltip glass). El último mes (en curso) se
 * destaca con cyan pleno; los anteriores van apagados para dar contexto.
 */

/** Shape mínimo que recharts inyecta al content del Tooltip — tipado propio
 *  (la firma de `TooltipProps` cambió en recharts 3 y no expone `payload`). */
interface ChartTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ payload: MonthPoint }>
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(9,9,11,0.95)] px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">{point.label}</p>
      <p className="text-sm font-medium text-zinc-100">
        {point.count.toLocaleString('es-AR')}{' '}
        <span className="text-[11px] font-normal text-zinc-400">
          {point.count === 1 ? 'persona atendida' : 'personas atendidas'}
        </span>
      </p>
    </div>
  )
}

export function MonthlyConversationsChart({ points }: { points: MonthPoint[] }) {
  const reduced = useReducedMotion()
  const lastKey = points[points.length - 1]?.key

  return (
    <div
      className="h-48"
      role="img"
      aria-label="Conversaciones por mes — personas atendidas por tu asistente"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="convBarCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.45} />
            </linearGradient>
            <linearGradient id="convBarPast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="label"
            stroke={CHART_AXIS_STROKE}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            stroke={CHART_AXIS_STROKE}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={chartCursorFill} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32} isAnimationActive={!reduced}>
            {points.map((point) => (
              <Cell
                key={point.key}
                fill={point.key === lastKey ? 'url(#convBarCurrent)' : 'url(#convBarPast)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
