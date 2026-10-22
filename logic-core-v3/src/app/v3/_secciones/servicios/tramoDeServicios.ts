'use client'

import { useEffect, type RefObject } from 'react'

import { anotarTramo } from '../../_lib/escena/tramoEstirado'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'

/**
 * [B4] LA REGLA DE ALTURAS DE SERVICIOS — `secciones.ts` no se toca: la sección se anota como un tramo (`anotarTramo`) y la escena la
 * mide como medía la de antes.
 *
 *   · **Desde 1024, k = 1 y no hay tramo.** El `<section>` lleva el piso de la tabla (800svh, un `min-height` que la sección no puede
 *     bajar sin tocar la tabla o `Panel`), y la sección nueva lo llena exacto: la pista se estira (`flex-1`) hasta lo que deja el
 *     recomendador. Mide lo mismo que la de antes, y lo corto es la experiencia: cuatro gestos.
 *   · **Abajo de 1024, la sección mide su contenido** (la tabla: `altoAngosto: 'contenido'`), y el contenido cambió. El tramo cubre la
 *     sección entera: arranca en su tope y la escena lo ve medir lo que medía la de antes (`altoViejoMedido`), con `k` = alto nuevo /
 *     alto viejo.
 *   · [NOCTURNO] **El alto viejo, MEDIDO** por el orquestador en la integración de antes de B4 (el dev, `[data-panel="servicios"]`):
 *     1661 px a 390×844; 1338 a 768×1024, 1382 a 820×1180 y 1555 a 1023×768. La sección vieja medía su contenido, así que su alto
 *     sale del ancho, no del alto del cuadro (en pantallas daba 1,31, 1,17 y 2,03 en los tres de tablet): de 768 a 1023, la recta
 *     entre 1338 y 1555 (820 cae a 1 px de la medida); abajo de 768, lo medido a 390.
 */
export type AltoViejo = (ancho: number, alto: number) => number | null

/** La sección vieja, medida (px). */
export const altoViejoMedido: AltoViejo = (ancho) => (ancho >= 768 ? 1338 + ((1555 - 1338) * (ancho - 768)) / (1023 - 768) : 1661)

/** Desde acá rige la tabla (k = 1). */
export const ANCHO_DE_LA_TABLA_PX = 1024

/** El tramo de un ancho, o `null` si no hay (desde 1024, o sin el alto viejo). */
export function tramoDeServicios(ancho: number, alto: number, altoNuevo: number, viejo: AltoViejo = altoViejoMedido): { readonly k: number; readonly arranque: number; readonly largo: number } | null {
  if (ancho >= ANCHO_DE_LA_TABLA_PX || !(alto > 0) || !(altoNuevo > 0)) return null
  const altoViejo = viejo(ancho, alto)
  if (altoViejo === null || !(altoViejo > 0)) return null
  return { k: altoNuevo / altoViejo, arranque: ALTO_DE_VIEWPORT_DE_LA_REFERENCIA, largo: (altoViejo * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA) / alto }
}

/** Anota el tramo de la sección y lo sigue al cambiar de alto (el resultado del recomendador, el ancho). */
export function useTramoDeServicios(caja: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const panel = caja.current?.closest('[data-panel]') ?? null
    if (panel === null) return undefined
    let soltar: (() => void) | null = null
    const anotar = (): void => {
      soltar?.()
      soltar = null
      const tramo = tramoDeServicios(window.innerWidth, window.innerHeight, panel.getBoundingClientRect().height)
      if (tramo !== null) soltar = anotarTramo({ panel, ...tramo })
    }
    anotar()
    const observador = new ResizeObserver(anotar)
    observador.observe(panel)
    window.addEventListener('resize', anotar)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', anotar)
      soltar?.()
    }
  }, [caja])
}
