import { test, expect } from '@playwright/test'
import { qaLogin, mintSessionCookie, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, expandCartera } from '../helpers/setter-ui'
import {
  getSetterQa,
  createSetter,
  createLead,
  createNotice,
  countNoticesFor,
  reassignLead,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Sección C — Aislamiento (invariante #1): un setter NUNCA ve lo ajeno. A =
 * persona QA (setter-qa); B = 2º setter creado, logueado por cookie minteada
 * (espejo de la route — el persona QA no lo cubre). Cubre cartera, acceso 404
 * sin leak, nota privada, novedades, y el rendering de la reasignación
 * (saliente in-app SIN link — el cabo 0.5.3).
 */

const tracker: SmokeTracker = newTracker()
let aId: string
let bId: string
let aLeadId: string
let bLeadId: string
const A_NOTE = 'NOTA-PRIVADA-DE-A-zzz'
const A_ONLY = 'SoloDeA Aislado'
const B_ONLY = 'SoloDeB Aislado'

test.beforeAll(async () => {
  const a = await getSetterQa()
  aId = a.id
  const b = await createSetter(tracker, 'iso-b')
  bId = b.id

  const aLead = await createLead(tracker, { setterId: aId, businessName: A_ONLY, stage: 'FICHA', meta: { note: A_NOTE } })
  aLeadId = aLead.id
  const bLead = await createLead(tracker, { setterId: bId, businessName: B_ONLY, stage: 'FICHA' })
  bLeadId = bLead.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('C1 · A no ve la cartera de B; abrir un lead ajeno da 404 sin leak', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // La cartera completa (donde figura el lead de A) quedó secundaria/colapsada
  // tras 2.1a → expandir para poder afirmar visibilidad. El aislamiento (B no
  // aparece) se sigue verificando sobre TODA la página, abierta o no.
  await expandCartera(page)
  await expect(firstVisible(page.getByText(A_ONLY))).toBeVisible()
  await expect(page.getByText(B_ONLY), 'A no ve el lead de B').toHaveCount(0)

  // Abrir el lead de B → not-found del setter, indistinguible de un id inexistente
  // (sin leak de existencia ni del negocio ajeno). El route hace `notFound()`; la
  // garantía de aislamiento se verifica por CONTENIDO, no por status HTTP: una page
  // `force-dynamic` ya flusheó el 200 OK antes de que notFound() corte el stream
  // (comportamiento de Next), así que el status es 200 aunque la UI sea la de
  // "no encontrado". Lo que importa: el negocio ajeno NUNCA se renderiza.
  await page.goto(`/setter/leads/${bLeadId}`, { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(page.getByText('Ese lead no está en tu cartera'))).toBeVisible()
  await expect(page.getByText(B_ONLY), 'el negocio ajeno nunca se renderiza').toHaveCount(0)

  // Un id inexistente da EXACTAMENTE el mismo not-found → no se filtra la
  // distinción "existe pero es ajeno" vs "no existe".
  await page.goto('/setter/leads/clrandomrandomrandomrand00', { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(page.getByText('Ese lead no está en tu cartera'))).toBeVisible()
  expectNoConsoleErrors(guard)
})

test('C2 · B (2º setter) ve SOLO lo suyo; no abre el lead de A', async ({ page, baseURL }) => {
  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3001', { userId: bId, email: 'irrelevant', role: 'SETTER' })
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  await expect(firstVisible(page.getByText(B_ONLY))).toBeVisible()
  await expect(page.getByText(A_ONLY), 'B no ve el lead de A').toHaveCount(0)

  // B no abre el lead de A: `notFound()` del setter, sin leakear el negocio de A.
  // (Status 200 y no 404 por el streaming de la page force-dynamic — Next; el
  // aislamiento se verifica por contenido, igual que en C1.)
  await page.goto(`/setter/leads/${aLeadId}`, { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(page.getByText('Ese lead no está en tu cartera'))).toBeVisible()
  await expect(page.getByText(A_ONLY), 'B nunca ve el negocio de A').toHaveCount(0)
})

test('C3 · la nota privada de A no la hereda B al reasignar el lead', async ({ page, baseURL }) => {
  // Reasignar el lead de A → B (a nivel datos). La nota de A queda keyed (lead,A).
  await reassignLead(aLeadId, bId)

  // DB: existe meta de A, NO existe meta de B para el mismo lead.
  const metaA = await prisma.osLeadSetterMeta.findUnique({ where: { leadId_setterId: { leadId: aLeadId, setterId: aId } } })
  const metaB = await prisma.osLeadSetterMeta.findUnique({ where: { leadId_setterId: { leadId: aLeadId, setterId: bId } } })
  expect(metaA?.note, 'la nota de A sigue siendo de A').toBe(A_NOTE)
  expect(metaB, 'B no tiene meta para ese lead').toBeNull()

  // B abre el lead (ahora suyo) y NO ve la nota privada de A.
  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3001', { userId: bId, email: 'irrelevant', role: 'SETTER' })
  await page.goto(`/setter/leads/${aLeadId}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByText(A_NOTE), 'B nunca ve la nota de A').toHaveCount(0)
})

test('C4 · novedades dirigidas: B ve "te asignaron"; A (saliente) ve "te reasignaron" SIN link', async ({ page, baseURL }) => {
  // Sembrar las dos caras del handoff (leadId tracked → se limpia en teardown).
  await createNotice({ setterId: bId, leadId: bLeadId, kind: 'LEAD_ASIGNADO', title: 'Te asignaron un lead', body: `${B_ONLY} entró a tu cartera. Arrancá por la ficha.` })
  await createNotice({ setterId: aId, leadId: aLeadId, kind: 'LEAD_REASIGNADO_SALIENTE', title: 'Te reasignaron un lead', body: `${A_ONLY} pasó a otro setter. Ya no está en tu cartera.` })

  // A (saliente): ve "Te reasignaron un lead" y NO es un link (in-app, cabo 0.5.3).
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(page.getByText('Te reasignaron un lead'))).toBeVisible()
  await expect(page.getByRole('link', { name: /Te reasignaron un lead/i }), 'saliente NO linkea').toHaveCount(0)

  // B (entrante): recibe el handoff. P21 movió DÓNDE lo ve, no SI lo ve.
  //
  // Hasta P21 este aserto buscaba el aviso "Te asignaron un lead" en el bloque de
  // novedades. Desde P21 el aviso de un lead que YA es una tarea en la cola no se
  // repite abajo (`excludeLeadIds`) — mostrarlo en los dos lugares es la
  // duplicación que el sprint prohíbe. El lead recién asignado entra a `trabajar`
  // (sin dossier → grupo `trabajar`), así que la cara del handoff para B es su
  // fila en la COLA, con lo que hay que hacer y el control que lleva a hacerlo.
  //
  // Lo que este test garantiza no cambió: el handoff LLEGA a B, dirigido, y no
  // se cruza con el de A. Sólo se movió la superficie donde se afirma.
  await page.context().clearCookies()
  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3001', { userId: bId, email: 'irrelevant', role: 'SETTER' })
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  const colaDeB = page.locator('section[aria-label="Tu cola de hoy"]')
  await expect(firstVisible(colaDeB.getByText(B_ONLY)), 'el lead asignado le llega a B como trabajo').toBeVisible()
  // Y el aviso sigue existiendo y contándose sin leer (el badge del topbar lo
  // refleja): dedup es presentación, no borrado.
  expect(await countNoticesFor(bId, 'LEAD_ASIGNADO'), 'el aviso dirigido a B existe').toBe(1)
  // A's saliente novedad no aparece en el feed de B (aislamiento por setterId).
  // Ojo: NO se afirma acá que B no vea el NEGOCIO de A — C3, arriba, reasigna
  // ese lead a B a propósito, así que a esta altura del archivo es suyo. La
  // cartera de A frente a B ya la cubre C2, con su fixture intacta.
  await expect(page.getByText('Te reasignaron un lead'), 'B no ve la novedad de A').toHaveCount(0)
})
