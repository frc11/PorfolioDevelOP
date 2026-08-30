import { type Page, type Locator } from '@playwright/test'

/**
 * Helpers de UI para el smoke del setter. Dos realidades del DOM las cubren:
 *   1. El wizard se DUPLICA para responsive (una copia vive bajo display:none),
 *      así que casi todo texto/rol matchea DOS veces → `vis()` filtra a visible.
 *   2. El `<Select>` compartido NO es nativo: trigger = <button aria-haspopup>,
 *      opciones portaleadas a body como role=option → `pickSelect()` lo maneja.
 */

/** Filtra un locator a su(s) match(es) VISIBLE(s) (mata la copia responsive oculta). */
export function vis(locator: Locator): Locator {
  return locator.filter({ visible: true })
}

/** Primer match visible — el patrón por defecto para asserts del wizard duplicado. */
export function firstVisible(locator: Locator): Locator {
  return locator.filter({ visible: true }).first()
}

/**
 * Maneja el `<Select>` compartido: abre por aria-label del trigger y elige la
 * opción por su texto. Las opciones se portalean a document.body (no son
 * descendientes del trigger) → se buscan a nivel page.
 *
 * ── Por qué afirma al final (sprint «los helpers que prueban») ───────────────
 * Antes hacía los dos clicks y devolvía: no verificaba NADA. Una opción que no
 * commitea —`aria-disabled`, un handler que no corre, el panel que se cerró
 * antes— dejaba el select vacío y el helper pasaba igual; la prueba seguía como
 * si el valor estuviera elegido. Medido en `tests/helpers-probe`.
 *
 * La post-condición sale del propio `<Select>` (no de la copy): `commitValue`
 * cierra el panel (`aria-expanded="false"`) y pinta la etiqueta elegida como
 * único texto del trigger. Se compara contra el texto de la opción que se
 * clickeó —no contra `optionName`— porque `getByRole({ name })` matchea por
 * SUBCADENA: el select de «Setter asignado» se elige por el nombre del setter y
 * la etiqueta real trae además su carga («B · 3 activos»).
 */
export async function pickSelect(
  page: Page,
  triggerName: string | RegExp,
  optionName: string | RegExp,
): Promise<void> {
  const { expect } = await import('@playwright/test')
  const trigger = firstVisible(page.getByRole('button', { name: triggerName }))
  await trigger.click()

  const opcion = page.getByRole('option', { name: optionName }).first()
  const etiqueta = ((await opcion.textContent()) ?? '').trim()
  await opcion.click()

  await expect(trigger, 'el panel del select tiene que cerrar al elegir').toHaveAttribute(
    'aria-expanded',
    'false',
  )
  if (etiqueta) {
    await expect(trigger, 'el trigger tiene que mostrar la opción elegida').toHaveText(etiqueta)
  }
}

/**
 * El control (input/textarea) de un `<Field>` por el TEXTO de su label. `Field`
 * NO asocia label↔control (sin htmlFor, no anida) → getByLabel NO sirve para los
 * forms del setter. Va al div del Field (padre del label) y toma el 1er
 * input/textarea adentro (robusto aunque el Input esté envuelto). Los modales del
 * admin SÍ usan htmlFor nativo → ahí se usa getByLabel directo.
 */
export function fieldControl(page: Page, label: string): Locator {
  const safe = label.replace(/"/g, '\\"')
  return page.locator(
    `xpath=//label[contains(normalize-space(.), "${safe}")]/parent::div//*[self::input or self::textarea][1]`,
  )
}

/**
 * Espera un TOAST de sonner por su texto.
 *
 * ── El agujero que esto cierra (sprint «los helpers que prueban») ────────────
 * Hasta acá el helper hacía `page.getByText(text)`: buscaba la frase sobre la
 * PÁGINA ENTERA, no dentro del contenedor de avisos. Una copy que contuviera la
 * frase lo satisfacía ANTES del click y dejaba pasar la aserción que venía
 * después. Medido: «con la construcción arrancada» hacía verde el
 * `expectToast(/Construcción arrancada/i)` de 01-flow · B5 (ver la nota de
 * redacción en `m-construccion.tsx`, que reescribió la copy en subjuntivo para
 * esquivarlo). Prometía verificar un aviso y afirmaba sobre toda la pantalla:
 * esa distancia entre promesa y ámbito ES el defecto.
 *
 * Ahora el ámbito es el aviso: `[data-sonner-toast]` — el `<li>` que monta
 * sonner dentro de `[data-sonner-toaster]` (ver `<Toaster />` en
 * `app/layout.tsx`). La copy de la pantalla ya no lo puede satisfacer, y un
 * aviso de ERROR con otro texto tampoco.
 *
 * `timeout` existe para el probe de helpers (`tests/helpers-probe`), donde los
 * casos de SABOTAJE esperan a propósito un fallo: sin la perilla, cada uno se
 * come los 15s completos. Los tests reales no lo pasan y conservan los 15s.
 */
export async function expectToast(
  page: Page,
  text: string | RegExp,
  opts: { timeout?: number } = {},
): Promise<void> {
  const { expect } = await import('@playwright/test')
  const aviso = page.locator('[data-sonner-toast]').filter({ hasText: text })
  await expect(firstVisible(aviso)).toBeVisible({ timeout: opts.timeout ?? 15_000 })
}

/**
 * LeadOS 2.1a — La cartera completa quedó SECUNDARIA al foco: vive colapsada bajo
 * el toggle "Ver toda la cartera". El buscador, los filtros, el orden y las cards
 * (con sus palancas pin/snooze/nota) NO están en el DOM hasta expandir. Todo test
 * que maneje la cartera (buscar / filtrar / fijar / anotar) debe expandirla
 * primero — sino la acción agota el timeout sobre un elemento que no existe.
 *
 * Centraliza acá la expansión para que el swap del home (kanban → foco) no se
 * filtre como ruido de timeout en cada sub-test. Idempotente: si ya está abierta
 * (lo dice `aria-expanded`), no re-clickea. Devuelve recién cuando el buscador
 * está montado y visible (señal de que el cuerpo ya hidrató).
 */
export async function expandCartera(page: Page): Promise<void> {
  const toggle = firstVisible(page.getByRole('button', { name: 'Ver toda la cartera' }))
  await toggle.waitFor({ state: 'visible' })
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
    await toggle.click()
  }
  await firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })).waitFor({
    state: 'visible',
  })
}
