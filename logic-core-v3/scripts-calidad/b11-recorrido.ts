/**
 * SPRINT CALIDAD 1 — B11 · la adaptativa durante el recorrido: b11-recorrido.ts [ancho alto dpr]
 *
 * Con vsync y la adaptativa prendida, el recorrido entero a 900 px/s (el de `motor.ts` y `fluidez.ts`), anotando en
 * CADA cuadro: el intervalo, el escalón pedido, el aplicado, el dpr del lienzo, el scroll y cuánto hace del último
 * evento de scroll. Después: cada cambio de dpr (dónde y con qué scroll), y cada cuadro de más de 40 ms con lo que
 * pasaba en ese momento. Va a `calidad1/b11-adaptativa/recorrido-<ancho>@<dpr>x.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'
import { abrirMotor } from './motor/abrir'
import { tramoEn, tramosDe, type Documento } from './motor/analisis'

const [ANCHO, ALTO, DPR] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), Number(process.argv[4] ?? 1.5)]

const DOCUMENTO = `(() => {
  const topes = {}, altos = {}
  for (const p of document.querySelectorAll('[data-panel]')) { const r = p.getBoundingClientRect(); topes[p.getAttribute('data-panel')] = Math.round(r.top + scrollY); altos[p.getAttribute('data-panel')] = Math.round(r.height) }
  const tu = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect()
  return { topes, altos, pieDeTuPanel: Math.round(tu.bottom + scrollY), vh: innerHeight, fin: document.documentElement.scrollHeight - innerHeight }
})()`

const ANOTADOR = `(() => {
  const t = [], e = [], a = [], d = [], y = [], s = []
  let ultimo = -1e9
  window.addEventListener('scroll', () => { ultimo = performance.now() }, { passive: true })
  let seguir = true
  const paso = (ahora) => {
    const q = window.__calidadDelBanco.estado()
    t.push(ahora); e.push(q.escalon); a.push(q.aplicado ?? -1); d.push(q.dpr); y.push(scrollY); s.push(ahora - ultimo)
    if (seguir) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
  window.__anotador = { parar() { seguir = false; return { t, e, a, d, y, s } } }
})()`

async function principal(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO, { dpr: DPR, conVsync: true })
  let r: { t: number[]; e: number[]; a: number[]; d: number[]; y: number[]; s: number[] } = { t: [], e: [], a: [], d: [], y: [], s: [] }
  let doc: Documento | null = null
  try {
    await medir(b.p, 'window.__calidadDelBanco.activa(true)')
    doc = await medir<Documento>(b.p, DOCUMENTO)
    await medir(b.p, 'window.scrollTo(0, 0)')
    await esperar(2500)
    await medir(b.p, ANOTADOR)
    await esperar(1000)
    await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(doc.fin)}, 900)`)
    await esperar(3000)
    r = await medir<typeof r>(b.p, 'window.__anotador.parar()')
  } finally {
    await b.cerrar()
  }
  if (doc === null) return
  const tramos = tramosDe(doc)
  const t0 = r.t[0]
  const cuando = (i: number): { s: number; y: number; tramo: string; escalon: number; aplicado: number; dpr: number; desdeElScrollMs: number } => ({ s: Math.round((r.t[i] - t0) / 10) / 100, y: Math.round(r.y[i]), tramo: tramoEn(tramos, r.y[i]), escalon: r.e[i], aplicado: r.a[i], dpr: Math.round(r.d[i] * 100) / 100, desdeElScrollMs: Math.round(r.s[i]) })
  const cambiosDeDpr = []
  const cambiosDeEscalon = []
  for (let i = 1; i < r.t.length; i += 1) {
    if (r.d[i] !== r.d[i - 1]) cambiosDeDpr.push(cuando(i))
    if (r.e[i] !== r.e[i - 1]) cambiosDeEscalon.push(cuando(i))
  }
  const largos = []
  for (let i = 1; i < r.t.length; i += 1) if (r.t[i] - r.t[i - 1] > 40) largos.push({ ms: Math.round((r.t[i] - r.t[i - 1]) * 10) / 10, ...cuando(i) })
  const salida = { ancho: ANCHO, dpr: DPR, cuadros: r.t.length, cambiosDeEscalon, cambiosDeDpr, largos }
  writeFileSync(`${carpeta('b11-adaptativa')}/recorrido-${String(ANCHO)}@${String(DPR)}x.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida, null, 1))
}

if (process.argv[1]?.endsWith('b11-recorrido.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
