'use client'

import type { ModoDeAvance } from '../../_lib/motion/cronograma'
import type { NombreDeCurva } from '../../_lib/motion/curvas'

/**
 * LAS PERILLAS — lo que se puede variar sin recompilar.
 *
 * "La calibración final la hace el ojo, y sin perillas no se puede calibrar."
 * Las tres que pide el sprint son duración, escalonado y curva; van dos más que
 * son de la misma familia de decisión.
 *
 * ── Por qué factores y no valores absolutos ────────────────────────────────
 *
 * Cada patrón tiene SU duración medida —1 s, 0,5 s, 2 s— y esas diferencias son
 * parte de lo que se está juzgando. Una perilla que fijara "duración = 1,4 s"
 * para todos aplanaría justo lo que hay que comparar. Un factor mueve los nueve
 * a la vez y conserva las proporciones medidas. Con el factor en 1 el sistema
 * está exactamente en lo medido, y volver ahí es una sola acción.
 */
export interface Ajustes {
  /** Multiplica la duración declarada de los nueve. 1 = lo medido. */
  readonly factorDeDuracion: number
  /** Multiplica el escalonado de los nueve. 1 = lo medido, 0 = todas a la vez. */
  readonly factorDeEscalonado: number
  /** Fuerza una curva en los nueve. `null` = cada patrón con la suya. */
  readonly curvaForzada: NombreDeCurva | null
  /** Quién empuja el progreso: el scroll o el reloj. */
  readonly modo: ModoDeAvance
  /** Si se reproduce la inercia del `scrub` numérico de la referencia. */
  readonly conInercia: boolean
}

/** Lo medido, sin tocar. Es el estado inicial y el destino del botón de reinicio. */
export const AJUSTES_MEDIDOS: Ajustes = {
  factorDeDuracion: 1,
  factorDeEscalonado: 1,
  curvaForzada: null,
  modo: 'atado-al-scroll',
  conInercia: true,
}

/** Los topes de los deslizadores. Fuera de esta banda deja de ser calibración. */
export const TOPES = {
  duracion: { min: 0.25, max: 3, paso: 0.05 },
  escalonado: { min: 0, max: 3, paso: 0.05 },
} as const

/** Cuánto de un bloque tiene que estar en pantalla para disparar el modo temporal. */
export const UMBRAL_DE_ENTRADA = 0.3
