/**
 * [B1] LA GRABACIÓN DE LOS VIDEOS DEL PORTFOLIO — cuadros con tiempo virtual por CDP, desde el sitio en producción.
 *
 * Un Chrome (el del sistema, la placa de alto rendimiento) por video y una página por tramo del guion (`guiones.ts`). Por tramo:
 *
 *   1. en tiempo real: la ruta (sólo GET), 3 s de espera, la limpieza (banners de cookies y burbujas de chat fuera: CSS inyectado y
 *      los fijos chicos de las esquinas de abajo) y una pasada lenta hasta lo más lejos del recorrido para despertar lo diferido;
 *      vuelta arriba;
 *   2. tiempo virtual en pausa (`Emulation.setVirtualTimePolicy`): cada cuadro mueve el scroll a su lugar del guion, avanza la página
 *      `PAGINA_POR_CUADRO_MS` (2×) y captura. Las animaciones por tiempo del sitio van al mismo reloj: sin tirones. Después de cada
 *      captura se re-emula el dispositivo (`Page.captureScreenshot` congela los pasos de render: la lección de CLAUDE.md).
 *
 * Ningún clic, ningún formulario, nada enviado. Sin cursor, sin marco, sin audio (`--mute-audio`; el video sale sin pista).
 * Los cuadros (PNG) van a `~/.cache/b4-medicion/b1-portfolio/<slug>-<dispositivo>/<tramo>/` y los borra `codificar.ts`.
 * `Runtime.evaluate` por CDP y no `page.evaluate`: con el tiempo virtual en pausa el de Playwright no vuelve. El scroll va con
 * `behavior: 'instant'`: con el `scroll-behavior: smooth` de un sitio (El Garage, con Lenis) el `scrollTo` se animaba y, en
 * tiempo virtual, no llegaba (829 px de desvío en la primera grabación).
 *
 *   SLUG=el-garage DISPOSITIVO=escritorio npx tsx scripts-portfolio/grabar.ts
 */
import { chromium, type BrowserContextOptions, type CDPSession } from '@playwright/test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  CARPETA_DE_CUADROS, GUIONES, PAGINA_POR_CUADRO_MS, PANTALLAS, SITIOS, scrollDelTramo, scrollMaximo, segundosDelTramo,
  type Dispositivo, type SlugGrabado,
} from './guiones'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const UA_DEL_TELEFONO =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

/** Lo que nunca va en un video: avisos de cookies y de consentimiento. Selectores genéricos, sin tocar el diseño del sitio. */
const CSS_DE_LIMPIEZA = [
  '[id*="cookie" i]', '[class*="cookie" i]', '[id*="consent" i]', '[class*="consent" i]', '[aria-label*="cookie" i]',
  'iframe[title*="chat" i]', 'iframe[src*="chat" i]',
].join(', ') + ' { display: none !important; }'

/** Las burbujas (chat, WhatsApp): fijas, chicas y en una esquina de abajo. Se esconden; el resto del sitio, tal cual. */
const SIN_BURBUJAS = `(() => {
  let n = 0
  for (const e of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(e)
    if (cs.position !== 'fixed') continue
    const r = e.getBoundingClientRect()
    const chica = r.width > 0 && r.width <= 120 && r.height > 0 && r.height <= 120
    const abajo = r.top > innerHeight * 0.6
    const esquina = r.left < innerWidth * 0.2 || r.right > innerWidth * 0.8
    if (chica && abajo && esquina) { e.style.setProperty('display', 'none', 'important'); n++ }
  }
  return n
})()`

function opcionesDe(dispositivo: Dispositivo): BrowserContextOptions {
  const p = PANTALLAS[dispositivo]
  const base: BrowserContextOptions = { viewport: { width: p.ancho, height: p.alto }, deviceScaleFactor: p.escala, locale: 'es-AR' }
  return dispositivo === 'movil' ? { ...base, isMobile: true, hasTouch: true, userAgent: UA_DEL_TELEFONO } : base
}

async function evaluar(cdp: CDPSession, expresion: string): Promise<unknown> {
  const { result } = await cdp.send('Runtime.evaluate', { expression: expresion, returnByValue: true })
  return result.value
}

const TOPE_REAL_MS = 4000

/** Una promesa con tope de tiempo REAL: `null` si no llegó. */
function conTope<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promesa, new Promise<null>((listo) => setTimeout(() => listo(null), ms))])
}

/**
 * Avanza la página `ms` de tiempo virtual. Devuelve si el presupuesto venció: en la primera tanda un cuadro del catálogo de El
 * Garage en el teléfono no venció nunca (la grabación quedó colgada en el cuadro 128); con el tope se sigue y se anota.
 */
async function avanzar(cdp: CDPSession, ms: number): Promise<boolean> {
  const vence = new Promise<true>((listo) => cdp.once('Emulation.virtualTimeBudgetExpired', () => listo(true)))
  await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: ms })
  return (await conTope(vence, TOPE_REAL_MS)) === true
}

