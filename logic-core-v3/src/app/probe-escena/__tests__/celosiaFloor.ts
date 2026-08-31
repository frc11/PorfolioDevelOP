import { celosiaCrossings, celosiaLayers } from '@/app/v3/_lib/escena/celosiaGeometry'
import { MOIRE_MISMATCH } from '@/app/v3/_lib/escena/probeMoire'

import { TAN_HALF_V, cameraAt, emptyPose, type Vec3 } from './harness'
import { rayFloor, track } from './frameProbe'
import { sunDirectionAt } from './shading'

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

const ASPECT = 16 / 9
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

export type FramePenumbra = {
  /** Cuántos rayos del cuadro pegaron en el piso Y cruzaron la capa fina. */
  readonly samples: number
  /** Percentiles 2 / 50 / 98 del ancho de borde EN CELDAS, familia `u`. */
  readonly min: number
  readonly median: number
  readonly max: number
  /** Los mismos extremos, en unidades de mundo sobre el papel. */
  readonly minWorld: number
  readonly maxWorld: number
}

/**
 * EL ANCHO DE BORDE TAL COMO CAE EN EL CUADRO, no en un punto elegido.
 *
 * Es el número que dice si la penumbra VARÍA donde el ojo la ve: un borde de
 * ancho uniforme se lee como baldosa por más blando que sea. Se muestrea la
 * grilla del cuadro, se descartan los rayos que no tocan piso, y se devuelven
 * los percentiles 2 / 50 / 98 — no el mínimo y el máximo crudos, que en la lonja
 * rasante contra el horizonte se disparan sobre un puñado de rayos.
 */
export function framePenumbraSpread(
  at: number,
  spread: number,
  columns = 84,
  rows = 48
): FramePenumbra | null {
  const cam = cameraAt(track, at, ASPECT, emptyPose())
  const tanH = TAN_HALF_V * ASPECT
  const sun = sunDirectionAt(at)
  const cells: number[] = []
  const world: number[] = []

  for (let iy = 0; iy < rows; iy += 1) {
    const ny = (((iy + 0.5) / rows) * 2 - 1) * TAN_HALF_V
    for (let ix = 0; ix < columns; ix += 1) {
      const nx = (((ix + 0.5) / columns) * 2 - 1) * tanH
      const raw: Vec3 = [
        cam.forward[0] + cam.right[0] * nx + cam.up[0] * ny,
        cam.forward[1] + cam.right[1] * nx + cam.up[1] * ny,
        cam.forward[2] + cam.right[2] * nx + cam.up[2] * ny,
      ]
      const length = Math.hypot(raw[0], raw[1], raw[2])
      const dir: Vec3 = [raw[0] / length, raw[1] / length, raw[2] / length]
      const t = rayFloor(cam.position, dir)
      if (!isFinite(t)) continue
      const point: Vec3 = [
        cam.position[0] + dir[0] * t,
        cam.position[1] + dir[1] * t,
        cam.position[2] + dir[2] * t,
      ]
      const crossing = celosiaCrossings(point, sun, LAYERS[0], 0, spread)[0]
      if (!crossing) continue
      const gradient = floorGradient(point, sun, LAYERS[0], 'u')
      if (!isFinite(gradient) || gradient <= 0) continue
      cells.push(crossing.penumbra.u)
      world.push(crossing.penumbra.u / gradient)
    }
  }
  if (cells.length < 20) return null
  cells.sort((a, b) => a - b)
  world.sort((a, b) => a - b)
  const at2 = (list: number[], f: number) => list[Math.min(list.length - 1, Math.floor(f * list.length))]
  return {
    samples: cells.length,
    min: at2(cells, 0.02),
    median: at2(cells, 0.5),
    max: at2(cells, 0.98),
    minWorld: at2(world, 0.02),
    maxWorld: at2(world, 0.98),
  }
}
