import * as THREE from 'three'

import { CAIDA_DEL_PIE, crearLugar, distanciaParaElPie, huellaDelPie, lugaresEnElPiso, poseDeLaPiezaQueCae, type LugarEnElPiso } from '../final/caidaDelPie'
import { caidaIntegrada, type CaidaIntegrada } from '../final/caidaAlHueco'
import { EN_VIVO, segundosDelFinal } from '../final/recorridoDelFinal'
import { pedirLaOnda } from '../interfaz/pedidos'
import { FLOOR_Y } from '../probeScene'
import type { Armada } from './armadas'
import { colocarLaPieza } from './colocacion'

/**
 * [PULIDO 19] Q2 · LA CAÍDA DE LAS PIEZAS DEL PIE EN LA ESCENA (`final/caidaDelPie.ts`: la física y los lugares, puros; acá, lo de
 * three): con el final en marcha, cada cuadro arma las piezas de pie como las deja la cámara de ANTES del final (la pared del pie
 * quieta, donde estaba), les calcula su lugar en el piso y su reloj, escribe para el final la distancia de la cámara desde arriba y
 * la calma del piso bajo el pie acostado (`EN_VIVO`), pide un pulso chico del piso en cada impacto, y a cada grupo le aplica su
 * pose: el canto que baja y la placa que vuelca sobre él. Sin reservas por cuadro: los registros se arman una vez (hasta `MAXIMO`).
 */
const MAXIMO = 64

interface PiezaMutable {
  ancho: number
  alto: number
  espesor: number
  x: number
  y: number
  z: number
  /** La caída integrada de su tamaño (memorizada: se recalcula sólo si cambia). */
  caida: CaidaIntegrada
  caidaAlto: number
  caidaEspesor: number
}

interface BaseMutable {
  derechaX: number
  derechaZ: number
  atrasX: number
  atrasZ: number
  logoX: number
  logoZ: number
  logoAncho: number
  logoFondo: number
}

export interface CaidaDelPie {
  readonly piezas: PiezaMutable[]
  readonly lugares: LugarEnElPiso[]
  readonly caidas: CaidaIntegrada[]
  readonly base: BaseMutable
  readonly huella: Float64Array
  n: number
  /** Los segundos del reloj del cuadro anterior (los impactos), cuándo toca la primera y cuándo se asienta la última (s del reloj). */
  antesS: number
  primeraS: number
  ultimaS: number
}

const CAIDA_NULA = caidaIntegrada({ alto: 1, espesor: 0.1 })

export function crearLaCaidaDelPie(): CaidaDelPie {
  const piezas: PiezaMutable[] = []
  const lugares: LugarEnElPiso[] = []
  const caidas: CaidaIntegrada[] = []
  for (let k = 0; k < MAXIMO; k += 1) {
    piezas.push({ ancho: 1, alto: 1, espesor: 0.1, x: 0, y: 0, z: 0, caida: CAIDA_NULA, caidaAlto: 1, caidaEspesor: 0.1 })
    lugares.push(crearLugar())
    caidas.push(CAIDA_NULA)
  }
  return { piezas, lugares, caidas, base: { derechaX: 1, derechaZ: 0, atrasX: 0, atrasZ: -1, logoX: 0, logoZ: 0, logoAncho: 6.9, logoFondo: 4.78 }, huella: new Float64Array(2), n: 0, antesS: 0, primeraS: Number.POSITIVE_INFINITY, ultimaS: 0 }
}

const TEMP = new THREE.Object3D()
const CANTO = new THREE.Vector3()
const DERECHA = new THREE.Vector3()
const ATRAS = new THREE.Vector3()
const ARRIBA = new THREE.Vector3(0, 1, 0)
const FRENTE = new THREE.Vector3()
const BASE = new THREE.Matrix4()
const Q_UP = new THREE.Quaternion()
const Q_TIP = new THREE.Quaternion()
const EJE_X = new THREE.Vector3(1, 0, 0)
const OFFSET = new THREE.Vector3()
const PUNTO = new THREE.Vector3()

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/** Un eje de la cámara, horizontal y unitario (si la cámara mira en vertical, el de siempre). */
function horizontal(destino: THREE.Vector3, x: number, z: number, camara: THREE.Camera, six: number, siz: number): THREE.Vector3 {
  destino.set(x, 0, z).applyQuaternion(camara.quaternion)
  destino.y = 0
  if (destino.lengthSq() < 1e-8) destino.set(six, 0, siz)
  return destino.normalize()
}

/**
 * Arma la caída de este cuadro: las piezas de pie con la cámara de antes del final (`camara`, a la profundidad `d` de la pared, con el
 * scroll del pie), sus lugares, la distancia de la cámara desde arriba y la calma (en `EN_VIVO`), y los impactos (el pulso chico del
 * piso, donde cae cada una como lo ve la cámara viva). Devuelve los segundos del reloj.
 */
