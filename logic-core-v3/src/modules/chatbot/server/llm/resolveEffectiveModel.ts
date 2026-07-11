import type { LanguageModel } from 'ai'
import type { LLMProviderName } from '../../shared/types'
import type { LLMProvider } from './types'
import { ModelNotSupportedError, ProviderNotImplementedError } from './types'
import { getLLMProvider } from './factory'

/**
 * COST-1 — Resolución única del par (provider, modelo) efectivo: la misma que
 * ejecuta la respuesta real (getModel/streamText) es la que debe entrar a
 * calculateCost. Antes, el costo leía `resolvedBot.llmModel` (campo legacy de
 * BotConfig) mientras la ejecución usaba `plan.llmModel` — podían divergir, y
 * un provider no implementado (Anthropic/OpenAI, stubs) hacía throw → 500.
 *
 * Si el provider solicitado no está implementado o el modelo no existe para
 * ese provider, degrada a (Google, modelo default) en vez de lanzar: un bot
 * mal configurado sigue respondiendo. El caller decide si loguear el degrade
 * (chat.cost_model_unknown vía logChatbotEvent) — esta función es pura.
 */

export const FALLBACK_PROVIDER: LLMProviderName = 'google'
export const FALLBACK_MODEL_ID = 'gemini-2.5-flash'

export interface EffectiveModel {
  provider: LLMProviderName
  modelId: string
  model: LanguageModel
  degraded: boolean
  requestedProvider: LLMProviderName
  requestedModel: string
}

/**
 * `getProvider` es inyectable (default: la factory real) para poder testear
 * sin credenciales de Vertex/Google — GoogleProvider exige env vars en su
 * constructor incluso para instanciarlo.
 */
export function resolveEffectiveModel(
  requestedProvider: LLMProviderName,
  requestedModel: string,
  getProvider: (name: LLMProviderName) => LLMProvider = getLLMProvider,
): EffectiveModel {
  try {
    const model = getProvider(requestedProvider).getModel(requestedModel)
    return {
      provider: requestedProvider,
      modelId: requestedModel,
      model,
      degraded: false,
      requestedProvider,
      requestedModel,
    }
  } catch (error) {
    if (!(error instanceof ProviderNotImplementedError) && !(error instanceof ModelNotSupportedError)) {
      throw error
    }
    return {
      provider: FALLBACK_PROVIDER,
      modelId: FALLBACK_MODEL_ID,
      model: getProvider(FALLBACK_PROVIDER).getModel(FALLBACK_MODEL_ID),
      degraded: true,
      requestedProvider,
      requestedModel,
    }
  }
}
