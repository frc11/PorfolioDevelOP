import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datosDeLaChivo from '../../../_fuentes/chivo-400-titulos.json'
import datosDeLosValores from '../../../_fuentes/chivo-400-valores.json'
import type { ContornoDelLogo } from '../logoDeNoche'
import { ORBIT_TARGET_Y } from '../probeScene'
import type { Variante } from '../titulos3d/armado'
import { corrimiento, lineaDeBase, lugarDeLectura, pinDelLugar, posicionesDelDom, type LugarEnElCuadro, type PinDelLugar } from '../titulos3d/colocacion'
import type { RenglonDelCta } from './enVivo'
import { FUENTES_DEL_CTA, TRACKING_DEL_CTA, avancesDe, type FuenteConKerning } from './fuentesDelCta'
import { letrasDelRenglon, soltarElRenglon, type RenglonArmado } from './letras'
import { contornoDelRenglon, materialDelCta, type MaterialDelCta } from './material'
import { nuevaPose, type LetraEnPantalla, type Pose, type PosesDeLaTransformacion } from './transformacion'

/**
 * [PULIDO 2] 5 · CÓMO SE ARMA EL CTA DEL FINAL EN LA ESCENA — los renglones del DOM (de dónde sale y adónde llega), letra por
 * letra con sus materiales, en un MARCO frente a la cámara: un plano a la profundidad del centro del logo (como los títulos
 * de `pantalla`), en px CSS de la pantalla. Así la transformación se mueve en la pantalla y el giro de la cámara entre los
 * valores y el CTA no la deforma; en el 0 la frase queda donde la deja el título de volumen (la misma cuenta: su lugar de
 * lectura y la línea de base de su fuente). [PULIDO 4] C1 · el cruce de `2411371a`: el origen («Seis razones para
 * elegirnos», en la Chivo de los títulos) y el CTA («HABLANOS», en Archivo). La metamorfosis de los valores en la frase va en
 * su propio plano (`lienzo`), pegado a la pantalla desde el arranque: los valores son del DOM, que va en la pantalla.
 */

/** El origen, en la Chivo de los títulos. [PULIDO 5] D1 · el CTA, en Archivo 900 del ancho de la carga (`fuentesDelCta.ts`). */
const CHIVO = new Font(datosDeLaChivo as FontData)

/**
 * [PULIDO 4] C1 · las de la metamorfosis: los valores en la Chivo del DOM (400) y la frase en Archivo con su copy (minúsculas,
 * acentos). [PULIDO 5] D1 · la frase en 600 y el destacado en 900, con su kerning (`fuentesDelCta.ts`).
 */
const VALORES = new Font(datosDeLosValores as FontData)
export function fuentesDeLaMetamorfosis(): { readonly valores: Font; readonly frase: FuenteConKerning; readonly fuerte: FuenteConKerning } {
  return { valores: VALORES, ...FUENTES_DEL_CTA }
}

export interface Pieza {
  readonly grupo: THREE.Group
  readonly malla: THREE.Mesh
  readonly material: MaterialDelCta
  readonly pivote: THREE.Vector3
  readonly ancho: number
  readonly alto: number
  readonly letra: string
}

interface Bloque {
  readonly el: HTMLElement
  /**
   * Medido en vivo (su caja de ahora, en cada cuadro) o con su lugar de lectura (el de la frase de volumen: la misma cuenta
   * que el título, sin transformaciones y corrido con su escenario). El CTA va en vivo: su bloque está centrado con una
   * traslación (`-translate-y-1/2`) que el lugar de lectura no ve, y nada lo anima.
   */
  readonly vivo: boolean
  readonly fuente: Font
  readonly renglon: RenglonArmado
  readonly contorno: ContornoDelLogo
  readonly piezas: Pieza[]
  readonly lugar: LugarEnElCuadro
  readonly pin: PinDelLugar
  readonly indice: number
  /**
   * [PULIDO 5] D1 · el CTA: su lugar de LECTURA, fijo (con el escenario clavado; medido al armarse), y cuánto se corren sus letras
   * para quedar centradas en él (px): el CTA queda en el mundo, no sigue a su caja del DOM (que va con la página al soltarse).
   */
  readonly fijo: { readonly lugar: LugarEnElCuadro; readonly dx: number; readonly ancho: number; readonly pin: PinDelLugar } | null
}

type LetraViva = { -readonly [K in keyof LetraEnPantalla]: LetraEnPantalla[K] }

export interface ArmadoDelCta {
  readonly marco: THREE.Group
  /** [PULIDO 4] C1 · el plano de la metamorfosis: el del marco con la cámara viva, desde el arranque. */
  readonly lienzo: THREE.Group
  readonly origen: Bloque[]
  readonly destino: Bloque
  readonly letras: { readonly origen: LetraViva[]; readonly destino: LetraViva[] }
  readonly poses: PosesDeLaTransformacion
}

/** El texto que se ve de un elemento (sin las copias para el lector), como lo mide `posicionesDelDom`. */
function textoVisible(el: HTMLElement): string {
  const recorrido = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest('.sr-only') === null ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) })
  let texto = ''
  for (let n = recorrido.nextNode(); n !== null; n = recorrido.nextNode()) texto += n.textContent ?? ''
  return texto.trim()
}

