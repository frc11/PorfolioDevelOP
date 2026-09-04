import { test, expect } from '@playwright/test'
import { attachConsoleGuard, expectNoConsoleErrors, mintSessionCookie } from '../helpers/setter-auth'
import { firstVisible, expandCartera, expandirGruposCartera } from '../helpers/setter-ui'
import {
  createSetter,
  createLead,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * P22 — LA CARTERA AGRUPADA. Cinco cosas, y las cinco fallan contra el código
 * viejo (que dibujaba una lista plana de 84 tarjetas iguales):
 *
 *   1. la cartera se reparte en GRUPOS con el nombre que el setter ya lee en el
 *      filtro, y el conteo del encabezado es el de verdad;
 *   2. el grupo del setter («Para trabajar») abre solo; el resto arranca plegado
 *      —y plegado quiere decir que sus tarjetas NO están, no que estén ocultas;
 *   3. buscando NO se agrupa: la lista vuelve a ser plana;
 *   4. los tres controles de la tarjeta tienen rótulo VISIBLE además del
 *      accesible, y el badge de etapa en jerga ya no está;
 *   5. la cartera de un setter no muestra un lead de otro — y eso se afirma con
 *      TODOS los grupos abiertos, porque con uno plegado el aserto de ausencia
 *      sería verde por no-montado en vez de por no-estar.
 *
 * Se afirma por VISIBILIDAD (`toBeVisible`), no por presencia: un nodo presente
 * y plegado pasa un `toHaveCount(1)` sin que el setter lo vea nunca.
 *
 * Cada test usa su PROPIO setter recién creado, con exactamente los leads que
 * siembra. Contra el persona QA (84 leads repartidos en ocho vistas) no se
 * puede afirmar nada sobre el contenido de un grupo acotado: el aserto diría
 * más sobre la seed que sobre el código.
 */

const tracker: SmokeTracker = newTracker()
let duenoId: string
let ajenoId: string

const TRABAJAR_A = 'GrupoTrabajar Primera'
const TRABAJAR_B = 'GrupoTrabajar Segunda'
const EN_REVISION = 'GrupoRevision Esperando'
const POSTERGADO = 'GrupoPostergado ParaMasAdelante'
const AJENO = 'GrupoAjena DeOtroSetter'

test.beforeAll(async () => {
  const dueno = await createSetter(tracker, 'cartera-a')
  duenoId = dueno.id
  const otro = await createSetter(tracker, 'cartera-b')
  ajenoId = otro.id

  // Dos para trabajar: el grupo que la cartera abre sola.
  await createLead(tracker, {
    setterId: duenoId,
    businessName: TRABAJAR_A,
    stage: 'APROBADA',
    status: 'RESPONDIO',
    finalUrl: 'https://cartera-final.example.com',
  })
  await createLead(tracker, {
    setterId: duenoId,
    businessName: TRABAJAR_B,
    stage: 'RECHAZADA',
    status: 'RESPONDIO',
  })

  // En vuelo: le toca a Franco → cae en «Esperando revisión», que arranca plegado.
  await createLead(tracker, {
    setterId: duenoId,
    businessName: EN_REVISION,
    stage: 'EN_REVISION',
    status: 'RESPONDIO',
  })

  // Postergado por el negocio, con la fecha todavía por delante → `grupoPara` lo
  // manda a `seguimiento` y `vistaDeLead` a su vista propia «Postergados por el
  // negocio». Otro grupo que arranca plegado.
  //
  // (Acá había un «APROBADA sin finalUrl», que también cae en seguimiento — pero
  // NO por esta puerta: `dossierCreateFor` le pone un `finalUrl` por defecto a
  // todo lead APROBADA, así que el fixture terminaba en «Para trabajar» y el
  // grupo que el test buscaba no existía. El postergado no depende del dossier.)
  await createLead(tracker, {
    setterId: duenoId,
    businessName: POSTERGADO,
    stage: 'BRIEF',
    status: 'POSTERGADO',
    reactivateAt: new Date(Date.now() + 30 * 86_400_000),
  })

  // Lead del OTRO setter: nunca puede aparecer en la cartera del primero.
  await createLead(tracker, {
    setterId: ajenoId,
    businessName: AJENO,
    stage: 'BRIEF',
    status: 'RESPONDIO',
  })
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

async function abrirPanel(page: import('@playwright/test').Page, baseURL: string | undefined) {
  await mintSessionCookie(page.context(), baseURL ?? 'http://localhost:3001', {
    userId: duenoId,
    email: 'irrelevant',
    role: 'SETTER',
  })
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
}

test('D1 · la cartera se reparte en grupos con nombre y conteo, y «Para trabajar» abre solo', async ({
  page,
  baseURL,
}) => {
  const guard = attachConsoleGuard(page)
  await abrirPanel(page, baseURL)
  await expandCartera(page)

  // El grupo del setter: abierto, con su conteo y sus dos tarjetas VISIBLES.
  const trabajar = firstVisible(
    page.locator('[data-slot="grupo-cartera"]').filter({ hasText: 'Para trabajar' }),
  )
  await expect(trabajar).toBeVisible()
  await expect(trabajar.getByRole('button', { name: /Para trabajar/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  await expect(firstVisible(page.getByText(TRABAJAR_A))).toBeVisible()
  await expect(firstVisible(page.getByText(TRABAJAR_B))).toBeVisible()

  // Los otros dos grupos existen y dicen cuántos hay — ésa es la orientación que
  // la lista plana no daba: saber que hay uno esperando revisión sin abrirlo.
  await expect(
    firstVisible(page.getByRole('button', { name: /Esperando revisión/ })),
  ).toBeVisible()
  await expect(
    firstVisible(page.getByRole('button', { name: /Postergados por el negocio/ })),
  ).toBeVisible()

  // …y arrancan PLEGADOS: sus tarjetas no están montadas. `toHaveCount(0)` es
  // exactamente lo correcto acá — el sujeto es que no se rendericen.
  // ⚠️ Scopeado A LA CARTERA, no a la página: arriba está la cola de hoy (P21),
  // que muestra los accionables. Un `page.getByText` mediría las dos superficies
  // y diría «está» por un nodo que no es de la cartera.
  const cartera = page.locator('section[aria-label="Tu cartera completa"]')
  await expect(
    cartera.getByText(EN_REVISION),
    'el grupo plegado no monta sus tarjetas',
  ).toHaveCount(0)
  await expect(cartera.getByText(POSTERGADO)).toHaveCount(0)

  // Abrirlo las monta: el conteo del encabezado no era una promesa vacía.
  await firstVisible(page.getByRole('button', { name: /Esperando revisión/ })).click()
  await expect(firstVisible(page.getByText(EN_REVISION))).toBeVisible()

  expectNoConsoleErrors(guard)
})

test('D2 · buscando la lista se aplana: los grupos desaparecen', async ({ page, baseURL }) => {
  await abrirPanel(page, baseURL)
  await expandCartera(page)

  // Con grupos antes de buscar.
  await expect(page.locator('[data-slot="grupo-cartera"]').first()).toBeAttached()

  // Al buscar, el resultado sale sin encabezados de grupo: agrupar un puñado de
  // resultados sería cromo entre el setter y lo que fue a buscar.
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill(
    EN_REVISION,
  )
  await expect(page.locator('[data-slot="grupo-cartera"]')).toHaveCount(0)
  // Y el lead buscado se ve aunque su grupo estuviera plegado — el punto de
  // buscar es alcanzar lo que la vista por defecto no muestra.
  await expect(firstVisible(page.getByText(EN_REVISION))).toBeVisible()
  // Scopeado a la cartera por el mismo motivo que D1: `TRABAJAR_A` es accionable
  // y por lo tanto está TAMBIÉN en la cola de hoy, arriba, que la búsqueda de la
  // cartera no filtra ni tiene por qué filtrar.
  await expect(
    page.locator('section[aria-label="Tu cartera completa"]').getByText(TRABAJAR_A),
    'la búsqueda filtra de verdad',
  ).toHaveCount(0)
})

test('D3 · los tres controles de la tarjeta tienen rótulo visible, y la etapa en jerga ya no está', async ({
  page,
  baseURL,
}) => {
  await abrirPanel(page, baseURL)
  await expandCartera(page)

  const tarjeta = firstVisible(
    page.locator('[data-slot="tarjeta-cartera"]').filter({ hasText: TRABAJAR_A }),
  )
  await expect(tarjeta).toBeVisible()

  // Rótulo VISIBLE (el texto en pantalla) — lo que faltaba: en mobile no hay
  // hover, así que el `title` no existe y quedaban tres íconos a adivinar.
  await expect(tarjeta.getByText('Fijar', { exact: true })).toBeVisible()
  await expect(tarjeta.getByText('Pausar', { exact: true })).toBeVisible()
  await expect(tarjeta.getByText('Nota', { exact: true })).toBeVisible()

  // Y el nombre accesible sigue siendo el largo, con estado: los dos conviven,
  // el `aria-label` gana como nombre accesible a propósito.
  await expect(tarjeta.getByRole('button', { name: 'Fijar arriba' })).toBeVisible()
  await expect(tarjeta.getByRole('button', { name: 'Pausar en tu cartera' })).toBeVisible()
  await expect(tarjeta.getByRole('button', { name: 'Agregar nota' })).toBeVisible()

  // El badge de etapa en jerga se fue: decía lo mismo que la fila de próxima
  // acción, que sigue estando. `APROBADA` → «Aprobada» era su texto.
  await expect(
    tarjeta.getByText('Aprobada', { exact: true }),
    'el badge de etapa en jerga ya no se dibuja',
  ).toHaveCount(0)
})

test('D4 · AISLAMIENTO · la cartera no muestra el lead de otro setter, con TODOS los grupos abiertos', async ({
  page,
  baseURL,
}) => {
  await abrirPanel(page, baseURL)

  // ⚠️ El orden importa y es el sujeto del test. Abrir la cartera Y cada uno de
  // sus grupos ANTES de afirmar la ausencia: un grupo plegado no monta sus
  // tarjetas, así que un lead ajeno filtrado ahí adentro daría `toHaveCount(0)`
  // —verde— sin que el aislamiento se cumpla. Con todo abierto, el 0 significa
  // lo que dice. (`expandirGruposCartera` falla si algún grupo quedó plegado.)
  await expandirGruposCartera(page)

  // Piso del aserto: lo propio SÍ está a la vista. Sin esto, una cartera vacía
  // por cualquier motivo pasaría el aserto de ausencia sin probar nada.
  await expect(firstVisible(page.getByText(TRABAJAR_A))).toBeVisible()
  await expect(firstVisible(page.getByText(EN_REVISION))).toBeVisible()
  await expect(firstVisible(page.getByText(POSTERGADO))).toBeVisible()

  await expect(
    page.getByText(AJENO),
    'el lead del otro setter no aparece en ningún grupo de la cartera',
  ).toHaveCount(0)
})
