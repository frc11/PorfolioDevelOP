/**
 * Q1.2 — Asserts DUROS. Función pura `CapturedScenario → AssertOutcome[]`:
 * determinística, sin LLM, sin red. Misma entrada → mismo veredicto.
 *
 * Cubre las expectations binarias/verificables. Lo perceptual (tono, loreteo)
 * es del juez LLM — nunca dejar que el juez decida lo que un assert puede.
 *
 * Devuelve SIEMPRE un outcome por categoría (los 4): `skip` cuando la
 * expectation está ausente, así los totales por categoría suman la cantidad de
 * escenarios evaluables.
 */
import type { CapturedScenario, CapturedTurn, Expectations } from '../types'
import type { AssertOutcome } from './types'
import { evaluableTurns, resolveText } from './resolve'

/**
 * Nombres de tools. Fuente de verdad: `ALL_TOOL_SLUGS` en
 * `server/tools/getTools.ts`. Se duplican acá a propósito para mantener el
 * evaluador PURO (importar el runtime arrastraría Prisma/red).
 */
const CAPTURE_TOOLS: readonly string[] = ['capture_lead']
const HANDOFF_TOOLS: readonly string[] = ['show_whatsapp_handoff', 'offer_handoff_options']

function toolFired(turns: CapturedTurn[], names: readonly string[]): boolean {
  return turns.some((t) => t.toolCalls.some((c) => names.includes(c.toolName)))
}

/** Minúsculas + sin acentos, para comparación de substring robusta. */
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g')
function normalize(s: string): string {
  return s.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase()
}

// ─── Un assert por categoría ─────────────────────────────────────────────────

function assertCapture(exp: Expectations, turns: CapturedTurn[]): AssertOutcome {
  if (exp.shouldCaptureLead === undefined) {
    return { category: 'capture', status: 'skip', detail: 'sin expectativa de captura', bestEffort: false }
  }
  const fired = toolFired(turns, CAPTURE_TOOLS)
  const pass = exp.shouldCaptureLead ? fired : !fired
  return {
    category: 'capture',
    status: pass ? 'pass' : 'fail',
    detail: `esperado capturar=${exp.shouldCaptureLead}; capture_lead ${fired ? 'emitida' : 'ausente'}`,
    bestEffort: false,
  }
}

function assertHandoff(exp: Expectations, turns: CapturedTurn[]): AssertOutcome {
  if (exp.shouldHandoff === undefined) {
    return { category: 'handoff', status: 'skip', detail: 'sin expectativa de handoff', bestEffort: false }
  }
  const fired = toolFired(turns, HANDOFF_TOOLS)
  const pass = exp.shouldHandoff ? fired : !fired
  return {
    category: 'handoff',
    status: pass ? 'pass' : 'fail',
    detail: `esperado handoff=${exp.shouldHandoff}; ${HANDOFF_TOOLS.join('/')} ${fired ? 'emitida' : 'ausente'}`,
    bestEffort: false,
  }
}

function assertMustNotClaim(exp: Expectations, turns: CapturedTurn[]): AssertOutcome {
  const phrases = (exp.mustNotClaim ?? []).filter((p) => p.trim().length > 0)
  if (phrases.length === 0) {
    return { category: 'mustNotClaim', status: 'skip', detail: 'sin frases prohibidas', bestEffort: false }
  }
  const hits: string[] = []
  for (const turn of turns) {
    const text = normalize(resolveText(turn))
    for (const phrase of phrases) {
      if (text.includes(normalize(phrase))) hits.push(phrase)
    }
  }
  const pass = hits.length === 0
  return {
    category: 'mustNotClaim',
    status: pass ? 'pass' : 'fail',
    detail: pass
      ? `no afirmó ninguna de ${phrases.length} frase(s) prohibida(s)`
      : `afirmó frase(s) prohibida(s): ${[...new Set(hits)].join(' | ')}`,
    bestEffort: false,
  }
}

function assertIntent(exp: Expectations, turns: CapturedTurn[]): AssertOutcome {
  if (exp.expectedIntent === undefined) {
    return { category: 'intent', status: 'skip', detail: 'sin intent esperado', bestEffort: true }
  }
  const matched = turns.some((t) => t.intentDetectedOffline === exp.expectedIntent)
  const observed = [...new Set(turns.map((t) => t.intentDetectedOffline ?? '(null)'))]
  return {
    category: 'intent',
    status: matched ? 'pass' : 'fail',
    detail: `esperado "${exp.expectedIntent}"; offline detectó ${observed.map((i) => `"${i}"`).join(', ')}`,
    bestEffort: true,
  }
}

/**
 * Evalúa los asserts de un escenario EVALUABLE (el caller garantiza que no es
 * no-evaluable). Solo mira turnos limpios. Siempre 4 outcomes (uno por categoría).
 */
export function evaluateAsserts(scenario: CapturedScenario): AssertOutcome[] {
  const exp = scenario.expectations
  const turns = evaluableTurns(scenario)
  return [
    assertCapture(exp, turns),
    assertHandoff(exp, turns),
    assertMustNotClaim(exp, turns),
    assertIntent(exp, turns),
  ]
}
