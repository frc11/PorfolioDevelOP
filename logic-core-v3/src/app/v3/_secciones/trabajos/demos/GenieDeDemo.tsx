'use client'

import { useCallback, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from 'react'

import type { Demo } from './catalogo'
import { CromoDeLaVentana } from './CromoDeLaVentana'
import { TIRAS_DEL_GENIE, esquinasDeLaTira, liderDelGenie, matrizDeLaTira, type Caja } from './genie'

/**
 * EL GENIE, EN EL DOCUMENTO — la ventana partida en tiras que se curvan. **[DEMOS]**
 *
 * Cada tira es una ventana ENTERA —el cromo y la portada horizontal del template—
 * vista por una rendija de su alto: la rendija recorta y `matrix3d` la lleva a su
 * cuadrilátero (`genie.ts`). La demo viva no se anima nunca: durante el Genie lo que
 * se curva es la portada, y al terminar la apertura el iframe se funde encima.
 *
 * ⚠️ **Las rendijas se pisan una fila de píxel** (`SOLAPE`): dos cuadriláteros que
 * comparten un borde lo suavizan cada uno por su lado y entre los dos queda una
 * costura clara. Con el pisado, la de abajo tapa la costura de la de arriba.
 *
 * `pintar(m)` escribe las 60 transformadas de un cuadro; no hay estado de React.
 * Se expone por la `ref` del componente, que es lo que la ventana llama cuadro a
 * cuadro.
 */

/** Cuánto pisa cada tira a la siguiente, en fracción del alto: un píxel sobre 720. */
const SOLAPE = 1 / 720

/**
 * ⚠️ **EL CROMO VA SÓLO EN LAS TIRAS QUE LO TOCAN.** Una copia entera de la ventana
 * por tira eran 60 cromos —con su texto y su ícono— montados en el cuadro del clic,
 * y la apertura perdía cuadros al arrancar (medido: 6 de más de 20 ms). Las tiras
 * de abajo del cromo son sólo la portada, corrida el alto del cromo, que se MIDE
 * en la primera copia: los tokens están en `rem` y el alto no se adivina.
 */
const ALTO_MAXIMO_DEL_CROMO = 140

export interface ControlDelGenie {
  readonly pintar: (m: number) => void
}

export function GenieDeDemo({
  demo,
  ventana,
  destino,
  ref,
}: {
  readonly demo: Demo
  /** La caja de la ventana abierta, plana. */
  readonly ventana: Caja
  /** La caja del libro: de donde sale y adonde vuelve. */
  readonly destino: Caja
  readonly ref?: Ref<ControlDelGenie>
}): React.JSX.Element {
  const tiras = useRef<(HTMLDivElement | null)[]>([])
  const primera = useRef<HTMLDivElement | null>(null)
  const [cromo, setCromo] = useState(0)
  const alto = ventana.alto / TIRAS_DEL_GENIE
  const conCromo = Math.ceil(ALTO_MAXIMO_DEL_CROMO / alto)

  useLayoutEffect(() => {
    const medido = primera.current?.querySelector<HTMLElement>('[data-parte="cromo"]')?.offsetHeight ?? 0
    if (medido > 0) setCromo(medido)
  }, [])
  const lider = liderDelGenie(ventana, destino)

  const pintar = useCallback(
    (m: number): void => {
      for (let i = 0; i < TIRAS_DEL_GENIE; i += 1) {
        const tira = tiras.current[i]
        if (tira === null || tira === undefined) continue
        const esquinas = esquinasDeLaTira(i, TIRAS_DEL_GENIE, m, ventana, destino, lider, SOLAPE)
        tira.style.setProperty('transform', matrizDeLaTira(esquinas, ventana.ancho, alto + ventana.alto * SOLAPE))
      }
    },
    [ventana, destino, lider, alto],
  )
  useImperativeHandle(ref, () => ({ pintar }), [pintar])

  const portada = { backgroundImage: `url(${demo.ventana})`, backgroundSize: 'cover', backgroundPosition: 'top center' } as const

  return (
    <div data-pieza="genie" aria-hidden="true" className="pointer-events-none fixed inset-0">
      {Array.from({ length: TIRAS_DEL_GENIE }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            tiras.current[i] = el
          }}
          className="absolute top-0 left-0 overflow-hidden will-change-transform"
          style={{ width: ventana.ancho, height: alto + ventana.alto * SOLAPE, transformOrigin: '0 0', transform: 'scale(0)' }}
        >
          {i < conCromo ? (
            <div
              ref={i === 0 ? primera : undefined}
              data-seccion="invertida"
              className="bg-tinta text-fondo rounded-sutil absolute left-0 flex flex-col"
              style={{ top: -i * alto, width: ventana.ancho, height: ventana.alto }}
            >
              <CromoDeLaVentana demo={demo} />
              <div className="min-h-0 flex-1" style={portada} />
            </div>
          ) : (
            <div className="absolute left-0" style={{ ...portada, top: cromo - i * alto, width: ventana.ancho, height: ventana.alto - cromo }} />
          )}
        </div>
      ))}
    </div>
  )
}
