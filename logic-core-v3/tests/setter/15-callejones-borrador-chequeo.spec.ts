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
 * Callejones 2 y 3 — dos pantallas que NOMBRAN una salida y no la ofrecen.
 *
 *   · Callejón 2 · La guía de retrabajo dice «volvé a Borrador y re-publicá».
 *     El setter va a m13 y ahí, con el lead en RECHAZADA, no había UN SOLO
 *     control: solo el link viejo y «El borrador ya quedó publicado». La salida
 *     existía en otra pantalla (`mr` → «Reabrir construcción»), pero desde donde
 *     lo mandaron a ir no se veía.
 *
 *   · Callejón 3 · Durante la construcción el chequeo final se nombra en el
 *     borrador y en las fases, y NINGUNA mención enlazaba a él: el chip de
 *     navegación sale solo con `m14` en `completadas`, y `completadasDe` la marca
 *     recién en EN_REVISION/APROBADA — o sea, el link aparecía cuando el chequeo
 *     ya estaba hecho. En la corrida se salió escribiendo la URL a mano.
 *
 * Se afirma por CONTENIDO y por HREF, nunca por status: la guardia del server
 * redirige dentro del payload de streaming (un redirect viaja como 200).
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
/** RECHAZADA con el borrador publicado — el callejón 2, tal cual se midió. */
let rechazadoId: string
/** CONSTRUCCION con borrador y fases A MEDIAS: `actual` es mc1, m14 habilitada. */
let construyendoId: string
/** CONSTRUCCION SIN borrador: m14 NO está habilitada — el gate del enlace. */
let sinBorradorId: string

const DRAFT = 'https://smoke-callejones-draft.netlify.app'

/** El `main` VISIBLE — el streaming de React duplica el DOM. */
function main(page: Page) {
  return firstVisible(page.locator('main'))
}

/** Enlaces del `main` que apuntan a una pantalla del manual. */
function linksAPantalla(page: Page, paso: string) {
  return page.locator(`main a[href$="/manual/${paso}"]`)
}

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  const rechazado = await createLead(tracker, {
    setterId,
    businessName: 'Callejon Borrador Rechazado',
    stage: 'RECHAZADA',
    status: 'RESPONDIO',
    draftUrl: DRAFT,
  })
  rechazadoId = rechazado.id

  // Fases a medias A PROPÓSITO: con las seis tildadas `posicionDe` pone `actual`
  // en m14 y la pantalla saca sola un «Ir a tu paso actual» que apunta ahí. Ese
  // atajo tapaba el hallazgo. Con el checklist incompleto —el estado normal de
  // quien acaba de publicar el borrador— el único enlace posible a m14 es el que
  // este sprint agrega.
  const construyendo = await createLead(tracker, {
    setterId,
    businessName: 'Callejon Chequeo Sin Link',
    stage: 'CONSTRUCCION',
    status: 'RESPONDIO',
    draftUrl: DRAFT,
    progresoCompletadas: ['estructura'],
  })
  construyendoId = construyendo.id

  const sinBorrador = await createLead(tracker, {
    setterId,
    businessName: 'Callejon Chequeo Sin Borrador',
    stage: 'CONSTRUCCION',
    status: 'RESPONDIO',
    draftUrl: null,
    progresoCompletadas: ['estructura'],
  })
  sinBorradorId = sinBorrador.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('Callejón 2 · el borrador rechazado deja de ser una pantalla muda', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${rechazadoId}/manual/m13`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m13$/)

  // 1) La pantalla dice QUÉ HACER — no habla solo en pasado.
  await expect(main(page)).toContainText('reabrí la construcción')

  // 2) Y tiene un control. Éste es el assert que falla contra el código viejo:
  //    la zona de Registro no tenía ni un botón.
  const reabrir = firstVisible(page.getByRole('button', { name: 'Reabrir construcción' }))
  await expect(reabrir, 'el borrador rechazado ofrece la salida que la guía promete').toBeVisible()

  // 3) El link viejo sigue a la vista (es contra lo que Franco escribió el pedido).
  await expect(main(page)).toContainText(DRAFT)

  // 4) Y FUNCIONA: reabre la construcción — la ÚNICA transición legal de vuelta,
  //    la misma action de siempre. Ninguna transición nueva.
  await reabrir.click()
  await expect(async () => {
    expect((await getDossier(rechazadoId))?.stage, 're-loop → CONSTRUCCION').toBe('CONSTRUCCION')
  }).toPass({ timeout: 15_000 })

  // 5) Ya en construcción, la misma pantalla ofrece cambiar el link — el control
  //    que el rechazo escondía, ahora alcanzable desde donde te mandaron.
  await page.goto(`/setter/leads/${rechazadoId}/manual/m13`, { waitUntil: 'domcontentloaded' })
  await expect(
    firstVisible(page.getByRole('button', { name: 'Cambiar el link del borrador' })),
  ).toBeVisible()

  // 6) Y el borrador NO se movió de stage por mirarlo: sigue el mismo link.
  expect((await getDossier(rechazadoId))?.draftUrl).toBe(DRAFT)

  expectNoConsoleErrors(guard)
})

test('Callejón 3 · cada mención del chequeo final durante la construcción enlaza a él', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  // El borrador (m13) y las dos pantallas de fases nombran el chequeo final.
  for (const pantalla of ['m13', 'mc1', 'mc2'] as const) {
    await page.goto(`/setter/leads/${construyendoId}/manual/${pantalla}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page).toHaveURL(new RegExp(`/manual/${pantalla}$`))
    await expect(main(page), `${pantalla} nombra el chequeo final`).toContainText(
      'chequeo final',
    )
    await expect(
      linksAPantalla(page, 'm14').first(),
      `${pantalla} enlaza al chequeo final`,
    ).toHaveCount(1)
  }

  // Y el enlace LLEVA ahí de verdad — no rebota a otra pantalla.
  await page.goto(`/setter/leads/${construyendoId}/manual/m13`, { waitUntil: 'domcontentloaded' })
  await linksAPantalla(page, 'm14').first().click()
  await expect(page).toHaveURL(/\/manual\/m14$/)
  await expect(main(page)).toContainText('Chequeá la demo antes de mandarla')

  expectNoConsoleErrors(guard)
})

test('Callejón 3 · sin borrador el enlace dice qué falta en vez de rebotar', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${sinBorradorId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  // El gate se respeta: m14 no está habilitada sin borrador, así que la mención
  // NO ofrece el chequeo — nombra lo que falta.
  await expect(linksAPantalla(page, 'm14'), 'sin borrador no se ofrece m14').toHaveCount(0)
  await expect(main(page)).toContainText('se abre cuando publiques el borrador')

  // Y lleva a donde se resuelve, sin redirect silencioso de por medio.
  const alBorrador = page
    .locator('main a[href$="/manual/m13"]')
    .filter({ hasText: 'publiques el borrador' })
    .first()
  await alBorrador.click()
  await expect(page).toHaveURL(/\/manual\/m13$/)
  await expect(main(page)).toContainText('Publicá y registrá el link del borrador')

  expectNoConsoleErrors(guard)
})
