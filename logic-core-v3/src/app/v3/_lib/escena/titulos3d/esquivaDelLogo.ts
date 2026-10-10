import * as THREE from 'three'

import { acotar01 } from '../../acotar'
import type { TituloDeVolumen } from '../../titulos3d/registro'
import { mostradoDelScroll } from './llegada'

/**
 * [PULIDO 11] A2 · EL TÍTULO QUE ESQUIVA EL LOGO — mientras su sección entra (el tope de su panel todavía está debajo del
 * borde de arriba del cuadro), un título con `esquivaElLogo` no llega si su caja (la del DOM sin transformaciones, que va con
 * la página) cruza la del logo proyectado: lo pedido es 0 y lo que se veía se va rápido (`seVaS`). Libre, llega con su
 * mínimo (`llegaS`), así la llegada se ve entera aunque el tramo libre sea corto. En el reposo (el panel en el borde de
 * arriba o más) no esquiva nada: lo que la composición deja ahí es lo que se ve.
 *
 * Por qué: el titular de Quiénes somos sube desde abajo del cuadro hasta arriba del logo, que en la entrada ya está en el
 * medio; cruzaba el logo entre ~330 y ~90 px antes del reposo (medido a 1024, 1280, 1366, 1440 y 1920:
 * `pulido-11/_scripts/a2b-sonda.ts`). El instrumento de J1 medía sólo el reposo y no lo vio.
 */
export interface Caja {
  readonly izquierda: number
  readonly arriba: number
  readonly derecha: number
  readonly abajo: number
}

export const ESQUIVA = { margenPx: 10, muestras: 600, seVaS: 0.3, llegaS: 0.9 } as const

/** ¿Se cruzan las dos cajas, con `margen` px de aire alrededor de la segunda? */
export function seCruzan(a: Caja, b: Caja, margen: number = ESQUIVA.margenPx): boolean {
  return a.izquierda < b.derecha + margen && a.derecha > b.izquierda - margen && a.arriba < b.abajo + margen && a.abajo > b.arriba - margen
}

/** Lo pedido de la llegada: 0 mientras la sección entra y la caja del título cruza la del logo; si no, lo del scroll. */
export function pedidoQueEsquiva(pedido: number, entrando: boolean, caja: Caja | null, logo: Caja | null): number {
  return entrando && caja !== null && logo !== null && seCruzan(caja, logo) ? 0 : pedido
}

/** El lugar del título y el tope de su panel en el documento (sin transformaciones), medidos una vez por tamaño del cuadro. */
interface EnElDocumento {
  readonly generacion: number
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly panel: number
}
const medidas = new WeakMap<HTMLElement, EnElDocumento>()
let generacion = 0

/** Al cambiar el tamaño del cuadro: las medidas se vuelven a tomar en el próximo cuadro que las pida. */
export function remedir(): void {
  generacion += 1
}

/** El tope en el documento por la cadena de `offsetParent` (sin transformaciones); `null` si hay un escenario pegajoso. */
function topeSinTransformar(el: HTMLElement): { x: number; y: number } | null {
  let [x, y] = [0, 0]
  for (let e: HTMLElement | null = el; e !== null; e = e.offsetParent instanceof HTMLElement ? e.offsetParent : null) {
    if (getComputedStyle(e).position === 'sticky') return null
    x += e.offsetLeft
    y += e.offsetTop
  }
  return { x, y }
}

function enElDocumento(titulo: HTMLElement): EnElDocumento | null {
  // Los títulos de un mismo bloque (las cuatro partes del titular de Quiénes somos) esquivan juntos: con la caja del bloque.
  const el = titulo.closest<HTMLElement>('[data-esquiva-del-logo]') ?? titulo
  const guardada = medidas.get(el)
  if (guardada !== undefined && guardada.generacion === generacion) return guardada
  const propio = topeSinTransformar(el)
  const panel = el.closest<HTMLElement>('[data-panel]')
  const delPanel = panel === null ? null : topeSinTransformar(panel)
  if (propio === null || delPanel === null) return null
  const m: EnElDocumento = { generacion, x: propio.x, y: propio.y, ancho: el.offsetWidth, alto: el.offsetHeight, panel: delPanel.y }
  medidas.set(el, m)
  return m
}

