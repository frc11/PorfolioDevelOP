/**
 * P5.5 — Invariante del sistema de referidos. Corre SIN DB ni server:
 *
 *   npm run check:invariant:referrals
 *   (o: npx tsx src/lib/referrals/referrals.invariant.ts)
 *
 * Verifica, de forma ejecutable, las garantías del sprint:
 *   1. GENERACIÓN: el código se normaliza y se arma de forma determinista; el link es correcto.
 *   2. ATRIBUCIÓN: un referido externo válido se atribuye (gatea el create + aviso a develOP).
 *   3. ANTI-ABUSO: auto-referido, código inexistente, cliente existente y duplicado se rechazan.
 *
 * Importa solo los módulos puros (code + attribution). El org-scoping de la lectura y el
 * disparo real del aviso viven en referrals.service.ts (data layer), sobre estas guardas.
 */
import assert from 'node:assert/strict'
import {
  buildReferralLink,
  generateReferralCodeCandidate,
  normalizeReferralCode,
} from './code.ts'
import { decideReferralAttribution, type AttributionContext } from './attribution.ts'

// ── 1. GENERACIÓN: normalización + forma del código + link ────────────────────
{
  assert.equal(normalizeReferralCode('  cafe-libertad '), 'CAFELIBERTAD', 'normaliza a A-Z0-9 mayúsculas')
  assert.equal(normalizeReferralCode('ab_12!x'), 'AB12X', 'quita separadores y símbolos')
  assert.equal(normalizeReferralCode(normalizeReferralCode('Café 1')), normalizeReferralCode('Café 1'), 'idempotente')

  // Prefijo legible (≤6 del nombre) + sufijo, determinista dado el sufijo. Los acentos
  // se descartan (código ASCII): "Café" → "CAF".
  assert.equal(generateReferralCodeCandidate('Cafe Libertad', 'a1b2c3'), 'CAFELIA1B2C3', 'prefijo 6 + sufijo')
  assert.equal(generateReferralCodeCandidate('Café', 'x'), 'CAFX', 'acentos descartados (ASCII)')
  assert.equal(generateReferralCodeCandidate('', 'a1b2c3'), 'DEVOPA1B2C3', 'sin nombre → prefijo fallback')
  assert.equal(
    generateReferralCodeCandidate('X', 'zz'),
    generateReferralCodeCandidate('X', 'zz'),
    'determinista dado el mismo sufijo',
  )

  assert.equal(
    buildReferralLink('https://develop.com.ar/', 'CAFELI7K29'),
    'https://develop.com.ar/contact?ref=CAFELI7K29',
    'link con ?ref y sin doble barra',
  )
}

// ── 2. ATRIBUCIÓN válida: referido externo → attribute (gatea create + aviso) ─
{
  const base: AttributionContext = {
    referrerFound: true,
    referredEmail: 'nuevo@negocio.com',
    referrerMemberEmails: ['dueno@cafelibertad.com'],
    referredIsExistingCustomer: false,
    alreadyReferred: false,
  }
  assert.deepEqual(decideReferralAttribution(base), { attribute: true }, 'referido externo limpio → se atribuye')
}

// ── 3. ANTI-ABUSO: cada guarda rechaza con su razón ───────────────────────────
{
  const ctx = (over: Partial<AttributionContext>): AttributionContext => ({
    referrerFound: true,
    referredEmail: 'nuevo@negocio.com',
    referrerMemberEmails: ['dueno@cafelibertad.com'],
    referredIsExistingCustomer: false,
    alreadyReferred: false,
    ...over,
  })

  // Código inexistente → no atribuye (bloquea códigos falsos).
  assert.deepEqual(
    decideReferralAttribution(ctx({ referrerFound: false })),
    { attribute: false, reason: 'unknown_code' },
    'código inexistente → unknown_code',
  )

  // 🔴 Auto-referido: el email referido es de un miembro de la propia org (case-insensitive).
  assert.deepEqual(
    decideReferralAttribution(ctx({ referredEmail: 'DUENO@CafeLibertad.com' })),
    { attribute: false, reason: 'self_referral' },
    'auto-referido (mismo email, distinta caja) → self_referral',
  )

  // El referido ya es cliente → no es negocio nuevo.
  assert.deepEqual(
    decideReferralAttribution(ctx({ referredIsExistingCustomer: true })),
    { attribute: false, reason: 'existing_customer' },
    'email ya cliente → existing_customer',
  )

  // Ya referido por esta org → no duplica.
  assert.deepEqual(
    decideReferralAttribution(ctx({ alreadyReferred: true })),
    { attribute: false, reason: 'duplicate' },
    'ya referido → duplicate',
  )

  // Prioridad: self_referral gana sobre existing_customer/duplicate.
  assert.deepEqual(
    decideReferralAttribution(
      ctx({ referredEmail: 'dueno@cafelibertad.com', referredIsExistingCustomer: true, alreadyReferred: true }),
    ),
    { attribute: false, reason: 'self_referral' },
    'self_referral tiene prioridad',
  )
}

console.log(
  '✓ referrals invariants OK: generación determinista + link, atribución de referido externo, ' +
    'y anti-abuso (auto-referido, código falso, cliente existente, duplicado) rechazados.',
)
