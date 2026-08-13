import { tool } from 'ai'
import { z } from 'zod'
import type { Prisma, ChatbotLeadIntent } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { forOrg, isUniqueConstraintError } from '@/lib/isolation'
import { logChatbotEvent, sanitizeErrorMessage } from '../logging'
import { notifyClientOfLead } from '@/lib/client-notifications'
import { calculateLeadScore, buildSignalsSnapshot, isValidArgentinePhone } from '../scoring'
import { getVerticalPack } from '../verticals'
import type { VerticalToolCopy } from '../verticals/types'
import { syncLeadToCrm } from '../crm'
import { notifyTelegramOptional } from '@/lib/notifications/telegram'
import type { ToolCallContext, CaptureLeadResult, ToolExecuteResult } from './types'
// PROBE-STREAM — instrumentación TEMPORAL de diagnóstico (gated por
// CHATBOT_STREAM_PROBE). Ver server/chat/streamProbe.ts.
import { probeAround, DISABLED_STREAM_PROBE } from '../chat/streamProbe'

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

// EV.5 — Esquema parametrizado: los ejemplos de dominio vienen del toolCopy del
// pack vertical. `captureLeadInputSchema` exportado usa el pack base para inferencia
// de tipo (z.infer ignora los describes — tipo resultante es idéntico en todo pack).
function buildCaptureLeadSchema(toolCopy: VerticalToolCopy) {
  return z.object({
    name: z.string().min(2).max(100).describe(
      'Nombre del usuario como se identificó'
    ),
    // SEC-LLM-03 / invalid-phone — formato y pertenencia se validan en el execute,
    // NO en Zod: un dato inválido no debe romper el stream del SDK. Acá phone/email
    // son strings laxos (solo cota de longitud defensiva); el execute decide si
    // descarta el canal o repregunta.
    phone: z.string().max(50).optional().describe(
      'Teléfono del usuario tal como lo escribió (ej: +54 9 11 ...). Pasá EXACTAMENTE lo que dio el visitante; no lo inventes ni lo completes. Omitir si no lo dio.'
    ),
    email: z.string().max(200).optional().describe(
      'Email del usuario tal como lo escribió. Pasá EXACTAMENTE lo que dio el visitante; no lo inventes. Omitir si no lo dio.'
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
      'true SOLO si mencionó financiación/cuotas/crédito/leasing. false si nunca lo tocó.'
    ),
    mentionedTradeIn: z.boolean().default(false).describe(
      'true SOLO si mencionó entregar un usado en parte de pago/tasación. false si nunca lo dijo.'
    ),
    // EV.5 — ejemplo de dominio desde el toolCopy del pack del bot.
    askedSpecificModel: z.boolean().default(false).describe(
      `true SOLO si mencionó un modelo o servicio concreto (ej. ${toolCopy.specificModelExamples}). false si fue genérico.`
    ),
  })
}

// SEC-LLM-03 / invalid-phone — SIN `.refine(phone || email)` a propósito: la
// exigencia de "al menos un canal de contacto usable" se evalúa dentro del
// execute (formato + pertenencia). Si falla, el execute devuelve un re-ask
// graceful en lugar de dejar que Zod rechace el input y rompa el stream del SDK.

export const captureLeadInputSchema = buildCaptureLeadSchema(getVerticalPack('base').toolCopy)
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

// ─── SEC-LLM-03 + invalid-phone — pertenencia y formato de canales ──────────
//
// El LLM podría (a) FABRICAR un dato de contacto que el visitante nunca dio, o
// (b) pasar un teléfono/email con formato inválido. En ambos casos ese canal NO
// se persiste. Helpers puros, server-side.

type ChannelReason = 'absent' | 'invalid_format' | 'not_owned' | 'ok'

/**
 * Clasifica un canal de contacto. Simétrico para phone/email (misma forma):
 *   absent       → el LLM no lo pasó
 *   invalid_format → no pasa el validador de formato
 *   not_owned    → no aparece en lo que el visitante escribió (posible fabricación)
 *   ok           → usable (se persiste)
 */
