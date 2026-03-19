'use client'

import {
  ComposedChart,
  Line,
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
  clicks: number
  impressions: number
}

interface ClicksImpressionsChartProps {
  data: DataPoint[]
}

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

export function ClicksImpressionsChart({ data }: ClicksImpressionsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
          yAxisId="impressions"
          orientation="right"
          tick={{ fontSize: 10, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={40}
        />
        <YAxis
          yAxisId="clicks"
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
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: '#71717a', paddingTop: '8px' }}
          formatter={(value) => (value === 'clicks' ? 'Clicks' : 'Impresiones')}
        />
        <Bar
          yAxisId="impressions"
          dataKey="impressions"
          fill="#3f3f46"
          radius={[2, 2, 0, 0]}
          maxBarSize={20}
        />
        <Line
          yAxisId="clicks"
          type="monotone"
          dataKey="clicks"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
