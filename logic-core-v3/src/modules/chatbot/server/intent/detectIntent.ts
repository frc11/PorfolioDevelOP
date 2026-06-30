/**
 * Intent detection — basado en sales-strategy.ts del legacy.
 *
 * Analiza el último mensaje del usuario y detecta intención (price, urgency, etc.)
 * Devuelve guidance específica que se inyecta en el system prompt como hint
 * (ver `handleChatRequest.ts` → `enrichedSystemPrompt`).
 *
 * EV.4 — Los patrones ya NO viven acá: los aporta el pack vertical del bot
 * (`getVerticalPack(bot.verticalPack).intents`). El bot de la agencia conserva
 * sus patrones verbatim en el pack `agencia`; el pack `usados` trae vocabulario
 * de concesionaria; `base` trae intents mínimos genéricos. Esta función es un
 * matcher puro sobre los patrones que recibe — cero patrones hardcodeados.
 */

import type { VerticalIntents } from '../verticals/types'

/**
 * Unión legacy de claves de intent de la agencia. Se conserva por
 * compatibilidad del re-export; con packs, el intent es un `string` libre
 * (cada vertical define su propio vocabulario de guidance-intents).
 */
export type IntentType =
  | 'price'
  | 'urgency'
  | 'comparison'
  | 'service_inquiry'
  | 'consultation'
  | 'unknown'

export interface IntentResult {
  /** Clave del intent del pack que matcheó, o `'unknown'`. */
  intent: string
  /** Texto a inyectar en el prompt si hubo match (del pack), o null. */
  guidance: string | null
}

/**
 * Detecta el intent del mensaje recorriendo los patrones del pack vertical.
 * El PRIMER patrón que matchea gana (el orden del pack define prioridad).
 * Sin match → `{ intent: 'unknown', guidance: null }`. Pura, sin side effects.
 */
export function detectIntent(userMessage: string, intents: VerticalIntents): IntentResult {
  for (const def of intents) {
    for (const pattern of def.patterns) {
      if (pattern.test(userMessage)) {
        return { intent: def.intent, guidance: def.guidance ?? null }
      }
    }
  }
  return { intent: 'unknown', guidance: null }
}
