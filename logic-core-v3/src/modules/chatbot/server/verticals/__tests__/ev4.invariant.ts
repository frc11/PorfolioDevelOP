/**
 * EV.4 — Invariantes de detección de intent desde packs verticales.
 *
 *   npx tsx src/modules/chatbot/server/verticals/__tests__/ev4.invariant.ts
 *   npm run test:ev4
 *
 * Cero DB, cero network. Verifica:
 *   1. Cada intent del pack `usados` matchea ≥3 frases de su vocabulario y las
 *      frases neutras NO matchean (quedan en 'unknown').
 *   1c. Falsos positivos no triviales (encontrados por el audit EV.4) no matchean.
 *   2. El pack `agencia` matchea las mismas frases que el detectIntent legacy
 *      (5 casos dorados tomados del código viejo).
 *   3. Un bot con pack `base` no crashea ante cualquier input.
 */

import assert from 'node:assert/strict'
import { detectIntent } from '../../intent'
import { USADOS_PACK } from '../packs/usados'
import { AGENCIA_PACK } from '../packs/agencia'
import { BASE_PACK } from '../packs/base'

// ─── 1. Pack `usados` — cada intent matchea ≥3 frases del MATERIAL ────────────

const USADOS_CASES: Record<string, string[]> = {
  purchase_ready: ['Lo quiero', 'Te lo compro', 'Me lo llevo', 'Cómo hago para comprarlo'],
  schedule_visit: ['¿Puedo ir a verlo?', 'Quiero un test drive', 'Lo puedo probar', 'Cuándo puedo ir'],
  trade_in: ['Permuto mi auto', 'Tengo un usado para entregar', 'Lo tomás en parte de pago', 'Cuánto me tomás el mío'],
  financing_inquiry: ['¿Tienen financiación?', 'Se puede en cuotas', 'Lo sacó financiado', 'Cuánto de anticipo'],
  specific_model: ['¿Tenés Corolla?', 'El Hilux que publicaron', '¿Qué versión es?', 'Cuántos kilómetros tiene'],
  price_inquiry: ['¿Cuánto sale?', '¿Qué precio tiene?', '¿Es negociable?', 'Aceptan oferta'],
  human_handoff: [
    'Quiero hablar con una persona',
    'Que me llame un vendedor',
    'Pasame con alguien',
    '¿Me das el número de la agencia?',
  ],
}

let usadosChecks = 0
for (const [expectedIntent, phrases] of Object.entries(USADOS_CASES)) {
  assert.ok(phrases.length >= 3, `intent ${expectedIntent} debe tener ≥3 frases de prueba`)
  for (const phrase of phrases) {
    const result = detectIntent(phrase, USADOS_PACK.intents)
    assert.strictEqual(
      result.intent,
      expectedIntent,
      `usados: "${phrase}" debería detectar ${expectedIntent}, detectó ${result.intent}`,
    )
    assert.ok(result.guidance !== null, `usados: intent ${expectedIntent} debe tener guidance`)
    usadosChecks++
  }
}

// Todos los intents del MATERIAL están representados (7).
assert.strictEqual(Object.keys(USADOS_CASES).length, 7, 'el MATERIAL define 7 intents usados')
assert.strictEqual(USADOS_PACK.intents.length, 7, 'el pack usados declara 7 intents')

// ─── 1b. Frases neutras NO matchean en `usados` ──────────────────────────────

const NEUTRAL_PHRASES = ['hola', 'gracias', '¿qué horario tienen?']
for (const phrase of NEUTRAL_PHRASES) {
  const result = detectIntent(phrase, USADOS_PACK.intents)
  assert.strictEqual(
    result.intent,
    'unknown',
    `usados: frase neutra "${phrase}" no debería matchear (detectó ${result.intent})`,
  )
  assert.strictEqual(result.guidance, null, `usados: neutra "${phrase}" no debe traer guidance`)
}

