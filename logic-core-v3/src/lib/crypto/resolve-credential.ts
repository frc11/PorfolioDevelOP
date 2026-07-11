import { decryptCredential, isEncrypted } from './credential-cipher'

/**
 * PD-1.3a — Resolución del valor a mostrar de una credencial de la bóveda.
 *
 * Convive el estado mixto de la tabla: filas cifradas (enc:v1:) se descifran;
 * filas en claro (pre-backfill) se devuelven tal cual. El fallo de descifrado
 * se aísla POR FILA: devuelve error=true en vez de lanzar — una fila rota
 * jamás tira la lista ni la página. El valor no se loguea nunca.
 */
export interface CredentialDisplay {
  value: string
  error: boolean
}

export function resolveCredentialDisplay(description: string): CredentialDisplay {
  if (isEncrypted(description)) {
    try {
      return { value: decryptCredential(description), error: false }
    } catch {
      return { value: '', error: true }
    }
  }
  return { value: description, error: false }
}