interface Metricas {
  readonly width: number
  readonly height: number
  readonly deviceScaleFactor: number
  readonly mobile: boolean
}

/**
 * La captura, con tope y tres reintentos: re-emulando y avanzando la página un instante (16 ms virtuales) antes de cada uno. En el
 * catálogo de El Garage en el teléfono la captura no volvía (el cuadro 128 una vez, el 72 la otra): con el tiempo en pausa el
 * cuadro pendiente no se producía.
 */
async function capturar(cdp: CDPSession, metricas: Metricas): Promise<string> {
  for (let intento = 0; intento < 4; intento++) {
    const r = await conTope(cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true }), 2 * TOPE_REAL_MS)
    if (r !== null) return r.data
    await cdp.send('Emulation.setDeviceMetricsOverride', metricas)
    await avanzar(cdp, 16)
  }
  throw new Error('la captura no volvió cuatro veces seguidas')
}

async function main(): Promise<void> {
  const slug = (process.env.SLUG ?? '') as SlugGrabado
  const dispositivo = (process.env.DISPOSITIVO ?? '') as Dispositivo
  const guion = GUIONES[slug]?.[dispositivo]
  if (guion === undefined) throw new Error('SLUG (el-garage|esquina-estudio|banu-scents) y DISPOSITIVO (escritorio|movil)')
  const pantalla = PANTALLAS[dispositivo]
  const carpeta = path.join(CARPETA_DE_CUADROS, `${slug}-${dispositivo}`)
  rmSync(carpeta, { recursive: true, force: true })

  const navegador = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--force_high_performance_gpu', '--hide-scrollbars', '--mute-audio'],
  })
  const informe: Record<string, unknown>[] = []
  try {
    for (const [n, tramo] of guion.entries()) {
      const contexto = await navegador.newContext(opcionesDe(dispositivo))
      const pagina = await contexto.newPage()
      await pagina.goto(`${SITIOS[slug]}${tramo.ruta}`, { waitUntil: 'load', timeout: 90000 })
      await pagina.addStyleTag({ content: CSS_DE_LIMPIEZA })
      await pagina.waitForTimeout(3000)
      const lejos = scrollMaximo(tramo)
      for (let y = 0; y <= lejos + pantalla.alto; y += 300) {
        await pagina.evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' })`)
        await pagina.waitForTimeout(110)
      }
      await pagina.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
      await pagina.waitForTimeout(1800)
      const burbujas = await pagina.evaluate(SIN_BURBUJAS)

      const cdp = await contexto.newCDPSession(pagina)
      const metricas: Metricas = { width: pantalla.ancho, height: pantalla.alto, deviceScaleFactor: pantalla.escala, mobile: dispositivo === 'movil' }
      // La sesión nueva no hereda la escala del contexto: sin esto el primer cuadro de cada tramo salía a 390 × 844 en el teléfono.
      await cdp.send('Emulation.setDeviceMetricsOverride', metricas)
      await pagina.waitForTimeout(600)
      await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' })
      const dirDelTramo = path.join(carpeta, String(n))
      mkdirSync(dirDelTramo, { recursive: true })
      const cuadros = Math.round((segundosDelTramo(tramo) * 1000) / PAGINA_POR_CUADRO_MS)
      let desvioMaximo = 0
      const sinVencer: number[] = []
      for (let c = 0; c < cuadros; c++) {
        const y = scrollDelTramo(tramo, (c * PAGINA_POR_CUADRO_MS) / 1000)
        await evaluar(cdp, `window.scrollTo({ top: ${y}, behavior: 'instant' })`)
        if (!(await avanzar(cdp, PAGINA_POR_CUADRO_MS))) sinVencer.push(c)
        const data = await capturar(cdp, metricas)
        writeFileSync(path.join(dirDelTramo, `c${String(c).padStart(5, '0')}.png`), Buffer.from(data, 'base64'))
        await cdp.send('Emulation.setDeviceMetricsOverride', metricas)
        if (c % 15 === 0) desvioMaximo = Math.max(desvioMaximo, Math.abs(Number(await evaluar(cdp, 'scrollY')) - y))
      }
      informe.push({ tramo: n, ruta: tramo.ruta, cuadros, burbujasEscondidas: burbujas, desvioMaximoDelScroll: desvioMaximo, sinVencer })
      console.log(`[grabar] ${slug} ${dispositivo} tramo ${n} (${tramo.ruta}): ${cuadros} cuadros, desvío del scroll ≤ ${desvioMaximo} px, ${sinVencer.length} cuadros con el tiempo virtual sin vencer`)
      await contexto.close()
    }
    writeFileSync(path.join(carpeta, 'informe.json'), JSON.stringify({ slug, dispositivo, tramos: informe }, null, 1))
    writeFileSync(path.join(carpeta, 'completo'), '')
  } finally {
    await navegador.close()
  }
}

void main()
