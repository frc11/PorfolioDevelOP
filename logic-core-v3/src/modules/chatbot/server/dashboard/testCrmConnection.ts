'use server'

import { auth } from '@/auth'
import { logAdminAction } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { testN8nConnection } from '@/modules/chatbot/server/crm'
import { checkRateLimit } from '@/modules/chatbot/server/rate-limit/inMemoryLimiter'

/**
 * B5.8 — Test de conexión al webhook n8n del cliente.
 *
 * Manda un payload claramente marcado `{ test: true, ... }` al webhook guardado
 * y devuelve si llegó (httpStatus + duración). NO crea un CrmSyncAttempt —
 * no es un sync real, no debería ensuciar el historial.
 *
 * Rate limit: 5 tests por minuto por org. n8n del cliente no debería recibir
 * spam si el dueño martillea el botón.
 *
 * Audit log: CRM_INTEGRATION_TESTED con metadata { httpStatus, durationMs, ok }.
 */

const TEST_RATE_LIMIT = 5
const TEST_RATE_WINDOW_MS = 60_000

export async function testCrmConnection() {
  const session = await auth()
  if (!session?.user) {
    return { ok: false as const, error: 'No autenticado' }
  }

  const orgId = await resolveOrgId()
  if (!orgId) {
    return { ok: false as const, error: 'Sin organización' }
  }

  // Plan gate
  const plan = await getPlanForOrg(orgId)
  if (!planAllows(plan, 'crm')) {
    return {
      ok: false as const,
      error: 'Tu plan actual no incluye integración con CRM',
    }
  }

  // Rate limit por org. Si el dueño martillea el botón, frena.
  const rate = checkRateLimit(`crm-test:${orgId}`, TEST_RATE_LIMIT, TEST_RATE_WINDOW_MS)
  if (!rate.allowed) {
    const waitSeconds = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))
    return {
      ok: false as const,
      error: `Esperá ${waitSeconds}s antes de volver a probar`,
    }
  }

  const integration = await prisma.crmIntegration.findUnique({
    where: { organizationId: orgId },
  })

  if (!integration) {
    return {
      ok: false as const,
      error: 'Todavía no hay integración guardada — guardá la URL primero',
    }
  }

  // Payload de test claramente marcado. Sirve también para que el cliente
  // pueda discriminar en n8n entre tests y leads reales si quiere.
  const testPayload = {
    _version: '1.0' as const,
    _test: true,
    leadId: 'test-ping',
    capturedAt: new Date().toISOString(),
    message: 'Conexión de prueba desde develOP',
  }

  const hasSecret =
    integration.secretHeaderName !== null &&
    integration.secretEncrypted !== null &&
    integration.secretIv !== null &&
    integration.secretTag !== null

  const result = await testN8nConnection({
    webhookUrl: integration.webhookUrl,
    payload: testPayload,
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

  await logAdminAction({
    userId: session.user.id ?? 'unknown',
    userEmail: session.user.email ?? undefined,
    userName: session.user.name ?? undefined,
    actionType: 'CRM_INTEGRATION_TESTED',
    action: 'Cliente probó conexión al webhook CRM',
    targetType: 'CrmIntegration',
    targetId: integration.id,
    metadata: {
      organizationId: orgId,
      result: result.ok ? 'success' : 'failed',
      httpStatus: result.httpStatus,
      durationMs: result.durationMs,
      // errorMessage ya viene sanitizado (sin PII, max 200 chars).
      errorMessage: result.errorMessage,
    },
  })

  return result.ok
    ? {
        ok: true as const,
        httpStatus: result.httpStatus,
        durationMs: result.durationMs,
      }
    : {
        ok: false as const,
        error: result.errorMessage ?? 'Falló la conexión',
        httpStatus: result.httpStatus,
        durationMs: result.durationMs,
      }
}
