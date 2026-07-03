/**
 * P2.C — Invariante del ensamblado del informe mensual (puro, sin DB/PDF).
 * Corre:  npx tsx src/lib/reports/client-monthly/monthly-report-data.invariant.ts
 *
 * Cubre lo determinístico: mes completo, mes flojo (ceros honestos, sin
 * inventar), sin bot todavía, y que la degradación de categorías/serie pasa
 * TAL CUAL de P0.2 (nunca diverge de lo que ve la tab).
 */
import assert from 'node:assert/strict'
import {
  assembleClientMonthlyReportData,
  buildMonthlyReportLeadsNumber,
  monthlyLeadsPhrase,
} from './monthly-report-data.ts'
import type { MonthlyAnalysisData } from '../../../modules/chatbot/server/analysis/getMonthlyAnalysisForOrg.ts'

const EMPTY_SERIES = { points: [], current: null, variation: null }
const INSUFFICIENT_CATEGORIES = { sufficient: false, total: 3, top: [] }
const SUFFICIENT_CATEGORIES = {
  sufficient: true,
  total: 20,
  top: [
    {
      category: 'sales' as const,
      label: 'Quieren comprar',
      phrase: 'para comprar',
      count: 12,
      share: 0.6,
      outOf10: 6,
    },
  ],
}

// ── 1) Sin bot: NINGÚN campo de datos, nunca se inventan ceros ───────────────
const noBotAnalysis: MonthlyAnalysisData = {
  hasBot: false,
  insights: [],
  series: EMPTY_SERIES,
  categories: { sufficient: false, total: 0, top: [] },
  leadsLast30d: 0,
}
const noBot = assembleClientMonthlyReportData({
  companyName: 'X',
  monthLabel: 'julio 2026',
  analysis: noBotAnalysis,
  leadsThisMonth: 999, // no debería usarse ni aparecer — hasBot manda
  leadsPrevMonth: 999,
  funnelLeads: [],
})
assert.equal(noBot.hasBot, false)
assert.deepEqual(Object.keys(noBot).sort(), ['companyName', 'hasBot', 'monthLabel'], 'sin bot: NINGÚN campo de datos, no ceros inventados')

// ── 2) Mes flojo (con bot, cero actividad): ceros HONESTOS, no null ──────────
const weakAnalysis: MonthlyAnalysisData = {
  hasBot: true,
  insights: [],
  series: EMPTY_SERIES,
  categories: INSUFFICIENT_CATEGORIES,
  leadsLast30d: 3,
}
const weak = assembleClientMonthlyReportData({
  companyName: 'San Miguel',
  monthLabel: 'julio 2026',
  analysis: weakAnalysis,
  leadsThisMonth: 0,
  leadsPrevMonth: 0,
  funnelLeads: [],
})
if (!weak.hasBot) throw new Error('esperaba hasBot=true (con bot, mes flojo)')
assert.deepEqual(weak.leads, { current: 0, previous: 0, delta: 0, phrase: null }, 'sin datos previos → sin frase inventada')
assert.equal(weak.series.current, null, 'serie vacía pasa tal cual, sin inventar actividad')
assert.equal(weak.categories.sufficient, false, 'degradación de categorías igual a la tab P0.2')
assert.equal(weak.topInsight, null)
assert.deepEqual(weak.funnel, { total: 0, contacted: 0, sold: 0, pending: 0 })

// ── 3) Mes completo: números reales, delta con dirección correcta ────────────
const fullAnalysis: MonthlyAnalysisData = {
  hasBot: true,
  insights: [
    {
      id: 'ins_1',
      category: 'CONVERSION_LEAK',
      status: 'PENDING',
      title: 'Se enfrían en el precio',
      description: 'Varios leads preguntan precio y no vuelven a escribir.',
      suggestedAction: 'Sumar un rango de precios a la respuesta automática.',
      evidenceCount: 8,
      createdAt: new Date('2026-07-01T12:00:00Z'),
    },
  ],
  series: {
    points: [
      { key: '2026-06', label: 'junio', count: 40 },
      { key: '2026-07', label: 'julio', count: 60 },
    ],
    current: { key: '2026-07', label: 'julio', count: 60 },
    variation: { pct: 50, direction: 'up', label: '+50% vs junio' },
  },
  categories: SUFFICIENT_CATEGORIES,
  leadsLast30d: 22,
}
const full = assembleClientMonthlyReportData({
  companyName: 'San Miguel',
  monthLabel: 'julio 2026',
  analysis: fullAnalysis,
  leadsThisMonth: 22,
  leadsPrevMonth: 15,
  funnelLeads: [
    { status: 'WON', firstContactedAt: new Date() },
    { status: 'CONTACTED', firstContactedAt: new Date() },
    { status: 'NEW', firstContactedAt: null },
  ],
})
if (!full.hasBot) throw new Error('esperaba hasBot=true (mes completo)')
assert.deepEqual(full.leads, { current: 22, previous: 15, delta: 7, phrase: '+7 vs el mes pasado' })
assert.equal(full.series.variation?.label, '+50% vs junio', 'la frase de conversaciones viene tal cual de P0.2')
assert.equal(full.categories.sufficient, true)
assert.equal(full.topInsight?.id, 'ins_1')
assert.deepEqual(full.funnel, { total: 3, contacted: 2, sold: 1, pending: 1 })

// ── 4) monthlyLeadsPhrase: nunca insinúa dirección equivocada ────────────────
assert.equal(monthlyLeadsPhrase({ current: 5, previous: 10, delta: -5 }), '-5 vs el mes pasado')
assert.equal(monthlyLeadsPhrase({ current: 10, previous: 5, delta: 5 }), '+5 vs el mes pasado')
assert.equal(monthlyLeadsPhrase({ current: 4, previous: 4, delta: 0 }), 'igual que el mes pasado')
assert.equal(monthlyLeadsPhrase({ current: 3, previous: 0, delta: 3 }), 'primeros del mes')
assert.equal(monthlyLeadsPhrase({ current: 0, previous: 0, delta: 0 }), null)

// P2.C-fix-signo — guion ASCII (U+002D), NUNCA el MINUS SIGN Unicode (U+2212):
// ese carácter no tiene glifo en Helvetica no-incrustada (@react-pdf/renderer)
// y se renderizaba invisible con ancho 0 — "−18 vs..." salía como "18vs...".
const negativeMonthlyPhrase = monthlyLeadsPhrase({ current: 0, previous: 18, delta: -18 })
assert.equal(negativeMonthlyPhrase, '-18 vs el mes pasado')
assert.equal(negativeMonthlyPhrase?.charCodeAt(0), 45, 'guion ASCII (U+002D), no MINUS SIGN')
assert.ok(!negativeMonthlyPhrase?.includes('−'), 'nunca el MINUS SIGN Unicode (U+2212)')

// ── 5) buildMonthlyReportLeadsNumber: expone current/previous/delta reales ───
const leadsNum = buildMonthlyReportLeadsNumber(8, 20)
assert.equal(leadsNum.delta, -12)
assert.equal(leadsNum.phrase, '-12 vs el mes pasado')
assert.equal(leadsNum.phrase?.charCodeAt(0), 45, 'guion ASCII (U+002D), no MINUS SIGN')

console.log(
  '✓ monthly-report-data.invariant: mes completo, mes flojo y sin-bot ensamblan honesto, sin ceros inventados',
)
