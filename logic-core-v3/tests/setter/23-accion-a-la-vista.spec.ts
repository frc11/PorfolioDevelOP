import { test, expect, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
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
 * LA ACCIÓN A LA VISTA — lo que P18 fija para las catorce pantallas del manual.
 *
 * P17 arregló el ARRANQUE de la pantalla (que entrara algo en el primer
 * pliegue). Faltaba el otro extremo: la acción estaba siempre al final. Medido
 * con `scripts/qa-corridas/medir-pliegue-manual.ts` sobre las once pantallas de
 * trabajo, la acción principal se veía SIN SCROLLEAR en 2/11 a 1440 y en 0/11 a
 * 390 — el setter recorría la pantalla entera para poder actuar y después
 * volvía a subir.
 *
 * Este archivo fija las cuatro cosas que el sprint cambió:
 *
 *   §1 · La acción principal se ve en las DOS puntas del scroll — arriba de
 *        todo y abajo de todo. Se afirma por VISIBILIDAD y por geometría contra
 *        el scroller real (`main`, que es `fixed inset-0` → el pliegue es su
 *        `clientHeight`, nunca la altura del viewport), y con el criterio
 *        estricto: la caja del botón tiene que entrar ENTERA. Un botón que
 *        asoma 8 px no se lee.
 *   §2 · Y no quedó duplicada: el control existe UNA sola vez en la pantalla.
 *        Mover no es copiar.
 *   §3 · Cuando está bloqueada, la barra dice QUÉ FALTA. El motivo no se
 *        inventa: es el mismo dato que ya apagaba el botón.
 *   §4 · Donde no hay acción principal —los tres estados terminales, y m13 con
 *        el borrador ya publicado— la barra NO aparece. Ni vacía ni apagada.
 *
 * Contra el código viejo fallan los cuatro: §1 porque el botón vivía al final
 * del formulario (en nueve de las diez pantallas queda fuera del pliegue al
 * cargar), §2 y §4 porque no existía `[data-slot="barra-accion"]`, y §3 porque
 * el motivo estaba abajo de todo, al lado de un botón que no se veía.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let fichaId: string
let openerId: string
let briefId: string
/** stage BRIEF: la construcción todavía no arrancó → mc1/mc2 ofrecen arrancarla. */
let porArrancarId: string
/** CONSTRUCCION sin borrador publicado → m13 pide el link. */
let sinBorradorId: string
/** CONSTRUCCION con borrador publicado → m14 vivo, y m13 en consulta (sin acción). */
let construyendoId: string
let rechazadoId: string
let aprobadoId: string
let esperaId: string
let revisionId: string
let archivoId: string
let toqueId: string

/** El `main` VISIBLE — el streaming de React duplica el árbol. */
function main(page: Page) {
  return firstVisible(page.locator('main'))
}

/**
 * ¿Se ve ENTERO el control dentro de la parte visible del scroller, con el
 * scroll donde lo dejamos? Devuelve también el detalle para que el mensaje de
 * fallo diga por qué, no sólo que falló.
 */
async function accionALaVista(page: Page, etiqueta: string) {
  return page.evaluate((texto) => {
    const scroller = Array.from(document.querySelectorAll('main')).find(
      (m) => m.getBoundingClientRect().height > 0,
    )
    if (!scroller) return null
    const norm = (s: string) => s.replace(/[\s ]+/g, ' ').trim()
    const el = Array.from(scroller.querySelectorAll('button, a[href], [role="button"]')).find(
      (n) => norm(n.textContent || '').startsWith(texto),
    )
    if (!el) return { hallado: false, dentro: false, top: null, pliegue: 0, alto: 0 }
    const caja = scroller.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    return {
      hallado: true,
      dentro: r.top >= caja.top - 0.5 && r.bottom <= caja.bottom + 0.5,
      top: Math.round(r.top - caja.top),
      pliegue: Math.round(scroller.clientHeight),
      alto: Math.round(r.height),
    }
  }, etiqueta)
}

/** Lleva el scroller a una punta y deja asentar el reposicionamiento del sticky. */
async function scrollA(page: Page, donde: 'arriba' | 'abajo') {
  await page.evaluate((fondo) => {
    const m = Array.from(document.querySelectorAll('main')).find(
      (n) => n.getBoundingClientRect().height > 0,
    )
    if (m) m.scrollTop = fondo ? m.scrollHeight : 0
  }, donde === 'abajo')
  await page.waitForTimeout(200)
}

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  fichaId = (await createLead(tracker, { setterId, businessName: 'Accion Ficha', stage: 'FICHA' }))
    .id

  // EVALUADA + PROSPECTO y sin contactos: el opener está pendiente → m4.
  openerId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Opener',
      stage: 'EVALUADA',
      status: 'PROSPECTO',
    })
  ).id

  // EVALUADA + RESPONDIO: el gate del brief queda abierto → m6.
  briefId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Brief',
      stage: 'EVALUADA',
      status: 'RESPONDIO',
    })
  ).id

  // stage BRIEF: mc1/mc2 ofrecen «Arrancar construcción».
  porArrancarId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Por Arrancar',
      stage: 'BRIEF',
      status: 'RESPONDIO',
    })
  ).id

  // CONSTRUCCION SIN borrador: m13 pide el link → «Guardar borrador».
  sinBorradorId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Sin Borrador',
      stage: 'CONSTRUCCION',
      status: 'RESPONDIO',
      draftUrl: null,
    })
  ).id

  // CONSTRUCCION con borrador publicado: m14 vivo; m13 pasa a consulta.
  construyendoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Construccion',
      stage: 'CONSTRUCCION',
      status: 'RESPONDIO',
      draftUrl: 'https://accion-draft.netlify.app',
      progresoCompletadas: ['estructura'],
      selfCheckDurosOk: [],
    })
  ).id

  rechazadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Rechazado',
      stage: 'RECHAZADA',
      status: 'RESPONDIO',
    })
  ).id

  // APROBADA con URL final + RESPONDIO: el gate del envío abre → m15.
  aprobadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Aprobado',
      stage: 'APROBADA',
      status: 'RESPONDIO',
    })
  ).id

  // APROBADA sin URL final: el gate del envío queda cerrado → pantalla de espera.
  esperaId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Espera',
      stage: 'APROBADA',
      status: 'RESPONDIO',
      sinFinalUrl: true,
    })
  ).id

  revisionId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Revision',
      stage: 'EN_REVISION',
      status: 'RESPONDIO',
    })
  ).id

  archivoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Archivo',
      stage: 'DESCARTADA',
      status: 'PERDIDO',
    })
  ).id

  // EVALUADA + toques SIN_RESPUESTA + toque vencido: aterriza en m5.
  toqueId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Accion Toque',
      stage: 'EVALUADA',
      status: 'PROSPECTO',
    })
  ).id
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