export function armarLaCaida(c: CaidaDelPie, armadas: readonly Armada[], scrollX: number, sy: number, camara: THREE.PerspectiveCamera, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, d: number): number {
  const s = segundosDelFinal(EN_VIVO.fin)
  horizontal(DERECHA, 1, 0, camara, 1, 0)
  horizontal(ATRAS, 0, -1, camara, 0, -1)
  const b = c.base
  b.derechaX = DERECHA.x
  b.derechaZ = DERECHA.z
  b.atrasX = ATRAS.x
  b.atrasZ = ATRAS.z
  b.logoX = 0
  b.logoZ = 0
  b.logoAncho = EN_VIVO.huellaDelLogo.x
  b.logoFondo = EN_VIVO.huellaDelLogo.y
  const n = Math.min(armadas.length, MAXIMO)
  c.n = n
  for (let i = 0; i < n; i += 1) {
    const a = armadas[i]
    const q = c.piezas[i]
    const caja = a.medida.caja
    const mundoPorPx = colocarLaPieza(TEMP, camara, caja.x - scrollX, caja.y - sy, cuadro.ancho, cuadro.alto, d)
    TEMP.updateMatrixWorld(true)
    CANTO.set(caja.ancho / 2, -caja.alto, -a.espesor).applyMatrix4(TEMP.matrixWorld)
    q.ancho = caja.ancho * mundoPorPx
    q.alto = caja.alto * mundoPorPx
    q.espesor = Math.max(0.02, a.espesor * mundoPorPx)
    q.x = CANTO.x
    q.y = Math.max(FLOOR_Y, CANTO.y)
    q.z = CANTO.z
    if (q.caidaAlto !== q.alto || q.caidaEspesor !== q.espesor) {
      q.caida = caidaIntegrada(q)
      q.caidaAlto = q.alto
      q.caidaEspesor = q.espesor
    }
    c.caidas[i] = q.caida
  }
  c.ultimaS = lugaresEnElPiso(c.piezas, n, c.caidas, b, c.lugares)
  huellaDelPie(c.piezas, n, c.lugares, b, c.huella)
  let primera = Number.POSITIVE_INFINITY
  for (let i = 0; i < n; i += 1) primera = Math.min(primera, c.lugares[i].toca)
  c.primeraS = primera
  EN_VIVO.distanciaDelPie = n === 0 ? 0 : distanciaParaElPie(camara.fov, camara.aspect, c.huella[0], c.huella[1])
  EN_VIVO.calmaDelPie.set(b.logoX, b.logoZ, c.huella[0] + CAIDA_DEL_PIE.aire, c.huella[1] + CAIDA_DEL_PIE.aire)
  EN_VIVO.baseDelPie.set(b.derechaX, b.derechaZ, b.atrasX, b.atrasZ)
  EN_VIVO.calmaDelPieFuerza = n === 0 ? 0 : suave((s - primera + 0.4) / 0.8)
  // Los impactos: un pulso chico del piso donde cae cada pieza (sólo hacia adelante: al rebobinar no hay impactos).
  for (let i = 0; i < n; i += 1) {
    const l = c.lugares[i]
    if (c.antesS < l.toca && s >= l.toca) {
      PUNTO.set(l.x, FLOOR_Y, l.z).project(viva)
      if (Math.abs(PUNTO.x) <= 1.2 && Math.abs(PUNTO.y) <= 1.2) pedirLaOnda(PUNTO.x, PUNTO.y, performance.now())
    }
  }
  c.antesS = s
  return s
}

/** La pose de la pieza `i` a los `s` del reloj, sobre el grupo ya colocado de pie en la pared: el canto que baja y la placa que vuelca. */
export function aplicarLaCaida(c: CaidaDelPie, i: number, a: Armada, s: number): void {
  if (i >= c.n) return
  const p = c.piezas[i]
  const pose = poseDeLaPiezaQueCae(p, c.lugares[i], s)
  if (pose.bajada <= 0) return
  const b = c.base
  const grupo = a.grupo
  // De la orientación de la cámara a la vertical, de frente (la base de la cámara horizontal), y el vuelco sobre el canto (su eje x).
  DERECHA.set(b.derechaX, 0, b.derechaZ)
  FRENTE.set(-b.atrasX, 0, -b.atrasZ)
  BASE.makeBasis(DERECHA, ARRIBA, FRENTE)
  Q_UP.setFromRotationMatrix(BASE)
  grupo.quaternion.slerp(Q_UP, pose.bajada)
  if (pose.a > 0) grupo.quaternion.multiply(Q_TIP.setFromAxisAngle(EJE_X, -pose.a))
  // El origen del grupo (la esquina de arriba a la izquierda, en px) desde el canto, con la escala y la orientación de ahora.
  const caja = a.medida.caja
  OFFSET.set(caja.ancho / 2, -caja.alto, -a.espesor).multiplyScalar(grupo.scale.x).applyQuaternion(grupo.quaternion)
  grupo.position.set(pose.x, pose.y, pose.z).sub(OFFSET)
}
