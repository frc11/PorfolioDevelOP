import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LanguageModel } from 'ai'
import type { LLMProvider, ModelInfo } from '../types'
import { ModelNotSupportedError } from '../types'

/**
 * Google Gemini provider.
 *
 * Reads API key from `CHATBOT_GOOGLE_API_KEY` env var.
 * Falls back to `GOOGLE_GENERATIVE_AI_API_KEY` if the chatbot-prefixed one
 * isn't set (compat with the legacy variable name).
 */

interface GoogleModelConfig extends ModelInfo {
  apiModelId: string  // The actual model id Google's API expects
}

const GOOGLE_MODELS: Record<string, GoogleModelConfig> = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    apiModelId: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    inputPerMillion: 0.30,
    outputPerMillion: 2.50,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  'gemini-2.5-flash-lite': {
    id: 'gemini-2.5-flash-lite',
    apiModelId: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash Lite',
    inputPerMillion: 0.10,
    outputPerMillion: 0.40,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    apiModelId: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    inputPerMillion: 1.25,
    outputPerMillion: 10.00,
    supportsToolCalling: true,
    supportsStreaming: true,
    maxOutputTokens: 8192,
  },
}

export class GoogleProvider implements LLMProvider {
  readonly name = 'google' as const

  private readonly apiKey: string
  private client: ReturnType<typeof createGoogleGenerativeAI> | null = null

  constructor() {
    const apiKey =
      process.env.CHATBOT_GOOGLE_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      throw new Error(
        'Missing API key: set CHATBOT_GOOGLE_API_KEY (preferred) or ' +
          'GOOGLE_GENERATIVE_AI_API_KEY in your environment.'
      )
    }
    this.apiKey = apiKey
  }

  private getClient() {
    if (!this.client) {
      this.client = createGoogleGenerativeAI({ apiKey: this.apiKey })
    }
    return this.client
  }

  getModel(modelId: string): LanguageModel {
    const config = GOOGLE_MODELS[modelId]
    if (!config) {
      throw new ModelNotSupportedError('google', modelId)
    }
    return this.getClient()(config.apiModelId)
  }

  estimateCost(modelId: string, tokensIn: number, tokensOut: number): number {
    const config = GOOGLE_MODELS[modelId]
    if (!config) return 0
    return (
      (tokensIn / 1_000_000) * config.inputPerMillion +
      (tokensOut / 1_000_000) * config.outputPerMillion
    )
  }

  listModels(): ModelInfo[] {
    return Object.values(GOOGLE_MODELS).map(({ apiModelId: _omit, ...rest }) => rest)
  }
}
