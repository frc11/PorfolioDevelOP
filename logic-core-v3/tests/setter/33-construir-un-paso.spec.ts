import { test, expect, type Locator, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  getDossier,
  prisma,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
import {
  DOCUMENTO_COMPLETO,
  ENCABEZADO_EXACTO,
  VALORES_ENCABEZADO,
} from '../helpers/documento-construccion-fixtures'
import { armarBloqueConstruccion } from '../../src/lib/leados/bloque-construccion'
import { parseBrief, parseFicha, parseProgreso } from '../../src/lib/leados/flow'
import { ROTULOS_DE_CAPAS } from '../../src/lib/leados/prompt-construccion'

/**
 * P42 — «CONSTRUIR» EN UN PASO, en la pantalla: pegá esto y esperá.
 *
 * Lo que la prueba pura (`tests/leados/bloque-construccion`) no puede ver:
 *   A · un solo botón de copiar, el bloque entero a la vista con sus tres capas, y
 *       lo que se copia es exactamente lo que se ve y lo que arma el producto;
 *   B · con encabezado, tono, paleta y tipografía están adentro, y no hay aviso;
 *   C · un brief viejo arma el bloque igual y lo dice;
 *   D · sin link en la herramienta: qué falta y a quién pedírselo, sin bloquear;
 *   E · el tilde único marca las tres fases de «Construir», respeta lo guardado y
 *       no toca las de «Refinar»;
 *   F · lo ya hecho se lee marcado, y una ráfaga sobre el tilde compone;
 *   G · los nueve puntos se fueron, y la pantalla dice qué esperar;
 *   H · en BRIEF el tilde está apagado y dice por qué; el bloque se copia igual.
 *
 * Cada prueba siembra SU lead y lo borra por id (tracker + registro de siembra de
 * P39). Las ausencias se afirman DESPUÉS de una presencia del mismo render —el
 * bloque visible—, nunca solas: una ausencia se cumple antes de que la pantalla
 * termine de pintar. Los clics esperan la hidratación del control, no un tiempo.
 *
 * Contra el build de partida las ocho se ponen rojas en su primera aserción
 * propia (no hay `pre[data-bloque]`: el bloque vivía plegado en «Contexto del
 * lead», y los tildes eran tres). Registrado en el reporte de P42.
 */

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

const tracker: SmokeTracker = newTracker()
let setterId: string

test.beforeAll(async () => {
  setterId = (await getSetterQa()).id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

const pantalla = (leadId: string, paso: string) => `/setter/leads/${leadId}/manual/${paso}`

const BRIEF_CON_ENCABEZADO = {
  titulo: 'Barbería El Faro',
  concepto: VALORES_ENCABEZADO.ANGULO,
  secciones: [...VALORES_ENCABEZADO.SECCIONES],
  cta: VALORES_ENCABEZADO.CTA,
  tono: VALORES_ENCABEZADO.TONO,
  paleta: VALORES_ENCABEZADO.PALETA,
  tipografia: VALORES_ENCABEZADO.TIPOGRAFIA,
  documento: DOCUMENTO_COMPLETO,
}

const FICHA = {
  resenas: '★★★★★ "Marcos es un crack, te deja el corte como te gusta." — Julián R.',
  senalesOperativas: 'Martes a sábados de 10 a 20 h. Turnos por WhatsApp.',
  materiales: { imagenesUrl: 'https://instagram.com/barberiaelfaro', queVende: 'Corte clásico $9.000' },
}

/** Los nueve puntos que «Construir» mostraba hasta P42 (`SHELL_CONSTRUCCION`, fases 1 a 3). */
const NUEVE_PUNTOS = [
  'Copiá el bloque «para Claude Design» y pegalo ahí como primer mensaje.',
  'Pedile una landing de una sola página con las secciones del brief, en ese orden.',
  'No agregues secciones que el brief no pide — el brief es el plano.',
  'Nombre, rubro y zona reales en el hero y el pie.',
  'Usá frases de las reseñas reales como prueba social (las tenés en la ficha).',
  'Horarios, dirección y servicios tal como los publica el negocio.',
  'Bajá el logo y 3–5 fotos del Instagram o Google Maps del negocio.',
  'Insertalas donde Claude Design puso imágenes genéricas o de stock.',
  'Si el negocio no tiene logo, usá el nombre tipografiado — nunca un logo inventado.',
] as const

const main = (page: Page) => firstVisible(page.locator('main'))
const registro = (page: Page) => firstVisible(page.locator('main section[aria-label="Registro"]'))
const tildes = (page: Page) => page.locator('main section[aria-label="Registro"] button[aria-pressed]')

async function sembrar(opts: {
  nombre: string
  stage: 'BRIEF' | 'CONSTRUCCION'
  brief?: Record<string, unknown>
  ficha?: Record<string, unknown>
  progreso?: readonly string[]
}): Promise<string> {
  const { id } = await createLead(tracker, {
    setterId,
    businessName: opts.nombre,
    stage: opts.stage,
    status: 'RESPONDIO',
    ...(opts.progreso ? { progresoCompletadas: opts.progreso } : {}),
  })
  const data: Record<string, unknown> = {}
  if (opts.brief) data.briefJson = opts.brief
  if (opts.ficha) data.fichaJson = opts.ficha
  if (Object.keys(data).length > 0) await prisma.osLeadDossier.update({ where: { leadId: id }, data })
  return id
}

/** Abre «Construir» y devuelve el bloque, ya visible. */
async function abrirConstruir(page: Page, leadId: string): Promise<Locator> {
  await page.goto(pantalla(leadId, 'mc1'), { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc1$/)
  const bloque = firstVisible(page.locator('main pre[data-bloque="construccion"]'))
  await expect(bloque, 'el bloque de «Construir» está a la vista').toBeVisible()
  return bloque
}

/** El control respondió a la hidratación: React ya le colgó sus props. */
async function hidratado(control: Locator): Promise<void> {
  await expect
    .poll(() => control.evaluate((el) => Object.keys(el).some((k) => k.startsWith('__reactProps'))), {
      message: 'el control se hidrató',
      timeout: 20_000,
    })
    .toBe(true)
}

/** Lo GUARDADO, releído y parseado como lo parsea la pantalla. */
async function progresoGuardado(leadId: string): Promise<string[]> {
  return [...parseProgreso((await getDossier(leadId))?.progresoJson ?? null).completadas].sort()
}

/** El bloque que arma el producto con los datos de la base, con las mismas funciones que la página. */
async function bloqueDelProducto(leadId: string): Promise<string> {
  const fila = await prisma.osLead.findUniqueOrThrow({
    where: { id: leadId },
    select: {
      businessName: true,
      industry: true,
      zone: true,
      instagramUrl: true,
      currentWebUrl: true,
      googleMapsUrl: true,
      dossier: { select: { briefJson: true, fichaJson: true } },
    },
  })
  const brief = parseBrief(fila.dossier?.briefJson ?? null)
  expect(brief, 'el brief sembrado se lee').not.toBeNull()
  return armarBloqueConstruccion(
    {
      businessName: fila.businessName,
      industry: fila.industry,
      zone: fila.zone,
      instagramUrl: fila.instagramUrl,
      currentWebUrl: fila.currentWebUrl,
      googleMapsUrl: fila.googleMapsUrl,
    },
    brief!,
    parseFicha(fila.dossier?.fichaJson ?? null),
  ).texto
}

test('A · un solo botón, el bloque entero con sus tres capas, y copia exactamente lo que se ve', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const leadId = await sembrar({ nombre: 'P42 copia', stage: 'CONSTRUCCION', brief: BRIEF_CON_ENCABEZADO, ficha: FICHA })
  await qaLogin(page, 'setter')
  const bloque = await abrirConstruir(page, leadId)

  // Las tres capas, rotuladas adentro del texto, en orden.
  await expect(bloque.locator('[data-capa]')).toHaveText([
    ROTULOS_DE_CAPAS.promptBase,
    ROTULOS_DE_CAPAS.documento,
    ROTULOS_DE_CAPAS.piso,
  ])
  // Entero: ni plegado ni recortado con scroll propio.
  const forma = await bloque.evaluate((el) => ({
    enUnPlegable: el.closest('details') !== null,
    altoMaximo: getComputedStyle(el).maxHeight,
    scrollPropio: el.scrollHeight > el.clientHeight + 1,
  }))
  expect(forma, 'el bloque se lee entero en la pantalla').toEqual({
    enUnPlegable: false,
    altoMaximo: 'none',
    scrollPropio: false,
  })

  // Un solo botón de copiar en toda la pantalla.
  const copiar = main(page).getByRole('button', { name: /^Copi(ar bloque|ado)$/ })
  await expect(copiar).toHaveCount(1)

  await hidratado(copiar)
  await copiar.click()
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()), { message: 'el portapapeles recibe el bloque' })
    .not.toBe('')
  // El portapapeles del sistema en Windows guarda los saltos como CRLF: Chromium
  // escribe «uno\ndos» y `readText()` devuelve «uno\r\ndos» (medido en P42 con un
  // texto de control, sin la app). Se normaliza SOLO eso; cualquier otra
  // diferencia —una capa de menos, un separador distinto— sigue siendo roja.
  const copiado = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')
  const enPantalla = await bloque.evaluate((el) => el.textContent ?? '')
  expect(copiado, 'lo que se copia es lo que la pantalla muestra').toBe(enPantalla)
  expect(copiado, 'y es lo que arma el producto').toBe(await bloqueDelProducto(leadId))

  expectNoConsoleErrors(guard)
})

test('B · con encabezado: tono, paleta y tipografía viajan adentro, y no hay aviso', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const leadId = await sembrar({ nombre: 'P42 encabezado', stage: 'CONSTRUCCION', brief: BRIEF_CON_ENCABEZADO, ficha: FICHA })
  await qaLogin(page, 'setter')
  const bloque = await abrirConstruir(page, leadId)

  await expect(bloque).toContainText(`TONO (así escriben los textos de la demo)\n${VALORES_ENCABEZADO.TONO}`)
  await expect(bloque).toContainText(VALORES_ENCABEZADO.PALETA)
  await expect(bloque).toContainText(`TIPOGRAFÍA (usá estas fuentes, nunca la del sistema)\n${VALORES_ENCABEZADO.TIPOGRAFIA}`)
  for (const linea of ENCABEZADO_EXACTO.split('\n')) {
    await expect(bloque, `el encabezado del documento viaja: «${linea.slice(0, 30)}…»`).toContainText(linea)
  }
  // Presencia del bloque ya afirmada arriba, en el mismo render: ahora la ausencia vale.
  await expect(bloque).not.toContainText('AVISO SOBRE ESTE DOCUMENTO')
  await expect(registro(page).getByRole('note')).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('C · un brief viejo: el bloque se arma igual, con sus tres capas, y lo dice', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  // El brief de siempre de la semilla: sin documento, con el pegado del Gem.
  const leadId = await sembrar({ nombre: 'P42 brief viejo', stage: 'CONSTRUCCION' })
  await qaLogin(page, 'setter')
  const bloque = await abrirConstruir(page, leadId)

  await expect(firstVisible(registro(page).getByRole('note'))).toContainText('no trae el documento del Gem de diseño')
  await expect(bloque.locator('[data-capa]')).toHaveCount(3)
  await expect(bloque).toContainText('AVISO SOBRE ESTE DOCUMENTO')
  await expect(bloque).toContainText('no trae el documento de construcción')
  await expect(bloque).toContainText('Respuesta cruda del Gem de diseño (seed).')

  expectNoConsoleErrors(guard)
})

test('D · sin link en la herramienta: dice qué falta y a quién pedírselo, y no bloquea nada', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const leadId = await sembrar({ nombre: 'P42 sin link', stage: 'CONSTRUCCION', brief: BRIEF_CON_ENCABEZADO })
  await qaLogin(page, 'setter')
  await abrirConstruir(page, leadId)

  // La guía de la herramienta va pegada al botón de copiar, en el bloque de trabajo.
  const trabajo = registro(page)
  await expect(trabajo).toContainText('Claude Design')
  await expect(firstVisible(trabajo.getByText('Link pendiente'))).toBeVisible()
  await expect(firstVisible(trabajo.getByText(/pedíselo a Franco/))).toBeVisible()
  // Lo que se puede hacer sin la herramienta no se apaga.
  await expect(main(page).getByRole('button', { name: 'Copiar bloque' })).toBeEnabled()
  await expect(firstVisible(tildes(page))).toBeEnabled()
  // Y no se inventa un acceso.
  await expect(page.getByRole('link', { name: /Abrir Claude Design/ })).toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('E · el tilde único marca las tres fases de «Construir», respeta lo guardado y no toca «Refinar»', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  // «Construir» a medias (de cuando eran tres tildes) y dos fases de «Refinar».
  const leadId = await sembrar({ nombre: 'P42 tilde', stage: 'CONSTRUCCION', progreso: ['estructura', 'cta', 'calidad'] })
  await qaLogin(page, 'setter')
  await abrirConstruir(page, leadId)

  await expect(tildes(page), 'un tilde, no tres').toHaveCount(1)
  const tilde = firstVisible(tildes(page))
  await expect(tilde).toHaveAccessibleName('La demo quedó construida')
  await expect(tilde, 'a medias se lee sin marcar').toHaveAttribute('aria-pressed', 'false')
  expect(await progresoGuardado(leadId), 'abrir la pantalla no reescribe lo guardado').toEqual(['calidad', 'cta', 'estructura'])

  await hidratado(tilde)
  await tilde.click()
  await expect
    .poll(() => progresoGuardado(leadId), { message: 'marcar suma las dos que faltaban de «Construir»', timeout: 20_000 })
    .toEqual(['assets', 'calidad', 'cta', 'estructura', 'personalizacion'])
  await expect(firstVisible(registro(page).getByRole('status').filter({ hasText: 'Guardado' }))).toBeVisible({
    timeout: 20_000,
  })

  await page.reload({ waitUntil: 'domcontentloaded' })
  const tildeRecargado = firstVisible(tildes(page))
  await expect(tildeRecargado, 'lo guardado se ve marcado').toHaveAttribute('aria-pressed', 'true')

  await hidratado(tildeRecargado)
  await tildeRecargado.click()
  await expect
    .poll(() => progresoGuardado(leadId), { message: 'desmarcar saca las tres de «Construir» y deja las de «Refinar»', timeout: 20_000 })
    .toEqual(['calidad', 'cta'])

  // «Refinar» sigue con sus tres tildes, y con sus dos marcas.
  await page.goto(pantalla(leadId, 'mc2'), { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/mc2$/)
  const deRefinar = tildes(page)
  await expect(deRefinar).toHaveCount(3)
  await expect(deRefinar.nth(0)).toHaveAttribute('aria-pressed', 'true')
  await expect(deRefinar.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(deRefinar.nth(2)).toHaveAttribute('aria-pressed', 'false')

  expectNoConsoleErrors(guard)
})

test('F · lo ya construido se lee marcado, y una ráfaga de tres clics sobre el tilde compone', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const hecho = await sembrar({
    nombre: 'P42 construida',
    stage: 'CONSTRUCCION',
    progreso: ['estructura', 'personalizacion', 'assets', 'cta', 'calidad', 'mobile'],
  })
  const rafaga = await sembrar({ nombre: 'P42 rafaga', stage: 'CONSTRUCCION' })
  await qaLogin(page, 'setter')

  await abrirConstruir(page, hecho)
  await expect(firstVisible(tildes(page)), 'las seis guardadas: «Construir» marcada').toHaveAttribute('aria-pressed', 'true')

  await abrirConstruir(page, rafaga)
  const tilde = firstVisible(tildes(page))
  await hidratado(tilde)
  // Tres clics en el mismo tick: marcar, desmarcar, marcar. El resultado es el
  // compuesto (marcada), no el último write sobre una base vieja.
  await page.evaluate(() => {
    const boton = document.querySelector<HTMLButtonElement>('main section[aria-label="Registro"] button[aria-pressed]')
    boton?.click()
    boton?.click()
    boton?.click()
  })
  await expect
    .poll(() => progresoGuardado(rafaga), { message: 'tres clics dejan la pantalla marcada', timeout: 20_000 })
    .toEqual(['assets', 'estructura', 'personalizacion'])
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(firstVisible(tildes(page))).toHaveAttribute('aria-pressed', 'true')

  expectNoConsoleErrors(guard)
})

test('G · los nueve puntos se fueron, y la pantalla dice qué esperar cuando termine', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const leadId = await sembrar({ nombre: 'P42 que esperar', stage: 'CONSTRUCCION', brief: BRIEF_CON_ENCABEZADO })
  await qaLogin(page, 'setter')
  await abrirConstruir(page, leadId)

  const esperar = firstVisible(page.locator('main section[aria-label="Qué esperar de Claude Design"]'))
  await expect(esperar).toBeVisible()
  await expect(esperar).toContainText('Te devuelve una lista: las secciones que construyó, lo que no pudo hacer, los datos que le faltaron y lo que decidió solo.')
  for (const seccion of VALORES_ENCABEZADO.SECCIONES) {
    await expect(firstVisible(esperar.getByText(seccion, { exact: true })), `se compara contra «${seccion}»`).toBeVisible()
  }
  await expect(esperar).toContainText('Si falta alguna, pedile esa sola')

  // Con la pantalla ya pintada: lo que se fue, no está.
  for (const punto of NUEVE_PUNTOS) {
    await expect(main(page), `se fue: «${punto.slice(0, 40)}…»`).not.toContainText(punto)
  }
  await expect(main(page)).not.toContainText('Guía preliminar')
  await expect(page.locator('main section[aria-label="Contexto del lead"]'), 'el bloque no es contexto').toHaveCount(0)

  expectNoConsoleErrors(guard)
})

test('H · todavía en BRIEF: el tilde apagado dice por qué, y el bloque se copia igual', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const leadId = await sembrar({ nombre: 'P42 por arrancar', stage: 'BRIEF', brief: BRIEF_CON_ENCABEZADO })
  await qaLogin(page, 'setter')
  await abrirConstruir(page, leadId)

  const tilde = firstVisible(tildes(page))
  await expect(tilde).toBeDisabled()
  await expect(registro(page)).toContainText('El tilde se abre cuando arranques la construcción, con el botón «Arrancar construcción».')
  await expect(firstVisible(page.getByRole('button', { name: 'Arrancar construcción' }))).toBeVisible()
  await expect(main(page).getByRole('button', { name: 'Copiar bloque' })).toBeEnabled()

  expectNoConsoleErrors(guard)
})
