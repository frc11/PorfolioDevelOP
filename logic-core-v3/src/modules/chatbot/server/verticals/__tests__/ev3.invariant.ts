/**
 * EV.3 — Invariantes del scoring desde pack vertical (NO doradas).
 *
 *   npx tsx src/modules/chatbot/server/verticals/__tests__/ev3.invariant.ts
 *   npm run test:ev3
 *
 * Cubre lo que la suite dorada no toca:
 *   1. Extracción VERBATIM: el pack `usados` reproduce exacto las constantes
 *      legacy del motor (señales, combos, penalties, thresholds, DQ).
 *   2. Pack desconocido → cae a `base` sin crashear.
 *   3. Dos bots con packs distintos resuelven tablas distintas (org-scoped).
 *   4. Dual-write: `buildSignalsSnapshot` produce la forma esperada de
 *      `ChatbotLead.signals` sin tocar DB.
 *
 * Cero DB, cero network. Pura verificación de tipos y comportamiento.
 */

import assert from 'node:assert/strict'
import { getVerticalPack } from '../registry'
import { USADOS_PACK } from '../packs/usados'
import { BASE_PACK } from '../packs/base'
import {
  calculateLeadScore,
  buildSignalsSnapshot,
  SCORING_TABLE,
  COMBO_BONUSES,
  POSTVENTA_PENALTY,
  INVALID_PHONE_PENALTY,
  HOT_THRESHOLD,
  WARM_THRESHOLD,
  type LeadSignals,
  type ScoreInput,
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

// ─── 1. Extracción VERBATIM: usados ≡ constantes legacy del motor ─────────────

// 1a. Señales — mismas claves, labels y puntos, mismo orden.
assert.deepStrictEqual(
  USADOS_PACK.scoring.signals.map((s) => ({ key: s.key, label: s.label, points: s.points })),
  SCORING_TABLE.map((s) => ({ key: s.key, label: s.label, points: s.points })),
  'usados.scoring.signals debe ser copia verbatim de SCORING_TABLE',
)

// 1b. Combos — mismo key/label/points y requiredSignalKeys equivalente al
//     `matches` original para TODAS las 2^5 combinaciones de señales.
assert.strictEqual(
  USADOS_PACK.scoring.combos.length,
  COMBO_BONUSES.length,
  'usados debe tener la misma cantidad de combos que COMBO_BONUSES',
)
for (const combo of USADOS_PACK.scoring.combos) {
  const legacy = COMBO_BONUSES.find((c) => c.key === combo.key)
  assert.ok(legacy, `combo ${combo.key} debe existir en COMBO_BONUSES`)
  assert.strictEqual(combo.label, legacy.label, `combo ${combo.key} label verbatim`)
  assert.strictEqual(combo.points, legacy.points, `combo ${combo.key} points verbatim`)
  // requiredSignalKeys.every() debe coincidir con matches() en todo el dominio.
  for (let mask = 0; mask < 32; mask++) {
    const signals = signalsFromMask(mask)
    const values = signals as unknown as Record<string, boolean>
    const declarative = combo.requiredSignalKeys.every((k) => Boolean(values[k]))
    assert.strictEqual(
      declarative,
      legacy.matches(signals),
      `combo ${combo.key}: requiredSignalKeys vs matches difieren en mask=${mask}`,
    )
  }
}

// 1c. Penalties — mismos puntos (negativos) y condiciones, mismo orden.
const postventa = USADOS_PACK.scoring.penalties[0]
const invalidPhone = USADOS_PACK.scoring.penalties[1]
assert.strictEqual(postventa.key, 'penalty_postventa', 'penalty[0] = postventa')
assert.strictEqual(postventa.points, -POSTVENTA_PENALTY, 'postventa points = -POSTVENTA_PENALTY')
assert.strictEqual(postventa.condition, 'category_postventa', 'postventa condition')
assert.strictEqual(invalidPhone.key, 'penalty_invalid_phone', 'penalty[1] = invalid_phone')
assert.strictEqual(
  invalidPhone.points,
  -INVALID_PHONE_PENALTY,
  'invalid_phone points = -INVALID_PHONE_PENALTY',
)
assert.strictEqual(invalidPhone.condition, 'invalid_phone', 'invalid_phone condition')

// 1d. Thresholds + DQ categories verbatim.
assert.strictEqual(USADOS_PACK.scoring.thresholds.caliente, HOT_THRESHOLD, 'caliente = HOT_THRESHOLD')
assert.strictEqual(USADOS_PACK.scoring.thresholds.tibio, WARM_THRESHOLD, 'tibio = WARM_THRESHOLD')
assert.deepStrictEqual(
  [...USADOS_PACK.scoring.dqCategories],
  ['employment', 'provider', 'spam'],
  'dqCategories verbatim',
)

// ─── 2. Pack desconocido → base sin crash ─────────────────────────────────────

let warned = false
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  if (args.some((a) => String(a).includes('verticals'))) warned = true
}
const unknownPack = getVerticalPack('_pack_inexistente_ev3_')
console.warn = originalWarn

assert.strictEqual(unknownPack.key, 'base', 'pack desconocido → base')
assert.ok(warned, 'pack desconocido emite warning [verticals]')

// El motor corre con el scoring del fallback sin lanzar.
const fallbackInput: ScoreInput = {
  signals: signalsFromMask(31),
  category: 'sales',
  phone: null,
}
assert.doesNotThrow(
  () => calculateLeadScore(fallbackInput, unknownPack.scoring),
  'scoring con pack fallback no debe lanzar',
)
const fallbackResult = calculateLeadScore(fallbackInput, unknownPack.scoring)
assert.ok(
  ['hot', 'warm', 'cold', 'dq'].includes(fallbackResult.classification),
  'clasificación del fallback es válida',
)

