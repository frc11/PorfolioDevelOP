/**
 * SPRINT CALIDAD 1 — Fase 0 · las cuentas del banco del motor: los tramos del recorrido, los percentiles y el perfil de
 * CPU agrupado. Puro: lo que viene de la página entra como números.
 */

/** Dónde empieza cada tramo, en px de scroll (el tope del cuadro), en orden. */
export interface Tramo {
  readonly nombre: string
  readonly desde: number
}

/** Lo que el banco mide del documento antes de recorrer: el tope de cada panel, el pie de Tu panel y el alto del cuadro. */
export interface Documento {
  readonly topes: Record<string, number>
  readonly altos: Record<string, number>
  readonly pieDeTuPanel: number
  readonly vh: number
  readonly fin: number
}

/**
 * Los tramos: por panel (el que ocupa el medio del cuadro), Trabajos partido en túnel, salida y demos (las fracciones de
 * su progreso que declara `geometria.ts`: la salida arranca en 0,570 y los demos en 0,736), y el amanecer (el borde de
 * abajo de Tu panel del 85 % del cuadro al −15 %, `AMANECER.visible` y `hasta`), que manda sobre lo que pise.
 */
export function tramosDe(d: Documento, fracciones = { salida: 0.57, demos: 0.736 }): Tramo[] {
  const medio = (id: string): number => d.topes[id] - d.vh / 2
  const t = d.topes.trabajos
  const alto = d.altos.trabajos
  const lista: Tramo[] = [
    { nombre: 'hero', desde: 0 },
    { nombre: 'quiénes somos', desde: medio('quienes-somos') },
    { nombre: 'números', desde: medio('numeros') },
    { nombre: 'trabajos · túnel', desde: medio('trabajos') },
    { nombre: 'trabajos · salida', desde: t + fracciones.salida * alto },
    { nombre: 'trabajos · demos (noche)', desde: t + fracciones.demos * alto },
    { nombre: 'servicios', desde: medio('servicios') },
    { nombre: 'tu panel', desde: medio('tu-panel') },
    { nombre: 'amanecer', desde: d.pieDeTuPanel - 0.85 * d.vh },
    { nombre: 'por qué develOP', desde: d.pieDeTuPanel + 0.15 * d.vh },
    { nombre: 'pie', desde: medio('cierre') },
  ]
  return lista.map((x) => ({ ...x, desde: Math.max(0, Math.round(x.desde)) })).sort((a, b) => a.desde - b.desde)
}

export function tramoEn(tramos: readonly Tramo[], y: number): string {
  let actual = tramos[0].nombre
  for (const t of tramos) if (y >= t.desde) actual = t.nombre
  return actual
}

export function percentil(ordenados: readonly number[], p: number): number {
  if (ordenados.length === 0) return Number.NaN
  return ordenados[Math.min(ordenados.length - 1, Math.floor(p * ordenados.length))]
}

const r2 = (x: number): number => Math.round(x * 100) / 100

/** El resumen de una serie de tiempos por cuadro (ms): percentiles y cuántos pasan de 16,7 y de 33 ms. */
export function resumen(ms: readonly number[]): { n: number; p50: number; p95: number; p99: number; max: number; media: number; mas16: number; mas33: number } {
  const o = [...ms].filter((x) => Number.isFinite(x)).sort((a, b) => a - b)
  const suma = o.reduce((a, b) => a + b, 0)
  return { n: o.length, p50: r2(percentil(o, 0.5)), p95: r2(percentil(o, 0.95)), p99: r2(percentil(o, 0.99)), max: r2(o[o.length - 1] ?? Number.NaN), media: r2(suma / Math.max(1, o.length)), mas16: o.filter((x) => x > 16.7).length, mas33: o.filter((x) => x > 33.4).length }
}

/** Los cuadros por segundo de un tramo: cuadros sobre el tiempo que se estuvo en él (no el promedio de intervalos). */
export function porSegundo(t: readonly number[], y: readonly number[], tramos: readonly Tramo[]): Record<string, { cuadros: number; segundos: number; fps: number; msPorCuadro: number }> {
  const acc: Record<string, { cuadros: number; ms: number }> = {}
  for (let i = 1; i < t.length; i += 1) {
    const k = tramoEn(tramos, y[i])
    const a = acc[k] ?? { cuadros: 0, ms: 0 }
    acc[k] = { cuadros: a.cuadros + 1, ms: a.ms + (t[i] - t[i - 1]) }
  }
  const salida: Record<string, { cuadros: number; segundos: number; fps: number; msPorCuadro: number }> = {}
  for (const [k, a] of Object.entries(acc)) salida[k] = { cuadros: a.cuadros, segundos: r2(a.ms / 1000), fps: r2((a.cuadros * 1000) / a.ms), msPorCuadro: r2(a.ms / a.cuadros) }
  return salida
}

