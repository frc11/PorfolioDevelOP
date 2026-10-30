/**
 * [SERVICIOS V1] LA INTRO CON LA ESCENA, EN EL NAVEGADOR — `/v3/paginas-web` con el Chrome del sistema a la vista, el banco de la escena del
 * home (`__entornoDeLaEscena`: `__ranuraDelBanco`, `__avanceDeLaIntro`) y `/api/` bloqueado. Nunca envía nada. Contra el dev (sin build:
 * O-10), así que el costo es relativo.
 *
 *   ANCHOS=1440x900,1024x768,768x1024,390x844 npx tsx scripts-servicios/escena.ts
 *   REDUCIDO=1 …                     con movimiento reducido: la variante quieta en su estado final y la salida en el acto
 *   COSTO=1 …                        además, el costo por cuadro con y sin la variante (alternadas y recién recargadas, como el banco del home)
 *   PASOS=avance,contraste,cuerpo,salida,escena   sólo esos pasos (por defecto, todos)
 *   CONTROL=tapa | sin-la-salida | cuerpo-transparente | texto-oscuro   el defecto reintroducido por una hoja o un escucha: tiene que FALLAR
 *
 * Lo que tiene que dar, por ancho:
 * · escena: la intro se ve sobre la escena (con el lienzo escondido la captura de la intro cambia: no hay una tapa), de noche;
 * · avance: la variante de web cargada por su id; el avance medido ±1 %; en 0 la composición (0,12, blanca); en 0,25 sube y se tiñe; en
 *   0,5 la entera (1) en el celeste de web; en 0,75 y 0,95, la misma (quieta);
 * · contraste: el h1, la bajada y el logo del encabezado, contra el peor píxel detrás de cada línea (capturas sin el texto, tres cuadros),
 *   en los avances 0, 0,25, 0,5 y 0,75 (donde el texto está entero a la vista): 4,5:1 o más; además, el que cumple el 99 % del fondo;
 * · cuerpo: con la intro fuera del cuadro, en cada punto de una grilla, lo primero opaco tapa al lienzo, y la captura con y sin lienzo es
 *   la misma: el papel tapa la escena;
 * · salida: desde 0,5, el clic en el logo frena la navegación, la luz baja a la composición entre 400 y 600 ms, teñida, sin cuadros
 *   trabados (huecos de más de 50 ms) y siempre bajando, y RECIÉN DESPUÉS navega (`beforeunload`, con el último cuadro pintado ya abajo);
 *   con reducido, en el acto; con la escena tapada por el papel (el enlace del cierre), en el acto;
 * · consola: sin errores ni NaN.
 */
import { appendFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import type { CDPSession, Page } from '@playwright/test'

import { DATOS, abrir, anchosDe, capturar, colorResuelto, dormir, peorContraste, pixeles } from './navegador'

const ANCHOS = anchosDe(process.env.ANCHOS, '1440x900,1024x768,768x1024,390x844')
const REDUCIDO = process.env.REDUCIDO === '1'
const COSTO = process.env.COSTO === '1'
const CONTROL = process.env.CONTROL ?? ''
const PASOS = new Set((process.env.PASOS ?? 'escena,avance,contraste,cuerpo,salida').split(','))
const SALIDA = path.join(DATOS, 'escena')
const RUTA = '/v3/paginas-web'

interface Estado {
  readonly id: string | null
  readonly saliendo: boolean
  readonly duena: boolean
  readonly energia: number
  readonly color: string
}

const estado = (p: Page): Promise<Estado | null> => p.evaluate(() => (window as unknown as { __ranuraDelBanco?: () => Estado }).__ranuraDelBanco?.() ?? null)
const avanceMedido = (p: Page): Promise<number> => p.evaluate(() => (window as unknown as { __avanceDeLaIntro?: () => number }).__avanceDeLaIntro?.() ?? Number.NaN)

async function esperar(p: Page, f: (e: Estado) => boolean, ms = 60000): Promise<Estado | null> {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const e = await estado(p).catch(() => null)
    if (e !== null && f(e)) return e
    await dormir(200)
  }
  return estado(p).catch(() => null)
}

