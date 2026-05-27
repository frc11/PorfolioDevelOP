import * as Sentry from '@sentry/nextjs'
import { scrubPii } from '@/lib/sentry/scrub-pii'

// NOTA (B14.5): legacy del SDK pre-instrumentation. Ver sentry.server.config.ts.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    return scrubPii(event, hint)
  },
})
