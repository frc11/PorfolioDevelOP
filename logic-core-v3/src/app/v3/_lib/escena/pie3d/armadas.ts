import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import datos400 from '../../../_fuentes/chivo-400-pie.json'
import datos500 from '../../../_fuentes/chivo-500-pie.json'
import datos600 from '../../../_fuentes/chivo-600-pie.json'
import { homografia, matrix3dCss } from '../../pie3d/homografia'
import { firmaDeLaForma, medirLaPieza, type MedidaDeLaPieza } from '../../pie3d/medida'
import { HUNDIDOS, PIEZAS_DEL_PIE, cuantoSeHunde, type PiezaDelPie } from '../../pie3d/registro'
import type { Pruebas } from '../entorno'
import { KEY_INTENSITY } from '../probeLighting'
import { FLOOR_Y } from '../probeScene'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { caraEnElCuadro, colocarLaPieza, profundidadDeLaPieza } from './colocacion'
import { armarLaPieza, contenidoDe, type FuentesDelPie } from './geometria'
import { alFinalDeLaPagina, aplicarLaLlegada, cuantoLeFalta, llegadaDe, type LlegadaDeLaPieza } from './llegada'
import { MAXIMO_DE_SOMBRAS_DEL_PIE, SOMBRAS_DEL_PIE, SOMBRA_DEL_PIE, formaDeLaSombra } from './sombras'

/**
 * [RETOQUE DEL PIE] P2 · LAS PIEZAS ARMADAS DEL PIE Y SU CUADRO — sin React (el componente, `PieDeVolumen.tsx`, sólo
 * engancha esto a la escena): medir y armar las piezas (`rearmar`), y en cada cuadro ponerlas en su lugar del mundo,
 * hundirlas, llevar lo interactivo del DOM sobre su cara y escribir sus sombras en el piso (`alCuadro`).
 */
const FUENTES: FuentesDelPie = { 400: new Font(datos400 as FontData), 500: new Font(datos500 as FontData), 600: new Font(datos600 as FontData) }

/** Cuánto se hunde (px) y en cuánto tiempo (la constante, s). */
export const HUNDIDA_DEL_PIE = { encima: 5, apretada: 12, tau: 0.05 } as const

/** Lo que se dibuja fuera del cuadro (px): una pieza que entra ya está. */
const MARGEN = 120

/** [RETOQUE DEL PIE] P3 · lo interactivo de una pieza que todavía no se armó (`pie=llegada`). */
const SIN_ARMAR = 'scale(0)'

export interface Armada {
  readonly pieza: PiezaDelPie
  medida: MedidaDeLaPieza
  readonly firma: string
  readonly grupo: THREE.Group
  /** Lo que se hunde: la placa de un enlace; en el formulario, la tecla. */
  readonly cuerpo: THREE.Group
  readonly mallas: readonly THREE.Mesh[]
  readonly espesor: number
  readonly contenido: ReturnType<typeof contenidoDe>
  readonly delHundido: Element | null
  /** [RETOQUE DEL PIE] P3 · de dónde sale con `pie=llegada`. */
  readonly llegada: LlegadaDeLaPieza
  hundido: number
  css: string
  d: number
  mundoPorPx: number
}

export interface EstadoDelPie {
  armadas: Armada[]
  /** Uno para todas las piezas (lo arma el efecto del estudio). */
  material: THREE.MeshStandardMaterial | null
  quieto: boolean
  fuentes: boolean
  /** Se compila una vez: mientras, no se dibuja ni se le escribe al DOM. */
  compilando: boolean
  listo: boolean
  montado: boolean
  /** [RETOQUE DEL PIE] P3 · la prueba de esta carga, y cuándo se llegó al final de la página (la llegada, una vez). */
  prueba: Pruebas['pie']
  inicio: number | null
  readonly cuadrilatero: number[]
  readonly matriz: number[]
}

const PUNTO = new THREE.Vector3()

