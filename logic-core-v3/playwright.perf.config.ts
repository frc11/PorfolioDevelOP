import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

/**
 * P28 — El instrumento de latencia del recorrido. NO es una suite de regresión:
 * mide y escribe una tabla (`tests/perf/.ultima-medicion.json`). Corre a mano,
 * antes y después de cada cambio, para que el veredicto de una optimización sea
 * un número y no una impresión.
 *
 * Por qué config y build PROPIOS (`.next-perf`, puerto 3005): el recurso
 * compartido entre suites de browser en este repo NO es el puerto, es el
 * DIRECTORIO de build (documentado en `playwright.setter.config.ts`). Con el
 * mismo distDir, medir acá le reconstruye `.next-setter/` a la suite del setter
 * por debajo y los números salen contaminados en silencio.
 *
 * `workers: 1` y `fullyParallel: false` no son cosmética: dos pestañas midiendo
 * a la vez comparten el CPU del server y la latencia deja de ser la de una
 * acción.
 */
dotenv.config({ path: '.env.local' })

const PORT = Number(process.env.PERF_PORT ?? 3005)
// 127.0.0.1 (no `localhost`): el server prod escucha en `::` y Chromium resuelve
// `localhost`→`::1`, donde el socket rebota aunque curl por IPv4 ande.
const BASE_URL = `http://127.0.0.1:${PORT}`

// Con PERF_EXTERNAL_SERVER=1 se asume un server ya corriendo en el puerto: medir
// tres pasadas × diecisiete acciones son varias corridas seguidas, y levantar y
// bajar el server en cada una mete el arranque en frío adentro de la medición
// (y el server frío es OTRA condición — ver P26).
const externalServer = process.env.PERF_EXTERNAL_SERVER === '1'

export default defineConfig({
  testDir: './tests/perf',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 15 * 60_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: BASE_URL,
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
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
          command: 'npm run start:perf',
          url: BASE_URL,
          reuseExistingServer: false,
          timeout: 300_000,
        },
      }),
})
