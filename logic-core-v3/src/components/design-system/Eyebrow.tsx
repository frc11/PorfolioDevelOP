import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { accentTextClass, type ServiceAccent } from './accent'

interface EyebrowProps {
  children: ReactNode
  /**
   * Acento de servicio. De uso escaso: el acento va en dosis mínimas y nunca
   * dos en una misma vista.
   */
  accent?: ServiceAccent
  as?: 'p' | 'span' | 'div'
  className?: string
}

/**
 * Kicker de sección. Mono, uppercase, tracking .18em (viene en el token
 * `--text-ds-eyebrow`, no se declara acá).
 */
export function Eyebrow({ children, accent, as = 'p', className }: EyebrowProps) {
  const Tag = as

  return (
    <Tag
      className={cn(
        'font-mono text-ds-eyebrow uppercase',
        accent ? accentTextClass[accent] : 'text-ds-fg-muted',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
