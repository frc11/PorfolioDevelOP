/**
 * Deduplicación de las solicitudes de upsell (P5.2).
 *
 * Antes, cada click en "Desbloquear"/"Avisame cuando esté" creaba un
 * `ContactSubmission` nuevo (+ alerta + notificaciones): 5 clicks = 5 leads inbound
 * idénticos. El contador de intensidad (`OrganizationModule.upsellRequestCount`) ya
 * está deduplicado a nivel de fila por el `@@unique([organizationId, moduleId])` y NO
 * se toca; el agujero era solo el lado `ContactSubmission`/notificación.
 *
 * Este módulo es la decisión PURA (sin DB, sin reloj propio) de si un click concreto
 * debe generar un nuevo evento de contacto o tratarse como idempotente.
 */

/**
 * Ventana de deduplicación. Dentro de ella, clicks repetidos del mismo cliente sobre
 * el mismo módulo NO generan un nuevo `ContactSubmission`.
 *
 * 24h: cubre el rage-click y la "revisita en el día" sin silenciar un interés renovado
 * días después (que sí vale como lead nuevo para el equipo comercial).
 */
export const UPSELL_DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * ¿Se debe crear un nuevo `ContactSubmission` para esta solicitud de upsell?
 *
 * - Sin solicitud previa (`lastRequestedAt` nulo) → sí (primera vez).
 * - Última solicitud hace MÁS que la ventana → sí (interés renovado, lead nuevo).
 * - Última solicitud DENTRO de la ventana → no (duplicado; idempotente).
 *
 * Pura y determinista: recibe el `now` explícito, así que es testeable sin reloj y no
 * depende de ninguna señal de tenant (no puede filtrar datos entre orgs).
 */
export function shouldCreateUpsellSubmission(
  lastRequestedAt: Date | null | undefined,
  now: Date,
  windowMs: number = UPSELL_DEDUP_WINDOW_MS,
): boolean {
  if (!lastRequestedAt) return true
  return now.getTime() - lastRequestedAt.getTime() >= windowMs
}
