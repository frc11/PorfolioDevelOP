import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

/**
 * Corrida M0 — CAPTURA de la galería de estados del Panel del Setter.
 *
 * Mismo terreno que `playwright.setter.config.ts` (build de PRODUCCIÓN vía
 * `npm run start:galeria`, no `next dev`: el dev-QA da falsos negativos por
 * hidratación) y mismo minteo de sesión. Config aparte porque:
 *   · `testDir` propio (`tests/galeria`) → `npm run test:setter` queda intacto;
 *   · dos projects (desktop + mobile) en vez de uno — la galería necesita las
 *     dos vistas de las pantallas con navegación o layout propio;
 *   · esto NO es una suite de regresión: no afirma, fotografía. Vive fuera de
 *     `tests/setter` para que nadie la corra creyendo que verifica algo.
 *
 * ── Por qué directorio de build PROPIO y puerto propio (corrida G) ───────────
 * Hasta la corrida G esta config apuntaba a `npm run start:qa` (que buildea en
 * `.next/`, el MISMO directorio que usa el `next dev`/`next start` del checkout)
 * y además reutilizaba a ciegas cualquier server que encontrara en el puerto.
 * Las dos cosas ya se habían pagado en la suite del setter:
 *   · compartir `.next/` con un server vivo al lado hace que la corrida lea
 *     artefactos mezclados (estáticos con el Content-Type equivocado, 500s) y le
 *     reconstruya el build por debajo al otro frente — Next mismo toma un lock en
 *     `<distDir>/lock` porque dos procesos ahí "can mangle the state of the
 *     directory". Para una galería el daño es peor que para una suite: no falla,
 *     FOTOGRAFÍA lo roto, y las fotos entran al manual como si fueran el producto;
 *   · `reuseExistingServer: !CI` significa que un server huérfano —o el de otro
 *     frente— servía las capturas desde un build viejo, en silencio.
 * Por eso: `start:galeria` buildea y sirve desde `.next-galeria/` (E2E_DIST_DIR,
 * ver next.config.ts) en :3004, y `reuseExistingServer: false`. Para reusar a
 * propósito un server ya levantado está `SETTER_EXTERNAL_SERVER=1` (opt-in
 * explícito de una persona, distinto de reutilizar a ciegas).
 *
 * Requiere el sembrado previo: `npx tsx scripts/dev/m0-galeria-seed.ts`.
 */
dotenv.config({ path: '.env.local' })

const PORT = Number(process.env.GALERIA_PORT ?? 3004)
// IPv4 explícito: el server prod escucha en `::` y Chromium resuelve
// `localhost`→`::1`, donde el socket rebota.
const BASE_URL = `http://127.0.0.1:${PORT}`

// `tests/helpers/setter-auth.ts` arma su BASE_URL con SETTER_PORT (default 3001)
// para mintear la cookie de sesión. El puerto no entra en el cookie (los cookies
// no distinguen puerto, solo host) pero se alinea igual para que nada quede
// apuntando a un server que en esta corrida no existe.
process.env.SETTER_PORT = String(PORT)

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
          command: 'npm run start:galeria',
          url: BASE_URL,
          // NO reutilizar a ciegas (ver el bloque de arriba): que levante el
          // suyo, o que falle ruidosamente. Reuso a propósito = SETTER_EXTERNAL_SERVER=1.
          reuseExistingServer: false,
          timeout: 600_000,
        },
      }),
})
