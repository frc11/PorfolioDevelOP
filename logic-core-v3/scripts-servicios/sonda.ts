/**
 * [SERVICIOS M3] LA SONDA DE LAS DEMOS — antes de grabar (M0 §4.3): el alto de cada demo y si graba limpia en tiempo virtual.
 *
 * Por demo y por dispositivo: GET de la portada, 3 s de espera, el alto del documento (`scrollHeight`), una captura arriba y otra a
 * media página, y una prueba corta del tiempo virtual (diez cuadros: si el presupuesto vence y la captura vuelve). Ningún clic,
 * ningún formulario. Las capturas y el informe van fuera del repo (`C:\paginas-servicios-datos\m3\sonda\`).
 *
 *   npx tsx scripts-servicios/sonda.ts
 */
import { chromium, type CDPSession } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { CHROME, CSS_DE_LIMPIEZA, DEMOS_GRABADAS, PAGINA_POR_CUADRO_MS, PANTALLAS, opcionesDe, urlDeLaDemo, type Dispositivo } from './guiones'

const SALIDA = path.join('C:\\paginas-servicios-datos', 'm3', 'sonda')

async function evaluar(cdp: CDPSession, expresion: string): Promise<unknown> {
  const { result } = await cdp.send('Runtime.evaluate', { expression: expresion, returnByValue: true })
  return result.value
}

function conTope<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promesa, new Promise<null>((listo) => setTimeout(() => listo(null), ms))])
}

async function main(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const navegador = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force_high_performance_gpu', '--hide-scrollbars', '--mute-audio'] })
  const informe: Record<string, unknown>[] = []
  try {
    for (const demo of DEMOS_GRABADAS) {
      for (const dispositivo of ['escritorio', 'movil'] as const satisfies readonly Dispositivo[]) {
        const contexto = await navegador.newContext(opcionesDe(dispositivo))
        const pagina = await contexto.newPage()
        const t0 = Date.now()
        await pagina.goto(urlDeLaDemo(demo), { waitUntil: 'load', timeout: 90000 })
        await pagina.addStyleTag({ content: CSS_DE_LIMPIEZA })
        await pagina.waitForTimeout(3000)
        const alto = Number(await pagina.evaluate('document.documentElement.scrollHeight'))
        await pagina.screenshot({ path: path.join(SALIDA, `${demo}-${dispositivo}-arriba.png`) })
        await pagina.evaluate(`window.scrollTo({ top: ${Math.round(alto / 2)}, behavior: 'instant' })`)
        await pagina.waitForTimeout(1500)
        await pagina.screenshot({ path: path.join(SALIDA, `${demo}-${dispositivo}-medio.png`) })
        await pagina.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
        await pagina.waitForTimeout(800)

        const cdp = await contexto.newCDPSession(pagina)
        const p = PANTALLAS[dispositivo]
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: p.ancho, height: p.alto, deviceScaleFactor: p.escala, mobile: dispositivo === 'movil' })
        await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' })
        let vencidos = 0
        let capturas = 0
        for (let c = 0; c < 10; c++) {
          await evaluar(cdp, `window.scrollTo({ top: ${c * 40}, behavior: 'instant' })`)
          const vence = new Promise<true>((listo) => cdp.once('Emulation.virtualTimeBudgetExpired', () => listo(true)))
          await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: PAGINA_POR_CUADRO_MS })
          if ((await conTope(vence, 4000)) === true) vencidos++
          if ((await conTope(cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true }), 8000)) !== null) capturas++
          await cdp.send('Emulation.setDeviceMetricsOverride', { width: p.ancho, height: p.alto, deviceScaleFactor: p.escala, mobile: dispositivo === 'movil' })
        }
        const fila = { demo, dispositivo, alto, segundosDeCarga: Number(((Date.now() - t0) / 1000).toFixed(1)), tiempoVirtual: { cuadros: 10, vencidos, capturas } }
        informe.push(fila)
        console.log(`[sonda] ${JSON.stringify(fila)}`)
        await contexto.close()
      }
    }
  } finally {
    await navegador.close()
  }
  writeFileSync(path.join(SALIDA, 'informe.json'), `${JSON.stringify(informe, null, 1)}\n`)
}

void main()
