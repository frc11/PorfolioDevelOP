/**
 * B5.3 — Test unit del motor extendido: DQ + penalties + validador AR.
 *
 * Función pura, sin DB, sin LLM.
 *
 * Run:
 *   npx tsx scripts/_b53-test-scoring.ts
 */

import {
  calculateLeadScore,
  isValidArgentinePhone,
  validateArgentinePhone,
  POSTVENTA_PENALTY,
  INVALID_PHONE_PENALTY,
  type LeadSignals,
  type ScoreInput,
} from '../src/modules/chatbot/server/scoring'

let failures = 0

function ok(label: string, condition: boolean, detail?: string): void {
  const sign = condition ? '✓' : '✗'
  // eslint-disable-next-line no-console
  console.log(`  ${sign} ${label}${detail ? ' — ' + detail : ''}`)
  if (!condition) failures++
}

function eq<T>(label: string, actual: T, expected: T): void {
  const condition = JSON.stringify(actual) === JSON.stringify(expected)
  ok(label, condition, condition ? '' : `actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`)
}

function zeros(): LeadSignals {
  return {
    requestedAppointment: false,
    mentionedFinancing: false,
    mentionedTradeIn: false,
    askedSpecificModel: false,
    providedPhone: false,
  }
}

// eslint-disable-next-line no-console
console.log('\n▶  Constantes')
eq('POSTVENTA_PENALTY = 50', POSTVENTA_PENALTY, 50)
eq('INVALID_PHONE_PENALTY = 20', INVALID_PHONE_PENALTY, 20)

// eslint-disable-next-line no-console
console.log('\n▶  Validador AR — formatos VÁLIDOS (regla absoluta: no descartar reales)')
const validPhones = [
  '+54 9 11 1234-5678',  // móvil internacional con 9
  '+54 11 1234-5678',    // fijo internacional sin 9
  '+54 9 381 555-1234',  // móvil interior (3 dígitos área)
  '+54 2944 12-3456',    // interior con código área 4 dígitos
  '011 1234-5678',       // local con 0
  '11 1234-5678',        // móvil CABA sin 0
  '0381 555-1234',       // interior con 0
  '381 555-1234',        // interior sin 0
  '1234-5678',           // local sin código área
  '(011) 4567-8900',     // con paréntesis
  '+54-11-1234-5678',    // todo con guiones
  '+54 9 381 555 1010',  // con espacios sin guiones
  '+5491155551234',      // todo pegado
]
for (const p of validPhones) {
  ok(`válido: "${p}"`, isValidArgentinePhone(p))
}

// eslint-disable-next-line no-console
console.log('\n▶  Validador AR — formatos INVÁLIDOS')
const invalids: Array<[string, string]> = [
  ['123', 'too_short'],
  ['12', 'too_short'],
  ['', 'empty'],
  ['     ', 'empty'],
  ['0000000', 'all_same_digit'],
  ['1111111111', 'all_same_digit'],
  ['0123456789', 'trivial_sequence'],
  ['987654321', 'trivial_sequence'],
  ['+1 555 1234567', 'non_argentine_prefix'],
  ['+44 20 7946 0958', 'non_argentine_prefix'],
  ['+55 11 91234-5678', 'non_argentine_prefix'],  // Brasil
  ['+5491112345678901', 'too_long'],  // 16 dígitos
]
for (const [phone, expectedReason] of invalids) {
  const r = validateArgentinePhone(phone)
  ok(
    `inválido: "${phone}" → ${expectedReason}`,
    r.valid === false && r.reason === expectedReason,
    r.valid ? '(devolvió valid)' : `reason=${r.reason}`,
  )
}

// eslint-disable-next-line no-console
console.log('\n▶  DQ por categoría no comercial (corte rápido, ignora señales)')
{
  // Lead con TODAS las señales positivas pero category=employment → DQ
  const r = calculateLeadScore({
    signals: {
      requestedAppointment: true,
      mentionedFinancing: true,
      mentionedTradeIn: true,
      askedSpecificModel: true,
      providedPhone: true,
    },
    category: 'employment',
    phone: '+54 9 11 1234-5678',
  })
  eq(
    'employment con señales positivas → DQ score=0',
    { score: r.score, classification: r.classification, dqReason: r.dqReason },
    { score: 0, classification: 'dq', dqReason: 'category_employment' },
  )
  eq('signals = [dq_employment]', r.signals.map((s) => s.key), ['dq_employment'])
}
{
  const r = calculateLeadScore({ signals: zeros(), category: 'provider' })
  eq('provider → DQ', { classification: r.classification, dqReason: r.dqReason }, { classification: 'dq', dqReason: 'category_provider' })
}
{
  const r = calculateLeadScore({ signals: zeros(), category: 'spam' })
  eq('spam → DQ', { classification: r.classification, dqReason: r.dqReason }, { classification: 'dq', dqReason: 'category_spam' })
}

