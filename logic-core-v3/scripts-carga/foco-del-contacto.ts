/**
 * P-H26 · LA SONDA DEL FOCO AL CERRAR EL CONTACTO, en el home. Es la de servicios (`C:\paginas-servicios-datos\r1\scripts\diag-foco.cjs`,
 * con los pasos de `docs/servicios/SPRINT-R1.md` §5.1) con los tres disparadores del panel en `/v3`: el «Contacto» de la barra, el CTA
 * de un servicio y el CTA del final. Por cierre: llevar el disparador a la vista, 2 s, foco + Enter, esperar la hoja, 1,6 s, Esc, esperar
 * que se vaya, 1,5 s y mirar `document.activeElement`. Nunca envía el formulario ni llama a /api/*.
 *
 *   npx tsx scripts-carga/foco-del-contacto.ts <ancho: 1440|1024|390> <vueltas por disparador> [busqueda]
 *
 * El criterio: 0 cierres fuera del botón en 108 (1440 y 1024: la barra, el hero y el final × 12; 390, sin la barra: el CTA de un servicio y
 * el final × 18; el hero, además, donde esté). El control positivo es la
 * misma corrida con `?devolucion=un-cuadro` (la devolución de antes): tiene que volver a fallar (en servicios, ~25 %).
 */
import { rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL ?? 'http://localhost:3002'
const [anchoTxt = '1440', vueltasTxt = '12', busqueda = ''] = process.argv.slice(2)
const VENTANAS: Readonly<Record<string, readonly [number, number, boolean]>> = { '1440': [1440, 900, false], '1024': [1024, 768, false], '390': [390, 844, true] }
const DIALOGO = '[data-pieza="contacto"] [role="dialog"]'
/** El control que recibe el foco: el de adentro del envoltorio, como `focoDelOrigen`. */
const DISPARADORES = [
  { nombre: 'barra', selector: 'a[data-pieza="barra-enlace"][data-abre-contacto="panel"]' },
  { nombre: 'servicio', selector: ':is([data-pieza="cta-que-rota"], [data-pieza="cta-del-servicio"])[data-abre-contacto="panel"] :is(a, button)' },
  { nombre: 'final', selector: 'a[data-pieza="cta-en-volumen"][data-abre-contacto="panel"]' },
  // El «Hablemos» del hero: desde 1024 el CTA de cada servicio está escondido (`escritorio:hidden`) y el que rota no existe; el del hero es
  // el CTA de una sección que abre el panel.
  { nombre: 'hero', selector: 'a[data-pieza="cta"][data-abre-contacto="panel"]' },
] as const

interface Fila {
  readonly disparador: string
  readonly cierres: number
  readonly bien: number
  readonly fuera: readonly { readonly vuelta: number; readonly activo: string }[]
}

async function main(): Promise<void> {
  const ventana = VENTANAS[anchoTxt]
  if (ventana === undefined) throw new Error(`ancho sin ventana: ${anchoTxt}`)
  const [ancho, alto, movil] = ventana
  // El Chrome del sistema a la vista, como los demás arneses: el Chromium sin cabeza y sin GPU se caía a 390 («Page crashed», dos veces).
  const perfil = path.join(os.homedir(), `.cache/b4-medicion/foco-perfil-${String(Date.now())}`)
  rmSync(perfil, { recursive: true, force: true })
  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    isMobile: movil,
    hasTouch: movil,
    reducedMotion: 'no-preference',
    locale: 'es-AR',
    args: ['--force_high_performance_gpu', `--window-size=${String(ancho + 20)},${String(alto + 100)}`, '--window-position=0,0', '--no-first-run', '--no-default-browser-check', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion,Translate,MediaRouter'],
  })
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('home:intro', '1')
    } catch {
      // sin storage
    }
  })
  const page = ctx.pages()[0] ?? (await ctx.newPage())
  // Ninguna ruta real: `/api/` bloqueado (la sonda no envía nada, pero la página no llama a nada tampoco).
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  await cdp.send('Performance.enable')
  await page.goto(`${BASE}/v3${busqueda}`, { waitUntil: 'load', timeout: 300000 })
  await page.waitForSelector('[data-v3]', { timeout: 120000 })
  await page.waitForTimeout(4000)
  const filas: Fila[] = []
  // `SOLO=final,hero`: sólo esos disparadores (a 390 la página se cae después de ~21 aperturas seguidas: se corre en tandas).
  const solo = process.env.SOLO?.split(',') ?? null
  for (const d of DISPARADORES.filter((x) => solo === null || solo.includes(x.nombre))) {
    // El primero que se ve a este ancho (la barra no existe con el menú del teléfono).
    const indice = await page.evaluate((sel) => [...document.querySelectorAll(sel)].findIndex((e) => getComputedStyle(e).display !== 'none' && e.getClientRects().length > 0), d.selector)
    if (indice < 0) {
      console.log(`${anchoTxt}${busqueda} · ${d.nombre}: no está a este ancho`)
      continue
    }
    const boton = page.locator(d.selector).nth(indice)
    let bien = 0
    const fuera: { vuelta: number; activo: string }[] = []
    for (let v = 1; v <= Number(vueltasTxt); v++) {
      await boton.evaluate((e) => e.scrollIntoView({ block: 'center' }))
      // `PRIMERA_MS`: lo que espera la primera vuelta de cada disparador (la llegada del final tarda más que los 2 s de siempre).
      await page.waitForTimeout(v === 1 ? Number(process.env.PRIMERA_MS ?? '2000') : 2000)
      await boton.focus()
      await page.keyboard.press('Enter')
      const abrio = await page.waitForSelector(DIALOGO, { state: 'attached', timeout: 10000 }).then(
        () => true,
        () => false,
      )
      if (!abrio) {
        fuera.push({ vuelta: v, activo: 'NO ABRIÓ' })
        continue
      }
      await page.waitForTimeout(1600)
      await page.keyboard.press('Escape')
      await page.waitForSelector(DIALOGO, { state: 'detached', timeout: 10000 })
      await page.waitForTimeout(1500)
      const r = await boton.evaluate((e) => {
        const a = document.activeElement
        const pieza = a?.getAttribute('data-pieza') ?? a?.closest('[data-pieza]')?.getAttribute('data-pieza') ?? '?'
        return { enElBoton: a === e, activo: a === document.body ? 'BODY' : `${a?.tagName ?? 'null'}[${pieza}]` }
      })
      if (r.enElBoton) bien += 1
      else fuera.push({ vuelta: v, activo: r.activo })
      if (process.env.CADA === '1') {
        const { metrics } = (await cdp.send('Performance.getMetrics')) as { metrics: { name: string; value: number }[] }
        const heap = (metrics.find((m) => m.name === 'JSHeapUsedSize')?.value ?? 0) / 1048576
        const nodos = metrics.find((m) => m.name === 'Nodes')?.value ?? 0
        console.log(`  ${d.nombre} ${String(v)}: ${r.activo}${r.enElBoton ? ' (en el botón)' : ''} · heap ${heap.toFixed(0)} MB · nodos ${String(nodos)}`)
      }
    }
    filas.push({ disparador: d.nombre, cierres: Number(vueltasTxt), bien, fuera })
  }
  await ctx.close()
  for (const f of filas) console.log(`${anchoTxt}${busqueda} · ${f.disparador}: ${String(f.bien)} de ${String(f.cierres)} con el foco en el botón${f.fuera.length > 0 ? ` · fuera: ${JSON.stringify(f.fuera)}` : ''}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
