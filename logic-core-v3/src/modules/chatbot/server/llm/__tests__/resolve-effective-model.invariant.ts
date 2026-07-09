/**
 * COST-1 — Invariante de la resolución única de modelo/provider efectivo,
 * usada tanto para la ejecución (getModel) como para el costo (calculateCost).
 * Corre sin DB, sin red y sin credenciales de Vertex/Google: los providers de
 * prueba se inyectan vía el 3er parámetro de `resolveEffectiveModel`
 * (GoogleProvider real exige CHATBOT_GCP_PROJECT_ID en el constructor incluso
 * para instanciarlo, así que el camino 100% real de Google queda fuera de este
 * invariant — ver "Verificación humana" en la bitácora de COST-1):
 *
 *   npm run test:cost1
 *   (o: npx tsx src/modules/chatbot/server/llm/__tests__/resolve-effective-model.invariant.ts)
 *
 * Casos:
 *   1. Provider/modelo conocidos → passthrough exacto, degraded=false.
 *   2. Provider stub (Anthropic/OpenAI) → degrada a (Google, modelo default), sin throw.
 *   3. Modelo desconocido con provider válido → degrada igual, sin throw.
 *   4. El par degradado es siempre conocido para su propio provider (nunca produce
 *      costo 0 por mismatch, que es el bug que este sprint corrige).
 *   5. Error no relacionado (bug real, no config) → se re-lanza, no se enmascara.
 *   6. calculateCost real (provider Anthropic, sin credenciales) confirma que el
 *      costo sigue al par efectivo: mismo par → costo correcto y no-cero; par
 *      mezclado con modelo de otro provider → 0 silencioso (la razón de ser del sprint).
 */
import assert from 'node:assert/strict'
import type { LanguageModel } from 'ai'
import type { LLMProviderName } from '../../../shared/types'
import type { LLMProvider, ModelInfo } from '../types'
import { ModelNotSupportedError, ProviderNotImplementedError } from '../types'
import { resolveEffectiveModel, FALLBACK_PROVIDER, FALLBACK_MODEL_ID } from '../resolveEffectiveModel'
import { calculateCost } from '../../pricing/costs'

let passed = 0
function check(label: string, fn: () => void): void {
  fn()
  passed += 1
  console.log(`  ✓ ${label}`)
}

console.log('COST-1 — resolve-effective-model.invariant')

// ---- providers de prueba: sin SDK real, sin env vars ----
const FAKE_MODEL: ModelInfo = {
  id: FALLBACK_MODEL_ID,
  displayName: 'Fake Gemini Flash',
  inputPerMillion: 0.3,
  outputPerMillion: 2.5,
  supportsToolCalling: true,
  supportsStreaming: true,
  maxOutputTokens: 8192,
}

function fakeGoogleProvider(): LLMProvider {
  return {
    name: 'google',
    getModel(modelId) {
      if (modelId !== FAKE_MODEL.id) throw new ModelNotSupportedError('google', modelId)
      return {} as LanguageModel
    },
    estimateCost(modelId, tokensIn, tokensOut) {
      if (modelId !== FAKE_MODEL.id) return 0
      return (
        (tokensIn / 1_000_000) * FAKE_MODEL.inputPerMillion +
        (tokensOut / 1_000_000) * FAKE_MODEL.outputPerMillion
      )
    },
    listModels() {
      return [FAKE_MODEL]
    },
  }
}

function fakeStubProvider(name: 'anthropic' | 'openai'): LLMProvider {
  return {
    name,
    getModel(_modelId) {
      throw new ProviderNotImplementedError(name)
    },
    estimateCost() {
      return 0
    },
    listModels() {
      return []
    },
  }
}

function fakeGetProvider(name: LLMProviderName): LLMProvider {
  if (name === 'google') return fakeGoogleProvider()
  if (name === 'anthropic') return fakeStubProvider('anthropic')
  return fakeStubProvider('openai')
}

