import { azarDelCristal } from './cristal'
import { GRIETAS, type VarianteDeLasGrietas } from './grietas'
import type { Celda } from './muro'
import { alrededor, type Tramo, type Ventana } from './trazado'

/**
 * [NOCTURNO B9] LAS FORMAS DE LAS GRIETAS (puro): las tres variantes, trazadas en el muro desenrollado alrededor del centro de la ventana
 * (`trazado.ts`: las coordenadas, la ventana y la rejilla). Cada tramo con cuándo le llega el frente a cada punta, en u de camino desde
 * su nacimiento; al final se llevan a 0 a 1 de la formación (la última punta, en 1).
 */
type P = readonly [number, number]

// ── Los ayudantes del azar ──────────────────────────────────────────────────

type Azar = () => number
const entre = (azar: Azar, r: readonly [number, number]): number => r[0] + azar() * (r[1] - r[0])
const entero = (azar: Azar, r: readonly [number, number]): number => Math.min(r[1], r[0] + Math.floor(azar() * (r[1] - r[0] + 1)))
const RAD = Math.PI / 180

/** Un tramo crudo: sus tiempos en u de camino (después se llevan a 0 a 1). */
interface Crudo {
  readonly a: P
  readonly b: P
  readonly t0: number
  readonly t1: number
  readonly grosor: number
}

/** `n` puntos adentro de la ventana (en su parte `adentro`), separados por `separacion` si se puede (si no, el más lejos de los probados). */
function separados(azar: Azar, n: number, v: Ventana, separacion: number, adentro: number): P[] {
  const [x0, y0] = v.desde
  const [x1, y1] = v.hasta
  const borde = (1 - adentro) / 2
  const puntos: P[] = []
  for (let i = 0; i < n; i += 1) {
    let mejor: P = [0, 0]
    let lejos = -1
    for (let intento = 0; intento < 40; intento += 1) {
      const p: P = [x0 + (x1 - x0) * (borde + azar() * adentro), y0 + (y1 - y0) * (borde + azar() * adentro)]
      const d = puntos.reduce((m, q) => Math.min(m, Math.hypot(p[0] - q[0], p[1] - q[1])), Number.POSITIVE_INFINITY)
      if (d > lejos) {
        mejor = p
        lejos = d
      }
      if (d >= separacion) break
    }
    puntos.push(mejor)
  }
  return puntos
}

/** Un camino que sale de `desde` con rumbo `angulo`: `pasos` pasos de parecido largo, cada uno quebrado apenas alrededor del rumbo. */
function quebrada(azar: Azar, desde: P, angulo: number, largo: number, pasos: number, zigzagGrados: number): P[] {
  const puntos: P[] = [desde]
  let p = desde
  for (let s = 0; s < pasos; s += 1) {
    const a = angulo + (azar() - 0.5) * 2 * zigzagGrados * RAD
    const paso = (largo / pasos) * (0.8 + 0.4 * azar())
    p = [p[0] + Math.cos(a) * paso, p[1] + Math.sin(a) * paso]
    puntos.push(p)
  }
  return puntos
}

/** Los tramos de un camino que el frente recorre desde su primer punto, que le llega en `t`; devuelve el tiempo de cada punto. */
function recorrer(salida: Crudo[], camino: readonly P[], t: number, grosor: number): number[] {
  const tiempos = [t]
  for (let k = 1; k < camino.length; k += 1) {
    const a = camino[k - 1]
    const b = camino[k]
    const t1 = tiempos[k - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])
    salida.push({ a, b, t0: tiempos[k - 1], t1, grosor })
    tiempos.push(t1)
  }
  return tiempos
}

/** El punto de un camino a `distancia` de su comienzo (por el camino) y su tiempo; `null` si es más corto. */
function puntoDelCamino(camino: readonly P[], tiempos: readonly number[], distancia: number): { readonly p: P; readonly t: number } | null {
  let hecho = 0
  for (let k = 1; k < camino.length; k += 1) {
    const a = camino[k - 1]
    const b = camino[k]
    const l = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (hecho + l >= distancia) {
      const f = (distancia - hecho) / Math.max(1e-9, l)
      return { p: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], t: tiempos[k - 1] + (tiempos[k] - tiempos[k - 1]) * f }
    }
    hecho += l
  }
  return null
}

const rumboDe = (a: P, b: P): number => Math.atan2(b[1] - a[1], b[0] - a[0])
/** El tamaño de las formas: el alto de la ventana o, en una franja baja (el pie del muro), una parte de su ancho. */
const tamano = (v: Ventana): number => Math.max(v.hasta[1] - v.desde[1], GRIETAS.tamanoPorElAncho * (v.hasta[0] - v.desde[0]))

