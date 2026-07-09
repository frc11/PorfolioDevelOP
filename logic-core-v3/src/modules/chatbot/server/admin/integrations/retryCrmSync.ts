'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logAdminAction } from '@/lib/audit-log'
import { forOrg } from '@/lib/isolation'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { syncLeadToCrm } from '@/modules/chatbot/server/crm'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { requireSuperAdmin } from '@/modules/chatbot/server/admin/requireSuperAdmin'

const RetryCrmSyncSchema = z
  .object({
    organizationId: z.string().min(1),
    leadId: z.string().min(1).max(200),
  })
  .strict()

type RetryCrmSyncInput = z.infer<typeof RetryCrmSyncSchema>

export async function retryCrmSync(input: RetryCrmSyncInput) {
  const adminUser = await requireSuperAdmin()

  const parsed = RetryCrmSyncSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: 'Datos inválidos' }
  }
  const { organizationId, leadId } = parsed.data

  const plan = await getPlanForOrg(organizationId)
  if (!planAllows(plan, 'crm')) {
    return {
      ok: false as const,
      error: 'El plan de esta organización no incluye integración con CRM',
    }
  }

  const rate = await checkRateLimit({
    key: `crmRetryPerOrg:${organizationId}`,
    limit: RATE_LIMIT_PRESETS.crmRetryPerOrg.limit,
    windowMs: RATE_LIMIT_PRESETS.crmRetryPerOrg.windowMs,
  })
  if (!rate.allowed) {
    const waitSeconds = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))
    return {
      ok: false as const,
      error: `Esperá ${waitSeconds}s antes de volver a reintentar`,
    }
  }

  const lead = await forOrg(organizationId).chatbotLead.findFirst({
    where: { id: leadId },
    select: { id: true },
  })

  if (!lead) {
    return { ok: false as const, error: 'Lead no encontrado' }
  }

  await logAdminAction({
    userId: adminUser.id ?? 'unknown',
    userEmail: adminUser.email ?? undefined,
    userName: adminUser.name ?? undefined,
    actionType: 'CRM_SYNC_RETRIED',
    action: 'develOP reintentó sync CRM de un lead',
    targetType: 'ChatbotLead',
    targetId: leadId,
    metadata: { source: 'admin_develop', organizationId },
  })

  void syncLeadToCrm({ leadId, trigger: 'manual' }).catch((err: unknown) => {
    console.error('[retryCrmSync] dispatch failed:', err)
  })

  revalidatePath('/admin/chatbots', 'layout')

  return { ok: true as const }
}
