import { test, expect, type Page } from '@playwright/test'
import {
  FASES_MANUAL,
  PANTALLAS,
  esPantallaId,
  type PantallaId,
} from '../../src/lib/leados/manual'
import { FASES_EN_ORDEN } from '../../src/lib/leados/recorrido'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  registerActivity,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * LA FRANJA DEL RECORRIDO — lo que P20 fija sobre las catorce pantallas.
 *
 * El manual mostraba el pasado (una tira de completadas al pie) y nunca el
 * futuro: no había nada que dijera cuánto falta ni qué viene. Este archivo fija
 * las cuatro cosas que la franja tiene que cumplir, y ninguna es un gusto:
 *
 *   §1 · Está en las CATORCE, con los nueve pasos del manual. Se afirma por
 *        VISIBILIDAD, no por presencia: el manual pliega contenido y
 *        `toContainText` pasa en verde sobre algo que no se lee.
 *   §2 · El paso marcado como el de AHORA sale del MISMO dato que P19 dejó
 *        confiable —`posicion.actual`— y no de la pantalla que estás mirando.
 *        Se le pregunta a la derivación con un id retirado (la guardia redirige
 *        a la actual) y se exige que la franja marque la fase DE ESA pantalla,
 *        incluso cuando el ojo está parado en otra.
 *   §3 · Un paso que el motor no habilita NO navega. No es un enlace muerto ni
 *        uno que rebota contra el `redirect` de la guardia: se ve, se lee y dice
 *        que todavía no. Es el callejón con un paso más que este repo ya cerró
 *        cuatro veces.
 *   §4 · A 390 px la franja ocupa UNA línea. No es cosmética: la medición de las
 *        catorce mostró que partirse en dos le cuesta 62 px al pliegue en vez de
 *        33, y con eso la ficha —la única pantalla de trabajo cuyo primer campo
 *        entra a ese ancho— lo pierde. La primera versión de la franja lo perdía
 *        por 3 px; esto es lo que no deja que vuelva.
 *
 * Contra el código viejo fallan los cuatro: la franja no existía.
 * El instrumento que produce la tabla de las catorce, antes y después, a los dos
 * anchos, es `scripts/qa-corridas/medir-pliegue-manual.ts`.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
/** FICHA: el recorrido recién arranca — casi todo es futuro. */
let fichaId: string
/** EVALUADA + RESPONDIO: el brief es el paso, con la ficha y el opener atrás. */
let briefId: string
/** CONSTRUCCION con borrador: la mitad del recorrido, con futuro por delante. */
let construyendoId: string
/** APROBADA con la demo enviada: casi el final. */
let enviadoId: string
/** DESCARTADA: el recorrido que se cortó — camino que no es recto. */
let descartadoId: string
/** POSTERGADO a futuro: la pausa comercial — el otro camino que no es recto. */
let pausadoId: string
/** RECHAZADA: el re-loop — el camino que VUELVE. */
let rechazadoId: string
/** EN_REVISION: la demo en la cola de Franco. */
let revisionId: string
/** EVALUADA con toque vencido: aterriza en el seguimiento. */
let toqueId: string

const DIA = 24 * 60 * 60 * 1000

/**
 * Un id de pantalla RETIRADO del mapa. La guardia de la página redirige
 * cualquier id desconocido a la pantalla que la derivación considera actual, así
 * que es la forma de PREGUNTARLE a la derivación dónde está el lead sin
 * re-derivarla acá (misma técnica que `24-paso-que-corresponde`).
 */
const PASO_RETIRADO = 'm3'

/** El `main` VISIBLE — el streaming de React duplica el árbol. */
function main(page: Page) {
  return firstVisible(page.locator('main'))
}

/** La franja VISIBLE de la pantalla que se está mirando. */
function franja(page: Page) {
  return firstVisible(main(page).locator('[data-slot="franja-recorrido"]'))
}

/** Los chips de la franja, en orden, con lo que un lector de pantalla oye. */
async function chips(page: Page) {
  return page.evaluate(() => {
    // La franja VISIBLE, buscada directo: React streamea el árbol duplicado y
    // el primer `main` con alto puede ser el que todavía no la tiene.
    const nav = Array.from(
      document.querySelectorAll('main [data-slot="franja-recorrido"]'),
    ).find((n) => n.getBoundingClientRect().height > 0)
    if (!nav) return null
    return Array.from(nav.querySelectorAll('li')).map((li) => {
      const el = li.firstElementChild as HTMLElement | null
      const r = el?.getBoundingClientRect()
      return {
        // El nombre accesible: lo escriba la franja o no, el chip lo lleva.
        etiqueta: el?.getAttribute('aria-label') ?? '',
        // `esEnlace` es la afirmación de §3: un paso no habilitado no puede ser
        // un `<a href>` — si lo fuera, el salto rebotaría contra la guardia.
        esEnlace: el?.tagName.toLowerCase() === 'a',
        href: el?.getAttribute('href') ?? null,
        current: el?.getAttribute('aria-current') ?? null,
        // Se afirma por VISIBILIDAD: caja con área, y no oculto por estilo.
        visible: Boolean(
          r &&
            r.width > 0 &&
            r.height > 0 &&
            getComputedStyle(el!).visibility !== 'hidden' &&
            getComputedStyle(el!).display !== 'none',
        ),
      }
    })
  })
}

