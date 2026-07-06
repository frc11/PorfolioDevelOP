/**
 * P5.1 — Invariante del motor de recomendaciones por reglas. Corre SIN DB ni
 * server:
 *
 *   npm run check:invariant:recommendations
 *   (o: npx tsx src/lib/recommendations/recommendations.invariant.ts)
 *
 * Verifica, de forma ejecutable, las garantías del sprint:
 *   1. UMBRAL: cada regla dispara SOLO desde su muestra mínima, nunca por debajo.
 *   2. PERTINENCIA: la condición de cada regla (señal → solución) es exacta.
 *   3. ANTI-IDOR (estructural): las reglas solo miran `signals`; el resultado no
 *      depende de `organizationId` y el CTA no carga ninguna org (la sesión la
 *      resuelve `requestUpsellAction`, no el cliente).
 *   4. TOPE + ROTACIÓN: `selectVisibleRecommendations` respeta el máximo, fija la
 *      #1 por prioridad y rota el resto por semilla sin inventar ni duplicar.
 *   5. EMPTY: sin bot / por debajo de todos los umbrales → [] (estado vacío).
 *
 * Importa solo módulos puros (reglas + tipos). Cero Neon, cero request context.
 */
import assert from 'node:assert/strict'
import {
  computeRecommendations,
  evaluateRules,
  selectVisibleRecommendations,
  RECOMMENDATION_RULES,
  THRESHOLDS,
  MODULE_MOTOR_RESENAS,
  MAX_VISIBLE_RECOMMENDATIONS,
} from './rules.ts'
import type { Recommendation, RecommendationSignals } from './types.ts'

// Base: org SIN señales de dolor (todo apagado). Cada test enciende lo justo.
function baseSignals(overrides: Partial<RecommendationSignals> = {}): RecommendationSignals {
  return {
    organizationId: 'org_base',
    hasBot: true,
    leadsLast30d: 0,
    conversationsThisMonth: 0,
    hotLeads: 0,
    googleReviewsCount: 50, // reputación ya construida → no dispara reseñas
    gbpConnected: true, // ficha conectada → no dispara connect-gbp
    gbpOperational: true, // P3-A.1: y con location resuelta (OPERATIONAL)
    activeModuleSlugs: [],
    plan: { key: 'BUSINESS', reportsEnabled: true, crmEnabled: true }, // plan tope → no upsell
    ...overrides,
  }
}

const idsOf = (recs: Recommendation[]) => recs.map((r) => r.id)
const fires = (signals: RecommendationSignals, id: string) =>
  evaluateRules(signals).some((r) => r.id === id)

// ── 1. connect-gbp: umbral de leads + ficha no conectada ──────────────────────
{
  const below = baseSignals({ gbpConnected: false, leadsLast30d: THRESHOLDS.MIN_LEADS_30D - 1 })
  const at = baseSignals({ gbpConnected: false, leadsLast30d: THRESHOLDS.MIN_LEADS_30D })

  assert.equal(fires(below, 'connect-gbp'), false, 'connect-gbp NO dispara por debajo del umbral de leads')
  assert.equal(fires(at, 'connect-gbp'), true, 'connect-gbp dispara justo en el umbral con ficha no conectada')
  // Con ficha conectada nunca dispara, por más tráfico que haya.
  assert.equal(
    fires(baseSignals({ gbpConnected: true, leadsLast30d: 500 }), 'connect-gbp'),
    false,
    'connect-gbp no dispara si la ficha ya está conectada',
  )
}

