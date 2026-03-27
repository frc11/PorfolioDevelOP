'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'

interface DataPoint {
  date: string
  success: number
  failed: number
}

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl"
      style={{
        background: '#0d0f14',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <p className="mb-2 text-[11px] font-bold text-zinc-400">{formatDate(label as string)}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-xs text-zinc-500">
            {entry.dataKey === 'success' ? 'Exitosas' : 'Fallidas'}:
          </span>
          <span className="text-xs font-bold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function AutomationsChart({ data }: { data: DataPoint[] }) {
  return (
    <div>
      {/* Custom legend */}
      <div className="mb-4 flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
          <span className="text-[11px] font-medium text-zinc-500">Exitosas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="text-[11px] font-medium text-zinc-500">Fallidas</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={8}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 10, fill: '#52525b' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#52525b' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.025)' }}
          />
          <Bar dataKey="success" stackId="a" fill="#06b6d4" radius={[0, 0, 0, 0]} />
          <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
