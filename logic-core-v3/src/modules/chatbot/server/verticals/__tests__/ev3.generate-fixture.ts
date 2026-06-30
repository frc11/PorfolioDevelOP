/**
 * EV.3 — Generador de la fixture dorada de paridad de scoring.
 *
 * Se ejecuta UNA sola vez, ANTES del refactor, contra la implementación
 * ACTUAL de `calculateLeadScore` / `getEffectiveScore` / `applyTimeDecay`.
 * Congela el resultado en `ev3.golden-fixture.ts`, que es INMUTABLE: el
 * refactor debe reproducir exactamente estos valores.
 *
 *   npx tsx src/modules/chatbot/server/verticals/__tests__/ev3.generate-fixture.ts
 *
 * NO recalcular a mano: la fuente de verdad es la ejecución del motor actual.
 */

import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  calculateLeadScore,
  getEffectiveScore,
  applyTimeDecay,
  classifyScore,
  type LeadSignals,
  type LeadCategoryForScoring,
  type LeadScoreClassification,
  type ScoreInput,
  type ScoreResult,
} from '../../scoring'

function signalsFromMask(mask: number): LeadSignals {
  return {
    requestedAppointment: Boolean(mask & 1),
    mentionedFinancing: Boolean(mask & 2),
    mentionedTradeIn: Boolean(mask & 4),
    askedSpecificModel: Boolean(mask & 8),
    providedPhone: Boolean(mask & 16),
  }
}

interface ScoreCase {
  input: ScoreInput
  expected: ScoreResult
}

interface DecayCase {
  kind: 'getEffectiveScore' | 'applyTimeDecay'
  score: number
  classification: LeadScoreClassification | null
  baseScore: number | null
  offsetMs: number
  expected: unknown
}

const scoreCases: ScoreCase[] = []

// A/B/C — las 2^5 combinaciones de señales × 3 categorías no-DQ.
const NON_DQ_CATEGORIES: LeadCategoryForScoring[] = ['sales', 'postventa', 'other']
for (const category of NON_DQ_CATEGORIES) {
  for (let mask = 0; mask < 32; mask++) {
    const input: ScoreInput = { signals: signalsFromMask(mask), category, phone: null }
    scoreCases.push({ input, expected: calculateLeadScore(input) })
  }
}

// D — categorías DQ (cortocircuito): todas-false y todas-true.
const DQ_CATEGORIES: LeadCategoryForScoring[] = ['employment', 'provider', 'spam']
for (const category of DQ_CATEGORIES) {
  for (const mask of [0, 31]) {
    const input: ScoreInput = { signals: signalsFromMask(mask), category, phone: null }
    scoreCases.push({ input, expected: calculateLeadScore(input) })
  }
}

// E — penalty de teléfono inválido: matriz teléfono × set de señales.
const PHONES: (string | null)[] = [null, '+54 9 381 555 1234', '+1 555 1234', '123', '0000000', '']
const PHONE_SIGNAL_MASKS = [0, 1, 31] // all-false, requestedAppointment-only, all-true
for (const phone of PHONES) {
  for (const mask of PHONE_SIGNAL_MASKS) {
    const input: ScoreInput = { signals: signalsFromMask(mask), category: 'sales', phone }
    scoreCases.push({ input, expected: calculateLeadScore(input) })
  }
}

// ─── Decay ──────────────────────────────────────────────────────────────────

const CAPTURED_AT_ISO = '2026-01-01T00:00:00.000Z'
const capturedAt = new Date(CAPTURED_AT_ISO)
const H = 3600 * 1000
const DAY = 24 * H

// Puntos que cruzan TODOS los tramos de la curva (incluye clock-skew negativo).
const OFFSETS = [
  -1 * H, 0, 12 * H, 23 * H, 24 * H, 36 * H, 47 * H, 48 * H, 60 * H, 71 * H, 72 * H, 100 * H,
  7 * DAY, 10 * DAY, 14 * DAY, 15 * DAY, 30 * DAY,
]

const decayCases: DecayCase[] = []
const BASE_SCORES = [100, 70, 40, 0]

for (const score of BASE_SCORES) {
  const classification = classifyScore(score) as LeadScoreClassification
  for (const off of OFFSETS) {
    const now = new Date(capturedAt.getTime() + off)
    decayCases.push({
      kind: 'getEffectiveScore',
      score,
      classification,
      baseScore: null,
      offsetMs: off,
      expected: getEffectiveScore({ score, classification, lastActivityAt: capturedAt }, now),
    })
  }
}

// DQ snapshot — debe seguir DQ sin importar el tiempo (el decay no rescata).
for (const off of [0, 48 * H, 30 * DAY]) {
  const now = new Date(capturedAt.getTime() + off)
  decayCases.push({
    kind: 'getEffectiveScore',
    score: 0,
    classification: 'dq',
    baseScore: null,
    offsetMs: off,
    expected: getEffectiveScore({ score: 0, classification: 'dq', lastActivityAt: capturedAt }, now),
  })
}

// applyTimeDecay directo sobre base 100 en cada punto de la curva.
for (const off of OFFSETS) {
  const now = new Date(capturedAt.getTime() + off)
  decayCases.push({
    kind: 'applyTimeDecay',
    score: 0,
    classification: null,
    baseScore: 100,
    offsetMs: off,
    expected: applyTimeDecay(100, capturedAt, now),
  })
}

// ─── Emitir fixture ───────────────────────────────────────────────────────────

const header = `/**
 * EV.3 — FIXTURE DORADA DE PARIDAD. AUTO-GENERADA. **NO EDITAR.**
 *
 * Congelada ejecutando la implementación de scoring ANTES del refactor a packs
 * verticales. El refactor debe reproducir EXACTAMENTE estos valores. Si un caso
 * falla tras el refactor, el bug está en el código — JAMÁS se ajusta este archivo.
 *
 * Regenerada solo por \`ev3.generate-fixture.ts\` (one-shot). ${scoreCases.length} casos de score, ${decayCases.length} de decay.
 */
/* eslint-disable */
`

const body =
  `export const GOLDEN_CAPTURED_AT_ISO = ${JSON.stringify(CAPTURED_AT_ISO)}\n\n` +
  `export const GOLDEN_SCORE_CASES = ${JSON.stringify(scoreCases, null, 2)}\n\n` +
  `export const GOLDEN_DECAY_CASES = ${JSON.stringify(decayCases, null, 2)}\n`

const here = dirname(fileURLToPath(import.meta.url))
const outPath = join(here, 'ev3.golden-fixture.ts')
writeFileSync(outPath, header + body, 'utf8')

process.stdout.write(
  `[ev3.generate-fixture] Fixture escrita: ${outPath}\n` +
    `  score cases: ${scoreCases.length}\n` +
    `  decay cases: ${decayCases.length}\n` +
    `  total: ${scoreCases.length + decayCases.length}\n`,
)
