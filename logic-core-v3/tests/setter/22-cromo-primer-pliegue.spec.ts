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
 * EL PRIMER PLIEGUE del manual — lo que P17 fija para las catorce pantallas.
 *
 * El piloto P16 achicó la ficha un tercio y el primer campo siguió sin entrar
 * en el fold: la causa no era el contenido de esa pantalla, era el CROMO
 * compartido de `PantallaManual`. Medido, el bloque de trabajo arrancaba a
 * 730 px con el pliegue en 788 — entraban 58 px, o sea el rótulo y nada más.
 *
 * Este archivo fija las tres cosas que el sprint cambió, y ninguna es un
 * número de píxeles arbitrario:
 *
 *   §1 · Un solo nivel de superficie. «Contexto del lead» y «Munición» dejaron
 *        de ser tarjetas; la ÚNICA tarjeta de la pantalla es el bloque de
 *        trabajo. Se afirma sobre el estilo computado, no sobre clases.
 *   §2 · Hay algo accionable dentro del primer pliegue, en las once pantallas
 *        de trabajo, a 1440. Desde P18 el pliegue se mide DESCONTANDO la barra
 *        de acción (`sticky bottom-0`), que tapa la franja de abajo del
 *        scroller: sin eso, la prueba pasaría sobre un control cubierto. Se
 *        afirma por VISIBILIDAD y por geometría: el
 *        pliegue NO es la altura del viewport —el shell del setter es
 *        `fixed inset-0` y el scroller es el `<main>` interno—, así que se lee
 *        de `main.clientHeight` y las alturas se miden contra el origen del
 *        contenido del scroller.
 *   §3 · Lo que se plegó es el preview, nunca la salida. El botón «Copiar
 *        bloque» se lee sin abrir nada; el texto crudo, no. Es la regla de P4
 *        al revés de como se suele romper.
 *
 * Contra el código viejo fallan los tres: §1 porque las tres zonas eran
 * tarjetas, §2 en m5, §3 porque el `<pre>` de 224 px venía siempre abierto.
 *
 * El instrumento que produjo los números —y la tabla de las catorce, antes y
 * después, a los dos anchos— es `scripts/qa-corridas/medir-pliegue-manual.ts`.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let fichaId: string
let openerId: string
let briefId: string
let construyendoId: string
let rechazadoId: string
let aprobadoId: string
let enviadoId: string
let toqueId: string

/** El `main` VISIBLE — el streaming de React duplica el árbol. */
function main(page: Page) {
  return firstVisible(page.locator('main'))
}

/**
 * La geometría del pliegue, leída del scroller real. Devuelve el pliegue y la
 * altura —relativa al origen del contenido— del primer control interactivo
 * VISIBLE fuera de la cabecera. La cabecera se excluye porque sus links son
 * salida y contexto (volver a tu día, Instagram, Maps), no el trabajo.
 */
async function primerAccionable(page: Page) {
  return page.evaluate(() => {
    const scroller = Array.from(document.querySelectorAll('main')).find(
      (m) => m.getBoundingClientRect().height > 0,
    )
    if (!scroller) return null
    const caja = scroller.getBoundingClientRect()
    const header = scroller.querySelector('header')
    // P18 — la barra de acción se excluye igual que la cabecera: es cromo, y
    // además es `sticky`, así que su caja se lee pegada al borde y ganaría este
    // número siempre. Lo que esta prueba mide es dónde arranca el TRABAJO.
    const barraAccion = scroller.querySelector('[data-slot="barra-accion"]')
    const SEL =
      'button, input, textarea, select, [role="button"], [contenteditable="true"], a[href]'
    let mejor: { top: number; etiqueta: string } | null = null
    for (const el of Array.from(scroller.querySelectorAll(SEL))) {
      if (header && header.contains(el)) continue
      if (barraAccion && barraAccion.contains(el)) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      const cs = window.getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none') continue
      const top = Math.round(r.top - caja.top + scroller.scrollTop)
      const etiqueta = (
        el.getAttribute('aria-label') ||
        (el.textContent || '').trim().slice(0, 40) ||
        el.tagName.toLowerCase()
      ).replace(/[\s ]+/g, ' ')
      if (!mejor || top < mejor.top) mejor = { top, etiqueta }
    }
    // P18 — la barra de acción es `sticky bottom-0`: tapa la franja de abajo del
    // scroller, así que el pliegue REAL para el contenido es lo que queda. Sin
    // descontarla, esta prueba pasaría en verde sobre un control cubierto.
    const barra = scroller.querySelector('[data-slot="barra-accion"]')
    const alturaBarra = barra ? Math.round(barra.getBoundingClientRect().height) : 0
    return {
      pliegue: Math.round(scroller.clientHeight) - alturaBarra,
      barra: alturaBarra,
      accionable: mejor,
    }
  })
}

