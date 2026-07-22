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
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let briefLeadId: string
let construccionLeadId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // BRIEF: el dossier todavía no arrancó la construcción — m7 es alcanzable
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

  await page.goto(`/setter/leads/${briefLeadId}/manual/m7`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m7$/)

  const tilde = firstVisible(page.locator('button[aria-pressed]'))
  await expect(tilde).toBeVisible()
  await expect(tilde).toBeDisabled()
  await expect(tilde).toContainText('Primero arrancá la construcción — el botón está arriba.')

  // El CTA «Arrancar construcción» sigue arriba, sin bloquear nada más de la pantalla.
  await expect(firstVisible(page.getByRole('button', { name: 'Arrancar construcción' }))).toBeVisible()

  expectNoConsoleErrors(guard)
})

test('C-08 · CONSTRUCCION: el tilde funciona normal', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${construccionLeadId}/manual/m7`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m7$/)

  const tilde = firstVisible(page.locator('button[aria-pressed]'))
  await expect(tilde).toBeVisible()
  await expect(tilde).toBeEnabled()
  await expect(tilde).toContainText('Marcá esta fase cuando la termines')

  await tilde.click()
  await expect(tilde).toHaveAttribute('aria-pressed', 'true')
  await expect(tilde).toContainText('Fase marcada como hecha')

  expectNoConsoleErrors(guard)
})
