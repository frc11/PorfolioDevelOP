import { CAIDA_AL_HUECO, anguloEnElReloj, type PlacaDelLogo } from './caidaAlHueco'
import { CAIDA_DEL_PIE } from './caidaDelPie'

/**
 * [PULIDO 22] T4 · EL REBOBINADO, AL RITMO DE LO QUE SE VE (pura). El rebobinado de P2 corría `fin` parejo con su curva: desde el final
 * entero en 1,6 s, pero lo que se ve moverse (el vuelco del logo y de las columnas, que en la caída de verdad es rápido) es un tramo
 * angosto de los 6 s del reloj, y volvía en ~0,1 s («todo vuelve volando»). Ahora el rebobinado corre con la misma curva en LO VISIBLE:
 * una medida de `fin` que pesa el vuelco (el ángulo del logo), la bajada parada y, poco, lo quieto (antes y después del golpe). Cada
 * tramo dura lo que pesa: el vuelco vuelve en ~0,55 s y lo quieto pasa rápido. Proporcional a lo avanzado (en lo visible).
 */
export const LO_VISIBLE = { vuelco: 1, bajada: 0.35, quieto: 0.15, muestras: 256 } as const

const DURACION_S = CAIDA_AL_HUECO.golpeS + CAIDA_DEL_PIE.hastaS
const TABLA = { logo: null as PlacaDelLogo | null, v: new Float64Array(LO_VISIBLE.muestras + 1) }

/** La medida acumulada (0 a 1) en cada muestra de `fin`, para este logo (se arma una vez). */
function tabla(logo: PlacaDelLogo): Float64Array {
  if (TABLA.logo === logo) return TABLA.v
  const V = TABLA.v
  const N = LO_VISIBLE.muestras
  const bajaFin = CAIDA_DEL_PIE.bajaS / DURACION_S
  let antes = anguloEnElReloj(logo, 0).a
  V[0] = 0
  for (let i = 1; i <= N; i += 1) {
    const fin = i / N
    const a = anguloEnElReloj(logo, fin * DURACION_S).a
    const enLaBajada = Math.max(0, Math.min(fin, bajaFin) - Math.min((i - 1) / N, bajaFin)) / bajaFin
    V[i] = V[i - 1] + (LO_VISIBLE.vuelco * Math.abs(a - antes)) / (Math.PI / 2) + LO_VISIBLE.bajada * enLaBajada + LO_VISIBLE.quieto / N
    antes = a
  }
  for (let i = 1; i <= N; i += 1) V[i] /= V[N]
  TABLA.logo = logo
  return V
}

/** Cuánto de lo visible hay hasta `fin` (0 a 1). */
export function visibleHasta(fin: number, logo: PlacaDelLogo): number {
  const V = tabla(logo)
  const x = Math.min(1, Math.max(0, fin)) * LO_VISIBLE.muestras
  const i = Math.min(LO_VISIBLE.muestras - 1, Math.floor(x))
  return V[i] + (V[i + 1] - V[i]) * (x - i)
}

/** El `fin` donde lo visible acumulado vale `v` (la inversa: por mitades sobre la tabla y lineal adentro). */
export function finDeLoVisible(v: number, logo: PlacaDelLogo): number {
  const V = tabla(logo)
  const w = Math.min(1, Math.max(0, v))
  let lo = 0
  let hi: number = LO_VISIBLE.muestras
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1
    if (V[m] <= w) lo = m
    else hi = m
  }
  const tramo = V[hi] - V[lo]
  return (lo + (tramo > 1e-12 ? (w - V[lo]) / tramo : 0)) / LO_VISIBLE.muestras
}
