import { test, expect } from '@playwright/test'
import { qaLogin, mintSessionCookie } from '../helpers/setter-auth'
import { firstVisible, pickSelect } from '../helpers/setter-ui'
import {
  getSetterQa,
  createSetter,
  createLead,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Sección G — Admin assign + caliente cross-actor (Sprint 5.2, gap (b)).
 *
 * El gap que SOLO la DB real (con dos actores) alcanza: el admin asigna un lead a
 * setter B y lo marca caliente → B lo GANA en su portal y el gate del brief ABRE
 * para B (caliente lo abre); A lo PIERDE. Y `requireSuperAdmin` bloquea el intento
 * desde contexto setter. Ningún test ejercía esto.
 *
 * La asignación corre por la ACCIÓN REAL `assignLeadSetter` (vía el control admin
 * AssignSetterControl) — no por un update de Prisma. Los actores se montan con
 * `mintSessionCookie` (NO real-login: evita el bounce AUTH_URL :3001→:3000).
 */

const tracker: SmokeTracker = newTracker()
let aId: string // A = setter-qa (dueño inicial)
let bId: string // B = 2º setter (destinatario)
let bName: string // nombre de B (lo que muestra el option del admin)
let leadId: string
let businessName: string

test.beforeAll(async () => {
  const a = await getSetterQa()
  aId = a.id
  // Label con stamp único: el option del admin usa el NAME (setterLabel =
  // name ?? email) y createSetter NO unifica el name → un stamp evita ambigüedad
  // si un run previo dejó un "assign-b" sin teardown. El match del option va por bName.
  const b = await createSetter(tracker, `assign-b-${Date.now()}`)
  bId = b.id
  bName = b.name ?? ''

  // Lead de A en EVALUADA, NO respondido y NO caliente → gate del brief CERRADO
  // de arranque. Tras el assign+caliente del admin el gate debe ABRIR para B.
  const lead = await createLead(tracker, {
    setterId: aId,
    businessName: 'AsignaCaliente',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
  })
  leadId = lead.id
  businessName = lead.businessName
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('G1 · admin asigna a B + caliente (acción real) → B gana y el gate del brief abre; A pierde', async ({
  page,
  baseURL,
}) => {
  const url = baseURL ?? 'http://127.0.0.1:3001'

  // Precondición: el lead arranca en A, frío.
  const inicial = await prisma.osLead.findUnique({
    where: { id: leadId },
    select: { assignedToId: true, caliente: true },
  })
  expect(inicial?.assignedToId, 'arranca asignado a A').toBe(aId)
  expect(inicial?.caliente, 'arranca frío').toBe(false)

  // ── 1) Admin (SUPER_ADMIN) ejecuta assignLeadSetter REAL vía el control UI ──
  await qaLogin(page, 'super-admin')
  await page.goto(`/admin/leads/${leadId}`, { waitUntil: 'domcontentloaded' })
  await firstVisible(page.getByRole('heading', { name: 'Setter asignado' })).waitFor({ state: 'visible' })

  // Elegir B (el <Select> compartido no es nativo → pickSelect). Match por el
  // nombre exacto y único de B (con stamp) → sin ambigüedad de opción.
  await pickSelect(page, 'Setter asignado', bName)
  // Marcar caliente (switch) y guardar.
  await firstVisible(page.getByRole('switch', { name: /Marcar como caliente/i })).click()
  await firstVisible(page.getByRole('button', { name: /Guardar asignación/i })).click()

  // Verdad de la acción real: el lead quedó en B y caliente (poll a la DB).
  await expect(async () => {
    const row = await prisma.osLead.findUnique({
      where: { id: leadId },
      select: { assignedToId: true, caliente: true },
    })
    expect(row?.assignedToId).toBe(bId)
    expect(row?.caliente).toBe(true)
  }).toPass({ timeout: 15_000 })

  // ── 2) B (SETTER, minteado) GANA el lead en su portal ──
  await page.context().clearCookies()
  await mintSessionCookie(page.context(), url, { userId: bId, email: 'irrelevant', role: 'SETTER' })
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  // Caliente + accionable → es el foco de B (B tiene un solo lead): visible en su portal.
  await expect(firstVisible(page.getByText(businessName)), 'B ve el lead en su portal').toBeVisible()

  // ── 3) ...y el gate del brief ABRE para B (caliente lo abre) ──
  // El form del brief (campo "Respuesta del Gem") SOLO se renderiza en EVALUADA
  // con gate abierto; con gate cerrado se ve la tarjeta de espera. Su presencia
  // ⇒ gate abierto para B. Que el detalle renderice (no "no está en tu cartera")
  // ⇒ B es el dueño.
  await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(page.getByText(businessName)), 'B abre el detalle (lo posee)').toBeVisible()
  await expect(
    firstVisible(page.getByText(/Respuesta del Gem/i)),
    'gate del brief ABIERTO para B (caliente)',
  ).toBeVisible()

  // ── 4) A (setter-qa) PIERDE el lead: el detalle ya no es suyo ──
  await page.context().clearCookies()
  await qaLogin(page, 'setter') // A = setter-qa
  await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })
  await expect(
    firstVisible(page.getByText('Ese lead no está en tu cartera')),
    'A perdió el lead (detalle ajeno)',
  ).toBeVisible()
  await expect(page.getByText(businessName), 'el negocio nunca renderiza para A').toHaveCount(0)
})

test('G2 · requireSuperAdmin: un SETTER no obtiene el control de asignación admin (rebote server-side)', async ({
  page,
  baseURL,
}) => {
  const url = baseURL ?? 'http://127.0.0.1:3001'
  await mintSessionCookie(page.context(), url, { userId: bId, email: 'irrelevant', role: 'SETTER' })

  // Cargamos una superficie PERMITIDA al setter (mismo origen) y desde ahí
  // sondeamos /admin con fetch — sin navegar el top-frame. Por qué: el build
  // prod-QA tiene AUTH_URL=:3000, así que si el browser SIGUE el redirect del
  // guard (→ /dashboard → login) rebota a :3000 (ERR_CONNECTION_REFUSED), ruido
  // AMBIENTAL ajeno al guard de rol. `redirect:'manual'` NO sigue el 3xx, y el
  // fetch same-origin SÍ manda la cookie del setter (contexto seguro localhost).
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  const probe = await page.evaluate(async (target) => {
    const r = await fetch(target, { redirect: 'manual', credentials: 'include' })
    return { status: r.status, type: r.type }
  }, `/admin/leads/${leadId}`)

  // El layout admin rebota server-side a quien no es SUPER_ADMIN: el setter
  // recibe un redirect (opaqueredirect), NUNCA un 200 con la página de asignación.
  // (La acción assignLeadSetter además llama requireSuperAdmin() como
  // defensa-en-profundidad detrás de este rebote.)
  expect(
    probe.type,
    `el admin debe rebotar al setter, no servir la página; type=${probe.type} status=${probe.status}`,
  ).toBe('opaqueredirect')
})