/** El tope de la intro en el documento (o null si la página no tiene la del home). */
const topeDeLaIntro = (p: Page): Promise<number | null> =>
  p.evaluate(() => {
    const b = document.querySelector('[data-intro-de-pagina]')
    return b === null ? null : b.getBoundingClientRect().top + scrollY
  })

async function alAvance(p: Page, f: number): Promise<void> {
  const tope = (await topeDeLaIntro(p)) ?? 0
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), tope + f * 1.5 * (p.viewportSize()?.height ?? 0))
}

/** El celeste de web resuelto (el claro del tema), en hex de 6 como lo da la ranura. */
const celesteDeWeb = async (p: Page): Promise<string> => {
  const css = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-acento-web-claro').trim())
  const [r, g, b] = await colorResuelto(p, css)
  return [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

/** Las hojas de los controles: el defecto, reintroducido sin tocar el código. */
const HOJA_DEL_CONTROL: Readonly<Record<string, string>> = {
  tapa: 'body::after { content: ""; position: fixed; inset: 0; background: rgb(14, 14, 14); z-index: 1; pointer-events: none; } [data-intro-de-pagina], header { position: relative; z-index: 2; }',
  'cuerpo-transparente': 'main section, footer[data-bloque] { background: transparent !important; }',
  'texto-oscuro': '[data-intro-de-pagina] h1 { color: rgb(60, 60, 60) !important; }',
}

// ── Pasos ─────────────────────────────────────────────────────────────────

/** La intro se ve sobre la escena: la captura de su primera pantalla cambia cuando se esconde el lienzo (no hay tapa entre los dos). */
async function laEscenaSeVe(p: Page, nombre: string): Promise<{ readonly distintos: number; readonly total: number }> {
  await alAvance(p, 0)
  await dormir(1500)
  const v = p.viewportSize() ?? { width: 0, height: 0 }
  const clip = { x: 0, y: 0, width: v.width, height: Math.round(v.height * 0.9) }
  const con = await pixeles(await capturar(p, path.join(SALIDA, `${nombre}-escena-con.png`), clip))
  await p.addStyleTag({ content: 'canvas { visibility: hidden !important; }' })
  await dormir(400)
  const sin = await pixeles(await capturar(p, path.join(SALIDA, `${nombre}-escena-sin.png`), clip))
  await p.evaluate(() => document.querySelectorAll('style').forEach((s) => { if (s.textContent?.includes('canvas { visibility: hidden')) s.remove() }))
  let distintos = 0
  for (let i = 0; i < con.datos.length; i += 4) {
    const d = Math.abs((con.datos[i] ?? 0) - (sin.datos[i] ?? 0)) + Math.abs((con.datos[i + 1] ?? 0) - (sin.datos[i + 1] ?? 0)) + Math.abs((con.datos[i + 2] ?? 0) - (sin.datos[i + 2] ?? 0))
    if (d > 24) distintos += 1
  }
  return { distintos, total: con.datos.length / 4 }
}

interface ContrasteDeUnTexto {
  /** El peor píxel de los tres cuadros (el criterio). */
  readonly peor: number
  /** El que cumple el 99 % de los píxeles, en el peor de los tres cuadros: si es alto y el peor bajo, el peor es un punto que pasa. */
  readonly p99: number
  readonly donde: readonly [number, number]
  readonly color: readonly [number, number, number]
}

/** El contraste de los textos de la intro (y del logo del encabezado) contra el peor píxel detrás de cada línea, sin el texto, en 3 cuadros. */
async function contrastes(p: Page, nombre: string): Promise<Record<string, ContrasteDeUnTexto>> {
  const piezas = await p.evaluate(() => {
    const lista: { nombre: string; color: string; cajas: { x: number; y: number; ancho: number; alto: number }[] }[] = []
    const agregar = (n: string, e: Element | null): void => {
      if (e === null) return
      const rango = document.createRange()
      rango.selectNodeContents(e)
      const cajas = [...rango.getClientRects()].filter((r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight).map((r) => ({ x: r.left, y: r.top, ancho: r.width, alto: r.height }))
      lista.push({ nombre: n, color: getComputedStyle(e).color, cajas })
    }
    agregar('h1', document.querySelector('[data-intro-de-pagina] h1'))
    document.querySelectorAll('[data-intro-de-pagina] p').forEach((e, i) => agregar(`bajada-${String(i + 1)}`, e))
    agregar('logo', document.querySelector('header a'))
    return lista
  })
  await p.addStyleTag({ content: '[data-intro-de-pagina] h1, [data-intro-de-pagina] p, header a, header a * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }' })
  await dormir(300)
  const fondos = []
  for (let k = 0; k < 3; k++) {
    fondos.push(await pixeles(await capturar(p, path.join(SALIDA, `${nombre}-sin-texto-${String(k)}.png`))))
    await dormir(350)
  }
  await p.evaluate(() => document.querySelectorAll('style').forEach((s) => { if (s.textContent?.includes('color: transparent !important')) s.remove() }))
  const r: Record<string, ContrasteDeUnTexto> = {}
  for (const pieza of piezas) {
    if (pieza.cajas.length === 0) continue
    const color = await colorResuelto(p, pieza.color)
    const medidas = fondos.map((f) => peorContraste(f, color, pieza.cajas))
    const peor = medidas.reduce((a, b) => (b.peor < a.peor ? b : a))
    r[pieza.nombre] = { peor: Number(peor.peor.toFixed(2)), p99: Number(Math.min(...medidas.map((m) => m.p99)).toFixed(2)), donde: peor.donde, color: peor.colorDelPeor }
  }
  return r
}

/** El papel tapa la escena: con la intro fuera del cuadro, en una grilla de puntos, lo primero opaco va antes que el lienzo; y la captura con y sin lienzo, igual. */
async function cuerpoTapa(p: Page, nombre: string): Promise<{ readonly fugas: readonly string[]; readonly distintos: number; readonly posiciones: number }> {
  await p.evaluate(() => document.querySelectorAll('video').forEach((v) => v.pause()))
  const { desde, hasta } = await p.evaluate(() => {
    const b = document.querySelector('[data-intro-de-pagina]')
    const r = b?.getBoundingClientRect()
    return { desde: r === undefined ? 0 : r.bottom + scrollY, hasta: document.documentElement.offsetHeight - innerHeight }
  })
  const alto = p.viewportSize()?.height ?? 0
  const fugas: string[] = []
  let distintos = 0
  let posiciones = 0
  // Desde media pantalla antes del fin de la intro (la costura) hasta el fondo, de a media pantalla.
  for (let y = Math.max(0, desde - alto / 2); y <= hasta + 1; y += alto / 2) {
    posiciones += 1
    await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await dormir(1800)
    await p.evaluate(() => document.querySelectorAll('video').forEach((v) => v.pause()))
    const enEsta = await p.evaluate(() => {
      const intro = document.querySelector('[data-intro-de-pagina]')?.getBoundingClientRect()
      const piso = Math.max(0, intro?.bottom ?? 0)
      const malas: string[] = []
      const opaco = (e: Element): boolean => {
        if (e instanceof HTMLImageElement || e instanceof HTMLVideoElement) return true
        const fondo = getComputedStyle(e).backgroundColor
        const m = /rgba?\(([^)]+)\)/.exec(fondo)
        const partes = (m?.[1] ?? '').split(/[ ,/]+/).filter((x) => x !== '')
        return partes.length === 3 || (partes.length === 4 && Number(partes[3]) >= 1)
      }
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 8; j++) {
          const x = ((i + 0.5) / 6) * innerWidth
          const y = piso + ((j + 0.5) / 8) * (innerHeight - piso)
          if (y >= innerHeight || innerHeight - piso < 4) continue
          const pila = document.elementsFromPoint(x, y)
          for (const e of pila) {
            if (e instanceof HTMLCanvasElement) {
              malas.push(`${Math.round(x)},${Math.round(y)} (scroll ${Math.round(scrollY)})`)
              break
            }
            if (opaco(e)) break
          }
        }
      }
      // Lo que se anima solo (las historias del precio y el video) no entra en la comparación de capturas: cambia entre una y otra.
      const quietas = [...document.querySelectorAll('[data-pieza="precio-en-historias"], video')].map((e) => {
        const r = e.getBoundingClientRect()
        return { x: r.left, y: r.top, ancho: r.width, alto: r.height }
      })
      return { malas, piso, quietas }
    })
    fugas.push(...enEsta.malas)
    // La captura de la parte del cuerpo, con y sin el lienzo.
    const v = p.viewportSize() ?? { width: 0, height: 0 }
    const altoDelCuerpo = Math.floor(v.height - enEsta.piso)
    if (altoDelCuerpo > 8) {
      const clip = { x: 0, y: Math.ceil(enEsta.piso), width: v.width, height: altoDelCuerpo }
      const con = await pixeles(await capturar(p, path.join(SALIDA, `${nombre}-cuerpo-${String(posiciones)}-con.png`), clip))
      await p.addStyleTag({ content: 'canvas { visibility: hidden !important; }' })
      await dormir(300)
      const sin = await pixeles(await capturar(p, path.join(SALIDA, `${nombre}-cuerpo-${String(posiciones)}-sin.png`), clip))
      await p.evaluate(() => document.querySelectorAll('style').forEach((s) => { if (s.textContent?.includes('canvas { visibility: hidden')) s.remove() }))
      const afuera = (x: number, y: number): boolean => !enEsta.quietas.some((q) => x >= q.x && x < q.x + q.ancho && y + clip.y >= q.y && y + clip.y < q.y + q.alto)
      for (let i = 0; i < Math.min(con.datos.length, sin.datos.length); i += 4) {
        const x = (i / 4) % con.ancho
        const y = Math.floor(i / 4 / con.ancho)
        if (!afuera(x, y)) continue
        const d = Math.abs((con.datos[i] ?? 0) - (sin.datos[i] ?? 0)) + Math.abs((con.datos[i + 1] ?? 0) - (sin.datos[i + 1] ?? 0)) + Math.abs((con.datos[i + 2] ?? 0) - (sin.datos[i + 2] ?? 0))
        if (d > 24) distintos += 1
      }
    }
  }
  return { fugas, distintos, posiciones }
}

