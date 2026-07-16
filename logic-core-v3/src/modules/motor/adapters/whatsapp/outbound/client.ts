/**
 * Cliente HTTP de SALIDA contra 360dialog (B1-S2).
 *
 * 360dialog expone la Messaging API estilo Cloud API de Meta; la autenticación
 * es por API key POR NÚMERO en el header `D360-API-KEY`. Este cliente:
 *   - arma el body de texto o de plantilla y hace el POST a `/messages`,
 *   - usa la API key en CLARO recibida del caller (decryptada en memoria justo
 *     antes) SOLO como header — nunca la loguea ni la mete en un error,
 *   - aplica timeout por intento (AbortController) y reintento con backoff
 *     EXCLUSIVAMENTE para fallos de red / timeout / 5xx; JAMÁS para 4xx,
 *   - mapea el error del provider a un tipo cerrado (rate limit, ventana
 *     cerrada, plantilla no aprobada, destinatario inválido, auth, …),
 *   - devuelve el `wamid` en el camino feliz (lo persiste el servicio en
 *     MotorMessage.providerMessageId — la clave que S1 reconcilia por status).
 *
 * Estructura calcada de `src/modules/chatbot/server/crm/postToN8n.ts` (retry
 * in-flight, no-retry para 4xx, logs sin secretos).
 */

/** Contenido a despachar: texto libre o plantilla aprobada. */
export interface ProviderTextContent {
  readonly kind: 'text'
  readonly body: string
}
export interface ProviderTemplateContent {
  readonly kind: 'template'
  readonly name: string
  readonly language: string
  /** Parámetros posicionales del body de la plantilla ({{1}}, {{2}}…). */
  readonly bodyParameters?: readonly string[]
}
export type ProviderContent = ProviderTextContent | ProviderTemplateContent

export interface SendViaProviderInput {
  /** API key de 360dialog en CLARO (el caller la decrypta en memoria). */
  readonly apiKey: string
  /**
   * Destinatario: teléfono (formato Cloud API, sin '+') o BSUID si el contacto
   * solo tiene BSUID. Nota: las plantillas de AUTENTICACIÓN de Meta no aceptan
   * BSUID — irrelevante en este motor (solo utility/service), se documenta acá.
   */
  readonly to: string
  readonly content: ProviderContent
}

export type OutboundErrorKind =
  | 'rate_limit'
  | 'window_closed'
  | 'template_not_approved'
  | 'invalid_recipient'
  | 'auth'
  | 'provider_error'
  | 'network'
  | 'timeout'

export interface OutboundError {
  readonly kind: OutboundErrorKind
  readonly httpStatus: number | null
  readonly providerCode: number | null
  /** Detalle saneado y truncado. NUNCA contiene la API key. */
  readonly detail: string
}

export type SendViaProviderResult =
  | { readonly ok: true; readonly wamid: string }
  | { readonly ok: false; readonly error: OutboundError }

/** Logger inyectable; el default es no-op (B2 cablea el real). Sin PII/secretos. */
export interface OutboundLogger {
  info(event: string, data?: Record<string, unknown>): void
  warn(event: string, data?: Record<string, unknown>): void
  error(event: string, data?: Record<string, unknown>): void
}

const NOOP_LOGGER: OutboundLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
}

export interface OutboundDeps {
  /** fetch inyectable (los tests mockean el HTTP del provider). */
  fetch?: typeof fetch
  logger?: OutboundLogger
  /** Base URL del BSP; default env MOTOR_D360_BASE_URL o el host de prod. */
  baseUrl?: string
  /** Timeout por intento (ms). */
  timeoutMs?: number
  /** Backoff entre intentos (ms); su longitud define los reintentos. */
  retryDelaysMs?: readonly number[]
}

const DEFAULT_BASE_URL = 'https://waba-v2.360dialog.io'
const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_RETRY_DELAYS_MS = [1_000, 3_000] as const
const DETAIL_MAX = 300

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sanitize(text: string): string {
  return text.replace(/[\r\n\t]+/g, ' ').slice(0, DETAIL_MAX).trim()
}

function buildMessageBody(input: SendViaProviderInput): Record<string, unknown> {
  if (input.content.kind === 'text') {
    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: input.to,
      type: 'text',
      text: { body: input.content.body, preview_url: false },
    }
  }
  const params = input.content.bodyParameters ?? []
  const components =
    params.length > 0
      ? [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }]
      : undefined
  return {
    messaging_product: 'whatsapp',
    to: input.to,
    type: 'template',
    template: {
      name: input.content.name,
      language: { code: input.content.language },
      ...(components ? { components } : {}),
    },
  }
}

