'use client'

import { useEffect, type RefObject } from 'react'

import { COMPOSICION_MIN_ANCHO_PX } from '../../_lib/compuerta'
import { anotarTramo, type TramoEstirado } from '../../_lib/escena/tramoEstirado'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'
import { altoViejoAngosto } from './geometria'

/**
 * [B6] EL TRAMO DE TU PANEL, ANOTADO A LA ESCENA — la REGLA DE ALTURAS (`_lib/escena/tramoEstirado.ts`; la tabla de
 * secciones no se toca).
 *
 * Desde 1024 la sección mide los 700svh de la tabla (`geometria.ts`: el respiro crece hasta llenarlos), así que no se anota
 * nada: `k = 1`. Abajo de 1024 mide su contenido, y el contenido cambió (de ocho features a tres módulos): la escena tiene
 * que seguir viendo lo que veía antes, así que la sección se anota como un tramo desde su tope (`arranque`: un alto de
 * ventana de la regla, el tope del panel), que la escena ve medir lo de antes (`largo`: el modelo del alto viejo, en px de
 * la regla) y que mide `k` veces eso (`k` = lo medido sobre lo de antes). Se vuelve a anotar al cambiar de tamaño.
 */
export function tramoDelPanel(panel: Element, altoMedido: number, anchoUtil: number, altoDeLaVentana: number): TramoEstirado {
  const viejo = altoViejoAngosto(anchoUtil)
  const escala = altoDeLaVentana / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
  return { panel, k: altoMedido / viejo, arranque: ALTO_DE_VIEWPORT_DE_LA_REFERENCIA, largo: viejo / escala }
}

/** Anota el tramo abajo de 1024 y lo sigue (el tamaño de la ventana y el alto de la sección). */
export function useTramoDelPanel(raiz: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = raiz.current
    const panel = el?.closest('[data-panel]') ?? null
    if (el === null || panel === null) return undefined
    let soltar = (): void => undefined
    const anotar = (): void => {
      soltar()
      soltar = () => undefined
      const ventana = window.innerHeight
      if (window.innerWidth >= COMPOSICION_MIN_ANCHO_PX || !(ventana > 0)) return
      soltar = anotarTramo(tramoDelPanel(panel, panel.getBoundingClientRect().height, el.clientWidth, ventana))
    }
    const medida = new ResizeObserver(anotar)
    medida.observe(panel)
    window.addEventListener('resize', anotar)
    anotar()
    return () => {
      medida.disconnect()
      window.removeEventListener('resize', anotar)
      soltar()
    }
  }, [raiz])
}
