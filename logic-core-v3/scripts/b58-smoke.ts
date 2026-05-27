/**
 * B5.8 smoke tests — funciones puras del módulo CRM.
 *
 * Probamos:
 *   - validateWebhookUrl: 8 casos (https ok, http rechazo, hosts blacklist, IPs privadas, IPv6)
 *   - encryptSecret/decryptSecret: round-trip + tamper detection
 *   - getEffectiveSyncStatus: 4 casos (fresh PENDING, stale PENDING, SUCCESS, FAILED)
 *
 * Uso: npx ts-node --transpile-only scripts/b58-smoke.ts
 */

/* eslint-disable no-console */
import { randomBytes } from 'node:crypto'
import { validateWebhookUrl } from '../src/modules/chatbot/server/crm/validateWebhookUrl.ts'
import {
  encryptSecret,
  decryptSecret,
  isCrmEncryptionConfigured,
  CrmEncryptionError,
} from '../src/modules/chatbot/server/crm/encryptSecret.ts'
import {
  getEffectiveSyncStatus,
  isStaleSync,
  SYNC_STALE_THRESHOLD_MS,
} from '../src/modules/chatbot/server/crm/getEffectiveSyncStatus.ts'

let passed = 0
let failed = 0

function expect<T>(label: string, actual: T, expected: T): void {
  const equal = JSON.stringify(actual) === JSON.stringify(expected)
  if (equal) {
    console.log(`  ✓ ${label}`)
    passed += 1
  } else {
    console.log(`  ✗ ${label}`)
    console.log(`     expected: ${JSON.stringify(expected)}`)
    console.log(`     actual:   ${JSON.stringify(actual)}`)
    failed += 1
  }
}

