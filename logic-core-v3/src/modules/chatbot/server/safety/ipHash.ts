import { createHash } from 'crypto'

/**
 * Hashes an IP address with SHA-256 + secret salt.
 *
 * GDPR-friendly: stores a non-reversible identifier instead of the
 * raw IP. Used for rate limiting and abuse detection without storing PII.
 *
 * Set CHATBOT_IP_HASH_SALT in env. If not set, falls back to a default
 * (NEVER acceptable in production — the module logs a warning).
 */
export function hashIp(ip: string): string {
  const salt = process.env.CHATBOT_IP_HASH_SALT
  if (!salt) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        JSON.stringify({
          type: 'ip_hash.missing_salt',
          level: 'warn',
          message: 'CHATBOT_IP_HASH_SALT not set in production — using default',
        })
      )
    }
  }
  const effectiveSalt = salt ?? 'chatbot-dev-salt-do-not-use-in-prod'
  return createHash('sha256')
    .update(`${ip}::${effectiveSalt}`)
    .digest('hex')
    .slice(0, 16)
}
