/**
 * EV.5 — Invariante de superset v1 ⊂ v2 del payload de n8n.
 *
 *   npx tsx src/modules/chatbot/server/verticals/__tests__/ev5.superset.invariant.ts
 *   npm run test:ev5
 *
 * Verifica:
 *   1. Todos los campos del contrato v1 existen en el payload v2 con el mismo
 *      tipo/shape. Un workflow n8n que hoy lee v1 no se rompe con v2.
 *   2. Los campos nuevos de v2 existen: _version="2.0", verticalPack, signalsV2.
 *   3. signalsV2=null para un lead sin signals (legacy pre-EV.3).
 *   4. signalsV2 tiene la forma {key: {value, points}} para leads con signals.
 *
 * Cero DB, cero network. Usa tipos de Prisma solo para compatibilidad
 * estructural — no hay query real.
 */

import assert from 'node:assert/strict'
import { buildLeadPayload } from '../../crm/buildLeadPayload'

// ─── Lead de ejemplo con signals (post-EV.3, dual-write activo) ───────────────

const SAMPLE_SIGNALS = {
  requestedAppointment: { value: true, points: 40 },
  askedSpecificModel: { value: true, points: 10 },
  mentionedFinancing: { value: false, points: 0 },
  mentionedTradeIn: { value: false, points: 0 },
  providedPhone: { value: true, points: 5 },
  providedEmail: { value: false, points: 0 },
}

const SAMPLE_LEAD = {
  id: 'ev5-test-lead-id',
  name: 'Franco G.',
  email: 'franco@example.com',
  phone: '+54 9 381 555 1234',
  intent: 'PURCHASE_READY' as const,
  message: 'Quiere el Corolla XEi',
  classification: 'hot' as const,
  category: 'sales' as const,
  requestedAppointment: true,
  mentionedFinancing: false,
  mentionedTradeIn: false,
  askedSpecificModel: true,
  channel: 'web',
  capturedAt: new Date('2026-06-30T12:00:00Z'),
  signals: SAMPLE_SIGNALS,
}

const SAMPLE_ORG = { id: 'org-id-ev5', slug: 'ev5-test-org' }

// ─── 1. Contrato v1 (campos que existían antes de EV.5) ──────────────────────

// Lista de campos del contrato v1 (snapshot congelado).
const V1_FIELDS = [
  '_version',
  'leadId',
  'capturedAt',
  'organization',
  'contact',
  'intent',
  'message',
  'classification',
  'category',
  'signals',
  'channel',
] as const

// Build del payload v2 con pack usados.
const payloadV2 = buildLeadPayload(SAMPLE_LEAD as Parameters<typeof buildLeadPayload>[0], SAMPLE_ORG, 'usados')

// Superset: cada campo v1 existe en v2.
for (const field of V1_FIELDS) {
  assert.ok(
    Object.prototype.hasOwnProperty.call(payloadV2, field),
    `superset: campo v1 "${field}" debe existir en payload v2`,
  )
}

// Tipos/shapes de campos v1 (spot checks críticos).
assert.strictEqual(typeof payloadV2.leadId, 'string', 'v1: leadId debe ser string')
assert.strictEqual(typeof payloadV2.capturedAt, 'string', 'v1: capturedAt debe ser ISO string')
assert.ok(payloadV2.capturedAt.includes('T'), 'v1: capturedAt debe ser ISO 8601')
assert.strictEqual(typeof payloadV2.organization.id, 'string', 'v1: organization.id string')
assert.strictEqual(typeof payloadV2.organization.slug, 'string', 'v1: organization.slug string')
assert.ok(payloadV2.contact !== null && typeof payloadV2.contact === 'object', 'v1: contact objeto')
assert.ok('requestedAppointment' in payloadV2.signals, 'v1: signals.requestedAppointment')
assert.ok('mentionedFinancing' in payloadV2.signals, 'v1: signals.mentionedFinancing')
assert.ok('mentionedTradeIn' in payloadV2.signals, 'v1: signals.mentionedTradeIn')
assert.ok('askedSpecificModel' in payloadV2.signals, 'v1: signals.askedSpecificModel')
assert.strictEqual(typeof payloadV2.signals.requestedAppointment, 'boolean', 'v1: señales son boolean')

