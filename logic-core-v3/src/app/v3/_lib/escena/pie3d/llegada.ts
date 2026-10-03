import * as THREE from 'three'

import { sembrar } from '../titulos3d/llegada'

/**
 * [RETOQUE DEL PIE] P3 · LA LLEGADA DEL PIE, A PRUEBA (`?pruebas=pie=llegada`; el producto no la tiene) — al llegar al final
 * de la página las piezas del pie se arman desde distintos lugares de la sala, como las letras del titular del hero (el
 * gesto `azar`): cada una sale de un lugar sembrado, de atrás y girada, y llega a su lugar con la curva de salida; después
 * quedan fijas (no se vuelven a armar). Mientras no se llegó al final, no están. Con movimiento reducido, ya armadas.
 */
export const LLEGADA_DEL_PIE = {
  duracionS: 1.2,
  /** Cuánto espera cada pieza más que la anterior (s), y un poco de azar encima. */
  escalonS: 0.05,
  azarS: 0.15,
  /** De dónde sale, corrida de su lugar (u del mundo): de los costados, de arriba o de abajo, y de atrás. */
  desde: { x: [-8, 8], y: [-3, 7], z: [-14, -3] },
  /** Cuánto llega girada (rad, sobre un eje sembrado). */
  giro: [0.6, 1.5],
  semilla: 0x5e1a,
  /** El final de la página: lo que falta para el último píxel de scroll (px). */
  alFinal: 4,
} as const

export interface LlegadaDeLaPieza {
  readonly desde: THREE.Vector3
  readonly giro: THREE.Quaternion
  readonly retrasoS: number
}

/** La llegada de la pieza número `orden` (la misma en cada carga). */
export function llegadaDe(orden: number): LlegadaDeLaPieza {
  const azar = sembrar(LLEGADA_DEL_PIE.semilla + orden * 7919)
  const entre = ([a, b]: readonly [number, number]): number => a + (b - a) * azar()
  const { desde, giro } = LLEGADA_DEL_PIE
  const eje = new THREE.Vector3(entre([-1, 1]), entre([-1, 1]), entre([-1, 1])).normalize()
  return {
    desde: new THREE.Vector3(entre(desde.x), entre(desde.y), entre(desde.z)),
    giro: new THREE.Quaternion().setFromAxisAngle(eje.lengthSq() > 0 ? eje : new THREE.Vector3(0, 1, 0), entre(giro)),
    retrasoS: orden * LLEGADA_DEL_PIE.escalonS + azar() * LLEGADA_DEL_PIE.azarS,
  }
}

/** Cuánto le falta (1 en su lugar de salida, 0 llegada): la curva de salida (cúbica) sobre su tiempo. */
export function cuantoLeFalta(desdeElInicioS: number, ll: Pick<LlegadaDeLaPieza, 'retrasoS'>): number {
  const t = Math.min(1, Math.max(0, (desdeElInicioS - ll.retrasoS) / LLEGADA_DEL_PIE.duracionS))
  return (1 - t) ** 3
}

const GIRO = new THREE.Quaternion()
const QUIETO = new THREE.Quaternion()

/** La pieza, ya colocada en su lugar, corrida y girada lo que le falta (`falta` de 0 a 1). */
export function aplicarLaLlegada(grupo: THREE.Object3D, ll: LlegadaDeLaPieza, falta: number): void {
  if (falta <= 0) return
  grupo.position.addScaledVector(ll.desde, falta)
  grupo.quaternion.multiply(GIRO.copy(QUIETO).slerp(ll.giro, falta))
}

/** ¿La página llegó al final? */
export function alFinalDeLaPagina(y: number, alto: number, documento: number): boolean {
  return y + alto >= documento - LLEGADA_DEL_PIE.alFinal
}
