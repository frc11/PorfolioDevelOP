import { test, expect, type Page } from '@playwright/test'
import { qaLogin } from '../helpers/setter-auth'
import { firstVisible, fieldControl, pickSelect, expectToast, vis } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  getDossier,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * P16 — LA FICHA ES UN RECORRIDO POR FUENTES, Y AVANZA SOLA.
 *
 * Los mismos campos de siempre, agrupados por el lugar del que se sacan
 * (Instagram, Google, la web que ya tienen) más el balance, y el veredicto como
 * último bloque. Este spec fija las tres cosas que el reordenamiento promete y
 * que ningún invariante puede ver, porque son de la pantalla:
 *
 *   1. Solo hay UN bloque desplegado, y el siguiente se abre SOLO — sin botón de
 *      «siguiente». Se afirma por VISIBILIDAD: un campo de un bloque plegado no
 *      está montado, así que «no se ve» y «no está» dicen lo mismo y ninguna
 *      aserción puede pasar en verde sobre un bloque que quedó abierto de más.
 *   2. Un negocio sin web no queda encerrado: se sigue con un click en la
 *      cabecera del bloque que sigue.
 *   3. Volver atrás no pierde nada de lo escrito.
 *
 * ── Cómo se demostró que tienen dientes ─────────────────────────────────────
 * Contra el código VIEJO (`fix/fusion-m1-m2`, la ficha como lista larga) los
 * tres se ponen rojos en la primera aserción: no existe ninguna cabecera
 * `1 · En Instagram`, porque no hay bloques. La corrida queda en la bitácora.
 *
 * ── Por qué el selector «¿Quién maneja el Instagram?» no se opera ───────────
 * Se afirma que ESTÁ en el bloque de Instagram, pero no se lo abre. El `<Select>`
 * compartido se cierra ante cualquier scroll de la página (listener en fase de
 * captura) y, al abrirse, enfoca su listbox con `.focus()` sin `preventScroll` —
 * lo que puede producir justo ese scroll. El panel se cierra solo, y el helper
 * falla con «element was detached from the DOM» de forma intermitente. Es un
 * comportamiento del componente compartido, anterior a este sprint (ningún test
 * lo operaba hasta ahora) y FUERA DE ALCANCE acá; queda anotado en la bitácora.
 * El requisito de identidad se cubre por su otro campo, que es un OR en el gate.
 *
 * El cuarto test es distinto y a propósito: el gate del veredicto NO cambió, así
 * que su mitad de gate pasa en verde en las dos versiones. Lo que agrega es la
 * mitad estructural —que el veredicto sea el último bloque del recorrido— y es
 * esa la que enrojece contra el código viejo. Se deja junto porque lo que hay
 * que poder afirmar de una sola vez es «se reordenó Y el gate sigue cerrado».
 */

const pantalla = (leadId: string, paso: string) => `/setter/leads/${leadId}/manual/${paso}`

/** Las cabeceras del recorrido, en orden. Siempre están las cinco. */
const CABECERAS = [
  '1 · En Instagram',
  '2 · En Google y Maps',
  '3 · En la web que ya tienen',
  '4 · Mirando las tres juntas',
  '5 · Tu decisión',
] as const

const cabecera = (page: Page, nombre: string) =>
  firstVisible(page.getByRole('button', { name: nombre }))

