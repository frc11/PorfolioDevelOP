/**
 * Invariante P2.A — corre SIN DB ni server:
 *
 *   npm run check:invariant:client-notifications
 *   (o: npx tsx src/lib/client-notifications/client-notifications.invariant.ts)
 *
 * Prueba, de forma ejecutable, las decisiones puras del aviso de lead al
 * cliente: (1) a quién/con qué template se avisa según plan, (2) el cap
 * anti-spam → digest, (3) el aislamiento multi-tenant del conteo del digest, y
 * (4) que el lenguaje de clasificación ("caliente") aparece SOLO en Pro+.
 *
 * Importa solo módulos puros (decide.ts + templates.ts) — cero Prisma, cero
 * Brevo, cero request context.
 */
import assert from 'node:assert/strict'
import {
  decideLeadNotification,
  resolveDelivery,
  digestCountWhere,
} from './decide'
import { leadEmailSubject, renderLeadEmail, intentLabel } from './templates'

// ============================================================
// 1. Decisión de avisar + template + bypass del cap
// ============================================================

// dq (spam/empleo/proveedor) → NO se avisa, en cualquier plan.
assert.deepEqual(
  decideLeadNotification({ classification: 'dq', hasLeadScoring: true }),
  { notify: false, reason: 'disqualified' },
  'dq en Pro no debe avisar',
)
assert.deepEqual(
  decideLeadNotification({ classification: 'dq', hasLeadScoring: false }),
  { notify: false, reason: 'disqualified' },
  'dq en Starter no debe avisar',
)

// hot + plan con clasificación (Pro/Business) → destacado y saltea el cap.
assert.deepEqual(
  decideLeadNotification({ classification: 'hot', hasLeadScoring: true }),
  { notify: true, template: 'hot', bypassCap: true },
  'hot en Pro debe avisar destacado y saltear el cap',
)

// hot en Starter (sin clasificación) → aviso NORMAL, sujeto al cap, sin
// lenguaje de "caliente". Es el gate por plan: la clasificación es de Pro+.
assert.deepEqual(
  decideLeadNotification({ classification: 'hot', hasLeadScoring: false }),
  { notify: true, template: 'normal', bypassCap: false },
  'hot en Starter debe caer a normal (sin lenguaje de clasificación)',
)

// warm/cold → siempre normal, con o sin plan.
for (const classification of ['warm', 'cold'] as const) {
  for (const hasLeadScoring of [true, false]) {
    assert.deepEqual(
      decideLeadNotification({ classification, hasLeadScoring }),
      { notify: true, template: 'normal', bypassCap: false },
      `${classification} (leadScoring=${hasLeadScoring}) debe ser normal sin bypass`,
    )
  }
}

// ============================================================
// 2. Cap anti-spam → digest
// ============================================================

// Caliente en Pro+: siempre individual, aunque el cap esté agotado.
assert.equal(
  resolveDelivery({ bypassCap: true, capAllowed: false, digestAllowed: false }),
  'individual',
  'un caliente en Pro+ siempre avisa (ignora el cap)',
)

// Normal con cupo → individual.
assert.equal(
  resolveDelivery({ bypassCap: false, capAllowed: true, digestAllowed: false }),
  'individual',
  'normal con cupo del cap → individual',
)

// Normal sin cupo pero con cupo de digest → digest (agrupa, no silencia).
assert.equal(
  resolveDelivery({ bypassCap: false, capAllowed: false, digestAllowed: true }),
  'digest',
  'normal superado el cap → digest',
)

// Normal sin cupo de cap ni de digest → suppress (ya se digesteó esta hora).
assert.equal(
  resolveDelivery({ bypassCap: false, capAllowed: false, digestAllowed: false }),
  'suppress',
  'superado cap y digest → suppress (no spamear)',
)

// ============================================================
// 3. Aislamiento multi-tenant del conteo del digest
// ============================================================
const since = new Date('2026-07-01T12:00:00.000Z')
const whereA = digestCountWhere('org_A', since)
const whereB = digestCountWhere('org_B', since)

assert.equal(
  whereA.botConfig.organizationId,
  'org_A',
  'el conteo del digest ancla en la org propia',
)
assert.notEqual(
  whereA.botConfig.organizationId,
  whereB.botConfig.organizationId,
  'org A y org B producen filtros distintos → org A nunca cuenta leads de org B',
)
assert.equal(whereA.NOT.classification, 'dq', 'el digest excluye leads dq')
assert.equal(whereA.capturedAt.gte, since, 'el digest cuenta solo la ventana reciente')

// ============================================================
// 4. Lenguaje de clasificación SOLO en el template caliente (Pro+)
// ============================================================
const subjectHot = leadEmailSubject('hot', { leadName: 'Juan', intent: 'purchase_ready' })
const subjectNormal = leadEmailSubject('normal', { leadName: 'Juan', intent: 'purchase_ready' })

assert.ok(subjectHot.includes('Lead caliente'), 'el asunto caliente usa "Lead caliente"')
assert.ok(subjectHot.includes('Juan'), 'el asunto caliente incluye el nombre')
assert.ok(
  !/caliente/i.test(subjectNormal),
  'el asunto normal NO usa lenguaje de clasificación',
)
assert.ok(subjectNormal.includes('Nuevo interesado'), 'el asunto normal dice "Nuevo interesado"')
assert.ok(subjectNormal.includes('Juan'), 'el asunto normal incluye el nombre')

// Etiqueta de intent en lenguaje de dueño (sin jerga).
assert.equal(intentLabel('purchase_ready'), 'quiere comprar', 'intentLabel purchase_ready')
assert.equal(intentLabel('desconocido'), 'dejó una consulta', 'intentLabel fallback')

// Cuerpo: el caliente lleva el banner de urgencia; el normal no. Ambos linkean
// al lead. Fecha fija para no depender del reloj.
const baseData = {
  organizationName: 'Concesionaria Sur',
  botName: 'Lucía',
  leadName: 'Juan',
  email: 'juan@example.com',
  phone: '+54 9 11 5555 5555',
  intent: 'purchase_ready',
  message: 'Pregunta por el Corolla y financiación.',
  capturedAt: since,
  leadUrl: 'https://app.develop.com.ar/dashboard/chatbot/leads/lead_123',
}
const htmlHot = renderLeadEmail('hot', baseData)
const htmlNormal = renderLeadEmail('normal', baseData)

assert.ok(htmlHot.includes('multiplica'), 'el cuerpo caliente incluye el banner de urgencia')
assert.ok(!htmlNormal.includes('multiplica'), 'el cuerpo normal NO incluye banner de urgencia')
assert.ok(
  htmlHot.includes(baseData.leadUrl) && htmlNormal.includes(baseData.leadUrl),
  'ambos cuerpos linkean directo al lead en el panel',
)
assert.ok(
  htmlNormal.includes('juan@example.com') && htmlNormal.includes('+54 9 11 5555 5555'),
  'el cuerpo incluye los datos de contacto factuales',
)

console.log(
  '✓ invariante P2.A OK: gate por plan (caliente solo Pro+), cap → digest, ' +
    'aislamiento multi-tenant del digest y lenguaje de clasificación acotado al template caliente.',
)
