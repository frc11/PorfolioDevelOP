'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logAdminAction } from '@/lib/audit-log'
import { forOrg, unsafeGlobalQuery } from '@/lib/isolation'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import {
  validateWebhookUrl,
  encryptSecret,
  isCrmEncryptionConfigured,
} from '@/modules/chatbot/server/crm'
import { requireSuperAdmin } from '@/modules/chatbot/server/admin/requireSuperAdmin'

// `secret`: undefined = no tocar; null = limpiar; string = setear (encrypta).
const SaveCrmIntegrationSchema = z
  .object({
    organizationId: z.string().min(1),
    webhookUrl: z.string().trim().min(1).max(2048),
    enabled: z.boolean(),
    secretHeaderName: z.string().trim().max(100).nullable().optional(),
    secret: z.string().min(1).max(500).nullable().optional(),
  })
  .strict()

type SaveCrmIntegrationInput = z.infer<typeof SaveCrmIntegrationSchema>

export async function saveCrmIntegration(input: SaveCrmIntegrationInput) {
  const adminUser = await requireSuperAdmin()

  const parsed = SaveCrmIntegrationSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'Datos inválidos',
      details: parsed.error.format(),
    }
  }
  const { organizationId, ...data } = parsed.data

  // TENANT-MGMT: verificar existencia de la org (Organization no está cubierta
  // por el helper — es el tenant raíz; su lectura por id es admin de plataforma).
  const org = await unsafeGlobalQuery(
    'TENANT-MGMT: existencia de la org antes de configurar su integración CRM',
    (c) => c.organization.findUnique({ where: { id: organizationId }, select: { id: true } }),
  )
  if (!org) {
    return { ok: false as const, error: 'Organización no encontrada' }
  }

  const plan = await getPlanForOrg(organizationId)
  if (!planAllows(plan, 'crm')) {
    return {
      ok: false as const,
      error: 'El plan de esta organización no incluye integración con CRM',
    }
  }

  const urlCheck = validateWebhookUrl(data.webhookUrl)
  if (!urlCheck.ok) {
    return { ok: false as const, error: urlCheck.error }
  }

  if (typeof data.secret === 'string' && !isCrmEncryptionConfigured()) {
    return {
      ok: false as const,
      error:
        'El cifrado de secrets no está configurado (CRM_SECRET_KEY ausente). La URL la podés guardar igual, pero el header de auth no se puede cifrar todavía.',
    }
  }

  if (typeof data.secret === 'string' && !data.secretHeaderName) {
    return {
      ok: false as const,
      error: 'Para guardar un secret hace falta el nombre del header',
    }
  }

  const scope = forOrg(organizationId)
  const existing = await scope.crmIntegration.findFirst()

  const before = existing
    ? {
        webhookUrl: existing.webhookUrl,
        enabled: existing.enabled,
        secretHeaderName: existing.secretHeaderName,
        secretConfigured: Boolean(existing.secretEncrypted),
      }
    : {
        webhookUrl: null,
        enabled: false,
        secretHeaderName: null,
        secretConfigured: false,
      }

  type SecretFields = {
    secretHeaderName?: string | null
    secretEncrypted?: string | null
    secretIv?: string | null
    secretTag?: string | null
  }
  let secretFields: SecretFields = {}

  if (data.secret === null) {
    secretFields = {
      secretHeaderName: null,
      secretEncrypted: null,
      secretIv: null,
      secretTag: null,
    }
  } else if (typeof data.secret === 'string') {
    const enc = encryptSecret(data.secret)
    secretFields = {
      secretHeaderName: data.secretHeaderName as string,
      secretEncrypted: enc.encrypted,
      secretIv: enc.iv,
      secretTag: enc.tag,
    }
  } else if (data.secretHeaderName !== undefined) {
    if (existing?.secretEncrypted) {
      secretFields = { secretHeaderName: data.secretHeaderName }
    }
  }

  // Upsert scoped: where {organizationId} == el scope (organizationId @unique);
  // el create fija organizationId desde el scope (no del caller).
  const integration = await scope.crmIntegration.upsertForScope({
    create: {
      webhookUrl: data.webhookUrl,
      enabled: data.enabled,
      ...secretFields,
    },
    update: {
      webhookUrl: data.webhookUrl,
      enabled: data.enabled,
      ...secretFields,
    },
  })

  const after = {
    webhookUrl: integration.webhookUrl,
    enabled: integration.enabled,
    secretHeaderName: integration.secretHeaderName,
    secretConfigured: Boolean(integration.secretEncrypted),
  }
  const secretChanged =
    before.secretConfigured !== after.secretConfigured ||
    before.secretHeaderName !== after.secretHeaderName

  await logAdminAction({
    userId: adminUser.id ?? 'unknown',
    userEmail: adminUser.email ?? undefined,
    userName: adminUser.name ?? undefined,
    actionType: 'CRM_INTEGRATION_UPDATED',
    action: 'develOP actualizó integración CRM (n8n) de la org',
    targetType: 'CrmIntegration',
    targetId: integration.id,
    diff: {
      webhookUrl: { before: before.webhookUrl, after: after.webhookUrl },
      enabled: { before: before.enabled, after: after.enabled },
      secretHeaderName: { before: before.secretHeaderName, after: after.secretHeaderName },
      secretChanged,
    },
    metadata: { source: 'admin_develop', organizationId },
  })

  revalidatePath('/admin/chatbots', 'layout')

  return {
    ok: true as const,
    integration: {
      id: integration.id,
      webhookUrl: integration.webhookUrl,
      enabled: integration.enabled,
      secretHeaderName: integration.secretHeaderName,
      secretConfigured: Boolean(integration.secretEncrypted),
      lastSyncAt: integration.lastSyncAt,
      lastErrorAt: integration.lastErrorAt,
      lastErrorMessage: integration.lastErrorMessage,
    },
  }
}
