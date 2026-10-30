/**
 * [L9b · 3] LAS RESEÑAS SE ASIENTAN Y UN GESTO LLEVA AL CTA — Chrome del sistema a la vista contra `BASE`, `/api/` bloqueado. Por caso:
 *
 *   1. llegar: la página un poco antes del asiento (`ASIENTO`, el aro armado) y UN gesto largo de la rueda hacia abajo (muescas seguidas,
 *      sin silencio): tiene que quedar asentada en el asiento (etapa `asentada`, ±0,05 pantallas) aunque el gesto siga empujando;
 *   2. ida: UNA muesca hacia abajo: el CTA armado (la transformación y su progreso en 1);
 *   3. vuelta: UNA muesca hacia arriba: otra vez asentada en las reseñas (transformación 0, guardado 0, pantalla en el asiento).
 *
 *   BASE=http://localhost:3003 CASOS=1440,1024,1440-gatillo npx tsx scripts-carga/l9b-resenas.ts
 *   CONTROL=apagado …   el gatillo apagado (el scroll libre de antes): tiene que FALLAR
 */
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3003'
const CASOS = (process.env.CASOS ?? '1440,1024,1440-gatillo').split(',')
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('l9b-resenas')
/** Las pantallas del pin del bloque (con el tramo) y el asiento (`LUGARES_DEL_GATILLO.asiento`). */
const PIN = 10
const ASIENTO = 4.5
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Estado {
  readonly transformacion: number
  readonly delCta: number
  readonly bajada: number
  readonly entrada: number
  readonly etapa: string
  readonly pantalla: number
}
type Banco = Window & {
  __resenasDelBanco?: () => { transformacion: number; delCta: number; disparoDeLaBajada: number; entrada: number }
  __gatilloHaciaElCtaDelBanco?: () => { etapa: string; pantalla: number }
}

const estado = (p: Page): Promise<Estado> =>
  p.evaluate(() => {
    const w = window as Banco
    const r = w.__resenasDelBanco?.()
    const g = w.__gatilloHaciaElCtaDelBanco?.()
    return { transformacion: r?.transformacion ?? -1, delCta: r?.delCta ?? -1, bajada: r?.disparoDeLaBajada ?? -1, entrada: r?.entrada ?? -1, etapa: g?.etapa ?? '-', pantalla: g?.pantalla ?? -1 }
  })
const texto = (e: Estado): string => `pantalla ${e.pantalla.toFixed(3)}, etapa ${e.etapa}, aro ${e.entrada.toFixed(2)}, transformación ${e.transformacion.toFixed(3)}, CTA ${e.delCta.toFixed(3)}, guardado ${e.bajada.toFixed(3)}`

async function irA(p: Page, pantalla: number): Promise<void> {
  await p.evaluate(([s, pin]) => {
    const bloque = document.querySelector('[data-pieza="escenario-del-final"]')?.parentElement
    if (!bloque) throw new Error('sin escenario del final')
    const tope = bloque.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: Math.round(tope + (s / pin) * (bloque.offsetHeight - window.innerHeight)), behavior: 'instant' })
  }, [pantalla, PIN])
  await dormir(1500)
}

async function main(): Promise<void> {
  let malas = 0
  let total = 0
  for (const caso of CASOS) {
    const ancho = Number(caso.split('-')[0])
    const gatillo = caso.endsWith('-gatillo')
    const alto = ancho >= 1440 ? 900 : 768
    const ctx = await chromium.launchPersistentContext(perfilDelBanco(`l9b-resenas-${caso}`), {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
    })
    const juzgar = (nombre: string, bien: boolean, e: Estado): void => {
      total += 1
      if (!bien) malas += 1
      console.log(`${bien ? '✓' : '✗'} ${caso} · ${nombre}: ${texto(e)}`)
    }
    try {
      await ctx.addInitScript(`(() => { window.__name = (f) => f; window.__entornoDeLaEscena = 'producto'; ${CONTROL === 'apagado' ? "window.__defectoDelGatilloHaciaElCta = 'apagado';" : ''} try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3${gatillo ? '?resenas=gatillo' : ''}`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(6000)
      const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
      if (!visible) console.log(`· ${caso} · ⚠ pestaña no visible: la medición no vale`)
      for (const s of [2.0, 3.0, ASIENTO - 0.5]) await irA(p, s)
      await dormir(3000)
      // 1 · Llegar: un gesto largo (muescas cada 60 ms, sin el silencio que separa los gestos) que empuja más allá del asiento.
      for (let i = 0; i < 25; i += 1) {
        await p.mouse.wheel(0, 100)
        await dormir(60)
      }
      await dormir(2500)
      const asentada = await estado(p)
      await p.screenshot({ path: path.join(SALIDA, `${caso}-1-asentada.png`) })
      juzgar('llegar con un gesto largo: asentada en las reseñas armadas', asentada.etapa === 'asentada' && Math.abs(asentada.pantalla - ASIENTO) < 0.05 && asentada.transformacion <= 0.001, asentada)
      // 2 · Ida: una muesca.
      await p.mouse.wheel(0, 100)
      await dormir(9000)
      const ida = await estado(p)
      await p.screenshot({ path: path.join(SALIDA, `${caso}-2-cta.png`) })
      juzgar('una muesca hacia abajo: el CTA armado', ida.transformacion >= 0.999 && ida.delCta >= 0.999 && ida.etapa === 'quieta', ida)
      // 3 · Vuelta: una muesca.
      await p.mouse.wheel(0, -100)
      await dormir(9000)
      const vuelta = await estado(p)
      await p.screenshot({ path: path.join(SALIDA, `${caso}-3-vuelta.png`) })
      juzgar('una muesca hacia arriba: asentada otra vez', vuelta.etapa === 'asentada' && Math.abs(vuelta.pantalla - ASIENTO) < 0.05 && vuelta.transformacion <= 0.001 && vuelta.bajada <= 0.001, vuelta)
    } finally {
      await ctx.close()
    }
  }
  const linea = `${String(total - malas)} de ${String(total)}`
  console.log(CONTROL === '' ? `${malas === 0 ? '✓' : '✗'} ${linea}` : `control ${CONTROL}: ${malas > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'} (${linea})`)
  if (CONTROL === '' && malas > 0) process.exitCode = 1
}

void main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
