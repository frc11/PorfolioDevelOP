import { test, expect, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { fieldControl, firstVisible, vis } from '../helpers/setter-ui'
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
  DOCUMENTO_SIN_ENCABEZADO,
  DOCUMENTO_SIN_PALETA,
  VALORES_ENCABEZADO,
  VUELTA_DECISIONES,
  VUELTA_ESPECIFICACION,
  VUELTA_LECTURA,
} from '../helpers/documento-construccion-fixtures'
import { parseBrief } from '../../src/lib/leados/flow'
import { GUIA_BRIEF } from '../../src/lib/leados/guidance-content'

/**
 * P40 — EL BRIEF EN CUATRO VUELTAS CON EL GEM, en la pantalla.
 *
 * Lo que ningún test puro puede ver, porque es de la pantalla:
 *   A · las cuatro vueltas en orden, una desplegada, la siguiente se abre SOLA
 *       (sin botón de «siguiente»), cada mensaje trae lo que se pegó antes, volver
 *       no pierde nada, y el documento completa los campos del brief;
 *   B · el avance no se come el click que lo dispara;
 *   C · un documento sin encabezado degrada, lo dice, y el brief se guarda;
 *   D · a un documento le falta una obligatoria: qué ve el setter;
 *   E · un brief viejo sigue abriendo y guardando — y no le aparece nada;
 *   F · el bloque de construcción lleva tono, paleta, tipografía y el documento;
 *   G · lo leído llega a las pantallas que siguen (m14) y a la revisión de Franco.
 *
 * Cada prueba siembra SU lead y lo borra por id (el tracker, con el registro de
 * siembra de P39). Todo se afirma por VISIBILIDAD —una vuelta plegada no se monta,
 * así que «no se ve» y «no está» dicen lo mismo— y se espera por condición.
 *
 * Contra el código de partida (build de P39) las ocho se ponen rojas en su
 * primera aserción propia: no hay vueltas, ni lectura, ni campos nuevos. E cae ahí
 * porque el re-pegado ya no muestra las vueltas; su mitad de guardia —que el brief
 * viejo se guarde sin perder ni sumar claves— se probó con un sabotaje (un campo
 * nuevo obligatorio), en la bitácora de P40.
 */

const pantalla = (leadId: string, paso: string) => `/setter/leads/${leadId}/manual/${paso}`

const CABECERAS = ['1 · Lectura estética', '2 · Decisiones', '3 · Especificación', '4 · Caza de huecos'] as const

const cabecera = (page: Page, nombre: string) => firstVisible(page.getByRole('button', { name: nombre }))

/** La vuelta desplegada, leída del propio control de disclosure. */
async function vueltaAbierta(page: Page): Promise<string> {
  const abiertas: string[] = []
  for (const nombre of CABECERAS) {
    if ((await cabecera(page, nombre).getAttribute('aria-expanded')) === 'true') abiertas.push(nombre)
  }
  expect(abiertas, 'exactamente una vuelta desplegada').toHaveLength(1)
  return abiertas[0]!
}

/** Sacar el foco de la vuelta, a un campo del brief (que vive afuera del acordeón). */
async function salirDeLaVuelta(page: Page) {
  await firstVisible(fieldControl(page, GUIA_BRIEF.campos.titulo.label)).focus()
}

/**
 * Pegar en una vuelta y esperar a que la PANTALLA lo tenga: la cabecera pasa a
 * «Pegada». Sin esta espera, un `fill` que llega antes de la hidratación deja el
 * texto en el DOM pero no en el estado del formulario, y el recorrido no avanza
 * por un motivo que no es del producto (medido en la primera corrida de P40).
 */
async function pegarEnVuelta(page: Page, indice: 0 | 1 | 2, texto: string) {
  const campo = firstVisible(fieldControl(page, `Lo que devolvió el Gem — vuelta ${indice + 1}`))
  await expect(async () => {
    await campo.fill(texto)
    await expect(cabecera(page, CABECERAS[indice]).getByText('Pegada')).toBeVisible({ timeout: 1_000 })
  }).toPass()
}

