import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  debug: false,
  // Migrated from sentry.client.config.ts (B1.2, pre-Turbopack): preserve session replays on error
  // and environment label that the old config provided. Session sampling stays at 0 (only on error).
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,
  environment: process.env.NODE_ENV,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
