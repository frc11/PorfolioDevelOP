import * as THREE from 'three'

import { BLOQUES_DEL_FAQ, BOTON_EN_VIVO, FAQ_EN_VIVO, faseEn, nivelesDelFaq, pasoDelBoton, subidaDelBloque, versionDelFaqDeVolumen, type IdDelBloqueDelFaq } from '../../pie3d/faqDelPie'
import { homografia, matrix3dCss, nitidaEn } from '../../pie3d/homografia'
import { HUNDIMIENTO_DEL_PIE, pisoDelHundimiento } from '../../formularios/volteo'
import { SALIDA_EN_VIVO } from '../../pie3d/salidas'
import { hayBanco } from '../entorno'
import { CAIDA_DEL_PIE } from '../final/caidaDelPie'
import { FLOOR_Y } from '../probeScene'
import { luzAcostada } from './acostado'
import type { CaidaDelPie } from './caida'
import { caraEnElCuadro } from './colocacion'
import { uniformesDelPie, type UniformesDelPie } from './coreografia'
import { capaPropia, fijarLaFase } from './domQueSigue'
import { VOLUMEN_DEL_PIE, armarElBloque } from './geometria'
import { HUECOS_DEL_PIE, HUECO_DEL_PIE, MAXIMO_DE_HUECOS_DEL_PIE, QUIETUD_DEL_PIE } from './huecos'
import { fundirLaPlaca, hundirComoElPie } from './hundidoDelFaq'
import { materialDelPie } from './material'

/**
 * [C2-71] EL FAQ DE VOLUMEN (ítem 22) — sus bloques son placas de la escena, con la estructura del bloque del formulario del pie (su
 * volumen, su canto y su negro satinado: `armarElBloque`), acostadas e incrustadas en el piso como él. El DOM de cada bloque (el texto, las
 * preguntas, el WhatsApp, el botón) se anota en `pie3d/faqDelPie.ts` y queda sobre la cara de su placa (la transformada de cada cuadro,
 * como lo interactivo del pie: `domQueSigue.ts`).
 *
 *   respuesta   donde estaba el formulario y de su tamaño (sube por el mismo lugar del piso por el que se hundió el formulario)
 *   preguntas   donde estaba la columna izquierda, del ancho del formulario y más alto
 *   whatsapp    abajo de la respuesta, alineado a su izquierda (sube con la primera respuesta)
 *   boton       abajo del logo, entre las dos columnas (sale después de que el pie se acostó: `BOTON_EN_VIVO`)
 *
 * Cada uno sube con su nivel (`subidaDelBloque`): se abre su hueco en el piso (la silueta exacta, desde el centro) con la placa abajo, y
 * sube sobre su plataforma (el fondo del pozo la acompaña: nada atraviesa nada) hasta asomar `asoma` px; recién quieto aparece su texto.
 * Bajando, al revés. Los huecos y la quietud del piso se escriben DESPUÉS de los del pie (los usan el piso y los pozos: `pozos.ts`).
 */
export const BLOQUES_DE_VOLUMEN = {
  /** El espesor de la placa (px: el del formulario) y lo que asoma sobre el piso acostada (px: la cara del formulario sobre sus pozos). */
  espesor: VOLUMEN_DEL_PIE.formulario,
  asoma: VOLUMEN_DEL_PIE.pozo + 1,
  /** Abajo, cuánto queda la cara debajo del piso antes de subir (u). */
  debajo: 0.3,
  /** Entre bloques y hasta el logo (u). */
  aire: CAIDA_DEL_PIE.aire,
  /** [L5] Cuánto más abajo va el botón del FAQ (en alturas del botón). */
  bajaElBoton: 1.6,
} as const

/**
 * La pose de un bloque con su nivel `v` y la escala del pie (`mpp`, u por px): la altura de su cara (u), cuánto está abierto su hueco y
 * lo hondo del fondo de su pozo (u bajo el piso): el fondo va siempre `hondoDeMas` debajo de la placa (nada lo atraviesa) y, mientras el
 * hueco no se abrió entero, la placa entera está debajo del piso. Pura.
 */
export function poseDelBloque(v: number, mpp: number, forma: { readonly espesor: number; readonly asoma: number } = BLOQUES_DE_VOLUMEN): { readonly caraY: number; readonly abre: number; readonly sube: number; readonly texto: number; readonly hondo: number; readonly espesor: number } {
  const s = subidaDelBloque(v)
  const [espesor, asoma] = [forma.espesor * mpp, forma.asoma * mpp]
  const descenso = (asoma + BLOQUES_DE_VOLUMEN.debajo) * (1 - s.sube)
  return { caraY: FLOOR_Y + asoma - descenso, abre: s.abre, sube: s.sube, texto: s.texto, hondo: espesor - asoma + HUECO_DEL_PIE.hondoDeMas + descenso, espesor }
}

