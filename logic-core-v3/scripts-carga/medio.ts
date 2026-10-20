/**
 * [F4] EL MEDIO DEL PANEL, MEDIDO — por ancho y por proyecto (El Garage, Esquina y Banú): el video contra su columna (lo que deja la tira
 * activa entre sus rellenos) y contra el panel, dónde arranca respecto de la píldora corrida, dónde terminan la ficha y «Visitar sitio» y
 * si algo se pasa del panel. Contra el dev server, con el Chrome del sistema a la vista y `/api/` bloqueado.
 *
 *   ANCHOS=1440,1280,1180,1024 npx tsx scripts-carga/medio.ts
 *
 * El criterio (F4, `a8.ts`, `violacionesDelMedio`): el video ocupa de su columna lo mismo que a 1440 (±1 %), arranca 16 px debajo de la
 * píldora si ella baja hasta el panel (±1 px) y «Visitar sitio» entra en el panel. Si no entra, cuántos px faltan.
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'

import { violacionesDelMedio, type MedidaDelMedio } from './a8'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440,1280,1180,1024').split(',').map(Number)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/f4')
const ALTOS: Readonly<Record<number, number>> = { 1440: 900, 1280: 800, 1180: 800, 1024: 768 }
const ANCLAS = ['portfolio-el-garage', 'portfolio-esquina-estudio', 'portfolio-banu-scents'] as const
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const MEDIR = `(() => {
  const pastilla = document.querySelector('[data-pieza="barra"] [data-parte="pastilla"]')
  const panel = document.querySelector('[data-pieza="panel-del-portfolio"]')
  const tira = document.querySelector('[data-tira][data-activa="true"]')
  const medio = tira ? tira.querySelector('[id^="portfolio-medio-"]') : null
  const figura = medio ? medio.querySelector('figure') : null
  const region = tira ? tira.querySelector('[id^="portfolio-region-"]') : null
  const visitar = region ? [...region.querySelectorAll('a')].pop() : null
  const r = (e) => (e ? e.getBoundingClientRect() : null)
  const cm = medio ? getComputedStyle(medio) : null
  const columna = medio && cm ? medio.clientWidth - parseFloat(cm.paddingLeft) - parseFloat(cm.paddingRight) : 0
  const ultimo = region ? [...region.querySelectorAll('*')].reduce((m, x) => Math.max(m, x.getBoundingClientRect().bottom), 0) : 0
  return {
    tira: tira ? tira.getAttribute('data-tira') : null,
    pastillaAbajo: r(pastilla) ? r(pastilla).bottom : 0,
    pastillaDerecha: r(pastilla) ? r(pastilla).right : 0,
    panel: r(panel) ? { l: r(panel).left, ancho: r(panel).width, abajo: r(panel).bottom } : null,
    columna,
    figura: r(figura) ? { arriba: r(figura).top, ancho: r(figura).width, alto: r(figura).height, abajo: r(figura).bottom } : null,
    visitarAbajo: r(visitar) ? r(visitar).bottom : 0,
    ultimo,
    desborda: region ? region.scrollHeight > region.clientHeight + 1 : null,
  }
})()`

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const medidas: MedidaDelMedio[] = []
  for (const ancho of ANCHOS) {
    const alto = ALTOS[ancho] ?? 900
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/f4-perfil-${String(Date.now())}`)
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
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      const cdp = await ctx.newCDPSession(p)
      await cdp.send('Network.enable')
      await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
      for (const ancla of ANCLAS) {
        await p.goto('about:blank')
        await p.goto(`${BASE}/v3?diag=carga#${ancla}`, { waitUntil: 'load', timeout: 240000 })
        const t0 = Date.now()
        while (Date.now() - t0 < 60000) {
          const listo = await p.evaluate(() => document.querySelector('[data-pieza="escenario-del-portfolio"]')?.getAttribute('data-panel-adentro') === 'si' && document.querySelector('[data-pieza="escenario-del-portfolio"]')?.getAttribute('data-orden-quieto') === 'si').catch(() => false)
          if (listo) break
          await dormir(250)
        }
        await dormir(2500)
        await p.mouse.move(ancho * 0.2, alto * 0.55)
        const m = { ancho, alto, ...((await p.evaluate(MEDIR)) as Omit<MedidaDelMedio, 'ancho' | 'alto'>) }
        medidas.push(m)
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${m.tira ?? ancla}.png`) })
        appendFileSync(path.join(SALIDA, 'medio.jsonl'), `${JSON.stringify(m)}\n`)
      }
    } finally {
      await ctx.close()
    }
  }
  for (const m of medidas) {
    const v = violacionesDelMedio(m, medidas)
    const f = m.figura
    const llena = f === null || m.columna === 0 ? Number.NaN : f.ancho / m.columna
    console.log(`${v.length === 0 ? 'ok   ' : 'FALLA'} ${String(m.ancho)}×${String(m.alto)} · ${m.tira ?? '?'} · video ${f === null ? '?' : `${f.ancho.toFixed(0)}×${f.alto.toFixed(0)}`} (${(llena * 100).toFixed(1)} % de su columna de ${m.columna.toFixed(0)}, ${f === null || m.panel === null ? '?' : ((f.ancho / m.panel.ancho) * 100).toFixed(1)} % del panel) · arranca ${f === null ? '?' : (f.arriba - m.pastillaAbajo).toFixed(0)} px debajo de la píldora · «Visitar sitio» termina en ${m.visitarAbajo.toFixed(0)} de ${m.panel === null ? '?' : m.panel.abajo.toFixed(0)} (desborda ${String(m.desborda)})${v.length === 0 ? '' : ` · ${v.join(',')}`}`)
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
