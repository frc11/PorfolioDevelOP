import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// Auditoría perceptual "setter novato" — recorrido completo lead-asignado→
// agendado con screenshots reales. Corre contra el MISMO build de producción
// que el smoke del setter (next start:qa en :3001), reusando puerto y
// mecánica de auth — ver playwright.setter.config.ts para el razonamiento
// completo (IPv4 127.0.0.1, cookie __Secure- minteada). testDir propio para
// no mezclar este script de captura con la suite de asserts de test:setter.

dotenv.config({ path: '.env.local' })

const PORT = Number(process.env.SETTER_PORT ?? 3001)
const BASE_URL = `http://127.0.0.1:${PORT}`
const externalServer = process.env.SETTER_EXTERNAL_SERVER === '1'

export default defineConfig({
  testDir: './tests/qa-walkthrough',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 300_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: BASE_URL,
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'off', // las capturas de la auditoría son manuales (page.screenshot con nombre/orden propio)
    launchOptions: { args: ['--no-proxy-server', '--proxy-bypass-list=*'] },
  },
  projects: [
    {
      // El shell del setter es `fixed inset-0` con scroll INTERNO en <main> (no en
      // el body) — `page.screenshot({fullPage:true})` solo captura el viewport
      // fijo, no el contenido scrolleado. Viewport bien alto = todo el contenido
      // de cada paso entra sin scroll interno, así el screenshot lo muestra entero.
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 5000 } },
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
