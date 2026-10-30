'use client'

import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { SUBRAYADO_DEL_SITIO } from '../volumen/EnlaceDeTexto'

import { EnlaceDeRuta } from './EnlaceDeRuta'

/**
 * [L7g] EL ENLACE DISCRETO AL FINAL DE UNA SECCIÓN DEL HOME — una línea de texto con el subrayado del sitio (el de los enlaces del pie) y una flecha,
 * que lleva a una página nueva con el velo (`EnlaceDeRuta`: nunca `router.push`). Hereda la tinta de la superficie donde cae (papel o noche).
 */
export function EnlaceDiscreto({ href, children, className }: { readonly href: string; readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element {
  return (
    <EnlaceDeRuta href={href} data-pieza="enlace-discreto" className={cn('group/enlace inline-flex items-center gap-[var(--spacing-2)] pb-[var(--spacing-1)] text-cuerpo font-semi', SUBRAYADO_DEL_SITIO, className)}>
      {children}
      <ArrowRight className="size-[var(--spacing-4)] shrink-0 transition-transform duration-[var(--duracion-rapida)] group-hover/enlace:translate-x-0.5 motion-reduce:transition-none" strokeWidth={1.5} aria-hidden="true" />
    </EnlaceDeRuta>
  )
}
