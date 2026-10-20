/**
 * P-H26 · LA SONDA DEL FOCO AL CERRAR EL CONTACTO, en el home. Es la de servicios (`C:\paginas-servicios-datos\r1\scripts\diag-foco.cjs`,
 * con los pasos de `docs/servicios/SPRINT-R1.md` §5.1) con los tres disparadores del panel en `/v3`: el «Contacto» de la barra, el CTA
 * de un servicio y el CTA del final. Por cierre: llevar el disparador a la vista, 2 s, foco + Enter, esperar la hoja, 1,6 s, Esc, esperar
 * que se vaya, 1,5 s y mirar `document.activeElement`. Nunca envía el formulario ni llama a /api/*.
 *
 *   npx tsx scripts-carga/foco-del-contacto.ts <ancho: 1440|1024|390> <vueltas por disparador> [busqueda]
 *
 * El criterio: 0 cierres fuera del botón en 108 (1440 y 1024: 3 disparadores × 12; 390, sin la barra: 2 × 18). El control positivo es la
 * misma corrida con `?devolucion=un-cuadro` (la devolución de antes): tiene que volver a fallar (en servicios, ~25 %).
 */
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
  const browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--force-color-profile=srgb', '--disable-gpu', '--disable-software-rasterizer'] })
  const ctx = await browser.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil, reducedMotion: 'no-preference', locale: 'es-AR' })
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('home:intro', '1')
    } catch {
      // sin storage
    }
  })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/v3${busqueda}`, { waitUntil: 'load', timeout: 300000 })
  await page.waitForSelector('[data-v3]', { timeout: 120000 })
  await page.waitForTimeout(4000)
  const filas: Fila[] = []
  for (const d of DISPARADORES) {
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
      await page.waitForTimeout(2000)
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
    }
    filas.push({ disparador: d.nombre, cierres: Number(vueltasTxt), bien, fuera })
  }
  await browser.close()
  for (const f of filas) console.log(`${anchoTxt}${busqueda} · ${f.disparador}: ${String(f.bien)} de ${String(f.cierres)} con el foco en el botón${f.fuera.length > 0 ? ` · fuera: ${JSON.stringify(f.fuera)}` : ''}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
