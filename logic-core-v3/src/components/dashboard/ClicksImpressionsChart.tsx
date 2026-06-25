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
import {
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  chartTooltipContentStyle,
  useReducedMotion,
} from '@/components/dashboard/results/_shared/chartTheme'

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
  const reduced = useReducedMotion()

  return (
    <div className="h-52" role="img" aria-label="Clicks e impresiones diarias en Google Search">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={CHART_AXIS_STROKE}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="impressions"
            orientation="right"
            stroke={CHART_AXIS_STROKE}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={40}
          />
          <YAxis
            yAxisId="clicks"
            stroke={CHART_AXIS_STROKE}
            tick={CHART_AXIS_TICK}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={chartTooltipContentStyle}
            cursor={{ fill: 'rgba(6, 182, 212, 0.06)' }}
            labelFormatter={(label) =>
              typeof label === 'string' || typeof label === 'number'
                ? formatDate(String(label))
                : ''
            }
            formatter={(value, name) => [value, name === 'clicks' ? 'Clicks' : 'Impresiones']}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#a1a1aa', paddingTop: '8px' }}
            formatter={(value) => (value === 'clicks' ? 'Clicks' : 'Impresiones')}
          />
          <Bar
            yAxisId="impressions"
            dataKey="impressions"
            fill="#22d3ee"
            fillOpacity={0.32}
            radius={[6, 6, 0, 0]}
            maxBarSize={24}
            isAnimationActive={!reduced}
          />
          <Line
            yAxisId="clicks"
            type="monotone"
            dataKey="clicks"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
            isAnimationActive={!reduced}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
