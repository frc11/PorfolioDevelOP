/**
 * Q1.2 — Reglas 🔴 de resolución de texto y evaluabilidad. Puras, sin red.
 * Las usan TANTO los asserts duros COMO el juez, para que ambos miren lo mismo.
 */
import type { CapturedScenario, CapturedTurn } from '../types'

/**
 * 🔴 Texto a evaluar = `wireText` si tiene contenido, si no `assistantText`.
 * Nunca `assistantText` pelado: Q1.1 mostró que puede venir vacío con el texto
 * real en `wireText` (ej. un turno que terminó en tool-call, `base-hot` turno 0).
 */
export function resolveText(turn: CapturedTurn): string {
  const wire = turn.wireText?.trim()
  if (wire) return turn.wireText
  return turn.assistantText
}

/** Un turno es evaluable si no tiene error técnico ni respuesta degradada. */
export function isTurnEvaluable(turn: CapturedTurn): boolean {
  return turn.error === null && turn.degraded === null
}

/** Turnos limpios (evaluables) de un escenario, en orden. */
export function evaluableTurns(scenario: CapturedScenario): CapturedTurn[] {
  return scenario.turns.filter(isTurnEvaluable)
}

/**
 * 🔴 Motivo por el que un escenario es NO-evaluable (ni asserts ni juez), o
 * `null` si es evaluable. Un error de Q1.1 a nivel escenario lo saca entero:
 * no se penaliza al bot por un timeout de persistencia del harness. Defensivo:
 * si el escenario no marcó error pero todos sus turnos están rotos, tampoco es
 * evaluable.
 */
export function scenarioNonEvaluableReason(scenario: CapturedScenario): string | null {
  if (scenario.error !== null) return scenario.error
  if (scenario.turns.length > 0 && evaluableTurns(scenario).length === 0) {
    return 'todos los turnos no-evaluables (error técnico o respuesta degradada)'
  }
  return null
}
