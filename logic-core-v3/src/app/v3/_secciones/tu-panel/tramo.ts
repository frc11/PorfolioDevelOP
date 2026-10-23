'use client'

import { useEffect, type RefObject } from 'react'

import { COMPOSICION_MIN_ANCHO_PX } from '../../_lib/compuerta'
import { anotarTramo, type TramoEstirado } from '../../_lib/escena/tramoEstirado'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'
import { altoViejo } from './geometria'

/**
 * [B6] EL TRAMO DE TU PANEL, ANOTADO A LA ESCENA — la REGLA DE ALTURAS (`_lib/escena/tramoEstirado.ts`; la tabla de
 * secciones no se toca).
 *
 * [C2 60b] EN TODO ANCHO. La sección mide su contenido (ya no llena los 700svh de la tabla desde 1024: los espacios se
 * achicaron), así que se anota como un tramo desde su tope (`arranque`: un alto de ventana de la regla, el tope del panel),
 * que la escena ve medir lo de antes (`largo`: el alto viejo en px de la regla) y que mide `k` veces eso (`k` = lo medido
 * sobre lo de antes, MEDIDO en cada carga: no hay que calibrarlo). Lo de antes: desde 1024, las pantallas de la tabla (7);
 * abajo, el modelo calibrado de la sección de antes de B6 (`altoViejoAngosto`). Se vuelve a anotar al cambiar de tamaño.
 */
export function tramoDelPanel(panel: Element, altoMedido: number, anchoUtil: number, altoDeLaVentana: number, escritorio: boolean, pantallasDeLaTabla: number): TramoEstirado {
  const viejo = altoViejo(escritorio, anchoUtil, altoDeLaVentana, pantallasDeLaTabla)
  const escala = altoDeLaVentana / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
  return { panel, k: altoMedido / viejo, arranque: ALTO_DE_VIEWPORT_DE_LA_REFERENCIA, largo: viejo / escala }
}

/** Anota el tramo y lo sigue (el tamaño de la ventana y el alto de la sección). `pantallasDeLaTabla`: lo que declara la tabla. */
export function useTramoDelPanel(raiz: RefObject<HTMLElement | null>, pantallasDeLaTabla: number): void {
  useEffect(() => {
    const el = raiz.current
    const panel = el?.closest('[data-panel]') ?? null
    if (el === null || panel === null) return undefined
    let soltar = (): void => undefined
    const anotar = (): void => {
      soltar()
      soltar = () => undefined
      const ventana = window.innerHeight
      if (!(ventana > 0)) return
      const escritorio = window.innerWidth >= COMPOSICION_MIN_ANCHO_PX
      soltar = anotarTramo(tramoDelPanel(panel, panel.getBoundingClientRect().height, el.clientWidth, ventana, escritorio, pantallasDeLaTabla))
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
  }, [raiz, pantallasDeLaTabla])
}