function classifyChannel(
  raw: string | null,
  isValidFormat: (value: string) => boolean,
  appearsInVisitor: (value: string) => boolean,
): ChannelReason {
  if (!raw) return 'absent'
  if (!isValidFormat(raw)) return 'invalid_format'
  if (!appearsInVisitor(raw)) return 'not_owned'
  return 'ok'
}

/**
 * Cola de dígitos para comparar pertenencia de teléfono. 7 (no 8-10) a propósito:
 * el prefijo móvil local "15" (2 díg.) vs el internacional "9" (1 díg.) corre la
 * ventana un dígito, así que con 8+ el reformateo AR más común (15↔9) daría
 * FALSO-NEGATIVO = lead perdido. 7 = cola del número de abonado, invariante al
 * reformateo. Verificado por simulación: 0 falsos-negativos / 0 falsos-positivos.
 */
const OWNERSHIP_PHONE_TAIL = 7

const digitsOnly = (value: string): string => value.replace(/\D/g, '')

/**
 * ¿El teléfono que pasó el LLM aparece (normalizado) en algún turno del visitante?
 * Compara por cola de dígitos en ambas direcciones para tolerar +54/9/0, espacios
 * y guiones sin descartar números reformateados (anti falso-negativo).
 */
function phoneAppearsInVisitorText(
  modelPhone: string,
  visitorMessages: readonly string[],
): boolean {
  const md = digitsOnly(modelPhone)
  if (md.length < OWNERSHIP_PHONE_TAIL) return false
  const mdTail = md.slice(-OWNERSHIP_PHONE_TAIL)
  for (const message of visitorMessages) {
    const vd = digitsOnly(message)
    if (vd.length < OWNERSHIP_PHONE_TAIL) continue
    if (vd.includes(mdTail) || md.includes(vd.slice(-OWNERSHIP_PHONE_TAIL))) return true
  }
  return false
}

/** ¿El email aparece (lowercased) textualmente en algún turno del visitante? */
function emailAppearsInVisitorText(
  modelEmail: string,
  visitorMessages: readonly string[],
): boolean {
  const needle = modelEmail.trim().toLowerCase()
  if (needle.length === 0) return false
  return visitorMessages.some((message) => message.toLowerCase().includes(needle))
}

/** Formato de email — Zod via safeParse (no throw, no dependencia nueva). */
const emailFormatSchema = z.string().email()
const isValidEmailFormat = (raw: string): boolean =>
  emailFormatSchema.safeParse(raw.trim()).success

/**
 * Execute function for capture_lead. Performs the DB write and
 * returns a structured result the LLM can reason about.
 *
 * Exportada SOLO para el invariant de carrera P2002
 * (conversation/__tests__/p2002-adopcion.invariant.ts); el camino de
 * producción sigue entrando por buildCaptureLeadTool.
 */
