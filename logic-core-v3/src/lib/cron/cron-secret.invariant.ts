/**
 * H.2 — Invariante de `isAuthorizedCronRequest` / `getProvidedCronSecret`
 * (`./cron-secret.ts`). Cero DB, cero red, cero HTTP: ejercita las dos
 * funciones puras directamente.
 *
 *   npx tsx src/lib/cron/cron-secret.invariant.ts
 *   npm run check:invariant:cron-secret
 *
 * El caso central es el que motivó el sprint: sin `CRON_SECRET` seteada, la
 * request NUNCA se autentica — ni siquiera mandando el literal
 * "Authorization: Bearer undefined", que era el agujero real de
 * generate-insights/send-weekly-reports/detect-bot-issues antes de H.2.
 *
 * El detalle fino de extracción de headers (trimming, fallback entre
 * Authorization/X-Cron-Secret, esquemas distintos de Bearer) ya lo cubre
 * `app/api/cron/cleanup-old-events/__tests__/cleanup-old-events-auth.invariant.ts`
 * contra `getProvidedCronSecret` — acá solo un sanity mínimo de esa función,
 * el foco es `isAuthorizedCronRequest`.
 */
import assert from 'node:assert/strict'
import { getProvidedCronSecret, isAuthorizedCronRequest } from './cron-secret'

let passed = 0
function check(label: string, fn: () => void): void {
  fn()
  passed += 1
  console.log(`  ✓ ${label}`)
}

const ORIGINAL_SECRET = process.env.CRON_SECRET
function setSecret(value: string | undefined): void {
  if (value === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = value
}

const URL = 'http://localhost/api/cron/whatever'
const req = (headers: Record<string, string> = {}): Request => new Request(URL, { headers })

console.log('H.2 — cron-secret.invariant')

// ── isAuthorizedCronRequest: los 3 casos que pide el sprint ────────────────

check('sin CRON_SECRET seteada → rechaza, aunque no mande ningún header', () => {
  setSecret(undefined)
  assert.equal(isAuthorizedCronRequest(req()), false)
})

check(
  'sin CRON_SECRET seteada → rechaza el literal "Authorization: Bearer undefined" (el agujero real)',
  () => {
    setSecret(undefined)
    assert.equal(isAuthorizedCronRequest(req({ Authorization: 'Bearer undefined' })), false)
  },
)

check('CRON_SECRET seteada + token correcto (Authorization: Bearer) → acepta', () => {
  setSecret('real-secret')
  assert.equal(isAuthorizedCronRequest(req({ Authorization: 'Bearer real-secret' })), true)
})

check('CRON_SECRET seteada + token correcto (X-Cron-Secret) → acepta', () => {
  setSecret('real-secret')
  assert.equal(isAuthorizedCronRequest(req({ 'X-Cron-Secret': 'real-secret' })), true)
})

check('CRON_SECRET seteada + token incorrecto → rechaza', () => {
  setSecret('real-secret')
  assert.equal(isAuthorizedCronRequest(req({ Authorization: 'Bearer wrong' })), false)
})

check('CRON_SECRET seteada + sin ningún header → rechaza', () => {
  setSecret('real-secret')
  assert.equal(isAuthorizedCronRequest(req()), false)
})

// ── getProvidedCronSecret: sanity mínimo de la extracción ──────────────────

check('getProvidedCronSecret extrae el token del header Authorization', () => {
  assert.equal(getProvidedCronSecret(req({ Authorization: 'Bearer abc123' })), 'abc123')
})

check('getProvidedCronSecret cae a X-Cron-Secret si no hay Authorization Bearer', () => {
  assert.equal(getProvidedCronSecret(req({ 'X-Cron-Secret': 'abc123' })), 'abc123')
})

setSecret(ORIGINAL_SECRET)

console.log(
  `\n[H.2 invariant] ✓ ${passed} aserciones OK — isAuthorizedCronRequest falla cerrado sin ` +
  'CRON_SECRET, nunca autentica "Bearer undefined", acepta con el token correcto por ' +
  'cualquiera de los 2 headers, rechaza con token incorrecto o sin header.',
)
