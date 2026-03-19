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

export function SessionsChart({ data }: SessionsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 10, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#e4e4e7',
          }}
          labelFormatter={formatDate}
          formatter={(value: number) => [value, 'Sesiones']}
        />
        <Area
          type="monotone"
          dataKey="sessions"
          stroke="#06b6d4"
          strokeWidth={2}
          fill="url(#sessionsGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
