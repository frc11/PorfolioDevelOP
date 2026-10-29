/**
 * [L8b · 3] RESEÑAS → CTA CON UNA MUESCA — Chrome del sistema a la vista contra `BASE`, `/api/` bloqueado. Por ancho: la página quieta al fin
 * de la lectura de las reseñas, UNA muesca de la rueda hacia abajo y nada más: cada 100 ms, la transformación al CTA (`__resenasDelBanco`)
 * y la etapa del gatillo; tiene que terminar con el CTA armado (la transformación y su progreso con la espera en 1). Después UNA muesca hacia
 * arriba: tiene que terminar con la transformación en 0, el guardado vuelto (0) y la página en el fin de la lectura. Fotos al final de cada
 * sentido.
 *
 *   BASE=http://localhost:3002 ANCHOS=1440,1024 npx tsx scripts-carga/l8b-resenas.ts
 *   CONTROL=apagado …   el gatillo apagado (el paso de antes, que sigue al scroll): las dos tienen que FALLAR
 */
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('l8b-resenas')
/** Las pantallas del pin del bloque (con el tramo) y el fin de la lectura (`LUGARES_DEL_GATILLO.lectura`). */
const PIN = 10
const LECTURA = 6
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Muestra {
  readonly t: number
  readonly transformacion: number
  readonly delCta: number
  readonly bajada: number
  readonly etapa: string
  readonly pantalla: number
}
type Banco = Window & {
  __resenasDelBanco?: () => { transformacion: number; delCta: number; disparoDeLaBajada: number }
  __gatilloHaciaElCtaDelBanco?: () => { etapa: string; pantalla: number }
}

const muestra = (p: Page, t0: number): Promise<Muestra> =>
  p.evaluate((t) => {
    const w = window as Banco
    const r = w.__resenasDelBanco?.()
    const g = w.__gatilloHaciaElCtaDelBanco?.()
    const bloque = document.querySelector('[data-pieza="escenario-del-final"]')?.parentElement
    const pantalla = bloque ? ((window.scrollY - (bloque.getBoundingClientRect().top + window.scrollY)) / (bloque.offsetHeight - window.innerHeight)) * 10 : -1
    return { t: Date.now() - t, transformacion: r?.transformacion ?? -1, delCta: r?.delCta ?? -1, bajada: r?.disparoDeLaBajada ?? -1, etapa: g?.etapa ?? '-', pantalla }
  }, t0)

async function grabar(p: Page, ms: number): Promise<Muestra[]> {
  const t0 = Date.now()
  const todas: Muestra[] = []
  while (Date.now() - t0 < ms) {
    todas.push(await muestra(p, t0))
    await dormir(100)
  }
  return todas
}

async function main(): Promise<void> {
  let malas = 0
  for (const ancho of ANCHOS) {
    const alto = ancho >= 1440 ? 900 : 768
    const ctx = await chromium.launchPersistentContext(perfilDelBanco(`l8b-resenas-${String(ancho)}`), {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = (f) => f; window.__entornoDeLaEscena = 'producto'; ${CONTROL === 'apagado' ? "window.__defectoDelGatilloHaciaElCta = 'apagado';" : ''} try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(6000)
      // Al fin de la lectura, de a pasos (la escena y el tramo se arman con el scroll que pasa).
      for (const s of [LECTURA - 1.5, LECTURA - 0.6, LECTURA - 0.05]) {
        await p.evaluate(([pantalla, pin]) => {
          const bloque = document.querySelector('[data-pieza="escenario-del-final"]')?.parentElement
          if (!bloque) throw new Error('sin escenario del final')
          const tope = bloque.getBoundingClientRect().top + window.scrollY
          window.scrollTo({ top: Math.round(tope + (pantalla / pin) * (bloque.offsetHeight - window.innerHeight)), behavior: 'instant' })
        }, [s, PIN])
        await dormir(1500)
      }
      await dormir(2000)
      const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
      if (!visible) console.log(`· ${String(ancho)} · ⚠ pestaña no visible: la medición no vale`)
      for (const sentido of [1, -1] as const) {
        const inicio = await muestra(p, Date.now())
        await p.mouse.wheel(0, 100 * sentido)
        const muestras = await grabar(p, 11000)
        const fin = muestras[muestras.length - 1]
        const etapas = [...new Set(muestras.map((m) => m.etapa))].join(' → ')
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${sentido > 0 ? 'ida' : 'vuelta'}.png`) })
        const bien = fin !== undefined && (sentido > 0 ? fin.transformacion >= 0.999 && fin.delCta >= 0.999 : fin.transformacion <= 0.001 && fin.bajada <= 0.001 && Math.abs(fin.pantalla - LECTURA) < 0.05) && fin.etapa !== 'al-cta' && fin.etapa !== 'de-vuelta'
        if (!bien) malas += 1
        const tLlega = muestras.find((m) => (sentido > 0 ? m.delCta >= 0.999 : m.bajada <= 0.001 && m.transformacion <= 0.001 && m.t > 300))?.t
        console.log(`${bien ? '✓' : '✗'} ${String(ancho)} · una muesca ${sentido > 0 ? 'hacia abajo' : 'hacia arriba'}: desde pantalla ${inicio.pantalla.toFixed(3)} (transformación ${inicio.transformacion.toFixed(3)}) → pantalla ${fin?.pantalla.toFixed(3) ?? '?'}, transformación ${fin?.transformacion.toFixed(3) ?? '?'}, CTA ${fin?.delCta.toFixed(3) ?? '?'}, guardado ${fin?.bajada.toFixed(3) ?? '?'}; etapas ${etapas}; llegó a los ${tLlega === undefined ? '—' : `${String(tLlega)} ms`}`)
      }
    } finally {
      await ctx.close()
    }
  }
  console.log(`${malas === 0 ? '✓' : '✗'} ${String(ANCHOS.length * 2 - malas)} de ${String(ANCHOS.length * 2)}`)
  if (malas > 0) process.exitCode = 1
}

void main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
