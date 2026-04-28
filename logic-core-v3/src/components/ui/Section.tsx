import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  title?: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  spacing?: 'compact' | 'default' | 'spacious'
}

const SPACING_STYLES = {
  compact: 'gap-3',
  default: 'gap-5',
  spacious: 'gap-7',
}

export function Section({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
  spacing = 'default',
}: SectionProps) {
  return (
    <section className={cn('flex flex-col', SPACING_STYLES[spacing], className)}>
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                <Icon size={16} strokeWidth={1.75} />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-xs text-zinc-600">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}

      <div className={cn(contentClassName)}>{children}</div>
    </section>
  )
}
