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

  // Reconstruct the input/output split using the model's pricing.
  const modelInfo = llm.listModels().find((m) => m.id === modelId)
  if (!modelInfo) {
    // COST-2 — `total` above is already authoritative: (provider, modelId) was
    // validated upstream by resolveEffectiveModel before this call (COST-1), so
    // estimateCost() was always able to compute it from the same provider's own
    // pricing table. Not finding modelInfo here only means this *specific*
    // input/output split can't be reconstructed — it is not evidence the pair is
    // invalid, so never clobber a real total with 0. There's no per-model rate
    // to divide it with, so the split falls back to 0/0 (documented, not exact).
    return { inputUsd: 0, outputUsd: 0, totalUsd: total }
  }

  const inputUsd = (tokensIn / 1_000_000) * modelInfo.inputPerMillion
  const outputUsd = (tokensOut / 1_000_000) * modelInfo.outputPerMillion

  return {
    inputUsd,
    outputUsd,
    totalUsd: total,
  }
}