/** El alto real de la franja dentro del scroller (§4). */
async function altoFranja(page: Page) {
  return page.evaluate(() => {
    const nav = Array.from(
      document.querySelectorAll('main [data-slot="franja-recorrido"]'),
    ).find((n) => n.getBoundingClientRect().height > 0)
    return nav ? Math.round(nav.getBoundingClientRect().height) : null
  })
}

/** Adónde redirige la guardia = dónde dice la derivación que está el lead. */
async function pantallaActual(page: Page, leadId: string): Promise<PantallaId> {
  await page.goto(`/setter/leads/${leadId}/manual/${PASO_RETIRADO}`, {
    waitUntil: 'domcontentloaded',
  })
  // El redirect de la guardia se ESPERA, no se lee al vuelo: `page.url()` justo
  // después del `goto` todavía puede traer el id retirado, y el caso mediría el
  // pedido en vez del aterrizaje.
  await expect(page, 'la guardia redirige el id retirado a la pantalla actual').not.toHaveURL(
    new RegExp(`/manual/${PASO_RETIRADO}$`),
  )
  await expect(main(page)).toBeVisible()
  await expect(franja(page), 'la franja del aterrizaje se ve antes de leerla').toBeVisible()
  const url = new URL(page.url())
  const paso = url.pathname.split('/').pop() ?? ''
  expect(esPantallaId(paso), `la guardia aterrizó en "${paso}", que no es una pantalla`).toBe(
    true,
  )
  return paso as PantallaId
}

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  fichaId = (
    await createLead(tracker, { setterId, businessName: 'Franja Ficha', stage: 'FICHA' })
  ).id

  briefId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Franja Brief',
      stage: 'EVALUADA',
      status: 'RESPONDIO',
    })
  ).id
  await registerActivity(briefId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'opener')

  construyendoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Franja Construccion',
      stage: 'CONSTRUCCION',
      status: 'RESPONDIO',
      draftUrl: 'https://franja-draft.netlify.app',
      progresoCompletadas: ['estructura'],
    })
  ).id

  enviadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Franja Enviado',
      stage: 'APROBADA',
      status: 'RESPONDIO',
      enviada: true,
    })
  ).id

  descartadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Franja Descartado',
      stage: 'DESCARTADA',
      status: 'PROSPECTO',
    })
  ).id

  // POSTERGADO con la reactivación por delante: la pausa comercial de P19.
  pausadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Franja Pausado',
      stage: 'BRIEF',
      status: 'POSTERGADO',
      reactivateAt: new Date(Date.now() + 7 * DIA),
    })
  ).id

  rechazadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Franja Rechazado',
      stage: 'RECHAZADA',
      status: 'RESPONDIO',
    })
  ).id

  revisionId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Franja Revision',
      stage: 'EN_REVISION',
      status: 'RESPONDIO',
    })
  ).id

  // EVALUADA + toques SIN_RESPUESTA + toque vencido: aterriza en m5.
  toqueId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Franja Toque',
      stage: 'EVALUADA',
      status: 'PROSPECTO',
      nextFollowUpAt: new Date(Date.now() - DIA),
    })
  ).id
  await registerActivity(toqueId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'toque 1')
  await registerActivity(toqueId, 'INSTAGRAM_DM', 'SIN_RESPUESTA', setterId, 'toque 2')
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/** Las CATORCE, con un lead que las alcanza. */
const CATORCE = [
  { paso: 'm1', lead: () => fichaId },
  { paso: 'm4', lead: () => briefId },
  { paso: 'm5', lead: () => toqueId },
  { paso: 'm6', lead: () => briefId },
  { paso: 'mc1', lead: () => construyendoId },
  { paso: 'mc2', lead: () => construyendoId },
  { paso: 'm13', lead: () => construyendoId },
  { paso: 'm14', lead: () => construyendoId },
  { paso: 'm15', lead: () => enviadoId },
  { paso: 'm16', lead: () => enviadoId },
  { paso: 'mr', lead: () => rechazadoId },
  { paso: 'espera', lead: () => pausadoId },
  { paso: 'revision', lead: () => revisionId },
  { paso: 'archivo', lead: () => descartadoId },
] as const

