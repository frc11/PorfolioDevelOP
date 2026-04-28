import { cn } from '@/lib/utils'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

type BadgeTone = 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet' | 'zinc' | 'blue'
type BadgeVariant = 'solid' | 'soft' | 'outline'
type BadgeSize = 'xs' | 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: ReactNode
  pulse?: boolean
}

const TONE_STYLES: Record<BadgeTone, Record<BadgeVariant, string>> = {
  cyan: {
    solid: 'border border-cyan-400 bg-cyan-500 text-zinc-950',
    soft: 'border border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    outline: 'border border-cyan-500/40 text-cyan-400',
  },
  emerald: {
    solid: 'border border-emerald-400 bg-emerald-500 text-zinc-950',
    soft: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    outline: 'border border-emerald-500/40 text-emerald-400',
  },
  amber: {
    solid: 'border border-amber-400 bg-amber-500 text-zinc-950',
    soft: 'border border-amber-500/20 bg-amber-500/10 text-amber-400',
    outline: 'border border-amber-500/40 text-amber-400',
  },
  rose: {
    solid: 'border border-rose-400 bg-rose-500 text-zinc-50',
    soft: 'border border-rose-500/20 bg-rose-500/10 text-rose-400',
    outline: 'border border-rose-500/40 text-rose-400',
  },
  violet: {
    solid: 'border border-violet-400 bg-violet-500 text-zinc-50',
    soft: 'border border-violet-500/20 bg-violet-500/10 text-violet-400',
    outline: 'border border-violet-500/40 text-violet-400',
  },
  zinc: {
    solid: 'border border-zinc-600 bg-zinc-700 text-zinc-100',
    soft: 'border border-zinc-500/20 bg-zinc-500/10 text-zinc-400',
    outline: 'border border-zinc-500/40 text-zinc-400',
  },
  blue: {
    solid: 'border border-blue-400 bg-blue-500 text-zinc-50',
    soft: 'border border-blue-500/20 bg-blue-500/10 text-blue-400',
    outline: 'border border-blue-500/40 text-blue-400',
  },
}

const SIZE_STYLES: Record<BadgeSize, string> = {
  xs: 'gap-1 px-1.5 py-0.5 text-[9px]',
  sm: 'gap-1 px-2 py-1 text-[10px]',
  md: 'gap-1.5 px-2.5 py-1.5 text-[11px]',
}

const PULSE_DOT_TONE: Record<BadgeTone, string> = {
  cyan: 'bg-cyan-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
  zinc: 'bg-zinc-400',
  blue: 'bg-blue-400',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { tone = 'cyan', variant = 'soft', size = 'sm', icon, pulse, children, className, ...props },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-bold uppercase tracking-widest',
          TONE_STYLES[tone][variant],
          SIZE_STYLES[size],
          className,
        )}
        {...props}
      >
        {pulse && (
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                PULSE_DOT_TONE[tone],
              )}
            />
            <span
              className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', PULSE_DOT_TONE[tone])}
            />
          </span>
        )}
        {icon}
        {children}
      </span>
    )
  },
)

Badge.displayName = 'Badge'
