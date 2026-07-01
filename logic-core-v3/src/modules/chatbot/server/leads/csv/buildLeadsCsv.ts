import type { ChatbotLeadStatus, LeadCategory } from '@prisma/client'
import { rowToCsv, UTF8_BOM, CSV_NEWLINE } from './csvEscape'

/**
 * B5.9 — Construye el CSV de leads en lenguaje del dueño.
 *
 * Reglas estrictas (por sprint):
 *  - JAMÁS sale al CSV: `botConfigId`, `scoreSignals`, `score` crudo,
 *    `internalNotes`, `notificationSent*`, IDs internos.
 *  - Clasificación efectiva → "Caliente / Tibio / Frío" (NO el número).
 *  - Intent → frase legible ("Quiere comprar" vs `purchase_ready`).
 *  - Estado → frase legible ("Sin contactar" vs `NEW`).
 *  - Fecha → DD/MM/YYYY HH:mm en TZ Argentina.
 *  - Modo DQ: columnas diferentes (sin "Qué tan listo está" — los DQ no tienen
 *    clasificación comercial; se agrega "Motivo de descarte").
 *  - Encoding: UTF-8 con BOM para Excel.
 *  - Newline: CRLF (RFC 4180).
 */

type EffectiveClassification = 'hot' | 'warm' | 'cold' | 'dq' | null

const CLASSIFICATION_LABELS: Record<Exclude<EffectiveClassification, null>, string> = {
  hot: 'Caliente',
  warm: 'Tibio',
  cold: 'Frío',
  dq: 'Descartado',
}

const STATUS_LABELS: Record<ChatbotLeadStatus, string> = {
  NEW: 'Sin contactar',
  CONTACTED: 'Contactado',
  IN_NEGOTIATION: 'En negociación',
  WON: 'Cliente',
  LOST: 'Perdido',
}

const INTENT_LABELS: Record<string, string> = {
  // B5.1+ canon
  purchase_ready: 'Quiere comprar',
  schedule_visit: 'Quiere agendar visita',
  quote_request: 'Pide cotización',
  human_request: 'Pide hablar con humano',
  support: 'Soporte / problema',
  other: 'Otro',
  unknown: 'Sin especificar',
  // Pre-B5.1 (rows legacy en DB que tienen estos valores)
  quote: 'Pide cotización',
  info: 'Pide información',
  demo: 'Pide demo / visita',
}

const CATEGORY_LABELS: Record<LeadCategory, string> = {
  sales: 'Venta',
  postventa: 'Postventa',
  employment: 'Búsqueda de empleo',
  provider: 'Proveedor',
  spam: 'Spam',
  other: 'Otro',
}

const AR_DATETIME_FMT = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function formatCapturedAt(d: Date): string {
  // es-AR Intl mete coma entre fecha y hora ("24/05/2026, 10:35"). La sacamos
  // para que se vea más natural y ordenar en Excel sea trivial.
  return AR_DATETIME_FMT.format(d).replace(',', '')
}

function labelClassification(cls: EffectiveClassification): string {
  if (!cls) return 'Sin clasificar'
  return CLASSIFICATION_LABELS[cls]
}

function labelIntent(intent: string | null): string {
  if (!intent) return 'Sin especificar'
  return INTENT_LABELS[intent] ?? intent
}

function labelStatus(status: ChatbotLeadStatus): string {
  return STATUS_LABELS[status]
}

function labelCategory(cat: LeadCategory): string {
  return CATEGORY_LABELS[cat]
}

export interface LeadForCsv {
  name: string | null
  email: string | null
  phone: string | null
  intent: string | null
  message: string | null
  capturedAt: Date
  status: ChatbotLeadStatus
  effectiveClassification: EffectiveClassification
  category: LeadCategory
  /** EV.5 — clave del pack vertical del bot. Opcional: undefined/null → no se muestra. */
  verticalPack?: string | null
  /**
   * EV.5 — señales del pack con puntos (desde ChatbotLead.signals EV.2).
   * null para leads legacy pre-EV.3 (antes del dual-write). Se exporta como JSON
   * en una columna única: convención más simple que columnas dinámicas, ya que
   * las claves de señal varían por pack. El receptor (dueño / n8n) parsea el JSON.
   */
  signalsV2?: Record<string, { value: boolean; points: number }> | null
}

export interface BuildLeadsCsvOptions {
  /** Si true, se asume que `leads` son DQ y se usa el header alternativo. */
  includesDq: boolean
  /**
   * P0.3 — Si false, se omite la columna "Qué tan listo está" (clasificación
   * caliente/tibio/frío) — para planes sin la feature de priorización. Solo
   * aplica al header comercial; en modo DQ no hay columna de clasificación de
   * todas formas. Default true (retro-compatible).
   */
  includeClassification?: boolean
}

/**
 * Devuelve el string CSV completo (BOM + headers + filas) listo para servir
 * como descarga. Cada celda pasa por `csvEscape` — anti-injection garantizado.
 */
export function buildLeadsCsv(
  leads: LeadForCsv[],
  opts: BuildLeadsCsvOptions = { includesDq: false },
): string {
  // P0.3 — default true: si no se pasa, mantiene el comportamiento histórico.
  const includeClassification = opts.includeClassification ?? true

  const headers = opts.includesDq
    ? [
        'Nombre',
        'Email',
        'Teléfono',
        'Qué pidió',
        'Mensaje',
        'Motivo de descarte',
        'Pack vertical',   // EV.5
        'Señales del pack', // EV.5 — JSON: {señal: {value, points}}
        'Fecha de contacto',
      ]
    : [
        'Nombre',
        'Email',
        'Teléfono',
        'Qué pidió',
        'Mensaje',
        // Columna de priorización solo si el plan la incluye.
        ...(includeClassification ? ['Qué tan listo está'] : []),
        'Estado',
        'Pack vertical',   // EV.5
        'Señales del pack', // EV.5 — JSON: {señal: {value, points}}
        'Fecha de contacto',
      ]

  const lines: string[] = [rowToCsv(headers)]

  for (const lead of leads) {
    // EV.5 — columnas de pack vertical y señales (presentes en ambos modos).
    const packCell = lead.verticalPack ?? ''
    const signalsCell = lead.signalsV2 ? JSON.stringify(lead.signalsV2) : ''

    if (opts.includesDq) {
      lines.push(
        rowToCsv([
          lead.name,
          lead.email,
          lead.phone,
          labelIntent(lead.intent),
          lead.message,
          labelCategory(lead.category),
          packCell,
          signalsCell,
          formatCapturedAt(lead.capturedAt),
        ]),
      )
    } else {
      lines.push(
        rowToCsv([
          lead.name,
          lead.email,
          lead.phone,
          labelIntent(lead.intent),
          lead.message,
          ...(includeClassification
            ? [labelClassification(lead.effectiveClassification)]
            : []),
          labelStatus(lead.status),
          packCell,
          signalsCell,
          formatCapturedAt(lead.capturedAt),
        ]),
      )
    }
  }

  // Trailing CRLF: muchos parsers lo esperan (RFC 4180 §2.1).
  return UTF8_BOM + lines.join(CSV_NEWLINE) + CSV_NEWLINE
}
