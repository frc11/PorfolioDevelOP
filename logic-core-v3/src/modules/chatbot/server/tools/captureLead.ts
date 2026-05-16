import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logChatbotEvent } from '../logging'
import { sendLeadNotificationEmail } from '../notifications'
import type { ToolCallContext, CaptureLeadResult, ToolExecuteResult } from './types'

/**
 * Tool `capture_lead` — SERVER-SIDE.
 *
 * Persists the lead in the database and marks the conversation
 * as having captured a lead. Idempotent: if a lead already exists
 * for this conversation, returns the existing one without duplicating.
 *
 * Notifications (email, webhook, telegram) are NOT triggered here —
 * they're integrated in S5 when the API route wires everything up.
 * For now, we log structurally so the event is traceable.
 */

export const captureLeadInputSchema = z.object({
  name: z.string().min(2).max(100).describe(
    'Nombre del usuario como se identificó'
  ),
  contactMethod: z.enum(['phone', 'email']).describe(
    'Canal preferido de contacto'
  ),
  contactValue: z.string().min(5).max(200).describe(
    'Número de teléfono (con código país si posible) o email'
  ),
  intent: z.enum(['quote', 'info', 'demo', 'support', 'other']).describe(
    'Intención principal: quote=presupuesto, info=más info, demo=ver demo, support=problema con servicio actual, other=otro'
  ),
  contextSummary: z.string().min(10).max(500).describe(
    'Resumen breve (1-2 oraciones) en español rioplatense de qué busca el usuario, qué servicio le interesa, qué problema quiere resolver. Esto va a la BD para que el equipo lo vea.'
  ),
})

export type CaptureLeadInput = z.infer<typeof captureLeadInputSchema>

export const CAPTURE_LEAD_DESCRIPTION = `Guarda los datos de contacto del usuario en el sistema.

USAR cuando: el usuario explícitamente expresó interés en ser contactado Y proporcionó nombre + método de contacto (teléfono o email).

NO USAR si:
- El usuario solo está consultando información sin intención de seguir
- No proporcionó nombre o no proporcionó un método de contacto
- Ya se invocó esta tool exitosamente en esta conversación (no duplicar)`

/**
 * Execute function for capture_lead. Performs the DB write and
 * returns a structured result the LLM can reason about.
 */
async function captureLeadExecute(
  input: CaptureLeadInput,
  ctx: ToolCallContext
): Promise<ToolExecuteResult<CaptureLeadResult>> {
  try {
    // 1. Check if a lead already exists for this conversation
    const existing = await prisma.chatbotLead.findUnique({
      where: { conversationId: ctx.conversationId },
    })

    if (existing) {
      console.log(
        JSON.stringify({
          type: 'capture_lead.already_captured',
          conversationId: ctx.conversationId,
          leadId: existing.id,
        })
      )
      return {
        success: true,
        data: {
          leadId: existing.id,
          alreadyCaptured: true,
        },
      }
    }

    // 2. Normalize phone/email lightly (trim + basic validation)
    const normalizedContact = input.contactValue.trim()

    const email = input.contactMethod === 'email' ? normalizedContact : null
    const phone = input.contactMethod === 'phone' ? normalizedContact : null

    // 3. Create the lead and update conversation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.chatbotLead.create({
        data: {
          botConfigId: ctx.botConfigId,
          conversationId: ctx.conversationId,
          name: input.name,
          email,
          phone,
          intent: input.intent,
          message: input.contextSummary,
          status: 'NEW',
        },
      })

      await tx.conversation.update({
        where: { id: ctx.conversationId },
        data: { leadCaptured: true },
      })

      return lead
    })

    // 4. Notify the client without blocking the bot response.
    async function notifyClient() {
      try {
        const bot = await prisma.botConfig.findUnique({
          where: { id: ctx.botConfigId },
          include: { organization: true },
        })

        const org = bot?.organization
        if (!bot || !org?.leadNotificationEmail || org.leadNotificationMode === 'DISABLED') {
          return
        }

        if (org.leadNotificationMode === 'IMMEDIATE') {
          const notification = await sendLeadNotificationEmail({
            to: org.leadNotificationEmail,
            organizationName: org.companyName,
            botName: bot.botName,
            lead: {
              name: input.name,
              email,
              phone,
              intent: input.intent,
              message: input.contextSummary,
              createdAt: result.capturedAt,
            },
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard/chatbot/leads`,
          })

          if (notification.ok) {
            await prisma.chatbotLead.update({
              where: { id: result.id },
              data: {
                notificationSent: true,
                notificationSentAt: new Date(),
              },
            })
          }
        }
      } catch (error) {
        console.error('[captureLead] Notification failed but lead was saved', error)
      }
    }

    void notifyClient()

    // 5. Log structured event.
    console.log(
      JSON.stringify({
        type: 'capture_lead.created',
        conversationId: ctx.conversationId,
        botConfigId: ctx.botConfigId,
        leadId: result.id,
        intent: input.intent,
        contactMethod: input.contactMethod,
        // PII (name, contact value, message) intentionally omitted from logs
      })
    )

    await logChatbotEvent({
      botConfigId: ctx.botConfigId,
      type: 'tool.lead_captured',
      level: 'info',
      message: `Lead capturado (intent: ${input.intent})`,
      conversationId: ctx.conversationId,
      metadata: {
        intent: input.intent,
        contactMethod: input.contactMethod,
        leadId: result.id,
      },
    })

    return {
      success: true,
      data: {
        leadId: result.id,
        alreadyCaptured: false,
      },
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'unknown error'
    console.error(
      JSON.stringify({
        type: 'capture_lead.error',
        conversationId: ctx.conversationId,
        error: errorMsg,
      })
    )
    return {
      success: false,
      error: 'No pude guardar tus datos en este momento. Probemos por WhatsApp.',
    }
  }
}

/**
 * Builds the capture_lead tool bound to the given context.
 */
export function buildCaptureLeadTool(ctx: ToolCallContext) {
  return tool({
    description: CAPTURE_LEAD_DESCRIPTION,
    inputSchema: captureLeadInputSchema,
    execute: async (input: CaptureLeadInput) => captureLeadExecute(input, ctx),
  })
}
