'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

interface LatencyChartProps {
  data: Array<{ hour: string; p50: number | null; p95: number | null; count: number }>
  isMock?: boolean
}

export function LatencyChart({ data, isMock = false }: LatencyChartProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Latencia chatbot últimas 24h
          </p>
          <p className="text-base font-medium text-zinc-200 mt-1">P50 y P95 por hora</p>
        </div>
        {isMock && (
          <span className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-300">
            Datos simulados
          </span>
        )}
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={false}
              tickLine={false}
              unit="ms"
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(9, 9, 11, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#e4e4e7',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value ?? '—'}ms`]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#a1a1aa', paddingTop: 10 }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="p50"
              name="P50"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#06b6d4' }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="p95"
              name="P95"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
