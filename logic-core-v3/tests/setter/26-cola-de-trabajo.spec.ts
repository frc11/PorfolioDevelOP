import { test, expect } from '@playwright/test'
import { mintSessionCookie, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import {
  createSetter,
  createLead,
  createNotice,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * P21 — LA COLA DE TRABAJO. Tres cosas, y las tres fallan contra el código
 * viejo:
 *
 *   1. el trabajo del día se VE como lista (no sólo como foco): dos leads
 *      accionables, dos filas, cada una con su acción y su control;
 *   2. lo que subió a la cola NO se repite abajo como aviso (y lo que sigue
 *      siendo noticia sí se queda);
 *   3. la cola de un setter no muestra un lead de otro.
 *
 * Se afirma por VISIBILIDAD (`toBeVisible`), no por presencia: un nodo presente
 * y plegado pasa un `toHaveCount(1)` sin que el setter lo vea nunca.
 *
 * Cada test usa su PROPIO setter recién creado, con exactamente los leads que
 * siembra. Contra el persona QA (84 leads, 49 accionables, 37 avisos) no se
 * puede afirmar nada sobre el contenido de una cola acotada: el aserto diría
 * más sobre la seed que sobre el código.
 */

const tracker: SmokeTracker = newTracker()
let colaId: string
let ajenoId: string
let aprobadaId: string
let rechazadaId: string
let enRevisionId: string

const APROBADA = 'ColaAprobada Lista'
const RECHAZADA = 'ColaRechazada Rehacer'
const EN_REVISION = 'ColaRevision Esperando'
const AJENO = 'ColaAjena DeOtroSetter'
const SALIENTE = 'ColaSaliente YaNoEsTuyo'

test.beforeAll(async () => {
  const dueno = await createSetter(tracker, 'cola-a')
  colaId = dueno.id
  const otro = await createSetter(tracker, 'cola-b')
  ajenoId = otro.id

  // Los dos casos que la consigna nombra: la demo aprobada esperando envío y el
  // rechazo esperando retrabajo. Ambos caen en `grupos.trabajar` desde antes de
  // este sprint (`grupoPara`); lo que faltaba era la superficie que los muestre.
  const aprobada = await createLead(tracker, {
    setterId: colaId,
    businessName: APROBADA,
    stage: 'APROBADA',
    status: 'RESPONDIO',
    finalUrl: 'https://cola-final.example.com',
  })
  aprobadaId = aprobada.id

  const rechazada = await createLead(tracker, {
    setterId: colaId,
    businessName: RECHAZADA,
    stage: 'RECHAZADA',
    status: 'RESPONDIO',
  })
  rechazadaId = rechazada.id

  // En vuelo: le toca a Franco. NO es trabajo del setter → no entra a la cola.
  const revision = await createLead(tracker, {
    setterId: colaId,
    businessName: EN_REVISION,
    stage: 'EN_REVISION',
    status: 'RESPONDIO',
  })
  enRevisionId = revision.id

  // Lead del OTRO setter: nunca puede aparecer en la cola del primero.
  await createLead(tracker, {
    setterId: ajenoId,
    businessName: AJENO,
    stage: 'BRIEF',
    status: 'RESPONDIO',
  })

  // Los avisos de los dos handoffs (los que hoy son la única cara del trabajo).
  await createNotice({
    setterId: colaId,
    leadId: aprobadaId,
    kind: 'DEMO_APROBADA',
    title: 'Franco aprobó tu demo',
    body: `${APROBADA}: la demo está aprobada. Enviá el link ya, recién aprobada.`,
  })
  await createNotice({
    setterId: colaId,
    leadId: rechazadaId,
    kind: 'DEMO_RECHAZADA',
    title: 'Franco pidió cambios',
    body: `${RECHAZADA}: la demo volvió con correcciones. Reabrí la construcción y rehacé.`,
  })
  // El que NO es trabajo: informa y se queda. Sin lead (el setter ya no es dueño).
  await createNotice({
    setterId: colaId,
    leadId: null,
    kind: 'LEAD_REASIGNADO_SALIENTE',
    title: 'Te reasignaron un lead',
    body: `${SALIENTE} pasó a otro setter. Ya no está en tu cartera.`,
  })
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** El bloque de la cola. Todo aserto de contenido se scopea acá adentro. */
const cola = (page: import('@playwright/test').Page) =>
  page.locator('section[aria-label="Tu cola de hoy"]')

test('P21-1 · el trabajo del día se VE como lista, con su acción y su control', async ({
  page,
  baseURL,
}) => {
  const guard = attachConsoleGuard(page)
  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3003', {
    userId: colaId,
    email: 'irrelevant',
    role: 'SETTER',
  })
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // La cola existe y se ve. Contra el código viejo esto ya falla: no hay
  // superficie que renderice `grupos.trabajar`.
  await expect(cola(page), 'la cola de trabajo se renderiza').toBeVisible()

  // Los DOS accionables están, no uno. El foco encabeza (card destacado) y el
  // otro es una fila — pero los dos se leen sin abrir nada.
  await expect(firstVisible(cola(page).getByText(APROBADA))).toBeVisible()
  await expect(firstVisible(cola(page).getByText(RECHAZADA))).toBeVisible()

  // Cada uno dice QUÉ hacer: la sugerencia de `flow.ts`, la misma que lee la
  // cartera. Sin esto la cola sería una lista de nombres.
  await expect(
    firstVisible(cola(page).getByText('Demo aprobada — mandá el link al negocio')),
  ).toBeVisible()
  await expect(
    firstVisible(
      cola(page).getByText('Franco pidió correcciones — reabrí la construcción y rehacé'),
    ),
  ).toBeVisible()

  // Y cada uno LLEVA a hacerlo: el foco con "Ir a trabajarlo", la fila con
  // "Trabajar". Dos controles, uno por lead accionable.
  const controles = cola(page).getByRole('button', { name: /Ir a trabajarlo|^Trabajar / })
  await expect(controles, 'cada ítem de la cola tiene su control').toHaveCount(2)
  await expect(controles.first()).toBeVisible()
  await expect(controles.last()).toBeVisible()

  // Lo que NO es trabajo del setter no entra: la demo en revisión le toca a
  // Franco y sigue en la cartera, no en la cola.
  await expect(
    cola(page).getByText(EN_REVISION),
    'lo que espera a Franco no es trabajo del setter',
  ).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('P21-2 · lo que subió a la cola NO se repite en novedades; la noticia se queda', async ({
  page,
  baseURL,
}) => {
  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3003', {
    userId: colaId,
    email: 'irrelevant',
    role: 'SETTER',
  })
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  const novedades = page.locator('section[aria-label="Novedades de tu cartera"]')

  // El aviso de la demo aprobada y el del rechazo YA no viven abajo: su lead es
  // una tarea arriba. Contra el código viejo los dos están (el dedup alcanzaba
  // sólo al foco, un lead), así que este aserto es el que prueba el "nada se
  // duplica".
  await expect(
    novedades.getByText('Franco aprobó tu demo'),
    'el aviso de la demo aprobada no se repite: ya es una tarea en la cola',
  ).toHaveCount(0)
  await expect(
    novedades.getByText('Franco pidió cambios'),
    'el aviso del rechazo no se repite: ya es una tarea en la cola',
  ).toHaveCount(0)

  // El conteo en las DOS puntas, por UNIDAD DE PRESENTACIÓN (una tarjeta de la
  // cola / una fila de novedades) y no por nodo de texto: contar nodos sueltos
  // depende de cuántos `<span>` anide el markup, y eso no es lo que se está
  // afirmando. Uno arriba, cero abajo: eso es "no se duplica".
  const unidadesCola = cola(page).locator(
    'section[aria-label="Tu foco ahora"], [data-slot="item-cola"]',
  )
  for (const nombre of [APROBADA, RECHAZADA]) {
    await expect(
      unidadesCola.filter({ hasText: nombre }),
      `${nombre} ocupa exactamente UNA unidad de la cola`,
    ).toHaveCount(1)
    await expect(
      novedades.locator('li').filter({ hasText: nombre }),
      `${nombre} no ocupa ninguna fila de novedades`,
    ).toHaveCount(0)
  }

  // Y lo que sigue siendo NOTICIA se queda: la reasignación-saliente no es
  // trabajo (el setter ya no es dueño) y no tiene nada que abrir.
  await expect(firstVisible(novedades.getByText('Te reasignaron un lead'))).toBeVisible()

  // Novedades quedó DEBAJO de la cola: el trabajo va primero.
  const topeCola = await cola(page).evaluate((el) => el.getBoundingClientRect().top)
  const topeNovedades = await novedades.evaluate((el) => el.getBoundingClientRect().top)
  expect(topeNovedades, 'las novedades van después de la cola').toBeGreaterThan(topeCola)
})

test('P21-3 · la cola de un setter no muestra leads de otro', async ({ page, baseURL }) => {
  // El dueño: su cola tiene lo suyo y NADA del otro.
  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3003', {
    userId: colaId,
    email: 'irrelevant',
    role: 'SETTER',
  })
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(cola(page).getByText(APROBADA))).toBeVisible()
  await expect(
    page.getByText(AJENO),
    'el lead del otro setter no aparece en NINGUNA parte del panel',
  ).toHaveCount(0)

  // El otro setter: su cola tiene SU lead y ninguno de los del primero. El
  // aserto va en las dos direcciones a propósito — una consulta que se olvidara
  // del filtro se vería desde un solo lado si sólo se mirara uno.
  await page.context().clearCookies()
  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3003', {
    userId: ajenoId,
    email: 'irrelevant',
    role: 'SETTER',
  })
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(cola(page).getByText(AJENO))).toBeVisible()
  for (const nombre of [APROBADA, RECHAZADA, EN_REVISION]) {
    await expect(
      page.getByText(nombre),
      `${nombre} es del otro setter: nunca se renderiza acá`,
    ).toHaveCount(0)
  }

  // Y el aislamiento a nivel datos, para que el verde de arriba no dependa sólo
  // del render: los leads del primero siguen siendo del primero.
  const propios = await prisma.osLead.findMany({
    where: { id: { in: [aprobadaId, rechazadaId, enRevisionId] } },
    select: { assignedToId: true },
  })
  expect(propios).toHaveLength(3)
  for (const lead of propios) {
    expect(lead.assignedToId, 'ninguna lectura de la cola reasignó nada').toBe(colaId)
  }
})

test('P21-4 · un setter sin trabajo pendiente ve algo útil, no una cola en blanco', async ({
  page,
  baseURL,
}) => {
  // Setter propio con UN lead en vuelo (le toca a Franco): cartera con
  // contenido, cola vacía. Es el estado que la consigna pide mostrar.
  const enEspera = await createSetter(tracker, 'cola-espera')
  await createLead(tracker, {
    setterId: enEspera.id,
    businessName: 'ColaEspera SoloEnVuelo',
    stage: 'EN_REVISION',
    status: 'RESPONDIO',
  })

  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3003', {
    userId: enEspera.id,
    email: 'irrelevant',
    role: 'SETTER',
  })
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // Sin nada accionable la cola no se dibuja vacía: el "todo en espera" (2.1b)
  // ocupa su lugar y dice a quién se está esperando.
  await expect(cola(page), 'sin trabajo no hay cola vacía colgada').toHaveCount(0)
  const espera = page.locator('section[aria-label="Nada para trabajar ahora"]')
  await expect(espera).toBeVisible()
  await expect(firstVisible(espera.getByText(/No hay nada para trabajar ahora/i))).toBeVisible()
})
