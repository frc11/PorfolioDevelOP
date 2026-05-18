import { test, expect } from '@playwright/test'

test('health endpoints respond with correct status', async ({ request }) => {
  const healthRes = await request.get('/api/chatbot/develop/health', { timeout: 20000 })
  expect(healthRes.status()).toBeLessThan(500)

  const healthData = await healthRes.json()
  expect(healthData).toHaveProperty('ok')
  expect(healthData).toHaveProperty('checks')

  const smokeRes = await request.get('/api/chatbot/develop/smoke', { timeout: 30000 })
  expect([200, 503]).toContain(smokeRes.status())
})
