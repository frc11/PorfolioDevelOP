import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/**
 * PD-1 — Cifrado de credenciales de cliente (bóveda de onboarding).
 *
 * AES-256-GCM con key en env ONBOARDING_SECRET_KEY (32 bytes hex = 64 chars).
 * GCM autentica además de cifrar: si alguien modifica el ciphertext en la DB,
 * el decrypt lanza — jamás devuelve un valor distinto en silencio.
 *
 * El valor cifrado se serializa a un solo string con prefijo de versión:
 *   enc:v1:<ivBase64>:<tagBase64>:<ciphertextBase64>
 * El prefijo es el discriminador barato entre cifrado y texto plano para
 * backfill y lectores (isEncrypted).
 *
 * La credencial JAMÁS se loguea, ni en claro ni cifrada.
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH_BYTES = 12 // recomendado para GCM
const KEY_LENGTH_BYTES = 32
const TAG_LENGTH_BYTES = 16 // tag GCM completo — un tag truncado degrada la autenticación
const PREFIX = 'enc:v1:'

export class CredentialEncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CredentialEncryptionError'
  }
}

const HEX_RE = /^[0-9a-fA-F]+$/
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/

function getKey(): Buffer {
  const raw = process.env.ONBOARDING_SECRET_KEY
  if (!raw) {
    throw new CredentialEncryptionError(
      'ONBOARDING_SECRET_KEY no está configurada. Generarla con: openssl rand -hex 32'
    )
  }
  // Buffer.from(raw, 'hex') NO lanza ante hex inválido (trunca en silencio),
  // así que el formato se valida explícitamente antes de decodificar.
  if (!HEX_RE.test(raw) || raw.length % 2 !== 0) {
    throw new CredentialEncryptionError('ONBOARDING_SECRET_KEY no es hex válido')
  }
  const key = Buffer.from(raw, 'hex')
  if (key.length !== KEY_LENGTH_BYTES) {
    throw new CredentialEncryptionError(
      `ONBOARDING_SECRET_KEY debe ser de ${KEY_LENGTH_BYTES} bytes hex (${KEY_LENGTH_BYTES * 2} chars)`
    )
  }
  return key
}

/**
 * Indica si ONBOARDING_SECRET_KEY está configurada correctamente. Permite a
 * los callers degradar con criterio en vez de fallar al cifrar.
 */
export function isCredentialEncryptionConfigured(): boolean {
  try {
    getKey()
    return true
  } catch {
    return false
  }
}

/** Discriminador barato: true si el valor ya está en formato cifrado v1. */
export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX)
}

export function encryptCredential(plaintext: string): string {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new CredentialEncryptionError('No se puede cifrar un valor vacío')
  }
  // Un surrogate UTF-16 suelto se codificaría a U+FFFD: el decrypt devolvería
  // otro valor en silencio. Se rechaza antes que corromper una credencial.
  const plaintextBuf = Buffer.from(plaintext, 'utf8')
  if (plaintextBuf.toString('utf8') !== plaintext) {
    throw new CredentialEncryptionError(
      'El valor contiene UTF-16 inválido (surrogate suelto): el cifrado no sería fiel'
    )
  }
  const key = getKey()
  const iv = randomBytes(IV_LENGTH_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintextBuf), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
}

export function decryptCredential(payload: string): string {
  if (typeof payload !== 'string' || !payload.startsWith(PREFIX)) {
    throw new CredentialEncryptionError(
      'El valor no tiene el formato cifrado esperado (prefijo enc:v1:)'
    )
  }
  const parts = payload.slice(PREFIX.length).split(':')
  if (parts.length !== 3 || parts.some((p) => p.length === 0 || !BASE64_RE.test(p))) {
    throw new CredentialEncryptionError(
      'Payload cifrado malformado: se esperan iv:tag:ciphertext en base64'
    )
  }
  const [ivB64, tagB64, ciphertextB64] = parts as [string, string, string]
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const ciphertext = Buffer.from(ciphertextB64, 'base64')
  // Longitudes decodificadas: setAuthTag aceptaría un tag truncado (degrada la
  // autenticación GCM a la longitud del tag) y un iv de otro largo jamás salió
  // de encryptCredential — ambos son payload malformado, no tamper.
  if (iv.length !== IV_LENGTH_BYTES || tag.length !== TAG_LENGTH_BYTES) {
    throw new CredentialEncryptionError(
      'Payload cifrado malformado: iv o tag con longitud inválida'
    )
  }
  const key = getKey()

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH_BYTES,
  })
  decipher.setAuthTag(tag)

  // Si el tag no valida (tamper en iv/tag/ciphertext o key equivocada),
  // decipher.final() lanza — el error de node:crypto se propaga tal cual.
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
