import * as THREE from 'three'

import { MOIRE_FAR_ORDER } from '../probeMoire'
import { FLOOR_Y } from '../probeScene'
import type { Escenario } from '../StudioFloor'
import { copiaHorneada } from './copia'
import { FORMACION, formar, type Copia } from './enFormacion'
import { materialDeLaCopia, type UniformsDeLaCopia } from './materiales'

/**
 * [ESCENA 5] EL ARMADO DE LA FORMACIÓN — lo que se construye una vez: una instancia por copia, en dos
 * mallas instanciadas (dos llamadas de dibujo). [ESCENA 7] La primera fila con la malla entera (con
 * canto) y las de atrás con la silueta (un cuadrado con la tapa en una textura, `copia.ts`): miles de
 * copias en dos triángulos cada una. La primera fila es opaca; las siluetas se mezclan y van de atrás
 * hacia adelante, antes que el cielo y que la trama. Sin React:
 * `Formacion.tsx` lo monta y le escribe cada cuadro.
 */

export interface Armado {
  readonly copias: readonly Copia[]
  /** Las dos mallas: la de la primera fila y la de las siluetas. */
  readonly mallas: readonly THREE.InstancedMesh[]
  readonly copia: UniformsDeLaCopia
  /** Los triángulos que manda a dibujar la formación entera. */
  readonly triangulos: number
  readonly soltar: () => void
}

/** Las siluetas son transparentes: se dibujan antes que las estrellas y que la trama gruesa. */
export const ORDEN_DE_LAS_SILUETAS = MOIRE_FAR_ORDER - 10

/** La altura del piso de la formación (plano). */
export const PISO_DE_ABAJO = FLOOR_Y - FORMACION.desnivel

/** El escenario y el piso de abajo que lleva la formación. */
export const ESCENARIO: Escenario = { radio: FORMACION.radioDelEscenario, desnivel: FORMACION.desnivel, hasta: FORMACION.radioDelPisoDeAbajo }

/** Cuántas copias caen adentro del cuadro (para el banco). */
export function contarVisibles(copias: readonly Copia[], camara: THREE.Camera): number {
  const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camara.projectionMatrix, camara.matrixWorldInverse))
  const punto = new THREE.Vector3()
  return copias.filter((c) => frustum.containsPoint(punto.set(c.x, PISO_DE_ABAJO + 2.2 * FORMACION.escala, c.z))).length
}

export function armar(formas: THREE.Shape[], rasante: boolean): Armado {
  const horneada = copiaHorneada(formas)
  const copias = formar()
  const copia: UniformsDeLaCopia = { uVisible: { value: 1 } }
  const { x0, x1, y0, y1 } = horneada.caja
  // La silueta: el cuadrado de la caja de la copia, de frente (+z), con la tapa en la textura.
  const cuadrado = new THREE.PlaneGeometry(x1 - x0, y1 - y0)
  cuadrado.translate((x0 + x1) / 2, (y0 + y1) / 2, 0)
  const materiales = [materialDeLaCopia(copia, rasante, null), materialDeLaCopia(copia, rasante, horneada.silueta)]

  const e = FORMACION.escala
  // La primera fila, opaca, de adelante hacia atrás; las siluetas se mezclan, así que van de atrás hacia adelante.
  const grupos = [copias.filter((c) => c.fila < FORMACION.filasConCanto), copias.filter((c) => c.fila >= FORMACION.filasConCanto).reverse()]
  const geometrias = [horneada.geometria, cuadrado]
  let triangulos = 0
  const matriz = new THREE.Matrix4()
  const giro = new THREE.Matrix4()
  const escala = new THREE.Matrix4().makeScale(e, e, e)
  const mallas = grupos.map((grupo, k) => {
    const geometria = geometrias[k]
    const malla = new THREE.InstancedMesh(geometria, materiales[k], grupo.length)
    malla.name = k === 0 ? 'formación · primeras filas' : 'formación · siluetas'
    malla.frustumCulled = false
    // Las siluetas, antes que la trama (que va por delante) y que el cielo (que tapan).
    if (k === 1) malla.renderOrder = ORDEN_DE_LAS_SILUETAS
    grupo.forEach((c, i) => {
      malla.setMatrixAt(i, matriz.makeTranslation(c.x, PISO_DE_ABAJO, c.z).multiply(giro.makeRotationY(c.mira)).multiply(escala))
    })
    malla.instanceMatrix.needsUpdate = true
    const indices = geometria.index
    triangulos += ((indices === null ? geometria.getAttribute('position').count : indices.count) / 3) * grupo.length
    return malla
  })

  return {
    copias,
    mallas,
    copia,
    triangulos,
    soltar: () => {
      for (const m of mallas) m.dispose()
      for (const g of geometrias) g.dispose()
      for (const m of materiales) m.dispose()
      horneada.silueta.dispose()
    },
  }
}
