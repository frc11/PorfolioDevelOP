/**
 * (npx tsx scripts-pasada/b3-tu-panel.ts [salida] [cpu] [rotulo] [panel] [bandera])
 * PASADA FINAL · B3 — cuánto cuesta Tu panel: un scroll suave de ida (y otro de vuelta) por la sección entera, con un
 * muestreador de cuadros (rAF) y de tareas largas (PerformanceObserver longtask) inyectado antes de la página.
 *   · cuadros perdidos: huecos entre rAF > 1,5 cuadros (25 ms a 60 Hz); p95 y máximo del hueco; cuántos > 50 ms;
 *   · tareas largas: cuántas y cuánto suman, durante el recorrido;
 *   · con `cpu=4`, lo mismo con la CPU ×4.
 * Antes de medir, un paseo de ida por la sección para montar las ocho demos (las perezosas): lo que se mide es el
 * scroll por una sección ya cargada, que es lo que se siente al volver a pasar. Sale a la carpeta del argumento.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { abrirBanco, esperar } from '../scripts-viajes/banco'
import { scrollSuave } from '../scripts-escena/clips6'
import { medir } from '../scripts-b4/navegador'

const SALIDA = process.argv[2] ?? 'C:/Users/Valentino/.cache/b4-medicion/pasada-final/b3'
const CPU = Number(process.argv[3] ?? '1')
const ROTULO = process.argv[4] ?? 'antes'
const PANEL = process.argv[5] ?? 'tu-panel'
const BANDERA = process.argv[6] ?? ''
const ALTO = 900

const MUESTREADOR = `(() => {
  const m = { huecos: [], largas: [], activo: false, t0: 0 }
  window.__cuadrosB3 = m
  let ultimo = performance.now()
  const paso = (t) => { if (m.activo) m.huecos.push(Math.round((t - ultimo) * 10) / 10); ultimo = t; requestAnimationFrame(paso) }
  requestAnimationFrame(paso)
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (m.activo) m.largas.push(Math.round(e.duration)) }).observe({ type: 'longtask', buffered: false }) } catch (e) {}
  window.__empezarB3 = () => { m.huecos = []; m.largas = []; m.activo = true; m.t0 = performance.now(); ultimo = performance.now() }
  window.__pararB3 = () => { m.activo = false; return { ms: Math.round(performance.now() - m.t0), huecos: m.huecos, largas: m.largas } }
})()`

interface Lectura { ms: number; huecos: number[]; largas: number[] }
type B = Awaited<ReturnType<typeof abrirBanco>>

function resumen(nombre: string, l: Lectura): Record<string, unknown> {
  const h = [...l.huecos].sort((a, b) => a - b)
  const p = (q: number): number => h[Math.min(h.length - 1, Math.floor(q * h.length))] ?? 0
  return {
    nombre,
    ms: l.ms,
    cuadros: h.length,
    perdidos: h.filter((x) => x > 25).length,
    graves: h.filter((x) => x > 50).length,
    p50: p(0.5),
    p95: p(0.95),
    maximo: h[h.length - 1] ?? 0,
    tareasLargas: l.largas.length,
    msEnTareasLargas: l.largas.reduce((a, b) => a + b, 0),
    peorTarea: Math.max(0, ...l.largas),
  }
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const b = await abrirBanco(1440, ALTO, { perfil: 'pasada', antesDeCargar: `window.__entornoDeLaEscena = 'producto'; window.__b3 = '${BANDERA}'; ${MUESTREADOR}` })
  const s = b.p.sessionId
  const salidas: Record<string, unknown>[] = []
  try {
    const seccion = await medir<{ top: number; alto: number }>(b.p, `(() => { const s = document.querySelector('[data-panel="${PANEL}"]'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), alto: Math.round(r.height) } })()`)
    const desde = seccion.top - ALTO
    const hasta = seccion.top + seccion.alto
    // Paseo de montaje: las demos perezosas llegan y se arman (no se mide).
    await medir(b.p, `scrollTo(0, ${String(desde)})`)
    await esperar(1500)
    await scrollSuave(b, desde, hasta, 9000)
    await esperar(2500)
    if (CPU > 1) await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: CPU }, s)
    for (const [nombre, a, z] of [['ida', hasta, desde], ['vuelta', desde, hasta]] as const) {
      await medir(b.p, `scrollTo(0, ${String(a)})`)
      await esperar(1800)
      await medir(b.p, 'window.__empezarB3()')
      await scrollSuave(b, a, z, 9000)
      await esperar(400)
      const l = await medir<Lectura>(b.p, 'window.__pararB3()')
      salidas.push(resumen(`${ROTULO} · ${nombre} · cpu×${String(CPU)}`, l))
    }
    if (CPU > 1) await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: 1 }, s)
    salidas.push({ seccion, demosMontadas: await medir<number>(b.p, `document.querySelectorAll('[data-pieza="demo-del-panel"]').length`) })
  } finally {
    writeFileSync(`${SALIDA}/${ROTULO}-cpu${String(CPU)}.json`, JSON.stringify(salidas, null, 1))
    console.log(JSON.stringify(salidas, null, 1))
    await b.cerrar()
  }
}

principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.stack ?? e.message : String(e)}`); process.exit(1) })
