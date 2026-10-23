import * as THREE from 'three'

import { POSE_DE_LA_PIEZA, poseDeLaPiezaQueCae, type PoseDeLaPieza } from '../final/caidaDelPie'
import { sombraDeLaPiezaQueCae } from '../final/sombraDeLaPieza'
import type { CaidaDelPie } from './caida'
import { VOLUMEN_DEL_PIE } from './geometria'
import { HUECOS_DEL_PIE, HUECO_DEL_PIE, MAXIMO_DE_HUECOS_DEL_PIE, QUIETUD, QUIETUD_DEL_PIE, TECHO_DE_LOS_TEXTOS } from './huecos'
import { SOMBRA_DEL_PIE } from './sombras'
import { HUNDIMIENTO_EN_COLUMNAS, SALIDA_EN_VIVO, cerradoParaElViaje, columnaDelHundimiento, hundePorColumnas } from '../../pie3d/salidas'
import { PLATAFORMA_EN_VIVO } from './transformacionDelPie'

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
/** [C2-71] La huella final de cada pieza en este cuadro (x, z, medio ancho, medio fondo; sin la sobra de la sombra). */
const HUELLAS = new Float64Array(64 * 4)

/**
 * [C2-71] LA BASE DE CADA COLUMNA PARA EL FAQ (`salidas.ts`, `columnaDelHundimiento`): con el FAQ entrando, un hueco por columna, del
 * tamaño de su huella entera (todas sus piezas, los textos también) con `margen`: se abre desde su centro, su fondo es la plataforma que
 * baja con la columna (`hondoDeLaColumna`) y se cierra encima. Los huecos de cada placa que ya quedaron adentro de la silueta abierta no se
 * escriben (sus paredes quedarían paradas sobre la plataforma que baja). Para el banco, lo de este cuadro.
 */
export const COLUMNAS_EN_VIVO = { porColumnas: false, abre: 0, baja: 0, huecos: 0 }

/** [C2-71] Lo que baja la plataforma de una columna para el FAQ (u): lo que asoma su pieza más alta acostada (la tecla del formulario o un texto apoyado) y `deMas`. */
export function hondoDeLaColumna(col: { readonly e: number; readonly mpp: number }): number {
  return (col.e + VOLUMEN_DEL_PIE.tecla) * col.mpp + TECHO_DE_LOS_TEXTOS.sube + HUNDIMIENTO_EN_COLUMNAS.deMas
}