/** La caja del título en el cuadro con el scroll de ahora, y si su sección todavía está entrando. */
export function cajaDelTitulo(el: HTMLElement, scrollX: number, scrollY: number): { readonly caja: Caja; readonly entrando: boolean } | null {
  const m = enElDocumento(el)
  if (m === null) return null
  const [x, y] = [m.x - scrollX, m.y - scrollY]
  return { caja: { izquierda: x, arriba: y, derecha: x + m.ancho, abajo: y + m.alto }, entrando: m.panel - scrollY > 1 }
}

/** Unas cuantas posiciones de cada malla del logo (locales), tomadas una vez: su caja proyectada sale de ellas. */
const muestrasDe = new WeakMap<THREE.BufferGeometry, Float32Array>()
function muestras(g: THREE.BufferGeometry): Float32Array | null {
  const ya = muestrasDe.get(g)
  if (ya !== undefined) return ya
  const pos = g.getAttribute('position')
  if (pos === undefined || pos.count === 0) return null
  const paso = Math.max(1, Math.floor(pos.count / ESQUIVA.muestras))
  const n = Math.ceil(pos.count / paso)
  const salida = new Float32Array(n * 3)
  for (let k = 0, i = 0; i < pos.count; i += paso, k += 1) {
    salida[k * 3] = pos.getX(i)
    salida[k * 3 + 1] = pos.getY(i)
    salida[k * 3 + 2] = pos.getZ(i)
  }
  muestrasDe.set(g, salida)
  return salida
}

const V = new THREE.Vector3()

/** La caja del logo en el cuadro (px CSS): sus muestras, con las matrices de ahora, proyectadas con la cámara de ahora. */
export function cajaDelLogo(grupo: THREE.Object3D, camara: THREE.Camera, ancho: number, alto: number): Caja | null {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
  grupo.traverseVisible((o) => {
    if (!(o instanceof THREE.Mesh) || !(o.geometry instanceof THREE.BufferGeometry)) return
    const s = muestras(o.geometry)
    if (s === null) return
    for (let k = 0; k < s.length; k += 3) {
      V.set(s[k], s[k + 1], s[k + 2]).applyMatrix4(o.matrixWorld).project(camara)
      if (V.z > 1) continue
      const [px, py] = [((V.x + 1) / 2) * ancho, ((1 - V.y) / 2) * alto]
      x0 = Math.min(x0, px)
      x1 = Math.max(x1, px)
      y0 = Math.min(y0, py)
      y1 = Math.max(y1, py)
    }
  })
  return x0 <= x1 ? { izquierda: x0, arriba: y0, derecha: x1, abajo: y1 } : null
}

/**
 * Lo mostrado de la llegada de un título que esquiva el logo (fuera de un viaje): lo pedido es 0 mientras su sección entra y su
 * caja cruza la del logo (lo que se veía se va en `seVaS`); libre, lo del scroll con su mínimo (`llegaS` si no trae uno). Al
 * reanudarse el lazo, lo pedido tal cual (sin perseguir desde un estado viejo).
 */
export function llegadaQueEsquiva(t: TituloDeVolumen, mostrado: number, y: number, logo: () => Caja | null, asentar: boolean, reanudado: boolean, dt: number): number {
  const enElCuadro = cajaDelTitulo(t.lugar, window.scrollX, y)
  const pedido = enElCuadro === null || !enElCuadro.entrando ? t.llegada : pedidoQueEsquiva(t.llegada, true, enElCuadro.caja, logo())
  if (reanudado) return acotar01(pedido)
  return mostradoDelScroll(mostrado, pedido, asentar, dt, pedido < t.llegada ? ESQUIVA.seVaS : (t.minimoS ?? ESQUIVA.llegaS), t.asiento)
}
