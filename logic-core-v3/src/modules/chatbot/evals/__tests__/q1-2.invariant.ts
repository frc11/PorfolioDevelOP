/**
 * Q1.2 — Batería de invariantes del evaluador.
 *
 *   npx tsx src/modules/chatbot/evals/__tests__/q1-2.invariant.ts
 *   npm run test:q12
 *
 * Cero DB, cero network, cero side effects. Fixtures inline `RunResult`-shaped.
 * Verifica: resolución de texto (🔴 wireText→assistantText), evaluabilidad (turnos
 * con error excluidos), asserts duros (captura/handoff/mustNotClaim/intent) y el
 * parser tolerante del veredicto del juez (respuesta buena y mal formada).
 */
import assert from 'node:assert/strict'
import type { CapturedScenario, CapturedTurn } from '../types'
import type { AssertCategory } from '../scoring/types'
import {
  evaluableTurns,
  isTurnEvaluable,
  resolveText,
  scenarioNonEvaluableReason,
} from '../scoring/resolve'
import { evaluateAsserts } from '../scoring/hard-asserts'
import { parseJudgeVerdict } from '../scoring/parse-verdict'

// ─── Factories ───────────────────────────────────────────────────────────────

function turn(partial: Partial<CapturedTurn>): CapturedTurn {
  return {
    turnIndex: 0,
    userMessage: 'hola',
    httpStatus: 200,
    contentType: 'text/event-stream',
    latencyMs: 100,
    assistantText: '',
    toolCalls: [],
    wireText: '',
    intentDetectedOffline: null,
    degraded: null,
    error: null,
    ...partial,
  }
}

function scenario(partial: Partial<CapturedScenario>): CapturedScenario {
  return {
    id: 'test',
    pack: 'base',
    description: 'test',
    expectations: {},
    sessionId: 'evals-test-1',
    conversationId: 'c1',
    turns: [],
    leadSnapshot: null,
    error: null,
    ...partial,
  }
}

/** Outcome de una categoría (falla el test si no existe). */
function outcome(scn: CapturedScenario, cat: AssertCategory) {
  const o = evaluateAsserts(scn).find((a) => a.category === cat)
  assert.ok(o, `debe existir un outcome de categoría "${cat}"`)
  return o
}

// ─── 1. Resolución de texto 🔴 (wireText con fallback a assistantText) ─────────

assert.strictEqual(
  resolveText(turn({ assistantText: '', wireText: 'Dale, hablemos' })),
  'Dale, hablemos',
  'wireText se usa cuando assistantText está vacío',
)
assert.strictEqual(
  resolveText(turn({ assistantText: 'Hola che', wireText: '' })),
  'Hola che',
  'assistantText se usa cuando wireText está vacío',
)
assert.strictEqual(
  resolveText(turn({ assistantText: 'A', wireText: 'B' })),
  'B',
  'wireText gana cuando ambos tienen contenido',
)
assert.strictEqual(
  resolveText(turn({ assistantText: 'A', wireText: '   ' })),
  'A',
  'wireText sólo-espacios cae a assistantText',
)

// ─── 2. Evaluabilidad (turnos con error/degradado excluidos) ──────────────────

assert.ok(isTurnEvaluable(turn({})), 'turno limpio es evaluable')
assert.ok(!isTurnEvaluable(turn({ error: 'timeout' })), 'turno con error NO es evaluable')
assert.ok(
  !isTurnEvaluable(
    turn({
      degraded: {
        mode: 'degraded',
        reason: 'quota_exhausted',
        message: 'm',
        ctaWhatsapp: null,
        whatsappNumber: null,
        whatsappMessage: null,
        companyName: null,
      },
    }),
  ),
  'turno degradado NO es evaluable',
)

const mixed = scenario({
  turns: [turn({ turnIndex: 0 }), turn({ turnIndex: 1, error: 'timeout' })],
})
assert.strictEqual(evaluableTurns(mixed).length, 1, 'evaluableTurns excluye el turno con error')
assert.strictEqual(evaluableTurns(mixed)[0]?.turnIndex, 0, 'queda el turno limpio')

// Escenario con error de Q1.1 → no-evaluable entero.
assert.strictEqual(
  scenarioNonEvaluableReason(scenario({ turns: [turn({})] })),
  null,
  'escenario limpio es evaluable',
)
assert.strictEqual(
  scenarioNonEvaluableReason(scenario({ error: 'timeout de persistencia' })),
  'timeout de persistencia',
  'error de escenario → no-evaluable con motivo',
)
assert.ok(
  scenarioNonEvaluableReason(scenario({ turns: [turn({ error: 'x' })] })) !== null,
  'todos los turnos rotos → no-evaluable aunque no haya error de escenario',
)

// ─── 3. Asserts duros: captura ────────────────────────────────────────────────

