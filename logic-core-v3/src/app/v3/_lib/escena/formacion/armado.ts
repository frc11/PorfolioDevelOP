import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'
import { copiaHorneada } from './copia'
import { APOYAR_EN_EL_PISO, FORMACION, formar, type Caja, type Copia, type Pieza } from './enFormacion'
import { materialDeLaCopia, type UniformsDeLaCopia } from './materiales'

/**
 * [ESCENA 5] EL ARMADO DE LA FORMACIÓN — lo que se construye una vez: las piezas, todas en UNA malla
 * instanciada (una llamada de dibujo). Sin React: `Formacion.tsx` lo monta y le escribe cada cuadro.
 */

export interface Armado {
  readonly copias: readonly Copia[]
  readonly instancias: THREE.InstancedMesh
  readonly copia: UniformsDeLaCopia
  /** Los triángulos de UNA pieza: cada pieza dibuja la malla entera y descarta lo que no es suyo. */
  readonly triangulosPorPieza: number
  readonly soltar: () => void
}

/** La altura del piso de la formación. */
export const PISO_DE_ABAJO = FLOOR_Y - FORMACION.desnivel

/** Cuántas copias caen adentro del cuadro (para el banco). */
export function contarVisibles(copias: readonly Copia[], camara: THREE.Camera): number {
  const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camara.projectionMatrix, camara.matrixWorldInverse))
  const punto = new THREE.Vector3()
  return copias.filter((c) => frustum.containsPoint(punto.set(c.x, PISO_DE_ABAJO + 2.2 * FORMACION.escala, c.z))).length
}

const lineal = (srgb: number): number => (srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4)

export function armar(formas: THREE.Shape[], movil: boolean, sobreBloques: boolean): Armado {
  const horneada = copiaHorneada(formas)
  const caja = horneada.geometria.boundingBox ?? new THREE.Box3()
  const medidas = { ancho: caja.max.x - caja.min.x, alto: caja.max.y - caja.min.y, caja: horneada.caja }
  const copias = formar(medidas, { movil })
  const piezas = copias.flatMap((copia) => copia.piezas.map((pieza) => ({ copia, pieza })))

  const copia: UniformsDeLaCopia = { uMirada: { value: 0 }, uVisible: { value: 1 } }
  const material = materialDeLaCopia(horneada.fronteras, copia, sobreBloques)
  const instancias = new THREE.InstancedMesh(horneada.geometria, material, piezas.length)
  instancias.frustumCulled = false
  const datosDePieza = new Float32Array(piezas.length * 4)
  const datosDeAncla = new Float32Array(piezas.length * 4)
  const e = FORMACION.escala
  piezas.forEach(({ copia: c, pieza }, i) => {
    const local = matrizDeLaPieza(pieza, APOYAR_EN_EL_PISO.has(c.falla) ? horneada.caja(pieza.region, pieza.corte) : null)
    const m = new THREE.Matrix4()
      .makeTranslation(c.x, PISO_DE_ABAJO, c.z)
      .multiply(new THREE.Matrix4().makeRotationY(c.mira))
      .multiply(new THREE.Matrix4().makeScale(e, e, e))
      .multiply(local)
    instancias.setMatrixAt(i, m)
    datosDePieza.set([pieza.region, pieza.corte, lineal(pieza.tono), Math.sign(m.determinant()) || 1], i * 4)
    datosDeAncla.set([c.x, c.z, c.anguloAlCentro, c.retardo], i * 4)
  })
  horneada.geometria.setAttribute('aPieza', new THREE.InstancedBufferAttribute(datosDePieza, 4))
  horneada.geometria.setAttribute('aAncla', new THREE.InstancedBufferAttribute(datosDeAncla, 4))
  instancias.instanceMatrix.needsUpdate = true

  return {
    copias,
    instancias,
    copia,
    triangulosPorPieza: horneada.geometria.getAttribute('position').count / 3,
    soltar: () => {
      instancias.dispose()
      horneada.geometria.dispose()
      material.dispose()
    },
  }
}

/**
 * La matriz de una pieza en el espacio de la copia: escala, giro alrededor de su pivote y
 * corrimiento. Con `apoyo`, además la baja o la sube para que lo más bajo de la pieza toque el piso.
 */
function matrizDeLaPieza(p: Pieza, apoyo: Caja | null): THREE.Matrix4 {
  const pivote = new THREE.Vector3(...p.pivote)
  const m = new THREE.Matrix4()
    .makeTranslation(p.desplazamiento[0], p.desplazamiento[1], p.desplazamiento[2])
    .multiply(new THREE.Matrix4().makeTranslation(pivote.x, pivote.y, pivote.z))
    .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(p.giro[0], p.giro[1], p.giro[2])))
    .multiply(new THREE.Matrix4().makeTranslation(-pivote.x, -pivote.y, -pivote.z))
    .multiply(new THREE.Matrix4().makeScale(p.escala[0], p.escala[1], p.escala[2]))
  if (apoyo === null) return m
  let bajo = Infinity
  const v = new THREE.Vector3()
  for (const x of [apoyo.x0, apoyo.x1]) for (const y of [apoyo.y0, apoyo.y1]) for (const z of [apoyo.z0, apoyo.z1]) bajo = Math.min(bajo, v.set(x, y, z).applyMatrix4(m).y)
  return new THREE.Matrix4().makeTranslation(0, -bajo, 0).multiply(m)
}
