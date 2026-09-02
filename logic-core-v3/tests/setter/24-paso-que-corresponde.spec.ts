import { test, expect, type Page } from '@playwright/test'
import { PANTALLAS } from '../../src/lib/leados/manual'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * EL PASO QUE CORRESPONDE — lo que P19 fija sobre la derivación del manual.
 *
 * La corrida del novato encontró tres lugares donde el producto señalaba mal, y
 * los tres salían de la misma capa. El barrido
 * (`scripts/qa-corridas/barrido-derivacion.ts`) los midió sobre las 373.248
 * combinaciones que la derivación admite: 41.376 señalaban una pantalla que su
 * estado no admite, y 29.856 de ésas la señalaban como el paso de AHORA. P18 lo
 * encareció: con la acción principal siempre en la barra, un paso equivocado ya
 * no es una etiqueta al pasar — es una acción incorrecta ofrecida sin parar.
 *
 * Lo que fija este archivo, y por qué cada caso falla contra el código viejo:
 *
 *   §1 · Un POSTERGADO a futuro NO señala trabajo. Antes la derivación no
 *        recibía el estado de la postergación (el campo no existía en su
 *        entrada): un pausado aterrizaba donde lo dejara su stage — «Agendá la
 *        reunión», «Construí la demo», «Decidí cómo va a ser la demo».
 *   §2 · Y el MISMO lead con la fecha ya vencida sí vuelve a señalar trabajo.
 *        Es el par que prueba que la derivación mira la fecha y no el status:
 *        contra el código viejo los dos daban lo mismo (el barrido lo midió —
 *        POSTERGADO difería de PROSPECTO en 0 de 20.736 escenarios).
 *   §3 · «Reabrir construcción» aterriza en la CONSTRUCCIÓN. Antes caía en el
 *        chequeo final: el re-loop preserva el checklist de la vuelta anterior
 *        y la derivación lo leía como progreso de ésta, así que saltaba al
 *        último paso sin que se hubiera rehecho nada.
 *   §4 · La pantalla de correcciones no tiene una zona de trabajo VACÍA. P18 se
 *        llevó su botón a la barra y dejó la tarjeta acentuada —la superficie
 *        con la que el layout-tipo dice «acá se trabaja»— con un párrafo solo.
 *   §5 · Ninguna pantalla promete que un lead nuevo «aparece en tu foco». El
 *        foco es UNO (la cima de la cola), y un lead recién cargado entra
 *        último de su tier: con cualquier otro accionable encima, no aparece.
 *
 * Todo se afirma por VISIBILIDAD, no por presencia: el manual pliega contenido
 * y `toContainText` pasa en verde sobre un bloque que no se lee.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
/** BRIEF (la construcción es su paso) + POSTERGADO con la fecha por delante. */
let pausadoId: string
/** El MISMO estado, con la reactivación ya vencida. */
let vencidoId: string
/** RECHAZADA con checklist COMPLETO y borrador publicado: el re-loop real. */
let rechazadoId: string
/**
 * El MISMO estado, para §4. Lead propio y no compartido con §3 a propósito: §3
 * APRIETA «Reabrir construcción», o sea transiciona el dossier — con un solo
 * lead, §4 encontraría un lead que ya no está en RECHAZADA y `mr` inalcanzable.
 */
let zonaId: string

/**
 * Un id de pantalla RETIRADO del mapa. La guardia de la página redirige
 * cualquier id desconocido a la pantalla que la derivación considera actual
 * («un `m3` de un bookmark viejo aterriza solo en la pantalla vigente»), así que
 * es la forma de PREGUNTARLE a la derivación dónde está el lead.
 *
 * Pedir `m1` no serviría: en cualquier stage posterior a FICHA está COMPLETADA,
 * y una completada es accesible — la página la renderiza sin redirigir a ningún
 * lado, y el test mediría la navegación en vez de la derivación.
 */
const PASO_RETIRADO = 'm3'

const DIA = 24 * 60 * 60 * 1000

