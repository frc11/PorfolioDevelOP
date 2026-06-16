import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Accent = 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose' | 'red' | 'zinc'
type LegacyTrend = 'up' | 'down' | 'neutral'
type StatTrend =
  | LegacyTrend
  | {
      direction: 'up' | 'down' | 'flat'
      value: string
    }

interface StatCardProps {
  label: string
  value: string | number
  format?: 'number' | 'currency' | 'compact'
  subtitle?: string
  icon?: LucideIcon
  accent?: Accent
  color?: Accent | 'alert'
  trend?: StatTrend
  progress?: number
  className?: string
}

const accentColors: Record<Accent, { text: string; bg: string; border: string }> = {
  cyan: { text: 'text-cyan-300', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  emerald: {
    text: 'text-emerald-300',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  violet: { text: 'text-violet-300', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
  amber: { text: 'text-amber-300', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  rose: { text: 'text-rose-300', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  red: { text: 'text-red-300', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  zinc: { text: 'text-zinc-300', bg: 'bg-zinc-700/30', border: 'border-zinc-600/20' },
}

export function StatCard({
  label,
  value,
  format = 'number',
  subtitle,
  icon: Icon,
  accent,
  color,
  trend,
  progress,
  className,
}: StatCardProps) {
  const resolvedAccent = accent ?? (color === 'alert' ? 'amber' : color)
  const colors = resolvedAccent ? accentColors[resolvedAccent] : null
  const formattedValue =
    typeof value === 'string'
      ? value
      : format === 'currency'
        ? `$${value.toFixed(4)}`
        : format === 'compact'
          ? new Intl.NumberFormat('en', { notation: 'compact' }).format(value)
          : value.toLocaleString()
  const trendMeta = normalizeTrend(trend)
  const TrendIcon =
    trendMeta.direction === 'up'
      ? ArrowUpRight
      : trendMeta.direction === 'down'
        ? ArrowDownRight
        : ArrowRight

  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/[0.02] p-5', className)}>
      <div className="mb-3 flex items-start justify-between">
        <p className="text-xs tracking-tight text-zinc-500">{label}</p>
        {Icon && (
          <div className={cn('rounded-md p-1.5', colors?.bg ?? 'bg-white/[0.04]')}>
            <Icon
              className={cn('h-4 w-4', colors?.text ?? 'text-zinc-400')}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <p className={cn('text-2xl font-medium tracking-tight', colors?.text ?? 'text-zinc-100')}>
        {formattedValue}
      </p>

      {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}

      {typeof progress === 'number' && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn('h-full rounded-full transition-[width] motion-reduce:transition-none', colors?.bg ?? 'bg-zinc-300')}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {trendMeta.value && (
        <div
          className={cn(
            'mt-2 inline-flex items-center gap-1 text-xs',
            trendMeta.direction === 'up'
              ? 'text-emerald-400'
              : trendMeta.direction === 'down'
                ? 'text-amber-300'
                : 'text-zinc-500',
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
          {trendMeta.value}
        </div>
      )}
    </div>
  )
}

function normalizeTrend(trend?: StatTrend): { direction: 'up' | 'down' | 'flat'; value?: string } {
  if (!trend) return { direction: 'flat' }
  if (typeof trend !== 'string') return trend

  switch (trend) {
    case 'up':
      return { direction: 'up', value: 'En alza' }
    case 'down':
      return { direction: 'down', value: 'Requiere atención' }
    case 'neutral':
      return { direction: 'flat', value: 'Estable' }
  }
}