// ── 2. reviews-engine: ficha conectada + pocas reseñas + módulo no activo ──────
{
  const fireIt = baseSignals({
    gbpConnected: true,
    leadsLast30d: THRESHOLDS.MIN_LEADS_30D,
    googleReviewsCount: THRESHOLDS.LOW_REVIEWS_MAX - 1,
    activeModuleSlugs: [],
  })
  assert.equal(fires(fireIt, 'reviews-engine'), true, 'reseñas dispara con tráfico, ficha conectada y pocas reseñas')

  // Por debajo del umbral de leads → no dispara.
  assert.equal(
    fires({ ...fireIt, leadsLast30d: THRESHOLDS.MIN_LEADS_30D - 1 }, 'reviews-engine'),
    false,
    'reseñas NO dispara por debajo del umbral de leads',
  )
  // Reputación ya construida (>= umbral de reseñas) → no dispara.
  assert.equal(
    fires({ ...fireIt, googleReviewsCount: THRESHOLDS.LOW_REVIEWS_MAX }, 'reviews-engine'),
    false,
    'reseñas NO dispara si ya hay reputación construida',
  )
  // Módulo ya activo → nunca se upsellea lo que ya se tiene.
  assert.equal(
    fires({ ...fireIt, activeModuleSlugs: [MODULE_MOTOR_RESENAS] }, 'reviews-engine'),
    false,
    'reseñas NO dispara si el módulo ya está activo',
  )
  // P3-A.1 fix: conectada (gbpConnected=true, hay tokens) pero SIN location
  // operativa (CONNECTED_NO_LOCATION — 0 o >1 sucursales sin elegir) → NO
  // dispara. Recomendar el módulo sin `gbpLocationId` resuelto es incoherente:
  // el cliente v4 no tiene location para operar.
  assert.equal(
    fires({ ...fireIt, gbpOperational: false }, 'reviews-engine'),
    false,
    'reseñas NO dispara si la ficha está conectada pero sin location operativa (CONNECTED_NO_LOCATION)',
  )
  // Mismo estado no cambia el resto del comportamiento: con location operativa
  // (el resto de las condiciones intactas) sigue disparando igual que antes.
  assert.equal(
    fires({ ...fireIt, gbpOperational: true }, 'reviews-engine'),
    true,
    'reseñas sigue disparando igual que antes cuando la location SÍ es operativa',
  )
}

// ── 3. connect-gbp XOR reviews-engine (mutuamente excluyentes por gbpConnected) ─
{
  const traffic = { leadsLast30d: 40, googleReviewsCount: 0, activeModuleSlugs: [] as string[] }
  const notConnected = evaluateRules(baseSignals({ ...traffic, gbpConnected: false }))
  const connected = evaluateRules(baseSignals({ ...traffic, gbpConnected: true }))

  assert.ok(idsOf(notConnected).includes('connect-gbp'), 'ficha desconectada → connect-gbp')
  assert.ok(!idsOf(notConnected).includes('reviews-engine'), 'ficha desconectada → NO reseñas todavía')
  assert.ok(idsOf(connected).includes('reviews-engine'), 'ficha conectada + pocas reseñas → reseñas')
  assert.ok(!idsOf(connected).includes('connect-gbp'), 'ficha conectada → NO connect-gbp')
}

// ── 4. hot-leads-crm: umbral de calientes + sin CRM ───────────────────────────
{
  const withoutCrm = { plan: { key: 'STARTER' as const, reportsEnabled: false, crmEnabled: false } }
  assert.equal(
    fires(baseSignals({ ...withoutCrm, hotLeads: THRESHOLDS.MIN_HOT_LEADS - 1 }), 'hot-leads-crm'),
    false,
    'hot-leads NO dispara por debajo del umbral de calientes',
  )
  assert.equal(
    fires(baseSignals({ ...withoutCrm, hotLeads: THRESHOLDS.MIN_HOT_LEADS }), 'hot-leads-crm'),
    true,
    'hot-leads dispara justo en el umbral sin CRM',
  )
  // Plan con CRM → no upsell (ya lo tiene).
  assert.equal(
    fires(baseSignals({ hotLeads: 50, plan: { key: 'BUSINESS', reportsEnabled: true, crmEnabled: true } }), 'hot-leads-crm'),
    false,
    'hot-leads NO dispara si el plan ya incluye seguimiento',
  )
}