// La salida, grabada cuadro a cuadro EN la página (un rAF), y guardada en sessionStorage al irse (la navegación es una recarga completa:
// la grabación sobrevive en la pestaña). Sin comillas invertidas adentro: es el texto de un script de página.
const GRABAR_LA_SALIDA = `(() => {
  const w = window
  const cuadros = []
  let t0 = -1
  let seVaMs = -1
  w.addEventListener('click', () => { if (t0 < 0) t0 = performance.now() }, { capture: true, once: true })
  // La navegación empieza en beforeunload (pagehide llega recién con la respuesta de la página nueva: en el dev, una compilación).
  w.addEventListener('beforeunload', () => { if (t0 >= 0 && seVaMs < 0) seVaMs = performance.now() - t0 })
  w.addEventListener('pagehide', () => {
    try { sessionStorage.setItem('v1:salida', JSON.stringify({ cuadros, seVaMs })) } catch (e) {}
  })
  const paso = (t) => {
    const r = w.__ranuraDelBanco ? w.__ranuraDelBanco() : null
    if (t0 >= 0 && r !== null) cuadros.push({ t: t - t0, e: r.energia, c: r.color, d: r.duena })
    requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
})()`

interface Cuadro {
  readonly t: number
  readonly e: number
  readonly c: string
  readonly d: boolean
}