// ── 1. Provider/modelo conocidos → passthrough exacto ────────────────────────
check('camino feliz (google + modelo conocido) → passthrough, degraded=false', () => {
  const result = resolveEffectiveModel('google', FALLBACK_MODEL_ID, fakeGetProvider)
  assert.equal(result.degraded, false)
  assert.equal(result.provider, 'google')
  assert.equal(result.modelId, FALLBACK_MODEL_ID)
  assert.equal(result.requestedProvider, 'google')
  assert.equal(result.requestedModel, FALLBACK_MODEL_ID)
})

// ── 2. Provider stub → fallback a Google + degraded=true, sin throw ──────────
check('provider stub (anthropic) → degrada a Google, sin throw/500', () => {
  const result = resolveEffectiveModel('anthropic', 'claude-sonnet-4-6', fakeGetProvider)
  assert.equal(result.degraded, true)
  assert.equal(result.provider, FALLBACK_PROVIDER)
  assert.equal(result.modelId, FALLBACK_MODEL_ID)
  assert.equal(result.requestedProvider, 'anthropic')
  assert.equal(result.requestedModel, 'claude-sonnet-4-6')
})

check('provider stub (openai) → degrada a Google, sin throw/500', () => {
  const result = resolveEffectiveModel('openai', 'gpt-4o', fakeGetProvider)
  assert.equal(result.degraded, true)
  assert.equal(result.provider, FALLBACK_PROVIDER)
  assert.equal(result.modelId, FALLBACK_MODEL_ID)
})

// ── 3. Modelo desconocido con provider válido → degrada igual, sin throw ─────
check('modelo desconocido en provider válido (google) → degrada, sin throw/500', () => {
  const result = resolveEffectiveModel('google', 'gemini-typo-inexistente', fakeGetProvider)
  assert.equal(result.degraded, true)
  assert.equal(result.provider, FALLBACK_PROVIDER)
  assert.equal(result.modelId, FALLBACK_MODEL_ID)
  assert.equal(result.requestedModel, 'gemini-typo-inexistente')
})

// ── 4. El par degradado nunca produce costo 0 por mismatch ───────────────────
check('el par degradado es conocido para su propio provider (no da costo 0 por mismatch)', () => {
  const result = resolveEffectiveModel('anthropic', 'lo-que-sea', fakeGetProvider)
  const cost = fakeGetProvider(result.provider).estimateCost(result.modelId, 1_000_000, 1_000_000)
  assert.ok(cost > 0, `esperaba costo > 0 para el par degradado, dio ${cost}`)
})

// ── 5. Error no relacionado con provider/modelo → se re-lanza, no se enmascara ─
check('error no relacionado (bug real) → se re-lanza en vez de degradar', () => {
  const brokenProvider: LLMProvider = {
    name: 'google',
    getModel() {
      throw new Error('boom: fallo inesperado')
    },
    estimateCost() {
      return 0
    },
    listModels() {
      return []
    },
  }
  assert.throws(
    () => resolveEffectiveModel('google', FALLBACK_MODEL_ID, () => brokenProvider),
    /boom: fallo inesperado/,
  )
})

// ── 6. calculateCost real (provider Anthropic, sin credenciales) ─────────────
check('calculateCost real: par correcto (anthropic, claude-haiku-4-5) → costo no-cero', () => {
  const cost = calculateCost('anthropic', 'claude-haiku-4-5', 1_000_000, 1_000_000)
  // pricing real de ANTHROPIC_MODELS: 1.00 in + 5.00 out por 1M tokens
  assert.equal(cost.totalUsd, 6)
  assert.ok(cost.totalUsd > 0)
})

check('calculateCost real: par mezclado (modelo de OTRO provider) → 0 silencioso', () => {
  // El bug que corrige el sprint: si el costo leyera un modelo que no le
  // corresponde a ese provider (arrastrado de un campo legacy desalineado),
  // hoy da 0 en silencio en vez de lanzar — por eso la resolución debe
  // unificarse ANTES de llegar a calculateCost, no parchearse en calculateCost.
  const mismatched = calculateCost('anthropic', 'gemini-2.5-flash', 1_000_000, 1_000_000)
  assert.equal(mismatched.totalUsd, 0)
})

console.log(`\n✅ COST-1 resolve-effective-model OK — ${passed} checks`)
