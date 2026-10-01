'use client'

import { useEffect } from 'react'

import { usePrueba } from '../../../_lib/pruebasDeLaInterfaz'
import { ondear } from './ondaDeLaPortada'

/**
 * [INTERFAZ 2] T3 · Las portadas del estante ondean al pasar el puntero (con `?pruebas=vida=si`): la onda nace donde
 * entró el puntero y cruza la imagen antes de abrir la demo (`ondaDeLaPortada.ts`).
 *
 * Un escucha delegado en el documento: la biblioteca no se toca (su hover de CSS, el cartel y la precarga siguen
 * iguales). Sólo con puntero fino (en el teléfono las demos son un carrusel que se toca, sin «encima») y sin movimiento
 * reducido (ahí el estante es la cinta quieta).
 */
export const SELECTOR_DE_LOS_LIBROS = '[data-pieza="libro"]'

export function OndaDeLasPortadas(): null {
  const vida = usePrueba('vida')

  useEffect(() => {
    if (vida !== 'si') return undefined
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)')
    let actual: Element | null = null
    let cortar: () => void = () => undefined

    const alPasar = (e: PointerEvent): void => {
      if ((e.pointerType !== 'mouse' && e.pointerType !== 'pen') || !fino.matches || reducido.matches) return
      const libro = e.target instanceof Element ? e.target.closest(SELECTOR_DE_LOS_LIBROS) : null
      if (libro === actual) return
      actual = libro
      const imagen = libro?.querySelector<HTMLElement>('[data-parte="cara"] img') ?? null
      if (imagen === null) return
      // El punto de entrada, en px de la imagen sin transformar (la cara está girada como un libro: se aproxima por su caja).
      const caja = imagen.getBoundingClientRect()
      const x = ((e.clientX - caja.left) / Math.max(1, caja.width)) * imagen.offsetWidth
      const y = ((e.clientY - caja.top) / Math.max(1, caja.height)) * imagen.offsetHeight
      cortar = ondear(imagen, x, y)
    }

    document.addEventListener('pointerover', alPasar, { passive: true })
    return () => {
      document.removeEventListener('pointerover', alPasar)
      cortar()
    }
  }, [vida])

  return null
}
