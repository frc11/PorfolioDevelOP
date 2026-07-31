import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SurfacePadding = 'none' | 'sm' | 'md' | 'lg'

interface SurfaceProps {
  children: ReactNode
  padding?: SurfacePadding
  as?: 'div' | 'article' | 'li' | 'aside'
  className?: string
}

const paddingClass: Record<SurfacePadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8 md:p-10',
}

/**
 * Panel plano: fondo de superficie, borde de 1px, radio 0.
 *
 * Sin relieve y sin hover a propósito — el relieve táctil está reservado a lo
 * interactivo. Si no se puede apretar, es plano. Tampoco lleva backdrop-blur:
 * el glassmorphism está prohibido en este sistema.
 */
export function Surface({ children, padding = 'md', as = 'div', className }: SurfaceProps) {
  const Tag = as

  return (
    <Tag
      className={cn(
        'border border-ds-rule bg-ds-panel rounded-ds-surface',
        paddingClass[padding],
        className,
      )}
    >
      {children}
    </Tag>
  )
}
