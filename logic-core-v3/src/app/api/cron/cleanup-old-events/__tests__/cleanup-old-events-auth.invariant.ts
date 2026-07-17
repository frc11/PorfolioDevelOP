/**
 * T0.2 — Invariante de auth del cron `cleanup-old-events` (test (a) del ticket:
 * "sin CRON_SECRET válido → rechaza").
 *
 * Cero DB, cero network: solo ejercita el branch de auth de `GET`, que
 * retorna 401 ANTES de tocar `cleanupOldEvents`/Prisma — nunca llega a
 * DB en este archivo. El camino feliz (secret correcto → borra en DB real)
 * se prueba aparte en tests/integration/cleanup-old-events-retention.spec.ts
 * (in-process, sin HTTP, siguiendo el patrón de playwright.integration.config.ts).
 *
 *   npx tsx src/app/api/cron/cleanup-old-events/__tests__/cleanup-old-events-auth.invariant.ts
 *   npm run test:t02
 */
import assert from 'node:assert/strict'
import { GET } from '../route'
import { getProvidedCronSecret } from '../cron-secret'

let passed = 0
function check(label: string, fn: () => void): void {
  fn()
  passed += 1
  console.log(`  ✓ ${label}`)
}

async function checkAsync(label: string, fn: () => Promise<void>): Promise<void> {
  await fn()
  passed += 1
  console.log(`  ✓ ${label}`)
}

const ORIGINAL_SECRET = process.env.CRON_SECRET
function setSecret(value: string | undefined): void {
  if (value === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = value
}

const URL = 'http://localhost/api/cron/cleanup-old-events'
const req = (headers: Record<string, string> = {}): Request => new Request(URL, { headers })

console.log('T0.2 — cleanup-old-events-auth.invariant')

async function main(): Promise<void> {
  // ── GET(): rama de auth, siempre 401 antes de tocar cleanupOldEvents ──────

  await checkAsync('sin CRON_SECRET seteada + sin headers → 401 (falla cerrado)', async () => {
    setSecret(undefined)
    const res = await GET(req())
    assert.equal(res.status, 401)
    const body = await res.json()
    assert.equal(body.ok, false)
  })

  await checkAsync(
    'sin CRON_SECRET seteada + "Authorization: Bearer undefined" literal → 401 (el caso exacto que pide el ticket: nunca autenticar contra secret vacío)',
    async () => {
      setSecret(undefined)
      const res = await GET(req({ Authorization: 'Bearer undefined' }))
      assert.equal(res.status, 401)
    },
  )

  await checkAsync('CRON_SECRET seteada + sin headers → 401', async () => {
    setSecret('real-secret-t02')
    const res = await GET(req())
    assert.equal(res.status, 401)
  })

  await checkAsync('CRON_SECRET seteada + secret incorrecto (Authorization) → 401', async () => {
    setSecret('real-secret-t02')
    const res = await GET(req({ Authorization: 'Bearer wrong-secret' }))
    assert.equal(res.status, 401)
  })

  await checkAsync('CRON_SECRET seteada + secret incorrecto (X-Cron-Secret) → 401', async () => {
    setSecret('real-secret-t02')
    const res = await GET(req({ 'X-Cron-Secret': 'wrong-secret' }))
    assert.equal(res.status, 401)
  })

  // ── getProvidedCronSecret(): extracción pura, prueba que el secret CORRECTO
  //    matchearía (sin invocar el camino feliz completo — eso toca DB real) ──

  check('Authorization: Bearer <secret> → extrae el secret exacto', () => {
    const extracted = getProvidedCronSecret(req({ Authorization: 'Bearer abc123' }))
    assert.equal(extracted, 'abc123')
  })

  check('X-Cron-Secret (sin Authorization) → fallback funciona', () => {
    const extracted = getProvidedCronSecret(req({ 'X-Cron-Secret': 'abc123' }))
    assert.equal(extracted, 'abc123')
  })

  check('Authorization con esquema distinto de Bearer → cae a X-Cron-Secret, no lo mezcla', () => {
    const extracted = getProvidedCronSecret(
      req({ Authorization: 'Basic abc123', 'X-Cron-Secret': 'real-one' }),
    )
    assert.equal(extracted, 'real-one')
  })

  check('sin headers → null', () => {
    const extracted = getProvidedCronSecret(req())
    assert.equal(extracted, null)
  })

  check('espacios alrededor del secret se trimean (Authorization y CRON_SECRET)', () => {
    setSecret('  padded-secret  ')
    const extracted = getProvidedCronSecret(req({ Authorization: 'Bearer padded-secret' }))
    assert.equal(extracted, 'padded-secret')
    assert.equal(process.env.CRON_SECRET?.trim(), 'padded-secret')
  })

  setSecret(ORIGINAL_SECRET)

  console.log(`\n[T0.2 invariant] ✓ ${passed} aserciones OK — auth del cron falla cerrado sin secret, nunca autentica "Bearer undefined".`)
}

main().catch((err) => {
  setSecret(ORIGINAL_SECRET)
  console.error(err)
  process.exit(1)
})
