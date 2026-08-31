import { test, expect, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { fieldControl, firstVisible } from '../helpers/setter-ui'
import { GUIA_BRIEF } from '../../src/lib/leados/guidance-content'
import { HERRAMIENTAS } from '../../src/lib/leados/herramientas'
import {
  getSetterQa,
  createLead,
  getDossier,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * LA CONFIGURACIÓN QUE FALTA, contada de una forma que el setter pueda usar.
 *
 * Dos frenos del recorrido, la misma raíz: el producto exige algo que depende de
 * una configuración que no existe, y no lo dice de una forma accionable.
 *
 *   B1 · «Respuesta del Gem (pegado completo)» venía con asterisco de
 *        obligatorio al lado de la píldora «Link pendiente». Obedecer la
 *        pantalla era imposible; la corrida salió inventando el contenido.
 *   B2 · «Buscar horarios libres de Franco» moría con «Setup B7.0 pendiente:
 *        cargá … calComUsername … calComEmbedUrl» — un código de sprint y dos
 *        columnas de la base, sin decir a quién pedírselo.
 *
 * Todo se afirma por VISIBILIDAD, no por presencia en el DOM: en esta superficie
 * el texto plegado existe igual en el árbol, y el streaming de React lo duplica.
 *
 * El estado ESPEJO —la herramienta CON link— no se puede alcanzar acá:
 * `HERRAMIENTAS` es una constante de módulo y cambiarla pide otro build. Los dos
 * lados de la regla se prueban en `tests/leados/campo-sin-herramienta.spec.ts`,
 * contra el schema real.
 */

/** El `main` VISIBLE — el streaming de React duplica el DOM. */
function main(page: Page) {
  return firstVisible(page.locator('main'))
}

const tracker: SmokeTracker = newTracker()
let setterId: string
/** EVALUADA + RESPONDIO: el gate del brief abierto, m6 con el form vivo. */
let briefId: string
/**
 * APROBADA + link YA enviado + RESPONDIO y sin agenda: es el único estado donde
 * m16 es alcanzable. Sin `enviada`, la derivación manda el lead a m15 («mandá el
 * link») y la pantalla se va sola de m16 apenas hidrata.
 */
let agendaId: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  const brief = await createLead(tracker, {
    setterId,
    businessName: 'Config Brief',
    stage: 'EVALUADA',
    status: 'RESPONDIO',
  })
  briefId = brief.id

  const agenda = await createLead(tracker, {
    setterId,
    businessName: 'Config Agenda',
    stage: 'APROBADA',
    status: 'RESPONDIO',
    enviada: true,
  })
  agendaId = agenda.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('guard · el Gem de diseño sigue sin link (si no, este archivo no tiene sujeto)', async () => {
  expect(
    HERRAMIENTAS.gemDiseno.url,
    'si Franco cargó el link del Gem, actualizá este spec: el campo vuelve a ser obligatorio',
  ).toBeNull()
})

// ── B1 · el campo que no bloquea lo que no se puede hacer ───────────────────

test('B1a · sin link, el pegado del Gem no se marca obligatorio y la pantalla dice por qué', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${briefId}/manual/m6`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m6$/)

  // La pared sigue estando (el sprint no carga links): la píldora y su salida.
  await expect(firstVisible(page.getByText('Link pendiente'))).toBeVisible()
  await expect(
    firstVisible(page.getByText('pedíselo a Franco y lo vas a poder abrir desde acá')),
  ).toBeVisible()

  // El control se toma por su ETIQUETA, no por su copy: `fieldControl` resuelve
  // el <label for> del kit. Lo que se afirma sobre la copy es el hint.
  const pegado = firstVisible(fieldControl(page, 'Respuesta del Gem'))
  await expect(pegado).toBeVisible()

  // 1) El asterisco se fue con el bloqueo. Contra el código viejo esto falla: el
  //    Field venía con `required` clavado y pintaba «*» + «(obligatorio)».
  const etiqueta = firstVisible(
    page.locator('label').filter({ hasText: GUIA_BRIEF.campos.pegadoGem.label }),
  )
  await expect(etiqueta).toBeVisible()
  await expect(etiqueta, 'marcar obligatorio algo que el producto acepta vacío').not.toContainText('*')

  // 2) Y la pantalla dice POR QUÉ dejó de exigirse, a la vista.
  await expect(
    firstVisible(page.getByText(GUIA_BRIEF.campos.pegadoGem.hintSinHerramienta!)),
    'el hint explica la pared en vez de pedir el pegado',
  ).toBeVisible()

  expectNoConsoleErrors(guard)
})

test('B1b · el paso se completa sin el pegado, y el dato faltante queda marcado', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${briefId}/manual/m6`, { waitUntil: 'domcontentloaded' })

  // El plano que el setter SÍ puede escribir solo. El pegado del Gem queda vacío
  // a propósito: es lo que no se puede traer.
  await firstVisible(fieldControl(page, 'Secciones de la demo')).fill('Hero\nProductos\nCómo pedir')

  await firstVisible(page.getByRole('button', { name: 'Guardar brief' })).click()

  // 1) Guardó. Contra el código viejo el brief rebotaba con «Pegá la respuesta
  //    completa del Gem de diseño» y el recorrido se cortaba acá.
  await expect
    .poll(async () => (await getDossier(briefId))?.stage, {
      message: 'el brief tiene que haber quedado guardado sin el pegado del Gem',
      timeout: 15_000,
    })
    .toBe('BRIEF')

  // 2) Y el dato faltante NO se guardó como si fuera texto: quedó ausente.
  const dossier = await getDossier(briefId)
  const guardado = dossier?.briefJson as { pegadoGem?: string; secciones?: string[] } | null
  expect(guardado?.pegadoGem, 'nada inventado en lugar del pegado').toBeUndefined()
  expect(guardado?.secciones).toEqual(['Hero', 'Productos', 'Cómo pedir'])

  // 3) Al volver a la pantalla, el faltante se LEE — no desaparece en silencio.
  await page.goto(`/setter/leads/${briefId}/manual/m6`, { waitUntil: 'domcontentloaded' })
  await expect(
    firstVisible(page.getByText(GUIA_BRIEF.campos.pegadoGem.faltante!)),
    'un brief sin el pegado se tiene que leer distinto de uno donde el Gem no aportó nada',
  ).toBeVisible()

  expectNoConsoleErrors(guard)
})

