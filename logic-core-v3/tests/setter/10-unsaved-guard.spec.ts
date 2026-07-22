import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, fieldControl } from '../helpers/setter-ui'
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
 * Sprint 3.2 (B-09/C-16) — el opener y la nota de seguimiento se pierden si se
 * cierra la pestaña a mitad de tipeo (mismo riesgo que resolvió A-24 para la
 * Evaluación). `useUnsavedGuard(hayCambiosSinGuardar)` intercepta
 * `beforeunload` mientras haya texto sin enviar. Se prueba disparando el evento
 * sintético (no hay forma de simular el diálogo nativo del navegador) y
 * verificando `defaultPrevented`.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let openerLeadId: string
let seguimientoLeadId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // EVALUADA + 0 contactos → aterriza en m4 (opener).
  const opener = await createLead(tracker, {
    setterId,
    businessName: 'Guard Opener 3.2',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
  })
  openerLeadId = opener.id

  // EVALUADA + opener ya mandado + toque vencido → aterriza en m5 (seguimiento),
  // mismo patrón de siembra que 08-m5-cadencia-agotada.spec.ts.
  const seguimiento = await createLead(tracker, {
    setterId,
    businessName: 'Guard Seguimiento 3.2',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
  })
  seguimientoLeadId = seguimiento.id
  await registerActivity(seguimientoLeadId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'toque 1')
  await prisma.osLead.update({
    where: { id: seguimientoLeadId },
    data: { nextFollowUpAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** Dispara un `beforeunload` sintético y devuelve si quedó `defaultPrevented`. */
async function beforeunloadPrevented(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(() => {
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    return event.defaultPrevented
  })
}

test('B-09 · opener: guard intercepta beforeunload con texto, no sin texto', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${openerLeadId}/manual/m4`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m4$/)

  const opener = firstVisible(fieldControl(page, 'Tu opener'))
  await opener.waitFor({ state: 'visible' })

  // Sin texto: nada que perder, el guard no intercepta.
  await expect.poll(() => beforeunloadPrevented(page), { message: 'sin texto: no intercepta' }).toBe(false)

  await opener.fill('Hola! Vi que no contestan los DMs y se les escapan pedidos.')
  // poll en vez de un solo chequeo: el listener se ata en un efecto, un tick
  // después del re-render — un solo dispatch inmediato puede ganarle la carrera.
  await expect
    .poll(() => beforeunloadPrevented(page), { message: 'con texto sin enviar: intercepta' })
    .toBe(true)

  // Vaciar el campo apaga el guard de nuevo (misma derivación, sin estado propio).
  await opener.fill('')
  await expect
    .poll(() => beforeunloadPrevented(page), { message: 'texto vaciado: vuelve a no interceptar' })
    .toBe(false)

  expectNoConsoleErrors(guard)
})

test('B-09 · seguimiento: guard intercepta beforeunload con nota, no sin nota', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${seguimientoLeadId}/manual/m5`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m5$/)

  // La Nota solo aparece con un resultado elegido — "Rechazó" no exige otros campos.
  await firstVisible(page.getByText('Rechazó', { exact: true })).click()
  const nota = firstVisible(fieldControl(page, 'Nota'))
  await nota.waitFor({ state: 'visible' })

  await expect.poll(() => beforeunloadPrevented(page), { message: 'sin nota: no intercepta' }).toBe(false)

  await nota.fill('Dijo que ya tiene página propia, pero quedó abierto a mirar igual.')
  await expect
    .poll(() => beforeunloadPrevented(page), { message: 'con nota sin enviar: intercepta' })
    .toBe(true)

  await nota.fill('')
  await expect
    .poll(() => beforeunloadPrevented(page), { message: 'nota vaciada: vuelve a no interceptar' })
    .toBe(false)

  expectNoConsoleErrors(guard)
})
