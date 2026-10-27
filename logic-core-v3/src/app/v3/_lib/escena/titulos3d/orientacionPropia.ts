import * as THREE from 'three'

import type { OrientacionPropia } from '../../titulos3d/acompanantes'
import { camaraDeLaLectura } from './colocacion'

/**
 * [C2-30f] LA ORIENTACIÓN PROPIA DE UN PLANO — las fotos del equipo, quietas en la escena: el plano de las personas no gira para
 * mirar a la cámara (no es un cartel que la sigue). Su orientación es la de la cámara del recorrido en su lectura (`lectura`, un
 * progreso de la coreografía: el momento en que el bloque de las personas está en el medio del cuadro), fija en el mundo: la
 * coreografía y el mouse la muestran de costado, en perspectiva. Para que se lea siempre, el ángulo entre el plano y la cámara
 * viva nunca pasa de `tope` (grados): pasado eso, el plano gira lo justo para quedarse en el tope (`orientacionAcotada`).
 *
 * Gira sobre el punto del plano que se ve en el medio del cuadro (`pivoteDeLaCaja`): lo que se lee queda donde el DOM lo puso y
 * lo de arriba y lo de abajo se alejan o se acercan. Pura salvo los objetos de three que recibe (el invariante la prueba sin
 * navegador): cero reservas por cuadro.
 */

const DE_LA_LECTURA = new THREE.PerspectiveCamera()
const EN_EL_MUNDO = new THREE.Vector3()
const CORRIDO = new THREE.Vector3()

/** La orientación propia: la de la cámara del recorrido en `lectura` (sin el mouse), para este cuadro y este logo. */
export function orientacionDeLaLectura(o: OrientacionPropia, aspecto: number, logoW: number, logoH: number, destino: THREE.Quaternion): THREE.Quaternion {
  return destino.copy(camaraDeLaLectura(o.lectura, aspecto, logoW, logoH, DE_LA_LECTURA).quaternion)
}

/** El ángulo entre dos orientaciones, en grados. */
export function anguloEntre(a: THREE.Quaternion, b: THREE.Quaternion): number {
  return THREE.MathUtils.radToDeg(a.angleTo(b))
}

/** La propia si está a `tope` grados o menos de la cámara; si no, la más cercana a la propia que queda en el tope. */
export function orientacionAcotada(propia: THREE.Quaternion, camara: THREE.Quaternion, tope: number, destino: THREE.Quaternion): THREE.Quaternion {
  const angulo = camara.angleTo(propia)
  const limite = THREE.MathUtils.degToRad(tope)
  if (angulo <= limite) return destino.copy(propia)
  return destino.copy(camara).slerp(propia, limite / angulo)
}

/**
 * El punto del plano (en em, desde el comienzo de la línea de base del título, como lo cuenta `cuadrilateroEnElPlano`) sobre el
 * que gira: el medio de la caja a lo ancho y, a lo alto, el medio del cuadro (acotado a la caja). Con el plano alejado, el medio
 * del cuadro es el punto fijo del alejamiento: se ve donde está.
 */
export function pivoteDeLaCaja(caja: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }, ancla: { readonly x: number; readonly y: number }, cuerpo: number, altoDelCuadro: number, destino: THREE.Vector3): THREE.Vector3 {
  const x = caja.x + caja.ancho / 2
  const y = Math.min(caja.y + caja.alto, Math.max(caja.y, altoDelCuadro / 2))
  return destino.set((x - ancla.x) / cuerpo, -(y - ancla.y) / cuerpo, 0)
}

/** Gira el plano (un grupo sin padre) a `orientacion` sobre su punto `pivote` (local): el pivote queda donde estaba. */
export function girarSobreElPivote(plano: THREE.Object3D, pivote: THREE.Vector3, orientacion: THREE.Quaternion): void {
  plano.updateMatrixWorld(true)
  EN_EL_MUNDO.copy(pivote).applyMatrix4(plano.matrixWorld)
  plano.quaternion.copy(orientacion)
  CORRIDO.copy(pivote).multiply(plano.scale).applyQuaternion(orientacion)
  plano.position.copy(EN_EL_MUNDO).sub(CORRIDO)
  plano.updateMatrixWorld(true)
}