/**
 * Las pantallas CON acción principal, con el lead que las alcanza y la etiqueta
 * exacta del control que hace avanzar el recorrido (el censo del sprint).
 *
 * m16 no está: su acción principal —confirmar el booking— sólo existe una vez
 * elegido un horario, y elegirlo exige una búsqueda real de disponibilidad. Se
 * verifica a mano y queda anotado en la bitácora.
 */
const CON_ACCION = [
  {
    paso: 'm1',
    lead: () => fichaId,
    etiqueta: 'Registrar evaluación',
    // La ficha es un acordeón donde «plegado = NO montado» (P16): con la ficha
    // vacía el bloque abierto es el primero y el veredicto todavía no existe en
    // el DOM — ni el botón viejo ni la barra. Se abre el bloque del cierre, que
    // es donde la acción existe, y ahí se mide.
    abrir: 'Tu decisión',
  },
  {
    paso: 'm4',
    lead: () => openerId,
    etiqueta: 'Ya lo mandé en Instagram — registrar',
    abrir: null,
  },
  { paso: 'm5', lead: () => toqueId, etiqueta: 'Registrar resultado', abrir: null },
  { paso: 'm6', lead: () => briefId, etiqueta: 'Guardar brief', abrir: null },
  { paso: 'mc1', lead: () => porArrancarId, etiqueta: 'Arrancar construcción', abrir: null },
  { paso: 'mc2', lead: () => porArrancarId, etiqueta: 'Arrancar construcción', abrir: null },
  { paso: 'm13', lead: () => sinBorradorId, etiqueta: 'Guardar borrador', abrir: null },
  { paso: 'm14', lead: () => construyendoId, etiqueta: 'Enviar a revisión', abrir: null },
  { paso: 'm15', lead: () => aprobadoId, etiqueta: 'Ya la envié — registrar', abrir: null },
  { paso: 'mr', lead: () => rechazadoId, etiqueta: 'Reabrir construcción', abrir: null },
] as const

