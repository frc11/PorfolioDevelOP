import { test, expect, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, vis } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  createNotice,
  fichaConSenal,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * P23 — los tres defectos de la segunda corrida del novato que sólo existen
 * OPERANDO la aplicación:
 *
 *  N4 · el ping-pong `espera` ⇄ `m5`. Se recorre CON LAS DOS PANTALLAS: el
 *       defecto no está en ninguna de las dos, está en la composición, y un test
 *       de pantalla suelta lo deja pasar (así pasó veintidós sprints).
 *  N1 · el veredicto que se pierde al salir sin avisar.
 *  N6 · dos avisos del mismo lead, uno de ellos ya sin efecto.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let esperaLeadId: string
let fichaLeadId: string
let avisoLeadId: string
let avisoLeadNombre: string

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // POSTERGADO con la reactivación en el FUTURO → pausa comercial vigente →
  // `posicionDe` aterriza en `espera` con m5 habilitada. Es el estado exacto del
  // ciclo (`manual.ts`, rama de la pausa).
  const espera = await createLead(tracker, {
    setterId,
    businessName: 'P23 Espera Ciclo',
    stage: 'EVALUADA',
    status: 'POSTERGADO',
    reactivateAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
  esperaLeadId = espera.id

  // FICHA con señal mínima completa → m1 monta la ficha Y el formulario del
  // veredicto (el bloque «Tu decisión»).
  const ficha = await createLead(tracker, {
    setterId,
    businessName: 'P23 Ficha Veredicto',
    stage: 'FICHA',
    status: 'PROSPECTO',
  })
  fichaLeadId = ficha.id
  await prisma.osLeadDossier.update({
    where: { leadId: fichaLeadId },
    data: { fichaJson: fichaConSenal() },
  })

  // El lead de los dos avisos contradictorios: hoy está en CONSTRUCCION, así que
  // NI «enviá el link» NI «reabrí la construcción» corresponden. Es la forma
  // exacta que tenía en la cartera medida.
  const conAvisos = await createLead(tracker, {
    setterId,
    businessName: 'P23 Avisos Contradictorios',
    stage: 'CONSTRUCCION',
    status: 'RESPONDIO',
  })
  avisoLeadId = conAvisos.id
  avisoLeadNombre = conAvisos.businessName
  await createNotice({
    setterId,
    leadId: avisoLeadId,
    kind: 'DEMO_RECHAZADA',
    title: 'Franco pidió cambios',
    body: `${avisoLeadNombre}: la demo volvió con correcciones. Reabrí la construcción y rehacé.`,
  })
  await createNotice({
    setterId,
    leadId: avisoLeadId,
    kind: 'DEMO_APROBADA',
    title: 'Franco aprobó tu demo',
    body: `${avisoLeadNombre}: la demo está aprobada. Enviá el link ya, recién aprobada.`,
  })
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** El enlace de vuelta del bloque de avance, si la pantalla lo pinta. */
function volverAlPasoActual(page: Page) {
  return page.locator('main section[aria-label="Avance"] a')
}

test('N4 · el ciclo espera ⇄ m5 se corta, y la salida que queda lleva a algún lado', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  // ── Pantalla 1: `espera`. El paso de ahora, y ofrece su única puerta.
  await page.goto(`/setter/leads/${esperaLeadId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/espera$/)

  const puerta = firstVisible(
    page.locator('main a[href$="/manual/m5"]').filter({ hasText: 'Registralo' }),
  )
  await expect(
    puerta,
    'la espera tiene que seguir ofreciendo registrar una respuesta temprana: es la ida, y es ' +
      'trabajo real — el sprint corta la VUELTA, no esta puerta',
  ).toBeVisible()

  // ── Pantalla 2: m5, entrando POR esa puerta. Acá vivía la vuelta.
  await puerta.click()
  await expect(page).toHaveURL(/\/manual\/m5$/)

  // ANTES de afirmar una ausencia, esperar a que la pantalla EXISTA. `toHaveCount(0)`
  // se satisface en el primer tick posterior a la navegación —cuando todavía no
  // se renderizó nada— y da verde sobre el defecto presente. Medido: sin esta
  // espera el test pasaba contra el brazo VIEJO, con el ciclo a la vista.
  await firstVisible(page.locator('main [aria-label="Registro"]')).waitFor({ state: 'visible' })
  await expect(
    volverAlPasoActual(page),
    'm5 no puede ofrecer «Ir a tu paso actual» cuando el paso actual es la espera que acaba de ' +
      'mandar al setter acá: espera ofrece m5, m5 devolvía a espera, y espera vuelve a ofrecer ' +
      'm5 — el setter no salía',
  ).toHaveCount(0)

  // Y la regla del sprint: cortar el ciclo no puede dejar al setter encerrado del
  // otro lado. Lo que queda en m5 tiene que llevar a alguna parte.
  // Por TEXTO y no por rol: en el brazo viejo la salida era un `<Link>` y acá es
  // un `<button>`. Lo que se afirma es que la salida EXISTE, no de qué elemento
  // está hecha — si no, este renglón se cae por el cambio de N1 y tapa lo que
  // este test viene a medir.
  await expect(
    firstVisible(page.getByText('Volver a tu día')),
    'm5 conserva la salida del manual',
  ).toBeVisible()
  await expect(
    vis(page.locator('main').getByRole('button', { name: /Registrar/i })).first(),
    'm5 conserva su propia acción: el setter entró a registrar algo y puede hacerlo',
  ).toBeVisible()

  // La vuelta SIGUE existiendo donde no cierra ningún ciclo: en una pantalla que
  // la espera no ofrece. Sin esto, «no hay enlace» pasaría en verde por haber
  // borrado el bloque de avance entero.
  await page.goto(`/setter/leads/${esperaLeadId}/manual/m1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m1$/)
  await expect(
    volverAlPasoActual(page),
    'en m1 (que la espera no ofrece) el bloque de avance tiene que seguir estando: el sprint ' +
      'suprime UNA arista, no el mecanismo',
  ).toHaveCount(1)

  expectNoConsoleErrors(guard)
})

test('N1 · salir con el veredicto cargado avisa, y la promesa de autoguardado nombra a la ficha', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${fichaLeadId}/manual/m1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m1$/)

  // La promesa de la ficha tiene que decir DE QUÉ habla: sin sujeto se leía como
  // que también cubría al veredicto, que es lo que hacía perder el juicio.
  await expect(
    firstVisible(page.getByText(/se guarda sola mientras escribís/i)),
    'la promesa de autoguardado tiene que nombrar a la ficha',
  ).toBeVisible()
  await expect(
    page.getByText('Se guarda solo mientras escribís'),
    'la promesa sin sujeto no puede volver: es la que cubría al veredicto sin cubrirlo',
  ).toHaveCount(0)

  // Abrir el bloque del veredicto y cargar los tres campos.
  await firstVisible(page.getByRole('button', { name: /Tu decisión/ })).click()
  const score = firstVisible(page.locator('[aria-label="Score de la evaluación"] button').nth(3))
  await score.waitFor({ state: 'visible' })

  // El veredicto DICE que no se guarda solo, antes de que el setter escriba.
  await expect(
    firstVisible(page.getByText(/Esto no se guarda solo/i)),
    'el bloque del veredicto tiene que advertir que es de una sola pasada',
  ).toBeVisible()

  // Sin nada cargado, salir no molesta.
  // Por TEXTO: la salida es un `<Link>` (conserva el href y el «abrir en pestaña
  // nueva»), no un botón — ver `salida-manual.tsx`.
  const salir = firstVisible(page.getByText('Volver a tu día'))
  await salir.click()
  await expect(page, 'sin nada cargado, salir sale derecho').toHaveURL(/\/setter$/)

  await page.goBack()
  await expect(page).toHaveURL(/\/manual\/m1$/)
  await firstVisible(page.getByRole('button', { name: /Tu decisión/ })).click()
  await firstVisible(page.locator('[aria-label="Score de la evaluación"] button').nth(3)).click()

  // Ahora sí: con el juicio cargado, salir tiene que preguntar.
  // Se busca por el TEXTO y no por `getByRole('dialog')`: el `Modal` compartido
  // no declara `role="dialog"` (queda anotado como hallazgo fuera de scope), y
  // afirmar sobre un rol que el componente no pone daría rojo con el producto
  // funcionando.
  await firstVisible(page.getByText('Volver a tu día')).click()
  const dialogo = firstVisible(page.getByText('Tenés algo cargado sin registrar'))
  await expect(
    dialogo,
    'con el veredicto cargado y sin registrar, salir tiene que avisar que se pierde',
  ).toBeVisible()
  await expect(page, 'y no puede haber navegado todavía').toHaveURL(/\/manual\/m1$/)

  // «Seguir acá» devuelve a la pantalla con el trabajo intacto.
  await firstVisible(page.getByRole('button', { name: 'Seguir acá' })).click()
  await expect(page.getByText('Tenés algo cargado sin registrar')).toHaveCount(0)
  await expect(page).toHaveURL(/\/manual\/m1$/)
  await expect(
    firstVisible(page.locator('[aria-label="Score de la evaluación"] button').nth(3)),
    'el score cargado sigue ahí',
  ).toHaveAttribute('aria-checked', 'true')

  // Y salir a propósito sí sale.
  await firstVisible(page.getByText('Volver a tu día')).click()
  await firstVisible(page.getByRole('button', { name: /Salir y perderlo/ })).click()
  await expect(page).toHaveURL(/\/setter$/)

  expectNoConsoleErrors(guard)
})

