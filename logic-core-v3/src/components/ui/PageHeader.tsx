import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type PageHeaderAccent = 'cyan' | 'amber' | 'emerald' | 'violet' | 'rose' | 'indigo'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  eyebrow?: string
  className?: string
  variant?: 'default' | 'gradient'
  /** Color del ícono y borde — por default cyan (alineado a develOP). Los módulos
   *  premium pueden pasar su accent (amber, emerald, violet) para mantener identidad. */
  accent?: PageHeaderAccent
}

const ACCENT_CLASSES: Record<PageHeaderAccent, string> = {
  cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  violet: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
  rose: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
  indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  eyebrow,
  className,
  variant = 'default',
  accent = 'cyan',
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between sm:pt-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
              ACCENT_CLASSES[accent],
            )}
          >
            <Icon size={20} strokeWidth={1.5} />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-600">
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              'text-2xl font-black leading-tight tracking-tight sm:text-3xl',
              variant === 'gradient'
                ? 'bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent'
                : 'text-white',
            )}
          >
            {title}
          </h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-zinc-500">{description}</p>}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