// ─── 1c. Falsos positivos NO triviales (encontrados por el audit EV.4) ───────
// Frases inocentes que NO deben rutearse a un intent de auto. Cubren las
// colisiones reales: nombres de modelo = palabras comunes (gol/toro/partner) y
// /probar/ a mitad de palabra ("aprobar"/"comprobar").
const USADOS_FALSE_POSITIVE_GUARDS: Array<[string, string]> = [
  ['metió un gol en el último minuto', 'unknown'], // gol (fútbol) ≠ VW Gol
  ['es fuerte como un toro', 'unknown'], // toro (animal) ≠ Fiat Toro
  ['necesito un partner para el negocio', 'unknown'], // partner (socio) ≠ Peugeot Partner
  ['lo tengo que aprobar con el banco', 'unknown'], // "aprobar" ≠ probar (visita)
  ['quiero comprobarlo yo mismo', 'unknown'], // "comprobarlo" ≠ probarlo (visita)
]
for (const [phrase, expected] of USADOS_FALSE_POSITIVE_GUARDS) {
  const result = detectIntent(phrase, USADOS_PACK.intents)
  assert.strictEqual(
    result.intent,
    expected,
    `usados FP-guard: "${phrase}" debería ser ${expected}, detectó ${result.intent}`,
  )
}
// Contra-prueba: "aprobar el crédito" SÍ es financiación (no visita) — el fix de
// /\bprobar\b/ no debe romper la detección legítima de crédito.
assert.strictEqual(
  detectIntent('tengo que aprobar el crédito', USADOS_PACK.intents).intent,
  'financing_inquiry',
  'usados: "aprobar el crédito" enruta a financing_inquiry (no a visita) tras el fix de /\\bprobar\\b/',
)

// ─── 2. Pack `agencia` — paridad con el detectIntent legacy (5 dorados) ───────

// Frases que el código viejo (PATTERNS hardcodeados) matcheaba → mismo intent.
const AGENCIA_GOLDEN: Array<[string, string]> = [
  ['¿Cuánto cuesta un sitio?', 'price'],
  ['Es urgente, lo necesito ya', 'urgency'],
  ['¿Por qué ustedes y no otro?', 'comparison'],
  ['Necesito un sitio web nuevo', 'service_inquiry'],
  ['Quiero una reunión para charlar', 'consultation'],
]

for (const [phrase, expectedIntent] of AGENCIA_GOLDEN) {
  const result = detectIntent(phrase, AGENCIA_PACK.intents)
  assert.strictEqual(
    result.intent,
    expectedIntent,
    `agencia: "${phrase}" debería detectar ${expectedIntent}, detectó ${result.intent}`,
  )
}

// Verbatim: el pack agencia tiene exactamente los 5 intents legacy, en orden.
assert.deepStrictEqual(
  AGENCIA_PACK.intents.map((i) => i.intent),
  ['price', 'urgency', 'comparison', 'service_inquiry', 'consultation'],
  'agencia preserva las 5 claves legacy en orden',
)

// ─── 3. Pack `base` — no crashea ante cualquier input ────────────────────────

const STRESS_INPUTS = [
  '',
  'hola',
  'permuto mi hilux financiado',
  '🚗🚗🚗',
  'a'.repeat(5000),
  'SELECT * FROM bots; DROP TABLE',
  '¿cuánto cuesta?',
]
for (const input of STRESS_INPUTS) {
  assert.doesNotThrow(
    () => detectIntent(input, BASE_PACK.intents),
    `base no debe lanzar con input ${JSON.stringify(input.slice(0, 20))}`,
  )
}
// base sí detecta sus propios intents genéricos (price/consultation).
assert.strictEqual(detectIntent('¿cuánto cuesta?', BASE_PACK.intents).intent, 'price', 'base detecta price')

// ─── Reporte ──────────────────────────────────────────────────────────────────

console.log(
  `[EV.4 invariant] ✓ usados: ${usadosChecks} frases en 7 intents + ${NEUTRAL_PHRASES.length} neutras + ` +
    `${USADOS_FALSE_POSITIVE_GUARDS.length} FP-guards (gol/toro/partner/aprobar) unknown; ` +
    `agencia: ${AGENCIA_GOLDEN.length} dorados + 5 claves verbatim; base: ${STRESS_INPUTS.length} inputs sin crash. ` +
    'Todas las aserciones pasaron.',
)
