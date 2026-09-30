import * as THREE from 'three'
import { mergeBufferGeometries, toCreasedNormals } from 'three-stdlib'

/**
 * [CALIDAD 1] B7 · LOS CANTOS DEL LOGO, SIN ESCALONES — el brillo de las paredes y del bisel corre parejo por la curva.
 *
 * `ExtrudeGeometry` arma una malla sin índices y le calcula las normales por cara: cada tramo recto con que se aproxima
 * una curva del SVG queda con SU normal, y en las paredes y el bisel el reflejo se prendía de a tramos (bandas de gris
 * constante, una por segmento: los «brillos escalonados»). No era un escalonado de píxel, era de facetas.
 *
 * Acá los COSTADOS (el grupo 1 de la extrusión: bisel de adelante, pared y bisel de atrás) llevan normales suaves entre
 * caras de menos de `PLIEGUE` (los tramos de una curva difieren en pocos grados; los anillos del bisel, en 18°), y las
 * esquinas del dibujo, que son de 90°, quedan duras. Las TAPAS (el grupo 0) no se tocan: suavizarlas con el bisel
 * inclinaría las normales de su borde y el degradé cruzaría la cara plana entera (sus triángulos son grandes). Los
 * triángulos, las posiciones y las coordenadas no cambian; sólo las normales de los costados.
 */
export const PLIEGUE = THREE.MathUtils.degToRad(40)

/** Las caras `[desde, desde + cuantos)` de una malla sin índices, como malla aparte (posición, normal y uv). */
function tramo(g: THREE.BufferGeometry, desde: number, cuantos: number): THREE.BufferGeometry {
  const t = new THREE.BufferGeometry()
  for (const nombre of ['position', 'normal', 'uv']) {
    const a = g.getAttribute(nombre)
    if (!(a instanceof THREE.BufferAttribute)) continue
    t.setAttribute(nombre, new THREE.BufferAttribute(a.array.slice(desde * a.itemSize, (desde + cuantos) * a.itemSize), a.itemSize))
  }
  return t
}

/** La extrusión con los costados suaves (y las tapas como estaban), con sus dos grupos. Libera la de entrada. */
export function conCantosSuaves(extrusion: THREE.BufferGeometry): THREE.BufferGeometry {
  const plana = extrusion.index === null ? extrusion : extrusion.toNonIndexed()
  const [tapas, costados] = plana.groups
  if (tapas === undefined || costados === undefined) return plana
  const partes = [tramo(plana, tapas.start, tapas.count), toCreasedNormals(tramo(plana, costados.start, costados.count), PLIEGUE)]
  const unida = mergeBufferGeometries(partes, true)
  for (const p of partes) p.dispose()
  if (unida === null) return plana
  if (plana !== extrusion) plana.dispose()
  extrusion.dispose()
  return unida
}