/** Abrir una vuelta con un click en su cabecera, reintentando si el click llegó antes de hidratar. */
async function abrirVuelta(page: Page, nombre: (typeof CABECERAS)[number]) {
  await expect(async () => {
    await cabecera(page, nombre).click()
    expect(await vueltaAbierta(page)).toBe(nombre)
  }).toPass()
}

/** El texto que copia el botón de la vuelta abierta, abierto y leído en pantalla. */
async function mensajeDeLaVueltaAbierta(page: Page, nombre: string) {
  const region = firstVisible(page.getByRole('region', { name: nombre }))
  await region.getByText(/Ver el texto que vas a copiar/).click()
  const texto = firstVisible(region.locator('details[open] pre'))
  await expect(texto).toBeVisible()
  return texto
}

const tracker: SmokeTracker = newTracker()
let setterId: string

test.beforeAll(async () => {
  setterId = (await getSetterQa()).id
})
test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('A · las cuatro vueltas en orden: la siguiente se abre sola, cada una trae la anterior, y el documento llena el brief', async ({
  page,
}) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P40 vueltas',
    stage: 'EVALUADA',
    status: 'RESPONDIO',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined)) // guardia de salida
  await page.goto(pantalla(leadId, 'm6'), { waitUntil: 'domcontentloaded' })

  // Las cuatro cabeceras, en orden, desde el principio; y ningún «siguiente».
  for (const nombre of CABECERAS) await expect(cabecera(page, nombre), `está «${nombre}»`).toBeVisible()
  await expect(page.getByRole('button', { name: /^siguiente$/i })).toHaveCount(0)
  expect(await vueltaAbierta(page), 'un brief nuevo arranca en la vuelta 1').toBe(CABECERAS[0])

  // La vuelta 1 tiene qué copiar, dónde pegar y dónde anotar lo corregido. Las
  // otras no se ven (ni están: plegadas no se montan).
  const vuelta1 = firstVisible(page.getByRole('region', { name: CABECERAS[0] }))
  await expect(vis(vuelta1.getByRole('button', { name: 'Copiar bloque' }))).toHaveCount(1)
  await expect(firstVisible(fieldControl(page, 'Lo que corregiste — vuelta 1'))).toBeVisible()
  await expect(vis(fieldControl(page, 'Lo que devolvió el Gem — vuelta 2'))).toHaveCount(0)
  // Y la cuarta dice, plegada, que el paso todavía no llegó al documento.
  await expect(cabecera(page, CABECERAS[3]).getByText('Falta el documento definitivo')).toBeVisible()

  // ── Vuelta 1 ─────────────────────────────────────────────────────────────
  await pegarEnVuelta(page, 0, VUELTA_LECTURA)
  await firstVisible(fieldControl(page, 'Lo que corregiste — vuelta 1')).fill('El logo es blanco, no crema.')
  await salirDeLaVuelta(page)
  await expect.poll(() => vueltaAbierta(page), { message: 'la vuelta 2 se abre sola' }).toBe(CABECERAS[1])

  // El mensaje de la vuelta 2 TRAE la lectura pegada, con la corrección.
  const mensaje2 = await mensajeDeLaVueltaAbierta(page, CABECERAS[1])
  await expect(mensaje2).toContainText('MUNDO VISUAL')
  await expect(mensaje2).toContainText('Mis correcciones:')
  await expect(mensaje2).toContainText('El logo es blanco, no crema.')

  // ── Vueltas 2 y 3 ────────────────────────────────────────────────────────
  await pegarEnVuelta(page, 1, VUELTA_DECISIONES)
  await salirDeLaVuelta(page)
  await expect.poll(() => vueltaAbierta(page)).toBe(CABECERAS[2])
  await pegarEnVuelta(page, 2, VUELTA_ESPECIFICACION)
  await salirDeLaVuelta(page)
  await expect.poll(() => vueltaAbierta(page)).toBe(CABECERAS[3])

  // ── Vuelta 4 · el documento ──────────────────────────────────────────────
  await firstVisible(fieldControl(page, 'El documento definitivo — vuelta 4')).fill(DOCUMENTO_COMPLETO)
  await expect(
    firstVisible(page.getByText('Leí el encabezado del documento')),
    'la pantalla dice lo que leyó',
  ).toBeVisible()
  await expect(cabecera(page, CABECERAS[3]).getByText('Documento pegado · encabezado leído')).toBeVisible()

  // Lo leído, en los campos del brief — sin transcribir nada.
  await expect(firstVisible(fieldControl(page, 'Secciones de la demo'))).toHaveValue(
    VALORES_ENCABEZADO.SECCIONES.join('\n'),
  )
  await expect(firstVisible(fieldControl(page, 'Paleta'))).toHaveValue(VALORES_ENCABEZADO.PALETA)
  await expect(firstVisible(fieldControl(page, 'Tipografía'))).toHaveValue(VALORES_ENCABEZADO.TIPOGRAFIA)
  await expect(firstVisible(fieldControl(page, 'Tono'))).toHaveValue(VALORES_ENCABEZADO.TONO)
  await expect(firstVisible(fieldControl(page, 'Llamado a la acción (CTA)'))).toHaveValue(VALORES_ENCABEZADO.CTA)

  // Volver atrás no pierde nada: la vuelta 1 sigue con lo pegado, letra por letra.
  await cabecera(page, CABECERAS[0]).click()
  await expect(firstVisible(fieldControl(page, 'Lo que devolvió el Gem — vuelta 1'))).toHaveValue(VUELTA_LECTURA)
  await expect(firstVisible(fieldControl(page, 'Lo que corregiste — vuelta 1'))).toHaveValue(
    'El logo es blanco, no crema.',
  )

  // ── Guardar ──────────────────────────────────────────────────────────────
  await firstVisible(page.getByRole('button', { name: 'Guardar brief' })).click()
  await expect
    .poll(async () => (await getDossier(leadId))?.stage, { message: 'el brief se guardó y el paso cerró' })
    .toBe('BRIEF')
  const brief = parseBrief((await getDossier(leadId))?.briefJson ?? null)
  expect(brief, 'lo guardado se lee con el contrato').not.toBeNull()
  expect(brief?.documento).toBe(DOCUMENTO_COMPLETO)
  expect(brief?.paleta).toBe(VALORES_ENCABEZADO.PALETA)
  expect(brief?.vueltas?.lectura?.respuesta).toBe(VUELTA_LECTURA)
  expect(brief?.vueltas?.lectura?.correccion).toBe('El logo es blanco, no crema.')
  expect(brief?.vueltas?.decisiones?.respuesta).toBe(VUELTA_DECISIONES)
  expect(brief?.vueltas?.especificacion?.respuesta, 'el borrador no se guarda: lo reemplaza el documento').toBeUndefined()

  expectNoConsoleErrors(guard)
})

