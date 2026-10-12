import type { Brasas, EntradaDeLasBrasas } from './brasas'
import { coordenadasDe, type Dominio } from './dominio'
import { CELDA, celdaDe, indice } from './grilla'

/**
 * [PULIDO 19] Q1.d · LA RED EN REPOSO (`docs/rediseno/PLASMA.md`). Quieta la página (sin scroll, sin un mouse que se mueva, sin dedo)
 * unos segundos, las brasas se FRENAN y se ENLAZAN con rayos finos de vecina en vecina (hasta tres por brasa, las más cercanas): una
 * red de luz quieta y viva (el titileo lo pone el sombreador, `dibujo/red.ts`). Con UN gesto (un scroll, el puntero que se mueve, el
 * dedo, el final del pie) la red se CORTA en cascada desde el origen del gesto en `corteS`, cada enlace con un destello al morir y un
 * golpe de energía a sus dos brasas (el chasquido), y las brasas vuelven a andar. Nunca en el final del pie (`fin` cuenta como gesto)
 * ni con movimiento reducido (el cuadro quieto no la llama). Sin ordenar nada: cada enlace nace y muere con un retardo función de su
 * distancia (al centro del cuadro al formarse: crece del centro hacia afuera; al origen del gesto al cortarse). Puro (Node): sin
 * reservas por cuadro (los búferes son del tamaño máximo desde el armado).
 */
export const REPOSO = {
  /** Cuánto hay que estar quieto (s) para que se arme, cuánto tarda en armarse del centro hacia afuera (s) y en cuánto se enciende cada enlace (s). */
  esperaS: 3.5,
  formaS: 1.8,
  enciendeS: 0.25,
  /** El corte: la cascada desde el origen del gesto (s), el destello de cada enlace al morir (s, y cuánto brilla: alfa por encima de 1) y el golpe de energía a sus brasas. */
  corteS: 0.3,
  destelloS: 0.1,
  destello: 2.2,
  chasquido: 0.4,
  /**
   * Los enlaces: hasta qué distancia en el mundo (u) y en el cuadro (NDC: las cercanas a la cámara no cruzan media pantalla), cuántos
   * por brasa, cuántos en total por brasa (el búfer) y la vida mínima para enlazarse.
   */
  alcance: 2.2,
  alcanceEnElCuadro: 0.2,
  porBrasa: 3,
  porBrasaEnTotal: 1.5,
  vidaMinima: 0.6,
  /** El freno de las brasas (1/s, se suma a la amortiguación): empieza `frenaAntesS` antes de que se arme (quietas primero, enlazadas después) y se suelta en `sueltaS` tras el corte. */
  frena: 12,
  frenaAntesS: 1,
  sueltaS: 0.6,
  /** Un enlace que se estiró más que esto (veces el alcance en el cuadro: una brasa que derivó) se poda. */
  estirado: 1.5,
  /** Qué cuenta como gesto: el scroll (px) y el puntero (NDC: 0,004 son ~3 px a 1440), desde la última referencia (no por cuadro: un mouse que deriva despacio también corta). */
  umbral: { scroll: 1, puntero: 0.004 },
} as const

export type FaseDelReposo = 'suelta' | 'formando' | 'armada' | 'cortando'

export interface Red {
  fase: FaseDelReposo
  /** Cuánto lleva quieta la página (s), cuánto lleva la fase (s), el freno (0 a 1) y el destello del corte (0 a 1, cae). */
  quietaS: number
  faseS: number
  freno: number
  chasquido: number
  /** Los enlaces: cuántos y, por enlace, sus brasas, cuándo nace (s desde que se forma), cuándo muere (s desde el corte), su alfa y su semilla. */
  n: number
  readonly maximo: number
  readonly a: Int32Array
  readonly b: Int32Array
  readonly nace: Float32Array
  readonly muere: Float32Array
  readonly alfa: Float32Array
  readonly semilla: Float32Array
  /** Cuántos enlaces tiene cada brasa. */
  readonly grado: Uint8Array
  /** Cuántas veces se formó y se cortó (el banco, las pruebas); apagada: nunca se forma (el banco, para medir sin ella). */
  formadas: number
  cortes: number
  apagada: boolean
}

export function crearRed(brasas: number): Red {
  const maximo = Math.ceil(brasas * REPOSO.porBrasaEnTotal)
  return {
    fase: 'suelta', quietaS: 0, faseS: 0, freno: 0, chasquido: 0, n: 0, maximo,
    a: new Int32Array(maximo), b: new Int32Array(maximo), nace: new Float32Array(maximo), muere: new Float32Array(maximo), alfa: new Float32Array(maximo), semilla: new Float32Array(maximo),
    grado: new Uint8Array(brasas), formadas: 0, cortes: 0, apagada: false,
  }
}

/** Lo que el gesto recuerda: el scroll y el puntero (NDC) de la última referencia (la del último gesto, o la primera lectura). */
export interface MemoriaDelGesto {
  scroll: number
  x: number
  y: number
  activo: boolean
}