/** La salida, juzgada (la de `scripts-carga/ranura.ts`, con la navegación medida por `pagehide`). */
function juzgar(cuadros: readonly Cuadro[], seVaMs: number, enElActo: boolean): { readonly llegaMs: number; readonly huecoMs: number; readonly fallas: readonly string[] } {
  const COMPOSICION = 0.12
  const llega = cuadros.find((q) => Math.abs(q.e - COMPOSICION) < 1e-6)
  const llegaMs = llega?.t ?? Number.NaN
  const bajando = cuadros.filter((q) => q.t <= (llega?.t ?? Number.POSITIVE_INFINITY))
  let huecoMs = 0
  let sube = false
  for (let i = 1; i < bajando.length; i++) {
    const a = bajando[i - 1]
    const b = bajando[i]
    if (a === undefined || b === undefined) continue
    huecoMs = Math.max(huecoMs, b.t - a.t)
    if (b.e > a.e + 0.002) sube = true
  }
  const fallas: string[] = []
  if (enElActo ? !(seVaMs >= 0 && seVaMs <= 100) : !(llegaMs >= 400 && llegaMs <= 600)) fallas.push('tiempo')
  // La navegación empieza (beforeunload) en el mismo tic en que la ranura resuelve la salida, antes del cuadro que pinta la composición
  // exacta: lo que se mira es que el último cuadro pintado antes de irse ya esté abajo (a 0,002 de la composición: la cúbica, al 87 %).
  const ultimoAntesDeIrse = cuadros.filter((q) => q.t <= seVaMs).at(-1)
  if (!enElActo && !(seVaMs >= 400 && ultimoAntesDeIrse !== undefined && ultimoAntesDeIrse.e <= COMPOSICION + 0.002)) fallas.push('navega-antes')
  if (!enElActo && huecoMs > 50) fallas.push('trabada')
  if (sube) fallas.push('sube')
  if (!enElActo && bajando.some((q) => q.e > 0.2 && q.c === 'ffffff')) fallas.push('blanca-de-golpe')
  if (!enElActo && bajando.some((q) => !q.d)) fallas.push('suelta-a-mitad')
  return { llegaMs, huecoMs, fallas }
}