/** El `main` VISIBLE — el streaming de React duplica el árbol. */
function main(page: Page) {
  return firstVisible(page.locator('main'))
}

/** El título de la pantalla actual, leído del `h2` de la instrucción. */
async function tituloVisible(page: Page): Promise<string> {
  return (await firstVisible(page.locator('main h2')).textContent())?.trim() ?? ''
}

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // El par del §1/§2. MISMO stage, MISMO status, MISMA evaluación: lo único que
  // cambia entre los dos es de qué lado del hoy cae `reactivateAt`. Sin ese
  // control el caso no probaría que la derivación mira la FECHA.
  pausadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'P19 Pausado Futuro',
      stage: 'BRIEF',
      status: 'POSTERGADO',
      reactivateAt: new Date(Date.now() + 7 * DIA),
    })
  ).id

  vencidoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'P19 Pausado Vencido',
      stage: 'BRIEF',
      status: 'POSTERGADO',
      reactivateAt: new Date(Date.now() - 3 * DIA),
    })
  ).id

  // El re-loop tal cual llega: Franco rechazó una demo TERMINADA, así que el
  // checklist quedó con las seis fases tildadas y el borrador publicado. Ese es
  // el estado en el que la derivación vieja saltaba al chequeo final.
  const rechazadoOpts = {
    setterId,
    stage: 'RECHAZADA',
    status: 'RESPONDIO',
    draftUrl: 'https://p19-draft.netlify.app',
    progresoCompletadas: [
      'estructura',
      'personalizacion',
      'assets',
      'cta',
      'calidad',
      'mobile',
    ],
  } as const

  rechazadoId = (await createLead(tracker, { ...rechazadoOpts, businessName: 'P19 Rechazado' })).id
  zonaId = (await createLead(tracker, { ...rechazadoOpts, businessName: 'P19 Zona' })).id
})


test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

// ── §1 · el pausado no señala trabajo ───────────────────────────────────────

