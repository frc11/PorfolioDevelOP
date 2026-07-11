/**
 * PD-1.2 — Suite del wrapper encryptCredentialForStorage: idempotencia (no
 * re-cifra lo ya cifrado), fallo duro sin key (jamás pasa el claro), camino
 * normal (cifra a enc:v1: descifrable).
 * Corre: npx tsx src/lib/crypto/__tests__/encrypt-for-storage.test.ts
 */
import assert from 'node:assert/strict'
import {
  CredentialEncryptionError,
  decryptCredential,
  isEncrypted,
} from '../credential-cipher'
import { encryptCredentialForStorage } from '../encrypt-for-storage'

const ENV_KEY = 'ONBOARDING_SECRET_KEY'
// Key de TEST, no secret real: 32 bytes hex deterministas.
const TEST_KEY = '9f'.repeat(32)

function run() {
  process.env[ENV_KEY] = TEST_KEY

  // --- Camino normal: cifra y el resultado es descifrable ---
  const plaintext = 'Usuario: admin_sm | Pass: hunter2'
  const stored = encryptCredentialForStorage(plaintext)
  assert.ok(isEncrypted(stored), 'el valor a guardar queda en formato enc:v1:')
  assert.notEqual(stored, plaintext, 'jamás devuelve el claro cuando hay key')
  assert.equal(decryptCredential(stored), plaintext, 'round-trip vía storage')
  console.log('✓ camino normal: cifra a enc:v1: descifrable')

  // --- Idempotencia: lo ya cifrado se devuelve byte-idéntico ---
  assert.equal(encryptCredentialForStorage(stored), stored, 'no re-cifra lo cifrado')
  console.log('✓ idempotencia: cifrar lo ya cifrado no lo cambia')

  // --- Fallo duro sin key: lanza, nunca deja pasar el claro ---
  delete process.env[ENV_KEY]
  assert.throws(
    () => encryptCredentialForStorage('credencial en claro'),
    CredentialEncryptionError,
    'sin ONBOARDING_SECRET_KEY lanza — no se guarda en claro'
  )
  // La idempotencia NO depende de la key: lo cifrado pasa tal cual igual
  // (isEncrypted corta antes del chequeo de configuración).
  assert.equal(
    encryptCredentialForStorage(stored),
    stored,
    'idempotencia funciona aun sin key configurada'
  )
  console.log('✓ fallo duro sin key: lanza CredentialEncryptionError; idempotencia sobrevive')

  process.env[ENV_KEY] = TEST_KEY
  console.log('✓ encrypt-for-storage: TODOS los asserts pasaron')
}

run()
