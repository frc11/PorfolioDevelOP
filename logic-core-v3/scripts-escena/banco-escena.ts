/**
 * SPRINT ESCENA 3 — lo que comparten los bancos de la escena (`comparar.ts`, `escena3.ts`).
 *
 * ⚠ **EL ASIENTO, y por qué cambió.** La prueba de ESCENA 2 comparaba dos capturas a 1,5 s por bloques
 * de 30 px y en Quiénes, Trabajos y Por qué no pasaba nunca. No eran los carruseles: con el canvas
 * escondido el DOM da 0,00 de diferencia en los cinco momentos. Es la escena misma, que no se queda
 * quieta nunca: el polvo y el bokeh derivan y el logo se balancea. Con la cámara cerca las motas son
 * grandes y la deriva sola da 1,5–2,0 por bloque de 30 px. Promediada en bloques de 120 px la deriva
 * cae a 0,17–0,76 con la cámara quieta, mientras que con la cámara viajando da de 9,9 a 72. El
 * umbral de 1,5 separa las dos cosas con margen de sobra. El tiempo máximo no cambió.
 *
 * ⚠ **LA VERIFICACIÓN, y por qué existe.** En ESCENA 2 la hoja de E0 guardó como «pie» una pantalla
 * de Trabajos, y como «Por qué» otra pose: la página no estaba donde el banco creía y nadie lo
 * miraba. No se reprodujo en tres corridas fieles, así que el arreglo es que no pueda volver a pasar
 * callado: antes de aceptar una captura se comprueba que es la misma carga de página, que el scroll
 * es el pedido y que la sección del centro de la pantalla es la del momento. Si no, se reintenta, y
 * si igual falla, el banco se corta con el motivo.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { decodificarPng } from '../scripts-b4/png'
import { esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'

export const DIR3 = 'C:/Users/Valentino/.cache/b4-medicion/escena3'

/** Cuenta las llamadas de dibujo y los triángulos del último cuadro completo. */
export const CONTADOR = `(() => {
  window.__dibujos = { cuadro: 0, ultimo: 0, triangulos: 0, ultimosTriangulos: 0 }
  for (const Ctx of [WebGL2RenderingContext, WebGLRenderingContext]) {
    for (const nombre of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
      const original = Ctx.prototype[nombre]
      if (typeof original !== 'function') continue
      Ctx.prototype[nombre] = function (...args) {
        window.__dibujos.cuadro += 1
        const cantidad = nombre.startsWith('drawArrays') ? args[2] : args[1]
        const instancias = nombre.endsWith('Instanced') ? args[args.length - 1] : 1
        if (args[0] === 4) window.__dibujos.triangulos += (cantidad / 3) * instancias
        return original.apply(this, args)
      }
    }
  }
  const cerrar = () => {
    window.__dibujos.ultimo = window.__dibujos.cuadro
    window.__dibujos.ultimosTriangulos = window.__dibujos.triangulos
    window.__dibujos.cuadro = 0
    window.__dibujos.triangulos = 0
    requestAnimationFrame(cerrar)
  }
  requestAnimationFrame(cerrar)
})()`

/**
 * El espía de saltos: anota, con su pila, toda orden de scroll de más de 300 px (los pasos del banco
 * son de 90). Si una verificación falla, el banco imprime lo que vio: quién movió la página.
 */
export const ESPIA_DE_SALTOS = `(() => {
  window.__saltos = []
  const anotar = (via, destino) => {
    if (typeof destino !== 'number' || Math.abs(destino - scrollY) <= 300) return
    window.__saltos.push({ t: Math.round(performance.now()), via, desde: Math.round(scrollY), hacia: Math.round(destino), pila: (new Error().stack || '').split('\\n').slice(2, 10).map((l) => l.trim()).join(' | ') })
  }
  const destinoDe = (a, b) => (typeof a === 'object' && a !== null ? a.top : b)
  for (const [dueno, nombre] of [[window, 'scrollTo'], [window, 'scroll'], [Element.prototype, 'scrollTo'], [Element.prototype, 'scroll']]) {
    const original = dueno[nombre]
    dueno[nombre] = function (a, b) { anotar(nombre, destinoDe(a, b)); return original.apply(this, arguments) }
  }
  const porAlgo = window.scrollBy
  window.scrollBy = function (a, b) { anotar('scrollBy', scrollY + (destinoDe(a, b) || 0)); return porAlgo.apply(this, arguments) }
  const alVer = Element.prototype.scrollIntoView
  Element.prototype.scrollIntoView = function () { anotar('scrollIntoView', scrollY + this.getBoundingClientRect().top); return alVer.apply(this, arguments) }
  const tope = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop')
  Object.defineProperty(Element.prototype, 'scrollTop', { get() { return tope.get.call(this) }, set(v) { if (this === document.documentElement || this === document.body || this === document.scrollingElement) anotar('scrollTop', v); tope.set.call(this, v) }, configurable: true })
})()`