/** El bloque desplegado, leído del propio control de disclosure. */
async function bloqueAbierto(page: Page): Promise<string> {
  const abiertos: string[] = []
  for (const nombre of CABECERAS) {
    if ((await cabecera(page, nombre).getAttribute('aria-expanded')) === 'true') {
      abiertos.push(nombre)
    }
  }
  expect(abiertos, 'exactamente un bloque desplegado').toHaveLength(1)
  return abiertos[0]!
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

test('el recorrido abre el bloque siguiente SOLO, sin botón de siguiente', async ({ page }) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P16 recorrido',
    stage: 'FICHA',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined)) // unsaved-guard
  await page.goto(pantalla(leadId, 'm1'), { waitUntil: 'domcontentloaded' })

  // Las cinco cabeceras están desde el principio: el que sigue no se esconde,
  // se ofrece plegado. Esconderlo es lo que fabrica el callejón del test 2.
  for (const nombre of CABECERAS) {
    await expect(cabecera(page, nombre), `la cabecera «${nombre}» está`).toBeVisible()
  }

  // 🔴 Y NO hay ningún botón de «siguiente»: el avance no se paga con un click.
  await expect(
    page.getByRole('button', { name: /^siguiente$/i }),
    'un click que no aporta información es un click que sobra',
  ).toHaveCount(0)

  // Un lead nuevo abre en la primera fuente, y solo ahí.
  expect(await bloqueAbierto(page)).toBe(CABECERAS[0])
  // Los campos de las otras fuentes NO se ven (ni están: el plegado no se monta).
  await expect(
    vis(fieldControl(page, 'Reseñas crudas')),
    'las reseñas viven en Google — todavía no se llegó',
  ).toHaveCount(0)
  await expect(
    vis(fieldControl(page, 'Presencia digital')),
    'el balance se escribe después de mirar las tres',
  ).toHaveCount(0)

  // ── Bloque 1 · Instagram ────────────────────────────────────────────────
  // Su señal: quién está detrás + evidencia (el contenido real alcanza).
  // El requisito de identidad se cumple por CUALQUIERA de sus dos campos (es un
  // OR en `fichaFaltantes`); se usa el textarea y no el selector a propósito —
  // ver la nota sobre el `<Select>` al pie de este archivo.
  await expect(
    firstVisible(page.getByRole('button', { name: 'Quién maneja el Instagram' })),
    'y el selector de quién maneja el IG también vive en esta fuente',
  ).toBeVisible()
  await firstVisible(fieldControl(page, 'Identidad — notas')).fill(
    'La firma "Marce", aparece en las fotos del local desde 2019.',
  )
  await firstVisible(fieldControl(page, 'Contenido real (logo / fotos / tono)')).fill(
    'Fotos reales del local, algo oscuras. Logo propio pero pixelado. Tono cercano.',
  )
  // El material de esta fuente está EN esta fuente: no se vuelve a buscar.
  await expect(
    firstVisible(fieldControl(page, '¿De dónde bajás el logo y las fotos?')),
    'el material del perfil se pide mientras el perfil está abierto',
  ).toBeVisible()

  // Salir del bloque (a la cabecera del que sigue no: a cualquier cosa de afuera).
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()
  await expect
    .poll(() => bloqueAbierto(page), { message: 'el segundo bloque se abre solo' })
    .toBe(CABECERAS[1])

  // ── Bloque 2 · Google ───────────────────────────────────────────────────
  await firstVisible(fieldControl(page, 'Reseñas crudas')).fill(
    '★☆☆☆☆ "Nunca contestan el WhatsApp" (mar 2026). La misma queja tres veces.',
  )
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()
  await expect.poll(() => bloqueAbierto(page)).toBe(CABECERAS[2])

  // ── Bloque 3 · La web ───────────────────────────────────────────────────
  await firstVisible(fieldControl(page, '¿Qué vende y a qué precio?')).fill(
    'Milanesa napolitana $8.500 · pizza grande $9.200 · envío $1.200.',
  )
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()
  await expect.poll(() => bloqueAbierto(page)).toBe(CABECERAS[3])

  // ── Bloque 4 · El balance ───────────────────────────────────────────────
  await firstVisible(fieldControl(page, 'Presencia digital')).fill(
    'IG activo (2-3 por semana), sin web propia, Maps con ficha pero sin fotos.',
  )
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()
  await expect
    .poll(() => bloqueAbierto(page), { message: 'el recorrido termina en el veredicto' })
    .toBe(CABECERAS[4])

  // Y la señal mínima quedó cumplida por el recorrido, sin pedir nada aparte.
  await expect(
    firstVisible(page.getByText(/Señal mínima lista/i)),
    'el recorrido por fuentes cubre el gate de la ficha',
  ).toBeVisible()
})

test('el avance no se come el click: apretar Guardar guarda Y avanza', async ({ page }) => {
  /**
   * La trampa que este test fija. Al hacer click, el foco se mueve en el
   * `mousedown`: si el acordeón avanzara ahí mismo, el bloque abierto se plegaría
   * ANTES del `mouseup` y el botón que se estaba apretando se correría cientos de
   * píxeles hacia arriba. El `mouseup` cae sobre otra cosa, el navegador no emite
   * el click, y el setter aprieta «Guardar ficha» sin que pase nada — una acción
   * sin acuse, que es exactamente el patrón que este producto ya arrastró antes.
   *
   * Por eso se aprieta DE VERDAD (`click`, no `focus`) y se exigen las dos cosas
   * a la vez: que el guardado haya ocurrido (el toast) y que el recorrido haya
   * avanzado igual (el bloque siguiente, abierto).
   */
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P16 click',
    stage: 'FICHA',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined))
  await page.goto(pantalla(leadId, 'm1'), { waitUntil: 'domcontentloaded' })

  // Esperar a que el streaming de React termine ANTES de tocar el `<Select>`:
  // ese componente se cierra ante cualquier scroll de la página (capture phase),
  // y el reacomodo del DOM al hidratar dispara uno. Leer el acordeón entero es la
  // espera —y a la vez la aserción de que abre en la primera fuente.
  expect(await bloqueAbierto(page), 'abre en la primera fuente').toBe(CABECERAS[0])

  await firstVisible(fieldControl(page, 'Identidad — notas')).fill(
    'Lo lleva el dueño, contesta él los comentarios.',
  )
  await firstVisible(fieldControl(page, 'Contenido real (logo / fotos / tono)')).fill(
    'Fotos propias del local y logo real, tono cercano y consistente.',
  )
  expect(await bloqueAbierto(page), 'todavía no avanzó: no salió del bloque').toBe(CABECERAS[0])

  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).click()

  await expectToast(page, /Borrador guardado|Ficha guardada/i)
  const dossier = await getDossier(leadId)
  expect(dossier?.fichaJson, 'el click llegó al servidor').toBeTruthy()
  await expect
    .poll(() => bloqueAbierto(page), { message: 'y el recorrido avanzó igual' })
    .toBe(CABECERAS[1])
})

