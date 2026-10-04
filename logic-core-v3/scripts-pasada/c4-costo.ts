/**
 * PASADA FINAL · C4 — LO QUE CUESTA EL ENJAMBRE: npx tsx scripts-pasada/c4-costo.ts [ancho alto]
 * En el medio del pin de Servicios (el globo girando) y en un traspaso, los cuadros de la página con el enjambre dibujando
 * y con el enjambre en pausa (el banco lo pausa), con la CPU ×1 y ×4. Pide el servidor y `BANCO_GPU=alta`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { abrir } from '../scripts-escena10/banco'
import { esperar } from '../scripts-viajes/banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? '1440'), Number(process.argv[3] ?? '900')]
const CUADROS = (ms: number): string => `new Promise((listo) => { const t = []; const t0 = performance.now(); const f = (a) => { t.push(a); if (a - t0 < ${String(ms)}) requestAnimationFrame(f); else { const d = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b); listo({ cuadros: d.length, mediana: +d[Math.floor(d.length / 2)].toFixed(1), p95: +d[Math.floor(d.length * 0.95)].toFixed(1), max: +d[d.length - 1].toFixed(1), perdidos: d.filter((x) => x > 25).length }) } }; requestAnimationFrame(f) })`

async function principal(): Promise<void> {
  const b = await abrir('producto', ANCHO, ALTO)
  const filas: Record<string, unknown>[] = []
  try {
    await mover(b, 8, Math.round(ALTO / 2))
    const s = await medir<{ y: number; h: number }>(b.p, `(() => { const s = document.querySelector('[data-panel="servicios"]'); const r = s.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), h: Math.round(r.height) } })()`)
    const medio = s.y + Math.round((s.h - ALTO) * 0.375)
    for (const cpu of [1, 4]) {
      await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: cpu }, b.p.sessionId)
      for (const pausa of [false, true, false, true]) {
        await medir(b.p, `scrollTo(0, ${String(medio)})`)
        await esperar(2500)
        await medir(b.p, `window.__nanobotsDelBanco.pausar(${String(pausa)})`)
        await esperar(400)
        const quieto = await medir(b.p, CUADROS(3000))
        // Un traspaso: atrás un estado y vuelta (el disparo de 1,4 s).
        await medir(b.p, `scrollTo(0, ${String(s.y + Math.round((s.h - ALTO) * 0.12))})`)
        await esperar(2500)
        const [traspaso] = await Promise.all([medir(b.p, CUADROS(2000)), medir(b.p, `scrollTo(0, ${String(medio)})`)])
        filas.push({ cpu, enjambre: pausa ? 'en pausa' : 'dibujando', quieto, traspaso })
        console.log(JSON.stringify(filas[filas.length - 1]))
      }
      await medir(b.p, 'window.__nanobotsDelBanco.pausar(false)')
    }
  } finally {
    await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: 1 }, b.p.sessionId)
    writeFileSync(`C:/Users/Valentino/.cache/b4-medicion/pasada-final/c4/costo-${String(ANCHO)}.json`, JSON.stringify(filas, null, 1))
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('c4-costo.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
