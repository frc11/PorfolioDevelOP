import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { loginAsClient } from '../helpers/auth'
import { pickSelect, expectToast } from '../helpers/setter-ui'

/**
 * P2.B.2 — preferencias del reporte ejecutivo (/dashboard/cuenta/perfil).
 *
 * La visibilidad de la card depende del plan real de la fixture `sanmiguel`
 * (Pro/Business la ve, Starter no) — en vez de mutar el plan en runtime (el
 * resolver `getPlanForOrg` cachea 60s EN MEMORIA DEL SERVER, un proceso
 * separado del test: mutar el plan acá no invalidaría ese cache y produciría
 * flakiness), los tests de la rama "ve la card" y "no ve la card" se
 * `test.skip()` mutuamente según el plan ACTUAL de la fixture. Cual de las
 * dos ramas corre depende de qué plan tenga sanmiguel hoy — no se fuerza.
 */
const prisma = new PrismaClient()

let orgId = ''
let otherOrgId: string | null = null
let originalPrefs: {
  executiveReportFrequency: 'WEEKLY' | 'BIWEEKLY' | 'DISABLED'
  executiveReportLeadCount: number
  executiveReportOptOut: boolean
} | null = null
let eligiblePlan = false
let isBusinessPlan = false

test.describe('Cliente — preferencias del reporte ejecutivo (P2.B.2)', () => {
  test.setTimeout(60_000)

  test.beforeAll(async () => {
    const membership = await prisma.orgMember.findFirst({
      where: { user: { email: 'cliente@sanmiguel.com' } },
      select: { organizationId: true },
    })
    if (!membership) throw new Error('Client fixture organization not found')
    orgId = membership.organizationId

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        executiveReportFrequency: true,
        executiveReportLeadCount: true,
        executiveReportOptOut: true,
        subscription: { select: { plan: { select: { key: true } } } },
      },
    })
    if (!org) throw new Error('Client fixture organization row not found')

    originalPrefs = {
      executiveReportFrequency: org.executiveReportFrequency,
      executiveReportLeadCount: org.executiveReportLeadCount,
      executiveReportOptOut: org.executiveReportOptOut,
    }

    const planKey = org.subscription?.plan?.key ?? 'STARTER'
    eligiblePlan = planKey === 'PRO' || planKey === 'BUSINESS'
    isBusinessPlan = planKey === 'BUSINESS'

    // Anti-IDOR: cualquier otra org sirve de testigo de que la mutación no se filtra.
    const other = await prisma.organization.findFirst({
      where: { id: { not: orgId } },
      select: { id: true },
    })
    otherOrgId = other?.id ?? null
  })

  test.afterAll(async () => {
    if (orgId && originalPrefs) {
      await prisma.organization
        .update({ where: { id: orgId }, data: originalPrefs })
        .catch(() => undefined)
    }
    await prisma.$disconnect()
  })

  test.beforeEach(async ({ page }) => {
    await loginAsClient(page)
  })

  test('el dueño puede cambiar frecuencia y cantidad; solo se toca su propia org (anti-IDOR)', async ({
    page,
  }) => {
    test.skip(!eligiblePlan, 'Fixture sanmiguel no está en plan Pro/Business — card no visible, omitido')

    const otherSnapshot = otherOrgId
      ? await prisma.organization.findUnique({
          where: { id: otherOrgId },
          select: { executiveReportFrequency: true, executiveReportLeadCount: true },
        })
      : null

    await page.goto('/dashboard/cuenta/perfil')
    await expect(page.getByText('Reporte ejecutivo semanal')).toBeVisible({ timeout: 10000 })

    // La sección de cantidad de leads es exclusiva BUSINESS (Pro no la ve).
    const leadCountTrigger = page.getByRole('button', { name: 'Cantidad de leads destacados' })
    if (isBusinessPlan) {
      await expect(leadCountTrigger).toBeVisible()
    } else {
      await expect(leadCountTrigger).toHaveCount(0)
    }

    await pickSelect(page, 'Frecuencia del reporte', 'Cada 15 días')
    await expectToast(page, /preferencias del reporte guardadas/i)

    const afterMine = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { executiveReportFrequency: true },
    })
    expect(afterMine?.executiveReportFrequency).toBe('BIWEEKLY')

    if (otherOrgId && otherSnapshot) {
      const otherAfter = await prisma.organization.findUnique({
        where: { id: otherOrgId },
        select: { executiveReportFrequency: true, executiveReportLeadCount: true },
      })
      expect(otherAfter?.executiveReportFrequency).toBe(otherSnapshot.executiveReportFrequency)
      expect(otherAfter?.executiveReportLeadCount).toBe(otherSnapshot.executiveReportLeadCount)
    }
  })

  test('elegir "No recibir" bloquea el envío (frequency=DISABLED) sin tocar el opt-out del mail', async ({
    page,
  }) => {
    test.skip(!eligiblePlan, 'Fixture sanmiguel no está en plan Pro/Business — card no visible, omitido')

    await prisma.organization.update({
      where: { id: orgId },
      data: { executiveReportOptOut: false },
    })

    await page.goto('/dashboard/cuenta/perfil')
    await pickSelect(page, 'Frecuencia del reporte', 'No recibir')
    await expectToast(page, /preferencias del reporte guardadas/i)

    const after = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { executiveReportFrequency: true, executiveReportOptOut: true },
    })
    expect(after?.executiveReportFrequency).toBe('DISABLED')
    expect(after?.executiveReportOptOut).toBe(false)
  })

  test('la UI muestra el estado EFECTIVO: opt-out viejo del mail se ve como "No recibir", y reactivar lo limpia', async ({
    page,
  }) => {
    test.skip(!eligiblePlan, 'Fixture sanmiguel no está en plan Pro/Business — card no visible, omitido')

    // Simula un opt-out previo por el link de unsubscribe del mail — sin
    // pasar por la action nueva, tal como lo dejaría hoy ese endpoint.
    await prisma.organization.update({
      where: { id: orgId },
      data: { executiveReportOptOut: true, executiveReportFrequency: 'WEEKLY' },
    })

    await page.goto('/dashboard/cuenta/perfil')
    // La columna real dice WEEKLY, pero el Select debe mostrar "No recibir"
    // (estado efectivo) — la UI nunca miente sobre si el reporte se manda.
    await expect(page.getByRole('button', { name: 'Frecuencia del reporte' })).toHaveText(
      /no recibir/i,
    )

    await pickSelect(page, 'Frecuencia del reporte', 'Cada semana')
    await expectToast(page, /preferencias del reporte guardadas/i)

    const after = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { executiveReportFrequency: true, executiveReportOptOut: true },
    })
    expect(after?.executiveReportFrequency).toBe('WEEKLY')
    // Único camino de vuelta del opt-out unidireccional del mail (P2.B.2).
    expect(after?.executiveReportOptOut).toBe(false)
  })

  test('un plan no elegible no ve la card', async ({ page }) => {
    test.skip(
      eligiblePlan,
      'Fixture sanmiguel SÍ está en plan Pro/Business — la negativa no aplica hoy a este fixture',
    )

    await page.goto('/dashboard/cuenta/perfil')
    await expect(page.getByText('Preferencias de notificaciones')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Reporte ejecutivo semanal')).toHaveCount(0)
  })
})
