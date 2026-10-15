import * as THREE from 'three'

import { CAIDA_DEL_PIE, POSE_DE_LA_PIEZA, crearLugar, domDeLaPieza, domSigueALaPieza, huellaDelPie, lugaresEnElPiso, poseDeLaPiezaQueCae, type LugarEnElPiso, type PoseDeLaPieza } from '../final/caidaDelPie'
import { CAIDA_AL_HUECO, caidaIntegrada, type CaidaIntegrada } from '../final/caidaAlHueco'
import { EN_VIVO, FINAL_DEL_PIE, segundosDelFinal } from '../final/recorridoDelFinal'
import { sombraDeLaPiezaQueCae } from '../final/sombraDeLaPieza'
import { FLOOR_Y } from '../probeScene'
import type { Armada } from './armadas'
import { colocarLaPieza } from './colocacion'
import { cajaDelPieAcostado, distanciaDeLaVista } from './encuadre'
import { VOLUMEN_DEL_PIE } from './geometria'
import { TECHO_DE_LOS_TEXTOS } from './huecos'
import { SALIDAS_DEL_PIE, SALIDA_EN_VIVO, hundidaParaElViaje } from '../../pie3d/salidas'
import { MAXIMO_DE_SOMBRAS_DEL_PIE, SOMBRAS_DEL_PIE } from './sombras'

/**
 * [PULIDO 19] Q2 · LA CAÍDA DEL PIE EN LA ESCENA (`final/caidaDelPie.ts`: la física y los lugares, puros; acá, lo de three): con el final
 * en marcha, cada cuadro arma el pie como lo deja la cámara de ANTES del final (la pared del pie quieta, donde estaba), calcula los lugares
 * en el piso y el reloj, escribe para el final la distancia de la cámara desde arriba y la calma del piso bajo el pie acostado (`EN_VIVO`) y
 * a cada grupo le aplica su pose. Sin reservas por cuadro: los registros se arman una vez (hasta `MAXIMO`). [PULIDO 19] Q4 · y escribe para
 * el piso vivo la sombra de contacto de cada placa (`sombrasDeLaCaida`).
 *
 * [PULIDO 20] R1 · CAEN LAS COLUMNAS. Lo de cada lado del logo (la columna de la izquierda: el logotipo, el titular, el contacto, el
 * recorrido, las redes, la legal; la de la derecha: el rótulo y el formulario) es UNA columna invisible: la caja que contiene sus piezas
 * en la pared (su ancho, su alto y el espesor de la más gruesa). Esa columna es el cuerpo que cae: baja parada con el logo (llega al piso
 * cuando él llega), vuelca hacia atrás sobre el canto de su base con la física de su alto (apurada lo justo para tocar en el golpe) y se
 * incrusta. Las piezas son objetos separados pero van PEGADAS en su lugar de la columna (el mismo giro y su lugar relativo de la pared):
 * acostadas, desde arriba, el pie como era. Todas tocan en el golpe (su impacto es el del logo: sin pulsos sueltos); el DOM de cada pieza se
 * ve y la sigue sólo con su columna quieta (`domDeLaCaida`, `domSigueEnLaCaida`).
 */
const MAXIMO = 64
const COLUMNAS = 4
/** Una sombra más tenue que esto no se escribe. */
const SOMBRA_MINIMA = 0.002

interface PiezaMutable {
  /** Sus medidas (u) y las de su caja (px), su columna y su esquina de arriba a la izquierda en la columna (px). */
  ancho: number
  alto: number
  espesor: number
  anchoPx: number
  altoPx: number
  espesorPx: number
  columna: number
  dx: number
  dy: number
  /** Si tiene sombra de contacto (las placas: las letras no son una placa). */
  conSombra: boolean
  /** [PULIDO 23] U3 · el radio de sus esquinas (px: el hueco con su silueta) y si es texto (sin hueco: se apoya sobre el piso). */
  radioPx: number
  esTexto: boolean
}

