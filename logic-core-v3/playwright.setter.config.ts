import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// El smoke del setter corre contra un BUILD DE PRODUCCIÓN (next build + next
// start), NO next dev: el dev-QA tiene falsos negativos por hidratación
// (documentado en CLAUDE.md / bitácora). `npm run start:setter` levanta el build
// con QA_ALLOW_LOCALHOST=1 en el puerto 3003.
//
// Aislado del playwright.config.ts principal: testDir propio (tests/setter) y
// puerto propio, así `npm run test:e2e` (suite existente) queda intacta y esta
// suite arranca SIEMPRE con el guard QA habilitado.
//
// ── Por qué directorio de build PROPIO (`start:setter`, no `start:qa`) ────────
// El recurso compartido entre esta suite y el `next dev` del checkout NO es el
// puerto: es el directorio de build. Con `start:qa` (que buildea en `.next/`,
// el mismo que usa `next dev`) y un dev server vivo al lado pasaban las dos
// cosas a la vez: (a) esta suite leía artefactos mezclados — estáticos con el
// Content-Type equivocado y 500s, números contaminados — y (b) le reconstruía
// `.next/` por debajo al otro frente, rompiéndole el trabajo. Por eso
// `start:setter` buildea y sirve desde `.next-setter/` (E2E_DIST_DIR, ver
// next.config.ts) en su propio puerto.
//
// Si alguien lo vuelve a unificar (apunta el webServer a `start:qa` de nuevo, o
// saca E2E_DIST_DIR): vuelven los dos síntomas, y vuelven en silencio — se leen
// como bugs de producto, no como colisión de entorno, y la suite deja de poder
// correr sin parar el checkout entero.

// El secreto + la URL de la DB viven en .env.local (no hay .env). El minteo de
// cookie de sesión del 2º setter (aislamiento A↔B) necesita AUTH_SECRET en el
// proceso de test; Prisma para el seed/teardown necesita DATABASE_URL.
dotenv.config({ path: '.env.local' })

const PORT = Number(process.env.SETTER_PORT ?? 3003)
// 127.0.0.1 (no `localhost`): el server prod escucha en `::` y Chromium resuelve
// `localhost`→`::1`, donde el socket rebota (ERR_CONNECTION_REFUSED) aunque curl
// por IPv4 ande. Forzar IPv4 evita el mismatch.
const BASE_URL = `http://127.0.0.1:${PORT}`

// Por defecto Playwright levanta y baja el server (start:setter). Con
// SETTER_EXTERNAL_SERVER=1 se asume un server ya corriendo en el puerto (útil
// para iterar sin que el ciclo de webServer reinicie/mate el proceso en cada
// corrida). Es un opt-in EXPLÍCITO de una persona — distinto de reutilizar a
// ciegas lo que haya en el puerto (ver `reuseExistingServer` abajo).
const externalServer = process.env.SETTER_EXTERNAL_SERVER === '1'

export default defineConfig({
  testDir: './tests/setter',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'tests/setter/.last-run.json' }]],
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
          command: 'npm run start:setter',
          url: BASE_URL,
          // NO reutilizar a ciegas: un server huérfano en este puerto hacía que
          // las 60 pruebas corrieran contra un build viejo, en silencio y sin
          // aviso en el reporte. Que levante el suyo o que falle ruidosamente.
          // Para reutilizar a propósito está SETTER_EXTERNAL_SERVER=1.
          reuseExistingServer: false,
          timeout: 300_000,
        },
      }),
})
