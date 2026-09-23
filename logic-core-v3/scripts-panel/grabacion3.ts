/**
 * LA GRABACIÓN DEL REMATE (SPRINT PANEL 3), A 1440.
 *
 *     npx tsx scripts-panel/grabacion3.ts
 *
 * La entrada del título, el recorrido del caos, un hover, una ampliación, el
 * remate con el newsletter, y la vuelta hacia arriba (que se vayan). Rueda de
 * verdad y screencast, como `scripts-b4/s11-grabacion.ts`; el video se arma con
 * la duración real de cada cuadro. Toma el candado de Chrome y lo suelta siempre.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { MARCA_DE_INTRO, abrirPagina, cerrarPagina, medir } from '../scripts-b4/navegador'

const CANDADO = 'C:/Users/Valentino/.cache/b4-medicion/chrome.lock'
const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/panel/grabacion3'
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

async function rueda(p: Pagina, muescas: number, ms: number, sentido: 1 | -1 = 1): Promise<void> {
  for (let k = 0; k < muescas; k += 1) {
    await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseWheel', x: ANCHO - 60, y: 60, deltaX: 0, deltaY: 100 * sentido, pointerType: 'mouse' }, p.sessionId)
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
    await medir<number>(p, `(async () => { const r = document.querySelector('[data-pieza=remate-del-panel]'); window.scrollTo(0, r.getBoundingClientRect().top + scrollY - 1300); await new Promise((x) => setTimeout(x, 2500)); return 1 })()`)

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
    const estado = (): Promise<string> =>
      medir<string>(p, `(() => { const r = document.querySelector('[data-pieza=remate-del-panel]'); const f = r.querySelector('[data-pieza=y-mas] span'); const q = r.getBoundingClientRect(); return 'tope ' + Math.round(q.top) + ' · frase ' + getComputedStyle(f).transform + ' · visible ' + getComputedStyle(r.querySelector('[data-pieza=y-mas]')).visibility })()`)
    await esperar(800)
    console.log('antes:', await estado())
    console.log('bajando hasta pasar la línea')
    for (let k = 0; k < 40; k += 1) {
      const t = await medir<number>(p, `document.querySelector('[data-pieza=remate-del-panel]').getBoundingClientRect().top`)
      if (t < 380) break
      await rueda(p, 1, 220)
    }
    await esperar(2600)
    console.log('llegó:', await estado())
    console.log('lo paso bajando: sale por arriba')
    await rueda(p, 12, 220)
    await esperar(1500)
    console.log('pasado:', await estado())
    console.log('vuelvo a subir hasta verlo: tiene que seguir puesto')
    await rueda(p, 10, 220, -1)
    await esperar(1500)
    console.log('de vuelta:', await estado())
    console.log('subo por encima de la línea: entrada al revés')
    for (let k = 0; k < 40; k += 1) {
      const t = await medir<number>(p, `document.querySelector('[data-pieza=remate-del-panel]').getBoundingClientRect().top`)
      if (t > ALTO * 0.8) break
      await rueda(p, 1, 220, -1)
    }
    await esperar(2800)
    console.log('se fue:', await estado())
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
