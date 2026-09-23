/**
 * LA GRABACIÓN DE LAS DEMOS, A 1440 — una sola, de punta a punta.
 *
 *     npx tsx scripts-b4/demos-grabacion.ts
 *
 * SPRINT DEMOS 2: la entrada de demos bajando → subir y volver a bajar por la
 * entrada → abrir una demo → cerrarla con la cruz → abrir otra → cerrar con Esc.
 * Rueda de verdad y screencast con la duración real de cada cuadro, como
 * `s11-grabacion.ts`. ⚠️ Usa Chrome: tomar el candado antes.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const PERFIL = perfilPorId('1440')
const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/demos2-grabacion'
const CUADROS = `${SALIDA}/cuadros`
const MS_POR_MUESCA = 250
const PX_DE_LA_SECCION = 6813

type Pagina = Awaited<ReturnType<typeof abrirPagina>>
const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function mouse(p: Pagina, x: number, y: number): Promise<void> {
  await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, pointerType: 'mouse' }, p.sessionId)
}
/** El puntero viaja de un punto a otro en `pasos`, como una mano. */
async function viajar(p: Pagina, de: readonly [number, number], a: readonly [number, number], ms: number): Promise<void> {
  const pasos = Math.max(1, Math.round(ms / 30))
  for (let k = 1; k <= pasos; k += 1) {
    await mouse(p, de[0] + ((a[0] - de[0]) * k) / pasos, de[1] + ((a[1] - de[1]) * k) / pasos)
    await esperar(30)
  }
}
async function clic(p: Pagina, x: number, y: number): Promise<void> {
  await mouse(p, x, y)
  await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }, p.sessionId)
  await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }, p.sessionId)
}
async function rueda(p: Pagina, x: number, y: number, muescas: number, signo: 1 | -1): Promise<void> {
  for (let k = 0; k < muescas; k += 1) {
    await p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: signo * 100, pointerType: 'mouse' }, p.sessionId)
    await esperar(MS_POR_MUESCA)
  }
}
async function hasta(p: Pagina, y: number, signo: 1 | -1, x: number, yPuntero: number): Promise<void> {
  for (let k = 0; k < 200; k += 1) {
    const ahora = await medir<number>(p, 'window.scrollY')
    if (signo > 0 ? ahora >= y : ahora <= y) return
    await rueda(p, x, yPuntero, 1, signo)
  }
}

async function principal(): Promise<void> {
  rmSync(CUADROS, { recursive: true, force: true })
  mkdirSync(CUADROS, { recursive: true })
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/demos-grabacion-perfil', ancho: PERFIL.ancho, alto: PERFIL.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, PERFIL)
    const t = (await paneles(p)).find((s) => s.id === 'trabajos')
    if (t === undefined) throw new Error('falta trabajos')
    const cero = t.top - PERFIL.alto
    const yDe = (px: number): number => Math.round(cero + (px / PX_DE_LA_SECCION) * t.alto)
    await medir<number>(p, `(async () => { for (let y = ${String(cero - 1500)}; y <= ${String(yDe(3750))}; y += 150) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } const h = performance.now() + 3000; while (performance.now() < h) { window.scrollTo(0, ${String(yDe(3750))}); await new Promise((r) => setTimeout(r, 40)) } return 1 })()`)
    await mouse(p, 60, 860)

    const instantes: number[] = []
    let cuantos = 0
    p.conexion.al('Page.screencastFrame', (params) => {
      const meta = params.metadata as { timestamp?: number } | undefined
      instantes.push(meta?.timestamp ?? Date.now() / 1000)
      writeFileSync(path.join(CUADROS, `c${String(cuantos).padStart(5, '0')}.jpg`), Buffer.from(params.data as string, 'base64'))
      cuantos += 1
      void p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId as number }, p.sessionId)
    })
    await p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 72, maxWidth: PERFIL.ancho, maxHeight: PERFIL.alto, everyNthFrame: 1 }, p.sessionId)
    await esperar(800)

    console.log('1 · la entrada de demos, bajando')
    await hasta(p, yDe(5000), 1, 1380, 860)
    await esperar(1500)

    console.log('2 · subir por la entrada y volver a bajar')
    await hasta(p, yDe(4100), -1, 1380, 860)
    await esperar(1200)
    await hasta(p, yDe(5000), 1, 1380, 860)
    await esperar(1800)

    const piezas = await medir<{ x: number; y: number }[]>(p, `[...document.querySelectorAll('[data-pieza="libro"]')].map((a) => { const r = a.getBoundingClientRect(); return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.6 } })`)

    console.log('3 · abrir una demo y cerrarla')
    await viajar(p, [1380, 860], [piezas[1].x, piezas[1].y], 700)
    await esperar(600)
    await clic(p, piezas[1].x, piezas[1].y)
    await esperar(3800)
    const cruz = await medir<{ x: number; y: number }>(p, `(() => { const b = [...document.querySelectorAll('[role="dialog"] button')].pop(); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)
    await viajar(p, [piezas[1].x, piezas[1].y], [cruz.x, cruz.y], 600)
    await clic(p, cruz.x, cruz.y)
    await esperar(1600)

    console.log('4 · abrir otra y cerrar con Esc')
    await viajar(p, [cruz.x, cruz.y], [piezas[6].x, piezas[6].y], 700)
    await esperar(600)
    await clic(p, piezas[6].x, piezas[6].y)
    await esperar(3800)
    await p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, p.sessionId)
    await p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, p.sessionId)
    await esperar(1800)

    await p.conexion.enviar('Page.stopScreencast', {}, p.sessionId)
    await esperar(400)
    const lineas: string[] = []
    for (let i = 0; i < cuantos; i += 1) {
      const dura = i + 1 < instantes.length ? Math.max(0.001, instantes[i + 1] - instantes[i]) : 1 / 30
      lineas.push(`file 'cuadros/c${String(i).padStart(5, '0')}.jpg'`, `duration ${dura.toFixed(4)}`)
    }
    writeFileSync(`${SALIDA}/cuadros.txt`, `${lineas.join('\n')}\n`)
    const total = instantes.length > 1 ? instantes[instantes.length - 1] - instantes[0] : 0
    console.log(`cuadros: ${String(cuantos)} en ${total.toFixed(1)} s`)
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
