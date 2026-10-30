/**
 * [L9b · 1] EL LATIDO DE LA ENTRADA: MÁS LENTO, UNA VEZ, CON LA PÁGINA LISTA — Chrome del sistema a la vista contra `BASE`, `/api/`
 * bloqueado. Por caso, en `OBSERVAR_MS` desde la carga: cuántas veces aparece la onda (`[data-pieza="latido-de-la-entrada"]`), cuántas
 * veces el botón del sonido animó su escala, cuánto dura la animación de la onda, y si la primera onda llegó con la página lista (el velo
 * de la carga ya ido y el documento cargado):
 *
 *   · `/v3` y `/v3/pagina-base` a 1440: una onda de 2,5 s, después de la página lista;
 *   · `/v3` con una carga LENTA (las fuentes 5 s y cada trozo de JS 0,6 s más tarde): igual, una sola, después de la página lista;
 *   · un enlace de `/v3` a `/v3/pagina-base`: una onda por entrada (dos);
 *   · con el preloader (`?preloader=si`): ninguna de la entrada (el preloader late lo suyo).
 *
 *   BASE=http://localhost:3003 BANCO_FOTOS=C:\nocturno\cola3-fotos\L9b npx tsx scripts-carga/l9b-latido.ts
 */
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3003'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('l9b-latido')
const OBSERVAR_MS = Number(process.env.OBSERVAR_MS ?? 16000)
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** En la página: las ondas, los latidos del botón, la duración de la onda y cuándo la página quedó lista. */
const MIRAR = `(() => {
  const w = window
  w.__latidos = { ondas: 0, escalas: 0, duraciones: [], primeraOnda: null, lista: null }
  let habia = false
  const mirar = () => {
    const capa = document.querySelector('[data-pieza="latido-de-la-entrada"]')
    const ahora = performance.now()
    if (w.__latidos.lista === null && document.readyState === 'complete' && !document.querySelector('[data-pieza="velo-de-carga"]')) w.__latidos.lista = ahora
    if (capa && !habia) {
      w.__latidos.ondas += 1
      if (w.__latidos.primeraOnda === null) w.__latidos.primeraOnda = ahora
      // Lo que dura el viaje de la onda: hasta el primer cuadro clave después del arranque (la de antes llegaba en 1250 de un período de 2800).
      for (const el of capa.querySelectorAll('[data-parte="onda-de-la-entrada"]')) for (const a of el.getAnimations()) {
        const fin = a.effect.getKeyframes().find((k) => k.computedOffset > 0)
        w.__latidos.duraciones.push(Math.round(a.effect.getTiming().duration * (fin ? fin.computedOffset : 1)))
      }
    }
    habia = capa !== null
    const b = document.querySelector('[data-pieza="control-del-sonido"]')
    if (b) for (const a of b.getAnimations()) {
      const k = a.effect && a.effect.getKeyframes ? a.effect.getKeyframes() : []
      if (!a.__visto && k.some((x) => x.transform)) { a.__visto = true; w.__latidos.escalas += 1 }
    }
    setTimeout(mirar, 20)
  }
  mirar()
})()`

interface Caso {
  readonly nombre: string
  readonly ruta: string
  readonly ondas: number
  readonly lenta?: boolean
  readonly enlace?: boolean
}

const CASOS: readonly Caso[] = [
  { nombre: 'home-1440', ruta: '/v3', ondas: 1 },
  { nombre: 'home-lenta-1440', ruta: '/v3', ondas: 1, lenta: true },
  { nombre: 'pagina-base-1440', ruta: '/v3/pagina-base', ondas: 1 },
  { nombre: 'enlace-1440', ruta: '/v3', ondas: 2, enlace: true },
  { nombre: 'con-preloader-1440', ruta: '/v3?preloader=si', ondas: 0 },
]

interface Visto {
  readonly ondas: number
  readonly escalas: number
  readonly duraciones: number[]
  readonly primeraOnda: number | null
  readonly lista: number | null
}

async function fotoEnLaOnda(p: Page, nombre: string): Promise<void> {
  for (let i = 0; i < 1500; i++) {
    if (await p.evaluate(() => document.querySelector('[data-pieza="latido-de-la-entrada"]') !== null)) {
      await dormir(900)
      await p.screenshot({ path: path.join(SALIDA, `${nombre}.png`) })
      return
    }
    await dormir(20)
  }
}

async function main(): Promise<void> {
  let malas = 0
  for (const c of CASOS) {
    const [ancho, alto] = [1440, 900]
    const ctx = await chromium.launchPersistentContext(perfilDelBanco(`l9b-latido-${c.nombre}`), {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = (f) => f; window.__entornoDeLaEscena = 'producto'; ${c.ruta.includes('preloader=si') ? '' : "try { sessionStorage.setItem('home:intro', '1') } catch (e) {}"} })()`)
      await ctx.addInitScript(MIRAR)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      if (c.lenta === true) {
        await p.route('**/*.woff2', async (r) => {
          await dormir(5000)
          await r.continue()
        })
        await p.route('**/_next/static/chunks/**', async (r) => {
          await dormir(600)
          await r.continue()
        })
      }
      await p.goto(`${BASE}${c.ruta}`, { waitUntil: 'commit', timeout: 300000 })
      if (c.ondas > 0) await fotoEnLaOnda(p, c.nombre)
      if (c.enlace === true) {
        await dormir(5000)
        await p.evaluate(() => {
          const a = document.querySelector<HTMLAnchorElement>('a[href="/v3/pagina-base"]')
          if (!a) throw new Error('sin enlace a /v3/pagina-base')
          a.click()
        })
      }
      await dormir(OBSERVAR_MS)
      const v = await p.evaluate(() => (window as Window & { __latidos?: Visto }).__latidos ?? null)
      const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
      if (v === null) throw new Error('sin __latidos')
      const lenta = v.duraciones.length === 0 || v.duraciones.every((d) => d >= 2400)
      const conLaPagina = v.primeraOnda === null || (v.lista !== null && v.primeraOnda >= v.lista)
      const bien = visible && v.ondas === c.ondas && v.escalas === c.ondas && lenta && conLaPagina
      if (!bien) malas += 1
      console.log(`${bien ? '✓' : '✗'} ${c.nombre}: ${String(v.ondas)} onda(s) y ${String(v.escalas)} latido(s) del botón (pedidos ${String(c.ondas)}); la onda dura ${[...new Set(v.duraciones)].join('/') || '—'} ms; página lista a los ${v.lista === null ? '—' : v.lista.toFixed(0)} ms, primera onda a los ${v.primeraOnda === null ? '—' : v.primeraOnda.toFixed(0)} ms${visible ? '' : ' ⚠ pestaña no visible'}`)
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