/**
 * §1 — la franja está en las catorce, visible, con los nueve pasos del manual.
 *
 * Las pantallas que el lead de la lista no alcanza redirigen a su actual (la
 * guardia): el caso vale igual, porque lo que se afirma es que la franja está
 * donde el setter aterrizó — y ahí también tiene que estar. La URL final se
 * lee y se dice en el mensaje.
 */
for (const { paso, lead } of CATORCE) {
  test(`§1 · ${paso} · la franja está, visible, con los nueve pasos`, async ({ page }) => {
    const guard = attachConsoleGuard(page)
    await qaLogin(page, 'setter')
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(`/setter/leads/${lead()}/manual/${paso}`, {
      waitUntil: 'domcontentloaded',
    })
    const aterrizaje = new URL(page.url()).pathname.split('/').pop()
    await expect(main(page)).toBeVisible()

    await expect(
      franja(page),
      `${paso} (aterrizó en ${aterrizaje}): la franja del recorrido se ve`,
    ).toBeVisible()

    const lista = await chips(page)
    expect(lista, `${paso}: hay franja`).not.toBeNull()
    expect(lista!.length, `${paso}: los nueve pasos del manual`).toBe(FASES_EN_ORDEN.length)
    // Cada chip, VISIBLE y nombrando su paso. El nombre sale del registro, no de
    // una literal escrita acá: si `FASES_MANUAL` cambia, esto cambia con él.
    for (const [i, chip] of lista!.entries()) {
      const titulo = FASES_MANUAL[FASES_EN_ORDEN[i]!]!.titulo
      expect(chip.visible, `${paso}: el paso ${i + 1} («${titulo}») se ve`).toBe(true)
      expect(chip.etiqueta, `${paso}: el paso ${i + 1} nombra «${titulo}»`).toContain(titulo)
    }

    expectNoConsoleErrors(guard)
  })
}

/**
 * §2 — el paso de AHORA sale de `posicion.actual`, no de lo que estás mirando.
 *
 * Cuatro momentos del recorrido, y la comparación no se escribe a mano: se le
 * pregunta a la derivación dónde está el lead (la guardia redirige el id
 * retirado) y se exige que la franja marque la fase DE ESA pantalla.
 */
for (const [nombre, lead] of [
  ['ficha', () => fichaId],
  ['brief', () => briefId],
  ['construcción', () => construyendoId],
  ['enviado', () => enviadoId],
  // Los caminos que NO son rectos: el re-loop (vuelve a Construcción) y la
  // pausa comercial (aterriza en la espera, donde NINGÚN paso es el de ahora).
  ['rechazado', () => rechazadoId],
  ['pausado', () => pausadoId],
] as const) {
  test(`§2 · ${nombre} · la franja marca la fase de la pantalla que la derivación señala`, async ({
    page,
  }) => {
    const guard = attachConsoleGuard(page)
    await qaLogin(page, 'setter')
    await page.setViewportSize({ width: 1440, height: 900 })

    const actual = await pantallaActual(page, lead())
    const faseActual = PANTALLAS[actual].fase
    const lista = await chips(page)
    expect(lista, `${nombre}: hay franja en ${actual}`).not.toBeNull()

    const marcados = lista!.filter((c) => c.etiqueta.includes('tu paso ahora'))
    if (faseActual === null) {
      expect(
        marcados.length,
        `${nombre}: ${actual} no tiene fase — ningún paso puede ser el de ahora`,
      ).toBe(0)
    } else {
      expect(marcados.length, `${nombre}: exactamente un paso de ahora`).toBe(1)
      expect(
        marcados[0]!.etiqueta,
        `${nombre}: la derivación aterriza en ${actual} (fase "${faseActual}") y la franja ` +
          `marca «${marcados[0]!.etiqueta}»`,
      ).toContain(FASES_MANUAL[faseActual].titulo)
    }

    expectNoConsoleErrors(guard)
  })
}

/**
 * …y el ojo no se lleva la marca. Parado en una pantalla COMPLETADA, la franja
 * sigue señalando dónde está el lead y sólo mueve el `aria-current`. Sin este
 * caso, marcar el paso de ahora con la pantalla renderizada pasaría en verde.
 */
