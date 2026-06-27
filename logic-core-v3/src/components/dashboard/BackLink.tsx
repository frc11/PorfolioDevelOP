import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackLinkProps {
  /** Destino estático del back — SIEMPRE una ruta fija de la jerarquía de rutas, NUNCA un param de org. */
  href: string
  label: string
  className?: string
}

/**
 * Link de "volver atrás" del portal cliente. Presentacional y universal:
 * sin hooks, sin estado → sirve igual en server pages y client components.
 * Molde canónico basado en el patrón de LeadDetail.
 */
export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300',
        className,
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
      {label}
    </Link>
  )
}
