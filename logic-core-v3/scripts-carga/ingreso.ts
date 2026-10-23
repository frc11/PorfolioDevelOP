/**
 * [B7] EL LOGIN QUE SE DESPLIEGA COMO UNA DEMO, EN EL SITIO — el Chrome del sistema a la vista contra el dev (`BASE`), `/api/`
 * bloqueado, y NINGÚN login de verdad: el banco nunca envía un formulario sin la simulación, y además aborta todo POST que lleve
 * los campos del login (`email`, `password`, `magic-email`). Mide, con un rAF en la página (la fase y el avance que la hoja
 * publica en `data-fase` y `data-avance`):
 *
 *   1440 (desde «Login» de la barra, con la página scrolleada):
 *     · la apertura: del primer cuadro `abriendo` a `abierta`, ≈ 560 ms (el Genie de las demos; tolerancia 2 cuadros), el avance
 *       lineal en el tiempo (desvío ≤ 0,04) y la URL con `?ingresar`; desplegada, la hoja cubre la pantalla entera;
 *     · la escena duerme: las llamadas de dibujo de WebGL en 1 s con el login abierto (0) contra 1 s cerrado (> 0, el control);
 *     · «Volver al home»: la animación inversa (≈ 560 ms), la URL sin `?ingresar`, |Δy| = 0 y el foco de vuelta en «Login»;
 *     · la flecha atrás: lo mismo (abre otra vez y `goBack`); la de adelante lo vuelve a abrir; Esc lo cierra;
 *   390 (sin «Login» a la vista: la entrada directa con `?ingresar`): el fundido (200 ms), la hoja a pantalla completa, «Volver»;
 *   SIMULAR=1 (sólo contra el DEV: la simulación no existe en el build): `?envio=error` (la validación del cliente con el
 *     formulario vacío, sin ningún POST; la carga mientras procesa y el error del servidor con lo escrito intacto) y
 *     `?envio=lento` (el telón: la ruta sale de /v3 y el telón se funde y se va);
 *   la consola: 0 errores.
 *
 *   BASE=http://localhost:3000 npx tsx scripts-carga/ingreso.ts
 *   BASE=http://localhost:3000 SIMULAR=1 npx tsx scripts-carga/ingreso.ts
 *   CONTROL=scroll …   el control de |Δy|: mueve el scroll 120 px con el login abierto (el banco TIENE que dar FALLA)
 *
 * [C2 · 80] Además (1440): la expansión y la compresión SIN meseta (el área del clip-path por cuadro sube/baja siempre y sin huecos
 * de más de 60 ms; CONTROL=pausa mete una pausa de 150 ms a mitad: tiene que dar FALLA), la flecha para salir en el lugar de «Login»,
 * el encabezado centrado, «Ingresar» a la derecha del olvido, «Volver al home» a la izquierda de «Probá el panel», Magic Link
 * durante la carga (los chips esperan y la pantalla no queda vacía; CONTROL=pantalla-vacia: tiene que dar FALLA) y la vuelta de la
 * caché (`pageshow` persistido: el login abierto, Google sin «cargando» y sin telón; CONTROL=sin-pageshow: tiene que dar FALLA). Las
 * acciones del login (POST con la cabecera next-action) se sujetan 6 s y se abortan: nunca llegan a la autenticación.
 *
 * Fotos en `~/.cache/b4-medicion/ingreso/`.
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const SIMULAR = process.env.SIMULAR === '1'
const CONTROL = process.env.CONTROL ?? ''
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/ingreso')
const MS_DEL_GENIE = 560
const MS_DEL_FUNDIDO = 200
const CUADRO = 1000 / 60
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const fallas: string[] = []
const ver = (bien: boolean, que: string, detalle = ''): void => {
  console.log(`${bien ? 'ok   ' : 'FALLA'} ${que}${detalle === '' ? '' : ` — ${detalle}`}`)
  if (!bien) fallas.push(que)
}

/** El registro por cuadro y la cuenta de dibujos de WebGL, instalados antes que la página. */
const INICIO = `(() => {
  window.__name = window.__name || ((f) => f)
  window.__entornoDeLaEscena = 'producto'
  try { sessionStorage.setItem('home:intro', '1') } catch (e) {}
  window.__dibujos = 0
  for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!C) continue
    for (const k of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced', 'drawRangeElements']) {
      const f = C.prototype[k]
      if (typeof f === 'function') C.prototype[k] = function (...a) { window.__dibujos += 1; return f.apply(this, a) }
    }
  }
  // [C2 · 80] Las animaciones nativas sobre el fondo del login: cuándo se crean (con una marca para el trace) y cuándo arrancan de
  // verdad en el compositor (\`startTime\`, al resolverse \`ready\`).
  const animar = Element.prototype.animate
  Element.prototype.animate = function (...a) {
    const anim = animar.apply(this, a)
    if (this.getAttribute && this.getAttribute('data-parte') === 'fondo') {
      const r = { creada: performance.now(), inicio: NaN, duracion: Number(a[1] && a[1].duration) }
      ;(window.__fundidos = window.__fundidos || []).push(r)
      performance.mark('fundido-creado-' + String(window.__fundidos.length))
      anim.ready.then(() => { r.inicio = Number(anim.startTime) }).catch(() => {})
    }
    return anim
  }
  const log = (window.__cuadrosDelIngreso = [])
  const cuadro = () => {
    const raiz = document.querySelector('[data-pieza="ingreso"]')
    const fondo = raiz && raiz.querySelector('[data-parte="fondo"]')
    // [C2 · 80] El área que cubre la forma (la fracción de la pantalla): la de los vértices del clip-path (shoelace). Sin recorte, 1 si está abierta.
    const area = (() => {
      if (!fondo) return NaN
      const cp = fondo.style.clipPath
      if (!cp) return fondo.style.opacity === '' || Number(fondo.style.opacity) >= 1 ? 1 : NaN
      const n = (cp.match(/-?\\d+(?:\\.\\d+)?/g) || []).map(Number)
      let a = 0
      for (let i = 0; i + 3 < n.length; i += 2) a += n[i] * n[i + 3] - n[i + 2] * n[i + 1]
      const k = n.length - 2
      a += n[k] * n[1] - n[0] * n[k + 1]
      return Math.abs(a / 2) / (innerWidth * innerHeight)
    })()
    // CONTROL=pausa: una pausa de 150 ms con el avance a mitad de camino (el banco TIENE que dar FALLA en la meseta).
    if (${JSON.stringify(process.env.CONTROL ?? '')} === 'pausa' && !window.__pausada && fondo && Number(fondo.getAttribute('data-avance')) > 0 && Number(fondo.getAttribute('data-avance')) < 0.5) {
      window.__pausada = true
      const t0 = performance.now()
      while (performance.now() - t0 < 150) { /* detenida */ }
    }
    log.push({ t: performance.now(), area, fase: raiz ? raiz.getAttribute('data-fase') || 'montada' : 'sin', avance: fondo ? Number(fondo.getAttribute('data-avance') || 'NaN') : NaN, y: window.scrollY, url: location.pathname + location.search, telon: (() => { const t = document.querySelector('[data-pieza="telon-del-ingreso"]'); return t ? Number(getComputedStyle(t).opacity) : -1 })() })
    if (log.length > 6000) log.splice(0, 3000)
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

interface Cuadro {
  readonly t: number
  readonly area: number
  readonly fase: string
  readonly avance: number
  readonly y: number
  readonly url: string
  readonly telon: number
}

async function abrir(ancho: number, alto: number, movil: boolean): Promise<{ readonly p: Page; readonly errores: string[]; readonly posts: string[]; readonly cerrar: () => Promise<void> }> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/ingreso-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: movil,
    hasTouch: movil,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  await ctx.addInitScript(INICIO)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const errores: string[] = []
  const posts: string[] = []
  p.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text().slice(0, 200))
  })
  p.on('pageerror', (e) => errores.push(e.message.slice(0, 200)))
  await p.route('**/api/**', (r) => r.abort())
  // Ningún login de verdad: un POST con los campos del login se aborta (y se cuenta: tiene que dar cero).
  await p.route('**/*', async (r) => {
    const req = r.request()
    if (req.method() === 'POST') {
      const cuerpo = req.postData() ?? ''
      if (/name="(email|password|magic-email)"|"(email|password|magic-email)"/.test(cuerpo)) {
        posts.push(req.url())
        await r.abort()
        return
      }
    }
    await r.continue()
  })
  return { p, errores, posts, cerrar: () => ctx.close() }
}

async function cargar(p: Page, ruta: string): Promise<void> {
  await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
  await dormir(6000)
}

async function rodar(p: Page, y: number): Promise<void> {
  await p.mouse.move(700, 450)
  for (let i = 0; i < 80 && (await p.evaluate(() => window.scrollY)) < y; i += 1) {
    await p.mouse.wheel(0, 120)
    await dormir(40)
  }
  await dormir(1800)
}

async function tocar(p: Page, selector: string): Promise<void> {
  const caja = await p.locator(selector).first().boundingBox()
  if (caja === null) throw new Error(`no está: ${selector}`)
  await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2)
  await dormir(300)
  await p.mouse.down()
  await p.mouse.up()
}

const marcar = (p: Page): Promise<number> => p.evaluate(() => (window as unknown as { __cuadrosDelIngreso: Cuadro[] }).__cuadrosDelIngreso.length)
const desde = (p: Page, i: number): Promise<Cuadro[]> => p.evaluate((n) => (window as unknown as { __cuadrosDelIngreso: Cuadro[] }).__cuadrosDelIngreso.slice(n), i)
const dibujos = (p: Page): Promise<number> => p.evaluate(() => (window as unknown as { __dibujos: number }).__dibujos)
const scrollY = (p: Page): Promise<number> => p.evaluate(() => window.scrollY)
const enfocado = (p: Page): Promise<string> => p.evaluate(() => document.activeElement?.getAttribute('data-pieza') ?? document.activeElement?.tagName ?? 'null')

/** Un tramo del despliegue: cuánto dura (del primer cuadro en `fase` al primero fuera de ella) y cuánto se aparta el avance de la recta. */
function tramo(cuadros: readonly Cuadro[], fase: 'abriendo' | 'cerrando'): { readonly ms: number; readonly desvio: number; readonly visto: boolean } {
  const i0 = cuadros.findIndex((c) => c.fase === fase)
  if (i0 < 0) return { ms: Number.NaN, desvio: Number.NaN, visto: false }
  let i1 = i0
  while (i1 < cuadros.length && cuadros[i1].fase === fase) i1 += 1
  const dentro = cuadros.slice(i0, i1).filter((c) => Number.isFinite(c.avance))
  const t0 = dentro.find((c) => (fase === 'abriendo' ? c.avance < 1 : c.avance > 0))?.t ?? cuadros[i0].t
  const fin = cuadros[Math.min(i1, cuadros.length - 1)].t
  const total = fin - t0
  // El avance contra la recta del tiempo: abrir va de 1 a 0, cerrar de 0 a 1.
  const desvio = Math.max(0, ...dentro.filter((c) => c.t >= t0).map((c) => Math.abs((fase === 'abriendo' ? 1 - c.avance : c.avance) - Math.min(1, (c.t - t0) / total))))
  return { ms: total, desvio, visto: true }
}

/**
 * [C2 · 80] UNA SOLA EXPANSIÓN (o una sola compresión), sin meseta: con el área entre el 5 y el 95 %, el área nunca baja (tolerancia
 * 1 %) y entre dos cuadros seguidos no pasan más de 60 ms (una traba se ve como un hueco en el tiempo o como un área quieta).
 */
function meseta(cuadros: readonly Cuadro[], fase: 'abriendo' | 'cerrando'): { readonly hay: boolean; readonly detalle: string } {
  const dentro = cuadros.filter((c) => c.fase === fase && Number.isFinite(c.area))
  const medio = dentro.filter((c) => c.area > 0.05 && c.area < 0.95)
  if (dentro.length < 5 || medio.length < 3) return { hay: true, detalle: `sin cuadros medibles (${String(dentro.length)} con área, ${String(medio.length)} entre el 5 y el 95 %)` }
  let baja = 0
  let hueco = 0
  for (let i = 1; i < dentro.length; i += 1) {
    const a = dentro[i - 1]
    const b = dentro[i]
    if (!(a.area > 0.05 && b.area < 0.95)) continue
    const subio = fase === 'abriendo' ? b.area - a.area : a.area - b.area
    baja = Math.max(baja, -subio)
    hueco = Math.max(hueco, b.t - a.t)
  }
  return { hay: baja > 0.01 || hueco > 60, detalle: `el área baja hasta ${(baja * 100).toFixed(1)} % · el mayor hueco entre cuadros ${hueco.toFixed(0)} ms (${String(medio.length)} cuadros entre el 5 y el 95 %)` }
}

interface EventoDelTrace {
  readonly name: string
  readonly ph: string
  readonly ts: number
  readonly id?: string
  readonly id2?: { readonly local?: string }
  readonly args?: { readonly data?: { readonly displayName?: string; readonly compositeFailed?: number }; readonly hasPartialUpdate?: boolean }
}

/** Una animación nativa sobre el fondo del login, vista desde la página (ms de `performance.now`). */
interface FundidoDeLaPagina {
  readonly creada: number
  readonly inicio: number
  readonly duracion: number
}

/**
 * [C2 · 80] EL FUNDIDO EN EL COMPOSITOR. En la entrada directa el hilo principal está ocupado (el home monta sus secciones) y sus
 * cuadros no ven el fundido (ni el registro de `INICIO`, ni un screencast, que pasa por ese hilo). La página dice cuándo arrancó la
 * animación nativa en el compositor (`startTime`) y cuánto dura; el trace de Chrome (alineado por la marca `fundido-creado-N`), si se
 * pudo componer (`compositeFailed`) y los cuadros que el compositor presentó en esa ventana (un `DroppedFrame` con `hasPartialUpdate`
 * es un cuadro presentado sin la parte del hilo principal: el fundido sí se ve; sin esa marca, el cuadro se perdió).
 */
async function grabarElTrace(p: Page): Promise<() => Promise<EventoDelTrace[]>> {
  const s = await p.context().newCDPSession(p)
  const eventos: EventoDelTrace[] = []
  s.on('Tracing.dataCollected', (d: { value: Record<string, unknown>[] }) => {
    for (const e of d.value) {
      const name = String(e.name ?? '')
      if (name === 'Animation' || name === 'PipelineReporter' || name === 'DroppedFrame' || name.startsWith('fundido-creado-')) eventos.push(e as unknown as EventoDelTrace)
    }
  })
  await s.send('Tracing.start', { categories: 'blink.animations,devtools.timeline,cc,blink.user_timing,disabled-by-default-devtools.timeline.frame', transferMode: 'ReportEvents' })
  return async () => {
    const fin = new Promise<void>((r) => s.once('Tracing.tracingComplete', () => r()))
    await s.send('Tracing.end')
    await fin
    return eventos
  }
}

function fundidoEnElCompositor(eventos: readonly EventoDelTrace[], fundidos: readonly FundidoDeLaPagina[]): { readonly bien: boolean; readonly detalle: string } {
  // El último que arrancó (en desarrollo, el modo estricto de React crea uno y lo cancela antes del de verdad).
  const i = fundidos.findLastIndex((f) => Number.isFinite(f.inicio))
  const f = fundidos[i]
  if (f === undefined) return { bien: false, detalle: 'sin una animación nativa sobre el fondo (el fundido se pinta desde JS)' }
  const marca = eventos.find((e) => e.name === `fundido-creado-${String(i + 1)}`)
  if (marca === undefined) return { bien: false, detalle: 'sin la marca de la animación en el trace' }
  const desde = marca.ts + (f.inicio - f.creada) * 1000
  const hasta = desde + f.duracion * 1000
  const clave = (e: EventoDelTrace): string => e.id2?.local ?? e.id ?? ''
  const animacion = (e: EventoDelTrace): boolean => e.name === 'Animation'
  // Las del fundido (la hoja y lo de adentro) nacen juntas con la marca y son nativas (sin `displayName`: una transición de CSS lleva
  // su propiedad, como la del color del contorno de la flecha, que nace a la vez); un `compositeFailed` entre su principio y su fin es de ellas.
  const propias = eventos.filter((e) => animacion(e) && e.ph === 'b' && Math.abs(e.ts - marca.ts) <= 5000 && e.args?.data?.displayName === '')
  const fallo = propias.flatMap((b) => {
    const fin = eventos.find((e) => animacion(e) && e.ph === 'e' && clave(e) === clave(b) && e.ts >= b.ts)?.ts ?? Number.POSITIVE_INFINITY
    return eventos.filter((e) => animacion(e) && e.ph === 'n' && clave(e) === clave(b) && e.ts >= b.ts && e.ts <= fin && (e.args?.data?.compositeFailed ?? 0) !== 0)
  })[0]
  const enLaVentana = (e: EventoDelTrace): boolean => e.ts >= desde && e.ts <= hasta
  const cuadros = eventos.filter((e) => e.name === 'PipelineReporter' && e.ph === 'b' && enLaVentana(e)).length
  const perdidos = eventos.filter((e) => e.name === 'DroppedFrame' && enLaVentana(e) && e.args?.hasPartialUpdate !== true).length
  const bien = propias.length > 0 && fallo === undefined && f.duracion <= MS_DEL_FUNDIDO + 2 * CUADRO && cuadros >= Math.floor(MS_DEL_FUNDIDO / 20) && perdidos <= 2
  const compuesta = propias.length === 0 ? 'sin sus eventos en el trace' : fallo === undefined ? `compuesta (${String(propias.length)} animaciones)` : `NO compuesta (${String(fallo.args?.data?.compositeFailed)})`
  return { bien, detalle: `${f.duracion.toFixed(0)} ms en el compositor, ${compuesta}, ${String(cuadros)} cuadros presentados y ${String(perdidos)} perdidos en esa ventana; arrancó ${(f.inicio - f.creada).toFixed(0)} ms después de crearse` }
}

async function esperarFase(p: Page, fase: string, ms = 4000): Promise<boolean> {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const f = await p.evaluate(() => document.querySelector('[data-pieza="ingreso"]')?.getAttribute('data-fase') ?? 'sin')
    if (f === fase) return true
    await dormir(40)
  }
  return false
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })

  // 1440 · desde «Login», con la página scrolleada.
  {
    const { p, errores, posts, cerrar } = await abrir(1440, 900, false)
    await cargar(p, '/v3')
    await rodar(p, 1400)
    const y0 = await scrollY(p)
    const d0 = await dibujos(p)
    await dormir(1000)
    const cerradoDibuja = (await dibujos(p)) - d0
    ver(cerradoDibuja > 0, '[control] cerrado, la escena dibuja', `${String(cerradoDibuja)} dibujos en 1 s`)

    let i = await marcar(p)
    await tocar(p, '[data-pieza="barra-login"]')
    ver(await esperarFase(p, 'abierta'), '1440 · «Login» despliega el login')
    let c = await desde(p, i)
    const ap = tramo(c, 'abriendo')
    ver(ap.visto && Math.abs(ap.ms - MS_DEL_GENIE) <= 2 * CUADRO, '1440 · la apertura dura lo del Genie de las demos', `${ap.ms.toFixed(0)} ms (objetivo ${String(MS_DEL_GENIE)} ± ${(2 * CUADRO).toFixed(0)})`)
    ver(ap.desvio <= 0.04, '1440 · y con su curva: el avance lineal en el tiempo (la forma la da filaDelGenie)', `desvío ${ap.desvio.toFixed(3)}`)
    const mp = meseta(c, 'abriendo')
    ver(!mp.hay, '1440 · una sola expansión continua, sin meseta (control: CONTROL=pausa)', mp.detalle)
    ver((await p.evaluate(() => location.search)).includes('ingresar'), '1440 · la URL dice ?ingresar', await p.evaluate(() => location.href))
    const cubre = await p.evaluate(() => {
      const f = document.querySelector<HTMLElement>('[data-pieza="ingreso"] [data-parte="fondo"]')
      const r = f?.getBoundingClientRect()
      return f !== null && r !== undefined && getComputedStyle(f).clipPath === 'none' && r.width >= innerWidth && r.height >= innerHeight
    })
    ver(cubre, '1440 · desplegado, el negro cubre la pantalla entera (sin recorte)')
    await dormir(400)
    await p.screenshot({ path: path.join(SALIDA, '1440-abierto.png') })
    const d1 = await dibujos(p)
    await dormir(1000)
    const abiertoDibuja = (await dibujos(p)) - d1
    ver(abiertoDibuja === 0, '1440 · la escena duerme detrás del negro', `${String(abiertoDibuja)} dibujos en 1 s (cerrado: ${String(cerradoDibuja)})`)
    if (CONTROL === 'scroll') await p.evaluate(() => window.scrollBy(0, 120))

    i = await marcar(p)
    await tocar(p, '[data-pieza="ingreso"] [data-parte="volver"]')
    await dormir(MS_DEL_GENIE + 900)
    c = await desde(p, i)
    const ci = tramo(c, 'cerrando')
    ver(ci.visto && Math.abs(ci.ms - MS_DEL_GENIE) <= 2 * CUADRO, '1440 · «Volver al home» cierra con la animación inversa', `${ci.ms.toFixed(0)} ms, desvío ${ci.desvio.toFixed(3)}`)
    const mc = meseta(c, 'cerrando')
    ver(!mc.hay, '1440 · y una sola compresión al cerrar, sin meseta', mc.detalle)
    const y1 = await scrollY(p)
    ver(Math.abs(y1 - y0) === 0, '1440 · y la página queda donde estaba (|Δy| = 0)', `antes ${String(y0)} · después ${String(y1)}`)
    ver(!(await p.evaluate(() => location.search)).includes('ingresar'), '1440 · la URL vuelve sin ?ingresar')
    ver((await enfocado(p)) === 'barra-login', '1440 · el foco vuelve a «Login»', await enfocado(p))

    // La flecha atrás hace lo mismo; la de adelante vuelve a abrir; Esc cierra.
    await tocar(p, '[data-pieza="barra-login"]')
    await esperarFase(p, 'abierta')
    i = await marcar(p)
    await p.goBack()
    await dormir(MS_DEL_GENIE + 900)
    c = await desde(p, i)
    const at = tramo(c, 'cerrando')
    ver(at.visto && Math.abs(at.ms - MS_DEL_GENIE) <= 2 * CUADRO, '1440 · la flecha atrás cierra con la misma animación inversa', `${at.ms.toFixed(0)} ms`)
    ver(Math.abs((await scrollY(p)) - y0) === 0, '1440 · y la página queda donde estaba (|Δy| = 0)', `${String(await scrollY(p))} vs ${String(y0)}`)
    i = await marcar(p)
    await p.goForward()
    ver(await esperarFase(p, 'abierta'), '1440 · la flecha de adelante lo vuelve a abrir')
    ver(tramo(await desde(p, i), 'abriendo').visto, '1440 · con la apertura (no de golpe)')
    await p.keyboard.press('Escape')
    await dormir(MS_DEL_GENIE + 900)
    ver((await p.evaluate(() => document.querySelector('[data-pieza="ingreso"]') === null)) && !(await p.evaluate(() => location.search)).includes('ingresar'), '1440 · Esc cierra (y la URL vuelve)')
    ver(Math.abs((await scrollY(p)) - y0) === 0, '1440 · |Δy| = 0 después de todo', `${String(await scrollY(p))} vs ${String(y0)}`)
    ver(errores.length === 0, '1440 · la consola sin errores', errores.join(' | '))
    ver(posts.length === 0, '1440 · ningún login de verdad', posts.join(' · '))
    await cerrar()
  }

  // 390 · sin «Login» a la vista: la entrada directa con `?ingresar`, con el fundido; pantalla completa; «Volver».
  {
    const { p, errores, cerrar } = await abrir(390, 844, true)
    const i0 = 0
    const parar = await grabarElTrace(p)
    await cargar(p, '/v3?ingresar')
    ver(await esperarFase(p, 'abierta', 8000), '390 · la entrada directa con ?ingresar lo abre')
    const ab = tramo(await desde(p, i0), 'abriendo')
    // [C2 · 80] El hilo principal (lo de siempre) queda como dato: en la entrada directa el home monta sus secciones y le quita los
    // cuadros. Lo que manda es el compositor, donde corre el fundido.
    console.log(`info  390 · el hilo principal ve el fundido en ${ab.ms.toFixed(0)} ms`)
    const fundidos = await p.evaluate(() => (window as unknown as { __fundidos?: FundidoDeLaPagina[] }).__fundidos ?? [])
    const compositor = fundidoEnElCompositor(await parar(), fundidos)
    ver(compositor.bien, '390 · sin un botón de dónde salir, el fundido de las demos, en el compositor (C2 · 80; rojo: el fundido pintado desde JS, el código de antes)', `${compositor.detalle} (objetivo ${String(MS_DEL_FUNDIDO)} ± ${(2 * CUADRO).toFixed(0)}, ≥ ${String(Math.floor(MS_DEL_FUNDIDO / 20))} cuadros, ≤ 2 perdidos)`)
    const completa = await p.evaluate(() => {
      const d = document.querySelector('[data-pieza="ingreso"] [role="dialog"]')?.getBoundingClientRect()
      return d !== undefined && d.left <= 0 && d.top <= 0 && d.width >= innerWidth && d.height >= innerHeight
    })
    ver(completa, '390 · pantalla completa')
    await p.screenshot({ path: path.join(SALIDA, '390-abierto.png') })
    await tocar(p, '[data-pieza="ingreso"] [data-parte="volver"]')
    await dormir(MS_DEL_FUNDIDO + 900)
    ver((await p.evaluate(() => document.querySelector('[data-pieza="ingreso"]') === null)) && (await p.evaluate(() => location.pathname + location.search)) === '/v3', '390 · «Volver al home» cierra y deja /v3 (reemplaza la URL: atrás no saca del sitio)')
    ver(errores.length === 0, '390 · la consola sin errores', errores.join(' | '))
    await cerrar()
  }

  // C2 · 80 · el login a 1440: la flecha, el encabezado, los botones, Magic Link con la carga, la vuelta de la caché. Las acciones del
  // login (POST de server action, cabecera next-action) se sujetan 6 s y se abortan: ninguna llega a la autenticación.
  {
    const { p, errores, posts, cerrar } = await abrir(1440, 900, false)
    const acciones: string[] = []
    await p.route('**/*', async (r) => {
      const q = r.request()
      if (q.method() === 'POST' && q.headers()['next-action'] !== undefined) {
        acciones.push(q.url())
        await dormir(6000)
        await r.abort()
        return
      }
      await r.fallback()
    })
    await cargar(p, '/v3')
    const centroDelLogin = await p.evaluate(() => {
      const r = document.querySelector('[data-pieza="barra-login"]')?.getBoundingClientRect()
      return r === undefined ? null : { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    })
    await tocar(p, '[data-pieza="barra-login"]')
    ver(await esperarFase(p, 'abierta'), 'C2 · 1440 · «Login» despliega el login')
    await dormir(300)
    const flecha = await p.evaluate(() => {
      const e = document.querySelector('[data-pieza="ingreso"] [data-parte="flecha-de-salida"]')
      const r = e?.getBoundingClientRect()
      return r === undefined ? null : { x: r.left + r.width / 2, y: r.top + r.height / 2, nombre: e?.getAttribute('aria-label') ?? '' }
    })
    ver(flecha !== null && centroDelLogin !== null && Math.hypot(flecha.x - centroDelLogin.x, flecha.y - centroDelLogin.y) <= 3 && flecha.nombre === 'Cerrar', 'C2 · 1440 · la flecha para salir está donde estaba «Login» (centro a ≤ 3 px) y se llama «Cerrar»', JSON.stringify({ flecha, centroDelLogin }))
    const forma = await p.evaluate(() => {
      const raiz = document.querySelector('[data-pieza="ingreso"]')
      const h2 = raiz?.querySelector('h2')
      const caja = (s: string): { left: number; right: number; top: number; height: number; width: number } | null => {
        const r = raiz?.querySelector(s)?.getBoundingClientRect()
        return r === undefined ? null : { left: r.left, right: r.right, top: r.top, height: r.height, width: r.width }
      }
      return {
        centrado: h2 === null || h2 === undefined ? false : getComputedStyle(h2).textAlign === 'center',
        cta: caja('[data-pieza="ingreso-con-clave"] [data-pieza="cta"]'),
        olvido: caja('a[href="/forgot-password"]'),
        volver: caja('[data-parte="volver"]'),
        probar: caja('[data-parte="probar-el-panel"]'),
        form: caja('[data-pieza="ingreso-con-clave"]'),
      }
    })
    const mismoRenglon = (a: { top: number; height: number } | null, b: { top: number; height: number } | null): boolean => a !== null && b !== null && Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) <= 12
    ver(forma.centrado, 'C2 · 1440 · el encabezado está centrado')
    ver(forma.cta !== null && forma.olvido !== null && forma.form !== null && forma.cta.left >= forma.olvido.right && mismoRenglon(forma.cta, forma.olvido) && forma.cta.width < forma.form.width * 0.45, 'C2 · 1440 · «Ingresar» a la derecha de «¿Olvidaste tu contraseña?», en el mismo renglón, y no la barra larga', JSON.stringify(forma.cta))
    ver(forma.volver !== null && forma.probar !== null && forma.volver.left < forma.probar.left && mismoRenglon(forma.volver, forma.probar), 'C2 · 1440 · abajo: «Volver al home» a la izquierda y «Probá el panel» a la derecha, en el mismo renglón')
    await p.screenshot({ path: path.join(SALIDA, 'c2-1440-clave.png') })

    // Magic Link durante la carga: la pantalla nunca queda vacía y los chips esperan.
    await p.fill('#ingreso-email', 'prueba@ejemplo.com')
    await p.fill('#ingreso-clave', '12345678')
    await tocar(p, '[data-pieza="ingreso-con-clave"] [data-pieza="cta"]')
    await dormir(700)
    const chip = p.locator('[data-pieza="modo-del-ingreso"]', { hasText: 'Magic Link' })
    ver(await chip.isDisabled(), 'C2 · 1440 · con la carga en curso, el chip «Magic Link» espera (deshabilitado)')
    await chip.click({ force: true, timeout: 2000 }).catch(() => undefined)
    await dormir(600)
    // CONTROL=pantalla-vacia: esconde el diálogo antes de mirar (el chequeo TIENE que dar FALLA).
    const vacia = await p.evaluate((esconder) => {
      const d = document.querySelector<HTMLElement>('[data-pieza="ingreso"] [role="dialog"]')
      if (d === null) return true
      if (esconder) d.style.visibility = 'hidden'
      return getComputedStyle(d).visibility === 'hidden' || d.getBoundingClientRect().width === 0 || (d.querySelector('h2')?.textContent ?? '') === '' || document.querySelector('[data-pieza="ingreso"] [data-parte="carga"]') === null
    }, CONTROL === 'pantalla-vacia')
    ver(!vacia, 'C2 · 1440 · tocar «Magic Link» durante la carga no deja la pantalla vacía (control: CONTROL=pantalla-vacia)')
    ver(await p.evaluate(() => document.querySelector('[data-pieza="ingreso-con-clave"]') !== null), 'C2 · 1440 · y el formulario de la contraseña sigue ahí (no cambió de pestaña)')
    await dormir(6500)
    ver(!(await chip.isDisabled()) && (await p.evaluate(() => document.querySelector('[data-pieza="ingreso"] [data-parte="carga"]') === null)), 'C2 · 1440 · al terminar la carga, vuelve el formulario y los chips funcionan')

    // La vuelta de la caché de ida y vuelta (pageshow persistido) después de Google: el login abierto y sin «cargando».
    await tocar(p, '[data-pieza="ingreso-google"]')
    await dormir(700)
    ver((await p.locator('[data-pieza="ingreso-google"]').getAttribute('aria-busy')) === 'true', 'C2 · 1440 · Google cargando (la acción sujeta)')
    if (CONTROL !== 'sin-pageshow') await p.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })))
    await dormir(500)
    const vuelta = await p.evaluate(() => ({
      url: location.search,
      abierta: document.querySelector('[data-pieza="ingreso"]')?.getAttribute('data-fase') === 'abierta',
      cargando: document.querySelector('[data-pieza="ingreso-google"]')?.getAttribute('aria-busy') === 'true',
      telon: document.querySelector('[data-pieza="telon-del-ingreso"]') !== null,
    }))
    ver(vuelta.url.includes('ingresar') && vuelta.abierta && !vuelta.cargando && !vuelta.telon, 'C2 · 1440 · la vuelta con pageshow persistido deja el login abierto, sin «cargando» y sin telón (control: CONTROL=sin-pageshow)', JSON.stringify(vuelta))

    // La flecha cierra como «Volver al home».
    await tocar(p, '[data-pieza="ingreso"] [data-parte="flecha-de-salida"]')
    await dormir(MS_DEL_GENIE + 900)
    ver((await p.evaluate(() => document.querySelector('[data-pieza="ingreso"]') === null)) && !(await p.evaluate(() => location.search)).includes('ingresar'), 'C2 · 1440 · la flecha cierra el login (y la URL vuelve)')
    // Las acciones que el banco aborta dejan su «Failed to load resource» en la consola: ésas son del banco, no del sitio.
    const propios = errores.filter((e) => !(acciones.length > 0 && e === 'Failed to load resource: net::ERR_FAILED'))
    ver(propios.length === 0, 'C2 · 1440 · la consola sin errores (salvo las acciones que aborta el banco)', propios.join(' | '))
    ver(posts.length === 0, `C2 · 1440 · ningún login de verdad (${String(acciones.length)} acciones sujetas y abortadas)`, posts.join(' · '))
    await cerrar()
  }

  // SIMULAR=1 · el error y el éxito, simulados (sólo el dev): ningún login de verdad.
  if (SIMULAR) {
    const { p, errores, posts, cerrar } = await abrir(1440, 900, false)
    await cargar(p, '/v3?envio=error')
    await tocar(p, '[data-pieza="barra-login"]')
    await esperarFase(p, 'abierta')
    await tocar(p, '[data-pieza="ingreso-con-clave"] [data-pieza="cta"]')
    await dormir(500)
    const invalidos = await p.evaluate(() => document.querySelectorAll('[data-pieza="ingreso"] [aria-invalid="true"]').length)
    ver(invalidos === 2 && posts.length === 0, 'vacío: los dos campos marcados (borde punteado y su texto), sin viajar', `${String(invalidos)} campos`)
    await p.screenshot({ path: path.join(SALIDA, '1440-errores-del-cliente.png') })
    await p.fill('#ingreso-email', 'prueba@ejemplo.com')
    await p.fill('#ingreso-clave', '12345678')
    await tocar(p, '[data-pieza="ingreso-con-clave"] [data-pieza="cta"]')
    await dormir(400)
    ver(await p.evaluate(() => document.querySelector('[data-pieza="ingreso"] [data-parte="carga"] [data-pieza="carga"]') !== null), 'mientras procesa, el logo de carga')
    await dormir(3200)
    const error = await p.evaluate(() => document.querySelector('[data-parte="error-del-ingreso"]')?.textContent ?? '')
    ver(error.length > 0 && (await p.inputValue('#ingreso-email')) === 'prueba@ejemplo.com', 'el error del servidor (simulado) a la vista, con lo escrito intacto', error)
    await p.screenshot({ path: path.join(SALIDA, '1440-error-del-servidor.png') })

    await cargar(p, '/v3?envio=lento')
    await tocar(p, '[data-pieza="barra-login"]')
    await esperarFase(p, 'abierta')
    await p.fill('#ingreso-email', 'prueba@ejemplo.com')
    await p.fill('#ingreso-clave', '12345678')
    const i = await marcar(p)
    await tocar(p, '[data-pieza="ingreso-con-clave"] [data-pieza="cta"]')
    await dormir(9000)
    const c = await desde(p, i)
    const conTelon = c.filter((x) => x.telon >= 0)
    const salio = c.find((x) => !x.url.startsWith('/v3'))
    const fundido = conTelon.some((x) => x.telon > 0.05 && x.telon < 0.95)
    ver(conTelon.length > 0 && salio !== undefined && fundido && c.at(-1)?.telon === -1, 'al entrar: el telón baja, la ruta sale de /v3 y se funde al panel (y se va)', `${String(conTelon.length)} cuadros con telón · ruta ${salio?.url ?? 'sin salir'}`)
    ver(posts.length === 0, 'ningún login de verdad en la simulación', posts.join(' · '))
    ver(errores.length === 0, 'la consola sin errores (simulación)', errores.join(' | '))
    await cerrar()
  }

  console.log(`\ningreso: ${String(fallas.length)} fallas${CONTROL === '' ? '' : ` (control ${CONTROL}: tiene que fallar)`}`)
  process.exit(fallas.length === 0 ? 0 : 1)
}

void main()
