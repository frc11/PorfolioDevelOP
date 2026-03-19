'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

export function AutomationsChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={8}>
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
          formatter={(value: number, name: string) => [
            value,
            name === 'success' ? 'Exitosas' : 'Fallidas',
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: '#71717a', paddingTop: '8px' }}
          formatter={(value) => (value === 'success' ? 'Exitosas' : 'Fallidas')}
        />
        <Bar dataKey="success" stackId="a" fill="#06b6d4" radius={[0, 0, 0, 0]} />
        <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
