/**
 * Q1.2 — Parser tolerante del veredicto del juez. Puro, sin red.
 *
 * El juez es un LLM: su salida puede venir con fences ```json, prosa alrededor,
 * o directamente mal formada. Este parser NUNCA tira: cualquier problema →
 * `{ ok: false, reason }`, y el escenario queda "no evaluado perceptualmente"
 * (no rompe la corrida). Unit-testeado con respuesta buena y mal formada.
 */
import { JUDGE_VERDICT_SCHEMA } from './types'
import type { JudgeParseResult } from './types'

export function parseJudgeVerdict(raw: string): JudgeParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, reason: 'respuesta vacía del juez' }

  // Stripea fences ```json … ``` y recorta del primer { al último } (tolera prosa).
  const noFence = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  const start = noFence.indexOf('{')
  const end = noFence.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    return { ok: false, reason: 'no se encontró un objeto JSON en la respuesta' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(noFence.slice(start, end + 1))
  } catch {
    return { ok: false, reason: 'JSON inválido en la respuesta del juez' }
  }

  const result = JUDGE_VERDICT_SCHEMA.safeParse(parsed)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.') || '(raíz)'}: ${i.message}`)
      .join('; ')
    return { ok: false, reason: `veredicto fuera de esquema: ${issues}` }
  }
  return { ok: true, verdict: result.data }
}
