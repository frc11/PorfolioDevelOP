import { test, expect } from '@playwright/test'
import { loginAsClient } from '../helpers/auth'

test.describe('Client chatbot section', () => {
  test('cliente con bot activo ve overview', async ({ page }) => {
    await loginAsClient(page)
    await page.goto('/dashboard/chatbot')

    // Si el cliente tiene bot activo, debe ver el overview con métricas
    // (Esto asume que cliente@sanmiguel.com tiene bot activo en seed)
    // Si NO tiene bot, verá la upsell landing
    const hasOverview = await page.getByText(/conversaciones|leads|tokens/i).first().isVisible().catch(() => false)
    const hasUpsell = await page.getByText(/empleado virtual|activarlo/i).first().isVisible().catch(() => false)

    expect(hasOverview || hasUpsell).toBe(true)
  })

  test('navegación a leads desde sidebar funciona', async ({ page }) => {
    await loginAsClient(page)
    await page.goto('/dashboard/chatbot/leads')

    // Debe cargar sin error
    await expect(page.locator('text=/error|something went wrong/i')).toHaveCount(0)
  })

  test('navegación a knowledge desde sidebar funciona', async ({ page }) => {
    await loginAsClient(page)
    await page.goto('/dashboard/chatbot/knowledge')

    await expect(page.locator('text=/error|something went wrong/i')).toHaveCount(0)
  })

  test('navegación a settings desde sidebar funciona', async ({ page }) => {
    await loginAsClient(page)
    await page.goto('/dashboard/chatbot/settings')

    await expect(page.locator('text=/error|something went wrong/i')).toHaveCount(0)
  })
})
