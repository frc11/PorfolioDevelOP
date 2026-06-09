import type { PublicBotConfig } from './publicConfig'

/**
 * Cache de la config pública del bot por slug, compartido entre:
 *   - el PREFETCH (ChatWidgetMount, al montar el layout root, durante el intro), y
 *   - el FETCH real (useChatbot, cuando el widget se revela).
 *
 * Motivo (fix de lag): el widget se monta recién en `chrome:revealed`, así que su
 * fetch de `/config` arrancaba FRÍO en ese momento — bloqueando el render del
 * launcher detrás de un cold-start (notorio en marketing) y haciéndolo aparecer
 * DESPUÉS del dock. Al precalentar la config durante el intro, para cuando el
 * chrome se revela ya está resuelta y el launcher renderiza al instante, junto al
 * dock. `Map` por slug → un solo fetch en vuelo, reusado por ambos consumidores.
 */
const cache = new Map<string, Promise<PublicBotConfig | null>>()

export function prefetchBotConfig(slug: string): Promise<PublicBotConfig | null> {
  const existing = cache.get(slug)
  if (existing) return existing

  const pending: Promise<PublicBotConfig | null> = fetch(`/api/chatbot/${slug}/config`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  cache.set(slug, pending)
  return pending
}
