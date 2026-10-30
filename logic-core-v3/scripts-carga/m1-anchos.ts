/**
 * [M1] EL ANCHO DE LAS PÁGINAS, EN EL NAVEGADOR — fotos del home y de cada página que existe en uno o más anchos, en lugares fijos del
 * documento (el tope y cada sección del cuerpo, hasta `SECCIONES`), y la caja de lo que ocupa cada sección (de dónde a dónde llega su
 * contenido visible, en fracción del ancho). Chrome del sistema a la vista, `/api/` bloqueado (el método de `l7-int-humo.ts`).
 *
 *   BASE=http://localhost:3003 ANCHOS=1440x900,2560x1440 npx tsx scripts-carga/m1-anchos.ts
 */
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3003'
const RUTAS = (process.env.RUTAS ?? 'nosotros,portfolio,blog,blog/cuanto-cuesta-una-pagina-web-en-argentina,paginas-web,software-a-medida,ia-y-automatizaciones,privacidad,terminos,no-existe').split(',')
const ANCHOS = (process.env.ANCHOS ?? '1440x900').split(',').map((a) => a.split('x').map(Number) as [number, number])
const SECCIONES = Number(process.env.SECCIONES ?? '6')
const FOTOS = process.env.FOTOS ?? 'C:\\nocturno\\cola3-fotos\\M1\\anchos'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** De dónde a dónde llega lo que se ve de cada sección del cuerpo (los textos, las fotos y los videos), en fracción del ancho. */
const cajas = (p: Page): Promise<string[]> =>
  p.evaluate(() => {
    const secciones = [...document.querySelectorAll<HTMLElement>('[data-seccion-de-pagina], main > section, [data-pagina-legal] section')]
    return secciones.slice(0, 12).map((s) => {
      let izq = Infinity
      let der = -Infinity
      for (const el of s.querySelectorAll<HTMLElement>('h1,h2,h3,p,li,img,video,figure,blockquote,a')) {
        const r = el.getBoundingClientRect()
        if (r.width < 1 || r.height < 1) continue
        izq = Math.min(izq, r.left)
        der = Math.max(der, r.right)
      }
      const nombre = s.getAttribute('data-seccion-de-pagina') ?? s.getAttribute('aria-label') ?? s.tagName.toLowerCase()
      return Number.isFinite(izq) ? `${nombre} ${(izq / innerWidth).toFixed(2)}…${(der / innerWidth).toFixed(2)}` : `${nombre} —`
    })
  })

async function unaRuta(p: Page, ruta: string, ancho: number, alto: number): Promise<void> {
  const carpeta = path.join(FOTOS, ruta === '' ? 'home' : ruta.replace(/\//g, '_'))
  mkdirSync(carpeta, { recursive: true })
  await p.goto(`${BASE}/v3${ruta === '' ? '' : `/${ruta}`}`, { waitUntil: 'load', timeout: 300000 })
  await p.mouse.move(ancho / 2, alto / 2)
  await dormir(5000)
  const tops = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-seccion-de-pagina], [data-pagina-legal] section, main > section')].map((s) => s.getBoundingClientRect().top + scrollY))
  const lugares = [0, ...tops.slice(0, SECCIONES)]
  for (const [k, y] of lugares.entries()) {
    await p.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), Math.max(0, y - 40))
    await dormir(1300)
    await p.screenshot({ path: path.join(carpeta, `${String(ancho)}-${String(k)}.png`) })
  }
  const vis = await p.evaluate(() => ({ visible: document.visibilityState, ancho: innerWidth }))
  console.log(`${ruta === '' ? 'home' : ruta} · ${String(ancho)} (innerWidth ${String(vis.ancho)}, ${vis.visible}) · ${(await cajas(p)).join(' | ')}`)
}

async function main(): Promise<void> {
  for (const [ancho, alto] of ANCHOS) {
    const perfil = perfilDelBanco('m1-anchos')
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      args: [`--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      for (const ruta of RUTAS) await unaRuta(p, ruta === 'home' ? '' : ruta, ancho, alto).catch((e: unknown) => console.log(`FALLA ${ruta} · ${String(ancho)} · ${String(e).slice(0, 200)}`))
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
    }
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
