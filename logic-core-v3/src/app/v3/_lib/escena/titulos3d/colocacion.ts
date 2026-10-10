import * as THREE from 'three'

import { aimWithFraming } from '../cameraFraming'
import { CHOREO_KEYFRAMES } from '../choreography'
import { buildTrack, sampleTrack, type ChoreoTrack } from '../choreographySampler'
import type { ChoreoPose } from '../choreographyTypes'
import { BANDA_EN_VIVO, fovConFactor } from '../banda'
import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR, ORBIT_TARGET_Y } from '../probeScene'

/**
 * [ESCENA 10] T3 · DÓNDE VA UN TÍTULO EN EL MUNDO — quieto, como el logo: la cámara lo muestra con los movimientos que
 * ya tiene, sin cambiarla. Se coloca con la cámara del momento en que se lee (un nudo de la coreografía) para que EN ESE
 * MOMENTO quede donde el DOM le guarda el lugar (el comienzo del renglón y la línea de base), de su cuerpo y de frente;
 * el momento es un nudo por su nombre o un progreso de la coreografía (el medio de la ventana en que se lee, medido);
 * fuera de ese momento la cámara lo ve de costado, de abajo o más de cerca. Va a la profundidad del centro del logo
 * (visto desde esa cámara): el paralaje entre los dos es el de dos objetos de la misma sala.
 *
 * La cuenta es pura salvo los objetos de three que recibe (el invariante la prueba sin navegador); `lugarDeLectura` y
 * `posicionesDelDom` leen el DOM una vez por llegada, nunca por cuadro.
 */

let pista: ChoreoTrack | null = null
type PoseEscribible = { -readonly [K in keyof ChoreoPose]: ChoreoPose[K] }
const POSE: PoseEscribible = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
const DESDE: PoseEscribible = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
const HASTA: PoseEscribible = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }

/**
 * [PASADA FINAL] A2 · UNA LECTURA RELATIVA: la pose del progreso `en` más lo que la cámara cambia entre `comoEntre[0]` y
 * `comoEntre[1]` (azimut, altura y distancia; el encuadre es el de `en`). Es la relación de cámara que se aprobó en un
 * momento (Portfolio en ESCENA 10: la llegada terminaba en 0,4426 y el título se colocaba con la cámara de 0,4718, y por
 * eso las letras, que vienen por el eje del título, se veían venir desde el fondo de la sala), aplicada a donde la
 * llegada termina HOY: si el mapeo scroll → progreso se corre (la tabla de secciones es proporcional), la relación con
 * la cámara se conserva en vez de que la colocación quede encima de la llegada y las letras vengan de frente, cortas.
 */
export interface LecturaRelativa {
  readonly en: number
  readonly comoEntre: readonly [number, number]
}

export type Lectura = string | number | LecturaRelativa

function muestrear(progreso: number, destino: PoseEscribible): PoseEscribible {
  pista ??= buildTrack(CHOREO_KEYFRAMES)
  sampleTrack(pista, progreso, destino)
  return destino
}

/** La pose de la cámara en un momento: un nudo por su nombre, un progreso (la pista del home, sin el mouse ni la inercia) o una relativa. */
export function poseDeLaLectura(lectura: Lectura): ChoreoPose {
  if (typeof lectura === 'number') return muestrear(lectura, POSE)
  if (typeof lectura === 'object') {
    muestrear(lectura.comoEntre[0], DESDE)
    muestrear(lectura.comoEntre[1], HASTA)
    muestrear(lectura.en, POSE)
    POSE.angleDeg += HASTA.angleDeg - DESDE.angleDeg
    POSE.height += HASTA.height - DESDE.height
    POSE.distance += HASTA.distance - DESDE.distance
    return POSE
  }
  const nudo = CHOREO_KEYFRAMES.find((k) => k.name === lectura)
  if (nudo === undefined) throw new Error(`no hay un nudo «${lectura}» en la coreografía`)
  return nudo.pose
}

/** La cámara del momento de la lectura, armada como la arma `OrbitRig` (la órbita y el encuadre). */
export function camaraDeLaLectura(lectura: Lectura, aspecto: number, logoW: number, logoH: number, destino: THREE.PerspectiveCamera): THREE.PerspectiveCamera {
  const { angleDeg, height, distance, frameX, frameY } = poseDeLaLectura(lectura)
  const c = destino
  // [PULIDO 10] J1 · con la banda portátil, como la cámara viva (los títulos existen sólo desde 1024).
  c.fov = fovConFactor(CAMERA_FOV, BANDA_EN_VIVO.factor)
  c.near = CAMERA_NEAR
  c.far = CAMERA_FAR
  c.aspect = aspecto
  c.updateProjectionMatrix()
  const azimut = THREE.MathUtils.degToRad(angleDeg)
  c.position.set(Math.sin(azimut) * distance, height, Math.cos(azimut) * distance)
  c.lookAt(0, ORBIT_TARGET_Y, 0)
  if ((frameX !== 0 || frameY !== 0) && logoW > 0 && logoH > 0) aimWithFraming(c, aspecto, logoW, logoH, Math.hypot(distance, height - ORBIT_TARGET_Y), frameX, frameY)
  c.updateMatrixWorld(true)
  return c
}

