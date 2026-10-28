'use client'

import { useEffect, type RefObject } from 'react'

import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../navegacion'
import { anotarTramo } from './tramoEstirado'

/** Lo que la escena ve de un bloque que no ve (px de la regla): casi nada. */
export const LARGO_DE_UN_BLOQUE_QUE_NO_SE_VE_PX = 9

/**
 * [L5] UN BLOQUE QUE LA ESCENA NO VE (REGLA DE ALTURAS) — un bloque del DOM que alarga su sección sin que `secciones.ts` lo declare (las
 * reseñas de la lista, el FAQ arriba del pie en el teléfono) se anota como tramo (`anotarTramo`): la escena lo ve como
 * `LARGO_DE_UN_BLOQUE_QUE_NO_SE_VE_PX` y lo que viene después no se corre. Se vuelve a anotar con cada cambio de tamaño. `alarga`: si en este
 * ancho el bloque alarga la sección (sin él, siempre); si no, no se anota. Salido de `ResenasEnLista` (C2-70t), igual.
 */
export function useTramoDelBloque(ref: RefObject<HTMLElement | null>, alarga: (el: HTMLElement) => boolean = () => true): void {
  useEffect(() => {
    const el = ref.current
    const panel = el?.closest('[data-panel]') ?? null
    if (el === null || panel === null) return undefined
    let soltar: (() => void) | null = null
    const anotar = (): void => {
      soltar?.()
      soltar = null
      const escala = window.innerHeight / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
      const alto = el.offsetHeight
      if (!alarga(el) || !(escala > 0) || alto <= 0) return
      const arranque = (el.getBoundingClientRect().top - panel.getBoundingClientRect().top) / escala
      const largo = LARGO_DE_UN_BLOQUE_QUE_NO_SE_VE_PX
      soltar = anotarTramo({ panel, k: (alto / escala + largo) / largo, arranque, largo })
    }
    anotar()
    const observador = new ResizeObserver(anotar)
    observador.observe(el)
    window.addEventListener('resize', anotar)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', anotar)
      soltar?.()
    }
    // `alarga` se lee en cada anotación: no rearma el efecto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}
