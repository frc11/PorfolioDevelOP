'use client'

import { useId, useRef } from 'react'

import { cn } from '@/lib/utils'

import { useHundido, useModoDelPie, usePiezaDelPie, usePieListo } from '../../_lib/pie3d/registro'

/**
 * [PULIDO 10] J8 · UN ENLACE DE TEXTO DEL PIE (el recorrido): sin placa, con el subrayado del sitio en el mouse encima y el
 * foco — el del CTA (`cta.css`): tres filetes, desde la izquierda, en `--duracion-muy-lenta` con `--ease-principal`.
 *
 *   · `volumen` (desde 1025): se anota como `enlace` y la escena dibuja sus letras extruidas y el subrayado en 3D
 *     (`escena/pie3d/`); le escribe a este elemento la transformada que lo deja sobre sus letras (el clic cae donde se ve).
 *     Con el 3D listo, el texto y el subrayado del DOM se apagan; el anillo del foco no (es de la pieza);
 *   · en los otros modos, el enlace y su subrayado de CSS.
 */
const SUBRAYADO_DEL_SITIO = cn(
  'bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[position:0_100%] bg-[length:0%_calc(var(--border-hairline)*3)]',
  'hover:bg-[length:100%_calc(var(--border-hairline)*3)] focus-visible:bg-[length:100%_calc(var(--border-hairline)*3)]',
  'transition-[background-size] duration-[var(--duracion-muy-lenta)] ease-[var(--ease-principal)] motion-reduce:transition-none',
)

export function EnlaceDeTexto({ href, children, className }: { readonly href: string; readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element {
  const modo = useModoDelPie()
  const raiz = useRef<HTMLAnchorElement | null>(null)
  const id = useId()
  const listo = usePieListo()
  const volumen = modo === 'volumen'
  usePiezaDelPie(raiz, { id, forma: 'enlace', activo: volumen })
  useHundido(raiz, volumen)
  return (
    <a ref={raiz} href={href} data-pieza="pie-enlace" className={cn('inline-block pb-[var(--spacing-1)]', SUBRAYADO_DEL_SITIO, volumen && listo && 'text-transparent bg-none', className)}>
      {children}
    </a>
  )
}
