import { test, expect } from '@playwright/test'

test.describe('Security @smoke', () => {
  test('usuario sin auth no puede acceder a /admin', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/admin')

    await page.waitForURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('usuario sin auth no puede acceder a /dashboard', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/dashboard')

    await page.waitForURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('API admin requiere auth', async ({ request }) => {
    const response = await request.get('/api/admin/clients', { timeout: 20000 })
    test.skip(response.status() === 404, 'Admin clients API endpoint is not implemented')
    expect([401, 403, 307]).toContain(response.status())
  })

  test('API cron requiere secret', async ({ request }) => {
    const response = await request.get('/api/cron/detect-bot-issues', { timeout: 20000 })
    expect(response.status()).toBe(401)
  })

  test('cron endpoint con secret valido funciona', async ({ request }) => {
    const secret = process.env.CRON_SECRET
    test.skip(!secret, 'CRON_SECRET is not configured in this environment')

    const response = await request.get('/api/cron/detect-bot-issues', {
      headers: { Authorization: `Bearer ${secret}` },
      timeout: 30000,
    })

    expect(response.status()).toBe(200)
  })
})
