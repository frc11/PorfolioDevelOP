import { test, expect } from '@playwright/test'

// CARRERAS commit 3 — la mitad /smoke de este spec se fue junto con el
// endpoint (GET público que quemaba una llamada real a Vertex por hit y cuya
// assertion acá aceptaba [200, 503] — pasaba incluso con el LLM caído: costo
// puro sin señal). /health sigue siendo el check barato sin tokens.
test('health endpoint responds with correct status', async ({ request }) => {
  const healthRes = await request.get('/api/chatbot/develop/health', { timeout: 20000 })
  expect(healthRes.status()).toBeLessThan(500)

  const healthData = await healthRes.json()
  expect(healthData).toHaveProperty('ok')
  expect(healthData).toHaveProperty('checks')
})
