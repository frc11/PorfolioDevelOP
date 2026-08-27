import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, expandCartera } from '../helpers/setter-ui'
import { formatFechaCorta } from '../../src/lib/leados/flow'
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
 * Sprint DATOS QUE VIAJAN — el dato existe, vive en UNA pantalla, y el setter lo
 * necesita en las otras. Tres casos, un patrón:
 *
 *   1. La fecha de postergación sólo se renderizaba en m5 (`M5Contexto`). Ni la
 *      tarjeta de cartera ni la cabecera del lead la mostraban: la tarjeta decía
 *      «se retoma cuando se reactive» y el setter tenía que entrar al lead para
 *      saber cuándo vuelve. Encima, un postergado VENCIDO y uno FUTURO decían lo
 *      mismo en m5 («se retoma el DD/MM»), así que un rótulo equivocado era
 *      indetectable.
 *   2. La pantalla de espera nombraba el TURNO («Le toca a Franco») y nada más:
 *      la demo en revisión y la demo aprobada-sin-link mostraban EL MISMO texto,
 *      aunque el producto ya sabe distinguirlas (m15 lo dice con precisión).
 *   3. El contador «N de 3» sólo existía en m5. La espera decía cuándo es el
 *      próximo toque y no en cuál vas — con 0 toques y con 2 se leía idéntica.
 *
 * Se afirma por VISIBILIDAD (`toBeVisible`), nunca por presencia: un texto en el
 * DOM pero plegado pasaría en verde sobre el bug exacto que este spec cubre.
 */

const tracker: SmokeTracker = newTracker()
const DIA_MS = 24 * 60 * 60 * 1000

let setterId: string
let postergadoFuturoId: string
let postergadoVencidoId: string
let enRevisionId: string
let aprobadaSinLinkId: string
let esperaConCadenciaId: string
let esperaAgotadaId: string

