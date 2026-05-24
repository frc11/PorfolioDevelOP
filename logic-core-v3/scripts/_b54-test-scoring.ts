/**
 * B5.4 — Test unit: combos potenciadores + decaimiento temporal + explicabilidad.
 *
 * Función pura, sin DB, sin LLM. `now` se inyecta para tests deterministas.
 *
 * Run:
 *   npx tsx scripts/_b54-test-scoring.ts
 */

import {
  calculateLeadScore,
  applyTimeDecay,
  getEffectiveScore,
  getScoreExplanation,
  COMBO_BONUSES,
  DECAY_CURVE,
  type LeadSignals,
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

// ─── COMBOS ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-console
console.log('\n▶  Combos — tabla')
eq('COMBO_BONUSES tiene 2 entradas', COMBO_BONUSES.length, 2)
eq(
  'combo tradein+financing = +10',
  COMBO_BONUSES.find((c) => c.key === 'combo_tradein_financing')?.points,
  10,
)
eq(
  'combo specificModel+appointment = +5',
  COMBO_BONUSES.find((c) => c.key === 'combo_specific_model_appointment')?.points,
  5,
)

// eslint-disable-next-line no-console
console.log('\n▶  Combos — tradeIn + financing (perfil de cierre)')
{
  // tradeIn(20) + financing(25) = 45 + combo(10) = 55 ⇒ warm
  const r = calculateLeadScore({
    signals: { ...zeros(), mentionedTradeIn: true, mentionedFinancing: true },
    category: 'sales',
  })
  eq(
    'tradeIn+financing solo → 55 warm',
    { score: r.score, classification: r.classification },
    { score: 55, classification: 'warm' },
  )
  ok(
    'signals incluyen combo_tradein_financing con +10',
    r.signals.some((s) => s.key === 'combo_tradein_financing' && s.points === 10),
  )
  ok(
    'label legible PyME',
    r.signals.find((s) => s.key === 'combo_tradein_financing')?.label.includes('perfil de cierre') ?? false,
  )
}

// eslint-disable-next-line no-console
console.log('\n▶  Combos — specificModel + appointment')
{
  // appointment(40) + specificModel(10) = 50 + combo(5) = 55 ⇒ warm
  const r = calculateLeadScore({
    signals: { ...zeros(), requestedAppointment: true, askedSpecificModel: true },
    category: 'sales',
  })
  eq(
    'appointment+specificModel solo → 55 warm',
    { score: r.score, classification: r.classification },
    { score: 55, classification: 'warm' },
  )
  ok(
    'signals incluyen combo_specific_model_appointment con +5',
    r.signals.some((s) => s.key === 'combo_specific_model_appointment' && s.points === 5),
  )
}

// eslint-disable-next-line no-console
console.log('\n▶  Combos — ambos disparan juntos (suman, no se anulan)')
{
  // appointment(40) + financing(25) + tradeIn(20) + specificModel(10) + phone(5) = 100
  //   + combo tradein_financing(10) + combo model_appointment(5) = 115 → clamp 100 ⇒ hot
  const r = calculateLeadScore({
    signals: {
      requestedAppointment: true,
      mentionedFinancing: true,
      mentionedTradeIn: true,
      askedSpecificModel: true,
      providedPhone: true,
    },
    category: 'sales',
  })
  eq(
    'todo true → 100 hot (clamp tras 115)',
    { score: r.score, classification: r.classification },
    { score: 100, classification: 'hot' },
  )
  ok('ambos combos presentes', r.signals.filter((s) => s.key.startsWith('combo_')).length === 2)
}

// eslint-disable-next-line no-console
console.log('\n▶  Combos — no disparan si falta la otra mitad')
{
  const r = calculateLeadScore({
    signals: { ...zeros(), mentionedTradeIn: true },
    category: 'sales',
  })
  ok('tradeIn solo no dispara combo', !r.signals.some((s) => s.key.startsWith('combo_')))
  eq('tradeIn solo → 20 cold', { score: r.score, classification: r.classification }, { score: 20, classification: 'cold' })
}

// eslint-disable-next-line no-console
console.log('\n▶  Combos — interactúan con penalty postventa')
{
  // tradeIn(20) + financing(25) + combo(10) = 55, postventa −50 = 5 ⇒ cold
  const r = calculateLeadScore({
    signals: { ...zeros(), mentionedTradeIn: true, mentionedFinancing: true },
    category: 'postventa',
  })
  eq(
    'tradeIn+financing + combo en postventa → 5 cold',
    { score: r.score, classification: r.classification },
    { score: 5, classification: 'cold' },
  )
  ok('penalty_postventa presente', r.signals.some((s) => s.key === 'penalty_postventa'))
  ok('combo presente igualmente', r.signals.some((s) => s.key === 'combo_tradein_financing'))
}

// eslint-disable-next-line no-console
console.log('\n▶  Combos — DQ por categoría pisa todo (no aplica combos)')
{
  const r = calculateLeadScore({
    signals: {
      requestedAppointment: true,
      mentionedFinancing: true,
      mentionedTradeIn: true,
      askedSpecificModel: true,
      providedPhone: true,
    },
    category: 'employment',
  })
  ok('DQ → ningún combo se persiste', !r.signals.some((s) => s.key.startsWith('combo_')))
  eq('DQ employment con todo true', { score: r.score, classification: r.classification }, { score: 0, classification: 'dq' })
}

// ─── DECAIMIENTO TEMPORAL ───────────────────────────────────────────────────
// eslint-disable-next-line no-console
console.log('\n▶  Decay — curva por tramos (multiplicadores)')
{
  const now = new Date('2026-05-23T12:00:00Z')
  const cases: Array<[string, Date, number, string]> = [
    ['hace 1h',     new Date('2026-05-23T11:00:00Z'),  1.00, 'fresh'],
    ['hace 12h',    new Date('2026-05-23T00:00:00Z'),  1.00, 'fresh'],
    ['hace 23.9h',  new Date('2026-05-22T12:06:00Z'),  1.00, 'fresh'],
    ['hace 25h',    new Date('2026-05-22T11:00:00Z'),  0.90, 'cooling'],
    ['hace 47h',    new Date('2026-05-21T13:00:00Z'),  0.90, 'cooling'],
    ['hace 49h',    new Date('2026-05-21T11:00:00Z'),  0.75, 'warm'],
    ['hace 71h',    new Date('2026-05-20T13:00:00Z'),  0.75, 'warm'],
    ['hace 4 días', new Date('2026-05-19T12:00:00Z'),  0.60, 'urgent'],
    ['hace 6 días', new Date('2026-05-17T12:00:00Z'),  0.60, 'urgent'],
    ['hace 10 días',new Date('2026-05-13T12:00:00Z'),  0.45, 'cold'],
    ['hace 20 días',new Date('2026-05-03T12:00:00Z'),  0.30, 'archived'],
    ['hace 100 días',new Date('2026-02-12T12:00:00Z'), 0.30, 'archived'],
  ]
  for (const [label, lastActivityAt, expectedMul, expectedTier] of cases) {
    const r = applyTimeDecay(80, lastActivityAt, now)
    ok(
      `${label} → mul=${expectedMul} tier=${expectedTier}`,
      r.multiplier === expectedMul && r.tier === expectedTier,
      `actual mul=${r.multiplier} tier=${r.tier} ageDays=${r.ageDays.toFixed(2)}`,
    )
  }
}

// eslint-disable-next-line no-console
console.log('\n▶  Decay — score efectivo redondeado y clamp [0, 100]')
{
  const now = new Date('2026-05-23T12:00:00Z')
  // Lead caliente (85) hace 3 días → 85 × 0.60 = 51 ⇒ warm
  const r = applyTimeDecay(85, new Date('2026-05-20T12:00:00Z'), now)
  eq(
    'lead 85 hace 3 días → 51 (warm)',
    { effectiveScore: r.effectiveScore, tier: r.tier },
    { effectiveScore: 51, tier: 'urgent' },
  )

  // Lead pleno (100) hace 20 días → 100 × 0.30 = 30 ⇒ cold
  const r2 = applyTimeDecay(100, new Date('2026-05-03T12:00:00Z'), now)
  eq(
    'lead 100 hace 20 días → 30',
    { effectiveScore: r2.effectiveScore, tier: r2.tier },
    { effectiveScore: 30, tier: 'archived' },
  )

  // baseScore 0 → 0 sin importar la edad
  const r3 = applyTimeDecay(0, new Date('2026-05-20T12:00:00Z'), now)
  eq('baseScore 0 → effective 0', r3.effectiveScore, 0)
}

// eslint-disable-next-line no-console
console.log('\n▶  Decay — clock skew (lastActivity en el futuro)')
{
  const now = new Date('2026-05-23T12:00:00Z')
  const future = new Date('2026-05-23T18:00:00Z')
  const r = applyTimeDecay(80, future, now)
  ok('multiplier 1.00 (no penaliza por skew)', r.multiplier === 1.00 && r.tier === 'fresh')
  eq('effectiveScore == baseScore', r.effectiveScore, 80)
  ok('ageDays clamped a 0', r.ageDays === 0)
}

// ─── getEffectiveScore (con re-clasificación) ───────────────────────────────
// eslint-disable-next-line no-console
console.log('\n▶  getEffectiveScore — re-clasifica tras decay')
{
  const now = new Date('2026-05-23T12:00:00Z')
  // hot 85 hace 3 días → 51 warm
  const r = getEffectiveScore(
    { score: 85, classification: 'hot', lastActivityAt: new Date('2026-05-20T12:00:00Z') },
    now,
  )
  eq(
    'lead hot enfriado 3 días → warm efectivo',
    { effectiveScore: r.effectiveScore, effectiveClassification: r.effectiveClassification, decayTier: r.decayTier },
    { effectiveScore: 51, effectiveClassification: 'warm', decayTier: 'urgent' },
  )
}

// eslint-disable-next-line no-console
console.log('\n▶  getEffectiveScore — DQ es DQ siempre (no se enfría)')
{
  const now = new Date('2026-05-23T12:00:00Z')
  const r = getEffectiveScore(
    { score: 0, classification: 'dq', lastActivityAt: new Date('2026-04-01T12:00:00Z') },
    now,
  )
  eq(
    'DQ hace 52 días → sigue DQ',
    { effectiveScore: r.effectiveScore, effectiveClassification: r.effectiveClassification, decayMultiplier: r.decayMultiplier },
    { effectiveScore: 0, effectiveClassification: 'dq', decayMultiplier: 1 },
  )
}

// ─── EXPLICABILIDAD ─────────────────────────────────────────────────────────
// eslint-disable-next-line no-console
console.log('\n▶  Explicabilidad — agrupa por kind (positive > combo > penalty > dq)')
{
  // Lead típico de cierre: tradeIn + financing + appointment + phone, en postventa
  const r = calculateLeadScore({
    signals: {
      requestedAppointment: true,
      mentionedFinancing: true,
      mentionedTradeIn: true,
      askedSpecificModel: false,
      providedPhone: true,
    },
    category: 'postventa',
    phone: '+54 9 11 1234-5678',
  })
  const lines = getScoreExplanation(r.signals)
  const kinds = lines.map((l) => l.kind)
  eq(
    'orden: positives primero, combo, luego penalty',
    kinds,
    ['positive', 'positive', 'positive', 'positive', 'combo', 'penalty'],
  )

  // Etiquetas de muestra (chequeo de que NO hay jerga técnica)
  ok(
    'label "Tiene usado para entregar" presente',
    lines.some((l) => l.label === 'Tiene usado para entregar'),
  )
  ok(
    'label "Pidió financiación / cuotas" presente',
    lines.some((l) => l.label === 'Pidió financiación / cuotas'),
  )
  ok(
    'combo label menciona "perfil de cierre"',
    lines.some((l) => l.kind === 'combo' && l.label.includes('perfil de cierre')),
  )
  ok(
    'penalty label no usa la palabra "Penalización"',
    !lines.some((l) => l.kind === 'penalty' && l.label.startsWith('Penalización')),
  )
  ok(
    'ningún label expone key técnico (mentionedTradeIn, etc.)',
    !lines.some((l) => /mentioned|requested|asked/i.test(l.label)),
  )
}

// eslint-disable-next-line no-console
console.log('\n▶  Explicabilidad — DQ devuelve una sola línea legible')
{
  const r = calculateLeadScore({ signals: zeros(), category: 'employment' })
  const lines = getScoreExplanation(r.signals)
  eq('1 línea', lines.length, 1)
  eq('kind=dq', lines[0].kind, 'dq')
  ok('label PyME', lines[0].label === 'Descartado: busca trabajo')
}

// eslint-disable-next-line no-console
console.log('\n▶  Explicabilidad — retro-compatible con signals viejos (B5.2)')
{
  // Simula un scoreSignals persistido en B5.2 (sin combos, label "Mencionó ...")
  const legacy = [
    { key: 'requestedAppointment', label: 'Pidió cita / test drive', points: 40 },
    { key: 'mentionedFinancing', label: 'Mencionó financiación', points: 25 },
    { key: 'penalty_postventa', label: 'Penalización: consulta de postventa', points: -50 },
  ]
  const lines = getScoreExplanation(legacy)
  eq('kinds derivados del key, no del label', lines.map((l) => l.kind), ['positive', 'positive', 'penalty'])
  ok(
    'labels viejos se respetan (snapshot de captura)',
    lines.some((l) => l.label === 'Mencionó financiación'),
  )
}

// ─── DECAY_CURVE — sanidad ──────────────────────────────────────────────────
// eslint-disable-next-line no-console
console.log('\n▶  DECAY_CURVE — invariantes')
{
  // tramos monotónicos decrecientes en multiplier
  let prev = 2
  for (const t of DECAY_CURVE) {
    ok(`${t.tier} ≤ anterior (${t.multiplier} ≤ ${prev})`, t.multiplier <= prev)
    prev = t.multiplier
  }
  ok('último tramo es Infinity (piso)', DECAY_CURVE[DECAY_CURVE.length - 1].maxDays === Infinity)
  ok('piso = 0.30', DECAY_CURVE[DECAY_CURVE.length - 1].multiplier === 0.30)
  ok('primer tramo = 1.00', DECAY_CURVE[0].multiplier === 1.00)
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