test('una sugerencia de calidad frena el avance hasta que se pueda leer', async ({ page }) => {
  /**
   * El nudge de calidad («eso queda corto, podés sumar…») se dispara al SALIR del
   * campo — exactamente el mismo momento en que ese campo puede completar el
   * bloque. Si el avance ganara, el bloque se plegaría con el mensaje adentro y
   * el setter nunca leería la sugerencia que pidió al terminar de escribir.
   *
   * El nudge sigue siendo advisory: no bloquea nada. El bloque de al lado abre
   * con un click igual, y apenas el texto mejora, el avance vuelve a andar solo.
   */
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P16 nudge',
    stage: 'FICHA',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined))
  await page.goto(pantalla(leadId, 'm1'), { waitUntil: 'domcontentloaded' })

  // Un texto flojo que ADEMÁS completa el bloque (identidad es su único requisito
  // pendiente que este campo puede cubrir... junto con la evidencia de al lado).
  await firstVisible(fieldControl(page, 'Identidad — notas')).fill('lo lleva el dueño')
  await firstVisible(fieldControl(page, 'Contenido real (logo / fotos / tono)')).fill('fotos reales')
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()

  await expect(
    firstVisible(page.getByText(/Podés sumar|¿Podés detallar\?/i)),
    'la sugerencia se lee',
  ).toBeVisible()
  expect(await bloqueAbierto(page), 'y el bloque sigue abierto para poder leerla').toBe(
    CABECERAS[0],
  )

  // Mejorado el texto, el recorrido vuelve a avanzar solo.
  await firstVisible(fieldControl(page, 'Contenido real (logo / fotos / tono)')).fill(
    'Fotos propias del local, bien iluminadas; logo real en la bio; tono cercano y consistente.',
  )
  await firstVisible(fieldControl(page, 'Identidad — notas')).fill(
    'La firma "Marce", dueño visible en las fotos del local, abrió en 2019.',
  )
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()
  await expect.poll(() => bloqueAbierto(page)).toBe(CABECERAS[1])
})

test('un negocio sin web se sigue con un click, no queda encerrado', async ({ page }) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P16 sin web',
    stage: 'FICHA',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined))
  await page.goto(pantalla(leadId, 'm1'), { waitUntil: 'domcontentloaded' })

  // Misma espera que arriba: el `<Select>` no se toca hasta que el DOM dejó de
  // reacomodarse por el streaming.
  expect(await bloqueAbierto(page), 'abre en la primera fuente').toBe(CABECERAS[0])

  await firstVisible(fieldControl(page, 'Identidad — notas')).fill(
    'No se ve quién está detrás; nadie contesta los comentarios.',
  )
  await firstVisible(fieldControl(page, 'Contenido real (logo / fotos / tono)')).fill(
    'Solo fotos de stock, sin logo propio, tono de plantilla.',
  )
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()
  await expect.poll(() => bloqueAbierto(page)).toBe(CABECERAS[1])

  await firstVisible(fieldControl(page, 'Reseñas crudas')).fill(
    '★★☆☆☆ "Tardan un montón en responder". Repetida dos veces.',
  )
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()
  await expect.poll(() => bloqueAbierto(page)).toBe(CABECERAS[2])

  // 🔴 ACÁ ESTÁ EL CALLEJÓN QUE NO PASA: el negocio no tiene web, así que este
  // bloque no se puede llenar. La cabecera lo dice, y el siguiente abre con un
  // click — el avance automático es una invitación, nunca una tranca.
  await expect(
    firstVisible(page.getByText('Opcional — podés seguir sin esto')),
    'el bloque que se puede saltear lo dice',
  ).toBeVisible()
  await cabecera(page, CABECERAS[3]).click()
  expect(await bloqueAbierto(page)).toBe(CABECERAS[3])

  await firstVisible(fieldControl(page, 'Presencia digital')).fill(
    'IG con dos posteos del año pasado. No tienen web. Maps sin reclamar.',
  )
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).click()
  await expectToast(page, /Ficha guardada — ya tenés señal/i)

  // Llegó al veredicto sin haber escrito una línea sobre una web que no existe.
  const dossier = await getDossier(leadId)
  expect(dossier?.fichaJson, 'la ficha se guardó').toBeTruthy()
  await expect(firstVisible(page.getByText(/Señal mínima lista/i))).toBeVisible()
})

