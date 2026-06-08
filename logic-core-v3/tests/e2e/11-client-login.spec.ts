import { test, expect } from '@playwright/test'
import { loginAsClient } from '../helpers/auth'

test.describe('Client dashboard @smoke', () => {
  test('cliente puede loguearse y ver dashboard', async ({ page }) => {
    await loginAsClient(page)

    expect(page.url()).toContain('/dashboard')

    // Verificar sidebar con "Mi Chatbot"
    await expect(page.getByText(/mi chatbot/i)).toBeVisible({ timeout: 10000 })
  })

  test('cliente NO puede acceder a admin', async ({ page }) => {
    await loginAsClient(page)
    await page.goto('/admin')

    // Debe redirigir (al dashboard o login)
    await expect(page).not.toHaveURL(/\/admin\/?$/)
  })
})
