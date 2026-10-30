/**
 * [L8b · 1] EL LATIDO DE LA ENTRADA, EN EL SITIO — Chrome del sistema a la vista contra `BASE`, `/api/` bloqueado. Por caso, cuántas veces
 * aparece la onda (`[data-pieza="latido-de-la-entrada"]`) en `OBSERVAR_MS` desde la carga, qué anima el botón del sonido (escala o
 * opacidad) y una foto en medio de la onda:
 *
 *   · `/v3` y `/v3/pagina-base` a 1440 sin preloader (la entrada del mismo día): una onda y el botón escala;
 *   · movimiento reducido: ninguna onda y el botón anima su opacidad;
 *   · con el preloader (`?preloader=si`): ninguna onda después (su latido fue el de la entrada);
 *   · un enlace de `/v3` a `/v3/pagina-base` (sin recarga): otra onda al llegar;
 *   · a 390: nada (el teléfono no cambia).
 *
 *   BASE=http://localhost:3002 npx tsx scripts-carga/l8b-latido.ts
 */
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('l8b-latido')
const OBSERVAR_MS = Number(process.env.OBSERVAR_MS ?? 12000)
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** En la página: cuenta las ondas que aparecen y guarda qué animó el botón. */
const MIRAR = `(() => {
  const w = window
  w.__latidos = { ondas: 0, animacionesDelBoton: [] }
  let habia = false
  const mirar = () => {
    const hay = document.querySelector('[data-pieza="latido-de-la-entrada"]') !== null
    if (hay && !habia) w.__latidos.ondas += 1
    habia = hay
    const b = document.querySelector('[data-pieza="control-del-sonido"]')
    if (b) for (const a of b.getAnimations()) {
      const k = a.effect && a.effect.getKeyframes ? a.effect.getKeyframes() : []
      const que = k.some((x) => x.transform) ? 'escala' : k.some((x) => x.opacity !== undefined) ? 'opacidad' : '?'
      if (!a.__visto) { a.__visto = true; w.__latidos.animacionesDelBoton.push(que) }
    }
    setTimeout(mirar, 30)
  }
  mirar()
})()`

interface Caso {
  readonly nombre: string
  readonly ruta: string
  readonly ancho: number
  readonly alto: number
  readonly reducido: boolean
  /** Cuántas ondas tienen que aparecer y qué tiene que animar el botón (`null`: nada). */
  readonly ondas: number
  readonly boton: 'escala' | 'opacidad' | null
  readonly enlace?: boolean
}

const CASOS: readonly Caso[] = [
  { nombre: 'home-1440', ruta: '/v3', ancho: 1440, alto: 900, reducido: false, ondas: 1, boton: 'escala' },
  { nombre: 'pagina-base-1440', ruta: '/v3/pagina-base', ancho: 1440, alto: 900, reducido: false, ondas: 1, boton: 'escala' },
  { nombre: 'home-1024', ruta: '/v3', ancho: 1024, alto: 768, reducido: false, ondas: 1, boton: 'escala' },
  { nombre: 'reducido-1440', ruta: '/v3', ancho: 1440, alto: 900, reducido: true, ondas: 0, boton: 'opacidad' },
  { nombre: 'con-preloader-1440', ruta: '/v3?preloader=si', ancho: 1440, alto: 900, reducido: false, ondas: 0, boton: null },
  { nombre: 'enlace-a-pagina-base-1440', ruta: '/v3', ancho: 1440, alto: 900, reducido: false, ondas: 2, boton: 'escala', enlace: true },
  { nombre: 'telefono-390', ruta: '/v3', ancho: 390, alto: 844, reducido: false, ondas: 0, boton: null },
]

async function fotoDeLaOnda(p: Page, nombre: string): Promise<boolean> {
  for (let i = 0; i < 300; i++) {
    if (await p.evaluate(() => document.querySelector('[data-pieza="latido-de-la-entrada"]') !== null)) {
      await dormir(Number(process.env.FOTO_MS ?? 260))
      await p.screenshot({ path: path.join(SALIDA, `${nombre}.png`) })
      return true
    }
    await dormir(20)
  }
  return false
}

async function main(): Promise<void> {
  let malas = 0
  for (const c of CASOS) {
    const ctx = await chromium.launchPersistentContext(perfilDelBanco(`l8b-latido-${c.nombre}`), {
      executablePath: CHROME,
      headless: false,
      viewport: { width: c.ancho, height: c.alto },
      deviceScaleFactor: 1,
      isMobile: false,
      reducedMotion: c.reducido ? 'reduce' : 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(c.ancho + 20)},${String(c.alto + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = (f) => f; window.__entornoDeLaEscena = 'producto'; ${c.ruta.includes('preloader=si') ? '' : "try { sessionStorage.setItem('home:intro', '1') } catch (e) {}"} })()`)
      await ctx.addInitScript(MIRAR)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}${c.ruta}`, { waitUntil: 'commit', timeout: 300000 })
      const foto = c.ondas > 0 ? await fotoDeLaOnda(p, c.nombre) : false
      if (c.enlace === true) {
        await dormir(4000)
        await p.evaluate(() => {
          const a = document.querySelector<HTMLAnchorElement>('a[href="/v3/pagina-base"]')
          if (!a) throw new Error('sin enlace a /v3/pagina-base')
          a.click()
        })
        await fotoDeLaOnda(p, `${c.nombre}-llegada`)
      }
      await dormir(OBSERVAR_MS)
      const visto = await p.evaluate(() => (window as Window & { __latidos?: { ondas: number; animacionesDelBoton: string[] } }).__latidos ?? { ondas: -1, animacionesDelBoton: [] })
      const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
      const boton = c.boton === null ? visto.animacionesDelBoton.length === 0 : visto.animacionesDelBoton.includes(c.boton) && visto.animacionesDelBoton.length === Math.max(1, c.ondas)
      const bien = visible && visto.ondas === c.ondas && boton && (c.ondas === 0 || foto)
      if (!bien) malas += 1
      console.log(`${bien ? '✓' : '✗'} ${c.nombre}: ${String(visto.ondas)} onda(s) (pedidas ${String(c.ondas)}), el botón animó [${visto.animacionesDelBoton.join(', ')}]${foto ? `, foto ${c.nombre}.png` : ''}${visible ? '' : ' ⚠ pestaña no visible'}`)
    } finally {
      await ctx.close()
    }
  }
  console.log(`${malas === 0 ? '✓' : '✗'} ${String(CASOS.length - malas)} de ${String(CASOS.length)}`)
  if (malas > 0) process.exitCode = 1
}

void main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