test('volver a un bloque anterior no pierde lo escrito ni cierra lo abierto', async ({ page }) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P16 volver',
    stage: 'FICHA',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined))
  await page.goto(pantalla(leadId, 'm1'), { waitUntil: 'domcontentloaded' })

  const NOTA = 'La firma "Marce", aparece en las fotos del local desde 2019.'
  await firstVisible(fieldControl(page, 'Identidad — notas')).fill(NOTA)
  await firstVisible(fieldControl(page, 'Contenido real (logo / fotos / tono)')).fill(
    'Fotos propias del local, logo simple pero real.',
  )
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()
  await expect.poll(() => bloqueAbierto(page)).toBe(CABECERAS[1])

  // Vuelve a la primera fuente: lo escrito sigue ahí, letra por letra.
  await cabecera(page, CABECERAS[0]).click()
  await expect(
    firstVisible(fieldControl(page, 'Identidad — notas')),
    'lo cargado se conserva al volver',
  ).toHaveValue(NOTA)

  // Y si lo vacía, la cabecera vuelve a pedirlo — pero no se le cierra nada ni
  // se le mueve la pantalla: el bloque en el que está sigue siendo el suyo.
  await firstVisible(fieldControl(page, 'Identidad — notas')).fill('')
  await firstVisible(fieldControl(page, 'Contenido real (logo / fotos / tono)')).fill('')
  await firstVisible(page.getByRole('button', { name: 'Guardar ficha' })).focus()
  expect(await bloqueAbierto(page), 'sigue abierto el bloque al que volvió').toBe(CABECERAS[0])
  await expect(
    firstVisible(page.getByText(/No se puede juzgar a ciegas/i)),
    'y el aviso de la señal mínima vuelve entero',
  ).toBeVisible()
})

test('el veredicto cierra el recorrido y su gate sigue cerrado sin señal', async ({ page }) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P16 gate',
    stage: 'FICHA',
  })
  await qaLogin(page, 'setter')
  page.on('dialog', (d) => d.accept().catch(() => undefined))
  await page.goto(pantalla(leadId, 'm1'), { waitUntil: 'domcontentloaded' })

  // 🔴 ESTRUCTURA (esta mitad enrojece contra el código viejo): el veredicto es
  // el ÚLTIMO bloque del mismo recorrido, no una sección suelta debajo.
  await expect(cabecera(page, CABECERAS[4]), 'el veredicto es el bloque 5').toBeVisible()
  await expect(
    cabecera(page, CABECERAS[4]).getByText('Falta la señal mínima de arriba'),
    'y avisa que todavía no se puede decidir',
  ).toBeVisible()

  // 🔴 GATE (esta mitad tiene que estar verde en las dos versiones): el bloque se
  // abre igual —no hay tranca de pantalla— y el que rechaza es el SERVIDOR.
  await cabecera(page, CABECERAS[4]).click()
  await firstVisible(
    page.getByRole('radiogroup', { name: 'Score de la evaluación' }).getByRole('radio', { name: '4' }),
  ).click()
  await pickSelect(page, 'Tu veredicto', /^Avanzar$/i)
  await firstVisible(fieldControl(page, 'Razonamiento')).fill(
    'Intento de registrar el veredicto sin haber cargado nada de la ficha.',
  )
  await firstVisible(page.getByRole('button', { name: /^Registrar evaluación$/i })).click()

  // El dossier NO transicionó: sigue en FICHA y sin evaluación registrada.
  await expect
    .poll(async () => (await getDossier(leadId))?.stage, {
      message: 'sin señal mínima la evaluación no entra — el gate vive en el servidor',
    })
    .toBe('FICHA')
  expect((await getDossier(leadId))?.evaluacionJson, 'y no se persistió nada').toBeFalsy()
})
