/**
 * [M1] QUIÉN DESBORDA — a un ancho dado, recorre cada página de arriba abajo y anota los elementos cuyo borde derecho pasa el del
 * documento (los más afuera de cada uno, sin sus hijos), con su ancestro marcado más cercano (`data-*`).
 *
 *   BASE=http://localhost:3003 ANCHO=390 RUTAS=portfolio,blog npx tsx scripts-carga/m1-desborde.ts
 */
import { rmSync } from 'node:fs'

import { chromium } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3003'
const ANCHO = Number(process.env.ANCHO ?? '390')
const ALTO = 844
const RUTAS = (process.env.RUTAS ?? 'portfolio').split(',')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  const perfil = perfilDelBanco('m1-desborde')
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    args: [`--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
  })
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    for (const ruta of RUTAS) {
      await p.goto(`${BASE}/v3/${ruta}`, { waitUntil: 'load', timeout: 300000 })
      await dormir(5000)
      const fondo = await p.evaluate(() => document.documentElement.offsetHeight)
      const vistos = new Map<string, number>()
      for (let y = 0; y < fondo; y += ALTO / 2) {
        await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
        await dormir(250)
        const filas = await p.evaluate(() => {
          const limite = document.documentElement.clientWidth
          const salida: [string, number][] = []
          for (const el of document.querySelectorAll<HTMLElement>('main *')) {
            const r = el.getBoundingClientRect()
            if (r.right <= limite + 0.5 || r.width === 0) continue
            const padre = el.parentElement?.getBoundingClientRect()
            if (padre !== undefined && padre.right > limite + 0.5) continue
            let marcado: HTMLElement | null = el
            while (marcado !== null && ![...marcado.attributes].some((a) => a.name.startsWith('data-'))) marcado = marcado.parentElement
            const datos = marcado === null ? '' : [...marcado.attributes].filter((a) => a.name.startsWith('data-')).map((a) => `${a.name}=${a.value}`).slice(0, 2).join(' ')
            salida.push([`${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').slice(0, 70)} ← ${datos}`, Math.round(r.right - limite)])
          }
          return { filas: salida, desborde: document.documentElement.scrollWidth - limite }
        })
        for (const [k, v] of filas.filas) vistos.set(k, Math.max(v, vistos.get(k) ?? 0))
      }
      const total = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      console.log(`\n═══ /v3/${ruta} · ${String(ANCHO)} · desborde del documento ${String(total)} px`)
      for (const [k, v] of [...vistos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  +${String(v)} px · ${k}`)
    }
  } finally {
    await ctx.close()
    rmSync(perfil, { recursive: true, force: true })
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
