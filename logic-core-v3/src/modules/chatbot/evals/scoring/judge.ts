/**
 * Q1.2 — Juez LLM perceptual (tono + loreteo). El juez EVALÚA, no arregla.
 *
 * Reusa el patrón raw `@anthropic-ai/sdk` de `src/lib/ai/results-insights.ts`
 * (el provider AI-SDK `AnthropicProvider` del chatbot es un stub que tira, no se
 * usa). Cliente lazy-singleton + guard de `ANTHROPIC_API_KEY` (opcional). Modelo
 * Opus configurable por env. Degrada con gracia: sin key / error de API /
 * respuesta no parseable → `{ evaluated: false, reason }`, nunca rompe la corrida.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { CapturedScenario } from '../types'
import type { JudgeStatus } from './types'
import { RUBRIC_SYSTEM } from './rubric'
import { parseJudgeVerdict } from './parse-verdict'
import { evaluableTurns, resolveText } from './resolve'

const DEFAULT_JUDGE_MODEL = 'claude-opus-4-8'
const JUDGE_MAX_TOKENS = 700

let client: Anthropic | null = null

/** `true` si hay API key para el juez (chequeo de presencia; NO loguea el valor). */
export function hasJudgeApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim())
}

/** Modelo juez, configurable por env; Opus (el más capaz) por defecto. */
export function getJudgeModel(): string {
  return process.env.EVALS_JUDGE_MODEL?.trim() || DEFAULT_JUDGE_MODEL
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada')
  client ??= new Anthropic({ apiKey })
  return client
}

/** Arma la conversación (turnos limpios) como texto para el juez. */
function buildConversationText(scenario: CapturedScenario): string {
  const lines: string[] = [
    'CONTEXTO DEL ESCENARIO',
    `Rubro (pack): ${scenario.pack}`,
    `Descripción: ${scenario.description}`,
    `Tono buscado: ${scenario.expectations.toneNotes ?? '(no especificado)'}`,
    '',
    'CONVERSACIÓN',
  ]
  for (const turn of evaluableTurns(scenario)) {
    lines.push(`Visitante: ${turn.userMessage}`)
    const asst = resolveText(turn).trim()
    lines.push(`Asistente: ${asst || '(sin texto — respondió con una acción/tool)'}`)
  }
  lines.push('', 'Evaluá SOLO el tono y el loreteo del asistente. Devolvé únicamente el JSON.')
  return lines.join('\n')
}

/**
 * Juzga un escenario EVALUABLE (el caller ya descartó los no-evaluables de Q1.1).
 * Nunca tira: cualquier problema → `{ evaluated: false, reason }`.
 */
export async function judgeScenario(scenario: CapturedScenario): Promise<JudgeStatus> {
  const hasAssistantText = evaluableTurns(scenario).some((t) => resolveText(t).trim().length > 0)
  if (!hasAssistantText) {
    return { evaluated: false, reason: 'sin texto de asistente para evaluar (solo tools)' }
  }

  try {
    const response = await getClient().messages.create({
      model: getJudgeModel(),
      max_tokens: JUDGE_MAX_TOKENS,
      temperature: 0,
      system: RUBRIC_SYSTEM,
      messages: [{ role: 'user', content: buildConversationText(scenario) }],
    })
    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { evaluated: false, reason: 'el juez no devolvió texto' }
    }
    const parsed = parseJudgeVerdict(textBlock.text)
    return parsed.ok
      ? { evaluated: true, verdict: parsed.verdict }
      : { evaluated: false, reason: parsed.reason }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { evaluated: false, reason: `error de API del juez: ${msg}` }
  }
}
