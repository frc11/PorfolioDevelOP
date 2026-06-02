import type { LLMProviderName } from '../../shared/types'
import type { LLMProvider } from './types'
import { GoogleProvider } from './providers/google'
import { AnthropicProvider } from './providers/anthropic'
import { OpenAIProvider } from './providers/openai'

/**
 * Factory for LLM providers.
 *
 * Singleton per provider — providers are stateless adapters so caching
 * the instance is safe and avoids re-reading env vars on each call.
 */

const cache = new Map<LLMProviderName, LLMProvider>()

/**
 * Returns the provider for the given name. If no name is passed,
 * reads `CHATBOT_LLM_PROVIDER` env var, falling back to "google".
 */
export function getLLMProvider(name?: LLMProviderName): LLMProvider {
  // Case-insensitive: el enum Prisma `LlmProvider` guarda MAYÚSCULA ("GOOGLE")
  // desde B11.4, mientras los `case` de abajo son minúscula. Normalizamos para
  // que el valor del enum, la env var y cualquier literal resuelvan al mismo provider.
  const providerName: LLMProviderName = (
    name ?? (process.env.CHATBOT_LLM_PROVIDER as LLMProviderName | undefined) ?? 'google'
  ).toLowerCase() as LLMProviderName

  const cached = cache.get(providerName)
  if (cached) return cached

  let provider: LLMProvider
  switch (providerName) {
    case 'google':
      provider = new GoogleProvider()
      break
    case 'anthropic':
      provider = new AnthropicProvider()
      break
    case 'openai':
      provider = new OpenAIProvider()
      break
    default: {
      // Exhaustiveness check
      const _exhaustive: never = providerName
      throw new Error(`Unknown LLM provider: ${_exhaustive as string}`)
    }
  }

  cache.set(providerName, provider)
  return provider
}

/**
 * Resets the provider cache. Useful for tests or when env vars change.
 */
export function resetProviderCache(): void {
  cache.clear()
}
