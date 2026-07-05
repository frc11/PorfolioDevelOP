/**
 * UTM.1 — Verificación de atribución first-touch (Conversation → ChatbotLead).
 *
 * Corre SOLO contra la branch Neon dev (host check abajo). Qué hace:
 *   1. Crea una Conversation con UTMs A vía getOrCreateConversation → assert
 *      persistidos.
 *   2. Llama de nuevo (mismo botConfigId/sessionId) con UTMs B → assert que
 *      la Conversation SIGUE teniendo los UTMs A (first-touch, no se pisa).
 *   3. Construye un ToolCallContext desde esa Conversation, invoca
 *      buildCaptureLeadTool(ctx).execute(...) directo (sin LLM) → assert que
 *      el ChatbotLead resultante hereda los UTMs A.
 *   4. Repite con una Conversation SIN UTMs (tráfico directo) → assert que el
 *      lead resultante tiene los tres campos en null (nunca inventados).
 *   5. Borra todo lo creado (try/finally — no deja residuo).
 *
 * Uso: npx tsx scripts/utm1-verify-attribution.ts
 */
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const DEV_BRANCH_HOST = 'ep-quiet-waterfall-acv0fpll'

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error(
    `ABORT: DATABASE_URL no apunta a la branch Neon dev (${DEV_BRANCH_HOST}-*). ` +
      'Este script solo corre contra dev.',
  )
  process.exit(1)
}