test('B · el avance no se come el click: apretar un campo de afuera lo enfoca Y abre la vuelta siguiente', async ({
  page,
}) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P40 click',
    stage: 'EVALUADA',
    status: 'RESPONDIO',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined))
  await page.goto(pantalla(leadId, 'm6'), { waitUntil: 'domcontentloaded' })
  expect(await vueltaAbierta(page)).toBe(CABECERAS[0])

  await pegarEnVuelta(page, 0, VUELTA_LECTURA)
  expect(await vueltaAbierta(page), 'pegar no avanza: todavía no salió de la vuelta').toBe(CABECERAS[0])
  // Un click DE VERDAD en un campo que vive debajo del acordeón: plegar la vuelta
  // 1 y abrir la 2 cambia la altura de lo que hay arriba de él. Si el avance no
  // esperara al `pointerup`, el click caería en otro lado y el campo no recibiría
  // lo que se escribe.
  const tono = firstVisible(fieldControl(page, 'Tono'))
  await tono.click()
  await page.keyboard.type('cercano')
  await expect(tono, 'el click llegó al campo').toHaveValue('cercano')
  await expect.poll(() => vueltaAbierta(page), { message: 'y el recorrido avanzó igual' }).toBe(CABECERAS[1])
})

test('C · un documento sin encabezado degrada, lo dice, y el brief se guarda igual', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P40 sin encabezado',
    stage: 'EVALUADA',
    status: 'RESPONDIO',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined))
  await page.goto(pantalla(leadId, 'm6'), { waitUntil: 'domcontentloaded' })
  expect(await vueltaAbierta(page)).toBe(CABECERAS[0])

  // Las cabeceras abren con un click: se puede ir directo a la cuarta.
  await abrirVuelta(page, CABECERAS[3])
  await firstVisible(fieldControl(page, 'El documento definitivo — vuelta 4')).fill(DOCUMENTO_SIN_ENCABEZADO)

  await expect(firstVisible(page.getByText('Este documento no trae el encabezado'))).toBeVisible()
  await expect(firstVisible(page.getByText(/No se pierde nada: el documento se guarda y viaja entero/))).toBeVisible()
  await expect(firstVisible(page.getByText(/Escribí vos las secciones, la paleta y la tipografía/))).toBeVisible()
  await expect(cabecera(page, CABECERAS[3]).getByText('Documento pegado · no trae el encabezado')).toBeVisible()
  // Nada se completó solo: no había de dónde.
  await expect(firstVisible(fieldControl(page, 'Secciones de la demo'))).toHaveValue('')

  // Y el setter puede seguir: escribe las secciones y guarda.
  await firstVisible(fieldControl(page, 'Secciones de la demo')).fill('Hero\nPrecios\nContacto')
  await firstVisible(page.getByRole('button', { name: 'Guardar brief' })).click()
  await expect.poll(async () => (await getDossier(leadId))?.stage).toBe('BRIEF')
  const brief = parseBrief((await getDossier(leadId))?.briefJson ?? null)
  expect(brief?.documento, 'el documento se guardó entero, tal cual se pegó').toBe(DOCUMENTO_SIN_ENCABEZADO)
  expect(brief?.secciones).toEqual(['Hero', 'Precios', 'Contacto'])
  expect(brief?.paleta).toBeUndefined()

  expectNoConsoleErrors(guard)
})

