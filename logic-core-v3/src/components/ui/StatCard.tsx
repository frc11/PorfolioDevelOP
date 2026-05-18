import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Accent = 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose' | 'red' | 'zinc'

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  accent?: Accent
  trend?: {
    direction: 'up' | 'down' | 'flat'
    value: string
  }
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
  subtitle,
  icon: Icon,
  accent,
  trend,
  className,
}: StatCardProps) {
  const colors = accent ? accentColors[accent] : null
  const TrendIcon =
    trend?.direction === 'up' ? ArrowUpRight : trend?.direction === 'down' ? ArrowDownRight : ArrowRight

  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/[0.02] p-5', className)}>
      <div className="mb-3 flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
        {Icon && (
          <div className={cn('rounded-xl p-1.5', colors?.bg ?? 'bg-white/[0.04]')}>
            <Icon
              className={cn('h-4 w-4', colors?.text ?? 'text-zinc-400')}
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>

      <p className={cn('text-2xl font-semibold tracking-tight', colors?.text ?? 'text-zinc-100')}>
        {value}
      </p>

      {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}

      {trend && (
        <div
          className={cn(
            'mt-2 inline-flex items-center gap-1 text-xs',
            trend.direction === 'up'
              ? 'text-emerald-400'
              : trend.direction === 'down'
                ? 'text-red-400'
                : 'text-zinc-500',
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
          {trend.value}
        </div>
      )}
    </div>
  )
}