/** El ritmo con vsync: cuántos cuadros duraron más de un refresco y medio (se perdió al menos uno), por tramo. */
export function ritmo(t: readonly number[], y: readonly number[], tramos: readonly Tramo[], refresco: number): Record<string, { cuadros: number; perdidos: number; peorMs: number; p99: number }> {
  const acc: Record<string, number[]> = {}
  for (let i = 1; i < t.length; i += 1) (acc[tramoEn(tramos, y[i])] ??= []).push(t[i] - t[i - 1])
  const salida: Record<string, { cuadros: number; perdidos: number; peorMs: number; p99: number }> = {}
  for (const [k, v] of Object.entries(acc)) {
    const o = [...v].sort((a, b) => a - b)
    salida[k] = { cuadros: v.length, perdidos: v.filter((x) => x > refresco * 1.5).length, peorMs: r2(o[o.length - 1]), p99: r2(percentil(o, 0.99)) }
  }
  return salida
}

/** Un nodo del perfil de CPU de Chrome (lo que devuelve `Profiler.stop`). */
export interface NodoDelPerfil {
  readonly id: number
  readonly callFrame: { readonly functionName: string; readonly url: string; readonly lineNumber: number }
  readonly children?: readonly number[]
}

export interface PerfilDeCpu {
  readonly nodes: readonly NodoDelPerfil[]
  readonly samples: readonly number[]
  readonly timeDeltas: readonly number[]
  readonly startTime: number
  readonly endTime: number
}

/** El nombre corto de un archivo del perfil: la ruta del fuente (webpack) o el paquete. */
export function archivoDe(url: string): string {
  if (url === '') return '(nativo)'
  const fuente = /\/src\/(.+?)(\?|$)/.exec(url)
  if (fuente !== null) return fuente[1]
  const paquete = /node_modules\/(\.pnpm\/)?((@[^/]+\/)?[^/@]+)/.exec(url)
  if (paquete !== null) return `npm:${paquete[2]}`
  return url.replace(/^.*\/_next\//, '_next/').slice(0, 80)
}

/**
 * El perfil agrupado: el tiempo PROPIO (ms) por archivo y por función, y los nodos especiales (el recolector, el
 * programa, la espera). Las pausas del recolector: tramos de muestras seguidas en `(garbage collector)`.
 */
export function agruparPerfil(p: PerfilDeCpu): { totalMs: number; especiales: Record<string, number>; porArchivo: [string, number][]; porFuncion: [string, number][]; pausasDelRecolector: { cuantas: number; peorMs: number; totalMs: number } } {
  const nodo = new Map(p.nodes.map((n) => [n.id, n]))
  const propio = new Map<number, number>()
  const pausas: number[] = []
  let enPausa = 0
  for (let i = 0; i < p.samples.length; i += 1) {
    const id = p.samples[i]
    const dt = (p.timeDeltas[i + 1] ?? 0) / 1000
    propio.set(id, (propio.get(id) ?? 0) + dt)
    const gc = nodo.get(id)?.callFrame.functionName === '(garbage collector)'
    if (gc) enPausa += dt
    else if (enPausa > 0) {
      pausas.push(enPausa)
      enPausa = 0
    }
  }
  const especiales: Record<string, number> = {}
  const porArchivo = new Map<string, number>()
  const porFuncion = new Map<string, number>()
  let total = 0
  for (const [id, ms] of propio) {
    const n = nodo.get(id)
    if (n === undefined) continue
    total += ms
    const f = n.callFrame.functionName
    if (f.startsWith('(')) {
      especiales[f] = r2((especiales[f] ?? 0) + ms)
      continue
    }
    const a = archivoDe(n.callFrame.url)
    porArchivo.set(a, (porArchivo.get(a) ?? 0) + ms)
    const k = `${f || '(anónima)'} · ${a}:${String(n.callFrame.lineNumber + 1)}`
    porFuncion.set(k, (porFuncion.get(k) ?? 0) + ms)
  }
  const orden = (m: Map<string, number>): [string, number][] => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, r2(v)])
  return { totalMs: r2(total), especiales, porArchivo: orden(porArchivo), porFuncion: orden(porFuncion).slice(0, 60), pausasDelRecolector: { cuantas: pausas.length, peorMs: r2(Math.max(0, ...pausas)), totalMs: r2(pausas.reduce((a, b) => a + b, 0)) } }
}

/** Un nodo del muestreo de memoria (`HeapProfiler.stopSampling`). */
export interface NodoDeMemoria {
  readonly callFrame: { readonly functionName: string; readonly url: string; readonly lineNumber: number }
  readonly selfSize: number
  readonly children: readonly NodoDeMemoria[]
}

/** Lo reservado (bytes) por función, ordenado. */
export function agruparMemoria(raiz: NodoDeMemoria): [string, number][] {
  const acc = new Map<string, number>()
  const pila: NodoDeMemoria[] = [raiz]
  while (pila.length > 0) {
    const n = pila.pop()
    if (n === undefined) break
    if (n.selfSize > 0) {
      const k = `${n.callFrame.functionName || '(anónima)'} · ${archivoDe(n.callFrame.url)}:${String(n.callFrame.lineNumber + 1)}`
      acc.set(k, (acc.get(k) ?? 0) + n.selfSize)
    }
    pila.push(...n.children)
  }
  return [...acc.entries()].sort((a, b) => b[1] - a[1])
}
