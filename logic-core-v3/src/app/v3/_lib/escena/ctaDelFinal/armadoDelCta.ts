import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datosDeLaChivo from '../../../_fuentes/chivo-400-titulos.json'
import datosDeLaChivoFina from '../../../_fuentes/chivo-100-cta.json'
import datosDeArchivo from '../../../_fuentes/archivo-700-titulos.json'
import datosDeArchivoFina from '../../../_fuentes/archivo-100-cta.json'
import type { VarianteDelCta } from '../entorno'
import type { ContornoDelLogo } from '../logoDeNoche'
import { ORBIT_TARGET_Y } from '../probeScene'
import type { Variante } from '../titulos3d/armado'
import { corrimiento, lineaDeBase, lugarDeLectura, pinDelLugar, posicionesDelDom, type LugarEnElCuadro, type PinDelLugar } from '../titulos3d/colocacion'
import type { RenglonDelCta } from './enVivo'
import { capasDelCta, letrasConDosPesos, letrasDelRenglon, soltarElRenglon, type RenglonArmado } from './letras'
import { contornoDelRenglon, materialDelCta, type MaterialDelCta } from './material'
import { CAPAS_DEL_CTA, nuevaPose, type CajaEnPantalla, type LetraEnPantalla, type Pose, type PosesDeLaTransformacion } from './variantes'

/**
 * [PULIDO 2] 5 · CÓMO SE ARMA EL CTA DEL FINAL EN LA ESCENA — los renglones del DOM (de dónde sale y adónde llega), letra por
 * letra con sus materiales, en un MARCO frente a la cámara: un plano a la profundidad del centro del logo (como los títulos
 * de `pantalla`), en px CSS de la pantalla. Así la transformación se mueve en la pantalla y el giro de la cámara entre los
 * valores y el CTA no la deforma; en el 0 la frase queda donde la deja el título de volumen (la misma cuenta: su lugar de
 * lectura y la línea de base de su fuente).
 */

/** Las fuentes: la frase en la Chivo de los títulos y el CTA en Archivo (el registro 1 del hero); para `tipo`, su peso 100. */
const FUENTES = {
  chivo: new Font(datosDeLaChivo as FontData),
  chivoFina: new Font(datosDeLaChivoFina as FontData),
  archivo: new Font(datosDeArchivo as FontData),
  archivoFina: new Font(datosDeArchivoFina as FontData),
}

/** `capas`: el espesor de la pila (em del CTA): tres veces el de un título, para que las seis capas se lean. */
export const ESPESOR_DE_LAS_CAPAS = 0.42

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
}

type LetraViva = { -readonly [K in keyof LetraEnPantalla]: LetraEnPantalla[K] }

export interface ArmadoDelCta {
  readonly marco: THREE.Group
  readonly origen: Bloque[]
  readonly destino: Bloque
  readonly conMorfo: boolean
  readonly letras: { readonly origen: LetraViva[]; readonly destino: LetraViva[] }
  readonly valores: CajaEnPantalla[]
  parejas: number[]
  readonly poses: PosesDeLaTransformacion
}

/** El texto que se ve de un elemento (sin las copias para el lector), como lo mide `posicionesDelDom`. */
function textoVisible(el: HTMLElement): string {
  const recorrido = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest('.sr-only') === null ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) })
  let texto = ''
  for (let n = recorrido.nextNode(); n !== null; n = recorrido.nextNode()) texto += n.textContent ?? ''
  return texto.trim()
}

