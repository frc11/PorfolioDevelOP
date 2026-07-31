import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LeadProps {
  children: ReactNode
  className?: string
}

/**
 * Subhead. Corta a 55ch (`--container-ds-lead`) — más angosto que la medida de
 * prosa, porque un lead largo a ancho de párrafo pierde la jerarquía contra el
 * display de arriba.
 */
export function Lead({ children, className }: LeadProps) {
  return (
    <p className={cn('max-w-ds-lead text-ds-lead text-ds-fg-muted', className)}>{children}</p>
  )
}
