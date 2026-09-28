import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'
import { alturaDelPisoDeAbajo, type Escenario } from '../StudioFloor'
import { copiaHorneada } from './copia'
import { FORMACION, formar, type Copia } from './enFormacion'
import { materialDeLaCopia, type UniformsDeLaCopia } from './materiales'

/**
 * [ESCENA 5] EL ARMADO DE LA FORMACIÓN — lo que se construye una vez: una instancia por copia, en dos
 * mallas instanciadas (dos llamadas de dibujo): la primera fila con canto y las de atrás sólo con la
 * tapa (`copia.ts`). Sin React: `Formacion.tsx` lo monta y le escribe cada cuadro.
 */

export interface Armado {
  readonly copias: readonly Copia[]
  /** Las dos mallas: la de la primera fila y la de las de atrás. */
  readonly mallas: readonly THREE.InstancedMesh[]
  readonly copia: UniformsDeLaCopia
  /** Los triángulos que manda a dibujar la formación entera. */
  readonly triangulos: number
  readonly soltar: () => void
}

/** La altura del piso de la formación, en el borde del escenario. */
export const PISO_DE_ABAJO = FLOOR_Y - FORMACION.desnivel

/** El escenario y el piso de abajo que lleva la formación. */
export const ESCENARIO: Escenario = { radio: FORMACION.radioDelEscenario, desnivel: FORMACION.desnivel, hasta: FORMACION.radioDelPisoDeAbajo, pendiente: FORMACION.pendiente }

/** Cuántas copias caen adentro del cuadro (para el banco). */
export function contarVisibles(copias: readonly Copia[], camara: THREE.Camera): number {
  const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camara.projectionMatrix, camara.matrixWorldInverse))
  const punto = new THREE.Vector3()
  return copias.filter((c) => frustum.containsPoint(punto.set(c.x, PISO_DE_ABAJO + 2.2 * FORMACION.escala, c.z))).length
}

const lineal = (srgb: number): number => (srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4)

export function armar(formas: THREE.Shape[], sinFallasVisibles: boolean, rasante: boolean): Armado {
  const horneada = copiaHorneada(formas)
  const caja = horneada.geometria.boundingBox ?? new THREE.Box3()
  const medidas = { ancho: caja.max.x - caja.min.x, alto: caja.max.y - caja.min.y, caja: horneada.caja }
  const copias = formar(medidas, { sinFallasVisibles })
  const copia: UniformsDeLaCopia = { uVisible: { value: 1 } }
  const material = materialDeLaCopia(horneada.fronteras, copia, rasante)

  const e = FORMACION.escala
  const grupos = [copias.filter((c) => c.fila < FORMACION.filasConCanto), copias.filter((c) => c.fila >= FORMACION.filasConCanto)]
  const geometrias = [horneada.geometria, horneada.tapa]
  let triangulos = 0
  const mallas = grupos.map((grupo, k) => {
    const geometria = geometrias[k]
    const malla = new THREE.InstancedMesh(geometria, material, grupo.length)
    malla.frustumCulled = false
    const datos = new Float32Array(grupo.length * 4)
    grupo.forEach((c, i) => {
      const y = FLOOR_Y + alturaDelPisoDeAbajo(ESCENARIO, Math.hypot(c.x, c.z))
      malla.setMatrixAt(i, new THREE.Matrix4().makeTranslation(c.x, y, c.z).multiply(new THREE.Matrix4().makeRotationY(c.mira)).multiply(new THREE.Matrix4().makeScale(e, e, e)))
      const p = c.pieza
      // La parte de otro tono va en la parte entera (la región) y la fraccionaria (su tono, lineal).
      datos.set([p.region, p.corte, lineal(p.tono), p.otra === null ? 0 : p.otra.region + Math.min(0.999, lineal(p.otra.tono))], i * 4)
    })
    geometria.setAttribute('aPieza', new THREE.InstancedBufferAttribute(datos, 4))
    malla.instanceMatrix.needsUpdate = true
    triangulos += (geometria.getAttribute('position').count / 3) * grupo.length
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
      material.dispose()
    },
  }
}