test('§2 · mirando una completada, el paso de ahora no se muda con el ojo', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.setViewportSize({ width: 1440, height: 900 })

  const actual = await pantallaActual(page, construyendoId)
  const faseActual = PANTALLAS[actual].fase
  expect(faseActual, 'el lead de construcción aterriza en una pantalla con fase').not.toBeNull()

  // m1 quedó completada (el veredicto está registrado) y es navegable.
  await page.goto(`/setter/leads/${construyendoId}/manual/m1`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page).toHaveURL(/\/manual\/m1$/)
  await expect(franja(page)).toBeVisible()

  const lista = await chips(page)
  const marcados = lista!.filter((c) => c.etiqueta.includes('tu paso ahora'))
  expect(marcados.length, 'sigue habiendo un solo paso de ahora').toBe(1)
  expect(
    marcados[0]!.etiqueta,
    'parado en la ficha, el paso de ahora sigue siendo el del lead',
  ).toContain(FASES_MANUAL[faseActual!].titulo)

  // …y lo que SÍ se movió es la marca de «lo estás mirando».
  const viendo = lista!.filter((c) => c.current === 'page')
  expect(viendo.length, 'una sola marca de página').toBe(1)
  expect(viendo[0]!.etiqueta, 'la marca de página es la ficha').toContain(
    FASES_MANUAL.ficha.titulo,
  )

  expectNoConsoleErrors(guard)
})

/**
 * §3 — un paso que el motor no habilita NO navega.
 *
 * Un lead en FICHA sólo tiene su propia pantalla: todo lo que viene después es
 * futuro. La franja tiene que mostrarlo —los nueve están, §1— y no ofrecer el
 * salto. Contra una franja que enlaza los nueve pasos siempre (la forma
 * natural de escribirla mal) esto se pone en rojo.
 */
test('§3 · los pasos que el motor no habilita se ven y no navegan', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto(`/setter/leads/${fichaId}/manual/m1`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m1$/)
  await expect(franja(page)).toBeVisible()

  const lista = await chips(page)
  const futuros = lista!.filter((c) => c.etiqueta.includes('todavía no'))
  expect(
    futuros.length,
    'un lead recién cargado tiene pasos por delante que el motor todavía no abre',
  ).toBeGreaterThan(0)

  for (const chip of futuros) {
    expect(chip.visible, `«${chip.etiqueta}» se ve`).toBe(true)
    expect(
      chip.esEnlace,
      `«${chip.etiqueta}» no puede ser un enlace: el salto rebotaría contra la guardia`,
    ).toBe(false)
    expect(chip.href, `«${chip.etiqueta}» no lleva href`).toBeNull()
  }

  // …y los que SÍ están abiertos llevan a una pantalla que se puede abrir de
  // verdad: se sigue el enlace y la URL no rebota a otra.
  const abiertos = lista!.filter((c) => c.esEnlace)
  expect(abiertos.length, 'al menos un paso alcanzable').toBeGreaterThan(0)
  for (const chip of abiertos) {
    const destino = chip.href!
    await page.goto(destino, { waitUntil: 'domcontentloaded' })
    expect(
      new URL(page.url()).pathname,
      `«${chip.etiqueta}» enlaza a ${destino} y la guardia redirigió: el enlace rebota`,
    ).toBe(destino)
  }

  expectNoConsoleErrors(guard)
})

/**
 * §4 — a 390 px la franja ocupa UNA línea, en las catorce.
 *
 * El alto de un chip es 24 px (el mínimo de área táctil). Dos líneas serían 52+,
 * y ése es exactamente el costo que hizo que la ficha perdiera su primer campo
 * en la primera versión de este sprint. El umbral está por encima de una línea
 * y por debajo de dos a propósito: no fija un diseño, fija que no se parta.
 */
const ALTO_UNA_LINEA = 40

for (const { paso, lead } of CATORCE) {
  test(`§4 · ${paso} · a 390 la franja no se parte en dos líneas`, async ({ page }) => {
    const guard = attachConsoleGuard(page)
    await qaLogin(page, 'setter')
    await page.setViewportSize({ width: 390, height: 844 })

    await page.goto(`/setter/leads/${lead()}/manual/${paso}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(franja(page), `${paso}: la franja se ve a 390`).toBeVisible()

    const alto = await altoFranja(page)
    expect(alto, `${paso}: hay franja`).not.toBeNull()
    expect(
      alto!,
      `${paso}: la franja mide ${alto}px a 390 — se partió en dos líneas y le come el pliegue ` +
        `a las catorce (medido: 62px en vez de 33)`,
    ).toBeLessThanOrEqual(ALTO_UNA_LINEA)

    expectNoConsoleErrors(guard)
  })
}

/**
 * El guard de que la lista de pasos no se vació sola: si `FASES_EN_ORDEN`
 * quedara corta, §1 pasaría en verde comparando dos números chicos.
 */
test('§0 · el recorrido tiene los nueve pasos del manual', async () => {
  expect(FASES_EN_ORDEN.length).toBe(Object.keys(FASES_MANUAL).length)
  expect(FASES_EN_ORDEN.length).toBeGreaterThanOrEqual(9)
})
