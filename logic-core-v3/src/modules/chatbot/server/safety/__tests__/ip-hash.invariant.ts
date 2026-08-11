/**
 * PRIVACIDAD — Invariante del hash de IP (S7-03 / unificación de esquemas).
 *
 * Pinnea el contrato que docs/env-vars.md y docs/operations/00-entornos.md
 * prometen desde antes de este sprint:
 *
 *   1. En producción SIN CHATBOT_IP_HASH_SALT, `hashIp` ABORTA (throw):
 *      nunca hashea con el salt hardcodeado público del repo.
 *   2. Con salt, devuelve 16 hex determinísticos y el salt PARTICIPA
 *      (salt distinto → hash distinto; el fallback público no colisiona).
 *   3. En development sin salt sigue funcionando (fallback declarado).
 *   4. La extracción de IP es UNA sola (`extractClientIp`, fallback
 *      'unknown') y el route del chat usa `hashIp` — no un segundo esquema
 *      inline sin salt (el bug que motivó el sprint: dos hashes divergentes).
 *
 * Cero DB, cero network. Corre con:  npm run test:iphash   (npx tsx …)
 * El pin del route lee el fuente desde process.cwd() — correr siempre vía
 * npm script (cwd = logic-core-v3).
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { hashIp } from '../ipHash'
import { extractClientIp } from '../../chat/requestSchema'

/** Setea/borra env vars (Reflect: sin casts), corre fn y SIEMPRE restaura. */
function withEnv(vars: Record<string, string | undefined>, fn: () => void): void {
  const saved = new Map<string, string | undefined>()
  for (const [key, value] of Object.entries(vars)) {
    saved.set(key, process.env[key])
    if (value === undefined) Reflect.deleteProperty(process.env, key)
    else Reflect.set(process.env, key, value)
  }
  try {
    fn()
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) Reflect.deleteProperty(process.env, key)
      else Reflect.set(process.env, key, value)
    }
  }
}

let passed = 0
let failed = 0
function check(label: string, fn: () => void): void {
  try {
    fn()
    passed += 1
    console.log(`  OK ${label}`)
  } catch (e) {
    failed += 1
    console.log(`  FALLA ${label}`)
    console.log(`     ${e instanceof Error ? e.message : String(e)}`)
  }
}

console.log('PRIVACIDAD — ip-hash.invariant')

// ── 1. ABORT en producción sin salt (el corazón de S7-03) ──
check('prod sin salt → hashIp ABORTA (nunca hashea con el fallback público)', () => {
  withEnv({ NODE_ENV: 'production', CHATBOT_IP_HASH_SALT: undefined }, () => {
    assert.throws(
      () => hashIp('203.0.113.7'),
      /CHATBOT_IP_HASH_SALT/,
      'en prod sin salt tiene que tirar, no degradar',
    )
  })
})

// ── 2. Con salt: 16 hex determinísticos, y el salt participa ──
check('prod con salt → 16 hex determinísticos', () => {
  withEnv({ NODE_ENV: 'production', CHATBOT_IP_HASH_SALT: 'salt-de-test-a' }, () => {
    const h1 = hashIp('203.0.113.7')
    const h2 = hashIp('203.0.113.7')
    assert.match(h1, /^[0-9a-f]{16}$/)
    assert.equal(h1, h2, 'misma IP + mismo salt → mismo hash')
  })
})

check('el salt participa: salt distinto → hash distinto; el fallback no colisiona', () => {
  let withSaltA = ''
  let withSaltB = ''
  let withFallback = ''
  withEnv({ NODE_ENV: 'production', CHATBOT_IP_HASH_SALT: 'salt-de-test-a' }, () => {
    withSaltA = hashIp('203.0.113.7')
  })
  withEnv({ NODE_ENV: 'production', CHATBOT_IP_HASH_SALT: 'salt-de-test-b' }, () => {
    withSaltB = hashIp('203.0.113.7')
  })
  withEnv({ NODE_ENV: 'development', CHATBOT_IP_HASH_SALT: undefined }, () => {
    withFallback = hashIp('203.0.113.7')
  })
  assert.notEqual(withSaltA, withSaltB, 'salt distinto → hash distinto')
  assert.notEqual(withSaltA, withFallback, 'un salt real nunca coincide con el fallback público')
})

// ── 3. Development sin salt sigue funcionando (fallback declarado) ──
check('dev sin salt → funciona con el fallback, 16 hex', () => {
  withEnv({ NODE_ENV: 'development', CHATBOT_IP_HASH_SALT: undefined }, () => {
    assert.match(hashIp('203.0.113.7'), /^[0-9a-f]{16}$/)
  })
})

// ── 4. Extracción de IP unificada: extractClientIp con fallback 'unknown' ──
check("extractClientIp: x-forwarded-for gana, primer valor, trim; fallback 'unknown'", () => {
  const withFwd = new Request('http://test.local', {
    headers: { 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1', 'x-real-ip': '198.51.100.2' },
  })
  assert.equal(extractClientIp(withFwd), '203.0.113.7')
  const withReal = new Request('http://test.local', {
    headers: { 'x-real-ip': '198.51.100.2' },
  })
  assert.equal(extractClientIp(withReal), '198.51.100.2')
  const bare = new Request('http://test.local')
  assert.equal(extractClientIp(bare), 'unknown')
})

// ── 5. Pin del route: un solo esquema de hash en el camino del chatbot ──
check('route.ts del chat usa hashIp + extractClientIp (sin createHash inline)', () => {
  const routeSource = readFileSync(
    join(process.cwd(), 'src', 'app', 'api', 'chatbot', '[slug]', 'chat', 'route.ts'),
    'utf8',
  )
  assert.ok(
    !routeSource.includes('createHash'),
    'el route no puede tener su propio hash inline (esquema B sin salt — el bug del sprint)',
  )
  assert.ok(routeSource.includes('hashIp('), 'el route tiene que usar hashIp')
  assert.ok(
    routeSource.includes('extractClientIp('),
    'el route tiene que usar la extracción canónica de IP',
  )
})

console.log(
  failed === 0
    ? `\nPRIVACIDAD ip-hash OK — ${passed} checks`
    : `\nPRIVACIDAD ip-hash EN ROJO — ${failed} de ${passed + failed} checks fallaron`,
)
if (failed > 0) process.exit(1)
