import { test, expect, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import { PANTALLAS } from '../../src/lib/leados/manual'
import { GUIA_AGENDA } from '../../src/lib/leados/guidance-content'
import {
  getSetterQa,
  createLead,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * Los DESTINOS que una pantalla nombra, alcanzables desde ahí.
 *
 * El censo de las quince pantallas encontró el mismo patrón en cinco formas. Un
 * test por CLASE (no por caso), y cada uno afirma lo que hacía falso al código
 * viejo:
 *
 *   · clase 1 — se nombra un destino y no hay enlace. mc1/mc2 con el lead
 *     rechazado decían «el botón «Reabrir construcción» está en «Correcciones»»
 *     y desde ahí no había un solo control que nombrara «Correcciones»: el único
 *     camino era el «Ir a tu paso actual» genérico del bloque de avance.
 *
 *   · clase 2 — el nombre no coincide con el del control real. El gate de la
 *     agenda decía «marcá «Respondió» en «Seguimiento»» — el título de la FASE —
 *     mientras el botón de al lado, en la misma tarjeta, se llama «Registrá lo
 *     que pasó». Acá el nombre esperado NO se escribe: sale del registro de
 *     pantallas, el mismo del que sale el botón. Si los dos se desincronizan,
 *     esto se pone rojo.
 *
 *   · clase 3 — se instruye una acción que en ese estado no existe. La munición
 *     de m16 servía sus cuatro pasos imperativos («Tocá «Buscar horarios libres
 *     de Franco»») en los tres estados por igual; con el gate cerrado ese botón
 *     no está en la pantalla — y m16 es la pantalla ACTUAL del setter en el
 *     estado más común del tramo final: demo aprobada y enviada, el negocio
 *     todavía sin contestar.
 *
 * Se afirma por VISIBILIDAD, no por presencia: el texto de un plegable cerrado
 * está en el DOM igual, y solo `toBeVisible()` distingue «está» de «se lee».
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
/** RECHAZADA: aterriza en `mr`, con mc1/mc2 navegables. */
let rechazadoId: string
/** CONSTRUCCION sin borrador: mc1/mc2 vivas, con el bloque copiable arriba. */
let construyendoId: string
/** APROBADA + demo enviada, el negocio sin contestar: m16 ES la pantalla actual. */
let esperandoRespuestaId: string
/** APROBADA + demo enviada + RESPONDIO: el gate de la agenda ABRE. */
let listoParaAgendarId: string

/** El `main` VISIBLE — el streaming de React duplica el DOM. */
function main(page: Page) {
  return firstVisible(page.locator('main'))
}

const zona = (page: Page, etiqueta: string) =>
  firstVisible(page.locator(`main section[aria-label="${etiqueta}"]`))

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  rechazadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Destino Rechazado',
      stage: 'RECHAZADA',
      status: 'RESPONDIO',
      draftUrl: 'https://destino-rechazo.netlify.app',
    })
  ).id

  construyendoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Destino Construyendo',
      stage: 'CONSTRUCCION',
      status: 'RESPONDIO',
      draftUrl: null,
      progresoCompletadas: ['estructura'],
    })
  ).id

  esperandoRespuestaId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Destino Esperando',
      stage: 'APROBADA',
      status: 'DEMO_ENVIADA',
      enviada: true,
    })
  ).id

  listoParaAgendarId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Destino Agendable',
      stage: 'APROBADA',
      status: 'RESPONDIO',
      enviada: true,
    })
  ).id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

// ── clase 1 · se nombra un destino y no hay enlace ───────────────────────────

test('clase 1 · «Correcciones» se nombra y se alcanza desde la construcción', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${rechazadoId}/manual/mc1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  const registro = zona(page, 'Registro')

  // El motivo sigue nombrando el botón real y dónde vive (eso lo trajo P5)...
  await expect(registro).toContainText('Reabrir construcción')
  await expect(registro).toContainText(PANTALLAS.mr.corto)

  // ...y ahora ESE nombre es el enlace. Contra el código viejo no existía ningún
  // control hacia `mr` en esta pantalla: el nombre iba suelto, en un párrafo
  // dentro del `<button>` del tilde (donde un `<a>` ni siquiera sería navegable).
  const aCorrecciones = firstVisible(
    page.locator(`main section[aria-label="Registro"] a[href$="/manual/mr"]`),
  )
  await expect(aCorrecciones, 'el destino nombrado es navegable desde acá').toBeVisible()
  await expect(aCorrecciones).toContainText(PANTALLAS.mr.corto)

  // Y no rebota: se llega a la pantalla que el texto prometía.
  await aCorrecciones.click()
  await expect(page).toHaveURL(/\/manual\/mr$/)
  await expect(main(page)).toContainText(PANTALLAS.mr.titulo)

  expectNoConsoleErrors(guard)
})