// ── 1 · La telaraña ─────────────────────────────────────────────────────────

function telarana(v: Ventana, compacta: boolean, azar: Azar): Crudo[] {
  const T = GRIETAS.telarana
  const L = tamano(v)
  const largoMedio = (L * (T.largo[0] + T.largo[1])) / 2
  const impactos = separados(azar, entero(azar, compacta ? T.impactosCompacta : T.impactos), v, T.separacion * Math.max(v.hasta[0] - v.desde[0], v.hasta[1] - v.desde[1]), 0.8)
  const salida: Crudo[] = []
  impactos.forEach((c, i) => {
    const nace = i === 0 ? 0 : azar() * T.nacenHasta * L * T.largo[1]
    const n = entero(azar, compacta ? T.rayosCompacta : T.rayos)
    const giro = azar() * 2 * Math.PI
    const rayos: { readonly camino: P[]; readonly tiempos: number[] }[] = []
    for (let k = 0; k < n; k += 1) {
      const angulo = giro + ((k + (azar() - 0.5) * 0.6) / n) * 2 * Math.PI
      const largo = L * entre(azar, T.largo)
      const pasos = entero(azar, T.pasos)
      const camino = quebrada(azar, c, angulo, largo, pasos, T.zigzagGrados)
      const tiempos = recorrer(salida, camino, nace, GRIETAS.grosor.tronco)
      rayos.push({ camino, tiempos })
      if (azar() < T.ramas) {
        const j = 1 + Math.floor(azar() * (pasos - 2))
        const signo = azar() < 0.5 ? -1 : 1
        const rumbo = rumboDe(camino[j], camino[j + 1]) + signo * entre(azar, T.ramaGrados) * RAD
        const resta = largo * (1 - j / pasos)
        recorrer(salida, quebrada(azar, camino[j], rumbo, resta * (0.4 + 0.3 * azar()), 2 + Math.floor(azar() * 2), T.zigzagGrados), tiempos[j], GRIETAS.grosor.rama)
      }
    }
    // Los anillos: de un rayo al siguiente, a la misma distancia del impacto, con el medio un poco hacia adentro; alguno falta.
    for (const parte of T.anillos) {
      for (let k = 0; k < n; k += 1) {
        if (azar() < T.anilloFalta) continue
        const ra = rayos[k]
        const rb = rayos[(k + 1) % n]
        const A = puntoDelCamino(ra.camino, ra.tiempos, parte * largoMedio)
        const B = puntoDelCamino(rb.camino, rb.tiempos, parte * largoMedio)
        if (A === null || B === null) continue
        const medio: P = [(A.p[0] + B.p[0]) / 2, (A.p[1] + B.p[1]) / 2]
        const m: P = [medio[0] + (c[0] - medio[0]) * 0.1, medio[1] + (c[1] - medio[1]) * 0.1]
        recorrer(salida, [A.p, m, B.p], A.t, GRIETAS.grosor.anillo)
      }
    }
  })
  return salida
}

// ── 2 · La fractura larga ───────────────────────────────────────────────────

