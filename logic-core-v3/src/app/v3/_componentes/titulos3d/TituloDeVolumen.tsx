'use client'

import type { MotionValue } from 'motion/react'
import { useRef } from 'react'

import { useTituloDeVolumen, useTitulosDeVolumen, type TituloDeVolumen as Titulo } from '../../_lib/titulos3d/registro'

/**
 * [ESCENA 10] T3 · EL TÍTULO DE VOLUMEN, en el DOM — con la prueba (`titulos=negro|blanco`), el texto queda entero para
 * los lectores de pantalla y los buscadores (`sr-only`) y, al lado, el mismo texto invisible y sin anunciar: guarda el
 * lugar (el renglón no se corre) y es de donde la escena lee la caja, el cuerpo y la x de cada letra. Lo que se ve es el
 * título extruido de la escena (`escena/titulos3d/`), que va con `aria-hidden` porque vive en el lienzo. Sin la prueba,
 * el texto de siempre.
 */
export function TituloDeVolumen({
  id,
  texto,
  lectura,
  subida,
  llegada,
  salida,
}: {
  readonly id: string
  readonly texto: string
  readonly lectura: Titulo['lectura']
  readonly subida?: number
  /** Cuánto llegó la pieza (`null`: quieta, llegada). */
  readonly llegada: MotionValue<number> | null
  readonly salida: MotionValue<number> | null
}): React.JSX.Element {
  const prueba = useTitulosDeVolumen()
  const lugar = useRef<HTMLSpanElement | null>(null)
  useTituloDeVolumen({ id, texto, lugar, lectura, subida, llegada, salida, activo: prueba !== 'no' })
  if (prueba === 'no') return <>{texto}</>
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span ref={lugar} aria-hidden="true" className="invisible block">
        {texto}
      </span>
    </>
  )
}
