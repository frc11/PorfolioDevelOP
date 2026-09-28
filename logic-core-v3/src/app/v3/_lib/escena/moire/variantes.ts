import { MOIRE_DRIFT_PERIOD_S, MOIRE_MISMATCH } from '../probeMoire'

/**
 * [ESCENA 5] EL MOIRÉ VIVO — puro: las cuatro variantes que se aprobaron en ESCENA 4, juntas. Las
 * texturas las escribe `MoireVivo.tsx`; acá están los números y las cuentas.
 *
 * - **M1a** · la capa gruesa baja 3 veces más rápido que en la base (una celda cada 6,2 s).
 * - **M2** · el scroll la acelera y al frenar vuelve con la inercia de E6 (τ 0,11 s).
 * - **M3** · cada pulso principal de E4 corre la fase de la capa fina una celda.
 * - **M4** · el desajuste (cuántas bandas hay por vuelta) cambia de un tramo del recorrido al otro.
 *
 * **Cómo se suman, y lo que se tocó para eso.** M1a y M2 mueven la misma perilla —la velocidad de la
 * gruesa—, así que no se multiplican: el scroll SE SUMA al piso de M1a y el tope de M2 queda como
 * estaba (24 veces la base). Multiplicadas, un scroll fuerte la llevaba a 72 veces la base (3,9
 * celdas por segundo). M3 y M4 tocan la fina y no se pisan: M3 corre la fase y M4 lee dos
 * desajustes con esa misma fase. Con la cámara quieta y sin hover sólo queda M1a: M2 necesita
 * scroll, M3 un principal (que sólo nace al entrar o salir del hover) y M4 que cambie el tramo.
 */

/** El período de una celda de la capa gruesa en la base. */
export const PERIODO_DE_LA_BASE_S = MOIRE_DRIFT_PERIOD_S

/** M1a · cuántas veces más rápido baja la gruesa, quieta. */
export const M1A = 3

/**
 * M2 · la velocidad de la gruesa es `base × min(tope, M1a + ganancia × |velocidad del progreso|)`
 * (en 1/s), y el scroll entra y sale con τ.
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

/** Cuántas celdas por segundo baja la capa gruesa, con el scroll a esa velocidad (progreso por segundo). */
export function velocidadDeLaGruesa(velocidadDelScroll: number): number {
  return (1 / PERIODO_DE_LA_BASE_S) * Math.min(M2.tope, M1A + M2.ganancia * Math.abs(velocidadDelScroll))
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
