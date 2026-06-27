import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'

interface TrendBadgeProps {
  /** Numeric change — positive = up, negative = down */
  value: number
  /** Override the displayed number (e.g. "0:23" for time deltas) */
  displayValue?: string
  /** Unit suffix after the number (default: '%') */
  suffix?: string
  /** When true, rising is bad and falling is good (e.g. bounce rate, open tickets) */
  invertColors?: boolean
}

/**
 * Convención de tendencia del admin (StatCard): flecha Lucide + color, SIN pill.
 * Sube bueno = emerald-400 · baja/malo = amber-300 · sin cambio = zinc-500.
 * `invertColors` mantiene la semántica bueno/malo (ej. rebote que baja = bueno).
 */
export function TrendBadge({
  value,
  displayValue,
  suffix = '%',
  invertColors = false,
}: TrendBadgeProps) {
  if (value === 0) {
    return (
      <span
        title="vs mes anterior"
        className="inline-flex items-center gap-1 text-[11px] tabular-nums text-zinc-500"
      >
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />0{suffix}
      </span>
    )
  }

  const isRising = value > 0
  const isGood = invertColors ? !isRising : isRising
  const Icon = isRising ? ArrowUpRight : ArrowDownRight
  const formatted = displayValue ?? `${Math.abs(value).toFixed(1)}${suffix}`

  return (
    <span
      title="vs mes anterior"
      className={`inline-flex items-center gap-1 text-[11px] tabular-nums ${
        isGood ? 'text-emerald-400' : 'text-amber-300'
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      {formatted}
    </span>
  )
}
