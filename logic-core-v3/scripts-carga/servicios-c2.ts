/**
 * [C2-50] LA SECCIÓN SERVICIOS EN EL SITIO (cola 2, ítems 12, 13 y 20) — Chrome del sistema contra el dev (`BASE`), `/api/` bloqueado,
 * el banco prendido (`__gatillosDelBanco`). Por ancho:
 *
 *   escritorio (1440, 1024), en cada servicio en reposo (el paso por el scroll, sin gesto):
 *     eje          el centro del título del servicio y el del lugar de los nanobots en el mismo eje: |Δx| ≤ 4 px
 *     video        el video de arriba a abajo del panel (±2 px)
 *     texto        la caja del texto del medio sin intersección con el lugar de los nanobots
 *     reposo       ningún renglón del título ni del texto pisa el lugar de los nanobots (la cota geométrica de «0 px en reposo»;
 *                  los píxeles del cambio de capa los mide `servicios-capa.ts`)
 *     fotos        cada servicio con `?titulo-servicio=1|2|3` y `?fuente-servicio=1|2|3|4`, y la nube a mitad del viaje de web a software
 *   teléfono (390, 768):
 *     orden        en cada panel: el título (con los nanobots a su derecha), el video, el texto y el CTA, de arriba a abajo
 *     rueda        a 390, tres muescas desde 250 px antes del ancla: el paso va −1 → 0 y nunca pasa por 1 (el bug de la deuda)
 *
 *   BASE=http://localhost:3000 ANCHOS=1440,1024,768,390 npx tsx scripts-carga/servicios-c2.ts
 *   CONTROL=eje-corrido …          el título corrido 40 px (una hoja inyectada): `eje` tiene que FALLAR
 *   CONTROL=sin-objetivo-nativo …  la rueda nativa con la cuenta de B4 (`__defectosDeLosGatillos`): `rueda` tiene que FALLAR a 390
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const ANCHOS = (process.env.ANCHOS ?? '1440,1024,768,390').split(',').map(Number)
const CONTROL = process.env.CONTROL ?? ''
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/c2-50/servicios')
const TRANSICION_MS = 2200
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Fila {
  readonly ancho: number
  readonly caso: string
  readonly bien: boolean
  readonly dato: string
}

type Banco = Window & { __gatillosDelBanco?: { paso: () => number; regla: () => { pasoPx: number; inicio: number; cantidad: number } } }

async function ponerEn(p: Page, paso: number): Promise<void> {
  await p.evaluate((destino) => {
    const g = (window as Banco).__gatillosDelBanco
    if (!g) throw new Error('sin __gatillosDelBanco')
    const r = g.regla()
    const y = destino < 0 ? r.inicio - 250 : r.inicio + (destino + 0.5) * r.pasoPx
    window.scrollTo({ top: y, behavior: 'instant' })
  }, paso)
  await dormir(TRANSICION_MS + 800)
}

/** Las medidas de un panel en reposo (px de la pantalla). */
async function medidas(p: Page, servicio: string): Promise<{ eje: number; video: number; textoPisa: boolean; reposoPisa: boolean; orden: boolean }> {
  return p.evaluate((id) => {
    const panel = document.querySelector<HTMLElement>(`[data-pieza="panel-de-servicio"][data-servicio="${id}"]`)
    if (!panel) throw new Error(`sin el panel ${id}`)
    const caja = (sel: string): DOMRect => panel.querySelector<HTMLElement>(sel)?.getBoundingClientRect() ?? new DOMRect()
    const titulo = caja('[data-parte="titulo-del-servicio"]')
    const lugar = caja('[data-lugar-de-los-nanobots]')
    const video = caja('[data-pieza="video-del-servicio"]')
    const texto = caja('[data-pieza="texto-del-servicio"]')
    const p0 = panel.getBoundingClientRect()
    const tocan = (a: DOMRect, b: DOMRect): boolean => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
    // El lugar donde se posa el símbolo: el cuadrado centrado del lado corto (el globo, los engranajes, la red).
    const lado = Math.min(lugar.width, lugar.height)
    const simbolo = new DOMRect(lugar.x + (lugar.width - lado) / 2, lugar.y + (lugar.height - lado) / 2, lado, lado)
    const renglones = [...panel.querySelectorAll<HTMLElement>('[data-parte="titulo-del-servicio"], [data-parte="parrafos"] p')].flatMap((el) => [...el.getClientRects()])
    const ys = [titulo.top, video.top, texto.top, caja('[data-viaje-del-servicio]').top]
    return {
      eje: Math.abs(titulo.left + titulo.width / 2 - (lugar.left + lugar.width / 2)),
      video: Math.max(Math.abs(video.top - p0.top), Math.abs(video.bottom - p0.bottom)),
      textoPisa: tocan(texto, simbolo),
      reposoPisa: renglones.some((r) => tocan(r, simbolo)),
      orden: ys.every((y, k) => k === 0 || y > (ys[k - 1] ?? 0)) && lugar.left > titulo.left && Math.abs(lugar.top + lugar.height / 2 - (titulo.top + titulo.height / 2)) < lugar.height,
    }
  }, servicio)
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const filas: Fila[] = []
  const anotar = (f: Fila): void => {
    filas.push(f)
    console.log(`${f.bien ? '✓' : '✗'} ${String(f.ancho)} · ${f.caso}: ${f.dato}`)
  }
  for (const ancho of ANCHOS) {
    const alto = ancho >= 1440 ? 900 : ancho >= 1024 ? 768 : ancho >= 768 ? 1024 : 844
    const telefono = ancho < 1024
    const ctx = await chromium.launchPersistentContext(path.join(SALIDA, `perfil-${String(ancho)}-${String(Date.now())}`), {
      executablePath: CHROME,
      headless: false,
      viewport: { width: ancho, height: alto },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
      args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
    })
    try {
      await ctx.addInitScript(`(() => { window.__name = (f) => f; window.__entornoDeLaEscena = 'producto'; window.__defectosDeLosGatillos = ${JSON.stringify(CONTROL)}; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} })()`)
      const p = ctx.pages()[0] ?? (await ctx.newPage())
      await p.route('**/api/**', (r) => r.abort())
      const abrir = async (consulta: string): Promise<void> => {
        await p.goto(`${BASE}/v3${consulta}#servicios`, { waitUntil: 'load', timeout: 300000 })
        await p.mouse.move(ancho / 2, alto / 2)
        await dormir(7000)
        if (CONTROL === 'eje-corrido') await p.addStyleTag({ content: '[data-parte="titulo-del-servicio"]{margin-left:40px!important}' })
      }
      await abrir('')
      const servicios = ['web', 'software', 'ia-automatizacion']
      for (const [i, id] of servicios.entries()) {
        await ponerEn(p, i + 1)
        const m = await medidas(p, id)
        if (telefono) {
          anotar({ ancho, caso: `orden ${id}`, bien: m.orden, dato: m.orden ? 'título y nanobots, video, texto, CTA' : 'otro orden' })
          continue
        }
        anotar({ ancho, caso: `eje ${id}`, bien: m.eje <= 4, dato: `|Δx| ${m.eje.toFixed(1)} px` })
        anotar({ ancho, caso: `video ${id}`, bien: m.video <= 2, dato: `${m.video.toFixed(1)} px del borde` })
        anotar({ ancho, caso: `texto ${id}`, bien: !m.textoPisa, dato: m.textoPisa ? 'pisa a los nanobots' : 'sin intersección' })
        anotar({ ancho, caso: `reposo ${id}`, bien: !m.reposoPisa, dato: m.reposoPisa ? 'un renglón pisa el símbolo' : 'ningún renglón sobre el símbolo' })
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${id}-defecto.png`) })
      }
      if (!telefono && CONTROL === '') {
        // La nube a mitad del viaje de web a software (la transición dura 2200 ms; la nube, de 0,05 a 0,9).
        await ponerEn(p, 1)
        await p.mouse.wheel(0, 100)
        await dormir(TRANSICION_MS * 0.45)
        await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-nube-en-viaje.png`) })
        for (const t of ['1', '2', '3'])
          for (const f of ['1', '2', '3', '4']) {
            await abrir(`?titulo-servicio=${t}&fuente-servicio=${f}`)
            for (const [i, id] of servicios.entries()) {
              await ponerEn(p, i + 1)
              await p.screenshot({ path: path.join(SALIDA, `${String(ancho)}-${id}-titulo${t}-fuente${f}.png`) })
            }
          }
      }
      if (ancho === 390) {
        await ponerEn(p, -1)
        await p.evaluate(() => {
          const w = window as Banco & { __pasos?: number[] }
          const log: number[] = (w.__pasos = [])
          const cuadro = (): void => {
            const s = w.__gatillosDelBanco?.paso()
            if (s !== undefined && log[log.length - 1] !== s) log.push(s)
            requestAnimationFrame(cuadro)
          }
          requestAnimationFrame(cuadro)
        })
        for (let k = 0; k < 3; k++) {
          await p.mouse.wheel(0, 100)
          await dormir(16)
        }
        await dormir(TRANSICION_MS + 1500)
        const pasos = await p.evaluate(() => (window as Window & { __pasos?: number[] }).__pasos ?? [])
        const bien = pasos.join() === '-1,0'
        anotar({ ancho, caso: 'rueda desde arriba', bien, dato: `${pasos.join(' → ')} (esperado −1 → 0)` })
      }
    } finally {
      await ctx.close()
    }
  }
  writeFileSync(path.join(SALIDA, `c2-${CONTROL === '' ? 'producto' : CONTROL}.json`), JSON.stringify(filas, null, 2))
  const malos = filas.filter((f) => !f.bien).length
  console.log(CONTROL === '' ? `${malos === 0 ? '✓' : '✗'} ${String(filas.length - malos)} de ${String(filas.length)}` : `control ${CONTROL}: ${malos > 0 ? '✓ rojo como tiene que ser' : '✗ ciego'} (${String(malos)} casos fallan)`)
}

void main()
