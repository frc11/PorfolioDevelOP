import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// Config aislada para corridas de QA-persona (recorridos manuales tipo
// "setter novato", con screenshots reales guardados en docs/proof-screenshots).
// Copia el arranque de playwright.setter.config.ts (mismo build de producción,
// mismo puerto :3001) pero con su PROPIO testDir — así estas corridas nunca se
// mezclan con la suite de regresión `tests/setter` (que trackea conteos exactos
// de pass/fail en la bitácora) ni con `tests/leados`.

dotenv.config({ path: '.env.local' })

const PORT = Number(process.env.SETTER_PORT ?? 3001)
const BASE_URL = `http://127.0.0.1:${PORT}`
const externalServer = process.env.SETTER_EXTERNAL_SERVER === '1'

export default defineConfig({
  testDir: './tests/qa-persona',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 180_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'off',
    screenshot: 'off',
    launchOptions: { args: ['--no-proxy-server', '--proxy-bypass-list=*'] },
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  ...(externalServer
    ? {}
    : {
        webServer: {
          command: 'npm run start:qa',
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
})