test('N6 · dos avisos del mismo lead: el que ya no corresponde deja de dar la orden', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  const panel = page.locator('main [aria-label="Novedades de tu cartera"]')
  await panel.waitFor({ state: 'visible' })

  // El lead está en CONSTRUCCION: NINGUNA de las dos órdenes corresponde hoy.
  const aprobada = panel.locator('li').filter({ hasText: 'Enviá el link ya' }).first()
  const rechazada = panel.locator('li').filter({ hasText: 'Reabrí la construcción' }).first()

  for (const [nombre, fila] of [
    ['la aprobación', aprobada],
    ['el rechazo', rechazada],
  ] as const) {
    await expect(fila, `${nombre} tiene que seguir en pantalla: el hecho pasó`).toBeVisible()
    await expect(
      fila.getByText(/^Ahora:/),
      `${nombre} ya no corresponde (el lead está en construcción): tiene que decir qué pide el ` +
        'lead HOY en vez de seguir dando su orden vieja',
    ).toBeVisible()
  }

  // Y lo que dice EN SU LUGAR es lo que dice la cola para ese mismo lead — no un
  // texto propio del panel de avisos. Si divergen, volvemos a tener dos
  // superficies mandando cosas distintas.
  const loQueDiceElAviso = (await aprobada.textContent())?.replace(/\s+/g, ' ') ?? ''
  expect(
    loQueDiceElAviso,
    'el reemplazo sale de `proximaAccion`, el mismo dato que ordena la cola',
  ).toContain('publicá el borrador')

  expectNoConsoleErrors(guard)
})
