import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, expandCartera } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  createNotice,
  registerActivity,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Sección A + G — Auth + carga de TODAS las superficies de la cabina del setter,
 * y salud (cero errores de consola / excepciones). Siembra una cabina "llena"
 * para que cada panel condicional (novedades, tu semana, mis números, continuá,
 * demos en cola) realmente renderice.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let leadWorkId: string
let leadEvalId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // Lead "para trabajar" (FICHA) → continuá CTA + scoreboard + recorrible.
  const work = await createLead(tracker, { setterId, businessName: 'Cabina Trabajar', stage: 'FICHA' })
  leadWorkId = work.id
  // 2º lead trabajar para que la cola sea recorrible (>=2).
  await createLead(tracker, { setterId, businessName: 'Cabina Trabajar 2', stage: 'FICHA' })
  // Lead EN_REVISION → "Tus demos esperando a Franco" + scoreboard revisión.
  await createLead(tracker, { setterId, businessName: 'Cabina Revision', stage: 'EN_REVISION' })
  // Lead EVALUADA s3 → mis-números (criterio) + apertura del wizard.
  const evaluated = await createLead(tracker, { setterId, businessName: 'Cabina Evaluada', stage: 'EVALUADA', score: 3, veredicto: 'AVANZAR' })
  leadEvalId = evaluated.id

  // Novedad dirigida → panel novedades + badge del topbar + "Marcar como vistas".
  await createNotice({
    setterId,
    leadId: leadWorkId,
    kind: 'LEAD_ASIGNADO',
    title: 'Te asignaron un lead',
    body: 'Cabina Trabajar entró a tu cartera. Arrancá por la ficha.',
  })
  // Contacto comercial reciente → "Tu semana" (progreso, ventana 7 días).
  await registerActivity(leadWorkId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'Opener seed')
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('A1 · /setter responde 200 y la cabina carga sin errores de consola', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  const res = await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  expect(res?.status(), 'GET /setter status').toBeLessThan(400)

  // Topbar de la zona setter (marca + logout) — confirma que estamos adentro.
  await expect(firstVisible(page.getByRole('button', { name: 'Cerrar sesión' }))).toBeVisible()

  await page.waitForLoadState('networkidle').catch(() => undefined)
  expectNoConsoleErrors(guard)
})

test('A2 · navegación + rail de herramientas + aria-current activo', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  await expect(firstVisible(page.getByRole('navigation', { name: 'Navegación del setter' }))).toBeVisible()
  // Cartera es el destino activo (aria-current=page).
  await expect(firstVisible(page.locator('button[aria-current="page"]').filter({ hasText: 'Cartera' }))).toBeVisible()
  // Rail "Tus herramientas" (links externos).
  await expect(firstVisible(page.getByRole('navigation', { name: 'Herramientas externas del setter' }))).toBeVisible()
})

test('A3 · foco accionable (modo dirección) + cartera secundaria con búsqueda', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // 2.1a — el home es "modo dirección": UN lead accionable de protagonista. La
  // siembra tiene leads en FICHA → la cola `trabajar` no está vacía → hay foco.
  // (El viejo tablero — scoreboard "Resumen de tu cartera", cola "Para trabajar
  // ahora", link "Continuá donde dejaste" — lo barrió 2.1a.)
  await expect(firstVisible(page.getByRole('region', { name: 'Tu foco ahora' }))).toBeVisible()
  // El CTA que abre el lead protagonista en su detalle.
  await expect(firstVisible(page.getByRole('button', { name: 'Ir a trabajarlo' }))).toBeVisible()

  // La cartera completa quedó SECUNDARIA (colapsada): el toggle existe y, al
  // expandir, surfacea el buscador (que se mudó adentro del CarteraView).
  await expect(firstVisible(page.getByRole('button', { name: 'Ver toda la cartera' }))).toBeVisible()
  await expandCartera(page)
  await expect(firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' }))).toBeVisible()
})

test('A4 · paneles de cabina: Novedades, Tu semana, Mis números, badge topbar', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // Novedades (hay un aviso sembrado).
  await expect(firstVisible(page.getByRole('region', { name: 'Novedades de tu cartera' }))).toBeVisible()
  await expect(firstVisible(page.getByText('Tus demos esperando a Franco'))).toBeVisible()
  await expect(firstVisible(page.getByRole('button', { name: /Marcar como vistas/i }))).toBeVisible()
  // Badge del topbar (novedades sin ver).
  await expect(firstVisible(page.getByRole('link', { name: /novedades sin ver/i }))).toBeVisible()
  // "Tu semana" (hay un contacto reciente sembrado).
  await expect(firstVisible(page.getByRole('region', { name: /Tu avance de los últimos \d+ días/ }))).toBeVisible()
  // "Mis números" (hay leads + una evaluación).
  await expect(firstVisible(page.getByRole('region', { name: 'Mis números' }))).toBeVisible()
})

test('A5 · detalle de lead: el manual (instrucción + historial) carga sin errores', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  const res = await page.goto(`/setter/leads/${leadEvalId}`, { waitUntil: 'domcontentloaded' })
  expect(res?.status(), 'GET /setter/leads/[id] status').toBeLessThan(400)

  // 5.6: la raíz sirve el manual — la URL final ES una aserción de posición
  // (el server derivó la pantalla actual y aterrizó ahí).
  await expect(page).toHaveURL(/\/manual\/(m\d+|mr|espera|revision)$/)
  // La instrucción protagonista del layout-tipo.
  await expect(
    firstVisible(page.locator('section[aria-label="Instrucción de esta pantalla"]')),
  ).toBeVisible()
  // Historial al pie (colapsable): abrirlo muestra el timeline completo.
  await firstVisible(page.getByText('Ver historial del lead')).click()
  await expect(firstVisible(page.getByRole('heading', { name: 'Historial del lead' }))).toBeVisible()
  // Cabecera del lead.
  await expect(firstVisible(page.getByRole('link', { name: /Volver a tu cartera/i }))).toBeVisible()

  await page.waitForLoadState('networkidle').catch(() => undefined)
  expectNoConsoleErrors(guard)
})
