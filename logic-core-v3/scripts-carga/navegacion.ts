/**
 * [B12a.6] LA NAVEGACIÓN CLIENTE Y EL VELO, EN EL SITIO — el Chrome del sistema a la vista contra el dev (o el build de D7), `/api/`
 * bloqueado. En esta rama hay una sola página (la de prueba: las de servicio son de servicios), así que el recorrido es:
 *
 *   entra a `/v3/prueba-de-pagina` (la ÚNICA carga de documento) → «Volver al home» (EnlaceDeRuta) → atrás (la flecha) → «Portfolio» de
 *   la barra (al home, a su sección)
 *
 * y mide, cuadro a cuadro con un rAF en la página (que sobrevive a la navegación cliente: el documento es el mismo):
 *   · 0 cargas de documento después de la primera (`navigation` de Playwright y las entradas `navigation` del documento);
 *   · en el cuadro en que cambia la ruta, el velo cubierto entero (`data-cobertura` 1);
 *   · la variante sale ANTES del velo (su luz en la composición cuando el velo empieza a cubrir);
 *   · el hueco máximo entre cuadros mientras pasa el velo (el criterio del plan: ningún cuadro de más de 50 ms; en el dev, informado).
 *
 *   BASE=http://localhost:3002 ANCHO=1440|390 npx tsx scripts-carga/navegacion.ts
 *   CONTROL=sin-velo …   el control positivo (`window.__defectosDelVelo = 'sin-velo'`: navega sin cubrir): tiene que fallar
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3002'
const ANCHO = Number(process.env.ANCHO ?? '1440')
const MOVIL = ANCHO < 1024
const CONTROL = process.env.CONTROL ?? null
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface Cuadro {
  readonly t: number
  readonly ruta: string
  readonly fase: string
  readonly cobertura: number
  readonly luz: number | null
}

const GRABAR = `(() => {
  const t0 = performance.now()
  const log = (window.__cuadrosDelVelo = [])
  const cuadro = () => {
    const v = document.querySelector('[data-pieza="velo-de-navegacion"]')
    const r = window.__ranuraDelBanco ? window.__ranuraDelBanco() : null
    log.push({ t: Math.round((performance.now() - t0) * 10) / 10, ruta: location.pathname + location.hash, fase: v ? v.getAttribute('data-fase') : 'sin velo', cobertura: v ? Number(v.getAttribute('data-cobertura')) : 0, luz: r ? r.energia : null })
    if (!window.__pararElVelo) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
})()`

/** Lo que pasó en una navegación: el cuadro del cambio de ruta (con su cobertura), el hueco máximo mientras el velo estuvo puesto, la luz al cubrir. */
function juzgar(cuadros: readonly Cuadro[], desde: string): { readonly cambio: Cuadro | null; readonly huecoMs: number; readonly huecoQuietoMs: number; readonly luzAlCubrir: number | null; readonly fallas: string[] } {
  const i = cuadros.findIndex((c, k) => k > 0 && c.ruta !== desde && cuadros[k - 1]?.ruta === desde)
  const cambio = i < 0 ? null : (cuadros[i] ?? null)
  const conVelo = cuadros.filter((c) => c.fase !== 'quieto' && c.fase !== 'sin velo')
  // El hueco mientras el velo se MUEVE (cubriendo o destapando: se vería), y aparte el de cubierto (la página nueva se monta debajo: no se ve).
  let hueco = 0
  let huecoQuieto = 0
  const porFase: Record<string, number> = {}
  for (let k = 1; k < cuadros.length; k++) {
    const a = cuadros[k - 1]
    const b = cuadros[k]
    if (a === undefined || b === undefined) continue
    const seMueve = (f: string): boolean => f === 'cubriendo' || f === 'destapando'
    if (seMueve(a.fase) || seMueve(b.fase)) {
      hueco = Math.max(hueco, b.t - a.t)
      const f = seMueve(b.fase) ? b.fase : a.fase
      porFase[f] = Math.max(porFase[f] ?? 0, b.t - a.t)
    }
    else if (a.fase === 'cubierto' || b.fase === 'cubierto') huecoQuieto = Math.max(huecoQuieto, b.t - a.t)
  }
  const primero = conVelo[0]
  const fallas: string[] = []
  if (cambio === null) fallas.push('no-cambio-la-ruta')
  else if (cambio.cobertura < 1) fallas.push(`cambio-sin-cubrir (${cambio.cobertura.toFixed(3)})`)
  if (hueco > 50) fallas.push(`tiron ${Object.entries(porFase).map(([f, ms]) => `${f} ${ms.toFixed(0)} ms`).join(', ')}`)
  return { cambio, huecoMs: hueco, huecoQuietoMs: huecoQuieto, luzAlCubrir: primero?.luz ?? null, fallas }
}