/** Códigos de error de Meta/Cloud API → tipo cerrado. Pragmático y documentado. */
function mapProviderCode(httpStatus: number, code: number | null): OutboundErrorKind {
  if (httpStatus === 401 || httpStatus === 403 || code === 0 || code === 190) return 'auth'
  if (httpStatus === 429 || code === 130429 || code === 131056 || code === 131048) return 'rate_limit'
  // 131047: pasaron >24h desde la última respuesta del usuario (ventana cerrada).
  if (code === 131047 || code === 131051) return 'window_closed'
  // 132xxx: familia de errores de plantilla (no existe, params, pausada, etc.).
  if (code !== null && code >= 132000 && code <= 132999) return 'template_not_approved'
  // Destinatario no entregable / fuera de WhatsApp / no permitido.
  if (code === 131008 || code === 131026 || code === 131030 || code === 1013) return 'invalid_recipient'
  return 'provider_error'
}

interface ParsedError {
  code: number | null
  message: string
}

function parseProviderError(raw: string): ParsedError {
  try {
    const parsed = JSON.parse(raw) as { error?: { code?: number; message?: string; error_data?: { details?: string } } }
    const err = parsed.error
    if (err) {
      const message = err.error_data?.details ?? err.message ?? raw
      return { code: typeof err.code === 'number' ? err.code : null, message }
    }
  } catch {
    // body no-JSON: se usa crudo (saneado) como detalle.
  }
  return { code: null, message: raw }
}

function extractWamid(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as { messages?: Array<{ id?: string }> }
    const id = parsed.messages?.[0]?.id
    return typeof id === 'string' && id.length > 0 ? id : null
  } catch {
    return null
  }
}

type Attempt =
  | { outcome: 'ok'; wamid: string }
  | { outcome: 'retryable'; error: OutboundError }
  | { outcome: 'terminal'; error: OutboundError }

async function attemptSend(
  url: string,
  body: Record<string, unknown>,
  apiKey: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<Attempt> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // API key en claro SOLO acá, como header. Nunca se loguea.
        'D360-API-KEY': apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (response.ok) {
      const text = await response.text().catch(() => '')
      const wamid = extractWamid(text)
      if (wamid !== null) return { outcome: 'ok', wamid }
      // 2xx con shape inesperado: no reintentar (el provider aceptó pero no
      // devolvió wamid — reintentar duplicaría el envío).
      return {
        outcome: 'terminal',
        error: { kind: 'provider_error', httpStatus: response.status, providerCode: null, detail: 'respuesta 2xx sin wamid' },
      }
    }

    const raw = await response.text().catch(() => '')
    if (response.status >= 500) {
      return {
        outcome: 'retryable',
        error: { kind: 'provider_error', httpStatus: response.status, providerCode: null, detail: sanitize(`5xx: ${raw}`) },
      }
    }
    // 4xx: error del provider → mapeo tipado, sin reintento.
    const parsed = parseProviderError(raw)
    return {
      outcome: 'terminal',
      error: {
        kind: mapProviderCode(response.status, parsed.code),
        httpStatus: response.status,
        providerCode: parsed.code,
        detail: sanitize(parsed.message),
      },
    }
  } catch (error) {
    // fetch rechazó: red o timeout (AbortError). Ambos reintentables.
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    return {
      outcome: 'retryable',
      error: {
        kind: isTimeout ? 'timeout' : 'network',
        httpStatus: null,
        providerCode: null,
        detail: isTimeout ? 'timeout' : sanitize(error instanceof Error ? error.message : String(error)),
      },
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Despacha un mensaje contra 360dialog con reintento in-flight para
 * red/timeout/5xx. Devuelve el wamid o un error tipado.
 */
export async function sendViaProvider(
  input: SendViaProviderInput,
  deps: OutboundDeps = {},
): Promise<SendViaProviderResult> {
  const fetchImpl = deps.fetch ?? fetch
  const logger = deps.logger ?? NOOP_LOGGER
  const baseUrl = deps.baseUrl ?? process.env.MOTOR_D360_BASE_URL ?? DEFAULT_BASE_URL
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const retryDelays = deps.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS
  const maxAttempts = retryDelays.length + 1

  const url = `${baseUrl.replace(/\/+$/, '')}/messages`
  const body = buildMessageBody(input)

  let last: Attempt | null = null
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    logger.info('motor.outbound.dispatch', { attempt, type: input.content.kind })
    last = await attemptSend(url, body, input.apiKey, fetchImpl, timeoutMs)

    if (last.outcome === 'ok') return { ok: true, wamid: last.wamid }
    if (last.outcome === 'terminal') {
      logger.warn('motor.outbound.failed', {
        kind: last.error.kind,
        httpStatus: last.error.httpStatus,
        providerCode: last.error.providerCode,
      })
      return { ok: false, error: last.error }
    }
    // retryable
    if (attempt < maxAttempts) {
      logger.warn('motor.outbound.retry', { attempt, kind: last.error.kind, httpStatus: last.error.httpStatus })
      await sleep(retryDelays[attempt - 1])
    }
  }

  const error = (last as { error: OutboundError }).error
  logger.error('motor.outbound.exhausted', { kind: error.kind, httpStatus: error.httpStatus })
  return { ok: false, error }
}
