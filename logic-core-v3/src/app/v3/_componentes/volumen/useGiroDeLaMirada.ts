'use client'

import { useEffect, type RefObject } from 'react'

import { giroDeLaPieza, suscribirALaMirada } from '../../_lib/escena/miradaDeLaCamara'

/**
 * [CIERRE RETOQUE 3D] D1 · UNA PIEZA DE CSS 3D FIJA EN EL MUNDO — escribe en `ref` el giro al revés de lo que el mouse le
 * suma a la cámara (`miradaDeLaCamara.ts`): cuando el paralaje corre la cámara, la pieza no la acompaña y se le ve la
 * perspectiva y los costados, como a los títulos de la escena. Sin estado de React (a mano, en el cuadro de la escena); sin
 * escena (abajo de 1025, movimiento reducido) la mirada vale cero y la pieza queda de frente.
 */
export function useGiroDeLaMirada(ref: RefObject<HTMLElement | null>, activo = true): void {
  useEffect(() => {
    if (!activo) return undefined
    const desuscribir = suscribirALaMirada((m) => {
      if (ref.current !== null) ref.current.style.transform = giroDeLaPieza(m)
    })
    const el = ref.current
    return () => {
      desuscribir()
      // Si deja de valer (el ancho cruzó el umbral), la pieza vuelve a quedar de frente.
      if (el !== null) el.style.transform = ''
    }
  }, [ref, activo])
}
