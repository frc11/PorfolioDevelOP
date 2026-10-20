/**
 * [SERVICIOS V1] EL NAVEGADOR DE LOS BANCOS DE SERVICIOS — el Chrome del sistema A LA VISTA (con su placa: la escena necesita WebGL; el
 * Chromium sin cabeza y sin GPU se caía a 390 en el banco del home), un perfil nuevo por corrida fuera del repo y `/api/` BLOQUEADO: ningún
 * banco envía el formulario ni llama a nada. Lo usan `pausa.ts`, `foco-del-contacto.ts` y `escena.ts`.
 *
 * Las lecciones del repo que cuida:
 * · la pestaña oculta no da pasos de render: la ventana va en 0,0, sin fondo ni oclusión, y `abrir` espera `visibilityState` y un ancho;
 * · `Page.captureScreenshot` congela los pasos de render: `capturar` re-emite el cuadro después de cada captura.
 */
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

import { chromium, type BrowserContext, type CDPSession, type Page } from '@playwright/test'
import sharp from 'sharp'

import { CHROME } from './guiones'

export const BASE = process.env.BASE_URL ?? 'http://localhost:3001'
/** Fuera del repo: las capturas, los perfiles y los informes. */
export const DATOS = path.join('C:\\paginas-servicios-datos', 'v1')
export const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** `1440x900,390x844` → los pares; sin la variable, los de la corrida. */
export function anchosDe(variable: string | undefined, porDefecto: string): readonly (readonly [number, number])[] {
  return (variable ?? porDefecto).split(',').map((a) => {
    const [ancho = 0, alto = 0] = a.split('x').map(Number)
    return [ancho, alto] as const
  })
}

export interface Abierta {
  readonly ctx: BrowserContext
  readonly p: Page
  readonly cdp: CDPSession
  /** Los errores de la página y de la consola (error y warning), y los pedidos a `/api/` (bloqueados: tienen que ser cero igual). */
  readonly log: { readonly errores: string[]; readonly consola: string[]; readonly api: string[] }
}

export interface OpcionesDeAbrir {
  readonly reducido?: boolean
  /** `window.__entornoDeLaEscena = 'producto'`: el banco de la escena del home (`hayBanco()`: `__ranuraDelBanco`, `__avanceDeLaIntro`). */
  readonly bancoDeLaEscena?: boolean
  /** Un script de inicio más (texto: corre antes que la página en cada carga). */
  readonly alIniciar?: string
}

/** Abre el Chrome del sistema en un ancho (táctil y de teléfono debajo de 1024) y carga `ruta`. */
export async function abrir(nombre: string, ancho: number, alto: number, ruta: string, o: OpcionesDeAbrir = {}): Promise<Abierta> {
  const perfil = path.join(DATOS, 'perfiles', `${nombre}-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  mkdirSync(perfil, { recursive: true })
  const movil = ancho < 1024
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: CHROME,
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: movil,
    hasTouch: movil,
    reducedMotion: o.reducido === true ? 'reduce' : 'no-preference',
    locale: 'es-AR',
    args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  const banco = o.bancoDeLaEscena === true ? "window.__entornoDeLaEscena = 'producto';" : ''
  await ctx.addInitScript(`(() => { window.__name = window.__name || ((f) => f); ${banco} try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ${o.alIniciar ?? ''} })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const log = { errores: [] as string[], consola: [] as string[], api: [] as string[] }
  p.on('pageerror', (e) => log.errores.push(String(e).slice(0, 300)))
  p.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') log.consola.push(`${m.type()}: ${m.text().replace(/\s+/g, ' ').slice(0, 300)}`)
  })
  p.on('request', (r) => {
    const u = new URL(r.url())
    if (u.pathname.startsWith('/api/')) log.api.push(`${r.method()} ${u.pathname}`)
  })
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  await cdp.send('Performance.enable')
  await p.goto(`${BASE}${ruta}`, { waitUntil: 'load', timeout: 300000 })
  await p.waitForFunction(() => document.visibilityState === 'visible' && window.innerWidth > 0, null, { timeout: 30000 })
  return { ctx, p, cdp, log }
}

/** Una captura (fuera del repo) y el cuadro re-emitido: la captura congela los pasos de render (lección del repo). */
export async function capturar(p: Page, archivo: string, clip?: { readonly x: number; readonly y: number; readonly width: number; readonly height: number }): Promise<Buffer> {
  mkdirSync(path.dirname(archivo), { recursive: true })
  const imagen = await p.screenshot({ path: archivo, ...(clip === undefined ? {} : { clip }) })
  const v = p.viewportSize()
  if (v !== null) await p.setViewportSize(v)
  await dormir(150)
  return imagen
}

/** La luminancia relativa de WCAG de un color sRGB de 0 a 255. */
export function luminancia(r: number, g: number, b: number): number {
  const lineal = (c: number): number => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b)
}

/** El contraste de WCAG entre dos luminancias. */
export function contraste(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** Los píxeles de una captura (RGBA, de a 4 por píxel), como el banco de contraste del home (`scripts-carga/contraste.ts`, con sharp). */
export async function pixeles(png: Buffer): Promise<{ readonly datos: Uint8Array; readonly ancho: number; readonly alto: number }> {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { datos: new Uint8Array(data.buffer, data.byteOffset, data.length), ancho: info.width, alto: info.height }
}

/**
 * El peor contraste entre un color de texto (o de un ícono) y los píxeles de una captura SIN él, dentro de unas cajas (px de la captura):
 * el fondo de verdad detrás, píxel por píxel. Devuelve el peor y cuántos píxeles miró.
 */
export function peorContraste(fondo: { readonly datos: Uint8Array; readonly ancho: number; readonly alto: number }, texto: readonly [number, number, number], cajas: readonly { readonly x: number; readonly y: number; readonly ancho: number; readonly alto: number }[]): { readonly peor: number; readonly mirados: number } {
  const lt = luminancia(texto[0], texto[1], texto[2])
  let peor = Number.POSITIVE_INFINITY
  let mirados = 0
  for (const c of cajas) {
    for (let y = Math.max(0, Math.floor(c.y)); y < Math.min(fondo.alto, Math.ceil(c.y + c.alto)); y++) {
      for (let x = Math.max(0, Math.floor(c.x)); x < Math.min(fondo.ancho, Math.ceil(c.x + c.ancho)); x++) {
        const i = (y * fondo.ancho + x) * 4
        const k = contraste(lt, luminancia(fondo.datos[i] ?? 0, fondo.datos[i + 1] ?? 0, fondo.datos[i + 2] ?? 0))
        if (k < peor) peor = k
        mirados += 1
      }
    }
  }
  return { peor, mirados }
}

/** Un color de CSS resuelto (`rgb(…)`/`rgba(…)`/`color(srgb …)`) a sRGB de 0 a 255, leído en la página por un lienzo. */
export async function colorResuelto(p: Page, css: string): Promise<readonly [number, number, number]> {
  return p.evaluate((c) => {
    const lienzo = document.createElement('canvas').getContext('2d')
    if (lienzo === null) return [0, 0, 0] as const
    lienzo.fillStyle = '#000'
    lienzo.fillStyle = c
    lienzo.fillRect(0, 0, 1, 1)
    const d = lienzo.getImageData(0, 0, 1, 1).data
    return [d[0] ?? 0, d[1] ?? 0, d[2] ?? 0] as const
  }, css)
}
