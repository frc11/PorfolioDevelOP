/**
 * SPRINT INTERFAZ 1 · T3 — el foco de teclado, control por control: foco.ts <rótulo> [ancho] [alto] [consulta]
 *
 * Desde arriba, Tab de verdad (CDP) hasta que el foco vuelve al primero (o 160 pulsaciones), esperando en cada paso a
 * que el scroll se asiente (Lenis lleva el foco de lejos; la capa de herramientas de Next, que sólo existe en desarrollo,
 * se salta). En cada paso: qué tiene el
 * foco (etiqueta, nombre, caja, si coincide con `:focus-visible`), cómo es su anillo según los estilos computados (estilo,
 * grosor, color, desplazamiento), si algún ancestro lo mezcla (`mix-blend-mode`) o lo recorta (`overflow` distinto de
 * visible), y una captura ENTERA del cuadro (sin `clip`: el recorte apaga estados) que después recorta `foco-hoja.py`.
 * Después de cada captura se re-emula el cuadro (`Page.captureScreenshot` congela los pasos de render, CLAUDE.md).
 * Va a `interfaz1/t3-completitud/foco-<ancho>-<rótulo>/` (`pasos.json` y una PNG por paso).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, carpeta, correr, esperar, tecla } from './banco'

const ROTULO = process.argv[2] ?? 'antes'
const [ANCHO, ALTO] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]
const CONSULTA = process.argv[5] ?? ''
const TOPE = 160

export const LEER = `(() => {
  const el = document.activeElement
  if (!el || el === document.body || el === document.documentElement) return { nada: true }
  if (el.tagName === 'NEXTJS-PORTAL') return { nada: true, portal: true }
  const r = el.getBoundingClientRect()
  const s = getComputedStyle(el)
  let fondo = null, mezcla = null, recorta = null, seccion = null
  for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
    const e = getComputedStyle(a)
    if (fondo === null && e.backgroundColor && e.backgroundColor !== 'rgba(0, 0, 0, 0)' && e.backgroundColor !== 'transparent') fondo = e.backgroundColor
    if (mezcla === null && e.mixBlendMode && e.mixBlendMode !== 'normal') mezcla = e.mixBlendMode
    if (recorta === null && a !== el && (e.overflowX !== 'visible' || e.overflowY !== 'visible') && (e.overflowX !== 'auto' && e.overflowY !== 'auto')) recorta = e.overflowX + '/' + e.overflowY
    if (seccion === null && a.getAttribute && a.getAttribute('data-seccion')) seccion = a.getAttribute('data-seccion')
  }
  const panel = el.closest('[data-panel]')
  const nombre = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.getAttribute('name') || '').replace(/\\s+/g, ' ').trim().slice(0, 50)
  return {
    nada: false,
    tag: el.tagName, tipo: el.getAttribute('type'), pieza: el.getAttribute('data-pieza'), panel: panel ? panel.getAttribute('data-panel') : null,
    nombre, focoVisible: el.matches(':focus-visible'),
    caja: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
    escala: el.offsetWidth > 0 ? Math.round((r.width / el.offsetWidth) * 1000) / 1000 : 1,
    anillo: { estilo: s.outlineStyle, grosor: s.outlineWidth, color: s.outlineColor, desplazamiento: s.outlineOffset, sombra: s.boxShadow },
    fondo, mezcla, recorta, seccion,
    enDialogo: !!el.closest('[role="dialog"]'),
    clave: el.tagName + '|' + nombre + '|' + (panel ? panel.getAttribute('data-panel') : '-'),
  }
})()`

if (process.argv[1]?.endsWith('foco.ts')) correr(async () => {
  const dir = `${carpeta('t3-completitud')}/foco-${String(ANCHO)}-${ROTULO}`
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const b = await abrir(ANCHO, ALTO, { consulta: CONSULTA })
  const reemular = (): Promise<unknown> => b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: 1, mobile: ANCHO < 1024, screenWidth: ANCHO, screenHeight: ALTO }, b.p.sessionId)
  /** Espera a que el scroll no se mueva en 3 lecturas seguidas (y 900 ms como mínimo: el rollover del foco tarda 1,3 s en total). */
  const asentar = async (): Promise<void> => {
    await esperar(900)
    let antes = -1
    for (let quietos = 0, n = 0; quietos < 3 && n < 40; n += 1) {
      const y = await medir<number>(b.p, 'Math.round(scrollY)')
      quietos = y === antes ? quietos + 1 : 0
      antes = y
      await esperar(120)
    }
    await esperar(300)
  }
  try {
    await medir(b.p, 'window.scrollTo(0, 0)')
    await esperar(1500)
    const pasos: Record<string, unknown>[] = []
    let primera: string | null = null
    for (let k = 0; k < TOPE; k += 1) {
      await tecla(b, 'Tab')
      await asentar()
      const info = await medir<Record<string, unknown> & { nada: boolean; portal?: boolean; clave?: string }>(b.p, LEER)
      if (info.portal === true) continue
      if (!info.nada && info.clave === primera) break
      if (primera === null && !info.nada) primera = info.clave ?? null
      const png = `${String(k).padStart(3, '0')}.png`
      const cap = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
      writeFileSync(`${dir}/${png}`, Buffer.from(cap.data, 'base64'))
      await reemular()
      pasos.push({ paso: k, png, ...info })
    }
    writeFileSync(`${dir}/pasos.json`, JSON.stringify({ rotulo: ROTULO, ancho: ANCHO, alto: ALTO, placa: b.placa, pasos }, null, 1))
    console.log(`${String(pasos.length)} pasos`)
  } finally {
    await b.cerrar()
  }
})