for (const { paso, lead, etiqueta, abrir } of CON_ACCION) {
  test(`${paso} · la acción principal se ve arriba y abajo, y no está duplicada`, async ({
    page,
  }) => {
    const guard = attachConsoleGuard(page)
    await qaLogin(page, 'setter')
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(`/setter/leads/${lead()}/manual/${paso}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page).toHaveURL(new RegExp(`/manual/${paso}$`))
    await expect(main(page)).toBeVisible()

    if (abrir) {
      await firstVisible(page.getByRole('button', { name: new RegExp(abrir) })).click()
    }

    // La barra existe y el control vive adentro. Se espera por VISIBILIDAD: la
    // barra se puebla en la hidratación.
    const barra = firstVisible(page.locator('[data-slot="barra-accion"]'))
    await expect(barra, `${paso}: hay barra de acción`).toBeVisible()
    await expect(
      barra.getByRole('button', { name: etiqueta }),
      `${paso}: «${etiqueta}» vive en la barra`,
    ).toBeVisible()

    // §2 — el control existe UNA sola vez en la pantalla. Contra el código viejo
    // esto pasa (había uno solo, abajo); lo que fija es que P18 no lo duplique.
    await expect(
      main(page).getByRole('button', { name: etiqueta }),
      `${paso}: «${etiqueta}» no quedó duplicado`,
    ).toHaveCount(1)

    // §1 — visible en las DOS puntas del scroll, entera. Contra el código viejo
    // falla arriba en nueve de las diez: el botón estaba al final del formulario.
    await scrollA(page, 'arriba')
    const arriba = await accionALaVista(page, etiqueta)
    expect(arriba, `${paso}: hay scroller`).not.toBeNull()
    expect(arriba!.hallado, `${paso}: se encontró «${etiqueta}»`).toBe(true)
    expect(
      arriba!.dentro,
      `${paso}: con el scroll arriba de todo, «${etiqueta}» arranca a ${arriba!.top}px (alto ${arriba!.alto}) y el pliegue está en ${arriba!.pliegue}px`,
    ).toBe(true)

    await scrollA(page, 'abajo')
    const abajo = await accionALaVista(page, etiqueta)
    expect(
      abajo!.dentro,
      `${paso}: con el scroll abajo de todo, «${etiqueta}» arranca a ${abajo!.top}px y el pliegue está en ${abajo!.pliegue}px`,
    ).toBe(true)

    expectNoConsoleErrors(guard)
  })
}

/**
 * §3 — el motivo del bloqueo, al lado del control apagado.
 *
 * Las dos pantallas cuyo `disabled` depende de estado local del formulario y
 * cuyo motivo YA existía como dato. Contra el código viejo el texto está en la
 * pantalla pero abajo de todo, junto a un botón que tampoco se ve: acá se exige
 * que se lea SIN SCROLLEAR, que es lo que cambia.
 */
const BLOQUEADAS = [
  {
    paso: 'm5',
    lead: () => toqueId,
    etiqueta: 'Registrar resultado',
    motivo: /Elegí arriba qué pasó en la conversación/,
  },
  {
    paso: 'm14',
    lead: () => construyendoId,
    etiqueta: 'Enviar a revisión',
    motivo: /obligatorios? en rojo/,
  },
] as const

for (const { paso, lead, etiqueta, motivo } of BLOQUEADAS) {
  test(`${paso} · el botón bloqueado dice qué falta, sin scrollear`, async ({ page }) => {
    const guard = attachConsoleGuard(page)
    await qaLogin(page, 'setter')
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(`/setter/leads/${lead()}/manual/${paso}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page).toHaveURL(new RegExp(`/manual/${paso}$`))

    const barra = firstVisible(page.locator('[data-slot="barra-accion"]'))
    await expect(barra).toBeVisible()

    const boton = barra.getByRole('button', { name: etiqueta })
    await expect(boton, `${paso}: la acción está apagada`).toBeDisabled()

    // El motivo se LEE en la barra, con el scroll arriba de todo. `toBeVisible`
    // y no `toContainText`: lo segundo pasaría con el texto abajo del pliegue.
    await scrollA(page, 'arriba')
    await expect(
      barra.getByText(motivo),
      `${paso}: la barra dice qué falta`,
    ).toBeVisible()

    // Y el botón sigue siendo descriptible para quien no ve la pantalla.
    await expect(boton).toHaveAttribute('aria-describedby', /.+/)

    expectNoConsoleErrors(guard)
  })
}

