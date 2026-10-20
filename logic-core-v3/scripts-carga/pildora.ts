/**
 * [F3] LA PÍLDORA Y EL PANEL, CUADRO A CUADRO — en la entrada (una muesca desde justo antes del pin: la trampa lleva a El Garage) y en la
 * salida (una muesca hacia arriba desde El Garage), cada cuadro de `requestAnimationFrame` mide el rectángulo de la píldora de la barra y el
 * del panel del Portfolio. Contra el dev server, con el Chrome del sistema a la vista y `/api/` bloqueado.
 *
 *   ANCHOS=1440,1280,1024 npx tsx scripts-carga/pildora.ts
 *   DEFECTO=pildora-con-el-panel …      el control positivo (la vuelta de A2.2: la píldora se expande con la salida del panel)
 *
 * El criterio (F3, `a8.ts`, `cuadrosCruzados`): 0 cuadros en los que los dos rectángulos se cruzan, entrando y saliendo.
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'

import { cuadrosCruzados, type CuadroDeLaPildora } from './a8'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440,1280,1024').split(',').map(Number)
const DEFECTO = process.env.DEFECTO ?? null
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/f3')
const ALTOS: Readonly<Record<number, number>> = { 1440: 900, 1280: 800, 1180: 800, 1024: 768 }
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const GRABAR = `(() => {
  const log = (window.__pildora = [])
  const t0 = performance.now()
  const cuadro = () => {
    const p = document.querySelector('[data-pieza="barra"] [data-parte="pastilla"]')
    const panel = document.querySelector('[data-pieza="panel-del-portfolio"]')
    const medio = [...document.querySelectorAll('[id^="portfolio-medio-"]')].find((m) => !m.hidden)
    const figura = medio ? medio.querySelector('figure') : null
    const a = p ? p.getBoundingClientRect() : null
    const b = panel ? panel.getBoundingClientRect() : null
    const c = figura ? figura.getBoundingClientRect() : null
    log.push({ t: Math.round(performance.now() - t0), p: a ? [a.left, a.top, a.right, a.bottom] : null, panel: b ? [b.left, b.top, b.right, b.bottom] : null, medio: c && c.width > 0 ? [c.left, c.top, c.right, c.bottom] : null })
    if (log.length < 420) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  let malas = 0
  for (const ancho of ANCHOS) {
    const alto = ALTOS[ancho] ?? 900
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/f3-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      if (DEFECTO !== null) await ctx.addInitScript(`window.__defectosDelPortfolio = ${JSON.stringify(DEFECTO)}`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      const cdp = await ctx.newCDPSession(p)
      await cdp.send('Network.enable')
      await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
      await p.goto(`${BASE}/v3?diag=carga`, { waitUntil: 'load', timeout: 240000 })
      const t0 = Date.now()
      while (Date.now() - t0 < 60000) {
        const lista = await p.evaluate(() => (window as unknown as { __v3diag?: { pulso: () => { escenaLista: boolean } } }).__v3diag?.pulso().escenaLista === true).catch(() => false)
        if (lista) break
        await dormir(250)
      }
      await dormir(2500)
      await p.mouse.move(ancho * 0.2, alto * 0.55)
      for (let vuelta = 0; vuelta < 2; vuelta++) {
        await p.evaluate((x) => {
          const panel = document.querySelector('[data-panel="trabajos"]')
          if (panel === null) return
          const tope = panel.getBoundingClientRect().top + scrollY
          window.scrollTo({ top: tope - innerHeight + (x * innerHeight) / 900, behavior: 'instant' })
        }, 880)
        await dormir(2500)
        for (const momento of ['entrada', 'salida'] as const) {
          await p.evaluate(GRABAR)
          await p.mouse.wheel(0, momento === 'entrada' ? 100 : -100)
          await dormir(7500)
          const cuadros = await p.evaluate(() => (window as unknown as { __pildora: CuadroDeLaPildora[] }).__pildora)
          const cruzados = cuadrosCruzados(cuadros)
          // A 1024 la píldora corrida descansa sobre la franja de arriba del panel (A2.1 y F4: el medio arranca 16 px debajo): se cuenta
          // también el cruce con el medio (el video o el póster), lo que se ve del panel.
          const conElMedio = cuadrosCruzados(cuadros.map((x) => ({ ...x, panel: x.medio ?? null })))
          if (cruzados.length > 0) malas += 1
          appendFileSync(path.join(SALIDA, 'pildora.jsonl'), `${JSON.stringify({ ancho, vuelta, momento, defecto: DEFECTO, cruzados: cruzados.length, conElMedio: conElMedio.length, cuadros })}\n`)
          const primero = cruzados[0]
          console.log(`${cruzados.length === 0 ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)} · ${momento} ${String(vuelta + 1)} · ${String(cruzados.length)} de ${String(cuadros.length)} cuadros con la píldora cruzada con el panel, ${String(conElMedio.length)} con el medio${primero === undefined ? '' : ` (el primero a los ${String(primero.t)} ms: píldora ${JSON.stringify(primero.p?.map(Math.round))}, panel ${JSON.stringify(primero.panel?.map(Math.round))})`}${DEFECTO === null ? '' : ` [defecto ${DEFECTO}]`}`)
        }
      }
    } finally {
      await ctx.close()
    }
  }
  console.log(`píldora: ${String(malas)} tramos con cuadros cruzados`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
