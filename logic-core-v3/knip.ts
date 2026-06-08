import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  $schema: 'https://unpkg.com/knip@6/schema.json',

  // Next.js plugin (auto-detected) handles: app/**/page|layout|loading|error|not-found|route,
  // middleware, next.config.ts, instrumentation.ts, sentry.*.config.ts, src/proxy.ts
  // Playwright plugin handles: playwright.config.ts, tests/**
  // Extra entries not auto-detected by any plugin:
  entry: [
    'src/auth.ts',
    'src/auth.config.ts',
    'prisma/seed*.ts',
    'prisma/migrate*.ts',
  ],

  project: [
    'src/**/*.{ts,tsx}',
    'prisma/seed*.ts',
    'prisma/migrate*.ts',
    'tests/**/*.{ts,tsx}',
  ],
}

export default config