/** Una columna: el cuerpo invisible que cae (`PiezaDePie`: su canto de abajo y de atrás en el mundo y sus medidas, u). */
interface ColumnaMutable {
  ancho: number
  alto: number
  espesor: number
  hondo: number
  x: number
  y: number
  z: number
  /** [PULIDO 25] W1 · su profundidad en la pared y su escala (u por px): cada columna la suya (en línea con el logo). */
  d: number
  mpp: number
  /** Su caja en la pared (px del cuadro) y el espesor de su pieza más gruesa (px). */
  x0: number
  y0: number
  x1: number
  y1: number
  e: number
  lado: number
  /** La caída integrada de su tamaño (memorizada: se recalcula sólo si cambia). */
  caida: CaidaIntegrada
  caidaAlto: number
  caidaEspesor: number
  /** Su giro y su esquina de arriba a la izquierda en el mundo, en este cuadro (lo que sus piezas siguen). */
  readonly q: THREE.Quaternion
  readonly o: THREE.Vector3
  quieta: boolean
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
  readonly columnas: ColumnaMutable[]
  readonly lugares: LugarEnElPiso[]
  readonly caidas: CaidaIntegrada[]
  readonly base: BaseMutable
  readonly huella: Float64Array
  /** Cuántas piezas y cuántas columnas. */
  n: number
  m: number
  /** Cuándo tocan (el golpe) y cuándo aparece el DOM de la última columna (s del reloj). */
  primeraS: number
  ultimaS: number
  /** La escala de la pared (u por px). */
  mundoPorPx: number
}

const CAIDA_NULA = caidaIntegrada({ alto: 1, espesor: 0.1 })

