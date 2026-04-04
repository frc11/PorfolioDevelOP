import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'

type StatTrend = 'up' | 'down' | 'neutral'
type StatColor = 'zinc' | 'cyan' | 'emerald' | 'amber' | 'violet' | 'alert'

type StatCardProps = {
  label: string
  value: string
  subtitle?: string
  trend?: StatTrend
  color?: StatColor
  icon?: LucideIcon
  progress?: number
}

function getColorClasses(color: StatColor): {
  container: string
  icon: string
  progress: string
} {
  switch (color) {
    case 'cyan':
      return {
        container: 'border-cyan-400/15 bg-cyan-400/[0.06]',
        icon: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
        progress: 'bg-cyan-300',
      }
    case 'emerald':
      return {
        container: 'border-emerald-400/15 bg-emerald-400/[0.06]',
        icon: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
        progress: 'bg-emerald-300',
      }
    case 'amber':
      return {
        container: 'border-amber-400/15 bg-amber-400/[0.06]',
        icon: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
        progress: 'bg-amber-300',
      }
    case 'violet':
      return {
        container: 'border-fuchsia-400/15 bg-fuchsia-400/[0.06]',
        icon: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
        progress: 'bg-fuchsia-300',
      }
    case 'alert':
      return {
        container:
          'border-orange-400/25 bg-orange-400/[0.08] shadow-[0_0_0_1px_rgba(251,146,60,0.08)]',
        icon: 'border-orange-400/25 bg-orange-400/10 text-orange-200',
        progress: 'bg-orange-300',
      }
    case 'zinc':
      return {
        container: 'border-white/10 bg-white/5',
        icon: 'border-white/10 bg-white/5 text-zinc-200',
        progress: 'bg-zinc-300',
      }
  }
}

function getTrendMeta(trend: StatTrend): {
  icon: LucideIcon
  className: string
  label: string
} {
  switch (trend) {
    case 'up':
      return {
        icon: ArrowUpRight,
        className: 'text-emerald-300',
        label: 'En alza',
      }
    case 'down':
      return {
        icon: ArrowDownRight,
        className: 'text-orange-200',
        label: 'Requiere atencion',
      }
    case 'neutral':
      return {
        icon: ArrowRight,
        className: 'text-zinc-400',
        label: 'Estable',
      }
  }
}

function normalizeProgress(progress: number): number {
  return Math.min(100, Math.max(0, progress))
}

export function StatCard({
  label,
  value,
  subtitle,
  trend = 'neutral',
  color = 'zinc',
  icon: Icon,
  progress,
}: StatCardProps) {
  const palette = getColorClasses(color)
  const trendMeta = getTrendMeta(trend)
  const TrendIcon = trendMeta.icon

  return (
    <article
      className={[
        'rounded-[26px] border p-5 backdrop-blur-xl transition-colors',
        palette.container,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
        </div>

        {Icon ? (
          <div
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border',
              palette.icon,
            ].join(' ')}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      {typeof progress === 'number' ? (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={['h-full rounded-full transition-[width]', palette.progress].join(' ')}
              style={{ width: `${normalizeProgress(progress)}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="min-h-[20px] text-sm text-zinc-400">{subtitle ?? ''}</p>
        <div
          className={[
            'inline-flex items-center gap-1 text-xs font-medium',
            trendMeta.className,
          ].join(' ')}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{trendMeta.label}</span>
        </div>
      </div>
    </article>
  )
}
