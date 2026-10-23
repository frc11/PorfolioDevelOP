'use client'

import { useInView } from 'motion/react'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

import { useMovimientoReducido } from '../../_lib/motion/reducido'

/**
 * [C2 · 20] EL AVISO DE SCROLL (ítems 12, 15 y 22 de la revisión) — discreto, centrado debajo del contenido: un texto corto en gris y,
 * debajo, dos chevrones hacia abajo sin mango (uno arriba del otro), todo titilando suave (la opacidad, un ciclo de `--aviso-ciclo`,
 * `piezas.css`). Grande pero disimulado.
 *
 *   <AvisoDeScroll texto="Scrolleá para explorarlo" />
 *   <AvisoDeScroll texto="Scrolleá una vez más para ver las preguntas frecuentes" tono="escena" alTocar={bajarUnGesto} />
 *
 * · `alTocar`: si está, el aviso es un `<button>` (con su foco visible) que hace lo que quien lo monta diga (en el FAQ, lo mismo que un
 *   gesto de scroll); si no, es decorativo (`aria-hidden`).
 * · `tono`: `papel` (por defecto) o `escena` (sobre la escena viva: la misma tinta con una sombra pegada del color del fondo, como el texto
 *   de la intro). Las dos toman la tinta tenue de la sección: en una sección invertida, el gris claro.
 * · Con movimiento reducido o fuera de la pantalla no titila (queda quieto, a la vista).
 * · [C2-70t] `direccion`: `abajo` (por defecto, el scroll de la página) o `costado` (un carrusel que se desliza: el texto y, a su
 *   derecha, los dos chevrones hacia la derecha, uno al lado del otro).
 */
export type TonoDelAviso = 'papel' | 'escena'
export type DireccionDelAviso = 'abajo' | 'costado'

interface Props {
  readonly texto: string
  readonly tono?: TonoDelAviso
  readonly direccion?: DireccionDelAviso
  readonly alTocar?: () => void
  readonly className?: string
}

/** El chevrón sin mango: una V abierta, en el trazo del sitio. De costado, la misma V acostada (hacia la derecha). */
function Chevron({ className, costado = false }: { readonly className?: string; readonly costado?: boolean }): React.JSX.Element {
  if (costado) {
    return (
      <svg viewBox="0 0 12 24" fill="none" aria-hidden="true" focusable="false" className={cn('block h-[var(--spacing-6)] w-[var(--spacing-3)] overflow-visible', className)}>
        <path d="M2 3 L10 12 L2 21" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 12" fill="none" aria-hidden="true" focusable="false" className={cn('block w-[var(--spacing-8)] overflow-visible', className)}>
      <path d="M3 2 L12 10 L21 2" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function AvisoDeScroll({ texto, tono = 'papel', direccion = 'abajo', alTocar, className }: Props): React.JSX.Element {
  const costado = direccion === 'costado'
  const reducido = useMovimientoReducido()
  const ref = useRef<HTMLElement | null>(null)
  const aLaVista = useInView(ref)
  const comun = {
    'data-pieza': 'aviso-de-scroll',
    'data-tono': tono,
    'data-direccion': costado ? direccion : undefined,
    'data-quieto': reducido || !aLaVista ? '' : undefined,
    className: cn('text-tinta-tenue mx-auto flex flex-col items-center gap-[var(--spacing-2)] text-center', costado && 'flex-row gap-[var(--spacing-3)]', className),
  }
  const contenido = (
    <>
      <span className="text-cuerpo leading-texto">{texto}</span>
      <span data-parte="chevrones" className={costado ? 'flex items-center' : 'flex flex-col items-center'}>
        <Chevron costado={costado} />
        <Chevron costado={costado} className={cn(costado ? '-ml-[var(--spacing-1)]' : '-mt-[var(--spacing-1)]', 'opacity-60')} />
      </span>
    </>
  )
  if (alTocar === undefined) {
    return (
      <div ref={(el) => void (ref.current = el)} aria-hidden="true" {...comun}>
        {contenido}
      </div>
    )
  }
  return (
    <button ref={(el) => void (ref.current = el)} type="button" onClick={alTocar} {...comun} className={cn(comun.className, 'cursor-pointer rounded-[var(--radius-sutil)] px-[var(--spacing-4)] py-[var(--spacing-2)]')}>
      {contenido}
    </button>
  )
}