/**
 * [L5] La pose de un bloque en el CAMBIO de lo que muestra (la respuesta), con su tiempo `t` (0 a 1): EXACTAMENTE el cambio del formulario
 * del pie (`pisoDelHundimiento`): con el hueco abierto la placa entera baja `espesores` espesores sobre su plataforma, el piso se cierra
 * encima (a cubierto se cambia el texto), se abre y sube. El texto se va al empezar a bajar y vuelve con la placa en su lugar. Pura.
 */
export function poseDelCambio(t: number, mpp: number, forma: { readonly espesor: number; readonly asoma: number } = BLOQUES_DE_VOLUMEN): ReturnType<typeof poseDelBloque> {
  const { baja, cerrado } = pisoDelHundimiento(t)
  const [espesor, asoma] = [forma.espesor * mpp, forma.asoma * mpp]
  const descenso = HUNDIMIENTO_DEL_PIE.espesores * espesor * baja
  return { caraY: FLOOR_Y + asoma - descenso, abre: 1 - cerrado, sube: 1 - baja, texto: 1 - Math.min(1, baja * 4), hondo: espesor - asoma + HUECO_DEL_PIE.hondoDeMas + descenso, espesor }
}

interface Bloque {
  readonly id: IdDelBloqueDelFaq
  readonly elemento: HTMLElement
  /** Su caja en el documento (px, sin la transformada) y su radio. */
  x: number
  y: number
  ancho: number
  alto: number
  radio: number
  firma: string
  malla: THREE.Mesh | null
  readonly material: THREE.MeshStandardMaterial
  readonly uniformes: UniformesDelPie
  readonly grupo: THREE.Group
  readonly escrito: Float64Array
  css: string
  opacidad: string
  tocable: boolean | null
  /** [L5] Lo que se hundió con el mouse, el foco o al apretar (px; sólo el WhatsApp, como el del pie). */
  hundido: number
  /** Lo de este cuadro (para el banco): el nivel a la vista, el centro en la base del pie (u) y su escala (u por px). */
  nivel: number
  d: number
  a: number
  mpp: number
}

/** Lo que el FAQ de volumen necesita en cada cuadro. */
export interface CuadroDelFaq {
  readonly caida: CaidaDelPie
  readonly viva: THREE.Camera
  readonly cuadro: { readonly ancho: number; readonly alto: number }
  readonly estudio: THREE.Texture | null
  /** El nivel de la luz de la sala (0 a 1), el de las piezas del pie. */
  readonly luz: number
  /** El final del pie está en marcha (las columnas en el piso). */
  readonly enElFinal: boolean
  readonly quieto: boolean
  readonly ahora: number
  readonly dt: number
}

/** Lo que ve el banco de un bloque. */
export interface BloqueEnElBanco {
  readonly id: IdDelBloqueDelFaq
  readonly nivel: number
  readonly abre: number
  readonly sube: number
  readonly visible: boolean
  readonly ancho: number
  readonly alto: number
  readonly d: number
  readonly a: number
  readonly caraY: number
}

const PEDIDA: number[] = []
const CUADRILATERO: number[] = []
const DERECHA = new THREE.Vector3()
const ATRAS = new THREE.Vector3()
const ARRIBA = new THREE.Vector3(0, 1, 0)
const BASE = new THREE.Matrix4()

/** El radio del DOM (px; el de una pastilla, enorme: la geometría lo recorta a la mitad del lado). */
function radioDelDom(el: HTMLElement): number {
  const r = Number.parseFloat(getComputedStyle(el).borderTopLeftRadius)
  return Number.isFinite(r) ? r : 0
}

function medir(b: Bloque): void {
  const antes = b.elemento.style.transform
  b.elemento.style.transform = ''
  const r = b.elemento.getBoundingClientRect()
  b.elemento.style.transform = antes
  b.x = r.left + scrollX
  b.y = r.top + scrollY
  b.ancho = r.width
  b.alto = r.height
  b.radio = radioDelDom(b.elemento)
}

function soltarElDom(b: Bloque): void {
  const s = b.elemento.style
  s.transform = ''
  s.transformOrigin = ''
  s.opacity = ''
  s.pointerEvents = ''
  capaPropia(b.elemento, false)
  if (b.id === 'boton') b.elemento.inert = false
}

function escribirLaOpacidad(b: Bloque, v: string): void {
  if (v === b.opacidad) return
  b.opacidad = v
  b.elemento.style.opacity = v
}

