import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Callout — caja de mensaje semántica (warning / success / info / danger / neutral / brand).
 *
 * Reemplaza las cajitas inline `rounded-xl border-amber-400/20 bg-amber-500/[0.06] ...`
 * repetidas por todo LeadOS. El tono codifica intención (regla de color del design system),
 * nunca decora. `accent` agrega una barra lateral para mensajes de alta atención (rechazos).
 *
 * Es server-component-safe (sin hooks/handlers): se puede usar en paneles RSC.
 */
export type CalloutTone = 'neutral' | 'info' | 'brand' | 'success' | 'warning' | 'danger'

interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: CalloutTone
  icon?: LucideIcon
  title?: ReactNode
  /** Barra de acento a la izquierda — para mensajes críticos que tienen que saltar. */
  accent?: boolean
  children?: ReactNode
}

const TONE: Record<CalloutTone, { box: string; bar: string; icon: string; title: string }> = {
  neutral: {
    box: 'border-white/[0.08] bg-white/[0.02] text-zinc-400',
    bar: 'bg-white/25',
    icon: 'text-zinc-400',
    title: 'text-zinc-200',
  },
  info: {
    box: 'border-blue-400/20 bg-blue-500/[0.06] text-blue-200',
    bar: 'bg-blue-400',
    icon: 'text-blue-300',
    title: 'text-blue-100',
  },
  brand: {
    box: 'border-cyan-400/20 bg-cyan-500/[0.05] text-cyan-200',
    bar: 'bg-cyan-400',
    icon: 'text-cyan-300',
    title: 'text-cyan-100',
  },
  success: {
    box: 'border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-200',
    bar: 'bg-emerald-400',
    icon: 'text-emerald-300',
    title: 'text-emerald-100',
  },
  warning: {
    box: 'border-amber-400/20 bg-amber-500/[0.06] text-amber-200',
    bar: 'bg-amber-400',
    icon: 'text-amber-300',
    title: 'text-amber-100',
  },
  danger: {
    box: 'border-rose-400/25 bg-rose-500/[0.06] text-rose-200',
    bar: 'bg-rose-400',
    icon: 'text-rose-300',
    title: 'text-rose-100',
  },
}

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  ({ tone = 'neutral', icon: Icon, title, accent = false, className, children, ...props }, ref) => {
    const t = TONE[tone]
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl border p-3 text-xs leading-relaxed',
          t.box,
          accent && 'pl-4',
          className,
        )}
        {...props}
      >
        {accent && <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', t.bar)} />}
        <div className="flex gap-2.5">
          {Icon && (
            <Icon size={16} strokeWidth={1.5} aria-hidden className={cn('mt-px shrink-0', t.icon)} />
          )}
          <div className="min-w-0 space-y-1">
            {title && <p className={cn('font-semibold', t.title)}>{title}</p>}
            {children}
          </div>
        </div>
      </div>
    )
  },
)

Callout.displayName = 'Callout'
