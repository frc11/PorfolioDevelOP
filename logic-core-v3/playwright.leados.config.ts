import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

/**
 * Suite de INTEGRACIÓN de la lógica de LeadOS (gates + aislamiento) contra la DB
 * real — Sprint 5.3. La brecha que solo la DB alcanza, hecha regresión durable:
 * cosecha del harness manual `scripts/b2-verify-dossier.ts` (gate del brief,
 * append de rechazos, re-loop) + negativos finos (rechazo de envío-demo,
 * anti-bypass del self-check, alta/importación A.1/A.2).
 *
 * Por qué un config aparte (no el de setter, no el e2e):
 *   - Estos tests NO tocan el browser ni el server Next: llaman la lógica pura +
 *     Prisma directo (mismo patrón in-process que 06-claim-atomico). Sin
 *     `webServer` → no requieren `next build`/`start:qa`, corren solo con la DB.
 *   - El de setter arrastra `start:qa` (build de prod) para sus tests de browser;
 *     el e2e (`tests/e2e`) también. Este queda liviano y CI-barato: `prisma
 *     migrate deploy` sobre la DB de test dedicada + `npm run test:leados`.
 *   - Cada spec se auto-provisiona (crea su propio setter namespaced y limpia por
 *     id exacto) → no depende de personas seedeadas: corre igual en Neon dev
 *     (.env.local) que sobre una DB de test fresca en CI.
 *
 * Aislado de `tests/integration` (que SÍ necesita server, HTTP a /api/cron): este
 * testDir es `tests/leados`, propio.
 */
dotenv.config({ path: '.env.local' })

export default defineConfig({
  testDir: './tests/leados',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'tests/leados/.last-run.json' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
})
