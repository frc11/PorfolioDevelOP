import * as THREE from 'three'

import { homografia, matrix3dCss } from '../../pie3d/homografia'
import { ACOMPANANTES, type Acompanante } from '../../titulos3d/acompanantes'
import type { TituloDeVolumen } from '../../titulos3d/registro'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { camaraDeLaLectura, colocar, corrimiento, lineaDeBase, lugarDeLectura, pinDelLugar, type LugarEnElCuadro, type MedidasDeLaFuente, type PinDelLugar } from './colocacion'

/**
 * [NOCTURNO] A1 · EL TEXTO 2D EN EL PLANO DE SU TÍTULO, en la escena — cada acompañante (`titulos3d/acompanantes.ts`, del
 * DOM) va, en cada cuadro, donde la cámara VIVA (con el mouse) ve el plano de su título: el mismo plano en que el título
 * se coloca (`colocacion.ts`), a la profundidad del logo y de frente a la cámara con que se coloca (la de su lectura, o la
 * de ahora sin el mouse si va con la página). Con la cámara en esa pose es la identidad; con el paralaje o la órbita, el
 * corrimiento y la perspectiva del título: queda siempre debajo de él, como si estuviera en el mismo plano.
 *
 * El plano es del título, no de sus letras: existe aunque todavía no llegó ninguna (si no, el texto saltaría cuando
 * empieza la llegada). Se mide como el título (`lugarDeLectura`, el recorrido de su escenario) una vez, y de nuevo al
 * cambiar el cuadro o al volver a colocarse el título; por cuadro, sólo cuentas. Lo que se escribe es una `matrix3d` con
 * `transform-origin` en 0 0 (`homografia.ts`, la del pie), sólo si cambió. Fuera del cuadro, o con el plano detrás de la
 * cámara, en su lugar.
 */

/** Lo que la cuenta lee de un título armado (`TitulosDeVolumen.tsx`): su anotación, su fuente y su último lugar. */
export interface TituloConPlano {
  readonly titulo: TituloDeVolumen
  readonly fuente: { readonly data: MedidasDeLaFuente }
  readonly lugar: LugarEnElCuadro | null
}

interface Plano {
  /** El lugar del título (como lo mide el título) y el recorrido de su escenario. */
  readonly lugar: LugarEnElCuadro
  readonly pin: PinDelLugar
  /** La caja del acompañante en el mismo marco (px): arriba, sin la subida del título (el acompañante no sube con él). */
  readonly caja: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }
  /** `lectura`: la pose del plano con la cámara de su lectura, su arriba y cuánto mundo es un píxel ahí. */
  readonly base: THREE.Vector3
  readonly giro: THREE.Quaternion
  readonly escala: number
  readonly arriba: THREE.Vector3
  readonly mpp: number
  /** Con qué se midió: el lugar que el título tenía y el cuadro. */
  readonly delArmado: LugarEnElCuadro | null
  readonly cuadro: string
}

const PLANOS = new WeakMap<Acompanante, Plano>()
const PLANO = new THREE.Group()
const DE_LA_LECTURA = new THREE.PerspectiveCamera()
const PUNTO = new THREE.Vector3()
const HACIA = new THREE.Vector3()
const DESDE = new THREE.Vector3()
const ADELANTE = new THREE.Vector3()
const AHORA: { -readonly [K in keyof LugarEnElCuadro]: LugarEnElCuadro[K] } = { izquierda: 0, arriba: 0, linea: 0, cuerpo: 0, ancho: 0, alto: 0 }
const ESQUINAS = [0, 0, 1, 0, 1, 1, 0, 1] as const
const CUADRILATERO: number[] = []
const MATRIZ: number[] = []

/** Un cuadro: cada acompañante, en el plano de su título como lo ve la cámara viva. */
export function llevarLosAcompanantes(armados: readonly TituloConPlano[], viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, logo: { readonly logoW: number; readonly logoH: number }): void {
  if (ACOMPANANTES.size === 0) return
  viva.updateMatrixWorld()
  for (const [el, ac] of ACOMPANANTES) {
    const a = armados.find((x) => x.titulo.id === ac.titulo)
    const css = a === undefined ? '' : enSuPlano(el, ac, a, viva, cuadro, logo)
    if (css === ac.css) continue
    ac.css = css
    el.style.transformOrigin = css === '' ? '' : '0 0'
    el.style.transform = css
  }
}