assert.strictEqual(
  outcome(
    scenario({
      expectations: { shouldCaptureLead: true },
      turns: [turn({ toolCalls: [{ toolName: 'capture_lead', input: {} }] })],
    }),
    'capture',
  ).status,
  'pass',
  'shouldCaptureLead:true + capture_lead emitida → pass',
)
assert.strictEqual(
  outcome(
    scenario({
      expectations: { shouldCaptureLead: true },
      turns: [turn({ toolCalls: [{ toolName: 'show_whatsapp_handoff', input: {} }] })],
    }),
    'capture',
  ).status,
  'fail',
  'shouldCaptureLead:true sin capture_lead (sólo handoff) → fail',
)
assert.strictEqual(
  outcome(
    scenario({ expectations: { shouldCaptureLead: false }, turns: [turn({})] }),
    'capture',
  ).status,
  'pass',
  'shouldCaptureLead:false sin captura → pass',
)
assert.strictEqual(
  outcome(scenario({ expectations: {}, turns: [turn({})] }), 'capture').status,
  'skip',
  'sin expectativa de captura → skip',
)

// El tool en un turno con error NO cuenta (se excluye del assert).
assert.strictEqual(
  outcome(
    scenario({
      expectations: { shouldCaptureLead: true },
      turns: [
        turn({ turnIndex: 0, assistantText: 'hola' }),
        turn({ turnIndex: 1, error: 'timeout', toolCalls: [{ toolName: 'capture_lead', input: {} }] }),
      ],
    }),
    'capture',
  ).status,
  'fail',
  'capture_lead en un turno con error no cuenta como captura',
)

// ─── 4. Asserts duros: handoff (acepta cualquiera de los dos tools) ───────────

for (const tool of ['show_whatsapp_handoff', 'offer_handoff_options']) {
  assert.strictEqual(
    outcome(
      scenario({
        expectations: { shouldHandoff: true },
        turns: [turn({ toolCalls: [{ toolName: tool, input: {} }] })],
      }),
      'handoff',
    ).status,
    'pass',
    `shouldHandoff:true + ${tool} → pass`,
  )
}

// ─── 5. Asserts duros: mustNotClaim (substring case/acento-insensitive) ───────

assert.strictEqual(
  outcome(
    scenario({
      expectations: { mustNotClaim: ['ofrecemos CRIPTOMONEDAS'] },
      turns: [turn({ wireText: 'Sí, ofrecemos criptomonedás y más' })],
    }),
    'mustNotClaim',
  ).status,
  'fail',
  'detecta la frase prohibida presente (ignorando mayúsculas/acentos)',
)
assert.strictEqual(
  outcome(
    scenario({
      expectations: { mustNotClaim: ['ofrecemos criptomonedas'] },
      turns: [turn({ wireText: 'No, no hacemos eso' })],
    }),
    'mustNotClaim',
  ).status,
  'pass',
  'no falsea cuando la frase prohibida está ausente',
)
assert.strictEqual(
  outcome(
    scenario({
      expectations: { mustNotClaim: ['frase prohibida'] },
      turns: [turn({ assistantText: '', wireText: 'esto tiene una frase prohibida acá' })],
    }),
    'mustNotClaim',
  ).status,
  'fail',
  'mustNotClaim usa el texto resuelto (wireText cuando assistantText vacío)',
)

// ─── 6. Asserts duros: expectedIntent (best-effort) ──────────────────────────

const intentPass = outcome(
  scenario({ expectations: { expectedIntent: 'price' }, turns: [turn({ intentDetectedOffline: 'price' })] }),
  'intent',
)
assert.strictEqual(intentPass.status, 'pass', 'intent coincide → pass')
assert.ok(intentPass.bestEffort, 'intent está marcado best-effort')
assert.strictEqual(
  outcome(
    scenario({ expectations: { expectedIntent: 'price' }, turns: [turn({ intentDetectedOffline: 'unknown' })] }),
    'intent',
  ).status,
  'fail',
  'intent no coincide → fail',
)

// ─── 7. Parser del veredicto del juez (bien y mal formado) ───────────────────

const good = parseJudgeVerdict('{"toneScore":4,"parrotingScore":5,"justification":"bien"}')
assert.ok(good.ok, 'JSON válido parsea')
if (good.ok) {
  assert.strictEqual(good.verdict.toneScore, 4, 'toneScore leído')
  assert.strictEqual(good.verdict.parrotingScore, 5, 'parrotingScore leído')
}

assert.ok(
  parseJudgeVerdict('Acá va:\n```json\n{"toneScore":3,"parrotingScore":3,"justification":"ok"}\n```').ok,
  'tolera fences ```json y prosa alrededor',
)
assert.ok(!parseJudgeVerdict('no soy json').ok, 'texto no-JSON → no ok')
assert.ok(!parseJudgeVerdict('{"toneScore":9,"parrotingScore":3,"justification":"x"}').ok, 'score fuera de rango → no ok')
assert.ok(!parseJudgeVerdict('{"toneScore":3}').ok, 'falta un campo → no ok')
assert.ok(!parseJudgeVerdict('').ok, 'respuesta vacía → no ok')

// ─── Reporte ──────────────────────────────────────────────────────────────────

console.log('[Q1.2 invariant] ✓ Todas las aserciones pasaron (resolución de texto, evaluabilidad, asserts duros y parser del juez).')
