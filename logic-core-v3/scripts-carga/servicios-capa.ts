/**
 * [B4] EL TRUCO DE PROFUNDIDAD, CUADRO A CUADRO — el Chrome del sistema a la vista contra el dev o el build (`BASE`), `/api/` bloqueado,
 * con el banco prendido: el escenario publica `__capaDeLosNanobots` y, en cada cuadro de la transición entre la entrada y web, el
 * motor cuenta los píxeles del lienzo con nanobots adentro de las cajas de los renglones del título y adentro del panel (`readPixels`,
 * en el mismo cuadro que dibuja). En cada ancho, la ida (una muesca desde la entrada) y la vuelta (una muesca hacia arriba desde web):
 *
 *   · el cuadro del cambio (donde `data-capa` pasa de `detras` a `delante`, o al revés) y el de antes: 0 píxeles sobre el título y 0
 *     sobre el panel (objetivo: 0 y 0);
 *   · el cambio ocurre una sola vez por sentido, y antes de que el panel termine de entrar (los nanobots salen antes de que cierre);
 *   · el panel cierra por debajo: después del cambio, la capa es `delante` hasta el final de la transición.
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,1024 npx tsx scripts-carga/servicios-capa.ts
 *   CONTROL=capa-a-destiempo …   el control positivo: el cambio apenas arranca el traspaso; tiene que haber nanobots sobre el título
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('servicios')
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Registro {
  readonly t: number
  readonly p: number
  readonly capa: string | null
  readonly titulo: number
  readonly panel: number
}

interface Juicio {
  readonly ancho: number
  readonly sentido: 'ida' | 'vuelta'
  readonly bien: boolean
  readonly linea: string
}

async function aEstado(p: Page, estado: number): Promise<void> {
  await p.evaluate((e) => {
    const g = (window as Window & { __gatillosDelBanco?: { regla: () => { pasoPx: number; inicio: number } } }).__gatillosDelBanco
    if (!g) throw new Error('sin __gatillosDelBanco')
    const r = g.regla()
    window.scrollTo({ top: r.inicio + (e + 0.5) * r.pasoPx, behavior: 'instant' })
  }, estado)
  await dormir(3200)
}

async function transicion(p: Page, sentido: 1 | -1): Promise<readonly Registro[]> {
  await p.evaluate(() => (window as Window & { __capaDeLosNanobots?: { vaciar: () => void } }).__capaDeLosNanobots?.vaciar())
  await p.mouse.wheel(0, 100 * sentido)
  await dormir(3200)
  return p.evaluate(() => [...((window as Window & { __capaDeLosNanobots?: { registros: Registro[] } }).__capaDeLosNanobots?.registros ?? [])])
}

function juzgar(ancho: number, sentido: 'ida' | 'vuelta', r: readonly Registro[]): Juicio {
  const cambios = r.map((x, i) => (i > 0 && x.capa !== r[i - 1]?.capa ? i : -1)).filter((i) => i >= 0)
  const enElCambio = cambios.flatMap((i) => [r[i - 1], r[i]]).filter((x): x is Registro => x !== undefined)
  const sucios = enElCambio.filter((x) => x.titulo > 0 || x.panel > 0)
  const bien = r.length > 10 && cambios.length === 1 && sucios.length === 0
  const c = cambios[0] === undefined ? null : r[cambios[0]]
  const linea = `${bien ? '✓' : '✗'} ${String(ancho)} · ${sentido}: ${String(r.length)} cuadros, ${String(cambios.length)} cambio(s) de capa${c === null ? '' : ` en p ${c.p.toFixed(3)}`}; en el cuadro del cambio y el de antes: ${enElCambio.map((x) => `título ${String(x.titulo)} px, panel ${String(x.panel)} px`).join(' · ')}`
  return { ancho, sentido, bien, linea }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const juicios: Juicio[] = []
  for (const ancho of ANCHOS) {
    const alto = ancho <= 1024 ? 768 : 900
    const perfil = perfilDelBanco('servicios-capa')
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
      await p.goto(`${BASE}/v3#servicios`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(8, 8)
      await dormir(7000)
      const placa = await p.evaluate(() => {
        const gl = document.createElement('canvas').getContext('webgl')
        const info = gl?.getExtension('WEBGL_debug_renderer_info')
        return gl === null || gl === undefined || info === null || info === undefined ? 'sin WebGL' : String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      })
      const visible = await p.evaluate(() => document.visibilityState === 'visible' && innerWidth > 0)
      console.log(`·     ${String(ancho)} · la placa: ${placa} · pestaña visible: ${String(visible)}`)
      await aEstado(p, 0)
      const cambio = await p.evaluate(() => (window as Window & { __capaDeLosNanobots?: { cambio: () => unknown } }).__capaDeLosNanobots?.cambio() ?? null)
      console.log(`·     ${String(ancho)} · el cambio calculado: ${JSON.stringify(cambio)}`)
      const ida = await transicion(p, 1)
      juicios.push(juzgar(ancho, 'ida', ida))
      const vuelta = await transicion(p, -1)
      juicios.push(juzgar(ancho, 'vuelta', vuelta))
      writeFileSync(path.join(SALIDA, `capa-${String(ancho)}-${CONTROL === '' ? 'producto' : CONTROL}.json`), JSON.stringify({ cambio, ida, vuelta }, null, 1))
    } finally {
      await ctx.close()
    }
  }
  for (const j of juicios) console.log(j.linea)
  const malos = juicios.filter((j) => !j.bien).length
  console.log(CONTROL === '' ? `${malos === 0 ? '✓' : '✗'} ${String(juicios.length - malos)} de ${String(juicios.length)}` : `control ${CONTROL}: ${malos > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'}`)
}

void main()