test('§1 · un postergado a futuro aterriza en la espera, no en un paso de trabajo', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.setViewportSize({ width: 1440, height: 900 })

  // Se pide la RAÍZ del manual: la guardia redirige a la pantalla que la
  // derivación considera actual. Es el redirect el que se está midiendo.
  await page.goto(`/setter/leads/${pausadoId}/manual/${PASO_RETIRADO}`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(main(page)).toBeVisible()

  // Contra el código viejo esto aterrizaba en `mc1` («Construí la demo en Claude
  // Design»): el stage BRIEF manda a construir, y la postergación no llegaba a
  // la derivación — le proponía media hora de trabajo sobre un negocio que el
  // propio setter decidió no tocar hasta dentro de una semana.
  await expect(page, 'el pausado aterriza en la espera').toHaveURL(/\/manual\/espera$/)

  // Y lo dice con SU motivo, no con el del negocio: la frase de la causa
  // `postergacion`. Por visibilidad — es la línea que reemplaza al estado de la
  // cadencia, que en un pausado nombraría un toque que no va a salir.
  await expect(
    firstVisible(main(page).getByText('el contacto está pausado')),
    'la espera nombra la pausa, no una respuesta pendiente',
  ).toBeVisible()

  // Ninguna pantalla de trabajo se ofrece como el paso de ahora.
  await expect(
    main(page).getByText('Tu paso ahora', { exact: true }),
    'un lead pausado no tiene «tu paso ahora»',
  ).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

// ── §2 · …y con la fecha vencida vuelve a señalarlo ─────────────────────────

test('§2 · el mismo lead, con la postergación vencida, sí señala su paso de trabajo', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto(`/setter/leads/${vencidoId}/manual/${PASO_RETIRADO}`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(main(page)).toBeVisible()

  // La postergación vencida ya volvió a ser trabajo de ahora — mismo criterio
  // que el panel de inicio (`grupoPara`: vencido → «para trabajar»).
  await expect(page, 'el vencido aterriza en la construcción').toHaveURL(/\/manual\/mc1$/)
  expect(await tituloVisible(page)).toBe(PANTALLAS.mc1.titulo)
  await expect(
    firstVisible(main(page).getByText('Tu paso ahora', { exact: true })),
    'y lo señala como el paso de ahora',
  ).toBeVisible()

  expectNoConsoleErrors(guard)
})

// ── §3 · reabrir aterriza en la construcción ────────────────────────────────

test('§3 · «Reabrir construcción» aterriza en la construcción, no en el chequeo final', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto(`/setter/leads/${rechazadoId}/manual/mr`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mr$/)
  await expect(main(page)).toBeVisible()

  // El control vive en la barra fija desde P18 — se lo busca donde el setter lo
  // ve, y se exige que se VEA (no que exista).
  const reabrir = firstVisible(
    page.getByRole('button', { name: 'Reabrir construcción' }),
  )
  await expect(reabrir, 'el botón de reabrir se ve').toBeVisible()
  await reabrir.click()

  // Contra el código viejo esto terminaba en `/manual/m14` («Chequeá la demo
  // antes de mandarla»): el checklist de la vuelta anterior quedaba tildado y la
  // derivación lo leía como progreso de ésta.
  await expect(page, 'la construcción reabierta aterriza en construcción').toHaveURL(
    /\/manual\/mc1$/,
  )
  expect(await tituloVisible(page)).toBe(PANTALLAS.mc1.titulo)

  // Y no se rompió nada del retrabajo: el pedido de Franco sigue a la vista.
  await expect(
    firstVisible(main(page).getByText('Guía de retrabajo — lo que Franco pidió corregir')),
    'el pedido acompaña la construcción reabierta',
  ).toBeVisible()

  expectNoConsoleErrors(guard)
})

// ── §4 · la pantalla de correcciones no tiene zona de trabajo vacía ─────────

test('§4 · correcciones no monta un bloque de trabajo sin un solo control adentro', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto(`/setter/leads/${zonaId}/manual/mr`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mr$/)
  await expect(main(page)).toBeVisible()

  // Contra el código viejo la zona existía con un párrafo adentro y ningún
  // control: la tarjeta acentuada del bloque de trabajo sobre nada que tocar.
  await expect(
    page.locator('main section[aria-label="Registro"]'),
    'la pantalla cuya única acción vive en la barra no monta bloque de trabajo',
  ).toHaveCount(0)

  // Disolver la zona no le sacó nada a la pantalla: la acción sigue a la vista…
  await expect(
    firstVisible(page.getByRole('button', { name: 'Reabrir construcción' })),
    'la acción principal sigue visible',
  ).toBeVisible()

  // …y la secuencia del retrabajo, que era lo que el párrafo decía, se lee
  // ahora en la instrucción de la pantalla.
  await expect(
    firstVisible(main(page).getByText('aterrizás en la construcción')),
    'la instrucción dice qué pasa al reabrir',
  ).toBeVisible()

  expectNoConsoleErrors(guard)
})

// ── §5 · el foco no se promete donde no se puede cumplir ────────────────────

test('§5 · cargar un prospecto no promete que aparezca en el foco', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto('/setter/nuevo', { waitUntil: 'domcontentloaded' })
  await expect(main(page)).toBeVisible()

  // La bajada se lee (no sólo existe) y ya no promete el foco.
  const bajada = firstVisible(main(page).getByText('Un negocio que encontraste vos.'))
  await expect(bajada, 'la bajada de la pantalla se lee').toBeVisible()
  await expect(bajada).toContainText('entra a tu cola de trabajo')

  // Contra el código viejo esto falla: decía «y aparece en tu foco para que lo
  // evalúes» sobre un lead que entra ÚLTIMO de su tier en la cola.
  await expect(
    main(page).getByText('aparece en tu foco'),
    'ninguna pantalla promete el foco para un lead recién cargado',
  ).toHaveCount(0)

  expectNoConsoleErrors(guard)
})