/**
 * §4 — sin acción principal no hay barra.
 *
 * Los tres estados terminales no tienen un solo `<button>` (son de lectura), y
 * m13 con el borrador ya publicado tampoco: la salida de ahí es el enlace al
 * chequeo, y «Cambiar el link» abre la edición, no avanza. Una barra vacía —o
 * un botón apagado por defecto— sería peor que no tenerla.
 */
const SIN_ACCION = [
  { paso: 'espera', lead: () => esperaId },
  { paso: 'revision', lead: () => revisionId },
  { paso: 'archivo', lead: () => archivoId },
  { paso: 'm13', lead: () => construyendoId },
] as const

for (const { paso, lead } of SIN_ACCION) {
  test(`${paso} · sin acción principal, la barra no aparece`, async ({ page }) => {
    const guard = attachConsoleGuard(page)
    await qaLogin(page, 'setter')
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(`/setter/leads/${lead()}/manual/${paso}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page).toHaveURL(new RegExp(`/manual/${paso}$`))
    await expect(main(page)).toBeVisible()

    // Se espera a que la pantalla esté hidratada antes de afirmar la ausencia:
    // si no, «no hay barra» sería cierto por llegar temprano y no por el código.
    await expect(main(page).locator('header')).toBeVisible()
    await page.waitForTimeout(600)

    await expect(
      page.locator('[data-slot="barra-accion"]'),
      `${paso}: no se pinta una barra vacía`,
    ).toHaveCount(0)

    // …y el mecanismo SÍ está vivo en este build: la misma sesión, una pantalla
    // que sí tiene acción, y ahí la barra aparece. Sin esta segunda mitad, la
    // ausencia de arriba también sería cierta en un build sin barra ninguna —
    // o sea, la prueba pasaría en verde sin probar nada.
    await page.goto(`/setter/leads/${construyendoId}/manual/m14`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(
      firstVisible(page.locator('[data-slot="barra-accion"]')),
      'control: en m14 la barra sí aparece',
    ).toBeVisible()

    expectNoConsoleErrors(guard)
  })
}

/**
 * A 390 la barra no puede tapar el final de la pantalla. Es la contracara del
 * `sticky`: al llegar al fondo del scroll la barra aterriza en su lugar del
 * flujo en vez de quedar flotando encima, así el último control del formulario
 * se alcanza.
 */
test('m14 · a 390, con el scroll al final, el último control se alcanza', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.setViewportSize({ width: 390, height: 844 })

  await page.goto(`/setter/leads/${construyendoId}/manual/m14`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page).toHaveURL(/\/manual\/m14$/)
  await expect(firstVisible(page.locator('[data-slot="barra-accion"]'))).toBeVisible()

  await scrollA(page, 'abajo')

  // El último elemento del contenido (lo que precede a la barra) tiene que
  // quedar por ENCIMA de ella, no debajo.
  const solapa = await page.evaluate(() => {
    const scroller = Array.from(document.querySelectorAll('main')).find(
      (m) => m.getBoundingClientRect().height > 0,
    )
    const barra = scroller?.querySelector('[data-slot="barra-accion"]')
    if (!scroller || !barra) return null
    const previo = barra.previousElementSibling
    if (!previo) return null
    const rb = barra.getBoundingClientRect()
    const rp = previo.getBoundingClientRect()
    return {
      // px del contenido previo que quedan tapados por la barra (negativo = aire)
      tapado: Math.round(rp.bottom - rb.top),
      previoVisible: rp.bottom <= scroller.getBoundingClientRect().bottom + 0.5,
    }
  })
  expect(solapa, 'hay barra y contenido antes de ella').not.toBeNull()
  expect(
    solapa!.tapado,
    `con el scroll al final la barra tapa ${solapa!.tapado}px del contenido`,
  ).toBeLessThanOrEqual(0)
  expect(solapa!.previoVisible, 'el final del contenido se alcanza').toBe(true)

  expectNoConsoleErrors(guard)
})