function expectOk(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✓ ${label}`)
    passed += 1
  } else {
    console.log(`  ✗ ${label}`)
    failed += 1
  }
}

// ─── validateWebhookUrl ──────────────────────────────────────────────────────
console.log('\nvalidateWebhookUrl:')

expect(
  'acepta https público',
  validateWebhookUrl('https://n8n.example.com/webhook/abc-123').ok,
  true,
)
expect(
  'rechaza http',
  validateWebhookUrl('http://n8n.example.com/webhook/abc').ok,
  false,
)
expect(
  'rechaza URL malformada',
  validateWebhookUrl('not-a-url').ok,
  false,
)
expect(
  'rechaza string vacío',
  validateWebhookUrl('').ok,
  false,
)
expect(
  'rechaza localhost',
  validateWebhookUrl('https://localhost:5678/webhook').ok,
  false,
)
expect(
  'rechaza 127.0.0.1',
  validateWebhookUrl('https://127.0.0.1/webhook').ok,
  false,
)
expect(
  'rechaza IPv4 privada 10.x',
  validateWebhookUrl('https://10.0.0.5/webhook').ok,
  false,
)
expect(
  'rechaza IPv4 privada 192.168.x',
  validateWebhookUrl('https://192.168.1.100/webhook').ok,
  false,
)
expect(
  'rechaza IPv4 privada 172.20.x',
  validateWebhookUrl('https://172.20.5.10/webhook').ok,
  false,
)
expect(
  'rechaza metadata GCP/AWS',
  validateWebhookUrl('https://169.254.169.254/computeMetadata').ok,
  false,
)
expect(
  'rechaza metadata.google.internal',
  validateWebhookUrl('https://metadata.google.internal/').ok,
  false,
)
expect(
  'rechaza sufijo .local',
  validateWebhookUrl('https://server.local/webhook').ok,
  false,
)
expect(
  'rechaza sufijo .internal',
  validateWebhookUrl('https://api.internal/webhook').ok,
  false,
)
expect(
  'rechaza IPv6 loopback',
  validateWebhookUrl('https://[::1]/webhook').ok,
  false,
)

// ─── encryptSecret/decryptSecret ─────────────────────────────────────────────
console.log('\nencryptSecret / decryptSecret:')

// Setear key de test (32 bytes hex)
process.env.CRM_SECRET_KEY = randomBytes(32).toString('hex')

expectOk('isCrmEncryptionConfigured con env válida', isCrmEncryptionConfigured())

const plain = 'super-secret-token-1234567890'
const enc = encryptSecret(plain)
expectOk('encrypted no es el plaintext', enc.encrypted !== plain)
expectOk('iv presente', typeof enc.iv === 'string' && enc.iv.length > 0)
expectOk('tag presente', typeof enc.tag === 'string' && enc.tag.length > 0)

const decrypted = decryptSecret(enc)
expect('round-trip exacto', decrypted, plain)

// Tamper detection: alterar el ciphertext → decrypt debe fallar
const tampered = {
  encrypted: Buffer.from(enc.encrypted, 'base64').map((b, i) => (i === 0 ? b ^ 0xff : b)).toString('base64'),
  iv: enc.iv,
  tag: enc.tag,
}
let tamperCaught = false
try {
  decryptSecret(tampered)
} catch {
  tamperCaught = true
}
expectOk('decrypt detecta tampering (GCM auth)', tamperCaught)

// Sin env: encryptSecret debe throw CrmEncryptionError
const oldKey = process.env.CRM_SECRET_KEY
delete process.env.CRM_SECRET_KEY
expectOk('isCrmEncryptionConfigured sin env', !isCrmEncryptionConfigured())
let throwCaught = false
try {
  encryptSecret('foo')
} catch (e) {
  throwCaught = e instanceof CrmEncryptionError
}
expectOk('encryptSecret throws CrmEncryptionError sin env', throwCaught)
process.env.CRM_SECRET_KEY = oldKey

// Key de tamaño incorrecto
process.env.CRM_SECRET_KEY = 'tooshort'
let wrongKeyCaught = false
try {
  encryptSecret('foo')
} catch (e) {
  wrongKeyCaught = e instanceof CrmEncryptionError
}
expectOk('encryptSecret throws con key corta', wrongKeyCaught)
process.env.CRM_SECRET_KEY = oldKey

// ─── getEffectiveSyncStatus ──────────────────────────────────────────────────
console.log('\ngetEffectiveSyncStatus:')

const now = new Date('2026-05-24T10:00:00Z')

expect(
  'PENDING fresh (<5min) sigue siendo PENDING',
  getEffectiveSyncStatus(
    { status: 'PENDING', attemptedAt: new Date(now.getTime() - 60_000) },
    now,
  ),
  'PENDING',
)
expect(
  'PENDING stale (>5min) se convierte en FAILED',
  getEffectiveSyncStatus(
    { status: 'PENDING', attemptedAt: new Date(now.getTime() - SYNC_STALE_THRESHOLD_MS - 1_000) },
    now,
  ),
  'FAILED',
)
expect(
  'RETRYING stale también se convierte en FAILED',
  getEffectiveSyncStatus(
    { status: 'RETRYING', attemptedAt: new Date(now.getTime() - SYNC_STALE_THRESHOLD_MS - 1_000) },
    now,
  ),
  'FAILED',
)
expect(
  'SUCCESS viejo sigue SUCCESS (no se degrada)',
  getEffectiveSyncStatus(
    { status: 'SUCCESS', attemptedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    now,
  ),
  'SUCCESS',
)
expect(
  'FAILED viejo sigue FAILED',
  getEffectiveSyncStatus(
    { status: 'FAILED', attemptedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    now,
  ),
  'FAILED',
)
expect(
  'isStaleSync detecta PENDING viejo',
  isStaleSync(
    { status: 'PENDING', attemptedAt: new Date(now.getTime() - SYNC_STALE_THRESHOLD_MS - 1) },
    now,
  ),
  true,
)
expect(
  'isStaleSync NO marca SUCCESS como stale',
  isStaleSync(
    { status: 'SUCCESS', attemptedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    now,
  ),
  false,
)

// ─── Resultado ───────────────────────────────────────────────────────────────
console.log(`\n${passed} pasaron, ${failed} fallaron`)
process.exit(failed > 0 ? 1 : 0)
