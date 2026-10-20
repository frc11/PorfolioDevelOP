/**
 * [F5] LA MATRIZ DE LAS HISTORIAS, EN EL SITIO — debajo de 1024 el Portfolio son historias. Con el dedo (`tactil.ts`), el Chrome del
 * sistema a la vista, contra el dev server y `/api/` bloqueado, grabando cuadro a cuadro (rAF) lo que se ve del título, de las historias
 * y de Demos. La cuenta es `historias-cuenta.ts`: nunca un fondo vacío ni un título huérfano.
 *
 *   ANCHOS=390x844,768x1024,820x1180,1023x768 npx tsx scripts-carga/historias.ts            la matriz
 *   RECORRIDO=completo …    entrar scrolleando, salir a Demos, volver, salir hacia arriba y volver (una vez por ancho)
 *   DEFECTO=historias-de-antes …          el control positivo (las historias de antes): tiene que fallar
 *   DESDE=0,1,2,3 SALIDAS=arriba,abajo …    desde cada historia (con deslices de costado) sale hacia arriba (Demos) o hacia abajo
 *     (el título) y vuelve: lo de siempre, todas las combinaciones
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type CDPSession, type Page } from '@playwright/test'

import { violacionesDeLasHistorias, type CuadroDeLasHistorias } from './historias-cuenta'
import { deslizar, desplazarConElDedo } from './tactil'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '390x844,768x1024,820x1180,1023x768').split(',').map((a) => a.split('x').map(Number) as [number, number])
const RECORRIDO = process.env.RECORRIDO ?? 'matriz'
const DESDE = (process.env.DESDE ?? '0,1,2,3').split(',').map(Number)
const SALIDAS = (process.env.SALIDAS ?? 'arriba,abajo').split(',') as ('arriba' | 'abajo')[]
/** El control positivo: `DEFECTO=historias-de-antes` (el orden de escritorio, el título sin fundido): tiene que fallar. */
const DEFECTO = process.env.DEFECTO ?? null
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/f5')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const GRABAR = `(() => {
  const t0 = performance.now()
  const log = (window.__historias = [])
  const cruce = (a, b) => ({ l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) })
  const area = (a) => Math.max(0, a.r - a.l) * Math.max(0, a.b - a.t)
  // Lo que se ve de un elemento: la fracción de su área a la vista (recortada por los ancestros que recortan y por el cuadro), por su
  // opacidad efectiva y por su escala (la capa de Demos en el teléfono crece desde 0).
  const visible = (el) => {
    if (!el) return 0
    const q = el.getBoundingClientRect()
    let r = { l: q.left, t: q.top, r: q.right, b: q.bottom }
    const total = area(r)
    if (total <= 0) return 0
    let op = 1
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const c = getComputedStyle(e)
      if (c.display === 'none' || c.visibility === 'hidden') return 0
      op *= parseFloat(c.opacity || '1')
      if (e !== el && /(hidden|clip)/.test(c.overflowX + c.overflowY)) {
        const k = e.getBoundingClientRect()
        r = cruce(r, { l: k.left, t: k.top, r: k.right, b: k.bottom })
      }
    }
    const escala = el.offsetWidth > 0 ? Math.min(1, q.width / el.offsetWidth) : 1
    return Math.min(1, area(cruce(r, { l: 0, t: 0, r: innerWidth, b: innerHeight })) / total) * op * escala
  }
  let impar = false
  const cuadro = () => {
    // Uno de cada dos cuadros: la medición pesa (quince puntos por elemento).
    impar = !impar
    if (impar) {
      if (!window.__pararLasHistorias) requestAnimationFrame(cuadro)
      return
    }
    const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
    const seccion = document.querySelector('[data-panel="trabajos"]')
    const s = seccion ? seccion.getBoundingClientRect() : null
    log.push({
      t: Math.round(performance.now() - t0),
      y: Math.round(scrollY),
      paso: Number(e ? e.getAttribute('data-paso') : NaN),
      enCuadro: s ? Math.min(s.bottom, innerHeight) - Math.max(s.top, 0) > innerHeight / 2 : false,
      titulo: visible(document.querySelector('[data-pieza="encabezado-del-portfolio"] h2')),
      historias: visible(document.querySelector('[data-pieza="historias"]')),
      // Demos: su título y su párrafo, que llevan el fundido de la llegada (CapaDeDemos); en el teléfono crece la capa entera.
      demos: Math.max(visible(document.querySelector('#demos > div:first-child')), visible(document.querySelector('#demos > div:nth-child(2) > div'))),
      indice: Number(document.querySelector('[data-pieza="historias"]')?.getAttribute('data-indice') ?? -1),
      camara: e ? e.getAttribute('data-camara') === 'si' : false,
    })
    if (!window.__pararLasHistorias) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

interface Contexto {
  readonly p: Page
  readonly cdp: CDPSession
  readonly ancho: number
  readonly alto: number
}

const pasoAhora = (p: Page): Promise<number> => p.evaluate(() => Number(document.querySelector('[data-pieza="escenario-del-portfolio"]')?.getAttribute('data-paso') ?? NaN))
const adentro = (paso: number): boolean => paso >= 0 && paso <= 3

/** Lleva la página a un píxel de la regla del Portfolio, de un salto (el scroll nativo). */
async function alPx(p: Page, px: number): Promise<void> {
  await p.evaluate((x) => {
    const panel = document.querySelector('[data-panel="trabajos"]')
    if (panel === null) return
    const tope = panel.getBoundingClientRect().top + scrollY
    window.scrollTo({ top: tope - innerHeight + (x * innerHeight) / 900, behavior: 'instant' })
  }, px)
}

/** El dedo hasta que se cumpla `listo` (de a `tramo` px, con una pausa), a lo sumo `veces`. */
async function dedoHasta(c: Contexto, dy: number, listo: (paso: number) => boolean, veces = 30): Promise<boolean> {
  for (let i = 0; i < veces; i++) {
    if (listo(await pasoAhora(c.p))) return true
    await desplazarConElDedo(c.cdp, c.ancho / 2, c.alto / 2, dy)
    await dormir(450)
  }
  return listo(await pasoAhora(c.p))
}

/** Un deslice sobre las historias (dx, dy desde el medio). */
const desliz = (c: Contexto, dx: number, dy: number): Promise<void> => deslizar(c.cdp, c.ancho / 2, c.alto / 2, dx, dy)

async function abrir(ancho: number, alto: number): Promise<{ readonly cerrar: () => Promise<void>; readonly c: Contexto }> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/f5-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
  if (DEFECTO !== null) await ctx.addInitScript(`window.__defectosDelPortfolio = ${JSON.stringify(DEFECTO)}`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  await p.goto(`${BASE}/v3?diag=carga`, { waitUntil: 'load', timeout: 240000 })
  const t0 = Date.now()
  while (Date.now() - t0 < 60000) {
    const lista = await p.evaluate(() => document.querySelector('[data-pieza="escenario-del-portfolio"]') !== null && (window as unknown as { __v3diag?: { pulso: () => { escenaLista: boolean } } }).__v3diag?.pulso().escenaLista === true).catch(() => false)
    if (lista) break
    await dormir(250)
  }
  await dormir(2500)
  return { cerrar: () => ctx.close(), c: { p, cdp, ancho, alto } }
}

/** Entra scrolleando con el dedo desde arriba de la sección (Números) hasta que las historias corren. */
async function entrarScrolleando(c: Contexto): Promise<boolean> {
  await alPx(c.p, -300)
  await dormir(1500)
  const ok = await dedoHasta(c, 300, adentro)
  await dormir(1500)
  return ok
}

/** Vuelve: desde Demos, el dedo hacia arriba; desde el título, hacia abajo; hasta que las historias corren otra vez. */
async function volver(c: Contexto, desde: 'demos' | 'titulo'): Promise<boolean> {
  const ok = await dedoHasta(c, desde === 'demos' ? -300 : 300, adentro)
  await dormir(1500)
  return ok
}

async function grabar(c: Contexto, nombre: string, ancho: number, alto: number, hacer: () => Promise<boolean>): Promise<boolean> {
  await c.p.evaluate(GRABAR)
  const llego = await hacer()
  await dormir(800)
  const cuadros = await c.p.evaluate(() => {
    ;(window as unknown as { __pararLasHistorias: boolean }).__pararLasHistorias = true
    return (window as unknown as { __historias: (CuadroDeLasHistorias & { y: number; indice: number })[] }).__historias
  })
  await c.p.evaluate(() => {
    ;(window as unknown as { __pararLasHistorias: boolean }).__pararLasHistorias = false
  })
  const { violaciones, peores } = violacionesDeLasHistorias(cuadros)
  const malas = [...violaciones, ...(llego ? [] : ['no-volvio'])]
  appendFileSync(path.join(SALIDA, 'historias.jsonl'), `${JSON.stringify({ ancho, alto, nombre, defecto: DEFECTO, malas, peores, cuadros })}\n`)
  const detalle = Object.entries(peores).filter(([, ms]) => ms > 0).map(([v, ms]) => `${v} ${String(Math.round(ms))} ms`).join(', ')
  console.log(`${malas.length === 0 ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)} · ${nombre}${DEFECTO === null ? '' : ` [defecto ${DEFECTO}]`}${malas.length === 0 ? '' : ` · ${malas.join(',')}`}${detalle === '' ? '' : ` (${detalle})`}`)
  return malas.length === 0
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  let malas = 0
  let todas = 0
  for (const [ancho, alto] of ANCHOS) {
    const { cerrar, c } = await abrir(ancho, alto)
    try {
      if (RECORRIDO === 'completo') {
        todas += 1
        const bien = await grabar(c, 'entrar scrolleando, a Demos, volver, hacia arriba y volver', ancho, alto, async () => {
          if (!(await entrarScrolleando(c))) return false
          await desliz(c, 0, -300)
          await dormir(2500)
          if (!(await volver(c, 'demos'))) return false
          await desliz(c, 0, 300)
          await dormir(2500)
          await dedoHasta(c, -300, () => false, 4)
          await dormir(1000)
          return dedoHasta(c, 300, adentro)
        })
        if (!bien) malas += 1
        continue
      }
      for (const desde of DESDE) {
        for (const salida of SALIDAS) {
          todas += 1
          const bien = await grabar(c, `desde la historia ${String(desde)} · sale hacia ${salida} y vuelve`, ancho, alto, async () => {
            if (!adentro(await pasoAhora(c.p)) && !(await entrarScrolleando(c))) return false
            // Los deslices de costado: hasta la historia de partida (a la izquierda, la siguiente).
            for (let k = 0; k < desde; k++) {
              await desliz(c, -200, 0)
              await dormir(700)
            }
            // Que esté en la historia pedida y que la salida haya salido (si no, volver daría bien sin haberse ido).
            const indice = await c.p.evaluate(() => Number(document.querySelector('[data-pieza="historias"]')?.getAttribute('data-indice') ?? NaN))
            if (indice !== desde) return false
            // Desde «la tuya» el deslice arranca arriba del formulario (sobre los campos, los gestos no cuentan).
            await deslizar(c.cdp, c.ancho / 2, desde === 3 ? c.alto * 0.3 : c.alto / 2, 0, salida === 'arriba' ? -300 : 300)
            await dormir(2500)
            if ((await pasoAhora(c.p)) !== (salida === 'arriba' ? 4 : -1)) return false
            return volver(c, salida === 'arriba' ? 'demos' : 'titulo')
          })
          if (!bien) malas += 1
        }
      }
    } finally {
      await cerrar()
    }
  }
  console.log(`historias: ${String(todas - malas)} de ${String(todas)} sin violaciones`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
