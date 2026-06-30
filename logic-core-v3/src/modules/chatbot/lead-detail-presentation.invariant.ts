/**
 * Invariante del detalle del lead (P1.D) — sin DB.
 *
 *   npm run check:invariant:lead-detail
 *
 * Cubre: traducción de las 6 señales (solo positivas, lenguaje de dueño, nunca
 * campo crudo), etiqueta de categoría, etiqueta de canal (desconocido → null),
 * duración de charla (bordes), y el gate de la sección de señales por plan.
 * Incluye el caso de lead MÍNIMO (todo en false/null) → no rompe, devuelve vacío.
 */
import assert from 'node:assert/strict'
import {
  collectInterestSignals,
  shouldShowInterestSignals,
  categoryLabel,
  channelLabel,
  formatChatDuration,
  type InterestSignalSource,
} from './lead-detail-presentation.ts'

const NONE: InterestSignalSource = {
  providedPhone: false,
  providedEmail: false,
  requestedAppointment: false,
  askedSpecificModel: false,
  mentionedFinancing: false,
  mentionedTradeIn: false,
}

// ── 1. Señales: lead completo vs mínimo ───────────────────────────────────────
{
  const all = collectInterestSignals({
    providedPhone: true,
    providedEmail: true,
    requestedAppointment: true,
    askedSpecificModel: true,
    mentionedFinancing: true,
    mentionedTradeIn: true,
  })
  assert.equal(all.length, 6, 'todas las señales true → 6 frases')
  // Orden de prioridad de lectura: la cita primero, los contactos al final.
  assert.equal(all[0], 'Pidió una cita', 'la más caliente va primera')
  assert.ok(all.every((s) => !/provided|mentioned|requested|asked/i.test(s)), 'nunca se filtra el nombre de campo crudo')

  // Lead mínimo (todo false) → no rompe, lista vacía.
  assert.deepEqual(collectInterestSignals(NONE), [], 'sin señales → []')

  // Parcial → solo las positivas.
  const partial = collectInterestSignals({ ...NONE, providedPhone: true, mentionedFinancing: true })
  assert.deepEqual(partial, ['Preguntó por financiación', 'Dejó su teléfono'], 'solo las true, en orden')
}

// ── 2. Categoría ──────────────────────────────────────────────────────────────
{
  assert.equal(categoryLabel('sales'), 'Venta')
  assert.equal(categoryLabel('postventa'), 'Posventa')
  assert.equal(categoryLabel('employment'), 'Búsqueda de empleo')
  assert.equal(categoryLabel('provider'), 'Proveedor')
  assert.equal(categoryLabel('spam'), 'Spam')
  assert.equal(categoryLabel('other'), 'Otra consulta')
}

// ── 3. Canal: conocido → label; desconocido/null → null (no se muestra crudo) ─
{
  assert.equal(channelLabel('widget'), 'Widget web')
  assert.equal(channelLabel('WhatsApp_inbound'), 'WhatsApp', 'case-insensitive')
  assert.equal(channelLabel('instagram'), 'Instagram')
  assert.equal(channelLabel('algo_raro'), null, 'desconocido → null (no crudo)')
  assert.equal(channelLabel(null), null, 'null → null')
}

// ── 4. Duración de charla ─────────────────────────────────────────────────────
{
  const t = (min: number) => new Date(Date.UTC(2026, 5, 10, 12, 0, 0) + min * 60_000)
  assert.equal(formatChatDuration(t(0), t(4)), '4 minutos')
  assert.equal(formatChatDuration(t(0), t(1)), '1 minuto', 'singular')
  assert.equal(formatChatDuration(t(0), t(0)), 'menos de un minuto', 'mismo instante')
  assert.equal(formatChatDuration(t(0), t(120)), '2 horas')
  assert.equal(formatChatDuration(t(10), t(0)), null, 'negativo → null (no se inventa)')
}

// ── 5. Gate de la sección de señales por plan ─────────────────────────────────
{
  const sigs = ['Dejó su teléfono']
  assert.equal(shouldShowInterestSignals(true, false, sigs), true, 'Pro+ no-DQ con señales → muestra')
  assert.equal(shouldShowInterestSignals(false, false, sigs), false, 'sin plan (Starter) → oculta')
  assert.equal(shouldShowInterestSignals(true, true, sigs), false, 'DQ → oculta aunque haya plan')
  assert.equal(shouldShowInterestSignals(true, false, []), false, 'sin señales → oculta')
}

console.log('✓ lead-detail-presentation invariants OK')
