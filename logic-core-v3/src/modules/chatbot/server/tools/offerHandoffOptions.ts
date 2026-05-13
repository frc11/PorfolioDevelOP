import { tool } from 'ai'
import { z } from 'zod'

/**
 * Tool `offer_handoff_options` — CLIENT-SIDE.
 *
 * Has NO `execute` because the action happens on the frontend:
 * the chat UI renders a card with two buttons (WhatsApp / "que me contacten").
 *
 * When the user clicks one, the frontend sends a message back to the chat
 * indicating their choice, and the bot continues the conversation.
 */

export const offerHandoffOptionsInputSchema = z.object({
  preamble: z.string().min(10).max(200).describe(
    'Mensaje breve que acompaña las opciones. Ej: "¡Listo Juan! Tus datos están guardados. ¿Cómo querés seguir?". En español rioplatense.'
  ),
})

export type OfferHandoffOptionsInput = z.infer<typeof offerHandoffOptionsInputSchema>

export const OFFER_HANDOFF_OPTIONS_DESCRIPTION = `Renderiza una tarjeta con dos opciones para el usuario:
- "Hablar ya por WhatsApp" (canal inmediato)
- "Que me contacten" (asíncrono, SLA <4hs)

USAR: inmediatamente después de capture_lead exitoso.
NO USAR: antes de capture_lead. No usar sin lead capturado en esta conversación.`

export function buildOfferHandoffOptionsTool() {
  return tool({
    description: OFFER_HANDOFF_OPTIONS_DESCRIPTION,
    inputSchema: offerHandoffOptionsInputSchema,
    // No execute — client-side tool.
  })
}
