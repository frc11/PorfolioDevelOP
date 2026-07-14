/**
 * Registro de modelos cubiertos por el helper de aislamiento y armado del
 * scope por organización. Acá vive, UNA vez por modelo, la estrategia de
 * tenancy completa:
 *
 *   - el fragmento `where` de scope (columna directa o cadena relacional),
 *   - los guards de create (padres que deben ser de la misma org),
 *   - las claves de escritura prohibidas (nested writes y re-parenting),
 *     espejadas en tipos (Omit) y en runtime (config) desde las MISMAS
 *     constantes — no pueden divergir.
 *
 * Este archivo y scoped-model.ts son los únicos del helper que tocan
 * @/lib/prisma. Ver el contrato público en src/lib/isolation/index.ts.
 */
import type {
  BotAlert,
  BotConfig,
  ChatMessage,
  ChatbotEvent,
  ChatbotInsight,
  ChatbotLead,
  ContactIdentity,
  Conversation,
  CrmIntegration,
  CrmSyncAttempt,
  KnowledgeBase,
  MotorChannelType,
  MotorConversation,
  MotorMessage,
  Prisma,
  QuotaUsage,
  WabaChannel,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { IsolationError, IsolationNotFoundError, ScopedModelDelegate, type ModelIsolationConfig } from './scoped-model'

// ─── Claves de relación (nested writes) y de re-parenting por modelo ─────────
// Fuente única: alimentan los Omit de los tipos de write Y las listas runtime
// de forbiddenCreateKeys/forbiddenUpdateKeys.

const WABA_CHANNEL_NESTED = ['organization', 'conversations'] as const
const CONTACT_IDENTITY_NESTED = ['organization', 'conversations'] as const
const MOTOR_CONVERSATION_NESTED = ['organization', 'contactIdentity', 'wabaChannel', 'messages'] as const
const MOTOR_CONVERSATION_REPARENT = ['contactIdentityId', 'wabaChannelId'] as const
const MOTOR_MESSAGE_NESTED = ['organization', 'conversation'] as const
const MOTOR_MESSAGE_REPARENT = ['conversationId'] as const
const BOT_CONFIG_NESTED = [
  'organization',
  'knowledgeBase',
  'conversations',
  'leads',
  'quotaUsages',
  'events',
  'insights',
  'alerts',
] as const
const CONVERSATION_NESTED = ['botConfig', 'messages', 'lead', 'events'] as const
const CONVERSATION_REPARENT = ['botConfigId'] as const
const CHAT_MESSAGE_NESTED = ['conversation'] as const
const CHAT_MESSAGE_REPARENT = ['conversationId'] as const
const CHATBOT_LEAD_NESTED = ['botConfig', 'conversation', 'crmSyncAttempts'] as const
const CHATBOT_LEAD_REPARENT = ['botConfigId', 'conversationId'] as const
const KNOWLEDGE_BASE_NESTED = ['botConfig'] as const
const KNOWLEDGE_BASE_REPARENT = ['botConfigId'] as const
const CHATBOT_INSIGHT_NESTED = ['botConfig'] as const
const CHATBOT_INSIGHT_REPARENT = ['botConfigId'] as const
const QUOTA_USAGE_NESTED = ['botConfig'] as const
const QUOTA_USAGE_REPARENT = ['botConfigId'] as const
const CHATBOT_EVENT_NESTED = ['botConfig', 'conversation'] as const
const CHATBOT_EVENT_REPARENT = ['botConfigId', 'conversationId'] as const
const BOT_ALERT_NESTED = ['botConfig'] as const
const BOT_ALERT_REPARENT = ['botConfigId'] as const
const CRM_INTEGRATION_NESTED = ['organization', 'syncAttempts'] as const
const CRM_SYNC_ATTEMPT_NESTED = ['lead', 'integration'] as const
const CRM_SYNC_ATTEMPT_REPARENT = ['leadId', 'integrationId'] as const

type Keys<T extends readonly string[]> = T[number]

// ─── Tipos de write por modelo (sin organizationId, sin nested, sin re-parenting) ──

type WabaChannelCreate = Omit<
  Prisma.WabaChannelUncheckedCreateInput,
  Keys<typeof WABA_CHANNEL_NESTED> | 'organizationId'
>
type WabaChannelUpdate = Omit<
  Prisma.WabaChannelUncheckedUpdateInput,
  Keys<typeof WABA_CHANNEL_NESTED> | 'organizationId' | 'id'
>
type ContactIdentityCreate = Omit<
  Prisma.ContactIdentityUncheckedCreateInput,
  Keys<typeof CONTACT_IDENTITY_NESTED> | 'organizationId'
>
type ContactIdentityUpdate = Omit<
  Prisma.ContactIdentityUncheckedUpdateInput,
  Keys<typeof CONTACT_IDENTITY_NESTED> | 'organizationId' | 'id'
>
type MotorConversationCreate = Omit<
  Prisma.MotorConversationUncheckedCreateInput,
  Keys<typeof MOTOR_CONVERSATION_NESTED> | 'organizationId'
>
type MotorConversationUpdate = Omit<
  Prisma.MotorConversationUncheckedUpdateInput,
  Keys<typeof MOTOR_CONVERSATION_NESTED> | Keys<typeof MOTOR_CONVERSATION_REPARENT> | 'organizationId' | 'id'
>
type MotorMessageCreate = Omit<
  Prisma.MotorMessageUncheckedCreateInput,
  Keys<typeof MOTOR_MESSAGE_NESTED> | 'organizationId'
>
type MotorMessageUpdate = Omit<
  Prisma.MotorMessageUncheckedUpdateInput,
  Keys<typeof MOTOR_MESSAGE_NESTED> | Keys<typeof MOTOR_MESSAGE_REPARENT> | 'organizationId' | 'id'
>
type BotConfigCreate = Omit<Prisma.BotConfigUncheckedCreateInput, Keys<typeof BOT_CONFIG_NESTED> | 'organizationId'>
type BotConfigUpdate = Omit<
  Prisma.BotConfigUncheckedUpdateInput,
  Keys<typeof BOT_CONFIG_NESTED> | 'organizationId' | 'id'
>
type ConversationCreate = Omit<Prisma.ConversationUncheckedCreateInput, Keys<typeof CONVERSATION_NESTED>>
type ConversationUpdate = Omit<
  Prisma.ConversationUncheckedUpdateInput,
  Keys<typeof CONVERSATION_NESTED> | Keys<typeof CONVERSATION_REPARENT> | 'id'
>
type ChatMessageCreate = Omit<Prisma.ChatMessageUncheckedCreateInput, Keys<typeof CHAT_MESSAGE_NESTED>>
type ChatMessageUpdate = Omit<
  Prisma.ChatMessageUncheckedUpdateInput,
  Keys<typeof CHAT_MESSAGE_NESTED> | Keys<typeof CHAT_MESSAGE_REPARENT> | 'id'
>
type ChatbotLeadCreate = Omit<Prisma.ChatbotLeadUncheckedCreateInput, Keys<typeof CHATBOT_LEAD_NESTED>>
type ChatbotLeadUpdate = Omit<
  Prisma.ChatbotLeadUncheckedUpdateInput,
  Keys<typeof CHATBOT_LEAD_NESTED> | Keys<typeof CHATBOT_LEAD_REPARENT> | 'id'
>
type CrmIntegrationCreate = Omit<
  Prisma.CrmIntegrationUncheckedCreateInput,
  Keys<typeof CRM_INTEGRATION_NESTED> | 'organizationId'
>
type CrmIntegrationUpdate = Omit<
  Prisma.CrmIntegrationUncheckedUpdateInput,
  Keys<typeof CRM_INTEGRATION_NESTED> | 'organizationId' | 'id'
>
// Modelos relacionales del chatbot (scope vía botConfig): el create conserva
// botConfigId (la FK requerida); el update lo prohíbe (re-parenting) junto al id.
type KnowledgeBaseCreate = Omit<Prisma.KnowledgeBaseUncheckedCreateInput, Keys<typeof KNOWLEDGE_BASE_NESTED>>
type KnowledgeBaseUpdate = Omit<
  Prisma.KnowledgeBaseUncheckedUpdateInput,
  Keys<typeof KNOWLEDGE_BASE_NESTED> | Keys<typeof KNOWLEDGE_BASE_REPARENT> | 'id'
>
type ChatbotInsightCreate = Omit<Prisma.ChatbotInsightUncheckedCreateInput, Keys<typeof CHATBOT_INSIGHT_NESTED>>
type ChatbotInsightUpdate = Omit<
  Prisma.ChatbotInsightUncheckedUpdateInput,
  Keys<typeof CHATBOT_INSIGHT_NESTED> | Keys<typeof CHATBOT_INSIGHT_REPARENT> | 'id'
>
type QuotaUsageCreate = Omit<Prisma.QuotaUsageUncheckedCreateInput, Keys<typeof QUOTA_USAGE_NESTED>>
type QuotaUsageUpdate = Omit<
  Prisma.QuotaUsageUncheckedUpdateInput,
  Keys<typeof QUOTA_USAGE_NESTED> | Keys<typeof QUOTA_USAGE_REPARENT> | 'id'
>
type ChatbotEventCreate = Omit<Prisma.ChatbotEventUncheckedCreateInput, Keys<typeof CHATBOT_EVENT_NESTED>>
type ChatbotEventUpdate = Omit<
  Prisma.ChatbotEventUncheckedUpdateInput,
  Keys<typeof CHATBOT_EVENT_NESTED> | Keys<typeof CHATBOT_EVENT_REPARENT> | 'id'
>
type BotAlertCreate = Omit<Prisma.BotAlertUncheckedCreateInput, Keys<typeof BOT_ALERT_NESTED>>
type BotAlertUpdate = Omit<
  Prisma.BotAlertUncheckedUpdateInput,
  Keys<typeof BOT_ALERT_NESTED> | Keys<typeof BOT_ALERT_REPARENT> | 'id'
>
// CrmSyncAttempt tiene columna organizationId propia (denormalizada): el create
// la inyecta el scope; el update la prohíbe. leadId/integrationId son re-parenting.
type CrmSyncAttemptCreate = Omit<
  Prisma.CrmSyncAttemptUncheckedCreateInput,
  Keys<typeof CRM_SYNC_ATTEMPT_NESTED> | 'organizationId'
>
type CrmSyncAttemptUpdate = Omit<
  Prisma.CrmSyncAttemptUncheckedUpdateInput,
  Keys<typeof CRM_SYNC_ATTEMPT_NESTED> | Keys<typeof CRM_SYNC_ATTEMPT_REPARENT> | 'organizationId' | 'id'
>

// ─── Configs por modelo ───────────────────────────────────────────────────────

// Motor: scope por columna directa. Sin parentChecks — la FK COMPUESTA
// (organizationId, id) de la DB rechaza sola cualquier referencia cross-org.

const wabaChannelConfig: ModelIsolationConfig = {
  model: 'wabaChannel',
  scopeWhere: (organizationId) => ({ organizationId }),
  hasOrganizationId: true,
  parentChecks: [],
  forbiddenCreateKeys: WABA_CHANNEL_NESTED,
  forbiddenUpdateKeys: [...WABA_CHANNEL_NESTED, 'organizationId'],
}

const contactIdentityConfig: ModelIsolationConfig = {
  model: 'contactIdentity',
  scopeWhere: (organizationId) => ({ organizationId }),
  hasOrganizationId: true,
  parentChecks: [],
  forbiddenCreateKeys: CONTACT_IDENTITY_NESTED,
  forbiddenUpdateKeys: [...CONTACT_IDENTITY_NESTED, 'organizationId'],
}

const motorConversationConfig: ModelIsolationConfig = {
  model: 'motorConversation',
  scopeWhere: (organizationId) => ({ organizationId }),
  hasOrganizationId: true,
  parentChecks: [],
  forbiddenCreateKeys: MOTOR_CONVERSATION_NESTED,
  forbiddenUpdateKeys: [...MOTOR_CONVERSATION_NESTED, ...MOTOR_CONVERSATION_REPARENT, 'organizationId'],
}

const motorMessageConfig: ModelIsolationConfig = {
  model: 'motorMessage',
  scopeWhere: (organizationId) => ({ organizationId }),
  hasOrganizationId: true,
  parentChecks: [],
  forbiddenCreateKeys: MOTOR_MESSAGE_NESTED,
  forbiddenUpdateKeys: [...MOTOR_MESSAGE_NESTED, ...MOTOR_MESSAGE_REPARENT, 'organizationId'],
}

// Chatbot: BotConfig y CrmIntegration scopean por columna directa; el resto
// por cadena relacional. Estos modelos NO tienen constraint compuesto en DB
// (tablas existentes, migraciones solo aditivas) → los parentChecks del
// helper son el guard de create.

const botConfigConfig: ModelIsolationConfig = {
  model: 'botConfig',
  scopeWhere: (organizationId) => ({ organizationId }),
  hasOrganizationId: true,
  parentChecks: [],
  forbiddenCreateKeys: BOT_CONFIG_NESTED,
  forbiddenUpdateKeys: [...BOT_CONFIG_NESTED, 'organizationId'],
}

const conversationConfig: ModelIsolationConfig = {
  model: 'conversation',
  scopeWhere: (organizationId) => ({ botConfig: { organizationId } }),
  hasOrganizationId: false,
  parentChecks: [
    {
      field: 'botConfigId',
      find: (client, organizationId, id) =>
        client.botConfig.findFirst({ where: { id, organizationId }, select: { id: true } }),
    },
  ],
  forbiddenCreateKeys: CONVERSATION_NESTED,
  forbiddenUpdateKeys: [...CONVERSATION_NESTED, ...CONVERSATION_REPARENT],
}

const chatMessageConfig: ModelIsolationConfig = {
  model: 'chatMessage',
  // Dos niveles hasta la org: ChatMessage → conversation → botConfig.
  scopeWhere: (organizationId) => ({ conversation: { botConfig: { organizationId } } }),
  hasOrganizationId: false,
  parentChecks: [
    {
      field: 'conversationId',
      find: (client, organizationId, id) =>
        client.conversation.findFirst({ where: { id, botConfig: { organizationId } }, select: { id: true } }),
    },
  ],
  forbiddenCreateKeys: CHAT_MESSAGE_NESTED,
  forbiddenUpdateKeys: [...CHAT_MESSAGE_NESTED, ...CHAT_MESSAGE_REPARENT],
}

const chatbotLeadConfig: ModelIsolationConfig = {
  model: 'chatbotLead',
  scopeWhere: (organizationId) => ({ botConfig: { organizationId } }),
  hasOrganizationId: false,
  parentChecks: [
    {
      field: 'botConfigId',
      find: (client, organizationId, id) =>
        client.botConfig.findFirst({ where: { id, organizationId }, select: { id: true } }),
    },
    {
      // conversationId es opcional en ChatbotLead: se verifica solo si viene.
      field: 'conversationId',
      find: (client, organizationId, id) =>
        client.conversation.findFirst({ where: { id, botConfig: { organizationId } }, select: { id: true } }),
    },
  ],
  forbiddenCreateKeys: CHATBOT_LEAD_NESTED,
  forbiddenUpdateKeys: [...CHATBOT_LEAD_NESTED, ...CHATBOT_LEAD_REPARENT],
}

const crmIntegrationConfig: ModelIsolationConfig = {
  model: 'crmIntegration',
  scopeWhere: (organizationId) => ({ organizationId }),
  hasOrganizationId: true,
  parentChecks: [],
  forbiddenCreateKeys: CRM_INTEGRATION_NESTED,
  forbiddenUpdateKeys: [...CRM_INTEGRATION_NESTED, 'organizationId'],
}

// Chatbot B0-S3 — modelos adicionales portados. Todos scopean por cadena
// relacional vía botConfig salvo CrmSyncAttempt (columna organizationId propia).
// El parentCheck de botConfigId es el guard de create (sin constraint compuesto).

const botConfigParentCheck = {
  field: 'botConfigId',
  find: (client: Prisma.TransactionClient, organizationId: string, id: string) =>
    client.botConfig.findFirst({ where: { id, organizationId }, select: { id: true } }),
} as const

const conversationParentCheck = {
  field: 'conversationId',
  find: (client: Prisma.TransactionClient, organizationId: string, id: string) =>
    client.conversation.findFirst({ where: { id, botConfig: { organizationId } }, select: { id: true } }),
} as const

const knowledgeBaseConfig: ModelIsolationConfig = {
  model: 'knowledgeBase',
  scopeWhere: (organizationId) => ({ botConfig: { organizationId } }),
  hasOrganizationId: false,
  parentChecks: [botConfigParentCheck],
  forbiddenCreateKeys: KNOWLEDGE_BASE_NESTED,
  forbiddenUpdateKeys: [...KNOWLEDGE_BASE_NESTED, ...KNOWLEDGE_BASE_REPARENT],
}

const chatbotInsightConfig: ModelIsolationConfig = {
  model: 'chatbotInsight',
  scopeWhere: (organizationId) => ({ botConfig: { organizationId } }),
  hasOrganizationId: false,
  parentChecks: [botConfigParentCheck],
  forbiddenCreateKeys: CHATBOT_INSIGHT_NESTED,
  forbiddenUpdateKeys: [...CHATBOT_INSIGHT_NESTED, ...CHATBOT_INSIGHT_REPARENT],
}

const quotaUsageConfig: ModelIsolationConfig = {
  model: 'quotaUsage',
  scopeWhere: (organizationId) => ({ botConfig: { organizationId } }),
  hasOrganizationId: false,
  parentChecks: [botConfigParentCheck],
  forbiddenCreateKeys: QUOTA_USAGE_NESTED,
  forbiddenUpdateKeys: [...QUOTA_USAGE_NESTED, ...QUOTA_USAGE_REPARENT],
}

const chatbotEventConfig: ModelIsolationConfig = {
  model: 'chatbotEvent',
  scopeWhere: (organizationId) => ({ botConfig: { organizationId } }),
  hasOrganizationId: false,
  // conversationId es opcional en ChatbotEvent: se verifica solo si viene.
  parentChecks: [botConfigParentCheck, conversationParentCheck],
  forbiddenCreateKeys: CHATBOT_EVENT_NESTED,
  forbiddenUpdateKeys: [...CHATBOT_EVENT_NESTED, ...CHATBOT_EVENT_REPARENT],
}

const botAlertConfig: ModelIsolationConfig = {
  model: 'botAlert',
  scopeWhere: (organizationId) => ({ botConfig: { organizationId } }),
  hasOrganizationId: false,
  parentChecks: [botConfigParentCheck],
  forbiddenCreateKeys: BOT_ALERT_NESTED,
  forbiddenUpdateKeys: [...BOT_ALERT_NESTED, ...BOT_ALERT_REPARENT],
}

const crmSyncAttemptConfig: ModelIsolationConfig = {
  model: 'crmSyncAttempt',
  scopeWhere: (organizationId) => ({ organizationId }),
  hasOrganizationId: true,
  parentChecks: [
    {
      field: 'leadId',
      find: (client, organizationId, id) =>
        client.chatbotLead.findFirst({ where: { id, botConfig: { organizationId } }, select: { id: true } }),
    },
    {
      field: 'integrationId',
      find: (client, organizationId, id) =>
        client.crmIntegration.findFirst({ where: { id, organizationId }, select: { id: true } }),
    },
  ],
  forbiddenCreateKeys: CRM_SYNC_ATTEMPT_NESTED,
  forbiddenUpdateKeys: [...CRM_SYNC_ATTEMPT_NESTED, 'organizationId'],
}

// ─── Accessor extendido: ContactIdentity ─────────────────────────────────────

class ContactIdentityScopedDelegate extends ScopedModelDelegate<
  typeof prisma.contactIdentity,
  ContactIdentity,
  ContactIdentityCreate,
  ContactIdentityUpdate
> {
  /**
   * Upsert idempotente por la clave natural del contacto DENTRO de la org
   * (unique compuesto organizationId+channelType+externalId). Es el ÚNICO
   * upsert del helper a propósito: un upsert genérico aceptaría uniques
   * globales (ej. providerMessageId) y podría pisar filas de otra org.
   */
  async upsertByExternalId(input: {
    channelType: MotorChannelType
    externalId: string
    create: Omit<ContactIdentityCreate, 'channelType' | 'externalId'>
    update: Omit<ContactIdentityUpdate, 'channelType' | 'externalId'>
  }): Promise<ContactIdentity> {
    const create = await this.prepareWriteData('create', {
      ...input.create,
      channelType: input.channelType,
      externalId: input.externalId,
    })
    const update = await this.prepareWriteData('update', input.update)
    try {
      const result = await this.unsafe.upsert({
        where: {
          organizationId_channelType_externalId: {
            organizationId: this.organizationId,
            channelType: input.channelType,
            externalId: input.externalId,
          },
        },
        create,
        update,
      })
      return result as ContactIdentity
    } catch (error) {
      // Mismo contrato de errores que el resto de los métodos de escritura.
      throw this.translateDbError(error, `${input.channelType}:${input.externalId}`)
    }
  }
}

// ─── Accessor extendido: CrmIntegration ───────────────────────────────────────

class CrmIntegrationScopedDelegate extends ScopedModelDelegate<
  typeof prisma.crmIntegration,
  CrmIntegration,
  CrmIntegrationCreate,
  CrmIntegrationUpdate
> {
  /**
   * Upsert de LA integración de la org. `organizationId` es @unique en
   * CrmIntegration y coincide con el scope: el where apunta al propio tenant,
   * nunca a otro. El create fija organizationId desde el scope (prepareWriteData).
   */
  async upsertForScope(input: { create: CrmIntegrationCreate; update: CrmIntegrationUpdate }): Promise<CrmIntegration> {
    const create = await this.prepareWriteData('create', input.create)
    const update = await this.prepareWriteData('update', input.update)
    try {
      const result = await this.unsafe.upsert({
        where: { organizationId: this.organizationId },
        create,
        update,
      })
      return result as CrmIntegration
    } catch (error) {
      throw this.translateDbError(error, this.organizationId)
    }
  }
}

// ─── Accessor extendido: QuotaUsage ───────────────────────────────────────────
// Clave natural COMPUESTA (botConfigId, year, month), pero el unique es GLOBAL:
// un botConfigId de otra org apuntaría a su fila. Por eso todo acceso por clave
// verifica antes que el bot pertenezca a la org (assertBotInScope), y las dos
// mutaciones atómicas ($executeRaw, preservadas de checker/upsellAlert) llevan
// el guard de org EMBEBIDO en el SQL (EXISTS sobre chatbot_bot_config) — el
// aislamiento no se apoya solo en el pre-check.

class QuotaUsageScopedDelegate extends ScopedModelDelegate<
  typeof prisma.quotaUsage,
  QuotaUsage,
  QuotaUsageCreate,
  QuotaUsageUpdate
> {
  constructor(
    delegate: typeof prisma.quotaUsage,
    organizationId: string,
    cfg: ModelIsolationConfig,
    client: Prisma.TransactionClient,
  ) {
    super(delegate, organizationId, cfg, client)
  }

  /** Lanza IsolationNotFoundError si el bot no es de la org del scope. */
  private async assertBotInScope(botConfigId: string): Promise<void> {
    const bot = await this.client.botConfig.findFirst({
      where: { id: botConfigId, organizationId: this.organizationId },
      select: { id: true },
    })
    if (bot === null) throw new IsolationNotFoundError(this.cfg.model, `botConfigId=${botConfigId}`)
  }

  /** Fila del período (botConfigId, year, month) acotada al tenant. null si el bot no es de la org. */
  async findByPeriod(botConfigId: string, year: number, month: number): Promise<QuotaUsage | null> {
    const result = await this.unsafe.findFirst({ where: this.scopedWhere({ botConfigId, year, month }) })
    return result as QuotaUsage | null
  }

  /** Upsert del período verificando bot∈org (el unique compuesto es global). */
  async upsertPeriod(input: {
    botConfigId: string
    year: number
    month: number
    create: Omit<QuotaUsageCreate, 'botConfigId' | 'year' | 'month'>
    update: QuotaUsageUpdate
  }): Promise<QuotaUsage> {
    await this.assertBotInScope(input.botConfigId)
    const create = await this.prepareWriteData('create', {
      ...input.create,
      botConfigId: input.botConfigId,
      year: input.year,
      month: input.month,
    })
    const update = await this.prepareWriteData('update', input.update)
    try {
      const result = await this.unsafe.upsert({
        where: { botConfigId_year_month: { botConfigId: input.botConfigId, year: input.year, month: input.month } },
        create,
        update,
      })
      return result as QuotaUsage
    } catch (error) {
      throw this.translateDbError(error, `${input.botConfigId}:${input.year}-${input.month}`)
    }
  }

  /**
   * B4.2 — Reserva atómica de cupo de conversación nueva (ex checker.ts). El
   * UPDATE conditional con row-lock de Postgres garantiza que N reservas
   * concurrentes nunca excedan monthlyQuota; el EXISTS agrega el guard de org.
   */
  async reserveConversation(input: {
    botConfigId: string
    year: number
    month: number
    monthlyQuota: number
  }): Promise<{ reserved: boolean; conversationsUsed: number }> {
    await this.assertBotInScope(input.botConfigId)
    // Asegurar la fila del período (idempotente): el UPDATE conditional no toca filas inexistentes.
    await this.unsafe.upsert({
      where: { botConfigId_year_month: { botConfigId: input.botConfigId, year: input.year, month: input.month } },
      create: { botConfigId: input.botConfigId, year: input.year, month: input.month },
      update: {},
    })
    const affected = await this.client.$executeRaw`
      UPDATE "chatbot_quota_usage" q
      SET "conversationsCount" = "conversationsCount" + 1,
          "updatedAt" = NOW()
      WHERE q."botConfigId" = ${input.botConfigId}
        AND q."year" = ${input.year}
        AND q."month" = ${input.month}
        AND q."conversationsCount" < ${input.monthlyQuota}
        AND EXISTS (
          SELECT 1 FROM "chatbot_bot_config" b
          WHERE b."id" = q."botConfigId" AND b."organizationId" = ${this.organizationId}
        )
    `
    const usage = (await this.unsafe.findFirst({
      where: this.scopedWhere({ botConfigId: input.botConfigId, year: input.year, month: input.month }),
      select: { conversationsCount: true },
    })) as { conversationsCount: number } | null
    return { reserved: affected === 1, conversationsUsed: usage?.conversationsCount ?? 0 }
  }

  /**
   * ONF-1 — Compensación atómica de una reserva de cupo (espejo EXACTO de
   * reserveConversation, mismo mecanismo): cuando el stream murió sin entregar
   * respuesta, el cupo reservado se devuelve con UPDATE conditional
   * (`conversationsCount > 0`, row-lock de Postgres) + guard de org EMBEBIDO
   * (EXISTS sobre chatbot_bot_config). Garantías:
   *   - el contador NUNCA queda negativo (el conditional no toca filas en 0);
   *   - N releases concurrentes decrementan exactamente N (o hasta llegar a 0),
   *     sin lost-updates — no es un decrement leído-y-escrito, es un solo UPDATE.
   * La idempotencia POR REQUEST (no compensar dos veces la misma reserva) es
   * responsabilidad del caller (flag de request en handleChatRequest).
   */
  async releaseConversation(input: {
    botConfigId: string
    year: number
    month: number
  }): Promise<{ released: boolean; conversationsUsed: number }> {
    await this.assertBotInScope(input.botConfigId)
    const affected = await this.client.$executeRaw`
      UPDATE "chatbot_quota_usage" q
      SET "conversationsCount" = "conversationsCount" - 1,
          "updatedAt" = NOW()
      WHERE q."botConfigId" = ${input.botConfigId}
        AND q."year" = ${input.year}
        AND q."month" = ${input.month}
        AND q."conversationsCount" > 0
        AND EXISTS (
          SELECT 1 FROM "chatbot_bot_config" b
          WHERE b."id" = q."botConfigId" AND b."organizationId" = ${this.organizationId}
        )
    `
    const usage = (await this.unsafe.findFirst({
      where: this.scopedWhere({ botConfigId: input.botConfigId, year: input.year, month: input.month }),
      select: { conversationsCount: true },
    })) as { conversationsCount: number } | null
    return { released: affected === 1, conversationsUsed: usage?.conversationsCount ?? 0 }
  }

  /**
   * B4.5 — Marca `degradedAt` atómicamente si era null (ex upsellAlert.ts).
   * Devuelve true solo la primera vez del período → anti-spam de la alerta de
   * upsell. EXISTS agrega el guard de org al UPDATE conditional.
   */
  async markDegradedIfFirst(input: { botConfigId: string; year: number; month: number }): Promise<boolean> {
    await this.assertBotInScope(input.botConfigId)
    const affected = await this.client.$executeRaw`
      UPDATE "chatbot_quota_usage" q
      SET "degradedAt" = NOW(),
          "updatedAt" = NOW()
      WHERE q."botConfigId" = ${input.botConfigId}
        AND q."year" = ${input.year}
        AND q."month" = ${input.month}
        AND q."degradedAt" IS NULL
        AND EXISTS (
          SELECT 1 FROM "chatbot_bot_config" b
          WHERE b."id" = q."botConfigId" AND b."organizationId" = ${this.organizationId}
        )
    `
    return affected === 1
  }
}

// ─── Armado del scope ─────────────────────────────────────────────────────────

/** Cliente aceptado por buildAccessors: el global o el transaccional de Prisma. */
type ScopeClient = Prisma.TransactionClient

/**
 * Accessors scoped ligados a un cliente concreto (el global `prisma` o el `tx`
 * de una transacción interactiva). Separado de buildScope para que $transaction
 * pueda re-armar los mismos accessors sobre el cliente transaccional.
 */
function buildAccessors(organizationId: string, client: ScopeClient) {
  return {
    /** Org del scope (solo lectura; útil para logs y mensajes de error del caller). */
    organizationId,

    // ── Motor WhatsApp ──
    wabaChannel: new ScopedModelDelegate<typeof prisma.wabaChannel, WabaChannel, WabaChannelCreate, WabaChannelUpdate>(
      client.wabaChannel,
      organizationId,
      wabaChannelConfig,
      client,
    ),
    contactIdentity: new ContactIdentityScopedDelegate(
      client.contactIdentity,
      organizationId,
      contactIdentityConfig,
      client,
    ),
    motorConversation: new ScopedModelDelegate<
      typeof prisma.motorConversation,
      MotorConversation,
      MotorConversationCreate,
      MotorConversationUpdate
    >(client.motorConversation, organizationId, motorConversationConfig, client),
    motorMessage: new ScopedModelDelegate<
      typeof prisma.motorMessage,
      MotorMessage,
      MotorMessageCreate,
      MotorMessageUpdate
    >(client.motorMessage, organizationId, motorMessageConfig, client),

    // ── Chatbot (B0-S3) ──
    botConfig: new ScopedModelDelegate<typeof prisma.botConfig, BotConfig, BotConfigCreate, BotConfigUpdate>(
      client.botConfig,
      organizationId,
      botConfigConfig,
      client,
    ),
    conversation: new ScopedModelDelegate<
      typeof prisma.conversation,
      Conversation,
      ConversationCreate,
      ConversationUpdate
    >(client.conversation, organizationId, conversationConfig, client),
    chatMessage: new ScopedModelDelegate<typeof prisma.chatMessage, ChatMessage, ChatMessageCreate, ChatMessageUpdate>(
      client.chatMessage,
      organizationId,
      chatMessageConfig,
      client,
    ),
    chatbotLead: new ScopedModelDelegate<typeof prisma.chatbotLead, ChatbotLead, ChatbotLeadCreate, ChatbotLeadUpdate>(
      client.chatbotLead,
      organizationId,
      chatbotLeadConfig,
      client,
    ),
    knowledgeBase: new ScopedModelDelegate<
      typeof prisma.knowledgeBase,
      KnowledgeBase,
      KnowledgeBaseCreate,
      KnowledgeBaseUpdate
    >(client.knowledgeBase, organizationId, knowledgeBaseConfig, client),
    chatbotInsight: new ScopedModelDelegate<
      typeof prisma.chatbotInsight,
      ChatbotInsight,
      ChatbotInsightCreate,
      ChatbotInsightUpdate
    >(client.chatbotInsight, organizationId, chatbotInsightConfig, client),
    quotaUsage: new QuotaUsageScopedDelegate(client.quotaUsage, organizationId, quotaUsageConfig, client),
    chatbotEvent: new ScopedModelDelegate<
      typeof prisma.chatbotEvent,
      ChatbotEvent,
      ChatbotEventCreate,
      ChatbotEventUpdate
    >(client.chatbotEvent, organizationId, chatbotEventConfig, client),
    botAlert: new ScopedModelDelegate<typeof prisma.botAlert, BotAlert, BotAlertCreate, BotAlertUpdate>(
      client.botAlert,
      organizationId,
      botAlertConfig,
      client,
    ),
    crmIntegration: new CrmIntegrationScopedDelegate(
      client.crmIntegration,
      organizationId,
      crmIntegrationConfig,
      client,
    ),
    crmSyncAttempt: new ScopedModelDelegate<
      typeof prisma.crmSyncAttempt,
      CrmSyncAttempt,
      CrmSyncAttemptCreate,
      CrmSyncAttemptUpdate
    >(client.crmSyncAttempt, organizationId, crmSyncAttemptConfig, client),
  }
}

/** Accessors scoped de una organización, sin la envoltura transaccional. */
export type OrgScopeAccessors = ReturnType<typeof buildAccessors>

/** Scope de una organización: accessors por modelo + transacción scoped. */
export interface OrgScope extends OrgScopeAccessors {
  /**
   * Transacción scoped: corre `fn` con accessors del MISMO tenant ligados al
   * cliente transaccional de Prisma. Permite atomicidad multi-modelo (ej. crear
   * el lead y marcar `leadCaptured` en la conversación) sin salir del helper.
   * No anidable — Prisma no soporta transacciones interactivas anidadas.
   */
  $transaction<T>(fn: (tx: OrgScopeAccessors) => Promise<T>): Promise<T>
}

/** Construye el scope de una organización. API pública: forOrg (index.ts). */
export function buildScope(organizationId: string, client: ScopeClient = prisma): OrgScope {
  const accessors = buildAccessors(organizationId, client)
  const isRoot = client === prisma
  return Object.freeze({
    ...accessors,
    async $transaction<T>(fn: (tx: OrgScopeAccessors) => Promise<T>): Promise<T> {
      if (!isRoot) {
        throw new IsolationError(
          'forOrg().$transaction no es anidable (Prisma no soporta transacciones interactivas anidadas).',
        )
      }
      return prisma.$transaction((tx) => fn(buildAccessors(organizationId, tx)))
    },
  }) as OrgScope
}
