import { test, expect, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { qaLogin } from '../helpers/setter-auth'
import { prisma, disconnect } from '../helpers/setter-db'

/**
 * Corrida M0 — la CAPTURA de la galería de estados del Panel del Setter.
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
  { nombre: '03-m2-al-evaluador', paso: 'm2' },
  { nombre: '04-m3-veredicto-registrar', paso: 'm3' },
  { nombre: '05-m3-veredicto-descartado', paso: 'm3' },
  { nombre: '06-m4-opener-pendiente', paso: 'm4' },
  { nombre: '07-m4-opener-enviado', paso: 'm4' },
  { nombre: '08-espera-post-opener', paso: 'espera' },
  { nombre: '09-m5-toque-vencido', paso: 'm5', mobile: true },
  { nombre: '10-m5-cadencia-agotada', paso: 'm5' },
  { nombre: '11-m5-charla-poblada', paso: 'm5' },
  { nombre: '12-m6-brief-abierto', paso: 'm6' },
  { nombre: '13-m6-brief-guardado', paso: 'm6' },
  { nombre: '14-m7-tilde-deshabilitado', paso: 'm7' },
  { nombre: '15-m7-estructura', paso: 'm7', mobile: true },
  { nombre: '16-m8-personalizacion', paso: 'm8' },
  { nombre: '17-m9-assets', paso: 'm9' },
  { nombre: '18-m10-cta', paso: 'm10' },
  { nombre: '19-m11-calidad', paso: 'm11' },
  { nombre: '20-m12-mobile-fases-hechas', paso: 'm12' },
  { nombre: '21-m13-borrador-vacio', paso: 'm13' },
  { nombre: '22-m14-chequeo', paso: 'm14' },
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

/** Navega, espera el ancla de la pantalla y dispara la foto de página completa. */
async function fotografiar(page: Page, url: string, ancla: string, archivo: string): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.addStyleTag({ content: SIN_ANIMACIONES })
  await expect(page.locator(ancla).first()).toBeVisible()
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

test('desktop · 35-home-foco', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'solo desktop')
  await preparar(page)
  await fotografiar(page, '/setter', 'section[aria-label="Tu foco ahora"]', '35-home-foco.png')
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
  await fotografiar(page, '/setter', 'section[aria-label="Tu foco ahora"]', 'M-35-home-foco.png')
})
