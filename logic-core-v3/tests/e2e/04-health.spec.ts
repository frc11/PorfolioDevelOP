import { test, expect } from '@playwright/test'

test('health endpoints respond with correct status', async ({ request }) => {
  // Cheap health (no LLM call)
  const healthRes = await request.get('/api/chatbot/develop/health')
  expect(healthRes.status()).toBeLessThan(500)

  const healthData = await healthRes.json()
  expect(healthData).toHaveProperty('ok')
  expect(healthData).toHaveProperty('checks')

  // Smoke (real LLM call — solo si tenés Vertex configurado)
  const smokeRes = await request.get('/api/chatbot/develop/smoke')
  // No assertion estricta acá porque depende de billing/quota
  expect([200, 503]).toContain(smokeRes.status())
})
