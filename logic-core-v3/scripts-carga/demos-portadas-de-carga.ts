/**
 * [C2-41e] LA PANTALLA DE CARGA DE CADA DEMO — su primer cuadro y lo que tarda, contra la URL de la demo (no el sitio).
 *
 * Al abrir una demo, la ventana muestra una imagen mientras el iframe carga (`VentanaDeDemo`, y el Genie la curva). Era la demo ya
 * cargada: el visitante veía 3 a 5 s una foto congelada, después la pantalla de carga de la demo y recién ahí la demo. Para las que
 * tienen pantalla de carga propia, esa imagen pasa a ser el PRIMER CUADRO de su carga (así se entiende que está cargando, y cuando
 * el iframe aparece la carga sigue donde la foto la dejó). Nexo (`bold`) no tiene: queda como está.
 *
 * Cada demo se abre en un perfil nuevo (caché fría), a 1152 × 654 (el área de la demo en la ventana a 1440 × 900, la medida de
 * `MEDIDA_DE_LA_VENTANA`), y se graba con el screencast de CDP desde la navegación. El primer cuadro útil es el primero que no es
 * un color liso (la desviación de su luminancia pasa `UMBRAL_DE_CONTENIDO`). Se anotan su tiempo, el FCP, el DOMContentLoaded y
 * el `load` (el momento en que el iframe se mostraba), en ms desde que arranca la navegación.
 *
 *   npx tsx scripts-carga/demos-portadas-de-carga.ts              mide las cinco (VUELTAS=3 por defecto) y escribe las portadas
 *   SOLO=noir,niche VUELTAS=1 npx tsx …                            sólo ésas
 *   ESCRIBIR=no …                                                  mide sin tocar `public/demos/`
 *
 * Escribe `~/.cache/b4-medicion/demos-carga/<slug>-<n>.png` (los cuadros, para mirarlos), `tiempos.json`, y con la primera vuelta
 * `public/demos/<slug>-ventana.webp` (calidad 72, como `scripts-b4/demos-portadas.ts`) para las que tienen pantalla de carga.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'
import sharp from 'sharp'

import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_VENTANA } from '../src/app/v3/_secciones/trabajos/demos/catalogo'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SALIDA = path.join(os.homedir(), '.cache/b4-medicion/demos-carga')
const SOLO = (process.env.SOLO ?? '').split(',').filter((s) => s !== '')
const VUELTAS = Number(process.env.VUELTAS ?? '3')
const ESCRIBIR = process.env.ESCRIBIR !== 'no'
/** Las que no tienen pantalla de carga (su portada de la ventana es la demo misma). */
const SIN_PANTALLA_DE_CARGA = new Set(['bold'])
/** Cuánto se graba desde la navegación. */
const GRABAR_MS = 9000
/** Un cuadro con contenido: la desviación estándar de su luminancia (0…1), sin la barra de scroll, pasa esto. Un fondo liso da ~0. */
const UMBRAL_DE_CONTENIDO = 0.02
/** Lo que se deja afuera a la derecha al medir el contenido: la barra de scroll de la demo (px). */
const BARRA_DE_SCROLL_PX = 24
/**
 * Cuánto después del primer cuadro útil va la portada (ms), elegido a ojo con las hojas de cuadros: Noir arranca en negro y dibuja
 * «NOIR» letra por letra (su primer cuadro útil casi no se distingue del negro). En las demás el primer cuadro ya es la carga.
 */
const DESPUES_DEL_PRIMER_CUADRO_MS: Readonly<Record<string, number>> = { noir: 2000 }
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Cuadro {
  readonly ms: number
  readonly png: Buffer
}

interface Vuelta {
  readonly slug: string
  readonly vuelta: number
  readonly primerCuadroUtilMs: number | null
  readonly fcpMs: number | null
  readonly dclMs: number | null
  readonly loadMs: number | null
}

async function desviacion(png: Buffer): Promise<number> {
  const { width = 0, height = 0 } = await sharp(png).metadata()
  const { channels } = await sharp(png).extract({ left: 0, top: 0, width: Math.max(1, width - BARRA_DE_SCROLL_PX), height }).greyscale().stats()
  return (channels[0]?.stdev ?? 0) / 255
}

