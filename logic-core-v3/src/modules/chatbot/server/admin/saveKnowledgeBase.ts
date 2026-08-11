'use server'

import { z } from 'zod'
import { forOrg, unsafeGlobalQuery } from '@/lib/isolation'
import { computeDiff, logAdminAction, omitAuditNoise } from '@/lib/audit-log'
import { chatbotLog, sanitizeErrorMessage } from '../logging'
import { invalidateBotCache } from '../conversation'
import { requireSuperAdmin } from './requireSuperAdmin'

const knowledgeBaseInputSchema = z.object({
  botConfigId: z.string().min(1),
  businessInfo: z.string().max(50_000),
  servicesOrProducts: z.string().max(50_000),
  faq: z.string().max(50_000),
  policies: z.string().max(20_000),
  salesGuidance: z.string().max(20_000),
  toneExamples: z.string().max(20_000),
  forbiddenStatements: z.string().max(10_000),
})

export type KnowledgeBaseInput = z.infer<typeof knowledgeBaseInputSchema>

export async function saveKnowledgeBase(input: KnowledgeBaseInput): Promise<{ success: boolean; error?: string }> {
  const user = await requireSuperAdmin()
  const parsed = knowledgeBaseInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.message }
  }
  try {
    // TENANT-RESOLUTION: el super-admin edita por botConfigId; resolvemos org +
    // metadata del bot para scopear la escritura y para el audit log.
    const bot = await unsafeGlobalQuery(
      'TENANT-RESOLUTION: botConfigId→org+meta para editar la KB (super-admin)',
      (c) =>
        c.botConfig.findUnique({
          where: { id: parsed.data.botConfigId },
          select: { botName: true, slug: true, organizationId: true },
        }),
    )
    if (!bot) {
      return { success: false, error: 'Bot no encontrado' }
    }

    const scope = forOrg(bot.organizationId)
    const before = await scope.knowledgeBase.findFirst({
      where: { botConfigId: parsed.data.botConfigId },
    })
    if (!before) {
      return { success: false, error: 'Knowledge base no encontrada' }
    }

    const after = await scope.knowledgeBase.update(before.id, {
      businessInfo: parsed.data.businessInfo,
      servicesOrProducts: parsed.data.servicesOrProducts,
      faq: parsed.data.faq,
      policies: parsed.data.policies,
      salesGuidance: parsed.data.salesGuidance,
      toneExamples: parsed.data.toneExamples,
      forbiddenStatements: parsed.data.forbiddenStatements,
    })

    invalidateBotCache(bot.slug)

    {
      await logAdminAction({
        userId: user.id ?? 'unknown',
        userEmail: user.email,
        userName: user.name,
        actionType: 'KB_UPDATED',
        action: `Actualizo KB del bot "${bot.botName}"`,
        targetType: 'KnowledgeBase',
        targetId: after.id,
        diff: computeDiff(
          omitAuditNoise(before as unknown as Record<string, unknown>),
          omitAuditNoise(after as unknown as Record<string, unknown>),
        ),
        metadata: {
          botConfigId: parsed.data.botConfigId,
          organizationId: bot.organizationId,
        },
      })
    }
    chatbotLog('admin.kb_updated', { botConfigId: parsed.data.botConfigId })
    return { success: true }
  } catch (error) {
    // PRIVACIDAD: sanitizado — el try cubre knowledgeBase.update con la KB
    // completa; un PrismaClientValidationError la ecoaría entera (a consola
    // Y al cliente vía el return).
    const msg = sanitizeErrorMessage(error)
    chatbotLog('admin.kb_update_error', { botConfigId: parsed.data.botConfigId, error: msg }, 'error')
    return { success: false, error: msg }
  }
}
