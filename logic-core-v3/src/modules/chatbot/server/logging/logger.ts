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
