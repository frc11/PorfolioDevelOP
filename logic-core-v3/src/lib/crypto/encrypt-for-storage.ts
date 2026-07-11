import {
  CredentialEncryptionError,
  encryptCredential,
  isCredentialEncryptionConfigured,
  isEncrypted,
} from './credential-cipher'

/**
 * PD-1.2 — Cifrado de credenciales antes de persistir (write-paths de la bóveda).
 *
 * Idempotente: un valor ya cifrado (enc:v1:) se devuelve tal cual — no se
 * re-cifra (seguro ante doble paso y backfill). Fallo duro: si falta
 * ONBOARDING_SECRET_KEY lanza CredentialEncryptionError — una credencial
 * JAMÁS se guarda en claro. El plaintext no se loguea nunca.
 */
export function encryptCredentialForStorage(plaintext: string): string {
  if (isEncrypted(plaintext)) {
    return plaintext
  }
  if (!isCredentialEncryptionConfigured()) {
    throw new CredentialEncryptionError(
      'Cifrado de credenciales no configurado (falta ONBOARDING_SECRET_KEY); no se guarda en claro'
    )
  }
  return encryptCredential(plaintext)
}
