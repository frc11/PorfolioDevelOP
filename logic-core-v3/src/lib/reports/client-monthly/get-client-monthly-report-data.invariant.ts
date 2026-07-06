/**
 * D7 — Invariante Node puro (tsx) de `getClientMonthlyReportData` + render real
 * del PDF (P2.C). Reemplaza a tests/integration/client-monthly-report.spec.ts
 * (Playwright, eliminado): ese spec crasheaba dentro de @react-pdf/renderer con
 * "Objects are not valid as a React child" (clave sospechosa __pw_type) — un
 * test de generación de PDF (Prisma + @react-pdf, sin navegador) no pertenece a
 * Playwright; corre acá como los demás invariantes del repo. Corre:
 *
 *   npm run check:invariant:client-monthly-report-pdf
 *   (o: npx tsx src/lib/reports/client-monthly/get-client-monthly-report-data.invariant.ts)
 *
 * Contra la Neon real (igual que los demás specs de tests/integration/): crea
 * sus propias filas tagueadas (D7-MONTHLYREPORT-PDF-TEST) y las borra en
 * `finally` — no es estrictamente read-only, pero sí auto-contenido.
 *
 * dotenv.config() corre ANTES que cualquier módulo que toque Prisma, vía
 * import() dinámico — no alcanza con poner el import estático después en el
 * texto: los `import` de ESM se hoistean por delante de cualquier otra
 * sentencia del módulo, así que `lib/prisma` (que construye `new
 * PrismaClient()` a nivel de módulo) se evaluaría ANTES que dotenv.config() sin
 * este resguardo — el mismo error ("Environment variable not found:
 * DATABASE_URL") que tenía el spec viejo antes de D6, pero ahora por hoisting
 * en vez de por falta de config.
 */
import assert from 'node:assert/strict'
import dotenv from 'dotenv'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ClientMonthlyReportPdf } from './ClientMonthlyReportPdf.tsx'

dotenv.config({ path: '.env.local' })

const TAG = 'D7-MONTHLYREPORT-PDF-TEST'

// Misma ancla fija que el spec reemplazado — julio 2026, determinístico, sin
// depender del reloj real ni de una medianoche en vuelo durante la corrida.
const NOW = new Date('2026-07-15T12:00:00.000Z')
const THIS_MONTH = new Date('2026-07-10T15:00:00.000Z')
const LAST_MONTH = new Date('2026-06-10T15:00:00.000Z')

// "Ahora" sintético en un mes sin actividad real — mes flojo genuino sin
// sembrar ni limpiar nada: enero 2020 no tiene leads de ningún fixture.
const FAR_PAST_NOW = new Date('2020-01-15T12:00:00.000Z')

async function main() {
  const { prisma } = await import('../../prisma.ts')
  const { getClientMonthlyReportData } = await import('./get-client-monthly-report-data.ts')

  const bot = await prisma.botConfig.findFirst({ where: { isActive: true } })
  if (!bot) {
    console.log('⚠ invariante omitido: sin bot activo en BD (mismo criterio de skip que tenía el spec reemplazado)')
    await prisma.$disconnect()
    return
  }

  // ── mes completo: números y embudo reales, PDF renderiza sin crashear ─────
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
    if (!data.hasBot) throw new Error('esperaba hasBot=true (mes completo)')

    // Mismo where clause para el count() de leads y el findMany() del embudo
    // — deben reconciliar siempre.
    assert.equal(data.funnel.total, data.leads.current, 'funnel.total y leads.current deben reconciliar')
    assert.ok(data.leads.current >= 5, 'leads del mes actual')
    assert.ok(data.leads.previous >= 2, 'leads del mes anterior')
    assert.ok(data.funnel.sold >= 1, 'al menos 1 vendido')
    assert.ok(data.funnel.contacted >= 2, 'al menos 2 contactados')

    const buffer = await renderToBuffer(
      React.createElement(ClientMonthlyReportPdf, { data, now: NOW }) as never,
    )
    assert.ok(buffer.byteLength > 1000, 'PDF de mes completo con contenido real')
  } finally {
    await prisma.chatbotLead.deleteMany({ where: { message: { contains: TAG } } })
  }

  // ── mes flojo (sin actividad real): ceros honestos, sin crashear ──────────
  const weakData = await getClientMonthlyReportData(bot.organizationId, FAR_PAST_NOW)
  if (!weakData.hasBot) throw new Error('esperaba hasBot=true (mes flojo)')

  assert.equal(weakData.leads.current, 0)
  assert.equal(weakData.leads.previous, 0)
  assert.equal(weakData.leads.phrase, null)
  assert.deepEqual(weakData.funnel, { total: 0, contacted: 0, sold: 0, pending: 0 })

  const weakBuffer = await renderToBuffer(
    React.createElement(ClientMonthlyReportPdf, { data: weakData, now: FAR_PAST_NOW }) as never,
  )
  assert.ok(weakBuffer.byteLength > 500, 'PDF de mes flojo igual renderiza (ceros honestos, no crashea)')

  await prisma.$disconnect()
  console.log(
    '✓ get-client-monthly-report-data.invariant: datos reales + render de PDF (mes completo y mes flojo) sin crashear, fuera de Playwright',
  )
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
