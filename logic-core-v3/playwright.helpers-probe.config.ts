import { defineConfig, devices } from '@playwright/test'

/**
 * La prueba de la prueba: los HELPERS compartidos sometidos al mismo sabotaje
 * que el resto de la suite le aplica al producto.
 *
 * Por qué existe (sprint HELPERS QUE PRUEBAN):
 *   `expectToast` prometía verificar un aviso y afirmaba sobre la PÁGINA ENTERA.
 *   Una copy que contuviera la frase lo satisfacía antes del click — verde sin
 *   que la acción ocurriera. Se descubrió por accidente, y el precio ya lo pagó
 *   el producto: hay copy escrita en subjuntivo a propósito para no chocar con
 *   el helper (`m-construccion.tsx`). Un helper roto no falla una prueba: falla
 *   todas las que lo usan, en silencio.
 *
 * Por qué config PROPIA, sin webServer y sin DB:
 *   Cada caso arma su DOM con `page.setContent()`. No hay Next, no hay Prisma,
 *   no hay seed ni teardown — así que corre en cualquier lado (CI sin base
 *   incluida) y no puede contaminar la Neon dev compartida. El sujeto acá es el
 *   helper, no la pantalla: aislarlo del producto es el punto, no una limitación.
 *
 * Qué afirma cada caso, siempre de a pares:
 *   CONDUCTA — la conducta ocurrió  → el helper DEBE pasar.
 *   SABOTAJE — la conducta NO ocurrió, pero el señuelo está en la página
 *              → el helper DEBE fallar.
 *   Sin el par, un helper que falla siempre también estaría "verde".
 */
export default defineConfig({
  testDir: './tests/helpers-probe',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'tests/helpers-probe/.last-run.json' }]],
  timeout: 60_000,
  expect: { timeout: 5_000 },
  use: {
    actionTimeout: 5_000,
    launchOptions: { args: ['--no-proxy-server', '--proxy-bypass-list=*'] },
  },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }],
})
