/**
 * [F1/F2] LA ENTRADA DEL PORTFOLIO CON LA RUEDA, EN EL SITIO — desde `/v3#quienes-somos` (o desde Demos, subiendo) con la rueda hasta
 * pasar el Portfolio, grabando cuadro a cuadro (rAF) el paso, el panel, la barra y el encabezado. Contra el dev server, con el Chrome
 * del sistema a la vista (como `matriz.ts`) y `/api/` bloqueado.
 *
 *   ANCHO=1440|1024 GESTO=muescas|rafaga|trackpad SENTIDO=bajando|subiendo npx tsx scripts-carga/entrada.ts
 *   DEFECTO=rueda-en-la-entrada …        el control positivo (la rueda de antes): tiene que fallar
 *
 * Lo que tiene que pasar (F2, `a8.ts`, `violacionesDeLaEntrada`): el Portfolio se ve SIEMPRE, entero y en orden (El Garage, Esquina, Banú,
 * la tuya; subiendo, al revés), un proyecto por gesto, y la píldora no se corre sin que entre el panel.
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'

import { resumenDeLaEntrada, violacionesDeLaEntrada, type CuadroDeLaEntrada, type GestoDeLaEntrada } from './a8'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHO = Number(process.env.ANCHO ?? '1440')
const ALTO = ANCHO >= 1440 ? 900 : 768
const GESTO = (process.env.GESTO ?? 'muescas') as GestoDeLaEntrada
const SUBIENDO = process.env.SENTIDO === 'subiendo'
const BUSQUEDA = process.env.BUSQUEDA ?? ''
const VUELTAS = Number(process.env.VUELTAS ?? '1')
/** El control positivo: `DEFECTO=rueda-en-la-entrada` reintroduce la rueda de antes (sin la trampa), antes de cargar. */
const DEFECTO = process.env.DEFECTO ?? null
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/f1')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const GRABAR = `(() => {
  const t0 = performance.now()
  const log = (window.__entrada = [])
  let antes = ''
  const estado = () => {
    const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
    return {
      paso: Number(e ? e.getAttribute('data-paso') : NaN),
      panel: e ? e.getAttribute('data-panel-adentro') === 'si' : false,
      barra: e ? e.getAttribute('data-barra') === 'si' : false,
      encabezado: e ? e.getAttribute('data-encabezado') === 'si' : false,
    }
  }
  window.__gestoDeLaEntrada = () => log.push({ t: Math.round(performance.now() - t0), y: Math.round(scrollY), ...estado(), gesto: true })
  const cuadro = () => {
    const c = estado()
    const clave = JSON.stringify(c)
    if (clave !== antes) {
      antes = clave
      log.push({ t: Math.round(performance.now() - t0), y: Math.round(scrollY), ...c })
    }
    if (!window.__pararLaEntrada) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

/** Un gesto: una muesca, una ráfaga de cinco muescas en 200 ms o un deslizamiento del trackpad con su inercia. */
async function gesto(p: import('@playwright/test').Page, sentido: 1 | -1): Promise<void> {
  if (GESTO === 'muescas') {
    await p.mouse.wheel(0, 100 * sentido)
    return
  }
  if (GESTO === 'rafaga') {
    for (let k = 0; k < 5; k++) {
      await p.mouse.wheel(0, 100 * sentido)
      await dormir(50)
    }
    return
  }
  for (let k = 0; k < 45; k++) {
    await p.mouse.wheel(0, sentido * Math.max(2, 80 * 0.94 ** k))
    await dormir(16)
  }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/f1-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    args: ['--force_high_performance_gpu', `--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    if (DEFECTO !== null) await ctx.addInitScript(`window.__defectosDelPortfolio = ${JSON.stringify(DEFECTO)}`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    const cdp = await ctx.newCDPSession(p)
    await cdp.send('Network.enable')
    await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
    for (let vuelta = 0; vuelta < VUELTAS; vuelta++) {
      await p.goto('about:blank')
      await p.goto(`${BASE}/v3?diag=carga${BUSQUEDA}${SUBIENDO ? '#demos' : '#quienes-somos'}`, { waitUntil: 'load', timeout: 240000 })
      const t0 = Date.now()
      while (Date.now() - t0 < 60000) {
        const lista = await p.evaluate(() => (window as unknown as { __v3diag?: { pulso: () => { escenaLista: boolean } } }).__v3diag?.pulso().escenaLista === true).catch(() => false)
        if (lista) break
        await dormir(250)
      }
      await dormir(3000)
      await p.mouse.move(ANCHO * 0.2, ALTO * 0.55, { steps: 4 })
      await p.evaluate(GRABAR)
      const sentido: 1 | -1 = SUBIENDO ? -1 : 1
      const fin = SUBIENDO ? -1 : 4
      // Hasta pasar el Portfolio (y dos gestos más), o 120 s.
      const t1 = Date.now()
      let despues = 0
      while (Date.now() - t1 < 120000 && despues < 3) {
        await p.evaluate(() => (window as unknown as { __gestoDeLaEntrada: () => void }).__gestoDeLaEntrada())
        await gesto(p, sentido)
        await dormir(GESTO === 'muescas' ? 700 : 1200)
        const paso = await p.evaluate(() => Number(document.querySelector('[data-pieza="escenario-del-portfolio"]')?.getAttribute('data-paso') ?? NaN))
        if (paso === fin) despues += 1
      }
      await dormir(1500)
      const cuadros = await p.evaluate(() => {
        ;(window as unknown as { __pararLaEntrada: boolean }).__pararLaEntrada = true
        return (window as unknown as { __entrada: CuadroDeLaEntrada[] }).__entrada
      })
      const v = violacionesDeLaEntrada(cuadros, SUBIENDO ? 'subiendo' : 'bajando')
      const nombre = `${String(ANCHO)} · ${GESTO} · ${SUBIENDO ? 'subiendo desde Demos' : 'bajando desde Quiénes somos'}${BUSQUEDA === '' ? '' : ` (${BUSQUEDA})`}${DEFECTO === null ? '' : ` [defecto ${DEFECTO}]`}`
      appendFileSync(path.join(SALIDA, 'entrada.jsonl'), `${JSON.stringify({ ancho: ANCHO, gesto: GESTO, subiendo: SUBIENDO, busqueda: BUSQUEDA, defecto: DEFECTO, vuelta, violaciones: v, cuadros })}\n`)
      console.log(`${v.length === 0 ? 'ok   ' : 'FALLA'} ${nombre} · ${resumenDeLaEntrada(cuadros)}${v.length === 0 ? '' : ` · ${v.join(',')}`}`)
    }
  } finally {
    await ctx.close()
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