async function grabarUnaNavegacion(p: Page, nombre: string, hacer: () => Promise<void>, esperarRuta: (r: string) => boolean): Promise<string[]> {
  const desde = await p.evaluate(() => location.pathname + location.hash)
  await p.evaluate(GRABAR)
  await hacer()
  const t0 = Date.now()
  while (Date.now() - t0 < 15000 && !esperarRuta(await p.evaluate(() => location.pathname + location.hash))) await dormir(100)
  await dormir(2500)
  const cuadros = await p.evaluate(() => {
    ;(window as unknown as { __pararElVelo: boolean }).__pararElVelo = true
    return (window as unknown as { __cuadrosDelVelo: Cuadro[] }).__cuadrosDelVelo
  })
  await p.evaluate(() => {
    ;(window as unknown as { __pararElVelo: boolean }).__pararElVelo = false
  })
  const j = juzgar(cuadros, desde)
  console.log(`${j.fallas.length === 0 ? 'ok   ' : 'FALLA'} ${String(ANCHO)} · ${nombre}: ${desde} → ${j.cambio?.ruta ?? '?'} · cobertura en el cambio ${j.cambio?.cobertura.toFixed(3) ?? '?'} · hueco máximo con el velo moviéndose ${j.huecoMs.toFixed(0)} ms (cubierto, la página nueva debajo: ${j.huecoQuietoMs.toFixed(0)} ms)${j.luzAlCubrir === null ? '' : ` · luz de la variante al cubrir ${j.luzAlCubrir.toFixed(3)}`}${j.fallas.length === 0 ? '' : ` · ${j.fallas.join(', ')}`}`)
  return j.fallas
}

async function main(): Promise<void> {
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/navegacion-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: ANCHO, height: MOVIL ? 844 : 900 },
    deviceScaleFactor: 1,
    isMobile: MOVIL,
    hasTouch: MOVIL,
    reducedMotion: 'no-preference',
    args: ['--force_high_performance_gpu', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion'],
  })
  await ctx.addInitScript(`(() => { window.__entornoDeLaEscena = 'producto'; try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ${CONTROL === null ? '' : `window.__defectosDelVelo = ${JSON.stringify(CONTROL)}`} })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  await p.route('**/api/**', (r) => r.abort())
  let documentos = 0
  p.on('framenavigated', (f) => {
    if (f === p.mainFrame()) documentos += 1
  })
  await p.goto(`${BASE}/v3/prueba-de-pagina`, { waitUntil: 'load', timeout: 300000 })
  await dormir(7000)
  const cargasAlEntrar = documentos
  // Una marca en el documento: una recarga la borra (la navegación cliente, no).
  await p.evaluate(() => {
    ;(window as unknown as { __marcaDelDocumento: string }).__marcaDelDocumento = 'entrada'
  })
  const fallas: string[] = []
  // 1 · De la página al home, con su enlace (la variante encendida: scroll a la mitad de la intro).
  await p.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.75, behavior: 'instant' }))
  await dormir(1500)
  fallas.push(...(await grabarUnaNavegacion(p, 'la página al home (su enlace)', () => p.getByText('Volver al home').first().click(), (r) => r === '/v3')))
  // 2 · Del home a la página: la flecha (B12a.7 la completa con la posición).
  // (Informada: el velo de la flecha llega con B12a.7.)
  await grabarUnaNavegacion(p, 'el home a la página (la flecha; informada, sin el velo hasta B12a.7)', () => p.goBack().then(() => undefined), (r) => r.startsWith('/v3/prueba-de-pagina'))
  await dormir(2000)
  // 3 · De la página a una sección del home, por la barra (en el teléfono, por el menú).
  if (!MOVIL) fallas.push(...(await grabarUnaNavegacion(p, 'la página a Portfolio (la barra)', () => p.locator('[data-pieza="barra"] a[data-nav-id="trabajos"]').click(), (r) => r === '/v3#trabajos')))
  const extra = documentos - cargasAlEntrar
  // Las navegaciones cliente no recargan: Playwright cuenta `framenavigated` también en `pushState`, así que se mira el documento.
  const mismo = await p.evaluate(() => (window as unknown as { __marcaDelDocumento?: string }).__marcaDelDocumento === 'entrada')
  console.log(`${mismo ? 'ok   ' : 'FALLA'} ${String(ANCHO)} · cargas de documento después de la entrada: ${mismo ? '0' : 'al menos 1'} (${String(extra)} cambios de URL, todos en el mismo documento)`)
  if (!mismo) fallas.push('recargo')
  await ctx.close()
  console.log(fallas.length === 0 ? 'navegacion: todo en verde' : `navegacion: ${String(fallas.length)} fallas`)
  if (fallas.length > 0) process.exitCode = 1
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
