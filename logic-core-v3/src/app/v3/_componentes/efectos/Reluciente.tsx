'use client'

import { useInView } from 'motion/react'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

import { useMovimientoReducido } from '../../_lib/motion/reducido'

/**
 * [C2 · 20] RELUCIENTE (ítems 15 y 17 de la revisión) — un reflejo diagonal que barre el elemento cada tanto (una pasada por
 * `RELUCIENTE.cicloMs`) y que, con el mouse o el foco encima, arranca una pasada en el acto y repite más seguido y más claro: dice
 * «esto se toca». Sólo `transform` (en la caja) y `background-position` (en el texto): nada que fuerce el layout. Con movimiento reducido
 * o fuera de la pantalla, sin barrido. Las reglas, en `piezas.css`.
 *
 * Dos formas:
 *
 *   // En un botón (o cualquier caja con `relative` y `overflow-hidden`): una capa encima que hereda su redondeo.
 *   <button className="relative overflow-hidden rounded-…">Probar ahora<Reluciente /></button>
 *
 *   // En un texto (HABLANOS): el reflejo pasa por adentro de las letras (el texto se pinta con un degradé recortado a sus letras).
 *   <Reluciente como="texto">HABLANOS</Reluciente>
 *
 * El hover se toma del propio elemento o de la caja que lo contiene (`a`, `button`, o el padre directo de la capa). El reflejo es blanco:
 * se ve sobre letras y rellenos oscuros (la tinta del papel, un botón negro); sobre los claros apenas. Para un brillo en la escena 3D,
 * `RELUCIENTE` da el mismo ritmo.
 */
export const RELUCIENTE = {
  /** Una pasada cada tanto (ms): el `--reluciente-ciclo` de `piezas.css`. */
  cicloMs: 3500,
  /** Con el mouse o el foco encima (ms): `--reluciente-ciclo-vivo`. */
  cicloVivoMs: 1400,
  /** La fracción del ciclo que dura la pasada (el resto, quieto afuera): el paso de los fotogramas de `piezas.css`. */
  pasada: 0.3,
  /** La fracción de la pasada con el mouse encima. */
  pasadaViva: 0.55,
} as const

type Props =
  | { readonly como?: 'caja'; readonly className?: string }
  | { readonly como: 'letras'; readonly children: React.ReactNode; readonly className?: string }
  | { readonly como: 'texto'; readonly children: React.ReactNode; readonly className?: string }

export function Reluciente(props: Props): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const ref = useRef<HTMLSpanElement>(null)
  const aLaVista = useInView(ref)
  const quieto = reducido || !aLaVista ? '' : undefined
  // [L9a] Sólo la luz, recortada a las letras (el texto de abajo —o la escena 3D que lo reemplaza— no se pinta): se pone encima de él, con su misma letra.
  if (props.como === 'letras') {
    return (
      <span ref={ref} aria-hidden="true" data-reluciente="letras" data-quieto={quieto} className={props.className}>
        {props.children}
      </span>
    )
  }
  if (props.como === 'texto') {
    return (
      <span ref={ref} data-reluciente="texto" data-quieto={quieto} className={props.className}>
        {props.children}
      </span>
    )
  }
  return <span ref={ref} aria-hidden="true" data-reluciente="caja" data-quieto={quieto} className={cn(props.className)} />
}