test('B1c · Franco ve el faltante en la revisión del dossier', async ({ page }) => {
  const guard = attachConsoleGuard(page)

  // El brief de B1b ya quedó sin pegado; se lo lleva a revisión por la base para
  // no re-hacer el camino entero (este spec no verifica el envío).
  await prisma.osLeadDossier.update({
    where: { leadId: briefId },
    data: { stage: 'EN_REVISION' },
  })

  await qaLogin(page, 'super-admin')
  await page.goto(`/admin/leados/${briefId}`, { waitUntil: 'domcontentloaded' })

  await expect(
    firstVisible(page.getByText(GUIA_BRIEF.campos.pegadoGem.faltante!)),
    'sin esto la revisión no distingue «no lo trajo» de «no lo podía traer»',
  ).toBeVisible()

  expectNoConsoleErrors(guard)
})

// ── B2 · el mensaje que hablaba en jerga ────────────────────────────────────

test('B2 · el gate de la agenda habla en idioma de negocio y dice a quién avisarle', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${agendaId}/manual/m16`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m16$/)

  // El interruptor del decisor habilita el buscador. Se toma por su ROL y su
  // nombre accesible, no por la copy de la pantalla. La espera explícita es
  // necesaria: bajo el streaming de React el control existe en el DOM antes de
  // entrar al árbol de accesibilidad, y `getByRole` —que excluye lo oculto— no
  // lo ve todavía.
  const decisor = firstVisible(page.getByRole('checkbox', { name: /quien decide/i }))
  await expect(decisor).toBeVisible()
  await decisor.check()

  const buscar = firstVisible(page.getByRole('button', { name: 'Buscar horarios libres de Franco' }))
  await expect(buscar).toBeEnabled()
  await buscar.click()

  // El aviso del gate, VISIBLE (`role="alert"` del form, no el toast que se va).
  const aviso = firstVisible(main(page).locator('[role="alert"]'))
  await expect(aviso).toBeVisible()

  // 1) Los tres asserts que fallan contra el código viejo, uno por cada cosa que
  //    el mensaje le decía a un setter no técnico.
  await expect(aviso, 'ningún código de sprint interno').not.toContainText('B7.0')
  await expect(aviso, 'ningún nombre de columna de la base').not.toContainText('calCom')
  await expect(aviso, 'no le pide al setter lo que no puede hacer').not.toContainText('cargá')

  // 2) Y dice lo que sí sirve: qué pasa y a quién pedírselo.
  await expect(aviso).toContainText('agenda de Franco')
  await expect(aviso, 'la misma salida que ya usa la píldora de las herramientas').toContainText(
    'Avisale a Franco',
  )

  expectNoConsoleErrors(guard)
})
