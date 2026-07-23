import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, fieldControl } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
// El MISMO write-path que corre la action `ofrecerHorarios` por dentro (6.1).
import { guardarHorariosOfrecidosOwned } from '../../src/lib/leados/agenda'
import { formatFechaHora } from '../../src/lib/leados/flow'

/**
 * Sprint 6.2 (B-05/C-05) — m16 re-entra con memoria, guardia y confirmación.
 *
 * H1 es LA prueba de la ficha, hecha literal: ofrecer horarios → CERRAR la
 * pestaña (contexto de browser nuevo, sesión nueva, cero estado de cliente
 * heredado) → reabrir m16 → los MISMOS 3 horarios están a la vista.
 *
 * LO ÚNICO SUSTITUIDO, y se dice acá: el clic en «Buscar horarios libres de
 * Franco» dispara `ofrecerHorarios`, que pega contra Cal.com REAL (getSlots).
 * Meterlo en la suite haría depender la regresión de una API externa y de las
 * credenciales de Cal en el env. Así que la oferta se produce llamando el write
 * -path EXACTO que la action usa por dentro (`guardarHorariosOfrecidosOwned` —
 * mismo criterio que G10 en 12-claim-agenda), y TODO lo que este sprint
 * construye —la re-lectura del blob, la re-entrada, la pantalla— se ejercita por
 * la UI real, cruzando un cierre de pestaña de verdad.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let memoriaLeadId: string
let guardLeadId: string
let confirmLeadId: string

/** Los 3 horarios tal como los devuelve Cal.com: ISO con offset de BA. */
const HORARIOS = [
  '2026-09-01T14:00:00.000-03:00',
  '2026-09-02T16:30:00.000-03:00',
  '2026-09-03T11:00:00.000-03:00',
] as const

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // El punto de partida REAL del paso: demo aprobada y enviada + el negocio
  // respondió → el manual aterriza en m16 con el gate abierto.
  const lead = async (businessName: string) =>
    (
      await createLead(tracker, {
        setterId,
        businessName,
        stage: 'APROBADA',
        status: 'RESPONDIO',
        enviada: true,
      })
    ).id

  memoriaLeadId = await lead('M16 Memoria 6.2')
  guardLeadId = await lead('M16 Guardia 6.2')
  confirmLeadId = await lead('M16 Confirmacion 6.2')

  // La oferta ya hecha, por el write-path exacto de la action (ver cabecera).
  for (const leadId of [memoriaLeadId, guardLeadId, confirmLeadId]) {
    const ok = await guardarHorariosOfrecidosOwned(leadId, setterId, [...HORARIOS])
    expect(ok, `oferta persistida para ${leadId}`).toBe(true)
  }
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** Dispara un `beforeunload` sintético y devuelve si quedó `defaultPrevented`
 *  (patrón exacto de 10-unsaved-guard: el diálogo nativo no es simulable). */
async function beforeunloadPrevented(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(() => {
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    return event.defaultPrevented
  })
}

async function leerAgenda(leadId: string): Promise<{ estado?: string } | null> {
  const dossier = await prisma.osLeadDossier.findUnique({
    where: { leadId },
    select: { agendaJson: true },
  })
  return (dossier?.agendaJson ?? null) as { estado?: string } | null
}

