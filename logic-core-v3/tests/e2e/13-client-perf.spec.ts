import { test, expect } from '@playwright/test'
import { loginAsClient } from '../helpers/auth'

test.describe('Client dashboard performance', () => {
  test('dashboard home carga en <3 segundos (warm)', async ({ page }) => {
    await loginAsClient(page)

    // Primer load (warm-up)
    await page.goto('/dashboard')

    // Segundo load (medición real)
    const start = Date.now()
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const duration = Date.now() - start

    console.log(`Dashboard home: ${duration}ms`)
    expect(duration).toBeLessThan(3000)
  })

  test('mi chatbot carga en <3 segundos (warm)', async ({ page }) => {
    await loginAsClient(page)

    await page.goto('/dashboard/chatbot') // warm-up

    const start = Date.now()
    await page.goto('/dashboard/chatbot')
    await page.waitForLoadState('networkidle')
    const duration = Date.now() - start

    console.log(`Mi chatbot: ${duration}ms`)
    expect(duration).toBeLessThan(3000)
  })
})
