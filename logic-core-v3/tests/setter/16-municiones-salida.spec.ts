import { test, expect, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import { HERRAMIENTAS, HERRAMIENTAS_ORDEN } from '../../src/lib/leados/herramientas'
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
 * La SALIDA de las herramientas sin link, a la vista.
 *
 * El primer punto de frenada del recorrido entero: el setter llega al segundo
 * paso de su primer negocio, la pantalla le dice «pegalo en el evaluador», y el
 * evaluador dice «Link pendiente». La respuesta —«pedíselo a Franco y lo vas a
 * poder abrir desde acá»— existía, plegada bajo un título que no la prometía
 * («Qué es y cómo se usa»). Nadie lo abría: 24 choques contra esa pared en una
 * sola corrida.
 *
 * Lo que este archivo FIJA es lo caro de perder: que la salida esté PRESENTE y
 * NO PLEGADA en cada pantalla donde aparece la píldora. Se afirma por
 * VISIBILIDAD, no por presencia en el DOM: el texto plegado dentro de un
 * `<details>` cerrado existe en el DOM igual —así estaba antes— y solo
 * `toBeVisible()` distingue las dos cosas. Y se afirma sin tocar un plegable: la
 * aserción `details[open] === 0` prueba que se leyó tal como la pantalla carga.
 *
 * Este sprint NO carga las URLs que faltan (son de Franco, cuatro campos en
 * `herramientas.ts`): hace que el setter sepa qué hacer cuando choca con la
 * pared. Por eso el guard de abajo — el día que Franco las cargue, la pared
 * desaparece y estos asserts se quedan sin sujeto: que falle ruidoso, pidiendo
 * actualizar el spec, en vez de pasar en verde sobre nada.
 */

/** La línea que destraba. */
const SALIDA = 'pedíselo a Franco y lo vas a poder abrir desde acá'
const PILDORA = 'Link pendiente'

const tracker: SmokeTracker = newTracker()
let setterId: string
/** CONSTRUCCION con fases a medias y SIN borrador: m2/m6 completadas, mc1/mc2 y m13 vivas. */
let construyendoId: string
/** EVALUADA con el opener pendiente: aterriza en m4. */
let openerId: string
/** RECHAZADA con borrador publicado: aterriza en mr, con m13 congelada detrás. */
let rechazadoId: string
/** EVALUADA con toques SIN_RESPUESTA y el toque vencido: aterriza en m5. */
let toqueId: string

/** El `main` VISIBLE — el streaming de React duplica el DOM. */
function main(page: Page) {
  return firstVisible(page.locator('main'))
}

/**
 * Ningún plegable abierto: la pantalla se está leyendo tal cual carga. Contar
 * sobre `main` es seguro aunque el streaming duplique el árbol — cero por dos
 * sigue siendo cero.
 */
async function nadaDesplegado(page: Page, donde: string) {
  await expect(
    page.locator('main details[open]'),
    `${donde}: la salida se lee sin abrir nada`,
  ).toHaveCount(0)
}

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  const construyendo = await createLead(tracker, {
    setterId,
    businessName: 'Municion Construccion',
    stage: 'CONSTRUCCION',
    status: 'RESPONDIO',
    draftUrl: null,
    progresoCompletadas: ['estructura'],
  })
  construyendoId = construyendo.id

  const opener = await createLead(tracker, {
    setterId,
    businessName: 'Municion Opener',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
  })
  openerId = opener.id

  const rechazado = await createLead(tracker, {
    setterId,
    businessName: 'Municion Rechazado',
    stage: 'RECHAZADA',
    status: 'RESPONDIO',
    draftUrl: 'https://municion-rechazo.netlify.app',
  })
  rechazadoId = rechazado.id

  // Mismo aterrizaje en m5 que 08: EVALUADA + toques SIN_RESPUESTA + toque vencido.
  const toque = await createLead(tracker, {
    setterId,
    businessName: 'Municion Toque',
    stage: 'EVALUADA',
    status: 'PROSPECTO',
  })
  toqueId = toque.id
  await registerActivity(toqueId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'toque 1')
  await registerActivity(toqueId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'toque 2')
  await prisma.osLead.update({
    where: { id: toqueId },
    data: { nextFollowUpAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('la pared que este spec cubre sigue existiendo (guard del registro)', async () => {
  // Sin esto el archivo entero podría pasar en verde el día que las URLs se
  // carguen: sin píldora no hay salida que mostrar, y «no encontré la salida»
  // se leería igual que «la salida está bien». Que hable el registro.
  const sinUrl = HERRAMIENTAS_ORDEN.filter((id) => !HERRAMIENTAS[id].url)
  expect(
    sinUrl,
    'si Franco cargó los links, actualizá este spec: la pared ya no está',
  ).toEqual(['evaluador', 'gemDiseno', 'claudeDesign', 'gemOutreach'])
})

/**
 * Las pantallas donde la píldora aparece dentro de `ToolGuide`, con el lead que
 * las hace alcanzables. Es el recorrido real: la evaluación, el brief, las dos
 * de construcción, el opener y la reentrada del re-loop.
 */
const PANTALLAS_CON_PARED = [
  { paso: 'm2', lead: () => construyendoId, herramienta: 'Chat de evaluación (Sonnet)' },
  { paso: 'm6', lead: () => construyendoId, herramienta: 'Gem de diseño' },
  { paso: 'mc1', lead: () => construyendoId, herramienta: 'Claude Design' },
  { paso: 'mc2', lead: () => construyendoId, herramienta: 'Claude Design' },
  { paso: 'm4', lead: () => openerId, herramienta: 'Gem de outreach' },
  { paso: 'mr', lead: () => rechazadoId, herramienta: 'Claude Design' },
] as const

for (const { paso, lead, herramienta } of PANTALLAS_CON_PARED) {
  test(`${paso} · la salida del link pendiente se lee sin abrir nada`, async ({ page }) => {
    const guard = attachConsoleGuard(page)
    await qaLogin(page, 'setter')

    await page.goto(`/setter/leads/${lead()}/manual/${paso}`, { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(new RegExp(`/manual/${paso}$`))

    // 1) La pared está: la herramienta nombrada y su píldora de link pendiente.
    //    En `mr` esto ya falla contra el código viejo — la pantalla servía el
    //    bloque copiable de Claude Design sin nombrar la herramienta que lo recibe.
    await expect(main(page), `${paso} nombra su herramienta`).toContainText(herramienta)
    await expect(firstVisible(page.getByText(PILDORA)), `${paso} muestra la pared`).toBeVisible()

    // 2) Y la salida está al lado, VISIBLE. Éste es el assert que falla contra el
    //    código viejo: el texto existía, plegado dentro de «Qué es y cómo se usa».
    await expect(
      firstVisible(page.getByText(SALIDA)),
      `${paso} dice qué hacer con el link pendiente`,
    ).toBeVisible()

    // 3) Sin haber abierto un solo plegable.
    await nadaDesplegado(page, paso)

    expectNoConsoleErrors(guard)
  })
}

test('m13 · con el link cargado no hay pared, y tampoco salida de relleno', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  // Netlify Drop es la única herramienta con URL real. El contra-ejemplo importa:
  // prueba que la salida es condicional —aparece SOLO donde hay pared— y no una
  // línea suelta agregada a todas las pantallas por las dudas.
  await page.goto(`/setter/leads/${construyendoId}/manual/m13`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m13$/)

  await expect(main(page)).toContainText('Netlify Drop')
  await expect(firstVisible(page.getByRole('link', { name: 'Abrir Netlify Drop' }))).toBeVisible()
  await expect(page.getByText(SALIDA), 'sin pared no hay salida').toHaveCount(0)
  await expect(page.getByText(PILDORA), 'sin pared no hay píldora').toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('m5 · la salida nunca queda más adentro que la pared que destraba', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${toqueId}/manual/m5`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m5$/)

  // En m5 la píldora NO está a la vista: vive dentro del plegable de objeciones,
  // y con razón — la objeción es un caso, no el estado normal del toque. El
  // título de ese plegable sí promete lo que hay adentro. Lo que se fija acá es
  // que la salida esté a la MISMA profundidad que la pared, nunca una más
  // abajo: sin abrir nada, ninguna de las dos se ve.
  await nadaDesplegado(page, 'm5')
  await expect(page.getByText(PILDORA)).toBeHidden()
  await expect(page.getByText(SALIDA)).toBeHidden()

  // Al abrirlo aparecen LAS DOS. Contra el código viejo salía la píldora sola:
  // «Abrí el Gem para pegarlo» y nada más, en el peor momento posible — al setter
  // le acaban de tirar una objeción.
  await firstVisible(page.getByText('¿Te tiraron una objeción? Armá el input del Gem')).click()
  await expect(firstVisible(page.getByText(PILDORA))).toBeVisible()
  await expect(
    firstVisible(page.getByText(SALIDA)),
    'm5 recibe la misma aclaración que m4',
  ).toBeVisible()

  expectNoConsoleErrors(guard)
})

test('m13 congelado · la munición deja de mandar a un campo que no existe', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  // RECHAZADA con borrador publicado: el motor guarda el link SOLO en
  // CONSTRUCCION, así que el registro muestra el borrador congelado y el botón de
  // reabrir — abajo no hay campo. La munición seguía diciendo «pegala acá abajo».
  await page.goto(`/setter/leads/${rechazadoId}/manual/m13`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m13$/)

  await expect(main(page), 'el estado es el congelado').toContainText(
    'Borrador congelado por el rechazo',
  )
  await expect(main(page)).not.toContainText('pegala acá abajo')
  await expect(main(page)).toContainText('se abre cuando reabrís la construcción')

  // Y en construcción el instructivo vuelve a ser el de siempre — la variante es
  // del estado, no un reemplazo permanente.
  await page.goto(`/setter/leads/${construyendoId}/manual/m13`, { waitUntil: 'domcontentloaded' })
  await expect(main(page)).toContainText('pegala acá abajo')

  expectNoConsoleErrors(guard)
})