async function unaVuelta(slug: string, url: string, vuelta: number): Promise<{ readonly fila: Vuelta; readonly util: Cuadro | null; readonly cuadros: readonly Cuadro[] }> {
  const perfil = path.join(SALIDA, `perfil-${slug}-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const { ancho, alto } = MEDIDA_DE_LA_VENTANA
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    args: [`--window-size=${String(ancho + 20)},${String(alto + 140)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  const cuadros: Cuadro[] = []
  try {
    const p = ctx.pages()[0] ?? (await ctx.newPage())
    const cdp = await ctx.newCDPSession(p)
    let inicio = 0
    cdp.on('Page.screencastFrame', (f: { data: string; sessionId: number; metadata: { timestamp?: number } }) => {
      const cuando = f.metadata.timestamp === undefined ? Date.now() : f.metadata.timestamp * 1000
      if (inicio > 0) cuadros.push({ ms: cuando - inicio, png: Buffer.from(f.data, 'base64') })
      void cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => undefined)
    })
    await p.goto('about:blank')
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: ancho, maxHeight: alto })
    inicio = Date.now()
    await p.goto(url, { waitUntil: 'commit', timeout: 60000 })
    await dormir(GRABAR_MS)
    await cdp.send('Page.stopScreencast')
    const t = await p.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]
      return { fcp: fcp?.startTime ?? null, dcl: nav?.domContentLoadedEventEnd ?? null, load: nav !== undefined && nav.loadEventEnd > 0 ? nav.loadEventEnd : null }
    })
    let util: Cuadro | null = null
    for (const c of cuadros) {
      if ((await desviacion(c.png)) > UMBRAL_DE_CONTENIDO) {
        util = c
        break
      }
    }
    return { fila: { slug, vuelta, primerCuadroUtilMs: util === null ? null : Math.round(util.ms), fcpMs: t.fcp === null ? null : Math.round(t.fcp), dclMs: t.dcl === null ? null : Math.round(t.dcl), loadMs: t.load === null ? null : Math.round(t.load) }, util, cuadros }
  } finally {
    await ctx.close()
    rmSync(perfil, { recursive: true, force: true })
  }
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const filas: Vuelta[] = []
  for (const demo of CATALOGO_DE_DEMOS.filter((d) => SOLO.length === 0 || SOLO.includes(d.slug))) {
    for (let v = 1; v <= VUELTAS; v++) {
      const { fila, util, cuadros } = await unaVuelta(demo.slug, demo.url, v)
      filas.push(fila)
      console.log(`${demo.slug.padEnd(9)} vuelta ${String(v)}: primer cuadro útil ${String(fila.primerCuadroUtilMs)} ms · FCP ${String(fila.fcpMs)} · DCL ${String(fila.dclMs)} · load ${String(fila.loadMs)} (${String(cuadros.length)} cuadros)`)
      if (v !== 1) continue
      // Para mirarlos: el útil, y uno por segundo (el último de cada segundo).
      if (util !== null) writeFileSync(path.join(SALIDA, `${demo.slug}-util.png`), util.png)
      for (let s = 1; s <= Math.floor(GRABAR_MS / 1000); s++) {
        const c = [...cuadros].reverse().find((x) => x.ms <= s * 1000)
        if (c !== undefined) writeFileSync(path.join(SALIDA, `${demo.slug}-${String(s)}s.png`), c.png)
      }
      const despues = DESPUES_DEL_PRIMER_CUADRO_MS[demo.slug] ?? 0
      const portada = util === null ? null : (cuadros.find((c) => c.ms >= util.ms + despues) ?? util)
      if (portada !== null) writeFileSync(path.join(SALIDA, `${demo.slug}-portada.png`), portada.png)
      if (ESCRIBIR && portada !== null && !SIN_PANTALLA_DE_CARGA.has(demo.slug)) {
        const destino = path.join(process.cwd(), 'public', demo.ventana)
        await sharp(portada.png).webp({ quality: 72 }).toFile(destino)
        console.log(`  → ${destino}`)
      }
    }
  }
  writeFileSync(path.join(SALIDA, 'tiempos.json'), JSON.stringify(filas, null, 2))
  const mediana = (xs: readonly number[]): number | null => (xs.length === 0 ? null : [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? null)
  for (const slug of [...new Set(filas.map((f) => f.slug))]) {
    const de = filas.filter((f) => f.slug === slug)
    const m = (k: keyof Pick<Vuelta, 'primerCuadroUtilMs' | 'fcpMs' | 'loadMs'>): string => String(mediana(de.map((f) => f[k]).filter((x): x is number => x !== null)))
    console.log(`MEDIANA ${slug.padEnd(9)} primer cuadro útil ${m('primerCuadroUtilMs')} ms · FCP ${m('fcpMs')} · load ${m('loadMs')}`)
  }
}

void main()
