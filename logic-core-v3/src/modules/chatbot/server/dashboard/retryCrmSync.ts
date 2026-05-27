'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/auth'
import { logAdminAction } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { syncLeadToCrm } from '@/modules/chatbot/server/crm'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'

/**
 * B5.8 — Retry manual de sync para un lead. Lo dispara el dueño desde el
 * historial cuando ve un attempt FAILED y lo quiere reintentar.
 *
 * Crea un CrmSyncAttempt nuevo (no actualiza el FAILED previo). El historial
 * muestra la cadena completa de intentos manuales + automáticos.
 *
 * Multi-tenant: verifica que el lead pertenezca a la org actual via
 * lead.botConfig.organizationId. Pasar leadId de otra org → "No encontrado".
 *
 * Rate limit: 10 retries por minuto por org.
 */

const RetryCrmSyncSchema = z
  .object({
    leadId: z.string().min(1).max(200),
  })
  .strict()

type RetryCrmSyncInput = z.infer<typeof RetryCrmSyncSchema>

export async function retryCrmSync(input: RetryCrmSyncInput) {
  const session = await auth()
  if (!session?.user) {
    return { ok: false as const, error: 'No autenticado' }
  }

  const orgId = await resolveOrgId()
  if (!orgId) {
    return { ok: false as const, error: 'Sin organización' }
  }

  const parsed = RetryCrmSyncSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: 'Datos inválidos' }
  }
  const { leadId } = parsed.data

  const plan = await getPlanForOrg(orgId)
  if (!planAllows(plan, 'crm')) {
    return {
      ok: false as const,
      error: 'Tu plan actual no incluye integración con CRM',
    }
  }

  const rate = await checkRateLimit({
    key: `crmRetryPerOrg:${orgId}`,
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

  // Verificación cross-tenant: el lead tiene que pertenecer a la org actual.
  // findFirst con filtro relacional garantiza que no podemos retrievar leads
  // de otra org pasando un leadId arbitrario.
  const lead = await prisma.chatbotLead.findFirst({
    where: {
      id: leadId,
      botConfig: { organizationId: orgId },
    },
    select: { id: true },
  })

  if (!lead) {
    return { ok: false as const, error: 'Lead no encontrado' }
  }

  // Audit antes del dispatch: queremos saber QUIÉN apretó el botón aunque
  // el sync mismo falle y solo deje un CrmSyncAttempt FAILED.
  await logAdminAction({
    userId: session.user.id ?? 'unknown',
    userEmail: session.user.email ?? undefined,
    userName: session.user.name ?? undefined,
    actionType: 'CRM_SYNC_RETRIED',
    action: 'Cliente reintentó sync CRM de un lead',
    targetType: 'ChatbotLead',
    targetId: leadId,
    metadata: { source: 'dashboard_cliente', organizationId: orgId },
  })

  // Dispatch del sync. Igual que el auto, fire-and-forget — no bloqueamos la
  // respuesta esperando los 33s peor-caso de retries.
  void syncLeadToCrm({ leadId, trigger: 'manual' }).catch((err: unknown) => {
    console.error('[retryCrmSync] dispatch failed:', err)
  })

  revalidatePath('/dashboard/chatbot/leads')
  revalidatePath(`/dashboard/chatbot/leads/${leadId}`)
  revalidatePath('/dashboard/chatbot/settings')

  return { ok: true as const }
}
