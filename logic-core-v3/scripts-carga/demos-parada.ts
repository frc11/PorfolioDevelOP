/**
 * [NOCTURNO B5] LA PARADA DE DEMOS EN EL SITIO — la matriz de la parada (rueda, ráfaga, trackpad, teclado), bajando desde «la tuya» y
 * subiendo desde Servicios, con su control. El Chrome del sistema a la vista contra el dev o el build (`BASE`), `/api/` bloqueado, con
 * el banco prendido (`__entornoDeLaEscena`: la parada publica `__gatillosDelBancoDe.demos` y `__paradaDeDemos`, Servicios
 * `__gatillosDelBanco`). Cada caso arranca en su lugar (por el scroll, sin gesto), corre su gesto y graba CUADRO A CUADRO (un rAF en la
 * página) el paso del Portfolio, el de la parada, el de Servicios y lo que mostró la llegada de Demos:
 *
 *   bajando · muesca     una muesca en «la tuya»: Demos, y se queda (3,5 s); una muesca nueva: Servicios
 *   bajando · rafaga     doce muescas en 360 ms: Demos entera y quieta (nunca Servicios); una muesca nueva: Servicios
 *   bajando · trackpad   un deslizamiento con su inercia (45 eventos que se apagan): igual
 *   bajando · teclado    AvPág hasta que la parada entra y dos más seguidas (120 ms): Demos se queda; una AvPág nueva: Servicios
 *   subiendo · rafaga    doce muescas hacia arriba desde el primer paso de Servicios: Demos, quieta; una muesca nueva: «la tuya»
 *   subiendo · trackpad  igual, con el trackpad
 *
 * Un caso pasa si: (1) después del gesto la página queda en Demos (la parada en 0, Servicios antes de su ancla, el Portfolio en la cola)
 * y quieta; (2) la llegada de Demos está entera (1) en reposo; (3) el gesto nuevo sale al vecino del sentido (Servicios en 0, o «la
 * tuya» en 3); y (4) la parada nunca se deja con la llegada a medias.
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,1024 npx tsx scripts-carga/demos-parada.ts
 *   CONTROL=sin-parada …           el control positivo: Demos sin su parada (la de antes). Bajando, rafaga/trackpad/teclado FALLAN.
 *   CONTROL=parada-sin-llegada …   la parada sin esperar la llegada: el teclado (que entra con la llegada corriendo) FALLA por (4).
 *
 * Escribe `~/.cache/b4-medicion/demos/parada-<producto|control>.json`.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/demos')
/** Lo que se espera el reposo después de un gesto (el vuelo del Portfolio, la llegada de 1,8 s y la inercia que sobra). */
const REPOSO_MS = 3500
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Foto {
  readonly t: number
  readonly portfolio: number
  readonly parada: number
  readonly servicios: number
  readonly llegada: number | null
  readonly y: number
}

