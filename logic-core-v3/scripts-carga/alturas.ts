/**
 * [INT] LAS ALTURAS CONTRA LA ESCENA, EN EL SITIO — `/v3` con el Chrome del sistema a la vista y `/api/` bloqueado, por ancho:
 *   · el DESVÍO de cada sección: con su tope (`[data-panel]`) arriba del cuadro, la pantalla del recorrido que la escena ve
 *     (`pantallaDeScroll` sobre lo que midió sin los tramos: `__medidaDeLaEscenaDelBanco`) menos la que declara la tabla
 *     (`ANCLAJE.geometria[i].desdePantalla`), en pantallas. La REGLA DE ALTURAS dice 0: cada sección que cambia de alto anota su tramo;
 *   · el PERFIL de velocidad: la página entera en pasos de 0,1 pantallas; por paso, cuántas pantallas de la escena avanza por pantalla de
 *     scroll. Un ESCALÓN es un paso cuya velocidad pasa 4 veces la mediana de sus seis vecinos (y avanza más de 0,15 pantallas de la
 *     escena en ese paso): un salto que se ve. Se informa el máximo y en qué sección cae.
 *
 *   BASE=http://localhost:3002 ANCHOS=1440x900,390x844 npx tsx scripts-carga/alturas.ts
 *   CONTROL=sin-tramos   se mide con el scroll y el pie crudos (sin descontar los tramos anotados): el desvío de las secciones que
 *                        vienen después de un tramo tiene que salir del tope (rojo).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

import { ANCLAJE, pantallaDeScroll } from '../src/app/v3/_lib/escena/anclaje'
import { exigirDiscoLibre, perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHOS = (process.env.ANCHOS ?? '1440x900,1366x768,1280x720,1024x768,820x1180,768x1024,390x844,360x780').split(',').map((a) => a.split('x').map(Number) as [number, number])
const CONTROL = process.env.CONTROL ?? ''
if (!['', 'sin-tramos'].includes(CONTROL)) throw new Error(`CONTROL=${CONTROL}: sin-tramos`)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('alturas')
const TOPE_DEL_DESVIO = 0.05
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Medida {
  readonly scroll: number
  readonly y: number
  readonly arriba: number
  readonly abajo: number
  readonly ventana: number
  readonly visible: string
}

/** Lleva el scroll a `y` y lee la escena dos cuadros después (lo que midió en esa lectura). */
async function medirEn(p: Page, y: number): Promise<Medida> {
  return p.evaluate(async ([destino, crudo]) => {
    window.scrollTo({ top: destino, behavior: 'instant' })
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
    await new Promise<void>((r) => setTimeout(r, 30))
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
    const m = (window as unknown as { __medidaDeLaEscenaDelBanco?: () => { y: number; arriba: number; abajo: number } }).__medidaDeLaEscenaDelBanco?.() ?? { y: Number.NaN, arriba: Number.NaN, abajo: Number.NaN }
    if (crudo) {
      // El control: lo mismo con el scroll y el pie crudos (sin descontar los tramos).
      const paneles = [...document.querySelectorAll('[data-panel]')].map((el) => el.getBoundingClientRect())
      return { scroll: scrollY, y: scrollY, arriba: m.arriba, abajo: Math.max(...paneles.map((r) => r.bottom + scrollY)), ventana: innerHeight, visible: document.visibilityState }
    }
    return { scroll: scrollY, y: m.y, arriba: m.arriba, abajo: m.abajo, ventana: innerHeight, visible: document.visibilityState }
  }, [y, CONTROL === 'sin-tramos'] as const)
}

const pantalla = (m: Medida): number => pantallaDeScroll(m.y, m.arriba, m.abajo, m.ventana)

