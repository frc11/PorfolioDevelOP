'use client'

import { useEffect, type RefObject } from 'react'

import { anotarTramo } from '../../_lib/escena/tramoEstirado'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'
import { seccionDe } from '../_contrato/forma'

/**
 * [B4] LA REGLA DE ALTURAS DE SERVICIOS — `secciones.ts` no se toca: la sección se anota como un tramo (`anotarTramo`) y la escena la
 * mide como medía la de antes.
 *
 *   · **Desde 1024**, la sección vieja medía la tabla (800svh: la pista se estiraba hasta llenarla). [C2-51] Ahora la pista es fija
 *     (700svh, `ALTO_DE_LA_PISTA_ANCHA`) y el recomendador crece hacia abajo con lo que muestra (las etapas, el resultado, el
 *     contacto): la sección mide más que la tabla. El tramo cubre la sección entera, con el alto viejo = las pantallas de la tabla
 *     por el alto del cuadro (`PANTALLAS_DE_LA_TABLA`) y `k` = alto nuevo / alto viejo. Si mide lo mismo (k = 1), no se anota nada.
 *   · **Abajo de 1024, la sección mide su contenido** (la tabla: `altoAngosto: 'contenido'`), y el contenido cambió. El tramo cubre la
 *     sección entera: arranca en su tope y la escena lo ve medir lo que medía la de antes (`altoViejoMedido`), con `k` = alto nuevo /
 *     alto viejo.
 *   · [NOCTURNO] **El alto viejo, MEDIDO** por el orquestador en la integración de antes de B4 (el dev, `[data-panel="servicios"]`):
 *     1661 px a 390×844; 1338 a 768×1024, 1382 a 820×1180 y 1555 a 1023×768. La sección vieja medía su contenido, así que su alto
 *     sale del ancho, no del alto del cuadro (en pantallas daba 1,31, 1,17 y 2,03 en los tres de tablet): de 768 a 1023, la recta
 *     entre 1338 y 1555 (820 cae a 1 px de la medida); abajo de 768, lo medido a 390.
 *
 * El gancho lo sigue al cambiar de alto (un `ResizeObserver` sobre la sección: cada etapa del recomendador, el resultado, el contacto)
 * y de ancho.
 */
export type AltoViejo = (ancho: number, alto: number) => number | null

/** Desde acá rige la tabla. */
export const ANCHO_DE_LA_TABLA_PX = 1024

/** [C2-51] Las pantallas que declara la tabla para Servicios (800svh): el alto viejo desde 1024. */
export const PANTALLAS_DE_LA_TABLA = Number.parseFloat(seccionDe('servicios').alto) / 100

/** La sección vieja: desde 1024, la tabla; abajo, medida (px). */
export const altoViejoMedido: AltoViejo = (ancho, alto) =>
  ancho >= ANCHO_DE_LA_TABLA_PX ? PANTALLAS_DE_LA_TABLA * alto : ancho >= 768 ? 1338 + ((1555 - 1338) * (ancho - 768)) / (1023 - 768) : 1661

/** [C2-51] Por debajo de esta diferencia (k − 1) el tramo no se anota: mide lo mismo que la tabla. */
export const K_SIN_TRAMO = 1e-3

/** El tramo de un ancho, o `null` si no hay (la sección mide lo mismo que antes, o sin el alto viejo). */
export function tramoDeServicios(ancho: number, alto: number, altoNuevo: number, viejo: AltoViejo = altoViejoMedido): { readonly k: number; readonly arranque: number; readonly largo: number } | null {
  if (!(alto > 0) || !(altoNuevo > 0)) return null
  const altoViejo = viejo(ancho, alto)
  if (altoViejo === null || !(altoViejo > 0)) return null
  const k = altoNuevo / altoViejo
  if (Math.abs(k - 1) < K_SIN_TRAMO) return null
  return { k, arranque: ALTO_DE_VIEWPORT_DE_LA_REFERENCIA, largo: (altoViejo * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA) / alto }
}

/** Anota el tramo de la sección y lo sigue al cambiar de alto (el recomendador, el ancho). */
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
