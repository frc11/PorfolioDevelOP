import { MOIRE_DRIFT_PERIOD_S, MOIRE_MISMATCH } from '../probeMoire'
import type { VarianteDelMoire } from '../entorno'

/**
 * [ESCENA 4] LA CÚPULA — puro: cuánto se mueven las dos tramas en cada variante del moiré, y la onda
 * de la membrana. Las texturas las escribe `CupulaViva.tsx`; acá están los números y las cuentas.
 *
 * **Lo que la mueve hoy** (`probeMoire.ts`): la capa gruesa (50 celdas por vuelta, radio 44) baja UNA
 * celda cada 18,7 s y la fina (102 celdas, radio 38) está quieta. El desajuste (2) es la cantidad de
 * bandas de batido por vuelta, y la separación de 6 unidades entre las capas pone el resto: el
 * paralaje con la cámara, que orbita entre 14 y 20 del centro.
 */

/** El período de una celda de la capa gruesa, hoy. */
export const PERIODO_HOY_S = MOIRE_DRIFT_PERIOD_S

/** M1 · más rápido, en dos velocidades: el período dividido por esto. */
export const M1 = { M1a: 3, M1b: 8 } as const

/**
 * M2 · la velocidad de la capa acompaña al scroll: se multiplica por `1 + ganancia × |velocidad del
 * progreso|` (1/s) con tope, y vuelve con la inercia de E6 (τ 0,11 s, `ESTELA_TAU_S`).
 */
export const M2 = { ganancia: 160, tope: 24, tauS: 0.11 } as const

/** M3 · el pulso principal corre la fase de la capa fina UNA celda, con una curva de ida suave. */
export const M3 = { celdas: 1, duraS: 1.4 } as const

/**
 * M4 · el desajuste de cada tramo: cuántas bandas hay. Cambia suave entre tramos (mezclando dos
 * desajustes enteros, que siempre cierran alrededor del cilindro). Los tramos son los nudos del
 * anclaje: hero, Quiénes somos, Números, Trabajos, (tapado), Por qué develOP y el pie.
 */
export const M4 = {
  tramos: [
    { desde: 0, desajuste: 2 },
    { desde: 0.125, desajuste: 3 },
    { desde: 0.375, desajuste: 5 },
    { desde: 0.5, desajuste: 1 },
    { desde: 0.75, desajuste: 4 },
    { desde: 0.955, desajuste: 2 },
  ],
  /** Cuánto progreso dura el cambio de un tramo al siguiente. */
  transicion: 0.03,
} as const

/** M5 · (nuestra) el cursor corre la fase de la capa fina: moverlo barre las bandas. Media celda por lado. */
export const M5 = { celdasPorLado: 0.5, tauS: 0.25 } as const

/** Cuántas celdas por segundo baja la capa gruesa, para las variantes de velocidad. */
export function velocidadDeLaGruesa(variante: VarianteDelMoire, velocidadDelScroll: number): number {
  const base = 1 / PERIODO_HOY_S
  if (variante === 'M1a' || variante === 'M1b') return base * M1[variante]
  if (variante === 'M2') return base * Math.min(M2.tope, 1 + M2.ganancia * Math.abs(velocidadDelScroll))
  return base
}

const suave = (u: number): number => {
  const x = Math.min(1, Math.max(0, u))
  return x * x * (3 - 2 * x)
}

/** M3 · cuánto va corrida la fase a `s` segundos del último principal (0 → `M3.celdas`). */
export function corrimientoDelPulso(s: number): number {
  if (!(s >= 0)) return 0
  return M3.celdas * suave(s / M3.duraS)
}

/** M4 · el desajuste (no entero en las transiciones) para un progreso. */
export function desajusteEn(progreso: number): number {
  const t = M4.tramos
  let valor: number = MOIRE_MISMATCH
  for (let i = 0; i < t.length; i += 1) {
    const anterior = i === 0 ? t[0].desajuste : t[i - 1].desajuste
    const u = (progreso - t[i].desde) / M4.transicion
    if (u <= 0) break
    valor = anterior + (t[i].desajuste - anterior) * suave(u)
  }
  return valor
}

/**
 * LA MEMBRANA — la onda que sale con el pulso principal y recorre la trama de abajo hacia arriba
 * (en altos de banda por segundo), corriendo las líneas de costado, y la lente del cursor.
 */
export const MEMBRANA = {
  onda: { celdas: 0.1, velocidad: 0.55, ancho: 0.1, crestas: 6, duraS: 2.6 },
  lente: { fuerza: 0.16, radioPx: 120 },
} as const