// ── 5. executive-report: actividad (conversaciones O leads) + sin reportes ────
{
  const noReports = { plan: { key: 'STARTER' as const, reportsEnabled: false, crmEnabled: false } }
  // Ninguna vía de actividad alcanza → no dispara.
  assert.equal(
    fires(
      baseSignals({
        ...noReports,
        conversationsThisMonth: THRESHOLDS.MIN_CONVERSATIONS_FOR_REPORT - 1,
        leadsLast30d: THRESHOLDS.MIN_LEADS_30D - 1,
        gbpConnected: true,
        googleReviewsCount: 50,
      }),
      'executive-report',
    ),
    false,
    'reporte NO dispara sin actividad suficiente por ninguna vía',
  )
  // Vía conversaciones.
  assert.equal(
    fires(baseSignals({ ...noReports, conversationsThisMonth: THRESHOLDS.MIN_CONVERSATIONS_FOR_REPORT, leadsLast30d: 0 }), 'executive-report'),
    true,
    'reporte dispara con conversaciones suficientes',
  )
  // Vía leads.
  assert.equal(
    fires(baseSignals({ ...noReports, conversationsThisMonth: 0, leadsLast30d: THRESHOLDS.MIN_LEADS_30D }), 'executive-report'),
    true,
    'reporte dispara con leads suficientes',
  )
  // Plan con reportes → no upsell.
  assert.equal(
    fires(baseSignals({ conversationsThisMonth: 999, plan: { key: 'PRO', reportsEnabled: true, crmEnabled: false } }), 'executive-report'),
    false,
    'reporte NO dispara si el plan ya incluye reportes',
  )
}

// ── 6. Sin bot → nada dispara (org nueva / onboarding incompleto) ─────────────
{
  const noBot = baseSignals({
    hasBot: false,
    gbpConnected: false,
    leadsLast30d: 999,
    conversationsThisMonth: 999,
    hotLeads: 999,
    googleReviewsCount: 0,
    plan: { key: 'STARTER', reportsEnabled: false, crmEnabled: false },
  })
  assert.deepEqual(evaluateRules(noBot), [], 'sin bot → cero recomendaciones (estado vacío honesto)')
}

// ── 7. Empty: org con bot pero por debajo de TODOS los umbrales → [] ──────────
{
  const quiet = baseSignals({
    gbpConnected: false, // desconectada pero SIN tráfico suficiente
    leadsLast30d: THRESHOLDS.MIN_LEADS_30D - 1,
    conversationsThisMonth: THRESHOLDS.MIN_CONVERSATIONS_FOR_REPORT - 1,
    hotLeads: THRESHOLDS.MIN_HOT_LEADS - 1,
    plan: { key: 'STARTER', reportsEnabled: false, crmEnabled: false },
  })
  assert.deepEqual(evaluateRules(quiet), [], 'org con poca data → [] (dispara EmptyStateMuted, nunca consejo trucho)')
}

// ── 8. ANTI-IDOR estructural: el resultado no depende de organizationId ───────
{
  const growth = {
    gbpConnected: true,
    leadsLast30d: 40,
    googleReviewsCount: 1,
    hotLeads: 12,
    conversationsThisMonth: 60,
    plan: { key: 'STARTER' as const, reportsEnabled: false, crmEnabled: false },
  }
  const orgA = evaluateRules(baseSignals({ ...growth, organizationId: 'org_AAA' }))
  const orgB = evaluateRules(baseSignals({ ...growth, organizationId: 'org_BBB' }))

  // Mismas señales, distinto orgId → MISMO resultado: las reglas no usan el orgId
  // para leer nada (no pueden alcanzar datos de otra org).
  assert.deepEqual(idsOf(orgA), idsOf(orgB), 'el orgId no altera qué reglas disparan (reglas puras sobre signals)')
  // Determinismo: mismo input → mismo output.
  assert.deepEqual(
    evaluateRules(baseSignals({ ...growth, organizationId: 'org_AAA' })),
    orgA,
    'evaluateRules es determinista',
  )

  // El CTA no carga NINGÚN identificador de org — la sesión resuelve el tenant.
  const allowedCtaKeys = new Set(['label', 'featureKey', 'featureName', 'messageContext', 'moduleName'])
  for (const rec of orgA) {
    assert.ok(rec.cta.featureKey.length > 0, `${rec.id}: featureKey no vacío`)
    assert.ok(rec.cta.featureName.length > 0, `${rec.id}: featureName no vacío`)
    for (const key of Object.keys(rec.cta)) {
      assert.ok(allowedCtaKeys.has(key), `${rec.id}: el CTA no debe cargar '${key}' (ni orgId)`)
    }
  }
}

