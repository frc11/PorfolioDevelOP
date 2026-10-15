import * as THREE from 'three'

import { POSE_DE_LA_PIEZA, poseDeLaPiezaQueCae, type PoseDeLaPieza } from '../final/caidaDelPie'
import { sombraDeLaPiezaQueCae } from '../final/sombraDeLaPieza'
import type { CaidaDelPie } from './caida'
import { HUECOS_DEL_PIE, HUECO_DEL_PIE, MAXIMO_DE_HUECOS_DEL_PIE, QUIETUD, QUIETUD_DEL_PIE } from './huecos'
import { SOMBRA_DEL_PIE } from './sombras'
import { SALIDA_EN_VIVO, cerradoParaElViaje } from '../../pie3d/salidas'

/**
 * [PULIDO 22] T3 · Los huecos de este cuadro (`huecos.ts`): por placa que cae, su huella en el piso, cuánto se abrió y [PULIDO 23] U3 · su
 * silueta: la huella con `margen` de más y el radio de sus esquinas. Los textos no llevan hueco. Va después de `armarLaCaida` (la pose de
 * las columnas de este cuadro). Sin reservas por cuadro.
 *
 * [PULIDO 27] Y2 b · EL PISO SE ABRE DONDE VA A CAER: antes el hueco (y la quietud) seguían la SOMBRA de la pieza que volcaba y crecían
 * desde su canto, debajo de ella: aparecían de la nada. Ahora están en su HUELLA FINAL (donde queda acostada e incrustada: la pose de su
 * columna al final, con la base de la cámara de antes del final) y se abren con su vuelco: desde que empieza a inclinarse hasta justo antes
 * del contacto. Lo que se abre lo hace la simulación del piso: los bloques de adentro bajan del medio hacia el borde,
 * hasta el fondo del hueco (`hondo`: el espesor de la placa y `hondoDeMas`), y el corte los sigue (`bajaEnLosHuecos`).
 * [PULIDO 28] AA5 · SÓLO EN EL ENCASTRE: el hueco crecía desde el medio de la huella con el pozo ya hondo mientras la pieza todavía estaba en
 * el aire (se armaba aparte y la pieza flotaba encima). Ahora es siempre la SILUETA entera y lo que se abre es su PROFUNDIDAD, al ritmo del
 * vuelco de la pieza (el ángulo de su columna sobre el del final): al empezar a inclinarse, nada; al tocar, entera. El fondo del pozo baja
 * con ella, con las juntas de la grilla (`pozos.ts`): los bloques de la silueta se retraen; el resto del piso, quieto. Y sólo DEBAJO de la
 * pieza: la franja de su silueta que ya tapa su proyección (vuelca sobre el canto de su columna: un punto a `d` del canto cae a `d·sen a`;
 * desde su borde cercano hasta donde llega su borde lejano), nunca un pozo a la vista fuera de ella. El cierre para un viaje, como antes:
 * la silueta se achica sobre la pieza hundida.
 */
const OFFSET = new THREE.Vector3()
const POSE: PoseDeLaPieza = { ...POSE_DE_LA_PIEZA }
const DERECHA = new THREE.Vector3()
const ARRIBA = new THREE.Vector3(0, 1, 0)
const FRENTE = new THREE.Vector3()
const BASE = new THREE.Matrix4()
const Q = new THREE.Quaternion()
const Q_TIP = new THREE.Quaternion()
const EJE_X = new THREE.Vector3(1, 0, 0)
const ESQUINA = new THREE.Vector3()

