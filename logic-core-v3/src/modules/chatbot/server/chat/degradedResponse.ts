/**
 * MS-E6.2 — Respuesta de modo degradado y el cap de dominios del plan.
 *
 * Movido VERBATIM desde `handleChatRequest.ts` (costura A del refactor). Cero
 * cambio de comportamiento: funciones puras, sin estado de request ni I/O.
 */
import { originMatchesAllowed } from '@/lib/security/origin-matcher'

/**
 * B4.2/B4.5 — Respuesta estandarizada de modo degradado.
 *
 * Lockeada en la economía del producto: cuando el gating bloquea,
 * NUNCA llamamos a Gemini. Devolvemos JSON canned + datos para que el
 * widget arme el handoff de WhatsApp con la info del bot real.
 *
 * Cero costo de LLM, cero crash, cero 500.
 *
 * El widget detecta `mode === 'degraded'` y muestra el CTA WhatsApp
 * directamente. La `reason` permite distinguir downstream (telemetría,
 * UI texto distinto en el widget si quisiera).
 */
export type DegradedReason = 'quota_exhausted' | 'domain_overflow' | 'conversation_limit'

export interface DegradedContext {
  whatsappNumber: string | null
  whatsappMessage: string | null
  companyName: string | null
}

export function degradedResponse(
  message: string,
  reason: DegradedReason,
  bot: DegradedContext = {
    whatsappNumber: null,
    whatsappMessage: null,
    companyName: null,
  },
): Response {
  return Response.json({
    mode: 'degraded',
    reason,
    message,
    ctaWhatsapp: true,
    whatsappNumber: bot.whatsappNumber,
    whatsappMessage: bot.whatsappMessage,
    companyName: bot.companyName,
  })
}

/**
 * B4.2 — Aplica el cap de `maxDomains` del plan al array de dominios
 * autorizados del bot.
 *
 * Si el plan no tiene cap (`null` = uso justo / ilimitado), devuelve
 * el array entero. Si el bot tiene más dominios configurados que el
 * plan permite (downgrade sin limpieza), los primeros N son efectivos
 * y el resto queda como "overflow" — pasa validateOrigin (que mira el
 * full array) pero NO pasa el check defensivo de este pipeline.
 */
function effectiveAllowedDomains(
  botAllowedDomains: readonly string[],
  planMaxDomains: number | null,
): { effective: string[]; overflow: string[] } {
  if (planMaxDomains === null) {
    return { effective: [...botAllowedDomains], overflow: [] }
  }
  return {
    effective: botAllowedDomains.slice(0, planMaxDomains),
    overflow: botAllowedDomains.slice(planMaxDomains),
  }
}

/**
 * B4.2 — ¿El origin es efectivamente autorizado para este (bot, plan)?
 *
 * Replica los escapes de `validateOrigin` (dev/localhost, develop.com.ar)
 * y después aplica el slice del plan. NO duplica el matcher (delega a
 * `originMatchesAllowed`). Llamado DESPUÉS de validateOrigin (que ya
 * autorizó el origin contra el full `bot.allowedDomains`).
 *
 * Devuelve `false` solo si el origin matchea exclusivamente un dominio
 * "overflow" (configurado en el bot pero excedido por el cap del plan).
 */
export function isOriginWithinPlanCap(
  origin: string | null,
  botAllowedDomains: readonly string[],
  planMaxDomains: number | null,
): boolean {
  // Dev → localhost siempre OK (la batería de regresión corre desde localhost)
  if (
    process.env.NODE_ENV === 'development' &&
    origin &&
    (origin.includes('localhost') || origin.includes('127.0.0.1'))
  ) {
    return true
  }
  // develop.com.ar nunca cae al cap
  if (
    origin === 'https://develop.com.ar' ||
    origin === 'https://www.develop.com.ar'
  ) {
    return true
  }
  // Sin cap del plan → cualquier origin que pasó validateOrigin pasa acá también
  if (planMaxDomains === null) return true
  // Sin origin (curl, same-origin) — ya pasó validateOrigin, no aplico el cap
  if (!origin) return true

  const { effective } = effectiveAllowedDomains(botAllowedDomains, planMaxDomains)
  return originMatchesAllowed(origin, effective)
}
