import * as THREE from 'three'

import { RASTRO_EN_EL_PISO } from './enElPiso'

/**
 * [EL ENCASTRE] 2F · EL RASTRO DEL MOUSE en el piso: un anillo de puntos (x, z en u; z del vector: cuánto vale). La cabeza
 * sigue al mouse; cuando se aleja `cada` del lugar donde nació, nace otra y la de antes se queda ahí. Todos se apagan con
 * inercia (`apagaS`), así que al irse el mouse el piso se calma de a poco y no de golpe. Lo dibuja `enElPiso.ts`.
 * [RETOQUE DEL ENCASTRE] 1E · w del vector: 1 en la cabeza (el núcleo de la luz va bajo el mouse; con un núcleo por punto,
 * el rastro se veía como una hilera de perlas). La cabeza nueva nace donde quedó la anterior: el núcleo no salta.
 */
export interface EstadoDelRastro {
  cabeza: number
  conCabeza: boolean
  readonly nacio: THREE.Vector2
}

export const rastroQuieto = (): EstadoDelRastro => ({ cabeza: -1, conCabeza: false, nacio: new THREE.Vector2() })

/** Un paso: apaga todos y, si el mouse está (`vale` > 0), lleva la cabeza o hace nacer otra. */
export function pasoDelRastro(puntos: readonly THREE.Vector4[], e: EstadoDelRastro, x: number, z: number, vale: number, dt: number): void {
  const apaga = Math.exp(-Math.max(0, dt) / RASTRO_EN_EL_PISO.apagaS)
  for (const q of puntos) q.z = q.z * apaga < 0.01 ? 0 : q.z * apaga
  if (vale <= 0 || puntos.length === 0) {
    e.conCabeza = false
    return
  }
  if (!e.conCabeza || Math.hypot(x - e.nacio.x, z - e.nacio.y) > RASTRO_EN_EL_PISO.cada) {
    if (e.cabeza >= 0) puntos[e.cabeza].w = 0
    e.cabeza = (e.cabeza + 1) % puntos.length
    e.nacio.set(x, z)
    e.conCabeza = true
  }
  const q = puntos[e.cabeza]
  q.set(x, z, Math.max(q.z, vale), 1)
}

/** Todos apagados (al soltar el final). */
export function apagarElRastro(puntos: readonly THREE.Vector4[], e: EstadoDelRastro): void {
  for (const q of puntos) q.set(q.x, q.y, 0, 0)
  e.conCabeza = false
}