// ── 9. TOPE + ROTACIÓN: fija la #1, rota el resto, sin inventar ni duplicar ────
{
  const mk = (priority: number): Recommendation => ({
    id: `r${priority}`,
    title: `t${priority}`,
    body: 'b',
    accent: 'cyan',
    icon: 'sparkles',
    priority,
    cta: { label: 'x', featureKey: 'k', featureName: 'n', messageContext: 'c' },
  })
  const pool = [mk(60), mk(100), mk(80), mk(70), mk(90)] // 5 candidatas desordenadas
  const inputIds = new Set(idsOf(pool))

  for (const seed of [0, 1, 2, 3, 7, 12345]) {
    const visible = selectVisibleRecommendations(pool, seed, MAX_VISIBLE_RECOMMENDATIONS)
    assert.equal(visible.length, MAX_VISIBLE_RECOMMENDATIONS, `seed ${seed}: respeta el tope`)
    assert.equal(visible[0].id, 'r100', `seed ${seed}: la #1 por prioridad queda fija`)
    assert.equal(new Set(idsOf(visible)).size, visible.length, `seed ${seed}: sin duplicados`)
    for (const r of visible) {
      assert.ok(inputIds.has(r.id), `seed ${seed}: solo muestra candidatas reales (nada inventado)`)
    }
  }

  // Rotación real: dos semillas distintas producen conjuntos distintos.
  const s0 = idsOf(selectVisibleRecommendations(pool, 0, MAX_VISIBLE_RECOMMENDATIONS)).join(',')
  const s1 = idsOf(selectVisibleRecommendations(pool, 1, MAX_VISIBLE_RECOMMENDATIONS)).join(',')
  assert.notEqual(s0, s1, 'semillas distintas rotan la selección (no muestra siempre lo mismo)')

  // Si hay <= max candidatas, se muestran todas ordenadas por prioridad, sin rotar.
  const few = [mk(70), mk(90)]
  assert.deepEqual(
    idsOf(selectVisibleRecommendations(few, 999, MAX_VISIBLE_RECOMMENDATIONS)),
    ['r90', 'r70'],
    'con <= max: todas, ordenadas por prioridad',
  )
  assert.deepEqual(selectVisibleRecommendations(pool, 0, 0), [], 'max 0 → []')
}

// ── 10. computeRecommendations: motor completo respeta el tope ────────────────
{
  // Org que dispara reviews + hot-leads + reporte (3) — cabe justo en el tope.
  const busy = baseSignals({
    gbpConnected: true,
    leadsLast30d: 40,
    googleReviewsCount: 1,
    hotLeads: 12,
    conversationsThisMonth: 60,
    plan: { key: 'STARTER', reportsEnabled: false, crmEnabled: false },
  })
  const visible = computeRecommendations(busy, 0)
  assert.ok(visible.length <= MAX_VISIBLE_RECOMMENDATIONS, 'el motor completo nunca excede el tope visible')
  assert.ok(visible.length >= 1, 'una org activa con plan Starter recibe al menos una sugerencia')
}

// Sanity: hay exactamente 4 reglas v1 y todas tienen id único.
assert.equal(RECOMMENDATION_RULES.length, 4, 'set v1: 4 reglas')
assert.equal(new Set(RECOMMENDATION_RULES.map((r) => r.id)).size, 4, 'ids de regla únicos')

console.log(
  '✓ recommendations invariants OK: umbrales por regla, pertinencia, anti-IDOR ' +
    '(resultado independiente del orgId, CTA sin org), tope + rotación honesta y empty state.',
)
