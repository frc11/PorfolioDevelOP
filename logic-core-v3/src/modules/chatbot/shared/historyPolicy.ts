/**
 * C0.2 — Política PURA de historial de conversación: la conversación larga no
 * muere muda. Compartida por el server (schema del body + gating) y el widget
 * (ventana de envío en useChatbot, ambos renders), así cliente y server recortan
 * con EXACTAMENTE la misma lógica. Sin efectos (ni DB ni reloj) para poder
 * testearla con el idioma invariante del repo.
 *
 * Reglas duras:
 *  - Recortar, no rechazar: superar la ventana NUNCA tira 400 — se mandan/usan
 *    los últimos HISTORY_WINDOW_MESSAGES. El rechazo queda solo como validación
 *    de forma (MAX_MESSAGES_SHAPE / MAX_MESSAGE_CHARS: payloads que ningún
 *    widget real produce).
 *  - Invariante del recorte: el último mensaje 'user' (el turno en curso) queda
 *    SIEMPRE dentro de la ventana. Si el recorte se lo comiera, la ventana se
 *    ancla en él.
 *  - La ventana queda user-led (Gemini/Vertex lo requiere — mismo motivo por el
 *    que el widget filtra las burbujas proactive-*): mensajes assistant/system
 *    huérfanos al frente del corte se descartan.
 *  - Camino corto intacto: un array que entra en la ventana se devuelve tal
 *    cual (misma referencia, cero cambio de comportamiento).
 */

/**
 * Ventana deslizante de historial (en mensajes, user+assistant ≈ 2 por turno).
 * 30 mensajes = ~15 turnos del visitante: el horizonte del soft-cap del prompt
 * (SOFT_CAP_THRESHOLD) — más atrás el contexto aporta poco a la venta y el
 * costo de re-mandarlo a Vertex crece lineal por turno. El widget manda esta
 * ventana; el server recorta a lo mismo (idempotente sobre tráfico sano,
 * defensa sobre clientes viejos/hostiles).
 */
export const HISTORY_WINDOW_MESSAGES = 30

/**
 * Tope de forma del array (defensa contra payload absurdo, NO el cap operativo).
 * Entre la ventana del widget (30) y el hard-cap (que degrada la conversación y
 * bloquea el input alrededor del mensaje ~41), ningún cliente legítimo — ni un
 * tab viejo pre-deploy que acumule todo — llega a 50 items. Superarlo = 400.
 */
export const MAX_MESSAGES_SHAPE = 50

/**
 * Tope de chars por mensaje (forma). 4000 ≈ 2.5–3× el reply real más largo del
 * bot (formato corto mobile forzado por prompt) y muy por encima de cualquier
 * consulta real del visitante. El costo de quedarse corto es asimétrico: un
 * mensaje del historial que exceda el cap deja la conversación en 400 hasta que
 * sale de la ventana — por eso margen amplio, no percentil justo. El textarea
 * del widget usa el mismo valor como maxLength (el cliente nunca produce un
 * mensaje que el server rechazaría).
 */
export const MAX_MESSAGE_CHARS = 4000

/**
 * Hard-cap de conversación, evaluado server-side sobre Conversation.messageCount
 * (autoritativo, cuenta user+assistant persistidos: ~2 por turno → 40 mensajes
 * ≈ 20 turnos del visitante). Es un GATE en handleChatRequest — no una
 * sugerencia al modelo como el soft-cap (15 turnos, sections.ts): al alcanzarlo
 * la respuesta es degradada con dignidad (CTA a WhatsApp si está configurado),
 * cero costo de LLM. 5 turnos de pista después del soft-cap para que el modelo
 * oriente el cierre antes de la pared.
 */
export const HARD_CAP_MESSAGES = 40

/**
 * Recorta el historial a los últimos `windowSize` mensajes preservando SIEMPRE
 * el último mensaje 'user' (el turno en curso) y dejando la ventana user-led.
 *
 * Un array sin ningún 'user' no tiene turno en curso que proteger: recorte
 * plano y el handler decide (hoy: 400 "No user message found", igual que
 * siempre). Un array que entra en la ventana vuelve tal cual (misma
 * referencia — camino corto intacto).
 */
export function trimHistory<T extends { role: string }>(
  messages: T[],
  windowSize: number = HISTORY_WINDOW_MESSAGES,
): T[] {
  if (windowSize < 1 || messages.length <= windowSize) return messages

  let lastUserIdx = -1
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') {
      lastUserIdx = i
      break
    }
  }
  if (lastUserIdx === -1) return messages.slice(-windowSize)

  // Invariante dura: slice(-N) incluye el turno en curso por construcción,
  // salvo el caso patológico de una cola de ≥ N mensajes no-user después de
  // él — ahí la ventana se ancla en el turno en curso.
  const windowStart = messages.length - windowSize
  let trimmed =
    lastUserIdx < windowStart
      ? messages.slice(lastUserIdx, lastUserIdx + windowSize)
      : messages.slice(-windowSize)

  // User-led: descarta assistant/system huérfanos al frente del corte. Nunca
  // alcanza al último 'user' — el barrido frena en el primer 'user' que
  // encuentra (y hay al menos uno en la ventana por la invariante de arriba).
  let firstUser = 0
  while (firstUser < trimmed.length && trimmed[firstUser].role !== 'user') firstUser += 1
  if (firstUser > 0) trimmed = trimmed.slice(firstUser)

  return trimmed
}
