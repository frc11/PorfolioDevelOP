import { test, expect, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  getDossier,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Sprint F2 — Lo que Franco pidió corregir tiene que estar A LA VISTA en las
 * pantallas donde el setter corrige, no solo en el aterrizaje del re-loop.
 *
 * El bache original: la nota se veía en `mr` (stage RECHAZADA) y desaparecía
 * ENTERA al reabrir la construcción — `mr` deja de ser alcanzable y el gate del
 * home es por stage RECHAZADA, así que el setter corregía de memoria. El dato
 * nunca se perdió (`rechazos` solo lo appendea `transitionDossier`; el re-loop
 * resetea `selfCheckJson` y nada más): faltaba mostrarlo.
 *
 * Se afirma por CONTENIDO, nunca por status: la guardia del server redirige
 * dentro del payload de streaming (un 404/redirect viaja como 200).
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
/** Rechazado con DOS vueltas: la última al frente, la anterior plegada. */
let rechazadoId: string
/** Control sin rechazo: el bloque no tiene que existir (degradación honesta). */
let limpioId: string

/** El motivo de la ÚLTIMA vuelta (`rechazosJsonDeNVueltas`: la última es la más nueva). */
const MOTIVO_VIGENTE = 'El hero sigue sin los datos reales del negocio'
/** El motivo de la vuelta ANTERIOR — contexto secundario, dentro del plegado. */
const MOTIVO_PREVIO = 'Vuelta 1: faltan fotos propias y el CTA no se ve en mobile'
const TITULO_GUIA = 'Guía de retrabajo — lo que Franco pidió corregir'

/** El `main` VISIBLE — el streaming de React duplica el DOM y la copia oculta
 *  haría que un `toContainText` a secas viole el modo estricto. */
function main(page: Page) {
  return firstVisible(page.locator('main'))
}

/** El bloque del rechazo, scopeado a `main` (el streaming duplica el DOM). */
function guia(page: Page) {
  return page.locator('main').getByText(TITULO_GUIA)
}

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  const rechazado = await createLead(tracker, {
    setterId,
    businessName: 'Motivo Rechazo F2',
    stage: 'RECHAZADA',
    status: 'RESPONDIO',
    rechazosCount: 2,
  })
  rechazadoId = rechazado.id

  // Mismo recorrido, sin rechazo: CONSTRUCCION con el borrador ya publicado
  // (así m13/m14 son alcanzables) y ni un solo rastro del bloque.
  const limpio = await createLead(tracker, {
    setterId,
    businessName: 'Sin Rechazo F2',
    stage: 'CONSTRUCCION',
    status: 'RESPONDIO',
    draftUrl: 'https://smoke-draft-limpio.netlify.app',
  })
  limpioId = limpio.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('F2 · el motivo sobrevive a la reapertura y acompaña las pantallas de corrección', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  // 1) Aterrizaje: el pedido vigente al frente y las vueltas anteriores anunciadas.
  await page.goto(`/setter/leads/${rechazadoId}/manual/mr`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mr$/)
  await expect(firstVisible(guia(page))).toBeVisible()
  await expect(main(page)).toContainText(MOTIVO_VIGENTE)
  await expect(main(page)).toContainText('Lo que te pidió en las vueltas anteriores (1)')
  await expect(main(page)).toContainText(MOTIVO_PREVIO)
  // La promesa vieja («el historial de rechazos se conserva») ya no se hace a
  // secas: el historial está arriba, en el plegado.
  await expect(main(page)).not.toContainText('el historial de rechazos se conserva')

  // 2) La reapertura — el caso del hallazgo. RECHAZADA→CONSTRUCCION: `mr` deja
  //    de existir y hasta F2 la nota se iba con ella.
  await firstVisible(page.getByRole('button', { name: 'Reabrir construcción' })).click()
  await expect(async () => {
    expect((await getDossier(rechazadoId))?.stage, 're-loop → CONSTRUCCION').toBe('CONSTRUCCION')
  }).toPass({ timeout: 15_000 })

  // 3) Las cuatro pantallas del retrabajo: en TODAS se lee qué pidió Franco.
  for (const pantalla of ['mc1', 'mc2', 'm13', 'm14'] as const) {
    await page.goto(`/setter/leads/${rechazadoId}/manual/${pantalla}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page, `${pantalla} es alcanzable en el re-loop`).toHaveURL(
      new RegExp(`/manual/${pantalla}$`),
    )
    await expect(firstVisible(guia(page)), `${pantalla} muestra el bloque`).toBeVisible()
    await expect(main(page), `${pantalla} muestra el pedido`).toContainText(
      MOTIVO_VIGENTE,
    )
  }

  expectNoConsoleErrors(guard)
})

test('F2 · sin rechazo el bloque no existe — ni vacío ni de relleno', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  for (const pantalla of ['mc1', 'mc2', 'm13', 'm14'] as const) {
    await page.goto(`/setter/leads/${limpioId}/manual/${pantalla}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page).toHaveURL(new RegExp(`/manual/${pantalla}$`))
    await expect(guia(page), `${pantalla} sin rechazo`).toHaveCount(0)
  }

  expectNoConsoleErrors(guard)
})
