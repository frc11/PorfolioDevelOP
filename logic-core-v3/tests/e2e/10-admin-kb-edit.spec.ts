import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin KB edit', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('puede ver y guardar KB del bot develop', async ({ page }) => {
    await page.goto('/admin/clients/develop/chatbot/knowledge')

    // Verificar carga
    await expect(page.getByText(/conocimiento|knowledge|base/i).first()).toBeVisible()

    // Verificar que hay al menos un campo
    const firstTextarea = page.locator('textarea').first()
    await expect(firstTextarea).toBeVisible()
    const value = await firstTextarea.inputValue()
    expect(value.length).toBeGreaterThan(0)

    // Tocar el valor y guardar (sin cambiarlo realmente)
    await firstTextarea.fill(value)
    await page.getByRole('button', { name: /guardar|save/i }).click()

    // Toast de éxito
    await expect(page.getByText(/guardado|saved|éxito/i)).toBeVisible({ timeout: 5000 })
  })
})
