'use client'

import type { CSSProperties } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from './chart-card'

type DemosByWeekItem = {
  label: string
  demos: number
  objective: number
}

type CloseRateByMonthItem = {
  label: string
  closeRate: number
  closed: number
  responded: number
}

type RevenueByMonthItem = {
  label: string
  revenue: number
  cumulative: number
}

type HoursByMemberByWeekItem = {
  label: string
} & Record<string, number | string>

type MemberSeries = {
  key: string
  label: string
  color: string
}

type DashboardHistoryChartsProps = {
  demosByWeek: DemosByWeekItem[]
  closeRateByMonth: CloseRateByMonthItem[]
  revenueByMonth: RevenueByMonthItem[]
  hoursByMemberByWeek: HoursByMemberByWeekItem[]
  memberSeries: MemberSeries[]
}

const chartGridStroke = 'rgba(255,255,255,0.08)'
const chartAxisStroke = 'rgba(255,255,255,0.18)'
const chartAxisText = 'rgba(255,255,255,0.6)'

const tooltipStyle: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '18px',
  background: 'rgba(10,14,23,0.82)',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
  color: '#ffffff',
}

function formatCurrency(value: number): string {
  return `$${new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`
}

function toNumericValue(
  value: number | string | ReadonlyArray<string | number> | undefined
): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  if (Array.isArray(value)) {
    const [firstValue] = value
    return toNumericValue(firstValue)
  }

  return 0
}

function formatHourTick(
  value: number | string | ReadonlyArray<string | number> | undefined
): string {
  const numericValue = toNumericValue(value)
  return `${numericValue}h`
}

function formatPercentTick(
  value: number | string | ReadonlyArray<string | number> | undefined
): string {
  const numericValue = toNumericValue(value)
  return `${numericValue}%`
}

export function DashboardHistoryCharts({
  demosByWeek,
  closeRateByMonth,
  revenueByMonth,
  hoursByMemberByWeek,
  memberSeries,
}: DashboardHistoryChartsProps) {
  const objectiveLine = demosByWeek[0]?.objective ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title="Demos enviadas por semana">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={demosByWeek} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={{ stroke: chartAxisStroke }}
              tickLine={false}
              tick={{ fill: chartAxisText, fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartAxisText, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#ffffff', fontWeight: 600 }}
            />
            <ReferenceLine
              y={objectiveLine}
              stroke="rgba(255,255,255,0.35)"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            <Bar dataKey="demos" fill="#22d3ee" radius={[8, 8, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tasa de cierre por mes">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={closeRateByMonth} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={{ stroke: chartAxisStroke }}
              tickLine={false}
              tick={{ fill: chartAxisText, fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={formatPercentTick}
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartAxisText, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(217,70,239,0.35)', strokeWidth: 1 }}
              contentStyle={tooltipStyle}
              formatter={(value) => [`${toNumericValue(value)}%`, 'Tasa de cierre']}
              labelStyle={{ color: '#ffffff', fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="closeRate"
              stroke="#d946ef"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 0, fill: '#e879f9' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#f0abfc' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Ingresos mensuales acumulados">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueByMonth} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="osRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={{ stroke: chartAxisStroke }}
              tickLine={false}
              tick={{ fill: chartAxisText, fontSize: 12 }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartAxisText, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(52,211,153,0.35)', strokeWidth: 1 }}
              contentStyle={tooltipStyle}
              formatter={(value, name) => {
                const numericValue = toNumericValue(value)

                if (name === 'revenue') {
                  return [formatCurrency(numericValue), 'Ingreso del mes']
                }

                return [formatCurrency(numericValue), 'Acumulado']
              }}
              labelStyle={{ color: '#ffffff', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#34d399"
              strokeWidth={3}
              fill="url(#osRevenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Horas trabajadas por miembro por semana">
        {memberSeries.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hoursByMemberByWeek}
              margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              barGap={6}
            >
              <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={{ stroke: chartAxisStroke }}
                tickLine={false}
                tick={{ fill: chartAxisText, fontSize: 12 }}
              />
              <YAxis
                tickFormatter={formatHourTick}
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartAxisText, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  formatHourTick(value),
                  String(name),
                ]}
                labelStyle={{ color: '#ffffff', fontWeight: 600 }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                formatter={(value: string | number) => (
                  <span className="text-xs text-zinc-300">{String(value)}</span>
                )}
              />
              {memberSeries.map((member) => (
                <Bar
                  key={member.key}
                  dataKey={member.key}
                  name={member.label}
                  fill={member.color}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={24}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-black/10 px-6 text-center text-sm text-zinc-500">
            Todavia no hay horas suficientes para dibujar la serie semanal por miembro.
          </div>
        )}
      </ChartCard>
    </div>
  )
}
