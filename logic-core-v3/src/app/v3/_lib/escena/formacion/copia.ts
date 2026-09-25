import * as THREE from 'three'

import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../probeScene'
import type { Caja } from './enFormacion'
import { FRONTERAS_SVG, enLaRegion, type Fronteras, type Region } from './regiones'

/**
 * [ESCENA 4] LA COPIA — la malla del logo, para instanciar. No se modela otra: son las mismas formas
 * del mismo SVG (`ProbeLogo.tsx`), con la misma profundidad, la misma escala y el mismo volteo,
 * horneadas para que una copia quede parada con el pie en y = 0 y centrada en x y z.
 *
 * Va con menos puntos por curva y sin bisel: ~930 triángulos contra los ~10.900 del logo. Las copias
 * están a 40 o más de la cámara y desenfocadas; la diferencia no llega a un píxel.
 */
export const PUNTOS_POR_CURVA = 6

export interface CopiaHorneada {
  readonly geometria: THREE.ExtrudeGeometry
  /** Las fronteras de las partes, en el espacio de la copia. */
  readonly fronteras: Fronteras
  /** La caja de lo que queda de la malla en una región (para apoyar cada pieza en el piso). */
  readonly caja: (region: Region, corte: number) => Caja
}

export function copiaHorneada(formas: THREE.Shape[]): CopiaHorneada {
  const geometria = new THREE.ExtrudeGeometry(formas, { depth: PROBE_EXTRUDE.depth, bevelEnabled: false, curveSegments: PUNTOS_POR_CURVA })
  geometria.scale(PROBE_SVG_SCALE, PROBE_SVG_SCALE, PROBE_SVG_SCALE)
  // El volteo del SVG, que viene con Y para abajo: el mismo `[π, 0, 0]` del logo.
  geometria.rotateX(Math.PI)
  geometria.computeBoundingBox()
  const bruta = geometria.boundingBox ?? new THREE.Box3()
  const centro = bruta.getCenter(new THREE.Vector3())
  const piso = bruta.min.y
  geometria.translate(-centro.x, -piso, -centro.z)
  geometria.computeBoundingBox()
  geometria.computeBoundingSphere()

  // Del SVG al espacio de la copia: la misma escala, el mismo volteo y el mismo corrimiento.
  const x = (svg: number): number => svg * PROBE_SVG_SCALE - centro.x
  const y = (svg: number): number => -svg * PROBE_SVG_SCALE - piso
  const fronteras: Fronteras = {
    corteCP: x(FRONTERAS_SVG.corteCP),
    paloDesde: x(FRONTERAS_SVG.paloDesde),
    paloHasta: x(FRONTERAS_SVG.paloHasta),
    paloArriba: y(FRONTERAS_SVG.paloArriba),
  }

  const posiciones = geometria.getAttribute('position')
  const medioEspesor = ((geometria.boundingBox?.max.z ?? 0) - (geometria.boundingBox?.min.z ?? 0)) / 2
  const caja = (region: Region, corte: number): Caja => {
    let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity]
    for (let i = 0; i < posiciones.count; i += 1) {
      const px = posiciones.getX(i)
      const py = posiciones.getY(i)
      if (!enLaRegion(px, py, region, corte, fronteras)) continue
      x0 = Math.min(x0, px)
      x1 = Math.max(x1, px)
      y0 = Math.min(y0, py)
      y1 = Math.max(y1, py)
    }
    return { x0, x1, y0, y1, z0: -medioEspesor, z1: medioEspesor }
  }
  return { geometria, fronteras, caja }
}
