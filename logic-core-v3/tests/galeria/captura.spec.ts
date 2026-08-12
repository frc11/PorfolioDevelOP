import { test, expect, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { qaLogin, mintSessionCookie } from '../helpers/setter-auth'
import { prisma, disconnect } from '../helpers/setter-db'
import { HARD_CHECKS } from '../../src/lib/leados/flow'

/**
 * Corrida M0/G — la CAPTURA de la galería de estados del Panel del Setter.
 *
 * No afirma: fotografía. Cada `test` visita UN estado sembrado por
 * `scripts/dev/m0-galeria-seed.ts` y guarda un screenshot de página completa con
 * nombre predecible (`NN-nombre-del-estado.png`).
 *
 * Reglas de la captura:
 *   · el lead se resuelve por `businessName` (el prefijo `M0-GAL` del sembrador),
 *     no por id hardcodeado → la galería es reproducible contra cualquier DB
 *     sembrada, sin manifiesto intermedio;
 *   · animaciones y transiciones DESACTIVADAS por CSS inyectado (nada de sleeps);
 *   · se espera el elemento que DEFINE la pantalla antes de disparar — si ese
 *     elemento no aparece, el test falla y el estado queda registrado como
 *     inalcanzable en el índice (jamás se fabrica una foto de un estado al que
 *     no se llegó);
 *   · una `expect` mínima de que la URL final es la pedida: si el guard del
 *     server redirige, la foto sería de OTRA pantalla y el índice mentiría.
 */

const SALIDA = path.join('docs', 'manual-usuario', 'galeria', 'png')
const GAL_TAG = 'M0-GAL'
/** Prefijo de email de los setters dedicados al panel de inicio (ver sembrador). */
const GAL_SETTER_PREFIX = 'm0-gal-'

/** Congela animaciones/transiciones para que la foto sea determinística. */
const SIN_ANIMACIONES = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`

/** Los selectores que DEFINEN cada tipo de pantalla (lo que se espera antes de la foto). */
const ANCLA_POR_PANTALLA: Record<string, string> = {
  espera: 'section[aria-label="Esperando respuesta del negocio"]',
  revision: 'section[aria-label="Demo en revisión"]',
  archivo: 'section[aria-label="Negocio cerrado"]',
}
const ANCLA_MANUAL = 'section[aria-label="Instrucción de esta pantalla"]'

type Estado = {
  /** `NN-nombre` — el mismo del sembrador y del índice. */
  nombre: string
  /** Pantalla del registro PANTALLAS (sufijo de la ruta del manual). */
  paso: string
  /** Solo estos se capturan también en mobile (navegación o layout propio). */
  mobile?: boolean
}

const ESTADOS: Estado[] = [
  { nombre: '01-m1-ficha-vacia', paso: 'm1' },
  { nombre: '02-m1-ficha-cargada', paso: 'm1' },
  // P4 fusionó m3 dentro de m2 (llevar la ficha a evaluar + registrar el veredicto
  // son una sola pantalla). 03 es la ida (ficha con señal, sin veredicto) y 04 la
  // vuelta (veredicto ya registrado, m2 completada y navegable): antes los dos
  // sembraban lo MISMO y fotografiaban la misma pantalla dos veces. Renombrados
  // en la corrida G — los nombres viejos decían `m3`, una pantalla que no existe.
  { nombre: '03-m2-al-evaluador', paso: 'm2' },
  { nombre: '04-m2-veredicto-registrado', paso: 'm2' },
  { nombre: '05-m2-veredicto-descartado', paso: 'm2' },
  { nombre: '06-m4-opener-pendiente', paso: 'm4' },
  { nombre: '07-m4-opener-enviado', paso: 'm4' },
  { nombre: '08-espera-post-opener', paso: 'espera' },
  { nombre: '09-m5-toque-vencido', paso: 'm5', mobile: true },
  { nombre: '10-m5-cadencia-agotada', paso: 'm5' },
  { nombre: '11-m5-charla-poblada', paso: 'm5' },
  { nombre: '12-m6-brief-abierto', paso: 'm6' },
  { nombre: '13-m6-brief-guardado', paso: 'm6' },
  // P6-B agrupó las seis pantallas de fase (m7…m12) en DOS: mc1 «Construir»
  // (estructura + personalización + assets) y mc2 «Refinar» (cta + calidad +
  // mobile). Los cinco estados de m8…m12 se RETIRARON —esos ids salieron del
  // registro y el guard del server los redirigía, así que la galería habría
  // fotografiado siete veces la misma pantalla con nombres que mienten— y los
  // números 14…20 se reasignaron a las dos pantallas vigentes con progreso
  // parcial y completo. La numeración no se corrió: el resto del índice no se
  // mueve. El progreso persistido sigue siendo el checklist de SEIS fases.
  { nombre: '14-mc1-tilde-deshabilitado', paso: 'mc1' },
  { nombre: '15-mc1-construir', paso: 'mc1', mobile: true },
  { nombre: '16-mc1-parcial', paso: 'mc1' },
  { nombre: '17-mc1-completa', paso: 'mc1' },
  { nombre: '18-mc2-refinar', paso: 'mc2', mobile: true },
  { nombre: '19-mc2-parcial', paso: 'mc2' },
  { nombre: '20-mc2-completa', paso: 'mc2' },
  { nombre: '21-m13-borrador-vacio', paso: 'm13' },
  // P7 llevó el chequeo a 10 puntos en dos grupos («esto lo revisás vos» / «esto
  // lo mira Franco»): sin los tres momentos, la galería no muestra ni la grilla
  // agrupada ni el momento en que el botón se destraba.
  { nombre: '22-m14-chequeo', paso: 'm14' },
  { nombre: '22b-m14-chequeo-parcial', paso: 'm14', mobile: true },
  { nombre: '22c-m14-chequeo-completo', paso: 'm14' },
  { nombre: '23-revision-franco', paso: 'revision' },
  { nombre: '25-mr-correccion-1', paso: 'mr' },
  { nombre: '26-mr-correccion-2', paso: 'mr' },
  { nombre: '27-m15-envio-abierto', paso: 'm15' },
  { nombre: '28-m15-espera-sin-respuesta', paso: 'espera' },
  { nombre: '29-m15-espera-sin-final-url', paso: 'espera' },
  { nombre: '30-m16-virgen', paso: 'm16' },
  { nombre: '31-m16-ofrecidos', paso: 'm16', mobile: true },
  { nombre: '32-m16-agendada', paso: 'm16' },
  { nombre: '33-m5-post-envio', paso: 'm5' },
  { nombre: '34-archivo-perdido', paso: 'archivo' },
]

async function leadIdDe(nombre: string): Promise<string> {
  const lead = await prisma.osLead.findFirst({
    where: { businessName: `${GAL_TAG} ${nombre}` },
    select: { id: true },
  })
  expect(
    lead,
    `lead sembrado "${GAL_TAG} ${nombre}" — corré: npx tsx scripts/dev/m0-galeria-seed.ts`,
  ).toBeTruthy()
  return lead!.id
}

async function preparar(page: Page): Promise<void> {
  await qaLogin(page, 'setter')
  await page.addStyleTag({ content: SIN_ANIMACIONES }).catch(() => {})
}

/**
 * Entra como uno de los setters DEDICADOS del panel de inicio (ver el sembrador).
 * El foco se deriva de la cartera entera del setter: sobre `setter-qa` —que
 * arrastra los leads de smoke viejos y los 36 de esta misma galería— no hay forma
 * de fotografiar «el foco es construir» ni «no hay nada para trabajar».
 */
async function prepararComoSetterDedicado(
  page: Page,
  slug: string,
  baseURL: string | undefined,
): Promise<void> {
  const email = `${GAL_SETTER_PREFIX}${slug}@develop.test`
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
  expect(
    user,
    `setter dedicado "${email}" — corré: npx tsx scripts/dev/m0-galeria-seed.ts`,
  ).toBeTruthy()
  await mintSessionCookie(page.context(), baseURL ?? '', {
    userId: user!.id,
    email,
    role: user!.role,
  })
  await page.addStyleTag({ content: SIN_ANIMACIONES }).catch(() => {})
}

/** Techo del alto de viewport — evita capturas absurdas si algo crece sin fin. */
const ALTO_MAXIMO = 6000

/**
 * `fullPage: true` NO alcanza en el portal del setter: el `document` mide
 * exactamente el viewport y quien scrollea es el `<main class="overflow-y-auto">`
 * del layout. Sin esto, TODA pantalla más larga que el viewport sale recortada y
 * la galería miente por omisión (verificado: m16 mide 1418px de contenido en
 * 788px visibles). Se agranda el viewport hasta que el contenedor deja de
 * desbordar — iterando, porque al crecer el alto el layout puede reflowear.
 */
async function ajustarViewportAlContenido(page: Page): Promise<number> {
  const medirDesborde = () =>
    page.evaluate(() => {
      const main = document.querySelector('main')
      if (!main) return 0
      return Math.max(0, main.scrollHeight - main.clientHeight)
    })
  const ancho = page.viewportSize()?.width ?? 1440
  for (let intento = 0; intento < 4; intento++) {
    const desborde = await medirDesborde()
    if (desborde === 0) return 0
    const altoActual = page.viewportSize()?.height ?? 900
    const nuevo = Math.min(ALTO_MAXIMO, altoActual + desborde + 24)
    if (nuevo === altoActual) return desborde // techo de ALTO_MAXIMO
    await page.setViewportSize({ width: ancho, height: nuevo })
    await page.waitForTimeout(120) // reflow del layout tras el resize
  }
  return medirDesborde()
}

/**
 * Ajusta y AFIRMA que no quedó contenido fuera de cuadro. Sin esta aserción el
 * ajuste es sólo un intento: si el bucle se queda corto (reflow encadenado,
 * techo de `ALTO_MAXIMO`), el png sale recortado igual y nadie se entera — y una
 * galería recortada es peor que una faltante, porque el manual la cita como si
 * mostrara la pantalla entera. Un alto de captura igual al del viewport no
 * prueba recorte por sí solo (hay pantallas que sí entran): lo que prueba que
 * NINGUNA quedó cortada es esto, medido contra el DOM antes de disparar.
 */
async function ajustarYVerificar(page: Page, etiqueta: string): Promise<void> {
  const desborde = await ajustarViewportAlContenido(page)
  expect(
    desborde,
    `"${etiqueta}": quedaron ${desborde}px de contenido fuera de cuadro — la captura estaría recortada`,
  ).toBe(0)
}

/** Navega, espera el ancla de la pantalla y dispara la foto de la pantalla ENTERA. */
async function fotografiar(page: Page, url: string, ancla: string, archivo: string): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.addStyleTag({ content: SIN_ANIMACIONES })
  await expect(page.locator(ancla).first()).toBeVisible()
  await ajustarYVerificar(page, archivo)
  await page.screenshot({ path: path.join(SALIDA, archivo), fullPage: true })
}

test.beforeAll(async () => {
  await mkdir(SALIDA, { recursive: true })
})

test.afterAll(async () => {
  await disconnect()
})

for (const estado of ESTADOS) {
  test(`desktop · ${estado.nombre}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
    await preparar(page)
    const leadId = await leadIdDe(estado.nombre)
    const url = `/setter/leads/${leadId}/manual/${estado.paso}`
    const ancla = ANCLA_POR_PANTALLA[estado.paso] ?? ANCLA_MANUAL
    await fotografiar(page, url, ancla, `${estado.nombre}.png`)
    // El guard del server redirige lo no habilitado: si redirigió, la foto sería
    // de otra pantalla. Se afirma DESPUÉS de la foto para no perderla.
    await expect(page).toHaveURL(new RegExp(`/manual/${estado.paso}$`))
  })
}