export function crearLaCaidaDelPie(): CaidaDelPie {
  const piezas: PiezaMutable[] = []
  for (let k = 0; k < MAXIMO; k += 1) piezas.push({ ancho: 1, alto: 1, espesor: 0.1, anchoPx: 1, altoPx: 1, espesorPx: 1, columna: 0, dx: 0, dy: 0, conSombra: false, radioPx: 0, esTexto: false })
  const columnas: ColumnaMutable[] = []
  const lugares: LugarEnElPiso[] = []
  const caidas: CaidaIntegrada[] = []
  for (let k = 0; k < COLUMNAS; k += 1) {
    columnas.push({ ancho: 1, alto: 1, espesor: 0.1, hondo: 0, x: 0, y: 0, z: 0, d: 0, mpp: 1, x0: 0, y0: 0, x1: 0, y1: 0, e: 0, lado: 0, caida: CAIDA_NULA, caidaAlto: 1, caidaEspesor: 0.1, q: new THREE.Quaternion(), o: new THREE.Vector3(), quieta: false })
    lugares.push(crearLugar())
    caidas.push(CAIDA_NULA)
  }
  return { piezas, columnas, lugares, caidas, base: { derechaX: 1, derechaZ: 0, atrasX: 0, atrasZ: -1, logoX: 0, logoZ: 0, logoAncho: 6.9, logoFondo: 4.78 }, huella: new Float64Array(2), n: 0, m: 0, primeraS: Number.POSITIVE_INFINITY, ultimaS: 0, mundoPorPx: 1 }
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
const CAJA_ACOSTADA = new Float64Array(4)

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

/** El lado del logo (−1, 1) de la pieza `i` y su escala: su canto en el mundo, con la cámara de la pared. */
function ladoDeLaPieza(a: Armada, b: BaseMutable, camara: THREE.PerspectiveCamera, x: number, y: number, cuadro: { readonly ancho: number; readonly alto: number }, d: number): number {
  const caja = a.medida.caja
  colocarLaPieza(TEMP, camara, x, y, cuadro.ancho, cuadro.alto, d)
  TEMP.updateMatrixWorld(true)
  CANTO.set(caja.ancho / 2, -caja.alto, -a.espesor).applyMatrix4(TEMP.matrixWorld)
  return (CANTO.x - b.logoX) * b.derechaX + (CANTO.z - b.logoZ) * b.derechaZ < 0 ? -1 : 1
}

/**
 * Arma la caída de este cuadro: las piezas y sus columnas con la cámara de antes del final (`camara`, a la profundidad `d` de la pared, con
 * el scroll del pie), los lugares de las columnas, la distancia de la cámara desde arriba y la calma (en `EN_VIVO`), y la pose de cada
 * columna a los segundos del reloj (lo que sus piezas siguen). Devuelve los segundos del reloj.
 */
export function armarLaCaida(c: CaidaDelPie, armadas: readonly Armada[], scrollX: number, sy: number, camara: THREE.PerspectiveCamera, cuadro: { readonly ancho: number; readonly alto: number }, d: number, profundidades: ArrayLike<number> | null = null): number {
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
  c.m = 0
  // Las columnas: una por lado del logo, la caja de sus piezas en la pared (px) y su pieza más gruesa.
  for (let i = 0; i < n; i += 1) {
    const a = armadas[i]
    const caja = a.medida.caja
    const x = caja.x - scrollX
    const y = caja.y - sy
    // [PULIDO 25] W1 · la profundidad de su columna (en línea con el logo), si se la dan; si no, la de la pared.
    const di = profundidades !== null && profundidades[i] > 0 ? profundidades[i] : d
    const lado = ladoDeLaPieza(a, b, camara, x, y, cuadro, di)
    let k = 0
    while (k < c.m && c.columnas[k].lado !== lado) k += 1
    const col = c.columnas[k]
    if (k === c.m && c.m < COLUMNAS) {
      c.m += 1
      col.lado = lado
      col.x0 = x
      col.y0 = y
      col.x1 = x + caja.ancho
      col.y1 = y + caja.alto
      col.e = a.espesor
      col.hondo = 0
      col.d = di
    } else {
      col.x0 = Math.min(col.x0, x)
      col.y0 = Math.min(col.y0, y)
      col.x1 = Math.max(col.x1, x + caja.ancho)
      col.y1 = Math.max(col.y1, y + caja.alto)
      col.e = Math.max(col.e, a.espesor)
    }
    // Lo hondo de su cara (los pozos del formulario) queda sobre el piso al incrustarse.
    if (a.pieza.forma === 'formulario') col.hondo = Math.max(col.hondo, VOLUMEN_DEL_PIE.pozo + 1)
    const p = c.piezas[i]
    p.columna = k
    p.anchoPx = caja.ancho
    p.altoPx = caja.alto
    p.espesorPx = a.espesor
    p.conSombra = a.pieza.forma === 'placa' || a.pieza.forma === 'formulario'
    p.radioPx = caja.radio
    p.esTexto = a.pieza.forma === 'texto' || a.pieza.forma === 'enlace'
  }
  // Cada columna en el mundo: su canto (el medio de abajo y de atrás) y sus medidas (u); la caída de su tamaño.
  for (let k = 0; k < c.m; k += 1) {
    const col = c.columnas[k]
    const mpp = colocarLaPieza(TEMP, camara, col.x0, col.y0, cuadro.ancho, cuadro.alto, col.d)
    col.mpp = mpp
    TEMP.updateMatrixWorld(true)
    CANTO.set((col.x1 - col.x0) / 2, -(col.y1 - col.y0), -col.e).applyMatrix4(TEMP.matrixWorld)
    c.mundoPorPx = mpp
    col.ancho = (col.x1 - col.x0) * mpp
    col.alto = (col.y1 - col.y0) * mpp
    col.espesor = Math.max(0.02, col.e * mpp)
    col.hondo *= mpp
    col.x = CANTO.x
    col.y = Math.max(FLOOR_Y, CANTO.y)
    col.z = CANTO.z
    if (col.caidaAlto !== col.alto || col.caidaEspesor !== col.espesor) {
      col.caida = caidaIntegrada(col)
      col.caidaAlto = col.alto
      col.caidaEspesor = col.espesor
    }
    c.caidas[k] = col.caida
  }
  for (let i = 0; i < n; i += 1) {
    const p = c.piezas[i]
    const col = c.columnas[p.columna]
    const caja = armadas[i].medida.caja
    p.dx = caja.x - scrollX - col.x0
    p.dy = caja.y - sy - col.y0
    p.ancho = p.anchoPx * col.mpp
    p.alto = p.altoPx * col.mpp
    p.espesor = Math.max(0.02, p.espesorPx * col.mpp)
  }
  c.ultimaS = lugaresEnElPiso(c.columnas, c.m, c.caidas, b, c.lugares)
  huellaDelPie(c.columnas, c.m, c.lugares, b, c.huella)
  // Todas tocan en el golpe: el piso se calma desde un poco antes (el impacto es el del logo, con su onda).
  c.primeraS = c.m === 0 ? Number.POSITIVE_INFINITY : CAIDA_AL_HUECO.golpeS
  // [PULIDO 20] R1 · la cámara del final de costado y lejos: el pie acostado y el logo en `ocupa` del cuadro (`encuadre.ts`).
  const V = FINAL_DEL_PIE.camara.escritorio
  // [PULIDO 24] V3 · encuadrada en el centro del pie acostado con el logo (el blanco de la cámara baja ahí), con su caja.
  cajaDelPieAcostado(c.columnas, c.m, c.lugares, b, CAJA_ACOSTADA)
  EN_VIVO.centroDelPie.set(c.m === 0 ? 0 : CAJA_ACOSTADA[0], c.m === 0 ? 0 : CAJA_ACOSTADA[1])
  EN_VIVO.distanciaDelPie = c.m === 0 ? 0 : distanciaDeLaVista(camara.fov, camara.aspect, V.elevacion, ocupaDePie(c, cuadro.ancho), CAJA_ACOSTADA[0], CAJA_ACOSTADA[1], b.derechaX, b.derechaZ, b.atrasX, b.atrasZ, CAJA_ACOSTADA[2], CAJA_ACOSTADA[3])
  EN_VIVO.calmaDelPie.set(b.logoX, b.logoZ, c.huella[0] + CAIDA_DEL_PIE.aire, c.huella[1] + CAIDA_DEL_PIE.aire)
  EN_VIVO.baseDelPie.set(b.derechaX, b.derechaZ, b.atrasX, b.atrasZ)
  EN_VIVO.calmaDelPieFuerza = c.m === 0 ? 0 : suave((s - c.primeraS + 0.4) / 0.8)
  // [PULIDO 27] Y4 b · acostado entero, con su DOM: un enlace del recorrido, ahí, primero se hunde.
  SALIDA_EN_VIVO.acostado = c.m > 0 && s >= c.ultimaS
  // La pose de cada columna: de la orientación de la pared a la vertical, de frente (la base de la cámara horizontal), y el vuelco sobre
  // su canto (su eje x); su esquina de arriba a la izquierda, desde el canto.
  DERECHA.set(b.derechaX, 0, b.derechaZ)
  FRENTE.set(-b.atrasX, 0, -b.atrasZ)
  BASE.makeBasis(DERECHA, ARRIBA, FRENTE)
  Q_UP.setFromRotationMatrix(BASE)
  for (let k = 0; k < c.m; k += 1) {
    const col = c.columnas[k]
    const pose = poseDeLaPiezaQueCae(col, c.lugares[k], s)
    col.q.copy(camara.quaternion).slerp(Q_UP, pose.bajada)
    if (pose.a > 0) col.q.multiply(Q_TIP.setFromAxisAngle(EJE_X, -pose.a))
    OFFSET.set((col.x1 - col.x0) / 2, -(col.y1 - col.y0), -col.e).multiplyScalar(col.mpp).applyQuaternion(col.q)
    col.o.set(pose.x, pose.y, pose.z).sub(OFFSET)
    col.quieta = pose.quieta
  }
  return s
}

/** [PULIDO 27] Y3 · cuánto está acostada la pieza `i` a los `s` del reloj (0 de pie, 1 acostada): el vuelco de su columna. */
export function acostadaDeLaCaida(c: CaidaDelPie, i: number, s: number): number {
  if (i >= c.n || s <= 0) return 0
  const p = c.piezas[i]
  return suave(poseDeLaPiezaQueCae(c.columnas[p.columna], c.lugares[p.columna], s).a / (Math.PI / 2))
}

/** [PULIDO 20] R1 · cuánto se ve el DOM de la pieza `i` a los `s` del reloj (0 a 1; sin caída, entero): el de su columna. */
export function domDeLaCaida(c: CaidaDelPie, i: number, s: number): number {
  // [PULIDO 27] Y4 b · hundiéndose antes de un viaje, el DOM ya no.
  return i >= c.n ? 1 : SALIDA_EN_VIVO.hunde > 0 ? 0 : domDeLaPieza(c.lugares[c.piezas[i].columna], s)
}

/** [PULIDO 20] R1 · si el DOM de la pieza `i` sigue a la pieza a los `s` del reloj (en camino, se queda donde estaba, apagado). */
export function domSigueEnLaCaida(c: CaidaDelPie, i: number, s: number): boolean {
  return i >= c.n || domSigueALaPieza(c.lugares[c.piezas[i].columna], s)
}

/** La pose de la pieza `i` a los `s` del reloj, sobre el grupo ya colocado en la pared: pegada a su columna (su giro y su lugar en ella). */
/** [PULIDO 23] U4 · lo que ocupan las columnas de pie en el ancho del cuadro (NDC, la mitad: como `ocupa`), entre las puntas de `escritorio.ocupa`. */
export function ocupaDePie(c: CaidaDelPie, ancho: number): number {
  let x0 = Number.POSITIVE_INFINITY
  let x1 = Number.NEGATIVE_INFINITY
  for (let k = 0; k < c.m; k += 1) {
    x0 = Math.min(x0, c.columnas[k].x0)
    x1 = Math.max(x1, c.columnas[k].x1)
  }
  const O = FINAL_DEL_PIE.camara.escritorio.ocupa
  return Math.min(O[1], Math.max(O[0], Math.max(Math.abs(x0 / ancho - 0.5), Math.abs(x1 / ancho - 0.5)) * 2))
}

export function aplicarLaCaida(c: CaidaDelPie, i: number, a: Armada, s: number): void {
  if (i >= c.n || s <= 0) return
  const p = c.piezas[i]
  const col = c.columnas[p.columna]
  const grupo = a.grupo
  grupo.quaternion.copy(col.q)
  // [PULIDO 23] U3 · un texto no se incrusta: al hundirse su columna, sube su espesor (queda apoyado sobre el piso, sin hueco).
  // [PULIDO 26] X2 · y un poco más (`TECHO_DE_LOS_TEXTOS.sube`, u): por encima del techo de los bloques de abajo (el piso no se aplana).
  const sube = p.esTexto ? (p.espesorPx + TECHO_DE_LOS_TEXTOS.sube / col.mpp) * poseDeLaPiezaQueCae(col, c.lugares[p.columna], s).hundido : 0
  OFFSET.set(p.dx, -p.dy, sube).multiplyScalar(col.mpp).applyQuaternion(col.q)
  grupo.position.copy(col.o).add(OFFSET)
  // [PULIDO 27] Y4 b · antes de un viaje desde el pie acostado se hunde en su hueco; hundida, no se dibuja hasta que el viaje termina.
  const h = SALIDA_EN_VIVO.hunde
  if (h <= 0) return
  grupo.position.y -= (p.espesor + SALIDAS_DEL_PIE.hundeDeMas + (p.esTexto ? TECHO_DE_LOS_TEXTOS.sube : 0)) * hundidaParaElViaje(h)
  if (h >= 1) grupo.visible = false
}

/** La pose de la sombra de una pieza pegada a su columna: su canto de abajo y de atrás en el mundo, con el ángulo y el reloj de la columna. */
const POSE_DE_LA_SOMBRA: PoseDeLaPieza = { ...POSE_DE_LA_PIEZA }

/**
 * [PULIDO 19] Q4 · Las sombras de contacto de este cuadro (`sombras.ts`, hasta `MAXIMO_DE_SOMBRAS_DEL_PIE`): la huella de cada placa que
 * ya bajó (`final/sombraDeLaPieza.ts`), en la base del pie; devuelve cuántas escribió (lo que el piso vivo pinta). Va después de
 * `armarLaCaida` (la pose de las columnas de este cuadro).
 */
export function sombrasDeLaCaida(c: CaidaDelPie, s: number): number {
  const b = c.base
  SOMBRAS_DEL_PIE.uBaseDeLasSombrasDelPie.value.set(b.derechaX, b.derechaZ, b.atrasX, b.atrasZ)
  const cajas = SOMBRAS_DEL_PIE.uSombrasDelPie.value
  const formas = SOMBRAS_DEL_PIE.uFormaDeLasSombrasDelPie.value
  let k = 0
  for (let i = 0; i < c.n && k < MAXIMO_DE_SOMBRAS_DEL_PIE; i += 1) {
    const p = c.piezas[i]
    // [PULIDO 25] W2 b · los textos, sin sombra (era un rectángulo oscuro detrás de cada bloque): limpios sobre el piso.
    if (!p.conSombra) continue
    const col = c.columnas[p.columna]
    const pose = poseDeLaPiezaQueCae(col, c.lugares[p.columna], s)
    const P = POSE_DE_LA_SOMBRA
    P.bajada = pose.bajada
    P.a = pose.a
    P.hundido = pose.hundido
    OFFSET.set(p.dx + p.anchoPx / 2, -(p.dy + p.altoPx), -p.espesorPx).multiplyScalar(col.mpp).applyQuaternion(col.q).add(col.o)
    P.x = OFFSET.x
    P.y = OFFSET.y
    P.z = OFFSET.z
    const sombra = sombraDeLaPiezaQueCae(p, P, b)
    if (sombra.alfa < SOMBRA_MINIMA) continue
    cajas[k].set(sombra.x, sombra.z, sombra.medioAncho, sombra.medioFondo)
    formas[k].set(sombra.blanda, sombra.alfa, 0, 0)
    k += 1
  }
  return k
}
