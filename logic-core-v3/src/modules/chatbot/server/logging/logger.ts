/**
 * Structured JSON logger for the chatbot module.
 *
 * Output goes to stdout/stderr where Netlify Logs captures it.
 * The "type" field is the event name and is used for filtering in logs.
 *
 * Never log PII (names, emails, phone numbers, message content).
 * Log identifiers (conversationId, leadId), counts, costs, error messages.
 */

import { Prisma } from '@prisma/client'

export type LogLevel = 'info' | 'warn' | 'error'

export function chatbotLog(
  event: string,
  fields: Record<string, unknown> = {},
  level: LogLevel = 'info'
): void {
  const payload = {
    type: event,
    level,
    timestamp: new Date().toISOString(),
    ...fields,
  }
  const json = JSON.stringify(payload)
  if (level === 'error') console.error(json)
  else if (level === 'warn') console.warn(json)
  else console.log(json)
}

/**
 * Debug logger — only outputs in non-production environments.
 *
 * Use for verbose tracing during development: LLM request/response bodies,
 * tool call details, conversation state transitions. Stays silent in prod.
 */
export function chatbotDebug(
  event: string,
  fields: Record<string, unknown> = {}
): void {
  if (process.env.NODE_ENV === 'production') return
  const payload = {
    type: `debug.${event}`,
    level: 'debug',
    timestamp: new Date().toISOString(),
    ...fields,
  }
  // Use console.debug so it can be filtered separately if needed
  console.debug(JSON.stringify(payload, null, 2))
}

import * as Sentry from '@sentry/nextjs'

/**
 * Records a critical error event. Same as chatbotLog with level='error'
 * but with stricter typing and explicit error object handling.
 */
export function chatbotError(
  event: string,
  error: unknown,
  fields: Record<string, unknown> = {}
): void {
  const errorInfo =
    error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : { message: String(error) }
  const payload = {
    type: `error.${event}`,
    level: 'error',
    timestamp: new Date().toISOString(),
    error: errorInfo,
    ...fields,
  }
  console.error(JSON.stringify(payload))

  // Reportar a Sentry con contexto
  Sentry.captureException(error, {
    tags: {
      module: 'chatbot',
      event_type: event,
    },
    extra: {
      ...fields,
      errorInfo,
    },
  })
}

/**
 * INFRA.1 — Diagnóstico accionable de un error de persistencia.
 * prismaCode: `.code` de PrismaClientKnownRequestError (P1017 terminated,
 *   P2024 pool timeout, P1001 connect) — el discriminador para el sprint de causa raíz.
 * causeMessage/causeCode: undici envuelve el socket error real en `error.cause`
 *   ('terminated' / 'fetch failed', code 'UND_ERR_SOCKET' / 'ECONNRESET').
 * Nunca lanza. Cero `any`: narrowing con instanceof + `in`.
 */
export function extractDbErrorInfo(error: unknown): {
  errorName: string
  errorMessage: string
  prismaCode?: string
  causeCode?: string
  causeMessage?: string
} {
  const errorName = error instanceof Error ? error.name : 'NonError'
  const errorMessage = error instanceof Error ? error.message : String(error)

  let prismaCode: string | undefined
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    prismaCode = error.code
  } else if (
    error instanceof Prisma.PrismaClientInitializationError &&
    error.errorCode
  ) {
    prismaCode = error.errorCode
  }

  let causeCode: string | undefined
  let causeMessage: string | undefined
  if (error instanceof Error && error.cause != null) {
    const cause = error.cause
    if (cause instanceof Error) {
      causeMessage = cause.message
      if (
        'code' in cause &&
        typeof (cause as { code?: unknown }).code === 'string'
      ) {
        causeCode = (cause as { code: string }).code
      }
    } else {
      causeMessage = String(cause)
    }
  }

  return { errorName, errorMessage, prismaCode, causeCode, causeMessage }
}

/**
 * INFRA.1 — Sink off-Neon GARANTIZADO para fallas de persistencia.
 * Emite UNA línea JSON estructurada a stderr (console.error → Netlify Function
 * Logs). NO toca Prisma/Neon, NO depende de Sentry, NUNCA lanza: es el rastro
 * que no puede morir con la conexión a la DB. El `.code`/`.cause` que registra
 * es lo que el sprint de causa raíz (INFRA.2) necesita para discriminar la
 * hipótesis real (terminated / pool / prepared-stmt / connect).
 */
export function logPersistFailure(
  event: string,
  error: unknown,
  fields: Record<string, unknown> = {}
): void {
  console.error(
    JSON.stringify({
      type: event,
      level: 'error',
      timestamp: new Date().toISOString(),
      ...fields,
      ...extractDbErrorInfo(error),
    })
  )
}
