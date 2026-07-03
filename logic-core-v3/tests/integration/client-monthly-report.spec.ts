/**
 * P2.C — Integration test de `getClientMonthlyReportData` + render real del PDF.
 * Requiere DB real (Prisma directo, sin servidor HTTP). Mismo criterio que
 * `tests/integration/executive-report-lead-count.spec.ts`: NO está en el
 * testDir de playwright.config.ts (./tests/e2e) — correr explícito:
 *
 *   npx playwright test tests/integration/client-monthly-report.spec.ts
 *
 * Cubre el requisito explícito del sprint: "genera con mes completo y con mes
 * flojo (empty honesto, sin ceros tristes) sin crashear" — contra datos reales
 * de Prisma (enums/fechas tal como los devuelve la DB), no solo contra los
 * objetos a mano del invariante puro (`monthly-report-data.invariant.ts`).
 */
import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { getClientMonthlyReportData } from '../../src/lib/reports/client-monthly/get-client-monthly-report-data'
import { ClientMonthlyReportPdf } from '../../src/lib/reports/client-monthly/ClientMonthlyReportPdf'

const prisma = new PrismaClient()
const TAG = 'P2C-MONTHLYREPORT-TEST'

// Ancla fija de "ahora" para que el corte de mes (dates-ar) sea determinístico
// en el test — julio 2026 — sin depender del reloj real ni de una medianoche
// en vuelo durante la corrida.
const NOW = new Date('2026-07-15T12:00:00.000Z')
const THIS_MONTH = new Date('2026-07-10T15:00:00.000Z')
const LAST_MONTH = new Date('2026-06-10T15:00:00.000Z')

// "Ahora" sintético en un mes sin actividad real (muy anterior a cualquier
// dato de seed/fixture) — da un "mes flojo" genuino sin sembrar ni limpiar
// nada: la ventana de enero 2020 no tiene leads de ningún fixture.
const FAR_PAST_NOW = new Date('2020-01-15T12:00:00.000Z')

async function getActiveBot() {
  return prisma.botConfig.findFirst({ where: { isActive: true } })
}

test.describe('Informe mensual del cliente — datos + PDF real (P2.C)', () => {
  test.afterAll(async () => {
    await prisma.chatbotLead.deleteMany({ where: { message: { contains: TAG } } }).catch(() => undefined)
    await prisma.$disconnect()
  })

  test('mes completo: números y embudo reales, PDF renderiza sin crashear', async () => {
    const bot = await getActiveBot()
    if (!bot) {
      test.skip(true, 'Sin bot activo en BD — omitido')
      return
    }

    await prisma.chatbotLead.createMany({
      data: [
        { botConfigId: bot.id, message: `${TAG} won`, status: 'WON', firstContactedAt: THIS_MONTH, capturedAt: THIS_MONTH, category: 'sales' },
        { botConfigId: bot.id, message: `${TAG} contacted`, status: 'CONTACTED', firstContactedAt: THIS_MONTH, capturedAt: THIS_MONTH, category: 'sales' },
        { botConfigId: bot.id, message: `${TAG} new1`, status: 'NEW', capturedAt: THIS_MONTH, category: 'sales' },
        { botConfigId: bot.id, message: `${TAG} new2`, status: 'NEW', capturedAt: THIS_MONTH, category: 'postventa' },
        { botConfigId: bot.id, message: `${TAG} new3`, status: 'NEW', capturedAt: THIS_MONTH, category: 'sales' },
        { botConfigId: bot.id, message: `${TAG} prev1`, status: 'NEW', capturedAt: LAST_MONTH, category: 'sales' },
        { botConfigId: bot.id, message: `${TAG} prev2`, status: 'NEW', capturedAt: LAST_MONTH, category: 'sales' },
      ],
    })

    try {
      const data = await getClientMonthlyReportData(bot.organizationId, NOW)
      expect(data.hasBot).toBe(true)
      if (!data.hasBot) return

      // Misma ventana/org para el count() de leads y el findMany() del embudo
      // — deben reconciliar siempre (mismo where clause).
      expect(data.funnel.total).toBe(data.leads.current)
      expect(data.leads.current).toBeGreaterThanOrEqual(5)
      expect(data.leads.previous).toBeGreaterThanOrEqual(2)
      expect(data.funnel.sold).toBeGreaterThanOrEqual(1)
      expect(data.funnel.contacted).toBeGreaterThanOrEqual(2)

      const buffer = await renderToBuffer(
        React.createElement(ClientMonthlyReportPdf, { data, now: NOW }) as never,
      )
      expect(buffer.byteLength).toBeGreaterThan(1000)
    } finally {
      await prisma.chatbotLead.deleteMany({ where: { message: { contains: TAG } } })
    }
  })

  test('mes flojo (sin actividad real): ceros honestos, sin ceros inventados, sin crashear', async () => {
    const bot = await getActiveBot()
    if (!bot) {
      test.skip(true, 'Sin bot activo en BD — omitido')
      return
    }

    const data = await getClientMonthlyReportData(bot.organizationId, FAR_PAST_NOW)
    expect(data.hasBot).toBe(true)
    if (!data.hasBot) return

    // Enero 2020 no tiene actividad de ningún fixture: números en cero
    // honestos (no null, no inventados) y consistentes entre sí.
    expect(data.leads.current).toBe(0)
    expect(data.leads.previous).toBe(0)
    expect(data.leads.phrase).toBeNull()
    expect(data.funnel).toEqual({ total: 0, contacted: 0, sold: 0, pending: 0 })

    const buffer = await renderToBuffer(
      React.createElement(ClientMonthlyReportPdf, { data, now: FAR_PAST_NOW }) as never,
    )
    expect(buffer.byteLength).toBeGreaterThan(500)
  })
})
