// P1-fix — Etiquetas de intención del lead, en lenguaje de dueño. Fuente ÚNICA
// (antes había 3 mapas duplicados en LeadDetail / BusinessHero / BusinessLeadCard,
// todos con keys en MINÚSCULA que NUNCA matcheaban el enum `ChatbotLeadIntent`
// — que es MAYÚSCULA — y caían siempre al fallback genérico).
//
// Acá las keys están alineadas a los valores REALES del enum. Dos formas:
//   - intentLabel: sustantivo  ("Pedido de cotización")  → títulos/badges.
//   - intentPhrase: verbo       ("pidió una cotización")  → frases ("Juan pidió…").
//
// Pura, sin deps. NO toca el enum, el scoring ni cómo se setea el intent.

import type { ChatbotLeadIntent } from '@prisma/client'

// Sustantivo. Incluye los valores B5.1+ y los legacy (QUOTE/INFO/DEMO).
const INTENT_LABELS: Record<ChatbotLeadIntent, string> = {
  PURCHASE_READY: 'Listo para comprar',
  SCHEDULE_VISIT: 'Quiere agendar una visita',
  QUOTE_REQUEST: 'Pedido de cotización',
  HUMAN_REQUEST: 'Pidió hablar con una persona',
  SUPPORT: 'Soporte',
  OTHER: 'Consulta general',
  QUOTE: 'Pedido de cotización',
  INFO: 'Consulta de información',
  DEMO: 'Solicitud de demo',
}

// Verbo en pasado/presente, para nombrar al lead ("{nombre} {frase}").
const INTENT_PHRASES: Record<ChatbotLeadIntent, string> = {
  PURCHASE_READY: 'está listo para comprar',
  SCHEDULE_VISIT: 'quiere agendar una visita',
  QUOTE_REQUEST: 'pidió una cotización',
  HUMAN_REQUEST: 'pidió hablar con alguien',
  SUPPORT: 'pidió soporte',
  OTHER: 'dejó una consulta',
  QUOTE: 'pidió una cotización',
  INFO: 'hizo una consulta',
  DEMO: 'pidió una demo',
}

const LABEL_FALLBACK = 'Consulta general'
const PHRASE_FALLBACK = 'dejó una consulta'

/** Sustantivo de la intención. Fallback sano para null/desconocido. */
export function intentLabel(intent: string | null | undefined): string {
  if (intent != null && intent in INTENT_LABELS) {
    return INTENT_LABELS[intent as ChatbotLeadIntent]
  }
  return LABEL_FALLBACK
}

/** Frase verbal de la intención. Fallback sano para null/desconocido. */
export function intentPhrase(intent: string | null | undefined): string {
  if (intent != null && intent in INTENT_PHRASES) {
    return INTENT_PHRASES[intent as ChatbotLeadIntent]
  }
  return PHRASE_FALLBACK
}
