/**
 * LeadOS B7 — Cliente de la API v2 de Cal.com (slots + bookings).
 *
 * NUEVO y separado a propósito de `cal-com.ts` (v1): la v1 fue apagada el
 * 8/abr/2026 y ese módulo es deuda aparte del dashboard del cliente — acá no
 * se toca. Todo lo de este archivo está verificado contra la API real en el
 * probe (docs/b7-probe-cal-com.md):
 *
 *   - GET  /v2/slots            → SIN auth, header `cal-api-version: 2024-09-04`.
 *   - POST /v2/bookings         → SIN auth, header `cal-api-version: 2026-02-25`.
 *     Cal.com escribe el evento en el Google Calendar conectado y manda los
 *     mails nativos de confirmación — NO se construyen notificaciones propias.
 *   - POST /v2/bookings/{uid}/cancel → reversión (smoke test y compensación).
 *
 * Sin Prisma ni sesión: cliente HTTP puro. La config (username/slug) la
 * resuelve `lib/leados/agenda.ts`; los errores salen como `CalComV2Error`
 * con mensaje seguro para mostrar (nunca se filtra el cuerpo crudo al UI).
 */

const BASE_URL = 'https://api.cal.com/v2'
const SLOTS_API_VERSION = '2024-09-04'
const BOOKINGS_API_VERSION = '2026-02-25'

/** Huso fijo de toda la agenda LeadOS — los slots se piden y muestran en BA. */
export const TIMEZONE_AGENDA = 'America/Argentina/Buenos_Aires'

export type CalComErrorTipo = 'slot_ocupado' | 'validacion' | 'no_encontrado' | 'red'

export class CalComV2Error extends Error {
  readonly tipo: CalComErrorTipo

  constructor(tipo: CalComErrorTipo, message: string) {
    super(message)
    this.name = 'CalComV2Error'
    this.tipo = tipo
  }
}

/** Mapa fecha (YYYY-MM-DD, en TIMEZONE_AGENDA) → starts ISO con offset -03:00. */
export type SlotsPorDia = Record<string, { start: string }[]>

type GetSlotsInput = {
  username: string
  eventTypeSlug: string
  /** Rango ISO date (YYYY-MM-DD) inclusive. */
  start: string
  end: string
}

export async function getSlots(input: GetSlotsInput): Promise<SlotsPorDia> {
  const params = new URLSearchParams({
    username: input.username,
    eventTypeSlug: input.eventTypeSlug,
    start: input.start,
    end: input.end,
    timeZone: TIMEZONE_AGENDA,
  })

  const res = await fetchCal(`${BASE_URL}/slots?${params.toString()}`, {
    method: 'GET',
    headers: { 'cal-api-version': SLOTS_API_VERSION },
  })

  if (!res.ok) {
    throw await mapearError(res, 'No se pudieron pedir los horarios a Cal.com')
  }

  const body = (await res.json()) as { status?: string; data?: unknown }
  const data = body.data
  if (body.status !== 'success' || data === null || typeof data !== 'object') {
    throw new CalComV2Error('red', 'Cal.com devolvió una respuesta de slots inesperada')
  }

  const slots: SlotsPorDia = {}
  for (const [dia, lista] of Object.entries(data as Record<string, unknown>)) {
    if (!Array.isArray(lista)) continue
    slots[dia] = lista
      .map((slot) =>
        slot && typeof slot === 'object' && typeof (slot as { start?: unknown }).start === 'string'
          ? { start: (slot as { start: string }).start }
          : null,
      )
      .filter((slot): slot is { start: string } => slot !== null)
  }
  return slots
}

type CreateBookingInput = {
  username: string
  eventTypeSlug: string
  /** Inicio SIEMPRE en UTC (sin offset) — convención de la API v2. */
  startUtc: string
  attendee: {
    name: string
    email: string
  }
  /** Hasta 50 keys string — acá viaja el leadId para cerrar el loop. */
  metadata: Record<string, string>
}

export type CalBooking = {
  uid: string
  status: string
  start: string | null
  end: string | null
}

export async function createBooking(input: CreateBookingInput): Promise<CalBooking> {
  const res = await fetchCal(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'cal-api-version': BOOKINGS_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventTypeSlug: input.eventTypeSlug,
      username: input.username,
      start: input.startUtc,
      attendee: {
        name: input.attendee.name,
        email: input.attendee.email,
        timeZone: TIMEZONE_AGENDA,
        language: 'es',
      },
      metadata: input.metadata,
    }),
  })

  if (!res.ok) {
    throw await mapearError(res, 'Cal.com no pudo crear la reunión')
  }

  const body = (await res.json()) as {
    status?: string
    data?: { uid?: unknown; status?: unknown; start?: unknown; end?: unknown }
  }
  const data = body.data
  if (body.status !== 'success' || !data || typeof data.uid !== 'string') {
    throw new CalComV2Error('red', 'Cal.com no devolvió el uid del booking')
  }

  return {
    uid: data.uid,
    status: typeof data.status === 'string' ? data.status : 'unknown',
    start: typeof data.start === 'string' ? data.start : null,
    end: typeof data.end === 'string' ? data.end : null,
  }
}

export async function cancelBooking(uid: string, motivo: string): Promise<void> {
  const res = await fetchCal(`${BASE_URL}/bookings/${encodeURIComponent(uid)}/cancel`, {
    method: 'POST',
    headers: {
      'cal-api-version': BOOKINGS_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancellationReason: motivo }),
  })

  if (!res.ok) {
    throw await mapearError(res, 'Cal.com no pudo cancelar el booking')
  }
}

/** fetch con errores de red normalizados (DNS caído, timeout, etc.). */
async function fetchCal(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (error) {
    console.error('[cal-com-v2] error de red:', error)
    throw new CalComV2Error('red', 'No se pudo hablar con Cal.com — revisá la conexión y reintentá')
  }
}

/**
 * Error HTTP → CalComV2Error con mensaje seguro. El cuerpo crudo va al log
 * del server, nunca al cliente. El caso clave del flujo es el slot pisado:
 * Cal.com responde 400/409 con "already booked"/"no_available_users" cuando
 * el horario se ocupó entre la oferta y la confirmación.
 */
async function mapearError(res: Response, fallback: string): Promise<CalComV2Error> {
  const cuerpo = await res.text().catch(() => '')
  console.error(`[cal-com-v2] HTTP ${res.status}:`, cuerpo.slice(0, 500))

  const textoLower = cuerpo.toLowerCase()
  if (
    res.status === 409 ||
    textoLower.includes('already booked') ||
    textoLower.includes('no_available_users') ||
    textoLower.includes('not available')
  ) {
    return new CalComV2Error(
      'slot_ocupado',
      'Ese horario se acaba de ocupar — pedí los horarios de nuevo y ofrecé otro',
    )
  }
  if (res.status === 404) {
    return new CalComV2Error(
      'no_encontrado',
      'Cal.com no encontró el event type — revisá el username y el slug cargados en la org (setup B7.0)',
    )
  }
  if (res.status === 400 || res.status === 422) {
    return new CalComV2Error('validacion', 'Cal.com rechazó los datos de la reunión — revisá horario y email')
  }
  return new CalComV2Error('red', fallback)
}
