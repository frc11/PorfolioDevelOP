// P1.D — Traducciones PURAS para el detalle del lead (texto de producto, en
// lenguaje de dueño no técnico). Sin DB, sin React → testeable. PROHIBIDO mostrar
// nombres de campo crudos: cada señal/categoría/canal se traduce o se omite.

import type { LeadCategory } from '@prisma/client'

// ── Señales de interés (las 6 booleanas → frases legibles) ────────────────────
export interface InterestSignalSource {
  providedPhone: boolean
  providedEmail: boolean
  requestedAppointment: boolean
  askedSpecificModel: boolean
  mentionedFinancing: boolean
  mentionedTradeIn: boolean
}

// Orden = prioridad de lectura para el dueño (lo más "caliente" primero).
const INTEREST_SIGNALS: ReadonlyArray<{ key: keyof InterestSignalSource; label: string }> = [
  { key: 'requestedAppointment', label: 'Pidió una cita' },
  { key: 'askedSpecificModel', label: 'Preguntó por un producto puntual' },
  { key: 'mentionedFinancing', label: 'Preguntó por financiación' },
  { key: 'mentionedTradeIn', label: 'Mencionó entregar un usado como parte de pago' },
  { key: 'providedPhone', label: 'Dejó su teléfono' },
  { key: 'providedEmail', label: 'Dejó su email' },
]

/** Devuelve SOLO las señales positivas (true) traducidas, como puntos a favor. */
export function collectInterestSignals(src: InterestSignalSource): string[] {
  return INTEREST_SIGNALS.filter((s) => src[s.key] === true).map((s) => s.label)
}

/**
 * Gate de la sección "Señales de interés": Pro+ (showScoring), nunca en DQ
 * (descartado), y solo si hay al menos una señal. Las señales explican el
 * interés/score → siguen la dimensión de plan, no son dato factual.
 */
export function shouldShowInterestSignals(
  showScoring: boolean,
  isDq: boolean,
  signals: string[],
): boolean {
  return showScoring && !isDq && signals.length > 0
}

// ── Categoría (LeadCategory → etiqueta de dueño) ──────────────────────────────
const CATEGORY_LABELS: Record<LeadCategory, string> = {
  sales: 'Venta',
  postventa: 'Posventa',
  employment: 'Búsqueda de empleo',
  provider: 'Proveedor',
  spam: 'Spam',
  other: 'Otra consulta',
}

export function categoryLabel(category: LeadCategory): string {
  return CATEGORY_LABELS[category] ?? 'Otra consulta'
}

// ── Canal (valores conocidos → etiqueta; desconocido/null → null, no se muestra crudo) ─
const CHANNEL_LABELS: Record<string, string> = {
  widget: 'Widget web',
  web: 'Sitio web',
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  whatsapp_inbound: 'WhatsApp',
}

export function channelLabel(channel: string | null): string | null {
  if (!channel) return null
  return CHANNEL_LABELS[channel.toLowerCase()] ?? null
}

// ── Duración de la charla (legible) ───────────────────────────────────────────
/**
 * "menos de un minuto" · "4 minutos" · "2 horas". null si las fechas no son
 * válidas o dan negativo (no inventamos una duración).
 */
export function formatChatDuration(startedAt: Date, lastMessageAt: Date): string | null {
  const ms = lastMessageAt.getTime() - startedAt.getTime()
  if (!Number.isFinite(ms) || ms < 0) return null
  const minutes = Math.round(ms / 60_000)
  if (minutes < 1) return 'menos de un minuto'
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  const hours = Math.round(minutes / 60)
  return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
}
