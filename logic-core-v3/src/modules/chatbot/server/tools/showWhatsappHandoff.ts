import { tool } from 'ai'
import { z } from 'zod'
import { logChatbotEvent } from '../logging'
import type { ToolCallContext } from './types'

/**
 * Tool `show_whatsapp_handoff` — HYBRID.
 *
 * Execute (server): persists handoff event to ChatbotEvent for the
 * client dashboard "Derivaciones recientes" section.
 *
 * Render (client): frontend renders WhatsappHandoffCard with the wa.me link.
 */

export const showWhatsappHandoffInputSchema = z.object({
  prefilledMessage: z.string().min(20).max(500).describe(
    'Mensaje completo pre-llenado para WhatsApp. DEBE incluir saludo, nombre del usuario si lo dio, y resumen breve (1-2 oraciones) de lo que está buscando. Tono: español rioplatense informal. Ej: "Hola! Soy Juan, estoy buscando info sobre el servicio de IA para mi concesionaria. Hablé con el bot y quiero seguir por acá."'
  ),
  visitorName: z.string().max(100).optional().describe(
    'Nombre del visitante si lo mencionó en la conversación'
  ),
  reason: z.string().max(200).optional().describe(
    'Por qué se deriva a WhatsApp. Ej: "El usuario quiere hablar con una persona", "Consulta técnica fuera del alcance del bot"'
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

async function showWhatsappHandoffExecute(
  input: ShowWhatsappHandoffInput,
  ctx: ToolCallContext
): Promise<{ success: boolean }> {
  await logChatbotEvent({
    botConfigId: ctx.botConfigId,
    type: 'handoff.whatsapp',
    level: 'info',
    message: `Derivación a WhatsApp${input.visitorName ? ` — ${input.visitorName}` : ''}`,
    conversationId: ctx.conversationId,
    metadata: {
      visitorName: input.visitorName ?? null,
      reason: input.reason ?? null,
    },
  })
  return { success: true }
}

export function buildShowWhatsappHandoffTool(ctx: ToolCallContext) {
  return tool({
    description: SHOW_WHATSAPP_HANDOFF_DESCRIPTION,
    inputSchema: showWhatsappHandoffInputSchema,
    execute: async (input: ShowWhatsappHandoffInput) =>
      showWhatsappHandoffExecute(input, ctx),
  })
}
