import * as Sentry from '@sentry/nextjs'

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
      debug: false,
      beforeSend(event, hint) {
        const error = hint.originalException
        // Ignorar errores esperados de quota agotada de LLM
        if (error instanceof Error) {
          if (error.message?.includes('RESOURCE_EXHAUSTED')) return null
          if (error.message?.includes('quota exceeded')) return null
        }
        return event
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
    })
  }
}
