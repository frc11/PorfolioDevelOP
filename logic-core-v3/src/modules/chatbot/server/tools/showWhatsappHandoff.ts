import { tool } from 'ai'
import { z } from 'zod'
import { forOrg } from '@/lib/isolation'
import { logChatbotEvent } from '../logging'
import { notifyTelegramOptional } from '@/lib/notifications/telegram'
import type { ToolCallContext } from './types'
import { getVerticalPack } from '../verticals'
import type { VerticalToolCopy } from '../verticals/types'

/**
 * Tool `show_whatsapp_handoff` — HYBRID.
 *
 * Execute (server):
 *   1. Persists handoff event to ChatbotEvent with rich metadata
 *      (intent, topic summary, purchase signals) so the dashboard
 *      "Derivaciones recientes" tiene contexto, no solo el nombre.
 *   2. Si el visitante NO pasó por capture_lead (handoff "directo"),
 *      manda notificación Telegram al equipo — capture_lead ya manda
 *      la suya cuando crea un lead, así que evitamos duplicado.
 *
 * Render (client): frontend renderiza WhatsappHandoffCard con el wa.me
 * link y el `prefilledMessage` que el visitante envía al clickear.
 *
 * B3.6: schema enriquecido + triggers proactivos en la description.
 */

export const HANDOFF_INTENTS = [
  'purchase_ready',  // "lo quiero", "cuándo lo retiro", pide precio final
  'schedule_visit', // quiere ir en persona, agendar reunión / test drive
  'quote_request', // pide cotización formal / presupuesto cerrado
  'human_request', // pide hablar con humano explícito (sin señal de compra fuerte)
  'support',       // problema con servicio actual / postventa
  'other',
] as const

// EV.5 — Esquema parametrizado: los ejemplos de prefilledMessage y topicSummary
// vienen del toolCopy del pack. `showWhatsappHandoffInputSchema` exportado usa el
// pack base para inferencia de tipo (z.infer ignora los describes).
function buildHandoffSchema(toolCopy: VerticalToolCopy) {
  return z.object({
    prefilledMessage: z.string().min(20).max(500).describe(
      `Mensaje completo pre-llenado para WhatsApp. Este es el TEXTO QUE EL VISITANTE VA A MANDAR al WhatsApp del negocio al clickear la card. DEBE incluir: saludo breve, nombre del visitante si lo dio, y resumen de qué busca (1-2 oraciones). Tono: español rioplatense informal. Ej: "${toolCopy.prefilledMessageExample}"`
    ),
    visitorName: z.string().max(100).optional().describe(
      'Nombre del visitante si lo mencionó en la conversación'
    ),
    visitorContact: z.string().max(200).optional().describe(
      'Teléfono o email del visitante si lo dio en la conversación. Útil para que el dueño tenga forma alternativa de contacto si el visitante no clickea WhatsApp.'
    ),
    intent: z.enum(HANDOFF_INTENTS).describe(
      'Por qué se deriva: purchase_ready=señal clara de compra; schedule_visit=quiere ir/agendar; quote_request=pide cotización formal; human_request=pide humano sin urgencia; support=problema con servicio; other=otro.'
    ),
    // EV.5 — ejemplo de resumen desde el toolCopy del pack del bot.
    topicSummary: z.string().min(15).max(400).describe(
      `Resumen estructurado en 1-3 oraciones de QUÉ BUSCABA el visitante y QUÉ SE HABLÓ. Va al dashboard del dueño y al log. Ejemplo: "${toolCopy.topicSummaryExample}"`
    ),
    purchaseSignals: z.string().max(300).optional().describe(
      'Si el intent es purchase_ready o schedule_visit: cita textual o paráfrasis de qué dijo el visitante que indica que está listo. Ej: "lo quiero", "¿cuándo lo retiro?", "quiero ir mañana a verlo", "qué precio final me hacen". Omitir si el intent no requiere señal de compra.'
    ),
    reason: z.string().max(200).optional().describe(
      'Compatibilidad con dashboard previo. Si lo dejás vacío se deriva automáticamente del intent + topicSummary.'
    ),
  })
}

export const showWhatsappHandoffInputSchema = buildHandoffSchema(getVerticalPack('base').toolCopy)
export type ShowWhatsappHandoffInput = z.infer<typeof showWhatsappHandoffInputSchema>

