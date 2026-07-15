/**
 * PD-1.1 — Suite del cifrador de credenciales de onboarding (credential-cipher).
 * Round-trip, prefijo v1, discriminador, tamper (iv/tag/ciphertext), formato
 * inválido, key ausente y key malformada. Es el gate del sprint: lógica de
 * seguridad, el test es la referencia externa.
 * Corre: npx tsx src/lib/crypto/__tests__/credential-cipher.test.ts
 */
import assert from 'node:assert/strict'
import {
  CredentialEncryptionError,
  decryptCredential,
  encryptCredential,
  isCredentialEncryptionConfigured,
  isEncrypted,
} from '../credential-cipher'

const ENV_KEY = 'ONBOARDING_SECRET_KEY'
// Keys de TEST, no secrets reales: 32 bytes hex (64 chars) deterministas.
const TEST_KEY_A = '9f'.repeat(32)
const TEST_KEY_B = '3c'.repeat(32)

/** Corrompe el primer char de una de las 3 partes base64 del payload v1. */
function tamperPart(payload: string, partIndex: 0 | 1 | 2): string {
  const parts = payload.slice('enc:v1:'.length).split(':')
  assert.equal(parts.length, 3, 'precondición: payload v1 bien formado')
  const original = parts[partIndex] as string
  // El primer char de base64 usa sus 6 bits completos: flipearlo SIEMPRE
  // cambia los bytes decodificados (el último char puede tener bits muertos).
  const flipped = (original[0] === 'A' ? 'B' : 'A') + original.slice(1)
  assert.notEqual(flipped, original, 'precondición: la corrupción cambió el string')
  parts[partIndex] = flipped
  return `enc:v1:${parts.join(':')}`
}