test('H1 · B-05: los horarios ofrecidos sobreviven al cierre de la pestaña', async ({
  browser,
}) => {
  // ── Pestaña 1: el setter ve la oferta que ya hizo ──────────────────────────
  const primera = await browser.newContext()
  const page = await primera.newPage()
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${memoriaLeadId}/manual/m16`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m16$/)

  await expect(firstVisible(page.getByText('Los horarios que ofreciste'))).toBeVisible()
  for (const horario of HORARIOS) {
    await expect(
      firstVisible(page.getByText(formatFechaHora(horario), { exact: false })),
      `horario ofrecido a la vista: ${horario}`,
    ).toBeVisible()
  }
  // Y la fecha de la oferta, que es lo que la vuelve una memoria y no una
  // búsqueda recién hecha.
  await expect(firstVisible(page.getByText(/Se los pasaste el/))).toBeVisible()
  expectNoConsoleErrors(guard)

  // ── Se cierra la pestaña (y el contexto entero: sesión, storage, memoria
  //    de cliente — nada sobrevive del lado del browser) ────────────────────
  await page.close()
  await primera.close()

  // ── Pestaña 2: se vuelve a entrar de cero ─────────────────────────────────
  const segunda = await browser.newContext()
  const reentrada = await segunda.newPage()
  const guard2 = attachConsoleGuard(reentrada)
  await qaLogin(reentrada, 'setter')

  await reentrada.goto(`/setter/leads/${memoriaLeadId}/manual/m16`, {
    waitUntil: 'domcontentloaded',
  })

  // LA aserción del sprint: los MISMOS horarios, sin volver a buscar nada.
  await expect(firstVisible(reentrada.getByText('Los horarios que ofreciste'))).toBeVisible()
  for (const horario of HORARIOS) {
    await expect(
      firstVisible(reentrada.getByText(formatFechaHora(horario), { exact: false })),
      `mismo horario tras reabrir: ${horario}`,
    ).toBeVisible()
  }
  // El buscador virgen NO es lo que se ve: la pantalla arranca con la memoria.
  await expect(
    reentrada.getByRole('button', { name: 'Buscar horarios libres de Franco' }),
  ).toHaveCount(0)

  expectNoConsoleErrors(guard2)
  await reentrada.close()
  await segunda.close()
})

test('H2 · guardia de salida: intercepta beforeunload con notas sin confirmar, no sin ellas', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${guardLeadId}/manual/m16`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m16$/)

  // Nada tipeado: no hay nada que perder (la oferta ya la persiste 6.1).
  await expect
    .poll(() => beforeunloadPrevented(page), { message: 'sin tipear: no intercepta' })
    .toBe(false)

  // Elegir horario tampoco: sigue sin haber trabajo escrito en riesgo.
  await firstVisible(page.getByRole('button', { name: formatFechaHora(HORARIOS[0]) })).click()
  const notas = firstVisible(fieldControl(page, 'Notas de traspaso para Franco'))
  await notas.waitFor({ state: 'visible' })
  await expect
    .poll(() => beforeunloadPrevented(page), { message: 'horario elegido, sin notas: no intercepta' })
    .toBe(false)

  await notas.fill(
    'Le duele que se le escapan pedidos por no contestar los DMs; quiere ver la demo en vivo. Tono directo, sin vueltas.',
  )
  // poll: el listener se ata en un efecto, un tick después del re-render.
  await expect
    .poll(() => beforeunloadPrevented(page), { message: 'notas sin confirmar: intercepta' })
    .toBe(true)

  await notas.fill('')
  await expect
    .poll(() => beforeunloadPrevented(page), { message: 'notas vaciadas: vuelve a no interceptar' })
    .toBe(false)

  expectNoConsoleErrors(guard)
})

test('H3 · confirmación liviana: aparece solo antes del paso irreversible', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${confirmLeadId}/manual/m16`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m16$/)

  const cartel = page.getByText(/Vas a confirmar/)

  // Ningún otro paso gana fricción: marcar el decisor y elegir horario no
  // levantan confirmación de nada.
  await firstVisible(page.getByText('Estoy hablando con el dueño / quien decide')).click()
  await firstVisible(page.getByRole('button', { name: formatFechaHora(HORARIOS[1]) })).click()
  await expect(cartel, 'elegir horario no pide confirmación').toHaveCount(0)

  await firstVisible(fieldControl(page, 'Nombre del prospecto')).fill('Marina')
  await firstVisible(fieldControl(page, 'Email del prospecto')).fill('marina@negocio.test')
  await firstVisible(fieldControl(page, 'Notas de traspaso para Franco')).fill(
    'Le duele que se le escapan pedidos por no contestar los DMs; quiere ver la demo en vivo. Tono directo.',
  )
  await expect(cartel, 'llenar los datos tampoco pide confirmación').toHaveCount(0)

  // El único paso irreversible: acá SÍ, y una sola vez.
  await firstVisible(page.getByRole('button', { name: 'Confirmar y agendar' })).click()
  await expect(firstVisible(cartel)).toBeVisible()
  await expect(
    firstVisible(page.getByText(formatFechaHora(HORARIOS[1]), { exact: false })),
    'el cartel nombra el horario que se va a confirmar',
  ).toBeVisible()

  // Y NO agendó nada: la confirmación todavía no se dio. Si esto fallara, el
  // paso irreversible estaría corriendo sin el sí del setter — no es un test a
  // ajustar (además: sería un booking real en la agenda de Franco).
  const agenda = await leerAgenda(confirmLeadId)
  expect(agenda?.estado, 'el lead sigue en OFRECIDOS: no se creó ningún booking').toBe('OFRECIDOS')

  // «Volver» devuelve al form, sin fricción residual.
  await firstVisible(page.getByRole('button', { name: 'Volver' })).click()
  await expect(cartel, 'volver cierra la confirmación').toHaveCount(0)
  await expect(firstVisible(page.getByRole('button', { name: 'Confirmar y agendar' }))).toBeVisible()

  expectNoConsoleErrors(guard)
})
