/**
 * P0.3 — Invariante del gate de priorización de leads (caliente/tibio/frío).
 * Corre SIN DB ni server:
 *
 *   npm run check:invariant:lead-scoring
 *   (o: npx ts-node src/lib/plan/lead-scoring-gate.invariant.ts)
 *
 * Prueba, de forma ejecutable, las DOS superficies del gate de PRESENTACIÓN:
 *   Eje 1 — `planAllows(plan, 'leadScoring')`: qué planes ven la clasificación.
 *           Pro/Business sí, Starter no, org sin plan (fallback) no.
 *   Eje 2 — `buildLeadsCsv(..., { includeClassification })`: la columna de
 *           clasificación aparece/desaparece según el plan, y el RESTO del CSV
 *           (datos del contacto, estado, fecha) queda intacto en ambos casos.
 *
 * Importa solo módulos puros (función de mapeo + builder de string CSV) — cero
 * acceso a Neon, cero request context. El gate es de presentación, no de
 * cómputo: el scoring se sigue calculando aguas arriba; esto solo verifica la
 * decisión de MOSTRAR.
 */
import assert from 'node:assert/strict'
import { planAllows } from './plan-allows.ts'
import type { EffectivePlan } from './fallback.ts'
import { PLAN_FALLBACK } from './fallback.ts'
import {
  buildLeadsCsv,
  type LeadForCsv,
} from '../../modules/chatbot/server/leads/csv/buildLeadsCsv.ts'

// ============================================================
// Eje 1 — planAllows(plan, 'leadScoring')
// ============================================================

// Base Starter real (insight off) — espejo del fallback pero con id real, para
// no confundir "Starter asignado" con "sin plan".
const STARTER: EffectivePlan = {
  ...PLAN_FALLBACK,
  id: 'plan_starter',
  name: 'Starter',
  isFallback: false,
}

// Pro / Business comparten la población comercial de la feature: insight ON.
const PRO: EffectivePlan = {
  ...STARTER,
  id: 'plan_pro',
  key: 'PRO',
  name: 'Pro',
  reportsEnabled: true,
  insightEnabled: true,
  crmEnabled: true,
}

const BUSINESS: EffectivePlan = {
  ...PRO,
  id: 'plan_business',
  key: 'BUSINESS',
  name: 'Business',
}

// 1. Pro ve la clasificación.
assert.equal(
  planAllows(PRO, 'leadScoring'),
  true,
  'Pro debe ver la priorización de leads',
)

// 2. Business ve la clasificación.
assert.equal(
  planAllows(BUSINESS, 'leadScoring'),
  true,
  'Business debe ver la priorización de leads',
)

// 3. Starter NO ve la clasificación (pero el lead se sigue computando aguas arriba).
assert.equal(
  planAllows(STARTER, 'leadScoring'),
  false,
  'Starter NO debe ver la priorización (gate de presentación)',
)

// 4. Org sin plan (fallback virtual) tampoco — mismo trato que Starter.
assert.equal(
  planAllows(PLAN_FALLBACK, 'leadScoring'),
  false,
  'una org sin plan asignado NO debe ver la priorización',
)

// 5. El gate de leadScoring está acoplado a insight (decisión documentada): si
//    un plan tuviera insight ON, ve scoring; si OFF, no. Blinda contra que el
//    mapeo se desincronice silenciosamente.
assert.equal(
  planAllows({ ...STARTER, insightEnabled: true }, 'leadScoring'),
  true,
  'leadScoring sigue a insightEnabled: ON → ve scoring',
)
assert.equal(
  planAllows({ ...PRO, insightEnabled: false }, 'leadScoring'),
  false,
  'leadScoring sigue a insightEnabled: OFF → no ve scoring',
)

// ============================================================
// Eje 2 — buildLeadsCsv: columna de clasificación gateada
// ============================================================

const CLASSIFICATION_HEADER = 'Qué tan listo está'

const sampleLead: LeadForCsv = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+5491122334455',
  intent: 'purchase_ready',
  message: 'Quiero contratar el plan anual',
  capturedAt: new Date('2026-06-29T13:30:00Z'),
  status: 'NEW',
  effectiveClassification: 'hot',
  category: 'sales',
}

function headerLine(csv: string): string {
  // El CSV es BOM + header + CRLF + filas. La primera línea es el header.
  // Ningún header contiene coma → split(',') cuenta columnas de forma segura.
  return csv.replace(/^﻿/, '').split('\r\n')[0]
}

// --- Plan CON priorización (Pro/Business) ---
const csvWith = buildLeadsCsv([sampleLead], { includesDq: false, includeClassification: true })
const headWith = headerLine(csvWith)

// 6. La columna comercial de priorización está presente.
assert.ok(
  headWith.includes(CLASSIFICATION_HEADER),
  'con plan: el header debe incluir la columna de priorización',
)

// 7. El valor de la fila trae la etiqueta legible (no el número crudo).
assert.ok(
  csvWith.includes('Caliente'),
  'con plan: la fila debe traer la etiqueta de clasificación (Caliente)',
)
assert.ok(
  !csvWith.includes('/100') && !csvWith.includes('100'),
  'el CSV nunca expone el score crudo, solo la etiqueta',
)

// --- Plan SIN priorización (Starter / sin plan) ---
const csvWithout = buildLeadsCsv([sampleLead], { includesDq: false, includeClassification: false })
const headWithout = headerLine(csvWithout)

// 8. La columna de priorización desaparece del header.
assert.ok(
  !headWithout.includes(CLASSIFICATION_HEADER),
  'sin plan: el header NO debe incluir la columna de priorización',
)

// 9. La etiqueta de clasificación NO aparece en ninguna fila.
assert.ok(
  !csvWithout.includes('Caliente'),
  'sin plan: la fila NO debe traer clasificación',
)

// 10. El RESTO del CSV queda intacto: datos del contacto, estado y fecha siguen.
//     Starter NO es un plan castigado — ve todos sus contactos completos.
for (const expected of ['Ada Lovelace', 'ada@example.com', '+5491122334455', 'Sin contactar']) {
  assert.ok(
    csvWithout.includes(expected),
    `sin plan: el dato "${expected}" del contacto debe seguir en el CSV`,
  )
}

// 11. Quitar la clasificación retira exactamente UNA columna (ni más, ni menos).
const colsWith = headWith.split(',').length
const colsWithout = headWithout.split(',').length
assert.equal(
  colsWith - colsWithout,
  1,
  'la única diferencia de columnas entre con/sin plan es la de priorización',
)

// --- Modo DQ: no hay columna comercial en ningún caso ---
const dqLead: LeadForCsv = { ...sampleLead, effectiveClassification: 'dq', category: 'spam' }
// Aunque se pase includeClassification:true, el header DQ no tiene priorización.
const csvDq = buildLeadsCsv([dqLead], { includesDq: true, includeClassification: true })
const headDq = headerLine(csvDq)

// 12. El header DQ nunca trae priorización, pero sí "Motivo de descarte".
assert.ok(
  !headDq.includes(CLASSIFICATION_HEADER),
  'modo DQ: nunca hay columna de priorización (los descartados no se clasifican)',
)
assert.ok(
  headDq.includes('Motivo de descarte'),
  'modo DQ: debe traer la columna "Motivo de descarte"',
)

console.log(
  '✓ invariante P0.3 OK: planAllows gatea la priorización (Pro/Business sí, ' +
    'Starter/sin-plan no) y el CSV omite solo la columna de clasificación, ' +
    'dejando intactos los datos del contacto.',
)
