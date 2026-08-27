/**
 * LeadOS B-beta — Contratos de las palancas de organización de la cartera del
 * setter (pin / snooze / nota propia). El cliente y la action validan contra el
 * MISMO schema; la action nunca confía en el input sin parsear.
 */
import { z } from 'zod'
import { parseCalendarDayAR } from '@/lib/dates-ar'

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

/** Un día completo en milisegundos, y el último segundo de ese día. */
const DIA_MS = 86_400_000
const ULTIMO_SEGUNDO_DEL_DIA_MS = DIA_MS - 1_000

/**
 * El día de calendario que el setter eligió → el instante en que la pausa
 * TERMINA: las 23:59:59 en hora ARGENTINA de ese día. Queda pausado durante toda
 * esa fecha y retoma al siguiente.
 *
 * ── Por qué existe (P8, caso 3) ─────────────────────────────────────────────
 * `pausarLead` lo calculaba con `new Date(\`${dia}T23:59:59\`)`. Un date-time SIN
 * designador de zona se parsea en la hora LOCAL DEL PROCESO: en la máquina de
 * Franco (AR, UTC-3) da lo correcto, pero en el servidor (UTC) guarda tres horas
 * antes — medido: `2026-08-28` daba `2026-08-29T02:59:59Z` acá y
 * `2026-08-28T23:59:59Z` allá. El bug no se ve en desarrollo, y ahora hay un
 * filtro de cartera («Pausados por vos») que se decide con este campo.
 *
 * El borde sale del ancla que F1 dejó (`parseCalendarDayAR`: 00:00 AR del día
 * elegido), no del reloj del proceso. El instante resultante es EXACTAMENTE el
 * mismo que producía el código viejo corriendo en AR — este arreglo cambia de
 * dónde sale el borde, no cuál es.
 *
 * `null` si el texto no es un día de calendario REAL: `parseCalendarDayAR`
 * rechaza los desbordes que `Date.UTC` normalizaría en silencio (31-feb → 3-mar),
 * que el regex de `SnoozeSchema` deja pasar.
 */
export function finDePausaAR(dia: string): Date | null {
  const inicioDelDia = parseCalendarDayAR(dia)
  if (inicioDelDia === null) return null
  return new Date(inicioDelDia.getTime() + ULTIMO_SEGUNDO_DEL_DIA_MS)
}
