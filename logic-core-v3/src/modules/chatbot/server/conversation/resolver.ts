import { forOrg, unsafeGlobalQuery, isUniqueConstraintError } from '@/lib/isolation'
import type { BotConfig, KnowledgeBase, Conversation } from '@prisma/client'
import { chatbotLog } from '../logging'

type BotConfigWithRelations = BotConfig & {
  knowledgeBase: KnowledgeBase | null
  organization: { id: string; companyName: string }
}

// In-memory cache for BotConfig + KnowledgeBase (changes only when admin saves config)
const botCache = new Map<string, { data: BotConfigWithRelations; expiresAt: number }>()
const BOT_CACHE_TTL_MS = 60_000

/**
 * Resolves the bot by its public slug. Returns null if not found
 * or inactive. Results are cached in-memory for 60s.
 */
export async function resolveBotBySlug(slug: string): Promise<BotConfigWithRelations | null> {
  const cached = botCache.get(slug)
  if (cached && cached.expiresAt > Date.now()) return cached.data

  // TENANT-RESOLUTION: el slug público es la clave de entrada del widget; resolver
  // el bot (y su org) por slug es global por naturaleza — el tenant se descubre acá.
  const bot = await unsafeGlobalQuery(
    'TENANT-RESOLUTION: resolución pública del bot por slug (punto de entrada del widget)',
    (c) =>
      c.botConfig.findUnique({
        where: { slug },
        include: {
          knowledgeBase: true,
          organization: {
            select: { id: true, companyName: true },
          },
        },
      }),
  )

  if (!bot || !bot.isActive || !bot.knowledgeBase) {
    return null
  }

  botCache.set(slug, { data: bot, expiresAt: Date.now() + BOT_CACHE_TTL_MS })
  return bot
}

/** Invalidates the bot cache for a given slug (call after admin saves config). */
export function invalidateBotCache(slug: string): void {
  botCache.delete(slug)
}

export interface GetOrCreateConversationInput {
  organizationId: string
  botConfigId: string
  sessionId: string
  currentPath?: string
  referrer?: string
  visitorIpHash?: string
  visitorUserAgent?: string
  // UTM.1 — first-touch: solo se usan en el create{} de abajo, ver nota ahí.
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface GetOrCreateConversationResult {
  conversation: Conversation
  isNew: boolean
}

/**
 * Returns the existing conversation for this (bot, sessionId) pair,
 * or creates a new one. Updates lastMessageAt on every call.
 * Returns { conversation, isNew } so callers don't need a separate findFirst.
 */
export async function getOrCreateConversation(
  input: GetOrCreateConversationInput
): Promise<GetOrCreateConversationResult> {
  const scope = forOrg(input.organizationId)

  const existing = await scope.conversation.findFirst({
    where: {
      botConfigId: input.botConfigId,
      sessionId: input.sessionId,
    },
  })

  const now = new Date()

  if (existing) {
    const conversation = await scope.conversation.update(existing.id, {
      lastMessageAt: now,
      ...(input.currentPath ? { currentPath: input.currentPath } : {}),
    })
    return { conversation, isNew: false }
  }

  try {
    const conversation = await scope.conversation.create({
      botConfigId: input.botConfigId,
      sessionId: input.sessionId,
      currentPath: input.currentPath ?? null,
      referrerUrl: input.referrer ?? null,
      // UTM.1 — first-touch: create-only, igual que referrerUrl arriba.
      // NUNCA agregar esto al update{} del branch `existing` de más arriba —
      // eso rompería en silencio la semántica de "primer contacto".
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      ipHash: input.visitorIpHash ?? null,
      userAgent: input.visitorUserAgent ?? null,
      startedAt: now,
      lastMessageAt: now,
    })
    return { conversation, isNew: true }
  } catch (error) {
    // CARRERAS — P2002: otro request del mismo sessionId ganó la carrera del
    // create (dos mensajes concurrentes del widget; el findFirst de arriba
    // corrió antes del commit del ganador). El perdedor ADOPTA la fila del
    // ganador con isNew:false — PINNEADO por test:p2002: la reserva atómica
    // de cupo (handleChatRequest §5.b) se dispara solo con isNew, así que
    // adoptar jamás re-reserva (el ganador ya cobró el suyo). Sin update de
    // lastMessageAt a propósito: el ganador la acaba de crear con `now` (ms
    // de diferencia) y un update acá podría pisar P2025 si un gate degradado
    // del ganador descarta la fila en vuelo.
    if (!isUniqueConstraintError(error)) throw error
    const adopted = await scope.conversation.findFirst({
      where: {
        botConfigId: input.botConfigId,
        sessionId: input.sessionId,
      },
    })
    // Sin fila que adoptar, el P2002 NO vino de este par (bot, sessionId):
    // p.ej. la colisión cross-bot del sessionId global (@unique sin
    // botConfigId — micro-sprint aparte, no se enmascara acá) o la fila del
    // ganador ya descartada por un gate degradado. Se relanza el error
    // original: mismo desenlace que pre-fix.
    if (!adopted) throw error
    chatbotLog('chat.conversation_race_adopted', {
      conversationId: adopted.id,
      botConfigId: input.botConfigId,
      sessionId: input.sessionId,
    })
    return { conversation: adopted, isNew: false }
  }
}
