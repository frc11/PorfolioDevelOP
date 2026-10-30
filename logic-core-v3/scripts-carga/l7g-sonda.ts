/**
 * [L7g] SONDA DE DESBORDE: qué elementos pasan del ancho de la ventana en una página de /v3, a un ancho dado.
 *
 *   RUTA=portfolio ANCHO=390 npx tsx scripts-carga/l7g-sonda.ts
 */
import { rmSync } from 'node:fs'

import { chromium } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const RUTA = process.env.RUTA ?? 'portfolio'
const ANCHO = Number(process.env.ANCHO ?? '390')
const ALTO = Number(process.env.ALTO ?? '844')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function main(): Promise<void> {
  const perfil = perfilDelBanco('l7g-sonda')
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 1,
    args: ['--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
  })
  try {
    await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    await p.goto(`${BASE}/v3/${RUTA}`, { waitUntil: 'load', timeout: 300000 })
    await dormir(6000)
    console.log('innerWidth', await p.evaluate(() => innerWidth))
    const fondo = await p.evaluate(() => document.documentElement.offsetHeight - innerHeight)
    const vistos = new Map<string, string>()
    for (let y = 0; y <= fondo + ALTO / 3; y += ALTO / 3) {
      await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Math.min(y, fondo))
      await dormir(500)
      const filas = await p.evaluate(() => {
        const ancho = document.documentElement.clientWidth
        const salida: string[] = []
        for (const el of document.querySelectorAll<HTMLElement>('body *')) {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          if (r.right <= ancho + 1 && r.left >= -1) continue
          const e = getComputedStyle(el)
          if (e.visibility === 'hidden' || e.display === 'none') continue
          // Lo que recorta un ancestro (un carrusel, un `overflow: hidden`) que cabe en la ventana no desborda la página.
          let recortado = false
          for (let a = el.parentElement; a !== null && a !== document.body && a !== document.documentElement; a = a.parentElement) {
            const ox = getComputedStyle(a).overflowX
            const ra = a.getBoundingClientRect()
            if (ox !== 'visible' && ra.right <= ancho + 1 && ra.left >= -1) { recortado = true; break }
          }
          if (recortado) continue
          const nombre = `${el.tagName.toLowerCase()}${el.id === '' ? '' : `#${el.id}`}${typeof el.className === 'string' && el.className !== '' ? `.${el.className.split(/\s+/).slice(0, 3).join('.')}` : ''}`
          salida.push(`${nombre} «${(el.textContent ?? "").trim().slice(0, 40)}» · ${Math.round(r.left)}…${Math.round(r.right)} (ancho ${Math.round(r.width)}) · pos ${e.position}`)
        }
        return salida
      })
      const sw = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (sw > 0) console.log(`desborde ${String(sw)} px con scroll ${String(Math.round(y))}`)
      for (const f of filas) if (!vistos.has(f)) vistos.set(f, `scroll ${String(Math.round(y))} (desborde ${String(sw)})`)
    }
    const punto = process.env.PUNTO
    if (punto !== undefined) {
      await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Number(punto))
      await dormir(1500)
      await p.screenshot({ path: process.env.FOTO ?? 'sonda.png' })
      console.log(await p.evaluate(() => {
        const el = [...document.querySelectorAll('a')].find((a) => /hablanos/i.test(a.textContent ?? ''))
        if (el === undefined) return 'sin enlace HABLANOS'
        const filas: string[] = []
        for (let a: Element | null = el; a !== null && a !== document.body; a = a.parentElement) {
          const e = getComputedStyle(a)
          const r = a.getBoundingClientRect()
          filas.push(`${a.tagName.toLowerCase()}.${typeof a.className === 'string' ? a.className.split(/\s+/).slice(0, 2).join('.') : ''} · ${Math.round(r.left)}…${Math.round(r.right)} · transform ${e.transform} · translate ${e.translate} · fs ${e.fontSize}`)
        }
        return filas.join(' ¦ ')
      }))
    }
    console.log('scrollWidth', await p.evaluate(() => `${String(document.documentElement.scrollWidth)} / client ${String(document.documentElement.clientWidth)}`))
    for (const [f, d] of [...vistos].slice(0, 40)) console.log(`${d} · ${f}`)
  } finally {
    await ctx.close()
    rmSync(perfil, { recursive: true, force: true })
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