// ─── 3. Dos bots, packs distintos → tablas distintas (org-scoped) ─────────────

const botA = { verticalPack: 'usados' }
const botB = { verticalPack: 'base' }
const packA = getVerticalPack(botA.verticalPack)
const packB = getVerticalPack(botB.verticalPack)

assert.notStrictEqual(
  packA.scoring.signals.length,
  packB.scoring.signals.length,
  'usados (5 señales) y base (3 señales) tienen tablas de distinto tamaño',
)

// mentionedFinancing puntúa en usados (25) pero NO existe en base (0): el mismo
// input rinde scores distintos según el pack del bot — sin contaminación cruzada.
const financingOnly: ScoreInput = {
  signals: signalsFromMask(2), // solo mentionedFinancing
  category: 'sales',
  phone: null,
}
const scoreA = calculateLeadScore(financingOnly, packA.scoring).score
const scoreB = calculateLeadScore(financingOnly, packB.scoring).score
assert.strictEqual(scoreA, 25, 'usados puntúa mentionedFinancing = 25')
assert.strictEqual(scoreB, 0, 'base no puntúa mentionedFinancing = 0')
assert.notStrictEqual(scoreA, scoreB, 'cada bot resuelve su propia tabla')

// ─── 4. Dual-write: forma de buildSignalsSnapshot ─────────────────────────────

const captured = {
  requestedAppointment: true,
  mentionedFinancing: false,
  mentionedTradeIn: true,
  askedSpecificModel: false,
  providedPhone: true,
  providedEmail: true,
}

// Bajo `usados`: 5 claves (sin providedEmail, que usados no puntúa), cada una
// con {value, points}; points = aporte de la señal (0 si inactiva).
const usadosSnapshot = buildSignalsSnapshot(captured, USADOS_PACK.scoring)
assert.deepStrictEqual(
  usadosSnapshot,
  {
    requestedAppointment: { value: true, points: 40 },
    mentionedFinancing: { value: false, points: 0 },
    mentionedTradeIn: { value: true, points: 20 },
    askedSpecificModel: { value: false, points: 0 },
    providedPhone: { value: true, points: 5 },
  },
  'snapshot usados: claves del pack con value+points, sin providedEmail',
)
assert.ok(
  !('providedEmail' in usadosSnapshot),
  'usados no puntúa providedEmail → no aparece en el snapshot',
)

// Bajo `base`: providedEmail SÍ es señal del pack → aparece en el snapshot.
const baseSnapshot = buildSignalsSnapshot(captured, BASE_PACK.scoring)
assert.deepStrictEqual(
  baseSnapshot,
  {
    requestedAppointment: { value: true, points: 40 },
    providedPhone: { value: true, points: 30 },
    providedEmail: { value: true, points: 20 },
  },
  'snapshot base: solo las 3 señales del pack base con sus puntos',
)

// ─── 5. Ambas penalties juntas (hueco que la suite dorada no cubre) ───────────

// La fixture dorada nunca dispara postventa Y teléfono-inválido en el mismo lead
// (postventa usa phone=null; la matriz de teléfono usa category='sales'). Acá se
// cubre explícitamente el orden de las señales persistidas y el score combinado.
const INVALID_AR_PHONE = '+1 555 1234' // prefijo no-AR → inválido, presente → penaliza

// 5a. Ambas penalties, score sobrevive (no negativo): orden postventa → invalid_phone.
const bothPenaltiesSurvive: ScoreInput = {
  signals: signalsFromMask(31), // todas las señales
  category: 'postventa',
  phone: INVALID_AR_PHONE,
}
const survive = calculateLeadScore(bothPenaltiesSurvive, USADOS_PACK.scoring)
// 100 (señales) + 15 (combos) − 50 (postventa) − 20 (invalid_phone) = 45 → warm
assert.strictEqual(survive.score, 45, 'score con ambas penalties = 45')
assert.strictEqual(survive.classification, 'warm', 'score 45 → warm')
assert.strictEqual(survive.dqReason, null, 'no DQ: score positivo')
const lastTwo = survive.signals.slice(-2).map((s) => s.key)
assert.deepStrictEqual(
  lastTwo,
  ['penalty_postventa', 'penalty_invalid_phone'],
  'orden de penalties persistidas: postventa antes que invalid_phone',
)
const penaltyPoints = survive.signals.slice(-2).map((s) => s.points)
assert.deepStrictEqual(penaltyPoints, [-50, -20], 'puntos de penalties: -50 luego -20')

// 5b. Ambas penalties hunden el score a negativo → DQ por score negativo.
const bothPenaltiesDq: ScoreInput = {
  signals: signalsFromMask(16), // solo providedPhone (+5)
  category: 'postventa',
  phone: INVALID_AR_PHONE,
}
const dq = calculateLeadScore(bothPenaltiesDq, USADOS_PACK.scoring)
// 5 − 50 − 20 = −65 < 0 → DQ
assert.strictEqual(dq.score, 0, 'score negativo se clampa a 0 en DQ')
assert.strictEqual(dq.classification, 'dq', 'score negativo → dq')
assert.strictEqual(
  dq.dqReason,
  'negative_score_after_penalty',
  'razón DQ = negative_score_after_penalty',
)

// ─── Reporte ──────────────────────────────────────────────────────────────────

console.log(
  '[EV.3 invariant] ✓ Verbatim usados≡legacy, fallback a base, tablas org-scoped ' +
    'distintas, dual-write con forma correcta y ambas penalties (orden + DQ negativo). ' +
    'Todas las aserciones pasaron.',
)
