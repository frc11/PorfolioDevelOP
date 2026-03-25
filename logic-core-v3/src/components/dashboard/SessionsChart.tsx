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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-cyan-500/30 bg-[#0c0e12]/80 p-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
          {new Date(label).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span className="text-sm font-black text-white">{payload[0].value} <span className="text-[10px] text-zinc-400 font-bold uppercase">Visitas</span></span>
          </div>
          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tight">Fuente Principal:</span>
            <span className="text-[10px] font-black text-zinc-300 uppercase italic">Google Ads</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function SessionsChart({ data }: SessionsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 20, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
            <feComponentTransfer in="offsetBlur">
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.05} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 8, fill: '#71717a', fontWeight: 'bold' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          dy={10}
        />
        <YAxis
          tick={{ fontSize: 8, fill: '#71717a', fontWeight: 'bold' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#06b6d4', strokeWidth: 1, opacity: 0.2 }}
        />
        <Area
          type="monotone"
          dataKey="sessions"
          stroke="#06b6d4"
          strokeWidth={2.5}
          fill="url(#sessionsGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
          filter="url(#cyanGlow)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
