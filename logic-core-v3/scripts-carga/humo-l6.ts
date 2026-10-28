import { chromium } from '@playwright/test'

import { perfilDelBanco } from './limpieza-del-banco'
import { desplazarConElDedo } from './tactil'

/**
 * [L6] EL HUMO DEL HOME — a 1440 (la rueda) y a 390 (el dedo): el home entra, baja de a tramos (la ráfaga), llega a Portfolio y a Demos
 * (secciones por `data-panel`), vuelve arriba; sin errores de página. Un humo: no mide, comprueba que nada se rompió.
 *
 *   BASE=http://localhost:3003 npx tsx scripts-carga/humo-l6.ts
 */
const BASE = process.env.BASE ?? 'http://localhost:3003'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
let fallas = 0
const ver = (bien: boolean, que: string, detalle = ''): void => {
  console.log(`${bien ? 'ok   ' : 'FALLA'} ${que}${detalle === '' ? '' : ` — ${detalle}`}`)
  if (!bien) fallas += 1
}

async function humo(ancho: number, alto: number): Promise<void> {
  const tactil = ancho < 1024
  const ctx = await chromium.launchPersistentContext(perfilDelBanco(`humo-l6-${String(ancho)}`), {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: tactil,
    hasTouch: tactil,
    args: ['--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  })
  await ctx.addInitScript(`window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {}`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const cdp = await ctx.newCDPSession(p)
  const errores: string[] = []
  p.on('pageerror', (e) => errores.push(e.message.slice(0, 160)))
  await p.route('**/api/**', (r) => r.abort())
  try {
    await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
    await dormir(5000)
    const y = async (): Promise<number> => p.evaluate(() => window.scrollY)
    const empujar = async (dy: number): Promise<void> => {
      if (tactil) await desplazarConElDedo(cdp, ancho / 2, alto * 0.7, dy, 240)
      else await p.mouse.wheel(0, dy)
    }
    const visto = new Set<string>()
    let ultimo = -1
    for (let i = 0; i < 60; i++) {
      await empujar(tactil ? 500 : 700)
      await dormir(450)
      const hoy = await p.evaluate(() => {
        const ancla = window.innerHeight / 2
        const hit = Array.from(document.querySelectorAll('[data-panel]')).find((e) => {
          const r = e.getBoundingClientRect()
          return r.top <= ancla && r.bottom >= ancla
        })
        return { y: window.scrollY, panel: hit?.getAttribute('data-panel') ?? null }
      })
      if (hoy.panel !== null) visto.add(hoy.panel)
      if (hoy.y === ultimo && i > 5) break
      ultimo = hoy.y
    }
    const abajo = await y()
    ver(abajo > alto * 3, `${String(ancho)} · la ráfaga baja por el home`, `scrollY ${String(Math.round(abajo))} · paneles ${[...visto].join(', ')}`)
    ver([...visto].some((s) => /portfolio|trabajos/.test(s)), `${String(ancho)} · pasa por Portfolio (Trabajos)`, [...visto].join(', '))
    for (let i = 0; i < 60; i++) {
      await empujar(tactil ? -500 : -700)
      await dormir(300)
      if ((await y()) < 5) break
    }
    ver((await y()) < alto, `${String(ancho)} · y vuelve arriba`, `scrollY ${String(Math.round(await y()))}`)
    ver(errores.length === 0, `${String(ancho)} · sin errores de página`, errores.slice(0, 3).join(' | '))
  } finally {
    await ctx.close()
  }
}

async function main(): Promise<void> {
  await humo(1440, 900)
  await humo(390, 844)
  console.log(fallas === 0 ? '\nBIEN' : `\nFALLAS (${String(fallas)})`)
  process.exit(fallas === 0 ? 0 : 1)
}
void main()
