import { test, expect } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, expandCartera } from '../helpers/setter-ui'
import { formatFechaCorta } from '../../src/lib/leados/flow'
import { FALTA_LINK_PERMANENTE, TEXTO_TURNO } from '../../src/lib/leados/turno'
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
 * Sprint LA QUINTA SUPERFICIE — un lead APROBADO sin el link permanente de
 * Franco no se puede confundir con uno que sí lo tiene.
 *
 * `dossier.finalUrl` es la CONDICIÓN del envío. Cuatro superficies ya lo leían
 * (el envío, las dos esperas, el detalle del admin); la quinta —la tarjeta de
 * cartera y el contador del panel— no, así que:
 *
 *   1. la tarjeta decía «Demo aprobada — mandá el link al negocio», en cyan
 *      accionable, para una demo sin link que mandar. El setter iba, y aterrizaba
 *      en la pantalla que le explica que Franco todavía no lo cargó: un paso
 *      perdido, y la tarjeta lo invitó;
 *   2. el panel contaba esas demos como «esperando al negocio» — el negocio ya
 *      había contestado y no tenía nada que hacer. Le toca a Franco.
 *
 * Los dos casos se afirman por VISIBILIDAD (`toBeVisible`), nunca por presencia:
 * un texto en el DOM pero plegado pasaría en verde sobre el bug exacto. Y la
 * distinción a simple vista se afirma sobre el ACENTO de la card (cyan =
 * accionable / neutro = espera), medido en el DOM — no sobre el texto chico.
 *
 * El microsprint que viajó con este (la fecha de la postergación aparecía dos
 * veces en la pantalla de seguimiento) va en el último test.
 */

const tracker: SmokeTracker = newTracker()
const DIA_MS = 24 * 60 * 60 * 1000

let setterId: string
let aprobadaConLinkId: string
let aprobadaSinLinkId: string
let esperaSinLinkId: string
let postergadoId: string

