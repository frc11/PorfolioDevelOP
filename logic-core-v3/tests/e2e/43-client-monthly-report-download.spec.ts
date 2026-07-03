import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginAsClient } from '../helpers/auth'

/**
 * P2.C — "Descargá el informe del mes" (/api/reports/client-monthly).
 *
 * La ruta no acepta NINGÚN parámetro de organización (a diferencia de
 * `/api/reports/monthly`, que valida un `organizationId` de query contra la
 * sesión): el organizationId sale EXCLUSIVAMENTE de `resolveOrgId()`. Por eso
 * el test anti-IDOR acá prueba algo más fuerte que "el id ajeno se rechaza":
 * prueba que NO HAY superficie donde inyectar un id de otra organización en
 * primer lugar — pasar cualquier parámetro extra no tiene ningún efecto.
 *
 * Igual que en 42-client-executive-report-prefs.spec.ts: la rama de plan
 * elegible/no-elegible se `test.skip()` según el plan REAL de la fixture
 * `sanmiguel` (no se muta el plan en runtime — `getPlanForOrg` cachea 60s en
 * memoria del server, un proceso separado del test).
 */
const prisma = new PrismaClient()
const ROUTE = '/api/reports/client-monthly'

test.describe('Cliente — descarga del informe mensual (P2.C)', () => {
  test.setTimeout(30_000)

  let eligiblePlan = false

  test.beforeAll(async () => {
    const membership = await prisma.orgMember.findFirst({
      where: { user: { email: 'cliente@sanmiguel.com' } },
      select: { organizationId: true },
    })
    if (!membership) throw new Error('Client fixture organization not found')

    const org = await prisma.organization.findUnique({
      where: { id: membership.organizationId },
      select: { subscription: { select: { plan: { select: { key: true } } } } },
    })
    const planKey = org?.subscription?.plan?.key ?? 'STARTER'
    eligiblePlan = planKey === 'PRO' || planKey === 'BUSINESS'
  })

  test.afterAll(async () => {
    await prisma.$disconnect()
  })

  test('sin sesión: 401, nunca genera el PDF', async ({ request }) => {
    const res = await request.get(ROUTE)
    expect(res.status()).toBe(401)
  })

  test('con sesión y plan elegible: PDF real, cualquier parámetro extra se ignora (anti-IDOR)', async ({
    page,
  }) => {
    test.skip(!eligiblePlan, 'Fixture sanmiguel no está en plan Pro/Business — omitido')
    await loginAsClient(page)

    // No existe un parámetro de organización que aceptar — pasar uno de todas
    // formas no debe tener NINGÚN efecto (no hay dónde inyectar otra org).
    const res = await page.request.get(
      `${ROUTE}?organizationId=this-is-not-a-real-org-id&clientId=whatever`,
    )
    expect(res.ok()).toBe(true)
    expect(res.headers()['content-type']).toContain('application/pdf')

    const body = await res.body()
    expect(body.byteLength).toBeGreaterThan(500)
    // Firma %PDF- al inicio: confirma que es un PDF real, no un JSON de error
    // disfrazado con un Content-Type incorrecto.
    expect(body.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  })

  test('plan no elegible: 403, nunca genera el PDF', async ({ page }) => {
    test.skip(eligiblePlan, 'Fixture sanmiguel SÍ está en plan Pro/Business — la negativa no aplica hoy')
    await loginAsClient(page)
    const res = await page.request.get(ROUTE)
    expect(res.status()).toBe(403)
  })
})