// ── clase 2 · el nombre no coincide con el del control real ──────────────────

test('clase 2 · el gate de la agenda nombra la pantalla como se llama el control', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${esperandoRespuestaId}/manual/m16`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page).toHaveURL(/\/manual\/m16$/)

  const registro = zona(page, 'Registro')
  await expect(registro).toContainText(GUIA_AGENDA.gate.titulo)

  // El nombre esperado NO se escribe acá: sale del registro de pantallas, que es
  // de donde el botón de abajo saca el suyo. El texto viejo decía «Seguimiento»
  // —el título de la FASE— al lado de un botón que dice otra cosa.
  const nombreDeM5 = PANTALLAS.m5.titulo
  await expect(
    registro,
    'la instrucción nombra la pantalla, no la fase',
  ).toContainText(`«Respondió» en «${nombreDeM5}»`)
  await expect(registro).not.toContainText('en «Seguimiento»')

  // Y ese nombre es exactamente el del control que lleva ahí.
  const aSeguimiento = firstVisible(
    page.locator(`main section[aria-label="Registro"] a[href$="/manual/m5"]`),
  )
  await expect(aSeguimiento).toBeVisible()
  await expect(aSeguimiento).toContainText(nombreDeM5)

  expectNoConsoleErrors(guard)
})

test('clase 2 · el bloque copiable que la munición nombra está donde dice', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${construyendoId}/manual/mc1`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page).toHaveURL(/\/manual\/mc1$/)

  // El bloque vive en «Contexto del lead», que el layout-tipo pinta ANTES de
  // «Munición»: la instrucción decía «está acá abajo» y estaba arriba.
  await expect(zona(page, 'Contexto del lead')).toContainText('Bloque para Claude Design')
  await expect(zona(page, 'Munición')).toContainText('está acá arriba')
  await expect(zona(page, 'Munición')).not.toContainText('está acá abajo')

  // Y se prueba la dirección, no solo la palabra: el contexto precede a la
  // munición en el orden del documento.
  const orden = await main(page).evaluate((nodo) => {
    const seccion = (etiqueta: string) => nodo.querySelector(`section[aria-label="${etiqueta}"]`)
    const contexto = seccion('Contexto del lead')
    const municion = seccion('Munición')
    if (!contexto || !municion) return 'falta-una-zona'
    return contexto.compareDocumentPosition(municion) & Node.DOCUMENT_POSITION_FOLLOWING
      ? 'contexto-primero'
      : 'municion-primero'
  })
  expect(orden, 'el bloque que la munición nombra está por encima de ella').toBe(
    'contexto-primero',
  )

  expectNoConsoleErrors(guard)
})

// ── clase 3 · se instruye una acción que en ese estado no existe ─────────────

test('clase 3 · con el gate cerrado la agenda no manda a tocar un botón que no está', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  const pasoQueNombraElBoton = GUIA_AGENDA.pasos[1]!
  const botonDeBusqueda = 'Buscar horarios libres de Franco'
  expect(
    pasoQueNombraElBoton,
    'el paso 2 del instructivo nombra el botón del registro (si no, este test perdió su sujeto)',
  ).toContain(botonDeBusqueda)

  // ── Gate CERRADO: demo aprobada y enviada, el negocio todavía sin contestar.
  // Es la pantalla ACTUAL del setter en ese estado, no un rincón.
  await page.goto(`/setter/leads/${esperandoRespuestaId}/manual/m16`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page).toHaveURL(/\/manual\/m16$/)

  await expect(
    page.getByRole('button', { name: botonDeBusqueda }),
    'el botón que el instructivo manda a tocar no existe en este estado',
  ).toHaveCount(0)

  // Contra el código viejo esta línea no existía: los cuatro pasos imperativos
  // salían igual, como si hubiera algo que tocar.
  await expect(
    zona(page, 'Munición'),
    'la munición declara que el recorrido es futuro',
  ).toContainText('Todavía no')

  // ── Gate ABIERTO: el mismo instructivo, ahora con sus controles en pantalla.
  // La variante es del ESTADO, no un reemplazo permanente.
  await page.goto(`/setter/leads/${listoParaAgendarId}/manual/m16`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page).toHaveURL(/\/manual\/m16$/)

  await expect(
    firstVisible(page.getByRole('button', { name: botonDeBusqueda })),
    'con el gate abierto el botón del instructivo sí está',
  ).toBeVisible()
  await expect(zona(page, 'Munición')).toContainText(botonDeBusqueda)
  await expect(zona(page, 'Munición')).not.toContainText('Todavía no')

  expectNoConsoleErrors(guard)
})
