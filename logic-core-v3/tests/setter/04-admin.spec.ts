import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Sección E — La cabina de Franco (/admin/leados, /admin/leads). Verifica que el
 * pipeline de producción, la cola de revisión, el panel de escaladas, el badge
 * del sidebar, el drill-down del setter y el control de asignación (carga +
 * ratio) renderizan. Login super-admin (las acciones son SUPER_ADMIN-only).
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let assignLeadId: string

test.beforeAll(async () => {
  const a = await getSetterQa()
  setterId = a.id

  // EN_REVISION → cola de revisión + badge del sidebar.
  await createLead(tracker, { setterId, businessName: 'Admin Revision', stage: 'EN_REVISION', score: 4, veredicto: 'CALIENTE' })

  // CONSTRUCCION + escaladoAt → panel de escaladas ("Setters trabados").
  const esc = await createLead(tracker, { setterId, businessName: 'Admin Escalado', stage: 'CONSTRUCCION' })
  await prisma.osLeadDossier.update({ where: { leadId: esc.id }, data: { escaladoAt: new Date(), escaladoNota: 'Me trabé con la sección de reseñas.' } })

  // EVALUADA → alimenta el ratio del setter (drill-down).
  const ev = await createLead(tracker, { setterId, businessName: 'Admin Evaluado', stage: 'EVALUADA', score: 3, veredicto: 'AVANZAR' })
  assignLeadId = ev.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('E1 · /admin/leados: pipeline + cola de revisión + escaladas + drill-down', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'super-admin')

  const res = await page.goto('/admin/leados', { waitUntil: 'domcontentloaded' })
  expect(res?.status(), 'GET /admin/leados').toBeLessThan(400)

  // Pipeline de producción + tablero por etapa.
  await expect(firstVisible(page.getByRole('heading', { name: 'Pipeline de producción' }))).toBeVisible()
  await expect(firstVisible(page.getByRole('list', { name: 'Etapas de producción' }))).toBeVisible()
  // Cola de revisión (hay un EN_REVISION sembrado).
  await expect(firstVisible(page.getByRole('heading', { name: 'Cola de revisión' }))).toBeVisible()
  // Panel de escaladas (hay un lead trabado sembrado).
  await expect(firstVisible(page.getByRole('heading', { name: /Setters trabados/i }))).toBeVisible()
  // Panel de ratio del setter.
  await expect(firstVisible(page.getByRole('heading', { name: /Filtro del setter/i }))).toBeVisible()

  await page.waitForLoadState('networkidle').catch(() => undefined)
  expectNoConsoleErrors(guard)
})

test('E2 · sidebar: badge de "Revisión demos" con conteo', async ({ page }) => {
  await qaLogin(page, 'super-admin')
  await page.goto('/admin/leados', { waitUntil: 'domcontentloaded' })

  await expect(firstVisible(page.getByRole('link', { name: /Revisión demos/i }))).toBeVisible()
  // Badge numérico (hay >=1 demo en revisión).
  await expect(firstVisible(page.getByLabel(/demos? en revisión/i))).toBeVisible()
})

test('E3 · drill-down de la métrica del setter → sus evaluaciones', async ({ page }) => {
  await qaLogin(page, 'super-admin')
  await page.goto('/admin/leados', { waitUntil: 'domcontentloaded' })

  const drill = page.locator('a[href*="/admin/leados/setter/"]').first()
  await expect(drill).toBeVisible()
  await drill.click()

  await expect(page).toHaveURL(/\/admin\/leados\/setter\//)
  // Vuelve a la cola (botón/enlace de regreso) — confirma que es la página del setter.
  await expect(firstVisible(page.getByRole('button', { name: /Volver a la cola/i })
    .or(page.getByRole('link', { name: /Volver a la cola/i })))).toBeVisible()
})

test('E4 · /admin/leads: asignación muestra carga + ratio por setter', async ({ page }) => {
  await qaLogin(page, 'super-admin')
  const res = await page.goto(`/admin/leads/${assignLeadId}`, { waitUntil: 'domcontentloaded' })
  expect(res?.status(), 'GET /admin/leads/[id]').toBeLessThan(400)

  await expect(firstVisible(page.getByRole('heading', { name: 'Setter asignado' }))).toBeVisible()
  await expect(firstVisible(page.getByText('Carga del equipo'))).toBeVisible()
})
