import { CrmEncryptionError, decryptSecret, type EncryptedSecret } from './encryptSecret'

/**
 * B5.8 — HTTP POST a n8n con retries in-flight.
 *
 * 3 intentos máximo, backoff 1s y 3s entre ellos. Timeout 10s por intento.
 * Tiempo total peor caso: ~33s (3 × 10s + 1s + 3s). Como se corre en
 * fire-and-forget post-respuesta del bot, no impacta UX.
 *
 * NO retry para:
 *  - 4xx: error de config del cliente (URL mal, token mal, payload rechazado).
 *    Reintentar en milisegundos no lo arregla.
 *  - CrmEncryptionError: infraestructura mal configurada. No es transitorio.
 *
 * Logs SIN PII: payload nunca se loguea, responseBody solo como snippet
 * sanitizado y truncado en `errorMessage` cuando falla.
 */

const REQUEST_TIMEOUT_MS = 10_000
const TEST_TIMEOUT_MS = 5_000 // más corto para "probar conexión" — UX
const RETRY_DELAYS_MS = [1_000, 3_000] as const // entre intento 1→2 y 2→3
const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1 // 3
const ERROR_SNIPPET_MAX = 200

export interface PostInput {
  webhookUrl: string
  payload: object
  encryptedSecret?: {
    headerName: string
    value: EncryptedSecret
  }
}

export interface SinglePostResult {
  ok: boolean
  httpStatus: number | null
  errorMessage: string | null
  durationMs: number
  /** Si true, el error es permanente — no tiene sentido reintentar. */
  permanent: boolean
}

export interface PostToN8nResult {
  ok: boolean
  httpStatus: number | null
  errorMessage: string | null
  durationMs: number
  attemptsUsed: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sanitizeSnippet(text: string): string {
  return text.replace(/[\r\n\t]+/g, ' ').slice(0, ERROR_SNIPPET_MAX).trim()
}

function errorToTypeAndMessage(error: unknown): { type: string; message: string } {
  if (error instanceof Error) {
    if (error.name === 'AbortError') return { type: 'timeout', message: 'Request timeout' }
    return { type: error.name, message: sanitizeSnippet(error.message) }
  }
  return { type: 'unknown', message: sanitizeSnippet(String(error)) }
}

async function singlePost(
  input: PostInput,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<SinglePostResult> {
  const t0 = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'develop-logic-core/1.0 (crm-sync)',
    }

    if (input.encryptedSecret) {
      // Decrypt solo en memoria, justo antes del fetch. Nunca se loguea.
      const plainSecret = decryptSecret(input.encryptedSecret.value)
      headers[input.encryptedSecret.headerName] = plainSecret
    }

    const response = await fetch(input.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(input.payload),
      signal: controller.signal,
    })

    const durationMs = Date.now() - t0

    if (response.ok) {
      return {
        ok: true,
        httpStatus: response.status,
        errorMessage: null,
        durationMs,
        permanent: false,
      }
    }

    // Solo en fallo: snippet de la respuesta, sanitizado y truncado.
    let errorBody = ''
    try {
      errorBody = await response.text()
    } catch {
      // body unreadable — proceder sin él.
    }

    return {
      ok: false,
      httpStatus: response.status,
      errorMessage: sanitizeSnippet(`HTTP ${response.status}: ${errorBody}`),
      durationMs,
      permanent: false,
    }
  } catch (error) {
    const durationMs = Date.now() - t0

    if (error instanceof CrmEncryptionError) {
      // Config error: no reintentar.
      return {
        ok: false,
        httpStatus: null,
        errorMessage: sanitizeSnippet(`config: ${error.message}`),
        durationMs,
        permanent: true,
      }
    }

    const { type, message } = errorToTypeAndMessage(error)
    return {
      ok: false,
      httpStatus: null,
      errorMessage: sanitizeSnippet(`${type}: ${message}`),
      durationMs,
      permanent: false,
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Ejecuta el POST a n8n con retries in-flight. Devuelve el resultado del
 * último intento + cuántos intentos se usaron.
 */
export async function postToN8nWithRetry(input: PostInput): Promise<PostToN8nResult> {
  let lastResult: SinglePostResult | null = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    lastResult = await singlePost(input)

    if (lastResult.ok) {
      return {
        ok: true,
        httpStatus: lastResult.httpStatus,
        errorMessage: null,
        durationMs: lastResult.durationMs,
        attemptsUsed: attempt,
      }
    }

    // 4xx = error de config del cliente. CrmEncryptionError = error de infra.
    // En ambos casos, reintentar no cambia el resultado.
    const isClientError =
      lastResult.httpStatus !== null &&
      lastResult.httpStatus >= 400 &&
      lastResult.httpStatus < 500

    if (lastResult.permanent || isClientError) {
      return {
        ok: false,
        httpStatus: lastResult.httpStatus,
        errorMessage: lastResult.errorMessage,
        durationMs: lastResult.durationMs,
        attemptsUsed: attempt,
      }
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAYS_MS[attempt - 1])
    }
  }

  // lastResult está garantizado no-null porque el loop corre al menos 1 vez.
  const final = lastResult as SinglePostResult
  return {
    ok: false,
    httpStatus: final.httpStatus,
    errorMessage: final.errorMessage,
    durationMs: final.durationMs,
    attemptsUsed: MAX_ATTEMPTS,
  }
}

/**
 * Test de conexión: 1 solo intento con timeout corto (5s). Usado por la UI
 * cuando el dueño aprieta "Probar conexión" — queremos feedback rápido, no
 * 33s de retries. No es un sync real: el payload va con `{ test: true }`.
 */
export async function testN8nConnection(input: PostInput): Promise<SinglePostResult> {
  return singlePost(input, TEST_TIMEOUT_MS)
}
