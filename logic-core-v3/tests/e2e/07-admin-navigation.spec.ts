import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('puede navegar entre secciones admin', async ({ page }) => {
    // Clients
    await page.goto('/admin/clients')
    await expect(page).toHaveURL(/\/admin\/clients/)

    // Agency Dashboard
    await page.goto('/admin/agency-dashboard')
    await expect(page).toHaveURL(/\/admin\/agency-dashboard/)

    // Health
    await page.goto('/admin/chatbot/health')
    await expect(page).toHaveURL(/\/admin\/chatbot\/health/)

    // Activity
    await page.goto('/admin/chatbot/activity')
    await expect(page).toHaveURL(/\/admin\/chatbot\/activity/)
  })

  test('rutas multi-tenant del bot develop cargan', async ({ page }) => {
    const slug = 'develop'
    const routes = ['overview', 'config', 'knowledge', 'conversations', 'leads', 'activity']

    for (const route of routes) {
      const response = await page.goto(`/admin/clients/${slug}/chatbot/${route}`)
      expect(response?.status()).toBeLessThan(400)
      // No debe haber error visible
      await expect(page.locator('text=/error|something went wrong/i')).toHaveCount(0)
    }
  })
})
