import { expect, type Locator } from '@playwright/test'

/**
 * Escribe con el setter NATIVO del prototipo, salteando la intercepción de
 * React para inputs controlados.
 *
 * OJO (medido en `tests/helpers-probe`): saltea también el `readonly` del DOM —
 * escribe en un campo que una persona no podría escribir. Es inherente a la
 * técnica, no un bug: por eso este helper NO sirve para probar que un campo es
 * editable. Para eso está `typeControlledInput`, que teclea de verdad y afirma
 * que el valor aterrizó. Hoy no tiene ningún call site.
 */
export async function setControlledInput(locator: Locator, value: string) {
  await locator.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement | HTMLTextAreaElement
    const setter =
      Object.getOwnPropertyDescriptor(input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, nextValue)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

/**
 * Teclea de verdad (click + seleccionar todo + tipeo secuencial).
 *
 * Afirma al final que el valor ATERRIZÓ: sin eso, un campo `readonly` o
 * `disabled` se comía el tipeo sin lanzar y el helper devolvía como si hubiera
 * escrito — la prueba seguía sobre un campo vacío. Medido en
 * `tests/helpers-probe`.
 */
export async function typeControlledInput(locator: Locator, value: string) {
  await locator.click()
  await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
  await locator.pressSequentially(value)
  await expect(locator, 'el valor tecleado tiene que quedar en el campo').toHaveValue(value)
}

/**
 * Elige un valor en un `<select>` nativo controlado por React.
 *
 * Afirma al final que el valor QUEDÓ: el setter de `HTMLSelectElement.value`
 * descarta en silencio un valor que ninguna opción tiene —deja el select en
 * `''`— y el helper devolvía como si hubiera elegido. Una opción renombrada
 * dejaba la prueba corriendo sobre un select vacío, sin un solo aviso. Medido en
 * `tests/helpers-probe`.
 */
export async function setControlledSelect(locator: Locator, value: string) {
  await locator.evaluate((element, nextValue) => {
    const select = element as HTMLSelectElement
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
    setter?.call(select, nextValue)
    select.dispatchEvent(new Event('input', { bubbles: true }))
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
  await expect(locator, 'el valor elegido tiene que quedar en el select').toHaveValue(value)
}
