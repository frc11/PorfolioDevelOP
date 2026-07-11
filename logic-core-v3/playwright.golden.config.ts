import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

/**
 * GS.1 — Golden Suite de aislamiento multi-tenant.
 *
 * La red permanente del negocio: LOS DATOS DE UNA ORG JAMÁS SON VISIBLES NI
 * MUTABLES DESDE OTRA. Config DEDICADA (testDir/puerto propios) para que la
 * suite `@isolation` corra con un solo comando y quede lista para los candados
 * de CI (correr en cada PR que toque `_actions/`, `api/`, `lib/actions/`,
 * `modules/chatbot/server/`).
 *
 * Corre contra un BUILD DE PRODUCCIÓN (`next build` + `next start`), NO `next
 * dev`: el dev-QA tiene falsos negativos por hidratación (bitácora / CLAUDE.md).
 * `npm run start:qa:golden` levanta el build con QA_ALLOW_LOCALHOST=1 en el
 * puerto 3007 — separado del :3000 (dev), :3001 (setter) y :3002 (dev:qa) para
 * no colisionar con otras corridas/lanes en paralelo.
 *
 * Dos clases de spec conviven bajo esta config, ambas taggeadas `@isolation`:
 *   - `isolation-http.spec.ts` — ataques cross-tenant por HTTP/UI (reports,
 *     track, leads/export, ticket page, impersonation). Usan el webServer.
 *   - `isolation-queries.spec.ts` — aislamiento a nivel de la CAPA de query
 *     org-scopeada del producto (`listLeadsForDashboard`,
 *     `getConversationMessagesForOrg`), en proceso con Prisma. No usan HTTP.
 *
 * `.env.local` (AUTH_SECRET para mintear cookies de sesión/impersonation +
 * DATABASE_URL para el seed/teardown de fixtures). Prisma NO carga `.env.local`
 * solo, por eso el `dotenv.config()` inline (mismo mecanismo que setter/leados).
 */
dotenv.config({ path: '.env.local' })

const PORT = Number(process.env.GOLDEN_PORT ?? 3007)
// 127.0.0.1 (no `localhost`): el server prod escucha en `::` y Chromium resuelve
// `localhost`→`::1`, donde el socket rebota. Forzar IPv4 evita el mismatch.
const BASE_URL = `http://127.0.0.1:${PORT}`

// Con GOLDEN_EXTERNAL_SERVER=1 se asume un server ya corriendo en :3007 (útil
// para iterar sin que el webServer reinicie/mate el proceso en cada corrida).
const externalServer = process.env.GOLDEN_EXTERNAL_SERVER === '1'

export default defineConfig({
  testDir: './tests/golden',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'tests/golden/.last-run.json' }]],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Chromium honra el proxy de SISTEMA / WPAD de Windows aunque no haya
    // http_proxy en el env → puede rebotar localhost. Forzar sin proxy.
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
          command: 'npm run start:qa:golden',
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      }),
})