async function main(): Promise<void> {
  exigirDiscoLibre()
  mkdirSync(SALIDA, { recursive: true })
  const informe: string[] = []
  let malas = 0
  for (const [ancho, alto] of ANCHOS) {
    const movil = ancho < 1024
    const perfil = perfilDelBanco('alturas')
    rmSync(perfil, { recursive: true, force: true })
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
      await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 300000 })
      const t0 = Date.now()
      while (Date.now() - t0 < 60000) {
        if (await p.evaluate(() => typeof (window as unknown as { __medidaDeLaEscenaDelBanco?: unknown }).__medidaDeLaEscenaDelBanco === 'function')) break
        await dormir(300)
      }
      // Un recorrido entero, despacio, para que cada sección decida su alto (carruseles, tramos), y de vuelta arriba.
      const total = await p.evaluate(() => document.documentElement.offsetHeight)
      for (let y = 0; y < total; y += alto * 0.8) {
        await p.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y)
        await dormir(120)
      }
      await dormir(800)
      await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await dormir(800)

      // El desvío por sección.
      const topes = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-panel]')].map((el) => [el.dataset.panel ?? '', el.getBoundingClientRect().top + scrollY])))
      const filas: string[] = []
      let peor = 0
      for (const g of ANCLAJE.geometria) {
        const tope = topes[g.id]
        if (tope === undefined) {
          filas.push(`${g.id}: sin panel`)
          continue
        }
        const m = await medirEn(p, tope)
        if (m.visible !== 'visible') throw new Error(`${String(ancho)}: la pestaña no está a la vista (${m.visible}): la medición no vale`)
        // Si la sección retiene el scroll (un gatillo) el tope no queda donde se pidió: se informa.
        const corrido = Math.abs(m.scroll - Math.min(tope, total - m.ventana))
        const desvio = pantalla(m) - g.desdePantalla
        if (g.desdePantalla < ANCLAJE.pantallasDeScroll && corrido < 2) peor = Math.max(peor, Math.abs(desvio))
        filas.push(`${g.id}: ${desvio >= 0 ? '+' : ''}${desvio.toFixed(3)} pantallas (escena ${pantalla(m).toFixed(3)}, tabla ${g.desdePantalla.toFixed(3)})${corrido >= 2 ? ` · el scroll quedó ${corrido.toFixed(0)} px corrido: no cuenta` : ''}`)
      }
      // El perfil de velocidad.
      const paso = alto * 0.1
      const perfilDeVelocidad: { y: number; v: number; seccion: string }[] = []
      let anterior = await medirEn(p, 0)
      const seccionEn = (y: number): string => Object.entries(topes).filter(([, t]) => t <= y + 1).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '?'
      for (let y = paso; y <= total - alto; y += paso) {
        const m = await medirEn(p, y)
        const dy = (m.scroll - anterior.scroll) / alto
        if (dy > 0.05) perfilDeVelocidad.push({ y: m.scroll, v: (pantalla(m) - pantalla(anterior)) / dy, seccion: seccionEn(m.scroll) })
        anterior = m
      }
      const escalones: string[] = []
      let maxima = { v: 0, seccion: '', y: 0 }
      for (let i = 0; i < perfilDeVelocidad.length; i += 1) {
        const a = perfilDeVelocidad[i]
        if (a === undefined) continue
        if (a.v > maxima.v) maxima = { v: a.v, seccion: a.seccion, y: a.y }
        const vecinos = perfilDeVelocidad.slice(Math.max(0, i - 3), i + 4).filter((_, k, arr) => arr[k] !== a).map((x) => x.v).sort((x, z) => x - z)
        const mediana = vecinos[Math.floor(vecinos.length / 2)] ?? 0
        if (a.v * 0.1 > 0.15 && a.v > 4 * Math.max(mediana, 0.05)) escalones.push(`${a.seccion} en ${a.y.toFixed(0)} px: ${a.v.toFixed(2)} (vecinos ${mediana.toFixed(2)})`)
      }
      const bien = peor <= TOPE_DEL_DESVIO && escalones.length === 0
      if (!bien) malas += 1
      const linea = `${bien ? 'ok   ' : 'FALLA'} ${String(ancho)}×${String(alto)} · desvío máximo ${peor.toFixed(3)} pantallas (tope ${String(TOPE_DEL_DESVIO)}) · velocidad máxima ${maxima.v.toFixed(2)} pantallas de escena por pantalla de scroll (${maxima.seccion}, ${maxima.y.toFixed(0)} px) · ${String(escalones.length)} escalones`
      console.log(linea)
      for (const f of filas) console.log(`      ${f}`)
      for (const e of escalones) console.log(`      ESCALÓN ${e}`)
      informe.push(linea, ...filas.map((f) => `      ${f}`), ...escalones.map((e) => `      ESCALÓN ${e}`))
      writeFileSync(path.join(SALIDA, `perfil-${String(ancho)}x${String(alto)}${CONTROL === '' ? '' : `-${CONTROL}`}.json`), JSON.stringify(perfilDeVelocidad))
    } finally {
      await ctx.close()
      rmSync(perfil, { recursive: true, force: true })
    }
  }
  writeFileSync(path.join(SALIDA, `alturas${CONTROL === '' ? '' : `-${CONTROL}`}.txt`), informe.join('\n'))
  console.log(`alturas: ${String(ANCHOS.length - malas)} de ${String(ANCHOS.length)} dentro del criterio${CONTROL === '' ? '' : ` (CONTROL=${CONTROL})`} · salida en ${SALIDA}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