/** La transformada del acompañante en este cuadro (`''`: en su lugar). */
function enSuPlano(el: HTMLElement, ac: Acompanante, a: TituloConPlano, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, logo: { readonly logoW: number; readonly logoH: number }): string {
  const t = a.titulo
  const p = planoDe(el, ac, a, cuadro, logo)
  if (p === null) return ''
  // Lo que el título va corrido (px): su escenario (el que se queda y el que va con la página) y su pieza.
  const d = (t.queda || t.colocacion === 'pantalla' ? corrimiento(p.pin, scrollY) : 0) + t.corrida * cuadro.alto
  const { x, ancho, alto } = p.caja
  const y = p.caja.y + d
  if (ancho <= 0 || alto <= 0 || y > cuadro.alto || y + alto < 0) return ''
  if (t.colocacion === 'pantalla') {
    Object.assign(AHORA, p.lugar)
    AHORA.arriba = p.lugar.arriba + d
    colocar(PLANO, CAMARA_SIN_EL_MOUSE, AHORA, a.fuente.data)
  } else {
    PLANO.position.copy(p.base).addScaledVector(p.arriba, -d * p.mpp)
    PLANO.quaternion.copy(p.giro)
    PLANO.scale.setScalar(p.escala)
    PLANO.updateMatrixWorld(true)
  }
  // El comienzo de la línea de base del título (px, ahora): el origen del plano.
  const ancla = { x: p.lugar.izquierda, y: lineaDeBase(p.lugar, a.fuente.data) + d }
  if (!cuadrilateroEnElPlano(PLANO, ancla, p.lugar.cuerpo, { x, y, ancho, alto }, viva, cuadro, CUADRILATERO)) return ''
  return homografia(ancho, alto, CUADRILATERO, MATRIZ) ? matrix3dCss(MATRIZ) : ''
}

/**
 * Dónde ve la cámara `viva` las cuatro esquinas de la `caja` (px del cuadro, sin transformar) puestas en el plano del
 * título: el `plano` (su grupo, en em, con el origen en el comienzo de su línea de base) tiene ese origen en `ancla` (px)
 * y un em es `cuerpo` px. Escribe en `destino` las esquinas relativas a la de arriba a la izquierda de la caja (arriba
 * izquierda, arriba derecha, abajo derecha, abajo izquierda); `false` si alguna queda detrás de la cámara. Pura (fuera
 * de three): el invariante la prueba sin navegador.
 */
export function cuadrilateroEnElPlano(plano: THREE.Object3D, ancla: { readonly x: number; readonly y: number }, cuerpo: number, caja: { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, destino: number[]): boolean {
  viva.getWorldPosition(DESDE)
  viva.getWorldDirection(ADELANTE)
  destino.length = 8
  for (let k = 0; k < 4; k += 1) {
    const [cx, cy] = [caja.x + ESQUINAS[2 * k] * caja.ancho, caja.y + ESQUINAS[2 * k + 1] * caja.alto]
    PUNTO.set((cx - ancla.x) / cuerpo, -(cy - ancla.y) / cuerpo, 0).applyMatrix4(plano.matrixWorld)
    if (HACIA.copy(PUNTO).sub(DESDE).dot(ADELANTE) <= 0.05) return false
    PUNTO.project(viva)
    destino[2 * k] = ((PUNTO.x + 1) / 2) * cuadro.ancho - caja.x
    destino[2 * k + 1] = ((1 - PUNTO.y) / 2) * cuadro.alto - caja.y
  }
  return true
}

/** El plano del título y la caja del acompañante: medidos una vez (y de nuevo con otro cuadro u otro lugar del título). */
function planoDe(el: HTMLElement, ac: Acompanante, a: TituloConPlano, cuadro: { readonly ancho: number; readonly alto: number }, logo: { readonly logoW: number; readonly logoH: number }): Plano | null {
  const firma = `${String(cuadro.ancho)}x${String(cuadro.alto)}`
  const viejo = PLANOS.get(ac)
  if (viejo !== undefined && viejo.cuadro === firma && viejo.delArmado === a.lugar) return viejo
  const t = a.titulo
  if (!t.lugar.isConnected || !el.isConnected) return null
  const lugar = lugarDeLectura(t.lugar, t.subida)
  const pin = t.queda || t.colocacion === 'pantalla' ? pinDelLugar(t.lugar) : { inicio: scrollY, fin: scrollY }
  const [delTitulo, delAcompanante] = [desplazamiento(t.lugar), desplazamiento(el)]
  const caja = { x: lugar.izquierda + delAcompanante.x - delTitulo.x, y: lugar.arriba + t.subida * innerHeight + delAcompanante.y - delTitulo.y, ancho: el.offsetWidth, alto: el.offsetHeight }
  let [mpp, escala] = [0, 1]
  const arriba = new THREE.Vector3(0, 1, 0)
  if (t.colocacion === 'lectura') {
    const camara = camaraDeLaLectura(t.lectura, cuadro.ancho / Math.max(1, cuadro.alto), logo.logoW, logo.logoH, DE_LA_LECTURA)
    mpp = colocar(PLANO, camara, lugar, a.fuente.data)
    escala = PLANO.scale.x
    arriba.applyQuaternion(camara.quaternion)
  }
  const p: Plano = { lugar, pin, caja, base: PLANO.position.clone(), giro: PLANO.quaternion.clone(), escala, arriba, mpp, delArmado: a.lugar, cuadro: firma }
  PLANOS.set(ac, p)
  return p
}

/** Dónde está la caja del elemento sin transformaciones, hasta su escenario pegajoso (`sticky`): como lo mide el título. */
function desplazamiento(el: HTMLElement): { readonly x: number; readonly y: number } {
  let [x, y] = [0, 0]
  let e: HTMLElement | null = el
  while (e !== null && getComputedStyle(e).position !== 'sticky') {
    x += e.offsetLeft
    y += e.offsetTop
    e = e.offsetParent instanceof HTMLElement ? e.offsetParent : null
  }
  return { x, y }
}
