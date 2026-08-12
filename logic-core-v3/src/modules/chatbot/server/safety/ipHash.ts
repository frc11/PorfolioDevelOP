import { createHash } from 'crypto'

/**
 * Hashes an IP address with SHA-256 + secret salt (CHATBOT_IP_HASH_SALT).
 *
 * Usos reales (mantener sincronizado con la realidad, no al revés):
 *   - clave del rate-limit `chatbotPerSession` (route del chat)
 *   - telemetría `chat.rate_limited` y columna `Conversation.ipHash`
 *
 * La no-reversibilidad depende del salt: sin salt SECRETO, el hash de una
 * IPv4 se revierte por fuerza bruta trivial (espacio chico + este repo es
 * público, así que el fallback de abajo es de dominio público). Por eso en
 * producción la variable es OBLIGATORIA y su ausencia ABORTA (S7-03):
 * docs/env-vars.md y docs/operations/00-entornos.md prometen "error en
 * arranque si vacía" — un warning por request ya demostró que no alcanza.
 *
 * En development/test cae al fallback fijo NO secreto: suficiente para que
 * el flujo local funcione, inaceptable en prod.
 */
export function hashIp(ip: string): string {
  const salt = process.env.CHATBOT_IP_HASH_SALT
  if (!salt && process.env.NODE_ENV === 'production') {
    throw new Error(
      'CHATBOT_IP_HASH_SALT is required in production (generate with: openssl rand -hex 32). ' +
        'Aborting instead of hashing with the public fallback salt (S7-03).'
    )
  }
  const effectiveSalt = salt ?? 'chatbot-dev-salt-do-not-use-in-prod'
  return createHash('sha256')
    .update(`${ip}::${effectiveSalt}`)
    .digest('hex')
    .slice(0, 16)
}
