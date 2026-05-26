import { tool } from 'ai'
import { z } from 'zod'
import type { Prisma, ChatbotLeadIntent } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logChatbotEvent } from '../logging'
import { sendLeadNotificationEmail } from '../notifications'
import { calculateLeadScore } from '../scoring'
import { syncLeadToCrm } from '../crm'
import { notifyTelegramOptional } from '@/lib/notifications/telegram'
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

/**
 * B5.1 — Enums alineados con scoring server-side.
 * - LEAD_INTENTS: mismos valores que `HANDOFF_INTENTS` (showWhatsappHandoff.ts) — un solo
 *   vocabulario de intenciones en todo el módulo del bot.
 * - LEAD_CATEGORIES: clasificación de DQ que B5.3 va a consumir.
 */
export const LEAD_INTENTS = [
  'purchase_ready',
  'schedule_visit',
  'quote_request',
  'human_request',
  'support',
  'other',
] as const

export const LEAD_CATEGORIES = [
  'sales',
  'postventa',
  'employment',
  'provider',
  'spam',
  'other',
] as const

export const captureLeadInputSchema = z
  .object({
    name: z.string().min(2).max(100).describe(
      'Nombre del usuario como se identificó'
    ),
    phone: z.string().min(5).max(50).optional().describe(
      'Teléfono del usuario (con código de país si está disponible, ej: +54 9 11 ...). Omitir si el usuario no lo dio.'
    ),
    email: z.string().email().max(200).optional().describe(
      'Email del usuario. Omitir si el usuario no lo dio.'
    ),
    intent: z.enum(LEAD_INTENTS).describe(
      'Intención principal: purchase_ready=lo quiere/pide retirar; schedule_visit=quiere agendar visita/test drive; quote_request=pide cotización formal; human_request=pide humano sin urgencia; support=problema con servicio actual; other=otro.'
    ),
    contextSummary: z.string().min(10).max(500).describe(
      'Resumen breve (1-2 oraciones) en español rioplatense de qué busca el usuario. Va a la BD para el equipo.'
    ),
    // B5.1 — Categoría DQ (descalificación). Si la consulta NO es comercial, marcala.
    category: z.enum(LEAD_CATEGORIES).default('sales').describe(
      'sales=consulta comercial real (default); postventa=problema/turno service/garantía; employment=busca trabajo/CV; provider=ofrece servicios/cotiza para vendernos; spam=basura; other=no encaja. Solo marcá distinto a sales si la conversación lo evidencia.'
    ),
    // B5.1 — Flags de señal. Anti-alucinación: si NO apareció, mandá false. No infles.
    requestedAppointment: z.boolean().default(false).describe(
      'true SOLO si pidió cita/visita/test drive/turno (palabras como "agendar", "ir a verlo", "test drive", "turno").'
    ),
    mentionedFinancing: z.boolean().default(false).describe(
      'true SOLO si mencionó financiación/cuotas/crédito/prendario/leasing. false si nunca lo tocó.'
    ),
    mentionedTradeIn: z.boolean().default(false).describe(
      'true SOLO si mencionó entregar un usado en parte de pago/tasación. false si nunca lo dijo.'
    ),
    askedSpecificModel: z.boolean().default(false).describe(
      'true SOLO si nombró un modelo concreto (ej. "Corolla XEi", "Hilux SRV"). false si fue genérico ("un 0KM", "algo familiar").'
    ),
  })
  .refine((data) => Boolean(data.phone) || Boolean(data.email), {
    message: 'Se requiere al menos teléfono o email.',
    path: ['phone'],
  })

export type CaptureLeadInput = z.infer<typeof captureLeadInputSchema>

