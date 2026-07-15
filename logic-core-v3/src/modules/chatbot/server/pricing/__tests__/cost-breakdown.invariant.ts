/**
 * COST-2 — Invariante de que el breakdown de costo no pisa un total
 * autoritativo con $0, y de que la clave del Record de cada provider ahora
 * se deriva de `id` (mismatch clave/id estructuralmente imposible).
 *
 * Corre sin DB, sin red y sin credenciales reales de Vertex/Google. Para
 * poder instanciar `GoogleProvider` (su constructor exige que
 * `CHATBOT_GCP_PROJECT_ID` y una credencial estén *presentes*) este archivo
 * les setea un placeholder si faltan — nunca se leen de verdad porque acá
 * solo se llama estimateCost()/listModels(), nunca getModel() (el único
 * método que dispara getClient()/createVertex()):
 *
 *   npm run test:cost2
 *   (o: npx tsx src/modules/chatbot/server/pricing/__tests__/cost-breakdown.invariant.ts)
 *
 * Casos:
 *   1. Paridad: listModels()/estimateCost() de los 3 providers dan
 *      exactamente lo mismo que antes del refactor (mismos ids, precios,
 *      flags) — el refactor de Paso 2 es puramente estructural.
 *   2. Invariante clave≡id: todo modelo que listModels() expone es
 *      encontrable por su propio id en estimateCost() — si la clave del
 *      Record no coincidiera con `id`, esto daría costo 0.
 *   3. El fix de costs.ts: si listModels().find() no encuentra el modelo
 *      pero estimateCost() ya calculó un total, totalUsd YA NO se pisa con
 *      0. Paso 2 ya vuelve este escenario irreproducible con los 3
 *      providers reales (checks del caso 2), así que se fuerza con un
 *      monkey-patch temporal (try/finally) de listModels() sobre el
 *      provider real cacheado por la factory — calculateCost() no expone
 *      un parámetro para inyectar un provider fake (agregarlo excedería el
 *      scope de este sprint), así que es la única forma de ejercitar la
 *      rama con la función exportada real, sin tocar su firma.
 */
import assert from 'node:assert/strict'
import type { ModelInfo } from '../../llm/types'
import { GoogleProvider } from '../../llm/providers/google'
import { AnthropicProvider } from '../../llm/providers/anthropic'
import { OpenAIProvider } from '../../llm/providers/openai'
import { getLLMProvider } from '../../llm/factory'
import { calculateCost } from '../costs'

let passed = 0
function check(label: string, fn: () => void): void {
  fn()
  passed += 1
  console.log(`  ✓ ${label}`)
}

console.log('COST-2 — cost-breakdown.invariant')

// GoogleProvider exige estas env vars *presentes* en su constructor, pero acá
// nunca se llama getModel() (el único método que las usa de verdad vía
// getClient()/createVertex()) — son placeholders, no credenciales reales.
process.env.CHATBOT_GCP_PROJECT_ID ??= 'test-project-cost2'
process.env.GOOGLE_APPLICATION_CREDENTIALS ??= 'test-cost2-unused-path'

const google = new GoogleProvider()
const anthropic = new AnthropicProvider()
const openai = new OpenAIProvider()

function expectedTotal(model: ModelInfo, tokensIn: number, tokensOut: number): number {
  return (tokensIn / 1_000_000) * model.inputPerMillion + (tokensOut / 1_000_000) * model.outputPerMillion
}

function assertModelsMatch(actual: ModelInfo[], expected: ModelInfo[], label: string): void {
  assert.equal(actual.length, expected.length, `${label}: cantidad de modelos cambió`)
  const byId = new Map(actual.map((m) => [m.id, m]))
  for (const exp of expected) {
    const got = byId.get(exp.id)
    assert.ok(got, `${label}: falta el modelo "${exp.id}"`)
    assert.deepStrictEqual(got, exp, `${label}: "${exp.id}" cambió de forma/valores`)
  }
}

