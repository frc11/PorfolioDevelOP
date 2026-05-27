import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

/**
 * B5.8 — Cifrado de secrets opcionales del CrmIntegration (header de auth a n8n).
 *
 * AES-256-GCM con key en env CRM_SECRET_KEY (32 bytes hex = 64 chars).
 * GCM provee autenticación además de cifrado: si alguien modifica el ciphertext
 * en la DB, el decrypt falla — no devuelve un secret distinto en silencio.
 *
 * El secret JAMÁS se loguea ni en plano ni cifrado. Solo se decrypta dentro de
 * postToN8n.ts justo antes del fetch, en memoria.
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH_BYTES = 12 // recomendado para GCM
const KEY_LENGTH_BYTES = 32

export class CrmEncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CrmEncryptionError'
  }
}

function getKey(): Buffer {
  const raw = process.env.CRM_SECRET_KEY
  if (!raw) {
    throw new CrmEncryptionError(
      'CRM_SECRET_KEY no está configurada. Pedile a develOP que la configure.'
    )
  }
  let key: Buffer
  try {
    key = Buffer.from(raw, 'hex')
  } catch {
    throw new CrmEncryptionError('CRM_SECRET_KEY no es hex válido')
  }
  if (key.length !== KEY_LENGTH_BYTES) {
    throw new CrmEncryptionError(
      `CRM_SECRET_KEY debe ser de ${KEY_LENGTH_BYTES} bytes hex (${KEY_LENGTH_BYTES * 2} chars)`
    )
  }
  return key
}

/**
 * Indica si CRM_SECRET_KEY está configurada correctamente. Útil para la UI:
 * si no lo está, se deshabilita el campo de secret header con un tooltip.
 */
export function isCrmEncryptionConfigured(): boolean {
  try {
    getKey()
    return true
  } catch {
    return false
  }
}

export interface EncryptedSecret {
  encrypted: string // base64
  iv: string        // base64
  tag: string       // base64
}

export function encryptSecret(plaintext: string): EncryptedSecret {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new CrmEncryptionError('No se puede cifrar un valor vacío')
  }
  const key = getKey()
  const iv = randomBytes(IV_LENGTH_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  }
}

export function decryptSecret(payload: EncryptedSecret): string {
  const key = getKey()
  const iv = Buffer.from(payload.iv, 'base64')
  const tag = Buffer.from(payload.tag, 'base64')
  const encrypted = Buffer.from(payload.encrypted, 'base64')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}
