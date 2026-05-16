/**
 * Structured JSON logger for the chatbot module.
 *
 * Output goes to stdout/stderr where Netlify Logs captures it.
 * The "type" field is the event name and is used for filtering in logs.
 *
 * Never log PII (names, emails, phone numbers, message content).
 * Log identifiers (conversationId, leadId), counts, costs, error messages.
 */

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
