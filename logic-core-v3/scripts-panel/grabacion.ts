/**
 * LA GRABACIÓN DE LA GALERÍA DEL PANEL, A 1440.
 *
 *     npx tsx scripts-panel/grabacion.ts
 *
 * Scroll con la rueda por la grilla (parallax), un hover, ampliar, pasar dos
 * con la flecha, cerrar con Esc y bajar hasta la entrada de «Y más…». Rueda de
 * verdad y screencast, como `scripts-b4/s11-grabacion.ts`; el video se arma con
 * la duración real de cada cuadro. Toma el candado de Chrome y lo suelta siempre.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { MARCA_DE_INTRO, abrirPagina, cerrarPagina, medir } from '../scripts-b4/navegador'

const CANDADO = 'C:/Users/Valentino/.cache/b4-medicion/chrome.lock'
const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/panel/grabacion'
const CUADROS = `${SALIDA}/cuadros`
const ANCHO = 1440
const ALTO = 900

type Pagina = Awaited<ReturnType<typeof abrirPagina>>

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

function soltarCandado(): void {
  try {
    if (existsSync(CANDADO) && readFileSync(CANDADO, 'utf8').startsWith('PANEL')) rmSync(CANDADO)
  } catch {
    /* nada que soltar */
  }
}

async function tomarCandado(): Promise<void> {
  for (let i = 0; i < 60; i += 1) {
    if (!existsSync(CANDADO) || Date.now() - statSync(CANDADO).mtimeMs > 15 * 60 * 1000) {
      writeFileSync(CANDADO, `PANEL ${new Date().toISOString()}\n`)
      return
    }
    console.log('candado tomado por otro lane — espero 30 s')
    await esperar(30000)
  }
  throw new Error('el candado no se liberó')
}

async function rueda(p: Pagina, muescas: number, ms: number): Promise<void> {
  for (let k = 0; k < muescas; k += 1) {
    await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseWheel', x: ANCHO - 60, y: 60, deltaX: 0, deltaY: 100, pointerType: 'mouse' }, p.sessionId)
    await esperar(ms)
  }
}

async function mouse(p: Pagina, type: string, x: number, y: number): Promise<void> {
  await p.conexion.enviar('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, pointerType: 'mouse' }, p.sessionId)
}

async function tecla(p: Pagina, key: string, codigo: number): Promise<void> {
  for (const type of ['keyDown', 'keyUp']) await p.conexion.enviar('Input.dispatchKeyEvent', { type, key, code: key, windowsVirtualKeyCode: codigo }, p.sessionId)
}

async function principal(): Promise<void> {
  rmSync(CUADROS, { recursive: true, force: true })
  mkdirSync(CUADROS, { recursive: true })
  await tomarCandado()
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/panel-perfil', ancho: ANCHO, alto: ALTO + 120 })
  try {
    const p = await abrirPagina(chrome)
    await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: 1, mobile: false }, p.sessionId)
    await p.conexion.enviar('Emulation.setFocusEmulationEnabled', { enabled: true }, p.sessionId)
    await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: MARCA_DE_INTRO }, p.sessionId)
    await p.conexion.enviar('Page.navigate', { url: 'http://localhost:3010/v3' }, p.sessionId)
    await esperar(6000)
    // Al titular del panel, posado.
    await medir<number>(p, `(async () => { const s = document.querySelector('[data-pieza=galeria-del-panel]'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 500); await new Promise((r) => setTimeout(r, 2500)); return 1 })()`)

    const instantes: number[] = []
    let cuantos = 0
    p.conexion.al('Page.screencastFrame', (params) => {
      const meta = params.metadata as { timestamp?: number } | undefined
      instantes.push(meta?.timestamp ?? Date.now() / 1000)
      writeFileSync(path.join(CUADROS, `c${String(cuantos).padStart(5, '0')}.jpg`), Buffer.from(params.data as string, 'base64'))
      cuantos += 1
      void p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId as number }, p.sessionId)
    })
    await p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 72, maxWidth: ANCHO, maxHeight: ALTO, everyNthFrame: 1 }, p.sessionId)
    await esperar(800)
    console.log('parallax: bajando por la grilla')
    await rueda(p, 22, 200)
    await esperar(1200)
    console.log('hover sobre una tarjeta')
    const centro = await medir<[number, number]>(p, `(() => { let mejor = null, vis = 0; for (const m of document.querySelectorAll('[data-parte=marco]')) { const r = m.getBoundingClientRect(); const v = Math.min(r.bottom, ${ALTO}) - Math.max(r.top, 60); if (v > vis) { vis = v; mejor = r } } const arriba = Math.max(mejor.top, 60), abajo = Math.min(mejor.bottom, ${ALTO}); return [Math.round(mejor.left + mejor.width / 2), Math.round((arriba + abajo) / 2)] })()`)
    await mouse(p, 'mouseMoved', centro[0], centro[1])
    await esperar(1500)
    console.log('ampliar')
    await mouse(p, 'mousePressed', centro[0], centro[1])
    await mouse(p, 'mouseReleased', centro[0], centro[1])
    await esperar(1500)
    console.log('flechas')
    await tecla(p, 'ArrowRight', 39)
    await esperar(1100)
    await tecla(p, 'ArrowRight', 39)
    await esperar(1100)
    console.log('cerrar')
    await tecla(p, 'Escape', 27)
    await esperar(1500)
    await mouse(p, 'mouseMoved', ANCHO - 60, 60)
    console.log('bajando a «Y más…»')
    for (let k = 0; k < 80; k += 1) {
      const arriba = await medir<number>(p, `document.querySelector('[data-pieza=y-mas]').getBoundingClientRect().top`)
      if (arriba < 520) break
      await rueda(p, 1, 160)
    }
    await esperar(2500)
    await p.conexion.enviar('Page.stopScreencast', {}, p.sessionId)
    await esperar(400)

    const lineas: string[] = []
    for (let i = 0; i < cuantos; i += 1) {
      const dura = i + 1 < instantes.length ? Math.max(0.001, instantes[i + 1] - instantes[i]) : 1 / 30
      lineas.push(`file 'cuadros/c${String(i).padStart(5, '0')}.jpg'`, `duration ${dura.toFixed(4)}`)
    }
    writeFileSync(`${SALIDA}/cuadros.txt`, `${lineas.join('\n')}\n`)
    console.log(`cuadros: ${String(cuantos)}`)
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
    soltarCandado()
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    soltarCandado()
    console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