function fractura(v: Ventana, compacta: boolean, azar: Azar): Crudo[] {
  const F = GRIETAS.fractura
  const [x0, y0] = v.desde
  const [x1, y1] = v.hasta
  const w = x1 - x0
  const h = y1 - y0
  const diag = Math.hypot(w, h)
  const pasoMedio = (F.paso[0] + F.paso[1]) / 2
  const salida: Crudo[] = []
  const n = entero(azar, compacta ? F.lineasCompacta : F.lineas)
  for (let i = 0; i < n; i += 1) {
    // Entra por un borde y va al de enfrente: de costado a costado o (más en el teléfono, que es alto) de arriba hacia abajo.
    const deCostado = azar() < (compacta ? 0.3 : 0.75)
    const izquierda = i % 2 === 0
    const inicio: P = deCostado ? [izquierda ? x0 : x1, y0 + h * entre(azar, [0.2, 0.8])] : [x0 + w * entre(azar, [0.15, 0.85]), y1]
    const objetivo: P = deCostado ? [izquierda ? x1 : x0, y0 + h * entre(azar, [0.15, 0.85])] : [x0 + w * entre(azar, [0.1, 0.9]), y0]
    const camino: P[] = [inicio]
    let p = inicio
    let rumbo = rumboDe(inicio, objetivo)
    let recorrido = 0
    while (Math.hypot(objetivo[0] - p[0], objetivo[1] - p[1]) > F.paso[1] && recorrido < 1.6 * diag) {
      let giro = rumboDe(p, objetivo) - rumbo
      giro = Math.atan2(Math.sin(giro), Math.cos(giro))
      rumbo += giro * F.rumbo + (azar() - 0.5) * 2 * F.zigzagGrados * RAD
      const paso = entre(azar, F.paso)
      p = [p[0] + Math.cos(rumbo) * paso, p[1] + Math.sin(rumbo) * paso]
      camino.push(p)
      recorrido += paso
    }
    camino.push(objetivo)
    const nace = i === 0 ? 0 : azar() * F.nacenHasta * diag
    const tiempos = recorrer(salida, camino, nace, GRIETAS.grosor.tronco)
    const ramas = entero(azar, compacta ? F.ramasCompacta : F.ramas)
    for (let r = 0; r < ramas && camino.length > 3; r += 1) {
      const j = 1 + Math.min(camino.length - 3, Math.floor(((r + 0.3 + 0.4 * azar()) / ramas) * (camino.length - 2)))
      const signo = azar() < 0.5 ? -1 : 1
      const rumboRama = rumboDe(camino[j], camino[j + 1]) + signo * entre(azar, F.ramaGrados) * RAD
      const largo = recorrido * entre(azar, F.ramaLargo)
      const rama = quebrada(azar, camino[j], rumboRama, largo, Math.max(2, Math.round(largo / pasoMedio)), F.zigzagGrados)
      const tRama = recorrer(salida, rama, tiempos[j], GRIETAS.grosor.rama)
      if (azar() < F.subrama && rama.length > 2) {
        const k = Math.floor(rama.length / 2)
        const rumboSub = rumboDe(rama[k - 1], rama[k]) - signo * entre(azar, F.ramaGrados) * RAD
        recorrer(salida, quebrada(azar, rama[k], rumboSub, largo * 0.4, 2, F.zigzagGrados), tRama[k], GRIETAS.grosor.anillo)
      }
    }
  }
  return salida
}

// ── 3 · Por las juntas ──────────────────────────────────────────────────────

/** El grafo de las juntas cerca de la ventana: los vértices (unidos si coinciden) y las aristas que comparten dos celdas. */
function juntasCerca(v: Ventana, celdas: readonly Celda[]): { readonly vertices: P[]; readonly aristas: (readonly [number, number])[] } {
  const vertices: P[] = []
  const indice = new Map<string, number>()
  const clave = (x: number, y: number): string => `${String(Math.round(x * 1000))}:${String(Math.round(y * 1000))}`
  const idDe = (p: P): number => {
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        const k = indice.get(clave(p[0] + dx * 1e-3, p[1] + dy * 1e-3))
        if (k !== undefined && Math.hypot(vertices[k][0] - p[0], vertices[k][1] - p[1]) < 1e-3) return k
      }
    }
    vertices.push(p)
    indice.set(clave(p[0], p[1]), vertices.length - 1)
    return vertices.length - 1
  }
  const margen = 0.25 * Math.max(v.hasta[0] - v.desde[0], v.hasta[1] - v.desde[1])
  const veces = new Map<string, { readonly a: number; readonly b: number; n: number }>()
  for (const celda of celdas) {
    const q = celda.poligono
    const puntos: P[] = []
    for (let k = 0; k < q.length; k += 2) puntos.push([alrededor(q[k], v.centro), q[k + 1]])
    if (puntos.some((p) => p[0] < v.desde[0] - margen || p[0] > v.hasta[0] + margen)) continue
    for (let k = 0; k < puntos.length; k += 1) {
      const a = idDe(puntos[k])
      const b = idDe(puntos[(k + 1) % puntos.length])
      if (a === b) continue
      const id = a < b ? `${String(a)}-${String(b)}` : `${String(b)}-${String(a)}`
      const hay = veces.get(id)
      if (hay === undefined) veces.set(id, { a: Math.min(a, b), b: Math.max(a, b), n: 1 })
      else hay.n += 1
    }
  }
  return { vertices, aristas: [...veces.values()].filter((x) => x.n >= 2).map((x) => [x.a, x.b] as const) }
}

