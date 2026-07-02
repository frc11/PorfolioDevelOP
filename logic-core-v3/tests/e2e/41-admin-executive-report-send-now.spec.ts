/**
 * P2.B.1 — botón admin "Enviar reporte ahora" (Executive Weekly Report, 1 org).
 *
 * Cubre SOLO el trigger manual (guard + rate-limit + validación): no ejercita
 * el motor del reporte (build.ts/send.ts/top-hot-leads.ts, fuera de scope).
 * Usa un organizationId inexistente a propósito — llega a `NOT_FOUND` antes
 * de tocar `buildExecutiveWeeklyReport`/Brevo, así que no manda mails reales.
 */
import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginAsAdmin, loginAsClient } from '../helpers/auth'

const prisma = new PrismaClient()

const FAKE_ORG_ID = 'nonexistent-org-id-p2b1-test'
const RATE_LIMIT_TEST_ORG_ID = 'nonexistent-org-id-p2b1-ratelimit'

async function clearRateLimitBucket() {
  await prisma.$executeRawUnsafe(
    'DELETE FROM rate_limit WHERE key LIKE $1',
    'sendExecutiveReportNowPerAdmin:%',
  )
}

test.describe('Admin — enviar reporte ejecutivo ahora (P2.B.1)', () => {
  test.setTimeout(60_000)

  test.afterAll(async () => {
    await prisma.$disconnect()
  })

  test('rechaza request sin sesión', async ({ request }) => {
    const res = await request.post(`/api/admin/clients/${FAKE_ORG_ID}/send-executive-report`)
    expect([401, 403]).toContain(res.status())
  })

  test('rechaza usuario autenticado que no es SUPER_ADMIN', async ({ page }) => {
    await loginAsClient(page)
    const res = await page.request.post(
      `/api/admin/clients/${FAKE_ORG_ID}/send-executive-report`,
    )
    expect(res.status()).toBe(403)
  })

  test('valida organizationId inválido (vacío tras trim)', async ({ page }) => {
    await loginAsAdmin(page)
    // %20 decodea a un espacio: matchea el segmento dinámico, pero
    // OrganizationIdSchema lo trimea a '' y falla min(1).
    const res = await page.request.post('/api/admin/clients/%20/send-executive-report')
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
  })

  test('org inexistente da error limpio, no crashea', async ({ page }) => {
    await loginAsAdmin(page)
    const res = await page.request.post(
      `/api/admin/clients/${FAKE_ORG_ID}/send-executive-report`,
    )
    expect(res.status()).toBe(404)
    const body = await res.json()
    expect(body).toEqual({ ok: false, reason: 'NOT_FOUND' })
  })

  test('el rate-limit corta tras 5 intentos por admin', async ({ page }) => {
    await loginAsAdmin(page)
    await clearRateLimitBucket()

    const url = `/api/admin/clients/${RATE_LIMIT_TEST_ORG_ID}/send-executive-report`
    const statuses: number[] = []
    for (let i = 0; i < 6; i++) {
      const res = await page.request.post(url)
      statuses.push(res.status())
    }

    // Las primeras 5 pasan el rate-limit (404: org inexistente, pero llegan a
    // la lógica). La 6ta corta en 429 antes de tocar nada más.
    expect(statuses.slice(0, 5)).not.toContain(429)
    expect(statuses[5]).toBe(429)
  })
})
