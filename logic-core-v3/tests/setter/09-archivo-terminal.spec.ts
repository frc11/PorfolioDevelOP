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
 * Sprint 2.3 — un lead terminal por STATUS (PERDIDO) deriva a la vista de
 * ARCHIVO, no a trabajo. Se siembra un PERDIDO en stage EVALUADA con opener
 * mandado y toque vencido: SIN la rama terminal, la derivación por stage lo
 * mandaba a m5 (registrar un toque a un negocio muerto). Con el fix, aterriza
 * en /manual/archivo, read-only, sin form de toque.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let perdidoLeadId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // Stage vivo (EVALUADA) + opener + toque vencido = el caso que ANTES caía en
  // m5. El status PERDIDO lo intercepta antes de derivar por stage.
  const perdido = await createLead(tracker, {
    setterId,
    businessName: 'Archivo Perdido 2.3',
    stage: 'EVALUADA',
    status: 'PERDIDO',
  })
  perdidoLeadId = perdido.id
  await registerActivity(perdidoLeadId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')
  await prisma.osLead.update({
    where: { id: perdidoLeadId },
    data: { nextFollowUpAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('B-02 · PERDIDO deriva a archivo read-only, no a m5', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  // El índice re-deriva la posición y aterriza en la actual: archivo, no m5.
  await page.goto(`/setter/leads/${perdidoLeadId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/archivo$/)

  // La vista de archivo: causa visible + título + CTA único al home.
  await expect(firstVisible(page.getByText('Archivo — Perdido'))).toBeVisible()
  await expect(firstVisible(page.getByText('Este negocio quedó cerrado'))).toBeVisible()
  await expect(firstVisible(page.getByText('Seguí con el próximo'))).toBeVisible()

  // Cero form de toque: ninguna opción del registro de M5 asoma en el archivo.
  await expect(page.getByText('No respondió — mandé un toque')).toHaveCount(0)
  await expect(page.getByText('Postergar', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Rechazó', { exact: true })).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('B-02 · el guard rebota m5 de un PERDIDO a la vista de archivo', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  // m5 no es alcanzable para un terminal: la guardia del server redirige a la
  // actual (archivo), no se renderiza ni como fachada.
  await page.goto(`/setter/leads/${perdidoLeadId}/manual/m5`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/archivo$/)

  expectNoConsoleErrors(guard)
})
