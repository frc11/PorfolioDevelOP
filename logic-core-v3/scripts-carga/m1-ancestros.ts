/**
 * [M1] DE DÓNDE SALE EL ANCHO — a un ancho dado, toma el texto de una sección del home y el de cada sección del cuerpo de una página y
 * recorre sus ancestros hasta `<body>`, imprimiendo de cada uno su caja de contenido calculada (izquierda, ancho), su `max-width` y su
 * relleno lateral. Lo que diagnostica es el PRIMER ancestro cuyo ancho difiere entre el home y la página.
 *
 *   BASE=http://localhost:3003 ANCHO=1440 npx tsx scripts-carga/m1-ancestros.ts
 */
import { rmSync } from 'node:fs'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3003'
const ANCHO = Number(process.env.ANCHO ?? '1440')
const ALTO = 900
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** La cadena de ancestros de los textos que casan con `selector` (los `cuantos` primeros con ancho), de adentro hacia afuera. */
const cadenas = (p: Page, selector: string, cuantos: number): Promise<string[]> =>
  p.evaluate(
    ({ selector, cuantos }) => {
      const salida: string[] = []
      const nodos = [...document.querySelectorAll<HTMLElement>(selector)].filter((n) => n.getBoundingClientRect().width > 40).slice(0, cuantos)
      for (const n of nodos) {
        const filas: string[] = [`── ${selector} «${(n.textContent ?? '').trim().slice(0, 50)}»`]
        for (let el: HTMLElement | null = n; el !== null && el !== document.body; el = el.parentElement) {
          const cs = getComputedStyle(el)
          const r = el.getBoundingClientRect()
          const contenido = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth)
          const datos = [...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => `${a.name}=${a.value}`).slice(0, 3).join(' ')
          filas.push(`  ${el.tagName.toLowerCase()} ${datos} · izq ${String(Math.round(r.left))} · contenido ${String(Math.round(contenido))} · max-width ${cs.maxWidth} · pad ${cs.paddingLeft}/${cs.paddingRight} · ${(el.getAttribute('class') ?? '').slice(0, 110)}`)
        }
        salida.push(filas.join('\n'))
      }
      return salida
    },
    { selector, cuantos },
  )

async function main(): Promise<void> {
  const perfil = perfilDelBanco('m1-ancestros')
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
    const casos: readonly (readonly [string, string, number])[] = [
      ['', 'main section h2, main section p', 4],
      ['nosotros', '[data-seccion-de-pagina] h2, [data-seccion-de-pagina] p', 5],
      ['portfolio', '[data-seccion-de-pagina] h2, [data-seccion-de-pagina] p', 3],
    ]
    for (const [ruta, selector, cuantos] of casos) {
      await p.goto(`${BASE}/v3${ruta === '' ? '' : `/${ruta}`}`, { waitUntil: 'load', timeout: 300000 })
      await dormir(6000)
      const v = await p.evaluate(() => `innerWidth ${String(innerWidth)} · ${document.visibilityState} · --container-tope ${getComputedStyle(document.documentElement).getPropertyValue('--container-tope')} · --container-dominante ${getComputedStyle(document.documentElement).getPropertyValue('--container-dominante')}`)
      console.log(`\n═══ /v3/${ruta} · ${v}`)
      for (const c of await cadenas(p, selector, cuantos)) console.log(c)
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
