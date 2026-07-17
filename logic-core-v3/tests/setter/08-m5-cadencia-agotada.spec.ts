import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  registerActivity,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Sprint 2.2 — con la cadencia agotada, «No respondió» deja de ofrecerse en el
 * form de M5 y el contador de toques clampa (nunca "4 de 3"). Mismo patrón de
 * aterrizaje en m5 que el seed `scripts/dev/qa-manual-m5-m16.ts`: stage
 * EVALUADA + contactos SIN_RESPUESTA + toque vencido o cadencia agotada.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let toqueLeadId: string
let agotadaLeadId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  const vencido = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // No agotada: cadenciaInfo(2) → toquesHechos 1, próximo toque 2 — SIN_RESPUESTA
  // sigue disponible.
  const toque = await createLead(tracker, {
    setterId,
    businessName: 'M5 Toque 2.2',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
  })
  toqueLeadId = toque.id
  await registerActivity(toqueLeadId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'toque 1')
  await registerActivity(toqueLeadId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'toque 2')
  await prisma.osLead.update({ where: { id: toqueLeadId }, data: { nextFollowUpAt: vencido } })

  // Agotada: cadenciaInfo(4) → calculateNextFollowUp(4) === null — SIN_RESPUESTA
  // desaparece del form.
  const agotada = await createLead(tracker, {
    setterId,
    businessName: 'M5 Agotada 2.2',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
  })
  agotadaLeadId = agotada.id
  for (let i = 1; i <= 4; i++) {
    await registerActivity(agotadaLeadId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, `toque ${i}`)
  }
  await prisma.osLead.update({ where: { id: agotadaLeadId }, data: { nextFollowUpAt: null } })
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('B-04 · cadencia agotada: sin "No respondió", contador clampa a 3 de 3', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${agotadaLeadId}/manual/m5`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m5$/)

  await expect(firstVisible(page.getByText('No respondió — mandé un toque'))).toHaveCount(0)
  await expect(firstVisible(page.getByText('Respondió', { exact: true }))).toBeVisible()
  await expect(firstVisible(page.getByText('Postergar', { exact: true }))).toBeVisible()
  await expect(firstVisible(page.getByText('Rechazó', { exact: true }))).toBeVisible()

  // Contador: 4 toques SIN_RESPUESTA sembrados, clampado a 3 de 3 — nunca "4 de 3".
  await expect(firstVisible(page.getByText('3 de 3'))).toBeVisible()
  await expect(page.getByText('4 de 3')).toHaveCount(0)

  await expect(
    firstVisible(page.getByText('Los 3 toques ya se cumplieron — si no respondió, se enfría solo.')),
  ).toBeVisible()

  expectNoConsoleErrors(guard)
})

test('C-06 · cadencia viva: form completo con las 4 opciones', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${toqueLeadId}/manual/m5`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m5$/)

  await expect(firstVisible(page.getByText('No respondió — mandé un toque'))).toBeVisible()
  await expect(firstVisible(page.getByText('Respondió', { exact: true }))).toBeVisible()
  await expect(firstVisible(page.getByText('Postergar', { exact: true }))).toBeVisible()
  await expect(firstVisible(page.getByText('Rechazó', { exact: true }))).toBeVisible()
  await expect(firstVisible(page.getByText('1 de 3'))).toBeVisible()

  expectNoConsoleErrors(guard)
})
