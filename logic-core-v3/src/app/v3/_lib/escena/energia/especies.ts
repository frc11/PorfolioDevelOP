/**
 * [PULIDO 16] N2 · LAS ESPECIES DEL PLASMA (el modelo entero: `docs/rediseno/PLASMA.md`). Partículas de verdad, no puntos:
 *   · ÁTOMO neutro (carga 0): un núcleo brillante con uno o dos electrones en micro-órbita (de cerca se ven; de lejos, un punto).
 *   · ION + (carga +1): un átomo que perdió un electrón: el núcleo con un halo más caliente, sin órbita.
 *   · ELECTRÓN libre (carga −1): chico, liviano y rápido, con una estela corta.
 * IONIZAR: un átomo se vuelve ion y suelta un electrón (de un lugar libre de la reserva), que sale disparado. RECOMBINAR: un ion
 * captura un electrón libre y vuelve a ser átomo (un destello chico); el electrón se funde en él. La carga se conserva siempre
 * (la suma da cero). Todo nace y muere con un fundido (`alfa` persigue a `meta`): nunca aparece ni desaparece de golpe.
 * Puro: sin three ni el DOM (la prueba lo corre en Node). Las fuerzas, `fisica.ts`; los arcos, `arcos.ts`; el dibujo, `render/`.
 */

export const ESPECIE = { vacio: 0, atomo: 1, ion: 2, electron: 3 } as const
export type Especie = (typeof ESPECIE)[keyof typeof ESPECIE]

/** La carga de cada especie (por su número) y su masa (los electrones, livianos: se mueven rápido). */
export const CARGA_DE: readonly number[] = [0, 0, 1, -1]
export const MASA_DE: readonly number[] = [1, 1, 1, 0.14]

export const ESPECIES = {
  /** Cuántos átomos (sus lugares; algunos son iones) y cuántos lugares de electrón libre, en escritorio y en el teléfono. */
  atomos: { escritorio: 260, compacta: 140 },
  electrones: { escritorio: 64, compacta: 36 },
  /** Al empezar, qué parte de los átomos ya está ionizada (con su electrón suelto cerca): hay cargas desde el primer cuadro. */
  ionizadosAlEmpezar: 0.12,
  /** Dónde viven: una cáscara alrededor del centro del logo (u): el radio y el hueco del medio (el logo mide 6,9 de ancho). */
  volumen: { radio: 13, hueco: 4.2 },
  /** Más afuera que esto (veces el radio) se van con un fundido y vuelven a nacer adentro de la cáscara. */
  seVaMasAllaDe: 1.35,
  /** Los fundidos (s): nacer, irse; el electrón que sale de un átomo aparece rápido, y el que se captura se funde rápido. */
  fundido: { nace: 0.9, seVa: 0.7, eyectado: 0.06, capturado: 0.12 },
  /** El electrón que sale al ionizar: su rapidez (u/s, al azar en el tramo). */
  eyeccion: [2.6, 4.2],
  /** El brillo que deja un evento (se suma; se apaga con `apagaS`): ionizar (al ion), recombinar (el destello del átomo), un arco. */
  brillo: { ioniza: 1.2, recombina: 1.6, arco: 0.5, apagaS: 0.35 },
  /** El calor de un ion recién hecho (su halo más caliente) y en cuánto se enfría (s). */
  calor: { ion: 1, apagaS: 2.4 },
  /** El eco de una recombinación (un anillo chico que crece, en `render/`): cuántos a la vez y cuánto dura (s). */
  eco: { cuantos: 4, s: 0.4 },
} as const

/** El estado de las partículas: todo en arreglos fijos (los lugares de átomo primero, después los de electrón). */
export interface Particulas {
  readonly n: number
  readonly nAtomos: number
  readonly especie: Uint8Array
  readonly lugar: Float32Array
  readonly velocidad: Float32Array
  readonly fuerza: Float32Array
  /** Por partícula: el tamaño (0–1), dos fases de la agitación y la fase de la órbita. */
  readonly semilla: Float32Array
  /** Por átomo: cuántos electrones en órbita (1 o 2) y la inclinación del plano de la órbita (dos ángulos). */
  readonly orbita: Float32Array
  /** Lo que se ve (0–1) y adónde va (1: vive; 0: se va). */
  readonly alfa: Float32Array
  readonly meta: Float32Array
  /** El fundido de cada uno (s): cuánto tarda en llegar a su meta. */
  readonly fundido: Float32Array
  readonly brillo: Float32Array
  readonly calor: Float32Array
  /** El electrón que se está fundiendo en un ion: a quién (−1: ninguno). */
  readonly capturadoPor: Int32Array
  /** La cuenta de los eventos (para el banco y la prueba). */
  readonly cuenta: { ionizaciones: number; recombinaciones: number; renacidos: number }
  /** Los ecos de las últimas recombinaciones: (x, y, z, edad en s) cada uno; el próximo lugar a usar. */
  readonly ecos: Float32Array
  eco: number
}

