/**
 * UTM.1 — Invariantes de sanitización de atribución (UTM + referrer).
 *
 *   npx tsx src/modules/chatbot/server/chat/__tests__/utm-attribution.invariant.ts
 *   npm run test:utm1
 *
 * Cero DB, cero network. Verifica:
 *   1. requestBodySchema acepta UTMs válidos verbatim.
 *   2. Un utm_source de 300 chars recorta a 255.
 *   3. Caracteres de control se limpian (no rechazan la request).
 *   4. Un valor que es SOLO caracteres de control colapsa a undefined (nunca "").
 *   5. Un body sin ninguna key de atribución (utm_* o referrer) sigue parseando OK, campos undefined.
 *   6. parseAttribution extrae utm_source/utm_medium/utm_campaign + referrer
 *      desde una URL cruda, y normaliza referrer vacío a null.
 */

import assert from 'node:assert/strict'
import { requestBodySchema } from '../handleChatRequest'
import { parseAttribution, sanitizeAttributionField, EMPTY_ATTRIBUTION } from '../../../shared/attribution'

const baseBody = {
  messages: [{ role: 'user' as const, content: 'hola' }],
  sessionId: 'session-utm1-test',
}

// ─── 1. UTMs válidos se aceptan verbatim ───────────────────────────────────

const validParsed = requestBodySchema.parse({
  ...baseBody,
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'lanzamiento_q3',
  referrer: 'https://google.com/search',
})
assert.equal(validParsed.utmSource, 'google', 'utmSource válido pasa verbatim')
assert.equal(validParsed.utmMedium, 'cpc', 'utmMedium válido pasa verbatim')
assert.equal(validParsed.utmCampaign, 'lanzamiento_q3', 'utmCampaign válido pasa verbatim')
assert.equal(validParsed.referrer, 'https://google.com/search', 'referrer válido pasa verbatim')

// ─── 2. >255 chars recorta a 255 (UTM), >500 recorta a 500 (referrer) ─────

const longUtm = 'a'.repeat(300)
const longParsed = requestBodySchema.parse({ ...baseBody, utmSource: longUtm })
assert.equal(longParsed.utmSource?.length, 255, 'utmSource de 300 chars recorta a 255')

const longReferrer = 'b'.repeat(600)
const longReferrerParsed = requestBodySchema.parse({ ...baseBody, referrer: longReferrer })
assert.equal(longReferrerParsed.referrer?.length, 500, 'referrer de 600 chars recorta a 500')

// ─── 3. Caracteres de control se limpian, la request NO se rechaza ────────

const withControlChars = `google${String.fromCharCode(0)}${String.fromCharCode(27)}ads`
const cleanedParsed = requestBodySchema.parse({ ...baseBody, utmSource: withControlChars })
assert.equal(cleanedParsed.utmSource, 'googleads', 'control chars se stripean del utmSource')

const referrerWithControlChars = `https://x.com/${String.fromCharCode(1)}path`
const cleanedReferrerParsed = requestBodySchema.parse({ ...baseBody, referrer: referrerWithControlChars })
assert.equal(
  cleanedReferrerParsed.referrer,
  'https://x.com/path',
  'control chars se stripean también del referrer (mismo tratamiento que UTMs)',
)

// ─── 4. Solo caracteres de control → undefined, nunca "" ──────────────────

const onlyControlChars = `${String.fromCharCode(0)}${String.fromCharCode(31)}${String.fromCharCode(127)}`
const emptyAfterCleanParsed = requestBodySchema.parse({ ...baseBody, utmCampaign: onlyControlChars })
assert.equal(
  emptyAfterCleanParsed.utmCampaign,
  undefined,
  'un valor que es solo control chars colapsa a undefined, no a string vacío',
)
assert.notEqual(emptyAfterCleanParsed.utmCampaign, '', 'nunca persiste string vacío')

// ─── 5. Request sin ninguna key utm*/referrer sigue siendo válido ─────────

const noAttributionParsed = requestBodySchema.parse({ ...baseBody })
assert.equal(noAttributionParsed.utmSource, undefined, 'sin utmSource en el body, queda undefined')
assert.equal(noAttributionParsed.utmMedium, undefined, 'sin utmMedium en el body, queda undefined')
assert.equal(noAttributionParsed.utmCampaign, undefined, 'sin utmCampaign en el body, queda undefined')
assert.equal(noAttributionParsed.referrer, undefined, 'sin referrer en el body, queda undefined')

// null explícito (no solo ausente) también resuelve a undefined, no lanza
const explicitNullParsed = requestBodySchema.parse({ ...baseBody, utmSource: null, referrer: null })
assert.equal(explicitNullParsed.utmSource, undefined, 'utmSource: null también resuelve a undefined')
assert.equal(explicitNullParsed.referrer, undefined, 'referrer: null también resuelve a undefined')

// ─── 6. parseAttribution — extracción desde una URL cruda ─────────────────

const parsed = parseAttribution(
  'https://cliente.com/promos?utm_source=meta&utm_medium=paid_social&utm_campaign=verano',
  'https://facebook.com/',
)
assert.equal(parsed.utmSource, 'meta')
assert.equal(parsed.utmMedium, 'paid_social')
assert.equal(parsed.utmCampaign, 'verano')
assert.equal(parsed.referrer, 'https://facebook.com/')

const directTraffic = parseAttribution('https://cliente.com/', '')
assert.deepEqual(directTraffic, EMPTY_ATTRIBUTION, 'sin UTMs ni referrer, todo null (tráfico directo)')

const malformedUrl = parseAttribution('esto-no-es-una-url', null)
assert.deepEqual(malformedUrl, EMPTY_ATTRIBUTION, 'URL malformada no lanza, resuelve a EMPTY_ATTRIBUTION')

// sanitizeAttributionField en aislamiento — casos límite de longitud exacta
assert.equal(sanitizeAttributionField('  google  ', 255), 'google', 'trim de espacios')
assert.equal(sanitizeAttributionField('a'.repeat(255), 255), 'a'.repeat(255), 'exactamente 255 no se toca')
assert.equal(sanitizeAttributionField('a'.repeat(256), 255), 'a'.repeat(255), '256 recorta a 255')

console.log(
  '[UTM.1 invariant] ✓ Todas las aserciones de sanitización de atribución pasaron ' +
  '(requestBodySchema + parseAttribution + sanitizeAttributionField).',
)