/**
 * Un clic en un enlace que se va, con la salida grabada; vuelve con lo grabado (leído en la página nueva) y la ruta a la que llegó. `por`:
 * el mouse de verdad (el enlace a la vista), o por código (`click()`: el mismo evento, sin que Playwright corra la página para mostrarlo).
 */
async function salirPor(p: Page, selector: string, por: 'mouse' | 'codigo'): Promise<{ readonly cuadros: readonly Cuadro[]; readonly seVaMs: number; readonly llego: string }> {
  await p.evaluate(() => sessionStorage.removeItem('v1:salida'))
  await p.evaluate(GRABAR_LA_SALIDA)
  if (CONTROL === 'sin-la-salida') {
    // El defecto: un enlace que navega sin pedir la salida (el clic no llega a la raíz de la página). En `window`: Next hidrata React sobre
    // `document`, y su escucha de la captura, registrado antes, correría antes que uno puesto en `document`.
    await p.evaluate(() => window.addEventListener('click', (e) => { if (e.target instanceof Element && e.target.closest('a[href]') !== null) e.stopPropagation() }, { capture: true }))
  }
  const apretar = por === 'mouse' ? p.locator(selector).first().click() : p.evaluate((s) => document.querySelector<HTMLElement>(s)?.click(), selector)
  await Promise.all([p.waitForEvent('framenavigated', { timeout: 20000 }).catch(() => null), apretar])
  await p.waitForLoadState('domcontentloaded', { timeout: 120000 }).catch(() => null)
  const grabado = await p.evaluate(() => sessionStorage.getItem('v1:salida')).catch(() => null)
  const leido = grabado === null ? null : (JSON.parse(grabado) as { cuadros: Cuadro[]; seVaMs: number })
  return { cuadros: leido?.cuadros ?? [], seVaMs: leido?.seVaMs ?? -1, llego: new URL(p.url()).pathname + new URL(p.url()).hash }
}

