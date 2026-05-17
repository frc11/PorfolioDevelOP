import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin bot config', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('puede editar el welcome message del bot develop', async ({ page }) => {
    await page.goto('/admin/clients/develop/chatbot/config')

    // Esperar carga
    await expect(page.getByText(/configuración|config|bot/i).first()).toBeVisible()

    // Editar welcome message
    const welcomeField = page.getByLabel(/mensaje.*bienvenida|welcome/i)
    const originalValue = await welcomeField.inputValue()
    const newValue = `Test edit ${Date.now()}`

    await welcomeField.fill(newValue)

    // Guardar
    await page.getByRole('button', { name: /guardar|save/i }).click()

    // Verificar toast de éxito
    await expect(page.getByText(/guardado|saved|éxito/i)).toBeVisible({ timeout: 5000 })

    // Restaurar valor original (cleanup)
    await welcomeField.fill(originalValue)
    await page.getByRole('button', { name: /guardar|save/i }).click()
  })
})