const GRABAR = `(() => {
  const log = (window.__fotosDeLaParada = [])
  const cuadro = () => {
    const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
    const d = window.__gatillosDelBancoDe && window.__gatillosDelBancoDe.demos
    const s = window.__gatillosDelBanco
    const l = window.__paradaDeDemos
    const f = { t: performance.now(), portfolio: Number(e ? e.getAttribute('data-paso') : NaN), parada: d ? d.paso() : NaN, servicios: s ? s.paso() : NaN, llegada: l ? l.llegada() : null, y: scrollY }
    const u = log[log.length - 1]
    if (!u || u.portfolio !== f.portfolio || u.parada !== f.parada || u.servicios !== f.servicios || u.llegada !== f.llegada) log.push(f)
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

const ahora = (p: Page): Promise<Foto> =>
  p.evaluate(() => {
    const w = window as Window & { __gatillosDelBancoDe?: Record<string, { paso: () => number }>; __gatillosDelBanco?: { paso: () => number }; __paradaDeDemos?: { llegada: () => number | null } }
    const e = document.querySelector('[data-pieza="escenario-del-portfolio"]')
    return { t: performance.now(), portfolio: Number(e?.getAttribute('data-paso') ?? NaN), parada: w.__gatillosDelBancoDe?.demos?.paso() ?? NaN, servicios: w.__gatillosDelBanco?.paso() ?? NaN, llegada: w.__paradaDeDemos?.llegada() ?? null, y: scrollY }
  })

/** «La tuya» por el scroll (su ancla arriba del cuadro) y el Portfolio asentado. */
async function enLaTuya(p: Page): Promise<void> {
  await p.evaluate(() => {
    const ancla = document.getElementById('portfolio-la-tuya')
    if (ancla === null) throw new Error('sin el ancla de «la tuya» (¿abajo de 1024?)')
    window.scrollTo({ top: ancla.getBoundingClientRect().top + scrollY, behavior: 'instant' })
  })
  await dormir(3000)
}

/** El primer paso de Servicios por el scroll (su centro). */
async function enServicios(p: Page): Promise<void> {
  await p.evaluate(() => {
    const g = (window as Window & { __gatillosDelBanco?: { regla: () => { pasoPx: number; inicio: number } } }).__gatillosDelBanco
    if (!g) throw new Error('sin __gatillosDelBanco de Servicios')
    const r = g.regla()
    window.scrollTo({ top: r.inicio + 0.5 * r.pasoPx, behavior: 'instant' })
  })
  await dormir(3000)
}

async function grabar(p: Page, gesto: () => Promise<void>, esperaMs: number): Promise<readonly Foto[]> {
  await p.evaluate(() => {
    const w = window as Window & { __fotosDeLaParada?: unknown[] }
    w.__fotosDeLaParada?.splice(0)
  })
  await gesto()
  await dormir(esperaMs)
  return p.evaluate(() => (window as Window & { __fotosDeLaParada?: Foto[] }).__fotosDeLaParada ?? [])
}

const muesca = async (p: Page, s: 1 | -1): Promise<void> => p.mouse.wheel(0, 100 * s)
async function rafaga(p: Page, s: 1 | -1): Promise<void> {
  for (let k = 0; k < 12; k++) {
    await p.mouse.wheel(0, 120 * s)
    await dormir(30)
  }
}
async function trackpad(p: Page, s: 1 | -1): Promise<void> {
  for (let k = 0; k < 45; k++) {
    await p.mouse.wheel(0, s * Math.max(2, 80 * 0.94 ** k))
    await dormir(16)
  }
}
/** AvPág hasta que la parada entra (a lo sumo ocho) y dos más seguidas: la llegada todavía corre. */
async function teclado(p: Page): Promise<void> {
  for (let k = 0; k < 8 && (await ahora(p)).parada !== 0; k++) {
    await p.keyboard.press('PageDown')
    await dormir(120)
  }
  for (let k = 0; k < 2; k++) {
    await p.keyboard.press('PageDown')
    await dormir(120)
  }
}

/** ¿Se dejó la parada (0 → otro) con la llegada a medias? */
const dejadaAMedias = (fotos: readonly Foto[]): boolean => fotos.some((f, i) => i > 0 && fotos[i - 1]?.parada === 0 && f.parada !== 0 && (fotos[i - 1]?.llegada ?? 1) < 0.999)

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const filas: { ancho: number; caso: string; bien: boolean; motivo: string }[] = []
  for (const ancho of ANCHOS) {
    const alto = ancho <= 1024 ? 768 : 900
    const perfil = path.join(os.homedir(), `.cache/b4-medicion/demos-perfil-${String(Date.now())}`)
    rmSync(perfil, { recursive: true, force: true })
    const ctx = await chromium.launchPersistentContext(perfil, {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__defectosDeLosGatillos = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3#trabajos`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(7000)
      await p.evaluate(GRABAR)

      const caso = async (nombre: string, bajando: boolean, gesto: () => Promise<void>, nuevo: () => Promise<void>): Promise<void> => {
        await (bajando ? enLaTuya(p) : enServicios(p))
        const ida = await grabar(p, gesto, REPOSO_MS)
        const quieta = await ahora(p)
        await dormir(400)
        const despues = await ahora(p)
        const enDemos = quieta.parada === 0 && quieta.servicios < 0 && quieta.portfolio === 4 && Math.abs(despues.y - quieta.y) < 2
        const entera = (quieta.llegada ?? 0) >= 0.999
        const vuelta = await grabar(p, nuevo, 2500)
        const fin = await ahora(p)
        const sale = bajando ? fin.servicios === 0 && fin.parada === 1 : fin.portfolio === 3 && fin.parada === -1
        const aMedias = dejadaAMedias([...ida, ...vuelta])
        const motivo = !enDemos ? `no quedó en Demos (portfolio ${String(quieta.portfolio)}, parada ${String(quieta.parada)}, servicios ${String(quieta.servicios)})` : !entera ? `la llegada a medias en reposo (${String(quieta.llegada)})` : aMedias ? 'dejó la parada con la llegada a medias' : !sale ? `el gesto nuevo no salió al vecino (portfolio ${String(fin.portfolio)}, parada ${String(fin.parada)}, servicios ${String(fin.servicios)})` : 'ok'
        const bien = motivo === 'ok'
        filas.push({ ancho, caso: nombre, bien, motivo })
        console.log(`${bien ? '✓' : '✗'} ${String(ancho)} · ${nombre}: ${motivo}`)
      }
      await caso('bajando · muesca', true, () => muesca(p, 1), () => muesca(p, 1))
      await caso('bajando · rafaga', true, () => rafaga(p, 1), () => muesca(p, 1))
      await caso('bajando · trackpad', true, () => trackpad(p, 1), () => trackpad(p, 1))
      await caso('bajando · teclado', true, () => teclado(p), () => p.keyboard.press('PageDown'))
      await caso('subiendo · rafaga', false, () => rafaga(p, -1), () => muesca(p, -1))
      await caso('subiendo · trackpad', false, () => trackpad(p, -1), () => trackpad(p, -1))
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `parada-${CONTROL === '' ? 'producto' : CONTROL}.json`), JSON.stringify(filas, null, 2))
  const malos = filas.filter((f) => !f.bien).length
  console.log(CONTROL === '' ? `${malos === 0 ? '✓' : '✗'} ${String(filas.length - malos)} de ${String(filas.length)}` : `control ${CONTROL}: ${malos > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'} (${String(malos)} casos fallan)`)
}

void main()
