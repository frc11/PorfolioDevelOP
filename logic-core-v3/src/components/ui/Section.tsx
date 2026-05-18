import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Eyebrow, Heading } from './Typography'

interface SectionProps {
  eyebrow?: string
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
  compact: 'space-y-3',
  default: 'space-y-4',
  spacious: 'space-y-6',
}

export function Section({
  eyebrow,
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
    <section className={cn(SPACING_STYLES[spacing], className)}>
      {(eyebrow || title || description || action) && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                <Icon size={16} strokeWidth={1.75} />
              </div>
            )}
            <div className="min-w-0">
              {eyebrow && <Eyebrow className="mb-1">{eyebrow}</Eyebrow>}
              {title && <Heading level={2}>{title}</Heading>}
              {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(contentClassName)}>{children}</div>
    </section>
  )
}
