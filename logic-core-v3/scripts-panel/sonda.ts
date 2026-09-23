/**
 * SONDA DEL LANE PANEL — un Chrome propio por CDP que corre una lista de pasos.
 *
 *     npx tsx scripts-panel/sonda.ts <pasos.json> <salida.json>
 *
 * Los pasos: `{ ir, ancho, alto, movil? }` abre la página; `{ js }` evalúa y
 * guarda el resultado; `{ puntero: [x, y] }` mueve el mouse; `{ rueda }` gira la
 * rueda; `{ tecla }` aprieta una tecla; `{ esperar }` en ms; `{ captura }` guarda
 * un PNG. Toma el candado de Chrome compartido entre lanes y lo suelta SIEMPRE.
 */

import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, medir } from '../scripts-b4/navegador'

const CANDADO = 'C:/Users/Valentino/.cache/b4-medicion/chrome.lock'
const QUINCE_MIN = 15 * 60 * 1000

interface Paso {
  readonly ir?: string
  readonly ancho?: number
  readonly alto?: number
  readonly movil?: boolean
  readonly marca?: string
  readonly js?: string
  readonly nombre?: string
  readonly puntero?: readonly [number, number]
  readonly click?: readonly [number, number]
  readonly rueda?: number
  readonly tecla?: string
  readonly esperar?: number
  readonly captura?: string
}

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function tomarCandado(): Promise<void> {
  for (let i = 0; i < 60; i += 1) {
    if (!existsSync(CANDADO) || Date.now() - statSync(CANDADO).mtimeMs > QUINCE_MIN) {
      writeFileSync(CANDADO, `PANEL ${new Date().toISOString()}\n`)
      return
    }
    console.log(`candado tomado por otro lane: ${readFileSync(CANDADO, 'utf8').trim()} — espero 30 s`)
    await esperar(30000)
  }
  throw new Error('el candado no se liberó en 30 min')
}

function soltarCandado(): void {
  try {
    if (existsSync(CANDADO) && readFileSync(CANDADO, 'utf8').startsWith('PANEL')) rmSync(CANDADO)
  } catch {
    /* nada que soltar */
  }
}

async function principal(): Promise<void> {
  const [archivo, salida] = process.argv.slice(2)
  const pasos = JSON.parse(readFileSync(archivo, 'utf8')) as Paso[]
  const resultados: Record<string, unknown> = {}
  await tomarCandado()
  const primero = pasos.find((p) => p.ancho !== undefined)
  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/panel-perfil',
    ancho: primero?.ancho ?? 1440,
    alto: (primero?.alto ?? 900) + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    let n = 0
    for (const paso of pasos) {
      if (paso.ir !== undefined) {
        const ancho = paso.ancho ?? 1440
        const alto = paso.alto ?? 900
        const movil = paso.movil === true
        await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: movil, screenWidth: ancho, screenHeight: alto }, p.sessionId)
        await p.conexion.enviar('Emulation.setTouchEmulationEnabled', { enabled: movil, maxTouchPoints: 5 }, p.sessionId)
        await p.conexion.enviar('Emulation.setFocusEmulationEnabled', { enabled: true }, p.sessionId)
        if (paso.marca !== undefined) await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: paso.marca }, p.sessionId)
        await p.conexion.enviar('Page.navigate', { url: paso.ir }, p.sessionId)
        await esperar(6000)
        const vis = await medir<string>(p, 'document.visibilityState + " " + window.innerWidth')
        console.log(`abierta ${paso.ir} · ${vis}`)
      }
      if (paso.js !== undefined) {
        const r = await medir<unknown>(p, paso.js)
        resultados[paso.nombre ?? `paso${String(n)}`] = r
      }
      if (paso.puntero !== undefined) {
        await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x: paso.puntero[0], y: paso.puntero[1], pointerType: 'mouse' }, p.sessionId)
      }
      if (paso.click !== undefined) {
        for (const type of ['mousePressed', 'mouseReleased']) {
          await p.conexion.enviar('Input.dispatchMouseEvent', { type, x: paso.click[0], y: paso.click[1], button: 'left', clickCount: 1, pointerType: 'mouse' }, p.sessionId)
        }
      }
      if (paso.rueda !== undefined) {
        await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY: paso.rueda, pointerType: 'mouse' }, p.sessionId)
      }
      if (paso.tecla !== undefined) {
        const codigos: Record<string, number> = { Escape: 27, ArrowRight: 39, ArrowLeft: 37, Enter: 13, Tab: 9 }
        for (const type of ['keyDown', 'keyUp']) {
          await p.conexion.enviar('Input.dispatchKeyEvent', { type, key: paso.tecla, code: paso.tecla, windowsVirtualKeyCode: codigos[paso.tecla] ?? 0 }, p.sessionId)
        }
      }
      if (paso.esperar !== undefined) await esperar(paso.esperar)
      if (paso.captura !== undefined) {
        const { data } = (await p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, p.sessionId)) as { data: string }
        writeFileSync(paso.captura, Buffer.from(data, 'base64'))
        // `captureScreenshot` congela los pasos de render: se re-emula (CLAUDE.md, sep 2026).
        const ultimo = pasos.find((q) => q.ir !== undefined)
        await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ultimo?.ancho ?? 1440, height: ultimo?.alto ?? 900, deviceScaleFactor: 1, mobile: ultimo?.movil === true }, p.sessionId)
      }
      n += 1
    }
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
    soltarCandado()
  }
  writeFileSync(salida, JSON.stringify(resultados, null, 2))
  console.log(`listo: ${salida}`)
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    soltarCandado()
    console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
