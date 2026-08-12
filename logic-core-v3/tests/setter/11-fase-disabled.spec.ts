import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import { getSetterQa, createLead, newTracker, teardown, disconnect, type SmokeTracker } from '../helpers/setter-db'

/**
 * Sprint 3.3 (B-07/C-08) — el tilde de auto-reporte de una fase de Construcción
 * (`FaseAutoReporte`) deja de ofrecerse cuando el server lo va a rechazar
 * (`saveOwnedProgreso`, dossier.ts: solo con `stage === 'CONSTRUCCION'`).
 * Presentación pura — el guard del server no se toca; esto solo evita el
 * viaje redondo con un toast de error. §6-3 intacto: el tilde sigue sin ser
 * un gate, la navegación entre fases sigue libre.
 *
 * P6-B — las seis pantallas de fase se agruparon en dos (mc1/mc2). Cambió el
 * DESTINO (m7 → mc1) y se sumaron dos garantías del colapso a los mismos tests,
 * sin agregar casos: que los TRES tildes de la pantalla siguen existiendo (los
 * seis se conservan, 3+3 — no se fusionaron en dos) y que una dirección vieja
 * (m9) redirige a la pantalla actual en vez de romper.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let briefLeadId: string
let construccionLeadId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // BRIEF: el dossier todavía no arrancó la construcción — mc1 es alcanzable
  // (navegación libre §6-3) pero el server rechazaría el guardado del tilde.
  const brief = await createLead(tracker, {
    setterId,
    businessName: 'Fase Disabled BRIEF 3.3',
    stage: 'BRIEF',
  })
  briefLeadId = brief.id

  // CONSTRUCCION: el tilde funciona normal.
  const construccion = await createLead(tracker, {
    setterId,
    businessName: 'Fase Disabled CONSTRUCCION 3.3',
    stage: 'CONSTRUCCION',
  })
  construccionLeadId = construccion.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('B-07 · BRIEF: el tilde está disabled y muestra el motivo', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${briefLeadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  const tilde = firstVisible(page.locator('main section[aria-label="Registro"] button[aria-pressed]'))
  await expect(tilde).toBeVisible()
  await expect(tilde).toBeDisabled()
  await expect(tilde).toContainText('Primero arrancá la construcción — el botón está arriba.')

  // P6-B: los tres tildes de la pantalla, uno por fase — no un tilde fusionado.
  await expect(page.locator('main section[aria-label="Registro"] button[aria-pressed]')).toHaveCount(3)

  // El CTA «Arrancar construcción» sigue arriba, sin bloquear nada más de la pantalla.
  await expect(firstVisible(page.getByRole('button', { name: 'Arrancar construcción' }))).toBeVisible()

  // P6-B: una dirección vieja (m9, retirada del registro) no rompe — la guardia
  // del server la rescata a la pantalla actual (mismo mecanismo que el m3 de P4).
  await page.goto(`/setter/leads/${briefLeadId}/manual/m9`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  expectNoConsoleErrors(guard)
})

test('C-08 · CONSTRUCCION: el tilde funciona normal', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${construccionLeadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  // P6-B: los tres tildes de la pantalla, cada uno 1↔1 con su fase.
  const tildes = page.locator('main section[aria-label="Registro"] button[aria-pressed]')
  await expect(tildes).toHaveCount(3)

  const tilde = firstVisible(tildes)
  await expect(tilde).toBeVisible()
  await expect(tilde).toBeEnabled()
  await expect(tilde).toContainText('Marcá esta fase cuando la termines')

  await tilde.click()
  await expect(tilde).toHaveAttribute('aria-pressed', 'true')
  await expect(tilde).toContainText('Fase marcada como hecha')

  // Tildar UNA fase no arrastra a las otras dos: el progreso sigue siendo por fase.
  await expect(tildes.nth(1)).toHaveAttribute('aria-pressed', 'false')
  await expect(tildes.nth(2)).toHaveAttribute('aria-pressed', 'false')

  expectNoConsoleErrors(guard)
})
