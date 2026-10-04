/**
 * PASADA FINAL · B3 — dónde se va el hilo principal en Tu panel: un perfil de CPU (CDP Profiler) durante un scroll suave
 * de ida por la sección, agregado por función (tiempo propio) y por archivo. Con `cpu=4`, con la CPU ×4.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { abrirBanco, esperar } from '../scripts-viajes/banco'
import { scrollSuave } from '../scripts-escena/clips6'
import { medir } from '../scripts-b4/navegador'

const SALIDA = process.argv[2] ?? 'C:/Users/Valentino/.cache/b4-medicion/pasada-final/b3'
const CPU = Number(process.argv[3] ?? '1')
const ROTULO = process.argv[4] ?? 'antes'
const ALTO = 900

interface Nodo { id: number; callFrame: { functionName: string; url: string; lineNumber: number }; children?: number[] }
interface Perfil { nodes: Nodo[]; samples: number[]; timeDeltas: number[]; startTime: number; endTime: number }

function agregar(p: Perfil): { porFuncion: [string, number][]; porArchivo: [string, number][]; totalMs: number; ociosoMs: number } {
  const porId = new Map<number, Nodo>()
  for (const n of p.nodes) porId.set(n.id, n)
  const propio = new Map<number, number>()
  for (let i = 0; i < p.samples.length; i += 1) propio.set(p.samples[i], (propio.get(p.samples[i]) ?? 0) + (p.timeDeltas[i] ?? 0))
  const porFuncion = new Map<string, number>()
  const porArchivo = new Map<string, number>()
  let ocioso = 0
  let total = 0
  for (const [id, us] of propio) {
    const n = porId.get(id)
    if (n === undefined) continue
    const f = n.callFrame
    total += us
    if (f.functionName === '(idle)') {
      ocioso += us
      continue
    }
    const archivo = f.url.split('/').slice(-2).join('/').split('?')[0] || f.functionName
    const nombre = `${f.functionName || '(anónima)'} · ${archivo}:${String(f.lineNumber)}`
    porFuncion.set(nombre, (porFuncion.get(nombre) ?? 0) + us)
    porArchivo.set(archivo, (porArchivo.get(archivo) ?? 0) + us)
  }
  const top = (m: Map<string, number>, n: number): [string, number][] => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => [k, Math.round(v / 1000)])
  return { porFuncion: top(porFuncion, 40), porArchivo: top(porArchivo, 18), totalMs: Math.round(total / 1000), ociosoMs: Math.round(ocioso / 1000) }
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const b = await abrirBanco(1440, ALTO, { perfil: 'pasada', antesDeCargar: `window.__entornoDeLaEscena = 'producto'` })
  const s = b.p.sessionId
  try {
    const seccion = await medir<{ top: number; alto: number }>(b.p, `(() => { const s = document.querySelector('[data-panel="tu-panel"]'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), alto: Math.round(r.height) } })()`)
    const desde = seccion.top - ALTO
    const hasta = seccion.top + seccion.alto
    await medir(b.p, `scrollTo(0, ${String(desde)})`)
    await esperar(1500)
    await scrollSuave(b, desde, hasta, 9000)
    await esperar(2500)
    await medir(b.p, `scrollTo(0, ${String(hasta)})`)
    await esperar(1800)
    if (CPU > 1) await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: CPU }, s)
    await b.p.conexion.enviar('Profiler.enable', {}, s)
    await b.p.conexion.enviar('Profiler.setSamplingInterval', { interval: 500 }, s)
    await b.p.conexion.enviar('Profiler.start', {}, s)
    await scrollSuave(b, hasta, desde, 9000)
    await esperar(300)
    const { profile } = (await b.p.conexion.enviar('Profiler.stop', {}, s)) as { profile: Perfil }
    if (CPU > 1) await b.p.conexion.enviar('Emulation.setCPUThrottlingRate', { rate: 1 }, s)
    const r = agregar(profile)
    writeFileSync(`${SALIDA}/perfil-${ROTULO}-cpu${String(CPU)}.json`, JSON.stringify(r, null, 1))
    console.log(`total ${String(r.totalMs)} ms · ocioso ${String(r.ociosoMs)} ms · ocupado ${String(r.totalMs - r.ociosoMs)} ms`)
    console.log('POR ARCHIVO (ms propio):')
    for (const [k, v] of r.porArchivo) console.log(`  ${String(v).padStart(6)}  ${k}`)
    console.log('POR FUNCIÓN (ms propio):')
    for (const [k, v] of r.porFuncion) console.log(`  ${String(v).padStart(6)}  ${k}`)
  } finally {
    await b.cerrar()
  }
}

principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.stack ?? e.message : String(e)}`); process.exit(1) })