export function crearMemoriaDelGesto(): MemoriaDelGesto {
  return { scroll: Number.NaN, x: Number.NaN, y: Number.NaN, activo: false }
}

/**
 * ¿Hubo un gesto en este cuadro? El scroll que cambió, el puntero (activo) que se movió más que el umbral desde su última referencia
 * (así un mouse que deriva despacio también cuenta, a cualquier cadencia de cuadros), el dedo que toca (o aprieta, pulsa, descarga)
 * o el final del pie. La referencia se renueva con cada gesto y cuando el puntero entra.
 */
export function leerElGesto(m: MemoriaDelGesto, scroll: number, x: number, y: number, activo: boolean, toca: boolean, fin: number): boolean {
  const U = REPOSO.umbral
  let gesto = toca || fin > 0
  if (!Number.isFinite(m.scroll) || Math.abs(scroll - m.scroll) > U.scroll) {
    if (Number.isFinite(m.scroll)) gesto = true
    m.scroll = scroll
  }
  if (activo && m.activo && (Math.abs(x - m.x) > U.puntero || Math.abs(y - m.y) > U.puntero)) gesto = true
  if (!activo || !m.activo || gesto) {
    m.x = x
    m.y = y
  }
  m.activo = activo
  return gesto
}

/** Enlaza `i` con `j` (si hay lugar): nace del centro del cuadro hacia afuera (por su distancia en el cuadro), con un poco de azar. */
function enlazar(r: Red, b: Brasas, d: Dominio, i: number, j: number, azar: () => number): void {
  if (j < 0 || r.n >= r.maximo || r.grado[i] >= REPOSO.porBrasa || r.grado[j] >= REPOSO.porBrasa) return
  const k = r.n
  r.a[k] = i
  r.b[k] = j
  r.grado[i] += 1
  r.grado[j] += 1
  const c = coordenadasDe(d, b.lugar, i * 3)
  const lejos = Math.min(1, Math.sqrt(c.u * c.u + c.v * c.v) / 1.4)
  r.nace[k] = (0.8 * lejos + 0.2 * azar()) * REPOSO.formaS
  r.semilla[k] = azar()
  r.alfa[k] = 0
  r.n = k + 1
}

/** Forma la red: cada brasa a la vista se enlaza con sus (hasta tres) vecinas más cercanas con lugar, por la grilla del último paso. */
function formar(r: Red, b: Brasas, d: Dominio, azar: () => number): void {
  r.n = 0
  r.grado.fill(0)
  const L = b.lugar
  const g = b.grilla
  const A2 = REPOSO.alcance * REPOSO.alcance
  for (let i = 0; i < b.n && r.n < r.maximo; i += 1) {
    if (b.vida[i] < REPOSO.vidaMinima || r.grado[i] >= REPOSO.porBrasa) continue
    // Las tres más cercanas de índice mayor (cada par una vez), sin ordenar: tres lugares.
    let j0 = -1
    let j1 = -1
    let j2 = -1
    let d0 = A2
    let d1 = A2
    let d2 = A2
    celdaDe(g, L, i * 3)
    const cx = CELDA[0]
    const cy = CELDA[1]
    const cz = CELDA[2]
    const ci = coordenadasDe(d, L, i * 3)
    const ui = ci.u
    const vi = ci.v
    const C2 = REPOSO.alcanceEnElCuadro * REPOSO.alcanceEnElCuadro
    for (let ax = Math.max(0, cx - 1); ax <= Math.min(g.nx - 1, cx + 1); ax += 1) for (let ay = Math.max(0, cy - 1); ay <= Math.min(g.ny - 1, cy + 1); ay += 1) for (let az = Math.max(0, cz - 1); az <= Math.min(g.nz - 1, cz + 1); az += 1) {
      for (let j = b.cabeza[indice(g, ax, ay, az)]; j >= 0; j = b.siguiente[j]) {
        if (j <= i || b.vida[j] < REPOSO.vidaMinima || r.grado[j] >= REPOSO.porBrasa) continue
        const dx = L[j * 3] - L[i * 3]
        const dy = L[j * 3 + 1] - L[i * 3 + 1]
        const dz = L[j * 3 + 2] - L[i * 3 + 2]
        const dd = dx * dx + dy * dy + dz * dz
        if (dd >= d2) continue
        const cj = coordenadasDe(d, L, j * 3)
        const du = cj.u - ui
        const dv = cj.v - vi
        if (du * du + dv * dv >= C2) continue
        if (dd < d0) {
          j2 = j1
          d2 = d1
          j1 = j0
          d1 = d0
          j0 = j
          d0 = dd
        } else if (dd < d1) {
          j2 = j1
          d2 = d1
          j1 = j
          d1 = dd
        } else {
          j2 = j
          d2 = dd
        }
      }
    }
    enlazar(r, b, d, i, j0, azar)
    enlazar(r, b, d, i, j1, azar)
    enlazar(r, b, d, i, j2, azar)
  }
  r.fase = 'formando'
  r.faseS = 0
  r.formadas += 1
}

