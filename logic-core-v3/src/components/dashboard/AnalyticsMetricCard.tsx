import { type ReactNode } from 'react'
import { TrendBadge } from './TrendBadge'
import { AnimatedCounter } from './AnimatedCounter'

// Acentos canon (sólo el chip del ícono lleva color; el valor va zinc-100 como StatCard).
const COLORS = {
  cyan: { icon: 'text-cyan-300', iconBg: 'bg-cyan-400/10' },
  green: { icon: 'text-emerald-300', iconBg: 'bg-emerald-400/10' },
  red: { icon: 'text-rose-300', iconBg: 'bg-rose-400/10' },
  violet: { icon: 'text-violet-300', iconBg: 'bg-violet-400/10' },
  amber: { icon: 'text-amber-300', iconBg: 'bg-amber-400/10' },
} as const

interface AnalyticsMetricCardProps {
  label: string
  tooltip: string
  displayValue: string
  rawValue?: number
  suffix?: string
  icon: ReactNode
  color: keyof typeof COLORS
  trend?: { value: number; displayValue?: string } | null
  invertColors?: boolean
}

/**
 * Metric card del tab Tráfico, alineada a la semántica de `StatCard` admin:
 * `rounded-2xl border-white/10 bg-white/[0.02]`, valor `text-2xl font-medium`
 * zinc, ícono en chip canon. Sin `shadow-2xl`/FM/hover propios — el hover lo
 * aporta el `HoverCard` que la envuelve en la página.
 */
export function AnalyticsMetricCard({
  label,
  tooltip,
  displayValue,
  rawValue,
  suffix,
  icon,
  color,
  trend,
  invertColors = false,
}: AnalyticsMetricCardProps) {
  const c = COLORS[color]

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-3 flex items-start justify-between">
        <p className="text-xs tracking-tight text-zinc-500">{label}</p>
        <div className={`rounded-md p-1.5 ${c.iconBg} ${c.icon}`}>{icon}</div>
      </div>

      <div className="text-2xl font-medium tracking-tight tabular-nums text-zinc-100">
        {rawValue !== undefined ? (
          <span className="flex items-baseline gap-0.5">
            <AnimatedCounter value={Math.round(rawValue)} />
            {suffix && <span className="text-lg text-zinc-400">{suffix}</span>}
          </span>
        ) : (
          <span>{displayValue}</span>
        )}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-2">
          <TrendBadge
            value={trend.value}
            displayValue={trend.displayValue}
            invertColors={invertColors}
          />
          <span className="text-[10px] text-zinc-500">vs mes anterior</span>
        </div>
      )}

      <p className="mt-3 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-zinc-500">
        {tooltip}
      </p>
    </div>
  )
}