function run() {
  process.env[ENV_KEY] = TEST_KEY_A
  assert.equal(
    isCredentialEncryptionConfigured(),
    true,
    'con key válida -> isConfigured true'
  )
  console.log('✓ key válida: isConfigured() -> true')

  // --- Round-trip: encrypt -> decrypt devuelve el original ---
  const plaintexts: Array<[string, string]> = [
    ['credencial simple', 'Usuario: admin_sm | Pass: hunter2'],
    [
      'comillas y saltos de línea',
      'Usuario: "admin"\nPass: \'p@ss\nword\'\nURL: https://panel.ejemplo.com/login',
    ],
    ['unicode y emoji', 'Usuário: ñandú 🔐 пароль 密码 — clave: café#2026'],
    ['string largo (>1KB)', 'linea de credencial larga con simbolos $%&/() '.repeat(30)],
  ]
  for (const [label, plaintext] of plaintexts) {
    const encrypted = encryptCredential(plaintext)
    assert.equal(decryptCredential(encrypted), plaintext, `round-trip: ${label}`)
    assert.notEqual(encrypted, plaintext, `el ciphertext no es el plaintext: ${label}`)
  }
  assert.ok(
    (plaintexts[3] as [string, string])[1].length > 1024,
    'precondición: el caso largo supera 1KB'
  )
  console.log('✓ round-trip (simple, comillas/saltos, unicode/emoji, >1KB)')

  // --- Prefijo de versión ---
  const sample = encryptCredential('Usuario: admin')
  assert.ok(sample.startsWith('enc:v1:'), 'el output cifrado empieza con enc:v1:')
  assert.notEqual(
    encryptCredential('Usuario: admin'),
    sample,
    'IV aleatorio: dos cifrados del mismo plaintext difieren'
  )
  console.log('✓ prefijo enc:v1: + IV aleatorio por cifrado')

  // --- isEncrypted ---
  assert.equal(isEncrypted(sample), true, 'isEncrypted(cifrado) -> true')
  assert.equal(isEncrypted('Usuario: admin'), false, 'isEncrypted(texto plano) -> false')
  assert.equal(isEncrypted(''), false, 'isEncrypted(vacío) -> false')
  console.log('✓ isEncrypted discrimina cifrado vs texto plano')

  // --- TAMPER: corromper iv, tag o ciphertext DEBE lanzar (jamás devolver otra cosa) ---
  // Los payloads corruptos se construyen FUERA del callback de assert.throws:
  // si tamperPart lanzara por precondición rota, el test fallaría ahí y no
  // pasaría vacuamente. El predicado exige que el error venga de node:crypto
  // (auth GCM propagada), NO de la validación de formato.
  const tamperTarget = encryptCredential('Pass: super-secreta-123')
  const isGcmAuthError = (err: unknown): boolean =>
    !(err instanceof CredentialEncryptionError)
  const tamperedIv = tamperPart(tamperTarget, 0)
  const tamperedTag = tamperPart(tamperTarget, 1)
  const tamperedCiphertext = tamperPart(tamperTarget, 2)
  assert.throws(
    () => decryptCredential(tamperedIv),
    isGcmAuthError,
    'iv corrupto lanza el error de auth GCM'
  )
  assert.throws(
    () => decryptCredential(tamperedTag),
    isGcmAuthError,
    'tag corrupto lanza el error de auth GCM'
  )
  assert.throws(
    () => decryptCredential(tamperedCiphertext),
    isGcmAuthError,
    'ciphertext corrupto lanza el error de auth GCM'
  )
  assert.equal(
    decryptCredential(tamperTarget),
    'Pass: super-secreta-123',
    'el payload intacto sigue descifrando (el tamper no mutó al original)'
  )
  console.log('✓ tamper en iv/tag/ciphertext lanza (GCM auth)')

  // --- Key equivocada: descifra con otra key válida -> lanza, no devuelve basura ---
  process.env[ENV_KEY] = TEST_KEY_B
  assert.throws(() => decryptCredential(tamperTarget), 'decrypt con otra key lanza')
  process.env[ENV_KEY] = TEST_KEY_A
  console.log('✓ decrypt con key distinta lanza')

  // --- Formato inválido: lanza CredentialEncryptionError, nunca null/basura ---
  // 'a'/'b'/'c' son base64 válido por regex pero decodifican a 0 bytes;
  // 'QQ==' decodifica a 1 byte. La validación de longitudes decodificadas
  // debe atraparlos como formato (error tipado), no dejar un TypeError crudo.
  const sampleParts = sample.slice('enc:v1:'.length).split(':') as [string, string, string]
  const invalidPayloads: Array<[string, string]> = [
    ['texto plano', 'texto plano'],
    ['dos partes', 'enc:v1:solodos:partes'],
    ['cuatro partes', 'enc:v1:QQ==:QQ==:QQ==:QQ=='],
    ['partes vacías', 'enc:v1:::'],
    ['no-base64', 'enc:v1:!!!:###:$$$'],
    ['prefijo de otra versión', 'enc:v2:QQ==:QQ==:QQ=='],
    ['iv/tag/ct de 0 bytes decodificados', 'enc:v1:a:b:c'],
    ['iv de 1 byte', `enc:v1:QQ==:${sampleParts[1]}:${sampleParts[2]}`],
    [
      'tag truncado a 4 bytes (downgrade de auth GCM — jamás llega a setAuthTag)',
      `enc:v1:${sampleParts[0]}:AAAAAA==:${sampleParts[2]}`,
    ],
    ['colisión del discriminador: plaintext que empieza con enc:v1:', 'enc:v1:credencial real del cliente'],
  ]
  for (const [label, payload] of invalidPayloads) {
    assert.throws(
      () => decryptCredential(payload),
      CredentialEncryptionError,
      `formato inválido lanza CredentialEncryptionError: ${label}`
    )
  }
  // Propiedad conocida del formato (decidida en el spec): un plaintext que
  // empiece literalmente con 'enc:v1:' da falso positivo en isEncrypted.
  // Se pinnea el comportamiento: se clasifica cifrado y el decrypt lanza
  // error tipado — nunca devuelve basura en silencio.
  assert.equal(
    isEncrypted('enc:v1:credencial real del cliente'),
    true,
    'falso positivo documentado del prefijo'
  )
  console.log('✓ formato inválido lanza CredentialEncryptionError (10 casos, incl. tag truncado y colisión de prefijo)')

  // --- Plaintext inválido ---
  assert.throws(
    () => encryptCredential(''),
    CredentialEncryptionError,
    'plaintext vacío lanza'
  )
  assert.throws(
    () => encryptCredential(123 as unknown as string),
    CredentialEncryptionError,
    'plaintext no-string lanza'
  )
  assert.throws(
    () => encryptCredential('pass\uD800word'),
    CredentialEncryptionError,
    'surrogate UTF-16 suelto lanza (el cifrado sería lossy en silencio)'
  )
  console.log('✓ plaintext vacío / no-string / surrogate suelto lanza')

  // --- Key ausente ---
  const validPayload = encryptCredential('para probar decrypt sin key')
  delete process.env[ENV_KEY]
  assert.equal(isCredentialEncryptionConfigured(), false, 'sin key -> isConfigured false')
  assert.throws(
    () => encryptCredential('lo que sea'),
    CredentialEncryptionError,
    'encrypt sin key lanza'
  )
  assert.throws(
    () => decryptCredential(validPayload),
    CredentialEncryptionError,
    'decrypt sin key lanza'
  )
  console.log('✓ key ausente: encrypt/decrypt lanzan, isConfigured() -> false')

  // --- Key malformada: hex impar / no-hex / longitud != 32 bytes ---
  const badKeys: Array<[string, string]> = [
    ['hex impar', 'a'.repeat(63)],
    ['no-hex', 'z'.repeat(64)],
    ['no-hex con truncado silencioso de Buffer.from', 'ab'.repeat(16) + 'zz'.repeat(16)],
    ['longitud 16 bytes', 'ab'.repeat(16)],
    ['longitud 33 bytes', 'ab'.repeat(33)],
  ]
  for (const [label, badKey] of badKeys) {
    process.env[ENV_KEY] = badKey
    assert.equal(isCredentialEncryptionConfigured(), false, `isConfigured false: ${label}`)
    assert.throws(
      () => encryptCredential('lo que sea'),
      CredentialEncryptionError,
      `encrypt con key malformada lanza: ${label}`
    )
    assert.throws(
      () => decryptCredential(validPayload),
      CredentialEncryptionError,
      `decrypt con key malformada lanza: ${label}`
    )
  }
  console.log('✓ key malformada (impar, no-hex, truncable, 16B, 33B): encrypt y decrypt lanzan en getKey')

  process.env[ENV_KEY] = TEST_KEY_A
  console.log('✓ credential-cipher: TODOS los asserts pasaron')
}

run()