function armarElBloque(renglon: RenglonArmado, fuente: Font, el: HTMLElement, subida: number, indice: number, color: Variante, marco: THREE.Group, vivo: boolean, fijo: Bloque['fijo'] = null): Bloque {
  const contorno = contornoDelRenglon(renglon.contornos)
  const piezas = renglon.letras.map((l) => {
    const material = materialDelCta(color, contorno)
    const malla = new THREE.Mesh(l.geometria, material.material)
    malla.position.copy(l.pivote).negate()
    malla.frustumCulled = false
    const grupo = new THREE.Group()
    grupo.add(malla)
    grupo.visible = false
    marco.add(grupo)
    return { grupo, malla, material, pivote: l.pivote, ancho: l.ancho, alto: l.alto, letra: l.letra }
  })
  return { el, vivo, fuente, renglon, contorno, piezas, lugar: lugarDeLectura(el, subida), pin: pinDelLugar(el), indice, fijo }
}

/**
 * [PULIDO 5] D1 · el lugar de lectura del CTA: su caja SIN la transformada que lo lleva al plano proyectado (la del enlace, A1),
 * con el escenario clavado (sin su corrimiento de ahora), y su cuerpo: el del DOM salvo que no entre en `anchoMaximo` (px).
 */
function lugarDelCta(el: HTMLElement, anchoEnEm: number, anchoMaximo: number): NonNullable<Bloque['fijo']> {
  const ancla = el.closest('a')
  const antes = ancla?.style.transform ?? ''
  if (ancla !== null) ancla.style.transform = ''
  const r = el.getBoundingClientRect()
  if (ancla !== null) ancla.style.transform = antes
  const cuerpo = Math.min(parseFloat(getComputedStyle(el).fontSize), anchoMaximo / Math.max(1e-6, anchoEnEm))
  const pin = pinDelLugar(el)
  const arriba = r.top - corrimiento(pin, scrollY)
  return { lugar: { izquierda: r.left, arriba, linea: r.height, cuerpo, ancho: innerWidth, alto: innerHeight }, dx: (r.width - anchoEnEm * cuerpo) / 2, ancho: anchoEnEm * cuerpo, pin }
}

const letraViva = (): LetraViva => ({ x: 0, y: 0, cuerpo: 1, ancho: 0, alto: 0, renglon: 0, letra: '' })

/**
 * Arma el giro: el origen («Seis razones», con sus renglones del DOM) y el CTA («HABLANOS», en su lugar de lectura). [PULIDO 5]
 * D1 · el CTA en Archivo 900 del ancho de la carga, con su kerning, centrado en su caja del DOM.
 */
export function armarElCta(origen: readonly RenglonDelCta[], destino: HTMLElement, color: Variante, origenVivo: boolean, fuerte: FuenteConKerning, anchoMaximo: number): ArmadoDelCta {
  const marco = new THREE.Group()
  marco.name = 'cta del final'
  const lienzo = new THREE.Group()
  lienzo.name = 'cta del final · la metamorfosis'
  const bloquesDelOrigen = origen.map((r, k) => armarElBloque(letrasDelRenglon(CHIVO, textoVisible(r.el), posicionesDelDom(r.el)), CHIVO, r.el, r.subida, k, color, marco, origenVivo))
  const texto = textoVisible(destino)
  const avances = avancesDe(fuerte, texto, TRACKING_DEL_CTA.fuerte)
  const bloqueDelDestino = armarElBloque(letrasDelRenglon(fuerte.fuente, texto, avances.x), fuerte.fuente, destino, 0, 0, color, marco, false, lugarDelCta(destino, avances.ancho, anchoMaximo))
  const enElOrigen = bloquesDelOrigen.reduce((n, b) => n + b.piezas.length, 0)
  const enElDestino = bloqueDelDestino.piezas.length
  return {
    marco,
    lienzo,
    origen: bloquesDelOrigen,
    destino: bloqueDelDestino,
    letras: { origen: Array.from({ length: enElOrigen }, letraViva), destino: Array.from({ length: enElDestino }, letraViva) },
    poses: { origen: Array.from({ length: enElOrigen }, nuevaPose), destino: Array.from({ length: enElDestino }, nuevaPose) },
  }
}

export function soltarElCta(a: ArmadoDelCta): void {
  for (const b of [...a.origen, a.destino]) {
    soltarElRenglon(b.renglon)
    for (const p of b.piezas) p.material.material.dispose()
    b.contorno.textura.dispose()
  }
}