/** El lugar del título en el cuadro cuando se lee (px CSS): el comienzo del renglón, la caja de su línea y su cuerpo. */
export interface LugarEnElCuadro {
  readonly izquierda: number
  readonly arriba: number
  /** El alto de la caja de la línea y el cuerpo de la letra (`font-size`). */
  readonly linea: number
  readonly cuerpo: number
  /** El cuadro (px CSS). */
  readonly ancho: number
  readonly alto: number
}

/** Las medidas de la fuente que ubican la línea de base en la caja de la línea (las de `hhea`, en unidades de la fuente). */
export interface MedidasDeLaFuente {
  readonly ascender: number
  readonly descender: number
  readonly resolution: number
}

/** La línea de base en el cuadro (px): el modelo de CSS (la mitad del interlineado arriba de la caja de la fuente). */
export function lineaDeBase(l: LugarEnElCuadro, f: MedidasDeLaFuente): number {
  const caja = ((f.ascender - f.descender) / f.resolution) * l.cuerpo
  return l.arriba + (l.linea - caja) / 2 + (f.ascender / f.resolution) * l.cuerpo
}

/**
 * [RETOQUE PANEL] T4 · un punto de la caja de un lugar (px CSS desde su esquina de arriba a la izquierda, sin
 * transformaciones), en em desde el origen del título (el comienzo de la línea de base): la cuenta con que se coloca.
 */
export function enEmDelLugar(el: HTMLElement, fuente: MedidasDeLaFuente, renglones = 1): (x: number, y: number) => readonly [number, number] {
  const cuerpo = parseFloat(getComputedStyle(el).fontSize)
  // [PULIDO 10] J1 · la línea de base es la del PRIMER renglón (el alto de uno, no el de la caja entera).
  const base = lineaDeBase({ izquierda: 0, arriba: 0, linea: el.offsetHeight / Math.max(1, renglones), cuerpo, ancho: 0, alto: 0 }, fuente)
  return (x, y) => [x / cuerpo, (base - y) / cuerpo]
}

const RAYO = new THREE.Vector3()
const ADELANTE = new THREE.Vector3()
const CENTRO = new THREE.Vector3()

/**
 * Pone el título (su grupo, con la geometría en em y el origen en el comienzo de la línea de base) donde la cámara del
 * nudo lo ve en su lugar del DOM: a la profundidad del centro del logo, de frente y del cuerpo del DOM. Devuelve cuánto
 * mundo es un píxel a esa profundidad.
 */
export function colocar(grupo: THREE.Object3D, camara: THREE.PerspectiveCamera, lugar: LugarEnElCuadro, fuente: MedidasDeLaFuente): number {
  camara.getWorldDirection(ADELANTE)
  CENTRO.set(0, ORBIT_TARGET_Y, 0).sub(camara.position)
  const profundidad = CENTRO.dot(ADELANTE)
  const x = (2 * lugar.izquierda) / lugar.ancho - 1
  const y = 1 - (2 * lineaDeBase(lugar, fuente)) / lugar.alto
  RAYO.set(x, y, 0.5).unproject(camara).sub(camara.position).normalize()
  grupo.position.copy(camara.position).addScaledVector(RAYO, profundidad / RAYO.dot(ADELANTE))
  grupo.quaternion.copy(camara.quaternion)
  const mundoPorPx = (2 * profundidad * Math.tan(THREE.MathUtils.degToRad(camara.fov) / 2)) / lugar.alto
  grupo.scale.setScalar(lugar.cuerpo * mundoPorPx)
  grupo.updateMatrixWorld(true)
  return mundoPorPx
}

/**
 * [RETOQUE 3D] B1 · EL RECORRIDO DEL ESCENARIO, en px de scroll: entre `inicio` y `fin` el escenario pegajoso del título
 * está clavado (el título, en su lugar de lectura); antes baja con la sección y después sube con ella. Sin escenario, el
 * título va con la página: los dos son el scroll de ahora. Se lee una vez por llegada (con el escenario suelto un momento
 * para medir su lugar natural), nunca por cuadro.
 */
export interface PinDelLugar {
  readonly inicio: number
  readonly fin: number
}

export function pinDelLugar(el: HTMLElement): PinDelLugar {
  let e: HTMLElement | null = el
  while (e !== null && getComputedStyle(e).position !== 'sticky') e = e.parentElement
  const padre = e?.parentElement ?? null
  if (e === null || padre === null) return { inicio: scrollY, fin: scrollY }
  const pegado = parseFloat(getComputedStyle(e).top) || 0
  const antes = e.style.position
  e.style.position = 'relative'
  const natural = e.getBoundingClientRect().top + scrollY
  e.style.position = antes
  const caja = getComputedStyle(padre)
  const fondo = padre.getBoundingClientRect().bottom + scrollY - (parseFloat(caja.paddingBottom) || 0) - (parseFloat(caja.borderBottomWidth) || 0)
  return { inicio: natural - pegado, fin: Math.max(natural, fondo - e.offsetHeight) - pegado }
}

