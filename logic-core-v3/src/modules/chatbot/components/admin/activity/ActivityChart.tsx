'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

interface ActivityChartProps {
  data: Array<{ hour: string; count: number }>
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Actividad última semana
        </p>
        <p className="text-base font-medium text-zinc-200 mt-1">Eventos por día</p>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(9, 9, 11, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#e4e4e7',
                fontSize: '12px',
              }}
              cursor={{ stroke: 'rgba(6, 182, 212, 0.3)' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Eventos"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#activityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
