'use client'

import { useRef } from 'react'

import { Titular } from '../../_componentes/tipografia/Titular'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

import { PalabrasPintables, estiloDelBloquePintado, usePintadoDelBloque } from '../_movimiento/pintado'

/** La línea de lectura del pintado (fracción del alto del cuadro desde arriba): la del prototipo. */
export const LINEA_DEL_PINTADO = 0.55

/**
 * [M2] LA FRASE DESTACADA QUE SE PINTA — una frase de la nota, grande, con el filete de tinta a la izquierda, que se pinta palabra por palabra
 * de gris a tinta a medida que pasa por la línea de lectura (el pintado del título del Panel). Es una frase que YA está en el párrafo de arriba:
 * se repite grande como cita, así que para el lector se esconde (`aria-hidden`: no la lee dos veces).
 */
export function FraseDestacada({ frase }: { readonly frase: string }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const caja = useRef<HTMLQuoteElement>(null)
  usePintadoDelBloque(caja, !reducido, LINEA_DEL_PINTADO)
  return (
    <blockquote ref={caja} aria-hidden="true" data-pieza="frase-destacada" className="my-[var(--spacing-8)] border-l-[length:calc(var(--border-hairline)*3)] border-tinta pl-[var(--spacing-6)]" style={estiloDelBloquePintado()}>
      <Titular nivel="titulo-m" como="p">
        <PalabrasPintables texto={frase} />
      </Titular>
    </blockquote>
  )
}