export const CAPTURE_LEAD_DESCRIPTION = `Guarda los datos de contacto del usuario en el sistema.

USAR cuando: el usuario explícitamente expresó interés en ser contactado Y proporcionó nombre + al menos un canal de contacto (teléfono o email).

REGLAS DE CANALES:
- Si el usuario te dio AMBOS (teléfono y email), pasá los DOS en la misma invocación: persistimos los dos canales. Es el caso ideal.
- Si dio solo uno, pasá solo ese. No le pidas el otro si no lo ofreció voluntariamente — uno solo es suficiente.

REGLAS DE SEÑALES (B5.1): además de los datos de contacto, completá los flags (requestedAppointment, mentionedFinancing, mentionedTradeIn, askedSpecificModel) y la category con base en lo que REALMENTE apareció en la conversación. Si una señal no apareció, mandá false — NO infles para "ayudar". Si la consulta no es de venta (postventa, busca trabajo, ofrece servicios), marcá la category correspondiente: el sistema la usa para descalificar.

NO USAR si:
- El usuario solo está consultando información sin intención de seguir
- No proporcionó nombre o no proporcionó ningún canal de contacto
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

    // 2. Normalize phone/email lightly (trim). Both channels persist if both came.
    const email = input.email?.trim() || null
    const phone = input.phone?.trim() || null
    const channels = [phone ? 'phone' : null, email ? 'email' : null].filter(
      (c): c is 'phone' | 'email' => c !== null,
    )

    // 3. B5.2/B5.3 — Calcular score ANTES del create. Función pura, server-side,
    //    sin LLM. Mismas señales → mismo score (predecible y auditable).
    //    B5.3 también aplica:
    //      - DQ por categoría (employment/provider/spam) → classification='dq', score=0
    //      - Penalty postventa (−50) y phone inválido (−20)
    //    `scoreSignals` incluye penalties (points negativos) para explicabilidad B5.4.
    const providedPhone = Boolean(phone)
    const providedEmail = Boolean(email)
    const { score, classification, signals: scoreSignals, dqReason } = calculateLeadScore({
      signals: {
        requestedAppointment: input.requestedAppointment,
        mentionedFinancing: input.mentionedFinancing,
        mentionedTradeIn: input.mentionedTradeIn,
        askedSpecificModel: input.askedSpecificModel,
        providedPhone,
      },
      category: input.category,
      phone,
    })

    // B11.4 — el LLM pasa lowercase (LEAD_INTENTS), la DB es enum UPPER.
    // Type-assert es safe: LEAD_INTENTS y ChatbotLeadIntent comparten los 6
    // valores nuevos B5.1+ exactamente (legacy QUOTE/INFO/DEMO no se generan
    // desde el LLM nuevo, solo viven en rows pre-existentes).
    const intentEnum = input.intent.toUpperCase() as ChatbotLeadIntent

    // 4. Create the lead and update conversation in a transaction.
    //    B5.1: providedPhone/providedEmail SE DERIVAN del input — no del LLM.
    //    El bot no puede inflar esto: si no mandó phone, providedPhone=false. Estructural.
    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.chatbotLead.create({
        data: {
          botConfigId: ctx.botConfigId,
          conversationId: ctx.conversationId,
          name: input.name,
          email,
          phone,
          intent: intentEnum,
          message: input.contextSummary,
          status: 'NEW',
          // B5.1 — Señales estructuradas
          category: input.category,
          requestedAppointment: input.requestedAppointment,
          mentionedFinancing: input.mentionedFinancing,
          mentionedTradeIn: input.mentionedTradeIn,
          askedSpecificModel: input.askedSpecificModel,
          providedPhone,
          providedEmail,
          // B5.2 — Score heurístico calculado server-side (cero LLM).
          score,
          classification,
          // `scoreSignals` es `ScoredSignal[]` (JSON-serializable estructuralmente).
          // Cast en el boundary Prisma porque `keyof LeadSignals` no es asignable
          // a InputJsonValue sin perder tipo en el dominio.
          scoreSignals: scoreSignals as unknown as Prisma.InputJsonValue,
        },
      })

      await tx.conversation.update({
        where: { id: ctx.conversationId },
        data: { leadCaptured: true },
      })

      return lead
    })

    // 5. Notify the client without blocking the bot response.
    async function notifyClient() {
      try {
        const bot = await prisma.botConfig.findUnique({
          where: { id: ctx.botConfigId },
          include: { organization: true },
        })

        const org = bot?.organization
        if (!bot || !org) return

        // B5.7 v2 — Invalidar el cache del badge sidebar "hot+NEW" cuando el lead
        // capturado entra como hot. Sin esto, el badge esperaba TTL 30s del
        // unstable_cache para reflejar el nuevo lead — ahora se actualiza al
        // próximo render de cualquier ruta /dashboard/*. El tag ya existía,
        // estaba listo para esta invalidación.
        if (classification === 'hot') {
          try {
            revalidateTag(`hot-leads-count:${org.id}`, {})
          } catch (err) {
            console.error('[captureLead] revalidateTag failed:', err)
          }
        }

        // Telegram — always fires for the develOP team when configured (env-based)
        const telegramMsg = [
          `🟢 *Nuevo lead* — ${org.companyName}`,
          `Bot: ${bot.botName}`,
          input.name ? `Nombre: ${input.name}` : '',
          email ? `Email: ${email}` : '',
          phone ? `Tel: ${phone}` : '',
          input.intent ? `Intent: ${input.intent}` : '',
        ]
          .filter(Boolean)
          .join('\n')
        void notifyTelegramOptional(telegramMsg).catch((err: unknown) => {
          console.error('[captureLead] Telegram notify failed:', err)
        })

        // Email to client — only if configured and not disabled
        if (!org.leadNotificationEmail || org.leadNotificationMode === 'DISABLED') return

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

    // 5b. B5.8 — Sync a CRM del cliente vía n8n. DB-primero: el lead YA está
    //     guardado (step 4). Este hook es secundario y resiliente — si n8n
    //     está caído, el lead no se pierde, solo queda CrmSyncAttempt FAILED.
    //     syncLeadToCrm atrapa todos sus errores internos; este catch defensivo
    //     es por si falla el dispatch mismo. NO propaga al LLM.
    void syncLeadToCrm({ leadId: result.id, trigger: 'auto' }).catch((err: unknown) => {
      console.error('[captureLead] CRM sync wrapper failed:', err)
    })

    // 6. Log structured event — incluye score B5.2 + DQ reason B5.3.
    console.log(
      JSON.stringify({
        type: 'capture_lead.created',
        conversationId: ctx.conversationId,
        botConfigId: ctx.botConfigId,
        leadId: result.id,
        intent: input.intent,
        category: input.category,
        channels,
        score,
        classification,
        dqReason,
        // PII (name, contact values, message) intentionally omitted from logs
      })
    )

    await logChatbotEvent({
      botConfigId: ctx.botConfigId,
      type: 'tool.lead_captured',
      level: 'info',
      message: `Lead capturado (intent: ${input.intent}, category: ${input.category}, score: ${score}/${classification}${dqReason ? ` [dq=${dqReason}]` : ''}, canales: ${channels.join('+') || 'ninguno'})`,
      conversationId: ctx.conversationId,
      metadata: {
        intent: input.intent,
        category: input.category,
        channels,
        leadId: result.id,
        // B5.1 — flags de señal para trazabilidad / debugging del scoring
        signals: {
          requestedAppointment: input.requestedAppointment,
          mentionedFinancing: input.mentionedFinancing,
          mentionedTradeIn: input.mentionedTradeIn,
          askedSpecificModel: input.askedSpecificModel,
          providedPhone,
          providedEmail,
        },
        // B5.2/B5.3 — score calculado + desglose + razón de DQ
        score,
        classification,
        dqReason,
        scoreBreakdown: scoreSignals,
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
