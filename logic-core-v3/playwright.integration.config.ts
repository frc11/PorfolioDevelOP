import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

/**
 * D6 — Config DEDICADA para `tests/integration/` (Prisma directo contra la
 * Neon real, sin browser). Antes de esto no había forma estándar de correr
 * estos specs: `playwright.config.ts` (e2e) tiene `testDir: tests/e2e` → un
 * spec de `tests/integration/` daba "No tests found"; y aunque se apuntara a
 * mano, Playwright no carga `.env.local` → `PrismaClientInitializationError:
 * Environment variable not found: DATABASE_URL`. Resultado: tests fantasma
 * (existen, nunca corrieron — ej. `client-monthly-report.spec.ts` de P2.C).
 *
 * Mismo mecanismo de carga que `playwright.setter.config.ts` /
 * `playwright.leados.config.ts`: `dotenv.config()` inline acá arriba (no un
 * globalSetup separado) para que DATABASE_URL esté disponible antes de que
 * cada spec instancie su propio PrismaClient.
 *
 * Sin `webServer` (como leados, a diferencia de setter/e2e): los specs de esta
 * carpeta llaman lógica server-side + Prisma EN PROCESO — no HTTP — así que no
 * necesitan `next build`/`start:qa` levantado. Liviano a propósito.
 *
 * EXCEPCIÓN CONOCIDA (no resuelta acá — ver bitácora D6): `alerts-detector.spec.ts`
 * (R22) rompe este perfil — pega HTTP real a `/api/cron/detect-bot-issues` y
 * `/api/admin/alerts/trigger-detector` con rutas relativas, así que necesita un
 * `baseURL` + servidor Next corriendo que esta config NO provee (agregarlo
 * forzaría build+start solo para 1 de 4 specs). Bajo esta config ese spec falla
 * al no poder resolver la URL relativa sin `baseURL` — es un fallo esperado,
 * no un bug de esta config.
 *
 * Datos: cada spec crea sus propias filas con un TAG único (ej.
 * "P2C-MONTHLYREPORT-TEST") y las borra en `finally` — no son estrictamente
 * read-only (escriben y limpian), pero SÍ son auto-contenidos: no tocan datos
 * reales de negocio. Si un spec futuro necesita escribir SIN este patrón de
 * auto-limpieza, resolver aislamiento de DB (test DB dedicada) ANTES — no
 * asumir que la Neon compartida tolera cualquier escritura.
 */
dotenv.config({ path: '.env.local' })

export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'tests/integration/.last-run.json' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
})
