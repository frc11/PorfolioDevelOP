/**
 * Credenciales del webhook entrante de un WabaChannel (B1-S1).
 *
 * Par por canal:
 *   - channelToken: identifica el canal en la URL del webhook
 *     (/api/motor/webhook/[channelToken]) sin exponer ids internos.
 *   - webhookSecret: Bearer que 360dialog reenvía en el header Authorization
 *     de cada POST. Se persiste SOLO su SHA-256 (webhookSecretHash) — el
 *     valor en claro se muestra una única vez al generarlo, para cargarlo en
 *     la configuración del webhook del BSP.
 *
 * 256 bits de entropía por credencial (crypto.randomBytes). La comparación
 * es timing-safe sobre los hashes (misma longitud siempre → timingSafeEqual
 * no lanza y no filtra longitud).
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const CREDENTIAL_BYTES = 32

/** 64 hex chars (crypto.randomBytes(32)). Valida el shape ANTES de tocar la DB. */
export const CHANNEL_TOKEN_PATTERN = /^[a-f0-9]{64}$/

export interface ChannelWebhookCredentials {
  channelToken: string
  /** Valor en claro — mostrar una vez y descartar. NUNCA persistirlo. */
  webhookSecret: string
  webhookSecretHash: string
}

export function generateChannelWebhookCredentials(): ChannelWebhookCredentials {
  const channelToken = randomBytes(CREDENTIAL_BYTES).toString('hex')
  const webhookSecret = randomBytes(CREDENTIAL_BYTES).toString('hex')
  return { channelToken, webhookSecret, webhookSecretHash: hashWebhookSecret(webhookSecret) }
}

export function hashWebhookSecret(secret: string): string {
  return createHash('sha256').update(secret, 'utf8').digest('hex')
}

/** Compara el secret presentado contra el hash persistido, timing-safe. */
export function webhookSecretMatches(presented: string, storedHash: string): boolean {
  const presentedHash = Buffer.from(hashWebhookSecret(presented), 'hex')
  const stored = Buffer.from(storedHash, 'hex')
  if (stored.length === 0 || presentedHash.length !== stored.length) return false
  return timingSafeEqual(presentedHash, stored)
}