test('D · al documento le falta una obligatoria: el setter ve cuál, por qué importa y qué hacer', async ({ page }) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P40 falta paleta',
    stage: 'EVALUADA',
    status: 'RESPONDIO',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined))
  await page.goto(pantalla(leadId, 'm6'), { waitUntil: 'domcontentloaded' })
  expect(await vueltaAbierta(page)).toBe(CABECERAS[0])

  await abrirVuelta(page, CABECERAS[3])
  await firstVisible(fieldControl(page, 'El documento definitivo — vuelta 4')).fill(DOCUMENTO_SIN_PALETA)

  await expect(firstVisible(page.getByText('Al principio del documento falta algo'))).toBeVisible()
  await expect(
    firstVisible(page.getByText('Falta la línea PALETA: sin la paleta, Claude Design elige los colores por su cuenta.')),
  ).toBeVisible()
  await expect(firstVisible(page.getByText(/Pedile al Gem que te mande el documento de nuevo/))).toBeVisible()
  await expect(cabecera(page, CABECERAS[3]).getByText('Documento pegado · falta PALETA')).toBeVisible()
  // Lo que sí vino se completó; lo que falta queda para escribir.
  await expect(firstVisible(fieldControl(page, 'Tipografía'))).toHaveValue(VALORES_ENCABEZADO.TIPOGRAFIA)
  await expect(firstVisible(fieldControl(page, 'Paleta'))).toHaveValue('')

  // No frena: se guarda igual.
  await firstVisible(page.getByRole('button', { name: 'Guardar brief' })).click()
  await expect.poll(async () => (await getDossier(leadId))?.stage).toBe('BRIEF')
  const brief = parseBrief((await getDossier(leadId))?.briefJson ?? null)
  expect(brief?.documento).toBe(DOCUMENTO_SIN_PALETA)
  expect(brief?.paleta).toBeUndefined()
  expect(brief?.secciones).toEqual([...VALORES_ENCABEZADO.SECCIONES])
})

