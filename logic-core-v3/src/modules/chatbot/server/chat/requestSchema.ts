/**
 * MS-E6.2 — Contrato de entrada del endpoint de chat: schema del body y los
 * helpers que leen el request crudo.
 *
 * Movido VERBATIM desde `handleChatRequest.ts` (costura A del refactor). Cero
 * cambio de comportamiento: son funciones puras y un schema inmutable, sin
 * estado de request ni I/O.
 */
import { z } from 'zod'
import { sanitizeAttributionField } from '../../shared/attribution'
import {
  trimHistory,
  HISTORY_WINDOW_MESSAGES,
  MAX_MESSAGES_SHAPE,
  MAX_MESSAGE_CHARS,
} from '../../shared/historyPolicy'

// UTM.1 — Los campos de atribución (referrer + utm_*) son input del
// visitante (query string / document.referrer) → SIEMPRE sanitizados acá:
// se quitan caracteres de control y se recorta a `maxLength`. Nunca rechazan
// la request (sanitización silenciosa, no validación estricta) — son datos
// de atribución best-effort, no lógica crítica.
const attributionField = (maxLength: number) =>
  z
    .string()
    .nullish()
    .transform((val) => (val == null ? undefined : sanitizeAttributionField(val, maxLength)))

/**
 * Body schema for POST /api/chatbot/[slug]/chat.
 * Validates incoming requests from the frontend.
 *
 * Exportado (UTM.1) para que el invariant de sanitización de atribución
 * pueda testear el schema real vía requestBodySchema.parse(...), no solo
 * las funciones puras de shared/attribution.ts.
 */
export const requestBodySchema = z.object({
  // C0.2 — una conversación larga NUNCA muere en 400 por longitud:
  //  - Camino normal: recorte, no rechazo. El transform aplica trimHistory —
  //    los últimos HISTORY_WINDOW_MESSAGES, con el último 'user' (el turno en
  //    curso) SIEMPRE preservado y la ventana user-led. `body.messages` aguas
  //    abajo ya es la ventana recortada.
  //  - min/max quedan solo como validación de FORMA (payload absurdo que
  //    ningún widget real produce — ver historyPolicy.ts). Superarlos sí es 400.
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(MAX_MESSAGE_CHARS),
      })
    )
    .min(1)
    .max(MAX_MESSAGES_SHAPE)
    .transform((msgs) => trimHistory(msgs, HISTORY_WINDOW_MESSAGES)),
  sessionId: z.string().min(1).max(200),
  currentPath: z.string().max(500).optional(),
  referrer: attributionField(500),
  // Proactive teaser question the bot "asked" via the tooltip. Client-supplied →
  // VALIDATED server-side against the bot's configured proactivePrompts before it
  // is trusted into the system prompt. Never enters the conversation as a turn.
  proactiveOpener: z.string().max(500).optional(),
  // UTM.1 — first-touch, ver getOrCreateConversation (resolver.ts) para la
  // semántica de "se persisten una sola vez".
  utmSource: attributionField(255),
  utmMedium: attributionField(255),
  utmCampaign: attributionField(255),
})

export type RequestBody = z.infer<typeof requestBodySchema>

/**
 * Safely extracts the set of admin-configured proactive-prompt strings from the
 * `BotConfig.proactivePrompts` JSON (shape: Record<string, string[]>). Defensive
 * against malformed JSON. Used to validate a client-supplied `proactiveOpener`
 * before it is trusted into the system prompt — only an EXACT match with a
 * configured prompt is accepted, so a forged opener can never inject text.
 */
export function collectProactivePrompts(raw: unknown): Set<string> {
  const out = new Set<string>()
  if (raw && typeof raw === 'object') {
    for (const value of Object.values(raw as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') out.add(item)
        }
      }
    }
  }
  return out
}

/**
 * C0.2 — Largo del array `messages` del body CRUDO (antes del recorte del
 * transform del schema), solo para telemetría: permite ver cuánto recorta la
 * ventana server sobre tráfico real. Defensivo contra cualquier shape.
 */
export function countRawMessages(json: unknown): number | null {
  if (json && typeof json === 'object') {
    const messages = (json as { messages?: unknown }).messages
    if (Array.isArray(messages)) return messages.length
  }
  return null
}

/**
 * Best-effort extraction of client IP from request headers.
 * Returns "unknown" if no header is available (e.g. local dev).
 */
export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}
