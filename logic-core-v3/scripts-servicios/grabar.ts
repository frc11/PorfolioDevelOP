/**
 * [SERVICIOS M3] LA GRABACIÓN DE LAS DEMOS — cuadros con tiempo virtual por CDP, desde la url del catálogo del home.
 *
 * El enfoque de `scripts-portfolio/grabar.ts` (leído, no importado): un Chrome del sistema, una página por demo, el tiempo virtual en
 * pausa y, por cuadro, el scroll a su lugar del guion, la página avanzada `PAGINA_POR_CUADRO_MS` (2×) y la captura; después de cada
 * captura se re-emula el dispositivo (`Page.captureScreenshot` congela los pasos de render: la lección de CLAUDE.md). Ningún clic,
 * ningún formulario, nada enviado; sin audio.
 *
 * Antes del tiempo virtual, en tiempo real: la portada, 3 s, una pasada lenta hasta lo más lejos del guion para despertar lo
 * diferido y vuelta arriba (la apertura de la demo ya pasó: el clip es la portada asentada y el scroll). Skyline es UNA pantalla y una
 * SPA (un GET a otra ruta da 404): su clip es la portada quieta. Se probó grabar su apertura con el tiempo virtual en pausa desde
 * antes de navegar, y la carga no llega nunca (el evento load espera un reloj que no corre): queda anotado en el log del M3.
 *
 *   DEMO=ethereal DISPOSITIVO=escritorio npx tsx scripts-servicios/grabar.ts
 */
import { chromium, type CDPSession } from '@playwright/test'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  CARPETA_DE_CUADROS, CHROME, CSS_DE_LIMPIEZA, DEMOS_GRABADAS, GUIONES, PAGINA_POR_CUADRO_MS, PANTALLAS, opcionesDe, scrollDelGuion,
  scrollMaximo, segundosDelGuion, urlDeLaDemo, type DemoGrabada, type Dispositivo,
} from './guiones'

/** Las burbujas fijas de una esquina de abajo (chat, conserje, WhatsApp): se esconden. El resto de la demo, tal cual. */
const SIN_BURBUJAS = `(() => {
  let n = 0
  for (const e of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(e)
    if (cs.position !== 'fixed') continue
    const r = e.getBoundingClientRect()
    const chica = r.width > 0 && r.width <= 220 && r.height > 0 && r.height <= 120
    const abajo = r.top > innerHeight * 0.6
    const esquina = r.left < innerWidth * 0.2 || r.right > innerWidth * 0.8
    if (chica && abajo && esquina) { e.style.setProperty('display', 'none', 'important'); n++ }
  }
  return n
})()`

/**
 * El latido: con una portada quieta (Skyline) y el reloj en pausa no hay ningún cuadro nuevo que componer y la captura no vuelve. Un
 * punto fijo de 1 px, con opacidad 0,004, que cambia de color en cada cuadro, obliga a componer uno. No se ve en el video.
 */
const LATIDO = (c: number): string => `(() => {
  let e = document.getElementById('latido-de-la-grabacion')
  if (e === null) {
    e = document.createElement('div')
    e.id = 'latido-de-la-grabacion'
    e.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.004;pointer-events:none;z-index:2147483647'
    document.body.appendChild(e)
  }
  e.style.backgroundColor = ${c % 2 === 0 ? "'rgb(0,0,0)'" : "'rgb(1,1,1)'"}
})()`

const TOPE_REAL_MS = 4000

function conTope<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promesa, new Promise<null>((listo) => setTimeout(() => listo(null), ms))])
}

async function evaluar(cdp: CDPSession, expresion: string): Promise<unknown> {
  const { result } = await cdp.send('Runtime.evaluate', { expression: expresion, returnByValue: true })
  return result.value
}

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
  const demo = (process.env.DEMO ?? '') as DemoGrabada
  const dispositivo = (process.env.DISPOSITIVO ?? '') as Dispositivo
  if (!DEMOS_GRABADAS.includes(demo) || !(dispositivo in PANTALLAS)) throw new Error(`DEMO (${DEMOS_GRABADAS.join('|')}) y DISPOSITIVO (escritorio|movil)`)
  const guion = GUIONES[demo][dispositivo]
  const pantalla = PANTALLAS[dispositivo]
  const carpeta = path.join(CARPETA_DE_CUADROS, `${demo}-${dispositivo}`)
  rmSync(carpeta, { recursive: true, force: true })
  mkdirSync(carpeta, { recursive: true })

  const navegador = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force_high_performance_gpu', '--hide-scrollbars', '--mute-audio'] })
  try {
    const contexto = await navegador.newContext(opcionesDe(dispositivo))
    const pagina = await contexto.newPage()
    const cdp = await contexto.newCDPSession(pagina)
    const metricas: Metricas = { width: pantalla.ancho, height: pantalla.alto, deviceScaleFactor: pantalla.escala, mobile: dispositivo === 'movil' }
    await cdp.send('Emulation.setDeviceMetricsOverride', metricas)
    await pagina.goto(urlDeLaDemo(demo), { waitUntil: 'load', timeout: 90000 })
    await pagina.addStyleTag({ content: CSS_DE_LIMPIEZA })
    await pagina.waitForTimeout(3000)
    const lejos = scrollMaximo(guion)
    for (let y = 0; y <= lejos + pantalla.alto; y += 300) {
      await pagina.evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' })`)
      await pagina.waitForTimeout(110)
    }
    await pagina.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
    await pagina.waitForTimeout(1800)
    const burbujas = Number(await pagina.evaluate(SIN_BURBUJAS))
    await cdp.send('Emulation.setDeviceMetricsOverride', metricas)
    await pagina.waitForTimeout(600)
    await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' })

    const cuadros = Math.round((segundosDelGuion(guion) * 1000) / PAGINA_POR_CUADRO_MS)
    let desvioMaximo = 0
    const sinVencer: number[] = []
    for (let c = 0; c < cuadros; c++) {
      const y = scrollDelGuion(guion, (c * PAGINA_POR_CUADRO_MS) / 1000)
      await evaluar(cdp, `window.scrollTo({ top: ${y}, behavior: 'instant' })`)
      await evaluar(cdp, LATIDO(c))
      if (!(await avanzar(cdp, PAGINA_POR_CUADRO_MS))) sinVencer.push(c)
      const data = await capturar(cdp, metricas)
      writeFileSync(path.join(carpeta, `c${String(c).padStart(5, '0')}.png`), Buffer.from(data, 'base64'))
      await cdp.send('Emulation.setDeviceMetricsOverride', metricas)
      if (c % 15 === 0) desvioMaximo = Math.max(desvioMaximo, Math.abs(Number(await evaluar(cdp, 'scrollY')) - y))
    }
    const informe = { demo, dispositivo, url: urlDeLaDemo(demo), cuadros, burbujasEscondidas: burbujas, desvioMaximoDelScroll: desvioMaximo, sinVencer }
    writeFileSync(path.join(carpeta, 'informe.json'), JSON.stringify(informe, null, 1))
    writeFileSync(path.join(carpeta, 'completo'), '')
    console.log(`[grabar] ${demo} ${dispositivo}: ${cuadros} cuadros, desvío del scroll ≤ ${desvioMaximo} px, ${sinVencer.length} sin vencer, ${burbujas} burbujas escondidas`)
    await contexto.close()
  } finally {
    await navegador.close()
  }
}

main().catch((error: unknown) => {
  console.error('[grabar] error:', error)
  process.exit(1)
})