test('E · un brief viejo sigue abriendo y guardando, y no le aparece ninguna clave nueva', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  // El brief de siempre de la semilla: titulo, concepto, secciones y pegado del Gem.
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P40 brief viejo',
    stage: 'BRIEF',
    status: 'RESPONDIO',
  })
  const antes = (await getDossier(leadId))?.briefJson as Record<string, unknown>
  expect(Object.keys(antes).sort(), 'la forma vieja, sembrada').toEqual(['concepto', 'pegadoGem', 'secciones', 'titulo'])

  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined))
  await page.goto(pantalla(leadId, 'm6'), { waitUntil: 'domcontentloaded' })

  // Abre: el resumen del brief guardado.
  await expect(firstVisible(page.getByText('Landing demo — negocio local'))).toBeVisible()
  await expect(firstVisible(page.getByText('Hero · Servicios · Reseñas · Contacto'))).toBeVisible()

  // Re-pegar: el formulario con las cuatro vueltas vacías y lo guardado en su lugar.
  // (Reintentado: un click que llega antes de hidratar no abre nada.)
  await expect(async () => {
    await firstVisible(page.getByRole('button', { name: /Quedó genérico — re-pegar/ })).click({ timeout: 2_000 })
    await expect(cabecera(page, CABECERAS[0])).toBeVisible({ timeout: 1_000 })
  }).toPass()
  await expect(firstVisible(fieldControl(page, 'Secciones de la demo'))).toHaveValue('Hero\nServicios\nReseñas\nContacto')
  await expect(firstVisible(fieldControl(page, 'Respuesta del Gem'))).toHaveValue(
    'Respuesta cruda del Gem de diseño (seed).',
  )

  // Guarda (autoguardado del re-pegado) un cambio chico.
  await firstVisible(fieldControl(page, 'Llamado a la acción (CTA)')).fill('Pedí tu turno por WhatsApp')
  await expect
    .poll(async () => ((await getDossier(leadId))?.briefJson as Record<string, unknown> | null)?.cta, {
      message: 'el brief viejo se guardó',
      timeout: 20_000,
    })
    .toBe('Pedí tu turno por WhatsApp')

  const despues = (await getDossier(leadId))?.briefJson as Record<string, unknown>
  expect(Object.keys(despues).sort(), 'lo de antes + el CTA, y nada más').toEqual([
    'concepto',
    'cta',
    'pegadoGem',
    'secciones',
    'titulo',
  ])
  for (const clave of ['titulo', 'concepto', 'secciones', 'pegadoGem']) {
    expect(despues[clave], `«${clave}» quedó igual`).toEqual(antes[clave])
  }
  expect(parseBrief(despues), 'y sigue parseando').not.toBeNull()

  expectNoConsoleErrors(guard)
})

/** Un brief de las cuatro vueltas, guardado como lo guarda la pantalla. */
function briefDeCuatroVueltas() {
  return {
    titulo: 'Barbería El Faro',
    concepto: VALORES_ENCABEZADO.ANGULO,
    secciones: [...VALORES_ENCABEZADO.SECCIONES],
    cta: VALORES_ENCABEZADO.CTA,
    tono: VALORES_ENCABEZADO.TONO,
    paleta: VALORES_ENCABEZADO.PALETA,
    tipografia: VALORES_ENCABEZADO.TIPOGRAFIA,
    documento: DOCUMENTO_COMPLETO,
    vueltas: { lectura: { respuesta: VUELTA_LECTURA }, decisiones: { respuesta: VUELTA_DECISIONES } },
  }
}

