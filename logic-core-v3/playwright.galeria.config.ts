import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

/**
 * Corrida M0 — CAPTURA de la galería de estados del Panel del Setter.
 *
 * Mismo terreno que `playwright.setter.config.ts` (build de PRODUCCIÓN vía
 * `npm run start:qa` en :3001, no `next dev`: el dev-QA da falsos negativos por
 * hidratación) y mismo minteo de sesión. Config aparte porque:
 *   · `testDir` propio (`tests/galeria`) → `npm run test:setter` queda intacto;
 *   · dos projects (desktop + mobile) en vez de uno — la galería necesita las
 *     dos vistas de las pantallas con navegación o layout propio;
 *   · esto NO es una suite de regresión: no afirma, fotografía. Vive fuera de
 *     `tests/setter` para que nadie la corra creyendo que verifica algo.
 *
 * Requiere el sembrado previo: `npx tsx scripts/dev/m0-galeria-seed.ts`.
 */
dotenv.config({ path: '.env.local' })

const PORT = Number(process.env.SETTER_PORT ?? 3001)
// IPv4 explícito: el server prod escucha en `::` y Chromium resuelve
// `localhost`→`::1`, donde el socket rebota.
const BASE_URL = `http://127.0.0.1:${PORT}`

const externalServer = process.env.SETTER_EXTERNAL_SERVER === '1'

export default defineConfig({
  testDir: './tests/galeria',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 90_000,
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
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  ...(externalServer
    ? {}
    : {
        webServer: {
          command: 'npm run start:qa',
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 300_000,
        },
      }),
})
