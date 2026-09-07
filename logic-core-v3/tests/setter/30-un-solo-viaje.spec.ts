import { test, expect, type Page, type Request } from '@playwright/test'
import { qaLogin } from '../helpers/setter-auth'
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
import { parseProgreso } from '../../src/lib/leados/flow'

/**
 * P28 — UNA ACCIÓN CON REGISTRO HACE UN SOLO VIAJE AL SERVIDOR.
 *
 * El defecto que fija: cada acción del recorrido pagaba DOS renders de servidor
 * por un solo registro. El POST de la server action ya vuelve con el árbol
 * re-renderizado de la pantalla (la action revalida), y al lado había un
 * `router.refresh()` que pedía ESE MISMO árbol una segunda vez. Medido con el
 * instrumento de P28 (`npm run test:perf`, servidor tibio, tres pasadas por
 * acción): 1 POST + 1 GET de árbol por acción, y un render de estas pantallas
 * cuesta ~290 ms de servidor.
 *
 * ── Por qué el aserto no es «cero GET de árbol» a secas ──────────────────────
 * Una ausencia se satisface antes de que la página termine de trabajar y ya dio
 * falso verde dos veces en esta suite. Acá la ventana la cierra una PRESENCIA:
 * primero se espera a que la escritura esté en la base y a que la pantalla
 * muestre el estado nuevo —las dos condiciones positivas, esperadas por
 * condición y no por tiempo— y después se espera a que el navegador DEJE DE
 * HABLAR con el servidor (`networkidle`, que también es una condición). Recién
 * ahí se cuenta lo que viajó.
 *
 * El tercer paso no es de más: sin él, el caso del tilde daba VERDE contra el
 * código de partida. El `router.refresh()` de los tildes salía un instante
 * DESPUÉS del acuse —el efecto que lo dispara mira `phase === 'saved'`— y la
 * ventana se cerraba justo antes del viaje que venía a contar. Un test que cierra
 * la ventana antes de tiempo no mide de menos: mide otra cosa.
 *
 * ── Qué NO afirma ────────────────────────────────────────────────────────────
 * No afirma un umbral de latencia hasta el reflejo. Ese número NO lo movió este
 * sprint: entre que el árbol llega (~1 s) y que la pantalla lo muestra (~4,6 s)
 * hay una espera de cliente que P28 dejó medida y atribuida, sin arreglar. Fijar
 * acá un umbral que el producto no cumple sería un rojo permanente; fijar uno
 * que sí cumple (5 s) sería no fijar nada.
 *
 * ── Los prefetch no cuentan, y por qué ───────────────────────────────────────
 * Después de una acción el router pide los `<Link>` de la pantalla nueva
 * (`Next-Router-Prefetch`). No están en el camino crítico —la pantalla ya se
 * pintó— y se cuentan aparte: mezclarlos daba números de 1+10 que no significan
 * nada.
 */

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

type Viajes = { acciones: number; arboles: number; prefetch: number }

/**
 * Cuenta los viajes al servidor de la pantalla mientras dure el bloque: el POST
 * de server action (`Next-Action`) y los GET de árbol (`RSC`), separando los
 * prefetch del router.
 */
function contarViajes(page: Page): { viajes: Viajes; soltar: () => void } {
  const viajes: Viajes = { acciones: 0, arboles: 0, prefetch: 0 }
  const alPedir = (request: Request) => {
    const headers = request.headers()
    if (headers['next-action']) {
      viajes.acciones += 1
      return
    }
    if (!headers['rsc'] && !headers['next-router-state-tree']) return
    if (headers['next-router-prefetch']) viajes.prefetch += 1
    else viajes.arboles += 1
  }
  page.on('request', alPedir)
  return { viajes, soltar: () => page.off('request', alPedir) }
}

/** El estado nuevo, releído de la base — la primera de las dos condiciones. */
async function esperarEnLaBase(
  leadId: string,
  cumple: (dossier: Awaited<ReturnType<typeof getDossier>>) => boolean,
  que: string,
): Promise<void> {
  await expect(async () => {
    expect(cumple(await getDossier(leadId)), que).toBe(true)
  }).toPass({ timeout: 20_000 })
}

test('P28-1 · «Arrancar construcción» hace UN viaje de escritura, sin pedir el árbol de nuevo', async ({
  page,
}) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P28 Un Viaje Arrancar',
    stage: 'BRIEF',
    status: 'RESPONDIO',
  })

  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${leadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })

  const arrancar = firstVisible(page.locator('main').getByRole('button', { name: 'Arrancar construcción' }))
  await expect(arrancar, 'el CTA vivo antes de tocarlo').toBeEnabled()

  const red = contarViajes(page)
  await arrancar.click()

  // Condición positiva 1: la transición quedó en la base.
  await esperarEnLaBase(leadId, (d) => d?.stage === 'CONSTRUCCION', 'BRIEF→CONSTRUCCION persistido')

  // Condición positiva 2: la pantalla muestra el estado nuevo — los tildes de
  // Construcción, que en BRIEF están apagados, quedan vivos. Es una PRESENCIA
  // (un control habilitado), no la ausencia del CTA anterior.
  const tildes = page.locator('main section[aria-label="Registro"] button[aria-pressed]')
  await expect(tildes).toHaveCount(3)
  await expect(firstVisible(tildes), 'los tildes vivos: la pantalla ya es la de Construcción').toBeEnabled({
    timeout: 20_000,
  })

  // La ventana se cierra cuando el navegador deja de hablar con el servidor.
  await page.waitForLoadState('networkidle')

  red.soltar()
  expect(red.viajes.acciones, 'un POST de server action').toBe(1)
  expect(
    red.viajes.arboles,
    `ningún GET de árbol de más (prefetch aparte: ${red.viajes.prefetch})`,
  ).toBe(0)
})

test('P28-2 · tildar una fase hace UN viaje de escritura, sin pedir el árbol de nuevo', async ({
  page,
}) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P28 Un Viaje Tilde',
    stage: 'CONSTRUCCION',
    status: 'RESPONDIO',
  })

  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${leadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })

  const tildes = page.locator('main section[aria-label="Registro"] button[aria-pressed]')
  await expect(tildes).toHaveCount(3)
  await expect(firstVisible(tildes), 'los tildes vivos antes de tocarlos').toBeEnabled()

  const red = contarViajes(page)
  await firstVisible(tildes).click()

  // Condición positiva 1: la marca quedó guardada (leída con el MISMO parser que
  // usa el page loader, no con un JSON paralelo escrito a mano).
  await esperarEnLaBase(
    leadId,
    (d) => parseProgreso(d?.progresoJson ?? null).completadas.length === 1,
    'una fase tildada en progresoJson',
  )

  // Condición positiva 2: el acuse de escritura continua está en pantalla — la
  // misma señal `role="status"` que exige el invariante del acuse.
  await expect(
    firstVisible(page.locator('main').getByRole('status').filter({ hasText: 'Guardado' })),
    'el acuse de recibo del autoguardado',
  ).toBeVisible({ timeout: 20_000 })

  // La ventana se cierra cuando el navegador deja de hablar con el servidor.
  await page.waitForLoadState('networkidle')

  red.soltar()
  expect(red.viajes.acciones, 'un POST de server action').toBe(1)
  expect(
    red.viajes.arboles,
    `ningún GET de árbol de más (prefetch aparte: ${red.viajes.prefetch})`,
  ).toBe(0)
})