const FINAL_URL = 'https://q5-con-link.example.com'
const volvioEl = new Date(Date.now() - 3 * DIA_MS)
// Formateada con el MISMO helper que pinta la UI (huso AR fijo, y `es-AR` da
// «24/8», no «24/08»): un formateo propio del runner haría fallar el spec por
// huso o por relleno de ceros, no por producto.
const FECHA_VENCIDA = formatFechaCorta(volvioEl.toISOString())

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  // ── Los dos aprobados de la captura: mismo estado, distinto link ───────────
  // RESPONDIO ⇒ el gate del envío está abierto por el lado del negocio. Lo único
  // que los separa es `finalUrl`.
  const conLink = await createLead(tracker, {
    setterId,
    businessName: 'Q5 Taller Con Link',
    stage: 'APROBADA',
    status: 'RESPONDIO',
    finalUrl: FINAL_URL,
  })
  aprobadaConLinkId = conLink.id

  const sinLink = await createLead(tracker, {
    setterId,
    businessName: 'Q5 Optica Sin Link',
    stage: 'APROBADA',
    status: 'RESPONDIO',
    sinFinalUrl: true,
  })
  aprobadaSinLinkId = sinLink.id

  // ── El caso del CONTADOR: gate cerrado, así que el lead está en vuelo ───────
  // (con el gate abierto el aprobado es trabajo y no llega al conteo). Antes los
  // dos —con y sin link— sumaban a «esperando al negocio».
  const esperaSinLink = await createLead(tracker, {
    setterId,
    businessName: 'Q5 Espera Sin Link',
    stage: 'APROBADA',
    status: 'PROSPECTO',
    sinFinalUrl: true,
  })
  esperaSinLinkId = esperaSinLink.id
  await registerActivity(esperaSinLinkId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')

  // ── Microsprint: el postergado cuya fecha se decía dos veces ────────────────
  // APROBADA + demo enviada + toque vencido ⇒ `posicionDe` aterriza en m5, que es
  // donde vivía el recuadro de cadencia con la fecha repetida.
  const postergado = await createLead(tracker, {
    setterId,
    businessName: 'Q5 Postergado M5',
    stage: 'APROBADA',
    status: 'POSTERGADO',
    enviada: true,
    nextFollowUpAt: new Date(Date.now() - 2 * DIA_MS),
  })
  postergadoId = postergado.id
  await registerActivity(postergadoId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')
  await prisma.osLead.update({
    where: { id: postergadoId },
    data: { reactivateAt: volvioEl },
  })
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

// ── 1 · La tarjeta de cartera ────────────────────────────────────────────────

test('1a · la tarjeta de un aprobado SIN link no invita a mandar un link que no existe', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  await expandCartera(page)
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill(
    'Q5 Optica Sin Link',
  )

  // Dice de quién es el turno y qué falta — con las MISMAS palabras que el envío.
  await expect(
    firstVisible(page.getByText(`${TEXTO_TURNO.franco.titulo} — ${FALTA_LINK_PERMANENTE}`)),
  ).toBeVisible()
  // Y no pide lo imposible.
  await expect(page.getByText('Demo aprobada — mandá el link al negocio')).toHaveCount(0)
  // El rótulo de orden tampoco: fuera de la cola de trabajo no hay orden que explicar.
  await expect(page.getByText('La demo está lista para mandar')).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('1b · con el link cargado la tarjeta SÍ manda a enviarlo', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  await expandCartera(page)
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill(
    'Q5 Taller Con Link',
  )

  await expect(
    firstVisible(page.getByText('Demo aprobada — mandá el link al negocio')),
  ).toBeVisible()
  await expect(page.getByText(FALTA_LINK_PERMANENTE)).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('1c · lado a lado se distinguen a simple vista: el acento, no el texto chico', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  await expandCartera(page)
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill('Q5 ')
  await expect(firstVisible(page.getByText('Q5 Optica Sin Link'))).toBeVisible()
  await expect(firstVisible(page.getByText('Q5 Taller Con Link'))).toBeVisible()

  // El acento de accionabilidad es la barra vertical de la card: cyan = hacé esto
  // ahora, neutro = esperando. Se lee del DOM, no de la captura — el alto de un
  // PNG no prueba un color.
  // Se sube desde el titular hasta el primer ancestro cuyo hijo DIRECTO es la
  // barra de acento — así queda scopeado a SU card y no toma la del vecino.
  const acentoDe = async (nombre: string): Promise<string> =>
    page.evaluate((negocio) => {
      // `includes`, no `===`: `createLead` prefija el nombre con el tag del
      // smoke y le pega un stamp al final, así que el titular NUNCA es igual al
      // nombre pedido — con `===` esto devolvía «no encontrado» y el test fallaba
      // por el selector, no por el producto.
      const titulos = [...document.querySelectorAll('main h3')].filter((h) =>
        (h.textContent || '').includes(negocio),
      )
      for (const titulo of titulos) {
        let nodo: Element | null = titulo
        while (nodo && nodo !== document.body) {
          const barra = nodo.querySelector(':scope > span[aria-hidden]')
          if (barra && barra.className.includes('inset-y-0')) return barra.className
          nodo = nodo.parentElement
        }
      }
      return 'NO-ENCONTRADO'
    }, nombre)

  const conLink = await acentoDe('Q5 Taller Con Link')
  const sinLink = await acentoDe('Q5 Optica Sin Link')

  expect(conLink, 'el aprobado CON link es accionable: acento cyan').toContain('bg-cyan-400')
  expect(sinLink, 'el aprobado SIN link es espera: acento neutro, no cyan').not.toContain(
    'bg-cyan-400',
  )

  expectNoConsoleErrors(guard)
})

test('1d · el aprobado sin link no aterriza en el envío, y la pantalla lo explica', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${aprobadaSinLinkId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/espera$/)
  await expect(firstVisible(page.getByText(FALTA_LINK_PERMANENTE))).toBeVisible()

  // El que SÍ lo tiene aterriza en el envío.
  await page.goto(`/setter/leads/${aprobadaConLinkId}/manual`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m15$/)
  await expect(firstVisible(page.getByText(FINAL_URL))).toBeVisible()

  expectNoConsoleErrors(guard)
})

// ── 2 · El contador del panel ────────────────────────────────────────────────

test('2a · el panel no cuenta como espera del negocio una demo que espera a Franco', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto('/setter', { waitUntil: 'domcontentloaded' })
  await expandCartera(page)
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill(
    'Q5 Espera Sin Link',
  )

  // Es un lead EN VUELO (gate cerrado, no accionable) y su turno es de Franco.
  // La tarjeta y el contador leen la MISMA derivación: si acá dijera «le toca al
  // negocio», el chip del panel diría lo mismo.
  await expect(
    firstVisible(page.getByText(`${TEXTO_TURNO.franco.titulo} — ${FALTA_LINK_PERMANENTE}`)),
  ).toBeVisible()
  await expect(
    page.getByText(`${TEXTO_TURNO.negocio.titulo} — la demo está aprobada`),
  ).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

// ── 3 · Microsprint: la fecha de la postergación, una sola vez ───────────────

test('3a · en seguimiento la fecha de la postergación aparece UNA vez: el chip', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')

  await page.goto(`/setter/leads/${postergadoId}/manual/m5`, { waitUntil: 'domcontentloaded' })

  // El chip de la cabecera la sigue diciendo — es la superficie que está en TODAS
  // las pantallas del lead.
  const fecha = page.getByText(`Se venció el ${FECHA_VENCIDA}`)
  await expect(firstVisible(fecha)).toBeVisible()
  // Y una sola vez: el recuadro de cadencia ya no la repite. Se cuenta sobre los
  // nodos VISIBLES (el wizard se duplica para responsive bajo display:none), que
  // es lo único que distingue «está en el DOM» de «se lee en pantalla».
  await expect(fecha.filter({ visible: true })).toHaveCount(1)
  // La que se fue es la del recuadro, que venía pegada a su llamada a la acción.
  await expect(
    page.getByText(`Se venció el ${FECHA_VENCIDA} — retomá el contacto`),
  ).toHaveCount(0)
  // Y lo que el chip NO dice sigue estando: que es trabajo de ahora.
  await expect(firstVisible(page.getByText('Retomá el contacto'))).toBeVisible()

  expectNoConsoleErrors(guard)
})
