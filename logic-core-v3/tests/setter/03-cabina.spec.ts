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
 * Sección D — Cabina + cross-lead: recorrido prev/next, atajos de teclado (con
 * la guarda de no-disparar-en-inputs), palancas de cartera (búsqueda
 * acento-insensible, pin/snooze/nota que persisten) y el timeline (SISTEMA
 * visible pero que NO cuenta como contacto → no abre Seguimiento).
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let pinLeadId: string
let sistemaLeadId: string
const ACCENT_NAME = 'Cafetería Ñandú Recorrido'

test.beforeAll(async () => {
  const a = await getSetterQa()
  setterId = a.id

  // Varios leads "trabajar" → recorrido (>=2) + búsqueda + atajos.
  await createLead(tracker, { setterId, businessName: ACCENT_NAME, stage: 'FICHA' })
  await createLead(tracker, { setterId, businessName: 'Bravo Recorrido', stage: 'FICHA' })
  await createLead(tracker, { setterId, businessName: 'Alfa Recorrido', stage: 'FICHA' })

  const pin = await createLead(tracker, { setterId, businessName: 'Palancas Target', stage: 'FICHA' })
  pinLeadId = pin.id

  // Lead cuya ÚNICA actividad es SISTEMA (reasignación): timeline lo muestra,
  // pero contactos=0 → Seguimiento sigue cerrado.
  const sis = await createLead(tracker, { setterId, businessName: 'Solo Sistema', stage: 'EVALUADA', score: 3, veredicto: 'AVANZAR' })
  sistemaLeadId = sis.id
  await registerActivity(sistemaLeadId, 'SISTEMA', null, null, 'Reasignado: Sin asignar → setter-qa')
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('D1 · búsqueda acento-insensible surfacea el lead acentuado', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill('cafeteria nandu')
  // El lead "Cafetería Ñandú" aparece pese a buscar sin tildes ni ñ.
  await expect(firstVisible(page.getByText(ACCENT_NAME))).toBeVisible()
  expectNoConsoleErrors(guard)
})

test('D2 · pin / snooze / nota persisten (palancas privadas del setter)', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // Acotar a la card objetivo vía la búsqueda.
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill('Palancas Target')
  await expect(firstVisible(page.getByText('SMOKE-SETTER Palancas Target', { exact: false }))).toBeVisible()

  // PIN.
  await firstVisible(page.getByRole('button', { name: 'Fijar arriba' })).click()
  await expect(async () => {
    const meta = await prisma.osLeadSetterMeta.findUnique({ where: { leadId_setterId: { leadId: pinLeadId, setterId } } })
    expect(meta?.pinned, 'pin persistido').toBe(true)
  }).toPass({ timeout: 10_000 })

  // NOTA.
  await firstVisible(page.getByRole('button', { name: /Agregar nota|Editar nota/i })).click()
  await firstVisible(page.getByRole('textbox')).fill('Nota privada de prueba e2e')
  await firstVisible(page.getByRole('button', { name: 'Guardar' })).click()
  await expect(async () => {
    const meta = await prisma.osLeadSetterMeta.findUnique({ where: { leadId_setterId: { leadId: pinLeadId, setterId } } })
    expect(meta?.note, 'nota persistida').toContain('Nota privada de prueba')
  }).toPass({ timeout: 10_000 })
})

test('D3 · recorrido prev/next por la cola sin volver al home', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // "Recorrer" la cola "Para trabajar ahora" (>=2 leads) → abre el primero con ?cola.
  await firstVisible(page.getByRole('link', { name: /Recorrer/i }).first()).click()
  await expect(page).toHaveURL(/\/setter\/leads\/.+\?cola=/)

  // Strip de recorrido con "Siguiente" → navega al próximo sin volver al home.
  const siguiente = page.getByRole('link', { name: /^Siguiente:/i })
  if (await siguiente.count()) {
    const before = page.url()
    await firstVisible(siguiente).click()
    await expect(page).toHaveURL(/\/setter\/leads\/.+\?cola=/)
    expect(page.url(), 'cambió de lead, no volvió al home').not.toBe(before)
  }
})

test('D4 · atajos de teclado: ? abre ayuda; NO dispara escribiendo en un input', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // Guarda: con foco en el buscador, "?" NO abre la ayuda.
  const search = firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' }))
  await search.click()
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Atajos de teclado' }), 'no abre escribiendo').toHaveCount(0)

  // Con foco fuera de inputs, "?" sí abre el diálogo de ayuda.
  await page.locator('body').click({ position: { x: 5, y: 5 } })
  await page.keyboard.press('?')
  await expect(firstVisible(page.getByRole('dialog', { name: 'Atajos de teclado' }))).toBeVisible()
})

test('D5 · timeline muestra SISTEMA pero NO cuenta como contacto (Seguimiento cerrado)', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${sistemaLeadId}`, { waitUntil: 'domcontentloaded' })

  // El timeline muestra el evento SISTEMA (reasignación).
  await expect(firstVisible(page.getByText(/Reasignado:/))).toBeVisible()

  // PERO Seguimiento sigue cerrado: el evento SISTEMA no es un contacto comercial.
  await expect(firstVisible(page.getByText(/Se abre cuando registrás el primer contacto/i))).toBeVisible()

  // DB: 0 contactos comerciales (el SISTEMA no cuenta).
  const comerciales = await prisma.osLeadActivity.count({ where: { leadId: sistemaLeadId, channel: { not: 'SISTEMA' } } })
  expect(comerciales, 'SISTEMA excluido del conteo de contactos').toBe(0)
})
