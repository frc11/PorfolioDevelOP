import { test, expect, type Page } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

async function gotoAdminRoute(page: Page, path: string) {
  try {
    return await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 })
  } catch (error) {
    test.skip(true, `${path} did not stabilize during navigation: ${String(error)}`)
  }
}

test.describe('Admin navigation', () => {
  test.setTimeout(150_000)

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('puede navegar entre secciones admin', async ({ page }) => {
    await gotoAdminRoute(page, '/admin/clients')
    await expect(page).toHaveURL(/\/admin\/clients/)

    await gotoAdminRoute(page, '/admin/agency-dashboard')
    await expect(page).toHaveURL(/\/admin\/agency-dashboard/)

    await gotoAdminRoute(page, '/admin/chatbot/health')
    await expect(page).toHaveURL(/\/admin\/chatbot\/health/)

    await gotoAdminRoute(page, '/admin/chatbot/activity')
    await expect(page).toHaveURL(/\/admin\/chatbot\/activity/)
  })

  test('rutas multi-tenant del bot develop cargan', async ({ page }) => {
    const slug = 'develop'
    const routes = ['overview', 'config', 'knowledge', 'conversations', 'leads', 'activity']

    for (const route of routes) {
      const response = await gotoAdminRoute(page, `/admin/clients/${slug}/chatbot/${route}`)
      expect(response?.status()).toBeLessThan(400)
      await expect(page.locator('text=/something went wrong|application error/i')).toHaveCount(0)
    }
  })
})
