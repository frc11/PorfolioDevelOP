import { test, expect } from '@playwright/test'
import { loginAsClient } from '../helpers/auth'
import perfBudget from '../perf-budget.json'

test.describe('Client dashboard performance', () => {
  test('dashboard home carga dentro del budget warm legacy', async ({ page }) => {
    await loginAsClient(page)

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

    const start = Date.now()
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined)
    const duration = Date.now() - start

    console.log(`Dashboard home: ${duration}ms`)
    expect(duration).toBeLessThan(perfBudget['/dashboard'].coldMs)
  })

  test('mi chatbot carga dentro del budget warm legacy', async ({ page }) => {
    await loginAsClient(page)

    await page.goto('/dashboard/chatbot', { waitUntil: 'domcontentloaded' })

    const start = Date.now()
    await page.goto('/dashboard/chatbot', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined)
    const duration = Date.now() - start

    console.log(`Mi chatbot: ${duration}ms`)
    expect(duration).toBeLessThan(perfBudget['/dashboard/chatbot'].coldMs)
  })
})
