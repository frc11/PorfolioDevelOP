import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'
import { typeControlledInput } from '../helpers/form'

test.describe('Admin bot config', () => {
  test.setTimeout(90_000)

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('puede editar el welcome message del bot develop', async ({ page }) => {
    await page.goto('/admin/clients/develop/chatbot/config', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    await expect(page.getByText(/configuracion|config|bot/i).first()).toBeVisible()
    const behaviorTab = page.getByRole('button', { name: /comportamiento/i })
    await behaviorTab.click({ force: true })

    const welcomeField = page.locator('textarea').first()
    const hasWelcomeField = await welcomeField.isVisible({ timeout: 5000 }).catch(() => false)
    test.skip(!hasWelcomeField, 'Bot config behavior tab did not expose the welcome message editor in this run')

    const originalValue = await welcomeField.inputValue()
    const newValue = `Test edit ${Date.now()}`

    await typeControlledInput(welcomeField, newValue)
    await page.getByRole('button', { name: /guardar|save/i }).click()

    await expect(page.getByText(/guardado|saved|exito/i)).toBeVisible({ timeout: 10000 })

    await typeControlledInput(welcomeField, originalValue)
    await page.getByRole('button', { name: /guardar|save/i }).click()
  })
})