export const SHOW_WHATSAPP_HANDOFF_DESCRIPTION = `Renderiza una tarjeta visual con un botón CTA grande para abrir WhatsApp con un mensaje pre-llenado.

USAR DECIDIDAMENTE (no seas tímido) cuando hay SEÑAL CLARA DE AVANCE COMERCIAL:
- Visitante pide precio final, descuento o cotización cerrada ("¿qué precio final me hacen?", "¿con descuento cuánto?")
- Quiere agendar visita, test drive, reunión o llamada ("quiero ir a verlo mañana", "¿podemos coordinar una llamada?")
- Dice frases de cierre: "lo quiero", "me lo reservan", "¿cuándo lo puedo retirar?", "lo agarro"
- Ya dio sus datos (nombre + teléfono/email) y muestra urgencia ("urgente", "hoy", "para esta semana")
- Eligió WhatsApp tras offer_handoff_options
- Pide explícitamente hablar con un humano

NO USAR si:
- Es un saludo o consulta general ("hola", "¿qué hacen?", "info").
- Es off-topic.
- Ya disparaste show_whatsapp_handoff en esta conversación (no spamear — máximo 1 por conversación salvo que el visitante pida explícitamente "¿me lo mostrás de nuevo?").
- El intent es solo curiosidad sin señal de compra (en esos casos: contesta y eventualmente capture_lead, no handoff).

Si el visitante TIENE intención de compra pero NO dio datos todavía: primero pedile nombre + canal, después capture_lead, después show_whatsapp_handoff. NO saltees capture_lead si vas a perder el dato.

Si el visitante dio señal de compra Y ya tiene datos en la conversación (o no le importa darlos): derivá YA — no lo hagas pasar por capture_lead burocrático.`

interface ChannelLite {
  hadLead: boolean
}

async function checkLeadStatus(organizationId: string, conversationId: string): Promise<ChannelLite> {
  try {
    const conv = await forOrg(organizationId).conversation.findFirst({
      where: { id: conversationId },
      select: { leadCaptured: true },
    })
    return { hadLead: Boolean(conv?.leadCaptured) }
  } catch {
    return { hadLead: false }
  }
}

async function showWhatsappHandoffExecute(
  input: ShowWhatsappHandoffInput,
  ctx: ToolCallContext
): Promise<{ success: boolean }> {
  const { hadLead } = await checkLeadStatus(ctx.organizationId, ctx.conversationId)

  const derivedReason =
    input.reason ?? `intent=${input.intent}: ${input.topicSummary.slice(0, 140)}`

  await logChatbotEvent({
    organizationId: ctx.organizationId,
    botConfigId: ctx.botConfigId,
    type: 'handoff.whatsapp',
    level: 'info',
    message: `Derivación a WhatsApp${input.visitorName ? ` — ${input.visitorName}` : ''} (${input.intent})`,
    conversationId: ctx.conversationId,
    metadata: {
      // Campos preservados para el dashboard pre-B3.6 (multiTenantQueries.ts).
      visitorName: input.visitorName ?? null,
      reason: derivedReason,
      // Campos nuevos B3.6 — contexto rico.
      visitorContact: input.visitorContact ?? null,
      intent: input.intent,
      topicSummary: input.topicSummary,
      purchaseSignals: input.purchaseSignals ?? null,
      hadLeadBeforeHandoff: hadLead,
    },
  })

  // Telegram al equipo solo si NO hubo lead capturado en esta conversación.
  // Si hubo capture_lead, su propia notificación Telegram ya avisó al equipo —
  // mandar otra acá sería spam interno.
  if (!hadLead) {
    const tgMsg = [
      `🟡 *Handoff WhatsApp directo* (sin capture_lead previo)`,
      `Intent: ${input.intent}`,
      input.visitorName ? `Nombre: ${input.visitorName}` : '',
      input.visitorContact ? `Contacto: ${input.visitorContact}` : '',
      `Resumen: ${input.topicSummary}`,
      input.purchaseSignals ? `Señales: ${input.purchaseSignals}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    void notifyTelegramOptional(tgMsg).catch((err: unknown) => {
      console.error('[showWhatsappHandoff] Telegram notify failed:', err)
    })
  }

  return { success: true }
}

export function buildShowWhatsappHandoffTool(ctx: ToolCallContext) {
  const { toolCopy } = getVerticalPack(ctx.verticalPack ?? 'base')
  return tool({
    description: SHOW_WHATSAPP_HANDOFF_DESCRIPTION,
    inputSchema: buildHandoffSchema(toolCopy),
    execute: async (input: ShowWhatsappHandoffInput) =>
      showWhatsappHandoffExecute(input, ctx),
  })
}