export function crearElFaqDeVolumen(): { readonly grupo: THREE.Group; readonly alCuadro: (e: CuadroDelFaq) => void; readonly soltar: () => void; readonly banco: () => readonly BloqueEnElBanco[] } {
  const grupo = new THREE.Group()
  grupo.name = 'faq de volumen'
  const bloques = new Map<IdDelBloqueDelFaq, Bloque>()
  let version = -1
  let sucio = true
  const tamanos = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
    sucio = true
  })
  const enElBanco = new Map<IdDelBloqueDelFaq, BloqueEnElBanco>()

  const soltarUno = (b: Bloque): void => {
    tamanos?.unobserve(b.elemento)
    soltarElDom(b)
    b.grupo.removeFromParent()
    b.malla?.geometry.dispose()
    b.material.dispose()
    bloques.delete(b.id)
  }

  /** Los bloques anotados: los nuevos se arman (sin geometría hasta medirlos), los que se fueron se sueltan. */
  const sincronizar = (): void => {
    if (version === versionDelFaqDeVolumen()) return
    version = versionDelFaqDeVolumen()
    for (const b of [...bloques.values()]) if (BLOQUES_DEL_FAQ.get(b.id)?.elemento !== b.elemento) soltarUno(b)
    for (const anotado of BLOQUES_DEL_FAQ.values()) {
      if (bloques.has(anotado.id)) continue
      const uniformes = uniformesDelPie()
      // Acostada como las piezas del pie: las caras mate, los costados con el filo oscuro (`acostado.ts`); sin bajarle el relieve.
      uniformes.uAcostadaDelPie.value = 1
      uniformes.uRelieveAcostadoDelPie.value = 1
      const b: Bloque = { id: anotado.id, elemento: anotado.elemento, x: 0, y: 0, ancho: 0, alto: 0, radio: 0, firma: '', malla: null, material: materialDelPie(uniformes), uniformes, grupo: new THREE.Group(), escrito: new Float64Array(17), css: '', opacidad: '', tocable: null, hundido: 0, nivel: 0, d: 0, a: 0, mpp: 0 }
      b.grupo.name = `faq de volumen · ${anotado.id}`
      b.grupo.visible = false
      anotado.elemento.style.transformOrigin = '0 0'
      capaPropia(anotado.elemento, true)
      escribirLaOpacidad(b, '0')
      bloques.set(b.id, b)
      grupo.add(b.grupo)
      tamanos?.observe(anotado.elemento)
    }
    sucio = true
  }

  /** Mide lo que cambió y rearma la placa de lo que cambió de tamaño (pasa a cubierto: el texto cambia con el bloque hundido). */
  const rearmar = (estudio: THREE.Texture | null): void => {
    if (!sucio) return
    sucio = false
    for (const b of bloques.values()) {
      medir(b)
      const firma = [b.ancho, b.alto, b.radio].map((v) => v.toFixed(1)).join(',')
      b.material.envMap = estudio
      if (firma === b.firma) continue
      b.firma = firma
      if (b.malla !== null) {
        b.grupo.remove(b.malla)
        b.malla.geometry.dispose()
        b.malla = null
      }
      if (b.ancho < 1 || b.alto < 1) continue
      b.malla = new THREE.Mesh(armarElBloque({ ancho: b.ancho, alto: b.alto, radio: b.radio }, BLOQUES_DE_VOLUMEN.espesor), b.material)
      b.grupo.add(b.malla)
    }
  }

  const ocultar = (b: Bloque): void => {
    b.grupo.visible = false
    b.nivel = 0
    escribirLaOpacidad(b, '0')
    if (b.tocable !== false) {
      b.tocable = false
      b.elemento.style.pointerEvents = 'none'
      if (b.id === 'boton') b.elemento.inert = true
    }
  }

  const alCuadro = (e: CuadroDelFaq): void => {
    sincronizar()
    rearmar(e.estudio)
    const niveles = nivelesDelFaq(FAQ_EN_VIVO, e.ahora)
    const fase = faseEn(FAQ_EN_VIVO, e.ahora)
    // Los controles del banco (`faq-del-pie.ts`): el botón que vuelve siempre, o que sale antes de que el pie se acueste.
    const control = controlDelBanco()
    if (control.siempre && fase === 'fuera') BOTON_EN_VIVO.usado = false
    const delBoton = pasoDelBoton(BOTON_EN_VIVO, { ahora: e.ahora, dt: e.dt, acostado: control.temprano || SALIDA_EN_VIVO.acostado, presente: SALIDA_EN_VIVO.fase === 'presente', fase, pie: niveles.pie, quieto: e.quieto })
    const delBotonAnotado = BLOQUES_DEL_FAQ.get('boton')
    if (delBotonAnotado !== undefined) delBotonAnotado.nivel = delBoton
    enElBanco.clear()
    const c = e.caida
    const derecha = columnaDelLado(c, 1)
    const izquierda = columnaDelLado(c, -1)
    if (!e.enElFinal || c.m === 0 || derecha < 0) {
      for (const b of bloques.values()) ocultar(b)
      return
    }
    const base = c.base
    const mpp = c.columnas[derecha].mpp
    DERECHA.set(base.derechaX, 0, base.derechaZ)
    ATRAS.set(base.atrasX, 0, base.atrasZ)
    // Acostada: lo de la derecha del DOM a la derecha, su arriba hacia atrás y la cara hacia arriba.
    BASE.makeBasis(DERECHA, ATRAS, ARRIBA)
    const huecos = HUECOS_DEL_PIE.uHuecosDelPie.value
    const formas = HUECOS_DEL_PIE.uFormaDeLosHuecosDelPie.value
    let k = HUECOS_DEL_PIE.uCuantosHuecosDelPie.value
    let q = QUIETUD_DEL_PIE.uCuantasQuietudes.value
    // Los lugares (en la base del pie, desde el logo): la respuesta donde el formulario; las preguntas donde la columna izquierda.
    const H = c.faq.huellas
    const [dRespuesta, aRespuesta] = c.faq.conForm ? [c.faq.form[0], c.faq.form[1]] : [(H[derecha * 4] + H[derecha * 4 + 1]) / 2, (H[derecha * 4 + 2] + H[derecha * 4 + 3]) / 2]
    const dPreguntas = izquierda < 0 ? -dRespuesta : (H[izquierda * 4] + H[izquierda * 4 + 1]) / 2
    const aPreguntas = izquierda < 0 ? aRespuesta : (H[izquierda * 4 + 2] + H[izquierda * 4 + 3]) / 2
    const respuesta = bloques.get('respuesta')
    const medio = (b: Bloque | undefined, lado: 'ancho' | 'alto'): number => (b === undefined ? 0 : (b[lado] * mpp) / 2)
    const A = BLOQUES_DE_VOLUMEN.aire
    for (const b of bloques.values()) {
      const v = b.id === 'boton' ? delBoton : (BLOQUES_DEL_FAQ.get(b.id)?.nivel ?? 0)
      if (b.malla === null || v <= 0) {
        ocultar(b)
        continue
      }
      const [mAncho, mAlto] = [medio(b, 'ancho'), medio(b, 'alto')]
      let [d, a] = [0, 0]
      if (b.id === 'respuesta') [d, a] = [dRespuesta, aRespuesta]
      else if (b.id === 'preguntas') [d, a] = [dPreguntas, aPreguntas]
      else if (b.id === 'whatsapp') [d, a] = [dRespuesta - medio(respuesta, 'ancho') + mAncho, aRespuesta - medio(respuesta, 'alto') - A - mAlto]
      // [L5] El botón, más abajo (lote2/14): `bajaElBoton` alturas suyas más lejos del logo (pegado, pisaba las columnas del pie).
      else [d, a] = [0, -(base.logoFondo / 2 + A + mAlto * (1 + 2 * BLOQUES_DE_VOLUMEN.bajaElBoton))]
      const cambio = BLOQUES_DEL_FAQ.get(b.id)?.cambio ?? null
      // [L8a] El WhatsApp no sube del piso: aparece en su lugar con un fundido (la placa, su hueco y el texto con el nivel).
      const s = b.id === 'whatsapp' ? { ...poseDelBloque(1, mpp), abre: v, texto: v } : cambio !== null ? poseDelCambio(cambio, mpp) : poseDelBloque(v, mpp)
      if (b.id === 'whatsapp') fundirLaPlaca(b.material, v)
      // [L5] El WhatsApp del FAQ, como el del pie: con el mouse encima o el foco se hunde y su cara se aclara; al apretar, más (lote2/19).
      if (b.id === 'whatsapp') hundirComoElPie(b, e.quieto, e.dt)
      const caraY = s.caraY - b.hundido * mpp
      const [cx, cz] = [base.derechaX * d + base.atrasX * a, base.derechaZ * d + base.atrasZ * a]
      b.grupo.quaternion.setFromRotationMatrix(BASE)
      b.grupo.position.set(cx - base.derechaX * mAncho + base.atrasX * mAlto, caraY, cz - base.derechaZ * mAncho + base.atrasZ * mAlto)
      b.grupo.scale.setScalar(mpp)
      b.grupo.visible = true
      b.grupo.updateMatrixWorld(true)
      luzAcostada(b.material, b.uniformes, e.luz)
      // Su hueco (la silueta exacta, abierta desde el centro) con el fondo debajo de la placa, y la quietud del piso alrededor.
      if (k < MAXIMO_DE_HUECOS_DEL_PIE && s.abre > 0) {
        huecos[k].set(cx, cz, mAncho, mAlto)
        // (el radio de su placa: el del DOM o, sin él, el de la placa del formulario, como `armarElBloque`)
        formas[k].set(s.abre, Math.min(b.radio > 0 ? b.radio : 2 * VOLUMEN_DEL_PIE.radio, b.ancho / 2, b.alto / 2) * mpp, s.hondo, 1)
        k += 1
      }
      if (q < MAXIMO_DE_HUECOS_DEL_PIE) {
        QUIETUD_DEL_PIE.uQuietudDelPie.value[q].set(cx, cz, mAncho, mAlto)
        QUIETUD_DEL_PIE.uFuerzaDeLaQuietud.value[q] = s.abre
        QUIETUD_DEL_PIE.uEsTextoLaQuietud.value[q] = 0
        q += 1
      }
      Object.assign(b, { nivel: v, d, a, mpp })
      seguirElBloque(b, e.viva, e.cuadro)
      escribirLaOpacidad(b, s.texto >= 0.999 ? '' : (Math.round(s.texto * 100) / 100).toString())
      const tocable = v >= 0.999
      if (tocable !== b.tocable) {
        b.tocable = tocable
        b.elemento.style.pointerEvents = tocable ? '' : 'none'
        if (b.id === 'boton') b.elemento.inert = !tocable
      }
      enElBanco.set(b.id, { id: b.id, nivel: v, abre: s.abre, sube: s.sube, visible: true, ancho: b.ancho, alto: b.alto, d, a, caraY })
    }
    HUECOS_DEL_PIE.uCuantosHuecosDelPie.value = k
    QUIETUD_DEL_PIE.uCuantasQuietudes.value = q
  }

  return {
    grupo,
    alCuadro,
    soltar: () => {
      for (const b of [...bloques.values()]) soltarUno(b)
      tamanos?.disconnect()
    },
    banco: () => [...bloques.values()].map((b) => enElBanco.get(b.id) ?? { id: b.id, nivel: 0, abre: 0, sube: 0, visible: false, ancho: b.ancho, alto: b.alto, d: 0, a: 0, caraY: Number.NaN }),
  }
}

