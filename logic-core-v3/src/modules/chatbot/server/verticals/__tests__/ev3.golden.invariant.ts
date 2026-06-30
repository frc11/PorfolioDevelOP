/**
 * EV.3 — Suite DORADA de paridad del motor de scoring.
 *
 *   npx tsx src/modules/chatbot/server/verticals/__tests__/ev3.golden.invariant.ts
 *   npm run test:ev3:golden
 *
 * Compara la salida del motor ACTUAL contra la fixture congelada
 * (`ev3.golden-fixture.ts`, generada ANTES del refactor a packs verticales).
 *
 * REGLA DE ORO: las expectativas de la fixture son INMUTABLES. Si un caso falla
 * tras el refactor, el bug está en el código — nunca se ajusta la fixture.
 *
 * El motor se invoca con UN solo argumento (`calculateLeadScore(input)`), firma
 * válida tanto antes del refactor (sin param `scoring`) como después (param
 * `scoring` opcional con default = pack `usados`). Así este archivo no cambia
 * entre el Paso 1 (paridad pre-refactor) y el Paso 4 (paridad post-refactor).
 */

import assert from 'node:assert/strict'
import {
  GOLDEN_CAPTURED_AT_ISO,
  GOLDEN_SCORE_CASES,
  GOLDEN_DECAY_CASES,
} from './ev3.golden-fixture'
import {
  calculateLeadScore,
  getEffectiveScore,
  applyTimeDecay,
  type ScoreInput,
  type LeadScoreClassification,
} from '../../scoring'

const capturedAt = new Date(GOLDEN_CAPTURED_AT_ISO)

// ─── 1. Paridad de scoring (señales, combos, penalties, DQ) ───────────────────

let scoreChecked = 0
for (const [i, c] of GOLDEN_SCORE_CASES.entries()) {
  const actual = calculateLeadScore(c.input as unknown as ScoreInput)
  assert.deepStrictEqual(
    actual,
    c.expected,
    `score case #${i} — input=${JSON.stringify(c.input)}`,
  )
  scoreChecked++
}

// ─── 2. Paridad de decay (curva temporal + DQ-es-DQ-siempre) ──────────────────

let decayChecked = 0
for (const [i, c] of GOLDEN_DECAY_CASES.entries()) {
  const now = new Date(capturedAt.getTime() + c.offsetMs)

  if (c.kind === 'applyTimeDecay') {
    const actual = applyTimeDecay(c.baseScore as number, capturedAt, now)
    assert.deepStrictEqual(actual, c.expected, `decay applyTimeDecay #${i} (offsetMs=${c.offsetMs})`)
  } else {
    const actual = getEffectiveScore(
      {
        score: c.score,
        classification: c.classification as LeadScoreClassification,
        lastActivityAt: capturedAt,
      },
      now,
    )
    assert.deepStrictEqual(actual, c.expected, `decay getEffectiveScore #${i} (offsetMs=${c.offsetMs})`)
  }
  decayChecked++
}

// ─── Reporte ──────────────────────────────────────────────────────────────────

console.log(
  `[EV.3 golden] ✓ Paridad exacta. ` +
    `Score: ${scoreChecked}/${GOLDEN_SCORE_CASES.length}, ` +
    `Decay: ${decayChecked}/${GOLDEN_DECAY_CASES.length}, ` +
    `Total: ${scoreChecked + decayChecked} casos verdes contra fixture congelada.`,
)
