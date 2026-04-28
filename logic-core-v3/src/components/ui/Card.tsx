import { cn } from '@/lib/utils'
import { forwardRef, type HTMLAttributes } from 'react'

type CardVariant = 'default' | 'subtle' | 'highlighted' | 'flat'
type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  glow?: boolean
}

const VARIANT_STYLES: Record<CardVariant, string> = {
  default:
    'border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-cyan-500/[0.03] backdrop-blur-2xl',
  subtle: 'border border-white/[0.06] bg-white/[0.015] backdrop-blur-xl',
  highlighted:
    'border border-cyan-500/25 bg-gradient-to-br from-cyan-500/[0.08] via-white/[0.02] to-transparent backdrop-blur-2xl shadow-[0_0_24px_rgba(6,182,212,0.08)]',
  flat: 'border border-white/[0.08] bg-zinc-950/40',
}

const PADDING_STYLES: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-7',
  xl: 'p-7 sm:p-8',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'default', padding = 'md', glow = false, className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl transition-all duration-300',
          VARIANT_STYLES[variant],
          PADDING_STYLES[padding],
          glow &&
            'shadow-[0_0_32px_rgba(6,182,212,0.05)] hover:shadow-[0_0_40px_rgba(6,182,212,0.12)]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4 flex items-center justify-between', className)} {...props} />
  ),
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500', className)}
      {...props}
    />
  ),
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm leading-relaxed text-zinc-500', className)} {...props} />
))

CardDescription.displayName = 'CardDescription'
