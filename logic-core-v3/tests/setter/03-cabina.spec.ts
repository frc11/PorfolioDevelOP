import { test, expect, type Page } from '@playwright/test'
import { qaLogin, attachConsoleGuard, expectNoConsoleErrors } from '../helpers/setter-auth'
import { firstVisible, expandCartera } from '../helpers/setter-ui'
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
 * Sección D — Cabina + cross-lead: recorrido prev/next, atajos de teclado (con
 * la guarda de no-disparar-en-inputs), palancas de cartera (búsqueda
 * acento-insensible, pin/snooze/nota que persisten) y el timeline (SISTEMA
 * visible pero que NO cuenta como contacto → no abre Seguimiento).
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let accentNombre: string
let pinLeadId: string
let pinNombre: string
let sistemaLeadId: string
const ACCENT_NAME = 'Cafetería Ñandú Recorrido'

/**
 * P38 — La tarjeta de cartera de UN lead, por su nombre EXACTO (con el stamp de
 * `createLead`). Las palancas y la búsqueda se miden acá adentro: sobre la página,
 * el nombre del lead también lo dibuja la cola de hoy cuando el lead llega a ella
 * (con la cartera compartida vacía, es el foco), y un sobrante de una corrida
 * matada con el mismo nombre base suma otra tarjeta con los mismos botones.
 */
function tarjetaDe(page: Page, nombreExacto: string) {
  return page
    .locator('main [data-slot="tarjeta-cartera"]')
    .filter({ has: page.getByRole('heading', { name: nombreExacto, exact: true }) })
}

test.beforeAll(async () => {
  const a = await getSetterQa()
  setterId = a.id

  // Varios leads "trabajar" → recorrido (>=2) + búsqueda + atajos.
  const accent = await createLead(tracker, { setterId, businessName: ACCENT_NAME, stage: 'FICHA' })
  accentNombre = accent.businessName
  await createLead(tracker, { setterId, businessName: 'Bravo Recorrido', stage: 'FICHA' })
  await createLead(tracker, { setterId, businessName: 'Alfa Recorrido', stage: 'FICHA' })

  const pin = await createLead(tracker, { setterId, businessName: 'Palancas Target', stage: 'FICHA' })
  pinLeadId = pin.id
  pinNombre = pin.businessName

  // Lead cuya ÚNICA actividad es SISTEMA (reasignación): timeline lo muestra,
  // pero contactos=0 → Seguimiento sigue cerrado.
  const sis = await createLead(tracker, { setterId, businessName: 'Solo Sistema', stage: 'EVALUADA', score: 3, veredicto: 'AVANZAR' })
  sistemaLeadId = sis.id
  await registerActivity(sistemaLeadId, 'SISTEMA', null, null, 'Reasignado: Sin asignar → setter-qa')
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('D1 · búsqueda acento-insensible surfacea el lead acentuado', async ({ page }) => {
  const guard = attachConsoleGuard(page)
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // El buscador vive en la cartera secundaria (2.1a) → expandir primero.
  await expandCartera(page)
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill('cafeteria nandu')
  // El lead "Cafetería Ñandú" aparece pese a buscar sin tildes ni ñ.
  // P38 — en SU tarjeta de la cartera, que es donde la búsqueda filtra. El nombre
  // sobre la página lo satisfacía también el foco: con la cartera compartida vacía
  // este lead es el primero de la cola, y una búsqueda sensible a tildes pasaba.
  await expect(tarjetaDe(page, accentNombre)).toBeVisible()
  expectNoConsoleErrors(guard)
})

test('D2 · pin / snooze / nota persisten (palancas privadas del setter)', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // Las palancas (pin/snooze/nota) viven en las cards de la cartera secundaria
  // (2.1a) → expandir, y recién ahí acotar a la card objetivo vía la búsqueda.
  await expandCartera(page)
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).fill('Palancas Target')
  // P38 — las palancas se accionan sobre la tarjeta de ESTE lead. La búsqueda por
  // nombre base también deja a la vista un sobrante de una corrida matada («Palancas
  // Target» con otro stamp), y el primer «Fijar arriba» de la página era el suyo:
  // se fijaba el lead equivocado y la verificación en la base caía con el producto sano.
  const tarjeta = tarjetaDe(page, pinNombre)
  await expect(tarjeta, 'la tarjeta del lead de las palancas está a la vista, y es una sola').toHaveCount(1)
  await expect(tarjeta).toBeVisible()

  // PIN.
  await tarjeta.getByRole('button', { name: 'Fijar arriba' }).click()
  await expect(async () => {
    const meta = await prisma.osLeadSetterMeta.findUnique({ where: { leadId_setterId: { leadId: pinLeadId, setterId } } })
    expect(meta?.pinned, 'pin persistido').toBe(true)
  }).toPass({ timeout: 10_000 })

  // NOTA.
  await tarjeta.getByRole('button', { name: /Agregar nota|Editar nota/i }).click()
  await tarjeta.getByRole('textbox').fill('Nota privada de prueba e2e')
  await tarjeta.getByRole('button', { name: 'Guardar' }).click()
  await expect(async () => {
    const meta = await prisma.osLeadSetterMeta.findUnique({ where: { leadId_setterId: { leadId: pinLeadId, setterId } } })
    expect(meta?.note, 'nota persistida').toContain('Nota privada de prueba')
  }).toPass({ timeout: 10_000 })
})