// Valores concretos (regresión).
assert.strictEqual(payloadV2.leadId, SAMPLE_LEAD.id)
assert.strictEqual(payloadV2.organization.id, SAMPLE_ORG.id)
assert.strictEqual(payloadV2.organization.slug, SAMPLE_ORG.slug)
assert.strictEqual(payloadV2.contact.name, SAMPLE_LEAD.name)
assert.strictEqual(payloadV2.contact.email, SAMPLE_LEAD.email)
assert.strictEqual(payloadV2.contact.phone, SAMPLE_LEAD.phone)
assert.strictEqual(payloadV2.signals.requestedAppointment, SAMPLE_LEAD.requestedAppointment)
assert.strictEqual(payloadV2.signals.mentionedFinancing, SAMPLE_LEAD.mentionedFinancing)
assert.strictEqual(payloadV2.channel, SAMPLE_LEAD.channel)

// ─── 2. Campos nuevos v2 ─────────────────────────────────────────────────────

assert.strictEqual(payloadV2._version, '2.0', 'v2: _version bumpeado a "2.0"')
assert.ok('verticalPack' in payloadV2, 'v2: verticalPack campo nuevo existe')
assert.strictEqual(payloadV2.verticalPack, 'usados', 'v2: verticalPack refleja el argumento')
assert.ok('signalsV2' in payloadV2, 'v2: signalsV2 campo nuevo existe')
assert.ok(payloadV2.signalsV2 !== undefined, 'v2: signalsV2 no es undefined')

// signalsV2 tiene la forma correcta (key → {value, points}).
assert.ok(payloadV2.signalsV2 !== null, 'v2: signalsV2 no null cuando el lead tiene signals')
const sv2 = payloadV2.signalsV2!
assert.ok('requestedAppointment' in sv2, 'signalsV2: clave requestedAppointment')
assert.strictEqual(typeof sv2.requestedAppointment.value, 'boolean', 'signalsV2: value boolean')
assert.strictEqual(typeof sv2.requestedAppointment.points, 'number', 'signalsV2: points number')
assert.strictEqual(sv2.requestedAppointment.value, true)
assert.strictEqual(sv2.requestedAppointment.points, 40)

// ─── 3. signalsV2 = null para leads legacy (sin signals en DB) ───────────────

const legacyLead = { ...SAMPLE_LEAD, signals: null }
const legacyPayload = buildLeadPayload(legacyLead as Parameters<typeof buildLeadPayload>[0], SAMPLE_ORG, 'base')

assert.strictEqual(legacyPayload._version, '2.0', 'legacy: _version sigue siendo v2')
assert.strictEqual(legacyPayload.verticalPack, 'base', 'legacy: verticalPack = base')
assert.strictEqual(legacyPayload.signalsV2, null, 'legacy: signalsV2 = null (lead pre-EV.3)')
// Retro-compat: señales v1 siguen siendo booleanos incluso en legacy.
assert.strictEqual(typeof legacyPayload.signals.requestedAppointment, 'boolean', 'legacy: signals v1 intactos')

// ─── 4. verticalPack default 'base' cuando no se pasa ────────────────────────

const defaultPayload = buildLeadPayload(SAMPLE_LEAD as Parameters<typeof buildLeadPayload>[0], SAMPLE_ORG)
assert.strictEqual(defaultPayload.verticalPack, 'base', 'default: sin argumento → base')

// ─── Reporte ──────────────────────────────────────────────────────────────────

console.log(
  `[EV.5 superset] ✓ ${V1_FIELDS.length} campos v1 presentes en v2 (superset OK); ` +
    'v2 agrega _version="2.0", verticalPack, signalsV2; ' +
    'signalsV2=null para leads legacy; default verticalPack="base". ' +
    'Todas las aserciones pasaron.',
)
