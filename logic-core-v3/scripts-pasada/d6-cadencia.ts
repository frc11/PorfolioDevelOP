/**
 * PASADA FINAL · D6 — LA CADENCIA POR SECCIÓN: npx tsx scripts-pasada/d6-cadencia.ts [ancho alto]
 * Quieta en el medio de cada sección, 3 s de cuadros: la mediana y el p95 del intervalo (a 75 Hz un cuadro son 13,3 ms;
 * 26,7 es medio refresco). Pide el servidor y `BANCO_GPU=alta`.
 */
import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { abrir } from '../scripts-escena10/banco'
import { esperar } from '../scripts-viajes/banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? '1440'), Number(process.argv[3] ?? '900')]
const CUADROS = `new Promise((listo) => { const t = []; const t0 = performance.now(); const f = (a) => { t.push(a); if (a - t0 < 3000) requestAnimationFrame(f); else { const d = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b); listo({ cuadros: d.length, mediana: +d[Math.floor(d.length / 2)].toFixed(1), p95: +d[Math.floor(d.length * 0.95)].toFixed(1) }) } }; requestAnimationFrame(f) })`

async function principal(): Promise<void> {
  const b = await abrir('producto', ANCHO, ALTO)
  try {
    await mover(b, 8, Math.round(ALTO / 2))
    const secciones = await medir<{ id: string; y: number; h: number }[]>(b.p, `[...document.querySelectorAll('[data-panel]')].map((s) => { const r = s.getBoundingClientRect(); return { id: s.getAttribute('data-panel'), y: Math.round(r.top + scrollY), h: Math.round(r.height) } })`)
    for (const s of secciones) {
      await medir(b.p, `scrollTo(0, ${String(s.y + Math.max(0, Math.round(s.h / 2 - ALTO / 2)))})`)
      await esperar(2500)
      console.log(s.id.padEnd(16), JSON.stringify(await medir(b.p, CUADROS)))
    }
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('d6-cadencia.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
