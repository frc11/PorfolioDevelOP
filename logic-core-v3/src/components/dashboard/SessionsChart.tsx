'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  chartCursorLine,
  useReducedMotion,
} from '@/components/dashboard/results/_shared/chartTheme'

interface DataPoint {
  date: string
  sessions: number
}

interface SessionsChartProps {
  data: DataPoint[]
}

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

/** Shape mínimo que recharts inyecta al content del Tooltip — tipado propio
 *  (la firma de `TooltipProps` cambió en recharts 3 y no expone `payload`). */
interface SessionsTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ value: number; payload: DataPoint }>
  label?: string
}

function CustomTooltip({ active, payload, label }: SessionsTooltipProps) {
  if (active && payload && payload.length && label) {
    return (
      <div className="rounded-xl border border-white/10 bg-[rgba(9,9,11,0.95)] px-3 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          {new Date(label).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <p className="text-sm font-medium text-zinc-100">
          {payload[0].value}{' '}
          <span className="text-[11px] font-normal text-zinc-400">Visitas</span>
        </p>
      </div>
    )
  }
  return null
}

export function SessionsChart({ data }: SessionsChartProps) {
  const reduced = useReducedMotion()

  return (
    <div className="h-48" role="img" aria-label="Sesiones diarias — últimos 30 días">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="45%" stopColor="#06b6d4" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={CHART_AXIS_STROKE}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            dy={10}
          />
          <YAxis
            stroke={CHART_AXIS_STROKE}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={chartCursorLine} />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#sessionsGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={!reduced}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
