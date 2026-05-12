import type { LLMProviderName } from '../../shared/types'
import { getLLMProvider } from '../llm/factory'

/**
 * High-level cost calculation utilities.
 *
 * Wraps the per-provider `estimateCost()` to give callers a unified
 * function that doesn't need to instantiate a provider directly.
 */

export interface CostBreakdown {
  inputUsd: number
  outputUsd: number
  totalUsd: number
}

/**
 * Calculates USD cost for the given usage on the given provider/model.
 * Returns zeros if pricing is unknown.
 */
export function calculateCost(
  provider: LLMProviderName,
  modelId: string,
  tokensIn: number,
  tokensOut: number
): CostBreakdown {
  const llm = getLLMProvider(provider)
  const total = llm.estimateCost(modelId, tokensIn, tokensOut)

  // Reconstruct breakdown using the model's pricing
  const modelInfo = llm.listModels().find((m) => m.id === modelId)
  if (!modelInfo) {
    return { inputUsd: 0, outputUsd: 0, totalUsd: 0 }
  }

  const inputUsd = (tokensIn / 1_000_000) * modelInfo.inputPerMillion
  const outputUsd = (tokensOut / 1_000_000) * modelInfo.outputPerMillion

  return {
    inputUsd,
    outputUsd,
    totalUsd: total,
  }
}
