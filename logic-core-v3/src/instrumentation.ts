import * as Sentry from '@sentry/nextjs'
import { scrubPii } from '@/lib/sentry/scrub-pii'

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
      debug: false,
      environment: process.env.NODE_ENV,
      beforeSend(event, hint) {
        // 1. Filtro de eventos esperados (quota LLM) — devuelve null para descartar.
        const error = hint.originalException
        if (error instanceof Error) {
          if (error.message?.includes('RESOURCE_EXHAUSTED')) return null
          if (error.message?.includes('quota exceeded')) return null
        }
        // 2. PII scrubbing OBLIGATORIO (B14.5) sobre el evento sobreviviente.
        //    Pasamos por scrubPii ANTES de devolverlo — emails/teléfonos/JWTs
        //    nunca llegan al wire de Sentry.
        return scrubPii(event, hint)
      },
      // Ignorar paths que generan ruido
      ignoreTransactions: [
        '/api/admin/chatbot/events',  // polling cada 3s
        '/_next/',
        '/api/auth/',
      ],
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
      debug: false,
      environment: process.env.NODE_ENV,
      beforeSend(event, hint) {
        return scrubPii(event, hint)
      },
    })
  }
}

// B14.5 — Hook requerido por @sentry/nextjs para capturar errores de request
// handlers (route handlers, server actions, middleware). Sin esto, los errores
// del runtime de Next no llegan a Sentry. Resuelve el warning del build:
//   "Could not find `onRequestError` hook in instrumentation file"
export const onRequestError = Sentry.captureRequestError
