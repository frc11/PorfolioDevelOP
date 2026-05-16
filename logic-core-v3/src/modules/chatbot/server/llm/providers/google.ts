import { createVertex } from '@ai-sdk/google-vertex'
import type { LanguageModel } from 'ai'
import type { LLMProvider, ModelInfo } from '../types'
import { ModelNotSupportedError } from '../types'

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
  private client: ReturnType<typeof createVertex> | null = null

  constructor() {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    const credJson = process.env.GOOGLE_VERTEX_CREDENTIALS_JSON
    const project = process.env.CHATBOT_GCP_PROJECT_ID

    if (!project) {
      throw new Error('GoogleProvider: CHATBOT_GCP_PROJECT_ID env var required')
    }

    // En production (Netlify) usamos JSON inline. En development local, file path.
    if (!credPath && !credJson) {
      throw new Error(
        'GoogleProvider: needs either GOOGLE_APPLICATION_CREDENTIALS (file path) ' +
        'or GOOGLE_VERTEX_CREDENTIALS_JSON (inline JSON string)'
      )
    }
  }

  private getClient() {
    if (!this.client) {
      const credJson = process.env.GOOGLE_VERTEX_CREDENTIALS_JSON

      this.client = createVertex({
        project: process.env.CHATBOT_GCP_PROJECT_ID!,
        location: process.env.CHATBOT_GCP_LOCATION ?? 'us-central1',
        // Si tenemos JSON inline, pasarlo como googleAuthOptions.credentials
        ...(credJson
          ? {
              googleAuthOptions: {
                credentials: JSON.parse(credJson),
              },
            }
          : {}),
      })
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

