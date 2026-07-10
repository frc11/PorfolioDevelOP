import type { PublicBotConfig } from './publicConfig'
import { classifyStatus, shouldRetry, backoffForAttempt, type FetchOutcome } from './chatRetryPolicy'

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
 *
 * RE-2 — un fallo (red / cold-start de Neon vía 5xx) reintenta con la MISMA policy
 * pura que ya usa el POST de /chat (`chatRetryPolicy.ts`, INFRA.2): solo transitorios,
 * backoff 2s/4s, acotado. Si agota los reintentos, la entrada se BORRA del cache en
 * vez de quedar envenenada para siempre — el próximo `prefetchBotConfig(slug)`
 * (remount o retry manual) vuelve a fetchear desde cero. El cache solo persiste
 * promesas resueltas a una config real.
 */
const cache = new Map<string, Promise<PublicBotConfig | null>>()

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchConfigOnce(
  slug: string,
): Promise<{ outcome: FetchOutcome; config: PublicBotConfig | null }> {
  try {
    const r = await fetch(`/api/chatbot/${slug}/config`)
    const outcome = classifyStatus(r.status, r.headers.get('retry-after'))
    if (outcome.kind !== 'success') return { outcome, config: null }
    const config = (await r.json()) as PublicBotConfig
    return { outcome, config }
  } catch {
    return { outcome: { kind: 'network-error' }, config: null }
  }
}

async function fetchConfigWithRetry(slug: string): Promise<PublicBotConfig | null> {
  let attemptsMade = 0
  for (;;) {
    attemptsMade += 1
    const { outcome, config } = await fetchConfigOnce(slug)
    if (outcome.kind === 'success') return config
    if (!shouldRetry(outcome, attemptsMade)) return null
    await sleep(backoffForAttempt(attemptsMade))
  }
}

export function prefetchBotConfig(slug: string): Promise<PublicBotConfig | null> {
  const existing = cache.get(slug)
  if (existing) return existing

  const pending = fetchConfigWithRetry(slug).then((config) => {
    if (config === null) cache.delete(slug)
    return config
  })

  cache.set(slug, pending)
  return pending
}
