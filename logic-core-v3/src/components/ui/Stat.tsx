import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

type StatTone = 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet' | 'zinc' | 'blue'
type StatSize = 'sm' | 'md' | 'lg' | 'xl'

interface StatProps {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: StatTone
  size?: StatSize
  trend?: {
    value: number
    invertColors?: boolean
  }
  caption?: string
  className?: string
}

const TONE_STYLES: Record<StatTone, { value: string; iconBg: string; iconText: string }> = {
  cyan: { value: 'text-cyan-400', iconBg: 'bg-cyan-500/10', iconText: 'text-cyan-400' },
  emerald: {
    value: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
  },
  amber: { value: 'text-amber-400', iconBg: 'bg-amber-500/10', iconText: 'text-amber-400' },
  rose: { value: 'text-rose-400', iconBg: 'bg-rose-500/10', iconText: 'text-rose-400' },
  violet: {
    value: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    iconText: 'text-violet-400',
  },
  zinc: { value: 'text-zinc-300', iconBg: 'bg-zinc-500/10', iconText: 'text-zinc-400' },
  blue: { value: 'text-blue-400', iconBg: 'bg-blue-500/10', iconText: 'text-blue-400' },
}

const SIZE_STYLES: Record<StatSize, { value: string; label: string }> = {
  sm: { value: 'text-2xl font-bold tracking-tight', label: 'text-[10px]' },
  md: { value: 'text-3xl font-black tracking-tight', label: 'text-[10px]' },
  lg: { value: 'text-4xl font-black tracking-tight', label: 'text-[11px]' },
  xl: { value: 'text-5xl font-black tracking-tighter sm:text-6xl', label: 'text-xs' },
}

export function Stat({
  label,
  value,
  icon: Icon,
  tone = 'cyan',
  size = 'md',
  trend,
  caption,
  className,
}: StatProps) {
  const tones = TONE_STYLES[tone]
  const sizes = SIZE_STYLES[size]

  const trendIsPositive =
    trend && trend.value !== 0
      ? trend.invertColors
        ? trend.value < 0
        : trend.value > 0
      : null

  const trendColor =
    trendIsPositive === null
      ? 'text-zinc-500'
      : trendIsPositive
        ? 'text-emerald-400'
        : 'text-rose-400'

  const TrendIcon = trend?.value === 0 ? Minus : (trend?.value ?? 0) > 0 ? ArrowUp : ArrowDown

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className={cn('font-bold uppercase tracking-[0.15em] text-zinc-500', sizes.label)}>
          {label}
        </span>
        {Icon && (
          <div className={cn('rounded-lg border border-white/5 p-1.5', tones.iconBg)}>
            <Icon size={14} className={tones.iconText} strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn('tabular-nums', sizes.value, tones.value)}>{value}</span>
        {trend && (
          <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold', trendColor)}>
            <TrendIcon size={11} strokeWidth={2.5} />
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {caption && <p className="text-[10px] leading-relaxed text-zinc-600">{caption}</p>}
    </div>
  )
}
