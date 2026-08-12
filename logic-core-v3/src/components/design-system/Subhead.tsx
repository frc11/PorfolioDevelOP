import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { accentTextClass, type ServiceAccent } from './accent'

interface SubheadProps {
  children: ReactNode
  /**
   * Acento de servicio. Es la superficie más grande donde el sistema deja
   * aparecer el acento, y por eso es donde de verdad identifica algo.
   *
   * Solo sobre tema oscuro — ver la Regla del Acento sobre Oscuro en DESIGN.md.
   */
  accent?: ServiceAccent
  as?: 'h3' | 'h4' | 'p'
  id?: string
  className?: string
}

/**
 * Subtítulo de bloque: el peldaño entre el titular de capítulo y el subhead.
 *
 * Existe porque la escala tenía un hueco de 3.09× entre `display-lg` (68px) y
 * `lead` (22px) sin nada en el medio, así que las secciones con estructura
 * interna —los cuatro frentes, los tres contrastes— caían del titular directo a
 * la mono de 12px. Es Geist otra vez: el peldaño se resuelve con escala, no
 * incorporando una familia nueva.
 *
 * Por defecto es `h3` porque su lugar natural es abrir un bloque dentro de una
 * sección que ya tiene su `h2`. `as='p'` para cuando el texto NO abre nada y
 * poner un encabezado ahí ensuciaría el árbol del lector de pantalla.
 */
export function Subhead({ children, accent, as = 'h3', id, className }: SubheadProps) {
  const Tag = as

  return (
    <Tag
      id={id}
      className={cn(
        'font-ds-sans font-medium text-balance text-ds-subhead',
        accent ? accentTextClass[accent] : 'text-ds-fg',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
