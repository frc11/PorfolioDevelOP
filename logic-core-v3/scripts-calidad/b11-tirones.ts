/**
 * SPRINT CALIDAD 1 — B11 · ¿el cambio de escalón trae un tirón?: b11-tirones.ts <momento: amanecer|hero> [ancho alto dpr]
 *
 * Con vsync y el momento congelado, se prende la adaptativa y se anota CADA cuadro: su intervalo, el escalón y el dpr.
 * Después, para cada cambio de escalón, el peor intervalo en los 300 ms que siguen (el cambio de dpr redimensiona el
 * lienzo y sus búferes), y los cuadros largos que NO caen cerca de un cambio. Va a `calidad1/b11-adaptativa/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'
import { abrirMotor } from './motor/abrir'

const MOMENTO = process.argv[2] === 'hero' ? 'hero' : 'amanecer'
const [ANCHO, ALTO, DPR] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900), Number(process.argv[5] ?? 1.5)]
const SEGUNDOS = 40

const ANOTADOR = `(() => {
  const t = [], e = [], d = []
  let seguir = true
  const paso = (ahora) => {
    const s = window.__calidadDelBanco.estado()
    t.push(ahora); e.push(s.escalon); d.push(s.dpr)
    if (seguir) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
  window.__anotador = { parar() { seguir = false; return { t, e, d } } }
})()`

interface Cambio { readonly s: number; readonly de: number; readonly a: number; readonly dpr: number; readonly peorMs: number }

async function principal(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO, { dpr: DPR, conVsync: true })
  let r: { t: number[]; e: number[]; d: number[] } = { t: [], e: [], d: [] }
  try {
    if (MOMENTO === 'amanecer') {
      const pie = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - 0.12 * innerHeight) })()`)
      await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(pie)}, 3000)`)
      await medir(b.p, 'window.__amanecerDelBanco.congelar(4.9)')
    }
    await esperar(3000)
    await medir(b.p, ANOTADOR)
    await esperar(2000)
    await medir(b.p, 'window.__calidadDelBanco.activa(true)')
    await esperar(SEGUNDOS * 1000)
    r = await medir<{ t: number[]; e: number[]; d: number[] }>(b.p, 'window.__anotador.parar()')
    await medir(b.p, 'window.__calidadDelBanco.activa(false)')
  } finally {
    await b.cerrar()
  }
  const t0 = r.t[0]
  const cambios: Cambio[] = []
  for (let i = 1; i < r.t.length; i += 1) {
    if (r.e[i] === r.e[i - 1]) continue
    let peor = 0
    for (let j = i; j < r.t.length && r.t[j] - r.t[i] <= 300; j += 1) peor = Math.max(peor, r.t[j] - r.t[j - 1])
    cambios.push({ s: Math.round((r.t[i] - t0) / 10) / 100, de: r.e[i - 1], a: r.e[i], dpr: Math.round(r.d[i] * 100) / 100, peorMs: Math.round(peor * 10) / 10 })
  }
  const cerca = (t: number): boolean => cambios.some((c) => Math.abs(t - t0 - c.s * 1000) <= 400)
  const largos = r.t.slice(1).map((t, i) => ({ s: Math.round((t - t0) / 10) / 100, ms: Math.round((t - r.t[i]) * 10) / 10, cerca: cerca(t) })).filter((x) => x.ms > 40)
  const salida = { momento: MOMENTO, ancho: ANCHO, dpr: DPR, cuadros: r.t.length, cambios, largosCercaDeUnCambio: largos.filter((x) => x.cerca), largosLejos: largos.filter((x) => !x.cerca) }
  writeFileSync(`${carpeta('b11-adaptativa')}/tirones-${MOMENTO}-${String(ANCHO)}@${String(DPR)}x.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida, null, 1))
}

if (process.argv[1]?.endsWith('b11-tirones.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
