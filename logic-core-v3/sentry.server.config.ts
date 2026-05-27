import * as Sentry from '@sentry/nextjs'
import { scrubPii } from '@/lib/sentry/scrub-pii'

// NOTA (B14.5): este archivo es legacy del SDK pre-instrumentation. La config
// oficial vive en src/instrumentation.ts. Lo mantenemos por compatibilidad
// con `withSentryConfig` que puede cargarlo, y le ponemos el mismo scrub para
// que NINGÚN init mande PII sin filtrar.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    return scrubPii(event, hint)
  },
})
