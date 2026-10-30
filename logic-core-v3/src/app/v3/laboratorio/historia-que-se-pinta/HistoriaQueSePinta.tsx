'use client'

import { useRef } from 'react'

import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { PalabrasPintables, estiloDelBloquePintado, usePintadoDelBloque } from '../_lab/usePintadoDelBloque'
import { HISTORIA } from './historia'

/**
 * [L7e · N2] LA HISTORIA QUE SE PINTA — la historia de develOP en palabras de Valentino, entera, grande y palabra por palabra: lo que
 * ya leíste queda en tinta, lo que viene, en el gris del 18 % (`PRESENCIA_SIN_PINTAR`). Es el cálculo del título del Panel
 * (`_componentes/pintado/`, importado) estirado a un texto largo: el avance no sale del centro del título sino de cuánto del bloque ya
 * pasó por la línea de lectura (el 60 % de la pantalla). Las frases que importan van en el otro registro (la display en mayúsculas).
 * Con movimiento reducido, todo pintado.
 */
export function HistoriaQueSePinta(): React.JSX.Element {
  const bloque = useRef<HTMLDivElement>(null)
  const reducido = usePrefiereMenosMovimiento()
  usePintadoDelBloque(bloque, !reducido)
  return (
    <>
      <header className="mx-auto max-w-5xl px-6 pt-36 pb-[30svh] escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Nosotros · la historia</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">Esto no es</span>
          <span className="block font-liviano tracking-titulo italic uppercase">un proyecto aislado</span>
        </h1>
        <p className="mt-6 text-cuerpo text-tinta-media">Bajá despacio: se lee al ritmo del scroll.</p>
      </header>
      <div ref={bloque} className="mx-auto max-w-5xl px-6 pb-[60svh]" style={estiloDelBloquePintado()}>
        {HISTORIA.map((parrafo, k) => (
          <p key={k} className="mb-[0.9em] text-titulo-s leading-titulo tablet:text-titulo-m escritorio:text-titulo-l">
            {parrafo.map((tramo, j) => (
              <span key={j} className={tramo.destacado === true ? 'font-display font-fuerte tracking-display uppercase' : undefined}>
                <PalabrasPintables texto={tramo.texto} />
              </span>
            ))}
          </p>
        ))}
      </div>
    </>
  )
}