export async function captureLeadExecute(
  input: CaptureLeadInput,
  ctx: ToolCallContext
): Promise<ToolExecuteResult<CaptureLeadResult>> {
  const scope = forOrg(ctx.organizationId)
  // PROBE-STREAM — ver el enter/exit del tool completo en buildCaptureLeadTool;
  // acá van los awaits a DB individuales, para localizar CUÁL de ellos cuelga.
  const probe = ctx.probe ?? DISABLED_STREAM_PROBE
  try {
    // 1. Check if a lead already exists for this conversation
    const existing = await probeAround(probe, 'tool:capture_lead:db:check_existing', () =>
      scope.chatbotLead.findFirst({
        where: { conversationId: ctx.conversationId },
      }),
    )

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

    // 2. SEC-LLM-03 + invalid-phone — resolver canales USABLES antes de persistir.
    //    Un canal (phone/email) es usable solo si su FORMATO es válido Y APARECE en
    //    lo que el visitante realmente escribió (anti-fabricación del LLM). Los no
    //    usables se descartan; híbrido SIMÉTRICO: si queda al menos uno, persistimos
    //    por ése (no perdemos el lead). Si no queda ninguno → re-ask graceful (el bot
    //    repregunta en vez de enmudecer por un throw del SDK).
    const visitorMessages = (
      await probeAround(probe, 'tool:capture_lead:db:visitor_messages', () =>
        scope.chatMessage.findMany({
          where: { conversationId: ctx.conversationId, role: 'USER' },
          select: { content: true },
        }),
      )
    ).map((m) => m.content)

    const rawPhone = input.phone?.trim() || null
    const rawEmail = input.email?.trim() || null

    const phoneReason = classifyChannel(rawPhone, isValidArgentinePhone, (v) =>
      phoneAppearsInVisitorText(v, visitorMessages),
    )
    const emailReason = classifyChannel(rawEmail, isValidEmailFormat, (v) =>
      emailAppearsInVisitorText(v, visitorMessages),
    )

    const phone = phoneReason === 'ok' ? rawPhone : null
    const email = emailReason === 'ok' ? rawEmail : null

    // Trazabilidad de canales descartados — SOLO el motivo, nunca el valor (PII).
    for (const [channel, reason] of [
      ['phone', phoneReason],
      ['email', emailReason],
    ] as const) {
      if (reason !== 'ok' && reason !== 'absent') {
        console.warn(
          JSON.stringify({
            type: 'capture_lead.channel_dropped',
            conversationId: ctx.conversationId,
            channel,
            reason,
          }),
        )
      }
    }

    // 2b. Ningún canal usable → NO persistir basura ni enmudecer: devolver un
    //     ToolExecuteResult que haga al modelo REPREGUNTAR el dato. Mismo mecanismo
    //     graceful tanto para pertenencia (fabricación) como para formato inválido.
    if (!phone && !email) {
      let hint: string
      if (rawPhone && !rawEmail) hint = 'el teléfono no parece válido o completo'
      else if (rawEmail && !rawPhone) hint = 'el email no parece válido'
      else if (rawPhone && rawEmail) hint = 'los datos de contacto no parecen válidos'
      else hint = 'todavía no tengo un teléfono o email del visitante'

      console.warn(
        JSON.stringify({
          type: 'capture_lead.reask_no_usable_channel',
          conversationId: ctx.conversationId,
          phoneReason,
          emailReason,
        }),
      )
      await probeAround(probe, 'tool:capture_lead:db:reask_event', () =>
        logChatbotEvent({
          organizationId: ctx.organizationId,
          botConfigId: ctx.botConfigId,
          type: 'tool.lead_reask',
          level: 'warn',
          message: `capture_lead repreguntó contacto (phone=${phoneReason}, email=${emailReason})`,
          conversationId: ctx.conversationId,
          metadata: { phoneReason, emailReason },
        }),
      )

      return {
        success: false,
        error: `No pude registrar el contacto porque ${hint}. Pedile amablemente al visitante que te reconfirme un teléfono o email válido —no inventes ni completes datos vos—. No reintentes esta herramienta hasta que el visitante lo dé.`,
      }
    }

    const channels = [phone ? 'phone' : null, email ? 'email' : null].filter(
      (c): c is 'phone' | 'email' => c !== null,
    )

    // 3. B5.2/B5.3 — Calcular score ANTES del create. Función pura, server-side,
    //    sin LLM. Mismas señales → mismo score (predecible y auditable).
    //    B5.3 también aplica:
    //      - DQ por categoría (employment/provider/spam) → classification='dq', score=0
    //      - Penalty postventa (−50).
    //    Nota: el penalty "phone inválido (−20)" del motor ya NO se alcanza desde
    //    este call-site — en el paso 2 `phone` quedó válido-o-null (nunca inválido).
    //    `scoreSignals` incluye penalties (points negativos) para explicabilidad B5.4.
    const providedPhone = Boolean(phone)
    const providedEmail = Boolean(email)

    // EV.3 — Resolver el pack vertical del bot para el scoring. `verticalPack`
    // llega por el contexto (sin query nueva); fallback a 'base' (default de la
    // columna) si no vino. getVerticalPack nunca lanza: clave desconocida → 'base'
    // con warning.
    //
    // ⚠️ PARIDAD / DEPENDENCIA DE DATOS: pre-EV.3 el motor puntuaba SIEMPRE con la
    // tabla `usados` hardcodeada. Ahora cada bot puntúa con SU pack. Un bot
    // concesionaria debe tener `verticalPack='usados'` (lo setea el seed de EV.2);
    // si quedó en `'base'` (default de la migración EV.2), puntúa con la tabla
    // `base` (distinta). REQUERIDO antes de producción: backfillear los bots
    // concesionaria existentes a 'usados' (correr el seed EV.2 o un UPDATE) para
    // preservar la paridad end-to-end. Ver bitácora EV.3 → "Gate de despliegue".
    const packScoring = getVerticalPack(ctx.verticalPack ?? 'base').scoring

    // Señales capturadas. Las que puntúa el motor salen de scoring.signals del
    // pack; providedEmail hoy no puntúa en `usados` (queda disponible para packs
    // que lo usen, ej. `base`). providedPhone/providedEmail los DERIVA el handler
    // del input — no del LLM.
    const signalValues = {
      requestedAppointment: input.requestedAppointment,
      mentionedFinancing: input.mentionedFinancing,
      mentionedTradeIn: input.mentionedTradeIn,
      askedSpecificModel: input.askedSpecificModel,
      providedPhone,
      providedEmail,
    }

    const { score, classification, signals: scoreSignals, dqReason } = calculateLeadScore(
      { signals: signalValues, category: input.category, phone },
      packScoring,
    )

    // EV.3 — Dual-write: snapshot estructurado de señales del pack. Se persiste
    // ADEMÁS de las columnas booleanas legacy (que NO cambian), nunca en reemplazo.
    const signalsSnapshot = buildSignalsSnapshot(signalValues, packScoring)

    // B11.4 — el LLM pasa lowercase (LEAD_INTENTS), la DB es enum UPPER.
    // Type-assert es safe: LEAD_INTENTS y ChatbotLeadIntent comparten los 6
    // valores nuevos B5.1+ exactamente (legacy QUOTE/INFO/DEMO no se generan
    // desde el LLM nuevo, solo viven en rows pre-existentes).
    const intentEnum = input.intent.toUpperCase() as ChatbotLeadIntent

    // 4. Create the lead and update conversation in a transaction.
    //    B5.1: providedPhone/providedEmail SE DERIVAN del input — no del LLM.
    //    El bot no puede inflar esto: si no mandó phone, providedPhone=false. Estructural.
    // PROBE-STREAM — candidato principal del sprint: un $transaction interactivo
    // completo (create + update). Si algo cuelga acá, es el que más se parece al
    // patrón "socket muerto / lock" ya visto en onFinish antes de DEADLINE-ONFINISH.
    const result = await probeAround(probe, 'tool:capture_lead:db:transaction', () =>
      scope.$transaction(async (tx) => {
        const lead = await tx.chatbotLead.create({
          botConfigId: ctx.botConfigId,
          conversationId: ctx.conversationId,
          name: input.name,
          email,
          phone,
          intent: intentEnum,
          message: input.contextSummary,
          status: 'NEW',
          // B5.1 — Señales estructuradas (columnas legacy — el panel las muestra).
          category: input.category,
          requestedAppointment: input.requestedAppointment,
          mentionedFinancing: input.mentionedFinancing,
          mentionedTradeIn: input.mentionedTradeIn,
          askedSpecificModel: input.askedSpecificModel,
          providedPhone,
          providedEmail,
          // UTM.1 — copiado 1:1 desde ctx (que a su vez viene de Conversation,
          // ver handleChatRequest.ts). NUNCA se deriva de nada del LLM/input.
          utmSource: ctx.utmSource ?? null,
          utmMedium: ctx.utmMedium ?? null,
          utmCampaign: ctx.utmCampaign ?? null,
          // EV.3 — Dual-write: señales del pack vertical en formato estructurado.
          // ADEMÁS de las columnas legacy de arriba (no en reemplazo).
          signals: signalsSnapshot as unknown as Prisma.InputJsonValue,
          // B5.2 — Score heurístico calculado server-side (cero LLM).
          score,
          classification,
          // `scoreSignals` es `ScoredSignal[]` (JSON-serializable estructuralmente).
          // Cast en el boundary Prisma porque `keyof LeadSignals` no es asignable
          // a InputJsonValue sin perder tipo en el dominio.
          scoreSignals: scoreSignals as unknown as Prisma.InputJsonValue,
        })

        await tx.conversation.update(ctx.conversationId, { leadCaptured: true })

        return lead
      }),
    )

    // 5. Notify the client without blocking the bot response.
    async function notifyClient() {
      try {
        // La org del scope tiene un único bot (BotConfig.organizationId @unique);
        // findFirst scoped lo devuelve con su organización incluida.
        const bot = await scope.botConfig.findFirst({ include: { organization: true } })

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

        // P2.A — Aviso al CLIENTE por email. Servicio dedicado que decide
        // normal vs. caliente (gate por plan `leadScoring`), aplica el cap
        // anti-spam + digest, resuelve destinatario (leadNotificationEmail →
        // dueño) y marca el lead como notificado. Nunca lanza: el lead ya está
        // guardado (paso 4), así que un mail caído no afecta la respuesta del bot.
        await notifyClientOfLead({
          organizationId: org.id,
          organization: {
            companyName: org.companyName,
            leadNotificationEmail: org.leadNotificationEmail,
            leadNotificationMode: org.leadNotificationMode,
          },
          botName: bot.botName,
          leadId: result.id,
          classification,
          lead: {
            name: input.name,
            email,
            phone,
            intent: input.intent,
            message: input.contextSummary,
            capturedAt: result.capturedAt,
          },
        })
      } catch (error) {
        // PRIVACIDAD: sanitizado — un PrismaClientValidationError acá ecoaría
        // name/email/phone del lead en message y stack.
        console.error(
          '[captureLead] Notification failed but lead was saved',
          sanitizeErrorMessage(error)
        )
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

    await probeAround(probe, 'tool:capture_lead:db:completed_event', () =>
      logChatbotEvent({
        organizationId: ctx.organizationId,
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
      }),
    )

    return {
      success: true,
      data: {
        leadId: result.id,
        alreadyCaptured: false,
      },
    }
  } catch (error) {
    // CARRERAS — P2002: dos capture_lead concurrentes para la MISMA
    // conversación (p.ej. doble click en la card de handoff → dos turnos con
    // la tool) pasan ambos el pre-check del paso 1 y el perdedor choca el
    // @unique de conversationId en el create. El lead SÍ existe (lo creó el
    // ganador, con su leadCaptured en la misma tx): adoptar con el contrato
    // alreadyCaptured del paso 1 en vez de hacerle decir al modelo "no pude
    // guardar tus datos". El re-fetch valida solo: si el P2002 viniera de
    // otra constraint, no habría lead para esta conversación y se cae al
    // fallback genérico de abajo con el error ORIGINAL.
    if (isUniqueConstraintError(error)) {
      try {
        const winner = await scope.chatbotLead.findFirst({
          where: { conversationId: ctx.conversationId },
        })
        if (winner) {
          console.log(
            JSON.stringify({
              type: 'capture_lead.already_captured',
              conversationId: ctx.conversationId,
              leadId: winner.id,
              race: true,
            })
          )
          return {
            success: true,
            data: {
              leadId: winner.id,
              alreadyCaptured: true,
            },
          }
        }
      } catch {
        // El re-fetch falló: cae al fallback genérico — se reporta el error
        // ORIGINAL (el secundario no aporta nada al triage).
      }
    }
    // PRIVACIDAD: sanitizado — el try cubre el chatbotLead.create con
    // name/email/phone; un PrismaClientValidationError los ecoaría enteros.
    const errorMsg = sanitizeErrorMessage(error)
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
  const { toolCopy } = getVerticalPack(ctx.verticalPack ?? 'base')
  // PROBE-STREAM — enter/exit/error de la tool COMPLETA (los awaits a DB
  // individuales están instrumentados dentro de captureLeadExecute).
  const probe = ctx.probe ?? DISABLED_STREAM_PROBE
  return tool({
    description: CAPTURE_LEAD_DESCRIPTION,
    inputSchema: buildCaptureLeadSchema(toolCopy),
    execute: async (input: CaptureLeadInput) =>
      probeAround(probe, 'tool:capture_lead', () => captureLeadExecute(input, ctx)),
  })
}