async function main() {
  // Imports dinámicos para que dotenv corra antes de instanciar PrismaClient.
  const [{ prisma }, { getOrCreateConversation }, { buildCaptureLeadTool }] = await Promise.all([
    import('../src/lib/prisma'),
    import('../src/modules/chatbot/server/conversation'),
    import('../src/modules/chatbot/server/tools'),
  ])
  type ToolCallContext = import('../src/modules/chatbot/server/tools').ToolCallContext
  type CaptureLeadInput = import('../src/modules/chatbot/server/tools').CaptureLeadInput

  const results: Array<{ name: string; pass: boolean; detail?: string }> = []
  const check = (name: string, pass: boolean, detail?: string) => {
    results.push({ name, pass, detail })
    console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
  }

  const bot = await prisma.botConfig.findFirst({
    where: { isActive: true },
    select: { id: true, organizationId: true, verticalPack: true },
  })
  if (!bot) {
    console.error('ABORT: no hay ningún BotConfig activo en esta DB para probar contra.')
    process.exit(1)
  }
  console.log(`BotConfig de prueba: ${bot.id} (org ${bot.organizationId})`)

  const runId = `utm1-verify-${Date.now()}`
  const conversationIdsToClean: string[] = []
  const leadIdsToClean: string[] = []

  async function captureLeadFor(conversation: {
    id: string
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
  }): Promise<string> {
    // El check de pertenencia de teléfono (anti-fabricación del LLM) exige
    // que el teléfono aparezca en un mensaje previo del visitante.
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: 'Hola, mi teléfono es 1122334455, quiero que me contacten.',
      },
    })

    const ctx: ToolCallContext = {
      conversationId: conversation.id,
      botConfigId: bot!.id,
      organizationId: bot!.organizationId,
      verticalPack: bot!.verticalPack,
      // UTM.1 — exactamente el mismo mapeo que handleChatRequest.ts: desde
      // la Conversation ya resuelta, nunca desde un body de request.
      utmSource: conversation.utmSource ?? undefined,
      utmMedium: conversation.utmMedium ?? undefined,
      utmCampaign: conversation.utmCampaign ?? undefined,
    }

    const input: CaptureLeadInput = {
      name: 'UTM1 Verify',
      phone: '1122334455',
      intent: 'quote_request',
      contextSummary: 'Verificación UTM.1 — atribución first-touch de un lead.',
      category: 'sales',
      requestedAppointment: false,
      mentionedFinancing: false,
      mentionedTradeIn: false,
      askedSpecificModel: false,
    }

    const tool = buildCaptureLeadTool(ctx)
    const result = await tool.execute!(input, { toolCallId: `${runId}-capture`, messages: [] })
    if (!result.success || !result.data) {
      throw new Error(`captureLead falló inesperadamente: ${result.error}`)
    }
    leadIdsToClean.push(result.data.leadId)
    return result.data.leadId
  }

  try {
    // ─── 1 & 2. First-touch: Conversation ────────────────────────────────

    const sessionIdA = `${runId}-with-utm`
    const created = await getOrCreateConversation({
      botConfigId: bot.id,
      sessionId: sessionIdA,
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'launch_q3',
    })
    conversationIdsToClean.push(created.conversation.id)
    check(
      'Conversation nueva persiste los UTMs del create',
      created.isNew &&
        created.conversation.utmSource === 'google' &&
        created.conversation.utmMedium === 'cpc' &&
        created.conversation.utmCampaign === 'launch_q3',
      `utmSource=${created.conversation.utmSource}, utmMedium=${created.conversation.utmMedium}, utmCampaign=${created.conversation.utmCampaign}`,
    )

    const revisited = await getOrCreateConversation({
      botConfigId: bot.id,
      sessionId: sessionIdA, // mismo sessionId+bot → misma Conversation
      utmSource: 'newsletter',
      utmMedium: 'email',
      utmCampaign: 'q3_newsletter',
    })
    check(
      'Segunda visita con UTMs distintos NO pisa el first-touch',
      !revisited.isNew &&
        revisited.conversation.utmSource === 'google' &&
        revisited.conversation.utmMedium === 'cpc' &&
        revisited.conversation.utmCampaign === 'launch_q3',
      `utmSource=${revisited.conversation.utmSource} (esperado: google, no newsletter)`,
    )

    // ─── 3. Copia a ChatbotLead — Conversation CON atribución ────────────

    await captureLeadFor(revisited.conversation)
    const leadWithAttribution = await prisma.chatbotLead.findUnique({
      where: { conversationId: revisited.conversation.id },
    })
    check(
      'Lead capturado hereda los UTMs de su Conversation',
      leadWithAttribution?.utmSource === 'google' &&
        leadWithAttribution?.utmMedium === 'cpc' &&
        leadWithAttribution?.utmCampaign === 'launch_q3',
      `lead.utmSource=${leadWithAttribution?.utmSource}, lead.utmMedium=${leadWithAttribution?.utmMedium}, lead.utmCampaign=${leadWithAttribution?.utmCampaign}`,
    )

    // ─── 4. Tráfico directo — sin UTMs, nunca inventados ─────────────────

    const sessionIdB = `${runId}-direct`
    const direct = await getOrCreateConversation({
      botConfigId: bot.id,
      sessionId: sessionIdB,
      // sin utmSource/utmMedium/utmCampaign → tráfico directo
    })
    conversationIdsToClean.push(direct.conversation.id)
    check(
      'Conversation sin UTMs queda null (no placeholder)',
      direct.conversation.utmSource === null &&
        direct.conversation.utmMedium === null &&
        direct.conversation.utmCampaign === null,
    )

    await captureLeadFor(direct.conversation)
    const leadDirect = await prisma.chatbotLead.findUnique({
      where: { conversationId: direct.conversation.id },
    })
    check(
      'Lead de tráfico directo tiene los 3 campos en null',
      leadDirect?.utmSource === null &&
        leadDirect?.utmMedium === null &&
        leadDirect?.utmCampaign === null,
      `lead.utmSource=${leadDirect?.utmSource}, lead.utmMedium=${leadDirect?.utmMedium}, lead.utmCampaign=${leadDirect?.utmCampaign}`,
    )
  } finally {
    for (const leadId of leadIdsToClean) {
      await prisma.chatbotLead.delete({ where: { id: leadId } }).catch(() => {})
    }
    for (const conversationId of conversationIdsToClean) {
      // Cascade borra los ChatMessage asociados (onDelete: Cascade en el schema).
      await prisma.conversation.delete({ where: { id: conversationId } }).catch(() => {})
    }
    console.log(`Limpieza: ${leadIdsToClean.length} lead(s), ${conversationIdsToClean.length} conversation(s) borrados.`)
    await prisma.$disconnect()
  }

  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks OK`)
  if (failed.length > 0) process.exit(1)
}

main().catch((error) => {
  console.error('Error en verificación UTM.1:', error)
  process.exit(1)
})