/** Un cuadro: cada pieza a la vista, en su lugar del mundo; su hundido; lo interactivo sobre ella; su sombra. */
export function alCuadro(s: EstadoDelPie, viva: THREE.Camera, principal: THREE.DirectionalLight | null, cuadro: { readonly ancho: number; readonly alto: number }, dt: number): void {
  if (!s.listo || s.material === null || s.armadas.length === 0) return
  viva.updateMatrixWorld()
  // [RETOQUE DEL PIE] P3 · `pie=llegada`: hasta el final de la página no están; ahí se arman (una vez) y quedan fijas.
  const conLlegada = s.prueba === 'llegada' && !s.quieto
  if (conLlegada && s.inicio === null && alFinalDeLaPagina(scrollY, cuadro.alto, document.documentElement.scrollHeight)) s.inicio = performance.now()
  const desdeElInicioS = s.inicio === null ? 0 : (performance.now() - s.inicio) / 1000
  s.material.envMapIntensity = principal === null ? 1 : Math.min(1, principal.intensity / KEY_INTENSITY)
  // A la profundidad del logo, o adelante si ahí alguna quedaría bajo el piso (`colocacion.ts`): todas en el mismo plano
  // (el pie se mueve entero con el paralaje: un rótulo no se despega de su columna).
  let d = Number.POSITIVE_INFINITY
  for (const a of s.armadas) {
    const arriba = a.medida.caja.y - scrollY
    const c = a.contenido
    a.grupo.visible = arriba + c.abajo > -MARGEN && arriba + c.arriba < cuadro.alto + MARGEN && !(conLlegada && s.inicio === null)
    // Sin armar todavía, lo interactivo tampoco está (se ve el placeholder de un campo, si no).
    if (conLlegada && s.inicio === null && a.pieza.forma !== 'texto' && a.css !== SIN_ARMAR) a.pieza.elemento.style.transform = a.css = SIN_ARMAR
    if (a.grupo.visible) d = Math.min(d, profundidadDeLaPieza(CAMARA_SIN_EL_MOUSE, a.medida.caja.x - scrollX + (c.izquierda + c.derecha) / 2, arriba + c.abajo, cuadro.ancho, cuadro.alto))
  }
  let sombras = 0
  for (const a of s.armadas) {
    if (!a.grupo.visible) continue
    const izquierda = a.medida.caja.x - scrollX
    const arriba = a.medida.caja.y - scrollY
    a.d = d
    a.mundoPorPx = colocarLaPieza(a.grupo, CAMARA_SIN_EL_MOUSE, izquierda, arriba, cuadro.ancho, cuadro.alto, d)
    if (conLlegada) aplicarLaLlegada(a.grupo, a.llegada, cuantoLeFalta(desdeElInicioS, a.llegada))
    const pedido = cuantoSeHunde(a.delHundido === null ? undefined : HUNDIDOS.get(a.delHundido), HUNDIDA_DEL_PIE.encima / HUNDIDA_DEL_PIE.apretada) * HUNDIDA_DEL_PIE.apretada
    a.hundido = s.quieto ? pedido : pedido + (a.hundido - pedido) * Math.exp(-dt / HUNDIDA_DEL_PIE.tau)
    a.cuerpo.position.z = -a.hundido
    a.grupo.updateMatrixWorld(true)
    if (a.pieza.forma !== 'texto') seguirLaPieza(a, viva, cuadro, izquierda, arriba, s)
    if (sombras < MAXIMO_DE_SOMBRAS_DEL_PIE) sombras = sombraDe(a, sombras)
  }
  SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = sombras
}