/** Corta la red en cascada desde el origen del gesto (NDC): cada enlace muere por su distancia a él, con un poco de azar. */
function cortar(r: Red, b: Brasas, d: Dominio, ox: number, oy: number, azar: () => number): void {
  if (r.n === 0) {
    soltar(r)
    return
  }
  for (let k = 0; k < r.n; k += 1) {
    const c = coordenadasDe(d, b.lugar, r.a[k] * 3)
    const du = c.u - ox
    const dv = c.v - oy
    const lejos = Math.min(1, Math.sqrt(du * du + dv * dv) / 2.8)
    r.muere[k] = (0.85 * lejos + 0.15 * azar()) * REPOSO.corteS
    r.alfa[k] = Math.min(1, r.alfa[k])
  }
  r.fase = 'cortando'
  r.faseS = 0
  r.cortes += 1
  r.chasquido = 1
}

/** El chasquido: el golpe de energía a las dos brasas de un enlace que muere. */
function chasquear(b: Brasas, i: number, j: number): void {
  b.energia[i] = Math.min(1, b.energia[i] + REPOSO.chasquido)
  b.energia[j] = Math.min(1, b.energia[j] + REPOSO.chasquido)
}

/** Poda los enlaces de una brasa que saltó (reapareció por una cara del dominio, se está mudando) o que se estiró en el cuadro: un enlace no cruza la pantalla. */
function podar(r: Red, b: Brasas, d: Dominio): void {
  const tope = REPOSO.alcanceEnElCuadro * REPOSO.estirado
  for (let k = r.n - 1; k >= 0; k -= 1) {
    const i = r.a[k]
    const j = r.b[k]
    let fuera = b.eventos[i] !== 0 || b.eventos[j] !== 0 || b.migra[i] !== 0 || b.migra[j] !== 0
    if (!fuera) {
      const ci = coordenadasDe(d, b.lugar, i * 3)
      const ui = ci.u
      const vi = ci.v
      const cj = coordenadasDe(d, b.lugar, j * 3)
      fuera = Math.abs(cj.u - ui) > tope || Math.abs(cj.v - vi) > tope
    }
    if (!fuera) continue
    r.grado[i] -= 1
    r.grado[j] -= 1
    const u = r.n - 1
    r.a[k] = r.a[u]
    r.b[k] = r.b[u]
    r.nace[k] = r.nace[u]
    r.muere[k] = r.muere[u]
    r.alfa[k] = r.alfa[u]
    r.semilla[k] = r.semilla[u]
    r.n = u
  }
}

function soltar(r: Red): void {
  r.n = 0
  r.grado.fill(0)
  r.fase = 'suelta'
  r.faseS = 0
  r.quietaS = 0
}

/**
 * Un cuadro de la red: quieta se arma; con un gesto se corta en cascada (el origen del gesto en NDC: el puntero si está, o el centro);
 * y el freno de las brasas (`en.freno`: entero con la red; se suelta después del corte). El dominio tiene que estar listo.
 */
export function pasoDeLaRed(r: Red, b: Brasas, d: Dominio, en: EntradaDeLasBrasas, dt: number, gesto: boolean, ox: number, oy: number, azar: () => number): void {
  r.chasquido = Math.max(0, r.chasquido - dt / REPOSO.destelloS)
  if (r.n > 0) podar(r, b, d)
  if (r.fase === 'suelta') {
    r.quietaS = gesto || r.apagada ? 0 : r.quietaS + dt
    if (r.quietaS >= REPOSO.esperaS && d.listo) formar(r, b, d, azar)
  } else if (r.fase === 'formando' || r.fase === 'armada') {
    if (gesto || r.apagada) cortar(r, b, d, ox, oy, azar)
    else {
      r.faseS += dt
      if (r.fase === 'formando') {
        let todas = true
        for (let k = 0; k < r.n; k += 1) {
          const v = Math.min(1, Math.max(0, (r.faseS - r.nace[k]) / REPOSO.enciendeS))
          r.alfa[k] = v
          if (v < 1) todas = false
        }
        if (todas) r.fase = 'armada'
      }
    }
  }
  if (r.fase === 'cortando') {
    const antes = r.faseS
    r.faseS += dt
    let vivas = 0
    for (let k = 0; k < r.n; k += 1) {
      const m = r.muere[k]
      if (r.faseS < m) {
        vivas += 1
        continue
      }
      if (antes < m) chasquear(b, r.a[k], r.b[k])
      const v = 1 - Math.min(1, (r.faseS - m) / REPOSO.destelloS)
      r.alfa[k] = v * REPOSO.destello
      if (v > 0) vivas += 1
    }
    if (vivas === 0) soltar(r)
  }
  // El freno: desde `frenaAntesS` antes de armarse (quietas primero) y mientras se forma o está armada; se suelta en `sueltaS`.
  const objetivo = r.fase === 'formando' || r.fase === 'armada' || (r.fase === 'suelta' && r.quietaS > REPOSO.esperaS - REPOSO.frenaAntesS) ? 1 : 0
  r.freno += (objetivo - r.freno) * Math.min(1, dt / (objetivo > r.freno ? REPOSO.frenaAntesS * 0.4 : REPOSO.sueltaS))
  en.freno = r.freno
}
