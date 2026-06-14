/**
 * LeadOS B5 — Reglas puras de la cola de revisión del admin. Sin Prisma ni
 * 'use server' (mismo criterio que flow.ts): las consumen los server
 * components de /admin/leados y son testeables en frío.
 *
 *   - Orden obligatorio de la cola: calientes (score >= 4) primero, después
 *     por antigüedad de entrada a revisión. Proxy de "entrada a revisión":
 *     `updatedAt` del dossier — la transición a EN_REVISION es su último
 *     write (los blobs Json quedan congelados en ese stage).
 *   - Métrica anti-rubber-stamp: descarte vs avance de las evaluaciones de
 *     cada setter (veredicto DESCARTAR vs AVANZAR/CALIENTE), total y últimos
 *     30 días (ventana por `evaluacion.fecha`, estampada desde B5).
 */
import type { Evaluacion } from '@/lib/leados/contracts'

export const SCORE_CALIENTE = 4

export function esCaliente(score: number | null): boolean {
  return score !== null && score >= SCORE_CALIENTE
}

export function ordenarCola<T extends { caliente: boolean; esperaDesde: Date }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    if (a.caliente !== b.caliente) return a.caliente ? -1 : 1
    return a.esperaDesde.getTime() - b.esperaDesde.getTime()
  })
}

/** "hace 20 min" / "hace 3 h" / "hace 2 días" — cuánto espera un ítem. */
export function formatEspera(desde: Date, ahora: Date): string {
  const diffMs = Math.max(0, ahora.getTime() - desde.getTime())
  const minutos = Math.floor(diffMs / 60_000)
  if (minutos < 60) return `hace ${Math.max(1, minutos)} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`
}

// ── Métrica descarte/avance ──────────────────────────────────────────────────

const TREINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000

export type RatioConteo = {
  evaluadas: number
  descartadas: number
  avanzadas: number
}

export type RatioSetter = {
  setterId: string
  setterLabel: string
  total: RatioConteo
  ultimos30d: RatioConteo
  /** Sin fecha de evaluación (pre-B5): cuentan en el total, no en los 30d. */
  sinFecha: number
}

export type EvaluacionDeSetter = {
  setterId: string
  setterLabel: string
  evaluacion: Evaluacion
}

export function calcularRatioSetters(
  rows: EvaluacionDeSetter[],
  ahora: Date,
): RatioSetter[] {
  const porSetter = new Map<string, RatioSetter>()
  const desde30d = ahora.getTime() - TREINTA_DIAS_MS

  for (const row of rows) {
    let ratio = porSetter.get(row.setterId)
    if (!ratio) {
      ratio = {
        setterId: row.setterId,
        setterLabel: row.setterLabel,
        total: { evaluadas: 0, descartadas: 0, avanzadas: 0 },
        ultimos30d: { evaluadas: 0, descartadas: 0, avanzadas: 0 },
        sinFecha: 0,
      }
      porSetter.set(row.setterId, ratio)
    }

    const descarta = row.evaluacion.veredicto === 'DESCARTAR'
    ratio.total.evaluadas += 1
    if (descarta) ratio.total.descartadas += 1
    else ratio.total.avanzadas += 1

    const fechaMs = row.evaluacion.fecha ? Date.parse(row.evaluacion.fecha) : NaN
    if (Number.isNaN(fechaMs)) {
      ratio.sinFecha += 1
    } else if (fechaMs >= desde30d) {
      ratio.ultimos30d.evaluadas += 1
      if (descarta) ratio.ultimos30d.descartadas += 1
      else ratio.ultimos30d.avanzadas += 1
    }
  }

  return [...porSetter.values()].sort((a, b) =>
    a.setterLabel.localeCompare(b.setterLabel),
  )
}

/** % de descarte (0–100, redondeado). null si no hay evaluaciones. */
export function pctDescarte(conteo: RatioConteo): number | null {
  if (conteo.evaluadas === 0) return null
  return Math.round((conteo.descartadas / conteo.evaluadas) * 100)
}

/** Alarma anti-rubber-stamp: volumen suficiente y cero descartes. */
export function alarmaNuncaDescarta(total: RatioConteo): boolean {
  return total.evaluadas >= 5 && total.descartadas === 0
}