function armarElBloque(renglon: RenglonArmado, fuente: Font, el: HTMLElement, subida: number, indice: number, color: Variante, marco: THREE.Group, vivo: boolean): Bloque {
  const contorno = contornoDelRenglon(renglon.contornos)
  const piezas = renglon.letras.map((l) => {
    const material = materialDelCta(color, contorno)
    const malla = new THREE.Mesh(l.geometria, material.material)
    malla.position.copy(l.pivote).negate()
    malla.frustumCulled = false
    if (l.geometria.morphAttributes.position !== undefined) malla.updateMorphTargets()
    const grupo = new THREE.Group()
    grupo.add(malla)
    grupo.visible = false
    marco.add(grupo)
    return { grupo, malla, material, pivote: l.pivote, ancho: l.ancho, alto: l.alto, letra: l.letra }
  })
  return { el, vivo, fuente, renglon, contorno, piezas, lugar: lugarDeLectura(el, subida), pin: pinDelLugar(el), indice }
}

const letraViva = (): LetraViva => ({ x: 0, y: 0, cuerpo: 1, ancho: 0, alto: 0, renglon: 0, letra: '' })

/** Arma el CTA de la variante `v`: la frase (salvo en `capas`, donde se va como hoy) y el CTA (en `capas`, sus seis capas). */
export function armarElCta(v: VarianteDelCta, origen: readonly RenglonDelCta[], destino: HTMLElement, color: Variante, origenVivo: boolean): ArmadoDelCta {
  const marco = new THREE.Group()
  marco.name = 'cta del final'
  const conMorfo = v === 'tipo'
  const bloquesDelOrigen = v === 'capas' ? [] : origen.map((r, k) => {
    const texto = textoVisible(r.el)
    const posiciones = posicionesDelDom(r.el)
    const renglon = conMorfo ? letrasConDosPesos(FUENTES.chivo, FUENTES.chivoFina, texto, posiciones) : letrasDelRenglon(FUENTES.chivo, texto, posiciones)
    return armarElBloque(renglon, FUENTES.chivo, r.el, r.subida, k, color, marco, origenVivo)
  })
  const texto = textoVisible(destino)
  const posiciones = posicionesDelDom(destino)
  const renglon = v === 'capas' ? capasDelCta(FUENTES.archivo, texto, posiciones, CAPAS_DEL_CTA, ESPESOR_DE_LAS_CAPAS) : conMorfo ? letrasConDosPesos(FUENTES.archivo, FUENTES.archivoFina, texto, posiciones) : letrasDelRenglon(FUENTES.archivo, texto, posiciones)
  const bloqueDelDestino = armarElBloque(renglon, FUENTES.archivo, destino, 0, 0, color, marco, true)
  const cuantasDelOrigen = bloquesDelOrigen.reduce((n, b) => n + b.piezas.length, 0)
  const cuantasDelDestino = bloqueDelDestino.piezas.length
  return {
    marco,
    origen: bloquesDelOrigen,
    destino: bloqueDelDestino,
    conMorfo,
    letras: { origen: Array.from({ length: cuantasDelOrigen }, letraViva), destino: Array.from({ length: cuantasDelDestino }, letraViva) },
    valores: [],
    parejas: [],
    poses: { origen: Array.from({ length: cuantasDelOrigen }, nuevaPose), destino: Array.from({ length: cuantasDelDestino }, nuevaPose), capas: Array.from({ length: CAPAS_DEL_CTA }, nuevaPose) },
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
      const lugar = caja === null ? { ...b.lugar, arriba: b.lugar.arriba + corrimiento(b.pin, y) } : { ...b.lugar, izquierda: caja.left, arriba: caja.top }
      const base = lineaDeBase(lugar, b.fuente.data)
      const c = lugar.cuerpo
      for (const p of b.piezas) {
        const l = salida[i]
        i += 1
        l.x = lugar.izquierda + p.pivote.x * c
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
interface LugarDelMarco {
  readonly posicion: THREE.Vector3
  readonly giro: THREE.Quaternion
  escala: number
}
const CON_LA_QUIETA: LugarDelMarco = { posicion: new THREE.Vector3(), giro: new THREE.Quaternion(), escala: 1 }
const CON_LA_VIVA: LugarDelMarco = { posicion: new THREE.Vector3(), giro: new THREE.Quaternion(), escala: 1 }

function marcoCon(camara: THREE.PerspectiveCamera, alto: number, cerca: number, salida: LugarDelMarco): void {
  camara.updateMatrixWorld()
  camara.getWorldDirection(ADELANTE)
  CENTRO.set(0, ORBIT_TARGET_Y, 0).sub(camara.position)
  const profundidad = CENTRO.dot(ADELANTE) * cerca
  enElPlano(camara, -1, 1, profundidad, salida.posicion)
  // El alto del cuadro en el plano, de la esquina de arriba a la de abajo: exacto con cualquier proyección (el encuadre del
  // logo corre el centro y el final se acerca con el zoom; la cuenta con el `fov` solo no los ve).
  salida.escala = enElPlano(camara, -1, -1, profundidad, ABAJO).distanceTo(salida.posicion) / Math.max(1, alto)
  salida.giro.copy(camara.quaternion)
}

/** El punto del plano a `profundidad` de la cámara que se ve en (x, y) del cuadro (de −1 a 1). */
function enElPlano(camara: THREE.PerspectiveCamera, x: number, y: number, profundidad: number, salida: THREE.Vector3): THREE.Vector3 {
  RAYO.set(x, y, 0.5).unproject(camara).sub(camara.position).normalize()
  return salida.copy(camara.position).addScaledVector(RAYO, profundidad / RAYO.dot(ADELANTE))
}

/**
 * El marco del cuadro, entre dos cámaras: con la del recorrido sin el mouse (`quieta`: fijo en el mundo como el título de
 * volumen, así en el arranque la frase no salta donde la dejó el título, con el paralaje del mouse incluido) y con la viva
 * (`viva`: pegado a la pantalla, así el CTA llega exacto a su lugar del DOM, al lado del texto que lo acompaña). `aViva`:
 * cuánto de la viva (0 a 1). Con la viva, además, más cerca de la cámara (`MARCO_DEL_CTA.cerca` de la profundidad del logo):
 * lo que vuela pasa por delante del logo en vez de atravesarlo (el tamaño en la pantalla es el mismo).
 */
export const MARCO_DEL_CTA = { cerca: 0.8 } as const

export function ponerElMarco(marco: THREE.Group, quieta: THREE.PerspectiveCamera, viva: THREE.PerspectiveCamera, aViva: number, alto: number): void {
  marcoCon(quieta, alto, 1, CON_LA_QUIETA)
  marcoCon(viva, alto, MARCO_DEL_CTA.cerca, CON_LA_VIVA)
  marco.position.lerpVectors(CON_LA_QUIETA.posicion, CON_LA_VIVA.posicion, aViva)
  marco.quaternion.slerpQuaternions(CON_LA_QUIETA.giro, CON_LA_VIVA.giro, aViva)
  marco.scale.setScalar(CON_LA_QUIETA.escala + (CON_LA_VIVA.escala - CON_LA_QUIETA.escala) * aViva)
  marco.updateMatrixWorld(true)
}

/** Una pieza en su pose: en px del marco (y hacia abajo), girada sobre su centro y del cuerpo de la pose. */
export function ponerLaPieza(pieza: Pieza, pose: Pose, conMorfo: boolean): void {
  const g = pieza.grupo
  g.visible = pose.aparece > 0.001
  if (!g.visible) return
  g.position.set(pose.x, -pose.y, pose.z)
  g.rotation.set(pose.rx, pose.ry, 0)
  g.scale.set(pose.escala, pose.escala, pose.escala * pose.profundidad)
  pieza.material.aparece.value = pose.aparece
  const influencias = pieza.malla.morphTargetInfluences
  if (conMorfo && influencias !== undefined) influencias[0] = pose.fino
}

/** Todas las piezas del armado, en orden: las de la frase y las del CTA (en `capas`, sus capas). */
export const piezasDe = (a: ArmadoDelCta): Pieza[] => [...a.origen.flatMap((b) => b.piezas), ...a.destino.piezas]
