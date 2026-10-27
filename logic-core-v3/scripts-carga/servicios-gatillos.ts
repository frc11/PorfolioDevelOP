/**
 * [B4] LA MÁQUINA DE GATILLOS DE SERVICIOS EN EL SITIO — el Chrome del sistema a la vista contra el dev o el build (`BASE`), `/api/`
 * bloqueado, con el banco prendido (`__entornoDeLaEscena`: la máquina publica `__gatillosDelBanco`). En cada ancho, cada caso arranca
 * en su lugar (por el scroll, sin gesto), corre su gesto y graba el paso CUADRO A CUADRO (un rAF en la página):
 *
 *   rueda-lenta     una muesca cada 3 s bajando desde arriba hasta el recomendador, y de vuelta: −1 0 1 2 3 4 y 4 3 2 1 0 −1, de a uno
 *   rafaga          doce muescas en 360 ms adentro: UN paso
 *   trackpad        un deslizamiento con su inercia (45 eventos que se apagan, 16 ms): UN paso
 *   teclado         ↓ una vez: un paso; ↓ seis veces seguidas (en la transición): un paso; ↑ una vez: vuelve uno
 *   entrada         una ráfaga larga desde arriba: aterriza en la entrada (el paso nunca pasa por 1)
 *   recomendador    el trackpad subiendo desde el recomendador: aterriza en IA (3)
 *
 * Cada caso pasa si la secuencia de pasos grabada es la esperada y ningún cambio saltea un paso.
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,1024 npx tsx scripts-carga/servicios-gatillos.ts
 *   CONTROL=sin-candado …   el control positivo (`__defectosDeLosGatillos`): la ráfaga, el trackpad y el teclado tienen que FALLAR
 *   ANCHOS=390 MOVIL=gatillo …   el teléfono con `?servicios-movil=gatillo` (el dedo: `touchscreen`, sin la rueda)
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'
import { perfilDelBanco, salidaDelBanco } from './limpieza-del-banco'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
const MOVIL = process.env.MOVIL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = salidaDelBanco('servicios')
const TRANSICION_MS = 2200
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const GRABAR = `(() => {
  const log = (window.__pasosDeServicios = [])
  const cuadro = () => {
    const g = window.__gatillosDelBanco
    if (g) { const p = g.paso(); if (log.length === 0 || log[log.length - 1].paso !== p) log.push({ t: performance.now(), paso: p, y: scrollY }) }
    requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

interface Cambio {
  readonly t: number
  readonly paso: number
}

/** Lleva la página a un paso por el scroll (sin gesto) y espera a que se asiente. */
async function ponerEn(p: Page, paso: number): Promise<void> {
  await p.evaluate((destino) => {
    const g = (window as Window & { __gatillosDelBanco?: { regla: () => { pasoPx: number; inicio: number; cantidad: number } } }).__gatillosDelBanco
    if (!g) throw new Error('sin __gatillosDelBanco (¿el banco prendido? ¿la coreografía?)')
    const r = g.regla()
    // Afuera, a 60 px del borde del tramo: la primera muesca ya entra (y la trampa la tiene que atrapar).
    const y = destino < 0 ? r.inicio - 60 : destino >= r.cantidad ? r.inicio + r.cantidad * r.pasoPx + 60 : r.inicio + (destino + 0.5) * r.pasoPx
    window.scrollTo({ top: y, behavior: 'instant' })
  }, paso)
  await dormir(TRANSICION_MS + 600)
}

async function grabar(p: Page, gesto: () => Promise<void>, esperaMs: number): Promise<readonly Cambio[]> {
  await p.evaluate(() => {
    const w = window as Window & { __pasosDeServicios?: unknown[] }
    w.__pasosDeServicios?.splice(0)
  })
  await gesto()
  await dormir(esperaMs)
  return p.evaluate(() => (window as Window & { __pasosDeServicios?: Cambio[] }).__pasosDeServicios ?? [])
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
async function dedo(p: Page, s: 1 | -1, ancho: number, alto: number): Promise<void> {
  const cdp = await p.context().newCDPSession(p)
  const x = ancho / 2
  const [y0, y1] = s > 0 ? [alto * 0.7, alto * 0.3] : [alto * 0.3, alto * 0.7]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
  for (let k = 1; k <= 8; k++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * k) / 8 }] })
    await dormir(16)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