/** Un punto que sigue al puntero: Chrome no dibuja el cursor en las capturas. Sólo existe en el banco. */
export const PUNTO_DEL_CURSOR = `addEventListener('DOMContentLoaded', () => {
  const p = document.createElement('div')
  p.id = '__cursor-del-banco'
  p.style.cssText = 'position:fixed;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#ff2d55;border:2px solid #fff;box-shadow:0 0 0 1px #000;pointer-events:none;z-index:2147483647;display:none'
  document.body.appendChild(p)
  addEventListener('pointermove', (e) => { p.style.display = 'block'; p.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)' }, { passive: true })
})`

export interface Momento {
  readonly nombre: string
  /** La sección que tiene que estar en el centro de la pantalla. */
  readonly panel: string
  readonly y: (b: Banco) => Promise<number>
}

export const topeMas = (id: string, pantallas: number) => (b: Banco): Promise<number> =>
  medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="${id}"]').getBoundingClientRect(); return Math.round(r.top + scrollY + ${String(pantallas)} * innerHeight) })()`)

export const MOMENTOS: readonly Momento[] = [
  { nombre: 'hero', panel: 'hero', y: async () => 0 },
  { nombre: 'quienes-somos', panel: 'quienes-somos', y: topeMas('quienes-somos', 0.15) },
  { nombre: 'trabajos-de-noche', panel: 'trabajos', y: topeMas('trabajos', 0) },
  { nombre: 'por-que-develop', panel: 'por-que-develop', y: topeMas('por-que-develop', 0.7) },
  { nombre: 'pie', panel: 'cierre', y: (b) => medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight') },
]

/** La luminancia media por bloque de `lado` px. */
export function bloques(png: Buffer, lado: number): number[] {
  const img = decodificarPng(png)
  const salida: number[] = []
  for (let by = 0; by + lado <= img.alto; by += lado) {
    for (let bx = 0; bx + lado <= img.ancho; bx += lado) {
      let suma = 0
      for (let y = by; y < by + lado; y += 2) for (let x = bx; x < bx + lado; x += 2) {
        const i = (y * img.ancho + x) * 4
        suma += 0.2126 * img.datos[i] + 0.7152 * img.datos[i + 1] + 0.0722 * img.datos[i + 2]
      }
      salida.push(suma / ((lado * lado) / 4))
    }
  }
  return salida
}

export async function foto(b: Banco): Promise<Buffer> {
  const shot = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  return Buffer.from(shot.data, 'base64')
}

/** El lado del bloque y el umbral del asiento (ver arriba el porqué de 120). */
export const ASIENTO = { lado: 120, umbral: 1.5, pausaMs: 1500, intentos: 8 } as const

export async function asentada(b: Banco): Promise<{ png: Buffer; ms: number; intentos: number; media: number }> {
  const t0 = Date.now()
  await medir(b.p, 'new Promise((r) => { const y = scrollY; window.scrollTo(0, y - 1); setTimeout(() => { window.scrollTo(0, y); setTimeout(() => r(0), 120) }, 120) })')
  let antes = await foto(b)
  let media = Infinity
  for (let intento = 1; intento <= ASIENTO.intentos; intento += 1) {
    await esperar(ASIENTO.pausaMs)
    const ahora = await foto(b)
    const a = bloques(antes, ASIENTO.lado)
    const c = bloques(ahora, ASIENTO.lado)
    let suma = 0
    for (let i = 0; i < a.length; i += 1) suma += Math.abs(a[i] - c[i])
    media = suma / a.length
    if (media < ASIENTO.umbral) return { png: ahora, ms: Date.now() - t0, intentos: intento, media }
    antes = ahora
  }
  return { png: antes, ms: Date.now() - t0, intentos: ASIENTO.intentos + 1, media }
}

/** El sello de esta carga de página: si cambia, hubo una recarga en el medio. */
export function selloDeCarga(b: Banco): Promise<number> {
  return medir<number>(b.p, 'performance.timeOrigin')
}

export interface Verificacion {
  readonly ok: boolean
  readonly motivo: string
}

/** ¿La página está donde el banco cree? Misma carga, el scroll pedido y la sección esperada al centro. */
export async function verificar(b: Banco, momento: Momento, y: number, sello: number): Promise<Verificacion> {
  const estado = await medir<{ sello: number; y: number; panel: string | null }>(
    b.p,
    `(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); const p = e && e.closest('[data-panel]'); return { sello: performance.timeOrigin, y: Math.round(scrollY), panel: p ? p.getAttribute('data-panel') : null } })()`,
  )
  if (estado.sello !== sello) return { ok: false, motivo: 'la página se recargó en el medio' }
  if (Math.abs(estado.y - y) > 2) return { ok: false, motivo: `el scroll está en ${String(estado.y)} y se pidió ${String(y)}` }
  if (estado.panel !== momento.panel) return { ok: false, motivo: `al centro está «${estado.panel ?? 'nada'}» y se esperaba «${momento.panel}»` }
  return { ok: true, motivo: '' }
}

/** Llega al momento, asienta y verifica; reintenta dos veces y si no, se corta. */
export async function capturarMomento(b: Banco, momento: Momento, sello: number): Promise<{ png: Buffer; y: number; ms: number; intentos: number; media: number; reintentos: number }> {
  for (let reintento = 0; reintento <= 2; reintento += 1) {
    const y = await momento.y(b)
    await scrollHasta(b, y)
    const quieta = await asentada(b)
    const v = await verificar(b, momento, y, sello)
    if (v.ok) return { ...quieta, y, reintentos: reintento }
    console.error(`  [verificación] ${momento.nombre}: ${v.motivo} — reintento ${String(reintento + 1)}`)
    const saltos = await medir<unknown[] | undefined>(b.p, 'window.__saltos')
    if (saltos !== undefined) console.error(`  [saltos] ${JSON.stringify(saltos.slice(-4))}`)
  }
  throw new Error(`${momento.nombre}: la página no quedó donde se pidió después de tres intentos`)
}

export async function fps(b: Banco): Promise<number> {
  return medir<number>(b.p, `new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else r(Math.round((n / ((performance.now() - t0) / 1000)) * 10) / 10) }; requestAnimationFrame(f) })`)
}

/** El puntero, en coordenadas de la ventana. */
export function mover(b: Banco, x: number, y: number): Promise<unknown> {
  return b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(x), y: Math.round(y) }, b.p.sessionId)
}

