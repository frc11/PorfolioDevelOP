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
 */
export async function pickSelect(
  page: Page,
  triggerName: string | RegExp,
  optionName: string | RegExp,
): Promise<void> {
  await firstVisible(page.getByRole('button', { name: triggerName })).click()
  await page.getByRole('option', { name: optionName }).first().click()
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

/** Espera un toast de sonner por su texto (puede aparecer y desvanecerse). */
export async function expectToast(page: Page, text: string | RegExp): Promise<void> {
  const { expect } = await import('@playwright/test')
  await expect(firstVisible(page.getByText(text))).toBeVisible({ timeout: 15_000 })
}
