/**
 * [B12a.8] LA INTRO DE 2,5 PANTALLAS, EN EL SITIO — `/v3/pagina-base` con el Chrome del sistema a la vista, el banco de la escena
 * (`__entornoDeLaEscena`: `__avanceDeLaIntro` y `__titulosDelBanco`) y `/api/` bloqueado. Baja la intro de a pasos (2 % del avance) y en
 * cada uno lee el avance, el `h1` del DOM, los títulos en volumen (su llegada y su caja en el cuadro), «de qué se trata» y el tope del papel.
 *
 *   ANCHOS=1440x900,390x844 npx tsx scripts-carga/intro-larga.ts          (CONTROL=caida-tarde: el título cae con el `h1` ya subiendo)
 *
 * El criterio: el avance da 0, 0,5 y 1 a 0, 1,25 y 2,5 pantallas (± 1 %); el orden es el título con su bajada (el `h1` fijo), después «de
 * qué se trata» a la vista sobre la escena (en el avance 0,5, con el papel todavía abajo) y el papel entero en el avance 1; y el título en
 * volumen cae ANTES de que el `h1` se suelte: mientras se ve (llegada > 0,05) su caja nunca sube más de 2 px.
 */
import { mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,390x844').split(',').map((a) => a.split('x').map(Number) as [number, number])
const PANTALLAS = Number(process.env.PANTALLAS ?? '2.5')
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/intro-larga')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Paso {
  readonly f: number
  readonly avance: number
  readonly h1: number
  readonly llegada: number | null
  readonly titulo: number | null
  readonly deQueSeTrata: { readonly arriba: number; readonly abajo: number } | null
  readonly papel: number
}

const leer = (p: Page, f: number): Promise<Paso> =>
  p.evaluate((f) => {
    type Titulo = { id: string; llegada: number; enElCuadro: { arriba: number } }
    const w = window as unknown as { __avanceDeLaIntro?: () => number; __titulosDelBanco?: { titulos: () => Titulo[] } }
    const h1 = document.querySelector('[data-intro-de-pagina] h1')?.getBoundingClientRect().top ?? Number.NaN
    const t = (w.__titulosDelBanco?.titulos() ?? []).find((x) => x.id.endsWith('-1') && x.id.startsWith('pagina-'))
    const d = document.querySelector('[data-intro-de-pagina] [data-parte="de-que-se-trata"] p:last-of-type')?.getBoundingClientRect()
    const papel = document.querySelector('[data-intro-de-pagina]')?.nextElementSibling?.getBoundingClientRect().top ?? Number.NaN
    return { f, avance: w.__avanceDeLaIntro?.() ?? Number.NaN, h1, llegada: t?.llegada ?? null, titulo: t?.enElCuadro.arriba ?? null, deQueSeTrata: d === undefined ? null : { arriba: d.top, abajo: d.bottom }, papel }
  }, f)

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  let malas = 0
  for (const [ancho, alto] of ANCHOS) {
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/intro-larga-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const movil = ancho < 1024
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      isMobile: movil,
      hasTouch: movil,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__defectosDeLaIntro = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3/pagina-base`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      // La escena y el título armados (o, abajo de 1024, el h1 del DOM).
      const t0 = Date.now()
      while (Date.now() - t0 < 60000) {
        const listo = await p.evaluate(() => {
          const w = window as unknown as { __titulosDelBanco?: { titulos: () => { id: string; llegada: number }[] }; __avanceDeLaIntro?: () => number }
          if (typeof w.__avanceDeLaIntro !== 'function') return false
          if (window.innerWidth < 1024) return true
          return (w.__titulosDelBanco?.titulos() ?? []).some((t) => t.id.startsWith('pagina-') && t.llegada > 0.99)
        })
        if (listo) break
        await dormir(300)
      }
      await dormir(2500)
      const arriba = await p.evaluate(() => {
        const b = document.querySelector('[data-intro-de-pagina]')
        return b === null ? 0 : b.getBoundingClientRect().top + scrollY
      })
      const pasos: Paso[] = []
      for (let i = 0; i <= 50; i += 1) {
        const f = i / 50
        await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), arriba + f * PANTALLAS * alto)
        await dormir(i % 5 === 0 ? 900 : 260)
        pasos.push(await leer(p, f))
        if (i % 25 === 0) await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-avance-${f.toFixed(2)}${CONTROL === '' ? '' : `-${CONTROL}`}.png`) })
      }
      const en = (f: number): Paso | undefined => pasos.find((x) => Math.abs(x.f - f) < 1e-6)
      const avanceBien = [0, 0.5, 1].every((f) => Math.abs((en(f)?.avance ?? Number.NaN) - f) <= 0.01)
      const h10 = pasos[0]?.h1 ?? Number.NaN
      const suelta = pasos.find((x) => x.h1 < h10 - 1)
      const medio = en(0.5)
      const deQueBien = medio?.deQueSeTrata !== null && medio !== undefined && medio.deQueSeTrata.arriba >= 0 && medio.deQueSeTrata.abajo <= alto && medio.papel > alto && medio.h1 < 0
      const papelBien = (en(1)?.papel ?? Number.NaN) <= 0.5
      // El título en volumen (desde 1024): cae antes de soltarse y, mientras se ve, nunca sube.
      let caidaBien = true
      let cae: Paso | undefined
      let sube = 0
      if (!movil) {
        cae = pasos.find((x) => x.llegada !== null && x.llegada < 0.99)
        caidaBien = cae !== undefined && suelta !== undefined && cae.f < suelta.f
        const visibles = pasos.filter((x) => x.llegada !== null && x.llegada > 0.05 && x.titulo !== null)
        const t0v = visibles[0]?.titulo ?? Number.NaN
        sube = Math.max(0, ...visibles.map((x) => t0v - (x.titulo ?? t0v)))
        caidaBien = caidaBien && sube <= 2
      }
      const bien = avanceBien && deQueBien && papelBien && caidaBien
      if (!bien) malas += 1
      console.log(
        `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)} · avance ${[0, 0.5, 1].map((f) => `${f.toFixed(1)}→${(en(f)?.avance ?? Number.NaN).toFixed(4)}`).join(', ')}` +
          ` · el h1 se suelta en ${suelta === undefined ? '—' : suelta.f.toFixed(2)}` +
          (movil ? ' (abajo de 1024, el h1 del DOM)' : ` · el título cae en ${cae === undefined ? '—' : cae.f.toFixed(2)} y sube ${sube.toFixed(1)} px a la vista`) +
          ` · avance 0,5: «de qué se trata» ${medio?.deQueSeTrata === null || medio === undefined ? 'no está' : `de ${medio.deQueSeTrata.arriba.toFixed(0)} a ${medio.deQueSeTrata.abajo.toFixed(0)} px`}, el papel en ${(medio?.papel ?? Number.NaN).toFixed(0)} px · avance 1: el papel en ${(en(1)?.papel ?? Number.NaN).toFixed(1)} px`,
      )
    } finally {
      await ctx.close()
    }
  }
  console.log(`intro-larga: ${String(ANCHOS.length - malas)} de ${String(ANCHOS.length)} anchos dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL})`}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
