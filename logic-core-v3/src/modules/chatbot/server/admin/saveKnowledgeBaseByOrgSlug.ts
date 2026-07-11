'use server'

import { z } from 'zod'
import { forOrg, unsafeGlobalQuery } from '@/lib/isolation'
import { revalidatePath } from 'next/cache'
import { computeDiff, logAdminAction, omitAuditNoise } from '@/lib/audit-log'
import { invalidateBotCache } from '../conversation'
import { requireSuperAdmin } from './requireSuperAdmin'

const SaveKBInputSchema = z.object({
  orgSlug: z.string().min(1),
  businessInfo: z.string().max(50_000),
  servicesOrProducts: z.string().max(50_000),
  faq: z.string().max(50_000),
  policies: z.string().max(20_000),
  salesGuidance: z.string().max(20_000),
  toneExamples: z.string().max(20_000),
  forbiddenStatements: z.string().max(10_000),
})

export async function saveKnowledgeBaseByOrgSlug(
  input: z.infer<typeof SaveKBInputSchema>
): Promise<{ success: boolean; error?: string }> {
  const user = await requireSuperAdmin()
  const parsed = SaveKBInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.message }
  }

  const { orgSlug, ...data } = parsed.data

  // TENANT-RESOLUTION: org+bot+KB por slug (super-admin edita por slug).
  const org = await unsafeGlobalQuery(
    'TENANT-RESOLUTION: org+bot+KB por slug para editar la KB (super-admin)',
    (c) =>
      c.organization.findUnique({
        where: { slug: orgSlug },
        include: { botConfig: { include: { knowledgeBase: true } } },
      }),
  )

  if (!org?.botConfig?.knowledgeBase) {
    return { success: false, error: 'Bot/KB not found for this org' }
  }

  try {
    const before = org.botConfig.knowledgeBase
    const after = await forOrg(org.id).knowledgeBase.update(org.botConfig.knowledgeBase.id, data)

    invalidateBotCache(org.botConfig.slug)

    await logAdminAction({
      userId: user.id ?? 'unknown',
      userEmail: user.email,
      userName: user.name,
      actionType: 'KB_UPDATED',
      action: `Actualizo KB del bot "${org.botConfig.botName}"`,
      targetType: 'KnowledgeBase',
      targetId: after.id,
      diff: computeDiff(
        omitAuditNoise(before as unknown as Record<string, unknown>),
        omitAuditNoise(after as unknown as Record<string, unknown>),
      ),
      metadata: { botConfigId: org.botConfig.id, organizationId: org.id, orgSlug },
    })

    revalidatePath(`/admin/chatbots/${org.botConfig.id}`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: msg }
  }
}