/** Un azar con semilla (mulberry32): las partículas y los arcos son los mismos en cada carga de la página (y en el banco). */
export function azarConSemilla(semilla: number): () => number {
  let s = semilla >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Un punto al azar en la cáscara (la dirección pareja y el radio con la raíz cúbica), en `lugar` desde `i * 3`. */
export function puntoEnLaCascara(lugar: Float32Array, i: number, azar: () => number): void {
  const { radio, hueco } = ESPECIES.volumen
  const z = azar() * 2 - 1
  const fi = azar() * Math.PI * 2
  const s = Math.sqrt(1 - z * z)
  const r = Math.cbrt(hueco ** 3 + azar() * (radio ** 3 - hueco ** 3))
  lugar[i * 3] = Math.cos(fi) * s * r
  lugar[i * 3 + 1] = z * r
  lugar[i * 3 + 2] = Math.sin(fi) * s * r
}

export function crearParticulas(nAtomos: number, nElectrones: number, azar: () => number): Particulas {
  const n = nAtomos + nElectrones
  const p: Particulas = {
    n,
    nAtomos,
    especie: new Uint8Array(n),
    lugar: new Float32Array(n * 3),
    velocidad: new Float32Array(n * 3),
    fuerza: new Float32Array(n * 3),
    semilla: new Float32Array(n * 4),
    orbita: new Float32Array(n * 3),
    alfa: new Float32Array(n),
    meta: new Float32Array(n),
    fundido: new Float32Array(n).fill(ESPECIES.fundido.nace),
    brillo: new Float32Array(n),
    calor: new Float32Array(n),
    capturadoPor: new Int32Array(n).fill(-1),
    cuenta: { ionizaciones: 0, recombinaciones: 0, renacidos: 0 },
    ecos: new Float32Array(ESPECIES.eco.cuantos * 4).fill(ESPECIES.eco.s),
    eco: 0,
  }
  for (let i = 0; i < n; i += 1) {
    // Muchos chicos y pocos grandes; las fases de la agitación y de la órbita.
    p.semilla[i * 4] = azar() ** 2
    p.semilla[i * 4 + 1] = azar() * Math.PI * 2
    p.semilla[i * 4 + 2] = azar() * Math.PI * 2
    p.semilla[i * 4 + 3] = azar() * Math.PI * 2
    p.orbita[i * 3] = azar() < 0.6 ? 1 : 2
    p.orbita[i * 3 + 1] = (azar() - 0.5) * Math.PI
    p.orbita[i * 3 + 2] = 0.25 + azar() * 0.6
    if (i < nAtomos) {
      p.especie[i] = ESPECIE.atomo
      puntoEnLaCascara(p.lugar, i, azar)
      p.meta[i] = 1
    }
  }
  // Algunos empiezan ionizados, con su electrón suelto al lado (sin la cuenta: no es un evento).
  const cuantos = Math.min(nElectrones, Math.round(nAtomos * ESPECIES.ionizadosAlEmpezar))
  for (let k = 0; k < cuantos; k += 1) {
    const i = Math.floor((k * nAtomos) / Math.max(1, cuantos))
    const e = ionizar(p, i, 0, 1, 0, 0.6, azar)
    if (e >= 0) p.fundido[e] = ESPECIES.fundido.nace
  }
  p.cuenta.ionizaciones = 0
  return p
}

/** Un lugar libre de electrón (o −1 si la reserva está llena). */
export function lugarDeElectron(p: Particulas): number {
  for (let e = p.nAtomos; e < p.n; e += 1) if (p.especie[e] === ESPECIE.vacio) return e
  return -1
}

/**
 * Ioniza el átomo `i`: queda ion (+1) y sale un electrón (−1) en la dirección (dx, dy, dz) con rapidez `rapidez` (u/s). Devuelve
 * el electrón, o −1 si no es un átomo vivo o la reserva está llena (el sistema no se satura: sin lugar, no hay ionización).
 */
export function ionizar(p: Particulas, i: number, dx: number, dy: number, dz: number, rapidez: number, azar: () => number): number {
  if (p.especie[i] !== ESPECIE.atomo || p.meta[i] < 1) return -1
  const e = lugarDeElectron(p)
  if (e < 0) return -1
  const l = Math.hypot(dx, dy, dz) || 1
  p.especie[i] = ESPECIE.ion
  p.especie[e] = ESPECIE.electron
  for (let k = 0; k < 3; k += 1) {
    const dir = (k === 0 ? dx : k === 1 ? dy : dz) / l
    p.lugar[e * 3 + k] = p.lugar[i * 3 + k] + dir * 0.18
    p.velocidad[e * 3 + k] = p.velocidad[i * 3 + k] + dir * rapidez + (azar() - 0.5) * 0.4
  }
  p.alfa[e] = 0
  p.meta[e] = 1
  p.fundido[e] = ESPECIES.fundido.eyectado
  p.brillo[e] = 1
  p.capturadoPor[e] = -1
  p.brillo[i] += ESPECIES.brillo.ioniza
  p.calor[i] = ESPECIES.calor.ion
  p.cuenta.ionizaciones += 1
  return e
}

/** El ion `i` captura al electrón `e`: vuelve a ser átomo (con un destello) y el electrón se funde en él. */
export function recombinar(p: Particulas, i: number, e: number): boolean {
  if (p.especie[i] !== ESPECIE.ion || p.especie[e] !== ESPECIE.electron || p.capturadoPor[e] >= 0) return false
  p.especie[i] = ESPECIE.atomo
  p.calor[i] = 0
  p.brillo[i] += ESPECIES.brillo.recombina
  p.capturadoPor[e] = i
  p.meta[e] = 0
  p.fundido[e] = ESPECIES.fundido.capturado
  p.cuenta.recombinaciones += 1
  // Su eco: donde está el ion, desde cero.
  const k = p.eco * 4
  p.ecos[k] = p.lugar[i * 3]
  p.ecos[k + 1] = p.lugar[i * 3 + 1]
  p.ecos[k + 2] = p.lugar[i * 3 + 2]
  p.ecos[k + 3] = 0
  p.eco = (p.eco + 1) % ESPECIES.eco.cuantos
  return true
}

/** La carga efectiva de `i` (la de su especie; el electrón que se funde ya no cuenta). */
export function cargaDe(p: Particulas, i: number): number {
  return p.capturadoPor[i] >= 0 ? 0 : CARGA_DE[p.especie[i]]
}

/** La suma de las cargas (el electrón que se funde ya es parte de su átomo): siempre 0. */
export function cargaTotal(p: Particulas): number {
  let q = 0
  for (let i = 0; i < p.n; i += 1) q += cargaDe(p, i)
  return q
}

/**
 * Los fundidos y los que se van, en un paso: `alfa` persigue a `meta` (lineal, en su tiempo); el electrón capturado va hacia su ion
 * y al apagarse libera su lugar; el que se fue lejos se apaga y renace adentro de la cáscara, con su misma especie (la carga sigue
 * en cero). Brillo y calor se apagan.
 */
export function fundidos(p: Particulas, dt: number, azar: () => number): void {
  for (let k = 3; k < p.ecos.length; k += 4) p.ecos[k] = Math.min(ESPECIES.eco.s, p.ecos[k] + dt)
  const apagaBrillo = Math.exp(-dt / ESPECIES.brillo.apagaS)
  const apagaCalor = Math.exp(-dt / ESPECIES.calor.apagaS)
  const lejos = ESPECIES.volumen.radio * ESPECIES.seVaMasAllaDe
  for (let i = 0; i < p.n; i += 1) {
    if (p.especie[i] === ESPECIE.vacio) continue
    const paso = dt / Math.max(1e-3, p.fundido[i])
    p.alfa[i] = p.meta[i] > p.alfa[i] ? Math.min(p.meta[i], p.alfa[i] + paso) : Math.max(p.meta[i], p.alfa[i] - paso)
    p.brillo[i] *= apagaBrillo
    p.calor[i] *= apagaCalor
    const ion = p.capturadoPor[i]
    if (ion >= 0) {
      // Se funde en su ion: va hacia él.
      for (let k = 0; k < 3; k += 1) p.lugar[i * 3 + k] += (p.lugar[ion * 3 + k] - p.lugar[i * 3 + k]) * Math.min(1, dt * 18)
      if (p.alfa[i] <= 0) {
        p.especie[i] = ESPECIE.vacio
        p.capturadoPor[i] = -1
      }
      continue
    }
    const r = Math.hypot(p.lugar[i * 3], p.lugar[i * 3 + 1], p.lugar[i * 3 + 2])
    if (r > lejos && p.meta[i] > 0) {
      p.meta[i] = 0
      p.fundido[i] = ESPECIES.fundido.seVa
    }
    if (p.meta[i] === 0 && p.alfa[i] <= 0) {
      puntoEnLaCascara(p.lugar, i, azar)
      p.velocidad.fill(0, i * 3, i * 3 + 3)
      p.meta[i] = 1
      p.fundido[i] = ESPECIES.fundido.nace
      p.cuenta.renacidos += 1
    }
  }
}

/** Cuántas hay de cada especie (sin los vacíos ni los que se funden). */
export function censo(p: Particulas): { atomos: number; iones: number; electrones: number } {
  let [atomos, iones, electrones] = [0, 0, 0]
  for (let i = 0; i < p.n; i += 1) {
    if (p.capturadoPor[i] >= 0) continue
    if (p.especie[i] === ESPECIE.atomo) atomos += 1
    else if (p.especie[i] === ESPECIE.ion) iones += 1
    else if (p.especie[i] === ESPECIE.electron) electrones += 1
  }
  return { atomos, iones, electrones }
}
