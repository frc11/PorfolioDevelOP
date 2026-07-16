/**
 * COST-2b — Invariante de la resolución modelo/provider del endpoint
 * demo-chat, que reemplazó `getLLMProvider(bot.llmProvider as 'google' |
 * 'anthropic' | 'openai')` (cast que mentía al compilador: el enum Prisma
 * real es 'GOOGLE'/'ANTHROPIC'/'OPENAI' en mayúsculas, el switch de
 * getLLMProvider compara en minúsculas → caía al default y throweaba para
 * el 100% de los bots) por el mismo patrón seguro que ya usa el runtime real
 * (COST-1, handleChatRequest.ts:694): `resolveEffectiveModel(normalizeLlmProvider(
 * bot.llmProvider), bot.llmModel)`.
 *
 * Cero DB, cero red, cero credenciales: el provider de prueba se inyecta vía
 * el 3er parámetro de `resolveEffectiveModel` (mismo mecanismo que
 * resolve-effective-model.invariant.ts / COST-1) — GoogleProvider real exige
 * CHATBOT_GCP_PROJECT_ID incluso para instanciarlo. Este invariant no invoca
 * el handler POST completo (auth/DB/streamText reales): el fix de este
 * sprint es solo la línea de resolución, no el resto del endpoint.
 *
 *   npm run test:cost2b
 *   (o: npx tsx "src/app/api/admin/chatbot/demo-chat/[slug]/__tests__/demo-chat-model-resolution.invariant.ts")
 *
 * Casos:
 *   1. bot.llmProvider = LlmProvider.GOOGLE (el valor real del enum Prisma,
 *      mayúsculas) → resuelve sin throw. Es exactamente el caso que rompía
 *      el 100% de los bots antes del fix.
 *   2. bot.llmProvider = LlmProvider.ANTHROPIC (provider stub, no
 *      implementado en el MVP) → degrada a Google en vez de tirar 500
 *      (effectiveModel.degraded=true — el flag que el caller usaría para
 *      loguear el WARN de degrade).
 */
import assert from 'node:assert/strict'
import { LlmProvider } from '@prisma/client'
import type { LanguageModel } from 'ai'
import type { LLMProviderName } from '@/modules/chatbot/shared/types'
import {
  type LLMProvider,
  type ModelInfo,
  ProviderNotImplementedError,
  normalizeLlmProvider,
  resolveEffectiveModel,
  FALLBACK_PROVIDER,
  FALLBACK_MODEL_ID,
} from '@/modules/chatbot/server/llm'

let passed = 0
function check(label: string, fn: () => void): void {
  fn()
  passed += 1
  console.log(`  ✓ ${label}`)
}

console.log('COST-2b — demo-chat-model-resolution.invariant')

// ---- providers de prueba: sin SDK real, sin env vars (mismo patrón que COST-1) ----
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
      if (modelId !== FAKE_MODEL.id) throw new Error(`unexpected model id: ${modelId}`)
      return {} as LanguageModel
    },
    estimateCost: () => 0,
    listModels: () => [FAKE_MODEL],
  }
}

function fakeStubProvider(name: 'anthropic' | 'openai'): LLMProvider {
  return {
    name,
    getModel(_modelId) {
      throw new ProviderNotImplementedError(name)
    },
    estimateCost: () => 0,
    listModels: () => [],
  }
}

function fakeGetProvider(name: LLMProviderName): LLMProvider {
  if (name === 'google') return fakeGoogleProvider()
  if (name === 'anthropic') return fakeStubProvider('anthropic')
  return fakeStubProvider('openai')
}

// ── 1. bot.llmProvider real (enum Prisma, mayúsculas) → resuelve sin throw ───
check(
  'bot.llmProvider = LlmProvider.GOOGLE (mayúsculas) → resuelve sin throw (el caso que rompía el 100% de los bots pre-fix)',
  () => {
    const provider = normalizeLlmProvider(LlmProvider.GOOGLE)
    assert.equal(provider, 'google')
    const result = resolveEffectiveModel(provider, FAKE_MODEL.id, fakeGetProvider)
    assert.equal(result.degraded, false)
    assert.equal(result.provider, 'google')
    assert.equal(result.modelId, FAKE_MODEL.id)
  },
)

// ── 2. bot.llmProvider stub (enum Prisma) → degrada, sin throw/500 ───────────
check(
  'bot.llmProvider = LlmProvider.ANTHROPIC (provider stub) → degrada a Google, sin throw/500',
  () => {
    const provider = normalizeLlmProvider(LlmProvider.ANTHROPIC)
    assert.equal(provider, 'anthropic')
    const result = resolveEffectiveModel(provider, 'claude-sonnet-4-6', fakeGetProvider)
    assert.equal(result.degraded, true)
    assert.equal(result.provider, FALLBACK_PROVIDER)
    assert.equal(result.modelId, FALLBACK_MODEL_ID)
    assert.equal(result.requestedProvider, 'anthropic')
    assert.equal(result.requestedModel, 'claude-sonnet-4-6')
  },
)

console.log(`\n✅ COST-2b demo-chat-model-resolution OK — ${passed} checks`)
