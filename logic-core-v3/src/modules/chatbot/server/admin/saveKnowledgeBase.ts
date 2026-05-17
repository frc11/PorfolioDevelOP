'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { computeDiff, logAdminAction, omitAuditNoise } from '@/lib/audit-log'
import { chatbotLog } from '../logging'
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
    const before = await prisma.knowledgeBase.findUnique({
      where: { botConfigId: parsed.data.botConfigId },
    })

    const after = await prisma.knowledgeBase.update({
      where: { botConfigId: parsed.data.botConfigId },
      data: {
        businessInfo: parsed.data.businessInfo,
        servicesOrProducts: parsed.data.servicesOrProducts,
        faq: parsed.data.faq,
        policies: parsed.data.policies,
        salesGuidance: parsed.data.salesGuidance,
        toneExamples: parsed.data.toneExamples,
        forbiddenStatements: parsed.data.forbiddenStatements,
      },
      include: { botConfig: { select: { botName: true, organizationId: true } } },
    })

    if (before) {
      const { botConfig, ...afterForDiff } = after
      await logAdminAction({
        userId: user.id ?? 'unknown',
        userEmail: user.email,
        userName: user.name,
        actionType: 'KB_UPDATED',
        action: `Actualizo KB del bot "${after.botConfig.botName}"`,
        targetType: 'KnowledgeBase',
        targetId: after.id,
        diff: computeDiff(
          omitAuditNoise(before as unknown as Record<string, unknown>),
          omitAuditNoise(afterForDiff as unknown as Record<string, unknown>),
        ),
        metadata: {
          botConfigId: parsed.data.botConfigId,
          organizationId: after.botConfig.organizationId,
        },
      })
    }
    chatbotLog('admin.kb_updated', { botConfigId: parsed.data.botConfigId })
    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown error'
    chatbotLog('admin.kb_update_error', { botConfigId: parsed.data.botConfigId, error: msg }, 'error')
    return { success: false, error: msg }
  }
}
