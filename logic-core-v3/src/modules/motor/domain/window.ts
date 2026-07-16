/**
 * La ventana de servicio de 24h como DOMINIO puro (B1-S2).
 *
 * Regla del BSP: dentro de las 24h desde el último mensaje ENTRANTE del usuario
 * se puede mandar texto libre (servicio, gratis); fuera, SOLO plantillas
 * aprobadas. Esta función deriva el estado de la ventana a partir de
 * `lastInboundAt` (el que persiste MotorConversation) y un `now` explícito —
 * sin efectos, sin leer reloj adentro: el caller inyecta el instante, así el
 * test fija los bordes con exactitud.
 *
 * La ventana NO se persiste: se recalcula en cada envío. Ver
 * `services/sendMessage.ts` para la aplicación de la regla.
 */

/** 24 horas en milisegundos: el ancho de la ventana de servicio. */
export const SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000

export type WindowState =
  | { readonly state: 'OPEN'; readonly expiresAt: Date }
  | { readonly state: 'CLOSED' }

/**
 * Estado de la ventana en el instante `now`.
 *
 *   - Sin `lastInboundAt` (null): el usuario nunca escribió → CLOSED (una
 *     conversación iniciada por plantilla no abre ventana de texto libre).
 *   - `now` estrictamente ANTES de lastInboundAt + 24h → OPEN(expiresAt).
 *   - `now` EN o DESPUÉS del borde de 24h → CLOSED. El borde exacto (now ==
 *     expiresAt) es CLOSED: la ventana es el intervalo semiabierto
 *     [lastInboundAt, lastInboundAt + 24h).
 */
export function windowState(lastInboundAt: Date | null, now: Date): WindowState {
  if (lastInboundAt === null) return { state: 'CLOSED' }
  const expiresAt = new Date(lastInboundAt.getTime() + SERVICE_WINDOW_MS)
  if (now.getTime() < expiresAt.getTime()) {
    return { state: 'OPEN', expiresAt }
  }
  return { state: 'CLOSED' }
}
