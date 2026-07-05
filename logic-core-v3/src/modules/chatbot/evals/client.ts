/**
 * Q1.1 — Cliente HTTP del corredor. POST real a `/api/chatbot/{slug}/chat`
 * (bot QA, Gemini real, sin mocks) y consumo del stream.
 *
 * Cómo se consume el stream: el endpoint responde de dos formas —
 *   1. SSE (`text/event-stream`, AI SDK v6 `toUIMessageStreamResponse()`), o
 *   2. JSON plano (degradado por quota/dominio, o error 4xx/5xx).
 * Ramificamos por `Content-Type`. Para el SSE bufferizamos el cuerpo con
 * `res.text()` (esto DRENA el stream hasta el final → dispara el `onFinish`
 * del server que persiste el assistant message) y opcionalmente reconstruimos
 * el texto del wire. El texto y las toolCalls CANÓNICOS los lee `capture.ts`
 * desde la fila persistida — más fiable que parsear el SSE (que no trae los
 * `input` de las tools). Patrón derivado de `scripts/ev4-smoke.mjs` +
 * `scripts/regression/run-baseline.ts`.
 */
import type { DegradedPayload } from './types'

export interface ChatMessageInput {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface PostTurnResult {
  status: number
  contentType: string
  latencyMs: number
  /** Reconstruido del SSE (best-effort). Texto canónico lo da `capture.ts` (DB). */
  wireText: string
  /** Nombres de tools vistos en el wire (best-effort; sin `input`). */
  wireToolNames: string[]
  /** Payload si el server devolvió JSON `mode:'degraded'`. */
  degraded: DegradedPayload | null
  /** Cuerpo de error si el JSON no fue degradado (ej. `{error}` de 4xx/5xx). */
  errorBody: unknown
  /** Milisegundos a esperar si hubo 429 (de `Retry-After`/`X-RateLimit-Reset`). */
  retryAfterMs: number | null
}

/**
 * Parser best-effort del UI message stream (AI SDK v6, SSE con líneas `data:`).
 * Idéntico en espíritu al de `scripts/ev4-smoke.mjs`: junta deltas de texto de
 * los campos conocidos y colecta nombres de tools. Solo para `wireText`
 * secundario — la fuente de verdad es la DB.
 */
function extractWire(rawBody: string): { text: string; toolNames: string[] } {
  const deltas: string[] = []
  const toolNames: string[] = []
  for (const line of rawBody.split('\n')) {
    const trimmed = line.startsWith('data:') ? line.slice(5).trim() : line.trim()
    if (!trimmed || trimmed === '[DONE]') continue
    let obj: unknown
    try {
      obj = JSON.parse(trimmed)
    } catch {
      continue
    }
    if (typeof obj !== 'object' || obj === null) continue
    const rec = obj as Record<string, unknown>
    const type = typeof rec.type === 'string' ? rec.type : ''
    if (typeof rec.delta === 'string' && type.includes('text')) deltas.push(rec.delta)
    else if (typeof rec.textDelta === 'string') deltas.push(rec.textDelta)
    else if (type === 'text' && typeof rec.text === 'string') deltas.push(rec.text)
    if (type.includes('tool')) {
      const name = rec.toolName ?? rec.name
      if (typeof name === 'string') toolNames.push(name)
    }
  }
  return { text: deltas.join('').trim(), toolNames }
}

/** Milisegundos de backoff a partir de los headers de rate-limit de un 429. */
function parseRetryAfterMs(res: Response): number {
  const retryAfter = res.headers.get('retry-after')
  if (retryAfter) {
    const secs = Number(retryAfter)
    if (Number.isFinite(secs)) return Math.max(1000, secs * 1000)
  }
  const reset = res.headers.get('x-ratelimit-reset')
  if (reset) {
    const resetMs = Number(reset)
    // El reset puede venir en epoch-ms o epoch-s; normalizamos a "faltan X ms".
    if (Number.isFinite(resetMs)) {
      const epochMs = resetMs > 1e12 ? resetMs : resetMs * 1000
      const delta = epochMs - Date.now()
      if (Number.isFinite(delta) && delta > 0) return Math.min(delta, 65_000)
    }
  }
  return 5_000
}

/** Envía un turno al bot y devuelve la respuesta cruda ramificada por tipo. */
export async function postTurn(opts: {
  baseUrl: string
  origin: string
  slug: string
  sessionId: string
  messages: ChatMessageInput[]
  currentPath?: string
}): Promise<PostTurnResult> {
  const t0 = Date.now()
  const res = await fetch(`${opts.baseUrl}/api/chatbot/${opts.slug}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: opts.origin },
    body: JSON.stringify({
      messages: opts.messages,
      sessionId: opts.sessionId,
      currentPath: opts.currentPath ?? '/',
    }),
  })
  const contentType = res.headers.get('content-type') ?? ''
  const raw = await res.text()
  const latencyMs = Date.now() - t0

  const base = {
    status: res.status,
    contentType,
    latencyMs,
    wireText: '',
    wireToolNames: [] as string[],
    degraded: null as DegradedPayload | null,
    errorBody: null as unknown,
    retryAfterMs: res.status === 429 ? parseRetryAfterMs(res) : null,
  }

  if (contentType.includes('application/json')) {
    let json: unknown = null
    try {
      json = JSON.parse(raw)
    } catch {
      json = raw
    }
    if (
      typeof json === 'object' &&
      json !== null &&
      (json as Record<string, unknown>).mode === 'degraded'
    ) {
      return { ...base, degraded: json as unknown as DegradedPayload }
    }
    return { ...base, errorBody: json }
  }

  const { text, toolNames } = extractWire(raw)
  return { ...base, wireText: text, wireToolNames: toolNames }
}
