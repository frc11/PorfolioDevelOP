// P1.C — Lógica PURA del home de resultados del negocio. Sin DB, sin React:
// todo lo que se puede testear sin Neon vive acá (categorización de origen,
// promedio de velocidad, embudo, estimación de plata, bordes de período).
//
// Los bordes de período SIEMPRE salen del helper AR (dates-ar). PROHIBIDO
// new Date() manual para límites — ver `periodBoundsForHome`.

import { weekRangeAR, previousRangeForPeriod, type UTCRange } from '@/lib/dates-ar'
import { statusImpliesContact } from '@/modules/chatbot/lead-status-rules'
import { categorizeOrigin, type OriginLabel, type OriginInput } from './lead-origin'
import type { ChatbotLeadStatus } from '@prisma/client'

// El mapeo de origen se extrajo a ./lead-origin (P1.D) para compartirlo con el
// detalle del lead. Se re-exporta para no romper a quien lo importaba desde acá.
export { categorizeOrigin } from './lead-origin'
export type { OriginLabel, OriginInput } from './lead-origin'

// ── Período del home: SEMANA AR, actual vs anterior equivalente ────────────────
// El hero es "Tu semana en números" y compara "vs la semana pasada". Toda la
// aritmética de bordes delega en dates-ar (semana ISO, lunes, en hora AR).
export function periodBoundsForHome(now: Date = new Date()): {
  current: UTCRange
  previous: UTCRange
} {
  return {
    current: weekRangeAR(now),
    previous: previousRangeForPeriod('week', now),
  }
}

// ── Pregunta 1: ¿cuántos leads entraron? (variación vs período anterior) ───────
export interface LeadsDelta {
  current: number
  previous: number
  /** current - previous. Positivo = más que la semana pasada. */
  delta: number
}

export function computeLeadsDelta(current: number, previous: number): LeadsDelta {
  return { current, previous, delta: current - previous }
}

/** Frase de variación en lenguaje de dueño. null cuando no aporta (sin base). */
export function deltaPhrase(d: LeadsDelta): string | null {
  if (d.previous === 0 && d.current === 0) return null
  if (d.previous === 0) return 'primeros de la semana'
  if (d.delta === 0) return 'igual que la semana pasada'
  const signo = d.delta > 0 ? '+' : '−'
  return `${signo}${Math.abs(d.delta)} vs la semana pasada`
}

// ── Pregunta 2 (Pro+): semáforo — lo arma el componente desde el conteo + top ─
// (no hay lógica pura más allá del gate, que vive en planAllows)

// ── Pregunta 3: ¿qué tan rápido los atendí? ───────────────────────────────────
export interface VelocitySample {
  capturedAt: Date
  firstContactedAt: Date | null
}

export interface Velocity {
  /** Promedio en minutos de capturedAt→firstContactedAt. null = sin muestras. */
  avgMinutes: number | null
  /** Cuántos leads del período fueron efectivamente contactados (con sello). */
  sampleSize: number
}

export function computeVelocity(samples: VelocitySample[]): Velocity {
  const valid = samples.filter(
    (s) => s.firstContactedAt != null && s.firstContactedAt.getTime() >= s.capturedAt.getTime(),
  )
  if (valid.length === 0) return { avgMinutes: null, sampleSize: 0 }
  const totalMs = valid.reduce(
    (acc, s) => acc + (s.firstContactedAt!.getTime() - s.capturedAt.getTime()),
    0,
  )
  return { avgMinutes: Math.round(totalMs / valid.length / 60_000), sampleSize: valid.length }
}

/** "45 min" · "3 h" · "2 días". Entrada en minutos. */
export function formatVelocity(minutes: number): string {
  if (minutes < 1) return 'menos de 1 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.round(hours / 24)
  return `${days} ${days === 1 ? 'día' : 'días'}`
}

// ── Pregunta 4: ¿cuánta plata representan? ─────────────────────────────────────
/** leadCount × ticket. null cuando el ticket no está cargado (→ card de setup). */
export function estimateMoney(leadCount: number, ticketUsd: number | null): number | null {
  if (ticketUsd == null) return null
  return leadCount * ticketUsd
}

/** "US$ 12.000" — USD entero, separador de miles es-AR. */
export function formatMoneyUsd(n: number): string {
  return `US$ ${Math.round(n).toLocaleString('es-AR')}`
}

// ── Embudo: ¿qué pasó con tus leads? ──────────────────────────────────────────
export interface FunnelInput {
  status: ChatbotLeadStatus
  firstContactedAt: Date | null
}

export interface Funnel {
  total: number
  contacted: number
  sold: number
  /** Leads todavía en NEW sin primer contacto = "sin actualizar". */
  pending: number
}

export function buildFunnel(leads: FunnelInput[]): Funnel {
  let contacted = 0
  let sold = 0
  for (const l of leads) {
    const wasContacted = statusImpliesContact(l.status) || l.firstContactedAt != null
    if (wasContacted) contacted++
    if (l.status === 'WON') sold++
  }
  const total = leads.length
  return { total, contacted, sold, pending: total - contacted }
}

// ── Origen: ¿de dónde llegan? ─────────────────────────────────────────────────
// `categorizeOrigin` / `OriginLabel` / `OriginInput` viven en ./lead-origin
// (compartidos con el detalle del lead) y se re-exportan arriba. Acá queda solo
// la agregación, que es específica del home.

export interface OriginBucket {
  label: OriginLabel
  count: number
}

/**
 * Agrega los orígenes de una lista de leads en a lo sumo `topN` buckets.
 *
 * Garantía clave: la SUMA de los counts devueltos == items.length. Por eso los
 * porcentajes y el total que muestra la UI reconcilian SIEMPRE con "Leads esta
 * semana" del hero, y ninguna fuente real desaparece. Para lograrlo, lo que no
 * entra en el top se PLIEGA en 'Otros' (no se descarta con un slice). 'Otros' es
 * el cajón catch-all y siempre va último. Empates entre nominales se desempatan
 * por orden de aparición (sort estable).
 */
export function tallyOrigins(
  items: OriginInput[],
  ownHost: string | null = null,
  topN: number = 5,
): OriginBucket[] {
  const counts = new Map<OriginLabel, number>()
  for (const it of items) {
    const label = categorizeOrigin(it, ownHost)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  const otrosBase = counts.get('Otros') ?? 0
  counts.delete('Otros')
  const named = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  // Todo entra sin recortar y no hay 'Otros' → tal cual.
  if (otrosBase === 0 && named.length <= topN) return named

  // Recorte preservando la suma: top (topN-1) nominales + el resto (nominales
  // sobrantes + 'Otros' base) plegado en un único 'Otros' al final.
  const keep = named.slice(0, Math.max(0, topN - 1))
  const foldedTail = named.slice(Math.max(0, topN - 1)).reduce((acc, b) => acc + b.count, 0)
  const otros = otrosBase + foldedTail

  const result: OriginBucket[] = [...keep]
  if (otros > 0) result.push({ label: 'Otros', count: otros })
  return result
}
