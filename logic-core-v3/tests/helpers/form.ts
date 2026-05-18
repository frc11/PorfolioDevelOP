import type { Locator } from '@playwright/test'

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

export async function typeControlledInput(locator: Locator, value: string) {
  await locator.click()
  await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
  await locator.pressSequentially(value)
}

export async function setControlledSelect(locator: Locator, value: string) {
  await locator.evaluate((element, nextValue) => {
    const select = element as HTMLSelectElement
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
    setter?.call(select, nextValue)
    select.dispatchEvent(new Event('input', { bubbles: true }))
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}