/** Las letras de los renglones en la pantalla de ahora (px): su lugar de lectura, corrido con la página (`y`: el scroll). */
export function letrasEnLaPantalla(a: ArmadoDelCta, y: number): void {
  const llenar = (bloques: readonly Bloque[], salida: LetraViva[]): void => {
    let i = 0
    for (const b of bloques) {
      const caja = b.vivo ? b.el.getBoundingClientRect() : null
      const lugar = b.fijo !== null ? b.fijo.lugar : caja === null ? { ...b.lugar, arriba: b.lugar.arriba + corrimiento(b.pin, y) } : { ...b.lugar, izquierda: caja.left, arriba: caja.top }
      const base = lineaDeBase(lugar, b.fuente.data)
      const c = lugar.cuerpo
      const dx = b.fijo?.dx ?? 0
      for (const p of b.piezas) {
        const l = salida[i]
        i += 1
        l.x = lugar.izquierda + dx + p.pivote.x * c
        l.y = base - p.pivote.y * c
        l.cuerpo = c
        l.ancho = p.ancho * c
        l.alto = p.alto * c
        l.renglon = b.indice
        l.letra = p.letra
      }
    }
  }
  llenar(a.origen, a.letras.origen)
  llenar([a.destino], a.letras.destino)
}

const ADELANTE = new THREE.Vector3()
const CENTRO = new THREE.Vector3()
const RAYO = new THREE.Vector3()
const ABAJO = new THREE.Vector3()

/** Dónde va el marco con una cámara: el plano frente a ella a la profundidad del centro del logo, con el origen en la esquina de arriba a la izquierda y un px por unidad. */
export interface LugarDelMarco {
  readonly posicion: THREE.Vector3
  readonly giro: THREE.Quaternion
  escala: number
}
export const nuevoLugarDelMarco = (): LugarDelMarco => ({ posicion: new THREE.Vector3(), giro: new THREE.Quaternion(), escala: 1 })

/** El plano del marco con la cámara `camara`, a `cerca` de la profundidad del centro del logo (lo escribe en `salida`). */
export function lugarDelMarco(camara: THREE.PerspectiveCamera, alto: number, cerca: number, salida: LugarDelMarco): LugarDelMarco {
  camara.updateMatrixWorld()
  camara.getWorldDirection(ADELANTE)
  CENTRO.set(0, ORBIT_TARGET_Y, 0).sub(camara.position)
  const profundidad = CENTRO.dot(ADELANTE) * cerca
  enElPlano(camara, -1, 1, profundidad, salida.posicion)
  // El alto del cuadro en el plano, de la esquina de arriba a la de abajo: exacto con cualquier proyección (el encuadre del
  // logo corre el centro y el final se acerca con el zoom; la cuenta con el `fov` solo no los ve).
  salida.escala = enElPlano(camara, -1, -1, profundidad, ABAJO).distanceTo(salida.posicion) / Math.max(1, alto)
  salida.giro.copy(camara.quaternion)
  return salida
}

/** El punto del plano a `profundidad` de la cámara que se ve en (x, y) del cuadro (de −1 a 1). */
function enElPlano(camara: THREE.PerspectiveCamera, x: number, y: number, profundidad: number, salida: THREE.Vector3): THREE.Vector3 {
  RAYO.set(x, y, 0.5).unproject(camara).sub(camara.position).normalize()
  return salida.copy(camara.position).addScaledVector(RAYO, profundidad / RAYO.dot(ADELANTE))
}

/**
 * El marco del cuadro, entre dos lugares (`desde` y `hasta`, con `u` de 0 a 1). [PULIDO 3B] B1 · el del CTA, un poco MÁS LEJOS
 * que el logo (`MARCO_DEL_CTA.cerca` de la profundidad de su centro; antes, 0,8, delante): ninguna letra pasa por delante del
 * logo negro (lo que se cruza con él queda detrás). El tamaño en la pantalla es el mismo. [PULIDO 5] D1 · los dos lugares son
 * del MUNDO (`EscenaDelCta.tsx`): el del título de la frase (la cámara de su lectura) y el del CTA (la cámara del nudo `cta`);
 * ya no el de la cámara viva, pegado a la pantalla.
 */
export const MARCO_DEL_CTA = { cerca: 1.12 } as const

export function ponerElMarco(marco: THREE.Group, desde: LugarDelMarco, hasta: LugarDelMarco, u: number): void {
  marco.position.lerpVectors(desde.posicion, hasta.posicion, u)
  marco.quaternion.slerpQuaternions(desde.giro, hasta.giro, u)
  marco.scale.setScalar(desde.escala + (hasta.escala - desde.escala) * u)
  marco.updateMatrixWorld(true)
}

/** Una pieza en su pose: en px del marco (y hacia abajo), girada sobre su centro y del cuerpo de la pose. */
export function ponerLaPieza(pieza: Pieza, pose: Pose): void {
  const g = pieza.grupo
  g.visible = pose.aparece > 0.001
  if (!g.visible) return
  g.position.set(pose.x, -pose.y, pose.z)
  g.rotation.set(pose.rx, pose.ry, 0)
  g.scale.set(pose.escala, pose.escala, pose.escala * pose.profundidad)
  pieza.material.aparece.value = pose.aparece
}

/** Todas las piezas del cruce, en orden: las del origen y las del CTA. */
export const piezasDe = (a: ArmadoDelCta): Pieza[] => [...a.origen.flatMap((b) => b.piezas), ...a.destino.piezas]
