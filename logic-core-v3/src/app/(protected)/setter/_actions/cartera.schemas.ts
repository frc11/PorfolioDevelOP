/**
 * LeadOS B-beta — Contratos de las palancas de organización de la cartera del
 * setter (pin / snooze / nota propia). El cliente y la action validan contra el
 * MISMO schema; la action nunca confía en el input sin parsear.
 */
import { z } from 'zod'

/** Tope de la nota propia: un recordatorio corto, no un documento. */
export const NOTA_MAX = 240

export const PinSchema = z.boolean()

export const NotaSchema = z
  .string()
  .max(NOTA_MAX, `La nota no puede superar los ${NOTA_MAX} caracteres`)

/** Fecha de la pausa personal — el cliente manda 'YYYY-MM-DD' (input date). */
export const SnoozeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Elegí una fecha válida')
