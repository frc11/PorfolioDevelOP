/**
 * FIX-ORIGIN — Lógica de decisión del camino same-origin, separada de
 * `route.ts` a propósito: `route.ts` importa `@/modules/chatbot/index.server`
 * (barrel server-only) para `handleConfigRequest`, cuya cadena de imports
 * arrastra `next-auth` → `next/server` (vía server/insights/manageInsight.ts
 * → server/admin/getClientSession.ts → src/auth.ts) y, en otro punto, un
 * `.module.css` de un componente de avatar — ninguno de los dos resuelve
 * fuera del bundler de Next (preexistente, no de este fix; confirmado con
 * `route.ts` intentando cargarse vía tsx Y vía Playwright, mismo resultado).
 * Nada de esto es importable en un script/test liviano — de ahí que las
 * piezas de este fix vivan ACÁ, con imports mínimos (`@/lib/isolation` es
 * liviano — ver tests/integration/chatbot-isolation.spec.ts, que ya lo usa
 * bajo Playwright sin problema).
 */
import { unsafeGlobalQuery } from '@/lib/isolation'

/**
 * Reproduce la MISMA condición bajo la que
 * `validateOrigin({ origin: null, ... })` rechaza hoy (ver validate-origin.ts,
 * NO tocado): `NODE_ENV === 'production'` y sin el flag de QA. Fuera de esa
 * condición (dev, o next-prod-qa con QA_ALLOW_LOCALHOST=1), validateOrigin YA
 * permite un origin nulo — el bypass de acá NUNCA se activa en esos casos, así
 * que su comportamiento queda idéntico al de hoy, sin excepción.
 */
export function isSameOriginBypassApplicable(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.QA_ALLOW_LOCALHOST !== '1'
}

/**
 * ¿Este GET sin header Origin es un same-origin real del propio sitio (el
 * widget pidiendo su config), o un cliente anónimo (curl/SSR)?
 *
 * Señal primaria: `Sec-Fetch-Site: same-origin`. Lo setea el navegador según
 * el spec de Fetch Metadata — JS de página NO puede sobreescribirlo (es un
 * forbidden header name para fetch/XHR). Un valor EXPLÍCITO distinto
 * ('cross-site' | 'same-site' | 'none') es tan confiable como 'same-origin' y
 * se respeta tal cual: no cae al fallback.
 *
 * Fallback defensivo (solo si el header falta): comparar el host del Referer
 * contra el host del propio request (`Host`, mismo header que ya usa
 * api/qa/login/route.ts para esto). Cubre navegadores/clientes que todavía no
 * mandan Sec-Fetch-Site (header más nuevo que Origin/Referer). Un Referer
 * ausente o con host distinto no es same-origin.
 */
export function isTrustedSameOrigin(request: Request): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite === 'same-origin') return true
  if (secFetchSite) return false

  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  if (!referer || !host) return false
  try {
    return new URL(referer).host === host
  } catch {
    return false
  }
}

/**
 * Mismo criterio de "bot servible" que validateOrigin aplica para cross-origin
 * (bot_not_found / bot_inactive), aislado acá para el camino same-origin:
 * same-origin NO necesita el check de allowedDomains (no hay dominio de embed
 * que autorizar — es el propio sitio), pero un bot inactivo o inexistente
 * sigue sin poder servir config, same-origin o no.
 */
export async function isBotServable(slug: string): Promise<boolean> {
  const bot = await unsafeGlobalQuery(
    'FIX-ORIGIN: config same-origin sin header Origin (prod) — confirmar bot activo antes de saltear el check de allowedDomains',
    (client) => client.botConfig.findUnique({ where: { slug }, select: { isActive: true } }),
  )
  return bot !== null && bot.isActive
}
