import { tool } from 'ai'
import { z } from 'zod'

/**
 * Tool `show_whatsapp_handoff` — CLIENT-SIDE.
 *
 * Renders a rich action card with a button that opens WhatsApp
 * with a pre-filled message containing the conversation summary.
 *
 * No execute — the frontend handles rendering and the wa.me link.
 */

export const showWhatsappHandoffInputSchema = z.object({
  prefilledMessage: z.string().min(20).max(500).describe(
    'Mensaje completo pre-llenado para WhatsApp. DEBE incluir saludo, nombre del usuario si lo dio, y resumen breve (1-2 oraciones) de lo que está buscando. Tono: español rioplatense informal. Ej: "Hola! Soy Juan, estoy buscando info sobre el servicio de IA para mi concesionaria. Hablé con el bot y quiero seguir por acá."'
  ),
})

export type ShowWhatsappHandoffInput = z.infer<typeof showWhatsappHandoffInputSchema>

export const SHOW_WHATSAPP_HANDOFF_DESCRIPTION = `Renderiza una tarjeta visual con un botón CTA grande para abrir WhatsApp con un mensaje pre-llenado que resume la conversación.

USAR: cuando el usuario eligió WhatsApp explícitamente (después de offer_handoff_options), o cuando pide hablar con un humano sin pasar por capture_lead.

El mensaje pre-llenado DEBE contener:
- Saludo inicial
- Nombre del usuario (si ya lo dio)
- Resumen breve de lo que está buscando (1-2 oraciones)
- Tono: español rioplatense informal`

export function buildShowWhatsappHandoffTool() {
  return tool({
    description: SHOW_WHATSAPP_HANDOFF_DESCRIPTION,
    inputSchema: showWhatsappHandoffInputSchema,
    // No execute — client-side tool.
  })
}