type VentanaDelBanco = Window & { __botonDelFaqSiempre?: boolean; __botonDelFaqTemprano?: boolean }

/** Sólo con banco: `siempre` (el botón vuelve cada vez que el FAQ se va) y `temprano` (sale sin esperar a que el pie se acueste). */
function controlDelBanco(): { readonly siempre: boolean; readonly temprano: boolean } {
  if (!hayBanco()) return SIN_CONTROL
  const v = window as VentanaDelBanco
  return { siempre: v.__botonDelFaqSiempre === true, temprano: v.__botonDelFaqTemprano === true }
}
const SIN_CONTROL = { siempre: false, temprano: false } as const

/** La columna del pie de ese lado del logo (−1 izquierda, 1 derecha); sin ella, −1. */
function columnaDelLado(c: CaidaDelPie, lado: number): number {
  for (let k = 0; k < c.m; k += 1) if (c.columnas[k].lado === lado) return k
  return -1
}

/** El DOM del bloque sobre la cara de su placa, como la ve la cámara viva (la fase fija de `domQueSigue.ts`: la letra no titila). */
function seguirElBloque(b: Bloque, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }): void {
  caraEnElCuadro(b.grupo, viva, b.ancho, b.alto, 0, cuadro, { x: b.x - scrollX, y: b.y - scrollY }, CUADRILATERO)
  const tipo = nitidaEn(b.ancho, b.alto, CUADRILATERO, PEDIDA) ? 1 : homografia(b.ancho, b.alto, CUADRILATERO, PEDIDA) ? 2 : 0
  if (tipo === 0 || !fijarLaFase(b.escrito, PEDIDA, tipo, b.ancho, b.alto, b.css !== '')) return
  const w = b.escrito
  const css = tipo === 1 ? `matrix(${[w[0], w[1], w[4], w[5]].map((v) => v.toFixed(5)).join(',')},${String(w[12])},${String(w[13])})` : matrix3dCss(w)
  if (css === b.css) return
  b.css = css
  b.elemento.style.transform = css
}
