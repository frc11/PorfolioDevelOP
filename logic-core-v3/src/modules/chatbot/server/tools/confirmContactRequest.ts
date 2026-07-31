import { tool } from 'ai'
import { z } from 'zod'
import { forOrg } from '@/lib/isolation'
import { logChatbotEvent } from '../logging'
import type { ToolCallContext } from './types'
// PROBE-STREAM — instrumentación TEMPORAL de diagnóstico (gated por
// CHATBOT_STREAM_PROBE). Ver server/chat/streamProbe.ts.
import { probeAround, DISABLED_STREAM_PROBE } from '../chat/streamProbe'

/**
 * Tool `confirm_contact_request` — SERVER-SIDE.
 *
 * POR QUÉ EXISTE (CONTACT-PATH). El visitante daba sus datos, elegía "Que me
 * contacten" en la tarjeta de `offer_handoff_options`... y el bot no respondía
 * nada: salía el fallback de respuesta vacía ("Se me complicó generar una
 * respuesta ahora"). Medido en prod: dos steps seguidos con
 * `finishReason: "tool-calls"` y `textLength: 0`.
 *
 * La causa es estructural, del SDK. En el `flush` del inner transform de
 * `streamStep` la continuación a otro step exige que las tool calls del step
 * hayan producido OUTPUT:
 *
 *   if (clientToolCalls.length > 0 && clientToolOutputs.length === clientToolCalls.length) → otro step
 *   else → cerrar
 *
 * `offer_handoff_options` y `navigate_to_page` son **client-side puros, sin
 * `execute`** — no producen output, así que no hay step siguiente y el turno
 * cierra con cero texto. Por eso el camino de WhatsApp SÍ funcionaba:
 * `show_whatsapp_handoff` es server-side, su `execute` produce un tool-result,
 * la condición se cumple, arranca el step siguiente y ahí el modelo escribe.
 *
 * Para el camino de contacto no existía ningún tool server-side: el modelo no
 * tenía a dónde ir, reusaba la tarjeta de opciones (client-side) y se quedaba
 * mudo. Este tool es el espejo de `show_whatsapp_handoff` para ese camino.
 *
 * LA GARANTÍA ES ESTRUCTURAL, no de obediencia: al tener `execute`, el step
 * final ocurre por construcción del SDK. Instruir al modelo por prompt
 * ("acordate de escribir algo") no alcanzaría — este es el momento en que el
 * visitante convierte y no puede depender de una probabilidad.
 *
 * Render: NINGUNO. `renderToolCall` devuelve `null` para tools sin `case`
 * (`components/tool-cards/renderToolCall.tsx`, rama `default`), así que no hace
 * falta tocar el widget: lo que el visitante ve es el TEXTO del modelo, que es
 * exactamente lo que faltaba.
 *
 * PII: la metadata que se persiste (y que `logChatbotEvent` también manda a
 * stderr) queda deliberadamente SIN datos de contacto — solo el canal preferido
 * y un flag. El nombre y el teléfono ya viven en `ChatbotLead`, y el panel puede
 * unirlos por `conversationId`.
 */

/** Vía por la que el visitante prefiere que lo contacten. */
export const CONTACT_CHANNELS = ['phone', 'email', 'any'] as const

export const confirmContactRequestInputSchema = z.object({
  preferredChannel: z
    .enum(CONTACT_CHANNELS)
    .default('any')
    .describe(
      'Cómo prefiere que lo contacten, según lo que dijo: phone=pidió llamada/teléfono; ' +
        'email=pidió mail; any=no aclaró. Si no lo aclaró, usá "any" — no lo inventes.',
    ),
})

export type ConfirmContactRequestInput = z.infer<typeof confirmContactRequestInputSchema>

export const CONFIRM_CONTACT_REQUEST_DESCRIPTION = `Registra que el visitante pidió que el equipo lo contacte (en vez de seguir por WhatsApp).

USAR: cuando el visitante elige "que me contacten" / "prefiero que me llamen" / "contáctenme ustedes" — típicamente al tocar esa opción en la tarjeta de offer_handoff_options.

DESPUÉS DE INVOCARLA: escribí SIEMPRE un texto breve confirmándole que el equipo se va a comunicar. Es el cierre del camino: el visitante tiene que ver una confirmación, no una tarjeta.

NO USAR:
- Si el visitante eligió WhatsApp (para eso está show_whatsapp_handoff).
- Sin datos de contacto capturados: primero capture_lead, si no el equipo no tiene a dónde llamar.
- Más de una vez por conversación (es idempotente, pero no la repitas).`

export interface ConfirmContactRequestResult {
  success: boolean
  /** true si ya se había registrado el pedido en esta conversación. */
  alreadyRequested: boolean
}