function juntas(v: Ventana, compacta: boolean, azar: Azar, celdas: readonly Celda[]): Crudo[] {
  const J = GRIETAS.juntas
  const { vertices, aristas } = juntasCerca(v, celdas)
  const vecinos: { readonly otro: number; readonly largo: number; readonly peso: number; readonly arista: number }[][] = vertices.map(() => [])
  aristas.forEach(([a, b], i) => {
    const largo = Math.hypot(vertices[b][0] - vertices[a][0], vertices[b][1] - vertices[a][1])
    const peso = largo * entre(azar, J.azarDelPeso)
    vecinos[a].push({ otro: b, largo, peso, arista: i })
    vecinos[b].push({ otro: a, largo, peso, arista: i })
  })
  const alcance = tamano(v) * (compacta ? J.alcanceCompacta : J.alcance)
  const peso = vertices.map(() => Number.POSITIVE_INFINITY)
  const tiempo = vertices.map(() => Number.POSITIVE_INFINITY)
  /** Cuándo nació la semilla de cada árbol: el alcance se mide desde ahí. */
  const nacio = vertices.map(() => 0)
  const desde = vertices.map(() => -1)
  const porArista = aristas.map(() => false)
  const semillas = separados(azar, entero(azar, compacta ? J.semillasCompacta : J.semillas), v, 0.3 * tamano(v), 0.7)
  semillas.forEach((s, i) => {
    let mejor = -1
    vertices.forEach((p, k) => {
      if (vecinos[k].length > 0 && (mejor < 0 || Math.hypot(p[0] - s[0], p[1] - s[1]) < Math.hypot(vertices[mejor][0] - s[0], vertices[mejor][1] - s[1]))) mejor = k
    })
    if (mejor < 0) return
    const nace = i === 0 ? 0 : azar() * J.nacenHasta * alcance
    if (nace >= peso[mejor]) return
    peso[mejor] = nace
    tiempo[mejor] = nace
    nacio[mejor] = nace
  })
  // Dijkstra por el peso (el azar elige las ramas); el tiempo corre por el largo de verdad, hasta el alcance desde su semilla.
  const hecho = vertices.map(() => false)
  const salida: Crudo[] = []
  for (;;) {
    let k = -1
    for (let i = 0; i < vertices.length; i += 1) if (!hecho[i] && peso[i] < Number.POSITIVE_INFINITY && (k < 0 || peso[i] < peso[k])) k = i
    if (k < 0) break
    hecho[k] = true
    const d = desde[k]
    if (d >= 0) {
      salida.push({ a: vertices[d], b: vertices[k], t0: tiempo[d], t1: tiempo[k], grosor: GRIETAS.grosor.junta })
      const usada = vecinos[k].find((e) => e.otro === d)
      if (usada !== undefined) porArista[usada.arista] = true
    }
    for (const e of vecinos[k]) {
      // Desde una semilla, sus juntas se agrietan siempre (aunque sean más largas que el alcance: en el teléfono la ventana es chica).
      const lejos = desde[k] >= 0 && tiempo[k] + e.largo - nacio[k] > alcance
      if (hecho[e.otro] || lejos || peso[k] + e.peso >= peso[e.otro]) continue
      peso[e.otro] = peso[k] + e.peso
      tiempo[e.otro] = tiempo[k] + e.largo
      nacio[e.otro] = nacio[k]
      desde[e.otro] = k
    }
  }
  // Alguna junta más entre dos vértices ya agrietados: cierra una celda (desde el que se agrietó primero).
  aristas.forEach(([a, b], i) => {
    if (porArista[i] || !hecho[a] || !hecho[b] || azar() >= J.cierres) return
    const [p, q] = tiempo[a] <= tiempo[b] ? [a, b] : [b, a]
    salida.push({ a: vertices[p], b: vertices[q], t0: tiempo[p], t1: tiempo[p] + Math.hypot(vertices[q][0] - vertices[p][0], vertices[q][1] - vertices[p][1]), grosor: GRIETAS.grosor.junta })
  })
  return salida
}

// ── El trazado ──────────────────────────────────────────────────────────────

/** Los tiempos crudos (u de camino) llevados a 0 a 1 de la formación: la última punta llega en 1. */
function normalizar(crudos: readonly Crudo[]): Tramo[] {
  const fin = crudos.reduce((m, c) => Math.max(m, c.t1), 0)
  return fin > 0 ? crudos.map((c) => ({ a: c.a, b: c.b, t0: c.t0 / fin, t1: c.t1 / fin, grosor: c.grosor })) : []
}

/** Las grietas de una variante en la ventana (siempre las mismas para la misma ventana: la semilla). `no`: ninguna. */
export function trazarLasGrietas(variante: VarianteDeLasGrietas, v: Ventana, compacta: boolean, celdas: readonly Celda[]): Tramo[] {
  if (variante === 'no') return []
  const azar = azarDelCristal(GRIETAS.semilla + Number(variante))
  if (variante === '1') return normalizar(telarana(v, compacta, azar))
  if (variante === '2') return normalizar(fractura(v, compacta, azar))
  return normalizar(juntas(v, compacta, azar, celdas))
}