/** Los pasos grabados, sin el primero si es el de partida; y si alguno saltea. */
const pasos = (cambios: readonly Cambio[], desde: number): number[] => cambios.map((c) => c.paso).filter((x, i) => !(i === 0 && x === desde))
const salteo = (cambios: readonly Cambio[], desde: number): boolean => [desde, ...pasos(cambios, desde)].some((x, i, a) => i > 0 && Math.abs(x - (a[i - 1] ?? x)) > 1)

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const filas: { ancho: number; caso: string; bien: boolean; pasos: number[] }[] = []
  for (const ancho of ANCHOS) {
    const alto = ancho < 1024 ? 844 : ancho <= 1024 ? 768 : 900
    const movil = ancho < 1024
    const perfil = perfilDelBanco('servicios')
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
      await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; window.__defectosDeLosGatillos = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      await p.goto(`${BASE}/v3${MOVIL === '' ? '' : `?servicios-movil=${MOVIL}`}#servicios`, { waitUntil: 'load', timeout: 300000 })
      await p.mouse.move(ancho / 2, alto / 2)
      await dormir(7000)
      await p.evaluate(GRABAR)
      const caso = async (nombre: string, desde: number, gesto: () => Promise<void>, espera: readonly number[], esperaMs = TRANSICION_MS + 800): Promise<void> => {
        await ponerEn(p, desde)
        const cambios = await grabar(p, gesto, esperaMs)
        const vistos = pasos(cambios, desde)
        const bien = vistos.join() === espera.join() && !salteo(cambios, desde)
        filas.push({ ancho, caso: nombre, bien, pasos: vistos })
        console.log(`${bien ? '✓' : '✗'} ${String(ancho)} · ${nombre}: ${[desde, ...vistos].join(' → ')} (esperado ${[desde, ...espera].join(' → ')})`)
      }
      const s = (n: 1 | -1): (() => Promise<void>) => (movil ? () => dedo(p, n, ancho, alto) : () => muesca(p, n))
      await caso('rueda-lenta bajando', -1, async () => {
        for (let k = 0; k < 6; k++) {
          await s(1)()
          await dormir(TRANSICION_MS + 900)
        }
      }, [0, 1, 2, 3, 4], 1000)
      await caso('rueda-lenta subiendo', 4, async () => {
        for (let k = 0; k < 6; k++) {
          await s(-1)()
          await dormir(TRANSICION_MS + 900)
        }
      }, [3, 2, 1, 0, -1], 1000)
      if (!movil) {
        await caso('rafaga', 1, () => rafaga(p, 1), [2])
        await caso('trackpad', 2, () => trackpad(p, -1), [1])
        await caso('teclado una vez', 0, () => p.keyboard.press('ArrowDown'), [1])
        await caso('teclado seis seguidas', 1, async () => {
          for (let k = 0; k < 6; k++) {
            await p.keyboard.press('PageDown')
            await dormir(120)
          }
        }, [2])
        await caso('entrada con una rafaga larga', -1, async () => {
          for (let k = 0; k < 30; k++) {
            await p.mouse.wheel(0, 300)
            await dormir(20)
          }
        }, [0])
        await caso('recomendador con el trackpad', 4, () => trackpad(p, -1), [3])
      }
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `gatillos-${CONTROL === '' ? 'producto' : CONTROL}.json`), JSON.stringify(filas, null, 2))
  const malos = filas.filter((f) => !f.bien).length
  console.log(CONTROL === '' ? `${malos === 0 ? '✓' : '✗'} ${String(filas.length - malos)} de ${String(filas.length)}` : `control ${CONTROL}: ${malos > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'} (${String(malos)} casos fallan)`)
}

void main()