// ── Datos esperados: los mismos que ya vivían a mano en cada provider ───────
const GOOGLE_EXPECTED: ModelInfo[] = [
  {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    inputPerMillion: 0.30,
    outputPerMillion: 2.50,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  {
    id: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash Lite',
    inputPerMillion: 0.10,
    outputPerMillion: 0.40,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  {
    id: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    inputPerMillion: 1.25,
    outputPerMillion: 10.00,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
]

const ANTHROPIC_EXPECTED: ModelInfo[] = [
  {
    id: 'claude-haiku-4-5',
    displayName: 'Claude Haiku 4.5',
    inputPerMillion: 1.00,
    outputPerMillion: 5.00,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  {
    id: 'claude-sonnet-4-6',
    displayName: 'Claude Sonnet 4.6',
    inputPerMillion: 3.00,
    outputPerMillion: 15.00,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
]

const OPENAI_EXPECTED: ModelInfo[] = [
  {
    id: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    inputPerMillion: 0.15,
    outputPerMillion: 0.60,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 16384,
  },
  {
    id: 'gpt-4o',
    displayName: 'GPT-4o',
    inputPerMillion: 2.50,
    outputPerMillion: 10.00,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 16384,
  },
]

// ── 1. Paridad: listModels() sin cambios de forma/valores ───────────────────
check('paridad Google: listModels() idéntico al de antes del refactor', () => {
  assertModelsMatch(google.listModels(), GOOGLE_EXPECTED, 'google')
})

check('paridad Anthropic: listModels() idéntico al de antes del refactor', () => {
  assertModelsMatch(anthropic.listModels(), ANTHROPIC_EXPECTED, 'anthropic')
})

check('paridad OpenAI: listModels() idéntico al de antes del refactor', () => {
  assertModelsMatch(openai.listModels(), OPENAI_EXPECTED, 'openai')
})

// ── 1b. Paridad: estimateCost() da el mismo número que antes del refactor ──
check('paridad Google: estimateCost() sin cambios (1M in / 1M out por modelo)', () => {
  for (const model of GOOGLE_EXPECTED) {
    assert.equal(
      google.estimateCost(model.id, 1_000_000, 1_000_000),
      expectedTotal(model, 1_000_000, 1_000_000),
      `google.estimateCost("${model.id}") cambió`,
    )
  }
})

check('paridad Anthropic: estimateCost() sin cambios (1M in / 1M out por modelo)', () => {
  for (const model of ANTHROPIC_EXPECTED) {
    assert.equal(
      anthropic.estimateCost(model.id, 1_000_000, 1_000_000),
      expectedTotal(model, 1_000_000, 1_000_000),
      `anthropic.estimateCost("${model.id}") cambió`,
    )
  }
  // mismo número que ya confirmaba el invariant de COST-1 para este modelo.
  assert.equal(anthropic.estimateCost('claude-haiku-4-5', 1_000_000, 1_000_000), 6)
})

check('paridad OpenAI: estimateCost() sin cambios (1M in / 1M out por modelo)', () => {
  for (const model of OPENAI_EXPECTED) {
    assert.equal(
      openai.estimateCost(model.id, 1_000_000, 1_000_000),
      expectedTotal(model, 1_000_000, 1_000_000),
      `openai.estimateCost("${model.id}") cambió`,
    )
  }
})

// ── 2. Invariante clave≡id: todo modelo listado es priceable por su propio id ─
check('clave≡id (google): cada modelo de listModels() es encontrable por su propio id en estimateCost', () => {
  for (const m of google.listModels()) {
    const cost = google.estimateCost(m.id, 1_000_000, 1_000_000)
    assert.ok(cost > 0, `google.estimateCost("${m.id}") dio ${cost} — clave del Record ≠ id`)
  }
})

check('clave≡id (anthropic): cada modelo de listModels() es encontrable por su propio id en estimateCost', () => {
  for (const m of anthropic.listModels()) {
    const cost = anthropic.estimateCost(m.id, 1_000_000, 1_000_000)
    assert.ok(cost > 0, `anthropic.estimateCost("${m.id}") dio ${cost} — clave del Record ≠ id`)
  }
})

check('clave≡id (openai): cada modelo de listModels() es encontrable por su propio id en estimateCost', () => {
  for (const m of openai.listModels()) {
    const cost = openai.estimateCost(m.id, 1_000_000, 1_000_000)
    assert.ok(cost > 0, `openai.estimateCost("${m.id}") dio ${cost} — clave del Record ≠ id`)
  }
})

check('un modelo genuinamente desconocido sigue devolviendo 0 (no throw) en los 3 providers', () => {
  assert.equal(google.estimateCost('no-existe', 1_000_000, 1_000_000), 0)
  assert.equal(anthropic.estimateCost('no-existe', 1_000_000, 1_000_000), 0)
  assert.equal(openai.estimateCost('no-existe', 1_000_000, 1_000_000), 0)
})

// ── 3. El fix: !modelInfo con total ya calculado → NO se pisa con 0 ─────────
check('costs.ts: modelInfo no encontrado pero total ya calculado → totalUsd conserva el total (no se pisa con 0)', () => {
  const provider = getLLMProvider('anthropic')
  const originalListModels = provider.listModels
  try {
    provider.listModels = () => []
    const result = calculateCost('anthropic', 'claude-haiku-4-5', 1_000_000, 1_000_000)
    assert.equal(result.totalUsd, 6, 'totalUsd debía ser el total autoritativo (6), no 0')
    assert.equal(result.inputUsd, 0, 'sin modelInfo, el split cae al fallback documentado (0)')
    assert.equal(result.outputUsd, 0, 'sin modelInfo, el split cae al fallback documentado (0)')
  } finally {
    provider.listModels = originalListModels
  }
})

check('costs.ts: par realmente desconocido (ambos lookups fallan) → sigue en $0, sin falso positivo', () => {
  // Control negativo del check anterior: si estimateCost() TAMBIÉN falla
  // (total legítimamente 0), el fix no debe inventar un total.
  const result = calculateCost('anthropic', 'gemini-2.5-flash', 1_000_000, 1_000_000)
  assert.equal(result.totalUsd, 0)
})

console.log(`\n✅ COST-2 cost-breakdown OK — ${passed} checks`)