// Las fechas sembradas, formateadas con el MISMO helper que pinta la UI
// (`formatFechaCorta`, huso AR fijo) — comparar contra un formateo propio del
// runner haría fallar el spec por huso, no por producto.
const vuelveEl = new Date(Date.now() + 5 * DIA_MS)
const volvioEl = new Date(Date.now() - 3 * DIA_MS)
const proximoToqueEl = new Date(Date.now() + 4 * DIA_MS)
const FECHA_FUTURA = formatFechaCorta(vuelveEl.toISOString())
const FECHA_VENCIDA = formatFechaCorta(volvioEl.toISOString())
const FECHA_PROXIMO_TOQUE = formatFechaCorta(proximoToqueEl.toISOString())

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // ── Caso 1 · dos postergados que sólo se diferencian por el vencimiento ─────
  // EVALUADA + gate cerrado (PROSPECTO, no caliente) + opener mandado + toque
  // futuro ⇒ `posicionDe` aterriza en la pantalla de estado `espera`, así que la
  // cabecera es la única superficie del lead donde la fecha puede leerse.
  const futuro = await createLead(tracker, {
    setterId,
    businessName: 'DV17 Postergado Futuro',
    stage: 'EVALUADA',
    status: 'POSTERGADO',
    nextFollowUpAt: proximoToqueEl,
  })
  postergadoFuturoId = futuro.id
  await registerActivity(postergadoFuturoId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')
  await prisma.osLead.update({
    where: { id: postergadoFuturoId },
    data: { reactivateAt: vuelveEl },
  })

  const vencido = await createLead(tracker, {
    setterId,
    businessName: 'DV17 Postergado Vencido',
    stage: 'EVALUADA',
    status: 'POSTERGADO',
    nextFollowUpAt: proximoToqueEl,
  })
  postergadoVencidoId = vencido.id
  await registerActivity(postergadoVencidoId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')
  await prisma.osLead.update({
    where: { id: postergadoVencidoId },
    data: { reactivateAt: volvioEl },
  })

  // ── Caso 2 · las dos esperas del turno de Franco ────────────────────────────
  const revision = await createLead(tracker, {
    setterId,
    businessName: 'DV17 En Revision',
    stage: 'EN_REVISION',
    status: 'PROSPECTO',
  })
  enRevisionId = revision.id

  // APROBADA sin la URL permanente + el negocio YA respondió: el envío está
  // trabado de este lado, no del otro (la captura #29 del manual).
  const sinLink = await createLead(tracker, {
    setterId,
    businessName: 'DV17 Aprobada Sin Link',
    stage: 'APROBADA',
    status: 'RESPONDIO',
    sinFinalUrl: true,
  })
  aprobadaSinLinkId = sinLink.id

  // ── Caso 3 · el contador de toques en la pantalla de espera ─────────────────
  // Cadencia viva: 2 SIN_RESPUESTA ⇒ cadenciaInfo(2) → toquesHechos 1 → «1 de 3».
  const conCadencia = await createLead(tracker, {
    setterId,
    businessName: 'DV17 Espera Cadencia',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
    nextFollowUpAt: proximoToqueEl,
  })
  esperaConCadenciaId = conCadencia.id
  await registerActivity(esperaConCadenciaId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')
  await registerActivity(esperaConCadenciaId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'toque 1')

  // Cadencia agotada EN LA ESPERA: sólo se alcanza por APROBADA con el gate del
  // envío cerrado (en EVALUADA la agotada manda a m5). 4 SIN_RESPUESTA y sin
  // próximo toque agendado.
  const agotada = await createLead(tracker, {
    setterId,
    businessName: 'DV17 Espera Agotada',
    stage: 'APROBADA',
    status: 'PROSPECTO',
    nextFollowUpAt: null,
  })
  esperaAgotadaId = agotada.id
  for (let i = 1; i <= 4; i++) {
    await registerActivity(esperaAgotadaId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, `toque ${i}`)
  }
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

// ── 1 · La fecha de postergación viaja a la tarjeta de cartera ───────────────

test('1a · la tarjeta de cartera dice CUÁNDO vuelve el postergado, no «cuando se reactive»', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  await expandCartera(page)
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill(
    'DV17 Postergado Futuro',
  )

  await expect(firstVisible(page.getByText(`Postergado — vuelve el ${FECHA_FUTURA}`))).toBeVisible()
  await expect(page.getByText('se retoma cuando se reactive')).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('1b · un postergado VENCIDO y uno FUTURO se distinguen a simple vista, con su fecha', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  await expandCartera(page)
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill(
    'DV17 Postergado',
  )

  // Lado a lado: cada uno con SU fecha y SU rótulo — el vencido invita a retomar.
  await expect(firstVisible(page.getByText(`Postergado — vuelve el ${FECHA_FUTURA}`))).toBeVisible()
  await expect(
    firstVisible(page.getByText(`Se venció el ${FECHA_VENCIDA} — retomá el contacto`)),
  ).toBeVisible()

  expectNoConsoleErrors(guard)
})

test('1c · la ficha del lead muestra la fecha de vuelta, y distingue vencido de futuro', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${postergadoFuturoId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(page.getByText(`Vuelve el ${FECHA_FUTURA}`))).toBeVisible()

  await page.goto(`/setter/leads/${postergadoVencidoId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(page.getByText(`Se venció el ${FECHA_VENCIDA}`))).toBeVisible()
  await expect(page.getByText(`Vuelve el ${FECHA_VENCIDA}`)).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

// ── 2 · Las dos esperas dicen QUÉ se está esperando ──────────────────────────

test('2a · «en revisión» nombra la revisión de Franco y muestra el borrador que mandaste', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${enRevisionId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/revision$/)

  await expect(firstVisible(page.getByText('Le toca a Franco'))).toBeVisible()
  await expect(firstVisible(page.getByText('revisión de Franco'))).toBeVisible()
  // Lo que está mirando: el borrador que el setter publicó.
  await expect(firstVisible(page.getByText('https://smoke-draft.netlify.app'))).toBeVisible()
  // La causa de la OTRA espera no se filtra acá.
  await expect(page.getByText('todavía no cargó su link permanente')).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('2b · «aprobada sin link» nombra al link permanente, no a una respuesta que ya llegó', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${aprobadaSinLinkId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/espera$/)

  await expect(firstVisible(page.getByText('Le toca a Franco'))).toBeVisible()
  await expect(firstVisible(page.getByText('todavía no cargó su link permanente'))).toBeVisible()
  // La causa de la OTRA espera no se filtra acá.
  await expect(page.getByText('Cuando la apruebe o pida correcciones')).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

// ── 3 · El contador de toques en la pantalla de espera ───────────────────────

test('3a · la espera dice en qué toque va, junto a la fecha del próximo', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${esperaConCadenciaId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/espera$/)

  await expect(firstVisible(page.getByText(`Próximo toque el ${FECHA_PROXIMO_TOQUE}`))).toBeVisible()
  await expect(firstVisible(page.getByText('Toques: 1 de 3'))).toBeVisible()

  expectNoConsoleErrors(guard)
})

test('3b · con la cadencia agotada dice eso, y el número no invita a insistir', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${esperaAgotadaId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/espera$/)

  await expect(firstVisible(page.getByText('Toques: 3 de 3'))).toBeVisible()
  await expect(firstVisible(page.getByText('la cadencia se completó'))).toBeVisible()
  // Clampado: nunca «4 de 3», aunque haya 4 SIN_RESPUESTA sembrados.
  await expect(page.getByText('4 de 3')).toHaveCount(0)

  expectNoConsoleErrors(guard)
})
