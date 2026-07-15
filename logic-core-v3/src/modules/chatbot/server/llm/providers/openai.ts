import type { LanguageModel } from 'ai'
import type { LLMProvider, ModelInfo } from '../types'
import { ProviderNotImplementedError } from '../types'

/**
 * OpenAI provider — STUB in MVP.
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai' as const

  getModel(_modelId: string): LanguageModel {
    throw new ProviderNotImplementedError('openai')
  }

  estimateCost(modelId: string, tokensIn: number, tokensOut: number): number {
    const config = OPENAI_MODELS[modelId]
    if (!config) return 0
    return (
      (tokensIn / 1_000_000) * config.inputPerMillion +
      (tokensOut / 1_000_000) * config.outputPerMillion
    )
  }

  listModels(): ModelInfo[] {
    return Object.values(OPENAI_MODELS)
  }
}

// COST-2 — la clave del Record se deriva de `id` (abajo), no se duplica a
// mano: un typo en `id` ya no puede desalinearse de su propia clave.
const OPENAI_MODEL_LIST: readonly ModelInfo[] = [
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

const OPENAI_MODELS: Record<string, ModelInfo> = Object.fromEntries(
  OPENAI_MODEL_LIST.map((m) => [m.id, m] as const)
)