/** [C2-71] Una pieza de la columna, sobre su plataforma: baja lo que baja el fondo de su hueco; con el piso cerrado encima, no se dibuja. */
export function hundirConSuColumna(grupo: THREE.Object3D, col: { readonly e: number; readonly mpp: number }): void {
  const k = columnaDelHundimiento(SALIDA_EN_VIVO.delFaq)
  grupo.position.y -= hondoDeLaColumna(col) * k.baja
  if (k.baja >= 1 && k.abre <= 0) grupo.visible = false
}

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
  // [C2-71] 1 · la huella final de cada pieza, la de cada columna (en la base del pie) y la del formulario.
  const n = Math.min(c.n, HUELLAS.length / 4)
  const H = c.faq.huellas
  for (let j = 0; j < c.m; j += 1) H.set([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], j * 4)
  c.faq.conForm = false
  for (let i = 0; i < n; i += 1) {
    const p = c.piezas[i]
    const h = huellaFinal(c, i)
    const ma = h.medioAncho - SOMBRA_DEL_PIE.sobra
    const mf = h.medioFondo - SOMBRA_DEL_PIE.sobra
    HUELLAS.set([h.x, h.z, ma, mf], i * 4)
    const d = h.x * b.derechaX + h.z * b.derechaZ
    const t = h.x * b.atrasX + h.z * b.atrasZ
    const j = p.columna * 4
    H[j] = Math.min(H[j], d - ma)
    H[j + 1] = Math.max(H[j + 1], d + ma)
    H[j + 2] = Math.min(H[j + 2], t - mf)
    H[j + 3] = Math.max(H[j + 3], t + mf)
    if (p.esForm) {
      c.faq.form.set([d, t, ma, mf])
      c.faq.conForm = true
    }
  }
  // [C2-71] 2 · para el FAQ, la base de cada columna: su hueco (abierto desde el centro) con la plataforma que baja.
  const porColumnas = hundePorColumnas()
  const enColumnas = columnaDelHundimiento(porColumnas ? SALIDA_EN_VIVO.delFaq : 0)
  const C = HUNDIMIENTO_EN_COLUMNAS
  COLUMNAS_EN_VIVO.porColumnas = porColumnas
  COLUMNAS_EN_VIVO.abre = porColumnas ? enColumnas.abre : 0
  COLUMNAS_EN_VIVO.baja = porColumnas ? enColumnas.baja : 0
  if (porColumnas && enColumnas.abre > 0) {
    for (let j = 0; j < c.m && k < MAXIMO_DE_HUECOS_DEL_PIE; j += 1) {
      const [d0, d1, t0, t1] = [H[j * 4], H[j * 4 + 1], H[j * 4 + 2], H[j * 4 + 3]]
      if (!(d1 > d0) || !(t1 > t0)) continue
      const [d, t] = [(d0 + d1) / 2, (t0 + t1) / 2]
      huecos[k].set(b.derechaX * d + b.atrasX * t, b.derechaZ * d + b.atrasZ * t, (d1 - d0) / 2 + C.margen, (t1 - t0) / 2 + C.margen)
      formas[k].set(enColumnas.abre, C.radio, hondoDeLaColumna(c.columnas[j]) * enColumnas.baja, 1)
      k += 1
    }
  }
  COLUMNAS_EN_VIVO.huecos = k
  // 3 · cada pieza: su quietud y el hueco de su placa.
  for (let i = 0; i < n && k < MAXIMO_DE_HUECOS_DEL_PIE; i += 1) {
    const p = c.piezas[i]
    const col = c.columnas[p.columna]
    const l = c.lugares[p.columna]
    // [PULIDO 28] AA5 · lo que bajó la silueta: el vuelco de su columna (su ángulo sobre el del final). [PULIDO 27] Y4 b · y antes de un
    // viaje desde el pie acostado, el piso se cierra sobre la pieza hundida (la silueta se achica).
    // (La pose es un objeto compartido: el ángulo final, como número, antes de pedir la de ahora.)
    const final = poseDeLaPiezaQueCae(col, l, l.incrustada + 1).a
    const a = poseDeLaPiezaQueCae(col, l, s).a
    const baja = Math.min(1, Math.max(0, a / Math.max(1e-3, final)))
    // [PULIDO 28] AA2 · el del formulario, también cerrado sobre su placa hundida mientras se cambia (`transformacionDelPie.ts`).
    // [C2-71] Para el FAQ el piso de la placa no se cierra solo (lo cierra el de su columna): sólo el del viaje, si hay.
    const abre = (1 - cerradoParaElViaje(porColumnas ? SALIDA_EN_VIVO.delViaje : SALIDA_EN_VIVO.hunde)) * (p.esForm ? 1 - PLATAFORMA_EN_VIVO.cerrado : 1)
    const [hx, hz, hma, hmf] = [HUELLAS[i * 4], HUELLAS[i * 4 + 1], HUELLAS[i * 4 + 2], HUELLAS[i * 4 + 3]]
    // [PULIDO 25] W2 a · la quietud de la energía del piso debajo de toda pieza acostada (placas y textos). [PULIDO 28] AA6 · y de las
    // que todavía no volcaron, con fuerza 0 (la zona del pie entera, en reposo mientras caen).
    if (q < MAXIMO_DE_HUECOS_DEL_PIE) {
      quietudes[q].set(hx, hz, hma, hmf)
      fuerzas[q] = baja * abre
      QUIETUD_DEL_PIE.uEsTextoLaQuietud.value[q] = p.conSombra ? 0 : 1
      q += 1
    }
    if (!p.conSombra || baja <= 0 || abre <= 0) continue
    // [C2-71] Adentro de la silueta abierta de su columna: la plataforma la lleva (sin su hueco).
    if (porColumnas && enColumnas.abre > 0 && adentroDeSuColumna(c, i, enColumnas.abre)) continue
    huecos[k].set(hx, hz, hma * sobra, hmf * sobra)
    // (la silueta, el radio, lo hondo ahora y la franja debajo de la pieza: de su borde cercano al canto, la parte de su largo que ya tapa).
    const lejos = ((col.y1 - col.y0) - p.dy) * col.mpp
    const cerca = lejos - p.altoPx * col.mpp
    const franja = abre < 1 ? 1 : Math.min(1, Math.max(0, (lejos * Math.sin(Math.min(a, Math.PI / 2)) - cerca) / Math.max(1e-3, lejos - cerca)))
    // [PULIDO 28] AA2 · el fondo del formulario, su plataforma: baja con la placa.
    const plataforma = p.esForm ? PLATAFORMA_EN_VIVO.hundido * col.mpp : 0
    formas[k].set(abre, p.radioPx * col.mpp * sobra, (p.espesor + HUECO_DEL_PIE.hondoDeMas) * baja + plataforma, franja)
    k += 1
  }
  QUIETUD_DEL_PIE.uCuantasQuietudes.value = q
  // [PULIDO 28] AA6 · en reposo hasta que todo se asentó; después vuelve la energía.
  const vuelve = Math.min(1, Math.max(0, (s - c.ultimaS) / QUIETUD.vuelveS))
  QUIETUD_DEL_PIE.uReposoDelPie.value = 1 - vuelve * vuelve * (3 - 2 * vuelve)
  return k
}

/**
 * [C2-71] La huella de la pieza `i` acostada e incrustada (su columna al final, con la base de la cámara de antes del final): lo que
 * se calculaba por pieza al escribir los huecos, ahora primero, para la huella de las columnas, la del formulario y los huecos.
 */
function huellaFinal(c: CaidaDelPie, i: number): ReturnType<typeof sombraDeLaPiezaQueCae> {
  const p = c.piezas[i]
  const col = c.columnas[p.columna]
  const l = c.lugares[p.columna]
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
  return sombraDeLaPiezaQueCae(p, POSE, c.base)
}

/** [C2-71] ¿La huella de la pieza `i` ya está adentro de la silueta abierta (`abre`) del hueco de su columna? */
function adentroDeSuColumna(c: CaidaDelPie, i: number, abre: number): boolean {
  const b = c.base
  const j = c.piezas[i].columna * 4
  const H = c.faq.huellas
  const [d0, d1, t0, t1] = [H[j], H[j + 1], H[j + 2], H[j + 3]]
  const [x, z, ma, mf] = [HUELLAS[i * 4], HUELLAS[i * 4 + 1], HUELLAS[i * 4 + 2], HUELLAS[i * 4 + 3]]
  const d = x * b.derechaX + z * b.derechaZ
  const t = x * b.atrasX + z * b.atrasZ
  const C = HUNDIMIENTO_EN_COLUMNAS
  return Math.abs(d - (d0 + d1) / 2) + ma <= ((d1 - d0) / 2 + C.margen) * abre && Math.abs(t - (t0 + t1) / 2) + mf <= ((t1 - t0) / 2 + C.margen) * abre
}
