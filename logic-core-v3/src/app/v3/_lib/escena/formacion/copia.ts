import * as THREE from 'three'

import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../probeScene'
import type { Caja } from './enFormacion'
import { FRONTERAS_SVG, enLaRegion, type Fronteras, type Region } from './regiones'

/**
 * [ESCENA 5] LA COPIA — la malla del logo, simplificada para instanciar. No se modela otra: son las
 * mismas formas del mismo SVG (`ProbeLogo.tsx`), con la misma profundidad, la misma escala y el
 * mismo volteo, horneadas para que una copia quede parada con el pie en y = 0 y centrada en x y z.
 *
 * **Simplificada, porque la niebla lo permite.** La copia más cercana queda a más de 60 de la cámara
 * y detrás de la bruma: va con 2 puntos por curva, sin bisel y SIN LA TAPA DE ATRÁS, que desde
 * adentro del cilindro no se ve nunca (todas miran al escenario, y la cámara vive adentro). Queda
 * la tapa de adelante y el canto, que es lo que dice que la pieza tiene espesor.
 */
export const PUNTOS_POR_CURVA = 2

export interface CopiaHorneada {
  readonly geometria: THREE.BufferGeometry
  /** Las fronteras de las partes, en el espacio de la copia. */
  readonly fronteras: Fronteras
  /** La caja de lo que queda de la malla en una región (para apoyar cada pieza en el piso). */
  readonly caja: (region: Region, corte: number) => Caja
}

export function copiaHorneada(formas: THREE.Shape[]): CopiaHorneada {
  const extruida = new THREE.ExtrudeGeometry(formas, { depth: PROBE_EXTRUDE.depth, bevelEnabled: false, curveSegments: PUNTOS_POR_CURVA })
  extruida.scale(PROBE_SVG_SCALE, PROBE_SVG_SCALE, PROBE_SVG_SCALE)
  // El volteo del SVG, que viene con Y para abajo: el mismo `[π, 0, 0]` del logo.
  extruida.rotateX(Math.PI)
  const geometria = sinLaTapaDeAtras(extruida)
  extruida.dispose()
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

/** La misma malla sin los triángulos que miran para atrás (−z): la tapa de atrás. */
function sinLaTapaDeAtras(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const plana = g.index === null ? g : g.toNonIndexed()
  const posicion = plana.getAttribute('position')
  const normal = plana.getAttribute('normal')
  const uv = plana.getAttribute('uv')
  const quedan: number[] = []
  for (let t = 0; t < posicion.count; t += 3) {
    let atras = true
    for (let k = 0; k < 3; k += 1) if (normal.getZ(t + k) > -0.99) atras = false
    if (!atras) quedan.push(t)
  }
  const copiar = (a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, lado: number): THREE.BufferAttribute => {
    const datos = new Float32Array(quedan.length * 3 * lado)
    quedan.forEach((t, i) => {
      for (let k = 0; k < 3; k += 1) for (let c = 0; c < lado; c += 1) datos[(i * 3 + k) * lado + c] = a.getComponent(t + k, c)
    })
    return new THREE.BufferAttribute(datos, lado)
  }
  const salida = new THREE.BufferGeometry()
  salida.setAttribute('position', copiar(posicion, 3))
  salida.setAttribute('normal', copiar(normal, 3))
  if (uv !== undefined) salida.setAttribute('uv', copiar(uv, 2))
  if (plana !== g) plana.dispose()
  return salida
}
