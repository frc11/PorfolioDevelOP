/**
 * P2.B.2 — Invariante del gate de plan del reporte ejecutivo semanal. Corre SIN DB ni server:
 *
 *   npm run check:invariant:executive-report-plan
 *   (o: npx tsx src/lib/reports/executive-weekly/report-eligible-plan.invariant.ts)
 *
 * Verifica que reportEligiblePlan/businessOnlyReportSection coincidan EXACTAMENTE
 * con el gate real de build.ts (`plan.key !== 'PRO' && plan.key !== 'BUSINESS'` para
 * el reporte completo, `plan.key === 'BUSINESS'` para la sección de leads
 * destacados). La card de /dashboard/cuenta/perfil usa este helper porque
 * build.ts (motor del reporte, fuera de scope) no lo expone como función reusable.
 */
import assert from 'node:assert/strict'
import { reportEligiblePlan, businessOnlyReportSection } from './report-eligible-plan.ts'

// ── Gate del reporte completo (mismo criterio que build.ts) ───────────────────
assert.equal(reportEligiblePlan('STARTER'), false, 'STARTER no recibe el reporte')
assert.equal(reportEligiblePlan('PRO'), true, 'PRO recibe el reporte')
assert.equal(reportEligiblePlan('BUSINESS'), true, 'BUSINESS recibe el reporte')

// ── Gate de la sección "leads destacados" (exclusiva BUSINESS) ────────────────
assert.equal(businessOnlyReportSection('STARTER'), false, 'STARTER no ve leads destacados')
assert.equal(
  businessOnlyReportSection('PRO'),
  false,
  'PRO no ve leads destacados (recibe el resto del reporte, no esa sección)',
)
assert.equal(businessOnlyReportSection('BUSINESS'), true, 'BUSINESS ve leads destacados')

console.log(
  '✓ invariante OK: el gate de plan de la UI (perfil/page.tsx) coincide con el ' +
    'gate real de build.ts para PRO/BUSINESS y la sección BUSINESS-only.',
)