/** Tipo del evento persistido. Espejo de `handoff.whatsapp`. */
export const CONTACT_REQUEST_EVENT_TYPE = 'handoff.callback'

/**
 * Las dos operaciones de persistencia del tool, inyectables. Mismo criterio
 * que el 3er parámetro de `resolveEffectiveModel`: permite ejercitar el tool
 * REAL —con su `execute` real, que es lo único que fuerza el step final— en un
 * test sin DB ni credenciales. El default es la implementación de producción.
 */
export interface ContactRequestPersistence {
  /** ¿Ya se registró un pedido de contacto en esta conversación? */
  hasRequest(ctx: ToolCallContext): Promise<boolean>
  /** Registra el pedido. */
  record(ctx: ToolCallContext, input: ConfirmContactRequestInput): Promise<void>
}

export const defaultContactRequestPersistence: ContactRequestPersistence = {
  async hasRequest(ctx) {
    const existing = await forOrg(ctx.organizationId).chatbotEvent.findFirst({
      where: {
        botConfigId: ctx.botConfigId,
        conversationId: ctx.conversationId,
        type: CONTACT_REQUEST_EVENT_TYPE,
      },
      select: { id: true },
    })
    return existing !== null
  },
  async record(ctx, input) {
    await logChatbotEvent({
      organizationId: ctx.organizationId,
      botConfigId: ctx.botConfigId,
      type: CONTACT_REQUEST_EVENT_TYPE,
      level: 'info',
      message: `Pedido de contacto del equipo (canal preferido: ${input.preferredChannel})`,
      conversationId: ctx.conversationId,
      // SIN PII: `logChatbotEvent` también escribe la metadata a stderr.
      // Los datos del visitante ya están en ChatbotLead, unibles por
      // conversationId.
      metadata: { preferredChannel: input.preferredChannel },
    })
  },
}

async function confirmContactRequestExecute(
  input: ConfirmContactRequestInput,
  ctx: ToolCallContext,
  persistence: ContactRequestPersistence,
): Promise<ConfirmContactRequestResult> {
  const probe = ctx.probe ?? DISABLED_STREAM_PROBE

  try {
    // Idempotencia: si ya hay un pedido registrado en esta conversación, no se
    // duplica el evento. Mismo criterio que `capture_lead.already_captured`.
    const existing = await probeAround(
      probe,
      'tool:confirm_contact_request:db:check_existing',
      () => persistence.hasRequest(ctx),
    )

    if (existing) {
      console.log(
        JSON.stringify({
          type: 'confirm_contact_request.already_requested',
          conversationId: ctx.conversationId,
        }),
      )
      // `success: true` a propósito: para el modelo el pedido ESTÁ registrado.
      // Devolver un error lo empujaría a reintentar o a disculparse.
      return { success: true, alreadyRequested: true }
    }

    await probeAround(probe, 'tool:confirm_contact_request:db:event', () =>
      persistence.record(ctx, input),
    )

    return { success: true, alreadyRequested: false }
  } catch (error) {
    // Nunca relanza: un fallo de registro no puede dejar al visitante sin
    // respuesta. `success: true` porque el turno igual tiene que cerrar con el
    // texto de confirmación — el equipo tiene el lead de `capture_lead`, que es
    // lo que realmente habilita el contacto. El rastro queda acá.
    console.error(
      JSON.stringify({
        type: 'confirm_contact_request.error',
        conversationId: ctx.conversationId,
        error: error instanceof Error ? error.message : 'unknown',
      }),
    )
    return { success: true, alreadyRequested: false }
  }
}

/**
 * Builds the confirm_contact_request tool bound to the given context.
 *
 * `persistence` es inyectable (default: la implementación real) para poder
 * ejercitar ESTE tool —el de verdad, con su `execute`— contra el `streamText`
 * real en un test sin DB. Es lo que hace que la verificación falla-primero sea
 * genuina: si alguien le saca el `execute`, el test de pipeline falla.
 */
export function buildConfirmContactRequestTool(
  ctx: ToolCallContext,
  persistence: ContactRequestPersistence = defaultContactRequestPersistence,
) {
  const probe = ctx.probe ?? DISABLED_STREAM_PROBE
  return tool({
    description: CONFIRM_CONTACT_REQUEST_DESCRIPTION,
    inputSchema: confirmContactRequestInputSchema,
    // El `execute` es lo que fuerza el step final. Sin él, este tool sería
    // client-side y volveríamos exactamente al bug que arregla.
    execute: async (input: ConfirmContactRequestInput) =>
      probeAround(probe, 'tool:confirm_contact_request', () =>
        confirmContactRequestExecute(input, ctx, persistence),
      ),
  })
}
