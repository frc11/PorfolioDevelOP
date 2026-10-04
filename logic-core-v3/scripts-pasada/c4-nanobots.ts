/**
 * PASADA FINAL · C4 — LOS NANOBOTS DE SERVICIOS, EN VIVO: npx tsx scripts-pasada/c4-nanobots.ts [ancho alto] [cpu]
 *
 * Recorre el pin de Servicios: captura el gráfico posado en cada estado (la nube, el globo, los engranajes, el robot) y
 * una tira de un traspaso (cada 120 ms después de cruzar una frontera); mide los cuadros de la página mientras el
 * enjambre se arma (con la CPU ×1 o la pedida) y comprueba que la torta se fue (el enjambre dibujó) y que el lazo se
 * para fuera de pantalla. Va a `~/.cache/b4-medicion/pasada-final/c4/`. Pide el servidor y `BANCO_GPU=alta`.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { abrir } from '../scripts-escena10/banco'
import { captura, esperar } from '../scripts-viajes/banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? '1440'), Number(process.argv[3] ?? '900')]
const CPU = Number(process.argv[4] ?? '1')
const SALIDA = `C:/Users/Valentino/.cache/b4-medicion/pasada-final/c4/${String(ANCHO)}`

const CAJA = `(() => { const el = document.querySelector('[data-pieza="nanobots"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), torta: !!el.parentElement.querySelector('[data-pieza="torta"]') } })()`

/** Los cuadros de la página durante `ms`: cuántos, el p95 y el máximo del intervalo. */
const CUADROS = (ms: number): string => `new Promise((listo) => { const t = []; const t0 = performance.now(); const f = (a) => { t.push(a); if (a - t0 < ${String(ms)}) requestAnimationFrame(f); else { const d = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b); listo({ cuadros: d.length, p95: +d[Math.floor(d.length * 0.95)].toFixed(1), max: +d[d.length - 1].toFixed(1), perdidos: d.filter((x) => x > 25).length }) } }; requestAnimationFrame(f) })`

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const b = await abrir('producto', ANCHO, ALTO)
  const informe: Record<string, unknown> = { ancho: ANCHO, alto: ALTO, cpu: CPU }
  try {
    await mover(b, 8, Math.round(ALTO / 2))
    const seccion = await medir<{ y: number; h: number }>(b.p, `(() => { const s = document.querySelector('[data-panel="servicios"]'); const r = s.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), h: Math.round(r.height) } })()`)
    informe.seccion = seccion
    // Los estados: se recorre el pin de a 1/8 y se captura el gráfico posado (2 s después de cada paso).
    const recorte = async (nombre: string): Promise<unknown> => {
      const c = await medir<{ x: number; y: number; w: number; h: number; torta: boolean } | null>(b.p, CAJA)
      await captura(b, `${SALIDA}/${nombre}.png`)
      if (c !== null && c.w > 0) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${SALIDA}/${nombre}.png`, '-vf', `crop=${String(c.w)}:${String(c.h)}:${String(Math.max(0, c.x))}:${String(Math.max(0, c.y))}`, `${SALIDA}/${nombre}-grafico.png`])
      return c
    }
    const posados: Record<string, unknown> = {}
    for (let k = 0; k <= 8; k += 1) {
      const y = seccion.y + Math.round(((seccion.h - ALTO) * k) / 8)
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(2200)
      posados[`p${String(k)}`] = { y, caja: await recorte(`posado-${String(k)}`) }
    }
    informe.posados = posados
    // Un traspaso: de vuelta al comienzo, posado, y un salto al medio del pin; cuadros cada 120 ms.
    await medir(b.p, `scrollTo(0, ${String(seccion.y)})`)
    await esperar(2500)
    if (CPU > 1) await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: CPU }, b.p.sessionId)
    const salto = seccion.y + Math.round((seccion.h - ALTO) * 0.375)
    const [cuadros] = await Promise.all([medir(b.p, CUADROS(2400)), medir(b.p, `scrollTo(0, ${String(salto)})`)])
    informe.cuadrosDelTraspaso = cuadros
    if (CPU > 1) await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: 1 }, b.p.sessionId)
    await medir(b.p, `scrollTo(0, ${String(seccion.y)})`)
    await esperar(2500)
    await medir(b.p, `scrollTo(0, ${String(salto)})`)
    for (let k = 0; k < 12; k += 1) {
      await esperar(120)
      await recorte(`traspaso-${String(k).padStart(2, '0')}`)
    }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${SALIDA}/traspaso-%02d-grafico.png`, '-vf', 'scale=220:-2,tile=6x2', '-frames:v', '1', `${SALIDA}/traspaso-hoja.png`])
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${SALIDA}/posado-%d-grafico.png`, '-vf', 'scale=220:-2,tile=9x1', '-frames:v', '1', `${SALIDA}/posados-hoja.png`])
    // Fuera de pantalla, el lazo se para: el lienzo no cambia entre dos capturas.
    await medir(b.p, 'scrollTo(0, 0)')
    await esperar(1500)
    informe.fueraDePantalla = await medir(b.p, `new Promise((listo) => { const a = window.__nanobotsDelBanco.dibujados(); setTimeout(() => listo({ antes: a, despues: window.__nanobotsDelBanco.dibujados() }), 1000) })`)
    await medir(b.p, `scrollTo(0, ${String(salto)})`)
    await esperar(800)
    informe.aLaVista = await medir(b.p, `new Promise((listo) => { const a = window.__nanobotsDelBanco.dibujados(); setTimeout(() => listo({ antes: a, despues: window.__nanobotsDelBanco.dibujados() }), 1000) })`)
  } finally {
    writeFileSync(`${SALIDA}/informe-cpu${String(CPU)}.json`, JSON.stringify(informe, null, 1))
    console.log(JSON.stringify({ ...informe, posados: undefined }))
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('c4-nanobots.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
