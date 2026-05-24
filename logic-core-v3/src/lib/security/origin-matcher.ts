/**
 * B4.2 — Helper compartido para matchear un `Origin` contra una lista de
 * dominios autorizados. Idéntica semántica que `validateOrigin` pero como
 * función pura: match exacto + subdominio.
 *
 * Se usa en dos lugares:
 *  - `validateOrigin` (`src/lib/security/validate-origin.ts`) → check de
 *     seguridad inicial contra `bot.allowedDomains` completo.
 *  - `handleChatRequest` (B4.2) → check defensivo contra el slice
 *     `bot.allowedDomains.slice(0, plan.maxDomains)`. Si el bot tiene
 *     más dominios que el plan permite (downgrade sin limpieza), los
 *     extras pasan validateOrigin pero NO pasan acá → modo degradado.
 *
 * Reglas (espejo de validate-origin.ts:64-78):
 *  - Match exacto contra host del origin.
 *  - Match de subdominio (`x.foo.com` matchea `foo.com`).
 *  - Prefijo `https?://` y `*.` se strippean de los entries.
 *  - Si `origin` no es una URL válida → false.
 */
export function originMatchesAllowed(
  origin: string,
  allowedDomains: readonly string[],
): boolean {
  if (allowedDomains.length === 0) return false

  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return false
  }

  for (const entry of allowedDomains) {
    const clean = entry
      .replace(/^https?:\/\//, '')
      .replace(/^\*\./, '')
      .replace(/\/$/, '')

    if (originHost === clean) return true
    if (originHost.endsWith('.' + clean)) return true
  }
  return false
}