/** Cuánto está corrido el escenario de su lugar clavado con el scroll `y` (px, positivo hacia abajo). */
export function corrimiento(pin: PinDelLugar, y: number): number {
  return y < pin.inicio ? pin.inicio - y : y > pin.fin ? pin.fin - y : 0
}

/**
 * El lugar de un elemento del DOM cuando se lee: su caja SIN transformaciones (la llegada y la huida de la pieza la
 * mueven), relativa a su escenario pegajoso (`sticky`), que en la lectura está clavado; `subida` (fracción del cuadro)
 * es lo que la pieza sube en su lectura por una transformación de más arriba (la frase de Por qué develOP, con los
 * valores). Sin escenario, su caja de ahora.
 */
export function lugarDeLectura(el: HTMLElement, subida: number, renglones = 1): LugarEnElCuadro {
  const cuerpo = parseFloat(getComputedStyle(el).fontSize)
  // [PULIDO 10] J1 · el alto de UN renglón: con el texto partido, el origen del título va en el primero.
  const linea = el.offsetHeight / Math.max(1, renglones)
  let [x, y] = [0, 0]
  let e: HTMLElement | null = el
  while (e !== null && getComputedStyle(e).position !== 'sticky') {
    x += e.offsetLeft
    y += e.offsetTop
    e = e.offsetParent instanceof HTMLElement ? e.offsetParent : null
  }
  if (e === null) {
    // [RETOQUE 3D] Sin escenario: su lugar en el documento (sin transformaciones: la llegada de la pieza la mueve) menos el
    // scroll de ahora; con el recorrido de `pinDelLugar` (el scroll de ahora en las dos puntas) va con la página.
    return { izquierda: x - scrollX, arriba: y - scrollY - subida * innerHeight, linea, cuerpo, ancho: innerWidth, alto: innerHeight }
  }
  const pegado = parseFloat(getComputedStyle(e).top) || 0
  return { izquierda: x + e.getBoundingClientRect().left, arriba: y + pegado - subida * innerHeight, linea, cuerpo, ancho: innerWidth, alto: innerHeight }
}

/**
 * La x de cada letra del texto del elemento (em, desde el comienzo del renglón; sin los espacios): lo que el navegador
 * compuso, con el interletrado y el kerning. Relativa a la caja del elemento, así que una escala de la pieza no la cambia.
 */
export function posicionesDelDom(el: HTMLElement): number[] | null {
  return letrasDelDom(el)?.x ?? null
}

/**
 * [PULIDO 10] J1 · LAS LETRAS DEL DOM EN SUS RENGLONES: la x de cada una (em, desde la caja), en qué renglón está (0 el primero),
 * cuántos renglones hay y cuánto baja cada uno (em). Antes el título leía sólo la x y ponía todo en UNA línea de base: con el
 * texto partido (el registro 1 del hero a 1024), los renglones se encimaban («VINEGOOO»). Un renglón nuevo empieza cuando la
 * letra baja más de medio cuerpo.
 */
export interface LetrasDelDom {
  readonly x: number[]
  readonly renglon: number[]
  readonly renglones: number
  readonly paso: number
}

export function letrasDelDom(el: HTMLElement): LetrasDelDom | null {
  // [RETOQUE 3D] Todos los nodos de texto que se ven, en orden (el registro 1 del hero son dos palabras en dos `span` y un
  // espacio; «El equipo» va partido por el canal del texto, con su copia para el lector): las letras, sin los espacios.
  const recorrido = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest('.sr-only') === null ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) })
  const caja = el.getBoundingClientRect()
  const escala = el.offsetWidth > 0 ? caja.width / el.offsetWidth : 1
  const cuerpo = parseFloat(getComputedStyle(el).fontSize)
  const rango = document.createRange()
  const x: number[] = []
  const renglon: number[] = []
  const arribas: number[] = []
  for (let nodo = recorrido.nextNode(); nodo !== null; nodo = recorrido.nextNode()) {
    if (!(nodo instanceof Text)) continue
    for (let k = 0; k < nodo.length; k += 1) {
      if (nodo.data[k].trim() === '') continue
      rango.setStart(nodo, k)
      rango.setEnd(nodo, k + 1)
      const r = rango.getBoundingClientRect()
      x.push((r.left - caja.left) / escala / cuerpo)
      const arriba = (r.top - caja.top) / escala / cuerpo
      if (arribas.length === 0 || arriba > arribas[arribas.length - 1] + 0.5) arribas.push(arriba)
      renglon.push(arribas.length - 1)
    }
  }
  if (x.length === 0) return null
  const renglones = arribas.length
  return { x, renglon, renglones, paso: renglones > 1 ? (arribas[renglones - 1] - arribas[0]) / (renglones - 1) : 0 }
}
