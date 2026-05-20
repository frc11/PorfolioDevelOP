import { test, expect } from '@playwright/test'

test('public config endpoint returns safe data only', async ({ request }) => {
  const res = await request.get('/api/chatbot/develop/config', {
    headers: { Origin: 'https://develop.com.ar' },
  })
  expect(res.status()).toBe(200)

  const data = await res.json()
  expect(data).toHaveProperty('botName')
  expect(data).toHaveProperty('accentColor')

  // Verificar que NO leakea info sensible
  expect(data).not.toHaveProperty('apiKey')
  expect(data).not.toHaveProperty('llmProvider')
  expect(JSON.stringify(data)).not.toMatch(/forbidden/i)
  expect(JSON.stringify(data)).not.toMatch(/AIzaSy/)
  expect(JSON.stringify(data)).not.toMatch(/service.account/i)
})