for (const estado of ESTADOS.filter((e) => e.mobile)) {
  test(`mobile · ${estado.nombre}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'solo mobile')
    await preparar(page)
    const leadId = await leadIdDe(estado.nombre)
    const url = `/setter/leads/${leadId}/manual/${estado.paso}`
    const ancla = ANCLA_POR_PANTALLA[estado.paso] ?? ANCLA_MANUAL
    await fotografiar(page, url, ancla, `M-${estado.nombre}.png`)
  })
}

/**
 * 24 — el error persistente y en criollo (4.1). NO se siembra: es un estado de
 * INTERACCIÓN, hay que provocarlo. Dos caras, las dos reales:
 *   · 24a — el setter pega cualquier cosa en la URL del borrador y guarda: la
 *     validación lo frena y el error QUEDA (no es un toast que se va).
 *   · 24b — el setter tiene el chequeo abierto y Franco le mueve el lead por
 *     detrás; al mandar a revisión el server lo rechaza. Es la carrera que 4.1
 *     protege, reproducida moviendo el stage en la DB con la pantalla abierta.
 */
test('desktop · 24a-error-borrador-url-invalida', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
  await preparar(page)
  const leadId = await leadIdDe('21-m13-borrador-vacio')
  await page.goto(`/setter/leads/${leadId}/manual/m13`, { waitUntil: 'domcontentloaded' })
  await page.addStyleTag({ content: SIN_ANIMACIONES })
  await expect(page.locator(ANCLA_MANUAL).first()).toBeVisible()

  await page.locator('input[type="url"]').first().fill('esto no es un link')
  await page.getByRole('button', { name: 'Guardar borrador' }).first().click()

  // El error tiene que QUEDAR en pantalla (no desaparecer como un toast).
  await expect(page.locator('input[type="url"][aria-invalid="true"]').first()).toBeVisible()
  await ajustarYVerificar(page, '24a-error-borrador-url-invalida')
  await page.screenshot({
    path: path.join(SALIDA, '24a-error-borrador-url-invalida.png'),
    fullPage: true,
  })
})

test('desktop · 24b-error-persistente-chequeo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
  await preparar(page)
  const leadId = await leadIdDe('24-error-chequeo')
  await page.goto(`/setter/leads/${leadId}/manual/m14`, { waitUntil: 'domcontentloaded' })
  await page.addStyleTag({ content: SIN_ANIMACIONES })
  await expect(page.locator(ANCLA_MANUAL).first()).toBeVisible()

  // Los obligatorios en verde SON el gate del botón: se tildan por la UI real,
  // uno por uno, como lo haría el setter. El `Toggle` compartido es un
  // `role="switch"` (no aria-pressed), y los duros se renderizan ANTES que los
  // soft-checks → los N primeros switches de la pantalla son los obligatorios.
  // N sale de `HARD_CHECKS.length`, NO de un literal: P7 llevó la lista de 6 a
  // 10 y un `6` hardcodeado dejaba el botón deshabilitado para siempre.
  const duros = page.locator('[role="switch"]')
  for (let i = 0; i < HARD_CHECKS.length; i++) {
    const toggle = duros.nth(i)
    if ((await toggle.getAttribute('aria-checked')) === 'false') await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  }
  const enviar = page.getByRole('button', { name: 'Enviar a revisión' }).first()
  await expect(enviar).toBeEnabled()

  // Franco mueve el lead por detrás, con la pantalla ya abierta. El `finally`
  // devuelve el stage pase lo que pase: si esto quedara a mitad, la próxima
  // corrida arrancaría de un estado distinto y la galería dejaría de converger.
  try {
    await prisma.osLeadDossier.update({
      where: { leadId },
      data: { stage: 'EN_REVISION' },
    })
    await enviar.click()
    // El error PERSISTENTE es el `<p role="alert">` fijo junto al form (4.1) —
    // NO el toast, que es efímero y también lleva role=alert. Se afirma el `p`
    // para no fotografiar el toast creyendo que es el error que queda.
    await expect(page.locator('p[role="alert"]').first()).toBeVisible()
    // Y se espera a que la acción termine: sin esto la foto sale con los botones
    // en spinner, a mitad de vuelo.
    await expect(enviar).toBeEnabled()
    await ajustarYVerificar(page, '24b-error-persistente-chequeo')
    await page.screenshot({
      path: path.join(SALIDA, '24b-error-persistente-chequeo.png'),
      fullPage: true,
    })
  } finally {
    await prisma.osLeadDossier.update({
      where: { leadId },
      data: { stage: 'CONSTRUCCION' },
    })
  }
})

// ── Panel de inicio ─────────────────────────────────────────────────────────
// 35/36 salen de la cartera REAL del setter QA (es el panel tal como lo ve un
// setter con trabajo acumulado). 37…40 salen de setters dedicados: son las
// situaciones del foco de P8, que sobre una cartera cargada no se pueden elegir.

const ANCLA_FOCO = 'section[aria-label="Tu foco ahora"]'
const ANCLA_EN_ESPERA = 'section[aria-label="Nada para trabajar ahora"]'
// `HomeEmpty` no envuelve en `<section aria-label>`: su ancla es su propio título.
const ANCLA_VACIO = 'text=Tu cartera está vacía'

test('desktop · 35-home-foco', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
  await preparar(page)
  await fotografiar(page, '/setter', ANCLA_FOCO, '35-home-foco.png')
})

test('desktop · 36-home-cartera', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
  await preparar(page)
  await fotografiar(
    page,
    '/setter',
    'section[aria-label="Tu cartera completa"]',
    '36-home-cartera.png',
  )
})

test('mobile · 35-home-foco', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'solo mobile')
  await preparar(page)
  await fotografiar(page, '/setter', ANCLA_FOCO, 'M-35-home-foco.png')
})

test('desktop · 37-home-foco-construir', async ({ page, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
  await prepararComoSetterDedicado(page, 'foco-construir', baseURL)
  await fotografiar(page, '/setter', ANCLA_FOCO, '37-home-foco-construir.png')
  // Que la foto muestre lo que el nombre dice: el rótulo del tier CONSTRUIR.
  // Después de la foto, para no perderla si el rótulo cambió de texto.
  await expect(page.getByText('Pasó el filtro y le falta la demo').first()).toBeVisible()
})

test('desktop · 38-home-foco-espera-accion', async ({ page, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
  await prepararComoSetterDedicado(page, 'foco-espera-accion', baseURL)
  await fotografiar(page, '/setter', ANCLA_FOCO, '38-home-foco-espera-accion.png')
  await expect(page.getByText('Te está esperando a vos').first()).toBeVisible()
})

test('desktop · 39-home-vacio', async ({ page, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
  await prepararComoSetterDedicado(page, 'vacio', baseURL)
  await fotografiar(page, '/setter', ANCLA_VACIO, '39-home-vacio.png')
})

test('desktop · 40-home-nada-para-trabajar', async ({ page, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
  await prepararComoSetterDedicado(page, 'nada-para-trabajar', baseURL)
  await fotografiar(page, '/setter', ANCLA_EN_ESPERA, '40-home-nada-para-trabajar.png')
})

test('mobile · 37-home-foco-construir', async ({ page, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'solo mobile')
  await prepararComoSetterDedicado(page, 'foco-construir', baseURL)
  await fotografiar(page, '/setter', ANCLA_FOCO, 'M-37-home-foco-construir.png')
})
