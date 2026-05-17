/**
 * Estimacion aproximada de tokens.
 * Heuristica para espanol: ~3.5 chars/token.
 * Para precision real usariamos tiktoken, pero esto basta para mostrar al usuario.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0
  return Math.ceil(text.length / 3.5)
}

export function estimateTokensFromKB(kb: Record<string, string>): number {
  let total = 0
  for (const value of Object.values(kb)) {
    total += estimateTokens(value)
  }
  return total
}