test('D3 · modo dirección reemplaza el recorrido kanban: foco + "Saltar" / "Ir a trabajarlo"', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // 2.1a borró el recorrido kanban (link "Recorrer" / strip "Siguiente:" / ?cola=).
  // El modo dirección entrega UN lead de foco a la vez, con dos salidas: "Saltar"
  // (correr al próximo SIN salir del home) e "Ir a trabajarlo" (abrir su detalle).
  await expect(firstVisible(page.getByRole('region', { name: 'Tu foco ahora' }))).toBeVisible()

  // "Saltar" corre al próximo sin abandonar el home: no vuelve a un tablero ni
  // navega a un detalle — sigue en /setter.
  //
  // P38 — acá había un `if (await saltar.isEnabled())`, con la nota «depende de
  // cuántos accionables tenga la cartera de setter-qa en el momento». No depende:
  // este archivo siembra CINCO accionables propios (cuatro fichas y la evaluada),
  // así que siempre hay próximo. Lo que el `if` hacía de verdad era saltearse el
  // único aserto sobre «Saltar» cuando el botón venía deshabilitado — por el motivo
  // que fuera, un defecto incluido — y el test pasaba igual.
  const saltar = firstVisible(page.getByRole('button', { name: 'Saltar' }))
  await expect(saltar, 'con cinco accionables propios sembrados siempre hay próximo').toBeEnabled()
  await saltar.click()
  await expect(page).toHaveURL(/\/setter$/)
  await expect(firstVisible(page.getByRole('region', { name: 'Tu foco ahora' }))).toBeVisible()

  // Recarga limpia: "Saltar" dispara una transición (todos los botones del foco
  // comparten `disabled={isPending}` mientras corre el refresh) → arrancar de cero
  // evita la carrera contra ese pending al clickear el siguiente botón.
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // "Ir a trabajarlo" ancla el foco (sticky D7) y abre su detalle — el reemplazo
  // directo del viejo "Recorrer".
  const trabajar = firstVisible(page.getByRole('button', { name: 'Ir a trabajarlo' }))
  await expect(trabajar).toBeEnabled()
  await trabajar.click()
  await expect(page).toHaveURL(/\/setter\/leads\/.+/)
})

test('D4 · atajos de teclado: ? abre ayuda; NO dispara escribiendo en un input', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto('/setter', { waitUntil: 'domcontentloaded' })

  // El buscador (input de escritura, donde se prueba la guarda) vive en la
  // cartera secundaria (2.1a) → expandir primero.
  await expandCartera(page)
  // Guarda: con foco en el buscador, "?" NO abre la ayuda.
  const search = firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' }))
  await search.click()
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Atajos de teclado' }), 'no abre escribiendo').toHaveCount(0)

  // Con foco fuera de inputs, "?" sí abre el diálogo. Sacamos el foco del buscador
  // con blur (el foco recae en body → `esEditable` da false → el atajo corre).
  // Antes se clickeaba `body` en (5,5); con la cartera expandida la página es alta
  // y ese click se volvía inestable — blur es quirúrgico y no depende del layout.
  await search.blur()
  await page.keyboard.press('?')
  await expect(firstVisible(page.getByRole('dialog', { name: 'Atajos de teclado' }))).toBeVisible()
})

test('D5 · timeline muestra SISTEMA pero NO cuenta como contacto (Seguimiento cerrado)', async ({ page }) => {
  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${sistemaLeadId}`, { waitUntil: 'domcontentloaded' })

  // 5.6: el historial vive al pie de cada pantalla del manual (colapsable).
  // El timeline muestra el evento SISTEMA (reasignación) marcado como tal.
  await firstVisible(page.getByText('Ver historial del lead')).click()
  await expect(firstVisible(page.getByText(/Reasignado:/))).toBeVisible()
  await expect(
    firstVisible(page.getByText('Evento del sistema — no cuenta como contacto comercial')),
  ).toBeVisible()

  // PERO Seguimiento sigue cerrado: el evento SISTEMA no es un contacto comercial
  // — con 0 contactos, la posición es el opener (m4) y m5 NO es alcanzable: la
  // guardia del server redirige el intento de entrar.
  await expect(page).toHaveURL(/\/manual\/m4$/)
  await page.goto(`/setter/leads/${sistemaLeadId}/manual/m5`, { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/manual\/m4$/)

  // DB: 0 contactos comerciales (el SISTEMA no cuenta).
  const comerciales = await prisma.osLeadActivity.count({ where: { leadId: sistemaLeadId, channel: { not: 'SISTEMA' } } })
  expect(comerciales, 'SISTEMA excluido del conteo de contactos').toBe(0)
})
