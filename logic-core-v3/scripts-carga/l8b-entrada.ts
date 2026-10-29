/**
 * [L8b · 2] LA ENTRADA DE «NUESTROS SERVICIOS», MEDIDA — Chrome del sistema contra `BASE`, `/api/` bloqueado. Por ancho: la letra y la caja
 * del título, la caja del aro (el lugar de la órbita), la bajada y el aviso, en reposo en la entrada; una foto. Con `ANTES=<archivo.json>`
 * compara: el aro, la bajada y el aviso tienen que quedar donde estaban (±2 px); el título, en un renglón, ≥ 1,2× la letra de antes, con su
 * pie a ≤ 24 px del tope de la bajada y adentro del contenedor (escritorio). Abajo de 1024 todo igual (±1 px).
 *
 *   BASE=http://localhost:3004 SALIDA_JSON=antes.json npx tsx scripts-carga/l8b-entrada.ts
 *   BASE=http://localhost:3002 ANTES=antes.json npx tsx scripts-carga/l8b-entrada.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { chromium } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const TAMANOS = (process.env.TAMANOS ?? '1440x900,1366x768,1280x800,1024x768,768x1024,390x844').split(',').map((t) => t.split('x').map(Number) as [number, number])
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('l8b-entrada')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Caja {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
}
interface Medida {
  readonly letra: number
  readonly renglones: number
  readonly titulo: Caja
  readonly aro: Caja
  readonly bajada: Caja
  readonly aviso: Caja
  readonly contenedor: Caja
}

async function main(): Promise<void> {
  const antes = process.env.ANTES === undefined ? null : (JSON.parse(readFileSync(process.env.ANTES, 'utf8')) as Record<string, Medida>)
  const todas: Record<string, Medida> = {}
  let malas = 0
  const ctx = await chromium.launchPersistentContext(perfilDelBanco('l8b-entrada'), { executablePath: CHROME, headless: false, viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'] })
  try {
    await ctx.addInitScript(`(() => { window.__name = (f) => f; window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    await p.route('**/api/**', (r) => r.abort())
    for (const [ancho, alto] of TAMANOS) {
      await p.setViewportSize({ width: ancho, height: alto })
      await p.goto(`${BASE}/v3#servicios`, { waitUntil: 'load', timeout: 300000 })
      await dormir(6000)
      // En la entrada, quieta: el tope de la pista (escritorio) o la entrada a la vista (teléfono).
      await p.evaluate(() => {
        const el = document.querySelector<HTMLElement>('[data-pieza="entrada-de-servicios"]')
        const pista = document.querySelector<HTMLElement>('[data-pieza="pista-de-servicios"]')
        const y = window.innerWidth >= 1024 && pista ? pista.getBoundingClientRect().top + window.scrollY + 40 : (el?.getBoundingClientRect().top ?? 0) + window.scrollY - 40
        window.scrollTo({ top: y, behavior: 'instant' })
      })
      await dormir(3500)
      const m = await p.evaluate((): Medida => {
        const caja = (el: Element | null): Caja => {
          const r = el?.getBoundingClientRect() ?? new DOMRect()
          return { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }
        }
        const entrada = document.querySelector<HTMLElement>('[data-pieza="entrada-de-servicios"]')
        const h2 = entrada?.querySelector<HTMLElement>('[data-pieza="titulo-que-se-pinta"]') ?? null
        const tops = new Set([...(h2?.querySelectorAll<HTMLElement>('[data-palabra]') ?? [])].map((w) => Math.round(w.getBoundingClientRect().top)))
        const bajada = entrada?.querySelector('p span') ?? null
        const aviso = [...(entrada?.querySelectorAll<HTMLElement>('[data-pieza="aviso-de-scroll"]') ?? [])].find((a) => a.getClientRects().length > 0) ?? null
        return {
          letra: Number.parseFloat(h2 ? getComputedStyle(h2).fontSize : '0'),
          renglones: tops.size,
          titulo: caja(h2),
          aro: caja(entrada?.querySelector('[data-lugar-de-los-nanobots="0"]') ?? null),
          bajada: caja(bajada),
          aviso: caja(aviso),
          contenedor: caja(entrada?.firstElementChild ?? null),
        }
      })
      const id = `${String(ancho)}x${String(alto)}`
      todas[id] = m
      await p.screenshot({ path: path.join(SALIDA, `entrada-${id}.png`) })
      const pie = m.titulo.y + m.titulo.h
      console.log(`${id}: letra ${m.letra.toFixed(1)} px, ${String(m.renglones)} renglón(es), título ${JSON.stringify(m.titulo)} (pie ${pie.toFixed(1)}), aro ${JSON.stringify(m.aro)}, bajada ${JSON.stringify(m.bajada)}, aviso ${JSON.stringify(m.aviso)}, contenedor ${JSON.stringify(m.contenedor)}`)
      const a = antes?.[id]
      if (a !== undefined) {
        const tol = ancho >= 1024 ? 2 : 1
        const igual = (x: Caja, y: Caja): boolean => Math.abs(x.x - y.x) <= tol && Math.abs(x.y - y.y) <= tol && Math.abs(x.w - y.w) <= tol && Math.abs(x.h - y.h) <= tol
        const quietos = igual(m.aro, a.aro) && igual(m.bajada, a.bajada) && igual(m.aviso, a.aviso)
        const titulo = ancho >= 1024 ? m.renglones === 1 && m.letra >= 1.2 * a.letra && m.bajada.y - pie <= 24 && m.bajada.y - pie >= -4 && m.titulo.x >= m.contenedor.x - 1 && m.titulo.x + m.titulo.w <= m.contenedor.x + m.contenedor.w + 1 : igual(m.titulo, a.titulo)
        const bien = quietos && titulo
        if (!bien) malas += 1
        console.log(`  ${bien ? '✓' : '✗'} aro/bajada/aviso quietos: ${String(quietos)}; título: ${String(titulo)} (×${(m.letra / a.letra).toFixed(2)}, del pie a la bajada ${(m.bajada.y - pie).toFixed(1)} px)`)
      }
    }
  } finally {
    await ctx.close()
  }
  if (process.env.SALIDA_JSON !== undefined) writeFileSync(process.env.SALIDA_JSON, JSON.stringify(todas, null, 2))
  if (antes !== null) console.log(`${malas === 0 ? '✓' : '✗'} ${String(TAMANOS.length - malas)} de ${String(TAMANOS.length)}`)
  if (malas > 0) process.exitCode = 1
}

void main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
