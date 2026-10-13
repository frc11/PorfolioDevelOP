import * as THREE from 'three'

import { POSE_DE_LA_PIEZA, poseDeLaPiezaQueCae, type PoseDeLaPieza } from '../final/caidaDelPie'
import { sombraDeLaPiezaQueCae } from '../final/sombraDeLaPieza'
import type { CaidaDelPie } from './caida'
import { HUECOS_DEL_PIE, MAXIMO_DE_HUECOS_DEL_PIE } from './huecos'

/**
 * [PULIDO 22] T3 · Los huecos de este cuadro (`huecos.ts`): por pieza que cae, su huella en el piso (la de su sombra de contacto, con la
 * pose de su columna) y cuánto se abrió (con su vuelco: cerrado de pie, abierto acostada; el rebobinado lo cierra por el mismo camino).
 * Va después de `armarLaCaida` (la pose de las columnas de este cuadro). Sin reservas por cuadro.
 */
const OFFSET = new THREE.Vector3()
const POSE: PoseDeLaPieza = { ...POSE_DE_LA_PIEZA }

export function huecosDeLaCaida(c: CaidaDelPie, s: number): number {
  const huecos = HUECOS_DEL_PIE.uHuecosDelPie.value
  const apertura = HUECOS_DEL_PIE.uAperturaDeLosHuecosDelPie.value
  const b = c.base
  let k = 0
  for (let i = 0; i < c.n && k < MAXIMO_DE_HUECOS_DEL_PIE; i += 1) {
    const p = c.piezas[i]
    const col = c.columnas[p.columna]
    const pose = poseDeLaPiezaQueCae(col, c.lugares[p.columna], s)
    if (pose.bajada <= 0) continue
    POSE.bajada = pose.bajada
    POSE.a = pose.a
    POSE.hundido = pose.hundido
    OFFSET.set(p.dx + p.anchoPx / 2, -(p.dy + p.altoPx), -p.espesorPx).multiplyScalar(c.mundoPorPx).applyQuaternion(col.q).add(col.o)
    POSE.x = OFFSET.x
    POSE.y = OFFSET.y
    POSE.z = OFFSET.z
    const huella = sombraDeLaPiezaQueCae(p, POSE, b)
    const u = Math.min(1, Math.max(0, pose.a / (Math.PI / 2)))
    huecos[k].set(huella.x, huella.z, huella.medioAncho, huella.medioFondo)
    apertura[k] = pose.bajada * u * u * (3 - 2 * u)
    k += 1
  }
  return k
}
