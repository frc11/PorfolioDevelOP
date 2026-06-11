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

/**
 * P0.2 — Barras sobrias de conversaciones por mes. Mismo lenguaje visual que
 * SessionsChart (cyan develOP, grid tenue, tooltip glass) pero en barras:
 * la serie es mensual (3-6 puntos), no diaria. El último mes (en curso) se
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
    <div className="rounded-xl border border-cyan-500/30 bg-[#0c0e12]/90 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {point.label}
      </p>
      <p className="text-sm font-black text-white">
        {point.count.toLocaleString('es-AR')}{' '}
        <span className="text-[10px] font-bold uppercase text-zinc-400">
          {point.count === 1 ? 'persona atendida' : 'personas atendidas'}
        </span>
      </p>
    </div>
  )
}

export function MonthlyConversationsChart({ points }: { points: MonthPoint[] }) {
  const lastKey = points[points.length - 1]?.key

  return (
    <ResponsiveContainer width="100%" height={180}>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.05} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fill: '#71717a', fontWeight: 'bold' }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 8, fill: '#71717a', fontWeight: 'bold' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(6,182,212,0.06)' }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {points.map((point) => (
            <Cell
              key={point.key}
              fill={point.key === lastKey ? 'url(#convBarCurrent)' : 'url(#convBarPast)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