/** Mide todas las piezas; arma las nuevas y las que cambiaron de forma, y suelta las que se fueron. */
export function rearmar(s: EstadoDelPie, raiz: THREE.Group, material: THREE.Material): void {
  const antes = new Map(s.armadas.map((a) => [a.pieza.id, a]))
  const ahora: Armada[] = []
  for (const [k, p] of [...PIEZAS_DEL_PIE.values()].sort((a, b) => a.orden - b.orden).entries()) {
    const medida = medirLaPieza(p.elemento, p.forma)
    const firma = firmaDeLaForma(medida)
    const vieja = antes.get(p.id)
    if (vieja !== undefined && vieja.pieza === p && vieja.firma === firma) {
      vieja.medida = medida
      antes.delete(p.id)
      ahora.push(vieja)
      continue
    }
    const a = armar(p, medida, firma, material, k)
    if (vieja !== undefined) a.hundido = vieja.hundido
    raiz.add(a.grupo)
    ahora.push(a)
  }
  for (const a of antes.values()) {
    raiz.remove(a.grupo)
    soltar(a)
  }
  s.armadas = ahora
}

function armar(pieza: PiezaDelPie, medida: MedidaDeLaPieza, firma: string, material: THREE.Material, indice: number): Armada {
  const { fija, hundible, espesor } = armarLaPieza(pieza.forma, medida, FUENTES)
  const grupo = new THREE.Group()
  const cuerpo = new THREE.Group()
  grupo.add(cuerpo)
  grupo.name = `pie de volumen · ${pieza.forma}`
  const mallas: THREE.Mesh[] = []
  for (const [geo, padre] of [[fija, grupo], [hundible, cuerpo]] as const) {
    if (geo === null) continue
    const malla = new THREE.Mesh(geo, material)
    padre.add(malla)
    mallas.push(malla)
  }
  grupo.visible = false
  if (pieza.forma !== 'texto') pieza.elemento.style.transformOrigin = '0 0'
  const delHundido = pieza.forma === 'placa' ? pieza.elemento : pieza.forma === 'formulario' ? pieza.elemento.querySelector('[data-forma="principal"]') : null
  return { pieza, medida, firma, grupo, cuerpo, mallas, espesor, contenido: contenidoDe(pieza.forma, medida), delHundido, llegada: llegadaDe(indice), hundido: 0, css: '', d: 0, mundoPorPx: 0 }
}

export function soltar(a: Armada): void {
  a.grupo.removeFromParent()
  for (const malla of a.mallas) malla.geometry.dispose()
  if (a.pieza.forma !== 'texto') {
    a.pieza.elemento.style.transform = ''
    a.pieza.elemento.style.transformOrigin = ''
  }
}

/** Lo interactivo, sobre la cara de su pieza como la ve la cámara viva (la placa, hundida con ella). */
function seguirLaPieza(a: Armada, viva: THREE.Camera, cuadro: { readonly ancho: number; readonly alto: number }, izquierda: number, arriba: number, s: EstadoDelPie): void {
  const { ancho, alto } = a.medida.caja
  caraEnElCuadro(a.pieza.forma === 'placa' ? a.cuerpo : a.grupo, viva, ancho, alto, 0, cuadro, { x: izquierda, y: arriba }, s.cuadrilatero)
  if (!homografia(ancho, alto, s.cuadrilatero, s.matriz)) return
  const css = matrix3dCss(s.matriz)
  if (css === a.css) return
  a.css = css
  a.pieza.elemento.style.transform = css
}

/** La sombra de la pieza en el piso: debajo de su borde de abajo (y de la mitad de su espesor), con su ancho. */
function sombraDe(a: Armada, n: number): number {
  const c = a.contenido
  PUNTO.set((c.izquierda + c.derecha) / 2, -c.abajo, -a.espesor / 2).applyMatrix4(a.grupo.matrixWorld)
  const { alfa, blanda } = formaDeLaSombra(PUNTO.y - FLOOR_Y)
  if (alfa < 0.01) return n
  const mpp = a.mundoPorPx
  SOMBRAS_DEL_PIE.uSombrasDelPie.value[n].set(PUNTO.x, PUNTO.z, ((c.derecha - c.izquierda) / 2) * mpp + SOMBRA_DEL_PIE.sobra, (a.espesor / 2) * mpp + SOMBRA_DEL_PIE.sobra)
  SOMBRAS_DEL_PIE.uFormaDeLasSombrasDelPie.value[n].set(blanda, alfa, 0, 0)
  return n + 1
}
