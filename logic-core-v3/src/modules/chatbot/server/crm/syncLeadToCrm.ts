import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { buildLeadPayload } from './buildLeadPayload'
import { postToN8nWithRetry } from './postToN8n'

/**
 * B5.8 — Hook fire-and-forget que se llama DESPUÉS del lead.create() exitoso.
 *
 * Regla absoluta: el lead ya está persistido cuando entramos acá. Esta función
 * es secundaria. Cualquier error (plan check, integration faltante, n8n caído,
 * red rota, encryption mal configurada) NO propaga — todo se atrapa y loguea.
 * El lead NUNCA se pierde por una falla de sync.
 *
 * Multi-tenant: el organizationId se resuelve desde lead.botConfig.organization,
 * no se acepta de fuera. Imposible sincronizar el lead de la org A apuntando a
 * la integration de la org B.
 *
 * Idempotencia: cada call crea un CrmSyncAttempt nuevo. El sync automático en
 * captureLead solo dispara una vez por lead (porque captureLead es idempotente
 * por conversationId). El retry manual desde la UI crea un attempt nuevo.
 */

export interface SyncLeadToCrmInput {
  leadId: string
  /**
   * Si la invocación viene de un retry manual desde la UI, lo flageamos para
   * el log y para que la audit trail pueda distinguir auto vs manual.
   */
  trigger?: 'auto' | 'manual'
}

export async function syncLeadToCrm(input: SyncLeadToCrmInput): Promise<void> {
  const { leadId, trigger = 'auto' } = input

  try {
    // 1. Leer lead + org. Esta es la única fuente de verdad para tenant.
    const lead = await prisma.chatbotLead.findUnique({
      where: { id: leadId },
      include: {
        botConfig: {
          select: {
            verticalPack: true, // EV.5 — para payload v2
            organization: {
              select: { id: true, slug: true },
            },
          },
        },
      },
    })

    if (!lead || !lead.botConfig?.organization) {
      logger.warn('[crm.sync] lead or org not found, skipping', { leadId, trigger })
      return
    }

    const org = lead.botConfig.organization

    // 2. Plan gate (defensa en profundidad — la UI ya gatekeepa).
    const plan = await getPlanForOrg(org.id)
    if (!planAllows(plan, 'crm')) {
      // No es un error: la org simplemente no tiene CRM activado.
      return
    }

    // 3. Integration activa?
    const integration = await prisma.crmIntegration.findUnique({
      where: { organizationId: org.id },
    })
    if (!integration || !integration.enabled) {
      // Skip silencioso: no configurada o apagada.
      return
    }

    // 4. Crear attempt PENDING. attemptNumber se actualiza al final con el
    //    número real de intentos que terminó haciendo postToN8nWithRetry.
    const attempt = await prisma.crmSyncAttempt.create({
      data: {
        leadId,
        integrationId: integration.id,
        organizationId: org.id,
        status: 'PENDING',
        attemptNumber: 1,
      },
    })

    // 5. POST con retries. Payload sanitizado (sin scoreSignals/internalNotes).
    // EV.5: v2 incluye verticalPack + signalsV2 (superset de v1).
    const payload = buildLeadPayload(lead, { id: org.id, slug: org.slug }, lead.botConfig.verticalPack)

    const hasSecret =
      integration.secretHeaderName !== null &&
      integration.secretEncrypted !== null &&
      integration.secretIv !== null &&
      integration.secretTag !== null

    const result = await postToN8nWithRetry({
      webhookUrl: integration.webhookUrl,
      payload,
      encryptedSecret: hasSecret
        ? {
            headerName: integration.secretHeaderName as string,
            value: {
              encrypted: integration.secretEncrypted as string,
              iv: integration.secretIv as string,
              tag: integration.secretTag as string,
            },
          }
        : undefined,
    })

    const completedAt = new Date()

    // 6. Persistir resultado: attempt + integration.lastSync/lastError en una tx.
    await prisma.$transaction([
      prisma.crmSyncAttempt.update({
        where: { id: attempt.id },
        data: {
          status: result.ok ? 'SUCCESS' : 'FAILED',
          attemptNumber: result.attemptsUsed,
          httpStatus: result.httpStatus,
          errorMessage: result.errorMessage,
          completedAt,
          durationMs: result.durationMs,
        },
      }),
      prisma.crmIntegration.update({
        where: { id: integration.id },
        data: result.ok
          ? { lastSyncAt: completedAt }
          : { lastErrorAt: completedAt, lastErrorMessage: result.errorMessage },
      }),
    ])

    // 7. Log estructurado — NO PII. orgId/integrationId/leadId/status/httpStatus
    //    son metadata operativa, no datos del lead. payload no se loguea.
    logger.info('[crm.sync] done', {
      orgId: org.id,
      integrationId: integration.id,
      leadId,
      trigger,
      result: result.ok ? 'success' : 'failed',
      httpStatus: result.httpStatus,
      attemptsUsed: result.attemptsUsed,
      durationMs: result.durationMs,
    })
  } catch (error) {
    // Catch-all defensivo: ningún error propaga. El lead ya está guardado.
    logger.error('[crm.sync] unexpected error, lead remains safe in DB', {
      leadId,
      trigger,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : String(error),
    })
  }
}
