import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, fieldControl, pickSelect, expectToast } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  fichaConSenal,
  getDossier,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * D15-bis — LA GARANTÍA DE LA FUSIÓN.
 *
 * Este sprint juntó dos pantallas del stage FICHA: cargar la ficha (m1) y
 * registrar el veredicto (m2) pasaron a ser una sola. Lo que la fusión NO puede
 * aflojar es la etapa `EVALUADA` ni lo que sostiene: un lead sin veredicto no
 * llega a construir. Es la única puerta —`LEGAL_TRANSITIONS` no tiene arista
 * FICHA→BRIEF— y este spec la fija a nivel de lo que el setter puede hacer con
 * el navegador, no del grafo (eso ya lo vigila `dossier-stage.invariant.ts`).
 *
 * ── Por qué hace falta un test y no alcanzaba el invariante ──────────────────
 * El invariante del grafo prueba que la TRANSICIÓN no existe. Esto prueba que
 * tampoco existe la PANTALLA: que la guardia del server no habilita el brief ni
 * las de construcción mientras el dossier siga en FICHA. Son dos capas
 * distintas y la fusión tocó la segunda — `posicionDe` cambió su case de FICHA.
 *
 * ── Cómo se demostró que tiene dientes ───────────────────────────────────────
 * Sabotaje contra el código de PRODUCCIÓN, no contra un fixture: se agregaron
 * m6/mc1/mc2/m13/m14 a las `habilitadas` del case FICHA de `posicionDe`
 * (`manual.ts`) y se rebuildeó — el estado exacto donde la garantía no existe.
 * Los DOS tests se pusieron rojos, cada uno en su primer destino de producción:
 * la guardia dejó de redirigir y la URL se quedó en `/manual/m6` en vez de
 * rebotar a `/manual/m1`. Revertido el sabotaje y rebuildeado, vuelven a verde.
 * La salida de las dos corridas queda en la bitácora.
 */

const pantalla = (leadId: string, paso: string) => `/setter/leads/${leadId}/manual/${paso}`

/** Las pantallas de producción — todo lo que el veredicto tiene que estar abriendo. */
const PANTALLAS_DE_PRODUCCION = ['m6', 'mc1', 'mc2', 'm13', 'm14'] as const

const tracker: SmokeTracker = newTracker()
let setterId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('sin veredicto no se llega a construir: la ficha con señal no abre ninguna pantalla de producción', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  // El estado más favorable para el bug: ficha COMPLETA (señal mínima cumplida) y
  // el gate comercial ABIERTO (`caliente`, el campo de Franco). Todo listo menos
  // el veredicto. Si algo colara producción sin veredicto, colaría acá.
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Sin Veredicto',
    stage: 'FICHA',
  })
  await prisma.osLeadDossier.update({ where: { leadId }, data: { fichaJson: fichaConSenal() } })
  // El gate comercial del brief lo abre el campo `caliente` de Franco
  // (`gateBriefAbierto`), no el score del setter — `SeedLeadOpts` no lo expone,
  // se marca directo. Sin esto el brief quedaría cerrado por el gate y no por la
  // falta de veredicto: el test probaría otra cosa.
  await prisma.osLead.update({ where: { id: leadId }, data: { caliente: true } })

  await qaLogin(page, 'setter')

  // 1. La raíz aterriza en la pantalla fusionada, que es donde está el trabajo.
  await page.goto(`/setter/leads/${leadId}`, { waitUntil: 'domcontentloaded' })
  await expect(page, 'un lead en FICHA aterriza en m1').toHaveURL(/\/manual\/m1$/)

  // 2. Y ninguna pantalla de producción es alcanzable: la guardia del server
  //    redirige cada una a la actual. Navegar ES la aserción.
  for (const paso of PANTALLAS_DE_PRODUCCION) {
    await page.goto(pantalla(leadId, paso), { waitUntil: 'domcontentloaded' })
    await expect(page, `${paso} no se alcanza sin veredicto — rebota a m1`).toHaveURL(
      /\/manual\/m1$/,
    )
  }

  // 3. Y el dossier no se movió de FICHA por haberlo intentado.
  expect((await getDossier(leadId))?.stage, 'el stage no se mueve mirando URLs').toBe('FICHA')
  expectNoConsoleErrors(guard)
})

test('el veredicto es lo que abre: registrarlo con el gate abierto habilita el brief', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  // Mismo lead que el test anterior, misma siembra. Lo único que cambia entre
  // los dos estados es el veredicto: por eso lo que se abra después es
  // atribuible a él y a nada más.
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Con Veredicto',
    stage: 'FICHA',
  })
  await prisma.osLeadDossier.update({ where: { leadId }, data: { fichaJson: fichaConSenal() } })
  // El gate comercial del brief lo abre el campo `caliente` de Franco
  // (`gateBriefAbierto`), no el score del setter — `SeedLeadOpts` no lo expone,
  // se marca directo. Sin esto el brief quedaría cerrado por el gate y no por la
  // falta de veredicto: el test probaría otra cosa.
  await prisma.osLead.update({ where: { id: leadId }, data: { caliente: true } })

  await qaLogin(page, 'setter')
  await page.goto(pantalla(leadId, 'm1'), { waitUntil: 'domcontentloaded' })

  // Antes: el brief rebota.
  await page.goto(pantalla(leadId, 'm6'), { waitUntil: 'domcontentloaded' })
  await expect(page, 'antes del veredicto, el brief rebota').toHaveURL(/\/manual\/m1$/)

  // El veredicto — escrito por el setter, en la misma pantalla que la ficha.
  await page.goto(pantalla(leadId, 'm1'), { waitUntil: 'domcontentloaded' })
  await firstVisible(
    page.getByRole('radiogroup', { name: 'Score de la evaluación' }).getByRole('radio', { name: '4' }),
  ).click()
  await pickSelect(page, 'Tu veredicto', /^Avanzar con prioridad$/i)
  await firstVisible(fieldControl(page, 'Razonamiento')).fill(
    'Dueña visible, IG activo y la misma queja repetida en reseñas: hay dolor concreto.',
  )
  await firstVisible(page.getByRole('button', { name: /^Registrar evaluación$/i })).click()
  await expectToast(page, /Evaluación registrada/i)

  // La transición ocurrió igual que siempre — FICHA→EVALUADA, por la vía legal.
  await expect(async () => {
    expect((await getDossier(leadId))?.stage).toBe('EVALUADA')
  }).toPass({ timeout: 15_000 })

  // Después: el brief se alcanza. La garantía no se aflojó, se cumplió.
  await page.goto(pantalla(leadId, 'm6'), { waitUntil: 'domcontentloaded' })
  await expect(page, 'con el veredicto registrado el brief se abre').toHaveURL(/\/manual\/m6$/)
  expectNoConsoleErrors(guard)
})
