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
  const log = (window.__cuadrosDelIngreso = [])
  const cuadro = () => {
    const raiz = document.querySelector('[data-pieza="ingreso"]')
    const fondo = raiz && raiz.querySelector('[data-parte="fondo"]')
    log.push({ t: performance.now(), fase: raiz ? raiz.getAttribute('data-fase') || 'montada' : 'sin', avance: fondo ? Number(fondo.getAttribute('data-avance') || 'NaN') : NaN, y: window.scrollY, url: location.pathname + location.search, telon: (() => { const t = document.querySelector('[data-pieza="telon-del-ingreso"]'); return t ? Number(getComputedStyle(t).opacity) : -1 })() })
    if (log.length > 6000) log.splice(0, 3000)
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

interface Cuadro {
  readonly t: number
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
    await cargar(p, '/v3?ingresar')
    ver(await esperarFase(p, 'abierta', 8000), '390 · la entrada directa con ?ingresar lo abre')
    const ab = tramo(await desde(p, i0), 'abriendo')
    ver(ab.visto && Math.abs(ab.ms - MS_DEL_FUNDIDO) <= 2 * CUADRO, '390 · sin un botón de dónde salir, el fundido de las demos', `${ab.ms.toFixed(0)} ms (objetivo ${String(MS_DEL_FUNDIDO)})`)
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