test('F · el bloque de construcción lleva tono, paleta, tipografía y el documento', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P40 bloque',
    stage: 'BRIEF',
    status: 'RESPONDIO',
  })
  await prisma.osLeadDossier.update({ where: { leadId }, data: { briefJson: briefDeCuatroVueltas() } })

  await qaLogin(page, 'setter')
  await page.goto(pantalla(leadId, 'mc1'), { waitUntil: 'domcontentloaded' })
  // P42 — el bloque de mc1 dejó de vivir plegado en «Contexto del lead»: es la
  // carga de la pantalla y se muestra entero en el bloque de trabajo. Lo que esta
  // prueba fija —que lleve tono, paleta, tipografía y el documento— no cambia.
  const trabajo = firstVisible(page.locator('main [aria-label="Registro"]'))
  await expect(trabajo.getByText('Bloque para Claude Design')).toBeVisible()

  const bloque = firstVisible(trabajo.locator('pre[data-bloque="construccion"]'))
  await expect(bloque).toBeVisible()
  await expect(bloque).toContainText(`TONO (así escriben los textos de la demo)`)
  await expect(bloque).toContainText(VALORES_ENCABEZADO.TONO)
  await expect(bloque).toContainText('PALETA (usá estos colores y ningún otro')
  await expect(bloque).toContainText(VALORES_ENCABEZADO.PALETA)
  await expect(bloque).toContainText('TIPOGRAFÍA (usá estas fuentes, nunca la del sistema)')
  await expect(bloque).toContainText(VALORES_ENCABEZADO.TIPOGRAFIA)
  await expect(bloque, 'y el documento, con su encabezado').toContainText('LO QUE SE DEJA AFUERA A PROPÓSITO')
  await expect(bloque).not.toContainText(GUIA_BRIEF.campos.pegadoGem.faltante!)

  expectNoConsoleErrors(guard)
})

test('G1 · lo leído llega al chequeo final: «El brief pedía» dice también cómo tenía que verse', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P40 chequeo',
    stage: 'CONSTRUCCION',
    status: 'RESPONDIO',
    draftUrl: 'https://p40-draft.netlify.app',
  })
  await prisma.osLeadDossier.update({ where: { leadId }, data: { briefJson: briefDeCuatroVueltas() } })

  await qaLogin(page, 'setter')
  await page.goto(pantalla(leadId, 'm14'), { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(page.getByText('El brief pedía'))).toBeVisible()
  await expect(firstVisible(page.getByText(VALORES_ENCABEZADO.PALETA))).toBeVisible()
  await expect(firstVisible(page.getByText(VALORES_ENCABEZADO.TIPOGRAFIA))).toBeVisible()

  expectNoConsoleErrors(guard)
})

test('G2 · y a la revisión de Franco: la dirección visual, y sin el «falta la respuesta del Gem»', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  // Sembrado en BRIEF y movido a revisión por la base, sin borrador — la forma de
  // `19` B1c: la semilla de EN_REVISION trae un borrador que la revisión enmarca
  // en un iframe, y ese iframe ensucia la consola con un aviso ajeno a esto.
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P40 revision',
    stage: 'BRIEF',
    status: 'RESPONDIO',
  })
  // Sin pegado del Gem, con documento: el brief SÍ trae lo del Gem, y decir que
  // falta sería mentirle a Franco.
  await prisma.osLeadDossier.update({
    where: { leadId },
    data: { stage: 'EN_REVISION', briefJson: briefDeCuatroVueltas() },
  })

  await qaLogin(page, 'super-admin')
  await page.goto(`/admin/leados/${leadId}`, { waitUntil: 'domcontentloaded' })
  await expect(firstVisible(page.getByText('Brief de diseño'))).toBeVisible()
  await expect(firstVisible(page.getByText(VALORES_ENCABEZADO.PALETA))).toBeVisible()
  await expect(firstVisible(page.getByText('Ver el documento de construcción ›'))).toBeVisible()
  await expect(firstVisible(page.getByText('Ver las vueltas con el Gem ›'))).toBeVisible()
  await expect(vis(page.getByText(GUIA_BRIEF.campos.pegadoGem.faltante!))).toHaveCount(0)

  expectNoConsoleErrors(guard)
})
