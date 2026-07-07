/**
 * INFRA.2 — Idempotencia del user message ante el retry del widget (cold-start de
 * Neon free). Cuando la DB está dormida, el cold-start puede exceder el límite de la
 * función serverless y el turno se pierde; el widget reintenta el POST a `/chat`. Para
 * que ese reintento sea SEGURO, el server no debe duplicar el mensaje del visitante.
 *
 * La huella de un retry perdido: el intento anterior alcanzó a persistir la fila USER
 * pero murió antes del `onFinish` que persiste el ASSISTANT → la conversación quedó con
 * una **cola USER sin responder**. Deduplicamos SOLO ese caso, leyendo columnas ya
 * existentes (sin migración): la cola de la conversación (`orderBy createdAt desc`).
 *
 * Por qué "cola sin responder" y no `content + ventana` a secas: en es-AR se repiten
 * afirmaciones cortas ("sí", "ok", "dale", "listo"). Un `content + ventana` plano
 * tiraría en silencio la 2ª afirmación legítima (ya respondida) → transcript corrupto.
 * Una re-pregunta legítima YA tiene un ASSISTANT después, así que su cola no es USER y
 * NO se saltea. La ventana es solo el borde para no "adoptar" un huérfano de un turno
 * realmente abandonado; la corrección la da el rol de la cola.
 *
 * Este módulo es la decisión PURA (sin DB, sin reloj propio, sin señal de tenant), al
 * mismo estilo que `src/lib/upsell/dedup.ts`. El caller (handleChatRequest) lee la cola
 * y le pasa el `now` explícito.
 */
import type { ChatMessageRole } from '@prisma/client'

/**
 * Ventana de deduplicación. Cubre el sobre completo de un retry (intento +
 * backoff + intento): el huérfano se escribe cerca del FINAL del intento-1 (tras
 * despertar la DB) y se lee cerca del INICIO del intento-2, así que en la práctica la
 * brecha es ~el backoff. 90s da margen de sobra sin volverse tan largo que adopte un
 * huérfano de un turno viejo abandonado con contenido idéntico.
 */
export const USER_PERSIST_DEDUP_WINDOW_MS = 90_000

/** La última fila de la conversación (o null si no hay ninguna). */
export interface TailMessage {
  role: ChatMessageRole
  content: string
  createdAt: Date
}

/**
 * ¿Se debe SALTAR el `create` de la fila USER? (true = es el duplicado de un retry.)
 *
 * - Sin cola (conversación vacía) → NO saltear (primer mensaje).
 * - Cola NO es USER (ya hay un ASSISTANT/SYSTEM después) → NO saltear (re-pregunta
 *   legítima, incluso si el contenido coincide).
 * - Cola USER con contenido distinto → NO saltear (mensaje nuevo).
 * - Cola USER con contenido idéntico DENTRO de la ventana → saltear (retry duplicado).
 *
 * Pura y determinista: recibe `now` explícito, no lee reloj ni DB, y no recibe ninguna
 * señal de tenant (no puede filtrar datos entre conversaciones).
 */
export function shouldSkipUserPersist(
  tail: TailMessage | null,
  incomingContent: string,
  now: Date,
  windowMs: number = USER_PERSIST_DEDUP_WINDOW_MS,
): boolean {
  if (!tail) return false
  if (tail.role !== 'USER') return false
  if (tail.content !== incomingContent) return false
  return now.getTime() - tail.createdAt.getTime() < windowMs
}
