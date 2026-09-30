/**
 * SPRINT CALIDAD 1 — B11 · la calidad adaptativa, en vivo: b11-adaptativa.ts <momento: amanecer|hero> [ancho alto dpr]
 *
 * Con vsync (el refresco de verdad) y el momento congelado: 10 s con la calidad fija (como mide el resto del banco),
 * después se prende la adaptativa y se registra cada segundo su escalón, el dpr y la fracción de motas durante 30 s,
 * y otros 10 s de cuadros ya asentada. Cuadros por segundo y percentiles del intervalo, con y sin.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'
import { abrirMotor } from './motor/abrir'

const MOMENTO = process.argv[2] === 'hero' ? 'hero' : 'amanecer'
const [ANCHO, ALTO, DPR] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900), Number(process.argv[5] ?? 1.5)]

const CUADROS = (ms: number): string => `new Promise((fin) => { const d = []; let a = performance.now(); const t0 = a; const paso = (t) => { d.push(t - a); a = t; if (t - t0 < ${String(ms)}) requestAnimationFrame(paso); else { d.sort((p, q) => p - q); const q = (x) => +d[Math.floor(d.length * x)].toFixed(1); fin({ cuadros: d.length, fps: +(d.length / (${String(ms)} / 1000)).toFixed(1), p50: q(0.5), p95: q(0.95), p99: q(0.99) }) } }; requestAnimationFrame(paso) })`

async function principal(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO, { dpr: DPR, conVsync: true })
  const salida: Record<string, unknown> = { momento: MOMENTO, ancho: ANCHO, dpr: DPR }
  try {
    if (MOMENTO === 'amanecer') {
      const pie = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - 0.12 * innerHeight) })()`)
      await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(pie)}, 3000)`)
      await medir(b.p, 'window.__amanecerDelBanco.congelar(4.9)')
    }
    await esperar(3000)
    salida.fija = await medir<unknown>(b.p, CUADROS(10000))
    console.log('fija', JSON.stringify(salida.fija))
    await medir(b.p, 'window.__calidadDelBanco.activa(true)')
    const camino: unknown[] = []
    for (let s = 0; s < 30; s += 1) {
      await esperar(1000)
      camino.push(await medir<unknown>(b.p, '(() => { const e = window.__calidadDelBanco.estado(); return [e.escalon, +e.dpr.toFixed(2), +e.motas.toFixed(2), +e.media.toFixed(1), +e.refresco.toFixed(1)] })()'))
    }
    salida.camino = camino
    console.log('camino [escalón, dpr, motas, media ms, refresco ms] por segundo:', JSON.stringify(camino))
    salida.adaptativa = await medir<unknown>(b.p, CUADROS(10000))
    console.log('adaptativa', JSON.stringify(salida.adaptativa))
    await medir(b.p, 'window.__calidadDelBanco.activa(false)')
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta('b11-adaptativa')}/${MOMENTO}-${String(ANCHO)}@${String(DPR)}x.json`, JSON.stringify(salida, null, 1))
}

if (process.argv[1]?.endsWith('b11-adaptativa.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