// eslint-disable-next-line no-console
console.log('\n▶  Postventa — penalty −50')
{
  // appointment (40) + phone (5) = 45 ⇒ menos 50 = -5 ⇒ DQ por score negativo
  const r = calculateLeadScore({
    signals: { ...zeros(), requestedAppointment: true, providedPhone: true },
    category: 'postventa',
  })
  eq(
    'postventa con appointment+phone (45 - 50 = -5) → DQ',
    { score: r.score, classification: r.classification, dqReason: r.dqReason },
    { score: 0, classification: 'dq', dqReason: 'negative_score_after_penalty' },
  )
  ok('signals incluyen penalty_postventa', r.signals.some((s) => s.key === 'penalty_postventa' && s.points === -50))
}
{
  // B5.4 actualizó este caso: ahora suma combo tradein+financing (+10).
  // appointment(40) + financing(25) + tradeIn(20) + phone(5) = 90
  //   + combo tradein_financing(10) = 100, postventa −50 = 50 ⇒ warm
  const r = calculateLeadScore({
    signals: {
      requestedAppointment: true,
      mentionedFinancing: true,
      mentionedTradeIn: true,
      askedSpecificModel: false,
      providedPhone: true,
    },
    category: 'postventa',
  })
  eq(
    'postventa con 90 brutos + combo(10) − 50 → 50 warm',
    { score: r.score, classification: r.classification, dqReason: r.dqReason },
    { score: 50, classification: 'warm', dqReason: null },
  )
}

// eslint-disable-next-line no-console
console.log('\n▶  Teléfono inválido — penalty −20')
{
  // sales + appointment(40) + phone(5) - 20 = 25 ⇒ cold
  const r = calculateLeadScore({
    signals: { ...zeros(), requestedAppointment: true, providedPhone: true },
    category: 'sales',
    phone: '123',
  })
  eq(
    'sales con phone "123" (45 − 20) → 25 cold',
    { score: r.score, classification: r.classification, dqReason: r.dqReason },
    { score: 25, classification: 'cold', dqReason: null },
  )
  ok('signals incluyen penalty_invalid_phone', r.signals.some((s) => s.key === 'penalty_invalid_phone' && s.points === -20))
}
{
  // Phone válido → NO se aplica penalty
  const r = calculateLeadScore({
    signals: { ...zeros(), requestedAppointment: true, providedPhone: true },
    category: 'sales',
    phone: '+54 9 11 1234-5678',
  })
  ok('phone válido no agrega penalty_invalid_phone', !r.signals.some((s) => s.key === 'penalty_invalid_phone'))
}
{
  // Sin phone (null o undefined) → NO penalty aunque providedPhone=false
  const r = calculateLeadScore({
    signals: { ...zeros(), mentionedFinancing: true },
    category: 'sales',
  })
  ok('sin phone no agrega penalty_invalid_phone', !r.signals.some((s) => s.key === 'penalty_invalid_phone'))
  eq('financing solo → 25 cold (sin penalty)', { score: r.score, classification: r.classification }, { score: 25, classification: 'cold' })
}

// eslint-disable-next-line no-console
console.log('\n▶  Combinaciones: postventa + phone inválido')
{
  // appointment(40) + phone(5) - 50 (postventa) - 20 (phone inválido) = -25 ⇒ DQ
  const r = calculateLeadScore({
    signals: { ...zeros(), requestedAppointment: true, providedPhone: true },
    category: 'postventa',
    phone: '12345',
  })
  eq(
    'postventa + phone inválido → DQ',
    { score: r.score, classification: r.classification, dqReason: r.dqReason },
    { score: 0, classification: 'dq', dqReason: 'negative_score_after_penalty' },
  )
}

// eslint-disable-next-line no-console
console.log('\n▶  category=other (no DQ, no penalty)')
{
  const r = calculateLeadScore({
    signals: { ...zeros(), requestedAppointment: true, providedPhone: true },
    category: 'other',
  })
  eq(
    'other con appointment+phone → 45 warm (sin penalty)',
    { score: r.score, classification: r.classification, dqReason: r.dqReason },
    { score: 45, classification: 'warm', dqReason: null },
  )
}

// eslint-disable-next-line no-console
console.log('\n▶  Caso de la batería B5.1 (Martín, postventa)')
{
  // appointment(T) + phone(T) = 45, category=postventa → 45 − 50 = −5 → DQ
  const r = calculateLeadScore({
    signals: {
      requestedAppointment: true,
      mentionedFinancing: false,
      mentionedTradeIn: false,
      askedSpecificModel: false,
      providedPhone: true,
    },
    category: 'postventa',
    phone: '+54 9 381 555-3232',
  })
  eq(
    'Martín (postventa, appointment+phone válido) → DQ',
    { score: r.score, classification: r.classification, dqReason: r.dqReason },
    { score: 0, classification: 'dq', dqReason: 'negative_score_after_penalty' },
  )
}

// eslint-disable-next-line no-console
console.log('\n─────────────────────────────────────────────')
if (failures === 0) {
  // eslint-disable-next-line no-console
  console.log('  ✓ Todos los asserts pasaron')
  process.exit(0)
} else {
  // eslint-disable-next-line no-console
  console.error(`  ✗ ${failures} assert(s) fallaron`)
  process.exit(1)
}

// Para que tsc no se queje del import no usado de ScoreInput.
export type _Hint = ScoreInput
