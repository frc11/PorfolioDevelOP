import * as THREE from 'three'

import { ORBIT_TARGET_Y } from '../probeScene'
import type { Armada } from './armadas'
import { colocarLaPieza, profundidadDeLaPieza, profundidadDelLogo } from './colocacion'

/**
 * [PULIDO 25] W1 · EL PIE ACOSTADO EN LÍNEA CON EL LOGO, CALCULADO HACIA ATRÁS. Cada lado del logo es una columna que vuelca hacia atrás
 * sobre su base: acostada ocupa desde su canto hasta su alto detrás de él. Para que su centro quede en la línea del logo (a la misma
 * profundidad que el centro del logo sobre el piso), de pie su canto tiene que estar medio alto delante de esa línea. Las piezas se ven
 * del tamaño de su DOM a cualquier profundidad (un px de la geometría mide lo que un px del cuadro ahí), así que cada columna puede ir a
 * SU profundidad y de pie se ve igual: más atrás, más grande en el mundo. La profundidad sale por iteración (el alto en el mundo crece con
 * ella); con el tope del piso de sus piezas (`colocacion.ts`: ninguna queda debajo). Ya desde el arranque: la caída sólo baja y vuelca.
 */
export const EN_LINEA = { vueltas: 5 } as const

const TEMP = new THREE.Group()
const CANTO = new THREE.Vector3()
const ADELANTE = new THREE.Vector3()
const LOGO = new THREE.Vector3()
/** Por lado (−1, 1: índices 0 y 1): la caja en la pared (px), el espesor más grueso (px), el tope del piso y si hay piezas. */
const CAJAS = new Float64Array(12)
const PROFUNDIDAD = new Float64Array(2)

/** La profundidad de una columna (su caja en px, su espesor en px) para que acostada quede centrada en la línea del logo, con `tope`. */
export function profundidadEnLinea(camara: THREE.PerspectiveCamera, ancho: number, alto: number, x0: number, y0: number, x1: number, y1: number, e: number, tope: number): number {
  camara.getWorldDirection(ADELANTE)
  const ax = ADELANTE.x
  const az = ADELANTE.z
  const l = Math.hypot(ax, az) || 1
  // `atras`: lo horizontal de la mirada; la línea del logo pasa por el origen.
  const [atrasX, atrasZ] = [ax / l, az / l]
  let d = profundidadDelLogo(camara)
  for (let k = 0; k < EN_LINEA.vueltas; k += 1) {
    const mpp = colocarLaPieza(TEMP, camara, x0, y0, ancho, alto, d)
    TEMP.updateMatrixWorld(true)
    CANTO.set((x1 - x0) / 2, -(y1 - y0), -e).applyMatrix4(TEMP.matrixWorld)
    const altoMundo = (y1 - y0) * mpp
    const error = CANTO.x * atrasX + CANTO.z * atrasZ + altoMundo / 2
    const deriva = l + altoMundo / (2 * Math.max(1e-3, d))
    d = Math.max(1, d - error / deriva)
  }
  return Math.min(d, tope)
}

/**
 * La profundidad de cada pieza visible del pie (en `destino`, por índice): la de su columna (su lado del logo en el cuadro), en línea con
 * el logo. Sin reservas por cuadro.
 */
export function profundidadesEnLinea(armadas: readonly Armada[], camara: THREE.PerspectiveCamera, cuadro: { readonly ancho: number; readonly alto: number }, scrollX: number, sy: number, destino: Float64Array): void {
  LOGO.set(0, ORBIT_TARGET_Y, 0).project(camara)
  const xDelLogo = ((LOGO.x + 1) / 2) * cuadro.ancho
  for (let s = 0; s < 2; s += 1) {
    const o = s * 6
    CAJAS[o] = CAJAS[o + 1] = CAJAS[o + 5] = Number.POSITIVE_INFINITY
    CAJAS[o + 2] = CAJAS[o + 3] = Number.NEGATIVE_INFINITY
    CAJAS[o + 4] = 0
  }
  for (let i = 0; i < armadas.length && i < destino.length; i += 1) {
    const a = armadas[i]
    if (!a.grupo.visible) continue
    const caja = a.medida.caja
    const x = caja.x - scrollX
    const y = caja.y - sy
    const o = (x + caja.ancho / 2 < xDelLogo ? 0 : 1) * 6
    CAJAS[o] = Math.min(CAJAS[o], x)
    CAJAS[o + 1] = Math.min(CAJAS[o + 1], y)
    CAJAS[o + 2] = Math.max(CAJAS[o + 2], x + caja.ancho)
    CAJAS[o + 3] = Math.max(CAJAS[o + 3], y + caja.alto)
    CAJAS[o + 4] = Math.max(CAJAS[o + 4], a.espesor)
    const c = a.contenido
    CAJAS[o + 5] = Math.min(CAJAS[o + 5], profundidadDeLaPieza(camara, x + (c.izquierda + c.derecha) / 2, y + c.abajo, cuadro.ancho, cuadro.alto))
  }
  for (let s = 0; s < 2; s += 1) {
    const o = s * 6
    PROFUNDIDAD[s] = Number.isFinite(CAJAS[o]) ? profundidadEnLinea(camara, cuadro.ancho, cuadro.alto, CAJAS[o], CAJAS[o + 1], CAJAS[o + 2], CAJAS[o + 3], CAJAS[o + 4], CAJAS[o + 5]) : 0
  }
  for (let i = 0; i < armadas.length && i < destino.length; i += 1) {
    const caja = armadas[i].medida.caja
    destino[i] = PROFUNDIDAD[caja.x - scrollX + caja.ancho / 2 < xDelLogo ? 0 : 1]
  }
}
