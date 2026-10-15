import { armarElArbol } from './arbol'
import type { Brasas, EntradaDeLasBrasas } from './brasas'
import { CADENAS, crecerLasCadenas, empezarLasCadenas } from './cadenas'
import { crearCajas, cruzaUnaCaja, type CajasDeLaRed } from './cajas'
import { coordenadasDe, type Dominio } from './dominio'

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
  // [PULIDO 22] T1 · gradual (pocos al principio: la cuenta crece con el cuadrado del tiempo). [PULIDO 23] U2 · en ~15 s (eran 30).
  formaS: 15,
  enciendeS: 0.6,
  /** El corte: la cascada desde el origen del gesto (s), el destello de cada enlace al morir (s, y cuánto brilla: alfa por encima de 1) y el golpe de energía a sus brasas. */
  corteS: 0.3,
  destelloS: 0.1,
  destello: 2.2,
  chasquido: 0.4,
  /**
   * Los enlaces: hasta qué distancia en el mundo (u) y en el cuadro (NDC: las cercanas a la cámara no cruzan media pantalla), cuántos
   * por brasa, cuántos en total por brasa (el búfer) y la vida mínima para enlazarse. [PULIDO 27] Z2 · rayos más GRANDES (de 2,2 u y 0,2
   * del cuadro a 3,4 y 0,3) y MENOS: como mucho `enlaces` por brasa activa (eran unos 0,45: una maraña de rayos finos).
   */
  alcance: 3.4,
  alcanceEnElCuadro: 0.3,
  enlaces: 0.08,
  porBrasa: CADENAS.porBrasa,
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
  /** [PULIDO 23] U2 · las brasas quietas (con un enlace encendido: las otras siguen andando), la cadena de cada una y su tamaño (por la
   * cadena), la brasa que sigue en los intentos y cuántos se hicieron. */
  readonly quieta: Uint8Array
  readonly cadena: Int32Array
  readonly tamano: Uint8Array
  cursor: number
  intentos: number
  /** Cuántas veces se formó y se cortó (el banco, las pruebas); apagada: nunca se forma (el banco, para medir sin ella). */
  formadas: number
  cortes: number
  apagada: boolean
  /**
   * [PULIDO 27] Z2 · cómo se forma (`cadenas`, la de siempre; `toda`, `?red=toda`: un árbol que une todas las que se ven, `arbol.ts`),
   * cuántos enlaces como mucho en esta formación, las cajas que no tapa (`cajas.ts`) y los búferes del árbol (sus aristas candidatas,
   * sus claves y el bosque).
   */
  modo: 'cadenas' | 'toda'
  tope: number
  readonly cajas: CajasDeLaRed
  readonly aristas: Int32Array
  readonly claves: Float64Array
  readonly padre: Int32Array
}

export function crearRed(brasas: number): Red {
  const maximo = Math.ceil(brasas * REPOSO.porBrasaEnTotal)
  return {
    fase: 'suelta', quietaS: 0, faseS: 0, freno: 0, chasquido: 0, n: 0, maximo,
    a: new Int32Array(maximo), b: new Int32Array(maximo), nace: new Float32Array(maximo), muere: new Float32Array(maximo), alfa: new Float32Array(maximo), semilla: new Float32Array(maximo),
    grado: new Uint8Array(brasas), quieta: new Uint8Array(brasas), cadena: new Int32Array(brasas), tamano: new Uint8Array(brasas), cursor: 0, intentos: 0, formadas: 0, cortes: 0, apagada: false,
    modo: 'cadenas', tope: maximo, cajas: crearCajas(), aristas: new Int32Array(brasas * 16), claves: new Float64Array(brasas * 8), padre: new Int32Array(brasas),
  }
}

/** Lo que el gesto recuerda: el scroll y el puntero (NDC) de la última referencia (la del último gesto, o la primera lectura). */
export interface MemoriaDelGesto { scroll: number; x: number; y: number; activo: boolean }

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

/**
 * Forma la red: [PULIDO 23] U2 · empieza las cadenas (vacías); la red crece en cada cuadro de la formación (`cadenas.ts`). [PULIDO 27] Z2 ·
 * con su tope (por las brasas activas); con `?red=toda`, el árbol entero de una vez (se enciende del centro hacia afuera).
 */
function formar(r: Red, b: Brasas, d: Dominio, azar: () => number): void {
  empezarLasCadenas(r, b.n)
  let activas = 0
  for (let i = 0; i < b.n; i += 1) activas += 1 - b.oculta[i]
  r.tope = Math.min(r.maximo, Math.round(REPOSO.enlaces * activas))
  if (r.modo === 'toda') armarElArbol(r, b, d, REPOSO.vidaMinima, REPOSO.formaS, azar)
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

/** Poda los enlaces de una brasa que saltó (reapareció por una cara del dominio, nació o murió), que se estiró en el cuadro (un enlace no cruza la pantalla) o que tapa una caja. */
const LARGO_TOPE2 = (REPOSO.alcance * REPOSO.estirado) ** 2
function podar(r: Red, b: Brasas, d: Dominio): void {
  const tope = REPOSO.alcanceEnElCuadro * REPOSO.estirado
  for (let k = r.n - 1; k >= 0; k -= 1) {
    const i = r.a[k]
    const j = r.b[k]
    let fuera = b.eventos[i] !== 0 || b.eventos[j] !== 0 || b.oculta[i] !== 0 || b.oculta[j] !== 0
    if (!fuera) {
      const ci = coordenadasDe(d, b.lugar, i * 3)
      const ui = ci.u
      const vi = ci.v
      const cj = coordenadasDe(d, b.lugar, j * 3)
      fuera = Math.abs(cj.u - ui) > tope || Math.abs(cj.v - vi) > tope
      // [PULIDO 22] T1 · y en el mundo: en ~30 s de formación una brasa deriva (siempre vecinas cercanas).
      const L = b.lugar
      fuera ||= (L[j * 3] - L[i * 3]) ** 2 + (L[j * 3 + 1] - L[i * 3 + 1]) ** 2 + (L[j * 3 + 2] - L[i * 3 + 2]) ** 2 > LARGO_TOPE2
      // [PULIDO 27] Z2 · y uno que pasó a tapar un texto, un botón o el logo (`cajas.ts`).
      fuera ||= cruzaUnaCaja(r.cajas, ui, vi, cj.u, cj.v)
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
  r.quieta.fill(0)
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
        if (r.modo === 'cadenas') crecerLasCadenas(r, b, d, r.faseS, REPOSO.formaS, REPOSO.alcance, REPOSO.alcanceEnElCuadro, REPOSO.vidaMinima, azar)
        let todas = r.faseS >= REPOSO.formaS
        for (let k = 0; k < r.n; k += 1) {
          const v = Math.min(1, Math.max(0, (r.faseS - r.nace[k]) / REPOSO.enciendeS))
          r.alfa[k] = v
          if (v < 1) todas = false
          // Encendido, sus dos brasas se quedan quietas (las otras siguen andando).
          if (v > 0) r.quieta[r.a[k]] = r.quieta[r.b[k]] = 1
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
  en.quietas = r.quieta
}
