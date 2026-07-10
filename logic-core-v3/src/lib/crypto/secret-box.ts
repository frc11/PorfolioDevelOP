/**
 * secret-box — cifrado reversible de secretos, único del repo en src/lib.
 *
 * AES-256-GCM con key en env (32 bytes hex = 64 chars). GCM autentica además de
 * cifrar: si alguien modifica el ciphertext en la DB, el decrypt FALLA — no
 * devuelve un secret distinto en silencio.
 *
 * Es la generalización key-configurable del patrón que estrenó B5.8 en
 * `src/modules/chatbot/server/crm/encryptSecret.ts` (CRM_SECRET_KEY). Vive acá
 * porque el Motor WhatsApp (B1-S2) necesita cifrar la API key de 360dialog por
 * canal y NO puede importar del módulo chatbot (frontera eslint del motor); el
 * único hogar compartido válido es `src/lib/**`. Cada dominio de secretos usa
 * SU propia env key (radio de exposición aislado, rotación independiente):
 *   - chatbot / CRM  → CRM_SECRET_KEY
 *   - motor / canal  → MOTOR_CHANNEL_SECRET_KEY
 *
 * El secret JAMÁS se loguea, ni en claro ni cifrado. Se decrypta en memoria
 * justo antes de usarse (ej. el header de un fetch) y no se pasa a ningún logger.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH_BYTES = 12 // recomendado para GCM
const KEY_LENGTH_BYTES = 32

/** Error de configuración/uso del box (key ausente o malformada, plaintext vacío). */
export class SecretBoxError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SecretBoxError'
  }
}

/** Secreto cifrado, listo para persistir en tres columnas (todo base64). */
export interface EncryptedSecret {
  encrypted: string // base64
  iv: string // base64
  tag: string // base64
}

/** Caja de cifrado ligada a UNA env key. */
export interface SecretBox {
  encrypt(plaintext: string): EncryptedSecret
  decrypt(payload: EncryptedSecret): string
  /** true si la env key está presente y bien formada (útil para gating de UI). */
  isConfigured(): boolean
}

/**
 * Construye una caja de cifrado que lee su key de `process.env[envVarName]` de
 * forma perezosa (en cada operación, no en import-time): así el arranque no
 * exige la key si ninguna ruta cifra todavía, y un cambio de env en dev toma
 * efecto sin reimportar.
 */
export function createSecretBox(envVarName: string): SecretBox {
  function getKey(): Buffer {
    const raw = process.env[envVarName]
    if (!raw) {
      throw new SecretBoxError(`${envVarName} no está configurada.`)
    }
    let key: Buffer
    try {
      key = Buffer.from(raw, 'hex')
    } catch {
      throw new SecretBoxError(`${envVarName} no es hex válido.`)
    }
    if (key.length !== KEY_LENGTH_BYTES) {
      throw new SecretBoxError(
        `${envVarName} debe ser de ${KEY_LENGTH_BYTES} bytes hex (${KEY_LENGTH_BYTES * 2} chars).`,
      )
    }
    return key
  }

  return {
    encrypt(plaintext: string): EncryptedSecret {
      if (typeof plaintext !== 'string' || plaintext.length === 0) {
        throw new SecretBoxError('No se puede cifrar un valor vacío.')
      }
      const key = getKey()
      const iv = randomBytes(IV_LENGTH_BYTES)
      const cipher = createCipheriv(ALGORITHM, key, iv)
      const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
      const tag = cipher.getAuthTag()
      return {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
      }
    },

    decrypt(payload: EncryptedSecret): string {
      const key = getKey()
      const iv = Buffer.from(payload.iv, 'base64')
      const tag = Buffer.from(payload.tag, 'base64')
      const encrypted = Buffer.from(payload.encrypted, 'base64')
      const decipher = createDecipheriv(ALGORITHM, key, iv)
      decipher.setAuthTag(tag)
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
      return decrypted.toString('utf8')
    },

    isConfigured(): boolean {
      try {
        getKey()
        return true
      } catch {
        return false
      }
    },
  }
}