async function costoPorCuadro(p: Page, cdp: CDPSession): Promise<number> {
  const metricas = async (): Promise<{ s: number }> => {
    const { metrics } = (await cdp.send('Performance.getMetrics')) as { metrics: { name: string; value: number }[] }
    return { s: metrics.find((m) => m.name === 'ScriptDuration')?.value ?? 0 }
  }
  const cuadros = (ms: number): Promise<number> =>
    p.evaluate(`new Promise((r) => { let n = 0; const fin = performance.now() + ${String(ms)}; const paso = (t) => { n++; if (t < fin) requestAnimationFrame(paso); else r(n) }; requestAnimationFrame(paso) })`) as Promise<number>
  const a = await metricas()
  const n = await cuadros(8000)
  const b = await metricas()
  return ((b.s - a.s) * 1000) / Math.max(1, n)
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  let malas = 0
  for (const [ancho, alto] of ANCHOS) {
    const nombre = `escena-${String(ancho)}${REDUCIDO ? '-reducido' : ''}${CONTROL === '' ? '' : `-control-${CONTROL}`}`
    // La bandera del costo viaja en sessionStorage (la lee el script de inicio en cada carga: puesta en window, la recarga la borraba).
    const { ctx, p, cdp, log } = await abrir(nombre, ancho, alto, RUTA, { reducido: REDUCIDO, bancoDeLaEscena: true, alIniciar: "try { if (sessionStorage.getItem('v1:sin') === '1') window.__ranuraSinVariante = true } catch (e) {}" })
    const fallas: string[] = []
    const datos: Record<string, unknown> = {}
    try {
      const hoja = HOJA_DEL_CONTROL[CONTROL]
      if (hoja !== undefined) await p.addStyleTag({ content: hoja })
      const cargada = await esperar(p, (e) => e.id === 'web', 45000)
      await dormir(2500)
      datos.variante = cargada?.id ?? null
      if (cargada?.id !== 'web') fallas.push('sin-la-variante-de-web')
      if ((await topeDeLaIntro(p)) === null) fallas.push('sin-la-intro-del-home')
      const celeste = await celesteDeWeb(p)
      datos.celeste = celeste
      if (PASOS.has('escena')) {
        const e = await laEscenaSeVe(p, nombre)
        datos.escena = e
        if (e.distintos < e.total * 0.05) fallas.push('la-escena-no-se-ve')
      }
      if (PASOS.has('avance')) {
        const puntos: Record<string, { readonly avance: number; readonly e: Estado | null }> = {}
        for (const f of [0, 0.25, 0.5, 0.75, 0.95, 1]) {
          await alAvance(p, f)
          await dormir(1300)
          puntos[String(f)] = { avance: await avanceMedido(p), e: await estado(p) }
          if (f === 0 || f === 0.5 || f === 1) await capturar(p, path.join(SALIDA, `${nombre}-avance-${String(f)}.png`))
        }
        datos.avance = Object.fromEntries(Object.entries(puntos).map(([k, v]) => [k, { avance: Number(v.avance.toFixed(4)), energia: v.e === null ? null : Number(v.e.energia.toFixed(3)), color: v.e?.color ?? null, duena: v.e?.duena ?? null }]))
        for (const [k, v] of Object.entries(puntos)) if (Math.abs(v.avance - Number(k)) > 0.01) fallas.push(`avance-${k}`)
        const e0 = puntos['0']?.e ?? null
        const e25 = puntos['0.25']?.e ?? null
        const enLaMitad = [puntos['0.5']?.e ?? null, puntos['0.75']?.e ?? null, puntos['0.95']?.e ?? null]
        if (REDUCIDO) {
          if ([e0, e25, ...enLaMitad].some((e) => e === null || Math.abs(e.energia - 1) > 0.005 || e.color !== celeste || !e.duena)) fallas.push('reducido-no-quieto')
        } else {
          if (e0 === null || Math.abs(e0.energia - 0.12) > 0.005 || e0.color !== 'ffffff' || !e0.duena) fallas.push('composicion')
          if (e25 === null || !(e25.energia > 0.3 && e25.energia < 0.9) || e25.color === 'ffffff' || e25.color === celeste) fallas.push('medio-camino')
          if (enLaMitad.some((e) => e === null || Math.abs(e.energia - 1) > 0.005 || e.color !== celeste || !e.duena)) fallas.push('entera-y-quieta')
        }
      }
      if (PASOS.has('contraste')) {
        // Donde el texto de la intro está entero a la vista: arriba (0), subiendo (0,25), encendida (0,5) y quieta (0,75). Desde ~0,8 el
        // bloque fijo de la intro se termina y el texto sube con la página (a 0,95 ya no está).
        const k: Record<string, Record<string, ContrasteDeUnTexto>> = {}
        for (const f of [0, 0.25, 0.5, 0.75]) {
          await alAvance(p, f)
          await dormir(1300)
          k[String(f)] = await contrastes(p, `${nombre}-${String(f)}`)
        }
        datos.contraste = k
        const todos = Object.values(k).flatMap((x) => Object.values(x))
        datos.contrastePeor = Math.min(...todos.map((c) => c.peor))
        datos.contrasteP99 = Math.min(...todos.map((c) => c.p99))
        if (!(Math.min(...todos.map((c) => c.peor)) >= 4.5)) fallas.push('contraste')
        if (Object.values(k).some((x) => x.h1 === undefined || x['bajada-1'] === undefined || x['bajada-2'] === undefined)) fallas.push('textos-de-la-intro')
      }
      if (PASOS.has('cuerpo')) {
        const c = await cuerpoTapa(p, nombre)
        datos.cuerpo = { posiciones: c.posiciones, fugas: c.fugas.length, primeras: c.fugas.slice(0, 4), pixelesDistintos: c.distintos }
        if (c.fugas.length > 0 || c.distintos > 0) fallas.push('el-cuerpo-no-tapa')
      }
      if (COSTO) {
        const medir = async (sin: boolean): Promise<number> => {
          await p.evaluate((s) => sessionStorage.setItem('v1:sin', s ? '1' : '0'), sin)
          await p.reload({ waitUntil: 'load' })
          await esperar(p, (e) => e.duena && (sin ? e.id === null : e.id === 'web'))
          await dormir(2500)
          await alAvance(p, 0.25)
          await dormir(1500)
          return costoPorCuadro(p, cdp)
        }
        const con1 = await medir(false)
        const sin1 = await medir(true)
        const con2 = await medir(false)
        const sin2 = await medir(true)
        const costo = { con: (con1 + con2) / 2, sin: (sin1 + sin2) / 2, aa: Math.abs(con1 - con2) }
        datos.costo = { con: Number(costo.con.toFixed(3)), sin: Number(costo.sin.toFixed(3)), delta: Number((costo.con - costo.sin).toFixed(3)), aa: Number(costo.aa.toFixed(3)) }
        if (costo.con - costo.sin > 0.5) fallas.push('presupuesto')
        await p.evaluate(() => sessionStorage.setItem('v1:sin', '0'))
        await p.reload({ waitUntil: 'load' })
        await esperar(p, (e) => e.id === 'web')
        await dormir(2500)
      }
      if (PASOS.has('salida')) {
        // La salida desde la intro encendida (0,5), por el logo del encabezado. Ahí el encabezado ya se fue con el scroll: el banco lo
        // aprieta por código (el mismo clic que atiende la raíz), así la luz baja desde la entera.
        await alAvance(p, 0.5)
        await dormir(1500)
        const s = await salirPor(p, 'header a[href="/v3"]', 'codigo')
        const j = juzgar(s.cuadros, s.seVaMs, REDUCIDO)
        datos.salida = { llegaMs: Number(j.llegaMs.toFixed(0)), seVaMs: Number(s.seVaMs.toFixed(0)), huecoMs: Number(j.huecoMs.toFixed(0)), cuadros: s.cuadros.length, llego: s.llego }
        if (j.fallas.length > 0) fallas.push(`salida(${j.fallas.join('+')})`)
        if (s.llego !== '/v3') fallas.push('no-llego-al-home')
        if (CONTROL === '') {
          const volver = async (): Promise<void> => {
            await p.goto(`${new URL(p.url()).origin}${RUTA}`, { waitUntil: 'load', timeout: 240000 })
            await esperar(p, (e) => e.id === 'web', 45000)
            await dormir(2500)
          }
          // El clic de verdad, con el mouse, en el logo a la vista (arriba de todo): pasa por la raíz y navega después de la salida.
          await volver()
          await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
          await dormir(1200)
          const m = await salirPor(p, 'header a[href="/v3"]', 'mouse')
          datos.salidaConElMouse = { seVaMs: Number(m.seVaMs.toFixed(0)), llego: m.llego }
          if (!(REDUCIDO ? m.seVaMs >= 0 && m.seVaMs <= 100 : m.seVaMs >= 400 && m.seVaMs <= 600) || m.llego !== '/v3') fallas.push('salida-con-el-mouse')
          // Con la escena tapada por el papel: el enlace del cierre al home se va en el acto (no hay luz que bajar).
          await volver()
          await p.evaluate(() => document.querySelector('footer[data-bloque="cierre"]')?.scrollIntoView({ block: 'center', behavior: 'instant' }))
          await dormir(1500)
          const t = await salirPor(p, 'footer[data-bloque="cierre"] a[href="/v3"]', 'mouse')
          datos.salidaDesdeElPapel = { seVaMs: Number(t.seVaMs.toFixed(0)), llego: t.llego }
          if (!(t.seVaMs >= 0 && t.seVaMs <= 100) || t.llego !== '/v3') fallas.push('salida-desde-el-papel')
        }
      }
      const nan = [...log.consola, ...log.errores].filter((m) => /NaN/.test(m))
      const deLaConsola = log.consola.filter((m) => m.startsWith('error:'))
      datos.consola = { errores: log.errores.length + deLaConsola.length, avisos: log.consola.length - deLaConsola.length, nan: nan.length, api: log.api.length }
      if (log.errores.length + deLaConsola.length > 0) fallas.push('errores')
      if (nan.length > 0) fallas.push('nan')
      if (log.api.length > 0) fallas.push('api')
    } catch (e) {
      fallas.push(`excepcion: ${String(e).slice(0, 200)}`)
    } finally {
      await ctx.close()
    }
    if (fallas.length > 0) malas += 1
    appendFileSync(path.join(SALIDA, 'escena.jsonl'), `${JSON.stringify({ ancho, alto, reducido: REDUCIDO, control: CONTROL, datos, fallas, consola: log.consola.slice(0, 20), errores: log.errores })}\n`)
    console.log(`${fallas.length === 0 ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)}${REDUCIDO ? ' reducido' : ''}${CONTROL === '' ? '' : ` (control ${CONTROL})`} · ${JSON.stringify(datos)}${fallas.length === 0 ? '' : ` · ${fallas.join(',')}`}`)
    for (const m of [...log.errores, ...log.consola].slice(0, 8)) console.log(`   ${m}`)
  }
  console.log(`escena: ${String(ANCHOS.length - malas)} de ${String(ANCHOS.length)} anchos bien`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
