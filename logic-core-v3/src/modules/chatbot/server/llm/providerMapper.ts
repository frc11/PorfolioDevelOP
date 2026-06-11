import { LlmProvider } from '@prisma/client'
import type { LLMProviderName } from '../../shared/types'

/**
 * Maps the Prisma `LlmProvider` enum (SQL-convention uppercase, e.g. "GOOGLE")
 * to the chatbot module's `LLMProviderName` union ("google" | "anthropic" | "openai").
 *
 * The Prisma enum stores values in uppercase by convention; the chatbot module
 * uses lowercase identifiers that match SDK and API naming. This function is the
 * single point of truth for the translation — using it instead of `as` casts lets
 * TypeScript enforce exhaustiveness at compile time: adding a new `LlmProvider`
 * value causes a type error here until the mapping is updated.
 */
export function normalizeLlmProvider(provider: LlmProvider): LLMProviderName {
  switch (provider) {
    case LlmProvider.GOOGLE:
      return 'google'
    case LlmProvider.ANTHROPIC:
      return 'anthropic'
    case LlmProvider.OPENAI:
      return 'openai'
    default: {
      // Exhaustiveness guard — never reached at runtime if all enum values are handled.
      const _exhaustive: never = provider
      throw new Error(`Unhandled LlmProvider value: ${String(_exhaustive)}`)
    }
  }
}
