import type { LanguageModel } from 'ai'
import type { LLMProviderName } from '../../shared/types'

/**
 * Common interface that all LLM providers must implement.
 *
 * The provider is a thin adapter: it returns a `LanguageModel` instance
 * compatible with Vercel AI SDK's `streamText()`, plus utility methods
 * for cost estimation.
 *
 * MVP scope: only `GoogleProvider` is functional. Others throw at
 * `getModel()` to signal they're not yet implemented.
 */
export interface LLMProvider {
  readonly name: LLMProviderName

  /**
   * Returns a Vercel AI SDK `LanguageModel` for the given model id.
   * Throws if the provider isn't implemented or the model id is unsupported.
   */
  getModel(modelId: string): LanguageModel

  /**
   * Estimates cost in USD for the given token counts on the given model.
   * Returns 0 if pricing isn't known (does not throw).
   */
  estimateCost(modelId: string, tokensIn: number, tokensOut: number): number

  /**
   * Lists model ids known to this provider with their pricing.
   */
  listModels(): ModelInfo[]
}

export interface ModelInfo {
  id: string
  displayName: string
  inputPerMillion: number   // USD per 1M input tokens
  outputPerMillion: number  // USD per 1M output tokens
  supportsToolCalling: boolean
  supportsStreaming: boolean
  maxOutputTokens: number
}

/**
 * Error thrown when a feature is not implemented in the current MVP scope.
 */
export class ProviderNotImplementedError extends Error {
  constructor(providerName: LLMProviderName) {
    super(
      `Provider "${providerName}" is not implemented in MVP. ` +
        `Only "google" is functional. ` +
        `See src/modules/chatbot/server/llm/providers/ to add support.`
    )
    this.name = 'ProviderNotImplementedError'
  }
}

export class ModelNotSupportedError extends Error {
  constructor(providerName: LLMProviderName, modelId: string) {
    super(
      `Model "${modelId}" is not supported by provider "${providerName}". ` +
        `Check provider.listModels() for available models.`
    )
    this.name = 'ModelNotSupportedError'
  }
}
