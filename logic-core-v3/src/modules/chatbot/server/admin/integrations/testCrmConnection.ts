'use server'

import { z } from 'zod'
import { logAdminAction } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { testN8nConnection } from '@/modules/chatbot/server/crm'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { requireSuperAdmin } from '@/modules/chatbot/server/admin/requireSuperAdmin'

const TestCrmConnectionSchema = z
  .object({
    organizationId: z.string().min(1),
  })
  .strict()

type TestCrmConnectionInput = z.infer<typeof TestCrmConnectionSchema>

export async function testCrmConnection(input: TestCrmConnectionInput) {
  const adminUser = await requireSuperAdmin()

  const parsed = TestCrmConnectionSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: 'Datos inválidos' }
  }
  const { organizationId } = parsed.data

  const plan = await getPlanForOrg(organizationId)
  if (!planAllows(plan, 'crm')) {
    return {
      ok: false as const,
      error: 'El plan de esta organización no incluye integración con CRM',
    }
  }

  const rate = await checkRateLimit({
    key: `crmTestPerOrg:${organizationId}`,
    limit: RATE_LIMIT_PRESETS.crmTestPerOrg.limit,
    windowMs: RATE_LIMIT_PRESETS.crmTestPerOrg.windowMs,
  })
  if (!rate.allowed) {
    const waitSeconds = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))
    return {
      ok: false as const,
      error: `Esperá ${waitSeconds}s antes de volver a probar`,
    }
  }

  const integration = await prisma.crmIntegration.findUnique({
    where: { organizationId },
  })

  if (!integration) {
    return {
      ok: false as const,
      error: 'Todavía no hay integración guardada — guardá la URL primero',
    }
  }

  const testPayload = {
    _version: '1.0' as const,
    _test: true,
    leadId: 'test-ping',
    capturedAt: new Date().toISOString(),
    message: 'Conexión de prueba desde develOP (admin)',
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
    userId: adminUser.id ?? 'unknown',
    userEmail: adminUser.email ?? undefined,
    userName: adminUser.name ?? undefined,
    actionType: 'CRM_INTEGRATION_TESTED',
    action: 'develOP probó conexión al webhook CRM de la org',
    targetType: 'CrmIntegration',
    targetId: integration.id,
    metadata: {
      source: 'admin_develop',
      organizationId,
      result: result.ok ? 'success' : 'failed',
      httpStatus: result.httpStatus,
      durationMs: result.durationMs,
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