/** ¿Ese elemento se pinta como TARJETA? (marco + fondo + radio propios). */
async function esTarjeta(page: Page, etiquetaAria: string) {
  return page.evaluate((etiqueta) => {
    const scroller = Array.from(document.querySelectorAll('main')).find(
      (m) => m.getBoundingClientRect().height > 0,
    )
    const el = scroller?.querySelector(`[aria-label="${etiqueta}"]`)
    if (!el) return null
    const cs = window.getComputedStyle(el)
    const conBorde =
      parseFloat(cs.borderTopWidth) > 0 &&
      cs.borderTopStyle !== 'none' &&
      cs.borderTopColor !== 'rgba(0, 0, 0, 0)'
    const conFondo =
      cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent'
    return conBorde && conFondo
  }, etiquetaAria)
}

test.beforeAll(async () => {
  const setter = await getSetterQa()
  setterId = setter.id

  fichaId = (
    await createLead(tracker, { setterId, businessName: 'Pliegue Ficha', stage: 'FICHA' })
  ).id

  // EVALUADA + PROSPECTO y sin contactos: el opener está pendiente → m4.
  openerId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Pliegue Opener',
      stage: 'EVALUADA',
      status: 'PROSPECTO',
    })
  ).id

  // EVALUADA + RESPONDIO: el gate del brief queda abierto → m6.
  briefId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Pliegue Brief',
      stage: 'EVALUADA',
      status: 'RESPONDIO',
    })
  ).id

  // CONSTRUCCION con borrador publicado: mc1/mc2 y m14 vivas, m13 completada.
  construyendoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Pliegue Construccion',
      stage: 'CONSTRUCCION',
      status: 'RESPONDIO',
      draftUrl: 'https://pliegue-draft.netlify.app',
      progresoCompletadas: ['estructura'],
    })
  ).id

  rechazadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Pliegue Rechazado',
      stage: 'RECHAZADA',
      status: 'RESPONDIO',
    })
  ).id

  // APROBADA con URL final + RESPONDIO: el gate del envío abre → m15.
  aprobadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Pliegue Aprobado',
      stage: 'APROBADA',
      status: 'RESPONDIO',
    })
  ).id

  // …y con la demo YA enviada, sin reunión: agendar es el paso → m16.
  enviadoId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Pliegue Enviado',
      stage: 'APROBADA',
      status: 'RESPONDIO',
      enviada: true,
    })
  ).id

  // EVALUADA + toques SIN_RESPUESTA + toque vencido: aterriza en m5.
  toqueId = (
    await createLead(tracker, {
      setterId,
      businessName: 'Pliegue Toque',
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

/** Las ONCE pantallas de trabajo del manual, con el lead que las alcanza. */
const PANTALLAS_DE_TRABAJO = [
  { paso: 'm1', lead: () => fichaId },
  { paso: 'm4', lead: () => openerId },
  { paso: 'm5', lead: () => toqueId },
  { paso: 'm6', lead: () => briefId },
  { paso: 'mc1', lead: () => construyendoId },
  { paso: 'mc2', lead: () => construyendoId },
  { paso: 'm13', lead: () => construyendoId },
  { paso: 'm14', lead: () => construyendoId },
  { paso: 'm15', lead: () => aprobadoId },
  { paso: 'm16', lead: () => enviadoId },
  { paso: 'mr', lead: () => rechazadoId },
] as const

for (const { paso, lead } of PANTALLAS_DE_TRABAJO) {
  test(`${paso} · una sola tarjeta, y algo accionable dentro del primer pliegue`, async ({
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

    // §1 — el bloque de trabajo es la única tarjeta de la pantalla. Contra el
    // código viejo esto falla en las tres: las tres zonas eran `rounded-2xl
    // border bg`, y encima la instrucción era una cuarta.
    await expect(
      firstVisible(page.locator('main section[aria-label="Registro"]')),
      `${paso} tiene bloque de trabajo`,
    ).toBeVisible()
    expect(await esTarjeta(page, 'Registro'), `${paso}: el trabajo lleva tarjeta`).toBe(true)
    for (const banda of ['Contexto del lead', 'Munición'] as const) {
      const tarjeta = await esTarjeta(page, banda)
      if (tarjeta === null) continue // la zona puede no renderizarse: sin contenido, no hay banda
      expect(tarjeta, `${paso}: «${banda}» es banda, no tarjeta`).toBe(false)
    }
    expect(
      await esTarjeta(page, 'Instrucción de esta pantalla'),
      `${paso}: la instrucción es banda, no tarjeta`,
    ).toBe(false)

    // §2 — y hay algo accionable DENTRO del primer pliegue. El pliegue sale del
    // scroller (`main.clientHeight`), no del viewport: con `fixed inset-0` la
    // altura del documento es siempre la de la ventana y mediría cualquier cosa.
    const geo = await primerAccionable(page)
    expect(geo, `${paso}: hay scroller`).not.toBeNull()
    expect(
      geo!.accionable,
      `${paso}: la pantalla ofrece algo para hacer fuera de la cabecera`,
    ).not.toBeNull()
    expect(
      geo!.accionable!.top,
      `${paso}: «${geo!.accionable?.etiqueta}» arranca a ${geo!.accionable?.top}px y el pliegue efectivo está en ${geo!.pliegue}px (barra ${geo!.barra}px)`,
    ).toBeLessThan(geo!.pliegue)

    expectNoConsoleErrors(guard)
  })
}

/**
 * §3 — el preview del bloque copiable se pliega; la salida NO.
 *
 * Es el mismo criterio que fija `16-municiones-salida`: lo que destraba se lee
 * sin abrir nada. Acá el que destraba es el botón —copiar es la acción— y lo
 * que se plegó es el texto crudo, que era la pieza más alta del cromo del
 * manual (224 px por bloque, cuatro bloques en mc2).
 */
test('mc2 · el botón de copiar se lee sin abrir nada; el texto crudo no', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto(`/setter/leads/${construyendoId}/manual/mc2`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page).toHaveURL(/\/manual\/mc2$/)

  // La salida está, visible, sin tocar un plegable.
  await expect(
    firstVisible(page.getByRole('button', { name: 'Copiar bloque' })),
    'el botón de copiar no se pliega',
  ).toBeVisible()
  await expect(
    firstVisible(page.locator('main').getByText('Bloque para Claude Design')),
    'el título que dice para qué es tampoco se pliega',
  ).toBeVisible()

  // El texto crudo, en cambio, está PRESENTE y NO VISIBLE: la distinción entera
  // del sprint. `toContainText` pasaría igual con el `<pre>` cerrado — sólo
  // `toBeVisible()` separa «está» de «se lee» (regla de P4).
  const preview = page.locator('main details pre').first()
  await expect(preview, 'el preview existe en el DOM').toHaveCount(1)
  await expect(preview, 'el preview arranca plegado').not.toBeVisible()

  // Y ningún plegable vino abierto: la pantalla se leyó tal cual carga.
  await expect(page.locator('main details[open]')).toHaveCount(0)

  // Abrirlo lo muestra — el contenido no se perdió, se guardó detrás del título.
  await firstVisible(page.getByText(/Ver el texto que vas a copiar/)).click()
  await expect(page.locator('main details[open] pre').first()).toBeVisible()

  expectNoConsoleErrors(guard)
})
