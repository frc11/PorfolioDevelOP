import { celosiaCrossings, celosiaLayers } from '@/app/v3/_lib/escena/celosiaGeometry'
import { MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'

import type { Vec3 } from './harness'

/**
 * EL ANCHO DE BORDE SOBRE EL PISO (S12) — la penumbra donde se ve.
 *
 * `celosiaPenumbra.ts` da el ancho en CELDAS de la trama, que es la unidad en la
 * que trabaja la barra. Este archivo lo baja a donde el ojo lo juzga: unidades
 * de mundo sobre el papel, y **cómo varía dentro de un cuadro**.
 *
 * La conversión es una división por el gradiente de la fase sobre el piso
 * —`mundo = celdas / gradiente`— y de paso deja a la vista por qué la fracción
 * de celda y el ancho en mundo pueden ir para lados distintos: entre p=0 y p=1
 * la celda proyectada se estira ×3,6, así que un borde que en celdas se achica
 * 32% en mundo parece ensancharse ×2,4. **Lo que se ve es la fracción.**
 *
 * Vive aparte de `celosiaBeat.ts` por el límite de 300 líneas y porque son dos
 * preguntas distintas: allá, cuánto MODULA la trama; acá, cuánto mide su borde.
 */

const LAYERS = celosiaLayers(MOIRE_MISMATCH)

/**
 * El gradiente 2D de una fase sobre el piso, en celdas por unidad de mundo. Es
 * lo que convierte un ancho de penumbra en CELDAS a un ancho en MUNDO sobre el
 * papel: `mundo = celdas / gradiente`.
 */
export function floorGradient(
  p: Vec3,
  sun: Vec3,
  layer: (typeof LAYERS)[number],
  pick: 'u' | 'v'
): number {
  const eps = 0.01
  const at = (q: Vec3) => {
    const c = celosiaCrossings(q, sun, layer, 0)[0]
    return c ? c[pick] : NaN
  }
  const here = at(p)
  const dx = (at([p[0] + eps, p[1], p[2]]) - here) / eps
  const dz = (at([p[0], p[1], p[2] + eps]) - here) / eps
  return Math.hypot(dx, dz)
}

export type FloorPenumbra = {
  /** Nombre de la capa: `fina` (radio 38) o `gruesa` (radio 44). */
  readonly layer: string
  /** Distancia del punto del piso al cruce, en mundo. El `t` del modelo. */
  readonly t: number
  /** Ancho en CELDAS — o sea, directamente, qué fracción de la celda mide. */
  readonly cellsU: number
  readonly cellsV: number
  /** Ancho en unidades de mundo SOBRE EL PISO. */
  readonly worldU: number
  readonly worldV: number
  /** La celda proyectada sobre el piso, para poder leer la fracción. */
  readonly cellWorldU: number
  readonly cellWorldV: number
}

/** El ancho de penumbra de las dos capas en un punto del piso. */
export function floorPenumbraAt(p: Vec3, sun: Vec3, spread: number): (FloorPenumbra | null)[] {
  return LAYERS.map((layer, i) => {
    const crossing = celosiaCrossings(p, sun, layer, 0, spread)[0]
    if (!crossing) return null
    const gu = floorGradient(p, sun, layer, 'u')
    const gv = floorGradient(p, sun, layer, 'v')
    return {
      layer: i === 0 ? 'fina' : 'gruesa',
      t: crossing.t,
      cellsU: crossing.penumbra.u,
      cellsV: crossing.penumbra.v,
      worldU: crossing.penumbra.u / gu,
      worldV: crossing.penumbra.v / gv,
      cellWorldU: 1 / gu,
      cellWorldV: 1 / gv,
    }
  })
}

