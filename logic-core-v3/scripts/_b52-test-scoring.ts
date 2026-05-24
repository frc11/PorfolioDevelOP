/**
 * B5.2 — Test unit standalone del motor de scoring (señales positivas).
 *
 * Validá las penalizaciones / DQ de B5.3 en `_b53-test-scoring.ts`.
 *
 * Función pura, sin DB, sin LLM — corre en CI sin servicios externos.
 *
 * Run:
 *   npx tsx scripts/_b52-test-scoring.ts
 *
 * Sale con código 1 si algún assert falla.
 */

import {
  calculateLeadScore,
  classifyScore,
  SCORING_TABLE,
  HOT_THRESHOLD,
  WARM_THRESHOLD,
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

// Helper: lead "comercial" (sales) sin penalty de phone. Para testear B5.2 puro.
function sales(signals: LeadSignals) {
  return calculateLeadScore({ signals, category: 'sales' as const })
}

// eslint-disable-next-line no-console
console.log('\n▶  Tabla lockeada — sanity')
eq('SCORING_TABLE suma exactamente 100', SCORING_TABLE.reduce((a, b) => a + b.points, 0), 100)
eq('HOT_THRESHOLD = 70', HOT_THRESHOLD, 70)
eq('WARM_THRESHOLD = 40', WARM_THRESHOLD, 40)

// eslint-disable-next-line no-console
console.log('\n▶  Casos individuales (1 señal sola)')
{
  const r = sales({ ...zeros(), requestedAppointment: true })
  eq('appointment solo: score=40, warm', { score: r.score, classification: r.classification }, { score: 40, classification: 'warm' })
}
{
  const r = sales({ ...zeros(), mentionedFinancing: true })
  eq('financing solo: score=25, cold', { score: r.score, classification: r.classification }, { score: 25, classification: 'cold' })
}
{
  const r = sales({ ...zeros(), mentionedTradeIn: true })
  eq('tradeIn solo: score=20, cold', { score: r.score, classification: r.classification }, { score: 20, classification: 'cold' })
}
{
  const r = sales({ ...zeros(), askedSpecificModel: true })
  eq('specificModel solo: score=10, cold', { score: r.score, classification: r.classification }, { score: 10, classification: 'cold' })
}
{
  const r = sales({ ...zeros(), providedPhone: true })
  eq('phone solo: score=5, cold', { score: r.score, classification: r.classification }, { score: 5, classification: 'cold' })
}

// eslint-disable-next-line no-console
console.log('\n▶  Casos compuestos (los que pide la consigna)')
{
  // appointment(40) + tradeIn(20) = 60 → warm
  const r = sales({ ...zeros(), requestedAppointment: true, mentionedTradeIn: true })
  eq('appointment + tradeIn → 60 warm', { score: r.score, classification: r.classification }, { score: 60, classification: 'warm' })
  eq('signals desglosados', r.signals.map((s) => s.key), ['requestedAppointment', 'mentionedTradeIn'])
}
{
  // appointment(40) + tradeIn(20) + financing(25) = 85 → hot
  const r = sales({
    ...zeros(),
    requestedAppointment: true,
    mentionedTradeIn: true,
    mentionedFinancing: true,
  })
  eq('appointment + tradeIn + financing → 85 hot', { score: r.score, classification: r.classification }, { score: 85, classification: 'hot' })
}

// eslint-disable-next-line no-console
console.log('\n▶  Extremos del umbral')
eq('classifyScore(0) = cold', classifyScore(0), 'cold')
eq('classifyScore(39) = cold', classifyScore(39), 'cold')
eq('classifyScore(40) = warm', classifyScore(40), 'warm')
eq('classifyScore(69) = warm', classifyScore(69), 'warm')
eq('classifyScore(70) = hot', classifyScore(70), 'hot')
eq('classifyScore(100) = hot', classifyScore(100), 'hot')

// eslint-disable-next-line no-console
console.log('\n▶  Casos reales esperados (batería B5.1, todos categoría sales)')
{
  // lead-capture-financing-tradein (Lucía):
  //   appointment(F) + financing(T) + tradeIn(T) + specificModel(T) + phone(T)
  //   = 0 + 25 + 20 + 10 + 5 = 60 → warm
  const r = sales({
    requestedAppointment: false,
    mentionedFinancing: true,
    mentionedTradeIn: true,
    askedSpecificModel: true,
    providedPhone: true,
  })
  eq('lead-capture-financing-tradein (Lucía) → 60 warm', { score: r.score, classification: r.classification }, { score: 60, classification: 'warm' })
}
{
  // Si la categoría fuera 'sales' (no postventa), Martín daría 45 warm.
  // B5.3 verifica que con category=postventa baja a DQ — eso vive en _b53.
  const r = sales({
    requestedAppointment: true,
    mentionedFinancing: false,
    mentionedTradeIn: false,
    askedSpecificModel: false,
    providedPhone: true,
  })
  eq('appointment+phone (caso sales) → 45 warm', { score: r.score, classification: r.classification }, { score: 45, classification: 'warm' })
}
{
  // todos los flags true → 100 hot
  const r = sales({
    requestedAppointment: true,
    mentionedFinancing: true,
    mentionedTradeIn: true,
    askedSpecificModel: true,
    providedPhone: true,
  })
  eq('todas las señales: score=100, hot', { score: r.score, classification: r.classification }, { score: 100, classification: 'hot' })
  eq('signals totales = 5', r.signals.length, 5)
}
{
  // todas false → 0 cold + signals vacío
  const r = sales(zeros())
  eq('ninguna señal: score=0, cold', { score: r.score, classification: r.classification }, { score: 0, classification: 'cold' })
  eq('signals vacío', r.signals, [])
}

// eslint-disable-next-line no-console
console.log('\n▶  Pureza (mismas entradas → mismas salidas)')
{
  const signals: LeadSignals = {
    requestedAppointment: true,
    mentionedFinancing: false,
    mentionedTradeIn: true,
    askedSpecificModel: false,
    providedPhone: true,
  }
  const a = sales(signals)
  const b = sales(signals)
  ok('llamadas idénticas devuelven JSON idéntico', JSON.stringify(a) === JSON.stringify(b))
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
