/**
 * LLM abstraction layer — public API.
 *
 * Usage example:
 *   const provider = getLLMProvider()           // reads env var
 *   const model = provider.getModel('gemini-2.5-flash')
 *   const result = await streamText({ model, ... })
 *   const cost = provider.estimateCost('gemini-2.5-flash', tokensIn, tokensOut)
 */

export type { LLMProvider, ModelInfo } from './types'
export {
  ProviderNotImplementedError,
  ModelNotSupportedError,
} from './types'
export { getLLMProvider, resetProviderCache } from './factory'
