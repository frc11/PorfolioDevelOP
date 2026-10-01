/**
 * SPRINT INTERFAZ 2 — lo que comparten los bancos de este sprint: la carpeta de entregas (una por ticket) y cómo se abre
 * /v3 con un pedido de la escena (`producto` o `producto,<prueba>=…`: las pruebas del sprint van ahí, con los ganchos del
 * banco puestos). Lo demás (la rueda, el mouse, las teclas, grabar y armar un clip) es lo de INTERFAZ 1.
 *
 * Contra el servidor de desarrollo, con un Chrome propio por CDP, con el vsync puesto (lo que se ve) y la NVIDIA
 * (`BANCO_GPU=alta`; la placa se lee en la página y va en cada resultado).
 */
import { mkdirSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA, medir } from '../scripts-b4/navegador'
import { ERRORES } from '../scripts-escena/formacion'
import { esperar, rueda, type Banco } from '../scripts-interfaz1/banco'

export { armarClip, correr, enCamaraLenta, esperar, grabar, ladoALado, raton, rueda, tecla, type Banco } from '../scripts-interfaz1/banco'

/** Las entregas de este sprint. */
export const DIRI2 = 'C:/Users/Valentino/.cache/b4-medicion/interfaz2'

/** La carpeta de un ticket (o una subcarpeta), creada si no está. */
export function carpeta(nombre: string): string {
  const dir = `${DIRI2}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

export interface OpcionesDelBanco {
  /** El pedido de la escena: `producto` (el de siempre) o con las pruebas, `producto,responde=si`. */
  readonly pedido?: string
  readonly reducido?: boolean
}

/** Abre /v3 con el pedido puesto antes de cargar, la pestaña al frente y el ancho verificado. */
export async function abrir(ancho: number, alto: number, o: OpcionesDelBanco = {}): Promise<Banco> {
  const chrome = await lanzarChrome({ perfil: `C:/Users/Valentino/.cache/b4-medicion/interfaz2-${String(ancho)}`, ancho: ancho + 40, alto: alto + 140 })
  const p = await abrirPagina(chrome)
  const s = p.sessionId
  await p.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: o.reducido === true ? 'reduce' : 'no-preference' }] }, s)
  await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 1024, screenWidth: ancho, screenHeight: alto }, s)
  await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: `window.__entornoDeLaEscena = ${JSON.stringify(o.pedido ?? 'producto')}; ${ERRORES}` }, s)
  await irA(p, 'http://localhost:3000/v3')
  await esperar(5000)
  let estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  for (let intento = 0; intento < 4 && estado.visible !== 'visible'; intento += 1) {
    await p.conexion.enviar('Page.bringToFront', {}, s)
    await esperar(1500)
    estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  }
  if (estado.visible !== 'visible' || estado.ancho !== ancho) throw new Error(`la pestaña no está al frente o el ancho no es el pedido: ${JSON.stringify(estado)}`)
  const placa = await medir<string>(p, `(() => { const c = document.createElement('canvas').getContext('webgl'); const i = c && c.getExtension('WEBGL_debug_renderer_info'); return i ? String(c.getParameter(i.UNMASKED_RENDERER_WEBGL)) : 'desconocida' })()`)
  return {
    p,
    ancho,
    alto,
    placa,
    cerrar: async () => {
      await cerrarPagina(p)
      await cerrarChrome(chrome)
    },
  }
}

/** Un viaje del menú (la barra de escritorio) a una sección, y la espera a que llegue y el velo vuelva. */
export async function viajar(b: Banco, id: string): Promise<void> {
  await medir(b.p, `document.querySelector('[data-pieza="navegacion"] a[href="#${id}"]').click()`)
  await esperar(3800)
}

/** El centro de la primera pieza que coincide con `selector` (en el cuadro), o null. */
export function centroDe(b: Banco, selector: string, indice = 0): Promise<[number, number] | null> {
  return medir<[number, number] | null>(
    b.p,
    `(() => { const e = document.querySelectorAll(${JSON.stringify(selector)})[${String(indice)}]; if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })()`,
  )
}

/** Lo que publica la escena para el banco (`__escenaViva`). */
export interface EscenaViva {
  readonly t: number
  readonly modo: string | null
  readonly anillos: readonly string[]
  readonly nacen: readonly number[]
  readonly noche: number
}

export const escenaViva = (b: Banco): Promise<EscenaViva> => medir<EscenaViva>(b.p, 'window.__escenaViva')


/**
 * Baja de a dos muescas hasta que los seis valores de Por qué develOP estén a la vista, se puedan tocar y se VEAN (la
 * opacidad de toda la cadena de ancestros, no sólo la del valor: el escenario los trae con la de su envoltorio).
 */
export async function hastaLosValores(b: Banco): Promise<boolean> {
  for (let k = 0; k < 40; k += 1) {
    const listos = await medir<number>(
      b.p,
      `[...document.querySelectorAll('[data-pieza="valor"]')].filter((v) => { const r = v.getBoundingClientRect(); if (r.width < 2 || r.top < 0 || r.bottom > innerHeight) return false; const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); let o = 1; for (let a = v; a; a = a.parentElement) o *= Number(getComputedStyle(a).opacity); return !!e && v.contains(e) && o > 0.95 }).length`,
    )
    if (listos >= 6) return true
    await rueda(b, 2, 90)
    await esperar(500)
  }
  return false
}

/**
 * Hasta el estante de las demos (escritorio), con la rueda como una persona (un `scrollTo` hasta el final no dispara la
 * noche de Trabajos: cae con la gota al cruzar la frontera): un salto hasta el tope de Trabajos y después de a dos
 * muescas hasta que el tercer libro esté entero en la mitad de abajo del cuadro y quieto. El túnel va fijado: la caja
 * de un libro medida antes de llegar no dice dónde va a quedar.
 */
export async function hastaElEstante(b: Banco): Promise<boolean> {
  const tope = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="trabajos"]').getBoundingClientRect(); return Math.round(r.top + scrollY) })()`)
  await medir(b.p, `window.scrollTo(0, ${String(Math.max(0, tope - 900))})`)
  await esperar(1200)
  const LIBRO = `[...document.querySelectorAll('[data-panel="trabajos"] a[data-pieza="libro"]')][2]`
  for (let k = 0; k < 120; k += 1) {
    await rueda(b, 2, 90)
    await esperar(350)
    const listo = await medir<boolean>(b.p, `(() => { const e = ${LIBRO}; if (!e) return false; const r = e.getBoundingClientRect(); return r.height > 40 && r.top > innerHeight * 0.35 && r.bottom < innerHeight * 0.95 })()`)
    if (listo) {
      await esperar(2500)
      return true
    }
  }
  return false
}
