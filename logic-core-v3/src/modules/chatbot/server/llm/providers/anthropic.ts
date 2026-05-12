import type { LanguageModel } from 'ai'
import type { LLMProvider, ModelInfo } from '../types'
import { ProviderNotImplementedError } from '../types'

/**
 * Anthropic provider — STUB in MVP.
 *
 * Implement when a real need arises (e.g., A/B test against Gemini,
 * or fall back when Google has an outage).
 *
 * The pricing table below is informational; activate it by uncommenting
 * the actual implementation when you build it.
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic' as const

  getModel(_modelId: string): LanguageModel {
    throw new ProviderNotImplementedError('anthropic')
  }

  estimateCost(modelId: string, tokensIn: number, tokensOut: number): number {
    const config = ANTHROPIC_MODELS[modelId]
    if (!config) return 0
    return (
      (tokensIn / 1_000_000) * config.inputPerMillion +
      (tokensOut / 1_000_000) * config.outputPerMillion
    )
  }

  listModels(): ModelInfo[] {
    return Object.values(ANTHROPIC_MODELS)
  }
}

const ANTHROPIC_MODELS: Record<string, ModelInfo> = {
  'claude-haiku-4-5': {
    id: 'claude-haiku-4-5',
    displayName: 'Claude Haiku 4.5',
    inputPerMillion: 1.00,
    outputPerMillion: 5.00,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  'claude-sonnet-4-6': {
    id: 'claude-sonnet-4-6',
    displayName: 'Claude Sonnet 4.6',
    inputPerMillion: 3.00,
    outputPerMillion: 15.00,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
}