export function huecosDeLaCaida(c: CaidaDelPie, s: number): number {
  const huecos = HUECOS_DEL_PIE.uHuecosDelPie.value
  const formas = HUECOS_DEL_PIE.uFormaDeLosHuecosDelPie.value
  const b = c.base
  const sobra = 1 + HUECO_DEL_PIE.margen
  const quietudes = QUIETUD_DEL_PIE.uQuietudDelPie.value
  const fuerzas = QUIETUD_DEL_PIE.uFuerzaDeLaQuietud.value
  // La orientación de las columnas al final: paradas en la base horizontal de la cámara de antes y volcadas sobre su canto.
  DERECHA.set(b.derechaX, 0, b.derechaZ)
  FRENTE.set(-b.atrasX, 0, -b.atrasZ)
  BASE.makeBasis(DERECHA, ARRIBA, FRENTE)
  let k = 0
  let q = 0
  for (let i = 0; i < c.n && k < MAXIMO_DE_HUECOS_DEL_PIE; i += 1) {
    const p = c.piezas[i]
    const col = c.columnas[p.columna]
    const l = c.lugares[p.columna]
    // [PULIDO 28] AA5 · lo que bajó la silueta: el vuelco de su columna (su ángulo sobre el del final). [PULIDO 27] Y4 b · y antes de un
    // viaje desde el pie acostado, el piso se cierra sobre la pieza hundida (la silueta se achica).
    // (La pose es un objeto compartido: el ángulo final, como número, antes de pedir la de ahora.)
    const final = poseDeLaPiezaQueCae(col, l, l.incrustada + 1).a
    const a = poseDeLaPiezaQueCae(col, l, s).a
    const baja = Math.min(1, Math.max(0, a / Math.max(1e-3, final)))
    const abre = 1 - cerradoParaElViaje(SALIDA_EN_VIVO.hunde)
    // La columna acostada e incrustada (su esquina de arriba a la izquierda) y el canto de la pieza en ella.
    const fin = poseDeLaPiezaQueCae(col, l, l.incrustada + 1)
    Q.setFromRotationMatrix(BASE).multiply(Q_TIP.setFromAxisAngle(EJE_X, -fin.a))
    ESQUINA.set((col.x1 - col.x0) / 2, -(col.y1 - col.y0), -col.e).multiplyScalar(col.mpp).applyQuaternion(Q)
    ESQUINA.set(fin.x - ESQUINA.x, fin.y - ESQUINA.y, fin.z - ESQUINA.z)
    POSE.bajada = 1
    POSE.a = fin.a
    POSE.hundido = fin.hundido
    OFFSET.set(p.dx + p.anchoPx / 2, -(p.dy + p.altoPx), -p.espesorPx).multiplyScalar(col.mpp).applyQuaternion(Q).add(ESQUINA)
    POSE.x = OFFSET.x
    POSE.y = OFFSET.y
    POSE.z = OFFSET.z
    const huella = sombraDeLaPiezaQueCae(p, POSE, b)
    // [PULIDO 25] W2 a · la quietud de la energía del piso debajo de toda pieza acostada (placas y textos). [PULIDO 28] AA6 · y de las
    // que todavía no volcaron, con fuerza 0 (la zona del pie entera, en reposo mientras caen).
    if (q < MAXIMO_DE_HUECOS_DEL_PIE) {
      quietudes[q].set(huella.x, huella.z, huella.medioAncho - SOMBRA_DEL_PIE.sobra, huella.medioFondo - SOMBRA_DEL_PIE.sobra)
      fuerzas[q] = baja * abre
      QUIETUD_DEL_PIE.uEsTextoLaQuietud.value[q] = p.conSombra ? 0 : 1
      q += 1
    }
    if (!p.conSombra || baja <= 0 || abre <= 0) continue
    huecos[k].set(huella.x, huella.z, (huella.medioAncho - SOMBRA_DEL_PIE.sobra) * sobra, (huella.medioFondo - SOMBRA_DEL_PIE.sobra) * sobra)
    // (la silueta, el radio, lo hondo ahora y la franja debajo de la pieza: de su borde cercano al canto, la parte de su largo que ya tapa).
    const lejos = ((col.y1 - col.y0) - p.dy) * col.mpp
    const cerca = lejos - p.altoPx * col.mpp
    const franja = abre < 1 ? 1 : Math.min(1, Math.max(0, (lejos * Math.sin(Math.min(a, Math.PI / 2)) - cerca) / Math.max(1e-3, lejos - cerca)))
    formas[k].set(abre, p.radioPx * col.mpp * sobra, (p.espesor + HUECO_DEL_PIE.hondoDeMas) * baja, franja)
    k += 1
  }
  QUIETUD_DEL_PIE.uCuantasQuietudes.value = q
  // [PULIDO 28] AA6 · en reposo hasta que todo se asentó; después vuelve la energía.
  const vuelve = Math.min(1, Math.max(0, (s - c.ultimaS) / QUIETUD.vuelveS))
  QUIETUD_DEL_PIE.uReposoDelPie.value = 1 - vuelve * vuelve * (3 - 2 * vuelve)
  return k
}