/** Lleva el puntero de un punto a otro en `ms`, a 60 pasos por segundo. */
export async function viajarElPuntero(b: Banco, de: readonly [number, number], a: readonly [number, number], ms: number): Promise<void> {
  const pasos = Math.max(1, Math.round(ms / 16))
  for (let i = 1; i <= pasos; i += 1) {
    const u = i / pasos
    await mover(b, de[0] + (a[0] - de[0]) * u, de[1] + (a[1] - de[1]) * u)
    await esperar(16)
  }
}

/** Graba la pantalla mientras corre `gesto` y arma un mp4 con la cadencia real de los cuadros. */
export async function grabar(b: Banco, destino: string, gesto: () => Promise<void>, ancho = 1200): Promise<{ cuadros: number; segundos: number }> {
  const cuadros = `${destino}.cuadros`
  rmSync(cuadros, { recursive: true, force: true })
  mkdirSync(cuadros, { recursive: true })
  let n = 0
  let grabando = true
  b.p.conexion.al('Page.screencastFrame', (params) => {
    // Un cuadro que llega después de parar ya no es de este clip.
    if (!grabando) return
    writeFileSync(`${cuadros}/c${String(n).padStart(5, '0')}.jpg`, Buffer.from(params.data as string, 'base64'))
    n += 1
    void b.p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId as number }, b.p.sessionId)
  })
  const t0 = Date.now()
  await b.p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: b.ancho, maxHeight: b.alto, everyNthFrame: 1 }, b.p.sessionId)
  await gesto()
  await b.p.conexion.enviar('Page.stopScreencast', {}, b.p.sessionId)
  grabando = false
  await esperar(300)
  const segundos = (Date.now() - t0) / 1000
  const cadencia = Math.max(1, Math.round((n / segundos) * 10) / 10)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(cadencia), '-i', `${cuadros}/c%05d.jpg`, '-vf', `scale=${String(ancho)}:-2`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${destino}.mp4`])
  rmSync(cuadros, { recursive: true, force: true })
  return { cuadros: n, segundos: Math.round(segundos * 10) / 10 }
}

/** El estado que publica la escena cuando hay banco (`Entorno.tsx`). */
export interface EscenaViva {
  readonly t: number
  readonly modo: string | null
  readonly anillos: readonly string[]
  readonly hover: boolean
  readonly empuje: number
  readonly noche: number
  readonly estela: number
}

export function escenaViva(b: Banco): Promise<EscenaViva | null> {
  return medir<EscenaViva | null>(b.p, 'window.__escenaViva ?? null')
}
