import { test, expect } from '@playwright/test'
import { qaLogin, mintSessionCookie, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, expandCartera } from '../helpers/setter-ui'
import {
  getSetterQa,
  createSetter,
  createLead,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Sección F — Estados vacíos + mobile (~390px) + a11y básica. NO juzga estética
 * (eso lo mira Franco a ojo); confirma que los vacíos renderizan su mensaje sin
 * crash, que los flujos clave no desbordan en mobile, y que hay aria-labels /
 * aria-current donde corresponde.
 */

const tracker: SmokeTracker = newTracker()
let emptySetterId: string
let freshLeadId: string

test.beforeAll(async () => {
  const a = await getSetterQa()
  // Setter SIN leads → empty state de cartera.
  const empty = await createSetter(tracker, 'empty')
  emptySetterId = empty.id
  // Lead nuevo sin actividades → timeline vacío.
  const fresh = await createLead(tracker, { setterId: a.id, businessName: 'Fresh Sin Movimientos', stage: 'FICHA' })
  freshLeadId = fresh.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('F1 · empty state: setter sin leads renderiza su mensaje (no crash)', async ({ page, baseURL }) => {
  const guard = attachConsoleGuard(page)
  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3001', { userId: emptySetterId, email: 'irrelevant', role: 'SETTER' })

  const res = await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  expect(res?.status()).toBeLessThan(400)
  // Setter con CERO leads → `HomeEmpty` ("Tu cartera está vacía"), distinto del
  // "Nada para trabajar ahora mismo" del 2.1b (que es TENER leads pero ninguno en
  // la cola de foco). El swap del home separó ambos estados.
  await expect(firstVisible(page.getByText(/Tu cartera está vacía/i))).toBeVisible()
  expectNoConsoleErrors(guard)
})

test('F2 · empty state: búsqueda sin resultados', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // El buscador se mudó a la cartera secundaria (2.1a) → expandir primero.
  await expandCartera(page)
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill('zzz-no-existe-este-lead-qqq')
  await expect(firstVisible(page.getByText('Ningún lead coincide con eso.'))).toBeVisible()
})

test('F3 · empty state: timeline de un lead sin movimientos', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${freshLeadId}`, { waitUntil: 'domcontentloaded' })

  // 5.6: el historial vive al pie del manual (colapsable) — abrirlo muestra el vacío.
  await firstVisible(page.getByText('Ver historial del lead')).click()
  await expect(firstVisible(page.getByText(/Todavía sin movimientos registrados/i))).toBeVisible()
})

test('F4 · mobile (~390px): home sin overflow horizontal + drawer abre/cierra', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // Sin scroll horizontal (tolerancia mínima por sub-pixel).
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow, 'sin overflow horizontal en mobile').toBeLessThanOrEqual(2)

  // Drawer de navegación: abre y cierra.
  await firstVisible(page.getByRole('button', { name: 'Abrir menú' })).click()
  await expect(firstVisible(page.getByRole('navigation', { name: 'Navegación del setter' }))).toBeVisible()
  await firstVisible(page.getByRole('button', { name: 'Cerrar menú' }).first()).click()
})

test('F5 · mobile (~390px): abrir un lead no desborda', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${freshLeadId}`, { waitUntil: 'domcontentloaded' })

  // 5.6: la raíz sirve el manual — la instrucción protagonista renderiza en mobile.
  await expect(
    firstVisible(page.locator('section[aria-label="Instrucción de esta pantalla"]')),
  ).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow, 'detalle de lead sin overflow horizontal en mobile').toBeLessThanOrEqual(2)
})

test('F6 · a11y: landmarks con nombre + aria-current en el destino activo', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  await expect(firstVisible(page.getByRole('navigation', { name: 'Navegación del setter' }))).toBeVisible()
  await expect(firstVisible(page.getByRole('navigation', { name: 'Herramientas externas del setter' }))).toBeVisible()
  // aria-current=page en Cartera (destino activo).
  await expect(firstVisible(page.locator('button[aria-current="page"]'))).toBeVisible()
})
